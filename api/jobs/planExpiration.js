const cron = require('node-cron');
const User = require('../models/User');
const { sendPlanExpirationWarning, sendPlanExpiredEmail } = require('../services/emailService');

const checkPlanExpirations = async () => {
  try {
    const now = new Date();

    const users = await User.find({
      plan: { $in: ['basic', 'pro', 'enterprise'] },
      planExpiresAt: { $ne: null }
    });

    for (const user of users) {
      const daysUntilExpiration = Math.ceil((user.planExpiresAt - now) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiration === 7 || daysUntilExpiration === 3 || daysUntilExpiration === 1) {
        await sendPlanExpirationWarning(user.email, user.name, daysUntilExpiration, user.plan);
        console.log(`Expiration warning sent to ${user.email} (${daysUntilExpiration} days)`);
      }

      if (daysUntilExpiration <= 0) {
        const previousPlan = user.plan;
        user.plan = 'free';
        user.planExpiresAt = null;
        await user.save();
        await sendPlanExpiredEmail(user.email, user.name, previousPlan);
        console.log(`Plan ${previousPlan} of ${user.email} expired, downgraded to free`);
      }
    }
  } catch (error) {
    console.error('Error checking plan expirations:', error);
  }
};

const resetDailyRequests = async () => {
  try {
    const result = await User.updateMany(
      { requestsToday: { $gt: 0 } },
      { $set: { requestsToday: 0, lastRequestReset: new Date() } }
    );
    console.log(`Daily requests reset: ${result.modifiedCount} users updated`);
  } catch (error) {
    console.error('Error resetting daily requests:', error);
  }
};

const startPlanExpirationJob = () => {
  cron.schedule('0 */6 * * *', checkPlanExpirations);
  console.log('Plan expiration job started (every 6 hours)');

  // Runs at 00:00 Brasilia time (UTC-3 = 03:00 UTC)
  cron.schedule('0 3 * * *', resetDailyRequests, { timezone: 'America/Sao_Paulo' });
  console.log('Daily request reset job started (midnight Brasilia time)');
};

module.exports = { startPlanExpirationJob, checkPlanExpirations, resetDailyRequests };

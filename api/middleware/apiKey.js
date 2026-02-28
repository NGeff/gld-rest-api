const ApiKey = require('../models/ApiKey');
const User = require('../models/User');
const RequestLog = require('../models/RequestLog');

const TZ = 'America/Sao_Paulo';

function isSameDayBrasilia(dateA, dateB) {
  const opts = { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' };
  return (
    new Intl.DateTimeFormat('en-CA', opts).format(dateA) ===
    new Intl.DateTimeFormat('en-CA', opts).format(dateB)
  );
}

exports.validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required'
      });
    }

    const hashedKey = ApiKey.hashKey(apiKey);
    const keyDoc = await ApiKey.findOne({ hashedKey, isActive: true }).populate('userId');

    if (!keyDoc) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    const user = keyDoc.userId;

    if (!user || user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: user ? 'Account suspended' : 'Account not found'
      });
    }

    const now = new Date();
    const lastReset = new Date(user.lastRequestReset);

    if (!isSameDayBrasilia(now, lastReset)) {
      user.requestsToday = 0;
      user.lastRequestReset = now;
      await user.save();
    }

    const limit = user.getDailyLimit();

    if (user.requestsToday >= limit) {
      return res.status(429).json({
        success: false,
        message: 'Daily request limit exceeded',
        limit,
        used: user.requestsToday,
        resetsAt: 'midnight Brasilia time (America/Sao_Paulo)'
      });
    }

    user.requestsToday += 1;
    await user.save();

    keyDoc.requestCount += 1;
    keyDoc.lastUsed = now;
    await keyDoc.save();

    req.user = user;
    req.apiKey = keyDoc;
    req.startTime = Date.now();

    next();
  } catch (error) {
    console.error('API Key validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.logRequest = async (req, res, next) => {
  const originalSend = res.send.bind(res);

  res.send = function(data) {
    res.send = originalSend;

    if (req.user && req.apiKey) {
      const responseTime = Date.now() - req.startTime;

      RequestLog.create({
        userId: req.user._id,
        apiKeyId: req.apiKey._id,
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        responseTime
      }).catch(err => console.error('Error logging request:', err));
    }

    return originalSend(data);
  };

  next();
};

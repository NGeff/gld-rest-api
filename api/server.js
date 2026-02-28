require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authController = require('./controllers/authController');
const apiKeyController = require('./controllers/apiKeyController');
const paymentController = require('./controllers/paymentController');
const apiController = require('./controllers/apiController');
const adminController = require('./controllers/adminController');
const supportController = require('./controllers/supportController');
const testController = require('./controllers/testController');

const { protect } = require('./middleware/auth');
const { requireAdmin } = require('./middleware/admin');
const { validateApiKey, logRequest } = require('./middleware/apiKey');
const { 
  authLimiter, 
  passwordLimiter, 
  emailLimiter, 
  apiKeyLimiter, 
  paymentLimiter, 
  ticketLimiter, 
  messageLimiter 
} = require('./middleware/rateLimiter');

const { startPlanExpirationJob } = require('./jobs/planExpiration');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api', limiter);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    startPlanExpirationJob();
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/auth/register', authLimiter, authController.register);
app.post('/auth/login', authLimiter, authController.login);
app.get('/auth/verify/:token', authController.verifyEmail);
app.post('/auth/forgot-password', authLimiter, authController.forgotPassword);
app.post('/auth/reset-password/:token', authLimiter, authController.resetPassword);
app.get('/auth/me', protect, authController.getMe);
app.put('/auth/email', protect, emailLimiter, authController.updateEmail);
app.put('/auth/password', protect, passwordLimiter, authController.updatePassword);

app.get('/apikeys', protect, apiKeyController.getApiKeys);
app.post('/apikeys', protect, apiKeyLimiter, apiKeyController.createApiKey);
app.get('/apikeys/:id/reveal', protect, apiKeyController.revealApiKey);
app.delete('/apikeys/:id', protect, apiKeyController.deleteApiKey);
app.patch('/apikeys/:id/toggle', protect, apiKeyController.toggleApiKey);

app.post('/payments', protect, paymentLimiter, paymentController.createPayment);
app.get('/payments/:id/status', protect, paymentController.checkPaymentStatus);
app.get('/payments', protect, paymentController.getUserPayments);
app.post('/payments/:id/cancel', protect, paymentController.cancelExpiredPayment);

app.post('/test-route', protect, testController.testRoute);

app.post('/support/tickets', protect, ticketLimiter, supportController.createTicket);
app.get('/support/tickets', protect, supportController.getUserTickets);
app.get('/support/tickets/:id', protect, supportController.getTicket);
app.post('/support/tickets/:id/messages', protect, messageLimiter, supportController.addMessage);

app.get('/admin/stats', protect, requireAdmin, adminController.getStats);
app.get('/admin/users', protect, requireAdmin, adminController.getAllUsers);
app.get('/admin/users/:userId', protect, requireAdmin, adminController.getUserDetails);
app.patch('/admin/users/:userId/plan', protect, requireAdmin, adminController.updateUserPlan);
app.patch('/admin/users/:userId/suspend', protect, requireAdmin, adminController.suspendUser);
app.get('/admin/payments', protect, requireAdmin, adminController.getAllPayments);
app.get('/admin/tickets', protect, requireAdmin, supportController.getAllTickets);
app.get('/admin/tickets/:id', protect, requireAdmin, supportController.getTicketAdmin);
app.post('/admin/tickets/:id/reply', protect, requireAdmin, supportController.replyTicket);
app.patch('/admin/tickets/:id/status', protect, requireAdmin, supportController.updateTicketStatus);

app.use('/api/v1', validateApiKey, logRequest);

app.get('/api/v1/utils/translate', apiController.translate);
app.get('/api/v1/utils/cep/:cep', apiController.cep);
app.get('/api/v1/utils/cnpj/:cnpj', apiController.cnpj);
app.get('/api/v1/utils/crypto', apiController.crypto);
app.get('/api/v1/utils/currency', apiController.currency);
app.get('/api/v1/utils/weather', apiController.weather);
app.get('/api/v1/utils/holidays/:year?', apiController.holidays);
app.get('/api/v1/utils/shorturl', apiController.shortUrl);
app.get('/api/v1/utils/qrcode', apiController.qrcode);
app.get('/api/v1/utils/calculate', apiController.calculate);
app.get('/api/v1/utils/dictionary', apiController.dictionary);
app.get('/api/v1/utils/images', apiController.searchImages);
app.get('/api/v1/utils/tts', apiController.textToSpeech);
app.get('/api/v1/utils/thought', apiController.randomThought);

app.get('/api/v1/media/youtube', apiController.youtubeDownload);
app.get('/api/v1/media/spotify/search', apiController.spotifySearch);
app.get('/api/v1/media/spotify/download', apiController.spotifyDownload);
app.get('/api/v1/media/instagram', apiController.instagramDownload);
app.get('/api/v1/media/tiktok', apiController.tiktokDownload);
app.get('/api/v1/download/instagram', apiController.instagramDownload);
app.get('/api/v1/download/tiktok', apiController.tiktokDownload);
app.get('/api/v1/media/lyrics', apiController.lyrics);
app.get('/api/v1/media/pinterest', apiController.pinterestSearch);

app.get('/api/v1/info/imdb', apiController.imdb);
app.get('/api/v1/info/steam/:appId', apiController.steamGame);

app.post('/api/v1/media/attp', apiController.attp);
app.post('/api/v1/media/audiomeme', apiController.audioMeme);
app.post('/api/v1/media/effect', apiController.applyEffect);
app.post('/api/v1/media/toaudio', apiController.toAudio);
app.post('/api/v1/media/toimage', apiController.toImage);
app.post('/api/v1/media/shazam', apiController.shazam);

app.post('/api/v1/ai/imagine', apiController.imagine);
app.post('/api/v1/ai/chat', apiController.aiChat);

const buildPath = path.join(__dirname, '../dashboard/frontend/build');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                  GLD REST API V2.0                        ║
║              Multifunctional API Platform                 ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on port ${PORT}                             ║
║  Environment: ${process.env.NODE_ENV || 'development'}                          ║
║  Total Endpoints: 32+                                     ║
╠═══════════════════════════════════════════════════════════╣
║  Categories:                                              ║
║    - Utils: 14 endpoints                                  ║
║    - Media: 7 endpoints                                   ║
║    - Info: 2 endpoints                                    ║
║    - AI: 2 endpoints                                      ║
║    - File Processing: 7 endpoints                         ║
╠═══════════════════════════════════════════════════════════╣
║  Based on 32 WhatsApp bot plugins                         ║
║  Full feature parity with original functionality          ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  apiKeyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiKey',
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true
  },
  statusCode: Number,
  responseTime: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

requestLogSchema.index({ userId: 1, timestamp: -1 });
requestLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('RequestLog', requestLogSchema);

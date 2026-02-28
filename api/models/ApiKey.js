const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  hashedKey: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'Default API Key'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requestCount: {
    type: Number,
    default: 0
  },
  lastUsed: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

apiKeySchema.statics.hashKey = function(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
};

apiKeySchema.statics.generateKey = function() {
  return 'gld_' + crypto.randomBytes(32).toString('hex');
};

module.exports = mongoose.model('ApiKey', apiKeySchema);

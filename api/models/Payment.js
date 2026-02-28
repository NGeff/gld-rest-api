const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  plan: {
    type: String,
    enum: ['basic', 'pro', 'enterprise']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  mercadoPagoId: String,
  qrCodeData: String,
  qrCodeImage: String,
  pixCopyPaste: String,
  expiresAt: Date,
  paidAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

paymentSchema.index({ mercadoPagoId: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

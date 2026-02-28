const { MercadoPagoConfig, Payment: MPPayment } = require('mercadopago');
const Payment = require('../models/Payment');
const User = require('../models/User');
const emailService = require('../services/emailService');

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN 
});
const paymentClient = new MPPayment(client);

const PLAN_PRICES = {
  basic: 4.90,
  pro: 9.90,
  enterprise: 19.90
};

exports.createPayment = async (req, res) => {
  try {
    const { plan, amount } = req.body;

    if (!PLAN_PRICES[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Plano inválido'
      });
    }

    const existingPayment = await Payment.findOne({
      userId: req.user._id,
      plan,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).sort('-createdAt');

    if (existingPayment) {
      return res.json({
        success: true,
        payment: {
          id: existingPayment._id,
          mercadoPagoId: existingPayment.mercadoPagoId,
          amount: existingPayment.amount,
          plan: existingPayment.plan,
          qrCodeImage: existingPayment.qrCodeImage,
          pixCopyPaste: existingPayment.pixCopyPaste,
          expiresAt: existingPayment.expiresAt
        }
      });
    }

    const paymentData = {
      transaction_amount: amount || PLAN_PRICES[plan],
      description: `GLD Solutions - Plano ${plan.toUpperCase()}`,
      payment_method_id: 'pix',
      payer: {
        email: req.user.email,
        first_name: req.user.name
      }
    };

    const response = await paymentClient.create({ body: paymentData });

    const payment = await Payment.create({
      userId: req.user._id,
      amount: amount || PLAN_PRICES[plan],
      plan,
      mercadoPagoId: response.id,
      qrCodeData: response.point_of_interaction.transaction_data.qr_code,
      qrCodeImage: response.point_of_interaction.transaction_data.qr_code_base64,
      pixCopyPaste: response.point_of_interaction.transaction_data.qr_code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    res.status(201).json({
      success: true,
      payment: {
        id: payment._id,
        mercadoPagoId: payment.mercadoPagoId,
        amount: payment.amount,
        plan: payment.plan,
        qrCodeImage: payment.qrCodeImage,
        pixCopyPaste: payment.pixCopyPaste,
        expiresAt: payment.expiresAt
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar pagamento'
    });
  }
};

exports.checkPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findOne({ _id: id, userId: req.user._id });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    if (payment.status === 'approved') {
      return res.json({
        success: true,
        status: 'approved'
      });
    }

    const mpPayment = await paymentClient.get({ id: payment.mercadoPagoId });

    if (mpPayment.status === 'approved') {
      payment.status = 'approved';
      payment.paidAt = new Date();
      await payment.save();

      req.user.plan = payment.plan;
      req.user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await req.user.save();

      await emailService.sendPaymentConfirmationEmail(
        req.user.email,
        req.user.name,
        payment.amount,
        payment.plan
      );

      return res.json({
        success: true,
        status: 'approved',
        plan: req.user.plan,
        planExpiresAt: req.user.planExpiresAt
      });
    }

    res.json({
      success: true,
      status: mpPayment.status
    });
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status do pagamento'
    });
  }
};

exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort('-createdAt')
      .limit(20);

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar pagamentos'
    });
  }
};

exports.cancelExpiredPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findOne({
      _id: id,
      userId: req.user._id,
      status: 'pending'
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

    payment.status = 'cancelled';
    await payment.save();

    try {
      await paymentClient.cancel({ id: payment.mercadoPagoId });
    } catch (mpError) {
      console.error('Error cancelling MP payment:', mpError);
    }

    res.json({
      success: true,
      message: 'Pagamento cancelado'
    });
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar pagamento'
    });
  }
};

const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMinutes, maxRequests, message) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: {
      success: false,
      message: message || 'Muitas tentativas. Por favor, aguarde alguns minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

exports.authLimiter = createRateLimiter(
  15,
  5,
  'Muitas tentativas de login. Por favor, aguarde 15 minutos.'
);

exports.passwordLimiter = createRateLimiter(
  60,
  3,
  'Limite de alterações de senha atingido. Por favor, aguarde 1 hora.'
);

exports.emailLimiter = createRateLimiter(
  60,
  3,
  'Limite de alterações de email atingido. Por favor, aguarde 1 hora.'
);

exports.apiKeyLimiter = createRateLimiter(
  15,
  10,
  'Limite de criação de chaves API atingido. Por favor, aguarde alguns minutos.'
);

exports.paymentLimiter = createRateLimiter(
  30,
  5,
  'Limite de criação de pagamentos atingido. Por favor, aguarde 30 minutos.'
);

exports.ticketLimiter = createRateLimiter(
  60,
  10,
  'Limite de criação de tickets atingido. Por favor, aguarde 1 hora.'
);

exports.messageLimiter = createRateLimiter(
  5,
  20,
  'Muitas mensagens enviadas. Por favor, aguarde alguns minutos.'
);

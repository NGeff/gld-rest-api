const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: process.env.BREVO_SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS
  }
});

exports.sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email - GLD Solutions',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">Welcome to GLD Solutions</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 14px;">${verificationUrl}</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">GLD Solutions - REST API Platform</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request - GLD Solutions',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 14px;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">GLD Solutions - REST API Platform</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendPaymentConfirmationEmail = async (email, name, amount, plan) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Payment Confirmed - GLD Solutions',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Payment Confirmed</h2>
        <p>Hi ${name},</p>
        <p>Your payment has been confirmed successfully!</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Amount:</strong> R$ ${amount.toFixed(2)}</p>
          <p style="margin: 10px 0 0 0;"><strong>Plan:</strong> ${plan.toUpperCase()}</p>
        </div>
        <p>Your account has been upgraded and you can now access all features of your plan.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">GLD Solutions - REST API Platform</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendPlanExpirationWarning = async (email, name, daysLeft, plan) => {
  const renewUrl = `${process.env.FRONTEND_URL}/dashboard/billing`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Seu plano ${plan.toUpperCase()} expira em ${daysLeft} dias - GLD Solutions`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Aviso de Expiração de Plano</h2>
        <p>Olá ${name},</p>
        <p>Seu plano <strong>${plan.toUpperCase()}</strong> expirará em <strong>${daysLeft} dias</strong>.</p>
        <p>Após a expiração, sua conta será automaticamente rebaixada para o plano Free, o que limitará o acesso às funcionalidades premium.</p>
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;"><strong>Ação necessária:</strong></p>
          <p style="margin: 10px 0 0 0; color: #92400e;">Renove seu plano para continuar aproveitando todos os benefícios.</p>
        </div>
        <a href="${renewUrl}" style="display: inline-block; padding: 12px 24px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Renovar Plano</a>
        <p>Se você tiver alguma dúvida, entre em contato com nosso suporte.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">GLD Solutions - REST API Platform</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendPlanExpiredEmail = async (email, name, plan) => {
  const renewUrl = `${process.env.FRONTEND_URL}/dashboard/billing`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Seu plano ${plan.toUpperCase()} expirou - GLD Solutions`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Plano Expirado</h2>
        <p>Olá ${name},</p>
        <p>Seu plano <strong>${plan.toUpperCase()}</strong> expirou.</p>
        <p>Sua conta foi automaticamente rebaixada para o plano <strong>Free</strong>. Você ainda pode acessar o dashboard, mas com funcionalidades limitadas.</p>
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p style="margin: 0; color: #991b1b;"><strong>O que mudou:</strong></p>
          <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #991b1b;">
            <li>Limite de requisições reduzido</li>
            <li>Acesso apenas a funcionalidades básicas</li>
            <li>Suporte limitado</li>
          </ul>
        </div>
        <p>Para recuperar o acesso completo às funcionalidades premium, renove seu plano agora:</p>
        <a href="${renewUrl}" style="display: inline-block; padding: 12px 24px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Renovar Plano</a>
        <p>Obrigado por fazer parte da GLD Solutions!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">GLD Solutions - REST API Platform</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendTicketReplyNotification = async (email, name, ticketSubject, ticketId, messagePreview) => {
  const ticketUrl = `${process.env.FRONTEND_URL}/dashboard/support?ticket=${ticketId}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Nova resposta no seu ticket: ${ticketSubject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">Nova Resposta no Seu Ticket</h2>
        <p>Olá ${name},</p>
        <p>Você recebeu uma nova resposta no ticket <strong>"${ticketSubject}"</strong>.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <p style="margin: 0; color: #666;"><strong>Mensagem:</strong></p>
          <p style="margin: 10px 0 0 0; color: #333;">${messagePreview}</p>
        </div>
        <a href="${ticketUrl}" style="display: inline-block; padding: 12px 24px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Ver Ticket Completo</a>
        <p>Entre no dashboard para visualizar a mensagem completa e continuar a conversa.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">GLD Solutions - REST API Platform</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendTicketClosedNotification = async (email, name, ticketSubject, ticketId) => {
  const ticketUrl = `${process.env.FRONTEND_URL}/dashboard/support?ticket=${ticketId}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Ticket fechado: ${ticketSubject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6b7280;">Ticket Fechado</h2>
        <p>Olá ${name},</p>
        <p>Seu ticket <strong>"${ticketSubject}"</strong> foi fechado pela nossa equipe de suporte.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #374151;">Esperamos que seu problema tenha sido resolvido com sucesso.</p>
        </div>
        <p>Se você precisar de mais assistência, pode abrir um novo ticket a qualquer momento.</p>
        <a href="${ticketUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6b7280; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Ver Histórico do Ticket</a>
        <p>Obrigado por usar a GLD Solutions!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">GLD Solutions - REST API Platform</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça todos os campos obrigatórios'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const user = await User.create({
      name,
      email,
      password,
      verificationToken
    });

    const apiKeyValue = ApiKey.generateKey();
    const hashedKey = ApiKey.hashKey(apiKeyValue);
    
    await ApiKey.create({
      userId: user._id,
      key: apiKeyValue,
      hashedKey,
      name: 'Default API Key'
    });

    await emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso. Por favor, verifique seu email.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça email e senha'
      });
    }

    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email não verificado. Por favor, verifique seu email antes de fazer login.'
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Conta suspensa. Entre em contato com o suporte.'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        role: user.role,
        isVerified: user.isVerified,
        isSuspended: user.isSuspended,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login'
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificação inválido'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verificado com sucesso'
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar email'
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Nenhum usuário encontrado com este email'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({
      success: true,
      message: 'Email de recuperação de senha enviado'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar email de recuperação de senha'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de recuperação inválido ou expirado'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao redefinir senha'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        dailyLimit: user.getDailyLimit()
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados do usuário'
    });
  }
};

exports.updateEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    req.user.email = email;
    req.user.isVerified = false;
    req.user.verificationToken = crypto.randomBytes(32).toString('hex');
    await req.user.save();

    await emailService.sendVerificationEmail(email, req.user.name, req.user.verificationToken);

    res.json({
      success: true,
      message: 'Email atualizado. Por favor, verifique seu novo email.'
    });
  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar email'
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!(await req.user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    req.user.password = newPassword;
    await req.user.save();

    res.json({
      success: true,
      message: 'Senha atualizada com sucesso'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar senha'
    });
  }
};

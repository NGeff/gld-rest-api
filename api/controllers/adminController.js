const User = require('../models/User');
const Payment = require('../models/Payment');
const RequestLog = require('../models/RequestLog');
const Ticket = require('../models/Ticket');

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', plan = '' } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (plan && plan !== 'all') {
      query.plan = plan;
    }

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários'
    });
  }
};

exports.updateUserPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { plan } = req.body;

    if (!['free', 'basic', 'pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Plano inválido'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Não é possível alterar plano de administrador'
      });
    }

    user.plan = plan;
    await user.save();

    res.json({
      success: true,
      message: 'Plano atualizado com sucesso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan
      }
    });
  } catch (error) {
    console.error('Update user plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar plano'
    });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { suspend } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Não é possível suspender administrador'
      });
    }

    user.isSuspended = suspend;
    await user.save();

    res.json({
      success: true,
      message: suspend ? 'Usuário suspenso com sucesso' : 'Suspensão removida com sucesso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isSuspended: user.isSuspended
      }
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status de suspensão'
    });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const payments = await Payment.find({ userId })
      .sort('-createdAt')
      .limit(10);

    const requestCount = await RequestLog.countDocuments({ userId });

    const recentRequests = await RequestLog.find({ userId })
      .sort('-createdAt')
      .limit(10);

    res.json({
      success: true,
      user,
      payments,
      requestCount,
      recentRequests
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar detalhes do usuário'
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const freeUsers = await User.countDocuments({ plan: 'free' });
    const basicUsers = await User.countDocuments({ plan: 'basic' });
    const proUsers = await User.countDocuments({ plan: 'pro' });
    const enterpriseUsers = await User.countDocuments({ plan: 'enterprise' });
    
    const totalRequests = await RequestLog.countDocuments();
    
    const totalPayments = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const openTickets = await Ticket.countDocuments({ status: { $ne: 'closed' } });

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          free: freeUsers,
          basic: basicUsers,
          pro: proUsers,
          enterprise: enterpriseUsers
        },
        requests: totalRequests,
        revenue: totalPayments.length > 0 ? totalPayments[0].total : 0,
        openTickets
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar pagamentos'
    });
  }
};

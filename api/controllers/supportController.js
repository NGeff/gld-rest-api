const Ticket = require('../models/Ticket');
const { sendTicketReplyNotification, sendTicketClosedNotification } = require('../services/emailService');

exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Assunto e mensagem são obrigatórios'
      });
    }

    const ticket = await Ticket.create({
      userId: req.user._id,
      subject,
      messages: [{
        sender: 'user',
        content: message
      }]
    });

    res.status(201).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar ticket'
    });
  }
};

exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user._id })
      .sort('-createdAt');

    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar tickets'
    });
  }
};

exports.getTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket não encontrado'
      });
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar ticket'
    });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem é obrigatória'
      });
    }

    const ticket = await Ticket.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket não encontrado'
      });
    }

    if (ticket.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível enviar mensagem em ticket fechado'
      });
    }

    ticket.messages.push({
      sender: 'user',
      content: message
    });

    await ticket.save();

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar mensagem'
    });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;

    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const tickets = await Ticket.find(query)
      .populate('userId', 'name email')
      .sort('-updatedAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Ticket.countDocuments(query);

    res.json({
      success: true,
      tickets,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar tickets'
    });
  }
};

exports.getTicketAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id)
      .populate('userId', 'name email plan');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket não encontrado'
      });
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Get ticket admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar ticket'
    });
  }
};

exports.replyTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem é obrigatória'
      });
    }

    const ticket = await Ticket.findById(id).populate('userId', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket não encontrado'
      });
    }

    ticket.messages.push({
      sender: 'admin',
      content: message
    });

    if (ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    await ticket.save();

    const messagePreview = message.length > 100 ? message.substring(0, 100) + '...' : message;
    await sendTicketReplyNotification(
      ticket.userId.email,
      ticket.userId.name,
      ticket.subject,
      ticket._id,
      messagePreview
    );

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Reply ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao responder ticket'
    });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'in_progress', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido'
      });
    }

    const ticket = await Ticket.findById(id).populate('userId', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket não encontrado'
      });
    }

    const wasOpen = ticket.status !== 'closed';
    ticket.status = status;
    await ticket.save();

    if (status === 'closed' && wasOpen) {
      await sendTicketClosedNotification(
        ticket.userId.email,
        ticket.userId.name,
        ticket.subject,
        ticket._id
      );
    }

    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
      ticket
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status'
    });
  }
};

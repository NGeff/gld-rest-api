const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Não autenticado'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Privilégios de administrador necessários.'
    });
  }

  next();
};

module.exports = { requireAdmin };

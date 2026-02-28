const axios = require('axios');
const ApiKey = require('../models/ApiKey');

exports.testRoute = async (req, res) => {
  try {
    const { endpoint, method = 'GET', params = {}, body = {} } = req.body;

    const apiKey = await ApiKey.findOne({
      userId: req.user._id,
      isActive: true
    }).sort('-createdAt');

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Você precisa de uma API key para testar as rotas. Crie uma na página de API Keys.'
      });
    }

    const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const url = `${baseUrl}${endpoint}`;

    const startTime = Date.now();

    const config = {
      method,
      url,
      headers: {
        'x-api-key': apiKey.key
      }
    };

    if (method === 'GET' && Object.keys(params).length > 0) {
      config.params = params;
    } else if (['POST', 'PUT', 'PATCH'].includes(method) && Object.keys(body).length > 0) {
      config.data = body;
    }

    const response = await axios(config);
    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      statusCode: response.status,
      responseTime: `${responseTime}ms`,
      data: response.data
    });
  } catch (error) {
    const responseTime = Date.now() - (error.config?.startTime || Date.now());
    
    if (error.response) {
      return res.json({
        success: false,
        statusCode: error.response.status,
        responseTime: `${responseTime}ms`,
        data: error.response.data,
        error: error.response.data.message || 'Erro na requisição'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao testar rota',
      error: error.message
    });
  }
};

const utilsService = require('../services/utilsService');
const QRCode = require('qrcode');

exports.translate = async (req, res) => {
  try {
    const { text, target } = req.query;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text parameter is required'
      });
    }

    const result = await utilsService.translate(text, target || 'pt');
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.cep = async (req, res) => {
  try {
    const { cep } = req.params;
    
    if (!cep) {
      return res.status(400).json({
        success: false,
        message: 'CEP parameter is required'
      });
    }

    const result = await utilsService.getCep(cep);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.cnpj = async (req, res) => {
  try {
    const { cnpj } = req.params;
    
    if (!cnpj) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ parameter is required'
      });
    }

    const result = await utilsService.getCnpj(cnpj);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.crypto = async (req, res) => {
  try {
    const { currency } = req.query;
    
    const result = await utilsService.getCrypto(currency || 'bitcoin');
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.currency = async (req, res) => {
  try {
    const { from, to, amount } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'From and to currency parameters are required'
      });
    }

    const result = await utilsService.getCurrency(from.toUpperCase(), to.toUpperCase(), parseFloat(amount) || 1);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.weather = async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City parameter is required'
      });
    }

    const result = await utilsService.getWeather(city);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.feriados = async (req, res) => {
  try {
    const { year } = req.params;
    
    const result = await utilsService.getFeriados(year || new Date().getFullYear());
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.shortUrl = async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL parameter is required'
      });
    }

    const result = await utilsService.shortUrl(url);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.qrcode = async (req, res) => {
  try {
    const { text } = req.query;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text parameter is required'
      });
    }

    const qrCode = await QRCode.toDataURL(text);
    
    res.json({
      success: true,
      data: {
        qrCode
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.searchImage = async (req, res) => {
  try {
    const { query, limit } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    const result = await utilsService.searchImage(query, parseInt(limit) || 5);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

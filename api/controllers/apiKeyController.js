const ApiKey = require('../models/ApiKey');
const User = require('../models/User');

const KEY_LIMITS = {
  free: 1,
  basic: 3,
  pro: 10,
  enterprise: Infinity
};

exports.getApiKeys = async (req, res) => {
  try {
    const apiKeys = await ApiKey.find({ userId: req.user._id })
      .select('-hashedKey')
      .sort('-createdAt');

    res.json({
      success: true,
      apiKeys: apiKeys.map(key => ({
        id: key._id,
        name: key.name,
        key: key.key.substring(0, 12) + '...',
        isActive: key.isActive,
        requestCount: key.requestCount,
        lastUsed: key.lastUsed,
        createdAt: key.createdAt
      }))
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching API keys'
    });
  }
};

exports.createApiKey = async (req, res) => {
  try {
    const { name, customKey } = req.body;
    const plan = req.user.plan;
    const limit = KEY_LIMITS[plan];

    const existingCount = await ApiKey.countDocuments({ userId: req.user._id });

    if (limit !== Infinity && existingCount >= limit) {
      return res.status(403).json({
        success: false,
        message: `Your plan allows up to ${limit} API key(s). Upgrade to create more.`
      });
    }

    if (customKey) {
      if (plan === 'free' || plan === 'basic') {
        return res.status(403).json({
          success: false,
          message: 'Custom API keys are only available for Pro and Enterprise plans'
        });
      }

      if (!/^gld_[a-zA-Z0-9_-]{20,64}$/.test(customKey)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid custom key format. Must start with gld_ and be 20-64 characters.'
        });
      }

      const hashedCustom = ApiKey.hashKey(customKey);
      const existing = await ApiKey.findOne({ hashedKey: hashedCustom });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'This custom key is already in use'
        });
      }
    }

    const keyValue = customKey || ApiKey.generateKey();
    const hashedKey = ApiKey.hashKey(keyValue);

    const apiKey = await ApiKey.create({
      userId: req.user._id,
      key: keyValue,
      hashedKey,
      name: name || 'API Key'
    });

    res.status(201).json({
      success: true,
      message: 'API key created successfully',
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        key: keyValue,
        createdAt: apiKey.createdAt
      }
    });
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating API key'
    });
  }
};

exports.deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKey.findOne({ _id: id, userId: req.user._id });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    await apiKey.deleteOne();

    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting API key'
    });
  }
};

exports.revealApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKey.findOne({ _id: id, userId: req.user._id });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    res.json({
      success: true,
      key: apiKey.key
    });
  } catch (error) {
    console.error('Reveal API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Error revealing API key'
    });
  }
};

exports.toggleApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKey.findOne({ _id: id, userId: req.user._id });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    apiKey.isActive = !apiKey.isActive;
    await apiKey.save();

    res.json({
      success: true,
      message: `API key ${apiKey.isActive ? 'activated' : 'deactivated'}`,
      isActive: apiKey.isActive
    });
  } catch (error) {
    console.error('Toggle API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling API key'
    });
  }
};

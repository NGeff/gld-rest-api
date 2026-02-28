const mediaService = require('../services/mediaService');

exports.youtubeDownload = async (req, res) => {
  try {
    const { query, type } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    const result = await mediaService.downloadYoutube(query, type || 'audio');
    
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

exports.spotifySearch = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    const result = await mediaService.searchSpotify(query);
    
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

exports.spotifyDownload = async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL parameter is required'
      });
    }

    const result = await mediaService.downloadSpotify(url);
    
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

exports.instagramDownload = async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL parameter is required'
      });
    }

    const result = await mediaService.downloadInstagram(url);
    
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

exports.tiktokDownload = async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL parameter is required'
      });
    }

    const result = await mediaService.downloadTikTok(url);
    
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

exports.lyrics = async (req, res) => {
  try {
    const { song } = req.query;
    
    if (!song) {
      return res.status(400).json({
        success: false,
        message: 'Song parameter is required'
      });
    }

    const result = await mediaService.getLyrics(song);
    
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

exports.imdb = async (req, res) => {
  try {
    const { title } = req.query;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title parameter is required'
      });
    }

    const result = await mediaService.getImdb(title);
    
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

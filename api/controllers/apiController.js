const apiServices = require('../services/apiServices');

class ApiController {

  async translate(req, res) {
    try {
      const { text, target, source } = req.query;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'Text parameter is required'
        });
      }

      const result = await apiServices.translate(text, target || 'pt', source || 'auto');
      
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
  }

  async cep(req, res) {
    try {
      const { cep } = req.params;
      
      if (!cep) {
        return res.status(400).json({
          success: false,
          message: 'CEP parameter is required'
        });
      }

      const result = await apiServices.getCep(cep);
      
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
  }

  async cnpj(req, res) {
    try {
      const { cnpj } = req.params;
      
      if (!cnpj) {
        return res.status(400).json({
          success: false,
          message: 'CNPJ parameter is required'
        });
      }

      const result = await apiServices.getCnpj(cnpj);
      
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
  }

  async crypto(req, res) {
    try {
      const { currency } = req.query;
      
      const result = await apiServices.getCrypto(currency || 'bitcoin');
      
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
  }

  async currency(req, res) {
    try {
      const { from, to, amount } = req.query;
      
      if (!from || !to) {
        return res.status(400).json({
          success: false,
          message: 'From and to currency parameters are required'
        });
      }

      const result = await apiServices.getCurrency(from, to, parseFloat(amount) || 1);
      
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
  }

  async weather(req, res) {
    try {
      const { city } = req.query;
      
      if (!city) {
        return res.status(400).json({
          success: false,
          message: 'City parameter is required'
        });
      }

      const result = await apiServices.getWeather(city);
      
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
  }

  async holidays(req, res) {
    try {
      const { year } = req.params;
      
      const result = await apiServices.getHolidays(year || new Date().getFullYear());
      
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
  }

  async shortUrl(req, res) {
    try {
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL parameter is required'
        });
      }

      const result = await apiServices.shortUrl(url);
      
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
  }

  async qrcode(req, res) {
    try {
      const { text, width, margin, darkColor, lightColor, errorLevel } = req.query;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'Text parameter is required'
        });
      }

      const options = {
        width: width ? parseInt(width) : 512,
        margin: margin ? parseInt(margin) : 1,
        darkColor,
        lightColor,
        errorLevel
      };

      const result = await apiServices.generateQRCode(text, options);
      
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
  }

  async calculate(req, res) {
    try {
      const { expression } = req.query;
      
      if (!expression) {
        return res.status(400).json({
          success: false,
          message: 'Expression parameter is required'
        });
      }

      const result = await apiServices.calculate(expression);
      
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
  }

  async dictionary(req, res) {
    try {
      const { word } = req.query;
      
      if (!word) {
        return res.status(400).json({
          success: false,
          message: 'Word parameter is required'
        });
      }

      const result = await apiServices.getDictionary(word);
      
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
  }

  async searchImages(req, res) {
    try {
      const { query, limit } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Query parameter is required'
        });
      }

      const result = await apiServices.searchImages(query, parseInt(limit) || 10);
      
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
  }

  async youtubeDownload(req, res) {
    try {
      const { query, type } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Query parameter is required (YouTube URL or search term)'
        });
      }

      const result = await apiServices.downloadYoutube(query, type || 'audio');
      
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
  }

  async spotifySearch(req, res) {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Query parameter is required'
        });
      }

      const result = await apiServices.searchSpotify(query);
      
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
  }

  async spotifyDownload(req, res) {
    try {
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL parameter is required (Spotify track URL)'
        });
      }

      const result = await apiServices.downloadSpotify(url);
      
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
  }

  async instagramDownload(req, res) {
    try {
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL parameter is required (Instagram post URL)'
        });
      }

      const result = await apiServices.downloadInstagram(url);
      
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
  }

  async tiktokDownload(req, res) {
    try {
      const { url } = req.query;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL parameter is required (TikTok video URL)'
        });
      }

      const result = await apiServices.downloadTikTok(url);
      
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
  }

  async lyrics(req, res) {
    try {
      const { song, artist } = req.query;
      
      if (!song) {
        return res.status(400).json({
          success: false,
          message: 'Song parameter is required'
        });
      }

      const result = await apiServices.getLyrics(song, artist || '');
      
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
  }

  async imdb(req, res) {
    try {
      const { title } = req.query;
      
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Title parameter is required'
        });
      }

      const result = await apiServices.getImdb(title);
      
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
  }

  async steamGame(req, res) {
    try {
      const { appId } = req.params;
      
      if (!appId) {
        return res.status(400).json({
          success: false,
          message: 'App ID parameter is required'
        });
      }

      const result = await apiServices.getSteamGame(appId);
      
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
  }

  async pinterestSearch(req, res) {
    try {
      const { query, limit } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Query parameter is required'
        });
      }

      const result = await apiServices.searchPinterest(query, parseInt(limit) || 10);
      
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
  }

  async textToSpeech(req, res) {
    try {
      const { text, lang } = req.query;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'Text parameter is required'
        });
      }

      const result = await apiServices.textToSpeech(text, lang || 'pt');
      
      res.json({
        success: true,
        data: {
          text: result.text,
          language: result.language,
          message: 'Audio file generated (file-based endpoints require download implementation)'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async randomThought(req, res) {
    try {
      const result = await apiServices.getRandomThought();
      
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
  }

  async audioMeme(req, res) {
    try {
      res.status(501).json({
        success: false,
        message: 'Audio meme generation requires file upload - use multipart/form-data endpoint'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async applyEffect(req, res) {
    try {
      res.status(501).json({
        success: false,
        message: 'Effect application requires file upload - use multipart/form-data endpoint'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async attp(req, res) {
    try {
      res.status(501).json({
        success: false,
        message: 'Animated text sticker generation requires canvas/ffmpeg - use specialized endpoint'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async toAudio(req, res) {
    try {
      res.status(501).json({
        success: false,
        message: 'Video to audio conversion requires file upload - use multipart/form-data endpoint'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async toImage(req, res) {
    try {
      res.status(501).json({
        success: false,
        message: 'Video to image conversion requires file upload - use multipart/form-data endpoint'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async shazam(req, res) {
    try {
      res.status(501).json({
        success: false,
        message: 'Music identification requires audio file upload'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async imagine(req, res) {
    try {
      res.status(501).json({
        success: false,
        message: 'AI image generation requires API key configuration'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async aiChat(req, res) {
    try {
      res.status(501).json({
        success: false,
        message: 'AI chat requires API key configuration'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ApiController();

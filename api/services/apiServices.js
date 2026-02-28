const axios = require('axios');
const mathjs = require('mathjs');
const QRCode = require('qrcode');
const yts = require('yt-search');
const gtts = require('gtts');
const path = require('path');
const fs = require('fs').promises;

const TEMP_DIR = path.join(__dirname, '../temp');

class ApiServices {
  
  async translate(text, targetLang = 'pt', sourceLang = 'auto') {
    try {
      const encodedText = encodeURIComponent(text);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`;
      const { data } = await axios.get(url);
      const translatedText = data[0].map(t => t[0]).join('');
      
      return {
        original: text,
        translated: translatedText,
        from: sourceLang,
        to: targetLang
      };
    } catch (error) {
      throw new Error('Translation failed');
    }
  }

  async getCep(cep) {
    try {
      const cleanCep = cep.replace(/\D/g, '');
      if (cleanCep.length !== 8) throw new Error('Invalid CEP format');
      
      const { data } = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (data.erro) throw new Error('CEP not found');
      
      return {
        cep: data.cep,
        street: data.logradouro,
        complement: data.complemento,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        ibge: data.ibge,
        gia: data.gia,
        ddd: data.ddd,
        siafi: data.siafi
      };
    } catch (error) {
      throw new Error('Failed to fetch CEP data');
    }
  }

  async getCnpj(cnpj) {
    try {
      const cleanCnpj = cnpj.replace(/\D/g, '');
      if (cleanCnpj.length !== 14) throw new Error('Invalid CNPJ format');
      
      const { data } = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      
      return {
        cnpj: data.cnpj,
        name: data.razao_social,
        fantasy: data.nome_fantasia,
        openingDate: data.data_inicio_atividade,
        situation: data.descricao_situacao_cadastral,
        mainActivity: data.cnae_fiscal_descricao,
        address: {
          street: data.logradouro,
          number: data.numero,
          complement: data.complemento,
          neighborhood: data.bairro,
          city: data.municipio,
          state: data.uf,
          cep: data.cep
        },
        phone: data.ddd_telefone_1,
        email: data.email,
        legalNature: data.natureza_juridica,
        capital: data.capital_social
      };
    } catch (error) {
      throw new Error('Failed to fetch CNPJ data');
    }
  }

  async getCrypto(currency = 'bitcoin') {
    try {
      const { data } = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${currency}&vs_currencies=usd,brl,eur&include_24hr_change=true&include_market_cap=true`
      );
      
      if (!data[currency]) throw new Error('Cryptocurrency not found');
      
      return {
        currency,
        prices: {
          usd: data[currency].usd,
          brl: data[currency].brl,
          eur: data[currency].eur
        },
        change24h: {
          usd: data[currency].usd_24h_change,
          brl: data[currency].brl_24h_change,
          eur: data[currency].eur_24h_change
        },
        marketCap: {
          usd: data[currency].usd_market_cap,
          brl: data[currency].brl_market_cap,
          eur: data[currency].eur_market_cap
        }
      };
    } catch (error) {
      throw new Error('Failed to fetch crypto data');
    }
  }

  async getCurrency(from, to, amount = 1) {
    try {
      const { data } = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`);
      const rate = data.rates[to.toUpperCase()];
      
      if (!rate) throw new Error('Currency not found');
      
      return {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount,
        result: (amount * rate).toFixed(2),
        rate: rate.toFixed(4),
        date: data.date
      };
    } catch (error) {
      throw new Error('Failed to fetch currency data');
    }
  }

  async getWeather(city) {
    try {
      const { data } = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      
      const current = data.current_condition[0];
      const today = data.weather[0];
      
      return {
        location: city,
        current: {
          temperature: current.temp_C,
          feelsLike: current.FeelsLikeC,
          description: current.weatherDesc[0].value,
          humidity: current.humidity,
          windSpeed: current.windspeedKmph,
          windDirection: current.winddir16Point,
          pressure: current.pressure,
          visibility: current.visibility,
          uvIndex: current.uvIndex,
          cloudCover: current.cloudcover
        },
        forecast: {
          maxTemp: today.maxtempC,
          minTemp: today.mintempC,
          sunrise: today.astronomy[0].sunrise,
          sunset: today.astronomy[0].sunset,
          moonrise: today.astronomy[0].moonrise,
          moonset: today.astronomy[0].moonset
        }
      };
    } catch (error) {
      throw new Error('Failed to fetch weather data');
    }
  }

  async getHolidays(year = new Date().getFullYear()) {
    try {
      const { data } = await axios.get(`https://brasilapi.com.br/api/feriados/v1/${year}`);
      
      return data.map(holiday => ({
        date: holiday.date,
        name: holiday.name,
        type: holiday.type
      }));
    } catch (error) {
      throw new Error('Failed to fetch holidays data');
    }
  }

  async shortUrl(url) {
    try {
      if (!url.match(/^https?:\/\//)) {
        url = 'https://' + url;
      }
      
      const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      
      return {
        original: url,
        shortened: data
      };
    } catch (error) {
      throw new Error('Failed to shorten URL');
    }
  }

  async generateQRCode(text, options = {}) {
    try {
      const qrOptions = {
        errorCorrectionLevel: options.errorLevel || 'M',
        type: 'image/png',
        quality: options.quality || 0.92,
        margin: options.margin || 1,
        width: options.width || 512,
        color: {
          dark: options.darkColor || '#000000',
          light: options.lightColor || '#FFFFFF'
        }
      };
      
      const qrCode = await QRCode.toDataURL(text, qrOptions);
      
      return {
        text,
        qrCode,
        format: 'base64'
      };
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  async calculate(expression) {
    try {
      const result = mathjs.evaluate(expression);
      
      return {
        expression,
        result: typeof result === 'number' ? result : result.toString(),
        formatted: typeof result === 'number' ? result.toLocaleString('pt-BR') : result.toString()
      };
    } catch (error) {
      throw new Error('Invalid mathematical expression');
    }
  }

  async getDictionary(word) {
    try {
      const { data } = await axios.get(`https://dicionario-aberto.net/search-json/${encodeURIComponent(word)}`);
      
      if (!data || data.length === 0) throw new Error('Word not found');
      
      const entries = data.slice(0, 3).map(entry => ({
        word: entry.word,
        class: entry.class,
        meanings: entry.xml ? this.parseMeanings(entry.xml) : []
      }));
      
      return {
        word,
        entries
      };
    } catch (error) {
      throw new Error('Failed to fetch dictionary data');
    }
  }

  parseMeanings(xml) {
    const meanings = [];
    const defMatch = xml.match(/<def>(.*?)<\/def>/g);
    if (defMatch) {
      defMatch.forEach(def => {
        const meaning = def.replace(/<\/?def>/g, '');
        if (meaning) meanings.push(meaning);
      });
    }
    return meanings;
  }

  async searchImages(query, limit = 10) {
    try {
      const { data } = await axios.get('https://www.google.com/search', {
        params: {
          q: query,
          tbm: 'isch',
          ijn: 0
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const regex = /\["(https?:\/\/[^"]+)",\d+,\d+\]/g;
      const matches = [...data.matchAll(regex)];
      const images = matches.slice(0, limit).map(match => ({
        url: match[1]
      }));
      
      return {
        query,
        results: images,
        count: images.length
      };
    } catch (error) {
      throw new Error('Failed to search images');
    }
  }

  async downloadYoutube(query, type = 'audio') {
    try {
      await fs.mkdir(TEMP_DIR, { recursive: true });

      let videoUrl = query;

      if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
        const searchResults = await yts(query);
        
        if (!searchResults || !searchResults.videos || searchResults.videos.length === 0) {
          throw new Error('No results found');
        }

        videoUrl = searchResults.videos[0].url;
      }

      const encodedUrl = encodeURIComponent(videoUrl);
      const apiUrl = `https://backend1.tioo.eu.org/youtube?url=${encodedUrl}`;

      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.status) {
        throw new Error('Failed to get video information');
      }

      const downloadUrl = type === 'audio' ? data.mp3 : data.mp4;

      if (!downloadUrl) {
        throw new Error('Download URL not available');
      }

      return {
        title: data.title || 'Untitled',
        author: data.author || 'Unknown',
        thumbnail: data.thumbnail,
        downloadUrl,
        type,
        duration: data.duration
      };
    } catch (error) {
      throw new Error(`YouTube download failed: ${error.message}`);
    }
  }

  async searchSpotify(query) {
    try {
      const CLIENT_ID = '795803a59c4d420996f22555011b739c';
      const CLIENT_SECRET = 'a424b66b76484598ba5db9242a0a56ba';

      const tokenRes = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const token = tokenRes.data.access_token;

      const searchRes = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return {
        query,
        results: searchRes.data.tracks.items.map(track => ({
          name: track.name,
          artist: track.artists.map(a => a.name).join(', '),
          album: track.album.name,
          url: track.external_urls.spotify,
          preview: track.preview_url,
          duration: track.duration_ms,
          image: track.album.images[0]?.url,
          releaseDate: track.album.release_date
        }))
      };
    } catch (error) {
      throw new Error('Spotify search failed');
    }
  }

  async downloadSpotify(url) {
    try {
      const res = await axios.get(`https://backend1.tioo.eu.org/spotify?url=${encodeURIComponent(url)}`);
      const json = res.data;

      if (!json.status || !json.res_data || !json.res_data.formats?.length) {
        throw new Error('Failed to download from Spotify');
      }

      const data = json.res_data;
      const format = data.formats[0];

      return {
        title: data.title,
        duration: data.duration,
        thumbnail: data.thumbnail,
        downloadUrl: format.url,
        quality: format.quality
      };
    } catch (error) {
      throw new Error(`Spotify download failed: ${error.message}`);
    }
  }

  async downloadInstagram(url) {
    try {
      const { data } = await axios.get(`https://api.saveig.app/api/download/instagram?url=${encodeURIComponent(url)}`);
      
      if (!data.status) throw new Error('Failed to download from Instagram');
      
      return {
        type: data.type,
        caption: data.caption,
        thumbnail: data.thumbnail_url,
        media: data.downloads.map(d => ({
          url: d.url,
          type: d.type,
          quality: d.quality
        }))
      };
    } catch (error) {
      throw new Error('Instagram download failed');
    }
  }

  async downloadTikTok(url) {
    try {
      const { data } = await axios.get(`https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`);
      
      if (!data.status) throw new Error('Failed to download from TikTok');
      
      return {
        id: data.id,
        title: data.title,
        author: {
          name: data.author,
          username: data.author_name
        },
        stats: {
          likes: data.like_count,
          comments: data.comment_count,
          shares: data.share_count,
          plays: data.play_count
        },
        thumbnail: data.cover,
        video: data.video,
        music: data.music,
        duration: data.duration
      };
    } catch (error) {
      throw new Error('TikTok download failed');
    }
  }

  async getLyrics(song, artist = '') {
    try {
      const query = artist ? `${artist}/${song}` : song;
      const { data } = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(query)}`);
      
      if (!data.lyrics) throw new Error('Lyrics not found');
      
      return {
        song,
        artist: artist || 'Unknown',
        lyrics: data.lyrics.trim()
      };
    } catch (error) {
      throw new Error('Lyrics not found');
    }
  }

  async getImdb(title) {
    try {
      const { data } = await axios.get(`https://www.omdbapi.com/`, {
        params: {
          t: title,
          apikey: 'trilogy',
          plot: 'full'
        }
      });
      
      if (data.Error) throw new Error(data.Error);
      
      return {
        title: data.Title,
        year: data.Year,
        rated: data.Rated,
        released: data.Released,
        runtime: data.Runtime,
        genre: data.Genre,
        director: data.Director,
        writer: data.Writer,
        actors: data.Actors,
        plot: data.Plot,
        language: data.Language,
        country: data.Country,
        awards: data.Awards,
        poster: data.Poster,
        ratings: data.Ratings.map(r => ({
          source: r.Source,
          value: r.Value
        })),
        imdbRating: data.imdbRating,
        imdbVotes: data.imdbVotes,
        imdbID: data.imdbID,
        type: data.Type,
        boxOffice: data.BoxOffice,
        production: data.Production,
        website: data.Website
      };
    } catch (error) {
      throw new Error('IMDB search failed');
    }
  }

  async getSteamGame(appId) {
    try {
      const { data } = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
      
      const gameData = data[appId];
      if (!gameData.success) throw new Error('Game not found');
      
      const game = gameData.data;
      
      return {
        id: game.steam_appid,
        name: game.name,
        type: game.type,
        description: game.short_description,
        about: game.about_the_game,
        website: game.website,
        developers: game.developers,
        publishers: game.publishers,
        price: game.price_overview ? {
          currency: game.price_overview.currency,
          initial: game.price_overview.initial,
          final: game.price_overview.final,
          discount: game.price_overview.discount_percent,
          formatted: game.price_overview.final_formatted
        } : null,
        platforms: game.platforms,
        categories: game.categories?.map(c => c.description),
        genres: game.genres?.map(g => g.description),
        screenshots: game.screenshots?.map(s => s.path_full),
        releaseDate: game.release_date,
        recommendations: game.recommendations?.total
      };
    } catch (error) {
      throw new Error('Steam game fetch failed');
    }
  }

  async searchPinterest(query, limit = 10) {
    try {
      const { data } = await axios.get(`https://www.pinterest.com/resource/BaseSearchResource/get/`, {
        params: {
          source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
          data: JSON.stringify({
            options: {
              query: query,
              scope: 'pins'
            }
          })
        }
      });
      
      const pins = data.resource_response.data.results.slice(0, limit);
      
      return {
        query,
        results: pins.map(pin => ({
          id: pin.id,
          title: pin.grid_title,
          description: pin.description,
          image: pin.images?.orig?.url,
          link: `https://www.pinterest.com/pin/${pin.id}/`,
          domain: pin.domain,
          pinner: pin.pinner?.username
        }))
      };
    } catch (error) {
      throw new Error('Pinterest search failed');
    }
  }

  async textToSpeech(text, lang = 'pt') {
    try {
      await fs.mkdir(TEMP_DIR, { recursive: true });
      
      const filename = `tts_${Date.now()}.mp3`;
      const filepath = path.join(TEMP_DIR, filename);
      
      const gTTS = gtts(lang);
      
      await new Promise((resolve, reject) => {
        gTTS.save(filepath, text, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      return {
        text,
        language: lang,
        filepath,
        filename
      };
    } catch (error) {
      throw new Error('Text-to-speech conversion failed');
    }
  }

  async identifyMusic(audioBuffer) {
    try {
      throw new Error('Music identification requires audio file upload - not supported in REST API format');
    } catch (error) {
      throw new Error('Music identification failed');
    }
  }

  async generateAIImage(prompt) {
    try {
      throw new Error('AI image generation requires external API key configuration');
    } catch (error) {
      throw new Error('AI image generation failed');
    }
  }

  async chatWithAI(message, conversationId = null) {
    try {
      throw new Error('AI chat requires external API key configuration');
    } catch (error) {
      throw new Error('AI chat failed');
    }
  }

  async getRandomThought() {
    try {
      const thoughts = [
        "A journey of a thousand miles begins with a single step.",
        "The only way to do great work is to love what you do.",
        "Innovation distinguishes between a leader and a follower.",
        "Stay hungry, stay foolish.",
        "The future belongs to those who believe in the beauty of their dreams.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Believe you can and you're halfway there.",
        "The only impossible journey is the one you never begin.",
        "Life is what happens when you're busy making other plans.",
        "The purpose of our lives is to be happy."
      ];
      
      return {
        thought: thoughts[Math.floor(Math.random() * thoughts.length)],
        category: 'inspirational'
      };
    } catch (error) {
      throw new Error('Failed to get random thought');
    }
  }
}

module.exports = new ApiServices();

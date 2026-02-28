const axios = require('axios');

exports.translate = async (text, targetLang = 'pt') => {
  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodedText}`;
    const { data } = await axios.get(url);
    const translatedText = data[0].map(t => t[0]).join('');
    
    return {
      original: text,
      translated: translatedText,
      targetLanguage: targetLang
    };
  } catch (error) {
    throw new Error('Translation failed');
  }
};

exports.getCep = async (cep) => {
  try {
    const cleanCep = cep.replace(/\D/g, '');
    const { data } = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (data.erro) {
      throw new Error('CEP not found');
    }
    
    return data;
  } catch (error) {
    throw new Error('Failed to fetch CEP data');
  }
};

exports.getCnpj = async (cnpj) => {
  try {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    const { data } = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
    return data;
  } catch (error) {
    throw new Error('Failed to fetch CNPJ data');
  }
};

exports.getCrypto = async (currency = 'bitcoin') => {
  try {
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${currency}&vs_currencies=usd,brl&include_24hr_change=true`);
    return data[currency];
  } catch (error) {
    throw new Error('Failed to fetch crypto data');
  }
};

exports.getCurrency = async (from, to, amount = 1) => {
  try {
    const { data } = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
    const rate = data.rates[to];
    
    return {
      from,
      to,
      amount,
      result: amount * rate,
      rate
    };
  } catch (error) {
    throw new Error('Failed to fetch currency data');
  }
};

exports.getWeather = async (city) => {
  try {
    const { data } = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
    
    const current = data.current_condition[0];
    
    return {
      location: city,
      temperature: current.temp_C,
      feelsLike: current.FeelsLikeC,
      description: current.weatherDesc[0].value,
      humidity: current.humidity,
      windSpeed: current.windspeedKmph
    };
  } catch (error) {
    throw new Error('Failed to fetch weather data');
  }
};

exports.getFeriados = async (year) => {
  try {
    const { data } = await axios.get(`https://brasilapi.com.br/api/feriados/v1/${year}`);
    return data;
  } catch (error) {
    throw new Error('Failed to fetch holidays data');
  }
};

exports.shortUrl = async (url) => {
  try {
    const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    return { shortUrl: data };
  } catch (error) {
    throw new Error('Failed to shorten URL');
  }
};

exports.searchImage = async (query, limit = 5) => {
  try {
    const { data } = await axios.get(`https://www.googleapis.com/customsearch/v1`, {
      params: {
        key: process.env.GOOGLE_API_KEY || 'demo',
        cx: process.env.GOOGLE_CX || 'demo',
        q: query,
        searchType: 'image',
        num: limit
      }
    });
    
    return data.items?.map(item => ({
      title: item.title,
      url: item.link,
      thumbnail: item.image.thumbnailLink
    })) || [];
  } catch (error) {
    throw new Error('Failed to search images');
  }
};

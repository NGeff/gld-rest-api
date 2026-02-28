const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs').promises;
const path = require('path');

const TEMP_DIR = path.join(__dirname, '../temp');
const EXTERNAL_TIMEOUT = 15000;

const INSTAGRAM_URL_REGEX = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv|stories)\/[a-zA-Z0-9_-]+/;
const TIKTOK_URL_REGEX = /^https?:\/\/(www\.|vm\.)?tiktok\.com\//;

exports.downloadYoutube = async (query, type = 'audio') => {
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

    const response = await axios.get(apiUrl, { timeout: EXTERNAL_TIMEOUT });
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
      type
    };
  } catch (error) {
    throw new Error(`YouTube download failed: ${error.message}`);
  }
};

exports.searchSpotify = async (query) => {
  try {
    const CLIENT_ID = '795803a59c4d420996f22555011b739c';
    const CLIENT_SECRET = 'a424b66b76484598ba5db9242a0a56ba';

    const tokenRes = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: EXTERNAL_TIMEOUT
      }
    );

    const token = tokenRes.data.access_token;

    const searchRes = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: EXTERNAL_TIMEOUT
      }
    );

    return searchRes.data.tracks.items.map(track => ({
      name: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      url: track.external_urls.spotify,
      preview: track.preview_url,
      image: track.album.images[0]?.url
    }));
  } catch (error) {
    throw new Error('Spotify search failed');
  }
};

exports.downloadSpotify = async (url) => {
  try {
    const res = await axios.get(
      `https://backend1.tioo.eu.org/spotify?url=${encodeURIComponent(url)}`,
      { timeout: EXTERNAL_TIMEOUT }
    );
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
      downloadUrl: format.url
    };
  } catch (error) {
    throw new Error(`Spotify download failed: ${error.message}`);
  }
};

exports.downloadInstagram = async (url) => {
  if (!INSTAGRAM_URL_REGEX.test(url)) {
    throw new Error('Invalid Instagram URL');
  }

  try {
    const response = await axios.get(
      `https://backend1.tioo.eu.org/igdl?url=${encodeURIComponent(url)}`,
      { timeout: EXTERNAL_TIMEOUT }
    );

    const data = response.data;

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No media found for this Instagram URL');
    }

    const item = data[0];

    if (!item.status) {
      throw new Error('Instagram media unavailable');
    }

    return {
      thumbnail: item.thumbnail || null,
      creator: item.creator || null,
      downloadUrl: item.url,
      source: url
    };
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Instagram download timed out');
    }
    throw new Error(`Instagram download failed: ${error.message}`);
  }
};

exports.downloadTikTok = async (url) => {
  if (!TIKTOK_URL_REGEX.test(url)) {
    throw new Error('Invalid TikTok URL');
  }

  try {
    const response = await axios.get(
      `https://backend1.tioo.eu.org/tiktok?url=${encodeURIComponent(url)}`,
      { timeout: EXTERNAL_TIMEOUT }
    );

    const data = response.data;

    if (data.code !== 0 || !data.data) {
      throw new Error(data.msg || 'TikTok media unavailable');
    }

    const d = data.data;

    return {
      id: d.id,
      title: d.title,
      duration: d.duration,
      play: d.play,
      hdplay: d.hdplay || null,
      wmplay: d.wmplay || null,
      music: d.music || null,
      size: d.size || null,
      author: d.author
        ? {
            id: d.author.id,
            username: d.author.unique_id,
            nickname: d.author.nickname,
            avatar: d.author.avatar
          }
        : null,
      source: url
    };
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('TikTok download timed out');
    }
    throw new Error(`TikTok download failed: ${error.message}`);
  }
};

exports.getLyrics = async (song) => {
  try {
    const { data } = await axios.get(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(song)}`,
      { timeout: EXTERNAL_TIMEOUT }
    );

    return {
      lyrics: data.lyrics,
      song
    };
  } catch (error) {
    throw new Error('Lyrics not found');
  }
};

exports.getImdb = async (title) => {
  try {
    const { data } = await axios.get(
      `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=demo`,
      { timeout: EXTERNAL_TIMEOUT }
    );

    if (data.Error) {
      throw new Error(data.Error);
    }

    return {
      title: data.Title,
      year: data.Year,
      rating: data.imdbRating,
      plot: data.Plot,
      poster: data.Poster,
      genre: data.Genre,
      director: data.Director,
      actors: data.Actors
    };
  } catch (error) {
    throw new Error('IMDB search failed');
  }
};

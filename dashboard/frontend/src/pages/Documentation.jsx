import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const METHOD_COLORS = {
  GET: '#3b82f6',
  POST: '#f59e0b',
  PUT: '#8b5cf6',
  DELETE: '#ef4444'
};

const ENDPOINTS = [
  {
    category: 'Utilitários',
    routes: [
      {
        name: 'Traduzir Texto',
        method: 'GET',
        path: '/api/v1/utils/translate',
        description: 'Traduz texto para o idioma desejado.',
        params: [
          { name: 'text', type: 'query', required: true, description: 'Texto para traduzir', example: 'Hello World' },
          { name: 'target', type: 'query', required: false, description: 'Idioma de destino', example: 'pt' },
          { name: 'source', type: 'query', required: false, description: 'Idioma de origem', example: 'auto' }
        ]
      },
      {
        name: 'Consultar CEP',
        method: 'GET',
        path: '/api/v1/utils/cep/:cep',
        description: 'Consulta informações de um CEP brasileiro.',
        params: [
          { name: 'cep', type: 'path', required: true, description: 'CEP brasileiro', example: '01310-100' }
        ]
      },
      {
        name: 'Consultar CNPJ',
        method: 'GET',
        path: '/api/v1/utils/cnpj/:cnpj',
        description: 'Consulta dados de um CNPJ.',
        params: [
          { name: 'cnpj', type: 'path', required: true, description: 'CNPJ (somente números)', example: '00000000000191' }
        ]
      },
      {
        name: 'Clima',
        method: 'GET',
        path: '/api/v1/utils/weather',
        description: 'Obtém previsão do tempo para uma cidade.',
        params: [
          { name: 'city', type: 'query', required: true, description: 'Nome da cidade', example: 'São Paulo' }
        ]
      },
      {
        name: 'Criptomoedas',
        method: 'GET',
        path: '/api/v1/utils/crypto',
        description: 'Cotação de criptomoedas.',
        params: [
          { name: 'currency', type: 'query', required: false, description: 'Nome da moeda', example: 'bitcoin' }
        ]
      },
      {
        name: 'Câmbio',
        method: 'GET',
        path: '/api/v1/utils/currency',
        description: 'Conversão de moedas.',
        params: [
          { name: 'from', type: 'query', required: true, description: 'Moeda de origem', example: 'USD' },
          { name: 'to', type: 'query', required: true, description: 'Moeda de destino', example: 'BRL' },
          { name: 'amount', type: 'query', required: false, description: 'Valor a converter', example: '100' }
        ]
      },
      {
        name: 'Gerar QR Code',
        method: 'GET',
        path: '/api/v1/utils/qrcode',
        description: 'Gera um QR Code a partir de um texto.',
        params: [
          { name: 'text', type: 'query', required: true, description: 'Texto para o QR Code', example: 'https://exemplo.com' }
        ]
      },
      {
        name: 'Encurtar URL',
        method: 'GET',
        path: '/api/v1/utils/shorturl',
        description: 'Encurta uma URL.',
        params: [
          { name: 'url', type: 'query', required: true, description: 'URL para encurtar', example: 'https://google.com' }
        ]
      },
      {
        name: 'Calculadora',
        method: 'GET',
        path: '/api/v1/utils/calculate',
        description: 'Calcula uma expressão matemática.',
        params: [
          { name: 'expression', type: 'query', required: true, description: 'Expressão matemática', example: '2+2*3' }
        ]
      },
      {
        name: 'Dicionário',
        method: 'GET',
        path: '/api/v1/utils/dictionary',
        description: 'Definição de uma palavra.',
        params: [
          { name: 'word', type: 'query', required: true, description: 'Palavra para buscar', example: 'innovation' }
        ]
      },
      {
        name: 'Feriados',
        method: 'GET',
        path: '/api/v1/utils/holidays/:year',
        description: 'Lista feriados nacionais brasileiros.',
        params: [
          { name: 'year', type: 'path', required: false, description: 'Ano (padrão: atual)', example: '2025' }
        ]
      },
      {
        name: 'Buscar Imagens',
        method: 'GET',
        path: '/api/v1/utils/images',
        description: 'Busca imagens na web.',
        params: [
          { name: 'query', type: 'query', required: true, description: 'Termo de busca', example: 'sunset beach' }
        ]
      },
      {
        name: 'Text to Speech',
        method: 'GET',
        path: '/api/v1/utils/tts',
        description: 'Converte texto em áudio.',
        params: [
          { name: 'text', type: 'query', required: true, description: 'Texto a converter', example: 'Olá mundo' },
          { name: 'lang', type: 'query', required: false, description: 'Idioma', example: 'pt' }
        ]
      }
    ]
  },
  {
    category: 'Mídia',
    routes: [
      {
        name: 'Download YouTube',
        method: 'GET',
        path: '/api/v1/media/youtube',
        description: 'Baixa áudio ou vídeo do YouTube.',
        params: [
          { name: 'query', type: 'query', required: true, description: 'URL ou termo de busca', example: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
          { name: 'type', type: 'query', required: false, description: 'audio ou video', example: 'audio' }
        ]
      },
      {
        name: 'Buscar Spotify',
        method: 'GET',
        path: '/api/v1/media/spotify/search',
        description: 'Busca músicas no Spotify.',
        params: [
          { name: 'query', type: 'query', required: true, description: 'Nome da música ou artista', example: 'Bohemian Rhapsody' }
        ]
      },
      {
        name: 'Download Spotify',
        method: 'GET',
        path: '/api/v1/media/spotify/download',
        description: 'Baixa uma faixa do Spotify.',
        params: [
          { name: 'url', type: 'query', required: true, description: 'URL da faixa no Spotify', example: 'https://open.spotify.com/track/...' }
        ]
      },
      {
        name: 'Download Instagram',
        method: 'GET',
        path: '/api/v1/download/instagram',
        description: 'Baixa mídia de posts e reels do Instagram.',
        params: [
          { name: 'url', type: 'query', required: true, description: 'URL do post/reel do Instagram', example: 'https://www.instagram.com/p/ABC123/' }
        ]
      },
      {
        name: 'Download TikTok',
        method: 'GET',
        path: '/api/v1/download/tiktok',
        description: 'Baixa vídeos do TikTok sem marca d\'água.',
        params: [
          { name: 'url', type: 'query', required: true, description: 'URL do vídeo TikTok', example: 'https://www.tiktok.com/@user/video/123' }
        ]
      },
      {
        name: 'Buscar Letras',
        method: 'GET',
        path: '/api/v1/media/lyrics',
        description: 'Busca letra de músicas.',
        params: [
          { name: 'song', type: 'query', required: true, description: 'Nome da música', example: 'Imagine' },
          { name: 'artist', type: 'query', required: false, description: 'Nome do artista', example: 'John Lennon' }
        ]
      },
      {
        name: 'Buscar Pinterest',
        method: 'GET',
        path: '/api/v1/media/pinterest',
        description: 'Busca imagens no Pinterest.',
        params: [
          { name: 'query', type: 'query', required: true, description: 'Termo de busca', example: 'minimalist design' }
        ]
      }
    ]
  },
  {
    category: 'Informações',
    routes: [
      {
        name: 'Buscar IMDB',
        method: 'GET',
        path: '/api/v1/info/imdb',
        description: 'Busca informações de filmes e séries no IMDB.',
        params: [
          { name: 'title', type: 'query', required: true, description: 'Título do filme ou série', example: 'Interstellar' }
        ]
      },
      {
        name: 'Game Steam',
        method: 'GET',
        path: '/api/v1/info/steam/:appId',
        description: 'Obtém informações de um jogo na Steam.',
        params: [
          { name: 'appId', type: 'path', required: true, description: 'ID do aplicativo na Steam', example: '730' }
        ]
      }
    ]
  },
  {
    category: 'IA',
    routes: [
      {
        name: 'Gerar Imagem',
        method: 'POST',
        path: '/api/v1/ai/imagine',
        description: 'Gera uma imagem a partir de uma descrição.',
        params: [
          { name: 'prompt', type: 'body', required: true, description: 'Descrição da imagem', example: 'a cat in space, photorealistic' }
        ]
      },
      {
        name: 'Chat IA',
        method: 'POST',
        path: '/api/v1/ai/chat',
        description: 'Conversa com uma IA.',
        params: [
          { name: 'message', type: 'body', required: true, description: 'Mensagem para a IA', example: 'What is the meaning of life?' }
        ]
      }
    ]
  }
];

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CodeIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const Documentation = () => {
  const { user } = useAuth();
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [paramValues, setParamValues] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    fetchApiKey();
  }, []);

  useEffect(() => {
    if (selectedEndpoint) {
      const defaults = {};
      selectedEndpoint.params.forEach(p => {
        defaults[p.name] = p.example || '';
      });
      setParamValues(defaults);
      setTestResult(null);
    }
  }, [selectedEndpoint]);

  const fetchApiKey = async () => {
    try {
      const res = await axios.get('/apikeys');
      const keys = res.data.apiKeys;
      if (!keys || keys.length === 0) return;

      const activeKey = keys.find(k => k.isActive) || keys[0];
      const reveal = await axios.get(`/apikeys/${activeKey.id}/reveal`);
      setApiKey(reveal.data.key);
    } catch {}
  };

  const handleParamChange = (name, value) => {
    setParamValues(prev => ({ ...prev, [name]: value }));
  };

  const validateRequired = () => {
    return selectedEndpoint.params
      .filter(p => p.required)
      .every(p => paramValues[p.name] && paramValues[p.name].trim() !== '');
  };

  const buildRequest = () => {
    let path = selectedEndpoint.path;
    const queryParams = {};
    const body = {};

    selectedEndpoint.params.forEach(p => {
      const val = paramValues[p.name];
      if (p.type === 'path') {
        path = path.replace(`:${p.name}`, encodeURIComponent(val || p.example || ''));
      } else if (p.type === 'body') {
        if (val) body[p.name] = val;
      } else {
        if (val) queryParams[p.name] = val;
      }
    });

    path = path.replace(/\/:?\w+\??$/, match => match.includes('?') ? '' : match);

    return { path, queryParams, body };
  };

  const runTest = async () => {
    if (!apiKey) {
      setTestResult({ error: 'No active API key found. Create one in the API Keys section before running tests.', success: false });
      return;
    }

    if (!validateRequired()) {
      setTestResult({ error: 'Fill in all required fields before running the test.', success: false });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const start = Date.now();

    try {
      const { path, queryParams, body } = buildRequest();

      const config = {
        method: selectedEndpoint.method.toLowerCase(),
        url: path,
        headers: { 'x-api-key': apiKey },
        params: queryParams
      };

      if (selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT') {
        config.data = body;
      }

      const response = await axios(config);
      const elapsed = Date.now() - start;

      setTestResult({
        success: true,
        statusCode: response.status,
        responseTime: elapsed,
        headers: {
          'content-type': response.headers['content-type'],
          'x-ratelimit-limit': response.headers['x-ratelimit-limit'],
          'x-ratelimit-remaining': response.headers['x-ratelimit-remaining']
        },
        data: response.data
      });
    } catch (error) {
      const elapsed = Date.now() - start;
      setTestResult({
        success: false,
        statusCode: error.response?.status || 0,
        responseTime: elapsed,
        headers: error.response?.headers || {},
        data: error.response?.data || { message: error.message }
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = code => {
    if (code >= 200 && code < 300) return 'var(--success, #22c55e)';
    if (code >= 400 && code < 500) return '#f59e0b';
    return 'var(--danger, #ef4444)';
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">API Documentation</h1>
        <p className="page-description">Interactive reference for all available endpoints</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start'}}>
        <div style={{position: 'sticky', top: '20px'}}>
          {ENDPOINTS.map((cat, idx) => (
            <div key={idx} style={{marginBottom: '24px'}}>
              <p style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                paddingLeft: '4px'
              }}>
                {cat.category}
              </p>
              {cat.routes.map((route, ridx) => (
                <button
                  key={ridx}
                  onClick={() => setSelectedEndpoint(route)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: selectedEndpoint === route ? 'var(--primary, #3b82f6)' : 'transparent',
                    color: selectedEndpoint === route ? '#fff' : 'var(--text-primary)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '2px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.15s'
                  }}
                >
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: selectedEndpoint === route ? '#fff' : METHOD_COLORS[route.method],
                    minWidth: '32px'
                  }}>
                    {route.method}
                  </span>
                  {route.name}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div>
          {selectedEndpoint ? (
            <div className="card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px'}}>
                <div>
                  <h2 style={{marginBottom: '8px', fontSize: '20px'}}>{selectedEndpoint.name}</h2>
                  <p style={{color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '10px'}}>{selectedEndpoint.description}</p>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '700',
                      background: METHOD_COLORS[selectedEndpoint.method] + '22',
                      color: METHOD_COLORS[selectedEndpoint.method],
                      border: `1px solid ${METHOD_COLORS[selectedEndpoint.method]}44`
                    }}>
                      {selectedEndpoint.method}
                    </span>
                    <code style={{fontSize: '13px', color: 'var(--text-secondary)'}}>{selectedEndpoint.path}</code>
                  </div>
                </div>
                <button
                  onClick={runTest}
                  disabled={testing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    background: testing ? 'var(--surface)' : 'var(--primary, #3b82f6)',
                    color: testing ? 'var(--text-secondary)' : '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: testing ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.15s'
                  }}
                >
                  <PlayIcon />
                  {testing ? 'Running...' : 'Run Test'}
                </button>
              </div>

              <div style={{marginBottom: '24px'}}>
                <h3 style={{fontSize: '15px', marginBottom: '14px', fontWeight: '600'}}>Parameters</h3>
                {selectedEndpoint.params.length === 0 ? (
                  <p style={{color: 'var(--text-secondary)', fontSize: '14px'}}>No parameters required.</p>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    {selectedEndpoint.params.map((param, idx) => (
                      <div key={idx} style={{
                        padding: '14px 16px',
                        background: 'var(--surface)',
                        borderRadius: '8px',
                        border: '1px solid var(--border, #e5e7eb)'
                      }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap'}}>
                          <code style={{fontWeight: '600', fontSize: '14px'}}>{param.name}</code>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 7px',
                            borderRadius: '3px',
                            background: param.required ? '#fef3c7' : '#f3f4f6',
                            color: param.required ? '#92400e' : '#6b7280',
                            fontWeight: '600'
                          }}>
                            {param.required ? 'required' : 'optional'}
                          </span>
                          <span style={{fontSize: '11px', color: 'var(--text-secondary)', padding: '2px 7px', background: 'var(--background)', borderRadius: '3px'}}>
                            {param.type}
                          </span>
                        </div>
                        <p style={{fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px'}}>{param.description}</p>
                        <input
                          type="text"
                          value={paramValues[param.name] ?? param.example ?? ''}
                          onChange={e => handleParamChange(param.name, e.target.value)}
                          placeholder={param.example || param.name}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: 'var(--background)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border, #e5e7eb)',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {testResult && (
                <div style={{marginBottom: '24px'}}>
                  <h3 style={{fontSize: '15px', marginBottom: '14px', fontWeight: '600'}}>Response</h3>
                  <div style={{
                    borderRadius: '8px',
                    border: `1px solid ${testResult.error ? '#ef4444' : getStatusColor(testResult.statusCode)}44`,
                    overflow: 'hidden'
                  }}>
                    {testResult.error ? (
                      <div style={{padding: '14px 16px', background: '#fef2f2', color: '#dc2626', fontSize: '14px'}}>
                        {testResult.error}
                      </div>
                    ) : (
                      <>
                        <div style={{
                          display: 'flex',
                          gap: '20px',
                          padding: '12px 16px',
                          background: 'var(--surface)',
                          borderBottom: '1px solid var(--border, #e5e7eb)',
                          flexWrap: 'wrap',
                          alignItems: 'center'
                        }}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                            <span style={{fontSize: '12px', color: 'var(--text-secondary)'}}>Status</span>
                            <span style={{
                              padding: '2px 10px',
                              borderRadius: '4px',
                              fontSize: '13px',
                              fontWeight: '700',
                              background: getStatusColor(testResult.statusCode) + '22',
                              color: getStatusColor(testResult.statusCode)
                            }}>
                              {testResult.statusCode}
                            </span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                            <ClockIcon />
                            <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>{testResult.responseTime}ms</span>
                          </div>
                          {testResult.headers?.['content-type'] && (
                            <div style={{fontSize: '12px', color: 'var(--text-secondary)'}}>
                              {testResult.headers['content-type'].split(';')[0]}
                            </div>
                          )}
                        </div>
                        <div style={{padding: '12px 16px', background: 'var(--background)'}}>
                          <pre style={{
                            margin: 0,
                            fontSize: '13px',
                            lineHeight: '1.6',
                            overflowX: 'auto',
                            maxHeight: '500px',
                            color: 'var(--text-primary)',
                            fontFamily: 'monospace'
                          }}>
                            {JSON.stringify(testResult.data, null, 2)}
                          </pre>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div style={{
                padding: '14px 16px',
                background: 'var(--surface)',
                borderRadius: '8px',
                border: '1px solid var(--border, #e5e7eb)'
              }}>
                <h4 style={{fontSize: '14px', fontWeight: '600', marginBottom: '8px'}}>Authentication</h4>
                <p style={{fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px'}}>
                  All routes require an API key in the request header:
                </p>
                <code style={{
                  display: 'block',
                  padding: '8px 12px',
                  background: 'var(--background)',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  x-api-key: your_api_key_here
                </code>
                <p style={{fontSize: '13px', color: 'var(--text-secondary)', marginTop: '10px'}}>
                  Tests run using your active API key and count toward your daily limit.
                </p>
              </div>
            </div>
          ) : (
            <div className="card" style={{textAlign: 'center', padding: '80px 20px'}}>
              <div style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
                <CodeIcon />
              </div>
              <h3 style={{marginBottom: '8px', fontSize: '18px'}}>Select an endpoint</h3>
              <p style={{color: 'var(--text-secondary)', fontSize: '14px'}}>
                Choose an endpoint from the sidebar to view documentation and run tests.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Documentation;

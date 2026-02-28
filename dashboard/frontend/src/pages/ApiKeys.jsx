import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { FiKey, FiPlus, FiTrash2, FiCopy } from 'react-icons/fi';

const ApiKeys = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await axios.get('/apikeys');
      setApiKeys(response.data.apiKeys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const createApiKey = async () => {
    setLoading(true);
    try {
      await axios.post('/apikeys', { name: newKeyName, customKey });
      fetchApiKeys();
      setShowModal(false);
      setNewKeyName('');
      setCustomKey('');
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao criar API key');
    } finally {
      setLoading(false);
    }
  };

  const deleteApiKey = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta API key?')) {
      try {
        await axios.delete(`/apikeys/${id}`);
        fetchApiKeys();
      } catch (error) {
        alert('Erro ao excluir API key');
      }
    }
  };

  const copyToClipboard = (key, id) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  return (
    <Layout>
      <div className="page-header">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1 className="page-title">API Keys</h1>
            <p className="page-description">Gerencie suas chaves de autenticação da API</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <FiPlus /> Nova API Key
          </button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Chave</th>
              <th>Requisições</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map(key => (
              <tr key={key.id}>
                <td>{key.name}</td>
                <td style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <code>{key.key}</code>
                  <button 
                    onClick={() => copyToClipboard(key.key, key.id)} 
                    className="btn-icon"
                    title="Copiar"
                    style={{
                      background: copiedKey === key.id ? 'var(--success)' : 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <FiCopy size={14} color={copiedKey === key.id ? '#fff' : 'var(--text-secondary)'} />
                  </button>
                </td>
                <td>{key.requestCount}</td>
                <td>
                  <span className={`badge ${key.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {key.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td>
                  <button onClick={() => deleteApiKey(key.id)} className="btn btn-danger">
                    <FiTrash2 /> Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Criar Nova API Key</h3>
              <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer'}}>✕</button>
            </div>
            <div className="form-group">
              <label>Nome</label>
              <input
                className="input"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Minha API Key"
              />
            </div>
            <div className="form-group">
              <label>Chave Personalizada (Opcional - Pro+ apenas)</label>
              <input
                className="input"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="gld_sua_chave_personalizada"
              />
            </div>
            <button onClick={createApiKey} className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
              {loading ? 'Criando...' : 'Criar API Key'}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ApiKeys;

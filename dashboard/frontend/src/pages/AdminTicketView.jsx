import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useNotification } from '../contexts/NotificationContext';
import { FiArrowLeft, FiSend } from 'react-icons/fi';

const AdminTicketView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await axios.get(`/admin/tickets/${id}`);
      setTicket(response.data.ticket);
    } catch (err) {
      showError(err.response?.data?.message || 'Erro ao buscar ticket');
      navigate('/dashboard/admin');
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      await axios.post(`/admin/tickets/${id}/reply`, { message });
      success('Resposta enviada com sucesso');
      setMessage('');
      fetchTicket();
    } catch (err) {
      showError(err.response?.data?.message || 'Erro ao enviar resposta');
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await axios.patch(`/admin/tickets/${id}/status`, { status: newStatus });
      success('Status atualizado com sucesso');
      fetchTicket();
    } catch (err) {
      showError(err.response?.data?.message || 'Erro ao atualizar status');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>
      </Layout>
    );
  }

  if (!ticket) return null;

  return (
    <Layout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button onClick={() => navigate('/dashboard/admin')} className="btn btn-secondary" style={{ marginBottom: '16px' }}>
            <FiArrowLeft /> Voltar
          </button>
          <h1 className="page-title">Ticket #{ticket._id.slice(-6)}</h1>
          <p className="page-description">{ticket.subject}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ticket.status !== 'closed' && (
            <>
              <button onClick={() => updateStatus('in_progress')} className="btn btn-secondary" disabled={ticket.status === 'in_progress'}>
                Em Andamento
              </button>
              <button onClick={() => updateStatus('closed')} className="btn btn-danger">
                Fechar Ticket
              </button>
            </>
          )}
          {ticket.status === 'closed' && (
            <button onClick={() => updateStatus('open')} className="btn btn-primary">
              Reabrir
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Usuário</div>
            <div style={{ fontWeight: '600' }}>{ticket.userId?.name}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{ticket.userId?.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Plano</div>
            <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{ticket.userId?.plan}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</div>
            <span className={`badge badge-${ticket.status === 'closed' ? 'secondary' : ticket.status === 'in_progress' ? 'warning' : 'primary'}`}>
              {ticket.status === 'open' ? 'Aberto' : ticket.status === 'in_progress' ? 'Em Andamento' : 'Fechado'}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Criado em</div>
            <div style={{ fontWeight: '600' }}>{new Date(ticket.createdAt).toLocaleString('pt-BR')}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px' }}>Mensagens</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {ticket.messages.map((msg, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: msg.sender === 'admin' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-tertiary)',
                border: `1px solid ${msg.sender === 'admin' ? 'var(--green)' : 'var(--border)'}`,
                alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                maxWidth: '80%'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '14px', color: msg.sender === 'admin' ? 'var(--green)' : 'var(--text-primary)' }}>
                  {msg.sender === 'admin' ? 'Admin' : ticket.userId?.name}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {new Date(msg.timestamp).toLocaleString('pt-BR')}
                </span>
              </div>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</p>
            </div>
          ))}
        </div>
      </div>

      {ticket.status !== 'closed' && (
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Responder</h3>
          <form onSubmit={sendReply}>
            <textarea
              className="input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua resposta..."
              rows="4"
              style={{ resize: 'vertical', marginBottom: '12px' }}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={sending || !message.trim()}>
              <FiSend /> {sending ? 'Enviando...' : 'Enviar Resposta'}
            </button>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default AdminTicketView;

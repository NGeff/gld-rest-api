import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { FiPlus, FiMessageSquare, FiSend } from 'react-icons/fi';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const faq = [
    {
      question: 'Como posso obter uma API key?',
      answer: 'Vá para a página de API Keys e clique em "Nova API Key". Sua chave será gerada automaticamente.'
    },
    {
      question: 'Como funciona a cobrança?',
      answer: 'Cobramos por requisição. Cada plano tem um limite de requisições gratuitas, após isso cobra-se R$ 0,01 por requisição adicional.'
    },
    {
      question: 'Posso mudar de plano a qualquer momento?',
      answer: 'Sim, você pode fazer upgrade do seu plano a qualquer momento. O novo plano entra em vigor imediatamente.'
    },
    {
      question: 'Como faço para cancelar minha conta?',
      answer: 'Entre em contato com o suporte através de um ticket e solicitaremos o cancelamento da sua conta.'
    }
  ];

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/support/tickets');
      setTickets(response.data.tickets);
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
    }
  };

  const createTicket = async () => {
    if (!newTicketSubject || !newTicketMessage) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/support/tickets', {
        subject: newTicketSubject,
        message: newTicketMessage
      });
      fetchTickets();
      setShowNewTicket(false);
      setNewTicketSubject('');
      setNewTicketMessage('');
      alert('Ticket criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar ticket');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await axios.post(`/support/tickets/${selectedTicket._id}/messages`, {
        message: newMessage
      });
      const response = await axios.get(`/support/tickets/${selectedTicket._id}`);
      setSelectedTicket(response.data.ticket);
      setNewMessage('');
    } catch (error) {
      alert('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const viewTicket = async (ticketId) => {
    try {
      const response = await axios.get(`/support/tickets/${ticketId}`);
      setSelectedTicket(response.data.ticket);
    } catch (error) {
      console.error('Erro ao buscar ticket:', error);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Suporte</h1>
        <p className="page-description">Central de ajuda e suporte técnico</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 2fr' : '1fr', gap: '20px'}}>
        <div>
          <div className="card" style={{marginBottom: '20px'}}>
            <h3 style={{marginBottom: '16px'}}>FAQ - Perguntas Frequentes</h3>
            {faq.map((item, index) => (
              <details key={index} style={{marginBottom: '12px'}}>
                <summary style={{cursor: 'pointer', fontWeight: '500', marginBottom: '8px'}}>
                  {item.question}
                </summary>
                <p style={{color: 'var(--text-secondary)', paddingLeft: '16px'}}>
                  {item.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3>Meus Tickets</h3>
              <button onClick={() => setShowNewTicket(true)} className="btn btn-primary">
                <FiPlus /> Novo Ticket
              </button>
            </div>

            {tickets.length === 0 ? (
              <p style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '20px'}}>
                Nenhum ticket ainda. Crie um para começar!
              </p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {tickets.map(ticket => (
                  <div 
                    key={ticket._id} 
                    onClick={() => viewTicket(ticket._id)}
                    style={{
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedTicket?._id === ticket._id ? 'var(--surface)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                      <strong>{ticket.subject}</strong>
                      <span className={`badge badge-${ticket.status === 'closed' ? 'secondary' : ticket.status === 'in_progress' ? 'warning' : 'primary'}`}>
                        {ticket.status === 'open' ? 'Aberto' : ticket.status === 'in_progress' ? 'Em Andamento' : 'Fechado'}
                      </span>
                    </div>
                    <p style={{fontSize: '12px', color: 'var(--text-secondary)'}}>
                      {new Date(ticket.updatedAt).toLocaleDateString()} - {ticket.messages.length} mensagens
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedTicket && (
          <div className="card">
            <div style={{borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px'}}>
              <h3>{selectedTicket.subject}</h3>
              <span className={`badge badge-${selectedTicket.status === 'closed' ? 'secondary' : selectedTicket.status === 'in_progress' ? 'warning' : 'primary'}`}>
                {selectedTicket.status === 'open' ? 'Aberto' : selectedTicket.status === 'in_progress' ? 'Em Andamento' : 'Fechado'}
              </span>
            </div>

            <div style={{maxHeight: '400px', overflowY: 'auto', marginBottom: '16px'}}>
              {selectedTicket.messages.map((msg, index) => (
                <div 
                  key={index}
                  style={{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: msg.sender === 'admin' ? 'var(--surface)' : 'transparent',
                    borderLeft: msg.sender === 'admin' ? '3px solid var(--primary)' : '3px solid var(--border)',
                    borderRadius: '4px'
                  }}
                >
                  <div style={{fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px'}}>
                    {msg.sender === 'admin' ? 'Suporte' : 'Você'} • {new Date(msg.createdAt).toLocaleString()}
                  </div>
                  <p>{msg.content}</p>
                </div>
              ))}
            </div>

            {selectedTicket.status !== 'closed' && (
              <div style={{display: 'flex', gap: '8px'}}>
                <input
                  className="input"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage} className="btn btn-primary" disabled={loading}>
                  <FiSend />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showNewTicket && (
        <div className="modal-overlay" onClick={() => setShowNewTicket(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Novo Ticket de Suporte</h3>
              <button onClick={() => setShowNewTicket(false)} style={{background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer'}}>✕</button>
            </div>
            <div className="form-group">
              <label>Assunto</label>
              <input
                className="input"
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                placeholder="Descreva o problema resumidamente"
              />
            </div>
            <div className="form-group">
              <label>Mensagem</label>
              <textarea
                className="input"
                value={newTicketMessage}
                onChange={(e) => setNewTicketMessage(e.target.value)}
                placeholder="Descreva seu problema detalhadamente"
                rows="5"
              />
            </div>
            <button onClick={createTicket} className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Ticket'}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Support;

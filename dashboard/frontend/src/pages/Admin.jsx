import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useNotification } from '../contexts/NotificationContext';
import { FiUsers, FiDollarSign, FiActivity, FiMessageSquare } from 'react-icons/fi';

const Admin = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'payments') fetchPayments();
    if (activeTab === 'tickets') fetchTickets();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/admin/payments');
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/admin/tickets');
      setTickets(response.data.tickets);
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
    }
  };

  const updateUserPlan = async (userId, plan) => {
    try {
      await axios.patch(`/admin/users/${userId}/plan`, { plan });
      success('Plano atualizado com sucesso');
      fetchUsers();
    } catch (error) {
      showError(error.response?.data?.message || 'Erro ao atualizar plano');
    }
  };

  const suspendUser = async (userId, suspend) => {
    try {
      await axios.patch(`/admin/users/${userId}/suspend`, { suspend });
      success(suspend ? 'Usuário suspenso' : 'Suspensão removida');
      fetchUsers();
    } catch (error) {
      showError(error.response?.data?.message || 'Erro ao atualizar status');
    }
  };

  if (loading) {
    return <Layout><div style={{padding: '40px', textAlign: 'center'}}>Carregando...</div></Layout>;
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Painel Administrativo</h1>
        <p className="page-description">Gerencie usuários, pagamentos e suporte</p>
      </div>

      <div style={{display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap'}}>
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FiActivity /> Visão Geral
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FiUsers /> Usuários
        </button>
        <button 
          onClick={() => setActiveTab('payments')} 
          className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FiDollarSign /> Pagamentos
        </button>
        <button 
          onClick={() => setActiveTab('tickets')} 
          className={`btn ${activeTab === 'tickets' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FiMessageSquare /> Suporte
        </button>
      </div>

      {activeTab === 'overview' && stats && (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
          <div className="card">
            <h3>Total de Usuários</h3>
            <p style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--primary)'}}>{stats.users.total}</p>
            <div style={{fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px'}}>
              <div>Free: {stats.users.free}</div>
              <div>Basic: {stats.users.basic}</div>
              <div>Pro: {stats.users.pro}</div>
              <div>Enterprise: {stats.users.enterprise}</div>
            </div>
          </div>
          <div className="card">
            <h3>Total de Requisições</h3>
            <p style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--primary)'}}>{stats.requests.toLocaleString()}</p>
          </div>
          <div className="card">
            <h3>Receita Total</h3>
            <p style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--success)'}}>R$ {stats.revenue.toFixed(2)}</p>
          </div>
          <div className="card">
            <h3>Tickets Abertos</h3>
            <p style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--warning)'}}>{stats.openTickets}</p>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <h2 style={{marginBottom: '16px'}}>Usuários</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Plano</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select 
                        value={user.plan} 
                        onChange={(e) => updateUserPlan(user._id, e.target.value)}
                        className="input"
                        style={{width: 'auto'}}
                        disabled={user.role === 'admin'}
                      >
                        <option value="free">Free</option>
                        <option value="basic">Basic</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${user.isSuspended ? 'badge-danger' : 'badge-success'}`}>
                        {user.isSuspended ? 'Suspenso' : 'Ativo'}
                      </span>
                    </td>
                    <td>
                      {user.role !== 'admin' && (
                        <button 
                          onClick={() => suspendUser(user._id, !user.isSuspended)}
                          className={`btn ${user.isSuspended ? 'btn-success' : 'btn-danger'}`}
                        >
                          {user.isSuspended ? 'Reativar' : 'Suspender'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="card">
          <h2 style={{marginBottom: '16px'}}>Pagamentos</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Plano</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment._id}>
                    <td>{payment.userId?.name || 'N/A'}</td>
                    <td>{payment.plan}</td>
                    <td>R$ {payment.amount.toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-${payment.status === 'approved' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'}`}>
                        {payment.status === 'approved' ? 'Aprovado' : payment.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </span>
                    </td>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="card">
          <h2 style={{marginBottom: '16px'}}>Tickets de Suporte</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Assunto</th>
                  <th>Status</th>
                  <th>Última Atualização</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket._id}>
                    <td>{ticket.userId?.name || 'N/A'}</td>
                    <td>{ticket.subject}</td>
                    <td>
                      <span className={`badge badge-${ticket.status === 'closed' ? 'secondary' : ticket.status === 'in_progress' ? 'warning' : 'primary'}`}>
                        {ticket.status === 'open' ? 'Aberto' : ticket.status === 'in_progress' ? 'Em Andamento' : 'Fechado'}
                      </span>
                    </td>
                    <td>{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => navigate(`/dashboard/admin/ticket/${ticket._id}`)}>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Admin;

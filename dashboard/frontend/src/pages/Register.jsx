import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/register', { name, email, password });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
        <div className="card" style={{maxWidth: '400px', width: '100%'}}>
          <h2 style={{marginBottom: '24px', textAlign: 'center'}}>Criar Conta</h2>
          
          {error && <div className="alert alert-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>
          
          <p style={{textAlign: 'center', marginTop: '24px', fontSize: '14px'}}>
            Já tem uma conta? <Link to="/login" style={{color: 'var(--green)'}}>Entre</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
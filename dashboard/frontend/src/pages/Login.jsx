import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const Login = () => {
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
      const response = await axios.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
        <div className="card" style={{maxWidth: '400px', width: '100%'}}>
          <h2 style={{marginBottom: '24px', textAlign: 'center'}}>Entrar</h2>
          
          {error && <div className="alert alert-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
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
              />
            </div>
            
            <div style={{textAlign: 'right', marginBottom: '16px'}}>
              <Link to="/forgot-password" style={{fontSize: '14px', color: 'var(--green)'}}>
                Esqueceu a senha?
              </Link>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          
          <p style={{textAlign: 'center', marginTop: '24px', fontSize: '14px'}}>
            Não tem uma conta? <Link to="/register" style={{color: 'var(--green)'}}>Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
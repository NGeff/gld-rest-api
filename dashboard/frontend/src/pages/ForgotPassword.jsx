import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
        <div className="card" style={{maxWidth: '400px', width: '100%'}}>
          <h2 style={{marginBottom: '24px', textAlign: 'center'}}>Recuperar Senha</h2>
          
          {sent ? (
            <div className="alert alert-success">
              Email de recuperação enviado! Verifique sua caixa de entrada.
            </div>
          ) : (
            <>
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
                <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </button>
              </form>
            </>
          )}
          
          <p style={{textAlign: 'center', marginTop: '24px', fontSize: '14px'}}>
            <Link to="/login" style={{color: 'var(--green)'}}>Voltar para o login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

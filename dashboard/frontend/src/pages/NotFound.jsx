import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ margin: '0 auto 32px' }}
        >
          <circle cx="100" cy="100" r="80" stroke="var(--border)" strokeWidth="4" />
          <path
            d="M70 85 L70 115 M70 85 L85 85 M70 115 L85 115"
            stroke="var(--green)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M115 85 L115 115 M115 85 L130 85 M115 115 L130 115"
            stroke="var(--green)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="15" fill="var(--red)" />
        </svg>

        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          marginBottom: '16px',
          color: 'var(--text-primary)'
        }}>
          404
        </h1>

        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '12px',
          color: 'var(--text-primary)'
        }}>
          Página não encontrada
        </h2>

        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          A página que você está procurando não existe ou foi movida.
        </p>

        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
            className="btn btn-primary"
            style={{ minWidth: '140px' }}
          >
            {isAuthenticated ? 'Ir para Dashboard' : 'Voltar ao Início'}
          </button>

          {!isAuthenticated && (
            <button
              onClick={() => navigate('/login')}
              className="btn btn-secondary"
              style={{ minWidth: '140px' }}
            >
              Fazer Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;

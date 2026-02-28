import React, { createContext, useState, useContext } from 'react';
import { FiX, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const success = (message) => addNotification(message, 'success');
  const error = (message) => addNotification(message, 'error');
  const warning = (message) => addNotification(message, 'warning');
  const info = (message) => addNotification(message, 'info');

  return (
    <NotificationContext.Provider value={{ success, error, warning, info }}>
      {children}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: 'calc(100vw - 40px)'
      }}>
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            {...notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

const Notification = ({ message, type, onClose }) => {
  const icons = {
    success: <FiCheck size={20} />,
    error: <FiAlertCircle size={20} />,
    warning: <FiAlertCircle size={20} />,
    info: <FiInfo size={20} />
  };

  const colors = {
    success: {
      bg: 'rgba(34, 197, 94, 0.1)',
      border: 'var(--green)',
      color: 'var(--green)'
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'var(--red)',
      color: 'var(--red)'
    },
    warning: {
      bg: 'rgba(251, 191, 36, 0.1)',
      border: '#fbbf24',
      color: '#fbbf24'
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.1)',
      border: '#3b82f6',
      color: '#3b82f6'
    }
  };

  const style = colors[type] || colors.info;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      backgroundColor: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: '8px',
      color: style.color,
      minWidth: '300px',
      maxWidth: '500px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      animation: 'slideIn 0.3s ease-out'
    }}>
      {icons[type]}
      <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: style.color,
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <FiX size={18} />
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

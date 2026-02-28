import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiKey, FiBook, FiCreditCard, FiSettings, FiMessageSquare, FiShield } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  const links = [
    { to: '/dashboard', icon: <FiHome />, label: 'Visão Geral' },
    { to: '/dashboard/api-keys', icon: <FiKey />, label: 'API Keys' },
    { to: '/dashboard/docs', icon: <FiBook />, label: 'Documentação' },
    { to: '/dashboard/billing', icon: <FiCreditCard />, label: 'Pagamentos' },
    { to: '/dashboard/support', icon: <FiMessageSquare />, label: 'Suporte' },
    { to: '/dashboard/settings', icon: <FiSettings />, label: 'Configurações' }
  ];

  if (user?.role === 'admin') {
    links.splice(5, 0, { to: '/dashboard/admin', icon: <FiShield />, label: 'Admin' });
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
            display: 'none'
          }}
          className="sidebar-overlay"
        />
      )}
      <div className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`sidebar-link ${location.pathname === link.to || location.pathname.startsWith(link.to + '/') ? 'active' : ''}`}
          >
            {link.icon} {link.label}
          </Link>
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .sidebar-overlay {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
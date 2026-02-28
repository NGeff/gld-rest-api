import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && onMenuClick && (
            <button className="mobile-menu-btn" onClick={onMenuClick}>
              <FiMenu />
            </button>
          )}
          <Link to="/" className="navbar-logo">GLD REST API</Link>
        </div>
        <div className="navbar-links">
          {user ? (
            <>
              <span className="navbar-link"><FiUser /> {user.name}</span>
              <button onClick={logout} className="btn btn-secondary"><FiLogOut /> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
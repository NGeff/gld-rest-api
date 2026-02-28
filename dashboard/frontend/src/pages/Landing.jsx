import React from 'react';
import { Link } from 'react-router-dom';
import { FiZap, FiShield, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import Navbar from '../components/Navbar';

const Landing = () => {
  return (
    <div>
      <Navbar />
      <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center'}}>
        <div style={{maxWidth: '800px'}}>
          <h1 style={{fontSize: '48px', fontWeight: 'bold', marginBottom: '20px'}}>
            Multifunctional REST API Platform
          </h1>
          <p style={{fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '40px'}}>
            Access powerful APIs for translation, media download, data lookup and more
          </p>
          <div style={{display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '60px'}}>
            <Link to="/register" className="btn btn-primary" style={{fontSize: '16px', padding: '12px 32px'}}>
              Get Started Free
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{fontSize: '16px', padding: '12px 32px'}}>
              Sign In
            </Link>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginTop: '60px'}}>
            <div className="card" style={{textAlign: 'left'}}>
              <FiZap size={32} color="var(--green)" style={{marginBottom: '16px'}} />
              <h3 style={{marginBottom: '8px'}}>Fast & Reliable</h3>
              <p style={{color: 'var(--text-secondary)', fontSize: '14px'}}>
                High-performance APIs with 99.9% uptime guarantee
              </p>
            </div>
            <div className="card" style={{textAlign: 'left'}}>
              <FiShield size={32} color="var(--green)" style={{marginBottom: '16px'}} />
              <h3 style={{marginBottom: '8px'}}>Secure</h3>
              <p style={{color: 'var(--text-secondary)', fontSize: '14px'}}>
                Enterprise-grade security with encrypted API keys
              </p>
            </div>
            <div className="card" style={{textAlign: 'left'}}>
              <FiTrendingUp size={32} color="var(--green)" style={{marginBottom: '16px'}} />
              <h3 style={{marginBottom: '8px'}}>Scalable</h3>
              <p style={{color: 'var(--text-secondary)', fontSize: '14px'}}>
                Flexible plans that grow with your needs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
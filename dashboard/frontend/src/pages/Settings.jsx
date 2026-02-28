import React, { useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const updateEmail = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/auth/email', { email });
      setMessage('Email updated successfully. Please verify your new email.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating email');
      setMessage('');
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/auth/password', { currentPassword, newPassword });
      setMessage('Password updated successfully');
      setError('');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating password');
      setMessage('');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">Manage your account settings</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div style={{maxWidth: '600px'}}>
        <div className="card">
          <h3 style={{marginBottom: '20px'}}>Update Email</h3>
          <form onSubmit={updateEmail}>
            <div className="form-group">
              <label>New Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Update Email</button>
          </form>
        </div>

        <div className="card">
          <h3 style={{marginBottom: '20px'}}>Change Password</h3>
          <form onSubmit={updatePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                className="input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary">Change Password</button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;

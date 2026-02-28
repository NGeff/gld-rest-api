import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      await axios.get(`/auth/verify/${token}`);
      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
      <div className="card" style={{maxWidth: '400px', textAlign: 'center'}}>
        {status === 'verifying' && <p>Verifying email...</p>}
        {status === 'success' && (
          <>
            <h2 style={{color: 'var(--green)', marginBottom: '16px'}}>Email Verified!</h2>
            <p>Your email has been successfully verified.</p>
            <Link to="/dashboard" className="btn btn-primary" style={{marginTop: '20px'}}>
              Go to Dashboard
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 style={{color: 'var(--red)', marginBottom: '16px'}}>Verification Failed</h2>
            <p>Invalid or expired token.</p>
            <Link to="/login" className="btn btn-secondary" style={{marginTop: '20px'}}>
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

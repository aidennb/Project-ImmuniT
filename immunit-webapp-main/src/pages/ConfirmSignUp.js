import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/Auth.css';

function ConfirmSignUp() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.confirmSignUp(email, code);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Confirm Email</h1>
        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            Email confirmed! Redirecting to login...
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <p style={{ marginBottom: '20px', color: '#666', textAlign: 'center' }}>
            We've sent a confirmation code to {email}
          </p>
          <div className="form-group">
            <label>Confirmation Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Confirming...' : 'Confirm'}
          </button>
        </form>
        <p>
          <Link to="/signup">Back to sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default ConfirmSignUp;

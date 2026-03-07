import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { updatePassword } from 'firebase/auth';
import './StaffResetPassword.css';

const StaffResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handlePasswordReset = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!auth.currentUser) {
      setError('No user is currently signed in. Please log in again.');
      return;
    }

    try {
      await updatePassword(auth.currentUser, password);
      setSuccess(true);
      setTimeout(() => navigate('/staff/login'), 3000);
    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h1 className="reset-password-title">Reset Password</h1>
        {error && <p className="error-message">{error}</p>}
        {success ? (
          <p className="success-message">Password reset successfully! Redirecting to login...</p>
        ) : (
          <form
            className="reset-password-form"
            onSubmit={(e) => {
              e.preventDefault();
              handlePasswordReset();
            }}
          >
            <div className="form-group">
              <label htmlFor="password" className="form-label">New Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="form-button">Reset Password</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StaffResetPassword;

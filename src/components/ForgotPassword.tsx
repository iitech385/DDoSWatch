import React from 'react';
import './ForgotPassword.css';
import { Link } from 'react-router-dom'; // Use Link for navigation
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
  // Prevent form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default form submission behavior
    console.log('Send Reset Link button clicked'); // Placeholder for future functionality
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <h1 className="forgot-password-title">Forgot Password</h1>
        <p className="forgot-password-subtitle">
          Enter your email address and we’ll send you a link to reset your password.
        </p>
        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            className="forgot-password-input"
            required
          />
          <button type="submit" className="forgot-password-btn">
            Send Reset Link
          </button>
        </form>
        <div className="forgot-password-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="login-link">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

interface VerifyEmailProps {
  email: string;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ email }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/verify-email/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/login', { 
          state: { 
            message: 'Email verified successfully! Please log in.' 
          }
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Verification failed');
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/resend-verification/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email: email,
          type: 'signup'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setError('New verification code sent!');
        setCountdown(60); // Start 60 second countdown
        setTimeout(() => setError(''), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-title">Verify Your Email</h1>
        <p className="signup-subtitle">Please enter the verification code sent to {email}</p>
        {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter verification code"
            className="signup-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            required
          />
          <button type="submit" className="signup-btn">Verify Email</button>
        </form>
        <div className="signup-footer">
          <div style={{ color: 'white', marginBottom: '10px', position: 'relative', textAlign: 'center' }}>
            Didn't receive the code?{' '}
            <button 
              onClick={handleResend}
              disabled={isResending || countdown > 0}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'violet',
                cursor: countdown > 0 ? 'default' : 'pointer',
                textDecoration: 'underline',
                fontSize: '1rem',
                fontWeight: 'bold',
                opacity: (isResending || countdown > 0) ? 0.7 : 1
              }}
            >
              {isResending ? 'Sending...' : 
               countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
            </button>
          </div>
          <button 
            onClick={() => {
              document.body.style.backgroundColor = '#000';
              document.body.style.animation = 'fadeOut 0.3s ease';
              setTimeout(() => {
                navigate('/signup');
                window.location.reload();
              }, 280);
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'violet',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '1rem',
              fontWeight: 'bold',
              marginTop: '-15px',
              display: 'block',
              position: 'relative',
              top: '-15px',
              width: '100%',
              textAlign: 'center'
            }}
          >
            Incorrect email?
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 
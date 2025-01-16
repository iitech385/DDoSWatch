import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../styles/loginpage.css';

const Login: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser();
  const location = useLocation();
  const message = location.state?.message;
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationError, setVerificationError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const trimmedEmailOrUsername = emailOrUsername.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmailOrUsername || !trimmedPassword) {
      setError('Email/username and password are required');
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        email: trimmedEmailOrUsername,
        username: trimmedEmailOrUsername,
        password: trimmedPassword
      };
      
      console.log('Login payload:', { ...payload, password: '***' });
      
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Server error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        if (data.requiresVerification) {
          setVerificationEmail(data.email);
          setShowVerification(true);
        } else {
          setUser(data.username);
          const savedPicture = localStorage.getItem('profilePicture');
          if (savedPicture) {
            setProfilePicture(savedPicture);
          } else if (data.profile_picture) {
            setProfilePicture(data.profile_picture);
            localStorage.setItem('profilePicture', data.profile_picture);
          }
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 100);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (event: React.FormEvent) => {
    event.preventDefault();
    setVerificationError('');
    setIsVerifying(true);

    try {
      const response = await fetch('http://localhost:8000/api/verify-login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: JSON.stringify({
          email: verificationEmail,
          code: verificationCode
        }),
      });

      const data = await response.json();
      console.log('Verification response:', data);

      if (data.success) {
        setUser(data.username);
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        setVerificationError(data.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationError('Network error occurred');
    } finally {
      setIsVerifying(false);
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
          email: verificationEmail,
          type: 'login'
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

  function getCookie(name: string): string {
    let cookieValue = '';
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    const firstTwo = username.slice(0, 2);
    const lastTwo = username.slice(-2);
    const maskedPart = '*'.repeat(username.length - 4);
    return `${firstTwo}${maskedPart}${lastTwo}@${domain}`;
  };

  if (showVerification) {
    return (
      <div className="signup-page">
        <div className="signup-container">
          <h1 className="signup-title">Verify Your Login</h1>
          <p className="signup-subtitle">Please enter the verification code sent to {maskEmail(verificationEmail)}</p>
          {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <form className="signup-form" onSubmit={handleVerification}>
            <input
              type="text"
              placeholder="Enter verification code"
              className="signup-input"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              required
            />
            <button 
              type="submit" 
              className="signup-btn"
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </button>
          </form>
          <div className="signup-footer">
            <p style={{ color: 'white' }}>
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
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Log in to your account</p>
        {message && <p className="success-message" style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
        {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email or Username"
            className="login-input"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="signup-link">
              Sign Up
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

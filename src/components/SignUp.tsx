import React, { useState, useEffect } from 'react';
import './SignUp.css';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import VerifyEmail from './VerifyEmail';
import toast from 'react-hot-toast';

interface PasswordRequirement {
  met: boolean;
  text: string;
}

interface PasswordRequirements {
  length: PasswordRequirement;
  uppercase: PasswordRequirement;
  lowercase: PasswordRequirement;
  number: PasswordRequirement;
  special: PasswordRequirement;
}

const SignUp: React.FC = () => {
  const { setUser } = useUser();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    length: { met: false, text: 'At least 8 characters long' },
    uppercase: { met: false, text: 'Contains uppercase letter' },
    lowercase: { met: false, text: 'Contains lowercase letter' },
    number: { met: false, text: 'Contains number' },
    special: { met: false, text: 'Contains special character' },
  });
  const [showRequirements, setShowRequirements] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/csrf/', {
      credentials: 'include',
    });
  }, []);

  const validateForm = () => {
    const errors = {
      username: '',
      email: '',
      password: '',
    };
    let isValid = true;

    // Username validation
    if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
      isValid = false;
    }
    if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
      isValid = false;
    }
    if (!/[a-z]/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter';
      isValid = false;
    }
    if (!/\d/.test(password)) {
      errors.password = 'Password must contain at least one number';
      isValid = false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.password = 'Password must contain at least one special character';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    
    // Password validation
    const hasUnmetRequirements = 
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (hasUnmetRequirements) {
      setShowRequirements(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setVerificationEmail(email);
        setShowVerification(true);
      } else {
        toast.error(data.message || 'Signup failed');
        setError(data.message);
        return;
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getCookie = (name: string): string => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Just update requirements status without showing them
    setPasswordRequirements({
      length: { 
        met: newPassword.length >= 8,
        text: 'At least 8 characters long'
      },
      uppercase: {
        met: /[A-Z]/.test(newPassword),
        text: 'Contains uppercase letter'
      },
      lowercase: {
        met: /[a-z]/.test(newPassword),
        text: 'Contains lowercase letter'
      },
      number: {
        met: /\d/.test(newPassword),
        text: 'Contains number'
      },
      special: {
        met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
        text: 'Contains special character'
      }
    });
  };

  const handleBackToSignup = () => {
    setShowVerification(false);
    setVerificationEmail('');
    setError('');
  };

  if (showVerification) {
    return <VerifyEmail email={verificationEmail} />;
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-title">Create Account</h1>
        <p className="signup-subtitle">Join DDoS Watch Global</p>

        {error && <div className="signup-error">{error}</div>}

        {!showVerification ? (
          <form onSubmit={handleSubmit} className="signup-form">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="signup-input"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="signup-input"
            />

            <div className="password-section">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className="signup-input"
              />
              {showRequirements && (
                <div className="password-requirements">
                  {Object.values(passwordRequirements).map((req, index) => (
                    <div 
                      key={index} 
                      className={`requirement ${req.met ? 'met' : ''}`}
                    >
                      {req.met ? '✓' : '○'} {req.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="signup-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        ) : (
          <VerificationForm 
            email={verificationEmail} 
            onVerificationComplete={handleVerificationComplete}
            onBackToSignup={handleBackToSignup}
          />
        )}

        <div className="signup-footer">
          Already have an account? <Link to="/login" className="login-link">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

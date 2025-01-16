import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/paymentpage.css';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/create-subscription/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to success page or back to profile
        navigate('/profile', { 
          state: { message: 'Successfully subscribed to premium plan!' }
        });
      } else {
        setError(data.message || 'Failed to process subscription');
      }
    } catch (err) {
      setError('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Subscribe to Premium</h1>
        <div className="plan-details">
          <h2>Premium Plan</h2>
          <p className="price">$99.99 / month</p>
          <ul className="features">
            <li>✓ Advanced DDoS Protection</li>
            <li>✓ Real-time Monitoring</li>
            <li>✓ 24/7 Support</li>
            <li>✓ Custom Rules</li>
          </ul>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button 
          className="subscribe-button"
          onClick={handleSubscribe}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Subscribe Now'}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage; 
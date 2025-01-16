import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import './ProductPricing.css';
import { useNavigate } from 'react-router-dom';

const ProductPricing: React.FC = () => {
  const { user } = useUser();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  console.log('Initial isSubscribed state:', isSubscribed);

  const products = [
    {
      name: 'DDoS Watch',
      price: 'Premium',
      description: 'Advanced protection for enterprises with real-time monitoring.',
      cost: '$99.99 / month',
      className: 'glow',
      id: 'premium'
    },
    {
      name: 'DDoS Watch',
      price: 'Free',
      description: 'Basic DDoS protection for personal use.',
      cost: 'Free',
      className: '',
      id: 'free'
    },
  ];

  const handleDownload = async (productId: string) => {
    console.log('handleDownload called - isSubscribed:', isSubscribed);
    
    if (!user) {
      setError('Please log in to continue');
      return;
    }

    if (productId === 'premium') {
      try {
        setIsProcessing(true);
        const response = await fetch('http://localhost:8000/api/check-subscription/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
          },
          credentials: 'include',
        });

        const data = await response.json();
        console.log('handleDownload subscription check:', data);

        if (data.isSubscribed) {
          setError('Download coming soon!');
        } else {
          const checkoutResponse = await fetch('http://localhost:8000/api/create-checkout-session/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCookie('csrftoken'),
            },
            credentials: 'include',
          });

          if (checkoutResponse.ok) {
            const { url } = await checkoutResponse.json();
            window.location.href = url;
          } else {
            const errorData = await checkoutResponse.json();
            console.error('Checkout error:', errorData);
            setError('Failed to initiate payment');
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to process request');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setError('Download coming soon!');
    }
  };

  const handleSubscribe = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/create-subscription/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const data = await response.json();
      console.log('Subscription created:', data);
      navigate('/profile'); // Redirect to profile after successful subscription
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  const handleDownloadClick = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/create-subscription/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const data = await response.json();
      console.log('Subscription created:', data);
      
      handleDownload();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  function getCookie(name: string) {
    let cookieValue = null;
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

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/check-payment/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isSubscribed) {
          window.location.href = 'http://localhost:8000/api/download/premium/';
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/check-subscription/', {
          credentials: 'include',
        });
        const data = await response.json();
        console.log('API Response:', data);
        setIsSubscribed(data.isSubscribed);
        console.log('Setting isSubscribed to:', data.isSubscribed);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, []);

  console.log('Current isSubscribed value before render:', isSubscribed);

  return (
    <div className="product-pricing-page">
      <h1 className="pricing-title">Product and Pricing</h1>
      <p className="pricing-subtitle">Choose the plan that fits your needs</p>
      {error && <p className="error-message">{error}</p>}
      <div className="product-list">
        {products.map((product, index) => (
          <div className="product-card" key={index}>
            <h3 className={`product-name ${product.className}`}>
              {product.name} <br /> {product.price}
            </h3>
            <p className="product-price">{product.cost}</p>
            <p className="product-description">{product.description}</p>
            <button 
              className="download-btn"
              onClick={() => handleDownload(product.id)}
              disabled={isProcessing}
            >
              {product.id === 'premium' 
                ? (isSubscribed ? 'Download Premium' : 'Subscribe & Download')
                : 'Download Free Version'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPricing;

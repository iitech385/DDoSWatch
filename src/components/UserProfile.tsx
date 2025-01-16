import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/userprofile.css';
import Switch from '@mui/material/Switch';
import { useUser } from '../context/UserContext';
import { toast } from 'react-hot-toast';

interface UserData {
  username: string;
  email: string;
  date_joined: string;
  last_login: string;
  profile_picture?: string;
  mfa_enabled: boolean;
  subscription_status?: {
    isSubscribed: boolean;
    plan: string;
    expiryDate?: string;
  };
}

const UserProfile: React.FC = () => {
  const { user, setUser, profilePicture, setProfilePicture } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAvatarSelect, setShowAvatarSelect] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  // Update the avatars array with Arab avatars included
  const avatars = [

    
    // Robot avatars (futuristic)
    'https://api.dicebear.com/7.x/bottts/svg?seed=1&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/bottts/svg?seed=2&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/bottts/svg?seed=3&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/bottts/svg?seed=4&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/bottts/svg?seed=5&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/bottts/svg?seed=6&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/bottts/svg?seed=7&backgroundColor=c0aede',
    
    // Male avatars (diverse styles)
    'https://api.dicebear.com/7.x/avataaars/svg?seed=John&gender=male&hair=short',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike&gender=male&hair=mohawk',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&gender=male&hair=dreads',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&gender=male&hair=fade',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom&gender=male&hair=buzzcut',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&gender=male&hair=long',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Max&gender=male&hair=curly',
    
    // Female avatars (diverse styles)
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&gender=female&hair=long',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa&gender=female&hair=curly',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&gender=female&hair=bob',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna&gender=female&hair=bun',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya&gender=female&hair=braids',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&gender=female&hair=wave',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy&gender=female&hair=pixie',
    
    // Pixel art (expanded collection)
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=1&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=2&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=3&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=4&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=5&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=6&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=7&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=8&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=9&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=10&backgroundColor=d1d4f9',
    
    // Adventurers (RPG style)
    'https://api.dicebear.com/7.x/adventurer/svg?seed=warrior&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=mage&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=rogue&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=ranger&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=cleric&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=paladin&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=druid&backgroundColor=c0aede',
    
    // Fun emojis (expressive)
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=happy&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=cool&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=silly&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=nerdy&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=smart&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=excited&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=chill&backgroundColor=c0aede',
    
    // Miniatures (cute style)
    'https://api.dicebear.com/7.x/miniavs/svg?seed=1&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/miniavs/svg?seed=2&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/miniavs/svg?seed=3&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/miniavs/svg?seed=4&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/miniavs/svg?seed=5&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/miniavs/svg?seed=6&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/miniavs/svg?seed=7&backgroundColor=c0aede'
  ];

  // Load saved image on mount and when profilePicture changes
  useEffect(() => {
    const savedImage = localStorage.getItem('profilePicture');
    if (savedImage) {
      setSelectedImage(savedImage);
      setProfilePicture(savedImage);
    }
  }, []);

  // Separate useEffect for user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/user-profile/', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data) {
          setUserData(response.data);
          setMfaEnabled(response.data.mfa_enabled);
        }
      } catch (err: any) {
        console.error('Error details:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }

      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      localStorage.setItem('profilePicture', imageUrl);
      setProfilePicture(imageUrl);

      // Update navbar avatar through API
      await axios.post('http://localhost:8000/api/update-avatar/', {
        avatar: imageUrl
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRemovePhoto = async () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    localStorage.removeItem('profilePicture');
    setProfilePicture(null);

    // Update navbar avatar through API
    try {
      await axios.post('http://localhost:8000/api/update-avatar/', {
        avatar: null
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMfaToggle = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/toggle-mfa/',
        { enabled: !mfaEnabled },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
          },
        }
      );
      setMfaEnabled(response.data.mfa_enabled);
    } catch (err) {
      console.error('Error toggling MFA:', err);
      setError('Failed to update MFA settings');
    }
  };

  const getCookie = (name: string): string => {
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
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedImage(avatarUrl);
    localStorage.setItem('profilePicture', avatarUrl);
    setProfilePicture(avatarUrl);
    setShowAvatarSelect(false);
  };

  const validateUsername = (username: string) => {
    // Simpler validation first
    if (username.length < 3 || username.length > 20) {
      return 'Username must be between 3 and 20 characters';
    }
    
    // Only allow letters, numbers, and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    
    return '';
  };

  const handleUsernameUpdate = async () => {
    // Clear previous error
    setUsernameError('');

    try {
      console.log('Sending username update request:', newUsername); // Debug log

      const response = await axios.post(
        'http://localhost:8000/api/change-username/',
        { new_username: newUsername },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-CSRFToken': getCookie('csrftoken')
          }
        }
      );

      console.log('Server response:', response.data); // Debug log

      if (response.data) {
        setUserData(prev => ({...prev, username: newUsername}));
        toast.success('Username updated successfully!');
        setIsEditingUsername(false);
        setNewUsername('');
      }
      
    } catch (error) {
      // Detailed error logging
      console.log('Error full details:', error);
      console.log('Error response:', error.response);
      console.log('Error data:', error.response?.data);
      
      if (error.response?.data?.error) {
        const errorMessage = error.response.data.error;
        console.log('Error message from server:', errorMessage); // Debug log
        
        if (errorMessage.includes('days')) {
          setUsernameError(errorMessage);
        } else {
          setUsernameError(errorMessage);
          toast.error(errorMessage);
        }
      } else {
        setUsernameError('Failed to update username');
        toast.error('Failed to update username');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!userData) return <div className="error">No user data found</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="profile-title" style={{ top: '50px' }}>My Profile</h1>
        
        <div className="profile-info">
          <div className="profile-avatar">
            <label htmlFor="profile-upload" className="avatar-upload-label">
              <div 
                className="avatar-circle" 
                style={{ top: '30px' }}
                onClick={() => setShowAvatarSelect(true)}
              >
                {selectedImage ? (
                  <img 
                    src={selectedImage} 
                    alt="Profile" 
                    onClick={() => setShowAvatarSelect(true)}
                  />
                ) : (
                  <span>{userData?.username ? userData.username.charAt(0).toUpperCase() : '?'}</span>
                )}
              </div>
            </label>

            {/* Avatar selection modal */}
            {showAvatarSelect && (
              <div className="avatar-modal">
                <div className="avatar-modal-content">
                  <h3>Choose Your Avatar</h3>
                  <div className="avatar-options">
                    {/* Upload option */}
                    <div className="upload-option">
                      <h4>Upload Photo</h4>
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                      />
                      <button onClick={() => document.getElementById('photo-upload')?.click()}>
                        Upload Photo
                      </button>
                    </div>

                    {/* Predefined avatars */}
                    <div className="predefined-avatars">
                      <h4>Select Avatar</h4>
                      <div className="avatar-grid">
                        {avatars.map((avatar, index) => (
                          <img
                            key={index}
                            src={avatar}
                            alt={`Avatar ${index + 1}`}
                            onClick={() => handleAvatarSelect(avatar)}
                            className="avatar-option"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAvatarSelect(false)}
                    className="close-modal-btn"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {selectedImage && (
              <button 
                style={{
                  position: 'absolute',
                  left: '790px',
                  top: '200px',
                  background: 'linear-gradient(45deg, violet, purple)',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  zIndex: 2,
                  width: '80px',
                  textAlign: 'center'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePhoto();
                }}
              >
                Remove Photo
              </button>
            )}
          </div>

          <div className="profile-details">
            <div className="info-group">
              <label>Username</label>
              <div className="username-wrapper">
                <div className="username-with-crown">
                  {userData?.subscription_status?.isSubscribed && (
                    <svg 
                      className="crown-icon" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M2.5 18.5H21.5M9.5 11.5L2.5 6.5L3.5 17.5M14.5 11.5L21.5 6.5L20.5 17.5M12 11.5L7.5 4.5L12 13.5L16.5 4.5L12 11.5Z" 
                        stroke="gold" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <p>{userData?.username || 'N/A'}</p>
                </div>
                <button 
                  className="edit-username-btn" 
                  onClick={() => setIsEditingUsername(true)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="info-group">
              <label>Email</label>
              <p>{userData?.email || 'N/A'}</p>
            </div>

            <div className="info-group">
              <label>Member Since</label>
              <p>{userData?.date_joined ? new Date(userData.date_joined).toLocaleDateString() : 'N/A'}</p>
            </div>

            <div className="info-group">
              <label>Last Login</label>
              <p>{userData?.last_login ? new Date(userData.last_login).toLocaleDateString() : 'N/A'}</p>
            </div>

            <div className="info-group mfa-toggle">
              <label>Two-Factor Authentication</label>
              <div className="mfa-control">
                <Switch
                  checked={mfaEnabled}
                  onChange={handleMfaToggle}
                  color="primary"
                />
                <span>{mfaEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="subscription-box">
        <h3>Subscription Status</h3>
        <div className="subscription-details">
          {userData?.subscription_status?.isSubscribed ? (
            <>
              <div className="subscription-info">
                <span className="status active">Active</span>
                <p className="plan-name">{userData.subscription_status.plan}</p>
                {userData.subscription_status.expiryDate && (
                  <p className="expiry-date">
                    Expires: {new Date(userData.subscription_status.expiryDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button 
                className="manage-subscription-btn"
                onClick={() => window.location.href = 'http://localhost:8000/api/manage-subscription/'}
              >
                Manage Subscription
              </button>
            </>
          ) : (
            <>
              <div className="subscription-info">
                <span className="status inactive">No Active Subscription</span>
                <p className="plan-message">Subscribe to access premium features</p>
              </div>
              <button 
                className="subscribe-btn"
                onClick={() => window.location.href = '/pricing'}
              >
                View Plans
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
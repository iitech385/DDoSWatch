import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/config';

interface UserContextType {
  user: string | null;
  setUser: (user: string | null) => void;
  profilePicture: string | null;
  setProfilePicture: (url: string | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(api.endpoints.checkAuth, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Auth check response:', data);
        
        if (data.isAuthenticated) {
          setUser(data.username);
          localStorage.setItem('user', data.username);
          
          // Immediately set profile picture from localStorage if it exists
          const savedPicture = localStorage.getItem('profilePicture');
          if (savedPicture) {
            setProfilePicture(savedPicture);
          } else if (data.profile_picture) {
            setProfilePicture(data.profile_picture);
            localStorage.setItem('profilePicture', data.profile_picture);
          }
        } else {
          setUser(null);
          localStorage.removeItem('user');
          setProfilePicture(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        localStorage.removeItem('user');
        setProfilePicture(null);
      }
    };

    checkAuth();
  }, []);

  // Add this effect to handle user changes
  useEffect(() => {
    if (user) {
      const savedPicture = localStorage.getItem('profilePicture');
      if (savedPicture) {
        setProfilePicture(savedPicture);
      }
    } else {
      setProfilePicture(null);
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, profilePicture, setProfilePicture }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 
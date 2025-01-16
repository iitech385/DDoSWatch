import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export const useAutoLogout = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  useEffect(() => {
    if (!user) return; // Only run if user is logged in

    let logoutTimer: NodeJS.Timeout;
    let lastActivity = Date.now();

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      lastActivity = Date.now();

      logoutTimer = setTimeout(async () => {
        const timeSinceLastActivity = Date.now() - lastActivity;
        if (timeSinceLastActivity >= TIMEOUT_DURATION) {
          // Perform logout
          try {
            await fetch('http://localhost:8000/api/logout/', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            });
          } catch (error) {
            console.error('Logout error:', error);
          }

          setUser(null);
          navigate('/login', { 
            state: { message: 'You have been logged out due to inactivity.' }
          });
        }
      }, TIMEOUT_DURATION);
    };

    // Reset timer on any user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart'
    ];

    activityEvents.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Initial timer
    resetTimer();

    // Cleanup
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [user, navigate, setUser]);
}; 
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './navbar.css';
import logo from '../assets/DD.png';
import { useUser } from '../context/UserContext';
import { api } from '../api/config';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, setUser, profilePicture } = useUser();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (menuOpen && window.scrollY > lastScrollY) {
        setMenuOpen(false);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen, lastScrollY]);

  const handleClick = () => {
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(api.endpoints.logout, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
      });

      if (response.ok) {
        setUser(null);
        setMenuOpen(false);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getCookie = (name: string): string => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  };

  const scrollToAboutUs = () => {
    if (location.pathname === "/") {
      const aboutUsSection = document.getElementById("about-us");
      if (aboutUsSection) {
        aboutUsSection.scrollIntoView({ behavior: "smooth" });
      }
    }
    handleClick();
  };

  return (
    <div className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="DDoS Watch Logo" />
      </Link>
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        <div className={`hamburger ${menuOpen ? 'open' : ''}`}></div>
        <div className={`hamburger ${menuOpen ? 'open' : ''}`}></div>
        <div className={`hamburger ${menuOpen ? 'open' : ''}`}></div>
      </div>
      <ul className={`nav-links ${menuOpen ? 'show' : ''}`}>
        <li>
          <Link to="/" onClick={scrollToAboutUs} style={{ textDecoration: 'none', color: 'inherit' }}>
            HOME
          </Link>
        </li>
        <li>
          <Link to="/product-pricing" onClick={handleClick} style={{ textDecoration: 'none', color: 'inherit' }}>
            PRODUCT & PRICING
          </Link>
        </li>
        <li>
          <Link to="/faq" onClick={handleClick} style={{ textDecoration: 'none', color: 'inherit' }}>
            FAQs
          </Link>
        </li>
        {user ? (
          <li className="user-menu">
            <button 
              className="user-button"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="nav-profile-pic"
                />
              ) : (
                <div className="nav-profile-initial">
                  {user.charAt(0).toUpperCase()}
                </div>
              )}
              <span>Hi, {user}</span>
            </button>
            <div className="dropdown-menu">
              <button className="logout-button" onClick={() => navigate('/profile')}>
                <span className="logout-circle">
                  <span className="logout-text">PROFILE</span>
                </span>
              </button>
              <button className="logout-button" onClick={handleLogout}>
                <span className="logout-circle">
                  <span className="logout-text">LOGOUT</span>
                </span>
              </button>
            </div>
          </li>
        ) : (
          <>
            <li>
              <Link to="/login" onClick={handleClick} style={{ textDecoration: 'none', color: 'inherit' }}>
                LOGIN
              </Link>
            </li>
            <li>
              <button className="btn btn-alt" onClick={handleClick}>
                <Link to="/signup" style={{ textDecoration: 'none', color: 'inherit' }}>
                  SIGN UP
                </Link>
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Navbar;
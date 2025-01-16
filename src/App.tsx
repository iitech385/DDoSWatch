import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import Navbar from './components/navbar';
import BackgroundAnimation from "./components/BackgroundAnimation";
import './components/navbar.css';
import './components/hero.css';
import './components/animations.css';
import AboutUs from './components/AboutUs';
import Login from './components/LoginPage';
import SignUp from './components/SignUp';
import ProductPricing from './components/ProductPricing';
import Faq from './components/Faq';
import ForgotPassword from './components/ForgotPassword';
import Chatbot from './components/Chatbot';
import { UserProvider } from './context/UserContext';
import { useAutoLogout } from './hooks/useAutoLogout';
import UserProfile from './components/UserProfile';
import { Toaster } from 'react-hot-toast';

const pageVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

const pageTransition = {
  duration: 0.6,
  ease: 'easeInOut',
};

const Home: React.FC = () => {
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ backgroundColor: 'black' }}
    >
      <div className="homepage">
        <BackgroundAnimation />
        <header className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Protect with DDoSWATCH</h1>
            <p className="hero-subtitle">Innovating DDoS Defense with Federated Learning</p>
            <div className="hero-buttons">
              <button
                className="btn chat-btn"
                onClick={() => setShowChatbot(!showChatbot)}
                type="button"
              >
                Chat with us
              </button>
              <Link to="/product-pricing" style={{ textDecoration: 'none' }}>
                <button className="btn get-secure-btn">Secure your network now!</button>
              </Link>
            </div>
          </div>
        </header>
        <div id="about-us">
          <AboutUs />
        </div>
        {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
      </div>
    </motion.div>
  );
};

const ChatbotWrapper: React.FC = () => {
  const [showChatbot, setShowChatbot] = useState(() => {
    const savedState = localStorage.getItem('chatbotVisible');
    return savedState ? JSON.parse(savedState) : true;
  });

  useEffect(() => {
    localStorage.setItem('chatbotVisible', JSON.stringify(showChatbot));
  }, [showChatbot]);

  const handleCloseChatbot = () => {
    setShowChatbot(false);
    localStorage.removeItem('chatMessages');
  };

  return showChatbot ? <Chatbot onClose={handleCloseChatbot} /> : null;
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  useAutoLogout();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              style={{ backgroundColor: 'black' }}
            >
              <Login />
            </motion.div>
          }
        />
        <Route
          path="/signup"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              style={{ backgroundColor: 'black' }}
            >
              <SignUp />
            </motion.div>
          }
        />
        <Route
          path="/product-pricing"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              style={{ backgroundColor: 'black' }}
            >
              <ProductPricing />
            </motion.div>
          }
        />
        <Route
          path="/faq"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              style={{ backgroundColor: 'black' }}
            >
              <Faq />
            </motion.div>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              style={{ backgroundColor: 'black' }}
            >
              <ForgotPassword />
            </motion.div>
          }
        />
        <Route
          path="/profile"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              style={{ backgroundColor: 'black' }}
            >
              <UserProfile />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent: React.FC = () => {
  const [isChatbotVisible, setIsChatbotVisible] = useState(() => {
    const savedVisibility = localStorage.getItem('chatbotVisible');
    return savedVisibility ? JSON.parse(savedVisibility) : true;
  });

  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    setIsChatbotVisible(false);
  }, [location]);

  useEffect(() => {
    localStorage.setItem('chatbotVisible', JSON.stringify(isChatbotVisible));
  }, [isChatbotVisible]);

  const handleCloseChatbot = () => {
    setIsChatbotVisible(false);
  };

  const handleOpenChatbot = () => {
    setIsChatbotVisible(true);
  };

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Navbar />
      <Suspense fallback={<div style={{ backgroundColor: 'black', height: '100vh' }}>Loading...</div>}>
        <AnimatedRoutes />
        <AnimatePresence mode="wait">
          {isChatbotVisible && (
            <motion.div
              key="chatbot"
              initial={{ opacity: 0, right: -400 }}
              animate={{ opacity: 1, right: 20 }}
              exit={{ opacity: 0, right: -400 }}
              transition={{ 
                duration: 0.8,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              style={{ 
                position: 'fixed',
                bottom: '20px',
                zIndex: 1000
              }}
            >
              <Chatbot onClose={handleCloseChatbot} />
            </motion.div>
          )}
          {!isChatbotVisible && !isHomePage && (
            <motion.button 
              key="chat-button"
              onClick={handleOpenChatbot}
              className="open-chat-button"
              initial={{ opacity: 0, right: -100 }}
              animate={{ opacity: 1, right: 20 }}
              exit={{ opacity: 0, right: -100 }}
              transition={{ 
                duration: 0.8,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              style={{
                position: 'fixed',
                bottom: '20px',
                zIndex: 1000,
                width: '65px',
                height: '65px',
                borderRadius: '50%',
                backgroundColor: '#007bff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: 0
              }}
            >
              <div 
                style={{
                  width: '55px',
                  height: '55px',
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 2a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4-3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>')`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center'
                }}
              />
            </motion.button>
          )}
        </AnimatePresence>
      </Suspense>
    </>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
};

export default App;
import React, { useState, ChangeEvent, KeyboardEvent, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./../styles/chatbot.css";

// Initialize Gemini
const genAI = new GoogleGenerativeAI('AIzaSyAE585XIwXHTzYz9T2s3K-XOZiCGmj7x30');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

interface Message {
  sender: "bot" | "user";
  text: string;
}

const faqData = [
  {
    question: "What is DDoS Watch?",
    answer: "DDoS Watch is an advanced solution for protecting your network against DDoS attacks using federated learning.",
  },
  {
    question: "How does DDoS Watch protect my network?",
    answer: "DDoS Watch uses real-time monitoring, AI-based detection, and mitigation techniques to prevent and respond to DDoS attacks effectively.",
  },
  {
    question: "What plans are available?",
    answer: "We offer three plans: Free, Basic ($49.99/month), and Premium ($99.99/month). Each plan is tailored to specific needs.",
  },
  {
    question: "How can I contact support?",
    answer: "You can reach out to us via email at support@ddoswatch.com or use our 24/7 chat feature.",
  },
  {
    question: "Is DDoS Watch easy to integrate?",
    answer: "Yes, DDoS Watch is designed to be easily integrated into your existing systems with minimal configuration.",
  },
];

const keywordResponses: Record<string, string> = {
  price: "We offer three plans: Free, Basic ($49.99/month), and Premium ($99.99/month).",
  contact: "You can reach out to us via email at support@ddoswatch.com or use our 24/7 chat feature.",
  plans: "Our plans include Free, Basic ($49.99/month), and Premium ($99.99/month).",
  integrate: "Yes, DDoS Watch is designed to integrate into your systems easily.",
  hello: "Hello! How can I help you today?",
  hi: "Hi! What can I assist you with?",
  hey: "Hey there! How can I be of assistance?",
};

const Chatbot: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Try to load existing messages from localStorage
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      return JSON.parse(savedMessages);
    }
    // If no saved messages, start with empty array and show typing
    return [];
  });
  
  const [input, setInput] = useState<string>("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(true);

  // Initial welcome message (only if no saved messages)
  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => {
        setMessages([{ sender: "bot", text: "Hi there! How can I assist you today?" }]);
        setIsTyping(false);
      }, 1500);
    } else {
      setIsTyping(false);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleClose = () => {
    localStorage.removeItem('chatMessages'); // Clear messages when closing
    onClose();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.toLowerCase();
    setInput("");
    
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);

    // Show typing indicator
    setIsTyping(true);

    // Check FAQ data first
    const faqMatch = faqData.find(faq => 
      userMessage.includes(faq.question.toLowerCase())
    );

    if (faqMatch) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", text: faqMatch.answer }]);
        setIsTyping(false); // Hide typing indicator
      }, 1000);
      return;
    }

    // Check for keywords
    const foundKeyword = Object.keys(keywordResponses).find((keyword) =>
      userMessage.includes(keyword)
    );

    if (foundKeyword) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: keywordResponses[foundKeyword] },
        ]);
        setIsTyping(false); // Hide typing indicator
      }, 1000);
    } else {
      // If no FAQ or keyword match, use Gemini
      try {
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const text = response.text();
        
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: text },
          ]);
          setIsTyping(false); // Hide typing indicator
        }, 1000);
      } catch (error) {
        console.error('Gemini error:', error);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "I'm sorry, I couldn't understand that. Can you try rephrasing?" },
          ]);
          setIsTyping(false); // Hide typing indicator
        }, 1000);
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <motion.div
      className="chatbot-container"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <div className="chatbot-header">
        <div className="chatbot-robot"></div>
        <span>Chatbot</span>
        <button onClick={handleClose}>✖</button>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chatbot-message ${
              msg.sender === "bot" ? "bot" : "user"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="chatbot-message bot typing">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </motion.div>
  );
};

export default Chatbot;
import React from 'react';
import '../styles/faq.css'; // FAQ Page CSS

const Faq: React.FC = () => {
  const faqs = [
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

  return (
    <div className="faq-page">
      <h1 className="faq-title">Frequently Asked Questions</h1>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div className="faq-item" key={index}>
            <h3 className="faq-question">{faq.question}</h3>
            <p className="faq-answer">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;

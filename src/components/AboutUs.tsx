import React from 'react';
import '../styles/aboutUs.css';

const AboutUs: React.FC = () => {
  return (
    <section id="about-us" className="about-us-section">
      <div className="about-us-container">
        <h2 className="about-us-heading">Unleashing the Power of Cybersecurity</h2>
        <h3 className="about-us-subheading">A revolution in DDoS protection</h3>
        <p className="about-us-text">
          Welcome to <span className="highlight">DDoSWatch</span>—your ultimate defense against Distributed Denial of Service (<span className="highlight">DDoS</span>) attacks. Harnessing the power of advanced machine learning and federated learning principles, we provide intelligent, proactive, and scalable solutions to keep your systems resilient in the face of evolving cyber threats.
        </p>
        <p className="about-us-text">
          Our fully autonomous and innovative platform is designed for businesses of all sizes, delivering unmatched peace of mind by ensuring your digital assets remain secure. At <span className="highlight">DDoSWatch</span>, we redefine cybersecurity with tools that are robust, user-friendly, and built for the future.
        </p>
        <p className="about-us-text2">
          Because your security is our mission.
        </p>
      </div>
    </section>
  );
};

export default AboutUs;

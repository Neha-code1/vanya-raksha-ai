import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-background-elements">
        <div className="glow-orb sphere-1"></div>
        <div className="glow-orb sphere-2"></div>
      </div>
      
      <div className="container hero-container">
        <div className="hero-content">
          <div className="badge animate-fade-in glass">
            <span className="badge-dot"></span> Next-Gen AI System
          </div>
          
          <h1 className="hero-title animate-fade-in animate-delay-1">
            Protecting <span className="text-gradient">Wildlife</span>,<br />
            Saving Lives
          </h1>
          
          <p className="hero-description animate-fade-in animate-delay-2">
            Vanya Raksha AI utilizes cutting-edge predictive machine learning and real-time vision algorithms to prevent wildlife-vehicle collisions before they happen.
          </p>
          
          <div className="hero-actions animate-fade-in animate-delay-3">
            <Link to="/dashboard" className="btn btn-hero-primary" style={{ textDecoration: 'none' }}>
              Explore Dashboard
            </Link>
            <button className="btn btn-hero-secondary glass">
              Watch Demo
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="hero-image-wrapper animate-fade-in animate-delay-2">
          <div className="glass hero-card-mockup">
            <div className="mockup-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="mockup-body">
              <div className="scan-line"></div>
              <div className="mockup-content">
                <div className="alert-badge warning glass">
                  ⚠️ Animal Detected 
                  <span className="distance">150m ahead</span>
                </div>
                <div className="ai-bounding-box"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

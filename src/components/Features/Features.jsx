import React from 'react';
import './Features.css';

const featureData = [
  {
    title: 'Predictive Wildlife Detection',
    description: 'Advanced YOLOv8 models analyze camera feeds in real-time, detecting animals with 98% accuracy even in low-light conditions.',
    icon: '👁️',
  },
  {
    title: 'Real-Time Alerts',
    description: 'Drivers receive instant notifications via smart road signs and mobile apps, providing crucial seconds to react and slow down.',
    icon: '⚡',
  },
  {
    title: 'Camera Health Analytics',
    description: 'Automated monitoring ensures your entire camera network stays online. AI detects obscured lenses and hardware failures instantly.',
    icon: '📷',
  },
  {
    title: 'Data Insights & Heatmaps',
    description: 'Analyze animal migration patterns over time. Our dashboard visualizes high-risk zones, aiding in infrastructure planning.',
    icon: '🗺️',
  }
];

const Features = () => {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="features-header">
          <h2 className="section-title">Intelligent Capabilities</h2>
          <p className="section-subtitle">
            Powered by state-of-the-art machine learning, Vanya Raksha AI operates 24/7 to protect our ecosystem.
          </p>
        </div>
        
        <div className="features-grid">
          {featureData.map((feature, index) => (
            <div 
              key={index} 
              className={`feature-card glass animate-fade-in animate-delay-${(index % 3) + 1}`}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

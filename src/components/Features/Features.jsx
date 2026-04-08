import React, { useState } from 'react';
import './Features.css';

const featureData = [
  {
    title: 'Predictive Wildlife Detection',
    description: 'Advanced YOLOv8 models analyze camera feeds in real-time, detecting animals with 98% accuracy even in low-light conditions.',
    icon: '👁️',
    details: [
      'YOLOv8 neural network trained on 50,000+ wildlife images',
      '98% detection accuracy in daylight, 94% at night',
      'Identifies 30+ species including elephants, tigers, deer, and leopards',
      'Processes 30 frames per second per camera feed',
      'Thermal imaging integration for complete darkness detection',
    ],
    color: '#10b981',
  },
  {
    title: 'Real-Time Alerts',
    description: 'Drivers receive instant notifications via smart road signs and mobile apps, providing crucial seconds to react and slow down.',
    icon: '⚡',
    details: [
      'Alert delivered within 800ms of animal detection',
      'Dynamic road signs flash warnings up to 500m ahead',
      'Mobile push notifications for registered drivers',
      'Variable speed limit suggestions based on animal proximity',
      'Integration with Google Maps and navigation apps',
    ],
    color: '#f59e0b',
  },
  {
    title: 'Camera Health Analytics',
    description: 'Automated monitoring ensures your entire camera network stays online. AI detects obscured lenses and hardware failures instantly.',
    icon: '📷',
    details: [
      'Self-diagnostic checks every 60 seconds per camera',
      'Detects lens obstruction, vandalism, and hardware faults',
      'Automatic failover to nearest backup camera',
      'Maintenance team notified within 2 minutes of failure',
      'Dashboard shows real-time network health at a glance',
    ],
    color: '#3b82f6',
  },
  {
    title: 'Data Insights & Heatmaps',
    description: 'Analyze animal migration patterns over time. Our dashboard visualizes high-risk zones, aiding in infrastructure planning.',
    icon: '🗺️',
    details: [
      'Real GBIF roadkill data from Anamalai Hills (2011–2013)',
      'Heatmap overlays showing historical collision hotspots',
      'Seasonal migration pattern analysis',
      'Exportable reports for forest department and planners',
      'Predicts future high-risk periods using weather + movement data',
    ],
    color: '#8b5cf6',
  },
];

const Modal = ({ feature, onClose }) => {
  if (!feature) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-card, #0d2b1e)',
          border: `1px solid ${feature.color}44`,
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          boxShadow: `0 0 40px ${feature.color}33`,
          animation: 'modalIn 0.2s ease',
        }}
      >
        <style>{`
          @keyframes modalIn {
            from { transform: scale(0.92); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2rem' }}>{feature.icon}</span>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-main, #fff)', fontWeight: 600 }}>
              {feature.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <p style={{ color: 'var(--color-text-muted, #aaa)', marginBottom: '1.5rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
          {feature.description}
        </p>

        {/* Feature list */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {feature.details.map((point, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-main, #e2e8f0)' }}>
              <span style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: `${feature.color}22`, border: `1px solid ${feature.color}`,
                color: feature.color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0, marginTop: '1px'
              }}>✓</span>
              {point}
            </li>
          ))}
        </ul>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            marginTop: '1.5rem',
            width: '100%',
            padding: '0.75rem',
            background: `${feature.color}22`,
            border: `1px solid ${feature.color}66`,
            borderRadius: '8px',
            color: feature.color,
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 500,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const Features = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);

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
              onClick={() => setSelectedFeature(feature)}
              style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 30px ${feature.color}33`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <span style={{
                display: 'inline-block',
                marginTop: '1rem',
                fontSize: '0.8rem',
                color: feature.color,
                borderBottom: `1px solid ${feature.color}`,
                paddingBottom: '1px',
              }}>
                Learn more →
              </span>
            </div>
          ))}
        </div>
      </div>

      <Modal feature={selectedFeature} onClose={() => setSelectedFeature(null)} />
    </section>
  );
};

export default Features;


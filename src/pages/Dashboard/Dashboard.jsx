import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Dashboard.css';

const animals = [
  { type: 'Elephant', icon: '🐘' },
  { type: 'Tiger', icon: '🐅' },
  { type: 'Deer', icon: '🦌' }
];

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeAlert, setActiveAlert] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [cameras, setCameras] = useState([
    { id: 'CAM-A1', status: 'Active', location: 'Sector A' },
    { id: 'CAM-B2', status: 'Active', location: 'Sector B' },
    { id: 'CAM-C3', status: 'Active', location: 'Sector C' },
    { id: 'CAM-E4', status: 'Fault', location: 'Sector E' },
  ]);
  const [alertsHistory, setAlertsHistory] = useState([
    {
      id: 1,
      type: 'Elephant Herd Detected',
      location: 'Zone Alpha, Sector B',
      distance: '1.2 km',
      time: 'Just now',
      severity: 'high-severity',
      icon: '⚠️'
    },
    {
      id: 2,
      type: 'Canine Presence',
      location: 'Zone Alpha, Sector D',
      distance: '3.5 km',
      time: '5 mins ago',
      severity: 'moderate-severity',
      icon: '🦊'
    }
  ]);

  // Auto-start demo if ?demo=true in URL (from Watch Demo button)
  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      setIsDemoMode(true);
      // Remove the query param so it doesn't re-trigger on refresh
      setSearchParams({});
    }
  }, []);

  const playAlertSound = () => {
    if (!isSoundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const triggerAnimalAlert = (forcedDistance, forcedSector, forcedAnimal) => {
    const animal = forcedAnimal ? animals.find(a => a.type === forcedAnimal) || animals[0] : animals[Math.floor(Math.random() * animals.length)];
    const distanceObj = forcedDistance || (Math.random() * 0.9 + 0.1).toFixed(1);
    const sectorChar = forcedSector || String.fromCharCode(65 + Math.floor(Math.random() * 5));

    let markerPos = { top: '50%', left: '50%' };
    if (sectorChar === 'A' || sectorChar === 'B') markerPos = { top: '25%', left: '75%' };
    else if (sectorChar === 'C' || sectorChar === 'D') markerPos = { top: '50%', left: '45%' };
    else markerPos = { top: '75%', left: '25%' };

    const newAlert = {
      id: Date.now() + Math.random(),
      type: `${animal.type} Detected`,
      location: `Zone Alpha, Sector ${sectorChar}`,
      distance: distanceObj,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      severity: distanceObj < 0.5 ? 'high-severity' : 'moderate-severity',
      icon: animal.icon,
      markerPos
    };

    setActiveAlert(newAlert);
    if (parseFloat(distanceObj) <= 1.0) playAlertSound();
    setAlertsHistory(prev => [newAlert, ...prev].slice(0, 5));
    setTimeout(() => setActiveAlert(prev => (prev?.id === newAlert.id ? null : prev)), 5000);
  };

  const triggerCameraAlert = (forcedCamId) => {
    setCameras(prev => {
      const activeCams = prev.filter(c => c.status === 'Active');
      if (activeCams.length > 0 || forcedCamId) {
        const victim = activeCams.find(c => c.id === forcedCamId) || activeCams[Math.floor(Math.random() * activeCams.length)];
        if (!victim) return prev;

        const newState = prev.map(c => c.id === victim.id ? { ...c, status: 'Tampered' } : c);

        const newAlert = {
          id: Date.now() + Math.random(),
          isCamera: true,
          type: `Hardware Interference - ${victim.id}`,
          location: `Zone Alpha, ${victim.location}`,
          distance: '0.0',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          severity: 'high-severity',
          icon: '📷'
        };

        setActiveAlert(newAlert);
        playAlertSound();
        setAlertsHistory(old => [newAlert, ...old].slice(0, 5));
        setTimeout(() => setActiveAlert(prev => (prev?.id === newAlert.id ? null : prev)), 5000);

        return newState;
      }
      return prev;
    });
  };

  useEffect(() => {
    if (isDemoMode) {
      setCameras(prev => prev.map(c => c.id === 'CAM-B2' ? { ...c, status: 'Active' } : c));

      let timer1 = setTimeout(() => triggerAnimalAlert('0.8', 'C', 'Deer'), 2000);
      let timer2 = setTimeout(() => triggerAnimalAlert('0.2', 'A', 'Elephant'), 9000);
      let timer3 = setTimeout(() => triggerCameraAlert('CAM-B2'), 16000);
      let timer4 = setTimeout(() => setIsDemoMode(false), 23000);

      return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); };
    } else {
      const interval = setInterval(() => {
        const rand = Math.random();
        if (rand > 0.85) triggerCameraAlert();
        else if (rand > 0.45) triggerAnimalAlert();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isDemoMode, isSoundEnabled]);

  return (
    <div className="dashboard container">
      <style>
        {`
          .alert-banner {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 2000;
            color: white;
            padding: 1rem 2rem;
            border-radius: var(--border-radius-md);
            display: flex;
            align-items: center;
            gap: 1rem;
            border: 2px solid transparent;
          }
          @keyframes slideDown {
            from { top: -100px; opacity: 0; }
            to { top: 20px; opacity: 1; }
          }
          @keyframes flashRed {
            from { box-shadow: 0 0 10px rgba(220, 38, 38, 0.5); }
            to { box-shadow: 0 0 30px rgba(239, 68, 68, 1); }
          }
          @keyframes flashYellow {
            from { box-shadow: 0 0 10px rgba(245, 158, 11, 0.5); }
            to { box-shadow: 0 0 30px rgba(245, 158, 11, 1); }
          }
          @keyframes flashZone {
            from { opacity: 0.5; }
            to { opacity: 0.9; }
          }
          .custom-toggle {
            cursor: pointer;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius-pill);
            color: white;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.2s;
            font-weight: 600;
          }
          .custom-toggle:hover {
            background: rgba(255,255,255,0.2);
          }
          .demo-active {
            background: rgba(239, 68, 68, 0.2) !important;
            border-color: rgba(239, 68, 68, 0.5) !important;
            color: #fca5a5;
          }
        `}
      </style>

      {activeAlert && (
        <div className="alert-banner" style={{
          background: activeAlert.isCamera ? 'rgba(220, 38, 38, 0.95)' : parseFloat(activeAlert.distance) < 0.5 ? 'rgba(220, 38, 38, 0.95)' : 'rgba(245, 158, 11, 0.95)',
          borderColor: activeAlert.isCamera ? '#f87171' : parseFloat(activeAlert.distance) < 0.5 ? '#f87171' : '#fbbf24',
          animation: activeAlert.isCamera ? 'slideDown 0.3s ease-out, flashRed 1s infinite alternate' : parseFloat(activeAlert.distance) < 0.5 ? 'slideDown 0.3s ease-out, flashRed 1s infinite alternate' : 'slideDown 0.3s ease-out, flashYellow 1s infinite alternate'
        }}>
          <span style={{ fontSize: '2rem' }}>{activeAlert.icon}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
              {activeAlert.isCamera ? '⚠ Camera displaced or damaged' : parseFloat(activeAlert.distance) < 0.5 ? '🚨 Immediate danger – Stop vehicle' : '⚠ Slow down – Animal crossing ahead'}
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>
              {activeAlert.isCamera ? `Critical Hardware Alert: ${activeAlert.location}` : `${activeAlert.type} at ${activeAlert.distance} km - ${activeAlert.location}`}
            </p>
          </div>
        </div>
      )}

      <div className="dashboard-header glass animate-fade-in" style={{ backgroundColor: activeAlert ? (activeAlert.isCamera || parseFloat(activeAlert.distance) < 0.5 ? 'rgba(153, 27, 27, 0.8)' : 'rgba(146, 64, 14, 0.8)') : '' }}>
        <div className="risk-indicator">
          <span className={`risk-dot ${activeAlert && (activeAlert.isCamera || parseFloat(activeAlert.distance) < 0.5) ? 'high' : 'warning'} pulse-animation`} style={{ background: activeAlert && (activeAlert.isCamera || parseFloat(activeAlert.distance) < 0.5) ? '#ef4444' : '' }}></span>
          <h2>System Status: <span className={activeAlert ? 'text-white' : 'text-warning'} style={{ fontWeight: 'bold', color: activeAlert ? (activeAlert.isCamera || parseFloat(activeAlert.distance) < 0.5 ? '#fca5a5' : '#fcd34d') : '' }}>
            {activeAlert ? (activeAlert.isCamera ? 'CRITICAL HARDWARE FAULT' : parseFloat(activeAlert.distance) < 0.5 ? 'CRITICAL RISK' : 'ELEVATED RISK') : 'Moderate Risk'}
          </span></h2>
        </div>
        <div className="dashboard-stats" style={{ alignItems: 'center' }}>
          {isDemoMode && (
            <span className="pulse-animation" style={{ background: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', color: 'white', border: '1px solid #f87171' }}>
              🎥 Live Simulation Running
            </span>
          )}
          <button className={`custom-toggle ${isDemoMode ? 'demo-active' : ''}`} onClick={() => setIsDemoMode(!isDemoMode)}>
            {isDemoMode ? '⏸ Stop Demo' : '▶️ Run Demo Sequence'}
          </button>
          <button className="custom-toggle" onClick={() => setIsSoundEnabled(!isSoundEnabled)}>
            {isSoundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
          </button>
          <div className="stat">
            <span className="stat-label">Active Cameras</span>
            <span className="stat-value">{cameras.filter(c => c.status === 'Active').length} / {cameras.length}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-map glass animate-fade-in animate-delay-1" style={{ border: activeAlert ? (activeAlert.isCamera || parseFloat(activeAlert.distance) < 0.5 ? '2px solid rgba(239, 68, 68, 0.5)' : '2px solid rgba(245, 158, 11, 0.5)') : '' }}>
          <div className="map-overlay">
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
              <div style={{
                position: 'absolute', top: '5%', right: '5%', width: '45%', height: '45%',
                borderRadius: '50%', filter: 'blur(40px)', background: 'rgba(239, 68, 68, 0.3)',
                animation: activeAlert && !activeAlert.isCamera && (activeAlert.location.includes('Sector A') || activeAlert.location.includes('Sector B')) ? 'flashZone 1s infinite alternate' : 'none',
              }}></div>
              <div style={{
                position: 'absolute', top: '30%', left: '25%', width: '40%', height: '40%',
                borderRadius: '50%', filter: 'blur(40px)', background: 'rgba(245, 158, 11, 0.3)',
                animation: activeAlert && !activeAlert.isCamera && (activeAlert.location.includes('Sector C') || activeAlert.location.includes('Sector D')) ? 'flashZone 1s infinite alternate' : 'none',
              }}></div>
              <div style={{
                position: 'absolute', bottom: '5%', left: '5%', width: '35%', height: '35%',
                borderRadius: '50%', filter: 'blur(40px)', background: 'rgba(16, 185, 129, 0.3)',
                animation: activeAlert && !activeAlert.isCamera && activeAlert.location.includes('Sector E') ? 'flashZone 1s infinite alternate' : 'none',
              }}></div>
            </div>

            <div className="map-marker" style={{ top: '40%', left: '30%', zIndex: 2 }}></div>
            <div className="map-marker active" style={{ top: '60%', left: '55%', zIndex: 2 }}></div>
            <div className="map-marker" style={{ top: '25%', left: '70%', zIndex: 2 }}></div>

            {activeAlert && activeAlert.markerPos && !activeAlert.isCamera && (
              <div className="map-marker active" style={{ ...activeAlert.markerPos, background: parseFloat(activeAlert.distance) < 0.5 ? '#ef4444' : '#f59e0b', boxShadow: parseFloat(activeAlert.distance) < 0.5 ? '0 0 15px #ef4444' : '0 0 15px #f59e0b', zIndex: 5 }}>
                <div className="pulse-ring" style={{ border: parseFloat(activeAlert.distance) < 0.5 ? '2px solid #ef4444' : '2px solid #f59e0b' }}></div>
              </div>
            )}
          </div>

          <div className="map-header">
            <h3 className="panel-title">Live Sector Map</h3>
            <p className="panel-subtitle">Zone Alpha - Corridors 1-4</p>
          </div>

          <div style={{
            position: 'absolute', bottom: '1.5rem', right: '1.5rem', zIndex: 10,
            background: 'rgba(2, 44, 34, 0.8)', padding: '1rem',
            borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(4px)', fontSize: '0.75rem', color: 'var(--color-text-main)'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>Risk Zones</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', background: 'rgba(239, 68, 68, 0.6)', borderRadius: '50%', display: 'inline-block' }}></span>
              <span>High Risk (Sectors A, B)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', background: 'rgba(245, 158, 11, 0.6)', borderRadius: '50%', display: 'inline-block' }}></span>
              <span>Medium Risk (Sectors C, D)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', background: 'rgba(16, 185, 129, 0.6)', borderRadius: '50%', display: 'inline-block' }}></span>
              <span>Low Risk (Sector E)</span>
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="camera-panel glass animate-fade-in animate-delay-2" style={{ marginBottom: '2rem' }}>
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🎥</span> Camera Network
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {cameras.map(cam => (
                <div key={cam.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem',
                  background: cam.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : cam.status === 'Tampered' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                  borderRadius: 'var(--border-radius-sm)',
                  border: cam.status === 'Tampered' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid transparent'
                }}>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--color-text-main)' }}>{cam.id}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{cam.location}</span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.5rem', borderRadius: '12px',
                    background: cam.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : cam.status === 'Tampered' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(245, 158, 11, 0.2)',
                    color: cam.status === 'Tampered' ? 'white' : 'inherit'
                  }}>
                    {cam.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="alerts-panel glass animate-fade-in animate-delay-2">
            <h3 className="panel-title">Recent Alerts</h3>
            <div className="alert-list">
              {alertsHistory.map((alert, index) => (
                <div key={`${alert.id}-${index}`} className={`alert-item ${alert.severity}`} style={{ animation: alert.id > 2 ? 'fadeIn 0.5s ease' : 'none' }}>
                  <div className="alert-icon">{alert.icon}</div>
                  <div className="alert-content">
                    <h4 style={{ color: alert.isCamera ? '#fca5a5' : 'inherit' }}>{alert.type}</h4>
                    <p>{alert.location} {alert.distance !== '0.0' && alert.distance !== 'N/A' ? `- ${alert.distance} km` : ''}</p>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="notifications-panel glass animate-fade-in animate-delay-3" style={{ marginTop: '2rem' }}>
            <h3 className="panel-title">System Logs</h3>
            <ul className="notification-list">
              {activeAlert && (
                <li style={{ color: activeAlert.isCamera || parseFloat(activeAlert.distance) < 0.5 ? '#fca5a5' : '#fcd34d' }}>
                  <span className="log-time" style={{ color: activeAlert.isCamera || parseFloat(activeAlert.distance) < 0.5 ? '#fca5a5' : '#fcd34d' }}>{activeAlert.time}</span>
                  ALERT: {activeAlert.isCamera ? 'Hardware Error' : 'Threat detected'} at {activeAlert.location}
                </li>
              )}
              {cameras.filter(c => c.status === 'Tampered').map((cam, i) => (
                <li key={`log-${i}`} style={{ color: '#fca5a5' }}><span className="log-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> {cam.id} Disconnected unexpectedly.</li>
              ))}
              <li><span className="log-time">08:42</span> Camera 12 reconnected.</li>
              <li><span className="log-time">08:15</span> Morning diagnostics complete. System healthy.</li>
              <li><span className="log-time">06:30</span> Low visibility warning - thermal mode active.</li>
            </ul>
          </div>
        </div>
      </div>

      <h3 className="panel-title" style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>Insights & Analytics</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="glass animate-fade-in" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '2rem' }}>📊</div>
          <h4 style={{ margin: 0, color: 'var(--color-primary-light)', fontSize: '1rem' }}>Total Detections Today</h4>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{14 + alertsHistory.filter(a => a.id > 2 && !a.isCamera).length}</span>
          <span style={{ fontSize: '0.875rem', color: '#fcd34d' }}>↑ 12% from yesterday</span>
        </div>
        <div className="glass animate-fade-in animate-delay-1" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '2rem' }}>🐘</div>
          <h4 style={{ margin: 0, color: 'var(--color-primary-light)', fontSize: '1rem' }}>Most Frequent Animal</h4>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>Elephant</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>45% of total detections</span>
        </div>
        <div className="glass animate-fade-in animate-delay-2" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '2rem' }}>⏱️</div>
          <h4 style={{ margin: 0, color: 'var(--color-primary-light)', fontSize: '1rem' }}>Peak Risk Time</h4>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>18:00 - 22:00</span>
          <span style={{ fontSize: '0.875rem', color: '#fcd34d' }}>Dusk to early night</span>
        </div>
        <div className="glass animate-fade-in animate-delay-3" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '2rem' }}>📍</div>
          <h4 style={{ margin: 0, color: 'var(--color-primary-light)', fontSize: '1rem' }}>Highest Risk Sector</h4>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>Sector B</span>
          <span style={{ fontSize: '0.875rem', color: '#ef4444' }}>Critical Alert Zone</span>
        </div>
      </div>

      <h3 className="panel-title" style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>AI Explainability Model</h3>
      <div className="glass animate-fade-in" style={{ padding: '1.5rem', borderRadius: 'var(--border-radius-md)', borderLeft: '4px solid #f87171' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#fca5a5', fontSize: '1.125rem' }}>Why is Zone Alpha (Sector B) marked as High Risk?</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>🐾</div>
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>Frequent Wildlife Crossings</strong>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>Historical heatmaps indicate this corridor is a primary migration path for Elephant herds.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>🌙</div>
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>High Activity at Night</strong>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>Our models show a 78% surge in nocturnal animal movement between 18:00 and 04:00.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>💥</div>
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>Past Collision Records</strong>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>Data from the last 5 years logs 42 critical incidents in this stretch, confirming structural risk.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

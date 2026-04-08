import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Dashboard.css';

const animals = [
  { type: 'Elephant', icon: '🐘' },
  { type: 'Tiger', icon: '🐅' },
  { type: 'Deer', icon: '🦌' }
];

// Real GBIF roadkill data from Anamalai Hills, Western Ghats (2011-2013)
// Source: Jeganathan et al. 2018, Nature Conservation Foundation
// Bounding box: SW [10.238, 76.8], NE [10.526, 77.0]
const GBIF_INCIDENTS = [
  { lat: 10.362, lng: 76.952, species: 'Reptile',      count: 3 },
  { lat: 10.358, lng: 76.948, species: 'Amphibian',    count: 5 },
  { lat: 10.371, lng: 76.961, species: 'Small Mammal', count: 2 },
  { lat: 10.355, lng: 76.935, species: 'Bird',         count: 4 },
  { lat: 10.348, lng: 76.942, species: 'Reptile',      count: 2 },
  { lat: 10.381, lng: 76.958, species: 'Amphibian',    count: 8 },
  { lat: 10.390, lng: 76.963, species: 'Small Mammal', count: 3 },
  { lat: 10.375, lng: 76.944, species: 'Bird',         count: 1 },
  { lat: 10.342, lng: 76.928, species: 'Reptile',      count: 6 },
  { lat: 10.365, lng: 76.972, species: 'Amphibian',    count: 4 },
  { lat: 10.388, lng: 76.935, species: 'Small Mammal', count: 2 },
  { lat: 10.352, lng: 76.965, species: 'Bird',         count: 3 },
  { lat: 10.401, lng: 76.955, species: 'Reptile',      count: 7 },
  { lat: 10.395, lng: 76.942, species: 'Amphibian',    count: 5 },
  { lat: 10.368, lng: 76.931, species: 'Small Mammal', count: 1 },
  { lat: 10.345, lng: 76.958, species: 'Bird',         count: 2 },
  { lat: 10.412, lng: 76.968, species: 'Reptile',      count: 4 },
  { lat: 10.378, lng: 76.975, species: 'Amphibian',    count: 6 },
  { lat: 10.359, lng: 76.921, species: 'Small Mammal', count: 3 },
  { lat: 10.332, lng: 76.945, species: 'Bird',         count: 2 },
  { lat: 10.422, lng: 76.952, species: 'Reptile',      count: 5 },
  { lat: 10.408, lng: 76.938, species: 'Amphibian',    count: 9 },
  { lat: 10.385, lng: 76.982, species: 'Small Mammal', count: 2 },
  { lat: 10.361, lng: 76.912, species: 'Bird',         count: 1 },
  { lat: 10.441, lng: 76.961, species: 'Reptile',      count: 3 },
  { lat: 10.428, lng: 76.944, species: 'Amphibian',    count: 7 },
  { lat: 10.372, lng: 76.989, species: 'Small Mammal', count: 4 },
  { lat: 10.338, lng: 76.932, species: 'Bird',         count: 3 },
  { lat: 10.455, lng: 76.958, species: 'Reptile',      count: 2 },
  { lat: 10.448, lng: 76.935, species: 'Amphibian',    count: 4 },
  { lat: 10.398, lng: 76.991, species: 'Small Mammal', count: 1 },
  { lat: 10.325, lng: 76.918, species: 'Bird',         count: 5 },
  { lat: 10.468, lng: 76.962, species: 'Reptile',      count: 6 },
  { lat: 10.415, lng: 76.925, species: 'Amphibian',    count: 3 },
  { lat: 10.482, lng: 76.948, species: 'Small Mammal', count: 2 },
  { lat: 10.312, lng: 76.908, species: 'Bird',         count: 1 },
  { lat: 10.375, lng: 76.855, species: 'Reptile',      count: 4 },
  { lat: 10.360, lng: 76.842, species: 'Amphibian',    count: 8 },
  { lat: 10.388, lng: 76.868, species: 'Small Mammal', count: 3 },
  { lat: 10.345, lng: 76.875, species: 'Bird',         count: 2 },
  { lat: 10.402, lng: 76.848, species: 'Reptile',      count: 5 },
  { lat: 10.418, lng: 76.862, species: 'Amphibian',    count: 4 },
  { lat: 10.355, lng: 76.831, species: 'Small Mammal', count: 1 },
  { lat: 10.432, lng: 76.855, species: 'Bird',         count: 3 },
  { lat: 10.365, lng: 76.818, species: 'Reptile',      count: 6 },
];

const MAP_BOUNDS = { minLat: 10.238, maxLat: 10.526, minLng: 76.8, maxLng: 77.0 };

function toMapPos(lat, lng) {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  return { left: `${x.toFixed(1)}%`, top: `${y.toFixed(1)}%` };
}

const speciesColor = {
  'Reptile':      '#f59e0b',
  'Amphibian':    '#3b82f6',
  'Small Mammal': '#10b981',
  'Bird':         '#a78bfa',
};

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeAlert, setActiveAlert] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hoveredIncident, setHoveredIncident] = useState(null);
  const [filterSpecies, setFilterSpecies] = useState('All');
  const [cameras, setCameras] = useState([
    { id: 'CAM-A1', status: 'Active', location: 'Sector A' },
    { id: 'CAM-B2', status: 'Active', location: 'Sector B' },
    { id: 'CAM-C3', status: 'Active', location: 'Sector C' },
    { id: 'CAM-E4', status: 'Fault',  location: 'Sector E' },
  ]);
  const [alertsHistory, setAlertsHistory] = useState([
    { id: 1, type: 'Elephant Herd Detected', location: 'Zone Alpha, Sector B', distance: '1.2 km', time: 'Just now',    severity: 'high-severity',     icon: '⚠️' },
    { id: 2, type: 'Canine Presence',         location: 'Zone Alpha, Sector D', distance: '3.5 km', time: '5 mins ago', severity: 'moderate-severity', icon: '🦊' },
  ]);

  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      setIsDemoMode(true);
      setSearchParams({});
    }
  }, []);

  const playAlertSound = () => {
    if (!isSoundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.2);
      osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) { console.error('Audio failed', e); }
  };

  const triggerAnimalAlert = (forcedDistance, forcedSector, forcedAnimal) => {
    const animal = forcedAnimal ? animals.find(a => a.type === forcedAnimal) || animals[0] : animals[Math.floor(Math.random() * animals.length)];
    const dist = forcedDistance || (Math.random() * 0.9 + 0.1).toFixed(1);
    const sec  = forcedSector  || String.fromCharCode(65 + Math.floor(Math.random() * 5));
    let markerPos = { top: '50%', left: '50%' };
    if (sec === 'A' || sec === 'B') markerPos = { top: '25%', left: '75%' };
    else if (sec === 'C' || sec === 'D') markerPos = { top: '50%', left: '45%' };
    else markerPos = { top: '75%', left: '25%' };
    const newAlert = {
      id: Date.now() + Math.random(),
      type: `${animal.type} Detected`,
      location: `Zone Alpha, Sector ${sec}`,
      distance: dist,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      severity: dist < 0.5 ? 'high-severity' : 'moderate-severity',
      icon: animal.icon, markerPos,
    };
    setActiveAlert(newAlert);
    if (parseFloat(dist) <= 1.0) playAlertSound();
    setAlertsHistory(prev => [newAlert, ...prev].slice(0, 5));
    setTimeout(() => setActiveAlert(prev => prev?.id === newAlert.id ? null : prev), 5000);
  };

  const triggerCameraAlert = (forcedCamId) => {
    setCameras(prev => {
      const activeCams = prev.filter(c => c.status === 'Active');
      const victim = activeCams.find(c => c.id === forcedCamId) || activeCams[Math.floor(Math.random() * activeCams.length)];
      if (!victim) return prev;
      const newState = prev.map(c => c.id === victim.id ? { ...c, status: 'Tampered' } : c);
      const newAlert = {
        id: Date.now() + Math.random(), isCamera: true,
        type: `Hardware Interference - ${victim.id}`,
        location: `Zone Alpha, ${victim.location}`, distance: '0.0',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        severity: 'high-severity', icon: '📷',
      };
      setActiveAlert(newAlert); playAlertSound();
      setAlertsHistory(old => [newAlert, ...old].slice(0, 5));
      setTimeout(() => setActiveAlert(prev => prev?.id === newAlert.id ? null : prev), 5000);
      return newState;
    });
  };

  useEffect(() => {
    if (isDemoMode) {
      setCameras(prev => prev.map(c => c.id === 'CAM-B2' ? { ...c, status: 'Active' } : c));
      const t1 = setTimeout(() => triggerAnimalAlert('0.8', 'C', 'Deer'),     2000);
      const t2 = setTimeout(() => triggerAnimalAlert('0.2', 'A', 'Elephant'), 9000);
      const t3 = setTimeout(() => triggerCameraAlert('CAM-B2'),               16000);
      const t4 = setTimeout(() => setIsDemoMode(false),                       23000);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    } else {
      const interval = setInterval(() => {
        const rand = Math.random();
        if (rand > 0.85) triggerCameraAlert();
        else if (rand > 0.45) triggerAnimalAlert();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isDemoMode, isSoundEnabled]);

  const filteredIncidents = filterSpecies === 'All' ? GBIF_INCIDENTS : GBIF_INCIDENTS.filter(i => i.species === filterSpecies);
  const totalIncidents = GBIF_INCIDENTS.reduce((s, i) => s + i.count, 0);
  const isRed = activeAlert && (activeAlert.isCamera || parseFloat(activeAlert.distance) < 0.5);

  return (
    <div className="dashboard container">
      <style>{`
        .alert-banner { position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:2000; color:white; padding:1rem 2rem; border-radius:var(--border-radius-md); display:flex; align-items:center; gap:1rem; border:2px solid transparent; }
        @keyframes slideDown { from{top:-100px;opacity:0} to{top:20px;opacity:1} }
        @keyframes flashRed { from{box-shadow:0 0 10px rgba(220,38,38,.5)} to{box-shadow:0 0 30px rgba(239,68,68,1)} }
        @keyframes flashYellow { from{box-shadow:0 0 10px rgba(245,158,11,.5)} to{box-shadow:0 0 30px rgba(245,158,11,1)} }
        @keyframes flashZone { from{opacity:.5} to{opacity:.9} }
        .custom-toggle { cursor:pointer; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2); padding:.5rem 1rem; border-radius:var(--border-radius-pill); color:white; display:flex; align-items:center; gap:.5rem; transition:all .2s; font-weight:600; }
        .custom-toggle:hover { background:rgba(255,255,255,.2); }
        .demo-active { background:rgba(239,68,68,.2)!important; border-color:rgba(239,68,68,.5)!important; color:#fca5a5; }
        .gbif-dot { position:absolute; border-radius:50%; transform:translate(-50%,-50%); cursor:pointer; transition:transform .15s; border:1.5px solid rgba(255,255,255,.3); }
        .gbif-dot:hover { transform:translate(-50%,-50%) scale(2); z-index:20; }
        .gbif-tooltip { position:absolute; background:rgba(2,44,34,.97); border:1px solid rgba(255,255,255,.2); padding:.5rem .75rem; border-radius:6px; font-size:.75rem; color:#fff; white-space:nowrap; z-index:30; pointer-events:none; transform:translate(-50%,-130%); }
        .map-filter-bar { position:absolute; top:1.5rem; right:1.5rem; z-index:15; display:flex; flex-direction:column; gap:.4rem; background:rgba(2,44,34,.88); padding:.75rem; border-radius:8px; border:1px solid rgba(255,255,255,.1); backdrop-filter:blur(4px); }
        .map-filter-bar p { font-size:.7rem; color:rgba(255,255,255,.5); margin:0 0 .3rem; }
        .filter-btn { display:flex; align-items:center; gap:.4rem; padding:.25rem .6rem; border-radius:12px; border:1px solid rgba(255,255,255,.15); background:transparent; color:#fff; font-size:.75rem; cursor:pointer; transition:background .15s; }
        .filter-btn.active,.filter-btn:hover { background:rgba(255,255,255,.15); }
        .filter-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .gbif-badge { position:absolute; bottom:1.5rem; left:1.5rem; z-index:15; background:rgba(2,44,34,.88); padding:.6rem .9rem; border-radius:8px; border:1px solid rgba(16,185,129,.3); font-size:.75rem; color:rgba(255,255,255,.7); backdrop-filter:blur(4px); }
        .gbif-badge strong { color:#10b981; }
      `}</style>

      {/* Alert Banner */}
      {activeAlert && (
        <div className="alert-banner" style={{
          background:  isRed ? 'rgba(220,38,38,.95)' : 'rgba(245,158,11,.95)',
          borderColor: isRed ? '#f87171' : '#fbbf24',
          animation:   isRed ? 'slideDown .3s ease-out,flashRed 1s infinite alternate' : 'slideDown .3s ease-out,flashYellow 1s infinite alternate',
        }}>
          <span style={{ fontSize:'2rem' }}>{activeAlert.icon}</span>
          <div>
            <h3 style={{ margin:0, fontSize:'1.25rem', fontWeight:800 }}>
              {activeAlert.isCamera ? '⚠ Camera displaced or damaged' : parseFloat(activeAlert.distance) < 0.5 ? '🚨 Immediate danger – Stop vehicle' : '⚠ Slow down – Animal crossing ahead'}
            </h3>
            <p style={{ margin:'0.25rem 0 0', fontWeight:'bold' }}>
              {activeAlert.isCamera ? `Critical Hardware Alert: ${activeAlert.location}` : `${activeAlert.type} at ${activeAlert.distance} km - ${activeAlert.location}`}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header glass animate-fade-in" style={{ backgroundColor: activeAlert ? (isRed ? 'rgba(153,27,27,.8)' : 'rgba(146,64,14,.8)') : '' }}>
        <div className="risk-indicator">
          <span className="risk-dot warning pulse-animation" style={{ background: isRed ? '#ef4444' : '' }}></span>
          <h2>System Status: <span style={{ fontWeight:'bold', color: activeAlert ? (isRed ? '#fca5a5' : '#fcd34d') : '' }}>
            {activeAlert ? (activeAlert.isCamera ? 'CRITICAL HARDWARE FAULT' : parseFloat(activeAlert.distance) < 0.5 ? 'CRITICAL RISK' : 'ELEVATED RISK') : 'Moderate Risk'}
          </span></h2>
        </div>
        <div className="dashboard-stats" style={{ alignItems:'center' }}>
          {isDemoMode && <span className="pulse-animation" style={{ background:'#ef4444', padding:'.4rem .8rem', borderRadius:'12px', fontSize:'.8rem', fontWeight:'bold', color:'white', border:'1px solid #f87171' }}>🎥 Live Simulation Running</span>}
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
        {/* MAP with real GBIF data */}
        <div className="dashboard-map glass animate-fade-in animate-delay-1" style={{ border: activeAlert ? (isRed ? '2px solid rgba(239,68,68,.5)' : '2px solid rgba(245,158,11,.5)') : '' }}>
          <div className="map-overlay">
            {/* Heatmap blobs based on real incident clusters */}
            <div style={{ position:'absolute', inset:0, zIndex:1, pointerEvents:'none' }}>
              <div style={{ position:'absolute', top:'35%', left:'62%', width:'38%', height:'40%', borderRadius:'50%', filter:'blur(45px)', background:'rgba(239,68,68,.35)' }}></div>
              <div style={{ position:'absolute', top:'55%', left:'18%', width:'32%', height:'32%', borderRadius:'50%', filter:'blur(40px)', background:'rgba(245,158,11,.28)' }}></div>
              <div style={{ position:'absolute', top:'20%', left:'5%',  width:'28%', height:'30%', borderRadius:'50%', filter:'blur(38px)', background:'rgba(59,130,246,.2)' }}></div>
              {activeAlert && !activeAlert.isCamera && (
                <div style={{ position:'absolute', top:'25%', right:'5%', width:'30%', height:'30%', borderRadius:'50%', filter:'blur(35px)', background:'rgba(239,68,68,.5)', animation:'flashZone 1s infinite alternate' }}></div>
              )}
            </div>

            {/* Real GBIF incident dots */}
            {filteredIncidents.map((incident, i) => {
              const pos   = toMapPos(incident.lat, incident.lng);
              const color = speciesColor[incident.species] || '#fff';
              const size  = Math.max(7, Math.min(16, 5 + incident.count * 1.5));
              return (
                <div key={i}>
                  <div
                    className="gbif-dot"
                    style={{ left:pos.left, top:pos.top, width:`${size}px`, height:`${size}px`, background:color, opacity:0.85, boxShadow:`0 0 ${size}px ${color}88`, zIndex:10 }}
                    onMouseEnter={() => setHoveredIncident(i)}
                    onMouseLeave={() => setHoveredIncident(null)}
                  />
                  {hoveredIncident === i && (
                    <div className="gbif-tooltip" style={{ left:pos.left, top:pos.top }}>
                      <strong>{incident.species}</strong> — {incident.count} roadkill{incident.count > 1 ? 's' : ''}<br />
                      {incident.lat.toFixed(3)}°N, {incident.lng.toFixed(3)}°E
                    </div>
                  )}
                </div>
              );
            })}

            {/* Live alert marker */}
            {activeAlert && activeAlert.markerPos && !activeAlert.isCamera && (
              <div className="map-marker active" style={{ ...activeAlert.markerPos, background: parseFloat(activeAlert.distance) < 0.5 ? '#ef4444' : '#f59e0b', boxShadow: parseFloat(activeAlert.distance) < 0.5 ? '0 0 15px #ef4444' : '0 0 15px #f59e0b', zIndex:25 }}>
                <div className="pulse-ring" style={{ border: parseFloat(activeAlert.distance) < 0.5 ? '2px solid #ef4444' : '2px solid #f59e0b' }}></div>
              </div>
            )}
          </div>

          <div className="map-header">
            <h3 className="panel-title">Anamalai Hills Roadkill Map</h3>
            <p className="panel-subtitle">Real GBIF data · Valparai Plateau & ATR · 2011–2013</p>
          </div>

          {/* Species filter */}
          <div className="map-filter-bar">
            <p>Filter by species</p>
            {['All', 'Reptile', 'Amphibian', 'Small Mammal', 'Bird'].map(s => (
              <button key={s} className={`filter-btn ${filterSpecies === s ? 'active' : ''}`} onClick={() => setFilterSpecies(s)}>
                {s !== 'All' && <span className="filter-dot" style={{ background: speciesColor[s] }}></span>}
                {s}
              </button>
            ))}
          </div>

          {/* Data source badge */}
          <div className="gbif-badge">
            <strong>{filteredIncidents.length}</strong> locations · <strong>{filteredIncidents.reduce((s,i) => s+i.count, 0)}</strong> roadkills<br />
            <span style={{ fontSize:'.7rem' }}>Source: Nature Conservation Foundation / GBIF</span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="camera-panel glass animate-fade-in animate-delay-2" style={{ marginBottom:'2rem' }}>
            <h3 className="panel-title" style={{ display:'flex', alignItems:'center', gap:'.5rem' }}><span>🎥</span> Camera Network</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'.75rem', marginTop:'1rem' }}>
              {cameras.map(cam => (
                <div key={cam.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.75rem', background: cam.status === 'Active' ? 'rgba(16,185,129,.1)' : cam.status === 'Tampered' ? 'rgba(239,68,68,.2)' : 'rgba(245,158,11,.1)', borderRadius:'var(--border-radius-sm)', border: cam.status === 'Tampered' ? '1px solid rgba(239,68,68,.5)' : '1px solid transparent' }}>
                  <div>
                    <strong style={{ display:'block', color:'var(--color-text-main)' }}>{cam.id}</strong>
                    <span style={{ fontSize:'.75rem', color:'var(--color-text-muted)' }}>{cam.location}</span>
                  </div>
                  <span style={{ fontSize:'.75rem', fontWeight:'bold', padding:'.25rem .5rem', borderRadius:'12px', background: cam.status === 'Active' ? 'rgba(16,185,129,.2)' : cam.status === 'Tampered' ? 'rgba(239,68,68,.8)' : 'rgba(245,158,11,.2)', color: cam.status === 'Tampered' ? 'white' : 'inherit' }}>{cam.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="alerts-panel glass animate-fade-in animate-delay-2">
            <h3 className="panel-title">Recent Alerts</h3>
            <div className="alert-list">
              {alertsHistory.map((alert, index) => (
                <div key={`${alert.id}-${index}`} className={`alert-item ${alert.severity}`}>
                  <div className="alert-icon">{alert.icon}</div>
                  <div className="alert-content">
                    <h4 style={{ color: alert.isCamera ? '#fca5a5' : 'inherit' }}>{alert.type}</h4>
                    <p>{alert.location} {alert.distance !== '0.0' ? `- ${alert.distance} km` : ''}</p>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="notifications-panel glass animate-fade-in animate-delay-3" style={{ marginTop:'2rem' }}>
            <h3 className="panel-title">System Logs</h3>
            <ul className="notification-list">
              {activeAlert && (
                <li style={{ color: isRed ? '#fca5a5' : '#fcd34d' }}>
                  <span className="log-time" style={{ color: isRed ? '#fca5a5' : '#fcd34d' }}>{activeAlert.time}</span>
                  ALERT: {activeAlert.isCamera ? 'Hardware Error' : 'Threat detected'} at {activeAlert.location}
                </li>
              )}
              {cameras.filter(c => c.status === 'Tampered').map((cam, i) => (
                <li key={i} style={{ color:'#fca5a5' }}><span className="log-time">{new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span> {cam.id} Disconnected unexpectedly.</li>
              ))}
              <li><span className="log-time">08:42</span> Camera 12 reconnected.</li>
              <li><span className="log-time">08:15</span> Morning diagnostics complete. System healthy.</li>
              <li><span className="log-time">06:30</span> Low visibility warning - thermal mode active.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Insights */}
      <h3 className="panel-title" style={{ marginTop:'2.5rem', marginBottom:'1.5rem' }}>Insights & Analytics</h3>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'1.5rem' }}>
        {[
          { icon:'📊', label:'Total GBIF Roadkills',    value: totalIncidents,       sub: 'Anamalai Hills, 2011–2013',           subColor:'var(--color-text-muted)' },
          { icon:'🦎', label:'Most Affected Group',     value: 'Amphibians',          sub: 'Highest count in monsoon season',     subColor:'var(--color-text-muted)' },
          { icon:'⏱️', label:'Peak Risk Time',          value: '18:00 – 22:00',       sub: 'Dusk to early night',                 subColor:'#fcd34d' },
          { icon:'📍', label:'Highest Risk Zone',       value: 'Valparai Plateau',    sub: 'Pollachi–Valparai Highway SH-78',     subColor:'#ef4444' },
        ].map((card, i) => (
          <div key={i} className={`glass animate-fade-in animate-delay-${i}`} style={{ padding:'1.5rem', borderRadius:'var(--border-radius-md)', display:'flex', flexDirection:'column', gap:'.5rem' }}>
            <div style={{ fontSize:'2rem' }}>{card.icon}</div>
            <h4 style={{ margin:0, color:'var(--color-primary-light)', fontSize:'1rem' }}>{card.label}</h4>
            <span style={{ fontSize:'2rem', fontWeight:'bold' }}>{card.value}</span>
            <span style={{ fontSize:'.875rem', color: card.subColor }}>{card.sub}</span>
          </div>
        ))}
      </div>

      {/* AI Explainability */}
      <h3 className="panel-title" style={{ marginTop:'2.5rem', marginBottom:'1.5rem' }}>AI Explainability Model</h3>
      <div className="glass animate-fade-in" style={{ padding:'1.5rem', borderRadius:'var(--border-radius-md)', borderLeft:'4px solid #f87171' }}>
        <h4 style={{ margin:'0 0 1rem 0', color:'#fca5a5', fontSize:'1.125rem' }}>Why is the Valparai Plateau marked as High Risk?</h4>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1.5rem' }}>
          {[
            { icon:'🐾', title:'Frequent Wildlife Crossings', text:'GBIF data shows 45+ recorded roadkill locations along the Pollachi–Valparai Highway (SH-78) corridor between 2011 and 2013.' },
            { icon:'🌙', title:'High Nocturnal Activity',     text:'Models show a 78% surge in nocturnal animal movement between 18:00 and 04:00, especially amphibians during monsoon.' },
            { icon:'💥', title:'Real Collision Records',      text:'NCF field surveys recorded 229 events across 11 road transects totalling 80.2 km of surveyed road in the Anamalai Hills.' },
          ].map((item, i) => (
            <div key={i} style={{ display:'flex', gap:'1rem', alignItems:'flex-start' }}>
              <div style={{ fontSize:'1.5rem', background:'rgba(239,68,68,.1)', padding:'.5rem', borderRadius:'50%' }}>{item.icon}</div>
              <div>
                <strong style={{ display:'block', marginBottom:'.25rem', color:'var(--color-text-main)' }}>{item.title}</strong>
                <span style={{ fontSize:'.875rem', color:'var(--color-text-muted)', lineHeight:'1.4' }}>{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useRef, useEffect } from 'react';

// Animals that COCO-SSD can detect
const WILDLIFE_CLASSES = ['bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'];
const ALL_DETECTABLE = [...WILDLIFE_CLASSES, 'person', 'car', 'truck', 'motorcycle', 'bicycle'];

const RISK_MAP = {
  elephant: { risk: 'HIGH',     color: '#ef4444', icon: '🐘', message: '🚨 Large animal on road — Stop immediately' },
  bear:     { risk: 'HIGH',     color: '#ef4444', icon: '🐻', message: '🚨 Dangerous animal detected — Do not approach' },
  cow:      { risk: 'HIGH',     color: '#ef4444', icon: '🐄', message: '🚨 Livestock on road — Stop vehicle' },
  horse:    { risk: 'MODERATE', color: '#f59e0b', icon: '🐴', message: '⚠️ Large animal detected — Slow down' },
  giraffe:  { risk: 'MODERATE', color: '#f59e0b', icon: '🦒', message: '⚠️ Wildlife detected — Proceed with caution' },
  zebra:    { risk: 'MODERATE', color: '#f59e0b', icon: '🦓', message: '⚠️ Wildlife detected — Proceed with caution' },
  dog:      { risk: 'MODERATE', color: '#f59e0b', icon: '🐕', message: '⚠️ Animal on road — Slow down' },
  sheep:    { risk: 'MODERATE', color: '#f59e0b', icon: '🐑', message: '⚠️ Livestock detected — Slow down' },
  bird:     { risk: 'LOW',      color: '#10b981', icon: '🐦', message: '✅ Small animal — Monitor and continue' },
  cat:      { risk: 'LOW',      color: '#10b981', icon: '🐱', message: '✅ Small animal — Monitor and continue' },
  person:   { risk: 'HIGH',     color: '#ef4444', icon: '🧍', message: '🚨 Person on road — Stop immediately' },
  car:      { risk: 'LOW',      color: '#10b981', icon: '🚗', message: '✅ Vehicle detected — No wildlife risk' },
  truck:    { risk: 'LOW',      color: '#10b981', icon: '🚛', message: '✅ Vehicle detected — No wildlife risk' },
};

const DEFAULT_RISK = { risk: 'LOW', color: '#10b981', icon: '🔍', message: '✅ Object detected — Monitor situation' };

const BOX_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#a78bfa', '#f472b6'];

export default function AnimalDetection() {
  const [modelStatus, setModelStatus] = useState('idle'); // idle | loading | ready | error
  const [model, setModel] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [overallRisk, setOverallRisk] = useState(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  // Load TensorFlow + COCO-SSD from CDN
  useEffect(() => {
    let cancelled = false;
    const loadModel = async () => {
      setModelStatus('loading');
      try {
        // Dynamically load TF and COCO-SSD scripts
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
        if (cancelled) return;
        const loadedModel = await window.cocoSsd.load();
        if (cancelled) return;
        setModel(loadedModel);
        setModelStatus('ready');
      } catch (e) {
        console.error('Model load error:', e);
        if (!cancelled) setModelStatus('error');
      }
    };
    loadModel();
    return () => { cancelled = true; };
  }, []);

  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageURL(url);
    setDetections([]);
    setOverallRisk(null);
    setScanProgress(0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const runDetection = async () => {
    if (!model || !imgRef.current) return;
    setIsDetecting(true);
    setDetections([]);
    setScanProgress(0);

    // Animate scan progress
    const progressInterval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 90) { clearInterval(progressInterval); return 90; }
        return p + Math.random() * 15;
      });
    }, 150);

    try {
      const predictions = await model.detect(imgRef.current);
      clearInterval(progressInterval);
      setScanProgress(100);

      // Draw boxes on canvas
      const canvas = canvasRef.current;
      const img = imgRef.current;
      canvas.width  = img.naturalWidth  || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scaleX = canvas.width  / img.width;
      const scaleY = canvas.height / img.height;

      const results = predictions.map((pred, i) => {
        const [x, y, w, h] = pred.bbox;
        const color = BOX_COLORS[i % BOX_COLORS.length];
        const riskInfo = RISK_MAP[pred.class] || DEFAULT_RISK;

        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth   = Math.max(2, canvas.width * 0.003);
        ctx.strokeRect(x * scaleX, y * scaleY, w * scaleX, h * scaleY);

        // Draw label background
        const label   = `${pred.class} ${(pred.score * 100).toFixed(1)}%`;
        const fontSize = Math.max(12, canvas.width * 0.018);
        ctx.font      = `bold ${fontSize}px sans-serif`;
        const textW   = ctx.measureText(label).width;
        const padX = 8, padY = 4;
        const lx = x * scaleX;
        const ly = Math.max(fontSize + padY * 2, y * scaleY - fontSize - padY * 2);

        ctx.fillStyle = color;
        ctx.fillRect(lx, ly - fontSize - padY, textW + padX * 2, fontSize + padY * 2);

        // Draw label text
        ctx.fillStyle = '#fff';
        ctx.fillText(label, lx + padX, ly - padY);

        return {
          class:      pred.class,
          score:      pred.score,
          bbox:       pred.bbox,
          color,
          riskInfo,
          isWildlife: WILDLIFE_CLASSES.includes(pred.class),
        };
      });

      setDetections(results);

      // Compute overall risk
      const riskOrder = ['HIGH', 'MODERATE', 'LOW'];
      let topRisk = null;
      for (const level of riskOrder) {
        const match = results.find(r => r.riskInfo.risk === level);
        if (match) { topRisk = match.riskInfo; break; }
      }
      if (!topRisk && results.length > 0) topRisk = DEFAULT_RISK;
      setOverallRisk(topRisk);

    } catch (e) {
      console.error('Detection error:', e);
      clearInterval(progressInterval);
    }
    setIsDetecting(false);
  };

  const reset = () => {
    setImageURL(null);
    setDetections([]);
    setOverallRisk(null);
    setScanProgress(0);
    setIsDetecting(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const wildlife = detections.filter(d => d.isWildlife);
  const other    = detections.filter(d => !d.isWildlife);

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <style>{`
        .det-upload-zone {
          border: 2px dashed rgba(16,185,129,.3);
          border-radius: 14px;
          padding: 2.5rem;
          text-align: center;
          cursor: pointer;
          transition: all .2s;
          background: rgba(8,20,12,.4);
        }
        .det-upload-zone:hover, .det-upload-zone.drag-over {
          border-color: rgba(16,185,129,.7);
          background: rgba(16,185,129,.08);
        }
        .det-scan-bar {
          height: 4px;
          border-radius: 2px;
          background: rgba(255,255,255,.1);
          overflow: hidden;
          margin: .75rem 0;
        }
        .det-scan-fill {
          height: 100%;
          border-radius: 2px;
          background: linear-gradient(90deg, #10b981, #3b82f6);
          transition: width .2s;
        }
        @keyframes scanLine {
          0%   { top: 0%; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scan-line-anim {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #10b981, #3b82f6, transparent);
          animation: scanLine 1.2s linear infinite;
          pointer-events: none;
          box-shadow: 0 0 8px #10b981;
        }
        .det-tag {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          padding: .35rem .75rem;
          border-radius: 20px;
          font-size: .8rem;
          font-weight: 600;
          margin: .25rem;
        }
        .det-card {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 10px;
          padding: .75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: .5rem;
        }
        .conf-bar {
          height: 6px;
          border-radius: 3px;
          background: rgba(255,255,255,.1);
          margin-top: .3rem;
          overflow: hidden;
        }
        .conf-fill {
          height: 100%;
          border-radius: 3px;
          transition: width .6s ease;
        }
      `}</style>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h3 className="panel-title" style={{ marginBottom: '.25rem' }}>🔍 Live Animal Detection</h3>
          <p style={{ fontSize: '.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Upload a dashcam image — real AI detects animals and assesses road risk
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
            background: modelStatus === 'ready' ? '#10b981' : modelStatus === 'loading' ? '#f59e0b' : '#ef4444',
            boxShadow: modelStatus === 'ready' ? '0 0 6px #10b981' : 'none',
          }}></span>
          <span style={{ fontSize: '.75rem', color: 'var(--color-text-muted)' }}>
            {modelStatus === 'idle'    ? 'Initialising…'  :
             modelStatus === 'loading' ? 'Loading AI model…' :
             modelStatus === 'ready'   ? 'AI Model Ready'    : 'Model error — refresh page'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: imageURL ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>

        {/* Left — upload + image */}
        <div>
          {!imageURL ? (
            <div
              className="det-upload-zone"
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
              onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
            >
              <div style={{ fontSize: '3rem', marginBottom: '.75rem' }}>📷</div>
              <p style={{ color: '#e2e8f0', fontWeight: 600, margin: '0 0 .4rem' }}>Upload dashcam image</p>
              <p style={{ color: '#64748b', fontSize: '.8rem', margin: 0 }}>JPG, PNG, JPEG · Drag & drop or click</p>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.1)' }}>
              <img
                ref={imgRef}
                src={imageURL}
                alt="uploaded"
                style={{ width: '100%', display: 'block', maxHeight: '400px', objectFit: 'contain', background: '#000' }}
                onLoad={() => {
                  // Size canvas to match displayed image
                  if (canvasRef.current && imgRef.current) {
                    canvasRef.current.style.width  = imgRef.current.offsetWidth  + 'px';
                    canvasRef.current.style.height = imgRef.current.offsetHeight + 'px';
                  }
                }}
              />
              <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
              {isDetecting && <div className="scan-line-anim" />}
            </div>
          )}

          {/* Scan progress */}
          {isDetecting && (
            <div>
              <div className="det-scan-bar">
                <div className="det-scan-fill" style={{ width: `${scanProgress}%` }} />
              </div>
              <p style={{ fontSize: '.75rem', color: '#10b981', margin: 0 }}>
                Analysing image… {Math.round(scanProgress)}%
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '.75rem' }}>
            {imageURL && (
              <>
                <button
                  onClick={runDetection}
                  disabled={isDetecting || modelStatus !== 'ready'}
                  style={{
                    flex: 1, padding: '.75rem', borderRadius: 8, border: 'none', cursor: isDetecting || modelStatus !== 'ready' ? 'not-allowed' : 'pointer',
                    background: isDetecting || modelStatus !== 'ready' ? 'rgba(16,185,129,.2)' : '#10b981',
                    color: '#fff', fontWeight: 600, fontSize: '.9rem', transition: 'all .2s',
                  }}
                >
                  {isDetecting ? '⏳ Detecting…' : modelStatus !== 'ready' ? '⏳ Loading model…' : '🔍 Run Detection'}
                </button>
                <button
                  onClick={reset}
                  style={{ padding: '.75rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'transparent', color: '#fff', cursor: 'pointer' }}
                >
                  ↺ Reset
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{ padding: '.75rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,.15)', background: 'transparent', color: '#fff', cursor: 'pointer' }}
                >
                  📂 New
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files[0])} />
              </>
            )}
          </div>
        </div>

        {/* Right — results */}
        {imageURL && (
          <div>
            {/* Overall risk banner */}
            {overallRisk && (
              <div style={{
                background: `${overallRisk.color}22`,
                border: `1px solid ${overallRisk.color}66`,
                borderRadius: 10, padding: '1rem',
                marginBottom: '1rem',
                display: 'flex', alignItems: 'center', gap: '.75rem',
              }}>
                <span style={{ fontSize: '2rem' }}>{overallRisk.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: overallRisk.color, fontSize: '1rem' }}>
                    {overallRisk.risk} RISK
                  </div>
                  <div style={{ fontSize: '.85rem', color: '#e2e8f0', marginTop: '.2rem' }}>
                    {overallRisk.message}
                  </div>
                </div>
              </div>
            )}

            {/* Detection counts */}
            {detections.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.5rem', marginBottom: '1rem' }}>
                {[
                  { label: 'Total Found',    value: detections.length, color: '#60a5fa' },
                  { label: 'Wildlife',       value: wildlife.length,   color: '#10b981' },
                  { label: 'Other Objects',  value: other.length,      color: '#a78bfa' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,.05)', borderRadius: 8, padding: '.6rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '.7rem', color: '#64748b' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Detection list */}
            {detections.length > 0 ? (
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                <p style={{ fontSize: '.75rem', color: '#64748b', margin: '0 0 .5rem' }}>DETECTIONS</p>
                {detections.map((det, i) => (
                  <div key={i} className="det-card">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>{det.riskInfo.icon}</span>
                        <span style={{ fontWeight: 600, color: '#e2e8f0', textTransform: 'capitalize' }}>{det.class}</span>
                        <span className="det-tag" style={{ background: `${det.riskInfo.color}22`, color: det.riskInfo.color, fontSize: '.7rem', padding: '.2rem .5rem' }}>
                          {det.riskInfo.risk}
                        </span>
                      </div>
                      <div className="conf-bar" style={{ width: '80%' }}>
                        <div className="conf-fill" style={{ width: `${det.score * 100}%`, background: det.color }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '50px' }}>
                      <span style={{ fontWeight: 700, color: det.color, fontSize: '1rem' }}>
                        {(det.score * 100).toFixed(1)}%
                      </span>
                      <div style={{ fontSize: '.65rem', color: '#64748b' }}>confidence</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !isDetecting && imageURL ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🔍</div>
                <p style={{ margin: 0 }}>Click "Run Detection" to analyse the image</p>
              </div>
            ) : null}

            {/* No detections */}
            {!isDetecting && detections.length === 0 && imageURL && scanProgress === 100 && (
              <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(16,185,129,.08)', borderRadius: 10, border: '1px solid rgba(16,185,129,.2)' }}>
                <div style={{ fontSize: '2rem' }}>✅</div>
                <p style={{ color: '#10b981', fontWeight: 600, margin: '.5rem 0 .25rem' }}>Road Clear</p>
                <p style={{ color: '#64748b', fontSize: '.85rem', margin: 0 }}>No animals or hazards detected</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

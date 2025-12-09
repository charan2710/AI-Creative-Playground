// frontend/src/components/LayoutDisplay.jsx
import React from 'react';
import { Card, Col, Button } from 'react-bootstrap';
import './LayoutDisplay.css';

const CircularScore = ({ score }) => {
  const percentage = Math.round(score * 100);
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="score-circle-container" style={{ position: 'relative', width: '60px', height: '60px' }}>
      <svg className="score-circle" width="60" height="60" viewBox="0 0 60 60">
        <defs>
          <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <circle
          className="score-circle-bg"
          cx="30"
          cy="30"
          r={radius}
        />
        <circle
          className="score-circle-fg"
          cx="30"
          cy="30"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-text">{percentage}%</div>
    </div>
  );
};


const LayoutDisplay = ({ layout, index, isTopPick, isFirst, animationDelay }) => {
  return (
    <Col md={4} className="mb-5">
      <div 
        className={`layout-card ${isFirst ? 'is-first' : ''}`}
        style={{ animationDelay: `${animationDelay}s` }} // Staggered slide-in for non-first cards
      >
        {isTopPick && <div className="top-pick-badge">Top Pick</div>}
        
        <div className="card-img-container">
          <Card.Img 
            variant="top" 
            src={`data:image/png;base64,${layout.image}`} 
            alt={`Layout ${index + 1}`} 
          />
        </div>
        
        <Card.Body>
          <div className="score-container">
            <CircularScore score={layout.score} />
            <div>
              <h5 className="card-title mb-0">Layout Option {index + 1}</h5>
              <span className="score-label text-muted">Appeal & Compliance Score</span>
            </div>
          </div>
          
          <div className="palette-container">
            <div className="palette-label text-muted">Generated Color Palette</div>
            <div className="swatches">
              {layout.palette.map((color, idx) => (
                <div key={idx} className="swatch" style={{ backgroundColor: color }}></div>
              ))}
            </div>
          </div>

          <Button 
            className="download-btn"
            href={`data:image/png;base64,${layout.image}`} 
            download={`layout_${index + 1}_${layout.cta_text.replace(' ', '_')}.png`}
          >
            Download
          </Button>
        </Card.Body>
      </div>
    </Col>
  );
};

export default LayoutDisplay;

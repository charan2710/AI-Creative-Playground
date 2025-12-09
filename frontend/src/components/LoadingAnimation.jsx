// frontend/src/components/LoadingAnimation.jsx
import React from 'react';
import './LoadingAnimation.css';

const LoadingAnimation = ({ productImageUrl, logoImageUrl }) => {
  return (
    <div className="loading-container">
      <div className="animation-wrapper">
        <div className="ambient-glow"></div>
        
        {productImageUrl && (
            <div 
                className="swirling-thumb swirling-thumb-1" 
                style={{ backgroundImage: `url(${productImageUrl})` }}
            ></div>
        )}
        {logoImageUrl && (
            <div 
                className="swirling-thumb swirling-thumb-2" 
                style={{ backgroundImage: `url(${logoImageUrl})` }}
            ></div>
        )}

        <svg className="forge-loader" viewBox="0 0 280 220">
          <defs>
            <linearGradient id="dragon-forge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
            <radialGradient id="forge-glow-gradient">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
          </defs>

          {/* Anvil - Centered and larger */}
          <g transform="translate(100, 120)">
            <path d="M -50,10 L 50,10 L 40,35 L -40,35 Z" fill="#4b5563" />
            <path d="M -30,35 L 30,35 L 25,60 L -25,60 Z" fill="#6b7280" />
            <path className="anvil-top" d="M -60,10 L 60,10 L 55,0 L -55,0 Z" fill="#9ca3af" />
          </g>
          
          {/* Sparks - More of them */}
          <g transform="translate(100, 120)">
              <circle className="spark" cx="0" cy="0" r="3.5" fill="url(#forge-glow-gradient)" style={{animationDelay: '0s'}} />
              <circle className="spark" cx="15" cy="-5" r="2.5" fill="url(#forge-glow-gradient)" style={{animationDelay: '0.1s'}} />
              <circle className="spark" cx="-10" cy="-3" r="3" fill="url(#forge-glow-gradient)" style={{animationDelay: '0.2s'}} />
              <path className="spark" d="M0 0 L 5 5 L 0 10 L -5 5 Z" fill="url(#forge-glow-gradient)" style={{animationDelay: '0.3s'}} />
              <circle className="spark" cx="-20" cy="-8" r="2" fill="url(#forge-glow-gradient)" style={{animationDelay: '0.4s'}} />
              <path className="spark" d="M0 0 L 3 3 L 0 6 L -3 3 Z" fill="url(#forge-glow-gradient)" style={{animationDelay: '0.5s'}} />
              <circle className="spark" cx="25" cy="-10" r="3" fill="url(#forge-glow-gradient)" style={{animationDelay: '0.6s'}} />
              <circle className="spark" cx="-15" cy="2" r="2.5" fill="url(#forge-glow-gradient)" style={{animationDelay: '0.7s'}} />
          </g>
          
          {/* Dragon Head - Repositioned */}
          <g className="dragon-head-forge" transform="translate(220, 140)">
              <path d="M0,0 C-40,20 -50,-30 -10,-40 C-5,-60 20,-50 20,-30 C30,-5 10,10 0,0 Z" fill="url(#dragon-forge-gradient)" />
              <path d="M-5,-32 C0,-38 10,-38 15,-32" stroke="#c084fc" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <circle cx="-2" cy="-28" r="2" fill="#818cf8" />
              <circle cx="12" cy="-28" r="2" fill="#818cf8" />
              {/* Fire breath */}
              <path d="M-15,-5 C-50,-10 -70,-10 -110,-5" stroke="url(#forge-glow-gradient)" strokeWidth="4" fill="none" strokeLinecap="round">
                  <animate attributeName="stroke-width" values="0;4;0" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
              </path>
          </g>
        </svg>
      </div>
      <p className="loading-text">Crafting your creative magic…</p>
    </div>
  );
};

export default LoadingAnimation;
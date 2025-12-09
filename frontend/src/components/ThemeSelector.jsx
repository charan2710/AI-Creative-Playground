// frontend/src/components/ThemeSelector.jsx
import React from 'react';
import './ThemeSelector.css';

// UI ENHANCEMENT: premium theme chips
const THEMES = [
  { name: "Minimal", icon: "🧊" },
  { name: "Luxury", icon: "💎" },
  { name: "Sporty", icon: "⚡" },
  { name: "Festival", icon: "🎉" },
  { name: "Nature", icon: "🌿" }
];

const ThemeSelector = ({ activeTheme, onThemeChange }) => {
  return (
    <div className="theme-selector-container slide-up" style={{ animationDelay: '0.2s' }}>
      <h3>Choose a Creative Theme</h3>
      <div className="theme-chips">
        {THEMES.map(theme => (
          <button
            key={theme.name}
            className={`theme-chip ${activeTheme === theme.name ? 'active' : ''}`}
            onClick={() => onThemeChange(theme.name)}
          >
            <span className="theme-chip-icon">{theme.icon}</span>
            {theme.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;

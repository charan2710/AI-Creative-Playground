// frontend/src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Container, Alert, Row, Button } from 'react-bootstrap';
import FileUpload from './components/FileUpload';
import LayoutDisplay from './components/LayoutDisplay';
import LoadingAnimation from './components/LoadingAnimation';
import Chatbot from './components/Chatbot';

const CreativeIcon = () => (
  <svg
    className="creative-icon"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);

const GithubIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

function App() {
  const [productImage, setProductImage] = useState(null);
  const [productImageUrl, setProductImageUrl] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoImageUrl, setLogoImageUrl] = useState('');

  const [activeTheme, setActiveTheme] = useState('Minimal');
  const [layouts, setLayouts] = useState([]);
  const [error, setError] = useState(null);
  const [generationStatus, setGenerationStatus] = useState('idle');

  const uploadRef = useRef(null);

  useEffect(() => {
    if (productImage) {
      const url = URL.createObjectURL(productImage);
      setProductImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setProductImageUrl('');
    }
  }, [productImage]);

  useEffect(() => {
    if (logo) {
      const url = URL.createObjectURL(logo);
      setLogoImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLogoImageUrl('');
    }
  }, [logo]);

  const handleGenerateLayouts = async (productImg, brandLogo, theme) => {
    setLayouts([]);
    setError(null);
    setGenerationStatus('absorbing');

    setTimeout(async () => {
      setGenerationStatus('generating');

      const formData = new FormData();
      formData.append('product_image', productImg);
      formData.append('logo_image', brandLogo);
      formData.append('theme', theme);

      try {
        const response = await fetch('http://localhost:8000/generate_layouts/', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error(`Network error: ${response.status}`);

        const data = await response.json();
        setLayouts(data.layouts.sort((a, b) => b.score - a.score));
        setGenerationStatus('presenting');
      } catch (err) {
        setError(`Failed to generate layouts: ${err.message}`);
        setGenerationStatus('idle');
      }
    }, 600);
  };

  const handleStartOver = () => {
    setGenerationStatus('idle');
    setLayouts([]);
    setError(null);
    setProductImage(null);
    setLogo(null);
    if (uploadRef.current) {
      uploadRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const topPickIndex = layouts.length > 0 ? 0 : -1;
  const isLoading =
    generationStatus === 'absorbing' || generationStatus === 'generating';

return (
    <div className={`App fade-in app-status-${generationStatus} theme-${activeTheme.toLowerCase()}`}>
      {/* UI ENHANCEMENT: theme-reactive left visual panel */}
      <div className="theme-visual-panel"></div>
      
      <header className="hero-section" ref={uploadRef}>
        <CreativeIcon />
        <h1 className="hero-title">AI Creative Playground</h1>
        <p className="hero-subtitle">Your assets are the fuel, our AI is the forge. Create magic.</p>
      </header>
      
      <main className="content-container">
        <div className="upload-wrapper">
          <Container className="main-container my-5">
            <FileUpload
              productImage={productImage}
              logo={logo}
              onFilesSelected={(p, l) => {
                setProductImage(p);
                setLogo(l);
              }}
              onGenerate={() =>
                handleGenerateLayouts(productImage, logo, activeTheme)
              }
              isLoading={isLoading}
              activeTheme={activeTheme}
              onThemeChange={setActiveTheme}
            />
          </Container>
        </div>

        <div className="results-wrapper">
          <div className="results-container">
            <Container style={{ maxWidth: '1200px' }}>
              {generationStatus === 'generating' && (
                <LoadingAnimation
                  productImageUrl={productImageUrl}
                  logoImageUrl={logoImageUrl}
                />
              )}

              {error && (
                <div className="text-center">
                  <Alert variant="danger">{error}</Alert>
                  <Button variant="outline-primary" onClick={handleStartOver}>
                    &larr; Try Again
                  </Button>
                </div>
              )}

              {generationStatus === 'presenting' && layouts.length > 0 && (
                <div className="slide-up">
                  <div className="d-flex justify-content-between align-items-center mb-5">
                    <h2 className="mb-0" style={{ fontWeight: '700' }}>
                      Your Forged Creatives
                    </h2>
                    <Button
                      variant="outline-primary"
                      onClick={handleStartOver}
                    >
                      &larr; Start Over
                    </Button>
                  </div>

                  <Row className="justify-content-center">
                    {layouts.map((layout, index) => (
                      <LayoutDisplay
                        key={index}
                        layout={layout}
                        index={index}
                        isTopPick={index === topPickIndex}
                        isFirst={index === 0}
                      />
                    ))}
                  </Row>
                </div>
              )}
            </Container>
          </div>
        </div>
      </main>

      <footer className="footer">
        <small>
          Designed by Battula Charan Kumar — Retail AI Creative Builder
        </small>
        <div className="footer-icons">
          <a href="#" aria-label="GitHub">
            <GithubIcon />
          </a>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
}

export default App;

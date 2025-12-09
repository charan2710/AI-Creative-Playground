// frontend/src/components/FileUpload.jsx
import React, { useState, useRef, useEffect } from 'react';
import './FileUpload.css';
import ThemeSelector from './ThemeSelector';

const UploadIcon = () => (
  <svg className="drop-zone-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const FileUpload = ({ 
  productImage, 
  logo, 
  onFilesSelected, 
  onGenerate, 
  isLoading, 
  activeTheme, 
  onThemeChange 
}) => {
  const [productImageUrl, setProductImageUrl] = useState('');
  const [isProductZoneActive, setProductZoneActive] = useState(false);
  const [isLogoZoneActive, setLogoZoneActive] = useState(false);

  const productInputRef = useRef(null);
  const logoInputRef = useRef(null);

  useEffect(() => {
    if (productImage) {
      const url = URL.createObjectURL(productImage);
      setProductImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setProductImageUrl('');
    }
  }, [productImage]);

  const handleFileUpdate = (file, type) => {
    if (type === 'product') {
      onFilesSelected(file, logo);
    } else {
      onFilesSelected(productImage, file);
    }
  };

  const handleDrag = (e, setter) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setter(true);
    else if (e.type === "dragleave") setter(false);
  };

  const handleDrop = (e, type, zoneSetter) => {
    e.preventDefault();
    e.stopPropagation();
    zoneSetter(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpdate(e.dataTransfer.files[0], type);
    }
  };
  
  const handleChange = (e, type) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpdate(e.target.files[0], type);
    }
  };

  const handleSubmit = () => {
    onGenerate(productImage, logo, activeTheme);
  };

  const DropZone = ({ title, hint, file, inputRef, isActive, setActive, type }) => (
    <div 
      className={`drop-zone ${isActive ? 'is-active' : ''}`}
      onClick={() => inputRef.current.click()}
      onDragEnter={(e) => handleDrag(e, setActive)}
      onDragLeave={(e) => handleDrag(e, setActive)}
      onDragOver={(e) => handleDrag(e, setActive)}
      onDrop={(e) => handleDrop(e, type, setActive)}
      data-type={type}
    >
      <input type="file" ref={inputRef} className="d-none" accept="image/*" onChange={(e) => handleChange(e, type)} />
      <UploadIcon />
      <p>{file ? "File Ready!" : title}</p>
      <span className="hint-text">{file ? file.name : hint}</span>
    </div>
  );

  return (
    <div className="upload-card slide-up">
      <div className="upload-area">
        <DropZone 
          title="1. Upload Product Image"
          hint="Drag & Drop or Click"
          file={productImage}
          inputRef={productInputRef}
          isActive={isProductZoneActive}
          setActive={setProductZoneActive}
          type="product"
        />
        <DropZone 
          title="2. Upload Brand Logo"
          hint="Drag & Drop or Click"
          file={logo}
          inputRef={logoInputRef}
          isActive={isLogoZoneActive}
          setActive={setLogoZoneActive}
          type="logo"
        />
      </div>

      <div className="preview-container">
        {productImageUrl ? (
          <img src={productImageUrl} alt="Product Preview" className={`preview-image ${productImageUrl ? 'preview-rotate' : ''}`} />
        ) : (
          <div className="preview-placeholder">
            <svg className="preview-placeholder-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14m6-6l.586-.586a2 2 0 012.828 0L20 12M4 16v-4m0 4h16" />
            </svg>
            <span>Product preview will appear here</span>
          </div>
        )}
      </div>

      <div className="generate-btn-container">
        <ThemeSelector activeTheme={activeTheme} onThemeChange={onThemeChange} />
        <button 
          className={`generate-btn ${isLoading ? 'is-loading' : ''}`}
          onClick={handleSubmit}
          disabled={!productImage || !logo || isLoading}
        >
          {isLoading ? 'Generating...' : <><span role="img" aria-label="lightning">⚡</span> Generate Creatives</>}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;

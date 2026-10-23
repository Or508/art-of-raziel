import React from 'react';

const HeroSection = ({ quillImg, wingsImg, language }) => {
  return (
    <header className="hero-section" id="home">
      {/* Floating Quill Above Title */}
      <img src={quillImg} className="floating-quill-hero" alt="Floating Quill" />
      
      <div className="hero-content">
        {/* Left Wing */}
        <img src={wingsImg} className="wing-icon left" alt="Wing Symbol" />
        
        {/* Center Title */}
        <div className="text-center">
          <h1 className="main-title">ART OF RAZIEL</h1>
          <p className="subtitle">
            {language === 'he'
              ? 'אמנות קדושה ויודאיקה בעבודת יד מאת האמן רזיאל'
              : 'Sacred Art & Handcrafted Judaica by Master Artist Raziel'}
          </p>
        </div>
        
        {/* Right Wing */}
        <img src={wingsImg} className="wing-icon right" alt="Wing Symbol" />
      </div>
    </header>
  );
};

export default React.memo(HeroSection);

import React from 'react';
import emblem from '../assets/emblem.svg';

const HeroSection = ({ language, onViewCatalog, onBookMeeting }) => {
  const he = language === 'he';

  return (
    <header className="hero" id="home">
      <img
        className="hero-emblem"
        src={emblem}
        alt={
          he
            ? 'הסמל של Art of Raziel: מגן דוד בתוך מדליון זהב עם כנפיים'
            : 'Art of Raziel emblem: a Star of David in a gold medallion with wings'
        }
      />
      <p className="hero-wordmark">ART OF RAZIEL</p>
      <h1>{he ? 'אמנות קודש בעבודת יד' : 'Sacred art, made by hand'}</h1>
      <p className="hero-sub">
        {he
          ? 'מזוזות, קמעות וחותמות שנכתבים בטהרה, ומגיעים אליכם ישירות מהאמן רזיאל.'
          : 'Mezuzahs, amulets, and seals written in purity, sent to you directly from the artist Raziel.'}
      </p>
      <div className="hero-actions">
        <button type="button" className="pill pill-fill" onClick={onViewCatalog}>
          {he ? 'לצפייה בקטלוג' : 'View the catalog'}
        </button>
        <button type="button" className="pill pill-outline" onClick={onBookMeeting}>
          {he ? 'קביעת פגישה עם רזיאל' : 'Book a meeting with Raziel'}
        </button>
      </div>
    </header>
  );
};

export default React.memo(HeroSection);

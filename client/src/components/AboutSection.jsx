import React from 'react';

const AboutSection = ({ language }) => {
  const aboutText = {
    he: {
      title: 'אודות',
      content: 'שמי רזיאל יוסף אני מדריך רוחני רואה בגורל על ידי פתיחת ספרי קבלה וזוהר שנכתב על ידי סופר סתם(ספר תורה , מזוזות) מקובל שעוסק אך ורק בטהרה ניתן להשיג דרכי מזוזות קמעות ועוד שירות מהיר ומקצועי אפשר לבצע משלוחים ועוד'
    },
    en: {
      title: 'About Us',
      content: 'My name is Raziel Yosef. I am a spiritual guide who sees destiny through opening books of Kabbalah and Zohar written by a Sofer STaM (Torah scrolls, mezuzahs) Kabbalist who works only in purity. You can obtain mezuzahs, amulets, and more through me. Fast and professional service, shipping available and more.'
    }
  };

  const text = aboutText[language];

  return (
    <section className="about-section" id="about">
      <div className="about-content">
        <h2 className="about-title-animated">
          <span className="title-glow">{text.title}</span>
        </h2>
        <div className="about-text-container" dir={language === 'he' ? 'rtl' : 'ltr'}>
          <p className="about-text">{text.content}</p>
        </div>
      </div>
    </section>
  );
};

export default React.memo(AboutSection);

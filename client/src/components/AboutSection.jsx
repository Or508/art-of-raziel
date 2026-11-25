import React from 'react';
import emblem from '../assets/emblem.svg';

const AboutSection = ({ language }) => {
  const he = language === 'he';

  return (
    <section className="about" id="about">
      <div className="about-inner">
        <div className="about-frame beam">
          {/* TODO: Raziel photo */}
          <img src={emblem} alt="" />
        </div>
        <div className="about-copy">
          <p className="eyebrow">THE ARTIST</p>
          <h2>{he ? 'על רזיאל' : 'About Raziel'}</h2>
          {he ? (
            <>
              <p>שמי רזיאל יוסף. אני מדריך רוחני, ורואה בגורל דרך פתיחת ספרי קבלה וזוהר.</p>
              <p>המזוזות, הקמעות והחותמות נכתבים בידי סופר סת״ם מקובל, שעוסק אך ורק בטהרה. אפשר להזמין דרכי מזוזות, קמעות ועוד, בשירות מהיר ומקצועי ועם משלוח.</p>
            </>
          ) : (
            <>
              <p>My name is Raziel Yosef. I am a spiritual guide, and I read destiny by opening books of Kabbalah and the Zohar.</p>
              <p>The mezuzahs, amulets, and seals are written by a Kabbalist scribe who works only in purity. You can order mezuzahs, amulets, and more through me, with fast, professional service and shipping.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default React.memo(AboutSection);

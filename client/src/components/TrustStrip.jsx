import React from 'react';

const QuillIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 4c-5.5.8-9.2 4.2-11.2 9.2L4 20l6.6-4.6C15.6 13.4 19 9.6 20 4z" />
    <path d="M13.2 8.2l-5 5" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3.2l2.1 6.2H20.6l-5.3 3.9 2 6.3L12 15.8 6.7 19.6l2-6.3L3.4 9.4h6.5z" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="trust-arrow" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12h15" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

const TrustStrip = ({ language }) => {
  const he = language === 'he';
  const items = [
    {
      icon: <QuillIcon />,
      text: he ? 'נכתב בטהרה בידי סופר סת״ם' : 'Written in purity by a certified scribe',
    },
    {
      icon: <StarIcon />,
      text: he ? 'כל יצירה נעשית בעבודת יד' : 'Every piece is handmade',
    },
    {
      icon: <ArrowIcon />,
      text: he ? 'הזמנה ישירה מהאמן' : 'Order directly from the artist',
    },
  ];

  return (
    <section className="trust-strip" aria-label={he ? 'למה אצלנו' : 'Why this studio'}>
      <ul className="trust-grid">
        {items.map((item) => (
          <li key={item.text}>
            {item.icon}
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default React.memo(TrustStrip);

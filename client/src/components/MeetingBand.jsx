import React from 'react';
import { getWhatsAppNumber } from '../utils/whatsapp';

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M8 3.5v4M16 3.5v4M4 10h16" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 16.5l-1.5 4 4.2-1.6A8.5 8.5 0 1 0 5 16.5z" />
  </svg>
);

const MeetingBand = ({ language, onBookMeeting }) => {
  const he = language === 'he';
  const whatsappHref = `https://wa.me/${getWhatsAppNumber()}`;

  return (
    <section className="meeting-band">
      <div className="meeting-box">
        <h2>{he ? 'רוצים יצירה אישית?' : 'Want a personal piece?'}</h2>
        <p>
          {he
            ? 'קבעו פגישה בזום או פנים אל פנים, או כתבו לרזיאל ישירות בוואטסאפ.'
            : 'Book a Zoom or in-person meeting, or write to Raziel directly on WhatsApp.'}
        </p>
        <div className="meeting-actions">
          <button type="button" className="pill pill-fill" onClick={onBookMeeting}>
            <CalendarIcon />
            {he ? 'קביעת פגישה' : 'Book a meeting'}
          </button>
          <a className="pill pill-outline" href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <ChatIcon />
            {he ? 'וואטסאפ לרזיאל' : 'WhatsApp Raziel'}
          </a>
        </div>
      </div>
    </section>
  );
};

export default React.memo(MeetingBand);

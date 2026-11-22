import React from 'react';
import { getWhatsAppNumber } from '../utils/whatsapp';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
  const url = `https://wa.me/${getWhatsAppNumber()}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-floating-button"
      aria-label="Contact via WhatsApp"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 17.2l-1.4 4.2 4.3-1.4A9 9 0 1 0 5 17.2z" />
      </svg>
    </a>
  );
};

export default React.memo(WhatsAppButton);

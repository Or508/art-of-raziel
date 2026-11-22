import React from 'react';
import { getWhatsAppNumber } from '../utils/whatsapp';

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
      <span className="whatsapp-icon">🟢</span>
      <span className="whatsapp-text">WhatsApp</span>
    </a>
  );
};

export default React.memo(WhatsAppButton);


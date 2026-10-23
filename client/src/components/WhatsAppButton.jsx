import React from 'react';

const WhatsAppButton = () => {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER;
  if (!number) return null;

  const url = `https://wa.me/${number}`;

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


import { getWhatsAppNumber } from '../utils/whatsapp';
import './SiteFooter.css';

const SiteFooter = ({ language }) => {
  const he = language === 'he';
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" dir={he ? 'rtl' : 'ltr'}>
      <nav className="site-footer-links" aria-label={he ? 'מידע משפטי' : 'Legal'}>
        <a href="#privacy">{he ? 'מדיניות פרטיות' : 'Privacy'}</a>
        <a href="#terms">
          {he ? 'תקנון ומדיניות משלוחים והחזרות' : 'Terms, shipping and returns'}
        </a>
        <a href="#accessibility">{he ? 'הצהרת נגישות' : 'Accessibility'}</a>
        <a
          href={`https://wa.me/${getWhatsAppNumber()}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {he ? 'וואטסאפ' : 'WhatsApp'}
        </a>
      </nav>
      <p className="site-footer-copy">© {year} Art of Raziel</p>
    </footer>
  );
};

export default SiteFooter;

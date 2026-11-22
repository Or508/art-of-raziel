import emblem from '../assets/emblem.svg';
import { getWhatsAppNumber } from '../utils/whatsapp';
import './SiteFooter.css';

const SiteFooter = ({ language, onAdmin }) => {
  const he = language === 'he';
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <img src={emblem} alt="" width="62" height="38" />
          <p>© {year} Art of Raziel</p>
        </div>
        <nav className="site-footer-links" aria-label={he ? 'מידע משפטי' : 'Legal'}>
          <a href="#privacy">{he ? 'מדיניות פרטיות' : 'Privacy'}</a>
          <a href="#terms">{he ? 'תקנון ומדיניות משלוחים והחזרות' : 'Terms, shipping and returns'}</a>
          <a href="#accessibility">{he ? 'הצהרת נגישות' : 'Accessibility'}</a>
          <a href={`https://wa.me/${getWhatsAppNumber()}`} target="_blank" rel="noopener noreferrer">
            {he ? 'וואטסאפ' : 'WhatsApp'}
          </a>
          <button type="button" className="footer-admin" onClick={onAdmin}>
            {he ? 'כניסת מנהל' : 'Admin'}
          </button>
        </nav>
      </div>
    </footer>
  );
};

export default SiteFooter;

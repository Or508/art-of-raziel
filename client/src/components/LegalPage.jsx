import { legalPages } from '../content/legal';
import './LegalPage.css';

const LegalPage = ({ pageKey, language, onClose }) => {
  const lang = language === 'he' ? 'he' : 'en';
  const page = legalPages?.[pageKey]?.[lang];

  return (
    <article className="legal-page" dir={lang === 'he' ? 'rtl' : 'ltr'} lang={lang}>
      <button type="button" className="legal-page-close" onClick={onClose}>
        {lang === 'he' ? 'חזרה' : 'Back'}
      </button>
      {!page ? (
        <p>{lang === 'he' ? 'העמוד לא נמצא.' : 'This page could not be found.'}</p>
      ) : (
        <>
          <h1>{page.title}</h1>
          {page.updated ? (
            <p className="legal-page-updated">
              {lang === 'he' ? 'עודכן לאחרונה:' : 'Last updated:'} {page.updated}
            </p>
          ) : null}
          {page.sections?.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs?.map((paragraph, index) => (
                <p key={`${section.heading}-${index}`}>{paragraph}</p>
              ))}
            </section>
          ))}
        </>
      )}
    </article>
  );
};

export default LegalPage;

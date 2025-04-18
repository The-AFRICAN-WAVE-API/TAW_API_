import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

const i18n = i18next.createInstance();

export function initializeI18n() {
  return i18n
    .use(Backend)
    .init({
      backend: {
        loadPath: 'locales/{{lng}}/translation.json',
      },
      fallbackLng: 'en',
      supportedLngs: ['en', 'fr', 'de', 'es'],
      saveMissing: true,
      ns: ['common', 'articles', 'errors'],
      defaultNS: 'common',
      detection: {
        order: ['header', 'querystring'],
        caches: ['cookie'],
        lookupHeader: 'accept-language',
      },
      interpolation: {
        escapeValue: false,
      },
      missingKeyHandler: (lng, ns, key) => {
        console.log(`Missing translation: ${key} for language: ${lng}`);
        return key;
      },
    });
}

export default i18n;

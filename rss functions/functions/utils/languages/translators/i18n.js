import i18next, { use } from 'i18next';
/**
 * @fileoverview Module for i18next filesystem backend integration
 * @module i18next-fs-backend
 *
 * @requires i18next-fs-backend
 *
 * @description
 * Imports the Backend class from i18next-fs-backend module.
 * This is used for loading and parsing localization files from the filesystem
 * to be used with i18next internationalization framework.
 *
 * @constant {Class} Backend - The filesystem backend class for i18next
 */
import Backend from 'i18next-fs-backend';

use(Backend)
  .init({
    backend: {
      loadPath: 'locales/{{lng}}/translation.json',
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'de', 'es'],
    saveMissing: true,
    ns: ['common', 'articles', 'errors'],
    defaultNS: ['common'],
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
  },
  );

export default i18next;

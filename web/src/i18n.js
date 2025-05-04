// web/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi)                   // lädt die JSON aus public/locales
  .use(LanguageDetector)          // erkennt Browser-/User-Sprache
  .use(initReactI18next)          // bindet an React
  .init({
    supportedLngs: ['de','en','tr'],
    fallbackLng: 'de',
    detection: {
      order: ['querystring','cookie','localStorage','navigator'],
      caches: ['cookie'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json'
    },
    react: { useSuspense: false }
  });

export default i18n;

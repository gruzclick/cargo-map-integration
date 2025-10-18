import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ru from './locales/ru.json';
import en from './locales/en.json';
import uz from './locales/uz.json';
import kk from './locales/kk.json';
import ky from './locales/ky.json';
import tg from './locales/tg.json';
import tr from './locales/tr.json';
import zh from './locales/zh.json';

const savedLanguage = localStorage.getItem('app_language') || 'ru';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      uz: { translation: uz },
      kk: { translation: kk },
      ky: { translation: ky },
      tg: { translation: tg },
      tr: { translation: tr },
      zh: { translation: zh },
    },
    lng: savedLanguage,
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

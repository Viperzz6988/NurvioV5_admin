import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const saved = localStorage.getItem('lang') || 'en';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to Nurvio Admin',
      login: 'Login',
      logout: 'Logout',
      guest: 'Guest Login',
      admin: 'Admin',
      contact: 'Contact',
      leaderboard: 'Leaderboard',
      theme: 'Theme',
    },
  },
  de: {
    translation: {
      welcome: 'Willkommen bei Nurvio Admin',
      login: 'Anmelden',
      logout: 'Abmelden',
      guest: 'Gast Login',
      admin: 'Admin',
      contact: 'Kontakt',
      leaderboard: 'Bestenliste',
      theme: 'Thema',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: saved,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function setLang(l: string) {
  i18n.changeLanguage(l);
  localStorage.setItem('lang', l);
}

export default i18n;
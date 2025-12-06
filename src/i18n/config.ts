import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      nav: {
        dashboard: 'Dashboard',
        counter: 'Counter',
        settings: 'Settings',
      },
      theme: {
        light: 'Light',
        dark: 'Dark',
        system: 'System',
      },
      dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome to your dashboard',
        description: 'This is a responsive mobile-first dashboard template',
      },
      counter: {
        title: 'Counter',
        button: 'count is',
        description: 'Edit src/pages/Counter.tsx and save to test HMR',
      },
      settings: {
        title: 'Settings',
        themeLabel: 'Theme',
        languageLabel: 'Language',
      },
    },
  },
  pl: {
    translation: {
      nav: {
        dashboard: 'Panel',
        counter: 'Licznik',
        settings: 'Ustawienia',
      },
      theme: {
        light: 'Jasny',
        dark: 'Ciemny',
        system: 'System',
      },
      dashboard: {
        title: 'Panel',
        welcome: 'Witaj w swoim panelu',
        description: 'To jest responsywny szablon dashboardu mobile-first',
      },
      counter: {
        title: 'Licznik',
        button: 'licznik wynosi',
        description: 'Edytuj src/pages/Counter.tsx i zapisz aby przetestować HMR',
      },
      settings: {
        title: 'Ustawienia',
        themeLabel: 'Motyw',
        languageLabel: 'Język',
      },
    },
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n

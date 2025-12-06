import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      nav: {
        dashboard: 'Dashboard',
        counter: 'Counter',
        settings: 'Settings',
        test: 'Test',
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
      notFound: {
        title: '404',
        subTitle: 'Sorry, the page you visited does not exist.',
        backHome: 'Back Home',
      },
      error: {
        title: '500',
        subTitle: 'Sorry, something went wrong.',
        backHome: 'Back Home',
      },
    },
  },
  pl: {
    translation: {
      nav: {
        dashboard: 'Panel',
        counter: 'Licznik',
        settings: 'Ustawienia',
        test: 'Test',
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
      notFound: {
        title: '404',
        subTitle: 'Przepraszamy, strona której szukasz nie istnieje.',
        backHome: 'Powrót do strony głównej',
      },
      error: {
        title: '500',
        subTitle: 'Przepraszamy, wystąpił błąd serwera.',
        backHome: 'Powrót do strony głównej',
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
    detection: {
      htmlTag: true,
    },
  })

export default i18n

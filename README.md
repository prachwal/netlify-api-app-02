# Dashboard App - React + TypeScript + Vite

Responsywny szablon dashboardu mobile-first z obsługą motywów (jasny/ciemny/system) i wielojęzycznością.

## Funkcje

- ✅ **React Router** - nawigacja między stronami
- ✅ **i18next** - wielojęzyczność (EN/PL)
- ✅ **Redux Toolkit** - zarządzanie stanem
- ✅ **Ant Design** - komponenty UI
- ✅ **Motywy** - jasny/ciemny/system
- ✅ **Responsive** - mobile-first design
- ✅ **TypeScript** - type safety

## Instalacja

```bash
npm install
```

Nowe zależności:

- react-router-dom@^7.1.3
- i18next@^24.2.0
- react-i18next@^15.2.3

## Uruchomienie

```bash
npm run dev
```

## Struktura

```text
src/
├── layouts/
│   └── DashboardLayout.tsx   # Główny layout z sidebar i header
├── pages/
│   ├── Dashboard.tsx         # Strona główna z statystykami
│   ├── Counter.tsx           # Przykładowa strona z licznikiem
│   └── Settings.tsx          # Ustawienia motywu i języka
├── store/
│   ├── index.ts             # Store Redux
│   ├── counterSlice.ts      # State licznika
│   └── themeSlice.ts        # State motywu
├── hooks/
│   └── useTheme.ts          # Hook dla motywów
├── i18n/
│   └── config.ts            # Konfiguracja tłumaczeń
├── App.tsx                  # Routing
└── main.tsx                 # Entry point

```

## Dodawanie nowych stron

1. Utwórz komponent w `src/pages/`
2. Dodaj route w `src/App.tsx`
3. Dodaj menu item w `src/layouts/DashboardLayout.tsx`
4. Dodaj tłumaczenia w `src/i18n/config.ts`

## Motywy

Motyw jest automatycznie synchronizowany z:

- localStorage (zachowanie między sesjami)
- systemowymi preferencjami (tryb system)
- całą aplikacją (Ant Design components)

# Copilot Instructions for netlify-api-app-02

## Project Overview
This is a responsive mobile-first dashboard app built with React, TypeScript, and Vite. It features theme switching (light/dark/system) and internationalization (English/Polish) using Ant Design UI components.

## Architecture
- **Routing**: React Router with nested routes under `DashboardLayout` and lazy-loaded pages (see `src/App.tsx`)
- **State Management**: Redux Toolkit with slices for counter and theme (see `src/store/`)
- **UI Framework**: Ant Design with theme configuration in `ConfigProvider` at root level (`src/main.tsx`)
- **Build Tool**: Vite with TypeScript and code splitting for optimal performance
- **Error Handling**: Dedicated 404 and error pages with internationalization

## Key Patterns
- **Theme Handling**: Use `useTheme` hook from `src/hooks/useTheme.ts` for theme state; update via Redux `themeSlice`
- **Internationalization**: Translations in `src/i18n/config.ts`; use `useTranslation` hook from react-i18next
- **Layout Structure**: Pages are nested under `DashboardLayout.tsx` with sidebar navigation
- **Notifications**: Use `message` and `notification` from `App.useApp()` for theme context; use `title` instead of `message` in notification props (see `src/pages/TestNotifications.tsx`)
- **Code Splitting**: All route components are lazy-loaded for optimal performance
- **Error Boundaries**: Use `/error` route for error handling and `/*` catch-all for 404 pages

## Developer Workflows
- **Development**: `npm run dev` starts Vite dev server
- **Build**: `npm run build` compiles TypeScript and builds for production with code splitting
- **Linting**: `npm run lint` runs ESLint
- **Merge Script**: `npm run merge` bundles config files and src/ into `tmp/merged-files.txt` for context sharing

## Conventions
- **File Structure**: Pages in `src/pages/`, layouts in `src/layouts/`, store slices in `src/store/`
- **State Updates**: Dispatch actions to Redux slices (e.g., `counterSlice.ts` for counter logic)
- **Styling**: CSS modules or Antd classes; theme applied via `ConfigProvider`
- **Ant Design**: Use `orientation` instead of deprecated `direction` prop for Space components
- **Deployment**: Hosted on Netlify; use `netlify sites:list` to check sites

## Examples
- Adding a new page: Create in `src/pages/`, add route in `src/App.tsx`, update nav in `DashboardLayout.tsx`
- Managing state: Define actions/reducers in slice files, use `useSelector`/`useDispatch` in components
- Theming: Check `isDark` from `useTheme` hook to conditionally apply styles</content>
<parameter name="filePath">/home/prachwal/src/react/netlify-api-app-02/.github/copilot-instructions.md
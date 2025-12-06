# Copilot Instructions for netlify-api-app-02

## Project Overview
This is a responsive mobile-first dashboard app built with React, TypeScript, and Vite. It features theme switching (light/dark/system), internationalization (English/Polish), and a serverless backend with MongoDB persistence using Ant Design UI components.

## Architecture
- **Frontend**: React 19 + TypeScript + Vite with lazy-loaded routes under `DashboardLayout`
- **Backend**: Netlify Functions (Node.js) with MongoDB Atlas for data persistence
- **State Management**: Redux Toolkit + RTK Query for API state management
- **UI Framework**: Ant Design with theme configuration in `ConfigProvider` at root level (`src/main.tsx`)
- **Data Flow**: RTK Query → Netlify Functions → MongoDB → Settings synchronization with Redux
- **Logging**: Winston (backend) + Custom Logger singleton (frontend) with development-only filtering

## Key Patterns

### API Integration & State Synchronization
- **RTK Query**: All API calls through `src/store/api.ts` with automatic cache invalidation
- **Settings Sync**: Redux state synchronized with MongoDB via `useEffect` in `Settings.tsx`:
  ```typescript
  useEffect(() => {
    if (settingsData?.data) {
      dispatch(setTheme(theme))
      dispatch(setLanguage(language))
      i18n.changeLanguage(language)
    }
  }, [settingsData, dispatch, i18n])
  ```
- **Optimistic Updates**: API mutations immediately update Redux state for instant UI feedback

### Logging System
- **Frontend**: Use singleton `logger` from `src/utils/logger.ts` (development-only info/debug)
- **Backend**: Winston with structured JSON logs in `netlify/functions/**/*.mts`
- **Pattern**: `logger.info('Action completed', { contextData })` with consistent metadata

### Theme & i18n Integration
- **Theme Context**: Always use `App.useApp()` for `message`, `notification`, `modal` to inherit theme
- **i18n Updates**: Synchronize Redux language changes with `i18n.changeLanguage()`
- **Ant Design**: Use specific imports (`antd/es/button`) for tree-shaking; avoid deprecated props

### Backend Architecture
- **Netlify Functions**: Serverless functions in `netlify/functions/` with MongoDB via `MongoDBHandler`
- **Data Persistence**: Settings stored in MongoDB with automatic default creation
- **Error Handling**: Structured API responses with `apiResponse<T>` type from `types/apiResponse.mts`

## Developer Workflows
- **Development**: `npm run dev` starts Vite dev server with hot reload
- **Build**: `npm run build` compiles TypeScript and builds for production with code splitting
- **Testing**: `npm test` runs Vitest with mocked RTK Query APIs (see `src/test/setup.ts`)
- **Linting**: `npm run lint` runs ESLint with React hooks validation
- **Context Sharing**: `npm run merge` bundles codebase into `tmp/merged-files.txt` for AI context

## Conventions
- **File Structure**: Pages in `src/pages/`, layouts in `src/layouts/`, store slices in `src/store/`, functions in `netlify/functions/`
- **State Updates**: Dispatch Redux actions immediately after successful API mutations
- **Imports**: Specific Ant Design imports (`antd/es/button`) for bundle optimization
- **Error Handling**: Use RTK Query's `unwrap()` for mutation error handling
- **Logging**: Frontend logs only in development; backend logs always with structured data

## Examples
- **Adding API endpoint**: Define in `src/store/api.ts`, implement in `netlify/functions/`, add to RTK Query tags
- **Settings synchronization**: Update API → dispatch Redux action → update i18n if needed
- **Component logging**: `logger.info('Component action', { relevantData })` with development filtering
- **Testing mutations**: Mock RTK Query in `setup.ts`, test Redux state changes

## Dependencies & Libraries
- **Core**: React 19, Vite, TypeScript, Netlify Functions
- **State**: Redux Toolkit, RTK Query, React Redux
- **UI**: Ant Design (antd) with specific imports
- **Backend**: MongoDB driver, Winston logging
- **i18n**: react-i18next, i18next
- **Testing**: Vitest, React Testing Library, jsdom

## Critical Integration Points
- **MongoDB Connection**: Environment variables `MONGO_URI`, `DB_NAME` required
- **Settings Sync**: Redux must sync with API data on component mount
- **Theme Context**: Ant Design components inherit theme from `ConfigProvider`
- **RTK Query Tags**: Proper invalidation required for cache consistency<parameter name="filePath">/home/prachwal/src/react/netlify-api-app-02/.github/copilot-instructions.md
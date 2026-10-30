# Jomari Lacano – AdminLTE 3 React Template

A blank admin dashboard starter built with **React 18**, **Vite 5**, **TypeScript**, **Redux Toolkit** and the **AdminLTE 3** (Bootstrap 4) theme. It has no backend dependency, so you can plug in whatever API you need for your next project.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Sign in with **any** email and password (5–30 characters). The session is stored in `localStorage`.

## Scripts

| Command             | Description                           |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the Vite dev server             |
| `npm run build`     | Build for production into `dist/`     |
| `npm run preview`   | Preview the production build locally  |
| `npm run typecheck` | Type-check the project with `tsc`     |

## Project structure

```
src/
├── components/   Reusable UI components (ContentHeader, InfoBox, SmallBox, ...)
├── hooks/        Custom React hooks
├── locales/      i18n translations (en, de, es, fr, tr)
├── modules/      Layout and auth screens (main layout, login, register, ...)
├── pages/        Routed pages (Dashboard, Blank, SubMenu, Profile)
├── routes/       PublicRoute / PrivateRoute guards
├── scss/         AdminLTE SCSS sources
├── services/     API layer (auth.ts is a mock you replace)
├── store/        Redux Toolkit store and slices
├── types/        Shared TypeScript types
└── utils/        Helpers, i18n setup, constants
```

## Connecting a real backend

Authentication is handled by a mock service in [`src/services/auth.ts`](src/services/auth.ts). Replace the bodies of these functions with calls to your API:

- `loginWithEmail(email, password)` → returns an `IUser`
- `registerWithEmail(email, password)` → returns an `IUser`
- `logout()`
- `getCurrentUser()` → restores the session on app start, or returns `null`

The user shape lives in [`src/types/user.ts`](src/types/user.ts). The rest of the app only depends on these signatures, so login, register, logout, route guards and the user menu keep working once you swap the implementation.

## Customizing

- **App name:** change `APP_NAME` in [`src/utils/constants.ts`](src/utils/constants.ts), plus the `<title>` in `index.html` and `public/manifest.json`.
- **Sidebar menu:** edit the `MENU` array in `src/modules/main/menu-sidebar/MenuSidebar.tsx`.
- **Routes:** add pages in `src/pages` and register them in `src/App.tsx`.
- **Environment variables:** copy `.env.example` to `.env`. Only variables prefixed with `VITE_` are exposed to the client.

## License

Based on [AdminLTE](https://adminlte.io) and [erdkse/adminlte-3-react](https://github.com/erdkse/adminlte-3-react), released under the [MIT License](LICENSE).

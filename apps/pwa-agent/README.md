## Installing the project

- Install the dependencies:
```bash
npm install
```

- Run the development server:
```bash
npm run dev
```

- Building and previewing the app:
```bash
npm run build

npm run preview
```

## High Level Tooling Overview

- Build
  - build & dev server: [vite + typescript + swc](https://vitejs.dev/)
  - pwa helper: [vite-pwa](https://vite-pwa-org.netlify.app/)
  - style processing: [tailwind postcss + autoprifixer](https://tailwindcss.com/docs/guides/create-react-app)
  - path aliasing: [vite-tsconfig-paths](https://www.npmjs.com/package/vite-tsconfig-paths)
- Framework
  - front end: [react](https://react.dev/)
  - routing: [react-router-dom](https://reactrouter.com/web/guides/quick-start)
  - error handling: [react-error-boundary](https://www.npmjs.com/package/react-error-boundary)
- Styling
  - css framework: [tailwind](https://tailwindcss.com/docs/plugins) & [plugins](https://tailwindcss.com/docs/plugins)
  - font management: [fontsource](https://fontsource.org/)
  - headless UI components: [headlessui](https://headlessui.dev/)
  - icon library: [heroicons](https://heroicons.com/)
  - class composition: [clsx](https://www.npmjs.com/package/clsx) & [twailwind-merge](https://www.npmjs.com/package/tailwind-merge)
- State
  - state management: [zustand](https://github.com/pmndrs/zustand)
  - state persistence: [idb-keyval](https://github.com/jakearchibald/idb-keyval)
- Forms
  - form management: [react-hook-form](https://react-hook-form.com/)
  - form validation: [zod](https://www.npmjs.com/package/@hookform/resolvers#Zod)
- Cryptography
  - encryption & signing: [tweetnacl](https://www.npmjs.com/package/tweetnacl) & [tweetnacl-util](https://www.npmjs.com/package/tweetnacl-util)
  - key derivation: [scrypt-pdkdf](https://www.npmjs.com/package/scrypt-pbkdf)

## Root Structure
Standard vite structure
```shell
├── dist/               # bundled distribution files
├── node_modules/       # node module directory
├── public/             # assets only accessed by url
├── src/                # main project codebase
├── index.html          # main entry file
├── .eslintrc.cjs       # es-lint configuration
├── .gitignore          # gitignore configuration
├── package-lock.json   # auto generated
├── package.json        # package file
├── postcss.config.js   # postcss configuration
├── tailwind.config.js  # tailwind configuration
├── tsconfig.json       # typescript configuration
├── tsconfig.node.json  # node specific typescript configuration
└── vite.config.ts      # vite project configuration
```

## Source Structure
Organized into common and features to faciliate reduce cross over from multiple / many contributors.
```shell
└── src
    |
    ├── common          # shared code used across entire application
    |   ├── assets      # static files such as images, fonts, etc
    |   ├── components  # components used across the entire application
    |   ├── config      # global configurations, env variables etc.
    |   ├── hooks       # global react hooks
    |   ├── libraries   # preconfigured & re-exported libraries
    |   ├── providers   # all of the app level providers
    |   ├── routes      # routes configuration
    |   ├── services    # external api services
    |   ├── stores      # global state stores
    |   ├── test        # test utilities and mock server
    |   ├── types       # base types used across the application
    |   ├── utils       # shared utility functions
    |   └── views       # pages structured to match routes, assembly only no logic
    |       ├── auth
    |       |   ├── Login.tsx
    |       |   └── Logout.tsx
    |       └── Home.tsx
    |
    ├── features            # feature based modules
    |   └── authentication  # each feature uses same structure as common
    |       ├── assets      # static files such as images, fonts, etc
    |       ├── components  # components used across the entire application
    |       └── ...         # other folders as needs
    |
    |
    ├── App.tsx         # brings together, routes, global providers, etc.
    ├── index.css       # import style libs, fonts, modules etc.
    ├── index.tsx       # initialize react app
    └── vite-env.d.ts   # vite type declarations
```

## Style Guide

### Exporting
Always use named exports
```javascript
export const Hello = () => <h1>Hello</h1>
```

export immediate children `common` & `features` folders via `index.ts`,
```shell
└── src
    └── common
        └── components
            └── button
                ├── primary.tsx
                ├── secondary.tsx
                └── index.ts
```

```javascript
// src/common/components/Button/index.ts
export * from './primary';
export * from './secondary';
```
```javascript
// src/common/components/index.ts
export * from './button';
```

### Importing
Path aliases are setup for common folders and modules.
```javascript
import { Primary, Secondary } from '@components/button';
import { Alert } from '@modules/error';
```

### Naming Conventions

Read [Naming CheatSheet](https://github.com/kettanaito/naming-cheatsheet)

- use English language
- use camelCase for variables, functions, methods, and instances
- use PascalCase for classes and React components
- use kebab-case for file names and folder names
- use A/HC/LC Pattern for functions

| Name                   | Prefix   | Action (A) | High context (HC) | Low context (LC) |
| ---------------------- | -------- | ---------- | ----------------- | ---------------- |
| `getUser`              |          | `get`      | `User`            |                  |
| `getUserMessages`      |          | `get`      | `User`            | `Messages`       |
| `handleClickOutside`   |          | `handle`   | `Click`           | `Outside`        |
| `shouldDisplayMessage` | `should` | `Display`  | `Message`         |                  |

## Development Tips

- Don't over-think it, have fun
- For existing features:
  - follow the existing feature patterns
  - if patterns break style guide, refactor
- For new features:
  - start in a view as your workspace
  - as you build out functionality promote to a feature
  - if feature becomes used in multiple features promote to common
- Perfect is the enemy of good, get it working then you or others refactor
- If you're stuck don't grind alone, reach out to the community

## Credit, Inspiration, & Resources
- [Bullet Proof React](https://github.com/alan2207/bulletproof-react)
- [Naming CheetSheet](https://github.com/kettanaito/naming-cheatsheet)
- [React Typescript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Zod & HookForm Tutorial](https://brockherion.dev/blog/posts/build-bulletproof-react-forms-with-zod-and-react-hook-form/)

# All Portfolio Projects

This is a monorepo built with [Turbo](https://turbo.build/repo) and [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/).

## What's inside?

This Turborepo uses [Yarn](https://classic.yarnpkg.com/lang/en/) as a package manager. It includes the following packages/apps:

### Apps

- `apps/web` - a [Next.js](https://nextjs.org) app
- `apps/docs` - a [Next.js](https://nextjs.org) app
- `apps/admin` - a [Next.js](https://nextjs.org) app

### Packages

- `packages/ui` - a stub React component library shared by both `web` and `docs` applications
- `packages/eslint-config-custom` - `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `packages/typescript-config` - `tsconfig.json`s used throughout the monorepo

### Utilities

This Turborepo has some additional tools already set up for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/en/) (version 18 or higher)
- [Yarn](https://classic.yarnpkg.com/lang/en/) (version 1.22 or higher)

### Build

To build all apps and packages, run the following command:

```
yarn build
```

### Develop

To develop all apps and packages, run the following command:

```
yarn dev
```

### Remote Caching

Turborepo can use a remote cache to share build cache across machines, enabling you to share build cache with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one here](https://vercel.com/signup), then enter the following commands:

```
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/monorepos/turborepo).

To link your Turborepo to your Remote Cache, run the following command from the root of your turborepo:

```
npx turbo link
```

## Useful Commands

- `yarn build` - Build all apps and packages
- `yarn dev` - Develop all apps and packages
- `yarn lint` - Lint all apps and packages
- `yarn test` - Test all apps and packages
- `yarn clean` - Clean all apps and packages
- `yarn type-check` - Type check all apps and packages

## Learn More

To learn more about the tools used in this Turborepo, see the following resources:

- [Turborepo](https://turbo.build/repo) - The React Framework for Production
- [Yarn](https://classic.yarnpkg.com/lang/en/) - Package manager
- [Next.js](https://nextjs.org) - The React Framework for Production
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types 
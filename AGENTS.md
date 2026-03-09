# AGENTS.md

Guidelines for AI agents working in the swagman-web codebase.

## Project Overview

Swagman Web is a React + TypeScript OpenAPI/Swagger explorer built with Vite.
It supports both standalone SPA and embeddable IIFE library modes.
Package manager: **pnpm**. Do not use npm or yarn.

## Commands

| Command                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `pnpm dev`             | Start Vite dev server with HMR                 |
| `pnpm build`           | Type-check with tsc, then build for production |
| `pnpm build:embed`     | Build as embeddable IIFE (`swagman-embed.js`)  |
| `pnpm lint`            | Run ESLint with auto-fix (`eslint --fix`)      |
| `pnpm preview`         | Preview production build (port 3000)           |
| `pnpm storybook`       | Start Storybook dev server (port 6006)         |
| `pnpm build-storybook` | Build static Storybook site                    |

### Testing

Testing uses Vitest integrated through Storybook (no standalone vitest config).
Tests are Storybook stories with `.stories.tsx` extension, co-located with components.

- Run all tests: `pnpm exec vitest` (requires Storybook vitest addon setup)
- Run a single test file: `pnpm exec vitest src/features/api-explorer/api-explorer-tagged-item.stories.tsx`
- Run tests matching a name: `pnpm exec vitest -t "test name pattern"`

### Type Checking

Run `pnpm exec tsc --noEmit` to type-check without building.

## Tech Stack

- **Framework**: React 18.3 + TypeScript 5.6 + Vite 6.3
- **Styling**: Tailwind CSS 3.4 (dark mode via `class` strategy)
- **State**: Zustand (global UI state) + MobX (domain model reactivity)
- **Routing**: react-router-dom 6 (hash-based)
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **API**: swagger-client + openapi-sampler
- **Testing**: Vitest 4 + Playwright (via Storybook)
- **Storybook**: v10 with react-vite, a11y, docs, vitest addons

## Code Style

### Formatting (Prettier)

- Double quotes (`"not single"`)
- Semicolons required
- 2-space indentation
- Trailing commas: ES5 style
- End of line: auto

### Imports

Imports are grouped and sorted by ESLint `import/order` rule, with blank lines
between groups. The enforced order is:

1. `import type` (type-only imports come first)
2. Builtin / Object
3. External packages (e.g., `react`, `zustand`, `mobx`)
4. Internal aliases (`@/shared/...`, `@/hooks/...`, `@/models/...`)
5. Parent / Sibling / Index (relative imports)

Rules:

- Use `import type { X }` for type-only imports.
- Use path alias `@/*` (maps to `src/*`) for cross-directory imports.
- Use relative paths (`./`, `../`) for sibling or nearby file imports.
- Unused imports trigger a warning (`unused-imports/no-unused-imports`).

### Components

- **Named exports**: Use `const` arrow functions.
  `export const MyComponent = ({ prop }: MyComponentProps) => { ... };`
- **Default exports**: Use `function` declarations.
  `export default function MyPage() { ... }`
- **MobX-observed components**: Wrap with `observer()` HOC.
  `export const MyComponent = observer(() => { ... });`
- All components are function components. Never use class components.
- Self-closing tags required for childless components (`react/self-closing-comp`).

### JSX Props

Props are sorted alphabetically by ESLint (`react/jsx-sort-props`):

- Reserved props first (`key`, `ref`)
- Shorthand props first (`disabled` before `disabled={true}`)
- Callbacks last (`onClick`, `onChange`)

### Types

- Use `interface` for object shapes and component props.
- Use `type` for unions, intersections, mapped types, and short aliases.
- Props interfaces are co-located in the same file as the component.
- Complex shared types live in `src/shared/types/`.
- Prefix unused parameters with `_` (e.g., `_event`).
- Strict mode is enabled: `strict`, `noUnusedLocals`, `noUnusedParameters`.

### Naming Conventions

| Entity         | Convention          | Example                      |
| -------------- | ------------------- | ---------------------------- |
| Files          | kebab-case          | `api-explorer-tag.tsx`       |
| Model files    | kebab-case + suffix | `operation.model.ts`         |
| Hook files     | `use-` prefix       | `use-drag-resize.ts`         |
| Components     | PascalCase          | `ApiExplorerTag`             |
| Model classes  | PascalCase + Model  | `OperationModel`             |
| Functions/vars | camelCase           | `handleExecute`, `isLoading` |
| Hook exports   | camelCase `use`     | `useStore`, `useDragResize`  |
| Constants      | SCREAMING_SNAKE     | `HTTP_STATUS_RANGES`         |
| Unused params  | `_` prefix          | `_event`, `_index`           |

### Styling

- Tailwind CSS utility classes are the sole styling approach. No CSS modules or
  styled-components.
- Use `cn()` from `@/shared/utils/cn` to merge class names (clsx + tailwind-merge).
- Use `tailwind-variants` (`tv()`) for complex variant-based component styles.
- Custom colors are defined in `tailwind.config.js` (background, foreground,
  primary, secondary, danger, warning, success, calm, alt — each with 50-950 scales).
- Custom font size `xxs` is available (0.625rem).

### State Management

- **Zustand** (`src/hooks/use-store.ts`): Single flat store for global UI state
  (spec, focused operation, sidebar, tabs). Use selectors for performance.
- **MobX**: Domain model classes use `makeObservable()` with `observable.ref` and
  `action`. Components reading MobX state must be wrapped in `observer()`.
- **useState**: For component-local UI state only (modal open/close, loading flags).

### Error Handling

- Use `react-error-boundary` for React error boundaries (not hand-written class
  components). The app-level boundary is in `src/shared/components/error-boundary.tsx`.
- Wrap async operations in try/catch/finally. Type caught errors as `unknown` and
  narrow with `instanceof Error`.
- Domain models use guard throws: `throw new Error("Spec not processed")`.
- `console.log`/`console.error` triggers an ESLint warning (`no-console`). Add
  `// eslint-disable-next-line no-console` above intentional console usage.

### Blank Lines

ESLint enforces (`padding-line-between-statements`):

- Blank line before `return` statements.
- Blank line after variable declarations (`const`, `let`, `var`).

## File Organization

```
src/
  app/           — App entry point and providers
  features/      — Feature modules (api-explorer, operation, authorization, etc.)
  hooks/         — Global custom hooks
  layouts/       — Layout components
  lib/           — External service wrappers
  models/        — Domain model classes (MobX observable)
  pages/         — Page-level route components
  shared/
    components/  — Reusable UI components (barrel exports via index.tsx)
    constants/   — App-wide constants (as const objects)
    styles/      — Global CSS and style utilities
    types/       — Shared TypeScript types and interfaces
    utils/       — Utility functions (cn, helpers, memoize)
```

- Features are self-contained under `src/features/<name>/` with optional `utils/`.
- Shared components with their own directory use barrel exports (`index.tsx`).
- Storybook stories are co-located: `component-name.stories.tsx`.
- Constants use `as const` assertions for literal type narrowing.
- Domain model classes live in `src/models/` with `.model.ts` suffix.

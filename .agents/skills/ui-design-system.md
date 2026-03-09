# UI Design System Skill

Guidelines for building UI that matches the Swagman Web visual identity.
This app is a **dark-mode-first, premium developer tool** with warm gold accents,
translucent layering, and editorial typography.

---

## Color Palette

All custom colors are defined in `tailwind.config.js` with full 50-950 scales.

| Token        | Base (500)             | Usage                                                             |
| ------------ | ---------------------- | ----------------------------------------------------------------- |
| `background` | `#202021` (charcoal)   | Surfaces. 50 = lightest gray, 950 = near-black `#030303`          |
| `foreground` | `#F8F8F8` (off-white)  | Text. 100 = brightest, 500 = mid-gray, 900 = dim                  |
| `divider`    | `#343435`              | Borders and separators, almost always with opacity (`/40`, `/50`) |
| `primary`    | `#BE976E` (gold/tan)   | **Brand accent.** CTAs, focus rings, active states, links         |
| `secondary`  | `#7850B8` (purple)     | Query strings, secondary accents                                  |
| `danger`     | `#8F264E` (wine/ruby)  | Errors, DELETE method, logout, destructive actions                |
| `warning`    | `#D79919` (amber)      | POST method, deprecation warnings                                 |
| `success`    | `#15A654` (emerald)    | GET method, authorized/connected states                           |
| `calm`       | `#4478B4` (steel blue) | PUT method                                                        |
| `alt`        | `#9D71C8` (lavender)   | PATCH method                                                      |

### HTTP Method Color Mapping

| Method | Variant        | Color family |
| ------ | -------------- | ------------ |
| GET    | `nobg-success` | Green        |
| POST   | `nobg-warning` | Amber        |
| PUT    | `nobg-calm`    | Blue         |
| PATCH  | `nobg-alt`     | Lavender     |
| DELETE | `nobg-danger`  | Wine/Ruby    |

### Color Usage Rules

- **Never use solid backgrounds for semantic colors.** Use translucent fills instead:
  `bg-primary-500/10`, `bg-success-500/5`, `bg-danger-500/10`.
- **Borders use opacity modifiers:** `border-divider/40`, `border-white/10`,
  `border-primary-500/50` -- not raw solid colors.
- **Layer translucent surfaces** for depth: `bg-background-600/30`,
  `bg-background-500/20`, `bg-background-800/50`.
- The **only solid-fill primary button** is the main CTA:
  `bg-primary-500 hover:bg-primary-600 text-background-900`.
- Ghost/subtle buttons use translucent gold: `bg-primary-500/35 border-primary-500/45`.

---

## Typography

### Font Stacks

- **Sans-serif** (default): Tailwind default sans stack. Used for UI text.
- **Monospace** (`font-mono`): Used for URLs, code, server addresses, form values.
- Custom font size `text-xxs` = 0.625rem / 0.875rem line-height.

### Typography Hierarchy

| Element           | Classes                                                                   |
| ----------------- | ------------------------------------------------------------------------- |
| Page title        | `text-3xl font-black tracking-tight text-foreground-100 uppercase italic` |
| Branding label    | `text-[11px] font-black uppercase tracking-[0.3em] text-primary-500/80`   |
| Section title     | `text-xs font-semibold text-foreground-500 uppercase tracking-wide`       |
| Tab label         | `text-xxs font-black uppercase tracking-[0.2em]`                          |
| Stat number       | `text-2xl font-mono font-bold text-foreground-100`                        |
| Stat label        | `text-[9px] font-black uppercase tracking-widest text-foreground-500`     |
| Body text         | `text-sm text-foreground-400` or `text-xs text-foreground-500`            |
| Form input values | `font-mono text-xs text-foreground-200`                                   |
| Form placeholders | `font-sans italic text-foreground-500`                                    |
| Code/technical    | `font-mono text-xs`                                                       |
| Link text         | `text-primary-500 hover:text-primary-400`                                 |

### Key Typography Patterns

- **Headings** use `font-black uppercase italic tracking-tight` -- an editorial,
  magazine-style feel.
- **Labels and meta text** use extreme tracking (`tracking-[0.2em]` to `tracking-[0.5em]`)
  with `uppercase font-black` at tiny sizes (9-11px).
- **Data values** use `font-mono` while their **placeholders** use `font-sans italic`
  to create a clear visual distinction between content and hint.

---

## Surfaces, Borders, and Shadows

### Surface Patterns

| Surface       | Classes                                                                          |
| ------------- | -------------------------------------------------------------------------------- |
| Page bg       | `bg-background`                                                                  |
| Sidebar       | `bg-background-600/30`                                                           |
| Card          | `bg-background-600/20 border border-divider rounded-md p-4`                      |
| Modal         | `bg-background-700 border border-divider rounded-md shadow-2xl shadow-black/50`  |
| Dropdown      | `bg-background-600 border border-white/15 rounded-md shadow-2xl shadow-black/50` |
| Dark card     | `bg-background-800 border border-divider rounded-md`                             |
| Input default | `bg-transparent border border-transparent`                                       |
| Input hover   | `hover:bg-background-500 hover:border-divider`                                   |
| Input focus   | `focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20`             |

### Border Rules

- Structural borders: `border-divider` or `border-divider/40`
- Luminous edges (dropdowns/elevated): `border-white/10` or `border-white/15`
- Active/focus borders: `border-primary-500` or `border-primary-500/50`
- Default state: `border-transparent` -- borders appear only on interaction
- Row separators: `divide-y divide-divider/50`

### Shadows

- Elevated elements (modals, dropdowns): `shadow-2xl shadow-black/50`
- CTA buttons: `shadow-lg shadow-primary-500/10` (warm gold glow)
- Active tab indicator: `box-shadow: 0 -2px 10px rgba(190, 151, 110, 0.4)` (upward gold glow)
- No gradients anywhere. Depth comes from opacity layers and heavy shadows.

### Border Radius

- Default for cards/containers/buttons: `rounded-md`
- Pill shapes (selectable buttons, checkboxes): `rounded-full`
- Progress bars/scrollbar tracks: `rounded-full`
- Scrollbar thumbs: `rounded-full`

---

## Spacing

| Context               | Pattern                                   |
| --------------------- | ----------------------------------------- |
| Page sections         | `p-6`, `py-10`, `gap-12`                  |
| Section groups        | `gap-4`, `gap-6`, `space-y-6`             |
| Form sections         | `space-y-3`                               |
| Modal sections        | `space-y-6`                               |
| Tight lists           | `space-y-0.5`, `space-y-px`               |
| Inline elements       | `gap-2`, `gap-3`                          |
| Card internal padding | `p-4` or `p-5`                            |
| Modal padding         | `px-5 py-4` (header/footer), `p-5` (body) |

---

## Interaction States

### Buttons and Interactive Elements

| State      | Classes                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------- |
| Press      | `active:scale-[0.98]` (buttons) or `active:scale-[0.99]` (list items)                               |
| Hover bg   | `hover:bg-white/5` (subtle) or `hover:bg-primary-500/10` (primary)                                  |
| Focus ring | `focus-visible:ring-2 focus-visible:ring-primary-500`                                               |
| Disabled   | `disabled:opacity-25 disabled:cursor-not-allowed` (buttons) or `opacity-40` + `grayscale` (selects) |
| Selected   | `bg-primary-500/10 text-primary-400 font-semibold`                                                  |

### The "Invisible Until Needed" Input Pattern

All text inputs and selects follow this progressive disclosure:

1. **Rest:** `bg-transparent border-transparent` -- completely invisible
2. **Hover:** `hover:bg-background-500 hover:border-divider` -- structure appears
3. **Focus:** `focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20` -- gold accent
4. **Focus underline:** A 1px gold line expands from center to 90% width:
   `absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-primary-500
transition-all duration-300 group-focus-within:w-[90%] opacity-50`

### Semantic State Colors

| State        | Background         | Border                  | Text               |
| ------------ | ------------------ | ----------------------- | ------------------ |
| Authorized   | `bg-success-500/5` | `border-success-500/50` | `text-success-500` |
| Error/Danger | `bg-danger-500/10` | `border-danger-500/20`  | `text-danger-400`  |
| Warning      | --                 | `border-warning-600/40` | `text-warning-500` |

### Group Hover Pattern

Use Tailwind `group` + `group-hover:` extensively for coordinated multi-element
transitions. Example: hovering a parent makes a child icon change to
`group-hover:text-primary-500` while text shifts to `group-hover:text-foreground-100`.

---

## Animation and Transitions

### Timing

| Speed     | Duration       | Use case                                      |
| --------- | -------------- | --------------------------------------------- |
| Fast      | `duration-100` | Dropdown appear, snappy feedback              |
| Standard  | `duration-200` | Most hover/focus states, color transitions    |
| Smooth    | `duration-300` | Tab panel entrance, focus underline expansion |
| Cinematic | `duration-500` | Brand reveal on hover                         |

### Easing

- Default: `ease-in-out` or `ease-out`
- Spring/bounce: `cubic-bezier(0.68, -0.55, 0.27, 1.55)` for Collapse bounce variant

### Animation Patterns

| Pattern              | Implementation                                                     |
| -------------------- | ------------------------------------------------------------------ |
| Dropdown/menu appear | `animate-in fade-in zoom-in-95 duration-100`                       |
| Tab content enter    | `animate-in fade-in slide-in-from-top-1 duration-300`              |
| Checkbox pop-in      | `scale-0` -> `scale-100` with `duration-200 ease-out`              |
| Chevron rotate       | `transition-transform duration-200` between `rotate-0`/`rotate-90` |
| Loading dots         | `animate-bounce` with staggered `[animation-delay:-0.3s]`          |
| Progress bar         | Custom shimmer sliding from -100% to 233% with glow shadow         |

### Transition Defaults

- Most elements: `transition-colors duration-200`
- Layout/size changes: `transition-all duration-200 ease-out`
- Complex animations: `transition-all duration-300`

---

## Component Patterns

### Variant System

The app uses a three-tier variant system for colorable components (Chip, ActionButton):

1. **Solid:** `bg-background-400` + colored text (e.g., `text-primary`)
2. **Ghost:** `bg-{color}-500/10 text-{color}-400 border border-{color}-500/20`
3. **No-bg:** `text-{color} font-bold` -- text only, no background or border

Available colors: `default`, `primary`, `danger`, `warning`, `success`, `calm`, `alt`.

### Size System

Six sizes: `xxs`, `xs`, `sm`, `md`, `lg`, `xl`.

Chip padding by size:

| Size       | Padding         |
| ---------- | --------------- |
| `xxs`/`xs` | `px-1.5 py-0.5` |
| `sm`       | `px-2 py-0.5`   |
| `md`       | `px-3 py-0.5`   |
| `lg`/`xl`  | `px-4 py-1`     |

### Building a New Component

When creating a new component, follow these patterns:

```tsx
// 1. Type-only imports first
import type { Size } from "@/shared/types/size";
import type { Variant } from "@/shared/types/variant";

// 2. External packages
import { tv } from "tailwind-variants";

// 3. Internal utilities
import { cn } from "@/shared/utils/cn";

// 4. Props interface (co-located)
interface MyComponentProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

// 5. Variant styles with tv() for complex cases
const myComponentVariants = tv({
  base: "inline-flex items-center rounded-md transition-colors duration-200",
  variants: {
    variant: {
      default: "bg-background-400 text-foreground",
      "ghost-primary":
        "bg-primary-500/10 text-primary-400 border border-primary-500/20",
    },
    size: {
      sm: "px-2 py-0.5 text-xs",
      md: "px-3 py-1 text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

// 6. Named export with const arrow function
export const MyComponent = ({
  variant,
  size,
  className,
  children,
}: MyComponentProps) => {
  return (
    <div className={cn(myComponentVariants({ variant, size }), className)}>
      {children}
    </div>
  );
};
```

### Using `cn()` vs `tv()`

- **`cn()`** (from `@/shared/utils/cn`): Use for simple conditional class merging.
  Combines `clsx` + `tailwind-merge`. Use this for most components.
- **`tv()`** (from `tailwind-variants`): Use for components with multiple variant
  axes (variant + size + isActive + compound variants). Prefer for complex
  multi-variant button/chip-style components.

---

## Layout Architecture

```
DefaultLayout (h-dvh, p-1)
  SpecificationLayout (flex h-dvh w-full overflow-hidden)
    Sidebar (flex-shrink-0 w-fit, bg-background-600/30, border-r border-divider/40)
      ApiExplorer (Resizable, default 320px)
        Fixed Header (border-b border-divider, branding + nav + actions)
        Scrollable Body (flex-1 overflow-y-auto no-scrollbar)
    Main (flex-1 w-full, flex flex-col)
      OperationHeader (sticky top-0 z-50, bg-background)
        Row 1: Method | URL | Execute (h-14 lg:h-16)
        Row 2: Server | Auth | Meta (h-9)
      OperationTabs (flex-1 overflow-auto p-6)
        Summary + Description
        Request Tabs (Params | Headers | Body)
        Response Tabs (Responses | Snippet)
```

### Layout Rules

- Use `h-dvh` (not `h-screen`) for full viewport height.
- Sidebar is `flex-shrink-0 w-fit` with a `<Resizable>` wrapper.
- Scrollable areas: `flex-1 overflow-y-auto`. Use `no-scrollbar` for sidebars.
- Sticky headers: `sticky top-0 z-50 bg-background`.
- Modals/overlays: `fixed inset-0 z-[100]`.
- Modal backdrop: `bg-background-950/90 backdrop-blur-sm`.

---

## Scrollbar Styling

Custom scrollbars are defined in `globals.css`:

- Webkit: `w-2`, track = `bg-background-500/15 rounded-full`,
  thumb = `bg-background-500 rounded-full hover:bg-background-400`.
- Firefox: `scrollbar-width: thin; scrollbar-color: #414143 #202021`.
- Hidden scrollbars: Use `no-scrollbar` utility class.

---

## Icons

All icons are SVG-based, outline style (`fill="none" stroke="currentColor"`):

- Default stroke: `1.5` (some use `2`)
- Line caps/joins: `round`
- Default size: `size-6` (24px), overridable via className
- Icons inherit `currentColor` -- they automatically match the text color context
- Defined in `src/shared/components/icons.tsx`

---

## Existing Shared Components

Before creating a new component, check if one already exists in `src/shared/components/`:

| Component               | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| `ActionButton`          | Icon/text button with variant/size system   |
| `MainButton`            | Primary CTA (translucent gold, h-14)        |
| `ButtonSelectable`      | Pill-shaped toggle button (rounded-full)    |
| `CardSelectableButtons` | Grid of selectable button options           |
| `Chip`                  | Badge/tag with variant/size system          |
| `Modal`                 | Portal-based dialog with backdrop blur      |
| `Dropdown`              | Popover menu with zoom-in animation         |
| `Tabs`                  | Tab strip with gold glowing indicator       |
| `Collapse`              | Animated expand/collapse (5 variants)       |
| `Code`                  | Monaco Editor wrapper with custom theme     |
| `FormFieldText`         | Invisible-until-focus text input            |
| `FormFieldSelect`       | Custom select dropdown                      |
| `FormFieldCheckbox`     | Circular gold checkbox with scale animation |
| `FormFieldNumber`       | Number input field                          |
| `FormFieldFile`         | File upload input                           |
| `FormFieldArray`        | Dynamic array of form fields                |
| `FormFieldActionButton` | Tiny circular add/delete button             |
| `FormFields`            | Dynamic form field renderer                 |
| `SectionTitle`          | Uppercase muted section header              |
| `Subtitle`              | Size-aware heading with brightness gradient |
| `CardMd`                | Bordered card with markdown content         |
| `SanitizedMarkdown`     | Safe markdown renderer (marked + DOMPurify) |
| `Resizable`             | Drag-to-resize container                    |
| `ErrorBoundary`         | App-wide error boundary                     |

---

## Quick Reference: The Swagman Visual Identity

1. **Dark luxury** -- Near-black charcoal backgrounds, not blue-black or pure black
2. **Warm gold accent** -- `primary-500` (#BE976E) is the single brand color
3. **Translucent layering** -- Opacity modifiers (`/5`, `/10`, `/20`, `/50`) everywhere
4. **Editorial typography** -- `font-black uppercase italic tracking-tight` for headings
5. **Invisible inputs** -- Form fields are transparent until hovered/focused
6. **Micro-interactions** -- `active:scale-[0.98]`, expanding underlines, zoom-in menus
7. **Deep shadows** -- `shadow-2xl shadow-black/50` for floating elements
8. **No gradients** -- Depth via opacity stacking only
9. **Monospace for data** -- `font-mono` for technical content, `font-sans` for UI
10. **Restrained color** -- Semantic colors used sparingly through ghost/translucent fills

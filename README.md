# fleet-design

Shared design tokens and component styles for three products that use one interface language: a coding-agent client ([fleet-ade](https://github.com/thoerwink8/fleet-ade)), a trading review app and a fleet dashboard. Behaviour comes from [Base UI](https://base-ui.com); this package owns the look: CSS variables and the `.fa-*` component classes. Each product writes its own business components on top.

Version 0.3 ships tokens, component CSS, an optional page reset, two Tailwind v4 entries, React components built on Base UI, and a preview site. Everything it puts into a page is prefixed (`--fa-*` variables, `.fa-*` classes), so it can sit inside a project that already has a design system. Coming from 0.2: [Upgrading from 0.2](#upgrading-from-02). Adding it to an app that already uses Tailwind: [Adding it to an existing Tailwind project](#adding-it-to-an-existing-tailwind-project).

## Three layers

| Layer             | Variables                                                                                                                                                                                                                                                         | Who uses it                                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Base palette   | `--fa-palette-n0` … `--fa-palette-n9`, `--fa-palette-red`, `-green`, `-amber`, `-blue`, `-cyan`                                                                                                                                                                   | Only the semantic layer. Changing theme swaps this layer.                                                                                             |
| 2. Semantic roles | `--fa-bg`, `--fa-panel`, `--fa-overlay`, `--fa-fg`, `--fa-fg-muted`, `--fa-border`, `--fa-accent`, `--fa-on-accent`, `--fa-success`, `--fa-warning`, `--fa-danger`, `--fa-on-danger`, `--fa-info`, `--fa-selected`, `--fa-hover`, `--fa-scrim`, `--fa-focus-ring` | Components and pages. Never use `--fa-palette-*` directly.                                                                                            |
| 3. Brand          | `--fa-brand-fleet`, `--fa-brand-trade`, `--fa-brand-board`                                                                                                                                                                                                        | Re-points `--fa-accent` per product; `--fa-focus-ring` follows it. `--fa-on-accent`, `--fa-selected` and `--fa-hover` stay the same in every product. |

Two more colour groups sit beside the roles:

- **Market direction** `--fa-up`, `--fa-down`, `--fa-flat`: which way a number moved. Not the same as `--fa-success` / `--fa-danger` (the state of an operation). The trading brand flips them to red-up / green-down.
- **Data categories** `--fa-data-1` … `--fa-data-6`: legend dots, segment bars and chart marks only. They say "which category", never good or bad.

Scales: spacing `--fa-space-1` … `--fa-space-12` plus the density tokens (`--fa-space-row-x`, `--fa-space-icon-gap`, …), radius `--fa-radius-sm|md|lg|full`, control and row heights `--fa-ctrl-*`, `--fa-row-*`, breakpoints `--fa-bp-*`, durations `--fa-dur-*`, easings `--fa-ease-*`, one shadow `--fa-shadow-overlay`, and type classes `.fa-caption`, `.fa-control`, `.fa-control-strong`, `.fa-body`, `.fa-title`, `.fa-heading`, `.fa-code`, `.fa-code-sm`.

The source of every value is `tokens/*.json`. `pnpm build` generates `dist/tokens.css` and `dist/tokens.json` from it.

## Install

```sh
pnpm add github:thoerwink8/fleet-design#v0.3.3
```

The package is not published to npm. `dist/` is committed, so installing from git needs no build step and no extra tools, on Windows and Linux alike (see [Why dist/ is committed](#why-dist-is-committed)).

| Import                            | File                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------- |
| `@fleet/design/tokens.css`        | all variables, eight themes                                                                       |
| `@fleet/design/tokens.json`       | the same values as data                                                                           |
| `@fleet/design/styles.css`        | every component class, in cascade order; styles nothing outside `.fa-*`                           |
| `@fleet/design/reset.css`         | optional page reset: `box-sizing`, body colours and font, native controls, `[hidden]`, focus ring |
| `@fleet/design/styles/<name>.css` | one component, e.g. `styles/button.css`; `styles/base.css` holds the shared helpers               |
| `@fleet/design/tailwind`          | Tailwind v4 theme that replaces Tailwind's scale with the tokens (new projects)                   |
| `@fleet/design/tailwind/extend`   | Tailwind v4 theme that only adds `fa-` keys (projects with a theme of their own)                  |
| `@fleet/design/react`             | all React components (see [React](#react))                                                        |
| `@fleet/design/react/<name>`      | one component, e.g. `react/button`, `react/command-palette`                                       |

## Use it

### Plain CSS

```html
<html data-theme="dark" data-project="board">
  <head>
    <link rel="stylesheet" href="node_modules/@fleet/design/dist/tokens.css">
    <link rel="stylesheet" href="node_modules/@fleet/design/dist/reset.css">
    <link rel="stylesheet" href="node_modules/@fleet/design/dist/styles.css">
  </head>
  <body>
    <button class="fa-btn fa-btn--primary">刷新</button>
    <span class="fa-status"><span class="fa-dot fa-dot--running"></span>运行中</span>
  </body>
</html>
```

With a bundler: `import '@fleet/design/tokens.css'; import '@fleet/design/reset.css'; import '@fleet/design/styles.css';` once at the app entry, in that order. Your own CSS uses roles only: `background: var(--fa-panel); color: var(--fa-fg-muted); padding: var(--fa-space-4);`.

`reset.css` is the only file that styles bare elements, and it is optional. Import it when fleet-design owns the page. A page that already has a reset leaves it out: `styles.css` does not touch `body`, `button` or any element without a `.fa-*` class. The components expect what any reset gives: `box-sizing: border-box`, native controls without the browser's padding that inherit font and colour, and `[hidden]` hiding. Tailwind's preflight is such a reset. Two things do not depend on the reset. The keyboard focus ring is part of `styles.css`, scoped to `.fa-*` elements and what sits inside them. Reduced motion is part of `tokens.css`: under `prefers-reduced-motion` the duration tokens collapse to 0.01ms.

### Tailwind v4

Tailwind is optional. There are two entries; import one of them, never both.

| Entry                           | For                                                  | What it does to Tailwind's theme                                                                                                                              | Utilities                                                                                                          |
| ------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `@fleet/design/tailwind`        | a project that takes its whole scale from the tokens | Clears the default colours, radii, fonts, weights, text sizes and shadows and puts the tokens in their place, so off-scale classes do not exist               | `bg-panel`, `text-fg-muted`, `border-border`, `px-row-x`, `h-ctrl`, `text-sm`, `rounded-md`                        |
| `@fleet/design/tailwind/extend` | a project that already has a Tailwind theme          | Adds keys under `fa-` names (`--color-fa-accent`, `--radius-fa-md`, `--font-fa-sans`, …) and clears nothing: every utility the project had compiles as before | `bg-fa-panel`, `text-fa-fg-muted`, `border-fa-border`, `px-fa-row-x`, `h-fa-ctrl`, `text-fa-body`, `rounded-fa-md` |

A new project:

```css
@import "tailwindcss";
@import "@fleet/design/tokens.css";
@import "@fleet/design/styles.css"; /* only if you use the .fa-* component classes */
@import "@fleet/design/tailwind";
```

Then `bg-panel`, `text-fg-muted`, `border-border`, `text-up`, `px-row-x`, `h-ctrl`, `text-sm`, `rounded-md`, `font-medium` resolve to the variables. Tailwind's default palette, the 13/16/24px sizes and weights 600+ are removed. Tailwind's preflight is the reset here; do not add `reset.css` as well.

`extend` maps the same variables. Colours: `fa-bg`, `fa-panel`, `fa-overlay`, `fa-fg`, `fa-fg-muted`, `fa-border`, `fa-accent`, `fa-on-accent`, `fa-success`, `fa-warning`, `fa-danger`, `fa-on-danger`, `fa-info`, `fa-selected`, `fa-hover`, `fa-scrim`, `fa-ring`, `fa-up`, `fa-down`, `fa-flat`, `fa-data-1` … `fa-data-6`. Spacing and sizes: `fa-row-x`, `fa-row-y`, `fa-icon-gap`, `fa-ctrl`, `fa-ctrl-sm`, `fa-row-1`, `fa-row-2`, … Radii: `rounded-fa-sm|md|lg|full`. Fonts: `font-fa-sans`, `font-fa-mono`. Type steps: `text-fa-caption` (12/16), `text-fa-control` (14/20), `text-fa-body` (15/24), `text-fa-title` (18/28), `text-fa-heading` (20/28). Shadow: `shadow-fa-overlay`. Easings: `ease-fa-out`, `ease-fa-in-out`. The 4px spacing grid needs no keys: Tailwind's own `p-3` is already 12px.

### Adding it to an existing Tailwind project

A project that already has a theme (shadcn-style `--accent`, `--border`, `--ring`, `--radius-md`, its own `.dark` switch) keeps all of it. Nothing in fleet-design uses those names, and nothing resets the page.

```css
/* the project's entry stylesheet */
@layer fleet-tokens, theme, base, fleet, components, utilities;
@import "tailwindcss";
@import "@fleet/design/tokens.css" layer(fleet-tokens);
@import "@fleet/design/styles.css" layer(fleet); /* or single files: "@fleet/design/styles/base.css", "…/button.css" */
@import "@fleet/design/tailwind/extend";
```

- **Layer order.** Declare the order once, before the imports. `fleet-tokens` comes first so anything the project declares can override a token. `fleet` comes after `base` so the component classes beat preflight, and before `components` and `utilities` so the project's layout utilities (`w-full`, `mt-2`) beat a `.fa-*` class. Keep the project's other layers in the list where they were.
- **Do not import `@fleet/design/tailwind`** here. It clears Tailwind's defaults and the project's utilities with them. `tailwind/extend` only adds.
- **Do not import `reset.css`** here. Preflight is the reset.
- **Theme and brand.** Put `data-theme` on `<html>`, next to whatever the project already switches (`class="dark"`): `data-theme="light"` or `"dark"`, or one of the other six. Without the attribute the light theme applies. `data-project` goes on `<html>` too, for the `trade` and `board` brands; the default brand needs none. An element with `data-theme` also gets the matching `color-scheme`.
- **Text colour and font.** The components set their own where the design fixes them and inherit the rest, as they do from `body` under `reset.css`. Around fleet components, set `color: var(--fa-fg)` and a `.fa-body` (15/24) or `.fa-control` (14/20) type class on the container, or point the project's own body variables at the tokens (`--foreground: var(--fa-fg)`).
- **What is checked.** `pnpm check` builds such a project (preflight, its own `--accent`, `--border`, `--ring`, `--radius-md`, `--font-sans`, `--ease-out`) with and without these four lines and compares: the project's variables and every computed property of its `html`, `body`, button, input, link and heading are identical, a focused project button keeps the project's outline, `--fa-accent` has its value, `bg-fa-accent` and `rounded-fa-md` compute to the tokens, and `.fa-btn` renders 32 high with the fleet focus ring.

### React

`@fleet/design/react` wraps [Base UI](https://base-ui.com) parts for behaviour (keyboard, focus, ARIA) and maps a few `variant` / `size` props onto the same `.fa-*` classes. It adds no styles of its own and imports no CSS.

```sh
pnpm add github:thoerwink8/fleet-design#v0.3.3 @base-ui/react react react-dom
```

Peer dependencies: `react` and `react-dom` 18.2+ or 19, `@base-ui/react` 1.9+ (built and tested with 1.9.0 and React 19.3). They are optional, so CSS-only projects get no warnings.

```tsx
// once, at the app entry
import '@fleet/design/tokens.css';
import '@fleet/design/reset.css'; // leave out when the page has its own reset
import '@fleet/design/styles.css'; // or only what you use: '@fleet/design/styles/button.css', …

import { Button } from '@fleet/design/react/button';
import { Select } from '@fleet/design/react/select';

<Button variant="primary" size="sm" onClick={send}>发送</Button>
<Select aria-label="字号" options={[{ value: '14', label: '标准' }, { value: '15', label: '较大' }]} value={size} onValueChange={setSize} />
```

- Import from `@fleet/design/react/<component>`, or from the `@fleet/design/react` entry: the package marks only its CSS as having side effects, so bundlers drop the components you do not use. `pnpm smoke` checks that a page with Button and Select contains no other component.
- Every component works controlled (`value` / `open` / `checked` with the change callback) and uncontrolled (`default…`).
- `className` and `style` go to the root element and are for layout only (margin, width, grid placement). Looks come from `variant` and `size`; there is no prop for colours or type.
- Per-file CSS: `styles/<component>.css` plus `styles/base.css`; the floating ones also need `styles/menu.css` (`.fa-pop`, `.fa-item`) and the modal ones `styles/confirm-dialog.css` (`.fa-backdrop`).
- TypeScript checks side-effect imports: if your bundler template does not already declare `*.css` modules, add `declare module '*.css';`.
- With Tailwind: import `tokens.css`, then `styles.css` (for the components), then one of the two theme entries, as in the Tailwind section. Utilities are fine for page layout around the components; do not restyle a component with utilities.

| Component                     | What it is for                       | Shortest use                                                                         | Not obvious                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`, `IconButton`        | actions                              | `<Button variant="primary">发送</Button>`                                            | `loading` keeps focus, ignores clicks and swaps the label for `loadingText` (no spinner). `size="sm"` (28) only inside a bar at least 32 high, `size="xs"` (24) only inside a row. `variant="muted"` is the low-emphasis ghost; `danger-secondary` and `danger-ghost` are destructive actions outside a confirm dialog. A trigger with `aria-expanded` or a toggle with `aria-pressed` keeps its hover fill. `IconButton` needs `label`. Icon-only `Button` (`icon`) is square at every step, including `xs`: 24 / 28 / 32 / 40, and an `svg` inside does not shrink (16px unless it is already `.fa-ic`). `[disabled]`, `aria-disabled="true"` and `data-disabled` share the disabled look and ignore hover and press. Colour transitions run only while hovering or pressing. On a coarse pointer a `::after` makes the hit area at least 44×44 without changing the visible box. |
| `SegmentedControl`            | one of a few always-visible choices  | `<SegmentedControl aria-label="字号" options={…} value onValueChange />`             | A radio group (Base UI RadioGroup): Tab enters at the checked item, arrows move and select.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `Input`                       | labelled text field                  | `<Input label="分支名" value onValueChange error={msg} />`                           | `error` sets `aria-invalid` and replaces the hint; `prefix` / `suffix` sit inside the frame. `mono` only for paths, branches and IDs. Below 480px the text is 16px so iOS Safari does not zoom on focus; above that it stays 14px. The same rule applies to `.fa-cmd__in input`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `Tooltip`, `TooltipProvider`  | supplementary hint on hover or focus | `<Tooltip content="新建会话" shortcut="Ctrl+N"><Button …/></Tooltip>`                | 500 ms delay, Esc closes. Never the only place for important information (touch users never see it).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `Menu`                        | action menu from data                | `<Menu trigger={<IconButton label="更多">…</IconButton>} items={[…]} />`             | Single-letter `shortcut`s work while the menu is open; checkbox items stay open; disabled items can be reached but do nothing; `type: 'submenu'` nests. A row's `min-height` is the 32px step, with or without an icon. Highlighted and selected rows, and `.fa-item--selected`, use the neutral `--fa-selected` fill, including when a theme points `--fa-hover` at an accent.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `Select`                      | single choice from a list            | `<Select options value onValueChange aria-label />`                                  | The list opens under the trigger, not over it. `variant="ghost"` is the frameless 28-high picker. `size="sm"` is the bordered 28-high trigger for a toolbar. `aria-invalid` gives the trigger the same danger border as an invalid `Input`. A search field inside `.fa-pop` is 28 high.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `ToastProvider`, `useToast`   | confirm what just happened           | `useToast().show({ text: '已归档', action: { label: '撤销', onClick } })`            | 4 s, 8 s with an action; at most 3; hover or focus pauses. Errors go to the status strip, not to a toast.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `Dialog`, `DialogClose`       | short modal task                     | `<Dialog trigger={<Button>重命名</Button>} title footer>…</Dialog>`                  | Focus moves in and is trapped, Esc or the scrim closes, focus returns to the trigger.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ConfirmDialog`               | before an irreversible action        | `<ConfirmDialog title description confirmLabel="删除对话" danger onConfirm />`       | Focus starts on 取消; the scrim does not dismiss it. Prefer undo for anything reversible.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `Drawer`                      | side panel on narrow screens         | `<Drawer label="会话列表" trigger={…}>…</Drawer>`                                    | Modal (Base UI Dialog); slides in from the left and leaves no shadow when closed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `Collapsible`, `DetailsPanel` | show or hide a block                 | `<DetailsPanel><Collapsible title="环境" defaultOpen>…</Collapsible></DetailsPanel>` | `variant="fold"` is the quiet summary row that folds tool calls in a conversation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `Meter`                       | how full something is                | `<Meter label="上下文占用" value={70} showValue />`                                  | Turns danger at 95% (`dangerAt`). `segments` split it by category with data colours; give each a legend entry too. Not a progress indicator.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `CommandPalette`              | search and run                       | `<CommandPalette open onOpenChange items={[{ id, title, group, onRun }]} />`         | Every typed word must match the title or `keywords`; ↑↓ wrap across groups and skip `disabled` rows, which never take the keyboard highlight; Enter runs and closes. Open it from your own shortcut by setting `open`. `.fa-cmd--modal` centres itself, sits 15% from the top, and caps its height to the viewport. The input and footer do not shrink when the list is long. `summary` alone makes the 52px two-line row `.fa-cmd__row--2`.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `Checkbox`                    | on or off in a list or form          | `<Checkbox label="显示已归档" checked onCheckedChange />`                            | Checked is neutral grey, not the accent. `indeterminate` for select-all.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

Business components (thread rows, the composer, tables, the status strip) stay in each product; use the classes.

## Themes and brands

Set two attributes on the root element:

```html
<html data-theme="nord" data-project="trade">
```

| `data-theme`                                                    | kind  |
| --------------------------------------------------------------- | ----- |
| `light` (default), `solarized`                                  | light |
| `dark`, `darcula`, `one-dark`, `dracula`, `nord`, `tokyo-night` | dark  |

Each theme is either light or dark; to follow the system, pick one light and one dark theme and switch `data-theme` on `prefers-color-scheme`. Native scrollbars and form controls follow through `color-scheme`.

| `data-project` | product             | accent                      | market colours     |
| -------------- | ------------------- | --------------------------- | ------------------ |
| none           | coding-agent client | `--fa-brand-fleet` (blue)   | up green, down red |
| `trade`        | trading review app  | `--fa-brand-trade` (indigo) | up red, down green |
| `board`        | fleet dashboard     | `--fa-brand-board` (teal)   | up green, down red |

The brand rules are part of `tokens.css` (generated from `projects` in `tokens/brand.json`), so a project that imports only the tokens switches brand too. A brand re-points `--fa-accent`; `--fa-focus-ring` follows it, `--fa-on-accent` stays equal to `--fa-bg`, and the trading brand also flips `--fa-up` / `--fa-down`. Nothing else changes. The accent appears in five places only: primary button, links, progress and meters, focus ring, unread dot. Selected and hovered rows use the neutral `--fa-selected` / `--fa-hover` in every brand.

No decorative gradients. Two gradients are intentional and are not colours of their own: the hover wash, layered as `linear-gradient(var(--fa-hover), var(--fa-hover))` so it works on any surface, and the scroll hint at the right edge of a wide table (`styles/table.css`).

## Density

按主流桌面开发工具的实测密度定的 (measured against mainstream desktop developer tools). `pnpm check` measures the rendered previews against this table.

| Where                                                                                    | Size                                         | Token                             |
| ---------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------- |
| Clickable one-line row (environment, outputs, connectors, thread rows, task rows)        | 32                                           | `row-1`                           |
| Data-only row, not clickable (context breakdown, expanded group items)                   | 24                                           | `row-data`                        |
| Two-line row (changes, threads that need you, expanded task, menu item with description) | 52 = 8 + 20 + 16 + 8                         | `row-2`, `space-row-y`            |
| Three-line result row (command palette)                                                  | 72                                           | `row-3`                           |
| Table body row (header row 32)                                                           | 40                                           | `row-table`                       |
| Icon or agent slot to text                                                               | 12                                           | `space-icon-gap`                  |
| Status tag (dot + word)                                                                  | 20                                           | `ctrl-2xs`                        |
| Search field inside a list popup                                                         | 28                                           | `ctrl-sm`                         |
| Bordered toolbar select                                                                  | 28                                           | `ctrl-sm`                         |
| Text to trailing value, time or buttons                                                  | ≥ 12                                         | `space-trail-gap`                 |
| Row side padding                                                                         | 12 in panels, 8 in floating layers           | `space-row-x`, `space-row-x-menu` |
| Container edge to rows (hover fill never touches the edge)                               | 8                                            | `space-list-inset`                |
| Between highlights of adjacent clickable rows                                            | 4 (a 2px transparent seam on each row)       | `space-row-seam`                  |
| Section: above the head / below the last row                                             | 12; head row 32, rows directly under it      | `space-sec-y`                     |
| "Show more" tail row                                                                     | 4 above, 32 high, text aligned with row text | `ctrl`                            |
| Card and panel padding                                                                   | 16                                           | `space-4`                         |
| List floating layers (menu, select, palette)                                             | 8 padding, 8 + hairline between groups       | `space-2`                         |
| Content floating layers: hover card / dialog                                             | 16 / 20                                      | `space-4`, `space-5`              |
| Caption to demo / between demo blocks                                                    | ≥ 12 / 24                                    | `space-demo`                      |

Rows and standalone controls you can click are at least 32 high; 24 is only for rows you cannot click. An icon-only button is a square of its step (24 / 28 / 32 / 40) and the glyph inside it is the 16px icon. On a coarse pointer the button keeps that box and grows a 44px hit area from `::after`. A focused field is 16px below 480px wide, so a phone does not zoom the page, and 14px above that. Smaller controls live only inside a bar or row that is itself at least 32: small buttons (28, `fa-btn--sm`) grouped as secondary actions in a toolbar, status strip, composer bar or batch bar, icon buttons (28) inside rows, row-level buttons (24, `fa-btn--xs`) next to a row's own content, and segmented-control items (24) inside their 32 group. Table rows are 40 (`row-table`), a spec of their own. Narrow containers collapse controls with container queries instead of truncating them (`bp-composer-foot` 520, `bp-composer-account` 400, `bp-composer-icon` 300, `bp-batch` 320); below 400 the strip under the composer drops the branch name and keeps project and usage.

The full rules (type scale, weights, colour use, motion, interaction) are in [AGENTS.md](AGENTS.md).

## Preview site

Live preview: <https://thoerwink8.github.io/fleet-design/>

```sh
pnpm install
pnpm dev     # http://127.0.0.1:5178, rebuilds dist/ when tokens/ or styles/ change
pnpm stop    # stops the server started by pnpm dev
```

The 31 cards in `previews/cards/` load the built `dist/tokens.css`, `dist/reset.css` and `dist/styles.css`. The React group has one page per React component (`previews/react/<Name>.tsx`, bundled on request). The toolbar switches theme, light / dark / system, brand and width (full, 720, 360). `PORT=5200 pnpm dev` picks another port.

## Commands

| Command                  | What it does                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `pnpm build`             | generate `dist/tokens.css`, `dist/tokens.json`, `dist/styles.css`, `dist/reset.css` |
| `pnpm check`             | everything CI runs (below)                                                          |
| `pnpm dev` / `pnpm stop` | preview site                                                                        |
| `pnpm site`              | build the static preview site into `site/`                                          |
| `pnpm baseline`          | accept the current build as the new baseline after an intentional change            |
| `pnpm format`            | format with Biome                                                                   |
| `pnpm test:react`        | Playwright interaction tests of the React components (`test/react/`)                |
| `pnpm smoke`             | install the packed package into an empty project, type-check and bundle             |
| `pnpm typecheck`         | TypeScript only                                                                     |

`pnpm check` runs: tokens equal the baseline byte for byte; component styles and the reset equal the baseline rule for rule; `dist/` (CSS and `dist/react`) is current; TypeScript; a static scan (font sizes 12/14/15/18/20, no weight ≥ 600, spacing in multiples of 4, colours only through variables, monospace only on code classes, every custom property prefixed, no selector in `styles.css` outside `.fa-*`, transitions timed by duration tokens); contrast for 8 themes × 3 brands (text 4.5, marks 3); data colours under simulated colour-vision deficiency; both Tailwind entries compiled (`tailwind` replaces the scale, `tailwind/extend` leaves Tailwind's own utilities byte-identical); a project with its own Tailwind theme rendered with and without fleet-design, which must not change it; every preview card rendered in headless Chromium against the baseline, computed style by computed style; the density table at 1000 and overflow at 360, for the cards and the React pages; every page loads without a failed request; React elements against the same state on the static card, computed style by computed style; a scan for local paths, private names and images; Biome. The browser checks need Chromium once: `pnpm exec playwright install chromium`.

## Releasing

1. Change `tokens/` or `styles/`, run `pnpm build` and `pnpm check`. If a value changed on purpose, run `pnpm baseline` and explain the change in the commit.
2. Bump `version` in `package.json`, commit `dist/` with the change.
3. Tag and push: `git tag v0.3.3 && git push origin main v0.3.3`.
4. Consumers move to the tag: `pnpm add github:thoerwink8/fleet-design#v0.3.3`.

## Upgrading from 0.2

0.3.0 renames what the package puts into a page and moves the page reset into its own file. Values are unchanged: with `reset.css` loaded, every element of the preview site computes to the same styles as on 0.2.1. No alias for an old name is kept, because an alias would put `--accent` and `--border` back into the page, which is what the prefix removes.

**1. Custom properties are `--fa-*`.** Every variable from `tokens.css` and the three that components set for themselves gained the prefix. The rule is mechanical: `--<name>` becomes `--fa-<name>`.

| 0.2                                                                                          | 0.3                                               |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `--bg`, `--fg`, `--fg-muted`, `--panel`, `--overlay`, `--border`, `--accent`, `--focus-ring` | `--fa-bg`, `--fa-fg`, …, `--fa-focus-ring`        |
| `--success`, `--warning`, `--danger`, `--info`, `--selected`, `--hover`, `--up`, `--down`    | `--fa-success`, …, `--fa-down`                    |
| `--palette-*`, `--brand-*`, `--data-1` … `--data-6`                                          | `--fa-palette-*`, `--fa-brand-*`, `--fa-data-*`   |
| `--space-*`, `--radius-sm\|md\|lg\|full`, `--ctrl-*`, `--row-*`, `--bp-*`, `--bw-*`          | `--fa-space-*`, `--fa-radius-*`, `--fa-ctrl-*`, … |
| `--dur-*`, `--ease-out`, `--ease-in-out`, `--font-sans`, `--font-mono`, `--shadow-overlay`   | `--fa-dur-*`, `--fa-ease-*`, `--fa-font-*`, …     |
| `--wash2`, `--hv`, `--ring` (set by components)                                              | `--fa-wash2`, `--fa-hv`, `--fa-ring`              |

In a project that used only fleet-design's variables, replace `var(--` with `var(--fa-` in the places that refer to them. Token names in `tokens.json` are unchanged (`accent`, `space-4`).

**2. Type classes and four helper classes are `.fa-*`.**

| 0.2                                                                   | 0.3                                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `.caption`, `.caption-strong`, `.control`, `.control-strong`, `.body` | `.fa-caption`, `.fa-caption-strong`, `.fa-control`, `.fa-control-strong`, `.fa-body` |
| `.title`, `.heading`, `.code`, `.code-sm`                             | `.fa-title`, `.fa-heading`, `.fa-code`, `.fa-code-sm`                                |
| `.pr-open`, `.pr-merged`, `.pr-closed`, `.pr-draft`                   | `.fa-pr-open`, `.fa-pr-merged`, `.fa-pr-closed`, `.fa-pr-draft`                      |
| `.body` inside `.fa-cmd__row` (command palette result text)           | `.fa-cmd__body`                                                                      |
| `.body` inside `.fa-dp` (details panel content)                       | `.fa-dp__body`                                                                       |

The React components render the new names; only hand-written markup needs the last two.

**3. The reset is its own file.** `styles.css` no longer contains rules on `*`, `html`, `body`, `button`, `input`, `textarea`, `select`, `[hidden]` or a page-wide `:focus-visible`. To keep a page looking as it did, import `reset.css` between the tokens and the styles:

```css
@import "@fleet/design/tokens.css";
@import "@fleet/design/reset.css";
@import "@fleet/design/styles.css";
```

A project that imported single files gets the same split: `styles/base.css` now holds only the shared helpers and the scoped focus ring, and `styles/reset.css` holds the reset. Projects with a reset of their own leave it out (see [Plain CSS](#plain-css)). Reduced motion moved from a page-wide rule into `tokens.css`, where the duration tokens collapse; `reset.css` still carries the page-wide rule for everything else on the page.

**4. Tailwind: two entries.** `@fleet/design/tailwind` still replaces Tailwind's scale and keeps its utility names (`bg-panel`, `rounded-md`); it now points at the `--fa-*` variables, and no longer needs `tokens.css` to be unlayered. A project with its own Tailwind theme uses the new `@fleet/design/tailwind/extend` instead ([Tailwind v4](#tailwind-v4), [Adding it to an existing Tailwind project](#adding-it-to-an-existing-tailwind-project)).

## Changes in 0.3.3

Generic gaps found while a product adopted the library. Class names are unchanged. New modifiers are `.fa-item--selected`, `.fa-select--sm`, `.fa-dot--warning`, `.fa-empty__media` and `.fa-empty__media--warning`.

| Item | What changed                                                                                                                                                                            | App override this replaces                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1    | An `svg` in a button does not shrink and is 16px unless it is already `.fa-ic`. Icon-only buttons stay square at 24 / 28 / 32 / 40.                                                     | `fleet-overrides/button.css` svg shrink and default icon size                               |
| 2    | `.fa-btn` is `position: relative`. On a coarse pointer `::after` is at least 44×44 and the visible box stays its step.                                                                  | `fleet-overrides/button.css` coarse `::after`                                               |
| 3    | Disabled look is `:is([disabled], [aria-disabled="true"], [data-disabled])`, except `aria-busy` (the loading button keeps its fill). No hover or press fill.                            | `fleet-overrides/button.css` `data-disabled` / `aria-disabled` rules                        |
| 4    | Colour transitions run only while hovering or pressing.                                                                                                                                 | `fleet-overrides/button.css` `transition: none`                                             |
| 5    | `.fa-pop` padding stays 8px. A search `.fa-input` inside a popup is 28px (`ctrl-sm`). Measured before: padding 8px, the select card's search field 28px from an inline style, not 26px. | the inline `height:28px` on that search field                                               |
| 6    | `.fa-item` uses `min-height: var(--fa-ctrl)`, so a row with an icon and a row without are the same height.                                                                              | `fleet-overrides/menu.css` `min-height: var(--fa-ctrl)`                                     |
| 7    | Highlighted, selected and `.fa-item--selected` use `--fa-selected` and no hover wash.                                                                                                   | command and menu rows repainting the highlight because `--fa-hover` was an accent           |
| 8    | `.fa-cmd--modal` is centred, `top: 15%`, `max-height: calc(100vh - 15vh - 32px)`.                                                                                                       | the app's own command popup positioning for the offset and the max height. z-index stays 41 |
| 9    | `.fa-cmd__in` and `.fa-cmd__foot` are `flex-shrink: 0`. The list is the flex child that shrinks.                                                                                        | `shrink-0` on those two elements in the app command dialog                                  |
| 10   | A disabled command row has no keyboard highlight. Arrow keys, Home and End skip it.                                                                                                     | app code that had to skip disabled command rows itself                                      |
| 11   | `.fa-input`, `.fa-input__control` and `.fa-cmd__in input` are 16px below 480px and 14px above. 16px is the iOS focus-zoom floor, not a new type step.                                   | `fleet-overrides/input.css` and `fleet-overrides/command.css` 16px field text               |
| 12   | `.fa-dot--warning` uses `--fa-warning`, distinct from `.fa-dot--needs` (info) in light and dark.                                                                                        | borrowing `.fa-dot--needs` for a warning                                                    |
| 13   | `.fa-status` is 20px (`ctrl-2xs`). It was 16px from the 12/16 line.                                                                                                                     | pinning the status tag to 20px in the app                                                   |
| 14   | `.fa-empty__media` is the neutral icon. `.fa-empty__media--warning` is a warning-coloured icon and has no filled block.                                                                 | `EmptyMedia variant="warning"`                                                              |
| 15   | `.fa-select--sm` is a bordered 28px trigger. `size="sm"` on `Select`. Ghost stays the borderless 28.                                                                                    | a toolbar select that had to invent a bordered 28                                           |

Product-only overrides (glass, overlay, Grove and Ember fills, dialog sectioning, menu switch, sheet) stay in the app. They are not generic.

## Changes in 0.2.1

Fixed: narrow-width `Menu` submenus open inline below their trigger instead of overlapping parent rows; `Select` unmounts its portal after closing so no stale `role="listbox"` remains; `Dialog` and `ConfirmDialog` trap `Tab` and `Shift+Tab` synchronously inside the dialog; `Toast` uses a circle-with-`i` icon for `info` and a triangle `!` icon for `warning` so all four kinds are distinct in shape.

## Changes in 0.2.0

Breaking (no consumer used 0.1 yet, but check before upgrading):

- Brand names: the trading review app's brand is now `trade` (`data-project="trade"`, `--brand-trade`) and the fleet dashboard's is `board` (`data-project="board"`, `--brand-board`); the 0.1 project codenames are gone and the hygiene check rejects them. `fleet` is unchanged.
- The `[data-project]` brand rules moved from `styles/base.css` into `tokens.css`. Importing `tokens.css` alone now switches brand; `styles/base.css` no longer contains them.

Added: the React components; `--row-table` (40, table body rows, previously `--ctrl-lg`); `styles/checkbox.css`; the prefix/suffix input frame; modal-layer classes (`.fa-backdrop`, `.fa-dialog--modal`, `.fa-drawer--fixed`, `.fa-cmd--modal`, `.fa-toasts`); Base UI state attributes on menu items. Fixed: the strip under the composer hides the branch name below 400 instead of cutting it; number headers in tables line up with their numbers; the command palette states its 8px padding itself.

## Why dist/ is committed

Installing from git with a `prepare` script would build on every consumer's machine: pnpm would have to fetch this repo's dev dependencies first, and recent pnpm versions do not run dependency build scripts until the consumer approves them. Committing `dist/` keeps installation a plain file copy on Windows and Linux CI, with nothing to approve and no tools to install. The `dist is current` check keeps the committed files equal to a fresh build, so they cannot drift from `tokens/` and `styles/`.

## Roadmap

- Switch, Kbd, Popover and other parts not covered yet will reuse the same roles, type scale and 4px spacing.
- Business components (ThreadRow, Composer, tables) stay in the products for now; move one here only when two products need the same behaviour.

## Acknowledgements

Six themes take their base colours from open-source schemes: Solarized (Ethan Schoonover, MIT), Dracula (Dracula Theme, MIT), Nord (Sven Greb, MIT), Tokyo Night (Enkia, MIT), One Dark (GitHub Inc., MIT) and Darcula (JetBrains, Apache-2.0). Some values are adjusted in lightness to meet the contrast targets. Sources and notices are in [NOTICE](NOTICE). Light and Dark are this project's own neutral themes.

## License

[MIT](LICENSE)

# fleet-design

Shared design tokens and component styles for three products that use one interface language: a coding-agent client ([fleet-ade](https://github.com/thoerwink8/fleet-ade)), a trading review app and a fleet dashboard. Behaviour comes from [Base UI](https://base-ui.com); this package owns the look: CSS variables and the `.fa-*` component classes. Each product writes its own business components on top.

Version 0.2 ships tokens, component CSS, a Tailwind v4 theme, React components built on Base UI, and a preview site. What changed is under [Changes in 0.2.1](#changes-in-021) and [Changes in 0.2.0](#changes-in-020).

## Three layers

| Layer             | Variables                                                                                                                                                                                                      | Who uses it                                                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Base palette   | `--palette-n0` … `--palette-n9`, `--palette-red`, `-green`, `-amber`, `-blue`, `-cyan`                                                                                                                         | Only the semantic layer. Changing theme swaps this layer.                                                                              |
| 2. Semantic roles | `--bg`, `--panel`, `--overlay`, `--fg`, `--fg-muted`, `--border`, `--accent`, `--on-accent`, `--success`, `--warning`, `--danger`, `--on-danger`, `--info`, `--selected`, `--hover`, `--scrim`, `--focus-ring` | Components and pages. Never use `--palette-*` directly.                                                                                |
| 3. Brand          | `--brand-fleet`, `--brand-trade`, `--brand-board`                                                                                                                                                              | Re-points `--accent` per product; `--focus-ring` follows it. `--on-accent`, `--selected` and `--hover` stay the same in every product. |

Two more colour groups sit beside the roles:

- **Market direction** `--up`, `--down`, `--flat`: which way a number moved. Not the same as `--success` / `--danger` (the state of an operation). The trading brand flips them to red-up / green-down.
- **Data categories** `--data-1` … `--data-6`: legend dots, segment bars and chart marks only. They say "which category", never good or bad.

Scales: spacing `--space-1` … `--space-12` plus the density tokens (`--space-row-x`, `--space-icon-gap`, …), radius `--radius-sm|md|lg|full`, control and row heights `--ctrl-*`, `--row-*`, breakpoints `--bp-*`, durations `--dur-*`, easings `--ease-*`, one shadow `--shadow-overlay`, and type classes `.caption`, `.control`, `.control-strong`, `.body`, `.title`, `.heading`, `.code`, `.code-sm`.

The source of every value is `tokens/*.json`. `pnpm build` generates `dist/tokens.css` and `dist/tokens.json` from it.

## Install

```sh
pnpm add github:thoerwink8/fleet-design#v0.2.1
```

The package is not published to npm. `dist/` is committed, so installing from git needs no build step and no extra tools, on Windows and Linux alike (see [Why dist/ is committed](#why-dist-is-committed)).

| Import                            | File                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| `@fleet/design/tokens.css`        | all variables, eight themes                                                                |
| `@fleet/design/tokens.json`       | the same values as data                                                                    |
| `@fleet/design/styles.css`        | every component class, in cascade order                                                    |
| `@fleet/design/styles/<name>.css` | one component, e.g. `styles/button.css`; `styles/base.css` holds resets and shared helpers |
| `@fleet/design/tailwind`          | Tailwind v4 theme mapped to the variables                                                  |
| `@fleet/design/react`             | all React components (see [React](#react))                                                 |
| `@fleet/design/react/<name>`      | one component, e.g. `react/button`, `react/command-palette`                                |

## Use it

### Plain CSS

```html
<html data-theme="dark" data-project="board">
  <head>
    <link rel="stylesheet" href="node_modules/@fleet/design/dist/tokens.css">
    <link rel="stylesheet" href="node_modules/@fleet/design/dist/styles.css">
  </head>
  <body>
    <button class="fa-btn fa-btn--primary">刷新</button>
    <span class="fa-status"><span class="fa-dot fa-dot--running"></span>运行中</span>
  </body>
</html>
```

With a bundler: `import '@fleet/design/tokens.css'; import '@fleet/design/styles.css';` once at the app entry. Your own CSS uses roles only: `background: var(--panel); color: var(--fg-muted); padding: var(--space-4);`.

### Tailwind v4

```css
@import "tailwindcss";
@import "@fleet/design/tokens.css";
@import "@fleet/design/styles.css"; /* only if you use the .fa-* component classes */
@import "@fleet/design/tailwind";
```

Then `bg-panel`, `text-fg-muted`, `border-border`, `text-up`, `px-row-x`, `h-ctrl`, `text-sm`, `rounded-md`, `font-medium` resolve to the variables. Tailwind's default palette, the 13/16/24px sizes and weights 600+ are removed, so off-scale classes do not exist. `tokens.css` alone is enough for the variables, the eight themes and the brand switch. Import `tokens.css` unlayered as shown: the theme refers to `--font-sans`, `--font-mono` and `--shadow-overlay` by the same names. Tailwind is optional; projects without it use the plain CSS above.

### React

`@fleet/design/react` wraps [Base UI](https://base-ui.com) parts for behaviour (keyboard, focus, ARIA) and maps a few `variant` / `size` props onto the same `.fa-*` classes. It adds no styles of its own and imports no CSS.

```sh
pnpm add github:thoerwink8/fleet-design#v0.2.1 @base-ui/react react react-dom
```

Peer dependencies: `react` and `react-dom` 18.2+ or 19, `@base-ui/react` 1.9+ (built and tested with 1.9.0 and React 19.3). They are optional, so CSS-only projects get no warnings.

```tsx
// once, at the app entry
import '@fleet/design/tokens.css';
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
- With Tailwind: import `tokens.css`, then `styles.css` (for the components), then the theme, as in the Tailwind section. Utilities are fine for page layout around the components; do not restyle a component with utilities.

| Component                     | What it is for                       | Shortest use                                                                         | Not obvious                                                                                                                                                                |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`, `IconButton`        | actions                              | `<Button variant="primary">发送</Button>`                                            | `loading` keeps focus, ignores clicks and swaps the label for `loadingText` (no spinner). `size="sm"` (28) only inside a bar at least 32 high. `IconButton` needs `label`. |
| `SegmentedControl`            | one of a few always-visible choices  | `<SegmentedControl aria-label="字号" options={…} value onValueChange />`             | A radio group (Base UI RadioGroup): Tab enters at the checked item, arrows move and select.                                                                                |
| `Input`                       | labelled text field                  | `<Input label="分支名" value onValueChange error={msg} />`                           | `error` sets `aria-invalid` and replaces the hint; `prefix` / `suffix` sit inside the frame. `mono` only for paths, branches and IDs.                                      |
| `Tooltip`, `TooltipProvider`  | supplementary hint on hover or focus | `<Tooltip content="新建会话" shortcut="Ctrl+N"><Button …/></Tooltip>`                | 500 ms delay, Esc closes. Never the only place for important information (touch users never see it).                                                                       |
| `Menu`                        | action menu from data                | `<Menu trigger={<IconButton label="更多">…</IconButton>} items={[…]} />`             | Single-letter `shortcut`s work while the menu is open; checkbox items stay open; disabled items can be reached but do nothing; `type: 'submenu'` nests.                    |
| `Select`                      | single choice from a list            | `<Select options value onValueChange aria-label />`                                  | The list opens under the trigger, not over it. `variant="ghost"` is the frameless 28-high picker for composers and toolbars.                                               |
| `ToastProvider`, `useToast`   | confirm what just happened           | `useToast().show({ text: '已归档', action: { label: '撤销', onClick } })`            | 4 s, 8 s with an action; at most 3; hover or focus pauses. Errors go to the status strip, not to a toast.                                                                  |
| `Dialog`, `DialogClose`       | short modal task                     | `<Dialog trigger={<Button>重命名</Button>} title footer>…</Dialog>`                  | Focus moves in and is trapped, Esc or the scrim closes, focus returns to the trigger.                                                                                      |
| `ConfirmDialog`               | before an irreversible action        | `<ConfirmDialog title description confirmLabel="删除对话" danger onConfirm />`       | Focus starts on 取消; the scrim does not dismiss it. Prefer undo for anything reversible.                                                                                  |
| `Drawer`                      | side panel on narrow screens         | `<Drawer label="会话列表" trigger={…}>…</Drawer>`                                    | Modal (Base UI Dialog); slides in from the left and leaves no shadow when closed.                                                                                          |
| `Collapsible`, `DetailsPanel` | show or hide a block                 | `<DetailsPanel><Collapsible title="环境" defaultOpen>…</Collapsible></DetailsPanel>` | `variant="fold"` is the quiet summary row that folds tool calls in a conversation.                                                                                         |
| `Meter`                       | how full something is                | `<Meter label="上下文占用" value={70} showValue />`                                  | Turns danger at 95% (`dangerAt`). `segments` split it by category with data colours; give each a legend entry too. Not a progress indicator.                               |
| `CommandPalette`              | search and run                       | `<CommandPalette open onOpenChange items={[{ id, title, group, onRun }]} />`         | Every typed word must match the title or `keywords`; ↑↓ wrap across groups; Enter runs and closes. Open it from your own shortcut by setting `open`.                       |
| `Checkbox`                    | on or off in a list or form          | `<Checkbox label="显示已归档" checked onCheckedChange />`                            | Checked is neutral grey, not the accent. `indeterminate` for select-all.                                                                                                   |

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

| `data-project` | product             | accent                   | market colours     |
| -------------- | ------------------- | ------------------------ | ------------------ |
| none           | coding-agent client | `--brand-fleet` (blue)   | up green, down red |
| `trade`        | trading review app  | `--brand-trade` (indigo) | up red, down green |
| `board`        | fleet dashboard     | `--brand-board` (teal)   | up green, down red |

The brand rules are part of `tokens.css` (generated from `projects` in `tokens/brand.json`), so a project that imports only the tokens switches brand too. A brand re-points `--accent`; `--focus-ring` follows it, `--on-accent` stays equal to `--bg`, and the trading brand also flips `--up` / `--down`. Nothing else changes. The accent appears in five places only: primary button, links, progress and meters, focus ring, unread dot. Selected and hovered rows use the neutral `--selected` / `--hover` in every brand.

No decorative gradients. Two gradients are intentional and are not colours of their own: the hover wash, layered as `linear-gradient(var(--hover), var(--hover))` so it works on any surface, and the scroll hint at the right edge of a wide table (`styles/table.css`).

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

Rows and standalone controls you can click are at least 32 high; 24 is only for rows you cannot click. Smaller controls live only inside a bar or row that is itself at least 32: small buttons (28, `fa-btn--sm`) grouped as secondary actions in a toolbar, status strip, composer bar or batch bar, icon buttons (28) inside rows, and segmented-control items (24) inside their 32 group. Table rows are 40 (`row-table`), a spec of their own. Narrow containers collapse controls with container queries instead of truncating them (`bp-composer-foot` 520, `bp-composer-account` 400, `bp-composer-icon` 300, `bp-batch` 320); below 400 the strip under the composer drops the branch name and keeps project and usage.

The full rules (type scale, weights, colour use, motion, interaction) are in [AGENTS.md](AGENTS.md).

## Preview site

```sh
pnpm install
pnpm dev     # http://127.0.0.1:5178, rebuilds dist/ when tokens/ or styles/ change
pnpm stop    # stops the server started by pnpm dev
```

The 31 cards in `previews/cards/` load the built `dist/tokens.css` and `dist/styles.css`. The React group has one page per React component (`previews/react/<Name>.tsx`, bundled on request). The toolbar switches theme, light / dark / system, brand and width (full, 720, 360). `PORT=5200 pnpm dev` picks another port.

## Commands

| Command                  | What it does                                                             |
| ------------------------ | ------------------------------------------------------------------------ |
| `pnpm build`             | generate `dist/tokens.css`, `dist/tokens.json`, `dist/styles.css`        |
| `pnpm check`             | everything CI runs (below)                                               |
| `pnpm dev` / `pnpm stop` | preview site                                                             |
| `pnpm baseline`          | accept the current build as the new baseline after an intentional change |
| `pnpm format`            | format with Biome                                                        |
| `pnpm test:react`        | Playwright interaction tests of the React components (`test/react/`)     |
| `pnpm smoke`             | install the packed package into an empty project, type-check and bundle  |
| `pnpm typecheck`         | TypeScript only                                                          |

`pnpm check` runs: tokens equal the baseline byte for byte; component styles equal the baseline rule for rule; `dist/` (CSS and `dist/react`) is current; TypeScript; a static scan (font sizes 12/14/15/18/20, no weight ≥ 600, spacing in multiples of 4, colours only through variables, monospace only on code classes); contrast for 8 themes × 3 brands (text 4.5, marks 3); data colours under simulated colour-vision deficiency; the Tailwind theme compile; every preview card rendered in headless Chromium against the baseline, computed style by computed style; the density table at 1000 and overflow at 360, for the cards and the React pages; every page loads without a failed request; React elements against the same state on the static card, computed style by computed style; a scan for local paths, private names and images; Biome. The browser checks need Chromium once: `pnpm exec playwright install chromium`.

## Releasing

1. Change `tokens/` or `styles/`, run `pnpm build` and `pnpm check`. If a value changed on purpose, run `pnpm baseline` and explain the change in the commit.
2. Bump `version` in `package.json`, commit `dist/` with the change.
3. Tag and push: `git tag v0.2.1 && git push origin main v0.2.1`.
4. Consumers move to the tag: `pnpm add github:thoerwink8/fleet-design#v0.2.1`.

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

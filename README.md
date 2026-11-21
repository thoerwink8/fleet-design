# fleet-design

Shared design tokens and component styles for three products that use one interface language: a coding-agent client ([fleet-ade](https://github.com/thoerwink8/fleet-ade)), a trading review app and a fleet dashboard. Behaviour comes from [Base UI](https://base-ui.com); this package owns the look: CSS variables and the `.fa-*` component classes. Each product writes its own business components on top.

Version 0.1 ships tokens, component CSS, a Tailwind v4 theme and a preview site. React components built on Base UI are the next step (see [Roadmap](#roadmap)).

## Three layers

| Layer             | Variables                                                                                                                                                                                                      | Who uses it                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1. Base palette   | `--palette-n0` … `--palette-n9`, `--palette-red`, `-green`, `-amber`, `-blue`, `-cyan`                                                                                                                         | Only the semantic layer. Changing theme swaps this layer.                       |
| 2. Semantic roles | `--bg`, `--panel`, `--overlay`, `--fg`, `--fg-muted`, `--border`, `--accent`, `--on-accent`, `--success`, `--warning`, `--danger`, `--on-danger`, `--info`, `--selected`, `--hover`, `--scrim`, `--focus-ring` | Components and pages. Never use `--palette-*` directly.                         |
| 3. Brand          | `--brand-fleet`, `--brand-ashare`, `--brand-jiqun`                                                                                                                                                             | Re-points `--accent` per product. Everything else is identical across products. |

Two more colour groups sit beside the roles:

- **Market direction** `--up`, `--down`, `--flat`: which way a number moved. Not the same as `--success` / `--danger` (the state of an operation). The trading brand flips them to red-up / green-down.
- **Data categories** `--data-1` … `--data-6`: legend dots, segment bars and chart marks only. They say "which category", never good or bad.

Scales: spacing `--space-1` … `--space-12` plus the density tokens (`--space-row-x`, `--space-icon-gap`, …), radius `--radius-sm|md|lg|full`, control and row heights `--ctrl-*`, `--row-*`, breakpoints `--bp-*`, durations `--dur-*`, easings `--ease-*`, one shadow `--shadow-overlay`, and type classes `.caption`, `.control`, `.control-strong`, `.body`, `.title`, `.heading`, `.code`, `.code-sm`.

The source of every value is `tokens/*.json`. `pnpm build` generates `dist/tokens.css` and `dist/tokens.json` from it.

## Install

```sh
pnpm add github:thoerwink8/fleet-design#v0.1.0
```

The package is not published to npm. `dist/` is committed, so installing from git needs no build step and no extra tools, on Windows and Linux alike (see [Why dist/ is committed](#why-dist-is-committed)).

| Import                            | File                                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `@fleet/design/tokens.css`        | all variables, eight themes                                                                  |
| `@fleet/design/tokens.json`       | the same values as data                                                                      |
| `@fleet/design/styles.css`        | every component class, in cascade order                                                      |
| `@fleet/design/styles/<name>.css` | one component, e.g. `styles/button.css`; `styles/base.css` holds resets and the brand switch |
| `@fleet/design/tailwind`          | Tailwind v4 theme mapped to the variables                                                    |

## Use it

### Plain CSS

```html
<html data-theme="dark" data-project="jiqun">
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
@import "@fleet/design/styles/base.css"; /* or styles.css for all component classes */
@import "@fleet/design/tailwind";
```

Then `bg-panel`, `text-fg-muted`, `border-border`, `text-up`, `px-row-x`, `h-ctrl`, `text-sm`, `rounded-md`, `font-medium` resolve to the variables. Tailwind's default palette, the 13/16/24px sizes and weights 600+ are removed, so off-scale classes do not exist. Import `tokens.css` unlayered as shown: the theme refers to `--font-sans`, `--font-mono` and `--shadow-overlay` by the same names. Tailwind is optional; projects without it use the plain CSS above.

### React (next step)

`@fleet/design/react` is reserved for components built on Base UI with these classes. It is not exported yet. Until then, React projects use Base UI parts directly and add the `.fa-*` classes, or the Tailwind theme.

## Themes and brands

Set two attributes on the root element:

```html
<html data-theme="nord" data-project="ashare">
```

| `data-theme`                                                    | kind  |
| --------------------------------------------------------------- | ----- |
| `light` (default), `solarized`                                  | light |
| `dark`, `darcula`, `one-dark`, `dracula`, `nord`, `tokyo-night` | dark  |

Each theme is either light or dark; to follow the system, pick one light and one dark theme and switch `data-theme` on `prefers-color-scheme`. Native scrollbars and form controls follow through `color-scheme`.

| `data-project` | product             | accent                    | market colours     |
| -------------- | ------------------- | ------------------------- | ------------------ |
| none           | coding-agent client | `--brand-fleet` (blue)    | up green, down red |
| `ashare`       | trading review app  | `--brand-ashare` (indigo) | up red, down green |
| `jiqun`        | fleet dashboard     | `--brand-jiqun` (teal)    | up green, down red |

The brand rules live in `styles/base.css` (also inside `styles.css`). The accent appears in five places only: primary button, links, progress and meters, focus ring, unread dot. Selected and hovered rows use the neutral `--selected` / `--hover` in every brand.

## Density

按主流桌面开发工具的实测密度定的 (measured against mainstream desktop developer tools). `pnpm check` measures the rendered previews against this table.

| Where                                                                                    | Size                                         | Token                             |
| ---------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------- |
| Clickable one-line row (environment, outputs, connectors, thread rows, task rows)        | 32                                           | `row-1`                           |
| Data-only row, not clickable (context breakdown, expanded group items)                   | 24                                           | `row-data`                        |
| Two-line row (changes, threads that need you, expanded task, menu item with description) | 52 = 8 + 20 + 16 + 8                         | `row-2`, `space-row-y`            |
| Three-line result row (command palette)                                                  | 72                                           | `row-3`                           |
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

Anything clickable is at least 32 high; 24 is only for rows you cannot click. Narrow containers collapse controls with container queries instead of truncating them (`bp-composer-foot` 520, `bp-composer-account` 400, `bp-composer-icon` 300, `bp-batch` 320).

The full rules (type scale, weights, colour use, motion, interaction) are in [AGENTS.md](AGENTS.md).

## Preview site

```sh
pnpm install
pnpm dev     # http://127.0.0.1:5178, rebuilds dist/ when tokens/ or styles/ change
pnpm stop    # stops the server started by pnpm dev
```

The 31 cards in `previews/cards/` load the built `dist/tokens.css` and `dist/styles.css`. The toolbar switches theme, light / dark / system, brand and width (full, 720, 360). `PORT=5200 pnpm dev` picks another port.

## Commands

| Command                  | What it does                                                             |
| ------------------------ | ------------------------------------------------------------------------ |
| `pnpm build`             | generate `dist/tokens.css`, `dist/tokens.json`, `dist/styles.css`        |
| `pnpm check`             | everything CI runs (below)                                               |
| `pnpm dev` / `pnpm stop` | preview site                                                             |
| `pnpm baseline`          | accept the current build as the new baseline after an intentional change |
| `pnpm format`            | format with Biome                                                        |

`pnpm check` runs: tokens equal the baseline byte for byte; component styles equal the baseline rule for rule; `dist/` is current; a static scan (font sizes 12/14/15/18/20, no weight ≥ 600, spacing in multiples of 4, colours only through variables, monospace only on code classes); contrast for 8 themes × 3 brands (text 4.5, marks 3); data colours under simulated colour-vision deficiency; the Tailwind theme compile; every preview card rendered in headless Chromium against the baseline, computed style by computed style; the density table; a scan for local paths, private names and images; Biome. The browser checks need Chromium once: `pnpm exec playwright install chromium`.

## Releasing

1. Change `tokens/` or `styles/`, run `pnpm build` and `pnpm check`. If a value changed on purpose, run `pnpm baseline` and explain the change in the commit.
2. Bump `version` in `package.json`, commit `dist/` with the change.
3. Tag and push: `git tag v0.2.0 && git push origin main v0.2.0`.
4. Consumers move to the tag: `pnpm add github:thoerwink8/fleet-design#v0.2.0`.

## Why dist/ is committed

Installing from git with a `prepare` script would build on every consumer's machine: pnpm would have to fetch this repo's dev dependencies first, and recent pnpm versions do not run dependency build scripts until the consumer approves them. Committing `dist/` keeps installation a plain file copy on Windows and Linux CI, with nothing to approve and no tools to install. The `dist is current` check keeps the committed files equal to a fresh build, so they cannot drift from `tokens/` and `styles/`.

## Roadmap

- **0.2: React.** `@fleet/design/react` with Base UI components that only apply these classes (Button, SegmentedControl, Input, Select, Menu, Tooltip, Toast, Dialog, Drawer, Collapsible, Meter). See AGENTS.md for the planned layout.
- Checkbox, Switch, Kbd, Popover and other parts not covered yet will reuse the same roles, type scale and 4px spacing.

## Acknowledgements

Six themes take their base colours from open-source schemes: Solarized (Ethan Schoonover, MIT), Dracula (Dracula Theme, MIT), Nord (Sven Greb, MIT), Tokyo Night (Enkia, MIT), One Dark (GitHub Inc., MIT) and Darcula (JetBrains, Apache-2.0). Some values are adjusted in lightness to meet the contrast targets. Sources and notices are in [NOTICE](NOTICE). Light and Dark are this project's own neutral themes.

## License

[MIT](LICENSE)

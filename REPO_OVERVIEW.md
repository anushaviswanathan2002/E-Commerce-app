# ShopEasy — Repository Overview

## Purpose

**ShopEasy** is a small, self-contained **front-end e-commerce storefront demo** built to demonstrate a complete shopping journey in React: *browse a product catalogue → filter by category → add items to a cart → adjust quantities → check out*.

It is a **UI-only prototype**. There is no backend, no database, no authentication, and no real payment processing. All product data is a hard-coded in-memory array, and "checkout" simply fires a browser `alert()` and clears the cart. The repo's value is as a compact, readable reference implementation of common React commerce patterns — useful for learning, for interview/demo purposes, or as a starting skeleton for a larger store.

> Product name in the UI: **ShopEasy** (`index.html:6`, `src/App.jsx:55`)
> Package name in `package.json`: `e-commerce-app`

---

## Tech Stack

| Layer | Technology | Version | Source |
|---|---|---|---|
| UI library | React + ReactDOM | `^18.3.1` | `package.json:12-14` |
| Build tool / dev server | Vite | `^5.4.10` | `package.json:17` |
| JSX transform | `@vitejs/plugin-react` | `^4.3.4` | `package.json:16`, `vite.config.js:4` |
| Styling | Plain hand-written CSS | — | `src/index.css` (270 lines) |
| Language | JavaScript + JSX (ESM) | `"type": "module"` | `package.json:5` |
| Runtime deps | **Only React** — no router, state library, or UI kit | — | `package.json:11-15` |

**Notable:** the dependency footprint is deliberately minimal. There is no `react-router`, no Redux/Zustand, no Tailwind, and no component library. Everything is hand-rolled.

---

## Project Structure

```
E-Commerce-app/
├── index.html            # Vite entry HTML; mounts #root, loads /src/main.jsx
├── package.json          # Deps + npm scripts (dev / build / preview)
├── vite.config.js        # Minimal config: only the React plugin
├── .gitignore            # node_modules, dist, .vite, .DS_Store
├── README.md             # Brief 23-line overview
└── src/
    ├── main.jsx          # React bootstrap — createRoot + StrictMode
    ├── App.jsx           # Entire application (142 lines)
    └── index.css         # All styling: navbar, hero, grid, modal
```

The app is intentionally **flat** — a single `App.jsx` with no `components/`, `hooks/`, or `data/` directories.

---

## Architecture & Data Flow

### 1. Bootstrap

`src/main.jsx:7-9` — `ReactDOM.createRoot()` renders `<App />` wrapped in `<React.StrictMode>`.

### 2. State — three `useState` hooks (`src/App.jsx:18-20`)

| State | Type | Purpose |
|---|---|---|
| `category` | `string` | Active category filter, default `'All'` |
| `cart` | `array` | Cart line items (`product` fields + `qty`) |
| `cartOpen` | `boolean` | Whether the cart modal is visible |

All state is **local component state** — it lives in `App` and resets on every page reload. There is no persistence (no `localStorage`, no context, no URL state).

### 3. Data — static constants (`src/App.jsx:3-16`)

```js
const PRODUCTS = [ /* 8 items: id, name, category, price, emoji */ ]
const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home']
```

Each product uses an **emoji as its image** (🎧, ⌚, 👟 …), which keeps the demo dependency-free and image-asset-free.

### 4. Derived state — `useMemo` (`src/App.jsx:22-25`)

```js
const filtered = useMemo(
  () => (category === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === category)),
  [category],
)
```

Filtering is memoised on `category` so the product grid isn't re-filtered on unrelated renders (e.g. cart updates).

### 5. Handlers (all pure state transforms)

- **`addToCart(product)`** — `src/App.jsx:27-38`
  Uses the **functional updater form** (`setCart(prev => …)`) to avoid stale-closure bugs. If the product already exists it increments `qty`; otherwise it appends with `qty: 1`.

- **`updateQty(id, delta)`** — `src/App.jsx:40-47`
  Maps to adjust quantity, then **`.filter(i => i.qty > 0)`** — this is how *decrementing to zero implicitly removes* the line item (there is no separate remove button).

- **Totals** — `src/App.jsx:49-50`
  ```js
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0)
  ```

---

## User Interface

| Region | Class | Behaviour |
|---|---|---|
| Navbar | `.navbar` | Sticky header, logo, "Cart" button with live badge (`.cart-badge`) that only renders when `itemCount > 0` (`App.jsx:58`) |
| Hero | `.hero` | Gradient banner, static copy "Discover Great Deals" |
| Filters | `.filters` | One button per category; active one gets `.active` |
| Product grid | `.products` / `.product-card` | Emoji, category tag, name, price (`toFixed(2)`), "Add to Cart" |
| Cart modal | `.modal-overlay` / `.cart-modal` | Rendered only when `cartOpen` is true |

### Modal interaction details

- Overlay click closes the modal; the inner panel calls `e.stopPropagation()` (`App.jsx:88-89`) so clicks inside don't dismiss it.
- Empty state renders a friendly message (`App.jsx:93-95`).
- Checkout (`App.jsx:117-122`) shows `alert('Order placed! Total: $…')`, resets `cart` to `[]`, and closes the modal.

**Styling notes** (`src/index.css`): CSS custom-property-free, reset via `* { margin: 0; padding: 0; box-sizing: border-box }`, flat-design palette (blue `#0984e3`, red accent `#ff7675`, neutral greys), `max-width: 1200px` centred container.

---

## Commands

Defined in `package.json:6-10`:

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Start dev server with HMR |
| `npm run build` | `vite build` | Production bundle into `dist/` |
| `npm run preview` | `vite preview` | Serve the built bundle locally |

---

## What This Repo Is *Not*

Being explicit about scope is important — none of the following exists:

- ❌ Backend, API, or database (no `fetch`, no server directory)
- ❌ Routing (single page, no `react-router`)
- ❌ Tests (no test runner, no `*.test.*` / `*.spec.*` files)
- ❌ Linting/formatting config (no ESLint, Prettier, or Biome)
- ❌ CI/CD (no `.github/`, no pipeline config)
- ❌ TypeScript (all `.jsx`, no `tsconfig.json`)
- ❌ State persistence or auth
- ❌ Accessibility affordances beyond native semantics (the overlay close control is a `div` with `onClick` — not keyboard-focusable or ARIA-labelled)

---

## Strengths

1. **Extremely easy to grasp** — one 142-line file tells the whole story.
2. **Correct React state usage** — functional updaters and `useMemo` dependency arrays are used properly, avoiding the most common beginner bugs.
3. **Zero configuration overhead** — no path aliases, no babel config, no CSS pipeline.
4. **Self-contained assets** — emoji placeholders mean the repo runs with no binary files.

---

## Suggested Next Steps

*(not implemented — suggestions only)*

- **Data layer** — extract `PRODUCTS` into `src/data/products.json` and load via `fetch`, or add a mock API.
- **Component split** — `Navbar`, `ProductCard`, `CategoryFilter`, `CartModal` under `src/components/`.
- **State persistence** — hydrate `cart` from `localStorage`, or introduce Context + `useReducer` once more than one component needs the cart.
- **Real checkout** — a form collecting shipping details, plus an order summary view.
- **Routing & product detail** — `react-router` with `/product/:id` pages and URL-driven category filters (shareable links).
- **Quality gates** — add Vitest + React Testing Library for the `addToCart` / `updateQty` reducers, ESLint, and a GitHub Actions workflow.
- **Accessibility** — convert the modal to `<dialog>` or a proper ARIA dialog with focus trapping, and give quantity buttons `aria-label`s.
- **Performance** — move `total` / `itemCount` into `useMemo` (or a `useCart` hook) if the product list grows.

---

## TL;DR

A **~180-line React 18 + Vite teaching/demo storefront** ("ShopEasy") that lets you browse 8 hard-coded products, filter them by category, manage a shopping cart with quantity controls, and trigger a mock checkout — built with zero third-party libraries beyond React itself, and intended as a lightweight reference or starting point rather than a production e-commerce system.
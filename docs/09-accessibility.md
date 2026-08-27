# Accessibility

This document covers accessibility (a11y) patterns in Stockfolio — what is implemented, what works well, and known gaps.

---

## Goals

Stockfolio targets a solid baseline of accessibility:

- Semantic HTML landmarks for navigation
- Labeled form controls
- Keyboard-accessible modals
- Screen-reader-friendly link labels
- Dark theme with sufficient contrast for UI text

A full **WCAG AA audit** is planned but not yet complete. See [gaps](#known-gaps) below.

---

## Implemented Patterns

### Document structure

| Pattern | Location |
|---------|----------|
| `lang="en"` on `<html>` | `app/layout.tsx` |
| `<main>` landmark | Dashboard, wallet, stock pages |
| `<header>`, `<footer>`, `<nav>` | `Header.tsx`, `Footer.tsx` |
| `<section>` with headings | `Card` component renders `<section>` + `<h2>` |
| `<h1>` for page title | Stock page ticker heading |

### Form accessibility

| Pattern | Location |
|---------|----------|
| `<label htmlFor={id}>` | `Input`, `Select`, `NumberInput` via `useId()` |
| `required` attribute | Auth form fields |
| `minLength={8}` | Password field |
| `autoComplete` | `email`, `current-password`, `new-password` |
| `type="email"` / `type="password"` | Auth modal inputs |

### Modal accessibility

| Pattern | Location |
|---------|----------|
| `role="dialog"` | `Modal.tsx` |
| `aria-modal="true"` | `Modal.tsx` |
| Overlay `aria-label="Close modal overlay"` | `Modal.tsx` |
| Escape key closes modal | `Modal.tsx` |
| Scroll lock (`html.modal-open`) | `globals.css` |
| Block close while submitting | `OrderConfirmModal` |

### Interactive controls

| Pattern | Location |
|---------|----------|
| `role="group" aria-label="Order side"` | Buy/Sell toggle in order forms |
| `role="group" aria-label="Chart time period"` | Chart period buttons |
| `aria-label` on icon-only buttons | Close buttons, user menu, logo link |
| `aria-label` on stock links | "View {symbol} stock details", "Trade {symbol}" |
| `aria-hidden` on decorative elements | Skeleton rows, SVG icons, chevrons |

### Visual accessibility

| Pattern | Location |
|---------|----------|
| Dark color scheme | `viewport.colorScheme: "dark"` |
| `tabular-nums` class | Price/number displays for aligned digits |
| `.metric-value` min-heights | Prevents layout shift during loading |
| Color + text for gains/losses | Green/red text with `+`/`-` prefix, not color alone |

### Auth UX

- Clear error messages displayed below form (visible text, not color-only)
- Loading state on submit button ("Please wait...")
- Disabled state during submission

---

## Component-by-Component Notes

### Header

- Logo link: `aria-label="Stockfolio home"`
- Navigation links: visible text labels (Dashboard, Wallet)
- Ticker links: include change percentage in visible text
- User avatar menu: `aria-label="User menu"`, overlay `aria-label="Close menu"`

### Watchlist

- Stock symbol links have descriptive `aria-label`
- Trade links have `aria-label="Trade {symbol}"`
- Loading skeleton rows marked `aria-hidden`

### Order flow

- Buy/Sell buttons are real `<button>` elements (not divs)
- Confirm modal shows all order details as visible text
- Error feedback uses readable text messages

### Charts

- Period selector buttons are keyboard-focusable `<button>` elements
- Chart SVG is decorative — **no text alternative or data table provided**

---

## Keyboard Navigation

| Action | Key |
|--------|-----|
| Close modal | `Escape` |
| Submit auth form | `Enter` (native form submit) |
| Navigate links/buttons | `Tab` / `Shift+Tab` |

**Not implemented:**
- Focus trap inside modals (Tab can escape to background)
- Focus return to trigger element after modal close
- Skip-to-content link

---

## Screen Reader Considerations

### What works well

- Page structure (headings, landmarks) is navigable
- Form fields announce their labels
- Links have meaningful text or aria-labels
- Modal role is announced

### What may be confusing

| Issue | Impact |
|-------|--------|
| Data displayed as CSS grids, not `<table>` | Holdings, watchlist, transactions not announced as tables |
| Chart is visual-only SVG | No data summary for screen readers |
| Buy/Sell toggle lacks `aria-pressed` | State not announced when switching sides |
| Watch button uses ★/☆ characters | Watching state not explicitly announced |
| Auth errors are plain `<p>`, not `role="alert"` | Errors may not be announced immediately |
| Modals lack `aria-labelledby` | Dialog purpose may not be linked to heading |

---

## Color and Contrast

The app uses a dark theme:

- Background: `#0a0a0a` / `#111111`
- Text: white, slate-300/400 for secondary
- Positive changes: emerald-400 (`#34d399`)
- Negative changes: red-400 (`#f87171`)
- Primary actions: blue-600

Gain/loss indicators always include a `+` or `-` prefix and percentage text, not relying on color alone.

---

## Responsive Design

Accessibility intersects with responsive behavior:

- Navigation links hidden on mobile (hamburger not implemented — mobile users use direct URLs or in-page links)
- Tables use horizontal scroll on small screens (`overflow-x-auto`)
- Touch targets on buttons are at least ~44px height on order forms

---

## Testing Accessibility

### Manual checks

1. Tab through the dashboard — can you reach all interactive elements?
2. Open auth modal — does Escape close it?
3. Use browser DevTools → Accessibility tree to inspect landmarks
4. Test with screen reader (NVDA on Windows, VoiceOver on Mac)

### Automated tools

```bash
# Lighthouse accessibility audit (Chrome DevTools)
# Run on http://localhost:3000/dashboard while logged in

# axe DevTools browser extension
```

Previous Lighthouse improvements are noted in git history (commit: "Improve Lighthouse performance and accessibility").

---

## Known Gaps

| Gap | Priority | Notes |
|-----|----------|-------|
| Focus trap in modals | High | Tab can escape dialog |
| `aria-labelledby` on dialogs | Medium | Headings exist visually but aren't linked |
| `role="alert"` on form errors | Medium | Auth and order errors |
| Table semantics for data grids | Medium | Holdings, watchlist, transactions |
| Chart text alternative | Medium | Provide data summary or table |
| `aria-pressed` on Buy/Sell toggle | Low | State announcement |
| Skip navigation link | Low | Jump to main content |
| `aria-live` regions for polling updates | Low | Price changes not announced |
| Mobile navigation menu | Medium | No hamburger menu for nav links |

---

## Planned Improvements (Roadmap)

- Full WCAG AA audit
- Focus management library for modals
- Convert data grids to semantic `<table>` elements
- Add `aria-live="polite"` for order feedback
- Keyboard shortcuts documentation

---

## Next Steps

- [Performance](./10-performance.md) — related UX optimizations
- [Roadmap & Limitations](./12-roadmap-and-limitations.md) — full project gaps

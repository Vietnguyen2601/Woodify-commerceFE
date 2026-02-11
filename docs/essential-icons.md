# Essential E-commerce Icon Set

Modern outline icon pack optimized for the home page and header navigation.

## Contents

- 27 production-ready SVGs in `src/assets/icons/essential`
- Reusable React component at `src/components/ui/Icon/Icon.tsx`
- Badge utility styles in `src/styles/icon-badge.css`

### Icon Inventory

| Name              | Description                  |
| ----------------- | ---------------------------- |
| search            | Magnifying glass             |
| shopping-cart     | Cart ready for badge overlay |
| user              | Profile avatar               |
| heart             | Wishlist outline             |
| heart-filled      | Wishlist active state        |
| menu              | Hamburger navigation         |
| close             | Close button                 |
| notification-bell | Idle bell                    |
| notification-dot  | Bell with unread dot         |
| phone             | Hotline/contact phone        |
| mail              | Email envelope               |
| globe             | Locale/language selector     |
| map-pin           | Boutique/showroom location   |
| facebook          | Facebook social icon         |
| instagram         | Instagram social icon        |
| tiktok            | TikTok social icon           |
| logo-placeholder  | Geometric brand mark         |
| truck             | Fast shipping                |
| shield-check      | Secure payment/guarantee     |
| refresh           | Easy returns                 |
| headset           | 24/7 support                 |
| star              | Rating outline               |
| star-filled       | Rating selected              |
| tag               | Offer/price tag              |
| gift              | Gift/promo                   |
| arrow-right       | CTA arrow                    |
| chevron-right     | Category chevron             |

## React Usage

```tsx
import { Icon } from "@/components/ui";

export function HeaderSearchButton() {
  return (
    <button className="icon-button" aria-label="Tìm kiếm">
      <Icon name="search" />
    </button>
  );
}
```

**Props**

- `name`: one of the 27 icon names above
- `size`: defaults to 24 (use 16/20/32/48 as needed)
- `strokeWidth`: defaults to 2 for outline icons
- `decorative`: set to `true` for purely ornamental icons
- `title`: override the default accessible label

```tsx
<Icon name="arrow-right" size={32} strokeWidth={1.75} />
<Icon name="heart-filled" decorative />
```

## SVG-only Usage

Reference files directly if needed:

```tsx
<img
  src={new URL("@/assets/icons/essential/truck.svg", import.meta.url).href}
  alt="Giao hàng nhanh"
/>
```

## Cart Badge CSS

The shared badge utility is already imported through `src/styles/index.css`.

```html
<button class="icon-button" aria-label="Giỏ hàng">
  <Icon name="shopping-cart" decorative />
  <span class="icon-button__badge">3</span>
</button>
```

Variant helpers:

- `.icon-button__badge.is-warning` → warning color
- `.icon-button__badge.is-accent` → brand accent

## Notes

- All icons align to a 24×24 viewBox with 2px strokes and rounded caps/joins.
- Filled variants (`heart-filled`, `star-filled`) use `currentColor` fills for easy theming.
- Icons remain crisp down to 16px; prefer integers when setting `size`.

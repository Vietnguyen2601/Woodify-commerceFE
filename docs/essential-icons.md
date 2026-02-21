# Essential E-commerce Icon Set

Modern outline icon pack optimized for the home page and header navigation.

## Contents

- 44 production-ready SVGs under `src/assets/icons/essential` (`interface/`, `commerce/`, `brand/`)
- Reusable React component at `src/components/ui/Icon/Icon.tsx`
- Badge utility styles in `src/styles/icon-badge.css`

### SVG Asset Folders

#### Interface Assets (19)

_Located in `src/assets/icons/essential/interface/`_

| Name              | Description              |
| ----------------- | ------------------------ |
| arrow-right       | CTA arrow                |
| bell              | Generic alert bell       |
| chevron-right     | Category chevron         |
| close             | Close button             |
| filter            | Product filter funnel    |
| globe             | Locale/language selector |
| heart             | Wishlist outline         |
| heart-filled      | Wishlist active state    |
| lock              | Secure lock state        |
| menu              | Hamburger navigation     |
| notification-bell | Idle bell                |
| notification-dot  | Bell with unread dot     |
| pen               | Edit action pencil       |
| phone             | Hotline/contact phone    |
| search            | Magnifying glass         |
| setting           | Settings gear            |
| star              | Rating outline           |
| star-filled       | Rating selected          |
| user              | Profile avatar           |

#### Commerce & Operations Assets (20)

_Located in `src/assets/icons/essential/commerce/`_

| Name          | Description                  |
| ------------- | ---------------------------- |
| approve-tick  | Approval/verification check  |
| bank          | Banking/branch building      |
| chart         | Performance analytics        |
| checklist     | Task/order checklist         |
| credit-card   | Credit card payment          |
| e-wallet      | Digital wallet balance       |
| gift          | Gift/promo                   |
| locker        | Locker/pickup storage        |
| money-in      | Wallet top-up                |
| money-out     | Wallet withdrawal            |
| package       | Package/parcel               |
| point-address | Shipping destination pin     |
| refresh       | Easy returns                 |
| revenue       | Revenue dashboard tile       |
| shield-check  | Secure payment/guarantee     |
| shop          | Storefront/building          |
| shopping-cart | Cart ready for badge overlay |
| tag           | Offer/price tag              |
| truck         | Fast shipping                |
| wallet        | Personal wallet overview     |

#### Brand & Social Assets (5)

_Located in `src/assets/icons/essential/brand/`_

| Name             | Description           |
| ---------------- | --------------------- |
| facebook         | Facebook social icon  |
| headset          | 24/7 support headset  |
| instagram        | Instagram social icon |
| logo-placeholder | Geometric brand mark  |
| tiktok           | TikTok social icon    |

### React Icon Inventory (34 names)

These names match the `name` prop accepted by `<Icon />`.

#### Core UI & Navigation

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
| globe             | Locale/language selector     |
| mail              | Email envelope               |
| map-pin           | Boutique/showroom location   |
| star              | Rating outline               |
| star-filled       | Rating selected              |
| tag               | Offer/price tag              |
| gift              | Gift/promo                   |
| lock              | Secure lock state            |
| filter            | Product filter funnel        |
| arrow-right       | CTA arrow                    |
| chevron-right     | Category chevron             |

#### Brand, Trust & Payments

| Name             | Description                 |
| ---------------- | --------------------------- |
| facebook         | Facebook social icon        |
| instagram        | Instagram social icon       |
| tiktok           | TikTok social icon          |
| logo-placeholder | Geometric brand mark        |
| truck            | Fast shipping               |
| shield-check     | Secure payment/guarantee    |
| refresh          | Easy returns                |
| headset          | 24/7 support                |
| bank             | Banking/branch building     |
| credit-card      | Credit card payment         |
| e-wallet         | Digital wallet balance      |
| locker           | Locker/pickup storage       |
| approve-tick     | Approval/verification check |

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

- `name`: one of the 34 icon names above (via `<Icon />`)
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
  src={
    new URL("@/assets/icons/essential/commerce/truck.svg", import.meta.url).href
  }
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

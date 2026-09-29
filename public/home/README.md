# Home page (dish360.in)

The home page is a static page in this folder, served at `/` by a rewrite in
`next.config.mjs`. It does not use React or the app's components, so it loads
fast and is independent of the rest of the Next.js app.

## Files

- `index.html` the page (markup, page styles, page script)
- `brand.css` / `brand.js` brand tokens, the glass QR card, cursor, AR-table background
- `dish3d.js` the rotatable 3D dish, drawn on canvas
- `qr.js` a real QR code encoder (the table codes on the page are scannable)
- `scrollcraft.js` / `scrollcraft.css` the scroll engine used for reveals
- `assets/logo.png`

## Sign-ups: set this before relying on the page for leads

Plan buttons open a short form (name, restaurant, phone or email, plan). At the
top of the script in `index.html`:

```js
var LEAD_ENDPOINT = "";
```

While it is empty the form **stores nothing** and tells the visitor that
sign-ups open shortly. Paste any URL that accepts a JSON POST (Formspree, a
Google Apps Script web app, a Supabase edge function) and submissions are sent
there as `{ name, restaurant, contact, plan, page, at }`.

## Content

Plans and prices come from `components/PricingSection.tsx` (Starter $0,
Restaurant Pro $79 / $64 billed yearly, Enterprise Group $249 / $199 billed
yearly). If prices change, update both places, or retire the component.
The dish and its price on the page are a labelled sample.

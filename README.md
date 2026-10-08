# ecozenin.com

Static site for Ecozenin wall decor: a product page that sends buyers to Amazon, support pages, and a warranty registration form. Built with Astro, hosted on Firebase.

## Run it

```sh
npm install && npm --prefix functions install
npm run dev          # site only, http://localhost:4321
npm run emulators    # built site + warranty function + Firestore, http://127.0.0.1:5050
```

The form only saves when the emulators are running. `npm run dev` forwards it to them if they are.

## Where things live

| To change | Edit |
|---|---|
| Product name, registry code, warranty length | `functions/products.json` |
| Product copy, Amazon link | `src/data/products.ts` |
| Product photos | `products/<slug>/`, imported in `src/data/products.ts` |
| Support email, legal name | `src/data/site.ts` |
| Page copy | `src/pages/` |
| QR code destinations | `redirects` in `firebase.json` |

## QR codes

Print `https://ecozenin.com/r/<code>` on the insert, never a page URL. Each code is a redirect in `firebase.json` and can be pointed somewhere else later without reprinting. Unknown codes fall back to the registration form.

## Warranty registrations

The form posts to `/api/register`, which Hosting routes to the `registerWarranty` function. It validates the submission and saves it to the `warrantyRegistrations` collection in Firestore. Browsers have no direct access to Firestore.

No emails are sent. Read registrations in the Firebase console under Firestore.

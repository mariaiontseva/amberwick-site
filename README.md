# Axiom Estate Management — website

One-page marketing site for Axiom Estate Management Ltd (formerly the working name "Amberwick"), built from
the design handoff (`design_handoff_amberwick`, logo option 1b).
Plain HTML/CSS/JS, no build step, no dependencies. Served by GitHub Pages from the `main` branch.

```
  index.html      page (copy is final, from the content spec)
  styles.css      design tokens and layout
  site.js         header shadow, active menu item, mobile menu, scroll reveal, enquiry form
  favicon.svg     "Ax" on ink square
  logo-light.svg  logo 1b for light backgrounds
  logo-dark.svg   logo 1b for dark backgrounds
  img/            hero photo (Alessio Patron / Unsplash) and the social-preview crop
```

## Run locally

Any static server works, for example:

```bash
python3 -m http.server 4173
```

then open http://localhost:4173.

## Deploy

GitHub Pages publishes the root of `main` on every push. Custom domain: `axiomestatemanagement.co.uk` (the `CNAME` file);
DNS at the registrar: A records for the apex to 185.199.108.153 / .109.153 / .110.153 / .111.153 and a CNAME
`www` → `mariaiontseva.github.io`. Enforce HTTPS in Settings → Pages once the certificate is issued.

## Enquiry form

The form validates on the client (name required, email must contain "@") and then:

- **with `data-endpoint`** set on `<form id="enquiry">` (Formspree, Basin, a serverless function…) it POSTs
  the fields as `FormData` with `Accept: application/json` and shows "Thank you. We reply within one working
  day." on a 2xx response, or an error line with the email address on failure;
- **without `data-endpoint`** it opens the visitor's mail client with a prefilled message to the address in
  `data-mailto` and shows the same thank-you line. `data-mailto` is `info@axiomestatemanagement.co.uk`; that mailbox must exist (email hosting is
  separate from the domain) or enquiries will bounce.

A hidden `_gotcha` field is a honeypot for bots.

## Before going live

- Replace the placeholders that render in amber: `[Town]`, `[Company number · registered office]`.
- The contact block has no name or portrait for now; add them back (the design has a square photo and
  a serif name line) once Chris confirms.
- Hero photo: "A brick building with windows and a street light" by Alessio Patron on Unsplash
  (https://unsplash.com/photos/sOfb5xIkchY, Unsplash licence, credit appreciated). Stored in `img/` in two
  sizes (JPEG + WebP) with a light warm grade applied in CSS; `img/og.jpg` is the social-preview crop.
- Set the form endpoint (see above).
- Fonts load from Google Fonts (Newsreader 400/500, IBM Plex Sans 400/500/600). Self-host them for production
  if the client prefers no third-party requests.
- Logo SVGs use live text and need the fonts installed to render exactly; convert to outlines for print or
  LinkedIn assets.

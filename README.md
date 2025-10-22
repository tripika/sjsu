# sjsu.info – Mock Site

A simple static mockup for the sjsu.info domain to showcase:

- Homepage with sections: Students at SJSU, Parking, Housing near campus, International Students
- Student marketplace (Craigslist-like) for buying/selling items
- Events around SJSU

## Structure

- `public/index.html` – Homepage with key info sections
- `public/marketplace.html` – Student marketplace UI (mock data)
- `public/events.html` – Events listing (mock data)
- `public/assets/styles.css` – Shared styles
- `public/assets/script.js` – Shared JS and page-specific logic
- `public/assets/mock/*.json` – Mock listings and events

## Run

This is a static site. You can open `public/index.html` directly in a browser, or serve the folder locally for better routing.

Option A: Open the file directly

1. Open `public/index.html` in your browser.

Option B: Start a quick local server

- Python 3: `cd public && python3 -m http.server 8080`
- Node (if you have npx): `cd public && npx serve .`

Then visit `http://localhost:8080` (or the URL from your server output).

## Notes

- All data is mock/demo and stored as JSON under `public/assets/mock`.
- Forms are non-functional; intended for layout/demo only.

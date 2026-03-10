---
description: How to update app files (app.js, data.js, styles.css, index.html) while keeping the PWA cache in sync
---

# Updating App Files

When modifying any cached app files (`app.js`, `data.js`, `styles.css`, `index.html`), **you must bump the service worker cache version** in `sw.js` so that users get the latest files.

1. Make your changes to the app files as needed.
2. Open `sw.js` and increment the `CACHE_NAME` version string at the top of the file:
   - e.g. `'set-tracker-v1'` → `'set-tracker-v2'`
3. If you added any **new files** that should be available offline, add them to the `ASSETS` array in `sw.js`.

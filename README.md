# Abu Otuto Digital Hymnal — Integration Package

Standalone package for church websites, mobile apps, and WebViews. This repository is independent of The Bible Worker site; a church developer can copy it into another app without access to the owner’s GitHub account.

## Version 2 — latest updates

- 294 searchable hymns and 356 original scanned pages, preserving Igbo lyrics and solfa notation
- Home-screen **Find a hymn** field above the hymn categories
- Enter `4` or `Hymn 4`, then press Enter, to open that hymn directly
- Selected hymns open in a closeable pop-up reader
- Search by hymn number, Igbo/English title, or first line
- Categories, alphabetical browsing, favorites, original-scan reader, and offline PWA support
- Configurable **← Church app home** link, defaulting to `/`

## Install in a church app

1. Download this repository as a ZIP, or clone it.
2. Copy the **entire** folder into the church app’s web assets or web route.
3. Keep `pages/` beside `index.html`; it contains every original scan.
4. Serve it at a route such as `/abu-otuto/`, or load `index.html` in a WebView.
5. If the church’s home screen is not `/`, edit `host-home-link.js` and change `link.href`.

The package is static HTML, CSS, JavaScript, and image files—no server database or user account is required.

## Test checklist

- Enter `Hymn 4` in the search field and press Enter.
- Confirm the hymn opens in a pop-up reader and that **Close** returns to the home screen.
- Confirm `pages/1.jpg` and `pages/356.jpg` load.
- Confirm **← Church app home** reaches the desired church-app route.
- For web deployments, test offline access after the first successful load.

## Distribution note

The package owner has confirmed permission to reproduce and distribute this hymnal. The scanned pages remain the source of truth; draft Igbo search text should be verified against the scans.

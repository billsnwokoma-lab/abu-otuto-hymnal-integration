# Abu Otuto Digital Hymnal

Standalone integration package for church websites, mobile apps, and WebViews.

## Use

Copy this entire folder into the target app. Keep `pages/` beside `index.html`;
it contains the 356 original scanned pages used by the reader.

Serve the folder at a route such as `/abu-otuto/`, or load `index.html` in a
WebView. The module uses only static HTML, CSS, JavaScript, and image files.

`host-home-link.js` provides the `← Church app home` button. Its default route
is `/`; change that value if the host app's home page uses a different route.

## Included

- 294 searchable hymns
- 356 source scans, retaining the original Igbo lyrics and solfa notation
- Search, categories, alphabetical index, favorites, reader controls, and PWA support
- Offline service-worker support for web deployments

## Verification

1. Open `index.html` through the target web host or WebView.
2. Search for hymn `32`.
3. Confirm pages `1.jpg` and `356.jpg` load from `pages/`.
4. Confirm `← Church app home` goes to the desired host-app route.

## Distribution note

The package owner has confirmed permission to reproduce and distribute this
hymnal integration. The scanned pages remain the source of truth; draft Igbo
search text should be verified against the scans.

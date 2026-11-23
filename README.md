# Abu Otuto Digital Hymnal — Member Sharing App

A self-contained Progressive Web App (PWA) for sharing the Abu Otuto Igbo SDA Hymnal with members.

This member edition has no link back to the Bible Worker website or a church-app home page. It opens and runs as its own digital hymnbook.

## Included

- 294 hymn entries and the original 356 scanned hymnbook pages
- Original Igbo lyrics and solfa notation preserved in the page images
- Search by hymn number, English title, Igbo title, or first line
- Type `4` or `Hymn 4`, then press Enter, to open the hymn
- Hymn categories and alphabetical browsing
- A pop-up hymn reader for selected hymns
- Favourites saved on the member's device
- Installable/offline PWA support

## Share with members

Download the ZIP from the **member-sharing** branch and give it to the person who will host it. They can upload the folder contents to any standard web host or serve it from the church website.

No GitHub account access is required to use this package.

## Hosting

The package is static: it has no database or server setup requirement. Keep all files and folders together, particularly `pages/`, `assets/`, `songbook-data.js`, `app.js`, and `sw.js`.

For best PWA and offline behavior, host it through HTTPS.

## Basic checks

1. Open the app.
2. Search for `4` and press Enter.
3. Confirm the hymn appears in the pop-up reader.
4. Use **Close** to return to the hymn list.
5. Use **Install app** from a supported browser if desired.

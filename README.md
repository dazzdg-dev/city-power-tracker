# City Power Tracker — PWA package

This package contains the complete tracker website and its installability/offline assets. It is an Android-friendly **Progressive Web App (PWA)** installed from a supported browser; it is not a native APK. The app stores records locally and can sync them across devices through a signed-in Firebase account.

## Upload to the existing GitHub repository from a phone

1. Download and extract this ZIP on your phone (for example, in Samsung My Files).
2. Open your **existing** City Power Tracker repository on GitHub in your browser and sign in.
3. Open the repository root. Choose **Add file → Upload files**.
4. Select `index.html`, `manifest.webmanifest`, `sw.js`, and `README.md` from the extracted package. If the current app lives in a subfolder, upload these files into that same published folder instead of the repository root.
5. Upload the complete `icons` folder, including both `icon-192.png` and `icon-512.png`. If mobile GitHub does not let you select a folder, create `icons` in the repository first, open it, then upload both PNG files there.
6. GitHub will show that `index.html`, `manifest.webmanifest`, and `sw.js` already exist. **Replace the existing files** by committing the uploaded versions. Keep the existing repository; do not create a new repository or delete it.
7. Commit the changes. Wait for GitHub Pages to publish, then open the same website in Chrome on Android and use Chrome's menu → **Install app** or **Add to Home screen** if offered.

The manifest and service worker use relative paths (`./`) so they work when the app is published from either a user/organization site root or a project repository subpath. The service worker caches the app shell and icons, then removes older tracker caches during activation.

## Features

- Record date, amount paid, units (kWh), VAT, and an optional note.
- Local browser storage so records remain after closing and reopening the app on that device.
- Statistics with date range filtering: spending, units, average cost per kWh, VAT, and purchase count.
- Purchase history with deletion.
- CSV export and import. Import skips duplicate rows.
- Offline app shell after the first successful load.
- Optional Google sign-in and live, per-account Firestore sync across devices.

**Back up before changing devices or clearing browser storage.** Existing data stored in the old site's browser remains local to that browser; export it there before switching sites or devices, then import the CSV into the updated tracker.

## Firebase sync setup

The Firebase project `city-power-tracker-sync` and web app **City Power Tracker Web** are set up. Google sign-in is enabled, `dazzdg-dev.github.io` is authorized, and Firestore is in Johannesburg (`africa-south1`) with production rules that let each signed-in account access only its own `/users/{uid}/purchases` records. The rules are also included in `firestore.rules` for reference. The Firebase web config is public app configuration; it does not grant database access on its own.

1. Upload `index.html`, `firebase-sync.js`, and `sw.js` to the root of the existing GitHub repository. Keep the existing repository, `manifest.webmanifest`, and `icons` folder.
2. Commit the changes and wait for GitHub Pages to publish.
3. Open the tracker on the laptop, choose **Connect with Google to sync**, and sign in with the same Google account used on the phone. The first connection merges that device's saved purchases into its private cloud records.
4. Open the tracker on the phone, connect with that same Google account, and approve Google sign-in. New purchases, edits, and deletions then sync live between connected devices.

The tracker keeps its local copy as a fallback and retains CSV backup/import. The Firebase SDK is loaded from Google's official CDN and uses redirect sign-in on mobile. Firebase is on its no-cost Spark plan; small personal use fits its quotas, but review Firebase usage if the app is shared widely.

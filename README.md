# City Power Tracker — update and sync package

This package updates your existing City Power Tracker GitHub repository. It keeps the full purchase tracker and offers private, live sync through Google sign-in and Firebase. It installs from Chrome as a web app (PWA); it is not an Android APK.

## Upload from your phone

1. Open the existing repository: https://github.com/dazzdg-dev/city-power-tracker and sign in to GitHub.
2. Open the ZIP in your phone's Files/Downloads app and extract it.
3. On the repository page, choose **Add file → Upload files**. If the GitHub app does not show this option, open the repository in Chrome and choose **Desktop site** from Chrome's menu.
4. Select these eight files from the extracted folder: `index.html`, `manifest.webmanifest`, `sw.js`, `firebase-sync.js`, `firestore.rules`, `icon-192.png`, `icon-512.png`, and `README.md`.
5. Upload them to the repository's top level (same place as the existing `index.html`). When GitHub asks, replace the files with the same names. Keep the existing repository; do not make a new one. The two icon PNGs must stay at the top level.
6. Enter a commit message such as `Update tracker with live sync`, then choose **Commit changes**.
7. In the repository, open **Settings → Pages** and confirm Pages is publishing the `main` branch. Wait for the deployment to finish under **Actions**.

## Publish the Firestore rules

After the repository update, open Firebase Console → `city-power-tracker-sync` → **Firestore Database → Rules**. Replace the rules there with the contents of the included `firestore.rules`, then choose **Publish**. These rules let each signed-in Google account access only its own tracker records and accept the tracker's purchase fields.

## Turn on live sync

1. Open the published tracker on the laptop. Refresh it after the GitHub Pages deployment completes.
2. Choose **Connect with Google** and sign in. Your saved laptop history is kept and merged into that account's tracker records.
3. Open the same published tracker on the phone and connect using the same Google account. Purchases, edits, and deletions then sync between connected devices.

Connecting uploads the purchase details, including an optional prepaid credit token, to the signed-in account's private Firebase records. The app also keeps a local copy. Use the built-in CSV export for an additional backup.

## Included files and features

- Full tracker: purchase capture, local persistence, statistics, filters, searchable/sortable history, editing and deletion, CSV import/export.
- Firebase Google sign-in and live, account-private Firestore sync.
- Install manifest, root-level 192 × 192 and 512 × 512 maskable icons, and versioned offline app-shell service worker.
- Firestore security rules for the full purchase record shape.

If Chrome still shows the previous version after deployment, close the installed app, open the site in Chrome, refresh it, then use Chrome's **Install app** or **Add to Home screen** option. This installs the website as a PWA.

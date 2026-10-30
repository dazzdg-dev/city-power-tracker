CITY POWER ELECTRICITY TRACKER — ANDROID PWA

WHAT'S INCLUDED
- index.html: the tracker app
- manifest.webmanifest: installable app metadata
- sw.js: offline cache support
- This app stores records in the browser's localStorage on the device.

FEATURES
- Capture purchase date/time, provider, payment method, amount, VAT, kWh, meter number, reference, optional credit token and notes.
- Edit/delete records.
- Statistics by all time, this month, this year, and optional date range.
- Total spend, units, average R/kWh, VAT recorded, monthly spending trends.
- Search/sort history.
- CSV export/import backup.

IMPORTANT
- Records are stored only on this device/browser. They do not automatically sync to another phone.
- Export a CSV backup regularly. CSV contains the optional token field; keep backups private.
- The sample receipt's purchase date is not visible, so sample values are loaded with today's date and should be corrected.
- kWh purchased is not the same as measured household electricity consumption.
- This is an independent personal tracker, not an official City Power or FNB app.

HOW TO USE ON ANDROID
1. Upload the contents of this folder to a free HTTPS static host, such as GitHub Pages.
2. Open the hosted index.html link in Chrome on your Android phone.
3. In Chrome, open the three-dot menu and choose "Install app" or "Add to Home screen" (wording varies).
4. Open it from the home screen. Add purchases as you buy electricity.
5. In History, choose Export CSV backup periodically.

LOCAL TEST
You can open index.html in a browser to test the basic tracker, but installation/offline support requires hosting over HTTPS (or localhost).

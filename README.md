# Premamma website

Website for Premamma and her autobiography **నాయిన ఇచ్చిన ఉంగరం (Naayina Ichina Ungaram)**.

## Pages
| File | Page |
|---|---|
| index.html | Home |
| story.html | Her Story (English / Telugu) |
| book.html | The Book |
| release.html | Book Release, 6 December 2026 |
| gallery.html | Gallery |
| reviews.html | Reviews — read and write |
| contact.html | Contact form |
| privacy.html | Privacy note |
| admin.html | Private page to publish reviews and read messages |

## How reviews work
1. A visitor writes a review on `reviews.html`.
2. `api/reviews.js` saves it as **waiting**, together with the visitor's **IP address**, approximate location and browser, in a private Vercel Blob store.
3. The family opens `/admin.html`, enters the admin key, reads it and presses **Publish**.
4. Published reviews appear on the Reviews page and the Home page. IP addresses and emails are never shown publicly.
5. **Download CSV** on the admin page exports all reviews and messages with their IP addresses.

Contact messages (`api/messages.js`) are stored the same way and shown under **Messages** on the admin page.

## Hosting on Vercel
1. Create a Vercel project and upload this folder (or connect a Git repository containing it).
2. In the project, go to **Storage → Create → Blob**, choose **Private** access, and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN` automatically.
3. In **Settings → Environment Variables** add `ADMIN_KEY` = a long secret phrase (at least 8 characters). This is the password for `/admin.html`.
4. Redeploy. Done.

## Editing text
Pages are plain HTML. The text for all pages also lives in `build/pages.py`; run `python3 build/build.py .` to regenerate them after editing.

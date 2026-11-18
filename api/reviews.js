// GET  /api/reviews  -> approved reviews (public fields only)
// POST /api/reviews  -> new review, stored as pending with the visitor's IP
import { json, visitorInfo, clean, newId, saveJson, listJson, readBody } from './_lib.js';

export async function GET() {
  try {
    const items = await listJson('reviews/approved/');
    const reviews = items.map((r) => ({
      id: r.id, name: r.name, city: r.city, rating: r.rating, review: r.review, createdAt: r.createdAt,
    }));
    return json({ reviews }, 200, { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' });
  } catch (e) {
    console.error('GET /api/reviews', e);
    return json({ error: 'Could not load reviews.' }, 500);
  }
}

export async function POST(request) {
  let body;
  try { body = await readBody(request); } catch { return json({ error: 'Invalid request.' }, 400); }

  // Honeypot: bots fill hidden fields. Pretend success.
  if (body.website) return json({ ok: true });

  const name = clean(body.name, 80);
  const city = clean(body.city, 60);
  const email = clean(body.email, 120);
  const review = clean(body.review, 3000);
  const rating = parseInt(body.rating, 10);

  if (!name) return json({ error: 'Please enter your name.' }, 400);
  if (!(rating >= 1 && rating <= 5)) return json({ error: 'Please choose a star rating.' }, 400);
  if (review.length < 10) return json({ error: 'Please write a few more words in your review.' }, 400);
  if (body.consent !== 'yes') return json({ error: 'Please tick the consent box.' }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Please check your email address.' }, 400);

  const id = newId();
  const record = {
    id, name, city, email, rating, review,
    status: 'pending',
    createdAt: new Date().toISOString(),
    visitor: visitorInfo(request),
  };

  try {
    await saveJson(`reviews/pending/${id}.json`, record);
    return json({ ok: true });
  } catch (e) {
    console.error('POST /api/reviews', e);
    return json({ error: 'Your review could not be saved. Please try again.' }, 500);
  }
}

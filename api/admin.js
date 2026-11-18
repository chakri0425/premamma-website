// Admin API — requires header x-admin-key matching the ADMIN_KEY environment variable.
// GET  /api/admin                       -> pending + approved reviews and messages (with IPs)
// POST /api/admin {action, id}          -> approve | unpublish | delete-review | delete-message
import { json, isAdmin, listJson, readJson, saveJson, remove, readBody } from './_lib.js';

const safeId = (id) => /^[0-9]+-[0-9a-f]{8}$/.test(String(id || ''));

export async function GET(request) {
  if (!isAdmin(request)) return json({ error: 'Wrong admin key.' }, 401);
  const [pending, approved, messages] = await Promise.all([
    listJson('reviews/pending/'), listJson('reviews/approved/'), listJson('messages/'),
  ]);
  return json({ pending, approved, messages }, 200, { 'Cache-Control': 'no-store' });
}

export async function POST(request) {
  if (!isAdmin(request)) return json({ error: 'Wrong admin key.' }, 401);
  let body;
  try { body = await readBody(request); } catch { return json({ error: 'Invalid request.' }, 400); }
  const { action, id } = body;
  if (!safeId(id)) return json({ error: 'Bad id.' }, 400);

  try {
    if (action === 'approve') {
      const r = await readJson(`reviews/pending/${id}.json`);
      if (!r) return json({ error: 'Review not found.' }, 404);
      await saveJson(`reviews/approved/${id}.json`, { ...r, status: 'approved', approvedAt: new Date().toISOString() });
      await remove(`reviews/pending/${id}.json`);
    } else if (action === 'unpublish') {
      const r = await readJson(`reviews/approved/${id}.json`);
      if (!r) return json({ error: 'Review not found.' }, 404);
      await saveJson(`reviews/pending/${id}.json`, { ...r, status: 'pending' });
      await remove(`reviews/approved/${id}.json`);
    } else if (action === 'delete-review') {
      await Promise.allSettled([remove(`reviews/pending/${id}.json`), remove(`reviews/approved/${id}.json`)]);
    } else if (action === 'delete-message') {
      await remove(`messages/${id}.json`);
    } else {
      return json({ error: 'Unknown action.' }, 400);
    }
    return json({ ok: true });
  } catch (e) {
    console.error('POST /api/admin', e);
    return json({ error: 'Action failed.' }, 500);
  }
}

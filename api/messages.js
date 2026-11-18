// POST /api/messages -> stores a contact message with the visitor's IP
import { json, visitorInfo, clean, newId, saveJson, readBody } from './_lib.js';

const SUBJECTS = ['message', 'copies', 'event', 'media', 'other'];

export async function POST(request) {
  let body;
  try { body = await readBody(request); } catch { return json({ error: 'Invalid request.' }, 400); }
  if (body.website) return json({ ok: true });

  const name = clean(body.name, 80);
  const contact = clean(body.contact, 120);
  const message = clean(body.message, 5000);
  const subject = SUBJECTS.includes(body.subject) ? body.subject : 'other';

  if (!name) return json({ error: 'Please enter your name.' }, 400);
  if (!contact) return json({ error: 'Please give an email or phone number so the family can reply.' }, 400);
  if (message.length < 5) return json({ error: 'Please write your message.' }, 400);
  if (body.consent !== 'yes') return json({ error: 'Please tick the consent box.' }, 400);

  const id = newId();
  try {
    await saveJson(`messages/${id}.json`, {
      id, name, contact, subject, message,
      createdAt: new Date().toISOString(),
      visitor: visitorInfo(request),
    });
    return json({ ok: true });
  } catch (e) {
    console.error('POST /api/messages', e);
    return json({ error: 'Your message could not be sent. Please try again.' }, 500);
  }
}

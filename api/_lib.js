// Shared helpers for the Premamma website API (Vercel Functions + private Vercel Blob).
import { put, list, get, del } from '@vercel/blob';
import { randomUUID, timingSafeEqual } from 'node:crypto';

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });

// Visitor IP as seen by Vercel's edge.
export function visitorInfo(request) {
  const h = request.headers;
  const first = (v) => (v || '').split(',')[0].trim();
  const ip = first(h.get('x-vercel-forwarded-for')) || first(h.get('x-forwarded-for')) || h.get('x-real-ip') || 'unknown';
  const dec = (v) => { try { return v ? decodeURIComponent(v) : ''; } catch { return v || ''; } };
  return {
    ip,
    country: h.get('x-vercel-ip-country') || '',
    region: h.get('x-vercel-ip-country-region') || '',
    city: dec(h.get('x-vercel-ip-city')),
    userAgent: (h.get('user-agent') || '').slice(0, 300),
  };
}

export const clean = (v, max) => String(v ?? '').replace(/\u0000/g, '').trim().slice(0, max);

export const newId = () => `${Date.now()}-${randomUUID().slice(0, 8)}`;

export async function saveJson(pathname, data) {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function readJson(pathname) {
  const res = await get(pathname, { access: 'private', useCache: false });
  if (!res || res.statusCode !== 200 || !res.stream) return null;
  return await new Response(res.stream).json();
}

export async function listJson(prefix) {
  const out = [];
  let cursor;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    for (const b of page.blobs) {
      const data = await readJson(b.pathname);
      if (data) out.push({ ...data, _path: b.pathname });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export async function remove(pathname) {
  await del(pathname);
}

export function isAdmin(request) {
  const expected = process.env.ADMIN_KEY || '';
  const given = request.headers.get('x-admin-key') || '';
  if (!expected || expected.length < 8) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function readBody(request) {
  const text = await request.text();
  if (text.length > 20000) throw new Error('Too long');
  return JSON.parse(text || '{}');
}

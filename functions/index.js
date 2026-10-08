import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { validateRegistration } from './validate.js';

initializeApp();

const products = JSON.parse(readFileSync(new URL('./products.json', import.meta.url), 'utf8'));

// Reached from the site as POST /api/register (see the rewrite in firebase.json).
// The form posts JSON; without JavaScript the browser posts it url-encoded and
// gets redirected instead of a JSON reply.
export const registerWarranty = onRequest(
  { region: 'us-central1', maxInstances: 5, memory: '256MiB' },
  async (req, res) => {
    const wantsJson = req.is('application/json');
    const reply = (status, body, redirect) =>
      wantsJson ? res.status(status).json(body) : res.redirect(303, redirect);

    if (req.method !== 'POST') {
      res.set('Allow', 'POST').status(405).json({ error: 'method_not_allowed' });
      return;
    }

    const body = req.body && typeof req.body === 'object' ? req.body : {};

    // Honeypot field: people never see it, bots fill it in. Pretend it worked.
    if (body.website) {
      reply(200, { ok: true }, '/registered');
      return;
    }

    const result = validateRegistration(body, products);
    if (!result.ok) {
      reply(400, { errors: result.errors }, '/register?error=1');
      return;
    }
    const registration = result.value;

    // One document per person, product and purchase date, so a double tap or a
    // resubmit doesn't duplicate the record.
    const id = createHash('sha256')
      .update(`${registration.email}|${registration.productCode}|${registration.purchaseDate}`)
      .digest('hex')
      .slice(0, 32);

    try {
      await getFirestore()
        .collection('warrantyRegistrations')
        .doc(id)
        .create({ ...registration, createdAt: FieldValue.serverTimestamp() });
    } catch (error) {
      // 6 is ALREADY_EXISTS: the same registration was submitted before.
      if (error.code !== 6) {
        logger.error('Could not save registration', error);
        reply(500, { error: 'not_saved' }, '/register?error=1');
        return;
      }
    }

    reply(200, { ok: true }, '/registered');
  },
);

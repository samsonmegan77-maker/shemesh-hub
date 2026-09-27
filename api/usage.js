/**
 * POST /api/usage
 * Logs usage events to Vercel function logs (visible in dashboard).
 * Optionally forwards to USAGE_WEBHOOK_URL (Discord/Slack/ntfy).
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  if (!body || typeof body !== 'object') body = {};

  const event = {
    at: body.at || new Date().toISOString(),
    type: body.type || 'unknown',
    userId: body.userId || null,
    userName: body.userName || null,
    org: body.org || null,
    page: body.page || null,
    detail: body.detail || null,
    sessionId: body.sessionId || null,
    ua: body.ua || null,
  };

  console.log('[SHEMESH-USAGE]', JSON.stringify(event));

  const webhook = process.env.USAGE_WEBHOOK_URL;
  if (webhook) {
    try {
      const text = [
        `**SheMesh usage**`,
        `• ${event.type}`,
        event.userName ? `• User: ${event.userName}` : null,
        event.org ? `• Org: ${event.org}` : null,
        event.page ? `• Page: ${event.page}` : null,
        event.detail ? `• ${event.detail}` : null,
        `• ${event.at}`,
        event.sessionId ? `• Session: ${event.sessionId.slice(0, 8)}` : null,
      ].filter(Boolean).join('\n');

      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.slice(0, 1900) }),
      });
    } catch (e) {
      console.warn('[SHEMESH-USAGE] webhook failed', e && e.message);
    }
  }

  return res.status(204).end();
};

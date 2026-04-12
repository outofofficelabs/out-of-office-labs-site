// Cloudflare Pages Function: Stripe Webhook Handler
// Receives checkout.session.completed events and sends delivery emails
// Endpoint: /api/stripe-webhook
//
// Required env vars:
//   STRIPE_SECRET_KEY — Stripe secret key
//   STRIPE_WEBHOOK_SECRET — Webhook signing secret
//   RESEND_API_KEY — Resend API key for sending emails

// ─── Kit delivery mapping ───────────────────────────────────────
// AROS Pricing Ladder (Set B — source of truth):
// Single Kit ($97) | Pro Kit ($297) | Campus License ($497) | District License ($1,697)
// Implementation Call ($200) — ELIMINATED

const ALL_DRIVE_LINKS = [
  { name: 'Greek Alumni Kit', url: 'https://drive.google.com/file/d/1uDQplAOwnTqn-8YJSKD10OgjTqTk7dTk/view' },
  { name: 'K-12 Kit', url: 'https://drive.google.com/file/d/1_F8HTIsKGs8Y21pONoaST23skTysAazJ/view' },
  { name: 'School District Kit', url: 'https://drive.google.com/file/d/1LMuzusakcvLTv-e7U2d4yXdfZWEKUXVK/view' },
  { name: 'College Access Kit', url: 'https://drive.google.com/file/d/12nUQWvF5Zd2moamw0ovV-fOfhDB5AQ1v/view' },
  { name: 'Higher Ed Alumni Kit', url: 'https://drive.google.com/file/d/1c9hIwo0d3Zrd5PsKjfT0-jsgAXPkKEal/view' },
];

const KIT_DATA = {
  // ── Set B: AROS tiered products (current) ──
  'prod_UFfUTsHHl4G7px': {
    name: 'Out of Office Labs Single Kit',
    type: 'single',
    pdfUrl: 'https://drive.google.com/file/d/1_F8HTIsKGs8Y21pONoaST23skTysAazJ/view',
    driveUrl: 'https://drive.google.com/file/d/1_F8HTIsKGs8Y21pONoaST23skTysAazJ/view'
  },
  'prod_UFkzMNs3aGW3Qd': {
    name: 'Out of Office Labs Pro Kit',
    type: 'pro',
    // Pro Kit buyer selects their program — delivery handled via reply
  },
  'prod_UFkzSh6U8LtrgY': {
    name: 'Campus License — All 5 Kits',
    type: 'bundle',
    driveLinks: ALL_DRIVE_LINKS
  },
  'prod_UFkzBFVGvxiiUx': {
    name: 'District License — Multi-School Deployment',
    type: 'bundle',
    driveLinks: ALL_DRIVE_LINKS
  },
  // ── Set A: Per-audience kits (legacy, still honored) ──
  'prod_UJhLqLV7CMTCtR': {
    name: 'K-12 Mentorship Operations Kit',
    type: 'single',
    pdfUrl: 'https://drive.google.com/file/d/1_F8HTIsKGs8Y21pONoaST23skTysAazJ/view',
    driveUrl: 'https://drive.google.com/file/d/1_F8HTIsKGs8Y21pONoaST23skTysAazJ/view'
  },
  'prod_UJhLdAYVvuoiyp': {
    name: 'Greek Life Mentorship Operations Kit',
    type: 'single',
    pdfUrl: 'https://drive.google.com/file/d/1uDQplAOwnTqn-8YJSKD10OgjTqTk7dTk/view',
    driveUrl: 'https://drive.google.com/file/d/1uDQplAOwnTqn-8YJSKD10OgjTqTk7dTk/view'
  },
  'prod_UJhLY2ReCdFi2e': {
    name: 'Higher Ed Mentorship Operations Kit',
    type: 'single',
    pdfUrl: 'https://drive.google.com/file/d/1c9hIwo0d3Zrd5PsKjfT0-jsgAXPkKEal/view',
    driveUrl: 'https://drive.google.com/file/d/1c9hIwo0d3Zrd5PsKjfT0-jsgAXPkKEal/view'
  },
  'prod_UJhLDfQiI9DDCv': {
    name: 'College Access Mentorship Operations Kit',
    type: 'single',
    pdfUrl: 'https://drive.google.com/file/d/12nUQWvF5Zd2moamw0ovV-fOfhDB5AQ1v/view',
    driveUrl: 'https://drive.google.com/file/d/12nUQWvF5Zd2moamw0ovV-fOfhDB5AQ1v/view'
  },
  'prod_UJhLSBHdHpIfdp': {
    name: 'School District Mentorship Operations Kit',
    type: 'single',
    pdfUrl: 'https://drive.google.com/file/d/1LMuzusakcvLTv-e7U2d4yXdfZWEKUXVK/view',
    driveUrl: 'https://drive.google.com/file/d/1LMuzusakcvLTv-e7U2d4yXdfZWEKUXVK/view'
  },
  // ── Individual kits by product ID ──
  'prod_UFfUBMfd9Dcyyc': {
    name: 'Greek Alumni Mentorship & Fundraising Kit',
    type: 'single',
    pdfUrl: 'https://drive.google.com/file/d/1uDQplAOwnTqn-8YJSKD10OgjTqTk7dTk/view',
    driveUrl: 'https://drive.google.com/file/d/1uDQplAOwnTqn-8YJSKD10OgjTqTk7dTk/view'
  },
  'prod_UFfULHbnzFtXvW': {
    name: 'School District Mentorship Scale Kit',
    type: 'single',
    pdfUrl: 'https://drive.google.com/file/d/1LMuzusakcvLTv-e7U2d4yXdfZWEKUXVK/view',
    driveUrl: 'https://drive.google.com/file/d/1LMuzusakcvLTv-e7U2d4yXdfZWEKUXVK/view'
  },
  'prod_UFfUnjaf2d4bEs': {
    name: 'College Access Team Mentorship Kit',
    type: 'single',
    pdfUrl: 'https://drive.google.com/file/d/12nUQWvF5Zd2moamw0ovV-fOfhDB5AQ1v/view',
    driveUrl: 'https://drive.google.com/file/d/12nUQWvF5Zd2moamw0ovV-fOfhDB5AQ1v/view'
  },
  'prod_UFfUqwJPX6NPoQ': {
    name: 'Higher Ed Alumni Mentoring Kit',
    type: 'single',
    pdfUrl: 'https://drive.google.com/file/d/1c9hIwo0d3Zrd5PsKjfT0-jsgAXPkKEal/view',
    driveUrl: 'https://drive.google.com/file/d/1c9hIwo0d3Zrd5PsKjfT0-jsgAXPkKEal/view'
  }
};

// ─── Stripe webhook signature verification (Web Crypto API) ─────
async function verifyStripeSignature(payload, signature, secret) {
  const elements = signature.split(',');
  let timestamp = null;
  let sig = null;

  for (const element of elements) {
    const [key, value] = element.split('=');
    if (key === 't') timestamp = value;
    if (key === 'v1') sig = value;
  }

  if (!timestamp || !sig) return false;

  // Reject events older than 5 minutes
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (age > 300) return false;

  const signedPayload = timestamp + '.' + payload;

  // Use Web Crypto API (Cloudflare Workers compatible)
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison
  if (sig.length !== expectedSig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < sig.length; i++) {
    mismatch |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  return mismatch === 0;
}

// ─── Build delivery email HTML (single kit) ─────────────────────
function buildSingleKitEmailHtml(kit) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px; color: #1A1D23; background: #FAFAF8;">
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="display: inline-block; background: #1E3A5F; border-radius: 6px; padding: 8px 16px;">
      <span style="color: #D4880E; font-weight: 700; font-size: 14px;">Out of Office Labs</span>
    </div>
  </div>

  <h1 style="font-size: 24px; font-weight: 700; color: #1A1D23; margin-bottom: 8px;">Your kit is ready.</h1>
  <p style="color: #6B7080; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
    Thank you for purchasing the <strong style="color: #1A1D23;">${kit.name}</strong>. Here are your download links.
  </p>

  <div style="background: #FFFFFF; border: 1px solid #D8D8D2; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #E5E5DF;">
          <a href="${kit.pdfUrl}" style="color: #1E3A5F; text-decoration: none; font-weight: 600; font-size: 15px;">
            📄 Download PDF Overview
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <a href="${kit.driveUrl}" style="color: #1E3A5F; text-decoration: none; font-weight: 600; font-size: 15px;">
            📁 Open Google Drive Folder
          </a>
          <p style="color: #6B7080; font-size: 13px; margin: 4px 0 0;">Copy to your Drive, customize, and launch</p>
        </td>
      </tr>
    </table>
  </div>

  <div style="background: #F5F5F2; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <h2 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">What to do next</h2>
    <ol style="margin: 0; padding-left: 20px; color: #6B7080; font-size: 14px; line-height: 1.8;">
      <li><strong style="color: #1A1D23;">Copy to your Drive</strong> — Use File → Make a copy for each document</li>
      <li><strong style="color: #1A1D23;">Customize</strong> — Add your branding, adjust timelines</li>
      <li><strong style="color: #1A1D23;">Launch your pilot</strong> — Follow the coordinator playbook</li>
    </ol>
  </div>

  <p style="text-align: center; color: #6B7080; font-size: 14px; margin-bottom: 16px;">Need help getting started? Reply to this email — we read everything.</p>

  <hr style="border: none; border-top: 1px solid #E5E5DF; margin: 32px 0;">
  <p style="color: #A0A4AD; font-size: 12px; text-align: center;">
    © 2026 Out of Office Labs · <a href="https://outofofficelabs.com" style="color: #A0A4AD;">outofofficelabs.com</a>
  </p>
</body>
</html>`;
}

// ─── Build delivery email HTML (bundle — Campus/District) ───────
function buildBundleEmailHtml(kit) {
  const linksHtml = kit.driveLinks.map(l =>
    `<tr><td style="padding: 8px 0; border-bottom: 1px solid #E5E5DF;"><a href="${l.url}" style="color: #1E3A5F; text-decoration: none; font-weight: 600; font-size: 15px;">📁 ${l.name}</a></td></tr>`
  ).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px; color: #1A1D23; background: #FAFAF8;">
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="display: inline-block; background: #1E3A5F; border-radius: 6px; padding: 8px 16px;">
      <span style="color: #D4880E; font-weight: 700; font-size: 14px;">Out of Office Labs</span>
    </div>
  </div>

  <h1 style="font-size: 24px; font-weight: 700; color: #1A1D23; margin-bottom: 8px;">Your ${kit.name} is ready.</h1>
  <p style="color: #6B7080; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
    All 5 of your mentorship kits are ready to download.
  </p>

  <div style="background: #FFFFFF; border: 1px solid #D8D8D2; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
      ${linksHtml}
    </table>
  </div>

  <div style="background: #F5F5F2; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <h2 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">What to do next</h2>
    <ol style="margin: 0; padding-left: 20px; color: #6B7080; font-size: 14px; line-height: 1.8;">
      <li><strong style="color: #1A1D23;">Copy to your Drive</strong> — Use File → Make a copy for each document</li>
      <li><strong style="color: #1A1D23;">Customize</strong> — Add your branding, adjust timelines</li>
      <li><strong style="color: #1A1D23;">Launch your pilot</strong> — Follow the coordinator playbook</li>
    </ol>
  </div>

  <p style="text-align: center; color: #6B7080; font-size: 14px; margin-bottom: 16px;">Need help getting started? Reply to this email — we read everything.</p>

  <hr style="border: none; border-top: 1px solid #E5E5DF; margin: 32px 0;">
  <p style="color: #A0A4AD; font-size: 12px; text-align: center;">
    © 2026 Out of Office Labs · <a href="https://outofofficelabs.com" style="color: #A0A4AD;">outofofficelabs.com</a>
  </p>
</body>
</html>`;
}

// ─── Build delivery email HTML (Pro Kit — no downloads yet) ─────
function buildProKitEmailHtml(kit) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px; color: #1A1D23; background: #FAFAF8;">
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="display: inline-block; background: #1E3A5F; border-radius: 6px; padding: 8px 16px;">
      <span style="color: #D4880E; font-weight: 700; font-size: 14px;">Out of Office Labs</span>
    </div>
  </div>

  <h1 style="font-size: 24px; font-weight: 700; color: #1A1D23; margin-bottom: 8px;">Your Pro Kit purchase is confirmed.</h1>
  <p style="color: #6B7080; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
    Thank you for purchasing the <strong style="color: #1A1D23;">Pro Kit</strong>. Your purchase includes a complete mentorship kit, advanced coordinator playbook, multi-cohort tracking, priority support, and quarterly template updates.
  </p>

  <div style="background: #F5F5F2; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
    <h2 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Next Step</h2>
    <p style="color: #6B7080; font-size: 14px; line-height: 1.6; margin: 0;">
      Reply to this email with your preferred program — <strong style="color: #1A1D23;">K-12, College Access, Greek Alumni, Higher Ed, or School Districts</strong> — and we'll send your kit right away.
    </p>
  </div>

  <p style="text-align: center; color: #6B7080; font-size: 14px; margin-bottom: 16px;">Questions? Reply to this email — we read everything.</p>

  <hr style="border: none; border-top: 1px solid #E5E5DF; margin: 32px 0;">
  <p style="color: #A0A4AD; font-size: 12px; text-align: center;">
    © 2026 Out of Office Labs · <a href="https://outofofficelabs.com" style="color: #A0A4AD;">outofofficelabs.com</a>
  </p>
</body>
</html>`;
}

// ─── Main handler ───────────────────────────────────────────────
export async function onRequest(context) {
  const { request, env } = context;

  // Only accept POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await request.text();

  // Verify webhook signature
  const signature = request.headers.get('stripe-signature');
  if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing signature or webhook secret');
    return new Response('Missing signature', { status: 400 });
  }

  const isValid = await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!isValid) {
    console.error('Invalid webhook signature');
    return new Response('Invalid signature', { status: 401 });
  }

  const payload = JSON.parse(body);

  // Only process checkout.session.completed events
  if (payload.type !== 'checkout.session.completed') {
    return new Response(
      JSON.stringify({ received: true, skipped: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const session = payload.data.object;
  const customerEmail = session.customer_details?.email;

  if (!customerEmail) {
    console.error('No customer email in session:', session.id);
    return new Response(
      JSON.stringify({ received: true, no_email: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get the full session with line items to find the product
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${session.id}?expand[]=line_items`,
      {
        headers: {
          'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    const fullSession = await stripeRes.json();

    const lineItem = fullSession.line_items?.data?.[0];
    const productId = lineItem?.price?.product;
    const kit = KIT_DATA[productId];

    if (!kit) {
      console.log('Unknown product or non-kit purchase:', productId);
      return new Response(
        JSON.stringify({ received: true, unknown_product: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build the appropriate email based on product type
    let emailHtml;
    if (kit.type === 'bundle') {
      emailHtml = buildBundleEmailHtml(kit);
    } else if (kit.type === 'pro') {
      emailHtml = buildProKitEmailHtml(kit);
    } else {
      emailHtml = buildSingleKitEmailHtml(kit);
    }

    // Send delivery email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Out of Office Labs <hello@outofofficelabs.com>',
        to: [customerEmail],
        subject: `Your ${kit.name} is Ready — Out of Office Labs`,
        html: emailHtml
      })
    });
    const emailResult = await emailRes.json();

    console.log('Delivery email sent to', customerEmail, 'for', kit.name, '| Result:', JSON.stringify(emailResult));

    return new Response(
      JSON.stringify({ received: true, email_sent: true, kit: kit.name }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Webhook processing failed:', err);
    // Return 200 so Stripe doesn't retry — log the error for investigation
    return new Response(
      JSON.stringify({ received: true, error: err.message }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

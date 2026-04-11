// Netlify Function: Stripe Webhook Handler
// Receives checkout.session.completed events and sends delivery emails
// Endpoint: /.netlify/functions/stripe-webhook
//
// Required env vars:
//   STRIPE_SECRET_KEY — Stripe secret key
//   STRIPE_WEBHOOK_SECRET — Webhook signing secret
//   RESEND_API_KEY — Resend API key for sending emails
//
// Setup in Stripe Dashboard:
//   Webhook endpoint: https://outofofficelabs.com/.netlify/functions/stripe-webhook
//   Events: checkout.session.completed

const https = require('https');
const crypto = require('crypto');

// ─── Kit delivery mapping ───────────────────────────────────────
const KIT_DATA = {
  'prod_UJhLqLV7CMTCtR': {
    name: 'K-12 Mentorship Operations Kit',
    pdfUrl: 'https://drive.google.com/file/d/1_F8HTIsKGs8Y21pONoaST23skTysAazJ/view',
    driveUrl: 'https://drive.google.com/file/d/1_F8HTIsKGs8Y21pONoaST23skTysAazJ/view'
  },
  'prod_UJhLdAYVvuoiyp': {
    name: 'Greek Life Mentorship Operations Kit',
    pdfUrl: 'https://drive.google.com/file/d/1uDQplAOwnTqn-8YJSKD10OgjTqTk7dTk/view',
    driveUrl: 'https://drive.google.com/file/d/1uDQplAOwnTqn-8YJSKD10OgjTqTk7dTk/view'
  },
  'prod_UJhLY2ReCdFi2e': {
    name: 'Higher Ed Mentorship Operations Kit',
    pdfUrl: 'https://drive.google.com/file/d/1c9hIwo0d3Zrd5PsKjfT0-jsgAXPkKEal/view',
    driveUrl: 'https://drive.google.com/file/d/1c9hIwo0d3Zrd5PsKjfT0-jsgAXPkKEal/view'
  },
  'prod_UJhLDfQiI9DDCv': {
    name: 'College Access Mentorship Operations Kit',
    pdfUrl: 'https://drive.google.com/file/d/12nUQWvF5Zd2moamw0ovV-fOfhDB5AQ1v/view',
    driveUrl: 'https://drive.google.com/file/d/12nUQWvF5Zd2moamw0ovV-fOfhDB5AQ1v/view'
  },
  'prod_UJhLSBHdHpIfdp': {
    name: 'School District Mentorship Operations Kit',
    pdfUrl: 'https://drive.google.com/file/d/1LMuzusakcvLTv-e7U2d4yXdfZWEKUXVK/view',
    driveUrl: 'https://drive.google.com/file/d/1LMuzusakcvLTv-e7U2d4yXdfZWEKUXVK/view'
  }
};

// ─── Stripe webhook signature verification ──────────────────────
function verifyStripeSignature(payload, signature, secret) {
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
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
}

// ─── Stripe API helper ──────────────────────────────────────────
function stripeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.stripe.com',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// ─── Resend email helper ────────────────────────────────────────
function sendEmail(to, subject, html) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      from: 'Out of Office Labs <hello@outofofficelabs.com>',
      to: [to],
      subject: subject,
      html: html
    });

    const options = {
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ─── Build delivery email HTML ──────────────────────────────────
function buildEmailHtml(kit) {
  return `
<!DOCTYPE html>
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

  <p style="text-align: center; color: #6B7080; font-size: 14px; margin-bottom: 16px;">Need help getting started?</p>
  <p style="text-align: center;">
    <a href="https://buy.stripe.com/6oUbJ39Sp9VN21v1xH6Zy0p" style="display: inline-block; background: #1E3A5F; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
      Book an Implementation Call — $200
    </a>
  </p>

  <hr style="border: none; border-top: 1px solid #E5E5DF; margin: 32px 0;">
  <p style="color: #A0A4AD; font-size: 12px; text-align: center;">
    © 2026 Out of Office Labs · <a href="https://outofofficelabs.com" style="color: #A0A4AD;">outofofficelabs.com</a>
  </p>
</body>
</html>`;
}

// ─── Main handler ───────────────────────────────────────────────
exports.handler = async function(event) {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Verify webhook signature
  const signature = event.headers['stripe-signature'];
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing signature or webhook secret');
    return { statusCode: 400, body: 'Missing signature' };
  }

  if (!verifyStripeSignature(event.body, signature, process.env.STRIPE_WEBHOOK_SECRET)) {
    console.error('Invalid webhook signature');
    return { statusCode: 401, body: 'Invalid signature' };
  }

  const payload = JSON.parse(event.body);

  // Only process checkout.session.completed events
  if (payload.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: JSON.stringify({ received: true, skipped: true }) };
  }

  const session = payload.data.object;
  const customerEmail = session.customer_details?.email;

  if (!customerEmail) {
    console.error('No customer email in session:', session.id);
    return { statusCode: 200, body: JSON.stringify({ received: true, no_email: true }) };
  }

  try {
    // Get the full session with line items to find the product
    const fullSession = await stripeRequest(
      '/v1/checkout/sessions/' + session.id + '?expand[]=line_items'
    );

    const lineItem = fullSession.line_items?.data?.[0];
    const productId = lineItem?.price?.product;
    const kit = KIT_DATA[productId];

    if (!kit) {
      console.log('Unknown product or non-kit purchase:', productId);
      return { statusCode: 200, body: JSON.stringify({ received: true, unknown_product: true }) };
    }

    // Send delivery email
    const emailResult = await sendEmail(
      customerEmail,
      'Your ' + kit.name + ' is Ready — Out of Office Labs',
      buildEmailHtml(kit)
    );

    console.log('Delivery email sent to', customerEmail, 'for', kit.name, '| Result:', JSON.stringify(emailResult));

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true, email_sent: true, kit: kit.name })
    };
  } catch (err) {
    console.error('Webhook processing failed:', err);
    // Return 200 so Stripe doesn't retry — log the error for investigation
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true, error: err.message })
    };
  }
};

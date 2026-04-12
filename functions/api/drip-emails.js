/**
 * Cloudflare Pages Function — Schedule Drip Emails
 * Called internally by stripe-webhook.js after successful delivery email.
 * Schedules Emails 2-5 via Resend's scheduled_at parameter.
 *
 * POST /api/drip-emails
 * Body: { email, firstName, kitName, driveLink }
 */

// Email templates for the drip sequence
function buildEmail2Html(firstName, kitName, driveLink) {
  // Day 2: Getting Started — folder walkthrough
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12);">
<tr><td style="background:#0F172A;padding:24px 40px;"><p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#94A3B8;">Getting Started</p><h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#FFF;">Where to start in your kit</h1></td></tr>
<tr><td style="background:#FFF;padding:32px 40px;">
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">${firstName},</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">If you haven't opened the folder yet, here's the link again: <a href="${driveLink}" style="color:#0F172A;font-weight:600;">${kitName} folder</a></p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Here's how the 7 subfolders work:</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;"><strong style="color:#0F172A;">G — Quick-Start Guides:</strong> Open this first. Your audience-specific Start Here guide maps every file to a task.</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;"><strong style="color:#0F172A;">A — Core Decks:</strong> DECK1 is for stakeholders before launch (18 slides). DECK2 closes the program with proof (19 slides).</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;"><strong style="color:#0F172A;">B — Playbooks:</strong> Your coordinator runs the program from here. Mentor and Mentee Guides go to participants.</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;"><strong style="color:#0F172A;">C — Forms:</strong> Intake forms go out before matching. Surveys run mid-program and at close.</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;"><strong style="color:#0F172A;">D — Matching:</strong> One scoring sheet per audience. Criteria are pre-weighted. The sheet outputs matches.</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;"><strong style="color:#0F172A;">E — Reporting:</strong> Meeting Tracker, Engagement Dashboard, Impact Reports, Board Recap.</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;"><strong style="color:#0F172A;">F — Email Templates:</strong> Eight pre-written emails. Swap in names and dates.</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;">The logical sequence is: G → A → B → C → D → F → E.</p>
<p style="margin:16px 0 0;font-size:14px;color:#94A3B8;">— Out of Office Labs</p>
</td></tr>
<tr><td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 40px;text-align:center;"><p style="margin:0;font-size:12px;color:#94A3B8;">Out of Office Labs · <a href="mailto:hello@outofofficelabs.com" style="color:#94A3B8;text-decoration:none;">hello@outofofficelabs.com</a> · <a href="https://outofofficelabs.com" style="color:#94A3B8;text-decoration:none;">outofofficelabs.com</a></p></td></tr>
</table></td></tr></table></body></html>`;
}

function buildEmail3Html(firstName, driveLink) {
  // Day 5: Quick Win — customize DECK1
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12);">
<tr><td style="background:#0F172A;padding:24px 40px;"><p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#94A3B8;">Quick Win</p><h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#FFF;">Customize this deck in the next hour</h1></td></tr>
<tr><td style="background:#FFF;padding:32px 40px;">
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">${firstName},</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Here's the single highest-value move you can make this week: <strong style="color:#0F172A;">customize your Pre-Mentorship Deck.</strong></p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Open DECK1 from subfolder A. It's 18 slides. Walk through them and replace every bracketed placeholder:</p>
<ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.8;color:#475569;">
<li>[Institution Name]</li><li>[Program Name]</li><li>[Academic Year]</li><li>[Coordinator Name and Contact]</li><li>[Program Dates]</li><li>[Cohort Size]</li>
</ul>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">That's the full list. The content doesn't need rewriting — you're just making it yours. Takes less than an hour.</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">When DECK1 is customized, you have the artifact that gets stakeholder buy-in before the first intake form goes out.</p>
<table cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="border-radius:8px;background:#0F172A;"><a href="${driveLink}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#FFF;text-decoration:none;border-radius:8px;">Open Your Kit Folder →</a></td></tr></table>
<p style="margin:0;font-size:14px;color:#94A3B8;">— Out of Office Labs</p>
</td></tr>
<tr><td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 40px;text-align:center;"><p style="margin:0;font-size:12px;color:#94A3B8;">Out of Office Labs · <a href="mailto:hello@outofofficelabs.com" style="color:#94A3B8;text-decoration:none;">hello@outofofficelabs.com</a> · <a href="https://outofofficelabs.com" style="color:#94A3B8;text-decoration:none;">outofofficelabs.com</a></p></td></tr>
</table></td></tr></table></body></html>`;
}

function buildEmail4Html(firstName, driveLink) {
  // Day 30: Mid-program check-in
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12);">
<tr><td style="background:#0F172A;padding:24px 40px;"><p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#94A3B8;">Month One</p><h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#FFF;">A month in — three things to check on</h1></td></tr>
<tr><td style="background:#FFF;padding:32px 40px;">
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">${firstName},</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">If your program launched on schedule, you're roughly at the halfway mark. A few things worth doing right now:</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;"><strong style="color:#0F172A;">Run the mid-program survey.</strong> It's file C14 in subfolder C. Takes participants five minutes. The data becomes the backbone of your post-program report.</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;"><strong style="color:#0F172A;">Check the Engagement Dashboard.</strong> File E7. If you've been logging meetings in the Meeting Tracker (E6), the dashboard pulls from it automatically.</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;"><strong style="color:#0F172A;">Open DECK2 and start populating it.</strong> The Post-Mentorship Deck in subfolder A. Filling in whatever data you already have now makes the end-of-program sprint much easier.</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Coordinators who start reporting now give their boards something worth reading.</p>
<table cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="border-radius:8px;background:#0F172A;"><a href="${driveLink}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#FFF;text-decoration:none;border-radius:8px;">Open Your Kit Folder →</a></td></tr></table>
<p style="margin:0;font-size:14px;color:#94A3B8;">— Out of Office Labs</p>
</td></tr>
<tr><td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 40px;text-align:center;"><p style="margin:0;font-size:12px;color:#94A3B8;">Out of Office Labs · <a href="mailto:hello@outofofficelabs.com" style="color:#94A3B8;text-decoration:none;">hello@outofofficelabs.com</a> · <a href="https://outofofficelabs.com" style="color:#94A3B8;text-decoration:none;">outofofficelabs.com</a></p></td></tr>
</table></td></tr></table></body></html>`;
}

function buildEmail5Html(firstName) {
  // Day 75: Renewal/upgrade
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12);">
<tr><td style="background:#0F172A;padding:24px 40px;"><p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#94A3B8;">Next Steps</p><h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#FFF;">What would you change for next year?</h1></td></tr>
<tr><td style="background:#FFF;padding:32px 40px;">
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">${firstName},</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">By now your program is either wrapping up or you've already presented the final report.</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;"><strong style="color:#0F172A;">The kit you bought works next year.</strong> Duplicating the folder, resetting the tracking sheets, and updating the dates is a 30-minute reset — not a rebuild.</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;"><strong style="color:#0F172A;">If you're working across audiences, each kit is different.</strong> The K-12 kit and the Higher Ed kit have different intake forms, matching criteria, and playbook language. Buying the second kit for your second audience is faster than adapting.</p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">Multi-kit pricing is available. Email <a href="mailto:hello@outofofficelabs.com" style="color:#0F172A;">hello@outofofficelabs.com</a>.</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;"><strong style="color:#0F172A;">One ask:</strong> What would you change? Not about the kit — about your program. If you reply to this email, I read it. The next version of these kits is built from exactly that kind of feedback.</p>
<table cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="border-radius:8px;background:#0F172A;"><a href="https://outofofficelabs.com/shop/" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#FFF;text-decoration:none;border-radius:8px;">Browse All Kits →</a></td></tr></table>
<p style="margin:0;font-size:14px;color:#94A3B8;">— Out of Office Labs</p>
</td></tr>
<tr><td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 40px;text-align:center;"><p style="margin:0;font-size:12px;color:#94A3B8;">Out of Office Labs · <a href="mailto:hello@outofofficelabs.com" style="color:#94A3B8;text-decoration:none;">hello@outofofficelabs.com</a> · <a href="https://outofofficelabs.com" style="color:#94A3B8;text-decoration:none;">outofofficelabs.com</a></p></td></tr>
</table></td></tr></table></body></html>`;
}

export async function onRequestPost({ request, env }) {
  // Verify this is an internal call (simple shared secret)
  const authHeader = request.headers.get('x-drip-secret');
  if (authHeader !== env.DRIP_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { email, firstName, kitName, driveLink } = await request.json();
  if (!email) {
    return new Response('Missing email', { status: 400 });
  }

  const resendApiKey = env.RESEND_API_KEY;
  if (!resendApiKey) {
    return new Response('Missing RESEND_API_KEY', { status: 500 });
  }

  const now = new Date();
  const name = firstName || 'there';

  // Schedule Emails 2-5 using Resend's scheduled_at feature
  const emails = [
    {
      scheduled_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Day 2
      subject: 'Where to start in your kit (a 3-minute read)',
      html: buildEmail2Html(name, kitName, driveLink),
    },
    {
      scheduled_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Day 5
      subject: 'One task that gets your program halfway there',
      html: buildEmail3Html(name, driveLink),
    },
    {
      scheduled_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Day 30
      subject: 'A month in — three things to check on',
      html: buildEmail4Html(name, driveLink),
    },
    {
      scheduled_at: new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000).toISOString(), // Day 75
      subject: 'What would you change for next year?',
      html: buildEmail5Html(name),
    },
  ];

  const results = [];
  for (const em of emails) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Out of Office Labs <hello@outofofficelabs.com>',
          to: [email],
          subject: em.subject,
          html: em.html,
          scheduled_at: em.scheduled_at,
        }),
      });
      const data = await res.json();
      results.push({ subject: em.subject, scheduled: em.scheduled_at, id: data.id, status: res.ok ? 'scheduled' : 'error' });
    } catch (err) {
      results.push({ subject: em.subject, error: err.message });
    }
  }

  console.log('[drip-emails] Scheduled', results.length, 'emails for', email);
  return new Response(JSON.stringify({ scheduled: results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

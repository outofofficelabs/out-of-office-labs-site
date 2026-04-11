// Cloudflare Pages Function: Get kit info from Stripe checkout session
// Called by the thank-you page to show the correct download links
// Endpoint: /api/get-kit?session_id=cs_xxx
//
// Required env var: STRIPE_SECRET_KEY

export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://outofofficelabs.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId || !sessionId.startsWith('cs_')) {
    return new Response(
      JSON.stringify({ error: 'Invalid session_id' }),
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    // Retrieve the checkout session from Stripe
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=line_items`,
      {
        headers: {
          'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const session = await stripeRes.json();

    if (session.error) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Get the product ID from the line items
    const lineItem = session.line_items?.data?.[0];
    const productId = lineItem?.price?.product;

    // Also check metadata for kit_type (set on payment link)
    const kitType = session.metadata?.kit_type || null;

    return new Response(
      JSON.stringify({
        product_id: productId,
        kit_type: kitType,
        customer_email: session.customer_details?.email || null
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error('Stripe session lookup failed:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve session' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

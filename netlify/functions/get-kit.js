// Netlify Function: Get kit info from Stripe checkout session
// Called by the thank-you page to show the correct download links
// Endpoint: /.netlify/functions/get-kit?session_id=cs_xxx

const https = require('https');

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
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse Stripe response'));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': 'https://outofofficelabs.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const sessionId = event.queryStringParameters?.session_id;

  if (!sessionId || !sessionId.startsWith('cs_')) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid session_id' })
    };
  }

  try {
    // Retrieve the checkout session from Stripe
    const session = await stripeRequest(
      '/v1/checkout/sessions/' + encodeURIComponent(sessionId) + '?expand[]=line_items'
    );

    if (session.error) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Session not found' })
      };
    }

    // Get the product ID from the line items
    const lineItem = session.line_items?.data?.[0];
    const productId = lineItem?.price?.product;

    // Also check metadata for kit_type (set on payment link)
    const kitType = session.metadata?.kit_type || null;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        product_id: productId,
        kit_type: kitType,
        customer_email: session.customer_details?.email || null
      })
    };
  } catch (err) {
    console.error('Stripe session lookup failed:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to retrieve session' })
    };
  }
};

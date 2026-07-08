exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { address, amount } = JSON.parse(event.body);
    if (!address || !amount || amount < 0.1) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Invalid data. Min 0.1 USDT.' }) };
    }
    const API_KEY = process.env.NOWPAYMENTS_API_KEY;
    if (!API_KEY) {
      return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Server configuration error.' }) };
    }
    const fetch = (await import('node-fetch')).default;
    const payoutResp = await fetch('https://api.nowpayments.io/v1/payout', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, currency: 'usdtton', amount })
    });
    const payoutData = await payoutResp.json();
    if (payoutData.id && (payoutData.status === 'FINISHED' || payoutData.status === 'CONFIRMING')) {
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, payout_id: payoutData.id }) };
    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: payoutData.message || 'Payout failed' }) };
    }
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: error.message }) };
  }
};

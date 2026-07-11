exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    // အသုံးပြုသူဆီကနေ ရိုက်ထည့်လိုက်တဲ့ USDT amount ကို ဖတ်ယူပါတယ်
    const { address, amount } = JSON.parse(event.body);
    
    // အနည်းဆုံးထုတ်ငွေကို 0.1 USDT လို့ သတ်မှတ်ထားပါတယ်
    if (!address || !amount || amount < 0.01) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Invalid data. Min 0.1 USDT.' }) };
    }
    
    const API_KEY = process.env.NOWPAYMENTS_API_KEY;
    if (!API_KEY) {
      return { statusCode: 500, headers, body: JSON.stringify({ success: false, message: 'Server configuration error.' }) };
    }

    // 🌟 [အဓိကပြင်ဆင်ချက်] 1 TON = 1.67 USDT နှုန်းဖြင့် TON ပမာဏသို့ အလိုအလျောက် တွက်ချက်ခြင်း
    // ဥပမာ - ၁.၆၇ USDT ထုတ်ရင် ၁ TON ရရှိပါမယ်။
    const tonAmount = parseFloat((amount / 1.67).toFixed(6));

    const fetch = (await import('node-fetch')).default;
    const payoutResp = await fetch('https://api.nowpayments.io/v1/payout', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      // currency ကို 'ton' သို့ ပို့ပြီး၊ amount နေရာတွင် တွက်ချက်ပြီးသား tonAmount ကို ထည့်သွင်းပါတယ်
      body: JSON.stringify({ address, currency: 'ton', amount: tonAmount })
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

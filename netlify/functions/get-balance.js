const { readBlob } = require('./blob-helper');

exports.handler = async (event) => {
  // CORS Headers သတ်မှတ်ခြင်း (Frontend က လှမ်းခေါ်လို့ရအောင်)
  const headers = { 
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // URL Parameter ကနေ userId ကို ဖတ်ယူခြင်း
  const userId = event.queryStringParameters ? event.queryStringParameters.userId : null;
  
  if (!userId) {
    return { 
      statusCode: 400, 
      headers, 
      body: JSON.stringify({ success: false, message: 'UserId တောင်းဆိုမှု မပြည့်စုံပါ' }) 
    };
  }
  
  try {
    // Blob storage ထဲကနေ အသုံးပြုသူအားလုံးရဲ့ လက်ကျန်ငွေစာရင်းကို ဖတ်ယူခြင်း
    const balances = (await readBlob('user_balances')) || [];
    
    // သက်ဆိုင်ရာ userId တစ်ခုတည်းကို ရှာဖွေခြင်း
    const user = balances.find(b => b.userId === userId);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        balance: user ? user.balance : 0 // ရှာမတွေ့ရင် balance 0 လို့ ပြမယ်
      })
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ success: false, message: error.message }) 
    };
  }
};

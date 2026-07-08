// netlify/functions/leaderboard.js
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  // ===== GET: Leaderboard ဒေတာယူမယ် =====
  if (event.httpMethod === 'GET') {
    try {
      // Netlify Blobs ဒါမှမဟုတ် Simple JSON file သုံးမယ်
      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join('/tmp', 'referral_data.json');
      
      let data = [];
      if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath, 'utf8');
        data = JSON.parse(raw);
      }
      
      // Top 3 ကိုယူမယ်
      const sorted = data.sort((a, b) => b.count - a.count).slice(0, 3);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, leaderboard: sorted })
      };
    } catch (error) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, leaderboard: [] })
      };
    }
  }

  // ===== POST: Referral count update =====
  if (event.httpMethod === 'POST') {
    try {
      const { userId, username } = JSON.parse(event.body);
      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join('/tmp', 'referral_data.json');
      
      let data = [];
      if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath, 'utf8');
        data = JSON.parse(raw);
      }
      
      // ရှိပြီးသားလား စစ်မယ်
      const existing = data.find(u => u.userId === userId);
      if (existing) {
        existing.count += 1;
        existing.username = username || existing.username;
      } else {
        data.push({ userId, username: username || 'Anonymous', count: 1 });
      }
      
      fs.writeFileSync(dataPath, JSON.stringify(data));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    } catch (error) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, message: error.message })
      };
    }
  }

  return { statusCode: 405, headers, body: 'Method Not Allowed' };
};

/**
 * DIAGNOSTIC SCRIPT - Run this in browser console (F12)
 * Copy and paste this entire script into the browser console
 */

(async () => {
  console.log('🔍 Running OAuth Diagnostic...\n');
  
  // Check environment
  const results = {
    apiBaseUrl: null,
    oauthUrl: null,
    backendRespond: null,
    corsIssue: null,
    envVarSet: null
  };

  // Try to get the config from window (if available)
  try {
    const configModule = import('/src/config.js');
    console.log('✅ Config module imported');
  } catch (e) {
    console.log('❌ Could not import config:', e.message);
  }

  // Check what should be the OAuth URL based on current location
  const currentUrl = window.location.origin; // e.g., http://localhost:5173
  const possibleBackendUrls = [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:3000',
    'http://localhost:8000',
  ];

  console.log('Current Frontend URL:', currentUrl);
  console.log('\n🧪 Testing Backend Connectivity:\n');

  // Test each possible backend URL
  for (const backendUrl of possibleBackendUrls) {
    try {
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'OPTIONS',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`✅ ${backendUrl}: RESPONDS (status: ${response.status})`);
      results.backendRespond = backendUrl;
    } catch (err) {
      console.log(`❌ ${backendUrl}: NO RESPONSE (${err.message})`);
    }
  }

  console.log('\n🧪 Testing OAuth Endpoint:\n');

  // Test the OAuth endpoint that should be redirecting
  for (const backendUrl of possibleBackendUrls) {
    const oauthUrl = `${backendUrl}/api/auth/google`;
    try {
      const response = await fetch(oauthUrl, {
        method: 'HEAD',
        redirect: 'manual'
      });
      console.log(`✅ ${oauthUrl}:`);
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
    } catch (err) {
      console.log(`❌ ${oauthUrl}: ${err.message}`);
    }
  }

  console.log('\n📋 What you should check:\n');
  console.log('1. Is your backend running? (should see a ✅ above)');
  console.log('2. If no backend responds, start it with: npm start (or your command)');
  console.log('3. Check that .env.local has: VITE_API_URL=http://localhost:5000');
  console.log('4. Reload this page if you started the backend');
  
  console.log('\n📍 Expected OAuth URL should be:');
  if (results.backendRespond) {
    console.log(`   ${results.backendRespond}/api/auth/google`);
  } else {
    console.log(`   http://localhost:5000/api/auth/google (default)`);
  }

  console.log('\n💡 Next steps:');
  console.log('1. Paste the backend URL that RESPONDED above');
  console.log('2. Tell the developer what errors you see');
})();

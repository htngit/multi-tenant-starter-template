/**
 * Debug script to investigate StackAssertionError
 * Validates assumptions about Stack Auth configuration mismatch
 */

const { StackServerApp, StackClientApp } = require('@stackframe/stack');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

console.log('🔍 Stack Auth Debug Analysis');
console.log('=' .repeat(50));

// 1. Environment Variables Analysis
console.log('\n📋 Environment Variables:');
const stackEnvVars = {
  NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
  STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY ? '[REDACTED]' : 'MISSING',
  NEXT_PUBLIC_STACK_URL: process.env.NEXT_PUBLIC_STACK_URL,
};

Object.entries(stackEnvVars).forEach(([key, value]) => {
  console.log(`  ${key}: ${value || 'MISSING'}`);
});

// 2. Stack Auth Configuration Analysis
console.log('\n🔧 Stack Auth Configuration:');
try {
  // Attempt to create StackServerApp with detailed logging
  console.log('  Creating StackServerApp...');
  
  const serverAppConfig = {
    tokenStore: 'nextjs-cookie',
    urls: {
      signIn: '/handler/sign-in',
      afterSignIn: '/dashboard',
      afterSignUp: '/dashboard',
      signUp: '/handler/sign-up',
    },
  };
  
  console.log('  Server App Config:', JSON.stringify(serverAppConfig, null, 2));
  
  const stackServerApp = new StackServerApp(serverAppConfig);
  console.log('  ✅ StackServerApp created successfully');
  
  // Attempt to create StackClientApp
  console.log('  Creating StackClientApp...');
  
  const clientAppConfig = {
    tokenStore: 'cookie',
  };
  
  console.log('  Client App Config:', JSON.stringify(clientAppConfig, null, 2));
  
  const stackClientApp = new StackClientApp(clientAppConfig);
  console.log('  ✅ StackClientApp created successfully');
  
} catch (error) {
  console.log('  ❌ Stack Auth Configuration Error:');
  console.log('  Error Type:', error.constructor.name);
  console.log('  Error Message:', error.message);
  
  if (error.extraData) {
    console.log('  Extra Data:', JSON.stringify(error.extraData, null, 2));
  }
  
  if (error.stack) {
    console.log('  Stack Trace:');
    console.log(error.stack.split('\n').slice(0, 10).map(line => `    ${line}`).join('\n'));
  }
}

// 3. Package Version Analysis
console.log('\n📦 Package Version Analysis:');
try {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const stackVersion = packageJson.dependencies['@stackframe/stack'] || 
                      packageJson.devDependencies['@stackframe/stack'];
  
  console.log(`  @stackframe/stack version: ${stackVersion}`);
  
  // Check for known issues with this version
  if (stackVersion === '2.7.16') {
    console.log('  ⚠️  Version 2.7.16 detected - checking for known issues...');
  }
  
} catch (error) {
  console.log('  ❌ Could not read package.json:', error.message);
}

// 4. Network Connectivity Test
console.log('\n🌐 Network Connectivity Test:');
const https = require('https');
const stackUrl = process.env.NEXT_PUBLIC_STACK_URL || 'https://api.stack-auth.com';

const testConnectivity = () => {
  return new Promise((resolve) => {
    const req = https.get(`${stackUrl}/api/v1/health`, (res) => {
      console.log(`  Stack API Status: ${res.statusCode}`);
      resolve(res.statusCode === 200);
    });
    
    req.on('error', (error) => {
      console.log(`  ❌ Network Error: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('  ❌ Request Timeout');
      req.destroy();
      resolve(false);
    });
  });
};

// 5. Detailed Error Capture
console.log('\n🐛 Detailed Error Capture:');
process.on('uncaughtException', (error) => {
  if (error.constructor.name === 'StackAssertionError') {
    console.log('  🎯 StackAssertionError Captured:');
    console.log('  Message:', error.message);
    console.log('  Digest:', error.digest);
    
    if (error.extraData) {
      console.log('  Extra Data Details:');
      console.log(JSON.stringify(error.extraData, null, 2));
    }
  }
});

// Run connectivity test
testConnectivity().then((connected) => {
  console.log(`  Connectivity: ${connected ? '✅ Connected' : '❌ Failed'}`);
  
  console.log('\n🎯 Analysis Summary:');
  console.log('  1. Check environment variables for consistency');
  console.log('  2. Verify Stack Auth project configuration');
  console.log('  3. Consider version downgrade if 2.7.16 has issues');
  console.log('  4. Check Stack Auth dashboard for recent changes');
  
  console.log('\n📝 Next Steps:');
  console.log('  - If env vars are correct: Check Stack Auth dashboard');
  console.log('  - If connectivity fails: Check network/firewall');
  console.log('  - If version issue: Try @stackframe/stack@2.7.15');
  console.log('  - If config mismatch: Recreate Stack Auth project');
});

console.log('\n' + '='.repeat(50));
console.log('Debug analysis complete. Check output above for issues.');
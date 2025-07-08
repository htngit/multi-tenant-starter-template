/**
 * Simple test to verify environment variable loading
 */

console.log('🔍 Environment Variables Test');
console.log('=' .repeat(40));

// Test direct process.env access
console.log('\n📋 Direct process.env access:');
console.log('NEXT_PUBLIC_STACK_PROJECT_ID:', process.env.NEXT_PUBLIC_STACK_PROJECT_ID || 'MISSING');
console.log('NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY:', process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || 'MISSING');
console.log('STACK_SECRET_SERVER_KEY:', process.env.STACK_SECRET_SERVER_KEY ? '[REDACTED]' : 'MISSING');

// Test with Next.js env loading
const { loadEnvConfig } = require('@next/env');
const projectDir = require('path').join(__dirname, '..');

console.log('\n🔧 Loading Next.js environment config...');
loadEnvConfig(projectDir);

console.log('\n📋 After Next.js env loading:');
console.log('NEXT_PUBLIC_STACK_PROJECT_ID:', process.env.NEXT_PUBLIC_STACK_PROJECT_ID || 'MISSING');
console.log('NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY:', process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || 'MISSING');
console.log('STACK_SECRET_SERVER_KEY:', process.env.STACK_SECRET_SERVER_KEY ? '[REDACTED]' : 'MISSING');

// Test Stack Auth initialization with proper env vars
console.log('\n🧪 Testing Stack Auth initialization...');
try {
  const { StackServerApp } = require('@stackframe/stack');
  
  console.log('Creating StackServerApp with env vars:');
  console.log('- Project ID:', process.env.NEXT_PUBLIC_STACK_PROJECT_ID);
  console.log('- Publishable Key:', process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY?.substring(0, 20) + '...');
  console.log('- Secret Key:', process.env.STACK_SECRET_SERVER_KEY ? '[PRESENT]' : '[MISSING]');
  
  const stackServerApp = new StackServerApp({
    tokenStore: 'nextjs-cookie',
    urls: {
      signIn: '/handler/sign-in',
      afterSignIn: '/dashboard',
      afterSignUp: '/dashboard',
      signUp: '/handler/sign-up',
    },
  });
  
  console.log('✅ StackServerApp created successfully!');
  
} catch (error) {
  console.log('❌ StackServerApp creation failed:');
  console.log('Error:', error.message);
  
  if (error.message.includes('project ID')) {
    console.log('\n🔍 Diagnosis: Project ID not detected by Stack Auth');
    console.log('This suggests an environment variable loading issue.');
  }
}

console.log('\n' + '='.repeat(40));
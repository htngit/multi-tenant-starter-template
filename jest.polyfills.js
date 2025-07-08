/**
 * Jest Polyfills for Web APIs
 * 
 * This file provides polyfills for Web APIs that are required by Next.js
 * but not available in the Node.js Jest environment.
 */

// Polyfill for Request and Response (required by Next.js server components)
// Using Node.js built-in modules since undici is not available
const { URL } = require('url');

// Simple Request polyfill for Jest environment
class MockRequest {
  constructor(input, init = {}) {
    this.url = typeof input === 'string' ? input : input.url;
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.body = init.body || null;
  }
}

// Simple Response polyfill for Jest environment
class MockResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map(Object.entries(init.headers || {}));
  }
  
  json() {
    return Promise.resolve(JSON.parse(this.body));
  }
  
  text() {
    return Promise.resolve(this.body);
  }
}

// Simple Headers polyfill
class MockHeaders extends Map {
  get(name) {
    return super.get(name.toLowerCase());
  }
  
  set(name, value) {
    return super.set(name.toLowerCase(), value);
  }
}

// Simple fetch polyfill
const mockFetch = async (input, init) => {
  return new MockResponse('{}', { status: 200 });
};

// Make Web APIs globally available
Object.defineProperties(globalThis, {
  Request: { value: MockRequest, writable: true },
  Response: { value: MockResponse, writable: true },
  Headers: { value: MockHeaders, writable: true },
  fetch: { value: mockFetch, writable: true },
});

// Polyfill for URL and URLSearchParams (usually available in Node.js but ensuring compatibility)
if (!globalThis.URL) {
  const { URL, URLSearchParams } = require('url');
  Object.defineProperties(globalThis, {
    URL: { value: URL, writable: true },
    URLSearchParams: { value: URLSearchParams, writable: true },
  });
}

// Polyfill for TextEncoder and TextDecoder (required for some crypto operations)
if (!globalThis.TextEncoder) {
  const { TextEncoder, TextDecoder } = require('util');
  Object.defineProperties(globalThis, {
    TextEncoder: { value: TextEncoder, writable: true },
    TextDecoder: { value: TextDecoder, writable: true },
  });
}

// Polyfill for crypto.subtle (required for JWT operations)
if (!globalThis.crypto) {
  const { webcrypto } = require('crypto');
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true,
  });
}

// Polyfill for performance.now() (sometimes needed for timing operations)
if (!globalThis.performance) {
  const { performance } = require('perf_hooks');
  Object.defineProperty(globalThis, 'performance', {
    value: performance,
    writable: true,
  });
}

console.log('🔧 Jest Web API polyfills loaded successfully');
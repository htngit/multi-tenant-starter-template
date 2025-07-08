/**
 * Jest Setup Configuration
 * 
 * Global test setup for JWT Token Bridge testing
 * Includes mocks, polyfills, and test utilities
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Global test configuration
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.STACK_AUTH_PROJECT_ID = 'test-stack-project';
process.env.STACK_AUTH_SECRET_KEY = 'test-stack-secret';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
  withRouter: (Component) => Component,
}));

// Mock Next.js navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: null, error: null }),
        download: jest.fn().mockResolvedValue({ data: null, error: null }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
    rest: {
      headers: {},
    },
  })),
}));

// Mock Stack Auth
jest.mock('@stackframe/stack', () => ({
  StackProvider: ({ children }) => children,
  useUser: jest.fn(() => ({
    id: 'test-user-id',
    primaryEmail: 'test@example.com',
    displayName: 'Test User',
    signOut: jest.fn(),
  })),
  useStackApp: jest.fn(() => ({
    getUser: jest.fn().mockResolvedValue({
      id: 'test-user-id',
      primaryEmail: 'test@example.com',
      displayName: 'Test User',
    }),
    signInWithCredentials: jest.fn().mockResolvedValue({ user: {} }),
    signOut: jest.fn().mockResolvedValue({}),
  })),
  getTokens: jest.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  }),
}));

// Mock React hooks
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn((initial) => [initial, jest.fn()]),
  useEffect: jest.fn((fn) => fn()),
  useContext: jest.fn(),
  useCallback: jest.fn((fn) => fn),
  useMemo: jest.fn((fn) => fn()),
  useRef: jest.fn(() => ({ current: null })),
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers(),
  })
);

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
  writable: true,
});

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
  },
});

// Mock crypto API for JWT testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-1234-5678-9012'),
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    subtle: {
      sign: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
      verify: jest.fn().mockResolvedValue(true),
      digest: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
      generateKey: jest.fn().mockResolvedValue({}),
      importKey: jest.fn().mockResolvedValue({}),
      exportKey: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
  },
});

// Mock Buffer for Node.js compatibility
if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// Mock TextEncoder/TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// Custom matchers for JWT testing
expect.extend({
  toBeValidJWT(received) {
    const pass = typeof received === 'string' && received.split('.').length === 3;
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid JWT`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid JWT`,
        pass: false,
      };
    }
  },
  
  toHaveJWTClaim(received, claim, value) {
    try {
      const parts = received.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const pass = payload[claim] === value;
      
      if (pass) {
        return {
          message: () => `expected JWT not to have claim ${claim} with value ${value}`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected JWT to have claim ${claim} with value ${value}, but got ${payload[claim]}`,
          pass: false,
        };
      }
    } catch (error) {
      return {
        message: () => `expected ${received} to be a valid JWT for claim checking`,
        pass: false,
      };
    }
  },
});

// Global test utilities
global.testUtils = {
  // Create mock request object
  createMockRequest: (headers = {}, cookies = {}) => ({
    headers,
    cookies,
    get: (name) => headers[name.toLowerCase()],
  }),
  
  // Create mock JWT token
  createMockJWT: (payload = {}) => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const defaultPayload = {
      sub: 'test-user-id',
      tenant_id: 'test-tenant-id',
      roles: ['user'],
      permissions: ['read'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: 'stack-auth',
      aud: 'xalesin-erp',
      ...payload,
    };
    
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(defaultPayload)).toString('base64url');
    const signature = 'mock-signature';
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  },
  
  // Wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock timer helpers
  advanceTimers: (ms) => {
    jest.advanceTimersByTime(ms);
  },
};

// Setup fake timers
jest.useFakeTimers();

// Global beforeEach for all tests
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset fake timers
  jest.clearAllTimers();
  
  // Clear localStorage and sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Reset fetch mock
  global.fetch.mockClear();
});

// Global afterEach for all tests
afterEach(() => {
  // Run all pending timers
  jest.runOnlyPendingTimers();
  
  // Restore all mocks
  jest.restoreAllMocks();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Suppress specific warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
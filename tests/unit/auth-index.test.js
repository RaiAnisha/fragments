// tests/unit/auth-index.test.js
describe('auth/index.js', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules(); // Clear require cache
    process.env = { ...originalEnv }; // Reset env before each test
  });

  afterAll(() => {
    process.env = originalEnv; // Restore original env
  });

  test('throws error if both Cognito and HTPASSWD are configured', () => {
    process.env.AWS_COGNITO_POOL_ID = 'pool';
    process.env.AWS_COGNITO_CLIENT_ID = 'client';
    process.env.HTPASSWD_FILE = 'file';

    expect(() => require('../../src/auth')).toThrow(
      'env contains configuration for both AWS Cognito and HTTP Basic Auth. Only one is allowed.'
    );
  });

  test('loads Cognito module if Cognito env vars are present', () => {
    process.env.AWS_COGNITO_POOL_ID = 'pool';
    process.env.AWS_COGNITO_CLIENT_ID = 'client';
    delete process.env.HTPASSWD_FILE;
    process.env.NODE_ENV = 'test';

    jest.mock(
      '../../src/auth/cognito',
      () => ({
        login: jest.fn(),
      }),
      { virtual: true }
    );

    const auth = require('../../src/auth');
    expect(auth).toHaveProperty('login'); // check that our mock is loaded
  });

  test('loads basic-auth module if HTPASSWD_FILE is set and not production', () => {
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    process.env.HTPASSWD_FILE = 'file';
    process.env.NODE_ENV = 'test';

    jest.mock(
      '../../src/auth/basic-auth',
      () => ({
        login: jest.fn(),
      }),
      { virtual: true }
    );

    const auth = require('../../src/auth');
    expect(auth).toHaveProperty('login'); // check that our mock is loaded
  });

  test('throws error if no valid auth config is found', () => {
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    delete process.env.HTPASSWD_FILE;
    process.env.NODE_ENV = 'test';

    expect(() => require('../../src/auth')).toThrow(
      'missing env vars: no authorization configuration found'
    );
  });

  // test('does not load basic-auth in production even if HTPASSWD_FILE is set', () => {
  //   // Clear require cache so auth/index.js is re-evaluated
  //   jest.resetModules();

  //   // Set environment: production with only HTPASSWD_FILE
  //   process.env.AWS_COGNITO_POOL_ID = '';
  //   process.env.AWS_COGNITO_CLIENT_ID = '';
  //   process.env.HTPASSWD_FILE = 'file';
  //   process.env.NODE_ENV = 'production';

  //   // Require fresh
  //   const auth = require('../../src/auth');

  //   // In production, HTPASSWD_FILE is ignored, so require should return undefined
  //   expect(auth).toBeUndefined();
  // });
});

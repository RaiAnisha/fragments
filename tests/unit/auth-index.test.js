// tests/unit/auth-index.test.js
describe('auth/index.js', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
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
    expect(auth).toHaveProperty('login');
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
});

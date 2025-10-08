// tests/unit/auth-middleware.test.js
const authMiddleware = require('../../src/auth/auth-middleware');
const passport = require('passport');
const { createErrorResponse } = require('../../src/response');

// Mock logger to prevent noisy output
jest.mock('../../src/logger', () => ({
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Mock hash function
jest.mock('../../src/hash', () => jest.fn((email) => `hashed-${email}`));

describe('auth-middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('calls next with req.user for a valid user', () => {
    passport.authenticate = jest.fn((strategy, options, callback) => {
      return (req, res, next) => {
        (void req, res, next);
        const fakeUser = {
          sub: 'user1-id',
          email: 'user1@email.com',
          'cognito:username': 'user1',
          claims: { sub: 'user1-id', email: 'user1@email.com', 'cognito:username': 'user1' },
        };
        callback(null, fakeUser);
      };
    });

    const middleware = authMiddleware('bearer');
    middleware(req, res, next);

    // ⚠️ Only check that important fields exist, ignore extra nesting
    expect(req.user).toEqual(
      expect.objectContaining({
        id: 'user1-id',
        username: 'user1',
        email: 'user1@email.com',
        hash: 'hashed-user1@email.com',
        claims: expect.objectContaining({
          sub: 'user1-id',
          email: 'user1@email.com',
          'cognito:username': 'user1',
        }),
      })
    );

    expect(next).toHaveBeenCalled();
  });

  test('returns 401 if user has no email', () => {
    passport.authenticate = jest.fn((strategy, options, callback) => {
      return (req, res, next) => {
        (void req, res, next);
        callback(null, {}); // user without email
      };
    });

    const middleware = authMiddleware('bearer');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(createErrorResponse(401, 'Unauthorized'));
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next with 500 if passport returns an error', () => {
    passport.authenticate = jest.fn((strategy, options, callback) => {
      return (req, res, next) => {
        (void req, res, next);
        callback(new Error('auth error'), null);
      };
    });

    const middleware = authMiddleware('bearer');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(createErrorResponse(500, 'Unable to authenticate user'));
  });
});

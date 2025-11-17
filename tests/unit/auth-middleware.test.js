// tests/unit/auth-middleware.test.js
const authMiddleware = require('../../src/auth/auth-middleware');
const passport = require('passport');
const { createErrorResponse } = require('../../src/response');

jest.mock('../../src/logger', () => ({
  warn: jest.fn(),
  debug: jest.fn(),
}));

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

  test('returns 401 if user is null', () => {
    passport.authenticate = jest.fn((strategy, options, callback) => {
      return (req, res, next) => {
        (void req, res, next);
        callback(null, null); // triggers 401
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

  test('works with string user (legacy format)', () => {
    passport.authenticate = jest.fn((strategy, options, callback) => {
      return (req, res, next) => {
        (void req, res, next);
        callback(null, 'legacy-user@example.com');
      };
    });

    const middleware = authMiddleware('bearer');
    middleware(req, res, next);

    expect(req.user).toEqual(
      expect.objectContaining({
        id: 'legacy-user@example.com',
        username: 'legacy-user@example.com',
        email: 'legacy-user@example.com',
        hash: 'hashed-legacy-user@example.com',
      })
    );
    expect(next).toHaveBeenCalled();
  });
});

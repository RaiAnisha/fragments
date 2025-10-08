// tests/unit/get.test.js
const express = require('express');
const request = require('supertest');

describe('GET /v1/fragments handler', () => {
  let app;
  let mockFragments;
  let mockCreateSuccessResponse;

  beforeEach(() => {
    jest.resetModules();

    // --- Mock createSuccessResponse ---
    mockCreateSuccessResponse = jest.fn((data) => data);
    jest.doMock('../../src/response', () => ({
      createSuccessResponse: mockCreateSuccessResponse,
    }));

    // --- Mock Fragment ---
    mockFragments = [
      { id: 'f1', ownerId: 'user-1', type: 'text/plain', size: 11 },
      { id: 'f2', ownerId: 'user-1', type: 'text/plain', size: 5 },
    ];
    const mockFragmentClass = {
      byUser: jest.fn(async (userId, expand) => {
        // optional: just reference them to avoid warnings
        void userId;
        void expand;
        return mockFragments;
      }),
    };
    jest.doMock('../../src/model/fragment', () => ({
      Fragment: mockFragmentClass,
    }));

    // --- Import route after mocks ---
    const getRoute = require('../../src/routes/api/get');

    app = express();
    app.use(express.json());

    // Fake auth middleware
    app.use((req, res, next) => {
      req.user = { id: 'user-1', claims: { sub: 'user-1' } };
      next();
    });

    app.get('/v1/fragments', getRoute);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return fragments for the current user', async () => {
    const res = await request(app).get('/v1/fragments');

    expect(res.statusCode).toBe(200);
    expect(mockCreateSuccessResponse).toHaveBeenCalledWith({ fragments: mockFragments });
    expect(res.body).toEqual({ fragments: mockFragments });
  });

  test('should handle internal errors gracefully', async () => {
    // Re-mock Fragment.byUser to throw an error
    const { Fragment } = require('../../src/model/fragment');
    Fragment.byUser.mockImplementationOnce(() => {
      throw new Error('DB failure');
    });

    const res = await request(app).get('/v1/fragments');

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
  });
});

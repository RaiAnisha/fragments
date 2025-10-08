// tests/unit/index.test.js
const express = require('express');
const request = require('supertest');

describe('POST /v1/fragments router', () => {
  let app;
  let mockCreateFragment;

  beforeEach(() => {
    jest.resetModules();

    // --- Mock createFragment helper ---
    mockCreateFragment = jest.fn();
    jest.doMock('../../src/routes/api/post', () => ({
      createFragment: mockCreateFragment,
    }));

    // --- Import router after mocks ---
    const router = require('../../src/routes/api/index');

    app = express();
    app.use(express.json());

    // Fake auth middleware
    app.use((req, res, next) => {
      req.user = { claims: { sub: 'user-1' } };
      next();
    });

    app.use(router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a fragment successfully', async () => {
    const fakeFragment = { id: 'f1', type: 'text/plain', size: 11 };
    mockCreateFragment.mockResolvedValueOnce(fakeFragment);

    const res = await request(app)
      .post('/v1/fragments')
      .send({ type: 'text/plain', data: 'Hello world' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ fragment: fakeFragment });
    expect(mockCreateFragment).toHaveBeenCalledWith('user-1', 'text/plain', 'Hello world');
  });

  test('should return 400 when createFragment throws an error', async () => {
    mockCreateFragment.mockRejectedValueOnce(new Error('Invalid type'));

    const res = await request(app)
      .post('/v1/fragments')
      .send({ type: 'invalid/type', data: 'Hello world' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid type');
    expect(mockCreateFragment).toHaveBeenCalledWith('user-1', 'invalid/type', 'Hello world');
  });
});

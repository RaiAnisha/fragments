// tests/unit/post.test.js
const express = require('express');
const request = require('supertest');

describe('POST /v1/fragments handler', () => {
  let app;
  let mockWriteFragment, mockWriteFragmentData;

  beforeEach(() => {
    jest.resetModules();

    jest.doMock('../../src/logger', () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    }));

    jest.doMock('../../src/model/fragment', () => {
      class Fragment {
        constructor({ ownerId, type, size }) {
          this.id = '12345';
          this.ownerId = ownerId;
          this.type = type;
          this.size = size;
        }
        static isSupportedType(type) {
          return type === 'text/plain';
        }
      }
      return { Fragment };
    });

    mockWriteFragment = jest.fn().mockResolvedValue(true);
    mockWriteFragmentData = jest.fn().mockResolvedValue(true);
    jest.doMock('../../src/model/data', () => ({
      writeFragment: mockWriteFragment,
      writeFragmentData: mockWriteFragmentData,
    }));

    const postRoute = require('../../src/routes/api/post');

    app = express();

    app.use(express.text({ type: '*/*' }));

    app.use((req, res, next) => {
      req.user = { id: 'user-1', claims: { sub: 'user-1' } };
      next();
    });

    app.post('/v1/fragments', postRoute);
  });

  afterEach(async () => {
    jest.clearAllMocks();

    if (app && app.close) await app.close();
  });

  test('should create a fragment with object body', async () => {
    const body = JSON.stringify({ message: 'Hello world' });
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(body);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('fragment');
    expect(res.body.fragment).toHaveProperty('id', '12345');
    expect(mockWriteFragment).toHaveBeenCalled();
    expect(mockWriteFragmentData).toHaveBeenCalled();
    expect(res.headers).toHaveProperty('location');
  });

  test('should create a fragment with string body', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('Hello world');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('fragment');
    expect(res.body.fragment).toHaveProperty('id', '12345');
    expect(mockWriteFragment).toHaveBeenCalled();
    expect(mockWriteFragmentData).toHaveBeenCalled();
    expect(res.headers).toHaveProperty('location');
  });

  test('should create a fragment with Buffer body', async () => {
    const buffer = Buffer.from('Hello Buffer');
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(buffer);

    expect(res.statusCode).toBe(201);
    expect(res.body.fragment).toHaveProperty('id', '12345');
    expect(mockWriteFragment).toHaveBeenCalled();
    expect(mockWriteFragmentData).toHaveBeenCalled();
    expect(res.headers).toHaveProperty('location');
  });

  test('should return 415 for unsupported content type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ message: 'Hello' }));

    expect(res.statusCode).toBe(415);
    expect(res.body).toHaveProperty('error');
  });

  test('should handle internal errors gracefully', async () => {
    mockWriteFragment.mockImplementationOnce(() => {
      throw new Error('DB failure');
    });

    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('Hello world');

    expect(res.statusCode).toBe(500);

    expect(res.body).toEqual({
      status: 'error',
      error: { code: 500, message: 'Internal Server Error' },
    });
  });

  test('should set Location header on successful creation', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('Hello world');

    expect(res.statusCode).toBe(201);
    expect(res.headers).toHaveProperty('location');
    expect(res.headers.location).toContain('/v1/fragments/12345');
  });
});

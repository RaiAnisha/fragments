// tests/unit/api-index.test.js
const express = require('express');
const request = require('supertest');

describe('API Router', () => {
  let app;
  let mockGet;
  let mockPost;

  beforeEach(() => {
    jest.resetModules();

    mockGet = jest.fn((req, res) => {
      res.status(200).json({ fragments: [{ id: 'f1' }, { id: 'f2' }] });
    });
    mockPost = jest.fn((req, res) => {
      const { type, data } = req.body;
      if (!type || !data) {
        return res.status(400).json({ error: 'Missing type or data' });
      }
      return res.status(201).json({ fragment: { id: 'f1', type, size: data.length } });
    });

    jest.doMock('../../src/routes/api/get', () => mockGet);
    jest.doMock('../../src/routes/api/post', () => mockPost);

    const router = require('../../src/routes/api/index');

    app = express();
    app.use(express.json());
    app.use('/v1', router); // mount router at /v1
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /v1/fragments returns fragments successfully', async () => {
    const res = await request(app).get('/v1/fragments');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ fragments: [{ id: 'f1' }, { id: 'f2' }] });
    expect(mockGet).toHaveBeenCalled();
  });

  test('POST /v1/fragments creates a fragment successfully', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send({ type: 'text/plain', data: 'Hello world' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ fragment: { id: 'f1', type: 'text/plain', size: 11 } });
    expect(mockPost).toHaveBeenCalled();
  });

  test('POST /v1/fragments returns 400 if missing type or data', async () => {
    const res = await request(app).post('/v1/fragments').send({}); // missing type and data

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing type or data');
    expect(mockPost).toHaveBeenCalled();
  });
});

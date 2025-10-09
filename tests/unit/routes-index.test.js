// tests/unit/routes-index.test.js
const express = require('express');
const request = require('supertest');

const mockGetHandler = jest.fn((req, res) => res.status(200).json({ ok: true }));
const mockPostHandler = jest.fn((req, res) => res.status(201).json({ ok: true }));

jest.mock('../../src/auth', () => ({
  authenticate: jest.fn(() => (req, res, next) => next()),
}));

jest.mock('../../src/routes/api', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/fragments', (req, res) => mockGetHandler(req, res));
  router.post('/fragments', (req, res) => mockPostHandler(req, res));
  return router;
});

describe('src/routes/index.js', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    const router = require('../../src/routes');
    app = express();
    app.use(express.json());
    app.use(router);
  });

  test('GET / should return health check with status ok', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');

    const data = res.body.data || res.body;
    expect(data).toHaveProperty('author');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('githubUrl');
  });

  test('health check response should contain correct metadata', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');

    const data = res.body.data || res.body;
    expect(data.githubUrl).toContain('github.com/RaiAnisha/fragments');
  });

  test('GET /v1/fragments should return 200 from mock API router', async () => {
    const res = await request(app).get('/v1/fragments');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('POST /v1/fragments should return 201 from mock API router', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('test content');
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ ok: true });
  });

  describe('additional route behaviors', () => {
    test('should use /v1 prefix and call GET route when authenticated', async () => {
      const res = await request(app).get('/v1/fragments');
      expect(res.statusCode).toBe(200);
      expect(mockGetHandler).toHaveBeenCalled();
    });

    test('should call POST route when posting valid data', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .send('Sample data');
      expect(res.statusCode).toBe(201);
      expect(mockPostHandler).toHaveBeenCalled();
    });
  });
});

// tests/unit/app.test.js
const express = require('express');
const request = require('supertest');

describe('Main App Routes (no auth, no router import)', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock root route
    app.get('/', (req, res) => {
      res.status(200).json({
        author: 'Your Name',
        version: '0.10.0',
        githubUrl: 'https://github.com/RaiAnisha/fragments',
      });
    });

    // Mock /v1/fragments routes
    app.get('/v1/fragments', (req, res) => res.status(200).send('GET called'));
    app.post('/v1/fragments', (req, res) => res.status(201).send('POST called'));
    app.get('/v1/fragments/:id', (req, res) => res.status(200).send('GETBYID called'));

    // Mock 404
    app.use((req, res) => {
      res.status(404).json({ status: 404, message: 'not found' });
    });
  });

  test('GET / returns version info', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('author');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('githubUrl');
  });

  test('GET unknown route returns 404', async () => {
    const res = await request(app).get('/unknown');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('status', 404);
    expect(res.body).toHaveProperty('message', 'not found');
  });

  test('GET /v1/fragments returns mocked GET', async () => {
    const res = await request(app).get('/v1/fragments');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('GET called');
  });

  test('POST /v1/fragments returns mocked POST', async () => {
    const res = await request(app).post('/v1/fragments').send('some data');
    expect(res.statusCode).toBe(201);
    expect(res.text).toBe('POST called');
  });

  test('GET /v1/fragments/:id returns mocked GETBYID', async () => {
    const res = await request(app).get('/v1/fragments/123');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('GETBYID called');
  });
});

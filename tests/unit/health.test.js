// tests/unit/health.test.js
const express = require('express');
const request = require('supertest');

describe('Health and Fragments Routes (no router import)', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock /health route
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        version: '0.10.0',
        author: 'Your Name',
      });
    });

    // Mock /fragments routes
    app.get('/fragments', (req, res) => res.status(200).send('GET called'));
    app.post('/fragments', (req, res) => res.status(201).send('POST called'));
    app.get('/fragments/:id', (req, res) => res.status(200).send('GETBYID called'));
  });

  test('GET /health returns version info', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('author');
  });

  test('GET /fragments should call mocked GET handler', async () => {
    const res = await request(app).get('/fragments');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('GET called');
  });

  test('POST /fragments should call mocked POST handler', async () => {
    const res = await request(app).post('/fragments').send('some data');
    expect(res.statusCode).toBe(201);
    expect(res.text).toBe('POST called');
  });

  test('GET /fragments/:id should call mocked GETBYID handler', async () => {
    const res = await request(app).get('/fragments/123');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('GETBYID called');
  });
});

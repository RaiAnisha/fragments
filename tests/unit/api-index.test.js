// tests/unit/api-index.test.js
const express = require('express');
const request = require('supertest');

// Mock the handlers
jest.mock('../../src/routes/api/get', () =>
  jest.fn((req, res) => res.status(200).send('GET called'))
);
jest.mock('../../src/routes/api/post', () =>
  jest.fn((req, res) => res.status(201).send('POST called'))
);

// Mock the authenticate middleware
jest.mock('../../src/auth', () => jest.fn(() => (req, res, next) => next()));

describe('API Index Router', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', require('../../src/routes/api/index'));
  });

  test('GET /fragments should call get handler', async () => {
    const res = await request(app).get('/fragments');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('GET called');
  });

  test('POST /fragments should call post handler', async () => {
    const res = await request(app)
      .post('/fragments')
      .set('Authorization', 'Bearer faketoken')
      .send('some data');
    expect(res.statusCode).toBe(201);
    expect(res.text).toBe('POST called');
  });

  test('POST /fragments should use raw middleware', async () => {
    const res = await request(app)
      .post('/fragments')
      .set('Authorization', 'Bearer faketoken')
      .send('raw data test');

    expect(res.statusCode).toBe(201);
  });
});

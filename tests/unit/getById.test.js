// tests/unit/getById.test.js
const express = require('express');
const request = require('supertest');
const getByIdRoute = require('../../src/routes/api/getById');
//const { Fragment } = require('../../src/model/fragment');
//const hash = require('../../src/hash');

jest.mock('../../src/model/fragment', () => ({
  Fragment: {
    byId: jest.fn((ownerId, id) => {
      if (id === 'notfound') return Promise.resolve(null);
      if (id === 'dberror') return Promise.reject(new Error('DB error'));
      return Promise.resolve({
        id: '123',
        ownerId,
        type: 'text/markdown',
        mimeType: 'text/markdown',
        formats: ['text/html', 'text/plain', 'application/json'],
        size: 10,
        created: new Date(),
        updated: new Date(),
        getData: jest.fn().mockImplementation(() => {
          if (id === 'nodata') return Promise.resolve(null);
          return Promise.resolve(Buffer.from('# Hello World'));
        }),
      });
    }),
  },
}));

jest.mock('../../src/hash', () => jest.fn(() => 'hashed-owner'));

describe('GET /v1/fragments/:id', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Simulate authenticated user
    app.use((req, _res, next) => {
      req.user = { claims: { sub: 'user1' } };
      next();
    });

    app.get('/v1/fragments/:id', getByIdRoute);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns 404 if fragment not found', async () => {
    const res = await request(app).get('/v1/fragments/notfound');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 404 if fragment data is empty', async () => {
    const res = await request(app).get('/v1/fragments/nodata');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('returns fragment metadata if ?metadata=true', async () => {
    const res = await request(app).get('/v1/fragments/123?metadata=true');
    expect(res.statusCode).toBe(200);
    expect(res.body.fragment).toHaveProperty('id', '123');
  });

  test('returns raw fragment data', async () => {
    const res = await request(app).get('/v1/fragments/123');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('# Hello World');
    expect(res.headers['content-type']).toMatch(/text\/markdown/);
  });

  test('converts Markdown to HTML if .html requested', async () => {
    const res = await request(app).get('/v1/fragments/123.html');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<h1>Hello World</h1>');
    expect(res.headers['content-type']).toMatch(/text\/html/);
  });

  test('returns txt if .txt requested', async () => {
    const res = await request(app).get('/v1/fragments/123.txt');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('# Hello World');
    expect(res.headers['content-type']).toMatch(/text\/plain/);
  });

  test('returns 415 for unsupported extension', async () => {
    const res = await request(app).get('/v1/fragments/123.exe');
    expect(res.statusCode).toBe(415);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 415 if conversion not supported', async () => {
    // Example: trying to convert markdown to jpeg
    const res = await request(app).get('/v1/fragments/123.jpeg');
    expect(res.statusCode).toBe(415);
    expect(res.body).toHaveProperty('error');
  });

  test('handles DynamoDB / DB error gracefully', async () => {
    const appError = express();
    appError.use(express.json());
    appError.use((req, _res, next) => {
      req.user = { claims: { sub: 'user1' } };
      next();
    });
    appError.get('/v1/fragments/:id', getByIdRoute);

    const res = await request(appError).get('/v1/fragments/dberror');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

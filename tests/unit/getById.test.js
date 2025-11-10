// tests/unit/getById.test.js
const express = require('express');
const request = require('supertest');
const getByIdRoute = require('../../src/routes/api/getById');
//const { Fragment } = require('../../src/model/fragment');

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

describe('GET /v1/fragments/:id', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.use((req, res, next) => {
      req.user = { claims: { sub: 'user1' } };
      next();
    });

    app.get('/v1/fragments/:id', getByIdRoute);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 401 if user is not authenticated', async () => {
    const appNoAuth = express();
    appNoAuth.use(express.json());
    appNoAuth.get('/v1/fragments/:id', getByIdRoute);

    const res = await request(appNoAuth).get('/v1/fragments/123');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('should return 404 if fragment not found', async () => {
    const res = await request(app).get('/v1/fragments/notfound');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('should return 404 if fragment data is empty', async () => {
    const res = await request(app).get('/v1/fragments/nodata');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('should return fragment metadata if ?metadata=true', async () => {
    const res = await request(app).get('/v1/fragments/123?metadata=true');
    expect(res.statusCode).toBe(200);
    expect(res.body.fragment).toHaveProperty('id', '123');
  });

  test('should return raw fragment data', async () => {
    const res = await request(app).get('/v1/fragments/123');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('# Hello World');
    expect(res.headers['content-type']).toMatch(/text\/markdown/);
  });

  test('should convert Markdown to HTML if .html requested', async () => {
    const res = await request(app).get('/v1/fragments/123.html');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<h1>Hello World</h1>');
    expect(res.headers['content-type']).toMatch(/text\/html/);
  });

  test('should return txt if .txt requested', async () => {
    const res = await request(app).get('/v1/fragments/123.txt');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('# Hello World');
    expect(res.headers['content-type']).toMatch(/text\/plain/);
  });

  test('should return 415 for unsupported extension', async () => {
    const res = await request(app).get('/v1/fragments/123.exe');
    expect(res.statusCode).toBe(415);
    expect(res.body).toHaveProperty('error');
  });
});

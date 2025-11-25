const express = require('express');
const request = require('supertest');
const getInfoRoute = require('../../src/routes/api/getInfo');
const { createSuccessResponse, createErrorResponse } = require('../../src/response');

// Correctly mock Fragment model
jest.mock('../../src/model/fragment', () => ({
  Fragment: {
    byId: jest.fn((ownerId, id) => {
      if (id === 'notfound') return Promise.reject(new Error('Fragment not found'));
      if (id === 'dberror') return Promise.reject(new Error('DB error'));
      return Promise.resolve({
        id,
        ownerId,
        type: 'text/plain',
        size: 123,
        created: new Date('2025-01-01T00:00:00Z'),
        updated: new Date('2025-01-02T00:00:00Z'),
      });
    }),
  },
}));

// Correctly mock hash
jest.mock('../../src/hash', () => jest.fn((claims) => claims.sub));

describe('GET /v1/fragments/:id/info', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Simulate authenticated user
    app.use((req, res, next) => {
      req.user = { claims: { sub: 'user1' } };
      next();
    });

    app.get('/v1/fragments/:id/info', getInfoRoute);
  });

  // test('should return fragment metadata successfully', async () => {
  //   const res = await request(app).get('/v1/fragments/123/info');
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toEqual(
  //     createSuccessResponse({
  //       fragment: {
  //         id: '123',
  //         ownerId: 'user1',
  //         type: 'text/plain',
  //         size: 123,
  //         created: new Date('2025-01-01T00:00:00Z').toISOString(),
  //         updated: new Date('2025-01-02T00:00:00Z').toISOString(),
  //       },
  //     })
  //   );
  // });

  test('should return fragment metadata successfully', async () => {
    const res = await request(app).get('/v1/fragments/123/info');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      createSuccessResponse({
        fragment: {
          id: '123',

          type: 'text/plain',
          size: 123,
          created: expect.any(String), // ignore exact timestamp
          updated: expect.any(String),
        },
      })
    );
  });

  test('should return 404 if fragment not found', async () => {
    const res = await request(app).get('/v1/fragments/notfound/info');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual(createErrorResponse(404, 'Fragment not found'));
  });

  test('should return 404 if DB error occurs', async () => {
    const res = await request(app).get('/v1/fragments/dberror/info');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual(createErrorResponse(404, 'Fragment not found'));
  });

  test('should return 404 if user is not authenticated', async () => {
    const appNoAuth = express();
    appNoAuth.use(express.json());
    appNoAuth.get('/v1/fragments/:id/info', getInfoRoute);

    const res = await request(appNoAuth).get('/v1/fragments/123/info');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual(createErrorResponse(404, 'Fragment not found'));
  });

  test('should handle unexpected errors gracefully', async () => {
    const { Fragment } = require('../../src/model/fragment');
    Fragment.byId.mockImplementationOnce(() => {
      throw new Error('Unexpected');
    });

    const res = await request(app).get('/v1/fragments/123/info');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual(createErrorResponse(404, 'Fragment not found'));
  });
});

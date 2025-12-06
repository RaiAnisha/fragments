// tests/unit/put.test.js
const request = require('supertest');
const express = require('express');
const putRoute = require('../../src/routes/api/put');
const { Fragment } = require('../../src/model/fragment');
const hash = require('../../src/hash');

// Mock response helpers
jest.mock('../../src/response', () => ({
  createErrorResponse: (status, message) => ({ status, error: message }),
  createSuccessResponse: (data) => ({ status: 'ok', data }),
}));

// Mock Fragment model
jest.mock('../../src/model/fragment');

describe('PUT /v1/fragments/:id', () => {
  let app;
  const testUser = { claims: { sub: 'user123' } };
  // eslint-disable-next-line no-unused-vars
  const ownerId = hash(JSON.stringify(testUser.claims));

  beforeEach(() => {
    app = express();
    app.use(express.json()); // parse JSON bodies
    // Mock req.user
    app.use((req, res, next) => {
      req.user = testUser;
      next();
    });
    app.put('/v1/fragments/:id', putRoute);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if fragment does not exist', async () => {
    Fragment.byId.mockResolvedValue(null);

    const res = await request(app)
      .put('/v1/fragments/nonexistent')
      .set('Content-Type', 'text/plain')
      .send('some text');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ status: 404, error: 'Fragment not found' });
  });

  it('should return 400 if Content-Type does not match', async () => {
    const mockFragment = { id: 'frag123', mimeType: 'text/plain', setData: jest.fn() };
    Fragment.byId.mockResolvedValue(mockFragment);

    const res = await request(app)
      .put('/v1/fragments/frag123')
      .set('Content-Type', 'text/html') // mismatch
      .send('some text');

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      status: 400,
      error: 'Content-Type mismatch. Fragment type is text/plain',
    });
  });

  // it('should update fragment successfully with string body', async () => {
  //   const mockFragment = { id: 'frag123', mimeType: 'text/plain', setData: jest.fn() };
  //   Fragment.byId.mockResolvedValue(mockFragment);

  //   const res = await request(app)
  //     .put('/v1/fragments/frag123')
  //     .set('Content-Type', 'text/plain')
  //     .send('updated content');

  //   expect(mockFragment.setData).toHaveBeenCalledWith(Buffer.from('updated content'));
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toEqual({
  //     status: 'ok',
  //     data: expect.objectContaining({
  //       fragment: expect.objectContaining({ id: 'frag123', mimeType: 'text/plain' }),
  //     }),
  //   });
  // });

  it('should update fragment successfully with JSON body', async () => {
    const mockFragment = { id: 'frag123', mimeType: 'application/json', setData: jest.fn() };
    Fragment.byId.mockResolvedValue(mockFragment);

    const jsonBody = { key: 'value' };

    const res = await request(app)
      .put('/v1/fragments/frag123')
      .set('Content-Type', 'application/json')
      .send(jsonBody);

    expect(mockFragment.setData).toHaveBeenCalledWith(Buffer.from(JSON.stringify(jsonBody)));
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      data: expect.objectContaining({
        fragment: expect.objectContaining({ id: 'frag123', mimeType: 'application/json' }),
      }),
    });
  });

  it('should return 400 if body is invalid', async () => {
    const mockFragment = { id: 'frag123', mimeType: 'text/plain', setData: jest.fn() };
    Fragment.byId.mockResolvedValue(mockFragment);

    const res = await request(app)
      .put('/v1/fragments/frag123')
      .set('Content-Type', 'text/plain')
      .send(null); // invalid

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ status: 400, error: 'Invalid body data' });
  });

  it('should return 500 on unexpected error', async () => {
    Fragment.byId.mockImplementation(() => {
      throw new Error('DB error');
    });

    const res = await request(app)
      .put('/v1/fragments/frag123')
      .set('Content-Type', 'text/plain')
      .send('text');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ status: 500, error: 'Internal Server Error' });
  });
});

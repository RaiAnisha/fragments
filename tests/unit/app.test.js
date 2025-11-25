// // tests/unit/app.test.js
// const { describe, test, expect, beforeEach } = require('@jest/globals');
// const request = require('supertest');

// let app;

// const VALID_TOKEN = 'Bearer test-token-123';

// describe('Fragments API Integration Tests', () => {
//   beforeEach(() => {
//     jest.resetModules();
//     app = require('../../src/app');
//   });

//   // ------------------------------------------------------------
//   // GET /v1/fragments
//   // ------------------------------------------------------------
//   test('GET /v1/fragments returns status ok', async () => {
//     const res = await request(app).get('/v1/fragments').set('Authorization', VALID_TOKEN);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.status).toBe('ok');
//     expect(Array.isArray(res.body.fragments)).toBe(true);
//   });

//   // ------------------------------------------------------------
//   // POST /v1/fragments
//   // ------------------------------------------------------------
//   test('POST /v1/fragments creates a fragment', async () => {
//     const res = await request(app)
//       .post('/v1/fragments')
//       .set('Authorization', VALID_TOKEN)
//       .set('Content-Type', 'text/plain')
//       .send('hello fragment');

//     expect(res.statusCode).toBe(201);
//     expect(res.body.status).toBe('ok');

//     const metadata = res.body.fragment;
//     expect(metadata).toHaveProperty('id');
//     expect(metadata).toHaveProperty('ownerId');
//     expect(metadata).toHaveProperty('type', 'text/plain');
//     expect(metadata).toHaveProperty('created');
//     expect(metadata).toHaveProperty('updated');
//   });

//   // ------------------------------------------------------------
//   // GET /v1/fragments/:id/info
//   // ------------------------------------------------------------
//   test('GET /v1/fragments/:id/info returns metadata', async () => {
//     const createRes = await request(app)
//       .post('/v1/fragments')
//       .set('Authorization', VALID_TOKEN)
//       .set('Content-Type', 'text/plain')
//       .send('hello world');

//     const id = createRes.body.fragment.id;

//     const res = await request(app)
//       .get(`/v1/fragments/${id}/info`)
//       .set('Authorization', VALID_TOKEN);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.status).toBe('ok');
//     expect(res.body.fragment.id).toBe(id);
//   });

//   // ------------------------------------------------------------
//   // GET /v1/fragments/:id (raw data)
//   // ------------------------------------------------------------
//   test('GET /v1/fragments/:id returns raw data', async () => {
//     const createRes = await request(app)
//       .post('/v1/fragments')
//       .set('Authorization', VALID_TOKEN)
//       .set('Content-Type', 'text/plain')
//       .send('rawdata');

//     const id = createRes.body.fragment.id;

//     const res = await request(app).get(`/v1/fragments/${id}`).set('Authorization', VALID_TOKEN);

//     expect(res.statusCode).toBe(200);
//     expect(res.text).toBe('rawdata');
//     expect(res.headers['content-type']).toMatch(/text\/plain/);
//   });

//   // ------------------------------------------------------------
//   // PUT /v1/fragments/:id
//   // ------------------------------------------------------------
//   test('PUT /v1/fragments/:id updates the fragment', async () => {
//     const createRes = await request(app)
//       .post('/v1/fragments')
//       .set('Authorization', VALID_TOKEN)
//       .set('Content-Type', 'text/plain')
//       .send('old');

//     const id = createRes.body.fragment.id;

//     const updateRes = await request(app)
//       .put(`/v1/fragments/${id}`)
//       .set('Authorization', VALID_TOKEN)
//       .set('Content-Type', 'text/plain')
//       .send('new-value');

//     expect(updateRes.statusCode).toBe(200);
//     expect(updateRes.body.status).toBe('ok');

//     const getRes = await request(app).get(`/v1/fragments/${id}`).set('Authorization', VALID_TOKEN);

//     expect(getRes.text).toBe('new-value');
//   });

//   // ------------------------------------------------------------
//   // DELETE /v1/fragments/:id
//   // ------------------------------------------------------------
//   test('DELETE /v1/fragments/:id deletes fragment', async () => {
//     const createRes = await request(app)
//       .post('/v1/fragments')
//       .set('Authorization', VALID_TOKEN)
//       .set('Content-Type', 'text/plain')
//       .send('delete me');

//     const id = createRes.body.fragment.id;

//     const delRes = await request(app)
//       .delete(`/v1/fragments/${id}`)
//       .set('Authorization', VALID_TOKEN);

//     expect(delRes.statusCode).toBe(200);
//     expect(delRes.body.status).toBe('ok');

//     const res = await request(app).get(`/v1/fragments/${id}`).set('Authorization', VALID_TOKEN);

//     expect(res.status).toBe(404);
//     expect(res.body.status).toBe('error');
//     expect(res.body.error.code).toBe(404);
//   });

//   // ------------------------------------------------------------
//   // Unauthorized
//   // ------------------------------------------------------------
//   test('Requests without Authorization return 401 error', async () => {
//     const res = await request(app).get('/v1/fragments');

//     expect(res.status).toBe(401);
//     expect(res.body.status).toBe('error');
//     expect(res.body.error.code).toBe(401);
//   });
// });

// tests/unit/app.test.js
const request = require('supertest');
const app = require('../../src/app'); // adjust path if needed

describe('Express App', () => {
  test('GET / should return 200 and app info', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');

    // adjust to match actual response structure
    expect(res.body).toHaveProperty('author');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('githubUrl');
  });

  test('GET /nonexistent should return 404', async () => {
    const res = await request(app).get('/nonexistent');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body.error).toHaveProperty('code', 404);
    expect(res.body.error).toHaveProperty('message', 'not found');
  });
});

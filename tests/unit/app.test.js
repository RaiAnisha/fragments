// tests/unit/app.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('App 404 handler', () => {
  test('should return 404 JSON error for unknown routes', async () => {
    const res = await request(app).get('/v1/does-not-exist').auth('user1@email.com', 'password1'); // pass valid credentials

    // The server should respond with 404
    expect(res.statusCode).toBe(404);

    // Body has the correct structure?
    expect(res.body).toEqual({
      status: 'error',
      error: {
        message: 'not found',
        code: 404,
      },
    });
  });
});

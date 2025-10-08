// // tests/unit/post.test.js
// const express = require('express');
// const request = require('supertest');

// describe('POST /v1/fragments handler', () => {
//   let app;
//   let mockWriteFragment, mockWriteFragmentData;
//   let mockInfo, mockWarn, mockError, mockDebug;
//   let mockFragmentConstructor, mockIsSupportedType;

//   beforeEach(() => {
//     jest.resetModules();

//     // --- Mock logger ---
//     mockInfo = jest.fn();
//     mockWarn = jest.fn();
//     mockError = jest.fn();
//     mockDebug = jest.fn();
//     jest.doMock('../../src/logger', () => ({
//       info: mockInfo,
//       warn: mockWarn,
//       error: mockError,
//       debug: mockDebug,
//     }));

//     // --- Mock Fragment ---
//     const fragmentInstance = { id: '12345', ownerId: 'user-1', type: 'text/plain', size: 11 };
//     mockFragmentConstructor = jest.fn(() => fragmentInstance);
//     mockIsSupportedType = jest.fn((type) => type === 'text/plain');

//     jest.doMock('../../src/model/fragment', () => ({
//       Fragment: mockFragmentConstructor,
//       isSupportedType: mockIsSupportedType,
//     }));

//     // --- Mock data writers ---
//     mockWriteFragment = jest.fn();
//     mockWriteFragmentData = jest.fn();
//     jest.doMock('../../src/model/data/memory', () => ({
//       writeFragment: mockWriteFragment,
//       writeFragmentData: mockWriteFragmentData,
//     }));

//     // --- Import route after mocks ---
//     const postRoute = require('../../src/routes/api/post');

//     app = express();
//     app.use(express.json());

//     // Fake auth middleware
//     app.use((req, res, next) => {
//       req.user = { id: 'user-1', claims: { sub: 'user-1' } };
//       next();
//     });

//     app.post('/v1/fragments', postRoute);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   test('should create a fragment with valid data', async () => {
//     const res = await request(app)
//       .post('/v1/fragments')
//       .send({ type: 'text/plain', data: 'Hello world' });

//     expect(res.statusCode).toBe(201);
//     expect(res.body).toHaveProperty('id', '12345');
//     expect(res.body).toHaveProperty('type', 'text/plain');
//     expect(mockFragmentConstructor).toHaveBeenCalledWith({
//       ownerId: 'user-1',
//       type: 'text/plain',
//       size: 11,
//     });
//     expect(mockWriteFragment).toHaveBeenCalled();
//     expect(mockWriteFragmentData).toHaveBeenCalled();
//     expect(mockInfo).toHaveBeenCalledWith(expect.stringContaining('Creating new fragment'));
//   });

//   test('should return 415 for unsupported type', async () => {
//     const res = await request(app)
//       .post('/v1/fragments')
//       .send({ type: 'application/json', data: 'Hello world' });

//     expect(res.statusCode).toBe(415);
//     expect(res.body).toHaveProperty('error');
//     expect(mockWarn).toHaveBeenCalledWith('Unsupported content type: application/json');
//   });

//   test('should return 400 for missing content', async () => {
//     const res = await request(app).post('/v1/fragments').send({ type: 'text/plain' }); // missing `data`

//     expect(res.statusCode).toBe(400);
//     expect(res.body).toHaveProperty('error');
//     expect(mockWarn).toHaveBeenCalledWith('Invalid or missing content');
//   });

//   test('should handle internal errors gracefully', async () => {
//     // simulate writeFragment throwing
//     mockWriteFragment.mockImplementationOnce(() => {
//       throw new Error('DB failure');
//     });

//     const res = await request(app)
//       .post('/v1/fragments')
//       .send({ type: 'text/plain', data: 'Hello world' });

//     expect(res.statusCode).toBe(500);
//     expect(res.body).toHaveProperty('error', 'Internal Server Error');
//     expect(mockError).toHaveBeenCalledWith(expect.stringContaining('Error creating fragment'));
//   });
// });

// tests/unit/post.test.js
const express = require('express');
const request = require('supertest');

describe('POST /v1/fragments handler', () => {
  let app;
  let mockWriteFragment, mockWriteFragmentData;
  let mockInfo, mockWarn, mockError, mockDebug;

  beforeEach(() => {
    jest.resetModules();

    // --- Mock logger ---
    mockInfo = jest.fn();
    mockWarn = jest.fn();
    mockError = jest.fn();
    mockDebug = jest.fn();
    jest.doMock('../../src/logger', () => ({
      info: mockInfo,
      warn: mockWarn,
      error: mockError,
      debug: mockDebug,
    }));

    // --- Mock Fragment class ---
    jest.doMock('../../src/model/fragment', () => {
      class Fragment {
        constructor({ ownerId, type, size }) {
          this.id = '12345';
          this.ownerId = ownerId;
          this.type = type;
          this.size = size;
        }
        static isSupportedType(type) {
          return type === 'text/plain';
        }
      }
      return { Fragment };
    });

    // --- Mock data writers ---
    mockWriteFragment = jest.fn();
    mockWriteFragmentData = jest.fn();
    jest.doMock('../../src/model/data/memory', () => ({
      writeFragment: mockWriteFragment,
      writeFragmentData: mockWriteFragmentData,
    }));

    // --- Import route after mocks ---
    const postRoute = require('../../src/routes/api/post');

    app = express();
    app.use(express.json());

    // Fake auth middleware
    app.use((req, res, next) => {
      req.user = { id: 'user-1', claims: { sub: 'user-1' } };
      next();
    });

    app.post('/v1/fragments', postRoute);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a fragment with valid data', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send({ type: 'text/plain', data: 'Hello world' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id', '12345');
    expect(res.body).toHaveProperty('type', 'text/plain');
    expect(mockWriteFragment).toHaveBeenCalled();
    expect(mockWriteFragmentData).toHaveBeenCalled();
    expect(mockInfo).toHaveBeenCalledWith(expect.stringContaining('Creating new fragment'));
  });

  test('should return 415 for unsupported type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send({ type: 'application/json', data: 'Hello world' });

    expect(res.statusCode).toBe(415);
    expect(res.body).toHaveProperty('error');
    expect(mockWarn).toHaveBeenCalledWith('Unsupported content type: application/json');
  });

  test('should return 400 for missing content', async () => {
    const res = await request(app).post('/v1/fragments').send({ type: 'text/plain' }); // missing `data`

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(mockWarn).toHaveBeenCalledWith('Invalid or missing content');
  });

  test('should handle internal errors gracefully', async () => {
    // simulate writeFragment throwing
    mockWriteFragment.mockImplementationOnce(() => {
      throw new Error('DB failure');
    });

    const res = await request(app)
      .post('/v1/fragments')
      .send({ type: 'text/plain', data: 'Hello world' });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('Error creating fragment'));
  });
});

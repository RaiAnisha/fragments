// src/routes/index.js
const { authenticate } = require('../auth');
const express = require('express');
const contentType = require('content-type');
const { createSuccessResponse } = require('../response');
const { version, author } = require('../../package.json');
const { Fragment } = require('../model/fragment');

const postRoute = require('./api/post');
const getRoute = require('./api/get');
const getByIdRoute = require('./api/getById');
const getInfo = require('./api/getInfo');
const deleteByIdRoute = require('./api/deleteById');

const router = express.Router();
const api = require('./api');
router.use('/v1', api);

// Health check
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl: 'https://github.com/RaiAnisha/fragments',
      version,
    })
  );
});

// Raw body parser (reusable)
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      } catch {
        return false;
      }
    },
  });

// GET /v1/fragments
router.get('/fragments', authenticate('bearer'), getRoute);
// POST /v1/fragments
router.post('/fragments', authenticate(), rawBody(), postRoute);
// GET fragment by ID
router.get('/fragments/:id', authenticate('bearer'), getByIdRoute);
// GET /v1/fragments/:id/info → retrieve metadata for a fragment
router.get('/fragments/:id/info', authenticate('bearer'), getInfo);
// GET /v1/fragments/:id.:ext  -> works inside :id only!
// DELETE /v1/fragments/:id  → delete a fragment and its data
router.delete('/fragments/:id', authenticate('bearer'), deleteByIdRoute);

module.exports = router;

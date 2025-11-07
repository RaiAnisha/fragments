// // src/routes/api/index.js
// const express = require('express');
// const router = express.Router();
// const { createFragment } = require('./post'); // helper function

// router.post('/v1/fragments', async (req, res) => {
//   try {
//     const ownerId = req.user.claims.sub; // authenticated user
//     const fragment = await createFragment(ownerId, req.body.type, req.body.data);
//     res.status(201).json({ fragment });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// module.exports = router;

// src/routes/api/index.js

const express = require('express');
const passport = require('passport');

const router = express.Router();

// Import all route handlers
const get = require('./get');
const post = require('./post');
//const getById = require('./getById');
//const getInfo = require('./getInfo');
//const getByExt = require('./getByExt');

router.use((req, res, next) => {
  console.log('Router hit:', req.method, req.url, req.params);
  next();
});

// Apply authentication to all /v1/fragments routes
router.use(passport.authenticate('bearer', { session: false }));

// POST /v1/fragments → create a new fragment
router.post('/fragments', post);

// GET /v1/fragments → list all fragments (use ?expand=1 for full metadata)
router.get('/fragments', get);

// GET /v1/fragments/:id → retrieve raw fragment data
// console.log('going in for id');
// router.get('/fragments/:id', getById);
// console.log('out of id');

// GET /v1/fragments/:id/info → retrieve metadata for a fragment
//router.get('/fragments/:id/info', getInfo);

// GET /v1/fragments/:id.ext → retrieve or convert a fragment (e.g., .md → .html)
//router.get('/fragments/:id.:ext', getByExt);

module.exports = router;

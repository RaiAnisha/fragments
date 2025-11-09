// src/routes/api/index.js
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

// const express = require('express');
// const passport = require('passport');

// const router = express.Router();

// // Import all route handlers
// const get = require('./get');
// const post = require('./post');

// // Apply authentication to all /v1/fragments routes
// router.use(passport.authenticate('bearer', { session: false }));

// // POST /v1/fragments → create a new fragment
// router.post('/fragments', post);

// // GET /v1/fragments → list all fragments (use ?expand=1 for full metadata)
// router.get('/fragments', get);

// module.exports = router;

//********************
// src/routes/api/index.js
const express = require('express');
const router = express.Router();

// Only export handlers for fragments
router.get('/fragments', require('./get'));
router.post('/fragments', require('./post'));

module.exports = router;

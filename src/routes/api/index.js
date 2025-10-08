// // // src/routes/api/index.js

// // /**
// //  * The main entry-point for the v1 version of the fragments API.
// //  */
// // const express = require('express');

// // // Create a router on which to mount our API endpoints
// // const router = express.Router();

// // // Define our first route, which will be: GET /v1/fragments
// // router.get('/fragments', require('./get'));
// // // Other routes (POST, DELETE, etc.) will go here later on...

// // module.exports = router;

// // src/routes/api/index.js

// /**
//  * The main entry-point for the v1 version of the fragments API.
//  */
// const express = require('express');
// const { writeFragment, listFragments } = require('../../model/fragment');
// const { authenticate } = require('../../auth');

// const router = express.Router();

// // GET /v1/fragments
// router.get('/fragments', require('./get'));

// // POST /v1/fragments
// router.post('/fragments', authenticate(), async (req, res) => {
//   const user = req.user;
//   const { content } = req.body;

//   if (!content || content.trim() === '') {
//     return res.status(400).json({ status: 'error', error: 'Fragment content is required' });
//   }

//   try {
//     // Save the new fragment
//     const newFragment = await writeFragment(user.email, content);

//     // Fetch updated list of full fragment objects
//     const fragments = await listFragments(user.email, true);

//     res.status(201).json({ status: 'ok', fragment: newFragment, fragments });
//   } catch (err) {
//     console.error('Error creating fragment:', err);
//     res.status(500).json({ status: 'error', error: err.message });
//   }
// });

// module.exports = router;

// routes/api/index.js
const express = require('express');
const router = express.Router();
const { createFragment } = require('./post'); // helper function

router.post('/v1/fragments', async (req, res) => {
  try {
    const ownerId = req.user.claims.sub; // authenticated user
    const fragment = await createFragment(ownerId, req.body.type, req.body.data);
    res.status(201).json({ fragment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

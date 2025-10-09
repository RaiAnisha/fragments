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

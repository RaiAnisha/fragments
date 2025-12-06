// src/routes/api/get.js - final
const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const hash = require('../../hash');

module.exports = async (req, res) => {
  try {
    const expand = req.query.expand === '1';
    //const fragments = await Fragment.byUser(req.user.claims.sub, expand);
    const ownerId = hash(JSON.stringify(req.user?.claims)); //JSON.stringify( neww
    const fragments = await Fragment.byUser(ownerId, expand);
    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    console.error('Error fetching fragments:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

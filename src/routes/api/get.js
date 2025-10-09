//src/routes/api/get.js

const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    // check query param: /v1/fragments?expand=1
    //const expand = req.query.expand === '1';

    // get fragments for this user
    const fragments = await Fragment.byUser(req.user.claims.sub, true);

    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    console.error('Error fetching fragments:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// // src/routes/api/get.js

// /**
//  * Get a list of fragments for the current user
//  */
// module.exports = (req, res) => {
//   // TODO: this is just a placeholder. To get something working, return an empty array...
//   res.status(200).json({
//     status: 'ok',
//     // TODO: change me
//     fragments: [],
//   });
// };

// const { createSuccessResponse } = require('../../response');

// /**
//  * Get a list of fragments for the current user
//  */
// module.exports = (req, res) => {
//   // Replace placeholder response with helper function
//   res.status(200).json(createSuccessResponse({ fragments: [] }));
// };

const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    // const ownerId = req.user?.email;
    // if (!ownerId) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    // check query param: /v1/fragments?expand=1
    const expand = req.query.expand === '1';

    // get fragments for this user
    const fragments = await Fragment.byUser(req.user.claims.sub, expand); ///HEELOO

    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    console.error('Error fetching fragments:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

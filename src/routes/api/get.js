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


const { createSuccessResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  // Replace placeholder response with helper function
  res.status(200).json(createSuccessResponse({ fragments: [] }));
};

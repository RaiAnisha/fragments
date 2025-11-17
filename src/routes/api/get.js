//src/routes/api/get.js

// const { createSuccessResponse } = require('../../response');
// const { Fragment } = require('../../model/fragment');

// /**
//  * Get a list of fragments for the current user
//  */
// module.exports = async (req, res) => {
//   try {
//     // check query param: /v1/fragments?expand=1
//     //const expand = req.query.expand === '1';

//     // get fragments for this user
//     const fragments = await Fragment.byUser(req.user.claims.sub, true);

//     res.status(200).json(createSuccessResponse({ fragments }));
//   } catch (err) {
//     console.error('Error fetching fragments:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

//the below works!
// const { createSuccessResponse } = require('../../response');
// const { Fragment } = require('../../model/fragment');
// const { readFragmentData } = require('../../model/data/memory'); // get fragment content

// /**
//  * Get a list of fragments for the current user
//  */
// module.exports = async (req, res) => {
//   try {
//     // get fragments for this user
//     const fragmentList = await Fragment.byUser(req.user.claims.sub, true); // returns Fragment objects

//     // build full fragment objects with size
//     const fragments = await Promise.all(
//       fragmentList.map(async (frag) => {
//         const dataBuffer = await readFragmentData(req.user.claims.sub, frag.id);
//         return {
//           id: frag.id,
//           type: frag.type,
//           size: dataBuffer ? dataBuffer.length : 0,
//           created: frag.created,
//         };
//       })
//     );

//     res.status(200).json(createSuccessResponse({ fragments }));
//   } catch (err) {
//     console.error('Error fetching fragments:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// src/routes/api/get.js - final
const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const expand = req.query.expand === '1';
    //const fragments = await Fragment.byUser(req.user.claims.sub, expand);
    const fragments = await Fragment.byUser(req.user.id, expand);
    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    console.error('Error fetching fragments:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// // src/routes/api/getInfo.js
// const { Fragment } = require('../../model/fragment');
// const { createSuccessResponse, createErrorResponse } = require('../../response');

// module.exports = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const ownerId = req.user.claims.sub;

//     const fragment = await Fragment.byId(ownerId, id);

//     // Return metadata object (not the Buffer)
//     const meta = {
//       id: fragment.id,
//       ownerId: fragment.ownerId,
//       type: fragment.type,
//       size: fragment.size,
//       created: fragment.created,
//       updated: fragment.updated,
//     };

//     return res.status(200).json(createSuccessResponse(meta));
//   } catch (err) {
//     console.error('Error fetching fragment info:', err);
//     return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
//   }
// };

// src/routes/api/getInfo.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.claims.sub;

    const fragment = await Fragment.byId(ownerId, id);

    // Wrap metadata under "fragment"
    const meta = {
      fragment: {
        id: fragment.id,
        ownerId: fragment.ownerId,
        type: fragment.type,
        size: fragment.size,
        created: fragment.created,
        updated: fragment.updated,
      },
    };

    return res.status(200).json(createSuccessResponse(meta));
  } catch (err) {
    console.error('Error fetching fragment info:', err);
    return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};

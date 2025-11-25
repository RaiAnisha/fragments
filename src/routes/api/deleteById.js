// src/routes/api/deleteById.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const hash = require('../../hash');

module.exports = async (req, res) => {
  try {
    const ownerId = hash(JSON.stringify(req.user?.claims)); //JSON.stringify( neww

    if (!ownerId) {
      return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
    }

    const { id } = req.params;

    // Try to load the fragment so we can confirm it exists
    const fragment = await Fragment.byId(ownerId, id).catch(() => null);

    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Delete both metadata and data
    await Fragment.delete(ownerId, id);

    return res.status(200).json(
      createSuccessResponse({
        status: 'ok',
        message: `Fragment ${id} deleted successfully`,
      })
    );
  } catch (err) {
    console.error('Error deleting fragment:', err);
    return res.status(500).json(createErrorResponse(500, 'Unable to delete fragment'));
  }
};

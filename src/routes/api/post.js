// src/routes/api/post.js

//const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const { writeFragment, writeFragmentData } = require('../../model/data/memory');
const logger = require('../../logger'); // if you have a logger helper, otherwise use console

//const express = require('express');
//const { Fragment } = require('../model/fragment');

/**
 * Handle POST /v1/fragments
 */
module.exports = async (req, res) => {
  const ownerId = req.user.id;
  //const { type: fragmentType, data: content } = req.body || {};
  const fragmentType = req.get('Content-Type'); // get type from HTTP header
  const content = req.body.data; // only content comes from client

  console.log('req.user:', req.user); //debugging
  console.log('req.body:', req.body);

  try {
    // Expect JSON body: { type: 'text/plain', content: '...' }

    console.log('Received type:', fragmentType); //debugging
    console.log('Received content:', content);

    // type is supported?
    if (!fragmentType || !Fragment.isSupportedType(fragmentType)) {
      logger.warn(`Unsupported content type: ${fragmentType}`);
      return res.status(415).json({ error: `Unsupported Media Type: ${fragmentType}` });
    }

    if (!content) {
      logger.warn('Invalid or missing content');
      return res.status(400).json({ error: 'Invalid or missing content' });
    }

    const buffer = Buffer.from(content, 'utf-8');

    // Create new fragment
    const fragment = new Fragment({
      ownerId: req.user.claims.sub,
      type: fragmentType,
      size: buffer.length,
    });
    console.log('req.user:', req.user); // debugging
    console.log('req.body:', req.body);

    logger.info(`Creating new fragment: ${fragment.id} for user ${ownerId}`);

    await writeFragment(fragment);
    await writeFragmentData(req.user.claims.sub, fragment.id, buffer);

    const baseUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`;
    res.set('Location', `${baseUrl}/v1/fragments/${fragment.id}`);

    logger.debug(`Fragment created with id ${fragment.id}`);

    return res.status(201).json(fragment);
  } catch (err) {
    logger.error(`Error creating fragment: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

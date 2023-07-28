const express = require('express');
const router = express.Router();  // Create a router instead of an app

router.get('/:contractAddress/:tokenId', async (req, res) => {
    const { contractAddress, tokenId } = req.params;
  
    // Initialize the Reservoir SDK (replace this with the actual way to do it)
    const sdk = require('api')('@reservoirprotocol/v3.0#9eilkbbprl8');
    sdk.auth('55554724-8307-5261-a6c4-31b2f38c708c');
  
    try {
      const response = await sdk.getTokensV6({
        tokens: [`${contractAddress}:${tokenId}`],
        limit: 1,
        includeAttributes: true,
      });
  
      // Get image url from response data
      const token = response.data.tokens[0];
      const imageUrl = token && token.token ? token.token.image : null;
  
      res.send({ ...response.data, imageUrl });
    } catch (err) {
      console.error('Failed to fetch metadata from Reservoir:', err);
      res.status(500).send({ error: 'Failed to fetch metadata from Reservoir' });
    }
  });

module.exports = router;  // Export the router

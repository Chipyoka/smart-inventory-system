// routes/externalLookup.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// @route   GET /api/external-lookup/:barcode
// @desc    Look up product by barcode from barcode-list.com
// @access  Public or Authenticated (your choice)
router.get('/:barcode', async (req, res) => {
  const { barcode } = req.params;

  try {
    const url = `https://barcode-list.com/barcode/EN/barcode-${barcode}/Search.htm`;
    const response = await axios.get(url);

    const $ = cheerio.load(response.data);
    const title = $('title').text().replace(' | Barcode List', '').trim();

    res.json({ name: title || '' });
  } catch (error) {
    console.error('External lookup failed:', error.message);
    res.status(500).json({ message: 'External lookup failed' });
  }
});

module.exports = router;

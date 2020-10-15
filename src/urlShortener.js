//URL Shortener Functions
const express = require('express');
const router = express.Router();

const Url = require('../models/UrlModel');

// @route   GET /:code
// @desc    Redirect to long/original URL
router.get('/:code', async (req, res) => {
  try {
    const url = await Url.findOne({ urlCode: req.params.code });

    if (url) {
      return res.redirect(url.longUrl);
    } else {
      return res.status(404).json('No URL found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

router.post('/shorten', async (req, res) => {
  // async function createShortUrl(req, res) {
  const { longUrl } = req.body;

  const baseUrl = config.get('baseUrl');

  // Check base URL
  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).json('Invalid Base URL');
  }

  // Create URL code
  const urlCode = shortid.generate();

  // Check long URL
  if (validUrl.isUri(longUrl)) {
    try {
      let url_req = await url.findOne({ longUrl });
      if (url_req) {
        res.json(url_req);
      } else {
        const shortUrl = baseUrl + '/' + urlCode;

        // Save to MongoDB
        url_req = new UrlModel({
          longUrl,
          shortUrl,
          urlCode,
          date: new Date(),
        });

        await url_req.save(); // Save the URL to database
      }
    } catch (err) {
      console.err(err);
      res.status(500).json('Server error occured');
    }
  } else {
    res.status(401).json('Invalid long URL');
  }
});

module.exports = router;

const bodyParser = require('body-parser');
const express = require('express');
const { bottender } = require('bottender');

const app = bottender({
  dev: process.env.NODE_ENV !== 'production',
});

const port = Number(process.env.PORT) || 8000;

// The request handler of bottender
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(
    bodyParser.json({
      verify: (req, _, buf) => {
        req.rawBody = buf.toString();
      },
    })
  );

  // Custom route
  server.get('/api', (req, res) => {
    res.json({ ok: true });
  });

  // Route for webhook request
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`Running on http://localhost: ${port}`);
  });

  // // For URL Shortener
  // const connectDB = require('./config/db');

  // connectDB();

  // server.use(express.json({ extended: false }));

  // server.use('/', require('./src/api'));
  // server.use('/api/url', require('./src/url'));
});

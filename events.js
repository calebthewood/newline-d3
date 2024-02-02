"use strict";
/** Simple demo Express app. */

const express = require("express")
const app = express();

/** Homepage renders simple message. */

app.get("/", function (req, res) {
  return res.sendFile('/05-animations-lines/index.html')
});

app.get('/file/:name', (req, res, next) => {
  const options = {
    root: path.join(__dirname, 'public'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }

app.listen(3000, function () {
  console.log("Started http://localhost:3000/");
});
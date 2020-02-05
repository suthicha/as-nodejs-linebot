const path = require("path");
const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.urlencoded({ limit: "1mb", extended: false }));
app.use(bodyParser.json({ limit: "1mb" }));

app.use("/webhook", (req, res) => {
  // let reply_token = req.body.events[0].replyToken;
  console.log(req.body);
  res.status(200).json({});
});

module.exports = app;

const path = require("path");
const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const fs = require("fs");
const config = require("config");
const mssql = require("mssql");
const auth = require("./middleware/check-auth");

const {
  addMessageImageObject,
  addMessageTextObject,
  downloadImage
} = require("./controllers/message-object");

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.urlencoded({ limit: "1mb", extended: false }));
app.use(bodyParser.json({ limit: "1mb" }));

app.use("/webhook", auth.checkAuth, async (req, res) => {
  const { messages } = req.body;

  if (messages.hasOwnProperty("message")) {
    if (messages.message["type"] === "image") {
      try {
        const filePath = await downloadImage(messages.message["id"]);
        await addMessageImageObject(req.body, filePath);
      } catch {}
    } else {
      try {
        await addMessageTextObject(req.body);
      } catch {}
    }
  }
  res.sendStatus(200);
});

module.exports = app;

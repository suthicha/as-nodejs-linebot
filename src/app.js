const path = require("path");
const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const config = require("config");
const webhookRouter = require("./routes/webhook-route");
const messageObjRouter = require("./routes/message-object-route");

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.urlencoded({ limit: "1mb", extended: false }));
app.use(bodyParser.json({ limit: "1mb" }));
app.use("/upload", express.static(path.join(process.cwd(), "upload")));

app.use("/webhook", webhookRouter);
app.use("/messages", messageObjRouter);

app.use((req, res, next) => {
  const error = new Error("NOT FOUND ROUTING");
  error.status = 400;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: "INVARID_ROUTE",
    error_description: "NOT FOUND ROUTING"
  });
});

module.exports = app;

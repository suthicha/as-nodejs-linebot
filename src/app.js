const path = require("path");
const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const line = require("@line/bot-sdk");
const fs = require("fs");
const config = require("config");
const mssql = require("mssql");
const { LineClient } = require("messaging-api-line");

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.urlencoded({ limit: "1mb", extended: false }));
app.use(bodyParser.json({ limit: "1mb" }));

// get accessToken and channelSecret from LINE developers website
const client = LineClient.connect(config.ACCESS_TOKEN, config.CHANNEL_SECRET);

app.use("/webhook", async (req, res) => {
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

const downloadImage = async id => {
  return new Promise(async (resolve, reject) => {
    const messageId = id + ".png";
    const fileName = "/upload/" + messageId;
    await client.retrieveMessageContent(id).then(buffer => {
      fs.writeFile(process.cwd() + fileName, buffer, err => {
        if (err) throw err;
        resolve(fileName);
      });
    });
  });
};

const addMessageImageObject = async (data, url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { replyToken, messages } = data;

      let pool = new mssql.ConnectionPool(config.CONNECTION);
      await pool
        .connect()
        .then(() => {
          let req = new mssql.Request(pool);
          req
            .input("ReplyToken", replyToken)
            .input("MessageType", messages["type"])
            .input("MessageReplyToken", messages["replyToken"])
            .input("MessageSourceType", messages["source"].type)
            .input("MessageSourceUserId", messages["source"].userId)
            .input("MessageMode", messages["mode"])
            .input("MessageContentType", messages["message"].type)
            .input("MessageContentId", messages["message"].id)
            .input("MessageContentText", "")
            .input(
              "MessageContentProviderType",
              messages["message"].contentProvider["type"]
            )
            .input("ImageOriginalUrl", url)
            .execute("SP_AddMessageObject")
            .then(result => {
              resolve(result);
            })
            .catch(error => reject(error));
        })
        .catch(connErr => reject(connErr));
    } catch (err) {
      reject(err);
    }
  });
};

const addMessageTextObject = async data => {
  return new Promise(async (resolve, reject) => {
    try {
      const { replyToken, messages } = data;

      let pool = new mssql.ConnectionPool(config.CONNECTION);
      await pool
        .connect()
        .then(() => {
          let req = new mssql.Request(pool);
          req
            .input("ReplyToken", replyToken)
            .input("MessageType", messages["type"])
            .input("MessageReplyToken", messages["replyToken"])
            .input("MessageSourceType", messages["source"].type)
            .input("MessageSourceUserId", messages["source"].userId)
            .input("MessageMode", messages["mode"])
            .input("MessageContentType", messages["message"].type)
            .input("MessageContentId", messages["message"].id)
            .input("MessageContentText", messages["message"].text)
            .input(
              "MessageContentProviderType",
              messages["message"].contentProvider["type"]
            )
            .input("ImageOriginalUrl", "")
            .execute("SP_AddMessageObject")
            .then(result => {
              resolve(result);
            })
            .catch(error => reject(error));
        })
        .catch(connErr => reject(connErr));
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = app;

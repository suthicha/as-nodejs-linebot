const mssql = require("mssql");
const config = require("config");
const fs = require("fs");
const camelcaseKeys = require("camelcase-keys");
const { LineClient } = require("messaging-api-line");

// get accessToken and channelSecret from LINE developers website
const client = LineClient.connect(config.ACCESS_TOKEN, config.CHANNEL_SECRET);

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
            .input("MessageContentProviderType", "")
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

const getMessageObject = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let pool = new mssql.ConnectionPool(config.CONNECTION);
      await pool
        .connect()
        .then(() => {
          let req = new mssql.Request(pool);
          req
            .execute("SP_SelMessageObject")
            .then(result => {
              resolve(result);
            })
            .catch(error => reject(error));
        })
        .catch(error => reject(error));
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  addMessageImageObject,
  addMessageTextObject,
  getMessageObject,
  downloadImage
};

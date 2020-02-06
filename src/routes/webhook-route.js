const express = require("express");
const auth = require("../middleware/check-auth");
const {
  addMessageImageObject,
  addMessageTextObject,
  addMessageFileObject,
  downloadImage,
  downloadFile
} = require("../controllers/message-object");

const router = express.Router();

router.post("/", auth.checkAuth, async (req, res) => {
  const { replyToken, messages } = req.body;

  if (messages.hasOwnProperty("message")) {
    const messageType = messages.message["type"];
    let filePath = "";
    if (messageType === "image") {
      try {
        filePath = await downloadImage(messages.message["id"]);
        await addMessageImageObject(req.body, filePath);
      } catch {}
    } else if (messageType === "file") {
      try {
        filePath = await downloadFile(messages.message);
        await addMessageFileObject(req.body, filePath);
      } catch {}
    } else {
      try {
        await addMessageTextObject(req.body);
      } catch {}
    }
  }
  res.sendStatus(200);
});

module.exports = router;

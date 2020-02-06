const express = require("express");
const auth = require("../middleware/check-auth");
const {
  addMessageImageObject,
  addMessageTextObject,
  downloadImage
} = require("../controllers/message-object");

const router = express.Router();

router.post("/", auth.checkAuth, async (req, res) => {
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

module.exports = router;

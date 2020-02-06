const express = require("express");
const config = require("config");
const auth = require("../middleware/check-auth");
const { getMessageObject } = require("../controllers/message-object");

const router = express.Router();

router.get("/", auth.checkAuth, async (req, res) => {
  try {
    console.log(req.host);
    const result = await getMessageObject();
    res.status(200).json({
      host: req.protocol + "://" + req.host + ":" + config.PORT,
      items: result["recordsets"][0]
    });
  } catch (err) {
    res.status(401).json({ error_message: err.message });
  }
});

module.exports = router;

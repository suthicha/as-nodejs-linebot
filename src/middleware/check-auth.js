const jwt = require("jsonwebtoken");
const config = require("config");

exports.checkAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", "");
    var decoded = jwt.verify(token, config.SECRET);

    if (decoded) {
      next();
    } else {
      res.status(401).json({ message: "Invalid Token" });
    }
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

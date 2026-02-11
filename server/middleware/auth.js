const { jwtVerify } = require("jose");
const secret = require("../utils/jwtSecret");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const { payload } = await jwtVerify(token, secret);
    req.user = payload;

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = auth;

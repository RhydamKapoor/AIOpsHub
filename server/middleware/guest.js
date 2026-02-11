const { jwtVerify } = require("jose");
const secret = require("../utils/jwtSecret");

const guest = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (token) {
      const { payload } = await jwtVerify(token, secret);

      if (payload) {
        return res.status(302).json({
          redirect: true,
          msg: "You are already logged in",
          redirectTo: "/",
        });
      }
    }

    next();
  } catch (err) {
    // Invalid token → allow guest access
    next();
  }
};

module.exports = guest;

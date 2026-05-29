const mongoose = require("mongoose");

/**
 * Normalize user id from JWT payload (string, ObjectId, or serialized buffer object).
 */
function resolveUserId(raw) {
  if (!raw) return null;
  if (typeof raw === "string") return raw;

  if (raw instanceof mongoose.Types.ObjectId) {
    return raw.toString();
  }

  if (raw.buffer && typeof raw.buffer === "object") {
    const bytes = Object.keys(raw.buffer)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => raw.buffer[key]);
    return Buffer.from(bytes).toString("hex");
  }

  if (typeof raw.toString === "function") {
    const asString = raw.toString();
    if (/^[a-f\d]{24}$/i.test(asString)) return asString;
  }

  try {
    return new mongoose.Types.ObjectId(raw).toString();
  } catch {
    return null;
  }
}

function getUserIdFromRequest(req) {
  return resolveUserId(req.user?.details?._id);
}

function userForToken(userWithoutPassword) {
  return {
    ...userWithoutPassword,
    _id: resolveUserId(userWithoutPassword._id),
  };
}

module.exports = { resolveUserId, getUserIdFromRequest, userForToken };

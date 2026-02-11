const secret = new TextEncoder().encode(process.env.JWT_SECRET);
module.exports = secret;
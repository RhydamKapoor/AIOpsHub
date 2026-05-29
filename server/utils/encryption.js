const crypto = require("crypto");
const algorithm = "aes-256-cbc";

function getKeyIv() {
  const keyB64 = process.env.AES_KEY;
  const ivB64 = process.env.AES_IV;
  if (!keyB64 || !ivB64) {
    throw new Error("AES_KEY and AES_IV must be set in server .env");
  }
  return {
    key: Buffer.from(keyB64, "base64"),
    iv: Buffer.from(ivB64, "base64"),
  };
}

function encrypt(text) {
  const { key, iv } = getKeyIv();
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(encryptedText) {
  const { key, iv } = getKeyIv();
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = { encrypt, decrypt };

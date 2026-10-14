/**
 * Generate a base32 TOTP secret for admin two-factor authentication.
 *
 * Usage:
 *   node scripts/generate-totp-secret.js
 *
 * Then:
 *   1. Set ADMIN_TOTP_SECRET=<printed secret> in your environment.
 *   2. Add the secret to your authenticator app manually (or paste the
 *      otpauth:// URL into a QR-code generator and scan it).
 */
const crypto = require("crypto");

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

const secret = base32Encode(crypto.randomBytes(20));
const issuer = "Radiotherapy Clinic";
const account = "admin";
const otpauth = `otpauth://totp/${encodeURIComponent(
  issuer
)}:${account}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

console.log("ADMIN_TOTP_SECRET=" + secret);
console.log("");
console.log("otpauth URL (paste into a QR generator to scan):");
console.log(otpauth);
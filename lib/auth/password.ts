import { randomBytes, scrypt, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Password hashing with scrypt from the Node standard library — no third-party
 * dependency, and no plaintext ever reaches the store.
 *
 * Format: `scrypt:<saltHex>:<keyHex>`
 */

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

export function hashPasswordSync(password: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const key = scryptSync(password, salt, KEY_LENGTH);
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

export function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => {
      if (error) reject(error);
      else resolve(`scrypt:${salt.toString("hex")}:${key.toString("hex")}`);
    });
  });
}

export function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return Promise.resolve(false);

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(keyHex, "hex");

  return new Promise((resolve, reject) => {
    scrypt(password, salt, expected.length, (error, key) => {
      if (error) reject(error);
      else resolve(key.length === expected.length && timingSafeEqual(key, expected));
    });
  });
}

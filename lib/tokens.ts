import { randomBytes, randomInt } from "node:crypto";

/**
 * Owner token: 32 random bytes, base64url. Treat like a password — anyone
 * holding it sees private budget data.
 */
export function generateOwnerToken(): string {
  return randomBytes(32).toString("base64url");
}

export function generateMemberToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Join code alphabet: human-readable, no ambiguous characters.
 * Excluded: 0/O, 1/I/L, 5/S, 8/B, 2/Z.
 */
export const JOIN_CODE_ALPHABET = "ACDEFGHJKMNPQRTUVWXY34679";
export const JOIN_CODE_LENGTH = 7;

export function generateJoinCode(length = JOIN_CODE_LENGTH): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += JOIN_CODE_ALPHABET[randomInt(JOIN_CODE_ALPHABET.length)];
  }
  return code;
}

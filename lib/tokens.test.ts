import { describe, expect, it } from "vitest";
import {
  JOIN_CODE_ALPHABET,
  JOIN_CODE_LENGTH,
  generateJoinCode,
  generateOwnerToken,
} from "./tokens";

describe("generateOwnerToken", () => {
  it("encodes at least 32 bytes of entropy as base64url", () => {
    const token = generateOwnerToken();
    // 32 bytes → 43 base64url chars, no padding
    expect(token.length).toBeGreaterThanOrEqual(43);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("never repeats", () => {
    const seen = new Set(Array.from({ length: 200 }, generateOwnerToken));
    expect(seen.size).toBe(200);
  });
});

describe("generateJoinCode", () => {
  it("uses only the unambiguous alphabet", () => {
    for (const banned of ["0", "O", "1", "I", "l", "L", "5", "S", "8", "B", "2", "Z"]) {
      expect(JOIN_CODE_ALPHABET).not.toContain(banned);
    }
    for (let i = 0; i < 100; i++) {
      const code = generateJoinCode();
      expect(code).toHaveLength(JOIN_CODE_LENGTH);
      for (const ch of code) {
        expect(JOIN_CODE_ALPHABET).toContain(ch);
      }
    }
  });

  it("is 6–8 chars per spec", () => {
    expect(JOIN_CODE_LENGTH).toBeGreaterThanOrEqual(6);
    expect(JOIN_CODE_LENGTH).toBeLessThanOrEqual(8);
  });
});

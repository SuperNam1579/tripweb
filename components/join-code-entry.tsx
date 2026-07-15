"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Enter a join code by hand → go to the matching join page. */
export function JoinCodeEntry() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean.length >= 6) router.push(`/join/${clean}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="joinCode" className="label">
          โค้ดเชิญ
        </label>
        <input
          id="joinCode"
          name="joinCode"
          required
          autoCapitalize="characters"
          maxLength={8}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="CMTRIP"
          className="field text-center"
          style={{ letterSpacing: ".22em", fontSize: 22, fontWeight: 600 }}
        />
      </div>
      <button type="submit" disabled={code.trim().length < 6} className="btn btn-cyan h-[54px] text-[18px]">
        เข้าลอบบี้ →
      </button>
    </form>
  );
}

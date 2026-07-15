import Link from "next/link";
import { Crewmate } from "@/components/crewmate";
import { JoinCodeEntry } from "@/components/join-code-entry";

export default function JoinLandingPage() {
  return (
    <main className="mx-auto w-full max-w-[620px] flex-1 px-6 pb-20 pt-11">
      <Link href="/" className="mb-6 inline-block text-sm text-cyan hover:underline">
        ← กลับหน้าแรก
      </Link>
      <div className="reveal text-center">
        <span className="pill pill-cyan">มีโค้ดเชิญ?</span>
        <h1
          className="mx-auto mt-4 font-bold text-[#F4F8FF]"
          style={{ fontSize: "clamp(30px,5vw,44px)", lineHeight: 1.08, textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
        >
          เข้าร่วมทริป
        </h1>
        <p className="m-0 text-[#93A2BC]">ใส่โค้ดที่เพื่อนแปะไว้ในกลุ่มแชท</p>
      </div>
      <div className="panel mt-6" style={{ padding: 28 }}>
        <div className="mb-2 flex justify-center">
          <div className="bob" style={{ width: 124, height: 148, filter: "drop-shadow(0 16px 14px rgba(0,0,0,.5))" }}>
            <Crewmate body="#38FEDC" shade="#1C9E9C" />
          </div>
        </div>
        <JoinCodeEntry />
        <p className="mt-4 text-center text-[13px] text-fog">
          ไม่มีโค้ด? เปิดลิงก์เข้าร่วมที่เพื่อนส่งให้ในแชทได้เลย
        </p>
      </div>
    </main>
  );
}

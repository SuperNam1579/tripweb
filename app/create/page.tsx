import Link from "next/link";
import { CreateTripForm } from "@/components/create-trip-form";
import { Crewmate } from "@/components/crewmate";

export default function CreatePage() {
  return (
    <main className="mx-auto w-full max-w-[1040px] flex-1 px-6 pb-20 pt-10">
      <Link href="/" className="mb-6 inline-block text-sm text-cyan hover:underline">
        ← กลับหน้าแรก
      </Link>
      <div className="grid items-start gap-8 md:grid-cols-[1.15fr_.85fr]">
        <div className="panel reveal overflow-hidden">
          <div className="panel-bar">
            <span className="panel-dot bg-[#E23A3A]" />
            <span className="panel-dot bg-[#F6F657]" />
            <span className="panel-dot bg-[#4AC959]" />
            <span className="ml-2 text-xs uppercase tracking-[.16em] text-[#8FA0BE]">Host a Trip</span>
          </div>
          <div className="px-7 py-7">
            <h1
              className="font-bold text-[#F4F8FF]"
              style={{ fontSize: "clamp(32px,5vw,46px)", lineHeight: 1.04, textShadow: "0 1px 8px rgba(0,0,0,.4)" }}
            >
              สร้างทริปใหม่
            </h1>
            <p className="mb-6 mt-1.5 text-[#93A2BC]">ตั้งค่าห้อง แล้วรับลิงก์เชิญไว้แปะในกลุ่มแชท</p>
            <CreateTripForm />
          </div>
        </div>

        <aside className="panel md:sticky md:top-[88px]" style={{ padding: 26 }}>
          <div className="mb-3.5 flex justify-center">
            <div className="bob" style={{ width: 92, height: 110, filter: "drop-shadow(0 14px 12px rgba(0,0,0,.45))" }}>
              <Crewmate body="#C51111" shade="#6E0F0F" />
            </div>
          </div>
          <p className="mb-3.5 text-center text-xs font-semibold uppercase tracking-[.14em] text-cyan">
            สองลิงก์ — อย่าสับสน
          </p>
          <div className="flex flex-col gap-3.5">
            <div style={{ borderLeft: "4px solid #38FEDC", paddingLeft: 14 }}>
              <p className="m-0 font-bold text-star">ลิงก์เข้าร่วม</p>
              <p className="mt-1 text-sm text-[#93A2BC]">แปะในกลุ่มแชทได้เลย เพื่อนเข้าด้วยโค้ดสั้น</p>
            </div>
            <div style={{ borderLeft: "4px solid #ED54BA", paddingLeft: 14 }}>
              <p className="m-0 font-bold text-star">ลิงก์เจ้าของ</p>
              <p className="mt-1 text-sm text-[#93A2BC]">
                โชว์ครั้งเดียว — ทางเดียวที่จะเห็นงบรายคน เก็บเหมือนรหัสผ่าน
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

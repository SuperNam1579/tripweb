import Link from "next/link";
import { Crewmate } from "@/components/crewmate";

const STEPS = [
  {
    no: "01",
    title: "เข้าร่วมด้วยลิงก์เดียว",
    desc: "แปะลิงก์ในกลุ่มแชท เพื่อนเข้าด้วยโค้ดสั้น ไม่ต้องสมัคร",
  },
  {
    no: "02",
    title: "มาร์กวันที่ว่าง",
    desc: "แตะปฏิทินทีเดียว ระบบหาช่วงที่ทุกคนตรงกันให้เอง",
  },
  {
    no: "03",
    title: "ตั้งงบ (ลับ) & โหวต",
    desc: "งบเป็นความลับ ทีมเห็นแค่ค่ากลาง แล้วโหวตภูมิภาคกับสไตล์",
  },
  {
    no: "04",
    title: "ได้วันที่ดีที่สุด",
    desc: "จัดอันดับช่วงวัน พร้อมแนะนำที่เที่ยวที่พอดีงบทีม",
  },
];

export default function Home() {
  return (
    <main>
      {/* ————— Hero ————— */}
      <section className="mx-auto max-w-[1160px] px-6 pb-9 pt-14">
        <div className="grid items-center gap-9 md:grid-cols-[1.22fr_.78fr]">
          <div>
            <span className="pill pill-green reveal" style={{ animationDelay: "0s" }}>
              <span className="h-2 w-2 rounded-full bg-[#08210C]" />
              Group Trip Crew · Ep.01
            </span>
            <h1
              className="reveal mt-6 font-bold text-[#F6FAFF]"
              style={{
                animationDelay: ".08s",
                fontSize: "clamp(30px,3.9vw,46px)",
                lineHeight: 1.16,
                letterSpacing: "-.005em",
                textWrap: "balance",
                textShadow: "0 2px 16px rgba(0,0,0,.45)",
              }}
            >
              วางแผนทริปกลุ่ม
              <br />
              ให้จบใน<span className="text-cyan">ลิงก์เดียว</span>
            </h1>
            <p
              className="reveal mt-5 max-w-[30rem] text-[18px] text-[#B7C4DA]"
              style={{ animationDelay: ".16s" }}
            >
              รวมทีมเพื่อนเข้าลอบบี้เดียว ทุกคนมาร์กวันว่าง ตั้งงบ (ลับสุดๆ)
              แล้วโหวตว่าจะไปไหน — TripSync หาช่วงวันที่ทุกคนไปได้จริง ไม่มีใครโดนทิ้ง
            </p>
            <div
              className="reveal mt-8 flex flex-wrap items-center gap-4"
              style={{ animationDelay: ".24s" }}
            >
              <Link
                href="/create"
                className="btn btn-green px-8 py-4 text-[19px]"
                style={{ borderRadius: 17, boxShadow: "0 8px 0 #2C8C39, inset 0 2px 0 rgba(255,255,255,.45)" }}
              >
                เริ่มทริปเลย →
              </Link>
              <Link
                href="/join"
                className="btn btn-dark px-7 py-4 text-[17px]"
                style={{ borderRadius: 17 }}
              >
                มีโค้ดเชิญอยู่แล้ว
              </Link>
            </div>
            <div
              className="reveal mt-7 flex flex-wrap gap-2.5"
              style={{ animationDelay: ".32s" }}
            >
              <span className="pill pill-ghost">ไม่ต้องล็อกอิน</span>
              <span className="pill pill-ghost">งบส่วนตัว 100%</span>
              <span className="pill pill-ghost">ใช้ฟรี</span>
            </div>
          </div>

          {/* Crewmate cluster */}
          <div className="relative flex min-h-[380px] items-center justify-center">
            <div
              className="absolute"
              style={{
                width: 320,
                height: 320,
                borderRadius: "50%",
                background: "radial-gradient(circle,rgba(197,17,17,.32),transparent 66%)",
                filter: "blur(6px)",
              }}
            />
            <div
              className="floaty absolute"
              style={{
                bottom: 52,
                width: 150,
                height: 26,
                borderRadius: "50%",
                background: "radial-gradient(closest-side,rgba(0,0,0,.5),transparent)",
              }}
            />
            <div className="bob" style={{ width: 220, height: 262, filter: "drop-shadow(0 26px 22px rgba(0,0,0,.5))" }}>
              <Crewmate body="#C51111" shade="#6E0F0F" />
            </div>
            <div
              className="bob2 absolute"
              style={{ left: 0, top: "6%", width: 96, height: 114, filter: "drop-shadow(0 14px 12px rgba(0,0,0,.45))" }}
            >
              <Crewmate body="#38FEDC" shade="#1C9E9C" />
            </div>
            <div
              className="bob absolute"
              style={{ right: "2%", bottom: "2%", width: 110, height: 130, animationDelay: ".6s", filter: "drop-shadow(0 16px 14px rgba(0,0,0,.45))" }}
            >
              <Crewmate body="#F6F657" shade="#B0A020" />
            </div>
            <div
              className="bob2 absolute"
              style={{ right: "18%", top: 0, width: 74, height: 88, animationDelay: ".3s", filter: "drop-shadow(0 12px 10px rgba(0,0,0,.45))" }}
            >
              <Crewmate body="#6B2FBB" shade="#3B1D72" />
            </div>
          </div>
        </div>
      </section>

      {/* vent divider */}
      <div className="mx-auto flex max-w-[1160px] items-center gap-3.5 px-6 py-1.5">
        <div className="flex-1" style={{ borderTop: "2px dashed rgba(56,254,220,.28)" }} />
        <div className="h-3 w-3 rotate-45 bg-cyan" style={{ boxShadow: "0 0 12px rgba(56,254,220,.6)" }} />
        <div className="flex-1" style={{ borderTop: "2px dashed rgba(56,254,220,.28)" }} />
      </div>

      {/* ————— How it works (task list) ————— */}
      <section className="mx-auto max-w-[1160px] px-6 pb-5 pt-8">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
          <h2
            className="font-bold text-[#F4F8FF]"
            style={{ fontSize: "clamp(28px,4vw,46px)", textShadow: "0 2px 12px rgba(0,0,0,.4)" }}
          >
            ภารกิจของทีม
          </h2>
          <span className="text-[13px] uppercase tracking-[.14em] text-cyan">Tasks · 4 steps</span>
        </div>
        <div className="panel overflow-hidden">
          <div className="panel-bar">
            <span className="panel-dot bg-[#E23A3A]" />
            <span className="panel-dot bg-[#F6F657]" />
            <span className="panel-dot bg-[#4AC959]" />
            <span className="ml-2 text-xs uppercase tracking-[.16em] text-[#8FA0BE]">Task List</span>
          </div>
          {STEPS.map((s) => (
            <div
              key={s.no}
              className="flex items-center gap-5 px-5 py-[18px]"
              style={{ borderBottom: "2px solid #131C2E" }}
            >
              <span
                className="grid h-[42px] w-[42px] flex-none place-items-center rounded-[11px] text-[17px] font-bold"
                style={{
                  background: "linear-gradient(180deg,rgba(255,255,255,.35),rgba(255,255,255,0) 50%),#4AC959",
                  color: "#08210C",
                  border: "2px solid #05070D",
                  boxShadow: "0 3px 0 #2C8C39",
                }}
              >
                ✓
              </span>
              <span className="w-[42px] flex-none text-[15px] font-semibold text-[#5E6E88]">{s.no}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[21px] font-semibold text-[#EEF3FB]">{s.title}</h3>
                <p className="mt-0.5 text-[15px] text-[#93A2BC]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ————— CTA band ————— */}
      <section className="mx-auto max-w-[1160px] px-6 py-12">
        <div
          className="relative overflow-hidden text-center"
          style={{
            background: "linear-gradient(135deg,#132ED1,#6B2FBB)",
            border: "3px solid #05070D",
            borderRadius: 28,
            padding: "56px 34px",
            boxShadow: "0 14px 0 rgba(0,0,0,.38),inset 0 0 0 2px rgba(255,255,255,.1),inset 0 3px 0 rgba(255,255,255,.16)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(600px 300px at 50% -10%,rgba(255,255,255,.14),transparent 70%)" }}
          />
          <div
            className="bob2 absolute"
            style={{ left: "5%", bottom: -8, width: 94, height: 112, transform: "rotate(-8deg)", filter: "drop-shadow(0 14px 12px rgba(0,0,0,.4))" }}
          >
            <Crewmate body="#F6F657" shade="#B0A020" />
          </div>
          <div
            className="bob absolute"
            style={{ right: "6%", top: -4, width: 80, height: 96, transform: "rotate(10deg)", filter: "drop-shadow(0 14px 12px rgba(0,0,0,.4))" }}
          >
            <Crewmate body="#50EF39" shade="#2F9E22" />
          </div>
          <p className="relative m-0 text-[13px] uppercase tracking-[.2em] text-[#B9E3FF]">Ready up</p>
          <h2
            className="relative mx-auto mt-3.5 font-bold text-white"
            style={{ fontSize: "clamp(30px,5vw,56px)", lineHeight: 1.04, maxWidth: "20ch", textShadow: "0 2px 16px rgba(0,0,0,.4)" }}
          >
            พร้อมรวมทีมออกทริปหรือยัง?
          </h2>
          <Link
            href="/create"
            className="btn btn-green relative mt-7 px-9 py-[17px] text-[19px]"
            style={{ borderRadius: 17, boxShadow: "0 8px 0 #2C8C39, inset 0 2px 0 rgba(255,255,255,.45)" }}
          >
            สร้างทริปเลย →
          </Link>
        </div>
      </section>

      <footer style={{ borderTop: "2px solid #05070D" }}>
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-3 px-6 py-7">
          <span className="text-[20px] font-semibold text-[#DCE6F5]" style={{ textShadow: "0 1px 8px rgba(0,0,0,.4)" }}>
            TripSync
          </span>
          <span className="text-xs text-[#6B7B94]">© 2026 · Pick the dates. Keep the crew.</span>
        </div>
      </footer>
    </main>
  );
}

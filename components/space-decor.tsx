/**
 * The fixed space backdrop — planets, twinkling stars, a shooting star, a
 * vignette and scanlines — plus the HUD corner brackets. Purely decorative
 * and non-interactive; all motion respects prefers-reduced-motion via the
 * animation classes in globals.css.
 */
export function SpaceDecor() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* Big teal planet, bottom-left */}
        <div
          className="drift"
          style={{
            position: "absolute",
            width: 560,
            height: 560,
            left: -190,
            bottom: -230,
            borderRadius: "50%",
            background: "radial-gradient(circle at 34% 28%,#2C5675,#16324E 52%,#0A182B)",
            boxShadow:
              "0 0 140px 24px rgba(56,254,220,.10),inset -40px -26px 70px rgba(0,0,0,.55),inset 26px 18px 50px rgba(130,210,255,.16)",
          }}
        />
        {/* Purple moon, top-right */}
        <div
          className="drift2"
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            right: -46,
            top: 70,
            borderRadius: "50%",
            background: "radial-gradient(circle at 36% 30%,#7B44C9,#4B238C 55%,#2A1257)",
            boxShadow:
              "0 0 70px 8px rgba(107,47,187,.35),inset -16px -12px 30px rgba(0,0,0,.5),inset 12px 8px 22px rgba(190,150,255,.25)",
          }}
        />
        {/* Small grey moon */}
        <div
          className="drift2"
          style={{
            position: "absolute",
            width: 44,
            height: 44,
            left: "22%",
            top: "24%",
            borderRadius: "50%",
            background: "radial-gradient(circle at 34% 30%,#8393AE,#3C4864 60%,#222B40)",
            boxShadow: "inset -6px -5px 12px rgba(0,0,0,.55)",
          }}
        />
        {/* Twinkling stars */}
        {[
          { left: "20%", top: "16%", size: 4, bg: "#fff", glow: "rgba(255,255,255,.8)", dur: "3.2s", delay: "0s" },
          { left: "70%", top: "22%", size: 5, bg: "#bdecff", glow: "rgba(120,220,255,.7)", dur: "4.1s", delay: ".6s" },
          { left: "44%", top: "70%", size: 4, bg: "#fff", glow: "rgba(255,255,255,.7)", dur: "3.6s", delay: "1.1s" },
          { left: "86%", top: "80%", size: 5, bg: "#d6ffef", glow: "rgba(56,254,220,.6)", dur: "4.6s", delay: ".3s" },
          { left: "9%", top: "52%", size: 4, bg: "#fff", glow: "rgba(255,255,255,.7)", dur: "3.9s", delay: ".9s" },
        ].map((s, i) => (
          <div
            key={i}
            className="twinkle"
            style={{
              position: "absolute",
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              borderRadius: "50%",
              background: s.bg,
              boxShadow: `0 0 8px 2px ${s.glow}`,
              animationDuration: s.dur,
              animationDelay: s.delay,
            }}
          />
        ))}
        {/* Shooting star */}
        <div
          className="shoot"
          style={{
            position: "absolute",
            right: "8%",
            top: "8%",
            width: 150,
            height: 2,
            borderRadius: 2,
            background: "linear-gradient(90deg,rgba(255,255,255,0),#fff)",
            boxShadow: "0 0 8px 1px rgba(255,255,255,.7)",
          }}
        />
        {/* Vignette + scanlines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 40%,transparent 52%,rgba(5,7,13,.55) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg,rgba(255,255,255,.02) 0 1px,transparent 1px 3px)",
          }}
        />
      </div>

      {/* HUD corner brackets */}
      {(
        [
          { pos: { left: 12, top: 12 }, radius: "8px 0 0 0", edges: ["borderLeft", "borderTop"] },
          { pos: { right: 12, top: 12 }, radius: "0 8px 0 0", edges: ["borderRight", "borderTop"] },
          { pos: { left: 12, bottom: 12 }, radius: "0 0 0 8px", edges: ["borderLeft", "borderBottom"] },
          { pos: { right: 12, bottom: 12 }, radius: "0 0 8px 0", edges: ["borderRight", "borderBottom"] },
        ] as { pos: React.CSSProperties; radius: string; edges: (keyof React.CSSProperties)[] }[]
      ).map((c, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "fixed",
            zIndex: 60,
            pointerEvents: "none",
            width: 26,
            height: 26,
            borderRadius: c.radius,
            ...c.pos,
            ...Object.fromEntries(c.edges.map((e) => [e, "3px solid rgba(56,254,220,.6)"])),
          }}
        />
      ))}
    </>
  );
}

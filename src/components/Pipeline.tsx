import { useEffect, useRef, useState } from "react";
import { PIPELINE } from "../data";
import { CodeBlock, GhostBtn, IconCheck, IconInfo } from "./ui";

const WHERE_TONE: Record<string, { cls: string; label: string }> = {
  TERMUX: { cls: "text-phos border-phos/40 bg-phos/[0.06]", label: "TERMUX HOST" },
  ROOTFS: { cls: "text-amber border-amber/40 bg-amber/[0.06]", label: "INSIDE ROOTFS" },
  BROWSER: { cls: "text-coral border-coral/40 bg-coral/[0.06]", label: "BROWSER" },
};

export default function Pipeline() {
  const [active, setActive] = useState(PIPELINE[0].id);
  const [copiedAll, setCopiedAll] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-step]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const id = e.target.getAttribute("data-step");
            if (id) setActive(id);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const activeIdx = PIPELINE.findIndex((s) => s.id === active);

  const copyAll = async () => {
    const text = PIPELINE.map((s) => `# ${s.idx} · ${s.title}\n${s.cmds.join("\n")}`).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable — still flash feedback */
    }
    setCopiedAll(true);
    window.setTimeout(() => setCopiedAll(false), 1800);
  };

  const jump = (id: string) => {
    document.querySelector(`[data-step="${id}"]`)?.scrollIntoView({ block: "center" });
  };

  return (
    <div className="grid lg:grid-cols-[270px_1fr] gap-10 lg:gap-14 items-start">
      {/* sticky rail */}
      <div ref={railRef} className="reveal hidden lg:block sticky top-24">
        <p className="fm text-[10px] tracking-[0.22em] text-dim uppercase mb-4">stages · in order</p>
        <ol className="relative border-l border-line">
          {PIPELINE.map((s, i) => {
            const isActive = s.id === active;
            const isPast = i < activeIdx;
            return (
              <li key={s.id}>
                <button
                  onClick={() => jump(s.id)}
                  className={`group w-full text-left pl-6 pr-2 py-3 -ml-px border-l-2 transition-all duration-300 ${
                    isActive ? "border-phos bg-phos/[0.04]" : isPast ? "border-line2" : "border-transparent"
                  } hover:bg-panel`}
                >
                  <span className={`fm text-[11px] tracking-widest ${isActive ? "text-phos" : isPast ? "text-mut" : "text-dim"}`}>{s.idx}</span>
                  <span
                    className={`fd block font-semibold text-[14px] mt-0.5 transition-colors duration-300 ${
                      isActive ? "text-ink" : isPast ? "text-mut" : "text-dim group-hover:text-mut"
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <GhostBtn
          onClick={copyAll}
          className={`mt-8 px-4 py-2.5 ${copiedAll ? "text-phos border-phos/50 bg-phos/10" : "text-mut border-line hover:text-phos hover:border-phos/40"}`}
        >
          {copiedAll ? <IconCheck className="w-3.5 h-3.5" /> : null}
          {copiedAll ? "sequence copied" : "copy whole sequence"}
        </GhostBtn>
      </div>

      {/* stage cards */}
      <div className="space-y-6">
        {PIPELINE.map((s, i) => {
          const w = WHERE_TONE[s.where];
          const isActive = s.id === active;
          return (
            <article
              key={s.id}
              data-step={s.id}
              className={`reveal border bg-panel transition-all duration-500 ${isActive ? "border-phos/45 shadow-[0_0_50px_-18px_rgba(84,227,142,0.35)]" : "border-line"}`}
              style={{ transitionDelay: `${(i % 3) * 90}ms` }}
            >
              <div className="p-5 md:p-7">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-baseline gap-4">
                    <span className={`fd font-bold text-[34px] md:text-[44px] leading-none transition-colors duration-500 ${isActive ? "text-phos" : "stroke-text"}`}>
                      {s.idx}
                    </span>
                    <h3 className="fd font-bold text-xl md:text-2xl">{s.title}</h3>
                  </div>
                  <span className={`fm text-[10px] tracking-[0.18em] px-2.5 py-1.5 border ${w.cls}`}>{w.label}</span>
                </div>
                <p className="text-mut text-[14.5px] leading-relaxed mt-4 max-w-2xl">{s.desc}</p>
                <div className="mt-5 space-y-2.5">
                  {s.cmds.map((c, j) => (
                    <CodeBlock key={j} cmd={c} index={`${s.idx}.${j + 1}`} />
                  ))}
                </div>
                <div className="mt-5 flex items-start gap-2.5 text-[12.5px] text-dim border-t border-line pt-4">
                  <IconInfo className="w-4 h-4 mt-0.5 shrink-0 text-cyan/80" />
                  <p className="leading-relaxed">{s.note}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from "react";
import { CONSTRAINTS, LAYERS, WHY_WORKS } from "../data";
import { IconWarn, ToneDot } from "./ui";

const TONE: Record<string, string> = {
  phos: "#54e38e",
  coral: "#ff5470",
  amber: "#ffc061",
  cyan: "#63d3e6",
  ink: "#8fa69a",
};

const BOX = { x: 72, w: 376, h: 56, pitch: 78, startY: 34 };
const yOf = (i: number) => BOX.startY + i * BOX.pitch;

export default function ArchDiagram() {
  const [active, setActive] = useState("proot");
  const layer = LAYERS.find((l) => l.id === active) ?? LAYERS[0];

  // isolation boundary wraps ubuntu(3) + proot(4)
  const bTop = yOf(3) - 12;
  const bBottom = yOf(4) + BOX.h + 12;

  return (
    <div className="grid lg:grid-cols-[minmax(0,560px)_1fr] gap-10 lg:gap-14 items-start">
      {/* -------- diagram -------- */}
      <div className="reveal">
        <svg viewBox="0 0 520 600" className="w-full h-auto select-none" role="img" aria-label="Isolation stack from Android kernel up to the browser">
          {/* flow connectors */}
          {LAYERS.slice(0, -1).map((l, i) => {
            const y1 = yOf(i) + BOX.h;
            const y2 = yOf(i + 1);
            return (
              <line
                key={l.id}
                x1={260}
                y1={y1 + 2}
                x2={260}
                y2={y2 - 2}
                stroke="#3b5547"
                strokeWidth={1.4}
                className="flow-line"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            );
          })}

          {/* port annotation between browser and n8n */}
          <text x={272} y={(yOf(0) + BOX.h + yOf(1)) / 2 + 3} fill="#5f756a" fontSize={10} fontFamily="JetBrains Mono, monospace" letterSpacing={1}>
            127.0.0.1:5678
          </text>

          {/* isolation boundary */}
          <rect x={58} y={bTop} width={404} height={bBottom - bTop} fill="rgba(255,192,97,0.035)" stroke="#ffc061" strokeOpacity={0.45} strokeWidth={1} strokeDasharray="6 5" rx={2} />
          <text x={452} y={bTop + 14} fill="#ffc061" fillOpacity={0.8} fontSize={9.5} fontFamily="JetBrains Mono, monospace" letterSpacing={1.5} textAnchor="end">
            PROOT ISOLATION — FAKE CHROOT · SHARED NETNS
          </text>

          {/* layer boxes */}
          {LAYERS.map((l, i) => {
            const isActive = l.id === active;
            const tone = TONE[l.tone];
            return (
              <g
                key={l.id}
                onClick={() => setActive(l.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(l.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Inspect layer: ${l.name}`}
                className="cursor-pointer focus:outline-none"
                style={{ transform: isActive ? "translateX(8px)" : "translateX(0)", transition: "transform .35s cubic-bezier(.2,.7,.2,1)" }}
              >
                <rect
                  x={BOX.x}
                  y={yOf(i)}
                  width={BOX.w}
                  height={BOX.h}
                  fill={isActive ? "#182420" : "#111a16"}
                  stroke={isActive ? tone : "#243229"}
                  strokeWidth={isActive ? 1.6 : 1}
                  style={{ transition: "stroke .3s, fill .3s" }}
                />
                <rect x={BOX.x} y={yOf(i)} width={3.5} height={BOX.h} fill={tone} opacity={isActive ? 1 : 0.45} style={{ transition: "opacity .3s" }} />
                <text x={BOX.x + 20} y={yOf(i) + 24} fill={isActive ? "#e6f0e9" : "#c4d4ca"} fontSize={15} fontWeight={600} fontFamily="Chakra Petch, sans-serif" letterSpacing={0.4}>
                  {l.name}
                </text>
                <text x={BOX.x + 20} y={yOf(i) + 42} fill="#5f756a" fontSize={10} fontFamily="JetBrains Mono, monospace" letterSpacing={0.8}>
                  {l.tag}
                </text>
                <text x={BOX.x + BOX.w - 16} y={yOf(i) + 33} fill={isActive ? tone : "#3b5547"} fontSize={11} fontFamily="JetBrains Mono, monospace" textAnchor="end">
                  L{LAYERS.length - i}
                </text>
              </g>
            );
          })}

          {/* base caption */}
          <text x={260} y={yOf(6) + BOX.h + 34} fill="#5f756a" fontSize={10.5} fontFamily="JetBrains Mono, monospace" letterSpacing={1.5} textAnchor="middle">
            ▼ NO ROOT · NO KERNEL MODS · NO EMULATION ▼
          </text>
        </svg>

        {/* constraint chips */}
        <div className="mt-6 flex flex-wrap gap-2">
          {CONSTRAINTS.map((c) => (
            <span key={c} className="fm flex items-center gap-1.5 text-[10.5px] tracking-wider text-amber/80 border border-amber/25 bg-amber/[0.04] px-2.5 py-1.5 uppercase">
              <IconWarn className="w-3 h-3" /> {c}
            </span>
          ))}
        </div>
      </div>

      {/* -------- detail panel -------- */}
      <div className="lg:sticky lg:top-24 space-y-6">
        <div className="reveal border border-line bg-panel relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: TONE[layer.tone] }} />
          <div className="p-5 md:p-6">
            <div className="flex items-center gap-3 flex-wrap">
              <ToneDot tone={layer.tone} />
              <span className="fm text-[10px] tracking-[0.22em] text-dim uppercase">layer inspector</span>
            </div>
            <h3 className="fd font-bold text-2xl mt-3" style={{ color: TONE[layer.tone] }}>
              {layer.name}
            </h3>
            <p className="fm text-xs text-mut mt-1 tracking-wider">{layer.tag}</p>
            <ul className="mt-5 space-y-3">
              {layer.bullets.map((b, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink/85">
                  <span className="fm mt-0.5 text-dim shrink-0">▸</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* why aarch64 just works */}
        <div className="reveal space-y-px border border-line bg-panel" style={{ transitionDelay: "120ms" }}>
          <p className="fm text-[10px] tracking-[0.22em] text-phos/80 uppercase px-5 pt-4 pb-2">why aarch64 just works</p>
          {WHY_WORKS.map((w, i) => (
            <div key={w.title} className="group px-5 py-4 border-t border-line hover:bg-panel2 transition-colors duration-300">
              <div className="flex items-baseline gap-4">
                <span className="fm text-xs text-dim group-hover:text-phos transition-colors">0{i + 1}</span>
                <h4 className="fd font-semibold text-[15px] text-ink">{w.title}</h4>
              </div>
              <p className="text-[13.5px] text-mut leading-relaxed mt-1.5 pl-9">{w.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

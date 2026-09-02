import { useState } from "react";
import { DEVICE_MATRIX, FAQS, ROOTFS_MATRIX } from "../data";

const VERDICT_TONE: Record<string, string> = {
  RECOMMENDED: "text-phos border-phos/45 bg-phos/[0.07]",
  SOLID: "text-cyan border-cyan/40 bg-cyan/[0.05]",
  TINKER: "text-amber border-amber/40 bg-amber/[0.05]",
  MINIMAL: "text-coral border-coral/40 bg-coral/[0.05]",
};

export function Matrices() {
  return (
    <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 items-start">
      {/* rootfs matrix */}
      <div className="reveal">
        <p className="fm text-[11px] tracking-[0.2em] uppercase text-mut mb-4">rootfs compatibility · proot-distro list</p>
        <div className="border border-line bg-panel">
          <div className="hidden md:grid grid-cols-[1.2fr_1fr_0.7fr_1fr] gap-3 px-5 py-3 border-b border-line fm text-[10px] tracking-[0.18em] uppercase text-dim">
            <span>distro</span>
            <span>libc</span>
            <span>installed</span>
            <span className="text-right">verdict</span>
          </div>
          {ROOTFS_MATRIX.map((r) => (
            <div key={r.name} className="group grid md:grid-cols-[1.2fr_1fr_0.7fr_1fr] gap-1.5 md:gap-3 px-5 py-4 border-b border-line/70 last:border-b-0 hover:bg-panel2 transition-colors duration-200">
              <div>
                <p className="fd font-semibold text-[15px] text-ink group-hover:text-phos transition-colors">{r.name}</p>
                <p className="text-[12px] text-mut leading-relaxed mt-1 md:col-span-full">{r.note}</p>
              </div>
              <p className="fm text-[12px] text-mut self-start md:pt-1">{r.libc}</p>
              <p className="fm text-[12px] text-mut self-start md:pt-1">{r.footprint}</p>
              <p className="md:text-right">
                <span className={`fm inline-block text-[10px] tracking-[0.16em] border px-2 py-1 ${VERDICT_TONE[r.verdict]}`}>{r.verdict}</span>
              </p>
            </div>
          ))}
        </div>
        <p className="fm text-[11.5px] text-dim mt-4 leading-relaxed">
          ▸ every rootfs ships a native arm64 tarball — the choice is about libc and package ecology, not architecture.
        </p>
      </div>

      {/* device tuning */}
      <div className="reveal" style={{ transitionDelay: "120ms" }}>
        <p className="fm text-[11px] tracking-[0.2em] uppercase text-mut mb-4">device tuning sheet</p>
        <div className="border border-line bg-panel">
          {DEVICE_MATRIX.map((d) => {
            const chip = {
              phos: "text-phos border-phos/40 bg-phos/[0.07]",
              amber: "text-amber border-amber/40 bg-amber/[0.05]",
              coral: "text-coral border-coral/40 bg-coral/[0.05]",
            }[d.chip.tone];
            return (
              <div key={d.device} className="px-5 py-4 border-b border-line/70 last:border-b-0 hover:bg-panel2 transition-colors duration-200">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="fd font-semibold text-[14.5px] text-ink">{d.device}</p>
                  <span className={`fm text-[10px] tracking-[0.16em] border px-2 py-1 ${chip}`}>{d.chip.label}</span>
                </div>
                <div className="fm grid grid-cols-3 gap-3 mt-3 text-[11.5px]">
                  <div>
                    <p className="text-dim text-[9.5px] tracking-[0.16em] uppercase mb-1">RAM</p>
                    <p className="text-ink/85">{d.ram}</p>
                  </div>
                  <div>
                    <p className="text-dim text-[9.5px] tracking-[0.16em] uppercase mb-1">V8 heap</p>
                    <p className="text-cyan/90 truncate" title={d.heap}>{d.heap.replace("--max-old-space-size=", "")}</p>
                  </div>
                  <div>
                    <p className="text-dim text-[9.5px] tracking-[0.16em] uppercase mb-1">cold start</p>
                    <p className="text-ink/85">{d.cold}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number>(0);
  return (
    <div className="max-w-4xl">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={`reveal border-b border-line transition-colors duration-300 ${isOpen ? "bg-panel/60" : "hover:bg-panel/40"}`}
            style={{ transitionDelay: `${Math.min(i, 4) * 60}ms` }}
          >
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-4 text-left px-4 md:px-6 py-5 cursor-pointer group"
            >
              <span className={`fm text-xs shrink-0 transition-colors ${isOpen ? "text-coral" : "text-dim group-hover:text-mut"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={`fd font-semibold text-[15px] md:text-base flex-1 transition-colors ${isOpen ? "text-ink" : "text-mut group-hover:text-ink"}`}>
                {f.q}
              </span>
              <span
                className={`fm text-phos text-lg shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                aria-hidden
              >
                +
              </span>
            </button>
            <div className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <p className="px-4 md:px-6 pb-5 pl-12 md:pl-14 text-[14px] text-mut leading-relaxed max-w-3xl">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

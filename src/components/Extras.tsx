import { useState } from "react";
import { DEVICE_MATRIX, FAQS, ROOTFS_MATRIX } from "../data";
import { IconChevron } from "./ui";

const VERDICT_CLS: Record<string, string> = {
  RECOMMENDED: "text-phos border-phos/40 bg-phos/[0.07]",
  SOLID: "text-cyan border-cyan/40 bg-cyan/[0.07]",
  TINKER: "text-amber border-amber/40 bg-amber/[0.07]",
  MINIMAL: "text-mut border-line bg-panel2",
};

const CHIP_CLS: Record<string, string> = {
  phos: "text-phos border-phos/40 bg-phos/[0.07]",
  amber: "text-amber border-amber/40 bg-amber/[0.07]",
  coral: "text-coral border-coral/40 bg-coral/[0.07]",
};

export function Matrix() {
  return (
    <div className="grid lg:grid-cols-2 gap-10 items-start">
      {/* rootfs matrix */}
      <div className="reveal border border-line bg-panel overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <span className="fd font-semibold text-[15px]">rootfs choice matrix</span>
          <span className="fm text-[10px] tracking-widest text-dim uppercase">libc decides everything</span>
        </div>
        <div className="divide-y divide-line">
          {ROOTFS_MATRIX.map((r) => (
            <div key={r.name} className="px-5 py-4 hover:bg-panel2 transition-colors duration-200">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="fd font-semibold text-[16px]">{r.name}</span>
                <span className={`fm text-[9.5px] tracking-[0.16em] px-2 py-1 border ${VERDICT_CLS[r.verdict]}`}>{r.verdict}</span>
              </div>
              <div className="fm text-[11px] text-dim mt-1.5">
                {r.libc} · {r.footprint}
              </div>
              <p className="text-[13px] text-mut leading-relaxed mt-2">{r.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* device matrix */}
      <div className="reveal border border-line bg-panel overflow-hidden" style={{ transitionDelay: "120ms" }}>
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <span className="fd font-semibold text-[15px]">device tuning sheet</span>
          <span className="fm text-[10px] tracking-widest text-dim uppercase">RAM sets the ceiling</span>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="fm text-[10px] tracking-widest text-dim uppercase border-b border-line">
                <th className="px-5 py-3 font-medium">device</th>
                <th className="px-3 py-3 font-medium">RAM</th>
                <th className="px-3 py-3 font-medium">heap cap</th>
                <th className="px-3 py-3 font-medium">cold start</th>
                <th className="px-5 py-3 font-medium text-right">rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {DEVICE_MATRIX.map((d) => (
                <tr key={d.device} className="hover:bg-panel2 transition-colors duration-200">
                  <td className="px-5 py-3.5 text-[13px] text-ink/90">{d.device}</td>
                  <td className="fm px-3 py-3.5 text-[12px] text-mut">{d.ram}</td>
                  <td className="fm px-3 py-3.5 text-[11px] text-amber/90">{d.heap}</td>
                  <td className="fm px-3 py-3.5 text-[12px] text-mut">{d.cold}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={`fm text-[9.5px] tracking-[0.16em] px-2 py-1 border ${CHIP_CLS[d.chip.tone]}`}>{d.chip.label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* mobile fallback */}
        <div className="md:hidden divide-y divide-line">
          {DEVICE_MATRIX.map((d) => (
            <div key={d.device} className="px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="fd font-semibold text-[14px]">{d.device}</span>
                <span className={`fm shrink-0 text-[9.5px] tracking-[0.16em] px-2 py-1 border ${CHIP_CLS[d.chip.tone]}`}>{d.chip.label}</span>
              </div>
              <div className="fm text-[11px] text-dim mt-1.5">
                {d.ram} · {d.heap} · cold {d.cold}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number>(0);
  return (
    <div className="max-w-4xl">
      <div className="reveal border border-line bg-panel divide-y divide-line">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 text-left px-5 md:px-6 py-4.5 hover:bg-panel2 transition-colors duration-200"
              >
                <span className="flex items-baseline gap-4 min-w-0">
                  <span className={`fm text-[11px] shrink-0 transition-colors ${isOpen ? "text-phos" : "text-dim"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={`fd font-semibold text-[14.5px] md:text-[15.5px] transition-colors ${isOpen ? "text-ink" : "text-mut"}`}>{f.q}</span>
                </span>
                <IconChevron className={`w-4 h-4 shrink-0 text-dim transition-transform duration-300 ${isOpen ? "rotate-180 text-phos" : ""}`} />
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <p className="px-5 md:px-6 pb-5 pl-[52px] md:pl-[60px] text-[13.5px] text-mut leading-relaxed">{f.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

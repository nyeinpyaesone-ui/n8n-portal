import { PIPELINE } from "../data";
import { CodeBlock, IconChip } from "./ui";

const WHERE_TONE: Record<string, { text: string; border: string; bar: string }> = {
  TERMUX: { text: "text-phos", border: "border-phos/40", bar: "bg-phos" },
  ROOTFS: { text: "text-cyan", border: "border-cyan/40", bar: "bg-cyan" },
  BROWSER: { text: "text-coral", border: "border-coral/40", bar: "bg-coral" },
};

export default function Pipeline() {
  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-12 items-start">
      {/* sticky rail */}
      <div className="reveal lg:sticky lg:top-24">
        <p className="fm text-[11px] text-dim tracking-[0.2em] uppercase mb-4">stages</p>
        <ol className="border-l border-line space-y-0.5">
          {PIPELINE.map((s) => (
            <li key={s.id}>
              <a
                href={`#step-${s.id}`}
                className="group flex items-baseline gap-3 py-2 pl-4 -ml-px border-l border-transparent hover:border-phos transition-all duration-200"
              >
                <span className="fm text-xs text-dim group-hover:text-phos transition-colors">{s.idx}</span>
                <span className="text-sm text-mut group-hover:text-ink group-hover:translate-x-1 transition-all duration-200">
                  {s.title}
                </span>
              </a>
            </li>
          ))}
        </ol>
        <div className="mt-8 border border-line bg-panel p-4 fm text-[11px] text-mut space-y-2 tracking-wider">
          <p className="flex justify-between"><span className="text-dim">TOTAL</span> <span>7 STAGES</span></p>
          <p className="flex justify-between"><span className="text-dim">HANDS-ON</span> <span>~25 MIN</span></p>
          <p className="flex justify-between"><span className="text-dim">FOOTPRINT</span> <span>≈ 2.1 GB</span></p>
          <p className="flex justify-between"><span className="text-dim">ROOT REQUIRED</span> <span className="text-phos">NONE</span></p>
        </div>
      </div>

      {/* steps */}
      <div className="space-y-8">
        {PIPELINE.map((s, i) => {
          const tone = WHERE_TONE[s.where];
          return (
            <article
              key={s.id}
              id={`step-${s.id}`}
              className="reveal scroll-mt-28 border border-line bg-panel hover:border-line2 transition-colors duration-300 relative"
              style={{ transitionDelay: `${(i % 3) * 90}ms` }}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${tone.bar} opacity-60`} />
              <div className="p-6 md:p-7">
                <div className="flex items-start gap-5 flex-wrap">
                  <span className="fd font-bold text-5xl leading-none text-line2 select-none">{s.idx}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="fd font-bold text-xl md:text-2xl text-ink">{s.title}</h3>
                      <span className={`fm flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase border px-2 py-1 ${tone.text} ${tone.border}`}>
                        <IconChip className="w-3 h-3" /> {s.where}
                      </span>
                    </div>
                    <p className="text-[14.5px] text-mut leading-relaxed mt-2.5 max-w-2xl">{s.desc}</p>
                  </div>
                </div>
                <div className="mt-5">
                  <CodeBlock title={s.where === "ROOTFS" ? "root@localhost:~#" : s.where === "BROWSER" ? "termux → browser" : "termux ~ $"} code={s.cmds.join("\n")} tone={s.where === "ROOTFS" ? "cyan" : s.where === "BROWSER" ? "coral" : "phos"} />
                </div>
                <p className="fm text-[12px] text-amber/85 leading-relaxed mt-4 flex gap-2.5">
                  <span className="text-amber shrink-0">▸</span>
                  {s.note}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

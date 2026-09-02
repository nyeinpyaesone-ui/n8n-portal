import { useState } from "react";
import { ENV_VARS, REF_TABS } from "../data";
import { CodeBlock, CopyBtn } from "./ui";

export default function Reference() {
  const [tab, setTab] = useState(REF_TABS[0].id);
  const active = REF_TABS.find((t) => t.id === tab) ?? REF_TABS[0];

  return (
    <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-start">
      {/* tabbed console */}
      <div className="reveal">
        <div className="flex border border-line border-b-0 bg-panel">
          {REF_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`fm flex-1 text-[11px] tracking-[0.16em] uppercase px-3 py-3 border-r border-line last:border-r-0 transition-all duration-200 cursor-pointer ${
                t.id === tab ? "bg-[#0a0f0d] text-phos shadow-[inset_0_2px_0_#54e38e]" : "text-dim hover:text-mut hover:bg-panel2"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <CodeBlock title={active.file} code={active.code} tone="cyan" />
        <p className="fm text-[11.5px] text-dim leading-relaxed mt-4 flex gap-2.5">
          <span className="text-phos">❯</span>
          Source the env tab once, then launch.sh becomes a one-tap startup: bash launch.sh — the editor is back at
          localhost:5678 in seconds, detach-safe.
        </p>
      </div>

      {/* env var table */}
      <div className="reveal border border-line bg-panel" style={{ transitionDelay: "120ms" }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
          <span className="fm text-[11px] tracking-[0.2em] uppercase text-mut">environment knobs that matter</span>
          <CopyBtn text={ENV_VARS.map((e) => `export ${e.name}=${e.value}`).join("\n")} label="copy all" />
        </div>
        <div className="divide-y divide-line/70 max-h-[560px] overflow-y-auto">
          {ENV_VARS.map((e) => (
            <div key={e.name} className="group px-5 py-3.5 hover:bg-panel2 transition-colors duration-200">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <code className="fm text-[12.5px] text-cyan group-hover:text-ink transition-colors">{e.name}</code>
                <code className="fm text-[11.5px] text-phos/90">{e.value}</code>
              </div>
              <p className="text-[12.5px] text-mut mt-1 leading-relaxed">{e.why}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

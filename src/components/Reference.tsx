import { useState } from "react";
import { ENV_VARS, REF_TABS } from "../data";
import { CopyBtn } from "./ui";

export default function Reference() {
  const [tab, setTab] = useState(REF_TABS[0].id);
  const current = REF_TABS.find((t) => t.id === tab) ?? REF_TABS[0];

  return (
    <div className="grid lg:grid-cols-[1fr_minmax(0,430px)] gap-10 items-start">
      {/* tabbed console */}
      <div className="reveal border border-line bg-panel">
        <div className="flex border-b border-line overflow-x-auto">
          {REF_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`fm shrink-0 text-[11px] tracking-widest uppercase px-4 md:px-5 py-3.5 border-r border-line transition-colors duration-200 ${
                tab === t.id ? "text-phos bg-[#0b100e] border-b-2 border-b-phos" : "text-dim hover:text-mut"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-line bg-[#0b100e]">
          <span className="fm text-[11px] text-dim truncate">{current.file}</span>
          <CopyBtn text={current.code} />
        </div>
        <pre className="fm text-[12px] leading-[1.8] text-ink/90 overflow-x-auto p-4 md:p-5 bg-[#0b100e] max-h-[440px] whitespace-pre">{current.code}</pre>
      </div>

      {/* env var table */}
      <div className="reveal border border-line bg-panel" style={{ transitionDelay: "120ms" }}>
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <span className="fd font-semibold text-[15px]">environment cheatsheet</span>
          <span className="fm text-[10px] tracking-widest text-dim uppercase">{ENV_VARS.length} vars</span>
        </div>
        <div className="divide-y divide-line max-h-[430px] overflow-y-auto">
          {ENV_VARS.map((v) => (
            <div key={v.name} className="group px-5 py-3.5 hover:bg-panel2 transition-colors duration-200">
              <div className="flex items-center justify-between gap-3">
                <code className="fm text-[12px] text-phos break-all">{v.name}</code>
                <code className="fm text-[11px] text-amber shrink-0">{v.value}</code>
              </div>
              <p className="text-[12px] text-dim mt-1 leading-relaxed">{v.why}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

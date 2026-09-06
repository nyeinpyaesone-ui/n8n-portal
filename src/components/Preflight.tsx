import { useState } from "react";
import { PREFLIGHT, type Check } from "../data";
import { usePrefersReducedMotion } from "../hooks";
import { GhostBtn, IconPlay } from "./ui";

type Row = { line: Check; phase: "run" | "done" };

export default function Preflight() {
  const reduced = usePrefersReducedMotion();
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);

  const run = () => {
    if (running) return;
    setRows([]);
    if (reduced) {
      setRows(PREFLIGHT.map((line) => ({ line, phase: "done" as const })));
      return;
    }
    setRunning(true);
    let i = 0;
    const step = () => {
      if (i >= PREFLIGHT.length) {
        setRunning(false);
        return;
      }
      const line = PREFLIGHT[i];
      setRows((r) => [...r, { line, phase: "run" }]);
      window.setTimeout(() => {
        setRows((r) => {
          const n = [...r];
          n[n.length - 1] = { line, phase: "done" };
          return n;
        });
        i += 1;
        window.setTimeout(step, 140);
      }, 430);
    };
    step();
  };

  const pass = rows.filter((r) => r.phase === "done" && r.line.status === "pass").length;
  const warn = rows.filter((r) => r.phase === "done" && r.line.status === "warn").length;
  const finished = rows.length === PREFLIGHT.length && !running;

  return (
    <div className="grid lg:grid-cols-[1fr_minmax(0,420px)] gap-10 items-start">
      {/* console */}
      <div className="reveal border border-line bg-[#0b100e]">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-line bg-panel">
          <span className="fm text-[11px] text-mut">preflight — device probes</span>
          <div className="flex items-center gap-3">
            <span className="fm text-[10px] tracking-wider text-dim">
              {rows.length ? `${Math.min(rows.length, PREFLIGHT.length)}/${PREFLIGHT.length}` : "7 checks"}
            </span>
            <GhostBtn
              onClick={run}
              className={`px-3 py-1.5 ${running ? "text-dim border-line cursor-wait" : "text-phos border-phos/40 hover:border-phos hover:bg-phos/10"}`}
            >
              {running ? <span className="spin inline-block w-3 h-3 border border-phos/30 border-t-phos rounded-full" /> : <IconPlay className="w-3 h-3" />}
              {rows.length ? "rerun" : "run checks"}
            </GhostBtn>
          </div>
        </div>
        <div className="p-4 md:p-5 min-h-[300px] bg-scan">
          {rows.length === 0 && (
            <p className="fm text-[12px] text-dim leading-loose">
              <span className="text-phos">~ $</span> n8n-preflight --device aarch64<br />
              <span className="cursor-blink text-phos">▋</span> press RUN to probe this device…
            </p>
          )}
          <div className="space-y-3">
            {rows.map((r, i) => (
              <div key={i} className="border border-line bg-panel px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <code className="fm text-[12px] text-ink/90 break-all">
                    <span className="text-phos">$ </span>
                    {r.line.cmd}
                  </code>
                  {r.phase === "run" ? (
                    <span className="spin shrink-0 mt-0.5 inline-block w-3.5 h-3.5 border border-mut/30 border-t-mut rounded-full" />
                  ) : r.line.status === "pass" ? (
                    <span className="fm shrink-0 text-[10px] tracking-widest text-phos border border-phos/35 bg-phos/10 px-1.5 py-0.5">PASS</span>
                  ) : (
                    <span className="fm shrink-0 text-[10px] tracking-widest text-amber border border-amber/35 bg-amber/10 px-1.5 py-0.5">TUNE</span>
                  )}
                </div>
                {r.phase === "done" && (
                  <>
                    <p className="fm text-[11.5px] text-mut mt-1.5 break-all">→ {r.line.out}</p>
                    <p className="text-[12px] text-dim mt-1">{r.line.note}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* verdict */}
      <div className="reveal space-y-5 lg:sticky lg:top-24" style={{ transitionDelay: "120ms" }}>
        <div className="border border-line bg-panel p-5 md:p-6">
          <p className="fm text-[10px] tracking-[0.22em] text-dim uppercase">verdict</p>
          <div className="fd font-bold text-[28px] leading-tight mt-3">
            {!rows.length ? (
              <span className="text-mut">standby…</span>
            ) : finished ? (
              <span className="text-phos">CLEARED FOR DEPLOY</span>
            ) : (
              <span className="text-amber">probing…</span>
            )}
          </div>
          <div className="flex gap-6 mt-4 fm text-[12px]">
            <span className="text-phos">{pass} pass</span>
            <span className="text-amber">{warn} tune</span>
            <span className="text-dim">{Math.max(0, PREFLIGHT.length - rows.length)} pending</span>
          </div>
          <div className="h-1.5 bg-[#0a0f0d] mt-4 overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${(rows.filter((r) => r.phase === "done").length / PREFLIGHT.length) * 100}%`,
                background: finished ? "#54e38e" : "#ffc061",
              }}
            />
          </div>
        </div>
        <ul className="space-y-3 text-[13.5px] text-mut leading-relaxed">
          <li className="flex gap-3">
            <span className="fm text-phos shrink-0">▸</span> Every probe above is a real command — run it in Termux and compare.
          </li>
          <li className="flex gap-3">
            <span className="fm text-amber shrink-0">▸</span> TUNE rows aren't blockers; they flag heap caps and storage headroom.
          </li>
          <li className="flex gap-3">
            <span className="fm text-cyan shrink-0">▸</span> The sync-tuning chapter below sharpens everything that passes.
          </li>
        </ul>
      </div>
    </div>
  );
}

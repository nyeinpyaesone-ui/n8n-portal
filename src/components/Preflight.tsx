import { useEffect, useRef, useState } from "react";
import { PREFLIGHT } from "../data";
import { usePrefersReducedMotion } from "../hooks";
import { IconBolt, IconCheck, IconWarn } from "./ui";

type Row = (typeof PREFLIGHT)[number] & { state: "pending" | "running" | "done" };

export default function Preflight() {
  const reduced = usePrefersReducedMotion();
  const [rows, setRows] = useState<Row[]>(() => PREFLIGHT.map((c) => ({ ...c, state: "pending" })));
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (reduced) {
      setRows(PREFLIGHT.map((c) => ({ ...c, state: "done" })));
      setStarted(true);
      return;
    }
    setStarted(true);
    setRunning(true);
    setRows(PREFLIGHT.map((c) => ({ ...c, state: "pending" })));
    PREFLIGHT.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => {
          setRows((prev) => prev.map((r, j) => (j === i ? { ...r, state: "running" } : r)));
        }, i * 520)
      );
      timers.current.push(
        setTimeout(() => {
          setRows((prev) => prev.map((r, j) => (j === i ? { ...r, state: "done" } : r)));
          if (i === PREFLIGHT.length - 1) setRunning(false);
        }, i * 520 + 400)
      );
    });
  };

  const doneCount = rows.filter((r) => r.state === "done").length;
  const passCount = rows.filter((r) => r.state === "done" && r.status === "pass").length;
  const warnCount = rows.filter((r) => r.state === "done" && r.status === "warn").length;

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-10 items-start">
      {/* intro / run control */}
      <div className="reveal lg:sticky lg:top-24">
        <div className="border border-line bg-panel p-6">
          <div className="flex items-center gap-2.5 text-phos">
            <IconBolt />
            <span className="fm text-[11px] tracking-[0.24em] uppercase">preflight v0.9</span>
          </div>
          <h3 className="fd font-bold text-xl mt-3 leading-snug">Simulate the checks your device must pass</h3>
          <p className="text-sm text-mut leading-relaxed mt-2.5">
            The exact probes to run in Termux before installing anything — ISA, userland width, repo availability,
            storage, memory, port and wake-lock.
          </p>
          <button
            onClick={run}
            disabled={running}
            className={`fm mt-6 w-full flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] px-5 py-3.5 border transition-all duration-300 cursor-pointer ${
              running
                ? "border-line2 text-dim cursor-wait"
                : "border-phos/60 text-phos bg-phos/[0.07] hover:bg-phos/15 hover:shadow-[0_0_28px_-6px_rgba(84,227,142,0.5)]"
            }`}
          >
            {running ? (
              <>
                <span className="spin inline-block w-3.5 h-3.5 border border-phos/30 border-t-phos rounded-full" />
                probing…
              </>
            ) : (
              <>▶ run preflight</>
            )}
          </button>
          {started && !running && (
            <div className="fm mt-5 grid grid-cols-3 text-center gap-2 text-[11px] tracking-wider">
              <div className="border border-line py-2.5">
                <div className="text-ink text-lg fd font-bold">{doneCount}</div>
                <div className="text-dim uppercase">checks</div>
              </div>
              <div className="border border-phos/30 py-2.5 text-phos">
                <div className="text-lg fd font-bold">{passCount}</div>
                <div className="uppercase opacity-70">pass</div>
              </div>
              <div className="border border-amber/30 py-2.5 text-amber">
                <div className="text-lg fd font-bold">{warnCount}</div>
                <div className="uppercase opacity-70">warn</div>
              </div>
            </div>
          )}
          {started && !running && warnCount > 0 && passCount > 0 && (
            <p className="fm text-[11px] text-amber/90 mt-4 leading-relaxed">
              ⚠ clear for launch with tuning — apply the heap cap noted in the WARN line.
            </p>
          )}
        </div>
      </div>

      {/* probe console */}
      <div className="reveal border border-line2 bg-[#0a0f0d]" style={{ transitionDelay: "120ms" }}>
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="fm text-[11px] text-mut tracking-wider">probe console — 7 checks</span>
          <span className="fm text-[10px] tracking-widest text-dim">
            {doneCount}/{PREFLIGHT.length}
          </span>
        </div>
        <div className="divide-y divide-line/60">
          {rows.map((r, i) => (
            <div key={r.cmd} className={`px-4 py-3.5 transition-all duration-500 ${r.state === "pending" ? "opacity-35" : "opacity-100"}`}>
              <div className="flex items-center gap-3">
                <span className="fm text-[10px] text-dim w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <code className="fm text-[12.5px] text-ink/90 truncate">
                  <span className="text-phos">$ </span>
                  {r.cmd}
                </code>
                <span className="ml-auto shrink-0">
                  {r.state === "running" && <span className="spin inline-block w-3.5 h-3.5 border border-cyan/30 border-t-cyan rounded-full" />}
                  {r.state === "done" && r.status === "pass" && (
                    <span className="fm flex items-center gap-1 text-[10px] tracking-widest text-phos">
                      <IconCheck className="w-3 h-3" /> PASS
                    </span>
                  )}
                  {r.state === "done" && r.status === "warn" && (
                    <span className="fm flex items-center gap-1 text-[10px] tracking-widest text-amber">
                      <IconWarn className="w-3 h-3" /> WARN
                    </span>
                  )}
                  {r.state === "pending" && <span className="fm text-[10px] tracking-widest text-dim">QUEUED</span>}
                </span>
              </div>
              {r.state === "done" && (
                <div className="pl-8 mt-1.5">
                  <p className="fm text-[11.5px] text-mut">→ {r.out}</p>
                  <p className="fm text-[11px] mt-0.5 text-dim">{r.note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

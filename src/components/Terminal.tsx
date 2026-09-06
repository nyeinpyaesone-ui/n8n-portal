import { useEffect, useRef, useState } from "react";
import { BOOT_SCRIPT } from "../data";
import { usePrefersReducedMotion } from "../hooks";
import { IconPlay } from "./ui";

type Seg = { kind: "cmd" | "line"; k?: "out" | "ok" | "err"; text: string };

export default function Terminal() {
  const reduced = usePrefersReducedMotion();
  const [segs, setSegs] = useState<Seg[]>([]);
  const [runId, setRunId] = useState(0);
  const [done, setDone] = useState(reduced);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSegs([]);
    setDone(false);
    let cancelled = false;
    let timer: number;

    const renderStatic = () => {
      const list: Seg[] = [];
      for (const l of BOOT_SCRIPT) list.push(l.k === "cmd" ? { kind: "cmd", text: l.t } : { kind: "line", k: l.k, text: l.t });
      setSegs(list);
      setDone(true);
    };

    if (reduced) {
      renderStatic();
      return;
    }

    const sleep = (ms: number) =>
      new Promise<void>((res) => {
        timer = window.setTimeout(res, ms);
      });

    (async () => {
      for (const line of BOOT_SCRIPT) {
        if (cancelled) return;
        if (line.k === "cmd") {
          setSegs((p) => [...p, { kind: "cmd", text: "" }]);
          for (let i = 1; i <= line.t.length; i++) {
            if (cancelled) return;
            const ch = line.t.slice(0, i);
            setSegs((p) => {
              const n = [...p];
              n[n.length - 1] = { kind: "cmd", text: ch };
              return n;
            });
            await sleep(11 + Math.random() * 26);
          }
          await sleep(240);
        } else {
          const k: "out" | "ok" | "err" = line.k;
          const burst = line.t.length > 90;
          if (burst) {
            const chunk = Math.ceil(line.t.length / 6);
            for (let i = chunk; i <= line.t.length + chunk; i += chunk) {
              if (cancelled) return;
              setSegs((p) => [...p, { kind: "line", k, text: line.t.slice(0, Math.min(i, line.t.length)) }]);
              await sleep(40);
            }
          } else {
            setSegs((p) => [...p, { kind: "line", k, text: line.t }]);
          }
          await sleep(line.k === "ok" ? 260 : 120);
        }
      }
      if (!cancelled) setDone(true);
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [runId, reduced]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [segs]);

  const color = (k?: string) => (k === "ok" ? "text-phos" : k === "err" ? "text-coral" : k === "warn" ? "text-amber" : "text-mut");

  return (
    <div className="border border-line bg-[#0b100e] shadow-[0_24px_70px_-24px_rgba(0,0,0,0.85)]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-line bg-panel">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-coral/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-phos/80" />
          </div>
          <span className="fm text-[11px] text-mut truncate">termux — proot-distro — 80×24</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full ${done ? "bg-phos" : "bg-amber"}`} />
          <span className="fm text-[10px] tracking-wider text-dim">{done ? "READY" : "BOOTING"}</span>
          <button
            onClick={() => setRunId((n) => n + 1)}
            className="fm flex items-center gap-1.5 text-[10px] tracking-widest text-mut border border-line px-2 py-1 hover:text-phos hover:border-phos/40 transition-colors"
            aria-label="Replay boot sequence"
          >
            <IconPlay className="w-3 h-3" /> RUN
          </button>
        </div>
      </div>
      <div ref={bodyRef} className="h-[330px] md:h-[400px] overflow-y-auto px-4 py-3 fm text-[12.5px] leading-[1.75] bg-scan">
        {segs.map((s, i) =>
          s.kind === "cmd" ? (
            <div key={i} className="text-ink">
              <span className="text-phos">~ $</span> {s.text}
              {i === segs.length - 1 && !done && <span className="cursor-blink text-phos">▋</span>}
            </div>
          ) : (
            <div key={i} className={color(s.k)}>
              {s.k === "ok" ? "✔ " : ""}
              {s.text}
            </div>
          )
        )}
        {done && (
          <div className="text-ink mt-1">
            <span className="text-phos">~ $</span> <span className="cursor-blink text-phos">▋</span>
          </div>
        )}
      </div>
      <div className="px-4 py-2 border-t border-line flex items-center justify-between gap-3">
        <span className="fm text-[10px] text-dim truncate">loopback 5678 · arm64 · glibc 2.39</span>
        <span className="fm text-[10px] text-phos/80 tracking-widest shrink-0">N8N READY</span>
      </div>
    </div>
  );
}

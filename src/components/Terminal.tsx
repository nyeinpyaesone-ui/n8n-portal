import { useEffect, useRef, useState } from "react";
import { TermLine } from "../data";
import { usePrefersReducedMotion } from "../hooks";
import { IconReplay } from "./ui";

type Rendered = TermLine & { done: boolean };

export default function Terminal({ script, title = "termux · aarch64", height = "h-[430px]" }: { script: TermLine[]; title?: string; height?: string }) {
  const reduced = usePrefersReducedMotion();
  const [runId, setRunId] = useState(0);
  const [lines, setLines] = useState<Rendered[]>([]);
  const [finished, setFinished] = useState(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reduced) {
      setLines(script.map((l) => ({ ...l, done: true })));
      setFinished(true);
      return;
    }
    setLines([]);
    setFinished(false);
    let li = 0;
    let ci = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (cancelled) return;
      if (li >= script.length) {
        setFinished(true);
        return;
      }
      const cur = script[li];
      if (cur.k === "cmd") {
        ci += 1;
        const partial = cur.t.slice(0, ci);
        setLines((prev) => {
          const copy = [...prev];
          if (copy.length === li) copy.push({ k: "cmd", t: partial, done: false });
          else copy[li] = { k: "cmd", t: partial, done: false };
          return copy;
        });
        if (ci >= cur.t.length) {
          setLines((prev) => {
            const copy = [...prev];
            copy[li] = { ...copy[li], done: true };
            return copy;
          });
          li += 1;
          ci = 0;
          timer = setTimeout(tick, 420);
        } else {
          timer = setTimeout(tick, 14 + Math.random() * 26);
        }
      } else {
        setLines((prev) => [...prev, { k: cur.k, t: cur.t, done: true }]);
        li += 1;
        ci = 0;
        timer = setTimeout(tick, cur.k === "ok" ? 340 : 150);
      }
    };

    timer = setTimeout(tick, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [script, reduced, runId]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const lastIsTyping = lines.length > 0 && lines[lines.length - 1].k === "cmd" && !lines[lines.length - 1].done;

  return (
    <div className="border border-line2 bg-[#0a0f0d] shadow-[0_24px_70px_-24px_rgba(0,0,0,0.85)] relative">
      {/* chrome */}
      <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5 bg-panel">
        <span className="w-2.5 h-2.5 rounded-full bg-coral/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-phos/70" />
        <span className="fm text-[11px] text-mut tracking-wider ml-2 truncate">{title}</span>
        <div className="ml-auto flex items-center gap-2">
          {finished && (
            <span className="fm text-[10px] text-phos tracking-widest hidden sm:inline">EXIT 0</span>
          )}
          <button
            onClick={() => setRunId((x) => x + 1)}
            className="fm flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-mut hover:text-phos border border-line2 hover:border-phos/50 px-2 py-1 transition-colors cursor-pointer"
            aria-label="Replay terminal session"
          >
            <IconReplay className="w-3 h-3" /> replay
          </button>
        </div>
      </div>
      {/* body */}
      <div ref={bodyRef} className={`fm text-[12.5px] leading-[1.75] px-4 py-4 overflow-y-auto ${height}`}>
        {lines.map((l, i) => {
          if (l.k === "cmd") {
            return (
              <div key={i} className="text-ink whitespace-pre-wrap break-all">
                <span className="text-phos font-bold select-none">❯ </span>
                {l.t}
                {!l.done && <span className="cursor-blink text-phos">▊</span>}
              </div>
            );
          }
          if (l.k === "ok") {
            return (
              <div key={i} className="text-phos/90 whitespace-pre-wrap break-all">
                <span className="select-none">✓ </span>
                {l.t}
              </div>
            );
          }
          if (l.k === "err") {
            return (
              <div key={i} className="text-amber whitespace-pre-wrap break-all">
                <span className="select-none">! </span>
                {l.t}
              </div>
            );
          }
          return (
            <div key={i} className="text-mut whitespace-pre-wrap break-all">
              {l.t}
            </div>
          );
        })}
        {(!lastIsTyping && !finished && lines.length > 0) || lines.length === 0 ? (
          <div className="text-phos/70">
            <span className="cursor-blink">▊</span>
          </div>
        ) : null}
        {finished && (
          <div className="mt-2 text-dim text-[11px] tracking-wider">
            — session complete · n8n serving on 127.0.0.1:5678 —
          </div>
        )}
      </div>
      {/* subtle inner glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-phos/[0.04] to-transparent" />
    </div>
  );
}

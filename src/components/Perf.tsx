import { useMemo, useState, type CSSProperties } from "react";
import { BENCH_ENVS, BENCHES, LEVERS, SQLITE_TUNE, SYNC_STATS, WATCHDOG } from "../data";
import { CodeBlock, CopyBtn, IconGauge, IconZap } from "./ui";

/* ---------------- sync stat strip ---------------- */
function SyncStats() {
  return (
    <div className="grid md:grid-cols-3 gap-px border border-line bg-line mb-14">
      {SYNC_STATS.map((s, i) => (
        <div key={s.label} className="reveal group bg-panel px-6 py-7 hover:bg-panel2 transition-colors duration-300" style={{ transitionDelay: `${i * 100}ms` }}>
          <div className="fd font-bold text-[44px] md:text-[54px] leading-none text-phos group-hover:text-ink transition-colors duration-300">{s.big}</div>
          <div className="fm text-[10px] tracking-[0.24em] uppercase text-mut mt-3">{s.label}</div>
          <p className="text-[13px] text-dim leading-relaxed mt-2.5">{s.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------- benchmark board ---------------- */
function fmt(v: number): string {
  return v >= 100 ? String(Math.round(v)) : v.toFixed(1);
}

function BenchBoard() {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div className="reveal border border-line bg-panel">
      <div className="flex items-center justify-between gap-4 px-5 md:px-7 py-4 border-b border-line flex-wrap">
        <div className="flex items-center gap-3">
          <IconGauge className="w-4.5 h-4.5 text-cyan" />
          <h3 className="fd font-semibold text-lg">Boundary benchmark board</h3>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {BENCH_ENVS.map((e) => (
            <span key={e.id} className="fm flex items-center gap-2 text-[10px] tracking-widest text-mut">
              <span className="w-2.5 h-2.5" style={{ background: e.color }} />
              {e.label}
            </span>
          ))}
        </div>
      </div>
      <div className="divide-y divide-line">
        {BENCHES.map((b, bi) => {
          const max = Math.max(...Object.values(b.values));
          return (
            <div
              key={b.metric}
              onMouseEnter={() => setHover(b.metric)}
              onMouseLeave={() => setHover(null)}
              className={`px-5 md:px-7 py-5 transition-colors duration-300 ${hover === b.metric ? "bg-panel2" : ""}`}
            >
              <div className="flex items-baseline justify-between gap-4 mb-3 flex-wrap">
                <span className="fd font-semibold text-[15px]">{b.metric}</span>
                <span className="fm text-[10px] tracking-widest text-dim uppercase">
                  {b.hint} · {b.unit}
                </span>
              </div>
              <div className="space-y-1.5">
                {BENCH_ENVS.map((e, ei) => {
                  const v = b.values[e.id];
                  const pct = Math.max(2, (v / max) * 100);
                  return (
                    <div key={e.id} className="flex items-center gap-3">
                      <span className="fm w-9 text-[10px] text-dim shrink-0">{e.id === "native" ? "NAT" : e.id === "proot" ? "PRO" : "QEM"}</span>
                      <div className="flex-1 h-[14px] bg-[#0a0f0d] relative overflow-hidden">
                        <div
                          className="b-fill h-full"
                          style={
                            {
                              "--w": `${pct}%`,
                              background: e.color,
                              opacity: e.id === "proot" ? 0.95 : 0.55,
                              transitionDelay: `${bi * 90 + ei * 120}ms`,
                            } as CSSProperties
                          }
                        />
                      </div>
                      <span
                        className={`fm w-16 text-right text-[11px] shrink-0 tabular-nums ${e.id === "proot" ? "text-phos font-medium" : "text-mut"}`}
                      >
                        {fmt(v)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <p className="fm px-5 md:px-7 py-3.5 border-t border-line text-[10.5px] text-dim leading-relaxed">
        Illustrative medians · Pixel 8 (Tensor G3) · UFS 3.1 · 5 runs each. Your silicon will differ — the ratios hold: PRoot stays within ~15% on
        syscall-heavy paths and is effectively free everywhere else.
      </p>
    </div>
  );
}

/* ---------------- interactive tuner ---------------- */
const STORAGES = [
  { id: "emmc", label: "eMMC 5.1", factor: 1.85, desc: "budget phones, older TV boxes" },
  { id: "ufs21", label: "UFS 2.1", factor: 1.22, desc: "mid-range phones" },
  { id: "ufs3", label: "UFS 3.x +", factor: 1.0, desc: "flagships & RK3588 boxes" },
] as const;

type StorageId = (typeof STORAGES)[number]["id"];

function Tuner() {
  const [ram, setRam] = useState(6);
  const [storage, setStorage] = useState<StorageId>("ufs3");
  const [thermal, setThermal] = useState(false);
  const [leversOn, setLeversOn] = useState<Set<string>>(() => new Set(LEVERS.map((l) => l.id)));

  const st = STORAGES.find((s) => s.id === storage)!;
  const pct = ((ram - 2) / (16 - 2)) * 100;

  const heap = useMemo(() => {
    let h = Math.round(((ram - 1.5) * 448) / 256) * 256;
    h = Math.max(512, Math.min(4096, h));
    if (thermal) h = Math.round((h * 0.85) / 256) * 256;
    return h;
  }, [ram, thermal]);

  const cold = useMemo(() => Math.round(36 * st.factor * (thermal ? 1.1 : 1)), [st, thermal]);

  const cuts = useMemo(() => LEVERS.filter((l) => leversOn.has(l.id)).reduce((a, l) => a + l.cut, 0), [leversOn]);
  const overhead = Math.max(18, 100 - cuts);
  const oColor = overhead > 70 ? "#ff5470" : overhead > 40 ? "#ffc061" : "#54e38e";

  const snippet = useMemo(
    () =>
      `# generated profile — ${ram} GB RAM · ${st.label}${thermal ? " · sustained load" : ""}
export NODE_OPTIONS="--max-old-space-size=${heap}"
export N8N_DEFAULT_BINARY_DATA_MODE=filesystem
export N8N_BINARY_DATA_STORAGE_PATH=$HOME/.n8n/binary
export N8N_BINARY_DATA_TTL=48
export EXECUTIONS_DATA_PRUNE=true
export EXECUTIONS_DATA_MAX_AGE=${ram >= 8 ? 168 : 96}
export EXECUTIONS_DATA_SAVE_ON_SUCCESS=none
export N8N_CONCURRENCY_PRODUCTION_LIMIT=${ram >= 8 ? 10 : 5}`,
    [ram, st, thermal, heap]
  );

  const toggle = (id: string) =>
    setLeversOn((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="grid lg:grid-cols-[minmax(0,400px)_1fr] gap-8 items-start">
      {/* controls */}
      <div className="reveal border border-line bg-panel p-5 md:p-6 lg:sticky lg:top-24">
        <div className="flex items-center gap-3">
          <IconZap className="w-4.5 h-4.5 text-amber" />
          <h3 className="fd font-semibold text-lg">Device tuner</h3>
        </div>
        <p className="text-[13px] text-dim leading-relaxed mt-2">Describe the hardware; the profile retunes the host↔container seams live.</p>

        {/* RAM */}
        <div className="mt-6">
          <div className="flex items-baseline justify-between mb-3">
            <label htmlFor="ram" className="fm text-[11px] tracking-widest text-mut uppercase">device RAM</label>
            <span className="fd font-bold text-xl text-phos">{ram} GB</span>
          </div>
          <input
            id="ram"
            type="range"
            min={2}
            max={16}
            step={1}
            value={ram}
            onChange={(e) => setRam(Number(e.target.value))}
            style={{ background: `linear-gradient(90deg, #54e38e ${pct}%, #243229 ${pct}%)` }}
          />
          <div className="fm flex justify-between text-[9.5px] text-dim mt-1.5">
            <span>2</span><span>8</span><span>16</span>
          </div>
        </div>

        {/* storage */}
        <div className="mt-6">
          <p className="fm text-[11px] tracking-widest text-mut uppercase mb-3">flash storage</p>
          <div className="grid grid-cols-3 gap-1.5">
            {STORAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStorage(s.id)}
                aria-pressed={storage === s.id}
                className={`border px-2 py-2.5 text-center transition-all duration-200 ${
                  storage === s.id ? "border-phos/60 bg-phos/[0.08] text-ink" : "border-line text-mut hover:border-line2 hover:text-ink"
                }`}
              >
                <span className="fd block font-semibold text-[12.5px]">{s.label}</span>
                <span className="fm block text-[9px] text-dim mt-1 leading-tight">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* thermal */}
        <button
          onClick={() => setThermal((t) => !t)}
          aria-pressed={thermal}
          className="mt-6 w-full flex items-center justify-between gap-4 border border-line hover:border-line2 px-4 py-3.5 transition-colors duration-200"
        >
          <span className="text-left">
            <span className="fd block font-semibold text-[14px]">Sustained-load mode</span>
            <span className="block text-[12px] text-dim mt-0.5">Long-running workflows → thermal derating budget</span>
          </span>
          <span className={`relative shrink-0 w-10 h-[22px] border transition-colors duration-200 ${thermal ? "border-phos/60 bg-phos/15" : "border-line2 bg-[#0a0f0d]"}`}>
            <span
              className="absolute top-[3px] w-[14px] h-[14px] transition-all duration-200"
              style={{ left: thermal ? "calc(100% - 17px)" : "3px", background: thermal ? "#54e38e" : "#5f756a" }}
            />
          </span>
        </button>

        {/* levers */}
        <div className="mt-7">
          <div className="flex items-baseline justify-between mb-2">
            <p className="fm text-[11px] tracking-widest text-mut uppercase">sync levers · {leversOn.size}/{LEVERS.length}</p>
            <span className="fm text-[11px] text-phos">−{cuts}%</span>
          </div>
          <div className="space-y-px border border-line divide-y divide-line bg-[#0a0f0d]">
            {LEVERS.map((l) => {
              const on = leversOn.has(l.id);
              return (
                <button
                  key={l.id}
                  onClick={() => toggle(l.id)}
                  aria-pressed={on}
                  title={l.why}
                  className={`group w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors duration-200 ${
                    on ? "bg-phos/[0.05]" : "hover:bg-panel2"
                  }`}
                >
                  <span className="min-w-0">
                    <span className={`fd block font-medium text-[13px] transition-colors ${on ? "text-ink" : "text-dim"}`}>{l.label}</span>
                    <span className="block text-[11px] text-dim leading-snug mt-0.5">{l.why}</span>
                  </span>
                  <span className={`fm shrink-0 text-[10px] px-1.5 py-0.5 border transition-colors ${on ? "text-phos border-phos/40" : "text-dim border-line"}`}>
                    −{l.cut}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* outputs */}
      <div className="space-y-6">
        <div className="reveal grid sm:grid-cols-2 gap-px border border-line bg-line" style={{ transitionDelay: "90ms" }}>
          <div className="bg-panel px-6 py-6">
            <p className="fm text-[10px] tracking-[0.22em] text-dim uppercase">recommended V8 heap</p>
            <p className="fd font-bold text-[40px] leading-none mt-2.5 text-phos">
              {heap}
              <span className="text-lg text-mut ml-1">MB</span>
            </p>
            <p className="text-[12px] text-dim mt-2">NODE_OPTIONS cap before Android's LMK gets a vote.</p>
          </div>
          <div className="bg-panel px-6 py-6">
            <p className="fm text-[10px] tracking-[0.22em] text-dim uppercase">estimated cold start</p>
            <p className="fd font-bold text-[40px] leading-none mt-2.5 text-cyan">
              ~{cold}
              <span className="text-lg text-mut ml-1">s</span>
            </p>
            <p className="text-[12px] text-dim mt-2">{st.label} · {thermal ? "with thermal headroom" : "burst-friendly"}.</p>
          </div>
        </div>

        {/* overhead meter */}
        <div className="reveal border border-line bg-panel px-6 py-5" style={{ transitionDelay: "140ms" }}>
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <p className="fm text-[11px] tracking-widest text-mut uppercase">relative syscall-path cost</p>
            <p className="fd font-bold text-2xl" style={{ color: oColor }}>
              {overhead}<span className="text-sm text-mut">/100</span>
            </p>
          </div>
          <div className="h-2.5 bg-[#0a0f0d] mt-3 overflow-hidden">
            <div className="overhead-fill h-full" style={{ width: `${overhead}%`, background: oColor }} />
          </div>
          <p className="fm text-[10.5px] text-dim mt-2.5">100 = un-tuned PRoot baseline · every enabled lever trims the host↔container toll</p>
        </div>

        {/* generated profile */}
        <div className="reveal" style={{ transitionDelay: "180ms" }}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="fm text-[11px] tracking-widest text-mut uppercase">generated profile → ~/.bashrc (rootfs)</p>
            <CopyBtn text={snippet} />
          </div>
          <div className="bg-[#0a0f0d] border border-line overflow-x-auto">
            <pre className="fm text-[12px] leading-relaxed text-ink/90 px-4 py-3.5 whitespace-pre">{snippet}</pre>
          </div>
        </div>

        {/* sqlite + watchdog */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="reveal" style={{ transitionDelay: "220ms" }}>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="fm text-[11px] tracking-widest text-mut uppercase">SQLite sync retune</p>
              <CopyBtn text={SQLITE_TUNE} />
            </div>
            <div className="bg-[#0a0f0d] border border-line overflow-x-auto h-[calc(100%-2rem)]">
              <pre className="fm text-[11.5px] leading-relaxed text-ink/90 px-4 py-3.5 whitespace-pre">{SQLITE_TUNE}</pre>
            </div>
          </div>
          <div className="reveal" style={{ transitionDelay: "260ms" }}>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="fm text-[11px] tracking-widest text-mut uppercase">watchdog across the boundary</p>
              <CopyBtn text={WATCHDOG} />
            </div>
            <div className="bg-[#0a0f0d] border border-line overflow-x-auto h-[calc(100%-2rem)]">
              <pre className="fm text-[11.5px] leading-relaxed text-ink/90 px-4 py-3.5 whitespace-pre">{WATCHDOG}</pre>
            </div>
          </div>
        </div>

        {/* one-liner runners */}
        <div className="reveal space-y-2.5" style={{ transitionDelay: "300ms" }}>
          <CodeBlock cmd='proot-distro login ubuntu --bind /sdcard:/media --kill-on-exit' index="bind mount" />
          <CodeBlock cmd='tmux new-session -d -s watch "bash ~/watchdog.sh"   # Termux side' index="watchdog" />
        </div>
      </div>
    </div>
  );
}

export default function Perf() {
  return (
    <div>
      <SyncStats />
      <div className="space-y-14">
        <BenchBoard />
        <Tuner />
      </div>
    </div>
  );
}

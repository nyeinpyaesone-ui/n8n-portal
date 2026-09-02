import { ReactNode, useState } from "react";

/* ---------------- custom inline icons ---------------- */

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const IconCopy = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <rect x="9" y="9" width="11" height="11" />
    <path d="M5 15H4V4h11v1" />
  </svg>
);

export const IconCheck = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

export const IconChip = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <rect x="6" y="6" width="12" height="12" />
    <rect x="10" y="10" width="4" height="4" />
    <path d="M9 6V3M15 6V3M9 21v-3M15 21v-3M6 9H3M6 15H3M21 9h-3M21 15h-3" />
  </svg>
);

export const IconStack = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z" />
    <path d="M3 12.5l9 4.5 9-4.5" />
    <path d="M3 17l9 4.5 9-4.5" />
  </svg>
);

export const IconPrompt = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <rect x="2.5" y="4" width="19" height="16" />
    <path d="M6.5 9l3.5 3-3.5 3M12.5 15.5H17" />
  </svg>
);

export const IconWarn = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M12 3.5L22 20H2L12 3.5z" />
    <path d="M12 10v4.5M12 17.2v.3" />
  </svg>
);

export const IconBolt = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M13 2.5L4.5 13.5H11l-1 8L18.5 10H12l1-7.5z" />
  </svg>
);

export const IconGauge = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M4 15.5a8 8 0 1 1 16 0" />
    <path d="M12 15.5L16 9" />
    <path d="M3 19h18" />
  </svg>
);

export const IconReplay = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M4.5 5v5h5" />
    <path d="M4.8 10A8 8 0 1 1 4 13.5" />
  </svg>
);

export const IconArrow = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...S}>
    <path d="M4 12h16M13 5l7 7-7 7" />
  </svg>
);

/* ---------------- copy button ---------------- */

export function CopyBtn({ text, label = "copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setDone(true);
    window.setTimeout(() => setDone(false), 1600);
  };
  return (
    <button
      onClick={copy}
      aria-label={`Copy: ${label}`}
      className={`fm flex items-center gap-1.5 text-[11px] uppercase tracking-wider px-2.5 py-1.5 border transition-all duration-200 cursor-pointer ${
        done
          ? "border-phos/60 text-phos bg-phos/10"
          : "border-line2 text-mut hover:text-ink hover:border-phos/50 hover:bg-phos/5"
      }`}
    >
      {done ? <IconCheck className="w-3.5 h-3.5" /> : <IconCopy className="w-3.5 h-3.5" />}
      {done ? "copied" : label}
    </button>
  );
}

/* ---------------- code block ---------------- */

export function CodeBlock({ title, code, tone = "phos" }: { title: string; code: string; tone?: "phos" | "coral" | "amber" | "cyan" }) {
  const toneText = { phos: "text-phos", coral: "text-coral", amber: "text-amber", cyan: "text-cyan" }[tone];
  return (
    <div className="group border border-line bg-[#0a0f0d] transition-colors duration-300 hover:border-line2">
      <div className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-2">
        <span className={`fm text-[11px] tracking-wider ${toneText}`}>
          <span className="opacity-60">❯ </span>
          {title}
        </span>
        <CopyBtn text={code} />
      </div>
      <pre className="fm text-[12.5px] leading-relaxed px-4 py-3.5 overflow-x-auto text-ink/90 whitespace-pre">{code}</pre>
    </div>
  );
}

/* ---------------- section header ---------------- */

export function SectionHead({
  kicker,
  title,
  desc,
  tone = "text-phos",
}: {
  kicker: string;
  title: ReactNode;
  desc?: string;
  tone?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className={`fm text-[11px] md:text-xs uppercase tracking-[0.28em] ${tone} mb-4 flex items-center gap-3`}>
        <span className="inline-block h-px w-8 bg-current opacity-70" />
        {kicker}
      </p>
      <h2 className="fd font-bold text-[clamp(1.7rem,4.2vw,3rem)] leading-[1.06] tracking-tight text-ink">{title}</h2>
      {desc && <p className="mt-4 text-mut text-[15px] md:text-base leading-relaxed max-w-2xl">{desc}</p>}
    </div>
  );
}

export function ToneDot({ tone }: { tone: "phos" | "coral" | "amber" | "cyan" | "ink" }) {
  const c = {
    phos: "bg-phos text-phos",
    coral: "bg-coral text-coral",
    amber: "bg-amber text-amber",
    cyan: "bg-cyan text-cyan",
    ink: "bg-mut text-mut",
  }[tone];
  return <span className={`relative inline-block w-1.5 h-1.5 rounded-full ping-dot ${c}`} />;
}

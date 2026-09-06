import { type ButtonHTMLAttributes, type ReactNode, useState } from "react";

type IconProps = { className?: string };

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconChip = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
    <rect x="7" y="7" width="10" height="10" />
    <rect x="10" y="10" width="4" height="4" />
    <path d="M9 7V3M12 7V3M15 7V3M9 21v-4M12 21v-4M15 21v-4M7 9H3M7 12H3M7 15H3M21 9h-4M21 12h-4M21 15h-4" />
  </svg>
);

export const IconCopy = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
    <rect x="9" y="9" width="11" height="11" />
    <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
  </svg>
);

export const IconCheck = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

export const IconPlay = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="none" aria-hidden>
    <path d="M7 4.5v15l13-7.5z" />
  </svg>
);

export const IconChevron = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const IconWarn = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
    <path d="M12 3.5L22 20H2z" />
    <path d="M12 10v4.5" />
    <circle cx="12" cy="17.2" r="0.4" fill="currentColor" />
  </svg>
);

export const IconBox = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
    <path d="M12 2.5l8.5 4.5v10L12 21.5 3.5 17V7z" />
    <path d="M3.5 7L12 11.5 20.5 7M12 11.5v10" />
  </svg>
);

export const IconNode = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
    <circle cx="12" cy="12" r="2.6" />
    <circle cx="4.5" cy="6" r="1.8" />
    <circle cx="19.5" cy="6" r="1.8" />
    <circle cx="4.5" cy="18" r="1.8" />
    <circle cx="19.5" cy="18" r="1.8" />
    <path d="M6 7.2l3.9 3.3M18 7.2l-3.9 3.3M6 16.8l3.9-3.3M18 16.8l-3.9-3.3" />
  </svg>
);

export const IconGauge = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
    <path d="M4 17a8 8 0 1 1 16 0" />
    <path d="M12 17l4.5-5" />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
  </svg>
);

export const IconZap = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
    <path d="M13 2.5L4.5 13.5H11l-1 8L19 10.5h-6.5z" />
  </svg>
);

export const IconInfo = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} {...S} aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5" />
    <circle cx="12" cy="7.5" r="0.4" fill="currentColor" />
  </svg>
);

export function CopyBtn({ text, label = "copy" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setOk(true);
      window.setTimeout(() => setOk(false), 1600);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      setOk(true);
      window.setTimeout(() => setOk(false), 1600);
    }
  };
  return (
    <button
      onClick={copy}
      className={`fm flex items-center gap-1.5 text-[10.5px] tracking-[0.14em] uppercase px-2.5 py-1.5 border transition-all duration-200 hover:-translate-y-0.5 ${
        ok ? "text-phos border-phos/50 bg-phos/10" : "text-mut border-line hover:text-ink hover:border-line2"
      }`}
    >
      {ok ? <IconCheck className="w-3.5 h-3.5" /> : <IconCopy className="w-3.5 h-3.5" />}
      {ok ? "copied" : label}
    </button>
  );
}

export function CodeBlock({ cmd, index }: { cmd: string; index?: string }) {
  return (
    <div className="group relative bg-[#0a0f0d] border border-line hover:border-line2 transition-colors duration-300">
      {index && (
        <span className="fm absolute -top-2.5 left-3 text-[10px] text-dim bg-bg px-1.5 tracking-widest">{index}</span>
      )}
      <pre className="fm text-[12.5px] leading-relaxed text-ink/90 overflow-x-auto py-3 pl-4 pr-14 whitespace-pre">
        <span className="text-phos select-none">$ </span>
        {cmd}
      </pre>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
        <CopyBtn text={cmd} label="" />
      </div>
    </div>
  );
}

export function SectionHead({
  idx,
  eyebrow,
  title,
  desc,
}: {
  idx: string;
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="reveal mb-10 md:mb-14">
      <div className="flex items-center gap-4">
        <span className="fd font-bold text-[15px] text-phos tracking-[0.2em]">/{idx}</span>
        <span className="h-px flex-1 bg-line" />
        <span className="fm text-[10px] md:text-[11px] tracking-[0.3em] text-dim uppercase">{eyebrow}</span>
      </div>
      <h2 className="fd font-bold text-[26px] md:text-[40px] leading-[1.05] mt-5 max-w-3xl">{title}</h2>
      {desc && <p className="text-mut text-[15px] md:text-base max-w-2xl mt-4 leading-relaxed">{desc}</p>}
    </div>
  );
}

const tones: Record<string, string> = {
  phos: "text-phos border-phos/35 bg-phos/[0.06]",
  coral: "text-coral border-coral/35 bg-coral/[0.06]",
  amber: "text-amber border-amber/35 bg-amber/[0.06]",
  cyan: "text-cyan border-cyan/35 bg-cyan/[0.06]",
  ink: "text-mut border-line bg-panel2",
};

export function Tag({ children, tone = "phos" }: { children: ReactNode; tone?: string }) {
  return (
    <span className={`fm inline-flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase px-2 py-1 border ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function GhostBtn({
  children,
  href,
  className = "",
  ...rest
}: { children: ReactNode; href?: string; className?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `fm inline-flex items-center gap-2 text-[12px] tracking-[0.14em] uppercase border transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${className}`;
  if (href)
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  return (
    <button {...rest} className={cls}>
      {children}
    </button>
  );
}

export function ToneDot({ tone }: { tone: string }) {
  const map: Record<string, string> = { phos: "#54e38e", coral: "#ff5470", amber: "#ffc061", cyan: "#63d3e6", ink: "#8fa69a" };
  return <span className="inline-block w-2 h-2 rotate-45" style={{ background: map[tone] ?? map.phos }} />;
}

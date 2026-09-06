import { useEffect, useState } from "react";
import ArchDiagram from "./components/ArchDiagram";
import * as Extras from "./components/Extras";
import Perf from "./components/Perf";
import Pipeline from "./components/Pipeline";
import Preflight from "./components/Preflight";
import Reference from "./components/Reference";
import Terminal from "./components/Terminal";
import { CodeBlock, GhostBtn, IconBox, IconChip, IconNode, SectionHead } from "./components/ui";
import { useRevealContainer, useScramble } from "./hooks";

const NAV = [
  { id: "boot", label: "01·BOOT" },
  { id: "arch", label: "02·STACK" },
  { id: "pre", label: "03·PRE" },
  { id: "deploy", label: "04·DEPLOY" },
  { id: "perf", label: "05·SYNC" },
  { id: "ref", label: "06·REF" },
  { id: "matrix", label: "07·MATRIX" },
  { id: "faq", label: "08·FIX" },
];

const TICKER = [
  "aarch64 native",
  "proot-distro 4.19",
  "ubuntu 24.04 rootfs",
  "glibc 2.39",
  "node 20 lts",
  "n8n on :5678",
  "no root required",
  "no qemu · no emulation",
  "shared netns",
  "sqlite persistence",
  "tmux + wake-lock",
  "ptrace shim",
];

function Hero() {
  const title = useScramble("N8N // AARCH64");
  return (
    <section id="boot" className="relative pt-28 md:pt-36 pb-14 md:pb-20 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
        <div>
          <div className="reveal inline-flex items-center gap-2.5 border border-phos/30 bg-phos/[0.06] text-phos fm text-[11px] tracking-[0.22em] uppercase px-3.5 py-2">
            <span className="relative w-1.5 h-1.5 rounded-full bg-phos ping-dot text-phos" />
            localhost field guide · rootless
          </div>
          <h1 className="fd font-bold text-[clamp(38px,7vw,76px)] leading-[0.98] mt-6 tracking-tight">
            <span className="block">{title}</span>
            <span className="stroke-text block">ISOLATED CONTAINER</span>
          </h1>
          <p className="text-mut text-[15.5px] md:text-[17px] leading-relaxed mt-6 max-w-xl reveal" style={{ transitionDelay: "120ms" }}>
            Run <strong className="text-ink font-semibold">n8n</strong> on <code className="fm text-cyan text-[14px]">http://localhost:5678</code>{" "}
            from any aarch64 Android device — a full Ubuntu rootfs fake-chrooted by{" "}
            <strong className="text-ink font-semibold">proot-distro</strong>, sharing your kernel, your loopback and your files. No root. No QEMU.
            No excuses.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-8 reveal" style={{ transitionDelay: "200ms" }}>
            <GhostBtn href="#deploy" className="px-5 py-3 bg-phos text-[#08130c] border-phos hover:bg-[#6ff0a4] font-bold">
              ▸ run the pipeline
            </GhostBtn>
            <GhostBtn href="#arch" className="px-5 py-3 text-mut border-line2 hover:text-ink hover:border-mut">
              inspect the stack
            </GhostBtn>
          </div>
          <div className="flex flex-wrap gap-5 mt-9 fm text-[11.5px] text-dim reveal" style={{ transitionDelay: "280ms" }}>
            <span className="flex items-center gap-2"><IconChip className="w-4 h-4 text-phos" /> ARMv8 native</span>
            <span className="flex items-center gap-2"><IconBox className="w-4 h-4 text-amber" /> ~1.6 GB footprint</span>
            <span className="flex items-center gap-2"><IconNode className="w-4 h-4 text-coral" /> :5678 loopback</span>
          </div>
        </div>
        <div className="reveal" style={{ transitionDelay: "160ms" }}>
          <Terminal />
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  return (
    <div className="relative border-y border-line bg-panel overflow-hidden py-3" aria-hidden>
      <div className="marquee-track flex whitespace-nowrap w-max">
        {[0, 1].map((n) => (
          <div key={n} className="flex items-center">
            {TICKER.map((t) => (
              <span key={`${n}-${t}`} className="fm text-[11.5px] tracking-[0.18em] uppercase text-dim mx-5 flex items-center gap-5">
                <span className="text-phos/70">▚</span> {t}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-12 grid md:grid-cols-[1fr_auto] gap-8 items-start">
        <div>
          <p className="fd font-bold text-xl">N8N<span className="text-phos">//</span>AARCH64</p>
          <p className="text-mut text-[13.5px] leading-relaxed mt-3 max-w-lg">
            Everything on this page runs without touching the kernel: PRoot shims syscalls in userland, the network namespace is shared, and
            performance is tuned at the seams. Benchmark numbers are illustrative medians — measure your own silicon.
          </p>
        </div>
        <div className="space-y-2.5">
          <CodeBlock cmd="proot-distro login ubuntu" />
          <CodeBlock cmd="curl -s http://localhost:5678/healthz" />
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-5 flex items-center justify-between gap-4 flex-wrap fm text-[10.5px] tracking-[0.18em] uppercase text-dim">
          <span>field guide · single device · zero servers</span>
          <span className="text-phos/70">end of transmission ▋</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const ref = useRevealContainer<HTMLDivElement>();
  const [scrolled, setScrolled] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setScrolled(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={ref} className="relative min-h-screen bg-bg text-ink">
      {/* ambient layers */}
      <div className="fixed inset-0 pointer-events-none bg-glow" />
      <div className="fixed inset-0 pointer-events-none bg-grid" />
      <div className="fixed inset-0 pointer-events-none bg-scan" />
      <div className="noise" />

      {/* nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-line/80 bg-bg/90 backdrop-blur-sm">
        <div className="absolute top-0 left-0 h-[2px] bg-phos transition-[width] duration-150" style={{ width: `${scrolled}%` }} />
        <div className="mx-auto max-w-7xl px-5 md:px-8 h-14 flex items-center justify-between gap-4">
          <a href="#boot" className="fd font-bold text-[17px] tracking-wide shrink-0">
            N8N<span className="text-phos">//</span>AARCH64
          </a>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="fm text-[11px] tracking-widest text-mut hover:text-phos px-2.5 py-1.5 border border-transparent hover:border-line transition-colors duration-200"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <a
            href="https://docs.n8n.io/hosting/"
            target="_blank"
            rel="noreferrer"
            className="fm text-[11px] tracking-widest text-phos border border-phos/40 px-3 py-1.5 hover:bg-phos/10 transition-colors duration-200 shrink-0"
          >
            N8N DOCS ↗
          </a>
        </div>
      </header>

      <main className="relative">
        <Hero />
        <Ticker />

        <section id="arch" className="scroll-mt-20 mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28">
          <SectionHead
            idx="02"
            eyebrow="isolation anatomy"
            title="Seven layers, one kernel, zero root"
            desc="Tap any layer to inspect what it contributes. PRoot draws the dashed line: everything above it lives inside the fake chroot; the network stack and the silicon are shared."
          />
          <ArchDiagram />
        </section>

        <section id="pre" className="scroll-mt-20 mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28 border-t border-line">
          <SectionHead
            idx="03"
            eyebrow="before you type anything"
            title="Run the preflight probes"
            desc="Seven checks decide whether this device is a smooth n8n host or a swap-thrashing mess. The console below replays them exactly as your terminal would."
          />
          <Preflight />
        </section>

        <section id="deploy" className="scroll-mt-20 mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28 border-t border-line">
          <SectionHead
            idx="04"
            eyebrow="the pipeline"
            title="From bare Termux to a running editor"
            desc="Seven stages, each tagged with where its commands run. Copy them one by one — or grab the whole sequence from the rail."
          />
          <Pipeline />
        </section>

        <section id="perf" className="scroll-mt-20 mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28 border-t border-line">
          <SectionHead
            idx="05"
            eyebrow="hardware ↔ container"
            title="Synchronization & performance tuning"
            desc="PRoot shares the kernel, the loopback and the storage — but every syscall still crosses a ptrace boundary. This is where you make that crossing disappear: measure it, tune the seams, and keep n8n alive when Android gets aggressive."
          />
          <Perf />
        </section>

        <section id="ref" className="scroll-mt-20 mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28 border-t border-line">
          <SectionHead
            idx="06"
            eyebrow="runtime reference"
            title="Configs you will actually paste"
            desc="The environment block, a tmux-based launcher that survives terminal closes, and two ways to receive webhooks without a public IP."
          />
          <Reference />
        </section>

        <section id="matrix" className="scroll-mt-20 mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28 border-t border-line">
          <SectionHead
            idx="07"
            eyebrow="compatibility matrix"
            title="Pick your rootfs, know your ceiling"
            desc="The libc inside the container decides how painless npm will be; the RAM on your device decides how big n8n can think."
          />
          <Extras.Matrix />
        </section>

        <section id="faq" className="scroll-mt-20 mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28 border-t border-line">
          <SectionHead
            idx="08"
            eyebrow="troubleshooting console"
            title="When the container fights back"
            desc="Every failure mode below has been hit in the wild on real arm64 devices. Open a line, apply the fix, move on."
          />
          <Extras.Faq />
        </section>
      </main>

      <Footer />
    </div>
  );
}

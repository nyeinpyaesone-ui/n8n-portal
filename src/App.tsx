import { useEffect, useState } from "react";
import ArchDiagram from "./components/ArchDiagram";
import { Matrices, Faq } from "./components/Extras";
import Pipeline from "./components/Pipeline";
import Preflight from "./components/Preflight";
import Reference from "./components/Reference";
import Terminal from "./components/Terminal";
import { CodeBlock, IconArrow, SectionHead } from "./components/ui";
import { BOOT_SCRIPT } from "./data";
import { useRevealContainer, useScramble } from "./hooks";

const NAV = [
  { id: "stack", label: "stack" },
  { id: "pipeline", label: "pipeline" },
  { id: "preflight", label: "preflight" },
  { id: "runtime", label: "runtime" },
  { id: "matrix", label: "matrix" },
  { id: "troubleshoot", label: "troubleshoot" },
];

const TICKER = [
  "PROOT-DISTRO",
  "PTRACE SYSCALL SHIM",
  "ARMV8-A",
  "GLIBC 2.39",
  "NODE 20 LTS",
  "SQLITE",
  "PORT 5678",
  "NO ROOT",
  "NO SYSTEMD",
  "TERMUX USERLAND",
  "SHARED LOOPBACK",
  "AARCH64 NATIVE",
];

const RECAP = `# the whole deployment, condensed
pkg install -y proot-distro
proot-distro install ubuntu
proot-distro login ubuntu
apt update && apt install -y curl build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs
npm install -g n8n
N8N_PORT=5678 N8N_LISTEN_ADDRESS=127.0.0.1 n8n start
# → http://localhost:5678`;

function ProgressNav() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? h.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-bg/85 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-14 flex items-center gap-6">
        <a href="#top" className="fd font-bold text-[17px] tracking-tight shrink-0">
          <span className="text-coral">n8n</span>
          <span className="text-dim">//</span>
          <span className="text-ink">aarch64</span>
        </a>
        <nav className="hidden md:flex items-center gap-1 ml-auto">
          {NAV.map((n, i) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="fm text-[11px] tracking-[0.14em] uppercase text-mut hover:text-phos px-3 py-2 transition-colors duration-200"
            >
              <span className="text-dim mr-1.5">0{i + 1}</span>
              {n.label}
            </a>
          ))}
        </nav>
        <a
          href="#pipeline"
          className="fm hidden sm:flex md:ml-0 ml-auto items-center gap-2 text-[11px] tracking-[0.16em] uppercase text-phos border border-phos/50 bg-phos/[0.06] hover:bg-phos/15 px-3.5 py-2 transition-all duration-200 shrink-0"
        >
          deploy <IconArrow className="w-3 h-3" />
        </a>
      </div>
      <div className="absolute bottom-0 left-0 h-[2px] bg-phos shadow-[0_0_10px_rgba(84,227,142,0.7)]" style={{ width: `${p * 100}%` }} />
    </header>
  );
}

function Hero() {
  const l1 = useScramble("RUN n8n LOCALLY");
  const l2 = useScramble("ON ARM64 SILICON.");
  return (
    <section id="top" className="relative pt-28 md:pt-36 pb-14 md:pb-20">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-[1.02fr_1fr] gap-12 lg:gap-14 items-center">
        {/* left: headline */}
        <div>
          <div className="reveal flex flex-wrap items-center gap-2 mb-7">
            {["termux", "proot-distro", "aarch64", "no root"].map((t) => (
              <span key={t} className="fm text-[10.5px] tracking-[0.2em] uppercase text-mut border border-line2 px-2.5 py-1.5 hover:border-phos/50 hover:text-phos transition-colors duration-200">
                {t}
              </span>
            ))}
          </div>
          <h1 className="fd font-bold text-[clamp(2.35rem,6.2vw,4.6rem)] leading-[0.98] tracking-tight">
            <span className="block text-ink whitespace-pre">{l1 || " "}</span>
            <span className="block whitespace-pre">
              <span className="text-phos">{(l2 || " ").replace(".", "")}</span>
              <span className="text-phos">.</span>
            </span>
          </h1>
          <p className="reveal mt-7 text-mut text-[15px] md:text-[16.5px] leading-relaxed max-w-xl" style={{ transitionDelay: "120ms" }}>
            A field guide to running the <span className="text-ink">n8n automation engine</span> entirely on your
            aarch64 device — an Ubuntu arm64 rootfs sealed inside{" "}
            <span className="text-ink">proot-distro</span>'s ptrace isolation, served on loopback. No emulator, no
            root, no cloud. Your pocket silicon <em className="text-ink not-italic border-b border-coral/50">is</em> the server.
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-4" style={{ transitionDelay: "200ms" }}>
            <a
              href="#pipeline"
              className="fm group flex items-center gap-2.5 text-xs uppercase tracking-[0.18em] text-bg bg-phos px-5 py-3.5 font-medium hover:bg-ink transition-colors duration-300"
            >
              ▶ walk the pipeline
              <IconArrow className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#stack"
              className="fm flex items-center gap-2.5 text-xs uppercase tracking-[0.18em] text-mut border border-line2 hover:text-ink hover:border-phos/50 px-5 py-3.5 transition-colors duration-300"
            >
              inspect the stack
            </a>
          </div>
          {/* stat strip */}
          <div className="reveal mt-10 grid grid-cols-2 sm:grid-cols-4 border border-line bg-panel/70 divide-x divide-y sm:divide-y-0 divide-line" style={{ transitionDelay: "280ms" }}>
            {[
              ["5678", "serving port"],
              ["2.1 GB", "footprint"],
              ["0", "root required"],
              ["0", "emulation layers"],
            ].map(([v, k]) => (
              <div key={k} className="px-4 py-3.5">
                <p className="fd font-bold text-xl text-ink">{v}</p>
                <p className="fm text-[9.5px] tracking-[0.18em] uppercase text-dim mt-0.5">{k}</p>
              </div>
            ))}
          </div>
        </div>

        {/* right: live terminal */}
        <div className="reveal" style={{ transitionDelay: "160ms" }}>
          <p className="fm text-[10.5px] tracking-[0.24em] uppercase text-dim mb-3 flex items-center gap-2">
            <span className="relative inline-block w-1.5 h-1.5 rounded-full bg-phos text-phos ping-dot" />
            live boot transcript — types itself, replays on demand
          </p>
          <Terminal script={BOOT_SCRIPT} title="termux · aarch64 — deployment" />
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="relative border-y border-line bg-panel/50 overflow-hidden py-3" aria-hidden>
      <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap">
        {items.map((t, i) => (
          <span key={i} className="fm text-[11px] tracking-[0.3em] text-dim flex items-center gap-8">
            <span className={i % 3 === 0 ? "text-phos/60" : i % 3 === 1 ? "text-coral/50" : "text-amber/50"}>✦</span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Section({
  id,
  num,
  kicker,
  title,
  desc,
  children,
  tone,
}: {
  id: string;
  num: string;
  kicker: string;
  title: React.ReactNode;
  desc?: string;
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <section id={id} className="relative scroll-mt-20 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex items-end justify-between gap-6 mb-12 md:mb-16">
          <SectionHead kicker={`${num} — ${kicker}`} title={title} desc={desc} tone={tone} />
          <span className="fd font-bold text-[clamp(2.4rem,5vw,4rem)] text-line2 select-none hidden md:block leading-none shrink-0">
            /{num}
          </span>
        </div>
        {children}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-line mt-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-20">
        <p className="fd font-bold stroke-text text-[clamp(2.6rem,9vw,7.5rem)] leading-none tracking-tight select-none" aria-hidden>
          localhost:5678
        </p>
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 mt-12 items-start">
          <div>
            <p className="fm text-[11px] tracking-[0.24em] uppercase text-phos mb-4">// one last time, condensed</p>
            <p className="text-mut text-sm leading-relaxed max-w-md">
              Seven stages, one port, zero privileges escalated. When the screen wakes, your workflows are still
              running where you left them — on hardware that fits in a jacket pocket.
            </p>
            <div className="fm mt-8 space-y-2 text-[11.5px] text-dim tracking-wider">
              <p>BUILT FOR — aarch64 android · termux · proot-distro</p>
              <p>ISOLATION — ptrace shim, shared netns, fake chroot</p>
              <p>GUARANTEES — no kernel mods · no telemetry · no cloud</p>
            </div>
          </div>
          <CodeBlock title="recap — copy & run" code={RECAP} tone="phos" />
        </div>
        <div className="flex items-center justify-between gap-4 mt-14 pt-6 border-t border-line flex-wrap">
          <p className="fd font-bold text-sm">
            <span className="text-coral">n8n</span>
            <span className="text-dim">//</span>
            <span className="text-ink">aarch64</span>
          </p>
          <p className="fm text-[10.5px] tracking-[0.2em] uppercase text-dim">
            your phone is the server · est. loopback
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const mainRef = useRevealContainer<HTMLDivElement>();
  return (
    <div ref={mainRef} className="relative min-h-screen bg-bg text-ink antialiased">
      {/* ambient layers */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-glow" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-scan" />
      <div className="noise" />

      <ProgressNav />

      <main className="relative z-10">
        <Hero />
        <Ticker />

        <Section
          id="stack"
          num="01"
          kicker="architecture"
          tone="text-amber"
          title={
            <>
              Seven layers, <span className="text-amber">one loopback</span>
            </>
          }
          desc="From the untouched Android kernel up to the browser tab — every layer runs native aarch64. Select a layer to read what it does and what it gives up."
        >
          <ArchDiagram />
        </Section>

        <Section
          id="pipeline"
          num="02"
          kicker="deployment pipeline"
          tone="text-phos"
          title={
            <>
              Boot to editor in <span className="text-phos">seven stages</span>
            </>
          }
          desc="Copy-paste order matters here. Green stages run in Termux, blue inside the rootfs, coral ends in your browser."
        >
          <Pipeline />
        </Section>

        <Section
          id="preflight"
          num="03"
          kicker="preflight"
          tone="text-cyan"
          title={
            <>
              Prove the device is <span className="text-cyan">ready</span>
            </>
          }
          desc="Run the probe console before you invest twenty-five minutes. It checks the exact failure modes that strand people."
        >
          <Preflight />
        </Section>

        <Section
          id="runtime"
          num="04"
          kicker="runtime reference"
          tone="text-cyan"
          title={
            <>
              Environment, <span className="text-cyan">persistence</span>, reach
            </>
          }
          desc="The knobs that decide whether n8n survives Android's housekeeping — and how webhooks find it from outside."
        >
          <Reference />
        </Section>

        <Section
          id="matrix"
          num="05"
          kicker="compatibility matrix"
          tone="text-phos"
          title={
            <>
              Pick your <span className="text-phos">rootfs</span>, tune your device
            </>
          }
          desc="Architecture support is universal across proot-distro's images — the real decision is libc, footprint and how much heap your silicon can spare."
        >
          <Matrices />
        </Section>

        <Section
          id="troubleshoot"
          num="06"
          kicker="troubleshooting console"
          tone="text-coral"
          title={
            <>
              When the terminal <span className="text-coral">talks back</span>
            </>
          }
          desc="The eight failures every on-device n8n operator meets — and the exact line that fixes each one."
        >
          <Faq />
        </Section>
      </main>

      <Footer />
    </div>
  );
}

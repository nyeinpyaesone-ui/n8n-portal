export type TermLine = { k: "cmd" | "out" | "ok" | "err"; t: string };

export const BOOT_SCRIPT: TermLine[] = [
  { k: "cmd", t: "uname -m && pkg install -y proot-distro" },
  { k: "out", t: "aarch64" },
  { k: "ok", t: "proot-distro 4.19.1 installed (native arm64)" },
  { k: "cmd", t: "proot-distro install ubuntu" },
  { k: "out", t: "[*] Fetching Ubuntu 24.04 rootfs (arm64, ~390 MB)" },
  { k: "ok", t: "deployed → usr/var/lib/proot-distro/installed-rootfs/ubuntu" },
  { k: "cmd", t: "proot-distro login ubuntu" },
  { k: "out", t: "root@localhost:~# glibc 2.39 · netns shared with Android" },
  { k: "cmd", t: "apt update && apt install -y curl && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs" },
  { k: "ok", t: "node v20.19.0 — official arm64 build, zero emulation" },
  { k: "cmd", t: "npm install -g n8n" },
  { k: "out", t: "added 1 437 packages in 6m 41s" },
  { k: "cmd", t: "N8N_PORT=5678 n8n start" },
  { k: "ok", t: "n8n ready on http://localhost:5678" },
  { k: "out", t: "Editor listening. Open it in any browser on this device." },
];

export type Step = {
  id: string;
  idx: string;
  title: string;
  where: "TERMUX" | "ROOTFS" | "BROWSER";
  desc: string;
  cmds: string[];
  note: string;
};

export const PIPELINE: Step[] = [
  {
    id: "prereq",
    idx: "00",
    title: "Verify the silicon",
    where: "TERMUX",
    desc: "Everything below assumes the host kernel is already ARMv8. Confirm the ISA, then bring Termux's package index current.",
    cmds: ["uname -m", "pkg update && pkg upgrade -y"],
    note: "uname must print aarch64. If it says armv8l you are in a 32-bit userland — reinstall 64-bit Termux.",
  },
  {
    id: "proot",
    idx: "01",
    title: "Install proot-distro",
    where: "TERMUX",
    desc: "proot-distro wraps PRoot — a ptrace-based syscall shim that fake-chroots a full Linux rootfs without touching the kernel or needing root.",
    cmds: ["pkg install -y proot-distro", "proot-distro list"],
    note: "The list command shows every supported rootfs; all ship arm64 tarballs that match your kernel.",
  },
  {
    id: "distro",
    idx: "02",
    title: "Deploy Ubuntu arm64",
    where: "TERMUX",
    desc: "Pull the glibc-based Ubuntu 24.04 rootfs and drop into it. Network namespaces are shared — 127.0.0.1 inside is the same loopback Android sees.",
    cmds: ["proot-distro install ubuntu", "proot-distro login ubuntu"],
    note: "glibc matters: most npm packages ship prebuilt arm64 binaries for glibc, not musl. This is the compatibility anchor.",
  },
  {
    id: "node",
    idx: "03",
    title: "Node.js 20 LTS, native",
    where: "ROOTFS",
    desc: "Inside the rootfs, install NodeSource's arm64 build of Node 20. It runs at full speed — no QEMU, no translation, same ISA end to end.",
    cmds: [
      "apt update && apt upgrade -y",
      "apt install -y curl ca-certificates build-essential",
      "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -",
      "apt install -y nodejs && node -v && npm -v",
    ],
    note: "build-essential covers the few node-gyp modules that still compile from source on arm64.",
  },
  {
    id: "n8n",
    idx: "04",
    title: "Install n8n globally",
    where: "ROOTFS",
    desc: "n8n ships as pure JavaScript plus arm64-friendly native deps (sqlite3, msgpackr). A global npm install is the whole deployment.",
    cmds: ["npm install -g n8n", "n8n --version"],
    note: "Expect 5–15 minutes. If n8n isn't on PATH afterwards, export PATH=\"$PATH:$(npm config get prefix)/bin\".",
  },
  {
    id: "env",
    idx: "05",
    title: "Pin the environment",
    where: "ROOTFS",
    desc: "Fix the port, bind to loopback, and cap the V8 heap so Android's low-memory killer stays away. Persist it in ~/.bashrc.",
    cmds: [
      "export N8N_PORT=5678",
      "export N8N_LISTEN_ADDRESS=127.0.0.1",
      "export N8N_PROTOCOL=http",
      "export NODE_OPTIONS=--max-old-space-size=1536",
      "export N8N_USER_FOLDER=$HOME/.n8n",
    ],
    note: "1536 MB heap suits 6–8 GB devices. On 4 GB hardware drop to 1024 and close background apps.",
  },
  {
    id: "launch",
    idx: "06",
    title: "Launch & keep alive",
    where: "BROWSER",
    desc: "Grab a wake-lock, run inside tmux so the process survives the terminal, then open the editor on the device itself.",
    cmds: [
      "termux-wake-lock",
      "tmux new -s n8n",
      "proot-distro login ubuntu",
      "n8n start   # then open http://localhost:5678",
    ],
    note: "Detach with Ctrl-b d. Reattach any time with tmux attach -t n8n — your workflows persist in SQLite at ~/.n8n.",
  },
];

export type Layer = {
  id: string;
  name: string;
  tag: string;
  tone: "phos" | "coral" | "amber" | "cyan" | "ink";
  bullets: string[];
};

export const LAYERS: Layer[] = [
  {
    id: "client",
    name: "Your browser",
    tag: "http://localhost:5678",
    tone: "coral",
    bullets: [
      "Editor, REST API and webhooks all served by one process",
      "Loopback by default — nothing leaves the device",
      "LAN access: bind 0.0.0.0 and set WEBHOOK_URL to the device IP",
    ],
  },
  {
    id: "n8n",
    name: "n8n main process",
    tag: "editor + api + workers",
    tone: "coral",
    bullets: [
      "SQLite database under $N8N_USER_FOLDER — zero external services",
      "Single-instance: two starts on one DB → SQLITE_BUSY",
      "Queue mode (Redis + workers) is possible but overkill on-device",
    ],
  },
  {
    id: "node",
    name: "Node.js 20 LTS",
    tag: "official arm64 build",
    tone: "cyan",
    bullets: [
      "NodeSource deb compiled for aarch64 — runs at native ISA speed",
      "V8 heap capped via NODE_OPTIONS to dodge the OOM killer",
      "npm global prefix lives inside the rootfs, not Termux's $PREFIX",
    ],
  },
  {
    id: "ubuntu",
    name: "Ubuntu 24.04 rootfs",
    tag: "glibc 2.39 · arm64",
    tone: "phos",
    bullets: [
      "Full apt ecosystem; fake-root via PRoot's uid 0 mapping",
      "Filesystem: usr/var/lib/proot-distro/installed-rootfs/ubuntu",
      "Bind-mount Android storage with --bind /sdcard:/media if needed",
    ],
  },
  {
    id: "proot",
    name: "PRoot",
    tag: "ptrace syscall shim",
    tone: "amber",
    bullets: [
      "Intercepts syscalls in userland — fake chroot, no kernel mods",
      "Network namespace is shared: ports bind straight onto Android's loopback",
      "Occasional ptrace warnings under seccomp are harmless",
    ],
  },
  {
    id: "termux",
    name: "Termux userland",
    tag: "pkg · wake-lock · tmux",
    tone: "phos",
    bullets: [
      "Android-terminal + package manager; install from F-Droid, not Play Store",
      "termux-wake-lock keeps the CPU from dozing mid-workflow",
      "Android can still kill it — disable battery optimization for Termux",
    ],
  },
  {
    id: "kernel",
    name: "Android kernel",
    tag: "aarch64 · shared · untouched",
    tone: "ink",
    bullets: [
      "The host kernel runs ARMv8 natively — nothing is emulated",
      "No root, no unlocked bootloader, no modified partitions",
      "seccomp filters some syscalls; PRoot absorbs the gap",
    ],
  },
];

export const CONSTRAINTS = [
  "no systemd",
  "no Docker-in-PRoot",
  "no kernel modules",
  "no setuid binaries",
  "no raw sockets w/o root",
  "one n8n instance per DB",
];

export const WHY_WORKS = [
  {
    title: "Native ISA end-to-end",
    body: "Host kernel, rootfs, Node and every prebuilt binary are all aarch64. PRoot only rewrites paths and privileges — it never translates instructions.",
  },
  {
    title: "glibc, not musl",
    body: "Ubuntu's glibc 2.39 matches what npm's prebuilt arm64 binaries target. Alpine's musl forces source builds for a long tail of native modules.",
  },
  {
    title: "Shared loopback",
    body: "PRoot doesn't virtualize networking. n8n binding 127.0.0.1:5678 inside the rootfs is instantly reachable from Android's own browser.",
  },
];

export type EnvVar = { name: string; value: string; why: string };

export const ENV_VARS: EnvVar[] = [
  { name: "N8N_PORT", value: "5678", why: "Editor + API + webhooks all listen here." },
  { name: "N8N_LISTEN_ADDRESS", value: "127.0.0.1", why: "Loopback-only. Use 0.0.0.0 to expose to your LAN." },
  { name: "N8N_PROTOCOL", value: "http", why: "No TLS on-device; put a tunnel in front for https webhooks." },
  { name: "WEBHOOK_URL", value: "http://localhost:5678/", why: "Public base URL n8n stamps into webhook nodes." },
  { name: "N8N_USER_FOLDER", value: "$HOME/.n8n", why: "SQLite DB, credentials and config all live under this folder." },
  { name: "NODE_OPTIONS", value: "--max-old-space-size=1536", why: "Caps the V8 heap before Android's OOM killer does it for you." },
  { name: "GENERIC_TIMEZONE", value: "UTC", why: "Timezone used by cron/schedule triggers inside workflows." },
  { name: "EXECUTIONS_DATA_PRUNE", value: "true", why: "Auto-prunes old executions — SQLite files stay small on flash storage." },
  { name: "N8N_DIAGNOSTICS_ENABLED", value: "false", why: "No telemetry leaving the device." },
];

export const REF_TABS: { id: string; label: string; file: string; code: string }[] = [
  {
    id: "env",
    label: "01 · env",
    file: "~/.bashrc (inside rootfs)",
    code: `# ~/.bashrc — inside the Ubuntu rootfs
export N8N_PORT=5678
export N8N_LISTEN_ADDRESS=127.0.0.1
export N8N_PROTOCOL=http
export WEBHOOK_URL=http://localhost:5678/
export GENERIC_TIMEZONE="UTC"
export TZ="UTC"
export N8N_USER_FOLDER="$HOME/.n8n"
export NODE_OPTIONS="--max-old-space-size=1536"
export EXECUTIONS_DATA_PRUNE=true
export N8N_DIAGNOSTICS_ENABLED=false
export PATH="$PATH:$(npm config get prefix)/bin"`,
  },
  {
    id: "start",
    label: "02 · start",
    file: "launch.sh (Termux side)",
    code: `#!/data/data/com.termux/files/usr/bin/bash
# launch.sh — from Termux, survives terminal closes
termux-wake-lock
tmux kill-session -t n8n 2>/dev/null
tmux new-session -d -s n8n \\
  "proot-distro login ubuntu -- bash -lc 'n8n start'"
echo "n8n detaching into tmux → http://localhost:5678"
# reattach:  tmux attach -t n8n
# stop:      tmux kill-session -t n8n`,
  },
  {
    id: "lan",
    label: "03 · lan + tunnel",
    file: "webhooks on the go",
    code: `# A — expose to LAN (finish owner setup first: no auth by default)
export N8N_LISTEN_ADDRESS=0.0.0.0
export WEBHOOK_URL=http://$(hostname -I | awk '{print $1}'):5678/

# B — or keep loopback and tunnel webhooks out (no open ports)
pkg install -y cloudflared        # arm64 build available in Termux
cloudflared tunnel --url http://localhost:5678
# → https://<random>.trycloudflare.com
export WEBHOOK_URL=https://<random>.trycloudflare.com/`,
  },
];

export type RootfsRow = {
  name: string;
  libc: string;
  footprint: string;
  verdict: "RECOMMENDED" | "SOLID" | "TINKER" | "MINIMAL";
  note: string;
};

export const ROOTFS_MATRIX: RootfsRow[] = [
  { name: "Ubuntu 24.04", libc: "glibc 2.39", footprint: "~1.6 GB", verdict: "RECOMMENDED", note: "Prebuilt npm arm64 binaries just work; NodeSource debs; widest compatibility." },
  { name: "Debian 13", libc: "glibc 2.41", footprint: "~1.3 GB", verdict: "SOLID", note: "Leaner than Ubuntu, same glibc story. Pick it on 4 GB devices." },
  { name: "Arch Linux ARM", libc: "glibc rolling", footprint: "~1.1 GB", verdict: "TINKER", note: "Rolling releases, newest Node in AUR-style repos. For people who like edge cases." },
  { name: "Alpine edge", libc: "musl 1.2", footprint: "~300 MB", verdict: "MINIMAL", note: "Tiny, but musl forces source builds for several n8n native deps. Not the easy road." },
];

export type DeviceRow = {
  device: string;
  ram: string;
  heap: string;
  cold: string;
  chip: { label: string; tone: "phos" | "amber" | "coral" };
};

export const DEVICE_MATRIX: DeviceRow[] = [
  { device: "Flagship phone · Snapdragon 8 Gen 3", ram: "12 GB", heap: "--max-old-space-size=4096", cold: "~35 s", chip: { label: "SMOOTH", tone: "phos" } },
  { device: "Upper-mid phone · Dimensity 8300", ram: "8 GB", heap: "--max-old-space-size=2048", cold: "~45 s", chip: { label: "GOOD", tone: "phos" } },
  { device: "RK3588 Android TV box", ram: "8 GB", heap: "--max-old-space-size=3072", cold: "~50 s", chip: { label: "GOOD", tone: "phos" } },
  { device: "Budget phone · 4 GB entry", ram: "4 GB", heap: "--max-old-space-size=1024", cold: "~90 s", chip: { label: "CAREFUL", tone: "amber" } },
  { device: "Anything with < 3 GB", ram: "< 3 GB", heap: "—", cold: "—", chip: { label: "SKIP", tone: "coral" } },
];

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "proot warning: ptrace(...) — is my install broken?",
    a: "No. Android's seccomp policy blocks a handful of ptrace operations and PRoot logs every refusal. The shim works around all of them; the warnings are noise. They spike during npm installs and can be safely ignored.",
  },
  {
    q: "Android kills n8n minutes after the screen goes off",
    a: "Three layers of defense: (1) termux-wake-lock holds a partial wake lock, (2) disable battery optimization for Termux in Android settings, (3) run n8n inside tmux so it isn't tied to a visible terminal. Some OEMs (MIUI, ColorOS) need an extra 'autostart' permission.",
  },
  {
    q: "EADDRINUSE — port 5678 already in use",
    a: "A previous instance is still alive, usually detached in tmux. Find it with ss -ltnp | grep 5678 or pkill -f n8n, then restart. Or simply move to another port with N8N_PORT=5679.",
  },
  {
    q: "npm install crawls for ten minutes",
    a: "Normal on arm64: the handful of packages without prebuilt binaries compile via node-gyp using build-essential. Staying on a glibc rootfs (Ubuntu/Debian) keeps this list short. Alpine dramatically extends it.",
  },
  {
    q: "SQLite error SQLITE_BUSY on startup",
    a: "Two n8n processes are pointing at the same N8N_USER_FOLDER database. Kill the stray instance (tmux kill-session -t n8n; pkill -f n8n) and start one. SQLite allows exactly one writer.",
  },
  {
    q: "Webhook nodes never fire from external services",
    a: "localhost isn't routable from the internet. Either expose to your LAN (0.0.0.0 + WEBHOOK_URL=device IP) or tunnel: cloudflared tunnel --url http://localhost:5678 gives you a public https URL to paste into WEBHOOK_URL.",
  },
  {
    q: "n8n: command not found after proot-distro login",
    a: "npm's global bin directory isn't on the rootfs PATH. Add export PATH=\"$PATH:$(npm config get prefix)/bin\" to ~/.bashrc inside the rootfs, then log in again.",
  },
  {
    q: "Can I run Docker or systemd inside instead?",
    a: "No — both need kernel features PRoot can't provide (cgroups, namespaces, CAP_SYS_ADMIN). That's the trade of rootless isolation: n8n runs as a plain long-lived process with tmux as your init system.",
  },
];

export type Check = {
  cmd: string;
  out: string;
  status: "pass" | "warn";
  note: string;
};

export const PREFLIGHT: Check[] = [
  { cmd: "uname -m", out: "aarch64", status: "pass", note: "ARMv8 native — nothing to emulate" },
  { cmd: "getconf LONG_BIT", out: "64", status: "pass", note: "64-bit userland confirmed" },
  { cmd: "pkg search proot-distro", out: "proot-distro/stable 4.19.1 aarch64", status: "pass", note: "available in your Termux repo" },
  { cmd: "df -h $PREFIX | tail -1", out: "57G  9.1G  7.4G  55%  /data", status: "pass", note: "≥ 2 GB free for rootfs + n8n" },
  { cmd: "grep MemTotal /proc/meminfo", out: "MemTotal: 5921204 kB", status: "warn", note: "5.6 GB — cap the heap: NODE_OPTIONS=--max-old-space-size=1536" },
  { cmd: "ss -ltn | grep 5678 || true", out: "(no listener)", status: "pass", note: "port 5678 is free" },
  { cmd: "termux-wake-lock", out: "Wake lock acquired", status: "pass", note: "CPU will stay awake for the workflow runner" },
];

/* ================= performance / sync chapter ================= */

export type BenchEnv = "native" | "proot" | "qemu";

export type Bench = {
  metric: string;
  unit: string;
  hint: string;
  values: Record<BenchEnv, number>;
};

export const BENCH_ENVS: { id: BenchEnv; label: string; color: string }[] = [
  { id: "native", label: "ANDROID NATIVE", color: "#8fa69a" },
  { id: "proot", label: "PROOT-DISTRO", color: "#54e38e" },
  { id: "qemu", label: "QEMU USER-MODE", color: "#ff5470" },
];

export const BENCHES: Bench[] = [
  {
    metric: "Sequential read",
    unit: "MB/s",
    hint: "higher is better",
    values: { native: 940, proot: 912, qemu: 418 },
  },
  {
    metric: "npm ci — cold install",
    unit: "s",
    hint: "lower is better",
    values: { native: 392, proot: 448, qemu: 2940 },
  },
  {
    metric: "SQLite bulk insert ×10k",
    unit: "s",
    hint: "lower is better",
    values: { native: 1.8, proot: 2.3, qemu: 14.9 },
  },
  {
    metric: "Webhook round-trip",
    unit: "ms",
    hint: "lower is better",
    values: { native: 4.2, proot: 4.7, qemu: 19.6 },
  },
  {
    metric: "V8 isolate startup",
    unit: "ms",
    hint: "lower is better",
    values: { native: 61, proot: 70, qemu: 388 },
  },
];

export type Lever = { id: string; label: string; cut: number; why: string };

export const LEVERS: Lever[] = [
  { id: "wal", label: "SQLite WAL + synchronous=NORMAL", cut: 18, why: "fsync pressure drops ~90% — the single biggest host↔container sync win." },
  { id: "heap", label: "Heap cap matched to device RAM", cut: 16, why: "Prevents LMK kills, which are the worst kind of stall: a full cold restart." },
  { id: "prune", label: "Prune execution data aggressively", cut: 14, why: "A small database.sqlite means hot page cache and instant queries." },
  { id: "bind", label: "Bind-mount storage (--bind) instead of copying", cut: 10, why: "Zero-copy path into the rootfs; files cross the boundary by reference." },
  { id: "binmode", label: "Binary data in filesystem mode", cut: 9, why: "Large payloads live as files, not base64 rows — SQLite stays lean." },
  { id: "killonexit", label: "--kill-on-exit on login", cut: 4, why: "Releases the ptrace shim the instant a shell exits; no stray tracees." },
  { id: "notelem", label: "Disable telemetry + update checks", cut: 3, why: "No background round-trips competing for the same loopback." },
];

export const SQLITE_TUNE = `# one-time, inside the rootfs — retunes n8n's database for flash storage
sqlite3 "$N8N_USER_FOLDER/.n8n/database.sqlite" <<'SQL'
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA cache_size=-64000;   -- 64 MB page cache
PRAGMA temp_store=MEMORY;
SQL`;

export const WATCHDOG = `#!/data/data/com.termux/files/usr/bin/bash
# watchdog.sh — health-checks across the host/container boundary,
# recycles n8n through tmux whenever the loopback stops answering.
URL="http://localhost:5678/healthz"
while :; do
  if ! curl -fsS -m 5 "$URL" >/dev/null 2>&1; then
    echo "[$(date '+%F %T')] n8n unreachable → recycling"
    tmux kill-session -t n8n 2>/dev/null
    tmux new-session -d -s n8n \\
      "proot-distro login ubuntu -- bash -lc 'n8n start'"
  fi
  sleep 30
done`;

export const SYNC_STATS = [
  { big: "0 ms", label: "added network hop", body: "Shared netns — rootfs loopback IS Android loopback. Packets never cross a virtual interface." },
  { big: "~1.3×", label: "syscall path cost", body: "PRoot's ptrace shim taxes fs-heavy calls (open, stat, readlink). Compute and sockets barely notice." },
  { big: "100%", label: "native ISA", body: "V8, SQLite and every prebuilt binary execute untranslated ARMv8. The shim moves bytes, not instructions." },
];

/* ============================================================
   $SEMAN — app.js
   ------------------------------------------------------------
   👉 EDIT EVERYTHING IN THE CONFIG BLOCK BELOW. That's all you
      need to touch to take this live after you launch the coin.
   ============================================================ */

const CONFIG = {
  /* ---- 1. YOUR TOKEN ---- */
  // Paste your pump.fun mint (contract) address here after launch.
  // Leave "" to keep the site in a tidy "pre-launch" state.
  CONTRACT_ADDRESS: "",

  /* ---- 2. YOUR LINKS ---- */
  // If PUMP_URL is left as the base "https://pump.fun/coin/", the
  // CONTRACT_ADDRESS is automatically appended for you.
  PUMP_URL:     "https://pump.fun/coin/",
  TWITTER_URL:  "https://twitter.com/",     // <-- your X handle URL
  TELEGRAM_URL: "https://t.me/",            // <-- your TG group URL
  CHART_URL:    "",                         // optional; auto-falls back to DexScreener

  /* ---- 3. THE DONATION MATH (creator fees -> the kids) ---- */
  // pump.fun pays the coin creator a share of trading volume as fees.
  // We estimate fees generated = trading volume * CREATOR_FEE_RATE,
  // then pledge PLEDGE_PERCENT of that to the cause.
  // 0.0005 = 0.05%. Adjust to match pump.fun's actual creator-fee rate.
  CREATOR_FEE_RATE: 0.0005,
  PLEDGE_PERCENT:   100,        // % of creator fees donated to the kids

  // The live counter ticks UP in real time from live 24h volume.
  // It's persisted in the browser so it doesn't reset on refresh.
  // Set this to a real starting figure (e.g. fees already earned) so
  // the counter reflects reality, not just "since you opened the page".
  RAISED_BASELINE_USD: 0,

  // Fundraising goal for the progress bar.
  GOAL_USD: 100000,

  // How often to re-pull on-chain data (ms).
  REFRESH_MS: 30000,

  /* ---- 4. OPTIONAL: exact number override ---- */
  // If you'd rather show a hand-set figure (e.g. real donations sent),
  // put a number here and it wins over the live estimate. null = auto.
  MANUAL_RAISED_USD: null,
};

/* ============================================================
   Below here you shouldn't need to edit anything.
   ============================================================ */

/* ---------- helpers ---------- */
const $ = (id) => document.getElementById(id);
const hasCA = () => CONFIG.CONTRACT_ADDRESS && CONFIG.CONTRACT_ADDRESS.trim().length > 20;

function fmtMoney(n, opts = {}) {
  if (n == null || isNaN(n)) return "—";
  const { decimals = 0 } = opts;
  if (n >= 1000)
    return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: decimals });
}
function fmtCompact(n) {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  return "$" + n.toFixed(2);
}
function fmtPrice(n) {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1) return "$" + n.toFixed(2);
  if (n >= 0.0001) return "$" + n.toFixed(6);
  return "$" + n.toExponential(2);
}

/* ---------- wire up links ---------- */
function resolveLinks() {
  const ca = CONFIG.CONTRACT_ADDRESS.trim();
  const pump = hasCA()
    ? (CONFIG.PUMP_URL.endsWith("/") ? CONFIG.PUMP_URL + ca : CONFIG.PUMP_URL)
    : CONFIG.PUMP_URL.replace(/\/coin\/$/, "");
  const chart = CONFIG.CHART_URL
    ? CONFIG.CHART_URL
    : (hasCA() ? `https://dexscreener.com/solana/${ca}` : "https://dexscreener.com/solana");

  const map = {
    pump,
    twitter: CONFIG.TWITTER_URL,
    telegram: CONFIG.TELEGRAM_URL,
    chart,
  };
  document.querySelectorAll("[data-link]").forEach((a) => {
    const key = a.getAttribute("data-link");
    if (map[key]) a.href = map[key];
  });
}

/* ---------- contract pill ---------- */
function setupContractPill() {
  const valEl = $("caValue");
  const copyBtn = $("caCopy");
  const pill = $("caPill");
  if (hasCA()) {
    valEl.textContent = CONFIG.CONTRACT_ADDRESS.trim();
  } else {
    valEl.textContent = "Not launched yet — dropping soon 👀";
    copyBtn.textContent = "Soon";
  }
  const doCopy = () => {
    if (!hasCA()) return;
    navigator.clipboard.writeText(CONFIG.CONTRACT_ADDRESS.trim()).then(() => {
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.textContent = "Copy";
        copyBtn.classList.remove("copied");
      }, 1500);
    });
  };
  pill.addEventListener("click", doCopy);
}

/* ---------- swimming background ---------- */
function spawnSwimmers() {
  const ocean = $("ocean");
  if (!ocean) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const count = reduce ? 5 : (window.innerWidth < 640 ? 8 : 15);

  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "swimmer";
    const size = 40 + Math.floor(Math.pow(seededRand(i), 2) * 120); // 40–160px, biased small
    s.style.width = size + "px";
    s.style.top = (seededRand(i + 100) * 100) + "vh";

    const img = document.createElement("img");
    img.src = "assets/semangif.gif";
    img.alt = "";
    s.appendChild(img);
    ocean.appendChild(s);

    if (reduce) {
      s.style.transform = "translate(" + (seededRand(i * 3) * window.innerWidth) + "px, 0)";
    } else {
      animateSwimmer(s, i, size);
    }
  }
}

/* ---------- reveal on scroll ---------- */
function setupReveals() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) return; // stay visible

  const reveal = (n) => {
    n.classList.remove("reveal-hidden");
    n.classList.add("reveal-in");
  };

  // Only hide elements that start well below the fold.
  const hidden = [];
  els.forEach((node) => {
    const r = node.getBoundingClientRect();
    if (r.top > window.innerHeight * 0.82) {
      node.classList.add("reveal-hidden");
      hidden.push(node);
    }
  });
  if (!hidden.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  hidden.forEach((n) => io.observe(n));

  // Fallback: reveal on scroll in case the observer never fires,
  // so content can never remain stuck invisible.
  const onScroll = () => {
    let remaining = 0;
    hidden.forEach((n) => {
      if (!n.classList.contains("reveal-hidden")) return;
      const r = n.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) { io.unobserve(n); reveal(n); }
      else remaining++;
    });
    if (!remaining) window.removeEventListener("scroll", onScroll);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
}

// deterministic pseudo-random (no Date/Math.random dependency issues)
let _seed = 1337;
function seededRand(salt) {
  const x = Math.sin((salt + 1) * 999.13 + _seed) * 43758.5453;
  return x - Math.floor(x);
}

function animateSwimmer(el, i, size) {
  const w = window.innerWidth;
  const dir = seededRand(i * 3) > 0.5 ? 1 : -1;   // swim right or left
  const speed = 22 + seededRand(i * 5) * 30;       // seconds to cross
  const bobAmp = 20 + seededRand(i * 11) * 50;
  const startX = dir === 1 ? -size - 60 : w + 60;
  const endX = dir === 1 ? w + 60 : -size - 60;
  const baseTop = parseFloat(el.style.top);
  let startTime = null;

  // flip the sprite to face swim direction
  el.style.setProperty("--face", dir === 1 ? "1" : "-1");

  function frame(t) {
    if (startTime === null) startTime = t;
    const elapsed = ((t - startTime) / 1000) % speed;
    const p = elapsed / speed;                       // 0..1 across screen
    const x = startX + (endX - startX) * p;
    const y = Math.sin(p * Math.PI * 4 + i) * bobAmp; // gentle sine bob
    el.style.transform =
      `translate(${x}px, ${y}px) scaleX(${dir === 1 ? -1 : 1})`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- LIVE TRACKER ---------- */
const STORE_KEY = "seman_raised_v1";
let animatedRaised = 0;   // what's currently shown
let targetRaised = 0;     // where we're heading
let feePerSecond = 0;     // live accrual rate ($/s) from 24h volume
let lastTick = null;

function loadStoredRaised() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const v = JSON.parse(raw);
      if (typeof v.amount === "number") return v.amount;
    }
  } catch (e) {}
  return CONFIG.RAISED_BASELINE_USD || 0;
}
function storeRaised(amount) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ amount }));
  } catch (e) {}
}

async function fetchStats() {
  if (!hasCA()) return { state: "prelaunch" };
  const ca = CONFIG.CONTRACT_ADDRESS.trim();

  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${ca}`,
      { headers: { accept: "application/json" } }
    );
    if (!res.ok) throw new Error("dexscreener " + res.status);
    const data = await res.json();
    const pairs = (data && data.pairs) || [];
    if (!pairs.length) return { state: "nopair" }; // launched but no pool/index yet

    // choose the most liquid pair
    pairs.sort(
      (a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
    );
    const p = pairs[0];

    return {
      state: "live",
      marketCap: p.marketCap ?? p.fdv ?? null,
      priceUsd: parseFloat(p.priceUsd) || null,
      volume24: p.volume?.h24 ?? 0,
      liquidity: p.liquidity?.usd ?? null,
    };
  } catch (e) {
    console.warn("[SEMAN] stats fetch failed:", e);
    return { state: "error" };
  }
}

function computeRaised(stats) {
  // Manual override always wins.
  if (CONFIG.MANUAL_RAISED_USD != null) {
    feePerSecond = 0;
    return CONFIG.MANUAL_RAISED_USD;
  }
  const pledge = CONFIG.PLEDGE_PERCENT / 100;

  // Live accrual rate from current 24h volume.
  const vol24 = stats.volume24 || 0;
  feePerSecond = (vol24 / 86400) * CONFIG.CREATOR_FEE_RATE * pledge;

  // Persisted running total is the source of truth for the headline.
  return loadStoredRaised();
}

function renderStats(stats) {
  const dot = $("liveDot");
  const label = $("liveLabel");
  const src = $("trackerSrc");

  if (stats.state === "prelaunch") {
    dot.classList.remove("live");
    label.textContent = "Pre-launch — tracker arms at launch";
    src.textContent = "Paste your contract address in app.js CONFIG to go live.";
    $("statFeeRate").textContent = CONFIG.PLEDGE_PERCENT + "%";
    return;
  }
  if (stats.state === "nopair" || stats.state === "error") {
    dot.classList.remove("live");
    label.textContent = stats.state === "nopair"
      ? "Launched — indexing pool…"
      : "Reconnecting to the swim…";
    src.textContent = "Live on-chain data via DexScreener";
    return;
  }

  // live
  dot.classList.add("live");
  label.textContent = "LIVE";
  $("statMcap").textContent = fmtCompact(stats.marketCap);
  $("statVol").textContent = fmtCompact(stats.volume24);
  $("statPrice").textContent = fmtPrice(stats.priceUsd);
  $("statFeeRate").textContent = CONFIG.PLEDGE_PERCENT + "%";
  src.textContent = "Live on-chain data via DexScreener • updates every " +
    Math.round(CONFIG.REFRESH_MS / 1000) + "s";
}

function renderRaised() {
  const goal = CONFIG.GOAL_USD || 1;
  $("raisedAmount").textContent = fmtMoney(Math.floor(animatedRaised));
  $("goalLabel").textContent = fmtCompact(goal).replace(".0", "");
  const pct = Math.max(0, Math.min(100, (animatedRaised / goal) * 100));
  $("progressBar").style.width = pct + "%";
  $("progressSwimmer").style.left = pct + "%";
  $("progressPct").textContent =
    (pct >= 100 ? "🎉 Goal smashed! " : "") +
    pct.toFixed(pct < 10 ? 1 : 0) + "% of the way there";
}

// Smooth per-frame animation: eases toward target AND accrues live fees.
function tickRaised(t) {
  if (lastTick === null) lastTick = t;
  const dt = (t - lastTick) / 1000;
  lastTick = t;

  // accrue live fees over real time
  if (feePerSecond > 0 && CONFIG.MANUAL_RAISED_USD == null) {
    targetRaised += feePerSecond * dt;
    storeRaised(targetRaised);
  }
  // ease the displayed number toward target
  const diff = targetRaised - animatedRaised;
  if (Math.abs(diff) > 0.01) {
    animatedRaised += diff * Math.min(1, dt * 3);
  } else {
    animatedRaised = targetRaised;
  }
  renderRaised();
  requestAnimationFrame(tickRaised);
}

async function refreshLoop() {
  const stats = await fetchStats();
  renderStats(stats);
  if (stats.state === "live") {
    const raised = computeRaised(stats);
    // keep the animated total at least at the stored/baseline value
    targetRaised = Math.max(targetRaised, raised);
  } else if (stats.state === "prelaunch") {
    targetRaised = CONFIG.MANUAL_RAISED_USD ?? CONFIG.RAISED_BASELINE_USD ?? 0;
  }
  setTimeout(refreshLoop, CONFIG.REFRESH_MS);
}

/* ---------- init ---------- */
function init() {
  $("year").textContent = "2026";
  $("goalLabel").textContent = fmtCompact(CONFIG.GOAL_USD).replace(".0", "");
  resolveLinks();
  setupContractPill();
  spawnSwimmers();
  setupReveals();

  // seed the counter
  targetRaised = Math.max(loadStoredRaised(), CONFIG.RAISED_BASELINE_USD || 0);
  if (CONFIG.MANUAL_RAISED_USD != null) targetRaised = CONFIG.MANUAL_RAISED_USD;
  animatedRaised = targetRaised;
  renderRaised();
  requestAnimationFrame(tickRaised);

  refreshLoop();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

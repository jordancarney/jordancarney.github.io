/*
 * Ship Dash — level data
 *
 * Each spike: { x, w, h, dir }
 *   x   = left edge in world coordinates (px)
 *   w   = base width (px)
 *   h   = height of the spike (px)
 *   dir = 'bottom' (rises from the floor, apex points up)
 *       | 'top'    (hangs from the ceiling, apex points down)
 *
 * The play area is 540px tall. The ship enters from the left and the level
 * is cleared when it reaches `length` without touching a spike.
 */

// Build a contiguous row of identical spikes from x0 to x1 (a jagged edge).
function spikeRow(x0, x1, w, h, dir) {
  const out = [];
  for (let x = x0; x + w <= x1; x += w) out.push({ x, w, h, dir });
  return out;
}

// Tiny deterministic PRNG (mulberry32) so the "chaos" is the same every load.
function makeRng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/*
 * MOVING SPIKES (levels 6–10).
 *
 * A "piston" is a spike that slides in and out of its wall:
 *   dir "launching" -> rises up from the floor
 *   dir "falling"   -> drops down from the ceiling
 * Its tip pumps 0 -> len -> 0 every `period` seconds (see movingExt in game.js).
 *
 * Because the ship always travels at the level's constant speed, we can phase
 * each piston so it is fully extended exactly as the ship arrives — it visibly
 * rises to meet you (a fair telegraph), and the encounter is the same every run.
 */
function piston(x, w, dir, len, period, speed) {
  const tArrival = (x + w / 2 - 120) / speed; // when the ship reaches this column
  return { x, w, dir, len, period, phase: 0.5 - tArrival / period };
}

/*
 * SEGMENT LIBRARY (levels 6–10).
 *
 * Levels 6–10 are journeys that string together every mechanic from levels 1–5
 * — stay-level corridors, big zig-zags, jagged chaos — and add the new moving
 * spikes on top. Each builder returns { spikes, end } so composeLevel() can
 * chain them with transition gaps. Difficulty ramps via tightness + speed.
 */

// L1 — static stay-level corridor (gap = 540 - 2h).
function segCorridor(x0, length, h, w) {
  w = w || 46;
  return {
    spikes: spikeRow(x0, x0 + length, w, h, "top").concat(spikeRow(x0, x0 + length, w, h, "bottom")),
    end: x0 + length,
  };
}

// L2 / L4 — big static zig-zag (alternating climb-over / dive-under).
function segZigzag(x0, count, gap, w, h, startDir) {
  const sp = [];
  for (let i = 0; i < count; i++) {
    const dir = (i % 2 === 0) ? startDir : (startDir === "bottom" ? "top" : "bottom");
    sp.push({ x: x0 + i * gap, w, h, dir });
  }
  return { spikes: sp, end: x0 + (count - 1) * gap + w };
}

// L5 — jagged irregular walls around a center corridor (chaos flavor).
function segChaos(x0, length, hwc, seed) {
  const rnd = makeRng(seed), R = 11, cy = 270, end = x0 + length, sp = [];
  for (const dir of ["top", "bottom"]) {
    let x = x0;
    while (x < end) {
      const full = dir === "top" ? cy - hwc - R : 540 - (cy + hwc + R);
      const w = 16 + Math.floor(rnd() * 50);
      if (full > 14 && rnd() > 0.1) {
        const frac = rnd() < 0.35 ? 1 : 0.5 + rnd() * 0.45;
        sp.push({ x: Math.round(x), w, h: Math.round(full * frac), dir });
      }
      x += w + 3 + rnd() * 18;
    }
  }
  return { spikes: sp, end };
}

// NEW — moving-spike weave (alternating launching / falling pistons).
function segPistons(x0, count, gap, w, len, period, speed, startDir) {
  const sp = [];
  for (let i = 0; i < count; i++) {
    const dir = (i % 2 === 0) ? startDir : (startDir === "launching" ? "falling" : "launching");
    sp.push(piston(x0 + i * gap, w, dir, len, period, speed));
  }
  return { spikes: sp, end: x0 + (count - 1) * gap + w };
}

// NEW + static — alternating big STATIC spike and MOVING piston (additive combo).
function segMix(x0, count, gap, w, h, len, period, speed, startDir) {
  const sp = [];
  for (let i = 0; i < count; i++) {
    const dir = (i % 2 === 0) ? startDir : (startDir === "bottom" ? "top" : "bottom");
    if (i % 2 === 0) sp.push({ x: x0 + i * gap, w, h, dir });
    else sp.push(piston(x0 + i * gap, w, dir === "top" ? "falling" : "launching", len, period, speed));
  }
  return { spikes: sp, end: x0 + (count - 1) * gap + w };
}

// Stitch sections together (each: (x0, speed) => {spikes, end}) with gaps.
function composeLevel(meta, sections) {
  const trans = meta.trans || 230;
  let x = meta.intro || 380;
  const obstacles = [];
  for (const seg of sections) {
    const r = seg(x, meta.speed);
    obstacles.push(...r.spikes);
    x = r.end + trans;
  }
  obstacles.sort((a, b) => a.x - b.x);
  return {
    name: meta.name, subtitle: meta.subtitle, hint: meta.hint,
    speed: meta.speed, length: x - trans + (meta.outro || 320), obstacles,
  };
}

/*
 * LEVEL 5 — a long, chaotic journey.
 *
 * The trick to "chaos that's still beatable": we hand-design a smooth, snaking
 * GAP PATH (center line `cy` + half-gap `hw`) through a series of zones — that's
 * the journey. Then we grow jagged, irregular walls of varying teeth up to (but
 * never past) the gap edges — that's the chaos. The teeth differ in width,
 * height and spacing and skip sides at random, so it reads as "stuff
 * everywhere," but a clear, physics-feasible route is guaranteed to exist.
 */
function buildChaosLevel() {
  const FLOOR = 540, R = 11;        // play height, approx ship collision radius
  const rnd = makeRng(20260607);    // fixed seed -> deterministic level
  const teethEnd = 5050;

  // The journey: { x, cy (gap center), hw (half-gap) }. Slopes between points
  // stay gentle enough that the ship can track the gap at the level's speed.
  const path = [
    { x: 420,  cy: 270, hw: 95 },   // ease in
    { x: 800,  cy: 205, hw: 82 },   // jagged cave: drift up
    { x: 1150, cy: 325, hw: 82 },   //   ...and back down
    { x: 1500, cy: 180, hw: 56 },   // the squeeze: climb into a tight slot
    { x: 1850, cy: 165, hw: 48 },   //   hold high & narrow
    { x: 2150, cy: 305, hw: 64 },   // drop out
    { x: 2500, cy: 300, hw: 122 },  // scatter field: wide open, dodge loners
    { x: 2900, cy: 250, hw: 122 },
    { x: 3150, cy: 250, hw: 64 },   // re-enter close quarters
    { x: 3450, cy: 420, hw: 60 },   // switchbacks: dive low
    { x: 3780, cy: 130, hw: 60 },   //   climb high
    { x: 4080, cy: 425, hw: 58 },   //   dive low
    { x: 4380, cy: 150, hw: 56 },   //   climb high
    { x: 4680, cy: 300, hw: 78 },   // finale settle
    { x: 5050, cy: 270, hw: 100 },  // run-out
    { x: 5300, cy: 270, hw: 120 },  // open to the finish
  ];
  function sample(x) {
    if (x <= path[0].x) return path[0];
    for (let i = 1; i < path.length; i++) {
      if (x <= path[i].x) {
        const a = path[i - 1], b = path[i], t = (x - a.x) / (b.x - a.x);
        return { cy: a.cy + (b.cy - a.cy) * t, hw: a.hw + (b.hw - a.hw) * t };
      }
    }
    return path[path.length - 1];
  }

  const obstacles = [];
  for (const dir of ["top", "bottom"]) {
    let x = path[0].x;
    while (x < teethEnd) {
      const { cy, hw } = sample(x);
      const scatter = hw > 100;
      // deepest this tooth may reach without blocking the gap
      const full = dir === "top" ? cy - hw - R : FLOOR - (cy + hw + R);
      const w = 16 + Math.floor(rnd() * 56);
      if (full > 14 && rnd() > (scatter ? 0.45 : 0.08)) {
        const frac = rnd() < 0.3 ? 1 : 0.45 + rnd() * 0.5; // sometimes full-height (tight)
        obstacles.push({ x: Math.round(x), w, h: Math.round(full * frac), dir });
      }
      x += w + (scatter ? 40 + rnd() * 130 : 2 + rnd() * 22);
    }
  }
  obstacles.sort((a, b) => a.x - b.x);

  return {
    name: "Bedlam",
    subtitle: "A chaotic journey",
    hint: "No patterns here — read the chaos and weave your way through!",
    speed: 200,
    length: 5300,
    obstacles,
  };
}

const LEVELS = [
  // ----------------------------------------------------------------------
  // LEVEL 1 — Stay Level
  // A clear horizontal corridor lined with small spikes top and bottom.
  // Gravity constantly pulls you down, so you learn to *tap* to hover.
  // ----------------------------------------------------------------------
  {
    name: "Steady Hands",
    subtitle: "Learn to hover",
    hint: "Tap SPACE to hover and hold the line. Stay in the middle!",
    speed: 250,
    length: 2800,
    obstacles: [
      ...spikeRow(440, 2520, 48, 165, "top"),
      ...spikeRow(440, 2520, 48, 165, "bottom"),
    ],
  },

  // ----------------------------------------------------------------------
  // LEVEL 2 — Up & Down
  // Big alternating spikes. Climb high over the floor spikes, dive low
  // under the ceiling spikes. Staying level will not save you here.
  // ----------------------------------------------------------------------
  {
    name: "Up & Over",
    subtitle: "Climb and dive",
    hint: "HOLD SPACE to climb over, RELEASE to dive under. Weave through!",
    speed: 205,
    length: 2920,
    obstacles: [
      { x: 540,  w: 150, h: 380, dir: "bottom" }, // go up
      { x: 920,  w: 150, h: 380, dir: "top" },    // go down
      { x: 1300, w: 150, h: 380, dir: "bottom" }, // go up
      { x: 1680, w: 150, h: 380, dir: "top" },    // go down
      { x: 2060, w: 150, h: 380, dir: "bottom" }, // go up
      { x: 2440, w: 150, h: 380, dir: "top" },    // go down
    ],
  },

  // ----------------------------------------------------------------------
  // LEVEL 3 — The Gauntlet
  // A steady corridor (like level 1) flowing into a big zig-zag
  // (like level 2). Do both, back to back.
  // ----------------------------------------------------------------------
  {
    name: "The Gauntlet",
    subtitle: "Everything you've learned",
    hint: "Hold steady through the corridor… then climb and dive at the end!",
    speed: 225,
    length: 3500,
    obstacles: [
      // Section A — stay-level corridor
      ...spikeRow(440, 1480, 48, 190, "top"),
      ...spikeRow(440, 1480, 48, 190, "bottom"),
      // Section B — climb & dive zig-zag
      { x: 1820, w: 150, h: 370, dir: "bottom" },
      { x: 2220, w: 150, h: 370, dir: "top" },
      { x: 2620, w: 150, h: 370, dir: "bottom" },
      { x: 3020, w: 150, h: 370, dir: "top" },
    ],
  },

  // ----------------------------------------------------------------------
  // LEVEL 4 — Razor's Edge
  // The Gauntlet with the screws turned. A tighter corridor up front, then a
  // longer climb-and-dive run with taller spikes and smaller gaps. The margin
  // for error is almost gone — every up and down has to be near perfect.
  // ----------------------------------------------------------------------
  {
    name: "Razor's Edge",
    subtitle: "Pixel-perfect flying",
    hint: "No room for error. Thread the corridor, then nail every climb and dive.",
    speed: 230,
    length: 4450,
    obstacles: [
      // Section A — razor-thin corridor (tighter than The Gauntlet)
      ...spikeRow(440, 1400, 48, 210, "top"),
      ...spikeRow(440, 1400, 48, 210, "bottom"),
      // Section B — tall spikes packed tight: relentless, near-perfect climbs and dives
      { x: 1720, w: 150, h: 420, dir: "bottom" },
      { x: 2040, w: 150, h: 420, dir: "top" },
      { x: 2360, w: 150, h: 420, dir: "bottom" },
      { x: 2680, w: 150, h: 420, dir: "top" },
      { x: 3000, w: 150, h: 420, dir: "bottom" },
      { x: 3320, w: 150, h: 420, dir: "top" },
      { x: 3640, w: 150, h: 420, dir: "bottom" },
      { x: 3960, w: 150, h: 420, dir: "top" },
    ],
  },

  // ----------------------------------------------------------------------
  // LEVEL 5 — Bedlam (chaotic journey; see buildChaosLevel above)
  // ----------------------------------------------------------------------
  buildChaosLevel(),

  // ----------------------------------------------------------------------
  // LEVELS 6–10 — full journeys: every mechanic from 1–5 PLUS the new moving
  // spikes (launching from the floor, falling from the ceiling), ramped from
  // "a notch above L5" up to the hardest level in the game.
  // ----------------------------------------------------------------------

  // L6 — everything from 1–5, plus the new moving spikes, a notch above L5.
  composeLevel(
    { name: "Liftoff", subtitle: "Old tricks + amber spikes", speed: 200,
      hint: "AMBER spikes MOVE — they launch up and drop down. Everything else is back too!" },
    [
      (x) => segCorridor(x, 560, 176),
      (x, sp) => segPistons(x, 4, 365, 90, 332, 2.25, sp, "launching"),
      (x) => segZigzag(x, 4, 336, 128, 365, "bottom"),
      (x) => segChaos(x, 540, 72, 3106),
    ]
  ),
  // L7
  composeLevel(
    { name: "Drop Zone", subtitle: "Weave the moving spikes", speed: 203,
      hint: "Fallers drop, launchers rise — thread them, then hold the line." },
    [
      (x, sp) => segPistons(x, 5, 350, 88, 348, 2.0, sp, "falling"),
      (x) => segChaos(x, 600, 70, 3207),
      (x) => segCorridor(x, 560, 188),
      (x) => segZigzag(x, 4, 334, 128, 372, "top"),
    ]
  ),
  // L8
  composeLevel(
    { name: "Push & Pull", subtitle: "Static and moving, together", speed: 207,
      hint: "Now static and moving spikes are mixed. Climb, dive, weave, repeat." },
    [
      (x) => segZigzag(x, 4, 334, 128, 378, "bottom"),
      (x) => segCorridor(x, 540, 194),
      (x, sp) => segMix(x, 6, 342, 94, 356, 352, 1.9, sp, "bottom"),
      (x) => segChaos(x, 600, 66, 3308),
    ]
  ),
  // L9
  composeLevel(
    { name: "Crossfire", subtitle: "Fast and unforgiving", speed: 211,
      hint: "Read everything early. Tight chaos, moving walls, a razor zig-zag." },
    [
      (x) => segChaos(x, 640, 63, 3409),
      (x, sp) => segMix(x, 6, 328, 92, 380, 366, 1.65, sp, "top"),
      (x) => segCorridor(x, 540, 206),
      (x) => segZigzag(x, 4, 328, 128, 388, "bottom"),
    ]
  ),
  // L10 — the gauntlet of gauntlets (moving spikes live in the mix section).
  composeLevel(
    { name: "Overload", subtitle: "Everything, all at once", speed: 217,
      hint: "Every trick in the game, back to back. Trust the rhythm and don't stop!" },
    [
      (x) => segCorridor(x, 520, 204),
      (x, sp) => segMix(x, 5, 328, 90, 392, 372, 1.5, sp, "bottom"),
      (x) => segZigzag(x, 5, 322, 128, 398, "top"),
      (x) => segChaos(x, 700, 60, 3510),
    ]
  ),
];

window.LEVELS = LEVELS;

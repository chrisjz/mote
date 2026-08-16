// harness.mjs — proof that the belief is mechanical, not implied.
//
// This file extracts the CORE section out of index.html (the creature,
// DOM-free) and subjects it to synthetic visitors:
//
//   1. a plausible human hand  — must be believed, and named, in ~6–12 min
//   2. a metronome bot         — must stay filed under weather
//   3. nobody                  — must never be believed at all
//   4. a returning visitor     — must be greeted, recognized, and — on the
//                                third visit, after real absence — kept in faith
//   5. an impostor's hand      — must feel wrong
//   6. a phone in a living grip — tremor, tilt, taps — must be believed too
//   7. a phone on a table       — must stay weather
//   8. a phone on a machine     — periodic vibration must not pass for a hand
//
// run:  node harness.mjs

import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');

// syntax-check the whole inline script (compiles without executing)
const script = html.split('<script>')[1].split('</script>')[0];
new Function(script);

const coreSrc = html
  .split('/* ===================== CORE-START ===================== */')[1]
  .split('/* ===================== CORE-END ===================== */')[0];
const MoteCore = new Function(`${coreSrc}; return MoteCore;`)();

// ---------- tiny test kit ----------
let failures = 0;
function check(label, ok, detail = '') {
  console.log(`${ok ? '  ok ' : 'FAIL '} ${label}${detail ? '  — ' + detail : ''}`);
  if (!ok) failures++;
}
function rng(seed) { return MoteCore.mulberry32(seed); }
function gauss(r) {
  let u = 0, v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ---------- clock ----------
function makeClock(startMs) {
  let ms = startMs;
  return { wall: () => ms, advance: (d) => { ms += d; } };
}

// ---------- actors ----------
// A hand: bursts of motion with easing noise and tremor, natural pauses,
// loose orbiting of the mote, and 250–600ms reactions to its darts.
function makeHuman(seed, opts = {}) {
  const r = rng(seed);
  const speedMul = opts.speedMul ?? 1;
  const pauseMul = opts.pauseMul ?? 1;
  let x = 400 + r() * 400, y = 300 + r() * 200;
  let mode = 'pause', pauseUntil = 0.5 + r();
  let tx = x, ty = y, legSpeed = 300, legDist = 1, legStart = 0;
  let lastDart = null, reactAt = -1, pendingDart = null;
  function newLeg(nx, ny, sp, t) {
    tx = Math.max(60, Math.min(1220, nx)); ty = Math.max(60, Math.min(740, ny));
    legSpeed = sp; legStart = t;
    legDist = Math.max(30, Math.hypot(tx - x, ty - y));
    mode = 'move';
  }
  return function act(mote, t, dt) {
    const d = mote.S.dart;
    if (d && (!lastDart || d.t0 !== lastDart)) {
      lastDart = d.t0;
      reactAt = t + 0.25 + r() * 0.35;
      pendingDart = { tx: d.tx, ty: d.ty };
    }
    if (pendingDart && t >= reactAt) {
      newLeg(pendingDart.tx + gauss(r) * 25, pendingDart.ty + gauss(r) * 25, (380 + r() * 280) * speedMul, t);
      pendingDart = null;
    }
    if (mode === 'pause') {
      if (t < pauseUntil) return;
      if (r() < 0.8) {
        const a = r() * Math.PI * 2, rad = 60 + r() * 180;
        newLeg(mote.S.mote.x + Math.cos(a) * rad, mote.S.mote.y + Math.sin(a) * rad, (240 + r() * 420) * speedMul, t);
      } else newLeg(60 + r() * 1160, 60 + r() * 680, (240 + r() * 420) * speedMul, t);
    }
    if (mode === 'move') {
      const dx = tx - x, dy = ty - y;
      const dd = Math.hypot(dx, dy);
      // arrived, or lost interest: a hand never chases one point for 4 seconds
      if (dd < 25 || t - legStart > 4) {
        mode = 'pause';
        pauseUntil = t + (0.45 + r() * 1.4) * pauseMul + (r() < 0.1 ? 1.5 + r() * 2 : 0);
        return;
      }
      const a = Math.atan2(dy, dx) + gauss(r) * 0.09;              // tremor in the heading
      const prog = 1 - Math.min(1, dd / legDist);                  // bell-shaped speed, as hands move
      const bell = 0.35 + 1.1 * Math.sin(Math.PI * Math.min(0.98, Math.max(0.05, prog)));
      const sp = legSpeed * bell * (1 + gauss(r) * 0.18);          // roughness in the speed
      x += Math.cos(a) * sp * dt; y += Math.sin(a) * sp * dt;
      x = Math.max(2, Math.min(1278, x)); y = Math.max(2, Math.min(798, y));
      mote.feedPointer(x, y, 'move');
    }
  };
}
// A metronome: a perfect circle at constant angular speed, no pauses ever.
function makeMetronome() {
  return function act(mote, t) {
    const x = 640 + Math.cos(t * 1.2) * 200;
    const y = 400 + Math.sin(t * 1.2) * 200;
    mote.feedPointer(x, y, 'move');
  };
}
const nobody = () => {};

// A phone in a living grip: broadband rotational tremor, occasional deliberate
// tilt gestures that pour the field toward the mote, taps near it, and
// 400–1000 ms tap answers to its darts. No cursor at all.
function makeHolder(seed) {
  const r = rng(seed);
  let feedTick = 0, nextTapAt = 3 + r() * 4, nextGestureAt = 8 + r() * 8;
  let gesture = null;          // {t0, dur, dx, dy}
  let lastDart = null, tapDueAt = -1, tapTarget = null;
  return function act(mote, t, dt) {
    const d = mote.S.dart;
    if (d && (!lastDart || d.t0 !== lastDart)) {
      lastDart = d.t0;
      if (r() < 0.75) { tapDueAt = t + 0.4 + r() * 0.6; tapTarget = { x: d.tx + gauss(r) * 45, y: d.ty + gauss(r) * 45 }; }
    }
    if (tapTarget && t >= tapDueAt) {
      mote.feedPointer(Math.max(2, Math.min(388, tapTarget.x)), Math.max(2, Math.min(738, tapTarget.y)), 'down');
      tapTarget = null;
    }
    if (t >= nextTapAt) {
      nextTapAt = t + 5 + r() * 4;
      mote.feedPointer(Math.max(2, Math.min(388, mote.S.mote.x + gauss(r) * 70)),
                       Math.max(2, Math.min(738, mote.S.mote.y + gauss(r) * 70)), 'down');
    }
    if (!gesture && t >= nextGestureAt) {
      const mx = mote.S.mote.x - 195, my = mote.S.mote.y - 370;
      const n = Math.hypot(mx, my);
      const a = n > 60 ? Math.atan2(my, mx) : r() * Math.PI * 2;
      gesture = { t0: t, dur: 2.5 + r(), dx: Math.cos(a), dy: Math.sin(a) };
      nextGestureAt = t + 12 + r() * 8;
    }
    if (gesture && t > gesture.t0 + gesture.dur) gesture = null;
    feedTick++;
    if (feedTick % 4 === 0) {          // ~15 Hz sensor cadence
      mote.feedMotion(Math.abs(gauss(r)) * 2.2 + 0.3);
      let gx = gauss(r) * 0.02, gy = gauss(r) * 0.02;
      if (gesture) {
        const u = (t - gesture.t0) / gesture.dur;
        const env = Math.sin(Math.PI * Math.min(1, u));
        gx += gesture.dx * 0.42 * env; gy += gesture.dy * 0.42 * env;
      }
      mote.feedTilt(gx, gy);
    }
  };
}
// A phone face-up on a table: nothing to feel.
function makeTable(seed) {
  const r = rng(seed);
  let feedTick = 0;
  return function act(mote) {
    feedTick++;
    if (feedTick % 4 === 0) { mote.feedMotion(Math.abs(gauss(r)) * 0.03); mote.feedTilt(gauss(r) * 0.004, gauss(r) * 0.004); }
  };
}
// A phone on something that vibrates, hard but regularly.
function makeMachine(seed) {
  const r = rng(seed);
  let feedTick = 0;
  return function act(mote, t) {
    feedTick++;
    if (feedTick % 4 === 0) {
      mote.feedMotion(2.5 + 0.4 * Math.sin(2 * Math.PI * 3 * t) + Math.abs(gauss(r)) * 0.05);
      mote.feedTilt(gauss(r) * 0.01, gauss(r) * 0.01);
    }
  };
}

// ---------- session runner ----------
function runSession({ seed, saved, minutes, actor, clock, label, W = 1280, H = 800 }) {
  const events = [];
  let tSim = 0;
  const mote = MoteCore.createMote({
    seed, saved, W, H,
    wall: clock.wall,
    emit: (type, p) => events.push({ at: tSim, type, p })
  });
  const dt = 0.016;
  const steps = Math.round(minutes * 60 / dt);
  const humSamples = [];
  for (let i = 0; i < steps; i++) {
    tSim += dt;
    actor(mote, tSim, dt);
    mote.tick(16);
    clock.advance(16);
    if (i % 63 === 0 && mote.S.humanness !== null) humSamples.push(mote.S.humanness);
  }
  humSamples.sort((a, b) => a - b);
  const humMedian = humSamples.length ? humSamples[humSamples.length >> 1] : 0;
  const says = events.filter(e => e.type === 'say');
  const stages = events.filter(e => e.type === 'stage');
  if (label) {
    console.log(`\n— ${label} —`);
    for (const s of stages) console.log(`  ${(s.at / 60).toFixed(1)}m  stage → ${s.p.label}`);
    for (const s of says) console.log(`  ${(s.at / 60).toFixed(1)}m  "${s.p.text}"`);
  }
  return { mote, events, says, stages, humMedian };
}

// =================================================================
console.log('mote — harness\n');

// ---------- unit facts ----------
check('gapWords: 26h over one midnight → "one night"', MoteCore.gapWords(26 * 3600e3, 1) === 'one night');
check('gapWords: 40min → "not long"', MoteCore.gapWords(40 * 60e3, 0) === 'not long');
check('gapWords: 49h over two midnights → "two nights"', MoteCore.gapWords(49 * 3600e3, 2) === 'two nights');
check('gapWords: 20 days → "a long time"', MoteCore.gapWords(20 * 86400e3, 20) === 'a long time');
{
  const a = new Date(2026, 0, 31, 23, 30).getTime();
  const b = new Date(2026, 1, 2, 0, 30).getTime();
  check('midnights across a month boundary', MoteCore.midnightsBetween(a, b) === 2);
}
{
  const n1 = MoteCore.makeIdentity(12345).name, n2 = MoteCore.makeIdentity(12345).name;
  const n3 = MoteCore.makeIdentity(54321).name;
  check('name is deterministic per seed', n1 === n2, n1);
  check('different seeds, different creatures', n1 !== n3, `${n1} vs ${n3}`);
  check('name is plain lowercase letters', /^[a-z]{3,12}$/.test(n1));
}
{
  const dirty = { v: 1, seed: 7, name: '<img src=x onerror=alert(1)>', visits: 'NaN', grid: 'nope' };
  const m = MoteCore.sanitizeMemory(dirty);
  check('sanitize strips a hostile name', m.name === null || /^[a-z]{1,12}$/.test(m.name), JSON.stringify(m.name));
  check('sanitize repairs bad fields', m.visits >= 1 && Array.isArray(m.grid));
  check('sanitize rejects non-memories', MoteCore.sanitizeMemory({ hello: 1 }) === null);
}

// ---------- 1: a human hand, first visit ----------
const SEED = 0xC0FFEE;
const clock1 = makeClock(new Date(2026, 0, 5, 20, 0).getTime());
const s1 = runSession({
  seed: SEED, saved: null, minutes: 14,
  actor: makeHuman(101), clock: clock1, label: 'first visit: a human hand, 14 minutes'
});
{
  const m = s1.mote;
  const namedEv = s1.events.find(e => e.type === 'named');
  check('human is eventually believed (stage ≥ 3)', m.S.stage >= 3, `stage ${m.S.stage}`);
  check('the ritual completed and it told its name', !!namedEv, namedEv ? namedEv.p.name : 'never named');
  if (namedEv) {
    const min = namedEv.at / 60;
    check('naming rewards patience (≥ 5.5 min)', min >= 5.5, `${min.toFixed(1)} min`);
    check('naming is reachable (≤ 13 min)', min <= 13, `${min.toFixed(1)} min`);
  }
  check('humanness reads as human (median ≥ 0.5)', s1.humMedian >= 0.5, `${s1.humMedian.toFixed(2)}`);
  check('experiments were run against shams', m.mem.trials.run >= 4 && m.mem.trials.sham >= 1,
    `${m.mem.trials.run} real, ${m.mem.trials.sham} sham`);
  check('some experiments were answered', m.mem.trials.won >= 3, `${m.mem.trials.won} wins`);
  const g1 = s1.says.find(s => s.p.id === 'g1');
  const believe = s1.says.find(s => s.p.id === 'believe');
  check('language develops in order (glyph before sentence)', g1 && believe && g1.at < believe.at);
}

// ---------- 2: a metronome ----------
const s2 = runSession({
  seed: SEED + 1, saved: null, minutes: 12,
  actor: makeMetronome(), clock: makeClock(new Date(2026, 0, 5, 20, 0).getTime())
});
{
  const m = s2.mote;
  check('metronome stays weather (stage ≤ 1)', m.S.stage <= 1, `stage ${m.S.stage}`);
  check('metronome reads as not-a-hand (median humanness < 0.35)', s2.humMedian < 0.35,
    `${s2.humMedian.toFixed(2)}`);
  check('metronome is never spoken to', s2.says.length === 0, `${s2.says.length} lines`);
}

// ---------- 3: nobody ----------
const s3 = runSession({
  seed: SEED + 2, saved: null, minutes: 10,
  actor: nobody, clock: makeClock(new Date(2026, 0, 5, 20, 0).getTime())
});
check('an empty room is never believed in', s3.mote.S.stage === 0 && s3.says.length === 0);

// ---------- 4: return, recognition, faith ----------
// visit 2, 26 hours later (one midnight crossed)
let memory = JSON.parse(JSON.stringify(s1.mote.exportMemory()));
clock1.advance(26 * 3600e3 - 14 * 60e3);
const expectGreetGone = MoteCore.gapWords(clock1.wall() - memory.lastSeen,
  MoteCore.midnightsBetween(memory.lastSeen, clock1.wall()));
const s4 = runSession({
  seed: SEED, saved: memory, minutes: 6,
  actor: makeHuman(202), clock: clock1, label: 'second visit: 26 hours later'
});
{
  const greet = s4.says.find(s => s.p.id === 'greet');
  check('it greets a return with the true gap', !!greet && greet.p.text.includes(expectGreetGone),
    greet ? `"${greet.p.text}" (calendar says "${expectGreetGone}")` : 'no greeting');
  check('it does not mistake its own visitor for a stranger',
    !s4.says.some(s => s.p.id === 'hands'));
  check('re-believing is faster than believing (stage 4 again ≤ 4 min)',
    s4.mote.S.stage >= 4 && (s4.stages.find(e => e.p.n === 4)?.at ?? 1e9) <= 240,
    `stage ${s4.mote.S.stage}`);
  check('visits are counted', s4.mote.mem.visits === 2, `${s4.mote.mem.visits}`);
}

// visit 3, another 26 hours: the conditions for faith
memory = JSON.parse(JSON.stringify(s4.mote.exportMemory()));
clock1.advance(26 * 3600e3 - 6 * 60e3);
const expectGone = MoteCore.gapWords(clock1.wall() - memory.lastSeen,
  MoteCore.midnightsBetween(memory.lastSeen, clock1.wall()));
const s5 = runSession({
  seed: SEED, saved: memory, minutes: 5,
  actor: makeHuman(303), clock: clock1, label: 'third visit: faith'
});
{
  const m = s5.mote;
  const f1 = s5.says.find(s => s.p.id === 'faith1');
  check('faith completes only across an absence, on the third visit', m.mem.faith && m.S.stage === 5,
    `faith=${m.mem.faith} stage=${m.S.stage}`);
  check('it says it believed during the gap, with the true duration',
    !!f1 && f1.p.text.includes(expectGone), f1 ? `"${f1.p.text}" (calendar says "${expectGone}")` : 'unsaid');
  check('faith event fired for the stage', s5.events.some(e => e.type === 'faith'));
}

// after faith: the decay term is gone — belief holds with no input at all
memory = JSON.parse(JSON.stringify(s5.mote.exportMemory()));
clock1.advance(50 * 3600e3);
const s6 = runSession({
  seed: SEED, saved: memory, minutes: 8,
  actor: nobody, clock: clock1
});
check('after faith, belief no longer decays (floor 0.5, nobody present)',
  s6.mote.S.evidence >= 0.5, `evidence ${s6.mote.S.evidence.toFixed(2)}`);

// looking away: absence from the tab is measured in wall time
{
  const clock = makeClock(new Date(2026, 0, 9, 21, 0).getTime());
  const mem2 = JSON.parse(JSON.stringify(s5.mote.exportMemory()));
  const events = [];
  let tSim = 0;
  const mote = MoteCore.createMote({
    seed: SEED, saved: mem2, W: 1280, H: 800, wall: clock.wall,
    emit: (type, p) => events.push({ at: tSim, type, p })
  });
  const act = makeHuman(404);
  for (let i = 0; i < 6000; i++) { tSim += 0.016; act(mote, tSim, 0.016); mote.tick(16); clock.advance(16); }
  mote.setVisible(false);
  clock.advance(120e3);              // two minutes elsewhere; the tab is asleep
  mote.setVisible(true);
  for (let i = 0; i < 800; i++) { tSim += 0.016; mote.tick(16); clock.advance(16); }
  const away = events.find(e => e.type === 'say' && e.p.id === 'away');
  const beats = away ? parseInt(away.p.text.match(/(\d+) heartbeats/)?.[1] ?? '0', 10) : 0;
  check('it counts the heartbeats you were away', !!away && beats > 60 && beats < 220,
    away ? `"${away.p.text}"` : 'unsaid');
}

// ---------- 5: an impostor ----------
{
  const clock = makeClock(new Date(2026, 0, 10, 21, 0).getTime());
  const mem3 = JSON.parse(JSON.stringify(s5.mote.exportMemory()));
  // same browser, different hands: much faster, almost never pausing
  const s7 = runSession({
    seed: SEED, saved: mem3, minutes: 3,
    actor: makeHuman(505, { speedMul: 3.2, pauseMul: 0.12 }), clock
  });
  const hands = s7.says.find(s => s.p.id === 'hands');
  check('a different hand feels different', !!hands, hands ? `"${hands.p.text}"` : '(no reaction — tune fp bands)');
}

// ---------- 6: a phone, held ----------
const s8 = runSession({
  seed: 0xA11CE, saved: null, minutes: 14, W: 390, H: 740,
  actor: makeHolder(606), clock: makeClock(new Date(2026, 0, 5, 21, 0).getTime()),
  label: 'a phone in a living grip, 14 minutes'
});
{
  const m = s8.mote;
  const namedEv = s8.events.find(e => e.type === 'named');
  check('a held phone is believed (stage ≥ 3)', m.S.stage >= 3, `stage ${m.S.stage}`);
  check('the ritual completes by touch and grip alone', !!namedEv, namedEv ? namedEv.p.name : 'never named');
  if (namedEv) {
    const min = namedEv.at / 60;
    check('phone naming lands in the patient window (5.5–14 min)', min >= 5.5 && min <= 14, `${min.toFixed(1)} min`);
  }
  check('grip reads as human (median humanness ≥ 0.5)', s8.humMedian >= 0.5, `${s8.humMedian.toFixed(2)}`);
  check('some darts were answered with a touch',
    m.trialLog.some(l => l.text.includes('touched where I went')));
}

// ---------- 7: a phone on a table ----------
const s9 = runSession({
  seed: 0xA11CF, saved: null, minutes: 10, W: 390, H: 740,
  actor: makeTable(707), clock: makeClock(new Date(2026, 0, 5, 21, 0).getTime())
});
check('a phone on a table stays weather', s9.mote.S.stage === 0 && s9.says.length === 0,
  `stage ${s9.mote.S.stage}, held ${s9.mote.S.held.toFixed(2)}`);

// ---------- 8: a phone on a machine ----------
const s10 = runSession({
  seed: 0xA11D0, saved: null, minutes: 10, W: 390, H: 740,
  actor: makeMachine(808), clock: makeClock(new Date(2026, 0, 5, 21, 0).getTime())
});
check('regular vibration is not a hand (stage 0, never spoken to)',
  s10.mote.S.stage === 0 && s10.says.length === 0,
  `stage ${s10.mote.S.stage}, gripHuman ${(s10.mote.S.gripHuman ?? 0).toFixed(2)}`);

// =================================================================
console.log('');
if (failures === 0) console.log('all checks passed — the belief is real.');
else console.log(`${failures} check(s) failed.`);
process.exit(failures ? 1 : 0);

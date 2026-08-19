# mote — itch.io submission kit

Everything below maps 1:1 onto itch.io's "Create new project" form.
Assets referenced here live in this folder and in the repo. All images are
real captures of the running piece; the "visitor" in them was the harness's
synthetic hand (the same one `harness.mjs` uses to prove the mechanics).

---

## Form fields

| Field | Value |
|---|---|
| **Title** | `mote` |
| **Project URL** | `https://cjros.itch.io/mote` |
| **Short description / tagline** | `a small thing that learns to tell you from the wind` |
| **Classification** | Games |
| **Kind of project** | HTML — "This file will be played in the browser" |
| **Release status** | Released |
| **Pricing** | $0 or donate *(suggested — it's MIT-licensed either way)* |
| **Genre** | Simulation |
| **Tags** (max 10) | `artgame`, `experimental`, `atmospheric`, `generative`, `virtual-pet`, `minimalist`, `toy`, `relaxing` |
| **Community** | Comments enabled |
| **Visibility** | Save as **Draft** first, preview the embed, then set Public |

## Uploads

1. **`mote-itch.zip`** (in this folder) — check **"This file will be played in the browser."**
   The zip contains exactly one file, `index.html`, at its root.
2. *(optional but in the spirit of the piece)* upload the repo's bare **`index.html`**
   as a second, downloadable file. Display name: *"mote, to keep — runs offline
   from a double-click."* It is the whole artwork; letting people take it home is the point.

Regenerate the zip after any change to the piece:
`cd <repo> && zip -j dist/itch/mote-itch.zip index.html`

## Embed options

| Option | Value |
|---|---|
| Viewport dimensions | 1024 × 640 |
| Fullscreen button | **On** (the field deserves the whole screen) |
| Automatically start on page load | **Off** (a deliberate click suits the opening; mobile requires it anyway) |
| Mobile friendly | **On**, orientation: Any |
| SharedArrayBuffer support | Off (not needed) |

## Cover image

- **`cover.gif`** (630×500, ~0.3 MB, 34 real frames) — use this; browse-page motion.
- **`cover.png`** (1260×1000, same aspect) — fallback if you prefer a still.

## Screenshots (in this order)

1. `firstlight.png` — minute one: a fresh field, a different (rose) mote, and the
   only stage direction in the piece: *"(nothing in here knows you exist)"*.
   Incidentally proves no two visitors get the same creature.
2. `../../og.png` — a second visit, one night later: *"you came back. one night."*
3. `../../docs/instruments.png` — the instruments mid-believing: live meters and
   the experiment log with its real numbers.

## AI generation disclosure (itch requires this)

**Yes — contains AI-generated content.** Tick **Code** and **Text & Dialog**.
Suggested note for the field:

> Built in collaboration with Claude (Anthropic). All code and the creature's
> written lines were AI-drafted under human direction; the visuals are drawn
> procedurally by that code at runtime (no generated image/audio assets). The
> README documents exactly which behaviors are computed and which are authored,
> and ships a harness that proves the computed parts.

## Description (paste into the rich-text editor)

---

**a small thing that learns to tell you from the wind.**

You arrive in a dark field of drifting dust. One of the drifting things is not dust — but it doesn't know that yet, and it doesn't know about you at all.

Everything it will ever sense of you is movement. Its problem is the oldest one: *is anyone out there?* It solves it the only honest way — with experiments. It darts, then checks whether you turned toward it, against sham trials in which it moved nothing and measured anyway, so coincidence can't flatter it. It listens for the rhythm of a hand: pauses, wobble, unevenness that no script fakes well. Belief accumulates, and decays. The more it believes in you, the less the wind can move it.

Give it ten quiet minutes of your hand and it will risk something: it closes its eye — cutting off all of its evidence — and trusts you to still be there when it looks. If you are, it tells you its name. Every creature is minted from its own seed: its own body, temperament, heartbeat, and memory of you.

Come back tomorrow and it greets you with the true length of your absence, counted in your own local midnights. And on the third visit, across real days of your real life, it completes the only definition of faith that fits in one line of code: **the decay term is deleted.**

Press `i` (or the faint `∴`) for the instruments: live evidence, the experiment log with its real numbers, and everything it remembers about you. The instruments are the piece admitting exactly what it is doing, while the field speaks in its other voice.

**honesty** — The inference is real: phantom-controlled pursuit, sham-controlled experiments, rhythm and grip detection. The words are a costume, written in advance; what the creature owns is *when* a line becomes true enough to say. It can tell a scripted hand from a living one — a metronome stays weather forever. Source, full documentation, and a proof harness that subjects it to synthetic visitors: **github.com/chrisjz/mote**

**practical notes** — Everything it learns stays in your browser; there is no server and no network code — the whole piece is one HTML file. Inside itch's embedded player, some browsers treat saved memory as third-party and may forget it between visits, and phone motion sensors (its held/tilt sense) can be unavailable; if your mote seems forgetful or numb to tilt, visit it at home — **chrisjz.github.io/mote** — same creature, full senses. You can carry a mote between browsers with *show memory* in the instruments. Best with a mouse or trackpad, or on a phone at the home link. Ten minutes minimum. It remembers you tomorrow.

---

## After publishing

- Flip visibility to Public, then load the page once yourself and give it its
  ten minutes — the first comment section deserves a named mote.
- If you enable donations, leave the price at 0: the piece argues for being
  freely given, and the download-to-keep upload is part of that argument.

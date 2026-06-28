// knowledge.js
// Ida's expert design knowledge base. Single source of truth shared by the
// server (for the curated fallback brain and the /api/rooms catalog) and the
// browser UI. Content is distilled from professional interior-design practice
// and the feature sets of leading design software (Houzz Pro, Planner 5D,
// Foyr Neo, Morpholio Board, Modsy, SketchUp, Coohom).

export const SOFTWARE_INSPIRATION = [
  {
    name: 'Houzz Pro',
    features: ['Project dashboards', 'Product clipper & shopping lists', 'Client mood boards', 'Budget tracking'],
  },
  {
    name: 'Planner 5D',
    features: ['2D/3D floor planning', 'Drag-and-drop furniture', 'Snapshot photoreal renders'],
  },
  {
    name: 'Foyr Neo',
    features: ['AI auto-furnishing', 'Real-time 4K renders', '60k+ product catalog'],
  },
  {
    name: 'Morpholio Board',
    features: ['Mood boards', 'Auto color palettes', 'Live cost tally', 'Material swatches'],
  },
  {
    name: 'Modsy / Spacejoy',
    features: ['Photo-based room visualization', 'Shoppable designs', 'Multiple style concepts'],
  },
  {
    name: 'SketchUp',
    features: ['Precise modeling', 'Dimensioning', 'Lighting & shadow studies'],
  },
];

// Each room is a self-contained expert brief.
const ROOMS = [
  // ───────────────────────────────────────── HOME THEATRE ──────────────────
  {
    id: 'home-theatre',
    name: 'Home Theatre',
    icon: '🎬',
    accent: '#7c5cff',
    tagline: 'A light-controlled, acoustically tuned room built around the screen.',
    description:
      'A dedicated cinema room lives and dies by three things: light control, acoustics, and sightlines. ' +
      'Treat it like a sealed black box — dark surfaces, no reflections, every seat aimed at the screen.',
    designPrinciples: [
      { title: 'Sightline geometry', detail: 'Seat-to-screen distance of 1.5–2.5× the screen diagonal. Front-row eyes no more than 15° below screen centre; back-row no more than 35° up.' },
      { title: 'Light discipline', detail: 'Blackout the room completely, then add controllable bias light behind the screen at ~6500K to cut eye strain and deepen perceived contrast.' },
      { title: 'Acoustic balance', detail: 'Absorb first reflections, trap bass in corners, but keep some diffusion at the rear so the room is dead — not lifeless.' },
      { title: 'Riser tiering', detail: 'Raise each row 6–12" so back rows clear the heads in front. A second row almost always needs a riser.' },
    ],
    recommendations: {
      layout: [
        'Anchor the room on the screen wall and work backward — speakers, then seats, then traffic path.',
        'Two rows? Put the primary row at the reference distance and lift the rear row on a 6–12" carpeted riser.',
        'Leave 18–24" of walking clearance behind the last row and beside seats for safe egress in the dark.',
        'Centre the prime seat on the screen and the surround field — the "reference seat" gets the calibrated sweet spot.',
      ],
      lighting: [
        'Layer three circuits on dimmers/scenes: bias (behind screen), pathway (floor/step LEDs), and house (sconces).',
        'Wall sconces with downward shielding wash the side walls without throwing light at the screen.',
        'Fiber-optic or LED "starfield" ceiling adds drama and a soft glow for intermissions.',
        'Recessed step lights or LED tape under the riser nose prevents trips without lighting the screen.',
        'Put it all on a scene controller: "Movie", "Pause", "Clean" — one tap each.',
      ],
      acoustics: [
        'Treat the first-reflection points on side walls and ceiling with 2"+ absorption panels (mirror trick to find them).',
        'Stack floor-to-ceiling bass traps in the front corners — that is where low-end energy piles up.',
        'Keep the rear wall slightly live with a diffuser so dialogue stays natural and the room is not over-damped.',
        'Heavy velvet curtains, thick carpet + pad, and an upholstered ceiling cloud all double as decor and treatment.',
        'For true isolation: decouple the walls (resilient channel), add mass (double drywall + Green Glue), seal the door.',
      ],
      color: [
        'Go dark and matte: charcoal, deep navy, espresso, or oxblood absorb stray light and lift contrast.',
        'Matte/velvet finishes only — any gloss reflects the screen back at the audience.',
        'Reserve a single accent (brass sconces, a burgundy curtain) so the room reads cinematic, not cave-like.',
      ],
      furniture: [
        'Power recliners with cup holders and a centre console are the genre standard; choose modular so rows scale.',
        'Acoustically transparent screen + in-wall speakers gives the cleanest, most theatre-like look.',
        'A low-profile credenza hides the AVR and sources; ventilate it or gear runs hot.',
        'Add a snack/bar ledge on the rear wall — it keeps drinks off the floor in the dark.',
      ],
      technology: [
        'Display: 4K/8K laser projector + ambient-light-rejecting screen for a big room; large OLED for a brighter, smaller one.',
        'Surround: start at 5.1, target 7.2.4 Dolby Atmos with in-ceiling height speakers for the enveloping effect.',
        'Calibrate with a room-correction suite (Audyssey/Dirac) from the reference seat after treatment is installed.',
        'Hide the rack in a closet; run a single HDMI 2.1 / fiber run to the projector and label every cable.',
      ],
      materials: [
        'Carpet with a dense pad underfoot — the single best, cheapest acoustic upgrade for a theatre.',
        'Fabric-wrapped acoustic wall panels double as the finished wall surface.',
        'Solid-core door with full perimeter seals and a drop sweep to keep sound in and light out.',
      ],
    },
    colorPalettes: [
      { name: 'Midnight Cinema', colors: ['#14131a', '#2b2740', '#7c5cff', '#c9a24b'], mood: 'Deep, modern, contrast-forward' },
      { name: 'Old Hollywood', colors: ['#1a1413', '#3a1f1d', '#7c1f2b', '#c8a45c'], mood: 'Velvet, brass, oxblood drama' },
      { name: 'Graphite & Smoke', colors: ['#1c1c1e', '#33343a', '#5a5d66', '#8a8d96'], mood: 'Minimal, monochrome, screen-first' },
    ],
    shoppingList: [
      { item: '4K laser projector or 83"+ OLED', why: 'The centerpiece display', priceRange: '$1,800–6,000', priority: 'Must-have' },
      { item: 'AV receiver (7.2.4 Atmos capable)', why: 'Drives surround + height channels', priceRange: '$600–2,000', priority: 'Must-have' },
      { item: 'Acoustic panels + corner bass traps', why: 'Tames reflections and boom', priceRange: '$400–1,500', priority: 'Must-have' },
      { item: 'Power recliner home-theatre seating (per seat)', why: 'Comfort + correct sightlines', priceRange: '$500–1,500', priority: 'High' },
      { item: 'Bias + step LED lighting kit on scene control', why: 'Eye comfort & safe egress', priceRange: '$150–600', priority: 'High' },
      { item: 'Blackout drapery / acoustic curtains', why: 'Light + sound, dual duty', priceRange: '$200–800', priority: 'Medium' },
    ],
    measurements: [
      { label: 'Viewing distance', guidance: '1.5–2.5× the screen diagonal (e.g. 120" screen → 15–25 ft).' },
      { label: 'Screen height', guidance: 'Bottom of image ~24–36" off the floor so the front row looks slightly up, not down.' },
      { label: 'Riser height', guidance: '6–12" per row; depth ≥ 5 ft so reclined seats fit.' },
      { label: 'Surround speakers', guidance: 'Side surrounds ~2 ft above seated ear height, slightly behind the prime seat.' },
    ],
    proTips: [
      'Treat acoustics BEFORE you calibrate — correction software can not fix a reflective room, only polish a treated one.',
      'A dim 6500K bias light behind the screen makes blacks look deeper and saves your eyes on long movie nights.',
      'Buy seating you can add to later — modular rows let the room grow without re-buying everything.',
    ],
    inspiredBy: ['SketchUp (sightline & shadow studies)', 'Houzz Pro (budget tracking)', 'Planner 5D (3D seat layout)'],
    starters: ['How many seats fit in my room?', 'What speaker setup should I get?', 'How do I soundproof it?', 'Suggest a color scheme'],
  },

  // ───────────────────────────────────────────── SAUNA ─────────────────────
  {
    id: 'sauna',
    name: 'Sauna',
    icon: '🧖',
    accent: '#d98a3d',
    tagline: 'Warm wood, layered heat, and safe, breathable detailing.',
    description:
      'A great sauna is an exercise in restraint: the right wood, a correctly sized heater, smart ventilation, ' +
      'and lighting that glows rather than glares. Every material has to shrug off heat and moisture for years.',
    designPrinciples: [
      { title: 'Heat rises, so seat high', detail: 'The top bench should sit near the same height as the heater rocks so bathers reach the hot zone; the lower bench is the cool-down step.' },
      { title: 'Non-resinous softwoods only', detail: 'Use cedar, hemlock, basswood, or aspen — they stay cool to the touch, resist rot, and will not weep sap or splinter.' },
      { title: 'Two-point ventilation', detail: 'Fresh-air intake low near the heater, exhaust high on the opposite wall, creates the convection loop that keeps air breathable.' },
      { title: 'Glow, never glare', detail: 'Hide warm, moisture-rated light behind backrests and benches; never put a bright fixture in the bather\'s eyeline.' },
    ],
    recommendations: {
      layout: [
        'Two-tier benches: an upper hot bench (foot space below) and a lower bench for cooling and stepping up.',
        'Allow ~2 ft of bench width per seated bather and ~6 ft of length so one person can lie down.',
        'Keep a clear safety zone around the heater — guard rail and 4–6" clearance to benches and walls.',
        'A full or half glass door (and a glass front wall) makes a small sauna feel larger and easier to monitor.',
      ],
      lighting: [
        'Use only IP54+/sauna-rated, heat-tolerant fixtures — standard fittings fail fast in heat and steam.',
        'Tuck LED strips or fiber optic under the top bench and behind backrests for a floating, indirect glow.',
        'Warm color temperature (2200–2700K) reads as relaxing; cool white feels clinical and breaks the mood.',
        'Add a dimmer or a separate low "night" setting for a softer, candle-like wind-down.',
        'A Himalayan salt-brick wall, back-lit, doubles as a feature and a soft ambient source.',
      ],
      acoustics: [
        'Sauna is about silence, but a small waterproof speaker (or bone-conduction) lets you add gentle ambient sound.',
        'Solid bench and wall construction naturally deadens outside noise; weather-seal the door for quiet.',
      ],
      color: [
        'Let the wood be the palette — honeyed cedar or pale aspen needs almost no other color.',
        'Accent with matte black hardware, slate or pebble flooring, and natural stone around the heater.',
        'Avoid paints and stains inside the hot room; they off-gas and trap moisture. Finish wood with sauna-safe paraffin oil only.',
      ],
      furniture: [
        'Ergonomic, slatted benches with rounded "comfort" edges and removable sections for easy cleaning.',
        'Contoured backrests and a slatted headrest turn a bench into a place you can actually relax.',
        'Accessories that earn their place: birch bucket + ladle, sand timer, thermometer/hygrometer, towel hooks, duckboard floor mat.',
      ],
      technology: [
        'Heater sizing: ~1 kW per 45 cubic ft (1.3 m³) of room volume — undersize and it never gets hot, oversize and it bakes.',
        'Choose your heat: electric (simple, controllable), wood-burning (authentic löyly), or infrared (lower heat, faster, lower power draw).',
        'Add a digital controller with timer, target temp, and remote pre-heat so the sauna is ready when you are.',
        'Wire to a dedicated GFCI-protected circuit and follow heater clearance specs to the letter — this is a safety item, not a preference.',
      ],
      materials: [
        'Wall/ceiling: tongue-and-groove cedar or hemlock over foil vapor barrier and insulation (foil reflects heat back in).',
        'Floor: sealed tile or concrete with a floor drain and a removable wood duckboard on top.',
        'Door: tempered glass with a wooden or heat-isolated handle; never metal in the hot zone.',
        'Fasteners: hidden or recessed — exposed metal in a sauna gets hot enough to burn.',
      ],
    },
    colorPalettes: [
      { name: 'Nordic Cedar', colors: ['#caa472', '#a9743f', '#6f4a2a', '#2b2521'], mood: 'Classic, warm, honeyed wood' },
      { name: 'Pale Aspen Spa', colors: ['#e7d6b8', '#cdb892', '#9c9a8e', '#3a3a36'], mood: 'Light, airy, modern spa' },
      { name: 'Charred & Stone', colors: ['#d9b27c', '#7a6a5a', '#4a4744', '#1d1b19'], mood: 'Black hardware, slate, contrast' },
    ],
    shoppingList: [
      { item: 'Correctly sized sauna heater (kiuas)', why: 'The heart of the room; size to volume', priceRange: '$500–2,500', priority: 'Must-have' },
      { item: 'Cedar/hemlock T&G cladding + benches', why: 'Heat-safe, rot-resistant surfaces', priceRange: '$800–3,000', priority: 'Must-have' },
      { item: 'Foil vapor barrier + insulation', why: 'Holds heat, protects the structure', priceRange: '$150–500', priority: 'Must-have' },
      { item: 'Sauna-rated LED / fiber lighting', why: 'Safe, warm, indirect glow', priceRange: '$120–500', priority: 'High' },
      { item: 'Tempered glass door', why: 'Light, openness, safety', priceRange: '$300–900', priority: 'High' },
      { item: 'Accessories: bucket, ladle, timer, thermo-hygrometer', why: 'Function + the ritual', priceRange: '$80–250', priority: 'Medium' },
    ],
    measurements: [
      { label: 'Ceiling height', guidance: 'Keep it low (~7 ft / 2.1 m) — high ceilings waste heat above your head.' },
      { label: 'Bench spacing', guidance: 'Upper bench ~42–48" off the floor; lower bench ~18" below it as a step.' },
      { label: 'Heater clearance', guidance: 'Follow the model spec (often 4–8" to wood); never skip the guard rail.' },
      { label: 'Vents', guidance: 'Intake low near heater (~6" off floor); exhaust high on the opposite wall.' },
    ],
    proTips: [
      'Size the heater to the room VOLUME, not the floor area — a vaulted ceiling needs noticeably more kW.',
      'A foil vapor barrier behind the cladding is non-negotiable: it reflects heat in and keeps moisture out of the wall.',
      'Never finish interior wood with ordinary varnish — use sauna paraffin oil, or leave it bare and let it patina.',
    ],
    inspiredBy: ['SketchUp (bench & clearance modeling)', 'Planner 5D (material swatches)', 'Foyr Neo (lighting study)'],
    starters: ['What size heater do I need?', 'Which wood should I use?', 'How do I light it safely?', 'Help me plan ventilation'],
  },

  // ──────────────────────────────────────────── MUSIC ROOM ─────────────────
  {
    id: 'music-room',
    name: 'Music Room',
    icon: '🎹',
    accent: '#2bb6a3',
    tagline: 'A balanced acoustic — controlled, but alive enough to play in.',
    description:
      'Unlike a theatre, a music room should not be dead. The goal is a balanced acoustic: tame the flutter and ' +
      'boom, but keep enough diffusion and life that instruments breathe and the room is a joy to play in.',
    designPrinciples: [
      { title: 'Absorb AND diffuse', detail: 'Over-damping makes a room feel lifeless and tiring. Pair absorption at reflection points with diffusion on the rear/ceiling to keep it lively.' },
      { title: 'Tame the room modes', detail: 'Bass piles up in corners and along walls. Floor-to-ceiling corner bass traps even out the low end more than anything else you can do.' },
      { title: 'Decouple to isolate', detail: 'If neighbors matter: add mass, an air gap, and break the structural path — floating floor, isolation clips, sealed solid-core door.' },
      { title: 'Symmetry at the listening/playing spot', detail: 'Keep the left and right of the room mirror-matched so the stereo image and reflections stay even.' },
    ],
    recommendations: {
      layout: [
        'Place the player/monitors on the short wall, firing down the length of the room for the smoothest bass.',
        'Form an equilateral triangle between the two monitors and your ears; aim for ~38% of room length as the listening spot.',
        'Keep large reflective surfaces (glass, bare wall) off the first-reflection zones beside the player.',
        'Give a piano an interior wall away from windows; give a drum kit the most isolated corner and the most bass trapping.',
      ],
      lighting: [
        'Dimmable, layered lighting: bright, even task light for reading scores; a warm low scene for performance and recording.',
        'Use indirect/cove lighting to avoid glare on screens, music stands, and instrument finishes.',
        'A clip or floor lamp at the music stand gives focused light without washing out the room.',
        'Choose quiet drivers — cheap LED dimmers can buzz and leak hum into sensitive recordings.',
      ],
      acoustics: [
        'Corner bass traps first — they fix the biggest, most fatiguing problem (uneven low end).',
        'Absorption panels at the first reflection points on side walls and the ceiling above the player.',
        'Quadratic/skyline diffusers on the rear wall scatter sound so the room stays spacious, not boxy.',
        'A bookshelf full of irregular books is a surprisingly effective, free diffuser for the back of the room.',
        'Aim for a balanced RT60 around 0.3–0.5s for a small room — controlled, but not anechoic.',
      ],
      color: [
        'Warm, calming mid-tones (sage, clay, muted teal, warm grey) suit long practice sessions without fatigue.',
        'Let an instrument be the hero — a walnut piano or a brass horn pops against a soft, desaturated wall.',
        'Fabric-wrapped panels in a complementary color make treatment look intentional, like art.',
      ],
      furniture: [
        'Adjustable bench/stool at correct playing height; a comfortable listening chair at the sweet spot.',
        'Closed storage for sheet music and gear, plus open display for the instruments you want to show off.',
        'Sturdy, isolated stands and wall mounts (guitars, violins) keep instruments safe and the floor clear.',
        'A rug with a thick pad under the playing area cuts floor reflections and protects the instrument.',
      ],
      technology: [
        'Studio monitors on decoupling pads/stands at ear height, pulled away from the wall to reduce boundary bass.',
        'Treat HVAC noise: low-velocity diffusers and lined ducts keep the noise floor low for recording.',
        'Cable management trays and a small patch/interface station keep the room playable, not a tangle.',
        'Add an acoustic measurement mic + free software (e.g. REW) to actually see your room and tune it.',
      ],
      materials: [
        'A live/dead split works well: hardwood or tile on the playing side, carpet/absorption on the listening side.',
        'Fabric-wrapped rockwool panels (broadband absorption) are the workhorse treatment.',
        'Solid-core door with seals + a floating or rubber-isolated floor for serious isolation.',
      ],
    },
    colorPalettes: [
      { name: 'Warm Studio', colors: ['#b9a48a', '#8a6f52', '#caa24b', '#2f2a25'], mood: 'Cozy, woody, vintage studio' },
      { name: 'Sage & Walnut', colors: ['#9fae93', '#6f7d64', '#5a3d2b', '#2b2a26'], mood: 'Calm, natural, focused' },
      { name: 'Teal Acoustic', colors: ['#2bb6a3', '#1f7a70', '#244b52', '#15211f'], mood: 'Modern, fresh, panel-as-art' },
    ],
    shoppingList: [
      { item: 'Broadband corner bass traps (4×)', why: 'Biggest acoustic win in any music room', priceRange: '$300–900', priority: 'Must-have' },
      { item: 'First-reflection absorption panels', why: 'Clean, accurate sound at the playing spot', priceRange: '$250–700', priority: 'Must-have' },
      { item: 'Rear-wall diffusers', why: 'Keeps the room lively, not dead', priceRange: '$200–800', priority: 'High' },
      { item: 'Studio monitors + decoupling stands', why: 'Honest monitoring / playback', priceRange: '$400–1,500', priority: 'High' },
      { item: 'Dimmable, low-glare lighting + quiet dimmers', why: 'Practice vs. performance scenes', priceRange: '$150–500', priority: 'Medium' },
      { item: 'Thick rug + pad and instrument storage/mounts', why: 'Floor reflections + safe storage', priceRange: '$200–700', priority: 'Medium' },
    ],
    measurements: [
      { label: 'Listening position', guidance: 'Around 38% of the room length from the front wall avoids the worst modal nulls.' },
      { label: 'Monitor triangle', guidance: 'Monitors and your head form an equilateral triangle; tweeters at ear height.' },
      { label: 'Panel coverage', guidance: 'Treat first reflections + corners first; ~15–25% of wall area is a sane starting point.' },
      { label: 'Target RT60', guidance: '~0.3–0.5s for a small/medium room — controlled but musical.' },
    ],
    proTips: [
      'Resist the urge to cover every wall in foam — a fully damped room is exhausting to play in. Balance is the goal.',
      'Bass traps in the corners do more for sound quality than any other single purchase. Start there.',
      'Measure with a $100 mic and free software before and after — you will treat smarter and waste less money.',
    ],
    inspiredBy: ['SketchUp (acoustic modeling)', 'Morpholio Board (panel-as-art mood boards)', 'Houzz Pro (gear shopping list)'],
    starters: ['How do I treat the room without killing it?', 'Where do my speakers go?', 'How do I soundproof for neighbors?', 'Pick a calming palette'],
  },

  // ─────────────────────────────────────────── STUDY ROOM 1 ────────────────
  {
    id: 'study-1',
    name: 'Study Room 1 — Focus Office',
    icon: '📚',
    accent: '#3d6fd9',
    tagline: 'A deep-work room: ergonomic, glare-free, and calm.',
    description:
      'Study Room 1 is built for sustained, single-tasking focus. Everything serves attention: an ergonomic ' +
      'workstation, glare-free task light, calming color, and quiet acoustics for calls and concentration.',
    designPrinciples: [
      { title: 'Ergonomics first', detail: 'Monitor top at or just below eye level, elbows ~90°, feet flat. A sit-stand desk + supportive chair prevent the fatigue that ends a work session early.' },
      { title: 'Light without glare', detail: 'Desk perpendicular to the window so daylight rakes across, not into, the screen. Add a dimmable task lamp from the non-writing side.' },
      { title: 'Color for concentration', detail: 'Cool, low-saturation blues and greens are calming and focus-friendly; keep one warm accent so the room is not cold.' },
      { title: 'A quiet acoustic', detail: 'Soft surfaces — a rug, curtains, a fabric panel or two — cut echo so video calls are clear and the room feels calm.' },
    ],
    recommendations: {
      layout: [
        'Set the desk perpendicular to the window: daylight from the side, never behind the screen or in your eyes.',
        'Define one "focus zone" (desk) and, if space allows, a small "reading/think nook" with a comfortable chair.',
        'Keep the most-used storage within an arm\'s sweep; archive the rest vertically to keep the desk clear.',
        'Position the chair so your back is not to the door — a sense of command reduces low-grade distraction.',
      ],
      lighting: [
        'Layer ambient + task + accent. A dimmable LED task lamp (~500 lux at the desk) is the workhorse.',
        'Use ~4000–5000K (neutral/cool) light during focus hours; it supports alertness better than warm light.',
        'Bias-light the wall behind the monitor to cut the harsh bright-screen/dark-wall contrast that tires eyes.',
        'Position lamps to the side of your writing hand so you do not cast a shadow over your work.',
      ],
      acoustics: [
        'A rug + pad, curtains, and one or two fabric panels tame echo and make calls sound clean.',
        'A bookshelf on a shared wall is both storage and a sound buffer to the rest of the house.',
        'Weatherstrip the door to keep household noise out of deep-work sessions and meetings.',
      ],
      color: [
        'Anchor with a calm blue, soft sage, or warm greige for the walls — focused and low-stimulation.',
        'Add ONE grounding accent: walnut wood, a forest-green chair, or brushed brass, so it feels warm, not sterile.',
        'Keep the field behind the monitor low-contrast and clutter-free to reduce visual fatigue.',
      ],
      furniture: [
        'Sit-stand desk + ergonomic task chair with lumbar support — the two highest-ROI purchases in the room.',
        'A monitor arm frees desk space and dials in the exact height/distance for neck-neutral posture.',
        'Closed storage for clutter + open shelving for a curated few books and objects keeps the room calm.',
        'A small side table or credenza for a printer/scanner keeps the desktop clear.',
      ],
      technology: [
        'Run power and data through a cable tray/grommet so nothing snakes across the desk or floor.',
        'A monitor at arm\'s length, top edge at eye level, is the single biggest posture upgrade.',
        'For calls: a small acoustic panel behind you on camera improves both your audio and your background.',
        'Add a smart plug or scene so "Focus" sets the right light level in one tap.',
      ],
      materials: [
        'Matte desk surface (less screen glare) over glossy; warm wood tones reduce the clinical-office feel.',
        'Wool or wool-blend rug — durable, sound-absorbing, and warm underfoot.',
        'A pinboard or magnetic wall turns vertical space into a flexible, low-clutter planning surface.',
      ],
    },
    colorPalettes: [
      { name: 'Focused Blue', colors: ['#3d6fd9', '#6f93d9', '#dfe6f2', '#2a2f3a'], mood: 'Calm, alert, professional' },
      { name: 'Sage Scholar', colors: ['#9bae97', '#6f8a72', '#e7e3d6', '#3a3a32'], mood: 'Natural, grounded, soft' },
      { name: 'Warm Greige', colors: ['#cdbfa8', '#a3937a', '#6f5d46', '#322c24'], mood: 'Cozy, neutral, library-like' },
    ],
    shoppingList: [
      { item: 'Sit-stand desk', why: 'Posture variety = longer, healthier focus', priceRange: '$300–900', priority: 'Must-have' },
      { item: 'Ergonomic task chair (lumbar support)', why: 'The foundation of all-day comfort', priceRange: '$250–1,200', priority: 'Must-have' },
      { item: 'Dimmable LED task lamp', why: 'Glare-free light tuned to the task', priceRange: '$60–250', priority: 'High' },
      { item: 'Monitor arm', why: 'Neck-neutral height + a clear desk', priceRange: '$80–300', priority: 'High' },
      { item: 'Wool rug + 1–2 fabric acoustic panels', why: 'Quiet room, clean calls', priceRange: '$200–700', priority: 'Medium' },
      { item: 'Cable tray + closed storage', why: 'Visual calm = mental calm', priceRange: '$80–400', priority: 'Medium' },
    ],
    measurements: [
      { label: 'Desk height (seated)', guidance: '~28–30"; elbows ~90°, wrists straight.' },
      { label: 'Monitor distance', guidance: 'About an arm\'s length (20–28"); top of screen at eye level.' },
      { label: 'Desk task light', guidance: 'Aim for ~500 lux on the work surface; more for fine detail work.' },
      { label: 'Clearance', guidance: 'Leave ~36" behind the desk for the chair to roll out comfortably.' },
    ],
    proTips: [
      'Place the desk so the window is to your side — the most common home-office mistake is a window (or wall) directly behind the screen.',
      'Neutral-to-cool light (~4500K) during work hours measurably supports alertness; save warm light for the evening wind-down.',
      'One acoustic panel behind your chair quietly upgrades every video call you take.',
    ],
    inspiredBy: ['Planner 5D (desk layout)', 'Houzz Pro (budget + product list)', 'Modsy (style concepts)'],
    starters: ['How should I position my desk?', 'What lighting helps focus?', 'Recommend an ergonomic setup', 'Pick a calm color scheme'],
  },

  // ─────────────────────────────────────────── STUDY ROOM 2 ────────────────
  {
    id: 'study-2',
    name: 'Study Room 2 — Reading & Collaboration',
    icon: '📖',
    accent: '#c9742e',
    tagline: 'A warmer, flexible room for reading, creativity, and two-person work.',
    description:
      'Study Room 2 is the softer counterpart to the focus office: a warm, inviting room for reading, ' +
      'brainstorming, tutoring, or two people working side by side. It trades clinical efficiency for comfort and flexibility.',
    designPrinciples: [
      { title: 'Comfort drives the room', detail: 'A great reading chair with proper light is the anchor. Warm materials and texture make people want to stay and think.' },
      { title: 'Flexible, reconfigurable space', detail: 'A shared/movable table and stackable or wheeled seating let the room flip between solo reading, tutoring, and small-group work.' },
      { title: 'Biophilic warmth', detail: 'Plants, natural wood, and warm light lower stress and lift creativity — ideal for the more open-ended work this room hosts.' },
      { title: 'Reading-grade light', detail: 'A dedicated reading light over the chair (warm, ~2700–3000K, ~300–500 lux on the page) prevents eye strain in the cozy zone.' },
    ],
    recommendations: {
      layout: [
        'Anchor a reading nook in the best-lit corner: a supportive armchair, a side table, and a focused floor lamp.',
        'Add a flexible central table that seats two and clears for solo work — the room\'s collaborative core.',
        'Line one wall with accessible bookshelves; keep frequently used references at arm height.',
        'Leave an open flex zone (a soft rug, floor cushions) for a child, a tutoring session, or sprawling out with material.',
      ],
      lighting: [
        'Warm, layered light (2700–3000K) for a cozy, library feel — the opposite of the cool focus office.',
        'A dedicated reading lamp beside the chair, aimed at the page over your shoulder, prevents shadow and strain.',
        'Pendant or warm task light over the shared table for two-person work without harsh overhead glare.',
        'Dimmers everywhere so the room shifts from bright collaboration to a soft evening reading glow.',
      ],
      acoustics: [
        'Soft furnishings — upholstered chairs, a thick rug, curtains, and full bookshelves — make this room naturally quiet and warm.',
        'If it doubles for tutoring or calls, add a fabric panel or two so two voices stay clear.',
      ],
      color: [
        'Warm, inviting tones: terracotta, ochre, soft caramel, or a moody library green for cocooning comfort.',
        'Rich wood bookshelves and warm metals (brass, bronze) reinforce the cozy, collected feel.',
        'A bolder accent is welcome here — a patterned reading chair or a painted bookshelf back adds personality.',
      ],
      furniture: [
        'A genuinely comfortable, supportive reading chair (with an ottoman) is the heart of the room — do not skimp.',
        'A lightweight, movable table + stackable or castored chairs make the space reconfigurable in seconds.',
        'Generous, accessible shelving — mix closed storage with open display for books and objects.',
        'A floor lamp, a soft throw, and a couple of floor cushions make the flex zone instantly usable.',
      ],
      technology: [
        'Keep tech light and tidy — a charging tray and a single tidy power source preserve the analog, calm mood.',
        'If used for tutoring/calls, add a small wall display or a roll-up whiteboard for two-person work.',
        'A smart bulb scene ("Read", "Work", "Wind down") lets the room change character in one tap.',
      ],
      materials: [
        'Layer texture: a wool rug, linen curtains, a leather or boucle chair, and warm wood shelving.',
        'Cork or pin boards for a flexible, tactile planning/inspiration wall.',
        'Add real plants — they soften the room, improve the air, and reinforce the biophilic, restful mood.',
      ],
    },
    colorPalettes: [
      { name: 'Library Green', colors: ['#3f5a48', '#6f8a6f', '#c9b07c', '#241f1a'], mood: 'Moody, cocooning, classic study' },
      { name: 'Terracotta Warmth', colors: ['#c9742e', '#a8552a', '#e6cca6', '#332620'], mood: 'Cozy, earthy, inviting' },
      { name: 'Caramel & Cream', colors: ['#d9b48a', '#b88a55', '#efe6d6', '#3a2f24'], mood: 'Soft, warm, relaxed reading' },
    ],
    shoppingList: [
      { item: 'Supportive reading chair + ottoman', why: 'The anchor of the room', priceRange: '$400–1,500', priority: 'Must-have' },
      { item: 'Warm reading floor/table lamp', why: 'Page-level light, no strain', priceRange: '$80–300', priority: 'Must-have' },
      { item: 'Accessible bookshelving (wall system)', why: 'Storage + the room\'s character', priceRange: '$300–1,500', priority: 'High' },
      { item: 'Lightweight flexible table + stackable chairs', why: 'Reconfigurable collaboration', priceRange: '$300–1,000', priority: 'High' },
      { item: 'Wool rug, throw, floor cushions', why: 'Warmth, quiet, the flex zone', priceRange: '$200–800', priority: 'Medium' },
      { item: 'Plants + warm smart lighting scene', why: 'Biophilic calm, one-tap moods', priceRange: '$80–350', priority: 'Medium' },
    ],
    measurements: [
      { label: 'Reading light', guidance: 'Warm (~2700–3000K), ~300–500 lux on the page, aimed over the shoulder.' },
      { label: 'Shelf reach', guidance: 'Keep daily books between knee and shoulder height; archive higher/lower.' },
      { label: 'Shared table', guidance: '~24" of width per person; ~36" of clearance to pull chairs out.' },
      { label: 'Nook footprint', guidance: 'A chair + side table + lamp needs only ~3.5 × 4 ft to feel complete.' },
    ],
    proTips: [
      'Make this room the warm opposite of the focus office — warm light, warm color, soft texture — so each room signals a different mode of work.',
      'Buy the reading chair you would happily fall asleep in; comfort is the whole point of this space.',
      'Wheels and a lightweight table turn one room into three: solo reading, tutoring, and small-group work.',
    ],
    inspiredBy: ['Modsy/Spacejoy (cozy concepts)', 'Morpholio Board (texture mood boards)', 'Planner 5D (flexible layouts)'],
    starters: ['Design a cozy reading nook', 'Warm lighting ideas?', 'Make it work for tutoring too', 'Suggest a warm palette'],
  },
];

export default ROOMS;
export { ROOMS };

/**
 * Circuit definitions
 *
 * Every circuit is data: a loop of centreline waypoints (the AI aims for these), the track
 * width, the indices of the two sector gates and a pit-lane side. `selectCircuit()` turns a
 * definition into the live `track` object that the physics, AI, rendering and timing all read,
 * so nothing else in the game knows which circuit is loaded.
 */
const circuits = [
  {
    id: "gleann_luais",
    name: "Gleann Luais",
    country: "Ireland",
    inspiration: "The original circuit: a fast, flowing glen with a long ridge straight and a tight hairpin",
    character: "Flowing",
    width: 160,
    pitSide: -1,
    sectors: [12, 32],
    sectorNames: ["Tosach/Críoch", "Cúinne Tír", "Leantóir Gaoithe"],
    waypoints: [
      { x: 1000, y: 1300 }, { x: 1000, y: 1220 }, { x: 1000, y: 1140 },
      { x: 1080, y: 1060 }, { x: 1200, y: 980 }, { x: 1350, y: 900 }, { x: 1480, y: 820 },
      { x: 1650, y: 750 }, { x: 1800, y: 680 }, { x: 1920, y: 600 }, { x: 2020, y: 520 },
      { x: 2100, y: 450 }, { x: 2150, y: 350 }, { x: 2170, y: 250 }, { x: 2160, y: 150 },
      { x: 2120, y: 80 }, { x: 2000, y: 50 }, { x: 1850, y: 70 }, { x: 1700, y: 120 },
      { x: 1550, y: 180 }, { x: 1400, y: 250 }, { x: 1280, y: 330 }, { x: 1180, y: 420 },
      { x: 1100, y: 500 }, { x: 1000, y: 580 }, { x: 900, y: 660 }, { x: 820, y: 740 },
      { x: 750, y: 820 }, { x: 650, y: 900 }, { x: 520, y: 980 }, { x: 380, y: 1050 },
      { x: 250, y: 1120 }, { x: 180, y: 1200 }, { x: 150, y: 1300 }, { x: 180, y: 1400 },
      { x: 250, y: 1480 }, { x: 350, y: 1520 }, { x: 480, y: 1540 }, { x: 620, y: 1550 },
      { x: 750, y: 1540 }, { x: 850, y: 1520 }, { x: 920, y: 1480 }, { x: 960, y: 1420 }, { x: 980, y: 1360 },
    ],
  },
  {
    id: "lombardy_park",
    name: "Lombardy Park",
    country: "Italy",
    inspiration: "Echoes Monza: two long straights broken by chicanes, a sweeping Curva Grande and a long final parabolic bend",
    character: "Top speed",
    width: 160,
    pitSide: -1,
    sectors: [13, 27],
    sectorNames: ["Rettilineo", "Variante Alta", "Parabolica"],
    waypoints: [
      { x: 350, y: 1450 }, { x: 550, y: 1450 }, { x: 750, y: 1450 }, { x: 930, y: 1450 },
      { x: 1010, y: 1380 }, { x: 1090, y: 1340 }, { x: 1180, y: 1400 }, { x: 1300, y: 1440 },
      { x: 1500, y: 1440 }, { x: 1700, y: 1420 }, { x: 1880, y: 1360 }, { x: 2020, y: 1250 },
      { x: 2110, y: 1110 }, { x: 2150, y: 960 }, { x: 2080, y: 900 }, { x: 2150, y: 830 },
      { x: 2170, y: 700 }, { x: 2100, y: 600 }, { x: 1990, y: 560 }, { x: 1900, y: 480 },
      { x: 1780, y: 380 }, { x: 1600, y: 330 }, { x: 1400, y: 300 }, { x: 1200, y: 300 },
      { x: 1080, y: 340 }, { x: 980, y: 270 }, { x: 880, y: 300 }, { x: 700, y: 300 },
      { x: 500, y: 300 }, { x: 350, y: 320 }, { x: 230, y: 400 }, { x: 170, y: 560 },
      { x: 180, y: 760 }, { x: 230, y: 960 }, { x: 300, y: 1150 }, { x: 340, y: 1300 },
    ],
  },
  {
    id: "ardennes_forest",
    name: "Ardennes Forest",
    country: "Belgium",
    inspiration: "Echoes Spa-Francorchamps: a hairpin after the line, the Eau Rouge and Raidillon climb, the long Kemmel straight and the double-apex Pouhon",
    character: "High speed",
    width: 160,
    pitSide: 1,
    sectors: [16, 28],
    sectorNames: ["La Source", "Les Combes", "Stavelot"],
    waypoints: [
      { x: 1100, y: 1480 }, { x: 1300, y: 1480 }, { x: 1500, y: 1470 }, { x: 1680, y: 1440 },
      { x: 1800, y: 1400 }, { x: 1860, y: 1310 }, { x: 1810, y: 1230 }, { x: 1710, y: 1210 },
      { x: 1600, y: 1150 }, { x: 1520, y: 1060 }, { x: 1560, y: 970 }, { x: 1500, y: 880 },
      { x: 1540, y: 790 }, { x: 1580, y: 640 }, { x: 1620, y: 480 }, { x: 1660, y: 330 },
      { x: 1690, y: 210 }, { x: 1600, y: 150 }, { x: 1500, y: 170 }, { x: 1440, y: 250 },
      { x: 1330, y: 300 }, { x: 1200, y: 260 }, { x: 1070, y: 300 }, { x: 1010, y: 400 },
      { x: 1040, y: 500 }, { x: 960, y: 590 }, { x: 830, y: 640 }, { x: 690, y: 620 },
      { x: 560, y: 580 }, { x: 460, y: 640 }, { x: 430, y: 770 }, { x: 350, y: 860 },
      { x: 240, y: 900 }, { x: 170, y: 1010 }, { x: 160, y: 1160 }, { x: 230, y: 1300 },
      { x: 370, y: 1400 }, { x: 540, y: 1460 }, { x: 700, y: 1470 }, { x: 800, y: 1420 }, { x: 900, y: 1470 },
    ],
  },
  {
    id: "northampton_aerodrome",
    name: "Northampton Aerodrome",
    country: "England",
    inspiration: "Echoes Silverstone: the fast Copse right-hander into the Maggotts, Becketts and Chapel esses, the Hangar straight and the long Luffield loop",
    character: "Fast sweeps",
    width: 160,
    pitSide: -1,
    sectors: [12, 24],
    sectorNames: ["Copse", "Stowe", "Village"],
    waypoints: [
      { x: 500, y: 1400 }, { x: 700, y: 1400 }, { x: 900, y: 1390 }, { x: 1050, y: 1330 },
      { x: 1130, y: 1220 }, { x: 1230, y: 1150 }, { x: 1330, y: 1180 }, { x: 1400, y: 1080 },
      { x: 1500, y: 1040 }, { x: 1620, y: 990 }, { x: 1800, y: 900 }, { x: 1980, y: 800 },
      { x: 2120, y: 700 }, { x: 2180, y: 580 }, { x: 2120, y: 470 }, { x: 2010, y: 430 },
      { x: 1930, y: 340 }, { x: 1850, y: 260 }, { x: 1720, y: 230 }, { x: 1580, y: 260 },
      { x: 1460, y: 240 }, { x: 1340, y: 180 }, { x: 1200, y: 160 }, { x: 1080, y: 210 },
      { x: 1020, y: 310 }, { x: 1080, y: 400 }, { x: 1180, y: 430 }, { x: 1150, y: 560 },
      { x: 980, y: 620 }, { x: 800, y: 680 }, { x: 620, y: 740 }, { x: 480, y: 800 },
      { x: 380, y: 900 }, { x: 330, y: 1030 }, { x: 330, y: 1160 }, { x: 380, y: 1280 }, { x: 430, y: 1370 },
    ],
  },
  {
    id: "ise_bay",
    name: "Ise Bay",
    country: "Japan",
    inspiration: "Echoes Suzuka: the only figure-of-eight, with the esses, a crossover, a tight hairpin, the double-apex Spoon and the flat-out 130R",
    character: "Technical",
    width: 160,
    pitSide: -1,
    sectors: [11, 24],
    sectorNames: ["Esses", "Hairpin", "Spoon"],
    crossover: true,
    waypoints: [
      { x: 500, y: 1380 }, { x: 700, y: 1380 }, { x: 900, y: 1380 }, { x: 1060, y: 1340 },
      { x: 1160, y: 1240 }, { x: 1180, y: 1120 }, { x: 1100, y: 1030 }, { x: 1170, y: 940 },
      { x: 1100, y: 860 }, { x: 1150, y: 770 }, { x: 1280, y: 640 }, { x: 1400, y: 580 },
      { x: 1540, y: 540 }, { x: 1680, y: 560 }, { x: 1760, y: 640 }, { x: 1720, y: 740 },
      { x: 1640, y: 780 }, { x: 1700, y: 900 }, { x: 1820, y: 1000 }, { x: 1900, y: 1140 },
      { x: 1880, y: 1280 }, { x: 1760, y: 1350 }, { x: 1620, y: 1300 }, { x: 1500, y: 1130 },
      { x: 1380, y: 960 }, { x: 1270, y: 800 }, { x: 1120, y: 590 }, { x: 1030, y: 470 },
      { x: 900, y: 400 }, { x: 760, y: 400 }, { x: 640, y: 460 }, { x: 560, y: 580 },
      { x: 470, y: 720 }, { x: 420, y: 880 }, { x: 500, y: 960 }, { x: 430, y: 1060 },
      { x: 400, y: 1160 }, { x: 410, y: 1260 }, { x: 450, y: 1340 },
    ],
  },
  {
    id: "harbour_street",
    name: "Harbour Street Circuit",
    country: "Monaco",
    inspiration: "Echoes Monaco: a narrow street circuit with a tight first corner, a climb to the casino, a hairpin, a long tunnel bend, a chicane and the swimming-pool esses",
    character: "Street",
    width: 130,
    pitSide: 1,
    sectors: [13, 27],
    sectorNames: ["Sainte Dévote", "Hairpin", "Tunnel"],
    tunnel: [16, 20],
    waypoints: [
      { x: 500, y: 1300 }, { x: 700, y: 1300 }, { x: 900, y: 1300 }, { x: 1060, y: 1280 },
      { x: 1130, y: 1200 }, { x: 1110, y: 1090 }, { x: 1050, y: 980 }, { x: 960, y: 890 },
      { x: 840, y: 850 }, { x: 720, y: 870 }, { x: 640, y: 950 }, { x: 560, y: 1010 },
      { x: 450, y: 1000 }, { x: 400, y: 920 }, { x: 450, y: 840 }, { x: 560, y: 780 },
      { x: 660, y: 700 }, { x: 780, y: 620 }, { x: 930, y: 580 }, { x: 1090, y: 590 },
      { x: 1240, y: 650 }, { x: 1340, y: 750 }, { x: 1400, y: 820 }, { x: 1480, y: 760 },
      { x: 1540, y: 860 }, { x: 1560, y: 980 }, { x: 1620, y: 1100 }, { x: 1700, y: 1200 },
      { x: 1760, y: 1290 }, { x: 1720, y: 1420 }, { x: 1600, y: 1550 }, { x: 1300, y: 1570 },
      { x: 1000, y: 1570 }, { x: 700, y: 1565 }, { x: 470, y: 1525 }, { x: 370, y: 1440 }, { x: 410, y: 1340 },
    ],
  },
];

// The live circuit, filled in by selectCircuit(); every other file reads from this
const track = {
  id: null,
  name: "",
  waypoints: [],
  width: 160,
  path: [],
  checkpoints: [],
  start: { x: 0, y: 0, angle: -Math.PI / 2 },
  bounds: { minX: 0, minY: 0, maxX: 2500, maxY: 2500 },
  pitSide: -1,
  pitLane: null,
};
let selectedCircuitId = localStorage.getItem("circuitRacerCircuit") || circuits[0].id;

function getCircuit(id) {
  return circuits.find((circuit) => circuit.id === id) || circuits[0];
}

// Smooth centreline through the waypoints (centripetal Catmull-Rom), used for drawing and surface checks
function buildTrackPath(waypoints, samplesPerSegment = 8) {
  const count = waypoints.length;
  const lerpPoint = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  const knot = (a, b) => Math.sqrt(Math.hypot(b.x - a.x, b.y - a.y)) || 0.001;
  const path = [];
  for (let i = 0; i < count; i++) {
    const p0 = waypoints[(i - 1 + count) % count];
    const p1 = waypoints[i];
    const p2 = waypoints[(i + 1) % count];
    const p3 = waypoints[(i + 2) % count];
    const t0 = 0;
    const t1 = t0 + knot(p0, p1);
    const t2 = t1 + knot(p1, p2);
    const t3 = t2 + knot(p2, p3);
    for (let s = 0; s < samplesPerSegment; s++) {
      const t = t1 + ((t2 - t1) * s) / samplesPerSegment;
      const a1 = lerpPoint(p0, p1, (t - t0) / (t1 - t0));
      const a2 = lerpPoint(p1, p2, (t - t1) / (t2 - t1));
      const a3 = lerpPoint(p2, p3, (t - t2) / (t3 - t2));
      const b1 = lerpPoint(a1, a2, (t - t0) / (t2 - t0));
      const b2 = lerpPoint(a2, a3, (t - t1) / (t3 - t1));
      path.push(lerpPoint(b1, b2, (t - t1) / (t2 - t1)));
    }
  }
  return path;
}

function pathBounds(path) {
  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  path.forEach((point) => {
    bounds.minX = Math.min(bounds.minX, point.x);
    bounds.minY = Math.min(bounds.minY, point.y);
    bounds.maxX = Math.max(bounds.maxX, point.x);
    bounds.maxY = Math.max(bounds.maxY, point.y);
  });
  return bounds;
}

// Pit lane: a parallel road beside the straight after the start/finish line, with the box
// halfway along. The side is the circuit's preference unless the other side has more room.
function buildPitLane(circuit, path) {
  const offset = circuit.width * 0.85;
  const count = path.length;
  const entryIndex = 2;
  const exitIndex = Math.min(count - 1, 22);
  const laneWidth = Math.min(90, circuit.width * 0.55);
  const build = (side) => {
    const lane = [];
    for (let i = entryIndex; i <= exitIndex; i++) {
      const point = path[i % count];
      const next = path[(i + 1) % count];
      const angle = Math.atan2(next.y - point.y, next.x - point.x);
      lane.push({ x: point.x - Math.sin(angle) * offset * side, y: point.y + Math.cos(angle) * offset * side, angle });
    }
    return lane;
  };
  // Clearance from the rest of the circuit, ignoring the straight the lane runs beside
  const clearance = (lane) => {
    let best = Infinity;
    lane.forEach((point) => {
      for (let i = 0; i < count; i++) {
        if (i >= entryIndex - 6 && i <= exitIndex + 6) continue;
        best = Math.min(best, Math.hypot(path[i].x - point.x, path[i].y - point.y));
      }
    });
    return best;
  };
  const preferred = build(circuit.pitSide);
  const alternative = build(-circuit.pitSide);
  const needed = circuit.width / 2 + laneWidth / 2 + 20;
  const usePreferred = clearance(preferred) >= needed || clearance(preferred) >= clearance(alternative);
  const lane = usePreferred ? preferred : alternative;
  const side = usePreferred ? circuit.pitSide : -circuit.pitSide;
  const boxIndex = Math.floor(lane.length / 2);
  return {
    points: lane,
    side,
    entry: path[entryIndex],
    exit: path[exitIndex],
    boxIndex,
    box: { x: lane[boxIndex].x, y: lane[boxIndex].y, angle: lane[boxIndex].angle },
    width: laneWidth,
    speedLimit: 2.4,
  };
}

function selectCircuit(id) {
  const circuit = getCircuit(id);
  selectedCircuitId = circuit.id;
  localStorage.setItem("circuitRacerCircuit", circuit.id);

  track.id = circuit.id;
  track.name = circuit.name;
  track.definition = circuit;
  track.waypoints = circuit.waypoints;
  track.width = circuit.width;
  track.pitSide = circuit.pitSide;
  track.path = buildTrackPath(circuit.waypoints);
  track.bounds = pathBounds(track.path);
  const start = circuit.waypoints[0];
  const next = circuit.waypoints[1];
  track.start = { x: start.x, y: start.y, angle: Math.atan2(next.y - start.y, next.x - start.x) };
  track.checkpoints = [{ id: 0, x: start.x, y: start.y, name: circuit.sectorNames[0] }].concat(
    circuit.sectors.map((index, sector) => ({
      id: sector + 1,
      x: circuit.waypoints[index].x,
      y: circuit.waypoints[index].y,
      name: circuit.sectorNames[sector + 1],
    }))
  );
  track.pitLane = buildPitLane(circuit, track.path);
  track.pitSide = track.pitLane.side;

  // Caches built from the previous circuit
  if (typeof trackLayer !== "undefined") trackLayer = null;
  if (typeof trackGeometry !== "undefined") trackGeometry = null;
  if (typeof loadLapRecord === "function") loadLapRecord();
  if (typeof onCircuitChanged === "function") onCircuitChanged(circuit);
  return circuit;
}

// Draws a circuit outline into a canvas; `cars` adds position dots for the in-game minimap
function drawCircuitMiniMap(targetCanvas, circuit, options = {}) {
  const g = targetCanvas.getContext("2d");
  const path = circuit === track.definition ? track.path : buildTrackPath(circuit.waypoints, 4);
  const bounds = pathBounds(path);
  const padding = options.padding ?? 14;
  const width = targetCanvas.width;
  const height = targetCanvas.height;
  const scale = Math.min(
    (width - padding * 2) / (bounds.maxX - bounds.minX),
    (height - padding * 2) / (bounds.maxY - bounds.minY)
  );
  const offsetX = (width - (bounds.maxX - bounds.minX) * scale) / 2;
  const offsetY = (height - (bounds.maxY - bounds.minY) * scale) / 2;
  const project = (point) => ({
    x: offsetX + (point.x - bounds.minX) * scale,
    y: offsetY + (point.y - bounds.minY) * scale,
  });

  g.clearRect(0, 0, width, height);
  if (options.background) {
    g.fillStyle = options.background;
    g.fillRect(0, 0, width, height);
  }
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  path.forEach((point, index) => {
    const p = project(point);
    if (index === 0) g.moveTo(p.x, p.y);
    else g.lineTo(p.x, p.y);
  });
  g.closePath();
  const roadWidth = Math.max(3, circuit.width * scale);
  g.strokeStyle = options.kerbColour || "rgba(255,255,255,0.35)";
  g.lineWidth = roadWidth + 2;
  g.stroke();
  g.strokeStyle = options.roadColour || "#3c3f45";
  g.lineWidth = roadWidth;
  g.stroke();

  // Sector gates and the start/finish line
  const gateLength = roadWidth * 1.3;
  const drawGate = (waypoint, nextWaypoint, colour) => {
    const a = project(waypoint);
    const b = project(nextWaypoint);
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    g.strokeStyle = colour;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(a.x - Math.sin(angle) * gateLength / 2, a.y + Math.cos(angle) * gateLength / 2);
    g.lineTo(a.x + Math.sin(angle) * gateLength / 2, a.y - Math.cos(angle) * gateLength / 2);
    g.stroke();
  };
  circuit.sectors.forEach((index) =>
    drawGate(circuit.waypoints[index], circuit.waypoints[(index + 1) % circuit.waypoints.length], "rgba(255,120,120,0.9)")
  );
  drawGate(circuit.waypoints[0], circuit.waypoints[1], "#ffffff");

  (options.cars || []).forEach((car) => {
    const p = project(car);
    g.fillStyle = car.colour || car.color || "#ffffff";
    g.beginPath();
    g.arc(p.x, p.y, car.isPlayer ? 4.5 : 3, 0, Math.PI * 2);
    g.fill();
    if (car.isPlayer) {
      g.strokeStyle = "#ffffff";
      g.lineWidth = 1.5;
      g.stroke();
    }
  });
}

// Load the remembered circuit immediately so the render loop never sees an empty track
selectCircuit(selectedCircuitId);

// Position of a point relative to the start/finish line: `along` the racing direction, `across` the track
function startFrameOffset(x, y) {
  const dx = x - track.start.x;
  const dy = y - track.start.y;
  const cos = Math.cos(track.start.angle);
  const sin = Math.sin(track.start.angle);
  return { along: dx * cos + dy * sin, across: -dx * sin + dy * cos };
}

function isInStartZone(x, y, length = 300, width = 200) {
  const offset = startFrameOffset(x, y);
  return Math.abs(offset.along) <= length / 2 && Math.abs(offset.across) <= width / 2;
}

function freshCheckpointsHit() {
  return track.checkpoints.map((checkpoint, index) => index === 0);
}

function isOutsideWorld(x, y) {
  const margin = 400;
  return (
    x < track.bounds.minX - margin ||
    x > track.bounds.maxX + margin ||
    y < track.bounds.minY - margin ||
    y > track.bounds.maxY + margin
  );
}

// Start-screen circuit cards, each with a mini-map, the record lap and a short description
function renderCircuitSelector() {
  const container = document.getElementById("circuitCards");
  if (!container) return;
  container.innerHTML = "";
  circuits.forEach((circuit) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "circuit-card" + (circuit.id === selectedCircuitId ? " active" : "");
    card.dataset.circuit = circuit.id;
    card.setAttribute("aria-pressed", circuit.id === selectedCircuitId ? "true" : "false");
    card.title = circuit.inspiration;
    const record = circuitLapRecordText(circuit.id);
    card.innerHTML = `
      <canvas class="circuit-minimap" width="150" height="100" aria-hidden="true"></canvas>
      <span class="circuit-name"></span>
      <span class="circuit-meta"></span>
      <span class="circuit-record"></span>`;
    card.querySelector(".circuit-name").textContent = circuit.name;
    card.querySelector(".circuit-meta").textContent = `${circuit.country} · ${circuit.character}`;
    card.querySelector(".circuit-record").textContent = record;
    card.addEventListener("click", () => chooseCircuit(circuit.id));
    container.appendChild(card);
    drawCircuitMiniMap(card.querySelector(".circuit-minimap"), circuit, { padding: 10 });
  });
  updateCircuitDescription();
}

function circuitLapRecordText(circuitId) {
  // Same rule as loadLapRecord(): the original circuit also owns the pre-circuit-select record
  const stored = Number(localStorage.getItem(`circuitRacerLapRecord:${circuitId}`)) || Infinity;
  const legacy = circuitId === circuits[0].id ? Number(localStorage.getItem("circuitRacerLapRecord")) || Infinity : Infinity;
  const record = Math.min(stored, legacy);
  if (!Number.isFinite(record)) return "No lap record";
  const minutes = Math.floor(record / 60);
  const seconds = (record % 60).toFixed(3).padStart(6, "0");
  return `Record ${minutes}:${seconds}`;
}

function chooseCircuit(id) {
  selectCircuit(id);
  document.querySelectorAll(".circuit-card").forEach((card) => {
    const active = card.dataset.circuit === id;
    card.classList.toggle("active", active);
    card.setAttribute("aria-pressed", active ? "true" : "false");
  });
  updateCircuitDescription();
  if (typeof updateTimeTrialLeaderboardDisplay === "function") updateTimeTrialLeaderboardDisplay();
}

function updateCircuitDescription() {
  const element = document.getElementById("circuitDescription");
  if (!element || !track.definition) return;
  const circuit = track.definition;
  element.textContent = `${circuit.name} (${circuit.country}): ${circuit.inspiration}. ${circuit.waypoints.length} corners, track width ${circuit.width} m.`;
}

/**
 * Track Rendering System
 *
 * The circuit is painted once per weather setting onto an offscreen layer (tarmac, kerbs,
 * start/finish and checkpoint gates) and blitted each frame. Only the grass is filled live,
 * because the camera can see beyond the layer's edges.
 */
let trackLayer = null;

function makeTile(size, paint) {
  const tile = document.createElement("canvas");
  tile.width = size;
  tile.height = size;
  paint(tile.getContext("2d"), size);
  return tile;
}

function makeAsphaltPattern(g, wet) {
  const tile = makeTile(96, (t, size) => {
    t.fillStyle = wet ? "#3d4046" : "#4b4e53";
    t.fillRect(0, 0, size, size);
    for (let i = 0; i < 1400; i++) {
      const shade = Math.random();
      t.fillStyle = shade > 0.5 ? `rgba(255,255,255,${0.03 + Math.random() * 0.05})` : `rgba(0,0,0,${0.05 + Math.random() * 0.1})`;
      t.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random(), 1 + Math.random());
    }
  });
  return g.createPattern(tile, "repeat");
}

const grassPatterns = {};
function getGrassPattern() {
  if (!grassPatterns[gameWeather]) {
    const tile = makeTile(240, (t, size) => {
      t.fillStyle = "rgba(255,255,255,0.04)";
      t.fillRect(0, 0, size, size / 2);
      for (let i = 0; i < 260; i++) {
        t.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)";
        t.fillRect(Math.random() * size, Math.random() * size, 2, 2);
      }
    });
    grassPatterns[gameWeather] = ctx.createPattern(tile, "repeat");
  }
  return grassPatterns[gameWeather];
}

function traceTrackPath(g) {
  g.beginPath();
  track.path.forEach((point, index) => {
    if (index === 0) g.moveTo(point.x, point.y);
    else g.lineTo(point.x, point.y);
  });
  g.closePath();
}

function strokeTrackPath(g, style, width, dash) {
  traceTrackPath(g);
  g.strokeStyle = style;
  g.lineWidth = width;
  // Round caps would stretch every dash by half the line width and hide the gaps
  g.lineCap = dash ? "butt" : "round";
  g.setLineDash(dash || []);
  g.stroke();
  g.setLineDash([]);
  g.lineCap = "round";
}

function trackDirectionAt(x, y) {
  let best = 0;
  let bestDistance = Infinity;
  track.path.forEach((point, index) => {
    const distance = Math.hypot(point.x - x, point.y - y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  const previous = track.path[(best - 1 + track.path.length) % track.path.length];
  const next = track.path[(best + 1) % track.path.length];
  return Math.atan2(next.y - previous.y, next.x - previous.x);
}

function paintStartFinish(g) {
  const start = track.waypoints[0];
  const next = track.waypoints[1];
  const direction = Math.atan2(next.y - start.y, next.x - start.x);
  const across = track.width - 30;
  const square = across / 8;
  g.save();
  g.translate(start.x, start.y);
  g.rotate(direction);
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 8; column++) {
      g.fillStyle = (row + column) % 2 === 0 ? "#f4f4f4" : "#111111";
      g.fillRect(-square * 1.5 + row * square, -across / 2 + column * square, square, square);
    }
  }
  g.restore();

  // Grid slots match the AI starting positions, which follow the circuit back from the line
  g.strokeStyle = "rgba(255,255,255,0.7)";
  g.lineWidth = 1.5;
  for (let i = 0; i < aiTeams.length - 1; i++) {
    const slot = gridSlotPose(Math.floor(i / 2) + 1, i % 2);
    g.save();
    g.translate(slot.x, slot.y);
    g.rotate(slot.angle);
    g.strokeRect(-13, -7, 26, 14);
    g.restore();
  }
}

function paintCheckpointGate(g, checkpoint) {
  const direction = trackDirectionAt(checkpoint.x, checkpoint.y);
  const half = (track.width - 10) / 2;
  const perpX = -Math.sin(direction);
  const perpY = Math.cos(direction);
  const posts = [
    { x: checkpoint.x + perpX * half, y: checkpoint.y + perpY * half },
    { x: checkpoint.x - perpX * half, y: checkpoint.y - perpY * half },
  ];

  g.save();
  g.strokeStyle = "rgba(255, 80, 80, 0.6)";
  g.lineWidth = 3;
  g.setLineDash([14, 12]);
  g.beginPath();
  g.moveTo(posts[0].x, posts[0].y);
  g.lineTo(posts[1].x, posts[1].y);
  g.stroke();
  g.setLineDash([]);

  posts.forEach((post) => {
    g.fillStyle = "rgba(0,0,0,0.35)";
    g.beginPath();
    g.arc(post.x + 2, post.y + 3, 9, 0, Math.PI * 2);
    g.fill();
    const glow = g.createRadialGradient(post.x - 3, post.y - 3, 1, post.x, post.y, 9);
    glow.addColorStop(0, "#ff7b7b");
    glow.addColorStop(1, "#b30000");
    g.fillStyle = glow;
    g.beginPath();
    g.arc(post.x, post.y, 8, 0, Math.PI * 2);
    g.fill();
  });

  g.fillStyle = "rgba(0, 0, 0, 0.75)";
  g.beginPath();
  g.arc(checkpoint.x, checkpoint.y - 26, 16, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#ffffff";
  g.lineWidth = 2;
  g.stroke();
  g.fillStyle = "#ffffff";
  g.font = "bold 18px Arial";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(`${checkpoint.id}`, checkpoint.x, checkpoint.y - 26);
  g.font = "bold 12px Arial";
  g.lineWidth = 3;
  g.strokeStyle = "#000000";
  g.strokeText(checkpoint.name, checkpoint.x, checkpoint.y + 26);
  g.fillStyle = "#ffe066";
  g.fillText(checkpoint.name, checkpoint.x, checkpoint.y + 26);
  g.restore();
}

function paintTrackLayer(g) {
  const wet = gameWeather !== "clear";
  g.lineCap = "round";
  g.lineJoin = "round";

  // Ground shadow and a worn verge outside the kerbs
  g.save();
  g.translate(4, 7);
  strokeTrackPath(g, "rgba(0, 0, 0, 0.32)", track.width + 14);
  g.restore();
  strokeTrackPath(g, wet ? "rgba(70, 60, 40, 0.55)" : "rgba(120, 105, 60, 0.45)", track.width + 12);

  // Kerbs: white base with red blocks
  strokeTrackPath(g, "#efefef", track.width);
  strokeTrackPath(g, "#d42a2a", track.width, [26, 26]);

  // White edge line, then the tarmac on top
  strokeTrackPath(g, "#f7f7f7", track.width - 26);
  strokeTrackPath(g, makeAsphaltPattern(g, wet), track.width - 30);
  if (wet) strokeTrackPath(g, "rgba(150, 170, 200, 0.16)", track.width - 30);

  // Rubbered-in racing groove and a faint guide line
  strokeTrackPath(g, "rgba(0, 0, 0, 0.14)", 40);
  strokeTrackPath(g, "rgba(255, 225, 110, 0.45)", 2, [26, 30]);

  paintPitLane(g);
  paintStartFinish(g);
  track.checkpoints.forEach((checkpoint, index) => {
    if (index > 0) paintCheckpointGate(g, checkpoint);
  });
}

function getTrackLayer() {
  if (trackLayer && trackLayer.weather === gameWeather && trackLayer.circuitId === track.id) return trackLayer;
  const margin = track.width + 140;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  track.path.forEach((point) => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });
  const originX = Math.floor(minX - margin);
  const originY = Math.floor(minY - margin);
  const layerCanvas = document.createElement("canvas");
  layerCanvas.width = Math.ceil(maxX + margin) - originX;
  layerCanvas.height = Math.ceil(maxY + margin) - originY;
  const g = layerCanvas.getContext("2d");
  g.translate(-originX, -originY);
  paintTrackLayer(g);
  trackLayer = { canvas: layerCanvas, originX, originY, weather: gameWeather, circuitId: track.id };
  return trackLayer;
}

function drawTrack() {
  const view = cameraRenderPosition();
  const padding = 200;
  const left = view.x - padding;
  const top = view.y - padding;
  const width = canvas.width + padding * 2;
  const height = canvas.height + padding * 2;

  const grassColours = {
    clear: ["#3a7c3a", "#2d5a2d", "#1f4a1f"],
    rain: ["#2a5c2a", "#1d3a1d", "#0f2a0f"],
    storm: ["#1a3c1a", "#0d2a0d", "#051a05"],
  }[gameWeather];
  const grassGradient = ctx.createLinearGradient(left, top, left + width, top + height);
  grassGradient.addColorStop(0, grassColours[0]);
  grassGradient.addColorStop(0.5, grassColours[1]);
  grassGradient.addColorStop(1, grassColours[2]);
  ctx.fillStyle = grassGradient;
  ctx.fillRect(left, top, width, height);
  ctx.fillStyle = getGrassPattern();
  ctx.fillRect(left, top, width, height);

  const layer = getTrackLayer();
  const sourceX = Math.max(0, left - layer.originX);
  const sourceY = Math.max(0, top - layer.originY);
  const sourceWidth = Math.min(layer.canvas.width - sourceX, left + width - layer.originX - sourceX);
  const sourceHeight = Math.min(layer.canvas.height - sourceY, top + height - layer.originY - sourceY);
  if (sourceWidth > 0 && sourceHeight > 0) {
    ctx.drawImage(
      layer.canvas,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      layer.originX + sourceX,
      layer.originY + sourceY,
      sourceWidth,
      sourceHeight
    );
  }
}

// Minimap in the top-right corner of the canvas, drawn from the circuit data with car markers
let miniMapCanvas = null;
function drawMiniMapOverlay() {
  if (!track.definition) return;
  const size = Math.min(230, Math.max(150, canvas.width * 0.16));
  const height = Math.round(size * 0.7);
  if (!miniMapCanvas || miniMapCanvas.width !== size || miniMapCanvas.height !== height) {
    miniMapCanvas = document.createElement("canvas");
    miniMapCanvas.width = size;
    miniMapCanvas.height = height;
  }
  const cars = isTimeTrialMode ? [player] : [...aiCars, player];
  drawCircuitMiniMap(miniMapCanvas, track.definition, {
    padding: 12,
    cars: cars.map((car) => ({ x: car.x, y: car.y, colour: car.color, isPlayer: car === player })),
    roadColour: "#5a5e68",
    kerbColour: "rgba(255,255,255,0.5)",
  });
  // Phones in landscape have the standings box over the top-right corner, so the map moves to the bottom centre
  const compactLayout = window.matchMedia("(orientation: landscape) and (max-height: 540px)").matches;
  const x = compactLayout ? (canvas.width - size) / 2 : canvas.width - size - 16;
  const y = compactLayout ? canvas.height - height - 16 : 16;
  ctx.save();
  ctx.fillStyle = "rgba(10, 12, 18, 0.55)";
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x - 6, y - 6, size + 12, height + 12, 10);
  ctx.fill();
  ctx.stroke();
  ctx.drawImage(miniMapCanvas, x, y);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "bold 11px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(track.name.toUpperCase(), x + 4, y + 2);
  ctx.restore();
}

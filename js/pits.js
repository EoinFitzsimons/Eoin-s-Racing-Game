/**
 * Pit stops
 *
 * The pit lane runs beside the start/finish straight (geometry from track.pitLane). A car that
 * has requested a stop peels in at the entry, trundles down the lane at the speed limit, waits
 * at its box for a time set by the team's pit-crew rating, then rejoins. Fresh tyres, repaired
 * damage and a full tank are the reward.
 */
const PIT_SPEED_LIMIT = 2.4;

function pitStopsAvailable() {
  return gameRunning && !isTimeTrialMode && track.pitLane && totalLaps > 1;
}

function lapsRemaining(car) {
  return totalLaps - car.lapsCompleted;
}

function togglePlayerPitRequest() {
  if (!pitStopsAvailable() || player.pitState) return;
  player.wantsPit = !player.wantsPit;
}

// Distance from a point to the pit lane centreline, for surface checks and the lap gate
function distanceToPitLane(x, y) {
  if (!track.pitLane) return Infinity;
  let best = Infinity;
  const points = track.pitLane.points;
  for (let i = 0; i < points.length - 1; i++) {
    const info = distanceToLineSegmentWithInfo(x, y, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    if (info.distance < best) best = info.distance;
  }
  return best;
}

function isOnPitLane(x, y) {
  return track.pitLane ? distanceToPitLane(x, y) <= track.pitLane.width / 2 : false;
}

// AI strategy: stop when the tyres, damage or fuel will not last, unless the race is nearly over
function considerPitStop(ai) {
  if (!pitStopsAvailable() || ai.wantsPit || ai.pitState) return;
  if (lapsRemaining(ai) <= 1 || ai.lapsCompleted === 0) return;
  const aggression = ai.performance ? ai.performance.aggression : 0.5;
  const totalDamage = ai.damage.speed + ai.damage.acceleration + ai.damage.handling + ai.damage.braking;
  const tyreLimit = 68 + aggression * 18;
  const fuelPerLap = ai.lapTimes.length > 0 ? (100 - ai.fuel) / Math.max(1, ai.lapsCompleted) : 20;
  const fuelShort = ai.fuel < fuelPerLap * (lapsRemaining(ai) - 0.5) && ai.fuel < 45;
  if (ai.tireWear > tyreLimit || totalDamage > 120 || fuelShort) {
    ai.wantsPit = true;
  }
}

function beginPitStop(car) {
  const lane = track.pitLane;
  car.pitState = { phase: "in", distance: 0, boxIndex: lane.boxIndex, stopUntil: 0 };
  car.velocity = { x: 0, y: 0 };
  car.usingNitro = false;
  car.wantsPit = false;
  car.pitStops = (car.pitStops || 0) + 1;
}

function pitLanePoseAt(distance) {
  const points = track.pitLane.points;
  let remaining = distance;
  for (let i = 0; i < points.length - 1; i++) {
    const segment = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    if (remaining <= segment) {
      const t = segment > 0 ? remaining / segment : 0;
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * t,
        y: points[i].y + (points[i + 1].y - points[i].y) * t,
        angle: points[i].angle,
        index: i + t,
      };
    }
    remaining -= segment;
  }
  const last = points[points.length - 1];
  return { x: last.x, y: last.y, angle: last.angle, index: points.length - 1, finished: true };
}

/**
 * Advances a car that is in the pit lane. Returns true while the pit stop owns the car's
 * movement, so the normal driving physics are skipped for that step.
 */
function updatePitStop(car) {
  if (!track.pitLane) return false;
  if (!car.pitState) {
    if (car.wantsPit && pitStopsAvailable()) {
      const entry = track.pitLane.entry;
      const offset = startFrameOffset(car.x, car.y);
      const entryOffset = startFrameOffset(entry.x, entry.y);
      const nearEntry = Math.hypot(car.x - entry.x, car.y - entry.y) < track.width * 0.9;
      if (nearEntry && offset.along >= entryOffset.along - 10 && offset.along <= entryOffset.along + 60) beginPitStop(car);
    }
    return Boolean(car.pitState);
  }

  const state = car.pitState;
  const now = gameNow();
  if (state.phase === "stopped") {
    car.speed = 0;
    car.velocity = { x: 0, y: 0 };
    if (now >= state.stopUntil) {
      car.tireWear = 0;
      car.fuel = 100;
      car.damage = { speed: 0, acceleration: 0, handling: 0, braking: 0, visible: false };
      applyDamageEffects(car);
      car.nitro = car.maxNitro || 100;
      state.phase = "out";
    }
    return true;
  }

  state.distance += PIT_SPEED_LIMIT;
  const pose = pitLanePoseAt(state.distance);
  car.x = pose.x;
  car.y = pose.y;
  car.angle = pose.angle;
  car.velocity = { x: Math.cos(pose.angle) * PIT_SPEED_LIMIT, y: Math.sin(pose.angle) * PIT_SPEED_LIMIT };
  car.speed = PIT_SPEED_LIMIT;
  car.isSliding = false;

  if (state.phase === "in" && pose.index >= state.boxIndex) {
    state.phase = "stopped";
    state.stopUntil = now + (car.pitStopSeconds || 3) * 1000;
    car.velocity = { x: 0, y: 0 };
  } else if (pose.finished) {
    car.pitState = null;
    car.velocity = { x: Math.cos(pose.angle) * 3, y: Math.sin(pose.angle) * 3 };
    if (car !== player) {
      car.targetWaypoint = firstWaypointAhead({ x: car.x, y: car.y, angle: car.angle });
      car.behavior.state = "racing";
    }
    return false;
  }
  return true;
}

function pitStatusText(car) {
  if (car.pitState) {
    if (car.pitState.phase === "stopped") {
      const seconds = Math.max(0, (car.pitState.stopUntil - gameNow()) / 1000);
      return `In pit box: ${seconds.toFixed(1)}s`;
    }
    return car.pitState.phase === "in" ? "Entering pit lane" : "Leaving pit lane";
  }
  if (car.wantsPit) return "Pit requested: box this lap";
  return "";
}

// Pit lane surface, box and signage; part of the cached track layer
function paintPitLane(g) {
  const lane = track.pitLane;
  if (!lane) return;
  const tracePath = () => {
    g.beginPath();
    lane.points.forEach((point, index) => {
      if (index === 0) g.moveTo(point.x, point.y);
      else g.lineTo(point.x, point.y);
    });
  };
  g.save();
  g.lineCap = "round";
  g.lineJoin = "round";
  tracePath();
  g.strokeStyle = "rgba(0, 0, 0, 0.25)";
  g.lineWidth = lane.width + 10;
  g.stroke();
  tracePath();
  g.strokeStyle = "#f2f2f2";
  g.lineWidth = lane.width + 4;
  g.stroke();
  tracePath();
  g.strokeStyle = "#4a4d55";
  g.lineWidth = lane.width;
  g.stroke();
  tracePath();
  g.setLineDash([18, 22]);
  g.strokeStyle = "rgba(255, 255, 255, 0.5)";
  g.lineWidth = 2;
  g.stroke();
  g.setLineDash([]);

  // Pit box with the garage wall behind it
  const box = lane.box;
  g.translate(box.x, box.y);
  g.rotate(box.angle);
  g.fillStyle = "rgba(255, 220, 80, 0.85)";
  g.fillRect(-26, -lane.width / 2 + 4, 52, lane.width - 8);
  g.strokeStyle = "#ffffff";
  g.lineWidth = 2;
  g.strokeRect(-26, -lane.width / 2 + 4, 52, lane.width - 8);
  const wallSide = track.pitSide;
  g.fillStyle = "#2b2d33";
  g.fillRect(-120, wallSide * (lane.width / 2 + 10) - 6, 240, 12);
  g.fillStyle = "#ffffff";
  g.font = "bold 16px Arial";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("PIT", 0, wallSide * (lane.width / 2 + 30));
  g.restore();
}

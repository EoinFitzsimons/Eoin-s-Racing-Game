// Track design - Larger proper circuit with start/finish at middle bottom

// Player car with team attributes and damage system
// Player car object - Contains all player car state and physics properties
const player = {
  // Position and orientation
  x: 1000, // X coordinate on track
  y: 1350, // Y coordinate - positioned BEHIND the start/finish line (which is at y=1300)
  angle: -Math.PI / 2, // Car direction in radians (pointing upward initially)
  velocity: { x: 0, y: -0.1 }, // Current velocity vector with small initial upward motion
  speed: 0, // Magnitude of velocity for display purposes
  isSliding: false, // Flag to track when car is sliding/drifting

  // Base performance stats (before team modifications)
  baseMaxSpeed: 8.0, // Maximum achievable speed
  baseAcceleration: 0.22, // Acceleration force per frame
  baseFriction: 0.96, // Velocity decay factor (higher = less friction)
  baseTurnSpeed: 0.04, // Angular velocity multiplier for steering

  // Current performance stats (affected by team attributes and damage)
  maxSpeed: 8.0, // Current maximum speed (affected by team/damage)
  acceleration: 0.22, // Current acceleration rate
  friction: 0.96, // Current friction level
  turnSpeed: 0.04, // Current turning sensitivity

  // Visual and collision properties
  size: 20, // Car hitbox size for collision detection
  color: "#ff0000", // Car color (set by team selection)

  // Race progress tracking
  currentCheckpoint: 1, // Next checkpoint to hit (0=start/finish, 1=sector1, 2=sector2)
  checkpointsHit: [true, false, false], // Rebuilt from the circuit's checkpoints by startRace()
  lapProgress: 0,
  lapsCompleted: 0,
  racePosition: 1,
  nitro: 100,
  maxNitro: 100,
  usingNitro: false,
  nitroRegenRate: 0.35,
  // Team attributes and damage system
  teamAttributes: null, // Will be set when team is selected
  damage: {
    speed: 0, // 0-100, reduces maxSpeed
    acceleration: 0, // 0-100, reduces acceleration
    handling: 0, // 0-100, reduces turnSpeed and increases instability
    braking: 0, // 0-100, reduces braking effectiveness
    visible: false, // Whether damage effects are visible
  },
  // Tire management (affected by team attributes)
  tireWear: 0, // 0-100, affects grip over time
  tireWearRate: 0.15, // Rate of tyre degradation per step (scaled by tyre management)
  fuel: 100, // Fuel load, 0-100; heavier loads blunt acceleration and cornering
  baseBrakingPower: 0.15,
  reliabilityFactor: 1.0, // Affects chance of mechanical failures
  lastCollisionTime: 0,
  // Lap time tracking for accurate gap calculation
  lapTimes: [], // Array of completed lap times in seconds
  currentLapStartTime: 0, // When current lap started
  totalRaceTime: 0, // Sum of all completed lap times
  lastLapCompletionTime: 0, // Will be set on first lap completion for queue-based standings
  // Checkpoint timing for gap calculations
  checkpointTimes: {},
};

// AI cars
const aiCars = [];

// Smooth centreline through the waypoints (centripetal Catmull-Rom), used for drawing and surface checks

// Starting grid: two cars per row, laid out backwards along the circuit from the start line
const GRID_ROW_SPACING = 35;
const GRID_LANE_OFFSET = 30;
const GRID_FIRST_ROW_DISTANCE = 50;

function trackPoseBehindStart(distance) {
  const path = track.path;
  const count = path.length;
  let remaining = distance;
  for (let step = 0; step < count; step++) {
    const ahead = path[(count - step) % count];
    const behind = path[(count - step - 1) % count];
    const segment = Math.hypot(ahead.x - behind.x, ahead.y - behind.y);
    const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x);
    if (segment >= remaining) {
      const t = segment > 0 ? remaining / segment : 0;
      return { x: ahead.x + (behind.x - ahead.x) * t, y: ahead.y + (behind.y - ahead.y) * t, angle };
    }
    remaining -= segment;
  }
  return { x: path[0].x, y: path[0].y, angle: track.start.angle };
}

// The first waypoint in front of a grid slot, so cars on the final bend follow it instead of cutting across
function firstWaypointAhead(pose) {
  const count = track.waypoints.length;
  let nearest = 0;
  let nearestDistance = Infinity;
  track.waypoints.forEach((point, index) => {
    const distance = Math.hypot(point.x - pose.x, point.y - pose.y);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = index;
    }
  });
  const point = track.waypoints[nearest];
  const ahead = (point.x - pose.x) * Math.cos(pose.angle) + (point.y - pose.y) * Math.sin(pose.angle) > 10;
  return ahead ? nearest : (nearest + 1) % count;
}

function gridSlotPose(row, side) {
  // The left-hand car of each row sits slightly ahead, as on a real grid
  const pose = trackPoseBehindStart(GRID_FIRST_ROW_DISTANCE + row * GRID_ROW_SPACING + (side === 0 ? -3 : 3));
  const lane = (side === 0 ? -1 : 1) * GRID_LANE_OFFSET;
  return {
    x: pose.x - Math.sin(pose.angle) * lane,
    y: pose.y + Math.cos(pose.angle) * lane,
    angle: pose.angle,
  };
}

// Rendering happens between fixed simulation steps, so poses are blended from the previous step
let renderAlpha = 1;

function snapshotRenderState() {
  for (const car of [player, ...aiCars]) {
    car.prevX = car.x;
    car.prevY = car.y;
    car.prevAngle = car.angle;
  }
  camera.prevX = camera.x;
  camera.prevY = camera.y;
}

function renderPose(car) {
  if (car.prevX === undefined || renderAlpha >= 1) {
    return { x: car.x, y: car.y, angle: car.angle };
  }
  return {
    x: car.prevX + (car.x - car.prevX) * renderAlpha,
    y: car.prevY + (car.y - car.prevY) * renderAlpha,
    angle: car.prevAngle + normalizeAngle(car.angle - car.prevAngle) * renderAlpha,
  };
}

function cameraRenderPosition() {
  if (camera.prevX === undefined || renderAlpha >= 1) return { x: camera.x, y: camera.y };
  return {
    x: camera.prevX + (camera.x - camera.prevX) * renderAlpha,
    y: camera.prevY + (camera.y - camera.prevY) * renderAlpha,
  };
}

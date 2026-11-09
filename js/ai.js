// AI update system with realistic racing behavior
function updateAI() {
  const allCars = [player, ...aiCars];
  aiCars.forEach((ai) => {
    updateSingleAI(ai, allCars);
  });
}

function updateSingleAI(ai, allCars) {
  if (handleStunnedAI(ai)) return;
  if (updatePitStop(ai)) return;
  considerPitStop(ai);

  handleRaceStartProtection(ai);
  if (recoverStuckAI(ai)) return;
  const target = getBehaviorTarget(ai, allCars);
  updateWaypointProgression(ai);

  const angleDiff = calculateSteering(ai, target);
  const accelerationMultiplier = calculateAccelerationMultiplier(
    ai,
    target,
    angleDiff
  );

  // Calculate current AI speed
  const currentSpeedAI = Math.sqrt(
    ai.velocity.x * ai.velocity.x + ai.velocity.y * ai.velocity.y
  );

  // Detect if AI is sliding (difference between car angle and movement direction)
  if (currentSpeedAI > 1.0) { // Only check sliding when moving fast enough
    const movementAngle = Math.atan2(ai.velocity.y, ai.velocity.x);
    const angleDifference = Math.abs(normalizeAngle(ai.angle - movementAngle));
    
    // If the difference between car heading and movement direction is significant, car is sliding
    ai.isSliding = angleDifference > 0.3; // About 17 degrees difference
    
    // Add tire marks when sliding at speed
    if (ai.isSliding && currentSpeedAI > 3) {
      addTireMark(ai.x, ai.y, ai.angle);
    }
  } else {
    ai.isSliding = false;
  }

  handleAINitroSystem(ai, allCars, target, accelerationMultiplier);
  applyMovementForces(ai, accelerationMultiplier);
  updatePhysics(ai, angleDiff);
  checkBounds(ai);
}

function handleStunnedAI(ai) {
  if (ai.stunned > 0) {
    ai.stunned--;
    if (ai.stunned > 0) {
      ai.velocity.x *= 0.98;
      ai.velocity.y *= 0.98;
      return true;
    }
  }
  return false;
}

function handleRaceStartProtection(ai) {
  const raceTime = gameRunning ? (gameNow() - raceStartTime) / 1000 : 0;

  // Only apply race start protection during the actual race, not before it starts
  if (gameRunning && raceTime < 3) {
    // Provide a gentle forward impulse to ensure cars move forward across the start line
    // This helps them pick up the start/finish checkpoint
    const forwardX = Math.cos(track.start.angle);
    const forwardY = Math.sin(track.start.angle);
    const forwardSpeed = ai.velocity.x * forwardX + ai.velocity.y * forwardY;
    if (forwardSpeed < 0.5) {
      const boost = Math.max(0.1, 0.5 - forwardSpeed);
      ai.velocity.x += forwardX * boost;
      ai.velocity.y += forwardY * boost;
    }
  }
}

// Safety net: a car boxed in or beached for a few seconds is lifted back onto the centreline
function recoverStuckAI(ai) {
  const raceTime = gameRunning ? (gameNow() - raceStartTime) / 1000 : 0;
  if (!gameRunning || raceTime < 5) return false;
  // Measure progress over three seconds rather than instantaneous speed, since a beached car
  // can still jitter against the track edge
  if (!ai.stuckAnchor) ai.stuckAnchor = { x: ai.x, y: ai.y, steps: 0 };
  ai.stuckAnchor.steps++;
  if (ai.stuckAnchor.steps < 180) return false;
  const moved = Math.hypot(ai.x - ai.stuckAnchor.x, ai.y - ai.stuckAnchor.y);
  ai.stuckAnchor = { x: ai.x, y: ai.y, steps: 0 };
  if (moved > 40) return false;
  const count = track.waypoints.length;
  const behind = track.waypoints[(ai.targetWaypoint - 1 + count) % count];
  const ahead = track.waypoints[ai.targetWaypoint];
  ai.x = behind.x;
  ai.y = behind.y;
  ai.angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x);
  ai.velocity = { x: Math.cos(ai.angle) * 1.5, y: Math.sin(ai.angle) * 1.5 };
  return true;
}

function getBehaviorTarget(ai, allCars) {
  const target = ai.behavior.update(allCars, track);

  if (!target || isNaN(target.x) || isNaN(target.y)) {
    const fallbackWaypoint = track.waypoints[ai.targetWaypoint];
    return { x: fallbackWaypoint.x, y: fallbackWaypoint.y };
  }

  return target;
}

function updateWaypointProgression(ai) {
  const currentWaypoint = track.waypoints[ai.targetWaypoint];
  const dx = currentWaypoint.x - ai.x;
  const dy = currentWaypoint.y - ai.y;
  const waypointDistance = Math.sqrt(dx * dx + dy * dy);

  const switchDistance = 60 + ai.behavior.awareness * 40;
  if (waypointDistance < switchDistance) {
    ai.targetWaypoint = (ai.targetWaypoint + 1) % track.waypoints.length;
  }
}

function calculateSteering(ai, target) {
  const targetDx = target.x - ai.x;
  const targetDy = target.y - ai.y;
  const targetAngle = Math.atan2(targetDy, targetDx);

  let angleDiff = targetAngle - ai.angle;
  while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

  // Wet weather and a full tank reduce how quickly the car can change direction
  const baseSteerRate = ai.turnSpeed * (0.55 + 0.45 * weatherGripFor(ai)) * fuelMassFactor(ai);
  const skillMultiplier = 0.5 + ai.behavior.cornering_skill * 0.8;
  const smoothnessMultiplier = 0.3 + ai.behavior.smoothness * 0.7;
  const adjustedSteerRate =
    baseSteerRate * skillMultiplier * smoothnessMultiplier;

  const maxSteer =
    adjustedSteerRate * (1 + ai.behavior.aggressiveness * 0.3);
  let steerAmount = Math.max(
    -maxSteer,
    Math.min(maxSteer, angleDiff * 0.4)
  );

  if (ai.behavior.smoothness < 0.7) {
    steerAmount +=
      (Math.random() - 0.5) * 0.02 * (1 - ai.behavior.smoothness);
  }

  ai.angle += steerAmount;
  return angleDiff;
}

function calculateAccelerationMultiplier(ai, target, angleDiff) {
  // Lap-to-lap pace varies more for inconsistent drivers; the noise is re-rolled each lap
  if (ai.paceNoiseLap !== ai.lapsCompleted) {
    ai.paceNoiseLap = ai.lapsCompleted;
    const variance = ai.performance ? ai.performance.paceVariance : 0.03;
    ai.paceNoise = 1 + (Math.random() - 0.5) * 2 * variance;
  }
  let accelerationMultiplier = ai.behavior.pace_consistency * (ai.paceNoise || 1) * fuelMassFactor(ai);

  accelerationMultiplier *= getBehaviorSpeedModifier(ai);
  accelerationMultiplier *= getCornerSpeedModifier(ai, target);
  accelerationMultiplier *= getBrakingModifier(ai, angleDiff);

  return accelerationMultiplier;
}

function getBehaviorSpeedModifier(ai) {
  switch (ai.behavior.state) {
    case "overtaking":
      return 1.2 + ai.behavior.overtaking_ability * 0.3;
    case "defending":
      return 0.9 + ai.behavior.defending_skill * 0.2;
    case "avoiding":
      return 0.7 + ai.behavior.awareness * 0.2;
    case "racing":
      return 0.95 + ai.behavior.aggressiveness * 0.15;
    default:
      return 1.0;
  }
}

function getCornerSpeedModifier(ai, target) {
  const targetDx = target.x - ai.x;
  const targetDy = target.y - ai.y;
  const targetDistance = Math.sqrt(
    targetDx * targetDx + targetDy * targetDy
  );

  const grip = weatherGripFor(ai);
  if (targetDistance < 60) {
    return (0.6 + ai.behavior.cornering_skill * 0.4) * (0.7 + 0.3 * grip);
  }
  return 0.85 + 0.15 * grip;
}

function getBrakingModifier(ai, angleDiff) {
  const currentSpeed = Math.sqrt(
    ai.velocity.x * ai.velocity.x + ai.velocity.y * ai.velocity.y
  );

  if (
    Math.abs(angleDiff) > Math.PI / 4 &&
    currentSpeed > ai.maxSpeed * 0.7
  ) {
    if (ai.behavior.braking_style > 0.6) {
      return 0.85; // Late braker
    } else {
      return 0.75; // Conservative braker
    }
  }
  return 1.0;
}

function handleAINitroSystem(
  ai,
  allCars,
  target,
  accelerationMultiplier
) {
  ai.usingNitro = false;
  const currentTime = gameNow();

  if (ai.nitro < ai.maxNitro) {
    ai.nitro += ai.nitroRegenRate;
    ai.nitro = Math.min(ai.nitro, ai.maxNitro);
  }

  const targetDx = target.x - ai.x;
  const targetDy = target.y - ai.y;
  const targetDistance = Math.sqrt(
    targetDx * targetDx + targetDy * targetDy
  );

  if (ai.nitro > 25 && currentTime - ai.lastNitroUse > 1500) {
    const shouldUseNitro = shouldAIUseNitro(ai, allCars, targetDistance);
    if (shouldUseNitro) {
      ai.usingNitro = true;
      ai.nitro -= 1.8;
      ai.lastNitroUse = currentTime;

      createAINitroFlames(ai);
    }
  }
}

function createAINitroFlames(ai) {
  const flameX = ai.x + Math.cos(ai.angle + Math.PI) * 12;
  const flameY = ai.y + Math.sin(ai.angle + Math.PI) * 12;
  addFlame(flameX, flameY, ai.angle, 1.4);
  addFlame(
    flameX + (Math.random() - 0.5) * 4,
    flameY + (Math.random() - 0.5) * 4,
    ai.angle,
    1.2
  );
}

function applyMovementForces(ai, accelerationMultiplier) {
  const effectiveAcceleration = ai.usingNitro
    ? accelerationMultiplier * 1.6
    : accelerationMultiplier;
  const forwardForce = ai.acceleration * effectiveAcceleration;
  const throttleStyle = 0.7 + ai.behavior.throttle_style * 0.3;

  const forceX = Math.cos(ai.angle) * forwardForce * throttleStyle;
  const forceY = Math.sin(ai.angle) * forwardForce * throttleStyle;

  ai.velocity.x += forceX;
  ai.velocity.y += forceY;
  burnFuel(ai, Math.min(1, Math.max(0, accelerationMultiplier)));

  limitAISpeed(ai);
}

function limitAISpeed(ai) {
  let effectiveMaxSpeed = ai.maxSpeed;
  if (ai.behavior.state === "overtaking") {
    effectiveMaxSpeed *= 1.08 + ai.behavior.overtaking_ability * 0.12;
  }
  if (ai.usingNitro) {
    effectiveMaxSpeed *= 1.4;
  }
  if (ai.fuel !== undefined && ai.fuel <= 0) {
    effectiveMaxSpeed *= 0.55; // Out of fuel: limp home
  }

  const speed = Math.sqrt(
    ai.velocity.x * ai.velocity.x + ai.velocity.y * ai.velocity.y
  );
  if (speed > effectiveMaxSpeed) {
    ai.velocity.x = (ai.velocity.x / speed) * effectiveMaxSpeed;
    ai.velocity.y = (ai.velocity.y / speed) * effectiveMaxSpeed;
  }
}

/**
 * Physics Update System
 * Applies position updates, tire degradation, friction, and collision detection to AI cars.
 * This function integrates all physics forces acting on the car each frame.
 */
function updatePhysics(ai, steerAmount) {
  const steerTarget = Math.max(-1, Math.min(1, steerAmount * 2.5)) * 0.42;
  ai.steerAngle = (ai.steerAngle || 0) + (steerTarget - (ai.steerAngle || 0)) * 0.35;

  // Update position based on current velocity vectors
  ai.x += ai.velocity.x;
  ai.y += ai.velocity.y;

  // Simulate tire wear based on speed and steering intensity
  updateAITireWear(ai, steerAmount);

  // Apply friction forces that slow the car down naturally
  applyAIFriction(ai);

  // Check for collisions with track boundaries and apply penalties
  handleTrackCollision(ai);

  // Calculate final speed magnitude from velocity components for UI display
  ai.speed = Math.sqrt(
    ai.velocity.x * ai.velocity.x + ai.velocity.y * ai.velocity.y
  );
}

/**
 * Tire Wear Simulation for AI Cars
 * Calculates realistic tire degradation based on speed and steering input.
 * Higher speeds and aggressive steering cause faster tire wear.
 */
function updateAITireWear(ai, steerAmount) {
  if (gameRunning) {
    // Calculate current speed for wear calculation
    const currentSpeedAI = Math.sqrt(
      ai.velocity.x * ai.velocity.x + ai.velocity.y * ai.velocity.y
    );

    // Only apply tire wear when car is actually moving at a reasonable speed
    if (currentSpeedAI < 1.5) return;
    
    // Scale wear with speed - faster speeds cause more wear
    const speedWearFactor = (currentSpeedAI / ai.maxSpeed) * 0.2;

    // Steering wear - sharp turns damage tires more
    const steerWearFactor = Math.abs(steerAmount) * 0.1;
    
    // Sliding wear - sliding causes significantly more tire wear
    const slidingWearFactor = ai.isSliding ? 0.15 : 0;
    
    // Calculate total wear for this frame
    ai.tireWear = Math.min(
      100,
      ai.tireWear +
        ai.tireWearRate * (speedWearFactor + steerWearFactor + slidingWearFactor)
    );
  }
}

/**
 * Friction Application System for AI Cars
 * Applies various friction forces including tire grip loss and AI personality smoothness.
 * This creates realistic deceleration when not accelerating.
 */
function applyAIFriction(ai) {
  // Base friction coefficient for natural deceleration
  const personalityFriction = 0.985;

  // Progressive quadratic tire wear effect, matching player model
  const wearPercentage = ai.tireWear / 100;
  const progressiveWearEffect = wearPercentage * wearPercentage * 1.2; // Square for exponential effect
  const tireGripLoss = gameRunning ? progressiveWearEffect / 2.5 : 0;

  // Smooth drivers maintain better tire contact and grip
  const smoothnessBonus = ai.behavior.smoothness * 0.005;

  // Combine all friction factors with minimum threshold
  const drag = ai.performance ? ai.performance.drag : 0.002;
  const wetDrag = (1 - weatherGripFor(ai)) * 0.004;
  const combinedFrictionAI = Math.max(
    0.965,
    personalityFriction + smoothnessBonus - tireGripLoss - drag - wetDrag
  );

  // Check if AI is sliding and apply additional penalties
  if (ai.isSliding && ai.tireWear > 20) {
    // When sliding with worn tires, grip loss is even more severe
    const slidingPenalty = 0.008 + (wearPercentage * 0.015);
    ai.velocity.x *= (combinedFrictionAI - slidingPenalty);
    ai.velocity.y *= (combinedFrictionAI - slidingPenalty);
  } else {
    // Normal friction application
    ai.velocity.x *= combinedFrictionAI;
    ai.velocity.y *= combinedFrictionAI;
  }
}

function checkBounds(ai) {
  if (isOutsideWorld(ai.x, ai.y)) {
    const nearestWaypoint = track.waypoints[ai.targetWaypoint];
    ai.x = nearestWaypoint.x + (Math.random() - 0.5) * 60;
    ai.y = nearestWaypoint.y + (Math.random() - 0.5) * 60;
    ai.velocity.x *= 0.3;
    ai.velocity.y *= 0.3;
  }
}

// AI Nitro Decision System
function shouldAIUseNitro(ai, allCars, targetDistance) {
  const currentSpeed = Math.sqrt(
    ai.velocity.x * ai.velocity.x + ai.velocity.y * ai.velocity.y
  );

  // Strategy 1: Use nitro on straight sections (low turn angle)
  const currentWaypoint = track.waypoints[ai.targetWaypoint];
  const nextWaypoint =
    track.waypoints[(ai.targetWaypoint + 1) % track.waypoints.length];
  const straightLine = calculateStraightness(
    ai,
    currentWaypoint,
    nextWaypoint
  );

  // Strategy 2: Use nitro for overtaking opportunities
  const carsAhead = allCars.filter((car) => {
    if (car === ai) return false;
    const distance = Math.sqrt(
      (car.x - ai.x) * (car.x - ai.x) + (car.y - ai.y) * (car.y - ai.y)
    );
    return (
      distance < 100 && distance > 20 && car.lapProgress >= ai.lapProgress
    );
  });

  // Strategy 3: Use nitro when behind and need to catch up
  const playerDistance = Math.sqrt(
    (player.x - ai.x) * (player.x - ai.x) +
      (player.y - ai.y) * (player.y - ai.y)
  );
  const isBehindPlayer = ai.lapProgress < player.lapProgress;

  // Strategy 4: Defensive nitro when player is close behind
  const playerBehind =
    playerDistance < 60 && player.lapProgress < ai.lapProgress;

  // Decision logic based on AI personality (nitroStrategy)
  let useNitro = false;

  if (ai.nitroStrategy > 0.6) {
    // Aggressive AI - made more likely to use nitro
    useNitro =
      straightLine > 0.6 ||
      carsAhead.length > 0 ||
      (isBehindPlayer && playerDistance < 200);
  } else if (ai.nitroStrategy > 0.4) {
    // Balanced AI conditions for realistic racing
    useNitro =
      (straightLine > 0.7 && currentSpeed < ai.maxSpeed * 0.85) ||
      (carsAhead.length > 0 && ai.behavior.state === "overtaking") ||
      playerBehind ||
      (straightLine > 0.8 && Math.random() < 0.3);
  } else {
    // Conservative AI - more willing to use nitro
    useNitro =
      (straightLine > 0.8 && carsAhead.length > 0) ||
      (playerBehind && ai.nitro > 40) || // Lower threshold
      (straightLine > 0.9 && Math.random() < 0.2); // Occasional use on straights
  }

  // Don't use nitro if already at high speed or on tight corners
  if (currentSpeed > ai.maxSpeed * 0.9 || straightLine < 0.3) {
    useNitro = false;
  }

  return useNitro;
}

function calculateStraightness(ai, currentWP, nextWP) {
  const toCurrentX = currentWP.x - ai.x;
  const toCurrentY = currentWP.y - ai.y;
  const toNextX = nextWP.x - currentWP.x;
  const toNextY = nextWP.y - currentWP.y;

  // Calculate angle difference - closer to 0 means straighter line
  const angle1 = Math.atan2(toCurrentY, toCurrentX);
  const angle2 = Math.atan2(toNextY, toNextX);
  let angleDiff = Math.abs(angle2 - angle1);
  if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

  // Convert to straightness factor (1 = perfectly straight, 0 = 90 degree turn)
  return 1 - angleDiff / Math.PI;
}

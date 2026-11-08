// Collision Detection and Response
/**
 * Collision Detection System with Race Start Protection
 *
 * Implements sophisticated collision detection that protects cars during race start
 * to prevent pile-ups while enabling realistic contact during racing.
 *
 * Features:
 * - "Ghost mode" protection for cars during race start (first 15 seconds)
 * - Pairwise collision detection between all cars
 * - Checkpoint-based collision eligibility (must pass 2 checkpoints to collide)
 * - Distance-based collision detection with car size consideration
 *
 * Ghost Mode Criteria:
 * - Car must be on first lap (lapsCompleted === 0)
 * - Car hasn't passed minimum checkpoints (protects grid start)
 * - Race time is within protection window (15 seconds)
 */
function handleCarCollisions() {
  // Skip collision handling entirely if collisions are disabled in difficulty settings
  if (!difficultySettings[gameDifficulty].collisionsEnabled) {
    return;
  }
  
  const allCars = [player, ...aiCars];

  // Ghosting system prevents collisions during race start when cars are close together
  const raceTime = gameRunning ? (gameNow() - raceStartTime) / 1000 : 0;
  const minCheckpointsForCollisions = 2; // Cars must pass 2 checkpoints before collisions enabled
  const maxGhostingTime = 15; // Maximum duration of collision protection (seconds)

  // Check every pair of cars for potential collisions
  for (let i = 0; i < allCars.length; i++) {
    for (let j = i + 1; j < allCars.length; j++) {
      const car1 = allCars[i];
      const car2 = allCars[j];

      // Determine if each car is in "ghost mode" (collision-immune)
      const car1Ghosted =
        car1.lapsCompleted === 0 && // Still on first lap
        car1.currentCheckpoint <= minCheckpointsForCollisions && // Haven't passed enough checkpoints
        raceTime <= maxGhostingTime; // Within time limit
      const car2Ghosted =
        car2.lapsCompleted === 0 &&
        car2.currentCheckpoint <= minCheckpointsForCollisions &&
        raceTime <= maxGhostingTime;

      // Skip collision if either car is still ghosted
      if (car1Ghosted || car2Ghosted) {
        continue;
      }

      const dx = car2.x - car1.x;
      const dy = car2.y - car1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = (car1.size + car2.size) / 2;

      if (distance < minDistance) {
        handleCollision(car1, car2, dx, dy, distance);
      }
    }
  }
}

function handleCollision(car1, car2, dx, dy, distance) {
  // Calculate collision severity based on relative speeds
  const relativeVelX = car2.velocity.x - car1.velocity.x;
  const relativeVelY = car2.velocity.y - car1.velocity.y;
  const relativeSpeed = Math.sqrt(
    relativeVelX * relativeVelX + relativeVelY * relativeVelY
  );

  // Only process if cars are approaching each other
  const approaching = dx * relativeVelX + dy * relativeVelY < 0;
  if (!approaching) return;

  // Collision response
  const overlap = (car1.size + car2.size) / 2 - distance;
  const separationForce = overlap * 0.5;

  const normalX = dx / distance;
  const normalY = dy / distance;

  // Separate cars
  car1.x -= normalX * separationForce;
  car1.y -= normalY * separationForce;
  car2.x += normalX * separationForce;
  car2.y += normalY * separationForce;

  // Apply collision damage based on collision severity - reduced sensitivity
  const damageAmount = Math.min(8, relativeSpeed * 1.2);
  applyCollisionDamage(car1, damageAmount);
  applyCollisionDamage(car2, damageAmount);

  // Velocity exchange (simplified)
  const dampening = 0.3;
  const velExchangeX = relativeVelX * dampening;
  const velExchangeY = relativeVelY * dampening;

  car1.velocity.x += velExchangeX * 0.5;
  car1.velocity.y += velExchangeY * 0.5;
  car2.velocity.x -= velExchangeX * 0.5;
  car2.velocity.y -= velExchangeY * 0.5;

  // Visual effects
  const collisionX = (car1.x + car2.x) / 2;
  const collisionY = (car1.y + car2.y) / 2;
  addSparkle(collisionX, collisionY);
  playImpactSound(collisionX, collisionY, relativeSpeed / 5);

  // Set collision timestamps
  car1.lastCollisionTime = gameNow();
  car2.lastCollisionTime = gameNow();
}

function applyCollisionDamage(car, amount) {
  // Apply damage to random components based on reliability
  const reliabilityFactor = car.reliabilityFactor || 1.0;
  const actualDamage = amount / reliabilityFactor;

  // Distribute damage across different systems
  const damageTypes = ["speed", "acceleration", "handling", "braking"];
  const selectedDamage =
    damageTypes[Math.floor(Math.random() * damageTypes.length)];

  car.damage[selectedDamage] = Math.min(
    100,
    car.damage[selectedDamage] + actualDamage
  );
  car.damage.visible = true;

  // Apply damage effects immediately
  applyDamageEffects(car);
}

function applyDamageEffects(car) {
  // Reduce performance based on damage
  const speedReduction = 1 - car.damage.speed / 200; // Max 50% reduction
  const accelReduction = 1 - car.damage.acceleration / 200;
  const handlingReduction = 1 - car.damage.handling / 200;
  const brakingReduction = 1 - car.damage.braking / 200;

  if (car === player) {
    // Apply to player car
    car.maxSpeed = car.baseMaxSpeed * speedReduction;
    car.acceleration = car.baseAcceleration * accelReduction;
    car.turnSpeed = car.baseTurnSpeed * handlingReduction;
    car.friction = Math.max(0.8, car.baseFriction * brakingReduction);
  } else {
    // Apply to AI cars (store original values if not stored)
    if (!car.originalMaxSpeed) {
      car.originalMaxSpeed = car.maxSpeed;
      car.originalAcceleration = car.acceleration;
      car.originalTurnSpeed = car.turnSpeed;
      car.originalFriction = car.friction;
    }

    car.maxSpeed = car.originalMaxSpeed * speedReduction;
    car.acceleration = car.originalAcceleration * accelReduction;
    car.turnSpeed = car.originalTurnSpeed * handlingReduction;
    car.friction = Math.max(0.8, car.originalFriction * brakingReduction);
  }
}

// Advanced grip and tire physics for realistic F1 handling
function calculateAdvancedGrip(
  car,
  steerInput,
  throttleInput,
  brakingInput
) {
  const speed = Math.sqrt(
    car.velocity.x * car.velocity.x + car.velocity.y * car.velocity.y
  );
  const speedRatio = speed / car.maxSpeed;

  // Base grip from tire compound (F1 cars have excellent base grip)
  let frontGrip = 0.95;
  let rearGrip = 0.93; // Slightly less for realistic oversteer tendency

  // Speed-based grip reduction (aerodynamic load vs tire heating)
  const speedGripLoss = speedRatio * speedRatio * 0.15; // Much less aggressive
  frontGrip -= speedGripLoss;
  rearGrip -= speedGripLoss;

  // Steering input affects front tire grip
  const steerGripLoss = Math.abs(steerInput) * 0.1; // Reduced penalty
  frontGrip -= steerGripLoss;

  // Throttle affects rear tire grip
  const throttleGripLoss = Math.abs(throttleInput) * speedRatio * 0.08;
  rearGrip -= throttleGripLoss;

  // Braking affects both axles differently
  if (brakingInput > 0) {
    const brakeBalance = 0.6; // 60% front, 40% rear (typical F1)
    frontGrip -= brakingInput * brakeBalance * 0.15;
    rearGrip -= brakingInput * (1 - brakeBalance) * 0.12;
  }

  // Weight transfer effects - realistic F1 physics with asymmetric handling
  const lateralGs = Math.abs(car.angularVelocity) * speed;
  const weightTransferEffect = lateralGs * 0.1;

  // Weight transfers to outside wheels during cornering - affects grip distribution
  if (car.steerAngle > 0) {
    // Right turn - weight transfers to left side (outside wheels)
    // F1 cars typically have slightly different left/right characteristics
    frontGrip += weightTransferEffect * 0.45; // Right turns: slightly more front grip
    rearGrip += weightTransferEffect * 0.3; // More rear stability for right turns
    // Simulate inside wheel unloading
    frontGrip -= weightTransferEffect * 0.08; // Less front inside grip loss
    rearGrip -= weightTransferEffect * 0.04; // Minimal rear inside grip loss
  } else if (car.steerAngle < 0) {
    // Left turn - weight transfers to right side (outside wheels)
    // Asymmetric setup for more realistic handling characteristics
    frontGrip += weightTransferEffect * 0.4; // Left turns: standard front grip
    rearGrip += weightTransferEffect * 0.25; // Less rear grip for oversteer tendency
    // Different unloading characteristics for left turns
    frontGrip -= weightTransferEffect * 0.12; // More front inside grip loss
    rearGrip -= weightTransferEffect * 0.06; // Slightly more rear inside grip loss
  }

  // Ensure grip values stay within realistic bounds
  frontGrip = Math.max(0.3, Math.min(1.0, frontGrip));
  rearGrip = Math.max(0.25, Math.min(1.0, rearGrip));

  // Apply weather effects to grip
  const weatherGripMultiplier = weatherEffects[gameWeather].gripMultiplier;
  frontGrip *= weatherGripMultiplier;
  rearGrip *= weatherGripMultiplier;

  // Ensure final grip values stay within bounds after weather effects
  frontGrip = Math.max(0.1, Math.min(1.0, frontGrip));
  rearGrip = Math.max(0.1, Math.min(1.0, rearGrip));

  return { front: frontGrip, rear: rearGrip };
}

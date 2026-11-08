/**
 * Helper function to normalize an angle to the range -PI to PI
 */
function normalizeAngle(angle) {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

function updatePlayer() {
  const currentSpeed = calculateCurrentSpeed();
  const inputs = handlePlayerInputs();

  // Detect if player is sliding (difference between car angle and movement direction)
  if (currentSpeed > 1.0) { // Only check sliding when moving fast enough
    const movementAngle = Math.atan2(player.velocity.y, player.velocity.x);
    const angleDifference = Math.abs(normalizeAngle(player.angle - movementAngle));
    
    // If the difference between car heading and movement direction is significant, car is sliding
    player.isSliding = angleDifference > 0.3; // About 17 degrees difference
    
    // Add tire marks when sliding at speed
    if (player.isSliding && currentSpeed > 3) {
      addTireMark(player.x, player.y, player.angle);
    }
  } else {
    player.isSliding = false;
  }

  handleNitroSystem(inputs);
  player.throttleInput = Math.min(1, inputs.acceleration);
  player.brakeInput = inputs.braking > 0 ? 1 : 0;
  player.steerInput = inputs.steering;
  player.steerAngle = (player.steerAngle || 0) + (inputs.steering * 0.42 - (player.steerAngle || 0)) * 0.35;
  handleSteering(inputs.steering, currentSpeed);
  handleAcceleration(inputs.acceleration);
  handleBraking(inputs.braking, currentSpeed);

  limitSpeed();
  updatePosition();
  updateTireWear(inputs, currentSpeed);
  applyFriction(currentSpeed);

  handleTrackCollision(player);
  updatePlayerSpeed();
  constrainToBounds();
  checkPlayerCheckpoints();
}

function completeTimeTrialLap(lapTime) {
  if (!isTimeTrialMode) return;
  
  // Create lap data object
  const lapData = {
    playerName: getSelectedTeamName(),
    teamName: getSelectedTeamName(),
    lapTime: lapTime,
    weather: gameWeather,
    difficulty: gameDifficulty,
    date: new Date().toISOString(),
    track: "Circuit Racer Track" // Add track name for future track support
  };
  
  // Add to time trial laps
  timeTrialLaps.push(lapData);
  
  // Get the current best time from the leaderboard (not just session best)
  const currentBestTime = timeTrialLeaderboard.length > 0 ? timeTrialLeaderboard[0].time : null;
  
  // Store previous best time before updating
  const previousBestTime = bestTimeTrialLap ? bestTimeTrialLap.lapTime : null;
  
  // Update best lap if this is better
  if (!bestTimeTrialLap || lapTime < bestTimeTrialLap.lapTime) {
    bestTimeTrialLap = lapData;
  }
  
  // Save to time trial leaderboard
  saveTimeTrialRecord(lapData);
  
  // Show time trial complete screen - use leaderboard best for comparison
  showTimeTrialComplete(lapData, currentBestTime);
}

function getSelectedTeamName() {
  const teamMapping = {
    emerald_isle: "Emerald Isle Racing",
    dragon_force: "Dragon Force Motorsport",
    highland_racing: "Highland Racing Team",
    britannia_motors: "Britannia Motors",
    tricolore_racing: "Tricolore Racing",
    kaiser_motorsport: "Kaiser Motorsport",
    iberian_speed: "Iberian Speed",
    veloce_italia: "Veloce Italia",
    adriatic_racing: "Adriatic Racing",
    liberty_racing: "Liberty Racing",
    rising_sun: "Rising Sun Motors",
    celestial_motors: "Celestial Motors",
    maharaja_motors: "Maharaja Motors",
    samba_racing: "Samba Racing Team",
    velocidad_venezuela: "Velocidad Venezuela",
    regina_curse: "Regina Curse",
  };
  return teamMapping[selectedTeam] || "Unknown Team";
}

// Show time trial complete screen
function showTimeTrialComplete(lapData, previousBestTime) {
  gameRunning = false;
  
  // Display lap time
  const minutes = Math.floor(lapData.lapTime / 60);
  const seconds = (lapData.lapTime % 60).toFixed(3);
  document.getElementById("timeTrialLapTime").textContent = `${minutes}:${seconds.padStart(6, "0")}`;
  
  // Check if this is a new best lap
  const isNewBest = previousBestTime === null || lapData.lapTime < previousBestTime;
  
  if (isNewBest) {
    document.getElementById("timeTrialResult").textContent = "NEW BEST LAP!";
    document.getElementById("timeTrialResult").style.color = "var(--accent-color)";
  } else {
    const improvement = lapData.lapTime - previousBestTime;
    const impMinutes = Math.floor(Math.abs(improvement) / 60);
    const impSeconds = (Math.abs(improvement) % 60).toFixed(3);
    document.getElementById("timeTrialResult").textContent = `+${impMinutes}:${impSeconds.padStart(6, "0")} from best`;
    document.getElementById("timeTrialResult").style.color = "var(--text-secondary)";
  }
  
  // Update the complete screen leaderboard
  updateTimeTrialCompleteLeaderboard();
  
  // Show the complete screen
  document.getElementById("timeTrialComplete").style.display = "block";
}

function updateTimeTrialCompleteLeaderboard() {
  const listElement = document.getElementById("timeTrialCompleteLeaderboard");
  
  if (timeTrialLeaderboard.length === 0) {
    listElement.innerHTML = `
      <div class="time-trial-entry" style="text-align: center; color: var(--text-secondary);">
        No records yet
      </div>
    `;
    return;
  }

  let html = '';
  // Show top 5 records in the complete screen
  const topRecords = timeTrialLeaderboard.slice(0, 5);
  
  topRecords.forEach((entry, index) => {
    const minutes = Math.floor(entry.time / 60);
    const seconds = (entry.time % 60).toFixed(3);
    const timeString = `${minutes}:${seconds.padStart(6, "0")}`;
    
    // Check if this is a personal best (same name)
    const isPersonalBest = entry.name === (selectedTeam ? getSelectedTeamName() : "Player");
    
    html += `
      <div class="time-trial-entry ${isPersonalBest ? 'personal-best' : ''}">
        <span class="time-trial-rank">${index + 1}</span>
        <span class="time-trial-name">${escapeHtml(entry.name)}</span>
        <span class="time-trial-team">${escapeHtml(entry.teamName ? String(entry.teamName).substring(0, 3).toUpperCase() : 'N/A')}</span>
        <span class="time-trial-time">${timeString}</span>
      </div>
    `;
  });
  
  listElement.innerHTML = html;
}

function calculateCurrentSpeed() {
  return Math.sqrt(
    player.velocity.x * player.velocity.x +
      player.velocity.y * player.velocity.y
  );
}

function handlePlayerInputs() {
  let steering = 0;
  if (isControlPressed("KeyA", "ArrowLeft")) {
    steering = -1;
  } else if (isControlPressed("KeyD", "ArrowRight")) {
    steering = 1;
  }

  return {
    acceleration: isControlPressed("KeyW", "ArrowUp") ? 1 : 0,
    braking: isControlPressed("KeyS", "ArrowDown") ? 1.2 : 0,
    steering: steering,
  };
}

function handleNitroSystem(inputs) {
  player.usingNitro = false;

  if (isControlPressed("Space") && player.nitro > 0) {
    player.usingNitro = true;
    player.nitro -= 1.5;
    inputs.acceleration *= 1.8;

    createNitroFlames();
  } else if (player.nitro < player.maxNitro) {
    player.nitro = Math.min(
      player.maxNitro,
      player.nitro + player.nitroRegenRate * 1.1
    );
  }
}

function createNitroFlames() {
  const flameX = player.x + Math.cos(player.angle + Math.PI) * 15;
  const flameY = player.y + Math.sin(player.angle + Math.PI) * 15;
  addFlame(flameX, flameY, player.angle, 2.0);
  addFlame(flameX - 3, flameY - 3, player.angle, 1.5);
  addFlame(flameX + 3, flameY + 3, player.angle, 1.5);
}

function handleSteering(steeringInput, currentSpeed) {
  if (steeringInput === 0) return;

  const speedFactor = Math.max(0.4, Math.min(1.0, currentSpeed / 4));
  const baseTurnRate = player.turnSpeed * (1.5 - speedFactor * 0.4);

  player.angle += steeringInput * baseTurnRate;

  if (Math.abs(steeringInput) > 0.7 && currentSpeed > 2.5) {
    addTireMark(player.x, player.y, player.angle);
  }
}

function handleAcceleration(accelerationInput) {
  if (accelerationInput <= 0) return;

  const forwardX =
    Math.cos(player.angle) * player.acceleration * accelerationInput;
  const forwardY =
    Math.sin(player.angle) * player.acceleration * accelerationInput;
  player.velocity.x += forwardX;
  player.velocity.y += forwardY;
}

function handleBraking(brakingInput, currentSpeed) {
  if (brakingInput <= 0) return;

  const velocityMagnitude = Math.sqrt(
    player.velocity.x * player.velocity.x +
      player.velocity.y * player.velocity.y
  );

  if (velocityMagnitude > 0.1) {
    const brakeForce = brakingInput * player.acceleration * 1.8;
    const normalizedVelX = player.velocity.x / velocityMagnitude;
    const normalizedVelY = player.velocity.y / velocityMagnitude;

    player.velocity.x -= normalizedVelX * brakeForce;
    player.velocity.y -= normalizedVelY * brakeForce;

    if (brakingInput > 0.6 && currentSpeed > 2) {
      addTireMark(player.x, player.y, player.angle);
    }
  }
}

function limitSpeed() {
  const maxSpeed = player.usingNitro
    ? player.maxSpeed * 1.3
    : player.maxSpeed;
  const speed = Math.sqrt(
    player.velocity.x * player.velocity.x +
      player.velocity.y * player.velocity.y
  );

  if (speed > maxSpeed) {
    player.velocity.x = (player.velocity.x / speed) * maxSpeed;
    player.velocity.y = (player.velocity.y / speed) * maxSpeed;
  }
}

function updatePosition() {
  player.x += player.velocity.x;
  player.y += player.velocity.y;
}

function updateTireWear(inputs, currentSpeed) {
  if (!gameRunning) return;

  // Only apply tire wear when car is actually moving at a reasonable speed
  if (currentSpeed < 1.5) return;
  
  // Scale wear with speed - faster speeds cause more wear
  // Significantly reduced wear factor to make tires last ~5 laps
  const speedWearFactor = (currentSpeed / player.maxSpeed) * 0.05; 
  
  // Input-based wear factors - aggressive inputs cause more wear
  // Also reduced to extend tire life
  const inputWearFactor =
    Math.abs(inputs.steering) * 0.04 + Math.abs(inputs.braking) * 0.03;
    
  // Sliding wear factor - sliding causes significantly more tire wear
  // Keep this higher to punish excessive sliding
  const slidingWearFactor = player.isSliding ? 0.1 : 0;
  
  // Calculate total wear for this frame
  player.tireWear = Math.min(
    100,
    player.tireWear +
      player.tireWearRate * (speedWearFactor + inputWearFactor + slidingWearFactor)
  );
}

function applyFriction(currentSpeed) {
  const baseFriction = 0.985;
  
  // Increase the impact of tire wear on grip
  // Using a progressive function now where higher wear has disproportionately more effect
  // This means slightly worn tires are still okay but heavily worn tires become dangerous
  const wearPercentage = player.tireWear / 100;
  const progressiveWearEffect = wearPercentage * wearPercentage * 1.2; // Square for exponential effect
  const tireGripLoss = gameRunning ? progressiveWearEffect / 2.5 : 0; // Less severe grip loss
  
  // Calculate base friction that applies to all conditions
  const combinedFriction = Math.max(
    0.970, // Reduced from 0.975 to make friction more impactful
    baseFriction - currentSpeed * 0.001 - tireGripLoss
  );
  
  // Check if player is sliding (based on sliding detection)
  if (player.isSliding && player.tireWear > 20) {
    // When sliding with worn tires, grip loss is even more severe
    const slidingPenalty = 0.008 + (wearPercentage * 0.015);
    player.velocity.x *= (combinedFriction - slidingPenalty);
    player.velocity.y *= (combinedFriction - slidingPenalty);
  } else {
    // Normal friction application
    player.velocity.x *= combinedFriction;
    player.velocity.y *= combinedFriction;
  }
}

function updatePlayerSpeed() {
  player.speed = Math.sqrt(
    player.velocity.x * player.velocity.x +
      player.velocity.y * player.velocity.y
  );
}

function constrainToBounds() {
  const worldBounds = 2500;

  if (
    player.x < -200 ||
    player.x > worldBounds ||
    player.y < -200 ||
    player.y > worldBounds
  ) {
    player.x = Math.max(-150, Math.min(worldBounds - 50, player.x));
    player.y = Math.max(-150, Math.min(worldBounds - 50, player.y));
    player.velocity.x *= 0.85;
    player.velocity.y *= 0.85;
  }
}

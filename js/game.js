// Store final race standings when race completes
let finalRaceStandings = [];

function updateSimulationStep() {
    // Update player car physics and input handling
    updatePlayer();

    // Update AI cars depending on mode
    if (isTimeTrialMode) {
      // Update position display to show best times in time trial mode
      updatePositionDisplay([]);
    } else {
      // Update all AI cars (movement, decision-making, pathfinding)
      updateAI();
      
      // Validate checkpoint progression for lap counting and anti-cheat
      checkAICheckpoints();
      
      // Process collision detection between all cars
      handleCarCollisions();
      
      // Calculate current race positions for all participants
      updatePositions();
      
      // Check if any car has completed the required laps
      checkRaceCompletion();
    }

    // Update camera position to smoothly follow the player
    updateCamera();

    // Update weather effects (rain particles, etc.)
    updateRainParticles();
}

function updateEffects() {
  for (let i = tireMarks.length - 1; i >= 0; i--) {
    const mark = tireMarks[i];
    mark.age++;
    mark.alpha -= 0.005;
    if (mark.alpha <= 0) tireMarks.splice(i, 1);
  }
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const sparkle = sparkles[i];
    sparkle.life--;
    sparkle.x += sparkle.vx;
    sparkle.y += sparkle.vy;
    sparkle.vx *= 0.98;
    sparkle.vy *= 0.98;
    if (sparkle.life <= 0) sparkles.splice(i, 1);
  }
  for (let i = flames.length - 1; i >= 0; i--) {
    const flame = flames[i];
    flame.life--;
    flame.x += flame.vx;
    flame.y += flame.vy;
    flame.vx *= 0.95;
    flame.vy *= 0.95;
    flame.size *= 0.98;
    if (flame.life <= 0 || flame.size < 0.5) flames.splice(i, 1);
  }
}

function gameLoop(timestamp) {
  const frameTimestamp = timestamp ?? performance.now();
  const frameDeltaMs =
    lastFrameTimestamp === null || document.hidden || layoutPaused
      ? 0
      : Math.min(MAX_FRAME_DELTA_MS, frameTimestamp - lastFrameTimestamp);
  lastFrameTimestamp = frameTimestamp;
  simulationAccumulatorMs += frameDeltaMs;

  while (simulationAccumulatorMs >= SIMULATION_STEP_MS) {
    simulationAccumulatorMs -= SIMULATION_STEP_MS;
    if (gameRunning) {
      snapshotRenderState();
      simulationTimeMs += SIMULATION_STEP_MS;
      updateSimulationStep();
    }
    updateEffects();
  }
  renderAlpha = gameRunning ? simulationAccumulatorMs / SIMULATION_STEP_MS : 1;
  updateAudio();

  // Apply camera transformation matrix for world-space rendering
  applyCameraTransform();

  // Render all world-space objects (affected by camera position)
  drawTrack(); // Track surface and boundaries
  drawTireMarks(); // Persistent tire marks from car movement
  drawFlames(); // Nitro flame effects (drawn behind cars)

  // Render all cars with current positions and rotations
  if (!isTimeTrialMode) {
    // Render AI cars in regular race mode
    aiCars.forEach(drawCar);
  }
  drawCar(player);

  // Render collision and interaction effects
  drawSparkles();

  // Render weather effects (rain particles and overlay dimming)
  renderWeatherEffects();

  // Reset camera matrix for UI rendering
  resetCameraTransform();
  drawMiniMapOverlay();

  // Update all UI elements (not affected by camera movement)
  updateUI();

  // Schedule next frame for smooth 60fps animation
  requestAnimationFrame(gameLoop);
}

// Start race
function startRace() {
  document.getElementById("startScreen").style.display = "none";
  ensureAudio();

  // Show broadcast bar and game UI
  document.querySelector(".broadcast-bar").style.display = "flex";
  document.querySelector(".game-container").classList.add("game-running");

  // Make sure leaderboard is hidden when race starts
  document.querySelector(".leaderboard").style.display = "none";

  gameRunning = true;
  raceStartTime = gameNow();
  currentLap = 1;
  raceComplete = false;
  
  // Clear the final race standings
  finalRaceStandings = [];

  // Reset lap timing
  lapStartTime = raceStartTime;
  currentLapTime = 0;
  bestLapTime = Number.MAX_VALUE; // Reset best lap time for this race
  lastLapTime = 0; // Reset last lap time
  lapTimes = [];

  // Reset lap timing and race properties for player
  player.lapTimes = [];
  player.currentLapStartTime = raceStartTime;
  player.checkpointsPassed = 0;
  player.checkpointPassTimes = {};
  player.totalRaceTime = 0;
  player.checkpointTimes = {};
  player.calculatedTotalTime = 0;
  player.lastLapCompletionTime = 0; // Reset lap completion time for queue-based standings

  // Reset lap timing and race properties for all AI cars
  aiCars.forEach((car) => {
    car.lapTimes = [];
    car.currentLapStartTime = 0;
    car.totalRaceTime = 0;
    car.checkpointTimes = {};
    car.calculatedTotalTime = 0;
    car.lastLapCompletionTime = 0; // Reset lap completion time for queue-based standings
  });

  // Reset UI elements
  document.getElementById("newRecordText").style.color =
    "var(--accent-color)";
  document.getElementById("newRecordText").style.display = "none";
  document.getElementById("nameInputModal").style.display = "none";
  
  // Initialize tire bar to full and green
  document.getElementById("tireBar").style.width = "100%";
  document.getElementById("tireBar").style.background = "rgb(0, 255, 0)";
  
  // Initialize damage bar to empty and green
  document.getElementById("damageBar").style.width = "0%";
  document.getElementById("damageBar").style.background = "rgb(0, 255, 0)";
  
  // Initialize nitro bar to full and blue
  document.getElementById("nitroBar").style.width = "100%";
  document.getElementById("nitroBar").style.background = "rgb(0, 0, 255)";

  // Reset player to pole position (front of grid)
  player.x = track.start.x;
  player.y = track.start.y;
  player.angle = track.start.angle;
  player.velocity = { x: 0, y: 0 };
  player.speed = 0;
  player.currentCheckpoint = 1;
  player.checkpointsHit = freshCheckpointsHit();
  player.lapsCompleted = 0;
  player.lapProgress = 0;
  player.racePosition = 1;
  player.gridPosition = 0; // Player starts at pole position (first in grid)
  player.nitro = player.maxNitro; // Reset nitro to full
  player.usingNitro = false;
  player.isSliding = false; // Reset sliding flag
  player.tireWear = 0; // Reset tire wear

  // Initialize camera to player's starting position
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;
  camera.targetX = camera.x;
  camera.targetY = camera.y;

  // Reset damage, tire wear for player
  player.damage = {
    speed: 0,
    acceleration: 0,
    handling: 0,
    braking: 0,
    visible: false,
  };
  player.tireWear = 0;
  player.lastCollisionTime = 0;
  player.checkpointTimes = {}; // Reset checkpoint times

  // Re-apply team attributes (undoing damage from the previous race) and fill the tank
  if (player.teamAttributes) {
    applyPlayerTeamSetup(player.teamAttributes);
  }
  player.fuel = 100;
  player.pitState = null;
  player.wantsPit = false;
  player.paceJitter = 0;

  // Initialize time trial or regular race
  if (isTimeTrialMode) {
    // Time trial mode
    totalLaps = 1; // Single lap for time trial
    console.log("Time Trial mode started");
  } else {
    // Regular race mode
    totalLaps = 5; // Standard 5-lap race
    
    // Create AI cars
    createAICars();
    aiCars.forEach((car) => {
      car.currentLapStartTime = raceStartTime;
    });
  }

  // Initialize weather effects for the race
  if (weatherEffects[gameWeather].particles) {
    initializeRainParticles();
  }

  // Initialize time trial mode if selected
  if (isTimeTrialMode) {
    totalLaps = 1; // Only one lap for time trial
  }

  document.getElementById("raceComplete").style.display = "none";
  document.getElementById("timeTrialComplete").style.display = "none";
}

// Restart race
function restartRace() {
  // Reset lap timing variables
  lapStartTime = 0;
  currentLapTime = 0;
  bestLapTime = Number.MAX_VALUE;
  lastLapTime = 0;
  lapTimes = [];

  startRace();
}

// Return to team selection
function returnToTeamSelection() {
  gameRunning = false;

  // Reset lap timing variables
  lapStartTime = 0;
  currentLapTime = 0;
  bestLapTime = Number.MAX_VALUE;
  lastLapTime = 0;
  lapTimes = [];

  // Hide broadcast bar and game UI
  document.querySelector(".broadcast-bar").style.display = "none";
  document
    .querySelector(".game-container")
    .classList.remove("game-running");
  document.querySelector(".leaderboard").style.display = "none";

  document.getElementById("raceComplete").style.display = "none";
  document.getElementById("timeTrialComplete").style.display = "none";
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("teamSelectionScreen").style.display = "flex";

  // Reset team selection
  selectedTeam = null;
  document.querySelectorAll(".team-card").forEach((card) => {
    card.classList.remove("selected");
  });
  document.getElementById("proceedToRaceBtn").disabled = true;
  
  // Reset time trial data when returning to team selection
  isTimeTrialMode = false;
  bestTimeTrialLap = null;
  updateModeUI();
}

// Initialize and start game loop
updateLeaderboardDisplay(); // Load leaderboard on page start
gameLoop();

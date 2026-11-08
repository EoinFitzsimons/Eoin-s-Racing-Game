// Game setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/**
 * Camera System for Smooth Player Following
 * Provides smooth camera movement that follows the player car with configurable lag.
 * Prevents jarring camera movements while maintaining responsive tracking.
 */
const camera = {
  x: 0, // Current camera world X position
  y: 0, // Current camera world Y position
  targetX: 0, // Target X position (where camera wants to be)
  targetY: 0, // Target Y position (where camera wants to be)
  smoothing: 0.1, // Camera smoothing factor (0.1 = 10% movement per frame)
};

/**
 * Updates camera target position and applies smooth interpolation.
 * Called every frame to track player movement with natural lag.
 */
function updateCamera() {
  // Set camera target to center player on screen
  camera.targetX = player.x - canvas.width / 2;
  camera.targetY = player.y - canvas.height / 2;

  // Apply smooth interpolation to prevent jarring movement
  camera.x += (camera.targetX - camera.x) * camera.smoothing;
  camera.y += (camera.targetY - camera.y) * camera.smoothing;
}

/**
 * Applies camera transformation matrix to canvas context.
 * All subsequent drawing will be offset by camera position.
 */
function applyCameraTransform() {
  const view = cameraRenderPosition();
  ctx.save();
  ctx.translate(-view.x, -view.y);
}

/**
 * Removes camera transformation from canvas context.
 * Used before drawing UI elements that should remain screen-fixed.
 */
function resetCameraTransform() {
  ctx.restore();
}

// Game state
let gameRunning = false;
let raceStartTime = 0;
let currentLap = 1;
let totalLaps = 5;
let raceComplete = false;
let currentRaceTime = 0;

// Fixed-step simulation: physics, AI and race timing advance 60 steps per simulated second on any display
const SIMULATION_STEP_MS = 1000 / 60;
const MAX_FRAME_DELTA_MS = 250;
let simulationTimeMs = 1;
let simulationAccumulatorMs = 0;
let lastFrameTimestamp = null;

function gameNow() {
  return simulationTimeMs;
}

// Difficulty settings
let gameDifficulty = "medium"; // "easy", "medium", "hard"

// Weather settings
let gameWeather = "clear"; // "clear", "rain", "storm"

// Time Trial mode settings
let isTimeTrialMode = false;
let timeTrialLaps = [];
let bestTimeTrialLap = null;

const difficultySettings = {
  easy: {
    aiAttributeMultiplier: 0.85, // AI cars have reduced attributes
    playerAttributeMultiplier: 1.0, // Player attributes unchanged
    collisionsEnabled: false, // No collisions on Easy
    aiMistakesEnabled: true, // AI makes mistakes
    aiMistakeFrequency: 1.5, // Higher frequency of mistakes
    aiReactionTime: 1.3 // Slower reaction time
  },
  medium: {
    aiAttributeMultiplier: 1.0, // Normal AI attributes
    playerAttributeMultiplier: 1.0, // Normal player attributes
    collisionsEnabled: true, // Collisions enabled
    aiMistakesEnabled: true, // AI makes mistakes
    aiMistakeFrequency: 1.0, // Normal mistake frequency
    aiReactionTime: 1.0 // Normal reaction time
  },
  hard: {
    aiAttributeMultiplier: 1.15, // Enhanced AI attributes
    playerAttributeMultiplier: 1.0, // Player attributes unchanged
    collisionsEnabled: true, // Collisions enabled
    aiMistakesEnabled: false, // AI doesn't make mistakes
    aiReactionTime: 0.7 // Faster reaction time
  }
};

// Lap timing variables
let lapStartTime = 0;
let currentLapTime = 0;
let bestLapTime = Number.MAX_VALUE; // Best lap time in current race
let lapRecord = Number(localStorage.getItem("circuitRacerLapRecord")) || Number.MAX_VALUE; // All-time best race lap, saved in the browser
let lastLapTime = 0; // Last completed lap time
let lapTimes = [];

// Initialize team selection on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeTeamSelection();
  // Set default theme to the first available team (Adriatic Racing)
  applyTeamTheme("adriatic_racing");
  
  // Initialize difficulty selector with medium selected
  setDifficulty("medium");
  
  // Initialize weather selector with clear weather selected
  setWeather("clear");
  
  // Initialize mode UI (race mode by default)
  updateModeUI();
  
  // Initialize time trial leaderboard display
  updateTimeTrialLeaderboardDisplay();
});

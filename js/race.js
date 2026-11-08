// Global race state
let raceLeader = null;
let lastLapCheckpoint = 0; // Track which checkpoint marks the last lap completion

// Check player checkpoints
/**
 * Checkpoint validation system - Ensures cars complete laps correctly and prevents shortcutting
 * Uses a sequential checkpoint system where cars must hit checkpoints in the correct order
 * @param {Object} car - The car object to check (player or AI)
 */
/**
 * Checkpoint Validation System with Anti-Cheat Protection
 *
 * This function ensures all cars progress through checkpoints in the correct sequence
 * and provides different detection methods for start/finish vs regular checkpoints.
 *
 * Features:
 * - Wider rectangular detection for start/finish line (accommodates different racing lines)
 * - Circular detection for corner checkpoints (prevents cutting corners)
 * - Sequential checkpoint validation (prevents lap exploits)
 * - Checkpoint timing for gap calculations and telemetry
 *
 * @param {Object} car - The car object to check (player or AI)
 */
function checkCarCheckpoints(car) {
  const checkpoints = track.checkpoints;
  const nextCheckpointIndex = car.currentCheckpoint;

  // Safety check: if somehow all checkpoints completed, reset for next lap
  if (nextCheckpointIndex >= checkpoints.length) {
    car.currentCheckpoint = 0; // Reset to start/finish line
    return;
  }

  const nextCheckpoint = checkpoints[nextCheckpointIndex];
  let checkpointHit = false;

  // Special collision detection for start/finish line (checkpoint 0)
  // Uses a wider rectangular area to accommodate different racing lines
  if (nextCheckpointIndex === 0) {
    // Wide finish line area spans the track width to catch cars using inside/outside lines
    const finishY = nextCheckpoint.y;
    const finishCenterX = nextCheckpoint.x;
    // Generous finish line detection area to accommodate all racing lines
    const finishWidth = 320; // Increased from 280 to ensure wide lines are detected
    const finishHeight = 140; // Increased from 120 for better coverage

    // Check if car is within the finish line area
    if (
      car.y >= finishY - finishHeight / 2 &&
      car.y <= finishY + finishHeight / 2 &&
      car.x >= finishCenterX - finishWidth / 2 &&
      car.x <= finishCenterX + finishWidth / 2
    ) {
      checkpointHit = true;
    }
  } else {
    // Regular circular checkpoint detection for other checkpoints - wider detection area
    const dx = nextCheckpoint.x - car.x;
    const dy = nextCheckpoint.y - car.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 80) { // Increased from 45 to accommodate wider racing lines in all weather conditions
      checkpointHit = true;
    }
  }

  // Process checkpoint hit - but only if car is properly on track
  if (checkpointHit) {
    // Additional validation: car must be on track to hit checkpoint
    if (!isPointOnTrack(car.x, car.y)) {
      // Car is off track, don't count the checkpoint
      return;
    }
    
    // Record checkpoint time for gap calculations
    const currentTime = gameRunning ? gameNow() : 0;
    if (!car.checkpointTimes) {
      car.checkpointTimes = {};
    }
    car.checkpointTimes[`${car.lapsCompleted}_${nextCheckpointIndex}`] =
      currentTime;
    car.checkpointsPassed = (car.checkpointsPassed || 0) + 1;
    car.checkpointPassTimes = car.checkpointPassTimes || {};
    car.checkpointPassTimes[car.checkpointsPassed] = currentTime;

    // Mark this checkpoint as hit
    car.checkpointsHit[nextCheckpointIndex] = true;
    car.currentCheckpoint++;

    // Check if this completes a lap (hitting checkpoint 0 after completing all others)
    if (nextCheckpointIndex === 0) {
      // Check if all checkpoints were hit in sequence
      const allCheckpointsHit = car.checkpointsHit.every((hit) => hit);
      if (allCheckpointsHit) {
        // Store the timestamp when this lap was completed (for sorting)
        car.lastLapCompletionTime = currentTime;
        
        // Completed a full lap
        car.lapsCompleted++;

        // Track lap times for all cars
        if (gameRunning) {
          const currentTime = gameNow();

          // Calculate and store lap time
          if (car.currentLapStartTime > 0) {
            const lapTime =
              (currentTime - car.currentLapStartTime) / 1000;
            car.lapTimes.push(lapTime);
            car.totalRaceTime += lapTime;

            // Additional tracking for player car
            if (car === player) {
              currentLapTime = lapTime;
              lastLapTime = lapTime; // Store the last completed lap time
              lapTimes.push(currentLapTime);

              // Handle time trial lap completion
              if (isTimeTrialMode) {
                completeTimeTrialLap(lapTime);
                return; // Exit early for time trial - single lap only
              }

              // Update best lap time for current race
              if (currentLapTime < bestLapTime) {
                bestLapTime = currentLapTime;
                
                // Check if this is also an all-time lap record
                if (currentLapTime < lapRecord) {
                  lapRecord = currentLapTime;
                  localStorage.setItem("circuitRacerLapRecord", String(lapRecord));
                  
                  // Show a lap record notification
                  const notification = document.createElement("div");
                  notification.className = "lap-record-notification";
                  notification.textContent = "NEW LAP RECORD!";
                  notification.style.cssText = `
                    position: absolute;
                    top: 30%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(255, 215, 0, 0.8);
                    color: #000;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 24px;
                    font-weight: bold;
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
                    z-index: 9999;
                    animation: recordPulse 2s forwards;
                  `;
                  document.body.appendChild(notification);
                  
                  // Add CSS animation if not already added
                  if (!document.getElementById("recordAnimation")) {
                    const style = document.createElement("style");
                    style.id = "recordAnimation";
                    style.textContent = `
                      @keyframes recordPulse {
                        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                        40% { transform: translate(-50%, -50%) scale(0.9); }
                        60% { transform: translate(-50%, -50%) scale(1.1); }
                        80% { opacity: 1; }
                        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
                      }
                    `;
                    document.head.appendChild(style);
                  }
                  
                  // Remove notification after animation
                  setTimeout(() => {
                    notification.remove();
                  }, 2000);
                }
              }

              // Update player's lap start time
              lapStartTime = currentTime;
            }
          }

          // Start timing for next lap for all cars
          car.currentLapStartTime = currentTime;
        }

        // Reset for next lap
        car.currentCheckpoint = 1; // Next checkpoint after start/finish
        car.checkpointsHit = [true, false, false];

        console.log(
          `${car.name || "Player"} completed lap ${car.lapsCompleted}`
        );
      }
    }

    // Update lap progress for positioning (total laps + progress through current lap)
    car.lapProgress =
      car.lapsCompleted + car.currentCheckpoint / checkpoints.length;
  }
}

function checkPlayerCheckpoints() {
  checkCarCheckpoints(player);
}

// Check AI checkpoints
function checkAICheckpoints() {
  aiCars.forEach((ai) => {
    checkCarCheckpoints(ai);
  });
}

// Check if race is complete
function checkRaceCompletion() {
  const allCars = [
    { ...player, name: "Player", isPlayer: true },
    ...aiCars,
  ];

  // Find the race leader (car with most laps completed)
  allCars.sort((a, b) => b.lapsCompleted - a.lapsCompleted);
  const raceLeader = allCars[0];

  // Update global currentLap based on race leader's progress
  if (raceLeader.lapsCompleted > 0) {
    currentLap = Math.min(raceLeader.lapsCompleted + 1, totalLaps);
  }

  // Race only ends when the player completes their 5th lap
  if (player.lapsCompleted >= totalLaps && !raceComplete) {
    // Save final race standings before marking race as complete
    const finalStandings = [
      { ...player, name: "Player", isPlayer: true },
      ...aiCars,
    ];
    
    // Calculate final race progress for all cars
    calculateRaceProgress(finalStandings);
    
    // Sort cars by distance covered around the circuit
    finalStandings.forEach((car) => {
      car.trackProgress = calculateTrackProgress(car);
    });
    finalStandings.sort(compareRaceOrder);
    
    // Save position information
    finalStandings.forEach((car, index) => {
      car.racePosition = index + 1;
      if (car.isPlayer) {
        player.racePosition = index + 1;
      }
    });
    
    // Store these standings for use after race completion
    finalRaceStandings = finalStandings;
    
    raceComplete = true;
    gameRunning = false;
    showRaceComplete();
  }
}

// Update race positions
function updatePositions() {
  const allCars = [
    { ...player, name: "Player", isPlayer: true },
    ...aiCars,
  ];

  calculateRaceProgress(allCars);

  // First, pre-calculate time gaps for each car relative to their total race time
  // This will be used for sorting within the same lap/checkpoint
  const currentTime = gameNow();

  allCars.forEach((car) => {
    // Calculate total race time including current lap in progress
    let totalTime = car.totalRaceTime || 0;
    if (car.currentLapStartTime > 0) {
      const currentLapTime =
        (currentTime - car.currentLapStartTime) / 1000;
      totalTime += currentLapTime;
    }
    car.calculatedTotalTime = totalTime;
    
    // Ensure lastLapCompletionTime exists (default to a high value if not set)
    if (car.lastLapCompletionTime === undefined) {
      car.lastLapCompletionTime = Number.MAX_SAFE_INTEGER;
    }
  });

  allCars.forEach((car) => {
    car.trackProgress = calculateTrackProgress(car);
  });
  allCars.sort(compareRaceOrder);

  // Calculate time gaps to the leader for all cars
  const leader = allCars[0];
  for (let i = 1; i < allCars.length; i++) {
    allCars[i].gapToLeader = calculateGapInSeconds(leader, allCars[i], i);
  }

  // Group cars that share the same lap and checkpoint
  const finalSortedCars = [];
  let currentGroup = [];
  let currentLap = -1;
  let currentCheckpoint = -1;

  // Group cars by lap and checkpoint
  for (const car of allCars) {
    if (
      car.lapsCompleted !== currentLap ||
      car.currentCheckpoint !== currentCheckpoint
    ) {
      // Add previous group to final array
      if (currentGroup.length > 0) {
        // Group is already sorted by calculatedTotalTime from the initial sort
        finalSortedCars.push(...currentGroup);
        currentGroup = [];
      }

      // Start new group
      currentLap = car.lapsCompleted;
      currentCheckpoint = car.currentCheckpoint;
    }
    currentGroup.push(car);
  }

  // Add the last group
  if (currentGroup.length > 0) {
    finalSortedCars.push(...currentGroup);
  }

  logPositionDebugInfo(finalSortedCars);
  updateCarPositions(finalSortedCars);
  updatePositionDisplay(finalSortedCars);
}

let trackGeometry = null;

function getTrackGeometry() {
  if (trackGeometry) return trackGeometry;
  const points = track.waypoints;
  const cumulative = [0];
  for (let i = 1; i < points.length; i++) {
    cumulative.push(
      cumulative[i - 1] +
        Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
    );
  }
  const last = points[points.length - 1];
  const totalLength =
    cumulative[cumulative.length - 1] + Math.hypot(points[0].x - last.x, points[0].y - last.y);
  trackGeometry = { points, cumulative, totalLength, checkpointDistances: [] };
  trackGeometry.checkpointDistances = track.checkpoints.map((checkpoint, index) =>
    index === 0 ? 0 : projectOntoTrack(checkpoint.x, checkpoint.y)
  );
  return trackGeometry;
}

// Distance along the racing line (from the start/finish line) of the closest point to (x, y)
function projectOntoTrack(x, y) {
  const { points, cumulative } = trackGeometry;
  let bestDistanceSq = Infinity;
  let bestAlong = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / lengthSq));
    const px = a.x + t * dx;
    const py = a.y + t * dy;
    const distanceSq = (x - px) * (x - px) + (y - py) * (y - py);
    if (distanceSq < bestDistanceSq) {
      bestDistanceSq = distanceSq;
      bestAlong = cumulative[i] + t * Math.sqrt(lengthSq);
    }
  }
  return bestAlong;
}

// Total distance covered in the race, used to order the standings
function calculateTrackProgress(car) {
  const geometry = getTrackGeometry();
  const checkpointCount = track.checkpoints.length;
  const nextIndex = car.currentCheckpoint % checkpointCount;
  const previousIndex = (nextIndex + checkpointCount - 1) % checkpointCount;
  const segmentStart = geometry.checkpointDistances[previousIndex];
  const segmentEnd = nextIndex === 0 ? geometry.totalLength : geometry.checkpointDistances[nextIndex];
  const segmentLength = segmentEnd - segmentStart;

  let along =
    (projectOntoTrack(car.x, car.y) - segmentStart + geometry.totalLength) % geometry.totalLength;
  // Cars just behind the last checkpoint they passed (e.g. on the grid) count as slightly behind it
  if (along > segmentLength + (geometry.totalLength - segmentLength) / 2) {
    along -= geometry.totalLength;
  }
  along = Math.min(along, segmentLength);

  return car.lapsCompleted * geometry.totalLength + segmentStart + along;
}

function compareRaceOrder(a, b) {
  return b.trackProgress - a.trackProgress || a.gridPosition - b.gridPosition;
}

// Gap to the car ahead: the difference in when both passed the latest shared checkpoint,
// or an estimate from distance and speed before the first checkpoint
function estimateGapSeconds(carAhead, car) {
  const passed = car.checkpointsPassed || 0;
  const aheadPassTimes = carAhead.checkpointPassTimes || {};
  if (passed > 0 && car.checkpointPassTimes && aheadPassTimes[passed] !== undefined) {
    const checkpointGap = (car.checkpointPassTimes[passed] - aheadPassTimes[passed]) / 1000;
    // A negative gap means the order changed since the checkpoint, so estimate from distance instead
    if (checkpointGap > 0) return checkpointGap;
  }
  const pixelsPerSecond = Math.max(carAhead.speed || 0, car.speed || 0, 1) * (1000 / SIMULATION_STEP_MS);
  return (carAhead.trackProgress - car.trackProgress) / pixelsPerSecond;
}

function calculateRaceProgress(allCars) {
  allCars.forEach((car) => {
    let baseProgress =
      car.lapsCompleted +
      car.currentCheckpoint / track.checkpoints.length;

    const nextCheckpointIndex =
      car.currentCheckpoint % track.checkpoints.length;
    const nextCheckpoint = track.checkpoints[nextCheckpointIndex];

    if (nextCheckpoint) {
      const distanceToNext = Math.sqrt(
        Math.pow(car.x - nextCheckpoint.x, 2) +
          Math.pow(car.y - nextCheckpoint.y, 2)
      );

      const maxDistance = 2000;
      const distanceProgress = Math.max(
        0,
        (1 - distanceToNext / maxDistance) * 0.33
      );
      baseProgress += distanceProgress;
    }

    car.raceProgress = baseProgress;
  });
}

function logPositionDebugInfo(allCars) {
  const shouldLog =
    Math.floor(gameNow() / 1000) % 5 === 0 &&
    (!this.lastDebugTime ||
      gameNow() - (this.lastDebugTime || 0) > 5000);

  if (shouldLog) {
    // Format: POS | Name | Lap X/5 | Sector Y | Last Lap: MM:SS.sss | Gap: +X.Xs | Lap Completion Time | Raw Time
    const debugText = allCars
      .map((car, index) => {
        // Format position
        const positionText = `P${index + 1}`;

        // Format lap info
        const lapInfo = `Lap ${car.lapsCompleted}/${totalLaps}`;

        // Format sector info
        const sectorMap = { 0: "S/F", 1: "S1", 2: "S2" };
        const sector = sectorMap[car.currentCheckpoint] || "??";

        // Format last lap time
        const lastLapTime =
          car.lapTimes.length > 0
            ? formatTime(car.lapTimes[car.lapTimes.length - 1])
            : "--:--";

        // Format gap to leader
        const leader = allCars[0];
        const gapInSeconds =
          index === 0 ? 0 : calculateGapInSeconds(leader, car, index);
        const gapText =
          index === 0 ? "LEADER" : `+${gapInSeconds.toFixed(3)}s`;
          
        // Format lap completion time (when car entered the current lap)
        const lapCompletionTime = car.lastLapCompletionTime
          ? new Date(car.lastLapCompletionTime).toISOString().substr(11, 12)
          : "None";

        // Format calculated total time for debugging (raw, unrounded)
        const totalTimeText =
          car.calculatedTotalTime !== undefined
            ? `Raw: ${car.calculatedTotalTime.toFixed(6)}s`
            : "No time";

        return `${positionText} | ${
          car.name || "Player"
        } | ${lapInfo} | ${sector} | Last: ${lastLapTime} | ${gapText} | LapEntry: ${lapCompletionTime} | ${totalTimeText}`;
      })
      .join("\n");

    console.log("RACE STANDINGS (EXACT TIMES):\n" + debugText);
    this.lastDebugTime = gameNow();
  }
}

// Helper function to format time as MM:SS.sss
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${minutes}:${secs.padStart(6, "0")}`;
}

function updateCarPositions(allCars) {
  allCars.forEach((car, index) => {
    car.racePosition = index + 1;
    if (car.isPlayer) {
      player.racePosition = index + 1;
    }
  });
}

function updatePositionDisplay(allCars) {
  const positionList = document.getElementById("positionList");
  positionList.innerHTML = "";

  // In time trial mode, show best times instead of race positions
  if (isTimeTrialMode) {
    // Update the title to reflect time trial content
    const standingsTitle = document.querySelector('.position-display div');
    if (standingsTitle) {
      standingsTitle.textContent = 'BEST TIMES';
    }
    
    // Show top 5 time trial records
    const topRecords = timeTrialLeaderboard.slice(0, 5);
    
    if (topRecords.length === 0) {
      const emptyItem = document.createElement("div");
      emptyItem.className = "position-item";
      emptyItem.style.textAlign = "center";
      emptyItem.style.color = "var(--text-secondary)";
      emptyItem.innerHTML = "Complete a lap to see times here!";
      positionList.appendChild(emptyItem);
      return;
    }
    
    topRecords.forEach((record, index) => {
      const positionItem = createTimeTrialDisplayItem(record, index);
      positionList.appendChild(positionItem);
    });
  } else {
    // Update the title back to standings for race mode
    const standingsTitle = document.querySelector('.position-display div');
    if (standingsTitle) {
      standingsTitle.textContent = 'STANDINGS';
    }
    
    // Use finalRaceStandings instead of allCars if race is complete
    const carsToDisplay = raceComplete ? finalRaceStandings : allCars;

    carsToDisplay.forEach((car, index) => {
      const positionItem = createPositionDisplayItem(car, index, carsToDisplay);
      positionList.appendChild(positionItem);
    });
  }
}

function createTimeTrialDisplayItem(record, index) {
  const div = document.createElement("div");
  div.className = "position-item time-trial-item";
  
  // Check if this is the current player's record
  const isCurrentPlayer = record.name === getSelectedTeamName();
  if (isCurrentPlayer) {
    div.className += " player-pos";
  }

  const position = index + 1;
  
  // Format lap time
  const minutes = Math.floor(record.time / 60);
  const seconds = (record.time % 60).toFixed(3);
  const timeDisplay = `${minutes}:${seconds.padStart(6, "0")}`;
  
  // Get team code (3 letters)
  const teamCode = record.teamName ? String(record.teamName).substring(0, 3).toUpperCase() : 'N/A';
  
  // Format date
  const dateDisplay = record.date;
  
  const nameColor = isCurrentPlayer ? "var(--primary-text-color, var(--primary-color))" : "#ffffff";

  // Format: position  team-code  player-name  lap-time  date
  div.innerHTML = `
    <span style="color: var(--text-primary); font-weight: 600; width: 18px; display: inline-block;">${position}</span>
    <span style="color: var(--accent-color); font-weight: 400; width: 30px; display: inline-block; font-size: 0.8em;">${escapeHtml(teamCode)}</span>
    <span class="time-trial-name" style="color: ${nameColor}; font-weight: ${isCurrentPlayer ? "700" : "400"}; width: 65px; display: inline-block; font-size: 0.85em;">${escapeHtml(record.name)}</span>
    <span style="color: var(--accent-color); width: 60px; display: inline-block; font-family: monospace;">${timeDisplay}</span>
    <span class="time-trial-date" style="color: var(--text-secondary); width: 70px; display: inline-block; font-size: 0.75em;">${escapeHtml(dateDisplay)}</span>
  `;

  return div;
}

function createPositionDisplayItem(car, index, allCars) {
  const div = document.createElement("div");
  div.className = "position-item";
  if (car.isPlayer) div.className += " player-pos";

  const position = index + 1;
  
  // Get 3-letter team abbreviation
  const teamCode = getTeamCode(car);
  
  // Format last lap time
  let lastLapDisplay = "--.---";
  if (car.lapTimes && car.lapTimes.length > 0) {
    const lastLapTime = car.lapTimes[car.lapTimes.length - 1];
    const lastLapMinutes = Math.floor(lastLapTime / 60);
    const lastLapSeconds = (lastLapTime % 60).toFixed(3);
    lastLapDisplay = `${lastLapMinutes}:${lastLapSeconds.padStart(6, "0")}`;
  }

  // Get gap text (already formatted)
  const gapText = calculateGapText(car, index, allCars);
  
  // Current lap info
  const lapInfo = `${car.lapsCompleted}/${totalLaps}`;
  
  // Add small indicator for lap entry order (cars that entered the current lap first)
  let lapEntryIndicator = "";
  if (index > 0 && car.lapsCompleted > 0) {
    // Find all cars on the same lap
    const carsOnSameLap = allCars.filter(c => c.lapsCompleted === car.lapsCompleted);
    // Find the first car that entered this lap (smallest lastLapCompletionTime)
    const firstToEnterLap = carsOnSameLap.reduce((first, current) => 
      (current.lastLapCompletionTime < first.lastLapCompletionTime) ? current : first, 
      carsOnSameLap[0]);
    
    // If this car was the first to enter the current lap, show an indicator
    if (car === firstToEnterLap) {
      lapEntryIndicator = '<span style="color: var(--accent-color); margin-left: 3px;">⦿</span>';
    }
  }
  
  const carNameColor = car.isPlayer ? "var(--primary-text-color, var(--primary-color))" : "#ffffff";

  // Format: position  3-letter-abbreviation  lap-progress  last-lap-time  gap-to-leader
  div.innerHTML = `
    <span style="color: var(--text-primary); font-weight: 600; width: 30px; display: inline-block;">${position}</span>
    <span style="color: ${carNameColor}; font-weight: ${car.isPlayer ? "700" : "400"}; width: 50px; display: inline-block;">${escapeHtml(teamCode)}</span>
    <span style="color: var(--text-primary); width: 40px; display: inline-block;">${lapInfo}${lapEntryIndicator}</span>
    <span style="color: var(--text-primary); width: 80px; display: inline-block;">${lastLapDisplay}</span>
    <span style="color: var(--text-secondary); width: 80px; display: inline-block;">${gapText}</span>
  `;

  return div;
}

function calculateGapText(car, index, allCars) {
  if (index === 0) {
    return "+0.000s";
  }

  const carAhead = allCars[index - 1];
  let gapInSeconds = estimateGapSeconds(carAhead, car);

  // Ensure we don't show negative gaps (shouldn't happen, but just in case)
  gapInSeconds = Math.max(0, gapInSeconds);

  // Display the actual gap
  return formatGapText(gapInSeconds);
}

function calculateGapInSeconds(leader, currentCar, position) {
  // If leader and car are identical, return 0
  if (leader === currentCar) {
    return 0;
  }

  // If we already have the calculated total times, use them directly for a consistent gap
  if (
    leader.calculatedTotalTime !== undefined &&
    currentCar.calculatedTotalTime !== undefined
  ) {
    // Use the exact difference between race times for accurate gaps
    // In real F1, identical times to the millisecond are possible (shown as 0.000s)
    // The car that set the time first gets the higher position
    const rawGap =
      currentCar.calculatedTotalTime - leader.calculatedTotalTime;

    // Return the exact gap with no minimum enforcement
    return rawGap;
  }

  // Legacy calculation if calculatedTotalTime is not available
  const lapDifference = leader.lapsCompleted - currentCar.lapsCompleted;

  // Get total race time for both cars (completed laps only)
  let leaderRaceTime = leader.totalRaceTime || 0;
  let currentCarRaceTime = currentCar.totalRaceTime || 0;

  // Add current lap progress time for both cars
  const currentTime = gameNow();

  // Add the time of the current lap in progress
  let leaderCurrentLapTime = 0;
  let currentCarCurrentLapTime = 0;

  if (leader.currentLapStartTime > 0) {
    leaderCurrentLapTime =
      (currentTime - leader.currentLapStartTime) / 1000;
    leaderRaceTime += leaderCurrentLapTime;
  }

  if (currentCar.currentLapStartTime > 0) {
    currentCarCurrentLapTime =
      (currentTime - currentCar.currentLapStartTime) / 1000;
    currentCarRaceTime += currentCarCurrentLapTime;
  }

  // Calculate a more accurate gap based on lap difference and actual times
  let gap;

  if (lapDifference === 0) {
    // On same lap: simple time difference
    gap = currentCarRaceTime - leaderRaceTime;
  } else if (lapDifference > 0) {
    // Leader is ahead by laps: use average lap time to estimate gap
    const leaderAvgLapTime =
      leader.lapTimes.length > 0
        ? leader.lapTimes.reduce((sum, time) => sum + time, 0) /
          leader.lapTimes.length
        : 60; // Default estimate if no lap data

    // Add (lapDifference * avg lap time) to the basic time difference
    gap =
      currentCarRaceTime -
      leaderRaceTime +
      lapDifference * leaderAvgLapTime;
  } else {
    // Leader is behind by laps (shouldn't happen, but just in case)
    gap = currentCarRaceTime - leaderRaceTime;
  }

  // Return the exact calculated gap without any minimum enforcement
  return gap;
}

function formatGapText(gapInSeconds) {
  if (gapInSeconds === null || gapInSeconds < 0) {
    return "+0.000s";
  }

  // Display the exact gap including true zeros (like in real F1)
  if (gapInSeconds < 60) {
    return `+${gapInSeconds.toFixed(3)}s`;
  }

  const minutes = Math.floor(gapInSeconds / 60);
  const seconds = (gapInSeconds % 60).toFixed(3);
  return `+${minutes}:${seconds.padStart(6, "0")}`;
}

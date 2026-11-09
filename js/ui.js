// Update UI
function updateUI() {
  const speedValue = Math.round(player.speed * 20);

  // Use player position from finalRaceStandings if race is complete
  const playerPosition = raceComplete ? player.racePosition : player.racePosition;

  // Update existing UI
  document.getElementById("speed").textContent = speedValue + " km/h";
  document.getElementById(
    "lap"
  ).textContent = `${currentLap}/${totalLaps}`;
  document.getElementById("position").textContent = `${
    playerPosition
  }/${aiCars.length + 1}`;

  // Update broadcast bar
  document.getElementById("speedDisplay").textContent =
    speedValue + " KM/H";
  document.getElementById(
    "currentLapDisplay"
  ).textContent = `${currentLap}/${totalLaps}`;
  document.getElementById(
    "positionDisplay"
  ).textContent = `P${playerPosition}`;

  // Update nitro bar
  const nitroPercentage = (player.nitro / player.maxNitro) * 100;
  document.getElementById("nitroBar").style.width = `${nitroPercentage}%`;

  // Create a smooth color gradient based on nitro level
  // From red (0% nitro/empty) to blue (100% nitro/full)
  const nitroRedComponent = Math.floor((100 - nitroPercentage) / 100 * 255);
  const nitroBlueComponent = Math.floor(nitroPercentage / 100 * 255);
  document.getElementById("nitroBar").style.background = `rgb(${nitroRedComponent}, 0, ${nitroBlueComponent})`;
  

  // Update tire wear bar (reverse - starts full, decreases as tires wear)
  const tireCondition = Math.max(0, 100 - player.tireWear);
  document.getElementById("tireBar").style.width = `${tireCondition}%`;
  
  // Create a smooth color gradient based on tire condition
  // From green (100% condition) to red (0% condition)
  const greenComponent = Math.floor((tireCondition / 100) * 255);
  const redComponent = Math.floor((1 - tireCondition / 100) * 255);
  document.getElementById("tireBar").style.background = `rgb(${redComponent}, ${greenComponent}, 0)`;

  // Fuel load: full tank is heavy, an empty one leaves the car limping
  const fuelBar = document.getElementById("fuelBar");
  if (fuelBar) {
    const fuel = Math.max(0, Math.min(100, player.fuel ?? 100));
    fuelBar.style.width = `${fuel}%`;
    fuelBar.style.background = fuel < 15 ? "rgb(255, 80, 40)" : "rgb(255, 170, 40)";
  }
  const pitStatus = document.getElementById("pitStatus");
  if (pitStatus) {
    const text = typeof pitStatusText === "function" ? pitStatusText(player) : "";
    pitStatus.textContent = text;
    pitStatus.style.display = text ? "block" : "none";
  }

  // Update lap time displays
  if (gameRunning) {
    // Current lap time
    const currentTime = gameNow();
    if (lapStartTime > 0) {
      currentLapTime = (currentTime - lapStartTime) / 1000;
      const lapMinutes = Math.floor(currentLapTime / 60);
      const lapSeconds = (currentLapTime % 60).toFixed(3);
      document.getElementById(
        "currentLapTimeDisplay"
      ).textContent = `${lapMinutes}:${lapSeconds.padStart(6, "0")}`;
    }

    // Best lap time for current race
    if (bestLapTime < Number.MAX_VALUE) {
      const bestLapMinutes = Math.floor(bestLapTime / 60);
      const bestLapSeconds = (bestLapTime % 60).toFixed(3);
      document.getElementById(
        "bestLapTimeDisplay"
      ).textContent = `${bestLapMinutes}:${bestLapSeconds.padStart(
        6,
        "0"
      )}`;
    } else {
      document.getElementById("bestLapTimeDisplay").textContent = "-:--:---";
    }
    
    // All-time lap record
    if (lapRecord < Number.MAX_VALUE) {
      const recordMinutes = Math.floor(lapRecord / 60);
      const recordSeconds = (lapRecord % 60).toFixed(3);
      document.getElementById(
        "lapRecordDisplay"
      ).textContent = `${recordMinutes}:${recordSeconds.padStart(
        6,
        "0"
      )}`;
    } else {
      document.getElementById("lapRecordDisplay").textContent = "-:--:---";
    }

    // Race time
    const raceElapsed = (currentTime - raceStartTime) / 1000;
    const raceMinutes = Math.floor(raceElapsed / 60);
    const raceSeconds = (raceElapsed % 60).toFixed(1);
    document.getElementById(
      "raceTimeDisplay"
    ).textContent = `${raceMinutes}:${raceSeconds.padStart(4, "0")}`;
  }

  // Update damage bar
  const totalDamage =
    player.damage.speed +
    player.damage.acceleration +
    player.damage.handling +
    player.damage.braking;
  const damagePercentage = Math.min(100, (totalDamage / 200) * 100); // Max damage shown at 200 total points
  document.getElementById(
    "damageBar"
  ).style.width = `${damagePercentage}%`;
  
  // Create a smooth color gradient based on damage level
  // From green (0% damage) to red (100% damage)
  const dmgGreenComponent = Math.floor((100 - damagePercentage) / 100 * 255);
  const dmgRedComponent = Math.floor(damagePercentage / 100 * 255);
  document.getElementById("damageBar").style.background = `rgb(${dmgRedComponent}, ${dmgGreenComponent}, 0)`;

  if (gameRunning) {
    const elapsed = (gameNow() - raceStartTime) / 1000;
    const minutes = Math.floor(elapsed / 60);
    const seconds = Math.floor(elapsed % 60);
    const milliseconds = Math.floor((elapsed % 1) * 1000);

    // Update existing timer with thousandths precision
    document.getElementById("time").textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;

    // Update broadcast timer with thousandths precision
    document.getElementById(
      "raceTimeDisplay"
    ).textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;

    // Check if ghosting is active for the player
    const minCheckpointsForCollisions = 2;
    const maxGhostingTime = 15;
    const playerGhosted =
      player.lapsCompleted === 0 &&
      player.currentCheckpoint <= minCheckpointsForCollisions &&
      elapsed <= maxGhostingTime;

    // Update ghosting indicator
    const ghostingIndicator =
      document.getElementById("ghostingIndicator");
    if (playerGhosted) {
      if (!ghostingIndicator) {
        // Create ghosting indicator if it doesn't exist
        const indicator = document.createElement("div");
        indicator.id = "ghostingIndicator";
        indicator.style.cssText = `
                      position: absolute;
                      top: 20px;
                      left: 50%;
                      transform: translateX(-50%);
                      background: rgba(0, 123, 255, 0.9);
                      color: white;
                      padding: 8px 12px;
                      border-radius: 4px;
                      font-family: 'Orbitron', monospace;
                      font-size: 14px;
                      font-weight: bold;
                      border: 2px solid #0080ff;
                      animation: ghostPulse 2s infinite;
                      z-index: 1000;
                  `;
        indicator.textContent = "COLLISION PROTECTION ACTIVE";
        document.body.appendChild(indicator);

        // Add CSS animation if not already added
        if (!document.getElementById("ghostingAnimation")) {
          const style = document.createElement("style");
          style.id = "ghostingAnimation";
          style.textContent = `
                          @keyframes ghostPulse {
                              0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
                              50% { opacity: 0.7; transform: translateX(-50%) scale(1.05); }
                          }
                      `;
          document.head.appendChild(style);
        }
      }
    } else if (ghostingIndicator) {
      // Remove ghosting indicator when no longer active
      ghostingIndicator.remove();
    }
  }
}

// Show race complete screen
function showRaceComplete() {
  // Calculate final race time from player's total lap times
  let finalRaceTime = player.totalRaceTime;
  // Add final lap time if it was in progress
  if (player.currentLapStartTime > 0) {
    const finalLapTime = (gameNow() - player.currentLapStartTime) / 1000;
    finalRaceTime += finalLapTime;
  }

  currentRaceTime = finalRaceTime; // Store for leaderboard
  const minutes = Math.floor(finalRaceTime / 60);
  const seconds = (finalRaceTime % 60).toFixed(3);

  document.getElementById("finalPos").textContent = `${
    player.racePosition
  }/${aiCars.length + 1}`;
  document.getElementById(
    "finalTime"
  ).textContent = `${minutes}:${seconds.padStart(6, "0")}`;

  // Display best lap time
  if (bestLapTime < Number.MAX_VALUE) {
    const bestLapMinutes = Math.floor(bestLapTime / 60);
    const bestLapSeconds = (bestLapTime % 60).toFixed(3);
    document.getElementById(
      "bestLapTime"
    ).textContent = `${bestLapMinutes}:${bestLapSeconds.padStart(
      6,
      "0"
    )}`;
  } else {
    document.getElementById("bestLapTime").textContent = "No valid lap";
  }
  
  // Display lap record
  if (lapRecord < Number.MAX_VALUE) {
    const recordMinutes = Math.floor(lapRecord / 60);
    const recordSeconds = (lapRecord % 60).toFixed(3);
    document.getElementById(
      "lapRecordTime"
    ).textContent = `${recordMinutes}:${recordSeconds.padStart(
      6,
      "0"
    )}`;
  } else {
    document.getElementById("lapRecordTime").textContent = "No record set";
  }

  // Show leaderboard at race end
  updateLeaderboardDisplay();

  // Also update the leaderboard in the race complete dialog
  updateRaceCompleteLeaderboard();

  // Calculate position in leaderboard and splits
  const sortedLeaderboard = getCurrentConditionsLeaderboard();
  const candidateEntry = { position: player.racePosition, time: currentRaceTime };
  const isNewRecord =
    sortedLeaderboard.length < LEADERBOARD_SIZE ||
    compareRaceEntries(candidateEntry, sortedLeaderboard[sortedLeaderboard.length - 1]) < 0;
  const recordTime =
    sortedLeaderboard.length > 0 ? Math.min(...sortedLeaderboard.map((entry) => entry.time)) : undefined;
  const beatsBestResult =
    sortedLeaderboard.length > 0 && compareRaceEntries(candidateEntry, sortedLeaderboard[0]) < 0;

  if (isNewRecord) {
    if (beatsBestResult) {
      // New fastest time
      document.getElementById("newRecordText").textContent =
        "NEW BEST RESULT";
      document.getElementById("newRecordText").style.display = "block";
    } else if (sortedLeaderboard.length < LEADERBOARD_SIZE) {
      // Made it to top 10
      document.getElementById("newRecordText").textContent =
        "LEADERBOARD POSITION!";
      document.getElementById("newRecordText").style.display = "block";
    } else {
      // Beat previous 10th place
      document.getElementById("newRecordText").textContent =
        "LEADERBOARD ENTRY!";
      document.getElementById("newRecordText").style.display = "block";
    }
    document.getElementById("nameInputModal").style.display = "block";
    document.getElementById("raceComplete").style.display = "none";
  } else {
    // Calculate leaderboard position if this time was added
    let position = 1;
    for (const entry of sortedLeaderboard) {
      if (compareRaceEntries(candidateEntry, entry) > 0) {
        position++;
      } else {
        break;
      }
    }

    // Calculate split from record
    if (recordTime) {
      const split = currentRaceTime - recordTime;
      const splitSign = split < 0 ? "-" : "+";
      const absoluteSplit = Math.abs(split);
      const splitMinutes = Math.floor(absoluteSplit / 60);
      const splitSeconds = (absoluteSplit % 60).toFixed(3);
      const splitText =
        splitMinutes > 0
          ? `${splitSign}${splitMinutes}:${splitSeconds.padStart(6, "0")}`
          : `${splitSign}${splitSeconds}s`;

      document.getElementById(
        "newRecordText"
      ).textContent = `Leaderboard Position: ${position} | ${splitText} from fastest time`;
    } else {
      document.getElementById(
        "newRecordText"
      ).textContent = `Leaderboard Position: ${position}`;
    }
    document.getElementById("newRecordText").style.color =
      "var(--text-secondary)";
    document.getElementById("newRecordText").style.display = "block";
    document.getElementById("raceComplete").style.display = "block";
  }
}

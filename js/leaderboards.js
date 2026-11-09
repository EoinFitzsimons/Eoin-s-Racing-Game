// Leaderboard system
let leaderboard = JSON.parse(
  localStorage.getItem("circuitRacerLeaderboard") || "[]"
);

const LEADERBOARD_SIZE = 10;

// Records are kept per circuit; entries saved before circuits existed belong to the original circuit
function raceConditionsKey(entry) {
  return `${entry.circuit || circuits[0].id}|${entry.weather || "clear"}|${entry.difficulty || "medium"}`;
}

function compareRaceEntries(a, b) {
  const positionA = Number.isFinite(a.position) ? a.position : Number.MAX_SAFE_INTEGER;
  const positionB = Number.isFinite(b.position) ? b.position : Number.MAX_SAFE_INTEGER;
  return positionA - positionB || a.time - b.time;
}

// Keeps the best results for each weather and difficulty combination
function trimLeaderboard(entries) {
  const counts = {};
  return [...entries].sort(compareRaceEntries).filter((entry) => {
    const key = raceConditionsKey(entry);
    counts[key] = (counts[key] || 0) + 1;
    return counts[key] <= LEADERBOARD_SIZE;
  });
}

function getCurrentConditionsLeaderboard() {
  const currentKey = raceConditionsKey({ circuit: track.id, weather: gameWeather, difficulty: gameDifficulty });
  return leaderboard.filter((entry) => raceConditionsKey(entry) === currentKey).sort(compareRaceEntries);
}

function getConditionsLabel() {
  const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);
  return `${track.name}: ${capitalise(gameWeather)}, ${capitalise(gameDifficulty)}`;
}

function escapeHtml(value) {
  const replacements = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value ?? "").replace(/[&<>"']/g, (c) => replacements[c]);
}

leaderboard = trimLeaderboard(leaderboard);

function saveLeaderboardEntry() {
  const playerName = document
    .getElementById("playerNameInput")
    .value.trim();
  if (playerName === "") {
    alert("Please enter your name!");
    return;
  }

  const entry = {
    name: playerName,
    time: currentRaceTime,
    position: player.racePosition,
    date: new Date().toLocaleDateString(),
    circuit: track.id,
    weather: gameWeather, // Add weather information
    difficulty: gameDifficulty, // Add difficulty information too
    team: getSelectedTeamName() // Add team information
  };

  leaderboard.push(entry);
  leaderboard = trimLeaderboard(leaderboard);

  localStorage.setItem(
    "circuitRacerLeaderboard",
    JSON.stringify(leaderboard)
  );
  updateLeaderboardDisplay();
  updateRaceCompleteLeaderboard();

  // Clear the input field
  document.getElementById("playerNameInput").value = "";

  document.getElementById("nameInputModal").style.display = "none";
  document.getElementById("raceComplete").style.display = "block";
}

function skipLeaderboard() {
  document.getElementById("nameInputModal").style.display = "none";
  document.getElementById("raceComplete").style.display = "block";
}

// Time Trial Leaderboard system
let timeTrialLeaderboard = JSON.parse(
  localStorage.getItem("circuitRacerTimeTrialLeaderboard") || "[]"
);

function saveTimeTrialRecord(lapData) {
  // Create leaderboard entry
  const entry = {
    name: lapData.playerName,
    teamName: lapData.teamName,
    time: lapData.lapTime,
    weather: lapData.weather,
    difficulty: lapData.difficulty,
    date: new Date().toLocaleDateString(),
    track: lapData.track || circuits[0].name,
    circuit: track.id
  };

  // Add to time trial leaderboard
  timeTrialLeaderboard.push(entry);
  
  // Sort by best time (fastest first)
  timeTrialLeaderboard.sort((a, b) => a.time - b.time);
  
  // Keep top 20 records
  timeTrialLeaderboard = timeTrialLeaderboard.slice(0, 20);

  // Save to localStorage
  localStorage.setItem(
    "circuitRacerTimeTrialLeaderboard",
    JSON.stringify(timeTrialLeaderboard)
  );
  
  // Update display
  updateTimeTrialLeaderboardDisplay();
}

function updateTimeTrialLeaderboardDisplay() {
  const listElement = document.getElementById("timeTrialLeaderboardList");
  
  if (timeTrialLeaderboard.length === 0) {
    listElement.innerHTML = `
      <div class="time-trial-entry" style="text-align: center; color: var(--text-secondary);">
        Complete a time trial to see your best times here!
      </div>
    `;
    return;
  }

  let html = '';
  timeTrialLeaderboard.forEach((entry, index) => {
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

function clearTimeTrialLeaderboard() {
  if (confirm("Are you sure you want to clear all time trial records? This cannot be undone.")) {
    timeTrialLeaderboard = [];
    localStorage.removeItem("circuitRacerTimeTrialLeaderboard");
    updateTimeTrialLeaderboardDisplay();
  }
}

function exportTimeTrialLeaderboard() {
  if (timeTrialLeaderboard.length === 0) {
    alert("No time trial records to export!");
    return;
  }

  const exportData = {
    version: "1.0",
    type: "time-trial-leaderboard",
    records: timeTrialLeaderboard,
    exportDate: new Date().toISOString()
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `time-trial-leaderboard-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}

function importTimeTrialLeaderboard() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validate imported data
        if (!importData.records || !Array.isArray(importData.records)) {
          alert('Invalid time trial leaderboard file format!');
          return;
        }
        
        // Merge with existing records
        const newRecords = importData.records.filter(record => 
          record &&
          typeof record.name === 'string' &&
          record.name.trim() !== '' &&
          typeof record.time === 'number' &&
          Number.isFinite(record.time) &&
          record.time > 0
        );
        
        timeTrialLeaderboard = [...timeTrialLeaderboard, ...newRecords];
        
        // Sort and keep top 20
        timeTrialLeaderboard.sort((a, b) => a.time - b.time);
        timeTrialLeaderboard = timeTrialLeaderboard.slice(0, 20);
        
        // Save and update display
        localStorage.setItem(
          "circuitRacerTimeTrialLeaderboard",
          JSON.stringify(timeTrialLeaderboard)
        );
        updateTimeTrialLeaderboardDisplay();
        
        alert(`Successfully imported ${newRecords.length} time trial records!`);
        
      } catch (error) {
        alert('Error reading time trial leaderboard file: ' + error.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// Difficulty selection functionality
function setDifficulty(level) {
  // Update the game difficulty
  gameDifficulty = level;
  
  // Update UI
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(level + 'Btn').classList.add('active');
  
  // Update description
  const descriptionElement = document.getElementById('difficultyDescription');
  if (level === 'easy') {
    descriptionElement.textContent = 'Beginner friendly. Collisions disabled. AI makes more mistakes and has reduced performance.';
  } else if (level === 'medium') {
    descriptionElement.textContent = 'Standard race settings. AI makes occasional mistakes. Collisions enabled.';
  } else if (level === 'hard') {
    descriptionElement.textContent = 'Challenge mode. AI doesn\'t make mistakes and has enhanced performance. Collisions enabled.';
  }

  updateLeaderboardDisplay();
}

// Weather selection functionality
function setWeather(type) {
  // Update the game weather
  gameWeather = type;
  trackLayer = null;
  
  // Update UI
  document.querySelectorAll('.weather-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(type + 'Btn').classList.add('active');
  
  // Update description
  const descriptionElement = document.getElementById('weatherDescription');
  if (type === 'clear') {
    descriptionElement.textContent = 'Perfect racing conditions. Optimal grip and visibility.';
  } else if (type === 'rain') {
    descriptionElement.textContent = 'Wet track conditions. Reduced grip and limited visibility. Careful with acceleration and braking.';
  } else if (type === 'storm') {
    descriptionElement.textContent = 'Severe weather. Heavy rain with very poor visibility. Extremely challenging driving conditions.';
  }
  
  // Initialize rain particles if weather has particles
  if (weatherEffects[type].particles) {
    initializeRainParticles();
  }

  updateLeaderboardDisplay();
}

// Time Trial mode selection functionality
function toggleTimeTrialMode() {
  isTimeTrialMode = !isTimeTrialMode;
  updateModeUI();
}

function setTimeTrialMode(enabled) {
  isTimeTrialMode = enabled;
  updateModeUI();
}

function updateModeUI() {
  // Update UI
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const timeTrialControls = document.getElementById('timeTrialControls');
  const difficultySelector = document.querySelector('.difficulty-selector');
  const objectiveText = document.getElementById('objectiveText');
  
  if (isTimeTrialMode) {
    document.getElementById('timeTrialModeBtn').classList.add('active');
    if (timeTrialControls) {
      timeTrialControls.style.display = 'block';
    }
    // Hide difficulty selector in time trial mode
    if (difficultySelector) {
      difficultySelector.style.display = 'none';
    }
    // Update objective text for time trial
    if (objectiveText) {
      objectiveText.innerHTML = '<strong>Objective:</strong> Set the fastest single lap from a standing start!';
    }
    // Update position display to show time trial best times
    updatePositionDisplay([]);
  } else {
    document.getElementById('raceModeBtn').classList.add('active');
    if (timeTrialControls) {
      timeTrialControls.style.display = 'none';
    }
    // Show difficulty selector in race mode
    if (difficultySelector) {
      difficultySelector.style.display = 'block';
    }
    // Update objective text for race mode
    if (objectiveText) {
      objectiveText.innerHTML = '<strong>Objective:</strong> Complete 5 laps as fast as possible!';
    }
    // Reset position display for race mode
    updatePositionDisplay([]);
  }
}

function updateRaceCompleteLeaderboard() {
  const list = document.getElementById("raceCompleteLeaderboard");
  list.innerHTML = "";

  if (list.previousElementSibling) {
    list.previousElementSibling.textContent = `RECORD TIMES (${getConditionsLabel()})`;
  }

  getCurrentConditionsLeaderboard().forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "leaderboard-entry";
    if (
      entry.time === currentRaceTime &&
      entry.name === document.getElementById("playerNameInput").value
    ) {
      div.className += " current-record";
    }

    const minutes = Math.floor(entry.time / 60);
    const seconds = (entry.time % 60).toFixed(3);

    // Shorten car name to first two words if it's too long
    let displayName = entry.name;
    const words = displayName.split(" ");
    if (words.length > 2) {
      displayName = words.slice(0, 2).join(" ");
    }

    // Get weather info with default for older entries
    const weatherDisplay = getWeatherDisplay(entry.weather || 'clear');
    const difficultyDisplay = getDifficultyDisplay(entry.difficulty || 'medium');
    const teamDisplay = getTeamDisplayName(entry.team);

    div.innerHTML = `
              <span style="width: 20px; display: inline-block;">${index + 1}.</span>
              <span style="width: 90px; display: inline-block;">${escapeHtml(displayName)}</span>
              <span style="width: 40px; display: inline-block; font-size: 0.8em; color: var(--accent-color);">${escapeHtml(teamDisplay)}</span>
              <span style="width: 80px; display: inline-block;">${minutes}:${seconds.padStart(6, "0")}</span>
              <span style="width: 30px; display: inline-block; font-size: 0.9em;">P${escapeHtml(entry.position ?? "-")}</span>
              <span style="width: 30px; display: inline-block; font-size: 0.8em; color: var(--text-secondary);">${difficultyDisplay}</span>
          `;
    list.appendChild(div);
  });
}

function updateLeaderboardDisplay() {
  const list = document.getElementById("leaderboardList");
  list.innerHTML = "";

  if (list.previousElementSibling) {
    list.previousElementSibling.textContent = `RECORD TIMES (${getConditionsLabel()})`;
  }

  getCurrentConditionsLeaderboard().forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "leaderboard-entry";
    if (
      entry.time === currentRaceTime &&
      entry.name === document.getElementById("playerNameInput").value
    ) {
      div.className += " current-record";
    }

    const minutes = Math.floor(entry.time / 60);
    const seconds = (entry.time % 60).toFixed(3);

    // Truncate names that are too long (over 12 characters)
    let displayName = entry.name;
    if (displayName.length > 10) {
      displayName = displayName.substring(0, 8) + "...";
    }

    // Get weather info with default for older entries
    const weatherDisplay = getWeatherDisplay(entry.weather || 'clear');
    const difficultyDisplay = getDifficultyDisplay(entry.difficulty || 'medium');
    const teamDisplay = getTeamDisplayName(entry.team);

    div.innerHTML = `
              <span style="width: 15px; display: inline-block;">${index + 1}.</span>
              <span style="width: 65px; display: inline-block;">${escapeHtml(displayName)}</span>
              <span style="width: 30px; display: inline-block; font-size: 0.8em; color: var(--accent-color);">${escapeHtml(teamDisplay)}</span>
              <span style="width: 70px; display: inline-block;">${minutes}:${seconds.padStart(6, "0")}</span>
              <span style="width: 25px; display: inline-block; font-size: 0.8em;">P${escapeHtml(entry.position ?? "-")}</span>
              <span style="width: 25px; display: inline-block; font-size: 0.7em; color: var(--text-secondary);">${difficultyDisplay}</span>
          `;
    list.appendChild(div);
  });
}

// Helper functions for leaderboard display
function getWeatherDisplay(weather) {
  switch(weather) {
    case 'clear': return '';
    case 'rain': return '(w)';
    case 'storm': return '(vw)';
    default: return '';
  }
}

function getDifficultyDisplay(difficulty) {
  switch(difficulty) {
    case 'easy': return 'E';
    case 'medium': return 'M';
    case 'hard': return 'H';
    default: return 'M';
  }
}

function getTeamDisplayName(teamName) {
  if (!teamName) return '';
  // Create short team codes for display
  const teamCodes = {
    'Emerald Isle Racing': 'EIR',
    'Dragon Force Motorsport': 'DFM',
    'Highland Racing Team': 'HRT',
    'Britannia Motors': 'BRT',
    'Tricolore Racing': 'TCR',
    'Kaiser Motorsport': 'KMS',
    'Iberian Speed': 'IBS',
    'Veloce Italia': 'VIT',
    'Adriatic Racing': 'ADR',
    'Liberty Racing': 'LBR',
    'Rising Sun Motors': 'RSM',
    'Celestial Motors': 'CEM',
    'Maharaja Motors': 'MHJ',
    'Samba Racing Team': 'SRT',
    'Velocidad Venezuela': 'VVR',
    'Regina Curse': 'RGC'
  };
  return teamCodes[teamName] || teamName.substring(0, 3).toUpperCase();
}

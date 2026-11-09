// Team themes configuration with high contrast
const teamThemes = {
  // Croatian Team - Tangerine Tango with Azure accents
  adriatic_racing: {
    "--primary-color": "#FF8C42",
    "--primary-color-rgb": "255, 140, 66",
    "--accent-color": "#0066CC",
    "--accent-color-rgb": "0, 102, 204",
    "--primary-color-transparent": "rgba(255, 140, 66, 0.15)",
    "--accent-color-transparent": "rgba(0, 102, 204, 0.1)",
    "--bg-primary": "#1a0a0a",
    "--bg-secondary": "#2a1a1a",
    "--text-primary": "#ffffff",
    "--text-secondary": "#ffcc88",
    "--border-glow": "rgba(255, 140, 66, 0.4)",
  },
  // English Team - Midnight Blue with Silver accents
  britannia_motors: {
    "--primary-color": "#191970",
    "--primary-color-rgb": "25, 25, 112",
    "--accent-color": "#C0C0C0",
    "--accent-color-rgb": "192, 192, 192",
    "--primary-color-transparent": "rgba(25, 25, 112, 0.15)",
    "--accent-color-transparent": "rgba(192, 192, 192, 0.1)",
    "--bg-primary": "#0a0a1a",
    "--bg-secondary": "#1a1a2a",
    "--text-primary": "#ffffff",
    "--text-secondary": "#aaaaff",
    "--border-glow": "rgba(25, 25, 112, 0.4)",
  },
  // Chinese Team - Celadon with Gold accents
  celestial_motors: {
    "--primary-color": "#2fa889",
    "--primary-color-rgb": "47, 168, 137",
    "--accent-color": "#FFDF00",
    "--accent-color-rgb": "255, 223, 0",
    "--primary-color-transparent": "rgba(47, 168, 137, 0.15)",
    "--accent-color-transparent": "rgba(255, 223, 0, 0.1)",
    "--bg-primary": "#1a0a0a",
    "--bg-secondary": "#2a2a1a",
    "--text-primary": "#ffffff",
    "--text-secondary": "#88ffcc",
    "--border-glow": "rgba(47, 168, 137, 0.4)",
  },
  // Welsh Team - Burgundy with Gold accents
  dragon_force: {
    "--primary-color": "#8e2043",
    "--primary-color-rgb": "142, 32, 67",
    "--accent-color": "#FFD700",
    "--accent-color-rgb": "255, 215, 0",
    "--primary-color-transparent": "rgba(142, 32, 67, 0.15)",
    "--accent-color-transparent": "rgba(255, 215, 0, 0.1)",
    "--bg-primary": "#1a0a0a",
    "--bg-secondary": "#2a1a1a",
    "--text-primary": "#ffffff",
    "--text-secondary": "#ffaaaa",
    "--border-glow": "rgba(142, 32, 67, 0.4)",
  },
  // Irish Team - Shamrock with Amber accents
  emerald_isle: {
    "--primary-color": "#169873",
    "--primary-color-rgb": "22, 152, 115",
    "--accent-color": "#FF8C00",
    "--accent-color-rgb": "255, 140, 0",
    "--primary-color-transparent": "rgba(22, 152, 115, 0.15)",
    "--accent-color-transparent": "rgba(255, 140, 0, 0.1)",
    "--bg-primary": "#0a1a0a",
    "--bg-secondary": "#1a2a1a",
    "--text-primary": "#ffffff",
    "--text-secondary": "#88ff88",
    "--border-glow": "rgba(22, 152, 115, 0.4)",
  },
  // Scottish Team - Sapphire with White accents
  highland_racing: {
    "--primary-color": "#0F52BA",
    "--primary-color-rgb": "15, 82, 186",
    "--accent-color": "#FFFFFF",
    "--accent-color-rgb": "255, 255, 255",
    "--primary-color-transparent": "rgba(15, 82, 186, 0.15)",
    "--accent-color-transparent": "rgba(255, 255, 255, 0.1)",
    "--bg-primary": "#0a0a1a",
    "--bg-secondary": "#1a1a2a",
    "--text-primary": "#ffffff",
    "--text-secondary": "#88aaff",
    "--border-glow": "rgba(15, 82, 186, 0.4)",
  },
  // Spanish Team - Sienna with Amber accents
  iberian_speed: {
    "--primary-color": "#A0522D",
    "--primary-color-rgb": "160, 82, 45",
    "--accent-color": "#FFC400",
    "--accent-color-rgb": "255, 196, 0",
    "--primary-color-transparent": "rgba(160, 82, 45, 0.15)",
    "--accent-color-transparent": "rgba(255, 196, 0, 0.1)",
    "--bg-primary": "#0a0a0a",
    "--bg-secondary": "#2a1a1a",
    "--text-primary": "#ffffff",
    "--text-secondary": "#ffaaaa",
    "--border-glow": "rgba(160, 82, 45, 0.4)",
  },
  // German Team - Ghost White with Silver accents
  kaiser_motorsport: {
    "--primary-color": "#F7F7FF",
    "--primary-color-rgb": "247, 247, 255",
    "--accent-color": "#B3B3B3",
    "--accent-color-rgb": "179, 179, 179",
    "--primary-color-transparent": "rgba(247, 247, 255, 0.15)",
    "--accent-color-transparent": "rgba(179, 179, 179, 0.1)",
    "--bg-primary": "#1a0a0a",
    "--bg-secondary": "#2a1a1a",
    "--text-primary": "#000000",
    "--text-secondary": "#222222",
    "--border-glow": "rgba(247, 247, 255, 0.4)",
  },
  // US Team - Obsidian with Platinum accents
  liberty_racing: {
    "--primary-color": "#0d0d0d",
    "--primary-color-rgb": "13, 13, 13",
    "--accent-color": "#E5E4E2",
    "--accent-color-rgb": "229, 228, 226",
    "--primary-color-transparent": "rgba(13, 13, 13, 0.15)",
    "--accent-color-transparent": "rgba(229, 228, 226, 0.1)",
    "--bg-primary": "#0a0a1a",
    "--bg-secondary": "#1a1a2a",
    "--text-primary": "#ffffff",
    "--text-secondary": "#aaaaaa",
    "--border-glow": "rgba(13, 13, 13, 0.4)",
  },
  // Indian Team - Turmeric with Ivory accents
  maharaja_motors: {
    "--primary-color": "#ffa347",
    "--primary-color-rgb": "255, 163, 71",
    "--accent-color": "#FFFFF0",
    "--accent-color-rgb": "255, 255, 240",
    "--primary-color-transparent": "rgba(255, 163, 71, 0.15)",
    "--accent-color-transparent": "rgba(255, 255, 240, 0.1)",
    "--bg-primary": "#1a1a0a",
    "--bg-secondary": "#2a2a1a",
    "--text-primary": "#ffffff",
    "--text-secondary": "#ffcc88",
    "--border-glow": "rgba(255, 163, 71, 0.4)",
  },
  // Brazilian Team - Electric Lime with Canary accents
  samba_racing: {
    "--primary-color": "#42d653",
    "--primary-color-rgb": "66, 214, 83",
    "--accent-color": "#FEDD00",
    "--accent-color-rgb": "254, 221, 0",
    "--primary-color-transparent": "rgba(66, 214, 83, 0.15)",
    "--accent-color-transparent": "rgba(254, 221, 0, 0.1)",
    "--bg-primary": "#0a1a0a",
    "--bg-secondary": "#1a2a1a",
    "--text-primary": "#ffffff",
    "--text-secondary": "#88ff88",
    "--border-glow": "rgba(66, 214, 83, 0.4)",
  },
  // Romanian Team - Fuchsia with Lavender accents
  regina_curse: {
    "--primary-color": "#FF77BC",
    "--primary-color-rgb": "255, 119, 188",
    "--accent-color": "#E6E6FA",
    "--accent-color-rgb": "230, 230, 250",
    "--primary-color-transparent": "rgba(255, 119, 188, 0.15)",
    "--accent-color-transparent": "rgba(230, 230, 250, 0.1)",
    "--bg-primary": "#1a0a0a",
    "--bg-secondary": "#2a1a2a",
    "--text-primary": "#ffffff",
    "--text-secondary": "#ffaad5",
    "--border-glow": "rgba(255, 119, 188, 0.4)",
  },
  // French Team - Turquoise with Pearl accents
  tricolore_racing: {
    "--primary-color": "#30D5C8",
    "--primary-color-rgb": "48, 213, 200",
    "--accent-color": "#F0EAD6",
    "--accent-color-rgb": "240, 234, 214",
    "--primary-color-transparent": "rgba(48, 213, 200, 0.15)",
    "--accent-color-transparent": "rgba(240, 234, 214, 0.1)",
    "--bg-primary": "#0a0a1a",
    "--bg-secondary": "#1a1a2a",
    "--text-primary": "#ffffff",
    "--text-secondary": "#88ffee",
    "--border-glow": "rgba(48, 213, 200, 0.4)",
  },
  // Japanese Team - Ruby with Pearl accents
  rising_sun: {
    "--primary-color": "#E0115F",
    "--primary-color-rgb": "224, 17, 95",
    "--accent-color": "#FFFFFF",
    "--accent-color-rgb": "255, 255, 255",
    "--primary-color-transparent": "rgba(224, 17, 95, 0.15)",
    "--accent-color-transparent": "rgba(255, 255, 255, 0.1)",
    "--bg-primary": "#1a0a0a",
    "--bg-secondary": "#2a1a2a",
    "--text-primary": "#ffffff",
    "--text-secondary": "#ffaaaa",
    "--border-glow": "rgba(224, 17, 95, 0.4)",
  },
  // Venezuelan Team - Canary with Cerulean accents
  velocidad_venezuela: {
    "--primary-color": "#FFEF00",
    "--primary-color-rgb": "255, 239, 0",
    "--accent-color": "#007BA7",
    "--accent-color-rgb": "0, 123, 167",
    "--primary-color-transparent": "rgba(255, 239, 0, 0.15)",
    "--accent-color-transparent": "rgba(0, 123, 167, 0.1)",
    "--bg-primary": "#1a0a0a",
    "--bg-secondary": "#2a1a2a",
    "--text-primary": "#000000",
    "--text-secondary": "#222222",
    "--border-glow": "rgba(255, 239, 0, 0.4)",
  },
  // Italian Team - Royal Purple with Scarlet accents
  veloce_italia: {
    "--primary-color": "#7851A9",
    "--primary-color-rgb": "120, 81, 169",
    "--accent-color": "#FF2400",
    "--accent-color-rgb": "255, 36, 0",
    "--primary-color-transparent": "rgba(120, 81, 169, 0.15)",
    "--accent-color-transparent": "rgba(255, 36, 0, 0.1)",
    "--bg-primary": "#1a0a0a",
    "--bg-secondary": "#2a2a1a",
    "--text-primary": "#ffffff",
    "--text-secondary": "#ddaaff",
    "--border-glow": "rgba(120, 81, 169, 0.4)",
  },
};

let selectedTeam = null;
let currentTeamIndex = 0;
const teams = [
  "adriatic_racing",
  "britannia_motors",
  "celestial_motors",
  "dragon_force",
  "emerald_isle",
  "highland_racing",
  "iberian_speed",
  "kaiser_motorsport",
  "liberty_racing",
  "maharaja_motors",
  "rising_sun",
  "samba_racing",
  "regina_curse",
  "tricolore_racing",
  "velocidad_venezuela",
  "veloce_italia",
];

// Team selection functionality
function initializeTeamSelection() {
  updateCarousel();
  populateTeamAttributes();
}

function populateTeamAttributes() {
  document.querySelectorAll(".team-card").forEach((card) => {
    const teamData = getTeamByName(teamKeyToName[card.getAttribute("data-team")]);
    if (!teamData) return;

    let container = card.querySelector(".team-attributes");
    if (!container) {
      container = document.createElement("div");
      container.className = "team-attributes";
      card.appendChild(container);
    }

    const total = attributeDefinitions.reduce((sum, definition) => sum + (teamData.attributes[definition.key] || 0), 0);
    const bars = attributeDefinitions
      .map((definition) => {
        const value = teamData.attributes[definition.key] ?? 0;
        return `
          <div class="attribute-row" data-tip="${escapeHtml(definition.description)}" tabindex="0">
            <span class="attribute-name">${escapeHtml(definition.label)}</span>
            <div class="attribute-bar"><div class="attribute-fill" style="width: ${(value / 20) * 100}%"></div></div>
            <span class="attribute-value">${value}</span>
          </div>`;
      })
      .join("");

    container.innerHTML = `
      <div class="attributes-title">Car &amp; Driver <span class="attributes-total">${total} pts</span></div>
      <div class="attributes-layout">
        <canvas class="attribute-radar" width="150" height="150" aria-label="Attribute radar chart"></canvas>
        <div class="attribute-bars">${bars}</div>
      </div>`;
    drawAttributeRadar(container.querySelector(".attribute-radar"), teamData);
  });
}

// Radar chart of the thirteen ratings, drawn in the team's colour
function drawAttributeRadar(radarCanvas, teamData) {
  const g = radarCanvas.getContext("2d");
  const size = radarCanvas.width;
  const centre = size / 2;
  const radius = size / 2 - 18;
  const count = attributeDefinitions.length;
  const angleFor = (index) => -Math.PI / 2 + (index / count) * Math.PI * 2;
  const pointFor = (index, value) => ({
    x: centre + Math.cos(angleFor(index)) * radius * value,
    y: centre + Math.sin(angleFor(index)) * radius * value,
  });

  g.clearRect(0, 0, size, size);
  [0.25, 0.5, 0.75, 1].forEach((ring) => {
    g.beginPath();
    for (let i = 0; i < count; i++) {
      const p = pointFor(i, ring);
      if (i === 0) g.moveTo(p.x, p.y);
      else g.lineTo(p.x, p.y);
    }
    g.closePath();
    g.strokeStyle = ring === 1 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)";
    g.lineWidth = 1;
    g.stroke();
  });
  g.strokeStyle = "rgba(255,255,255,0.12)";
  for (let i = 0; i < count; i++) {
    const p = pointFor(i, 1);
    g.beginPath();
    g.moveTo(centre, centre);
    g.lineTo(p.x, p.y);
    g.stroke();
  }

  g.beginPath();
  attributeDefinitions.forEach((definition, i) => {
    const p = pointFor(i, Math.max(0.05, (teamData.attributes[definition.key] ?? 0) / 20));
    if (i === 0) g.moveTo(p.x, p.y);
    else g.lineTo(p.x, p.y);
  });
  g.closePath();
  g.fillStyle = hexToRgba(teamData.color, 0.45);
  g.fill();
  g.strokeStyle = teamData.color;
  g.lineWidth = 2;
  g.stroke();

  g.fillStyle = "rgba(255,255,255,0.8)";
  g.font = "bold 8px Arial";
  g.textAlign = "center";
  g.textBaseline = "middle";
  attributeDefinitions.forEach((definition, i) => {
    const p = pointFor(i, 1.16);
    g.fillText(definition.short, p.x, p.y);
  });
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

function updateCarousel() {
  const teamCards = document.querySelectorAll(".team-card");
  const currentTeam = teams[currentTeamIndex];

  teamCards.forEach((card) => {
    const cardTeam = card.getAttribute("data-team");
    card.classList.remove("active", "prev", "next", "hidden");
    
    // Reset any custom styling from previous selections
    card.style.background = "";
    card.style.color = "";
    card.style.borderColor = "";
    card.style.boxShadow = "";
    
    // Reset any custom text styling
    const textElements = card.querySelectorAll(".team-name, .fact-label, .fact-value, .attributes-title, .attribute-name, .attribute-value");
    textElements.forEach(element => {
      element.style.color = "";
    });

    if (cardTeam === currentTeam) {
      card.classList.add("active");
    } else if (
      cardTeam ===
      teams[(currentTeamIndex - 1 + teams.length) % teams.length]
    ) {
      card.classList.add("prev");
    } else if (
      cardTeam === teams[(currentTeamIndex + 1) % teams.length]
    ) {
      card.classList.add("next");
    } else {
      card.classList.add("hidden");
    }
  });

  // Apply theme of current team
  applyTeamTheme(currentTeam);

  // Auto-select the current team
  selectCurrentTeam();

  // Update attributes display
  populateTeamAttributes();
}

function nextTeam() {
  currentTeamIndex = (currentTeamIndex + 1) % teams.length;
  updateCarousel();
}

function previousTeam() {
  currentTeamIndex = (currentTeamIndex - 1 + teams.length) % teams.length;
  updateCarousel();
}

function selectCurrentTeam() {
  selectedTeam = teams[currentTeamIndex];
  document.getElementById("proceedToRaceBtn").disabled = false;

  // Add selection visual feedback
  const activeCard = document.querySelector(".team-card.active");
  activeCard.style.borderColor = "var(--accent-color)";
  activeCard.style.boxShadow = "0 0 30px var(--border-glow)";
  
  // Check if this team has dark text (specifically kaiser_motorsport and velocidad_venezuela)
  const hasDarkText = selectedTeam === "kaiser_motorsport" || selectedTeam === "velocidad_venezuela";
  
  // Apply team-colored background to the active card with higher opacity for light teams
  if (hasDarkText) {
    // For teams with dark text, use a much lighter/stronger background
    activeCard.style.background = `linear-gradient(
      145deg,
      rgba(var(--primary-color-rgb), 0.75),
      rgba(var(--accent-color-rgb), 0.4)
    )`;
    // Fix the contrast for the attribute fill
    const attributeFills = activeCard.querySelectorAll(".attribute-fill");
    attributeFills.forEach(fill => {
      fill.style.background = `linear-gradient(90deg, var(--primary-color), var(--accent-color))`;
    });
  } else {
    // For teams with light text on dark background, keep more transparent
    activeCard.style.background = `linear-gradient(
      145deg,
      var(--primary-color-transparent),
      var(--accent-color-transparent)
    )`;
  }
  
  // Ensure text is readable - use the team's text color
  activeCard.style.color = "var(--text-primary)";
  
  // Update any additional text elements that might need contrast adjustment
  const teamTextElements = activeCard.querySelectorAll(".team-name, .fact-label, .attributes-title");
  teamTextElements.forEach(element => {
    element.style.color = "var(--text-primary)";
  });
  
  const teamValueElements = activeCard.querySelectorAll(".fact-value, .attribute-name, .attribute-value");
  teamValueElements.forEach(element => {
    element.style.color = "var(--text-secondary)";
  });
}

function applyTeamTheme(teamKey) {
  const theme = teamThemes[teamKey];
  const root = document.documentElement;

  Object.keys(theme).forEach((property) => {
    root.style.setProperty(property, theme[property]);
  });

  // Dark, very light or saturated liveries need adjusted text colours to stay readable on the dark UI
  const panelBackground = "#111111";
  const primary = theme["--primary-color"];
  root.style.setProperty("--primary-text-color", ensureContrast(primary, panelBackground));
  root.style.setProperty("--on-primary-text-color", readableTextOn(primary));
  root.style.setProperty(
    "--on-gradient-text-color",
    readableTextOn(mixColours(primary, theme["--accent-color"], 0.5))
  );
  root.classList.toggle("light-livery", relativeLuminance(primary) > 0.7);
  if (contrastRatio(theme["--text-primary"], theme["--bg-primary"]) < 4.5) {
    root.style.setProperty("--text-primary", "#ffffff");
  }
  if (contrastRatio(theme["--text-secondary"], theme["--bg-primary"]) < 4.5) {
    root.style.setProperty("--text-secondary", "#cccccc");
  }
}

function hexToRgb(hex) {
  const value = parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex(rgb) {
  return "#" + rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
}

function relativeLuminance(hex) {
  const weights = [0.2126, 0.7152, 0.0722];
  return hexToRgb(hex).reduce((sum, channel, i) => {
    const c = channel / 255;
    const linear = c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return sum + linear * weights[i];
  }, 0);
}

function contrastRatio(a, b) {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

function mixColours(a, b, weight) {
  const rgbA = hexToRgb(a);
  const rgbB = hexToRgb(b);
  return rgbToHex(rgbA.map((c, i) => c + (rgbB[i] - c) * weight));
}

function ensureContrast(colour, background) {
  let result = colour;
  for (let weight = 0.1; contrastRatio(result, background) < 4.5 && weight <= 1; weight += 0.1) {
    result = mixColours(colour, "#ffffff", weight);
  }
  return result;
}

function readableTextOn(background) {
  return contrastRatio("#ffffff", background) >= contrastRatio("#000000", background) ? "#ffffff" : "#000000";
}

function proceedToRace() {
  if (!selectedTeam) return;

  const teamName = teamKeyToName[selectedTeam];
  const teamData = aiTeams.find((team) => team.name === teamName);
  if (teamData) {
    // Set player car color to match selected team
    player.color = teamData.color;

    // Apply team attributes to the player's car
    applyPlayerTeamSetup(teamData.attributes);

    // Ensure lap timing and race progress tracking are properly initialized
    player.lapTimes = [];
    player.currentLapStartTime = 0;
    player.totalRaceTime = 0;
    player.checkpointTimes = {};
    player.calculatedTotalTime = 0;
  }

  // Hide broadcast bar on start screen
  document.querySelector(".broadcast-bar").style.display = "none";

  document.getElementById("teamSelectionScreen").style.display = "none";
  document.getElementById("startScreen").style.display = "flex";
}

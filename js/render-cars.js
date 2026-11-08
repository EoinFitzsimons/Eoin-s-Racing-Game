/**
 * Car Rendering System
 *
 * Each livery is painted once at high resolution into a sprite (body, wings, cockpit,
 * number and team code) and drawn rotated each frame. The wheels are drawn live so the
 * fronts can turn with the steering, followed by rain light, speed and damage effects.
 * Car-local units: +x is forwards, one unit is one world pixel for a 20 px car.
 */
const SPRITE_SCALE = 4;
const SPRITE_BOUNDS = { left: -20, top: -13, width: 42, height: 26 };
const carSprites = new Map();

function roundedRectPath(g, x, y, width, height, radius) {
  g.beginPath();
  if (typeof g.roundRect === "function") {
    g.roundRect(x, y, width, height, radius);
  } else {
    g.rect(x, y, width, height);
  }
}

function carBodyNumber(car) {
  return car === player || car.isPlayer ? "1" : String(aiCars.indexOf(car) + 2);
}

function traceCarSilhouette(g) {
  g.beginPath();
  g.moveTo(-14.6, -7);
  g.lineTo(-11.4, -7);
  g.lineTo(-11.4, -5.4);
  g.lineTo(3, -5.4);
  g.lineTo(6, -3);
  g.lineTo(13, -2);
  g.lineTo(13, -9.2);
  g.lineTo(16, -9.2);
  g.lineTo(17.2, 0);
  g.lineTo(16, 9.2);
  g.lineTo(13, 9.2);
  g.lineTo(13, 2);
  g.lineTo(6, 3);
  g.lineTo(3, 5.4);
  g.lineTo(-11.4, 5.4);
  g.lineTo(-11.4, 7);
  g.lineTo(-14.6, 7);
  g.closePath();
}

function paintCarSprite(g, car) {
  const colour = car.color;
  const light = lightenColor(colour, 28);
  const dark = shadeColor(colour, -38);
  const darker = shadeColor(colour, -60);
  const accent = readableTextOn(colour);

  // Soft ground shadow
  g.save();
  g.translate(1.4, 1.8);
  g.fillStyle = "rgba(0, 0, 0, 0.28)";
  traceCarSilhouette(g);
  g.fill();
  g.restore();

  // Floor and plank
  roundedRectPath(g, -12.6, -5.6, 20.4, 11.2, 1.6);
  g.fillStyle = "#17191c";
  g.fill();

  // Sidepods
  const podGradient = g.createLinearGradient(0, -5.4, 0, 5.4);
  podGradient.addColorStop(0, dark);
  podGradient.addColorStop(0.5, colour);
  podGradient.addColorStop(1, dark);
  g.fillStyle = podGradient;
  g.beginPath();
  g.moveTo(-10.4, -5.2);
  g.lineTo(2.6, -5.2);
  g.quadraticCurveTo(5.6, -4.4, 6.4, -2.4);
  g.lineTo(6.4, 2.4);
  g.quadraticCurveTo(5.6, 4.4, 2.6, 5.2);
  g.lineTo(-10.4, 5.2);
  g.quadraticCurveTo(-12, 3, -12, 0);
  g.quadraticCurveTo(-12, -3, -10.4, -5.2);
  g.closePath();
  g.fill();
  g.fillStyle = "rgba(0, 0, 0, 0.55)";
  g.fillRect(1.2, -5.1, 3.6, 1.5);
  g.fillRect(1.2, 3.6, 3.6, 1.5);

  // Engine cover and nose
  const spineGradient = g.createLinearGradient(0, -2.8, 0, 2.8);
  spineGradient.addColorStop(0, light);
  spineGradient.addColorStop(0.45, colour);
  spineGradient.addColorStop(1, darker);
  g.fillStyle = spineGradient;
  g.beginPath();
  g.moveTo(-11.8, -2.4);
  g.lineTo(5, -2.8);
  g.quadraticCurveTo(11, -2.2, 16.2, -1);
  g.quadraticCurveTo(17.4, 0, 16.2, 1);
  g.quadraticCurveTo(11, 2.2, 5, 2.8);
  g.lineTo(-11.8, 2.4);
  g.closePath();
  g.fill();
  g.fillStyle = accent === "#ffffff" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)";
  g.fillRect(-11.5, -0.45, 24, 0.9);

  // Front wing with endplates and flap line
  g.fillStyle = dark;
  g.fillRect(13.2, -8.8, 2.8, 17.6);
  g.fillStyle = "#1c1c1c";
  g.fillRect(12.9, -9.4, 3.4, 1);
  g.fillRect(12.9, 8.4, 3.4, 1);
  g.strokeStyle = "rgba(255,255,255,0.3)";
  g.lineWidth = 0.35;
  g.beginPath();
  g.moveTo(14.6, -8.4);
  g.lineTo(14.6, 8.4);
  g.stroke();

  // Rear wing with endplates and DRS slot
  g.fillStyle = dark;
  g.fillRect(-14.4, -6.6, 2.6, 13.2);
  g.fillStyle = "#1c1c1c";
  g.fillRect(-14.8, -7.2, 3.4, 1);
  g.fillRect(-14.8, 6.2, 3.4, 1);
  g.strokeStyle = "rgba(0,0,0,0.5)";
  g.beginPath();
  g.moveTo(-13.1, -6.2);
  g.lineTo(-13.1, 6.2);
  g.stroke();

  // Airbox, cockpit, halo and helmet
  roundedRectPath(g, -7.2, -1.5, 2.8, 3, 0.8);
  g.fillStyle = "#0e0e10";
  g.fill();
  g.fillStyle = "#0b0b0d";
  g.beginPath();
  g.ellipse(-2.6, 0, 3.6, 1.9, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#2c2e33";
  g.lineWidth = 0.55;
  g.beginPath();
  g.ellipse(-2.6, 0, 3.9, 2.25, 0, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = accent === "#ffffff" ? "#f2f2f2" : "#15213a";
  g.beginPath();
  g.arc(-2.2, 0, 1.55, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = accent === "#ffffff" ? colour : "#9fd4ff";
  g.beginPath();
  g.arc(-1.7, 0, 0.9, -Math.PI / 2, Math.PI / 2);
  g.fill();

  // Number on the nose, team code on the engine cover
  g.fillStyle = accent;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "bold 3.2px Arial";
  g.fillText(carBodyNumber(car), 9.6, 0.1);
  g.font = "bold 2.3px Arial";
  g.fillText(getTeamCode(car), -8.6, 0.1);
}

function getCarSprite(car) {
  const key = `${car.color}|${getTeamCode(car)}|${carBodyNumber(car)}`;
  let sprite = carSprites.get(key);
  if (!sprite) {
    sprite = document.createElement("canvas");
    sprite.width = SPRITE_BOUNDS.width * SPRITE_SCALE;
    sprite.height = SPRITE_BOUNDS.height * SPRITE_SCALE;
    const g = sprite.getContext("2d");
    g.scale(SPRITE_SCALE, SPRITE_SCALE);
    g.translate(-SPRITE_BOUNDS.left, -SPRITE_BOUNDS.top);
    paintCarSprite(g, car);
    carSprites.set(key, sprite);
  }
  return sprite;
}

function tyreBandColour() {
  return gameWeather === "clear" ? "#e3b505" : gameWeather === "rain" ? "#2ecc71" : "#2e86de";
}

function drawWheel(x, y, width, height, steer) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(steer);
  roundedRectPath(ctx, -width / 2 + 0.6, -height / 2 + 0.8, width, height, 0.9);
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fill();
  roundedRectPath(ctx, -width / 2, -height / 2, width, height, 0.9);
  ctx.fillStyle = "#121212";
  ctx.fill();
  ctx.strokeStyle = "#2f2f2f";
  ctx.lineWidth = 0.35;
  ctx.stroke();
  ctx.fillStyle = tyreBandColour();
  ctx.fillRect(-width / 2 + 0.7, y > 0 ? height / 2 - 0.75 : -height / 2 + 0.25, width - 1.4, 0.5);
  ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
  ctx.fillRect(-width / 2 + 0.6, -0.35, width - 1.2, 0.7);
  ctx.restore();
}

function drawCarWheels(car) {
  const steer = car.steerAngle || 0;
  drawWheel(9.6, -7.4, 4.6, 2.9, steer);
  drawWheel(9.6, 7.4, 4.6, 2.9, steer);
  drawWheel(-8.4, -7.7, 5.3, 3.5, 0);
  drawWheel(-8.4, 7.7, 5.3, 3.5, 0);
}

function drawRainLight() {
  if (gameWeather === "clear" || Math.floor(performance.now() / 110) % 2 === 0) return;
  ctx.save();
  ctx.shadowColor = "#ff3b3b";
  ctx.shadowBlur = 4;
  ctx.fillStyle = "#ff4d4d";
  ctx.fillRect(-13.4, -1, 1.2, 2);
  ctx.restore();
}

function drawCar(car) {
  const pose = renderPose(car);
  const scale = car.size / 20;
  const dimensions = { width: 30, height: 16, scale: 1 };

  ctx.save();
  ctx.translate(pose.x, pose.y);
  ctx.rotate(pose.angle);
  ctx.scale(scale, scale);

  const raceTime = gameRunning ? (gameNow() - raceStartTime) / 1000 : 0;
  const isGhosted = car.lapsCompleted === 0 && car.currentCheckpoint <= 2 && raceTime <= 15;
  if (isGhosted) ctx.globalAlpha = 0.7;

  drawCarWheels(car);
  ctx.drawImage(getCarSprite(car), SPRITE_BOUNDS.left, SPRITE_BOUNDS.top, SPRITE_BOUNDS.width, SPRITE_BOUNDS.height);
  drawRainLight();
  drawCarEffects(car, dimensions);
  ctx.restore();

  drawBehaviorIndicator(car, pose);
}

function drawBehaviorIndicator(car, pose) {
  if (!car.behavior) return;

  const colors = {
    overtaking: "rgba(255, 255, 0, 0.6)",
    defending: "rgba(255, 0, 0, 0.6)",
    avoiding: "rgba(255, 165, 0, 0.6)",
  };

  const color = colors[car.behavior.state];
  if (color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pose.x, pose.y - 15, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function drawCarEffects(car, dimensions) {
  const { width, height, scale } = dimensions;

  drawSpeedEffects(car, width, scale);
  drawStunnedEffect(car, width, height);
  drawDamageEffects(car, width, height);
}

function drawSpeedEffects(car, width, scale) {
  if (car.speed <= 3) return;

  const speedAlpha = Math.min(0.8, car.speed / 8);
  ctx.strokeStyle = `rgba(255, 255, 255, ${speedAlpha})`;
  ctx.lineWidth = 1.5 * scale;

  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-width / 2 - (6 + i * 2) * scale, (i - 1) * 2 * scale);
    ctx.lineTo(-width / 2 - (10 + i * 3) * scale, (i - 1) * 2 * scale);
    ctx.stroke();
  }
}

function drawStunnedEffect(car, width, height) {
  if (!car.stunned || car.stunned <= 0) return;

  ctx.strokeStyle = "rgba(255, 255, 0, 0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = Math.cos(angle) * (width / 2 + 8);
    const y = Math.sin(angle) * (height / 2 + 8);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawDamageEffects(car, width, height) {
  if (!car.damage || !car.damage.visible) return;

  const totalDamage =
    car.damage.speed +
    car.damage.acceleration +
    car.damage.handling +
    car.damage.braking;

  drawSmokeEffect(totalDamage, width);
  drawSparksEffect(totalDamage, width, height);
  drawDamageOverlay(totalDamage, width, height);
}

function drawSmokeEffect(totalDamage, width) {
  if (totalDamage <= 20) return;

  ctx.fillStyle = `rgba(80, 80, 80, ${Math.min(0.6, totalDamage / 200)})`;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(
      -width / 2 - 5 + i * 2,
      Math.sin(gameNow() * 0.01 + i) * 3,
      2 + Math.random() * 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}

function drawSparksEffect(totalDamage, width, height) {
  if (totalDamage <= 50 || Math.random() >= 0.1) return;

  ctx.fillStyle = `rgba(255, 200, 0, 0.8)`;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.arc(
      (Math.random() - 0.5) * width,
      (Math.random() - 0.5) * height,
      1,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}

function drawDamageOverlay(totalDamage, width, height) {
  if (totalDamage <= 30) return;

  ctx.fillStyle = `rgba(255, 0, 0, ${Math.min(0.3, totalDamage / 400)})`;
  ctx.beginPath();
  ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, 2 * Math.PI);
  ctx.fill();
}

// Helper function to shade colors
// Lighten a color by a given percentage
function lightenColor(color, percent) {
  const f = parseInt(color.slice(1), 16);
  const R = f >> 16;
  const G = (f >> 8) & 0x00ff;
  const B = f & 0x0000ff;
  return (
    "#" +
    (
      0x1000000 +
      Math.min(255, Math.round(R + (255 - R) * (percent / 100))) *
        0x10000 +
      Math.min(255, Math.round(G + (255 - G) * (percent / 100))) * 0x100 +
      Math.min(255, Math.round(B + (255 - B) * (percent / 100)))
    )
      .toString(16)
      .slice(1)
  );
}

function shadeColor(color, percent) {
  const f = parseInt(color.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = percent < 0 ? percent * -1 : percent;
  const R = f >> 16;
  const G = (f >> 8) & 0x00ff;
  const B = f & 0x0000ff;
  return (
    "#" +
    (
      0x1000000 +
      (Math.round(((t - R) * p) / 100) + R) * 0x10000 +
      (Math.round(((t - G) * p) / 100) + G) * 0x100 +
      (Math.round(((t - B) * p) / 100) + B)
    )
      .toString(16)
      .slice(1)
  );
}

// Get team code/initials for displaying on cars
function getTeamCode(car) {
  // For player car, use the selected team
  if (car === player || car.isPlayer) {
    if (typeof selectedTeam === "string") {
      const teamIdMap = {
        emerald_isle: "EIR",
        dragon_force: "DFM",
        highland_racing: "HRT",
        britannia_motors: "BRT",
        tricolore_racing: "TCR",
        kaiser_motorsport: "KMS",
        iberian_speed: "IBS",
        veloce_italia: "VIT",
        adriatic_racing: "ADR",
        liberty_racing: "LBR",
        rising_sun: "RSM",
        celestial_motors: "CEM",
        maharaja_motors: "MHJ",
        samba_racing: "SRT",
        velocidad_venezuela: "VVR",
        regina_curse: "RGC",
      };
      return teamIdMap[selectedTeam] || "PLR";
    }
    return "PLR";
  }

  // If AI car has a name property, extract code from it
  if (car.name) {
    // Map team names to their 3-letter codes
    const teamCodeMap = {
      "Emerald Isle Racing": "EIR",
      "Dragon Force Motorsport": "DFM",
      "Highland Racing Team": "HRT",
      "Britannia Motors": "BRT",
      "Tricolore Racing": "TCR",
      "Kaiser Motorsport": "KMS",
      "Iberian Speed": "IBS",
      "Veloce Italia": "VIT",
      "Adriatic Racing": "ADR",
      "Liberty Racing": "LBR",
      "Rising Sun Motors": "RSM",
      "Celestial Motors": "CEM",
      "Maharaja Motors": "MHJ",
      "Samba Racing Team": "SRT",
      "Velocidad Venezuela": "VVR",
      "Regina Curse": "RGC",
    };

    return teamCodeMap[car.name] || "AI";
  }

  // Default for unknown cars
  return "AI";
}

// Draw tire marks
function drawTireMarks() {
  tireMarks.forEach((mark) => {
    ctx.save();
    ctx.globalAlpha = mark.alpha;
    ctx.translate(mark.x, mark.y);
    ctx.rotate(mark.angle);
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(-8, -1, 16, 2);
    ctx.fillRect(-8, -4, 16, 2);
    ctx.restore();
  });
}

// Draw sparkles
function drawSparkles() {
  sparkles.forEach((sparkle) => {
    ctx.save();
    ctx.globalAlpha = sparkle.life / sparkle.maxLife;
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(sparkle.x, sparkle.y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  });
}

// Draw flame effects
function drawFlames() {
  flames.forEach((flame) => {
    const alpha = flame.life / flame.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;

    // Create flame gradient from yellow to red to transparent
    const flameGradient = ctx.createRadialGradient(
      flame.x,
      flame.y,
      0,
      flame.x,
      flame.y,
      flame.size
    );
    if (alpha > 0.7) {
      flameGradient.addColorStop(0, "#ffffff");
      flameGradient.addColorStop(0.3, "#ffff00");
      flameGradient.addColorStop(0.7, "#ff6600");
      flameGradient.addColorStop(1, "#ff0000");
    } else if (alpha > 0.4) {
      flameGradient.addColorStop(0, "#ffff00");
      flameGradient.addColorStop(0.5, "#ff6600");
      flameGradient.addColorStop(1, "#ff0000");
    } else {
      flameGradient.addColorStop(0, "#ff6600");
      flameGradient.addColorStop(1, "#440000");
    }

    ctx.fillStyle = flameGradient;
    ctx.beginPath();
    ctx.arc(flame.x, flame.y, flame.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  });
}

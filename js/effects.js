// Visual effects
const tireMarks = [];
const sparkles = [];
const flames = [];
const rainDrops = [];
const lightningBolts = [];
let lastLightningTime = 0;

// Weather effects configuration
const weatherEffects = {
  clear: {
    visibility: 1.0,
    gripMultiplier: 1.0,
    particles: false
  },
  rain: {
    visibility: 0.8,
    gripMultiplier: 0.7,
    particles: true,
    particleCount: 100,
    particleSpeed: 8
  },
  storm: {
    visibility: 0.5,
    gripMultiplier: 0.4,
    particles: true,
    particleCount: 200,
    particleSpeed: 12
  }
};

// Initialize rain particles
function initializeRainParticles() {
  rainDrops.length = 0;
  if (!weatherEffects[gameWeather].particles) return;
  
  const config = weatherEffects[gameWeather];
  // Create particles across a much larger world area (not just screen)
  const worldSize = 3000; // Cover the entire track area
  
  for (let i = 0; i < config.particleCount; i++) {
    rainDrops.push({
      x: Math.random() * worldSize,
      y: Math.random() * worldSize, 
      speed: config.particleSpeed + Math.random() * 4,
      length: 10 + Math.random() * 10,
      angle: Math.PI / 6, // 30 degree angle
      worldBased: true // Flag to indicate this uses world coordinates
    });
  }
}

// Update rain particles
function updateRainParticles() {
  if (!weatherEffects[gameWeather].particles) return;
  
  const config = weatherEffects[gameWeather];
  const worldSize = 3000;
  
  rainDrops.forEach(drop => {
    drop.x += Math.cos(drop.angle) * drop.speed;
    drop.y += Math.sin(drop.angle) * drop.speed;
    
    // Reset particles that go off the world area
    if (drop.x > worldSize || drop.y > worldSize || drop.x < -100 || drop.y < -100) {
      drop.x = Math.random() * worldSize;
      drop.y = Math.random() * worldSize;
    }
  });
  
  // Update lightning for storm weather
  if (gameWeather === 'storm') {
    updateLightning();
  }
}

// Lightning system for storms
function updateLightning() {
  const currentTime = gameNow();
  
  // Create lightning bolts every 6 seconds
  if (currentTime - lastLightningTime > 6000) {
    createLightningBolt();
    lastLightningTime = currentTime;
  }
  
  // Update existing lightning bolts (fade them out)
  for (let i = lightningBolts.length - 1; i >= 0; i--) {
    lightningBolts[i].life--;
    if (lightningBolts[i].life <= 0) {
      lightningBolts.splice(i, 1);
    }
  }
}

function createLightningBolt() {
  // Create lightning bolt in a random location near the visible area
  const boltX = camera.x + Math.random() * canvas.width;
  const boltY = camera.y + Math.random() * canvas.height;
  
  lightningBolts.push({
    x: boltX,
    y: boltY,
    life: 8, // Frames to display
    maxLife: 8,
    branches: generateLightningBranches(boltX, boltY)
  });
}

function generateLightningBranches(startX, startY) {
  const branches = [];
  const mainBranchLength = 200 + Math.random() * 300;
  
  // Main lightning bolt
  let currentX = startX;
  let currentY = startY;
  const segments = 8 + Math.floor(Math.random() * 6);
  
  for (let i = 0; i < segments; i++) {
    const segmentLength = mainBranchLength / segments;
    const angle = -Math.PI/2 + (Math.random() - 0.5) * 0.8; // Generally downward
    const nextX = currentX + Math.cos(angle) * segmentLength;
    const nextY = currentY + Math.sin(angle) * segmentLength;
    
    branches.push({
      x1: currentX,
      y1: currentY,
      x2: nextX,
      y2: nextY,
      thickness: 3 + Math.random() * 2
    });
    
    // Add smaller side branches occasionally
    if (Math.random() < 0.4) {
      const branchAngle = angle + (Math.random() - 0.5) * 1.5;
      const branchLength = segmentLength * (0.3 + Math.random() * 0.4);
      branches.push({
        x1: currentX,
        y1: currentY,
        x2: currentX + Math.cos(branchAngle) * branchLength,
        y2: currentY + Math.sin(branchAngle) * branchLength,
        thickness: 1 + Math.random() * 1
      });
    }
    
    currentX = nextX;
    currentY = nextY;
  }
  
  return branches;
}

// Render weather effects
function renderWeatherEffects() {
  const config = weatherEffects[gameWeather];
  
  // Draw rain particles in world coordinates
  if (config.particles && rainDrops.length > 0) {
    ctx.save();
    ctx.strokeStyle = gameWeather === 'storm' ? 'rgba(200, 200, 255, 0.6)' : 'rgba(150, 150, 200, 0.4)';
    ctx.lineWidth = gameWeather === 'storm' ? 2 : 1;
    
    rainDrops.forEach(drop => {
      // Only draw particles that are visible on screen
      if (drop.x >= camera.x - 100 && drop.x <= camera.x + canvas.width + 100 &&
          drop.y >= camera.y - 100 && drop.y <= camera.y + canvas.height + 100) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(
          drop.x + Math.cos(drop.angle) * drop.length,
          drop.y + Math.sin(drop.angle) * drop.length
        );
        ctx.stroke();
      }
    });
    ctx.restore();
  }
  
  // Draw lightning bolts for storm weather
  if (gameWeather === 'storm' && lightningBolts.length > 0) {
    ctx.save();
    
    lightningBolts.forEach(bolt => {
      const alpha = bolt.life / bolt.maxLife;
      
      bolt.branches.forEach(branch => {
        // Main bolt glow
        ctx.shadowColor = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = branch.thickness;
        
        ctx.beginPath();
        ctx.moveTo(branch.x1, branch.y1);
        ctx.lineTo(branch.x2, branch.y2);
        ctx.stroke();
        
        // Inner bright core
        ctx.shadowBlur = 5;
        ctx.strokeStyle = `rgba(200, 200, 255, ${alpha})`;
        ctx.lineWidth = branch.thickness * 0.3;
        
        ctx.beginPath();
        ctx.moveTo(branch.x1, branch.y1);
        ctx.lineTo(branch.x2, branch.y2);
        ctx.stroke();
      });
    });
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.restore();
  }
  
  // Note: Canvas dimming removed - using grass color changes instead for better coverage
}

// Add tire mark
function addTireMark(x, y, angle) {
  tireMarks.push({
    x: x,
    y: y,
    angle: angle,
    alpha: 0.3,
    age: 0,
  });

  // Limit tire marks for performance
  if (tireMarks.length > 100) {
    tireMarks.shift();
  }
}

// Add collision sparkle
function addSparkle(x, y) {
  for (let i = 0; i < 5; i++) {
    sparkles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 20,
      maxLife: 20,
    });
  }
}

// Add flame effect for nitro
function addFlame(x, y, angle, intensity = 1) {
  for (let i = 0; i < 3 * intensity; i++) {
    flames.push({
      x: x,
      y: y,
      vx: Math.cos(angle + Math.PI) * (2 + Math.random() * 3) * intensity,
      vy: Math.sin(angle + Math.PI) * (2 + Math.random() * 3) * intensity,
      life: 15,
      maxLife: 15,
      size: 2 + Math.random() * 3,
    });
  }
}

// AI Behavior Engine - Creates unique personalities for each AI car
class AIBehavior {
  constructor(car) {
    this.car = car;
    this.state = "racing"; // Current AI state: racing, overtaking, defending, avoiding
    this.targetLine = "optimal"; // Racing line preference: optimal, inside, outside

    // AI personality traits - each trait affects different aspects of driving behavior
    // Values are carefully balanced to create realistic but varied AI opponents
    this.aggressiveness = Math.random() * 0.4 + 0.4; // 0.4-0.8: Controls overtaking frequency and risk-taking
    this.cornering_skill = Math.random() * 0.3 + 0.6; // 0.6-0.9: Affects corner entry speed and line optimization
    this.overtaking_ability = Math.random() * 0.4 + 0.4; // 0.4-0.8: Influences overtaking success rate
    this.defending_skill = Math.random() * 0.4 + 0.4; // 0.4-0.8: Determines defensive maneuver effectiveness
    this.racecraft = Math.random() * 0.3 + 0.6; // 0.6-0.9: Overall racing intelligence and decision making
    this.awareness = Math.random() * 0.3 + 0.6; // 0.6-0.9: Detection range for other cars and hazards
    this.smoothness = Math.random() * 0.4 + 0.5; // 0.5-0.9: Reduces erratic movements and mistakes
    this.pace_consistency = Math.random() * 0.2 + 0.7; // 0.7-0.9: Maintains consistent lap times

    // Driving style preferences - affects racing line and positioning
    this.preferred_line_offset = (Math.random() - 0.5) * 20; // -10 to +10: Racing line bias (inside/outside)
    this.corner_entry_preference = Math.random() * 0.6 + 0.2; // 0.2-0.8: Early vs late braking preference
    this.braking_style = Math.random() * 0.6 + 0.2; // 0.2-0.8: Conservative vs aggressive braking
    this.throttle_style = Math.random() * 0.6 + 0.2; // 0.2-0.8: Smooth vs aggressive acceleration

    // Dynamic behavior state variables
    this.current_line_offset = this.preferred_line_offset; // Current racing line deviation
    this.overtake_cooldown = 0; // Prevents constant overtaking attempts
    this.defend_cooldown = 0; // Prevents constant defensive moves
    this.line_change_timer = Math.random() * 200; // Controls racing line variations
    this.mistake_chance = (1 - this.smoothness) * 0.003; // Probability of making driving errors
    this.last_mistake_time = 0; // Tracks when last mistake occurred

    // Tactical awareness and decision making
    this.lookAheadDistance = 60 + this.awareness * 80; // 60-140: How far ahead AI can "see"
    this.reaction_time = Math.floor((1 - this.awareness) * 20); // 0-20 frames: Simulated human reaction delay
    this.decision_buffer = []; // Stores recent racing situations for delayed reactions
  }

  // Main AI update function - called every frame to determine AI behavior
  update(allCars, track) {
    // Decrement action cooldowns to prevent unrealistic constant maneuvers
    if (this.overtake_cooldown > 0) this.overtake_cooldown--;
    if (this.defend_cooldown > 0) this.defend_cooldown--;

    // Simulate human-like reaction time by buffering decisions
    this.decision_buffer.push({ cars: [...allCars], time: gameNow() });
    if (this.decision_buffer.length > this.reaction_time) {
      this.decision_buffer.shift();
    }
    const delayed_situation = this.decision_buffer[0] || {
      cars: allCars,
    };

    // Dynamic line adjustment based on personality
    this.line_change_timer--;
    if (this.line_change_timer <= 0) {
      const line_variation =
        (Math.random() - 0.5) * 20 * (1 - this.smoothness);
      this.current_line_offset += line_variation;
      this.current_line_offset = Math.max(
        -30,
        Math.min(30, this.current_line_offset)
      );
      this.line_change_timer = 100 + Math.random() * 300;
    }

    // Occasional mistakes based on smoothness and difficulty settings
    if (
      difficultySettings[gameDifficulty].aiMistakesEnabled &&
      Math.random() < this.mistake_chance * difficultySettings[gameDifficulty].aiMistakeFrequency &&
      gameNow() - this.last_mistake_time > 2000
    ) {
      this.makeMistake();
      this.last_mistake_time = gameNow();
    }

    // Analyze racing situation with comprehensive awareness
    const nearby_cars = this.findNearbyCars(delayed_situation.cars);
    const overtake_opportunity = this.assessOvertakeOpportunity(
      nearby_cars,
      track
    );
    const defensive_needed = this.assessDefensiveNeed(nearby_cars);
    const traffic_ahead = this.detectTrafficAhead(nearby_cars);

    // Advanced state machine for decision making
    if (
      overtake_opportunity &&
      this.overtake_cooldown === 0 &&
      this.overtaking_ability > 0.5
    ) {
      this.state = "overtaking";
      this.overtake_cooldown = Math.floor(180 / this.aggressiveness); // More aggressive = shorter cooldown
    } else if (
      defensive_needed &&
      this.defend_cooldown === 0 &&
      this.defending_skill > 0.4
    ) {
      this.state = "defending";
      this.defend_cooldown = Math.floor(120 / this.defending_skill);
    } else if (traffic_ahead && this.awareness > 0.6) {
      this.state = "avoiding";
    } else {
      this.state = "racing";
    }

    return this.calculateTargetPath(track, nearby_cars);
  }

  makeMistake() {
    // Temporary line offset for mistakes
    const mistake_magnitude = 15 + Math.random() * 25;
    this.current_line_offset += (Math.random() - 0.5) * mistake_magnitude;
    this.current_line_offset = Math.max(
      -40,
      Math.min(40, this.current_line_offset)
    );

    // Reduce speed temporarily
    this.car.velocity.x *= 0.85;
    this.car.velocity.y *= 0.85;
  }

  findNearbyCars(allCars) {
    const nearby = [];
    const detection_range = this.lookAheadDistance;

    allCars.forEach((other) => {
      if (other === this.car) return;

      const dx = other.x - this.car.x;
      const dy = other.y - this.car.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < detection_range) {
        const angle_to_other = Math.atan2(dy, dx);
        const relative_angle = angle_to_other - this.car.angle;
        let normalized_angle = relative_angle;
        while (normalized_angle > Math.PI)
          normalized_angle -= 2 * Math.PI;
        while (normalized_angle < -Math.PI)
          normalized_angle += 2 * Math.PI;

        nearby.push({
          car: other,
          distance: distance,
          relative_angle: normalized_angle,
          is_ahead: Math.abs(normalized_angle) < Math.PI / 3,
          is_behind: Math.abs(normalized_angle) > (2 * Math.PI) / 3,
          is_alongside:
            Math.abs(normalized_angle) >= Math.PI / 3 &&
            Math.abs(normalized_angle) <= (2 * Math.PI) / 3,
        });
      }
    });

    return nearby;
  }

  assessOvertakeOpportunity(nearby_cars, track) {
    const cars_ahead = nearby_cars.filter(
      (car) => car.is_ahead && car.distance < 80
    );
    if (cars_ahead.length === 0) return false;

    const target_car = cars_ahead.reduce((closest, car) =>
      car.distance < closest.distance ? car : closest
    );

    // Check if target is significantly slower
    const speed_advantage = this.car.speed - target_car.car.speed;
    const speed_threshold = 0.5 * this.aggressiveness;

    // Check if there's space to overtake
    const space_left = !nearby_cars.some(
      (car) => car.relative_angle > 0 && car.distance < 60
    );
    const space_right = !nearby_cars.some(
      (car) => car.relative_angle < 0 && car.distance < 60
    );

    return (
      speed_advantage > speed_threshold && (space_left || space_right)
    );
  }

  assessDefensiveNeed(nearby_cars) {
    const attackers = nearby_cars.filter(
      (car) =>
        car.is_behind &&
        car.distance < 50 &&
        car.car.speed > this.car.speed * 1.05
    );

    return attackers.length > 0 && this.defending_skill > 0.5;
  }

  detectTrafficAhead(nearby_cars) {
    return nearby_cars.some(
      (car) =>
        car.is_ahead &&
        car.distance < 40 &&
        Math.abs(car.relative_angle) < Math.PI / 6
    );
  }

  calculateTargetPath(track, nearby_cars) {
    let target_point = this.getOptimalRacingLine(track);

    // Apply state-specific modifications
    switch (this.state) {
      case "overtaking":
        target_point = this.calculateOvertakingLine(
          target_point,
          nearby_cars
        );
        break;
      case "defending":
        target_point = this.calculateDefensiveLine(
          target_point,
          nearby_cars
        );
        break;
      case "avoiding":
        target_point = this.calculateAvoidanceLine(
          target_point,
          nearby_cars
        );
        break;
    }

    return target_point;
  }

  getOptimalRacingLine(track) {
    const current_wp = track.waypoints[this.car.targetWaypoint];
    const next_wp =
      track.waypoints[
        (this.car.targetWaypoint + 1) % track.waypoints.length
      ];
    const lookahead_wp =
      track.waypoints[
        (this.car.targetWaypoint + 2) % track.waypoints.length
      ];

    // Blend waypoints for smoother path based on cornering skill
    const blend_factor = 0.3 + this.cornering_skill * 0.4;
    let target = {
      x: current_wp.x * (1 - blend_factor) + next_wp.x * blend_factor,
      y: current_wp.y * (1 - blend_factor) + next_wp.y * blend_factor,
    };

    // Apply racing line offset based on personality and current state
    const track_direction = Math.atan2(
      next_wp.y - current_wp.y,
      next_wp.x - current_wp.x
    );
    const perpendicular = track_direction + Math.PI / 2;

    // Dynamic line offset based on corner type and preference
    const corner_radius = this.calculateCornerRadius(
      current_wp,
      next_wp,
      lookahead_wp
    );
    let line_offset = this.current_line_offset;

    // Adjust for corner entry/exit preferences
    if (corner_radius < 200) {
      // Tight corner
      line_offset *= 0.7 + this.cornering_skill * 0.3;

      // Late brakers take wider line
      if (this.corner_entry_preference > 0.7) {
        line_offset += 10;
      }
    }

    target.x += Math.cos(perpendicular) * line_offset;
    target.y += Math.sin(perpendicular) * line_offset;

    return target;
  }

  calculateCornerRadius(wp1, wp2, wp3) {
    const dx1 = wp2.x - wp1.x;
    const dy1 = wp2.y - wp1.y;
    const dx2 = wp3.x - wp2.x;
    const dy2 = wp3.y - wp2.y;

    const cross = dx1 * dy2 - dy1 * dx2;
    const dot = dx1 * dx2 + dy1 * dy2;

    if (Math.abs(cross) < 0.1) return 1000; // Straight line

    const angle = Math.atan2(cross, dot);
    return Math.abs(1 / Math.sin(angle / 2));
  }

  calculateOvertakingLine(base_target, nearby_cars) {
    const cars_ahead = nearby_cars.filter((car) => car.is_ahead);
    if (cars_ahead.length === 0) return base_target;

    const target_car = cars_ahead[0];

    // Choose overtaking side based on space and preference, and target car position
    const left_clear = !nearby_cars.some(
      (car) => car.relative_angle > 0 && car.distance < 70
    );
    const right_clear = !nearby_cars.some(
      (car) => car.relative_angle < 0 && car.distance < 70
    );

    let overtake_direction = 0;
    if (left_clear && right_clear) {
      // Choose based on target car's relative position and racing line preference
      const target_relative_angle =
        Math.atan2(
          target_car.car.y - this.car.y,
          target_car.car.x - this.car.x
        ) - this.car.angle;

      // Go to the opposite side of where the target car is positioned
      overtake_direction = target_relative_angle > 0 ? -1 : 1;

      // Also consider racing line preference as secondary factor
      if (Math.abs(target_relative_angle) < 0.2) {
        overtake_direction = this.preferred_line_offset > 0 ? 1 : -1;
      }
    } else if (left_clear) {
      overtake_direction = 1;
    } else if (right_clear) {
      overtake_direction = -1;
    }

    // Adjust overtaking aggression based on target car's speed
    const speed_difference = this.car.speed - target_car.car.speed;
    const overtake_magnitude =
      25 + this.aggressiveness * 15 + speed_difference * 5;
    const direction_angle = this.car.angle + Math.PI / 2;

    return {
      x:
        base_target.x +
        Math.cos(direction_angle) *
          overtake_direction *
          overtake_magnitude,
      y:
        base_target.y +
        Math.sin(direction_angle) *
          overtake_direction *
          overtake_magnitude,
    };
  }

  calculateDefensiveLine(base_target, nearby_cars) {
    const attackers = nearby_cars.filter(
      (car) => car.is_behind && car.car.speed > this.car.speed
    );
    if (attackers.length === 0) return base_target;

    const attacker = attackers[0];
    const block_direction = attacker.relative_angle > 0 ? 1 : -1;
    const defensive_magnitude = 15 + this.defending_skill * 10;
    const direction_angle = this.car.angle + Math.PI / 2;

    return {
      x:
        base_target.x +
        Math.cos(direction_angle) * block_direction * defensive_magnitude,
      y:
        base_target.y +
        Math.sin(direction_angle) * block_direction * defensive_magnitude,
    };
  }

  calculateAvoidanceLine(base_target, nearby_cars) {
    let avoidance_x = 0;
    let avoidance_y = 0;

    nearby_cars.forEach((car) => {
      if (car.distance < 50) {
        const avoidance_strength =
          ((50 - car.distance) / 50) * this.awareness;
        const dx = this.car.x - car.car.x;
        const dy = this.car.y - car.car.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length > 0) {
          avoidance_x += (dx / length) * avoidance_strength * 20;
          avoidance_y += (dy / length) * avoidance_strength * 20;
        }
      }
    });

    return {
      x: base_target.x + avoidance_x,
      y: base_target.y + avoidance_y,
    };
  }
}

// Create AI cars with advanced behavior
function createAICars() {
  aiCars.length = 0;

  // Map selectedTeam (key) to actual team name
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

  const playerTeamName = teamMapping[selectedTeam];

  // Filter out the player's selected team from AI teams
  const availableTeams = aiTeams.filter(
    (team) => team.name !== playerTeamName
  );
  
  // Get the difficulty multiplier from current settings
  const difficultyMultiplier = difficultySettings[gameDifficulty].aiAttributeMultiplier;

  for (let i = 0; i < availableTeams.length; i++) {
    // Use all 15 remaining teams
    const team = availableTeams[i];
    // Create proper F1-style grid formation with 2 cars per row
    // Player starts at front (row 0), AI cars start behind in rows 1, 2, 3, etc.
    const gridRow = Math.floor(i / 2) + 1; // Start from row 1 (player is row 0)
    const gridSide = i % 2;
    const slot = gridSlotPose(gridRow, gridSide);

    // Calculate team multipliers from attributes (scale: 1-20, normalized to 1.0-2.0 for better performance)
    // Apply difficulty multiplier to AI car attributes
    const speedMultiplier = (1.0 + (team.attributes.speed / 20) * 1.0) * difficultyMultiplier;
    const accelMultiplier = (1.0 + (team.attributes.acceleration / 20) * 1.0) * difficultyMultiplier;
    const handlingMultiplier = (1.0 + (team.attributes.handling / 20) * 1.0) * difficultyMultiplier;
    const brakingMultiplier = (1.0 + (team.attributes.braking / 20) * 1.0) * difficultyMultiplier;
    const reliabilityMultiplier = (0.8 + (team.attributes.reliability / 20) * 0.4) * difficultyMultiplier;
    const tireMultiplier = (0.4 + (team.attributes.tireManagement / 20) * 1.2) * difficultyMultiplier;

    const aiCar = {
      x: slot.x, // Grid slot behind the start line, following the circuit
      y: slot.y,
      angle: slot.angle, // Facing along the track
      velocity: { x: Math.cos(slot.angle) * 0.1, y: Math.sin(slot.angle) * 0.1 }, // Small initial roll forwards
      speed: 0.1, // Small initial speed
      isSliding: false, // Flag to track when car is sliding/drifting
      // Core performance stats affected by team attributes
      maxSpeed: (7.8 + Math.random() * 0.6) * speedMultiplier,
      acceleration: (0.2 + Math.random() * 0.04) * accelMultiplier,
      // Braking system using team-specific multiplier
      friction: (0.94 + Math.random() * 0.02) * brakingMultiplier,
      brakingPower: (0.12 + Math.random() * 0.03) * brakingMultiplier,
      turnSpeed: (0.055 + Math.random() * 0.015) * handlingMultiplier,
      size: 18,
      color: team.color,
      name: team.name,
      // Team attributes for gameplay effects
      teamAttributes: team.attributes,
      // Race state
      currentCheckpoint: 1,
      checkpointsHit: [true, false, false],
      lapProgress: 0,
      lapsCompleted: 0,
      targetWaypoint: firstWaypointAhead(slot),
      racePosition: i + 2,
      gridPosition: i + 1, // Grid position for race start ordering
      // Damage and wear system (reset to zero for new race)
      damage: {
        speed: 0, // 0-100, reduces maxSpeed
        acceleration: 0, // 0-100, reduces acceleration
        handling: 0, // 0-100, reduces turnSpeed
        braking: 0, // 0-100, reduces braking
        visible: false,
      },
      // Tire management (reset to zero for new race)
      tireWear: 0, // 0-100, affected by tireManagement
      tireWearRate: 0.06 / tireMultiplier, // Slower wear = better tire management - reduced for longer tire life (5 laps)
      reliabilityFactor: reliabilityMultiplier, // Affects chance of mechanical failures
      lastCollisionTime: 0,
      // AI Nitro system
      nitro: 100,
      maxNitro: 100,
      usingNitro: false,
      nitroRegenRate: 0.25,
      nitroStrategy: Math.random() * 0.4 + 0.3,
      lastNitroUse: 0,
      // Physics properties
      wheelBase: 16,
      steerAngle: 0,
      angularVelocity: 0,
      weightTransfer: 0,
      // Lap time tracking for accurate gap calculation
      lapTimes: [], // Array of completed lap times in seconds
      currentLapStartTime: 0, // When current lap started
      totalRaceTime: 0, // Sum of all completed lap times
      lastLapCompletionTime: 0, // Will be set on first lap completion for queue-based standings
      // Checkpoint timing for gap calculations
      checkpointTimes: {},
    };

    // Add AI behavior engine
    aiCar.behavior = new AIBehavior(aiCar);
    
    // Apply difficulty-specific adjustments to behavior
    if (gameDifficulty === "hard") {
      // Hard: Perfect AI - Higher awareness and consistency
      aiCar.behavior.awareness = Math.min(1.0, aiCar.behavior.awareness * 1.3);
      aiCar.behavior.smoothness = Math.min(1.0, aiCar.behavior.smoothness * 1.3);
      aiCar.behavior.pace_consistency = Math.min(1.0, aiCar.behavior.pace_consistency * 1.2);
      aiCar.behavior.mistake_chance = 0; // No mistakes on hard
    } else if (gameDifficulty === "easy") {
      // Easy: More forgiving AI - Lower aggression and racing skill
      aiCar.behavior.aggressiveness *= 0.7;
      aiCar.behavior.cornering_skill *= 0.8;
      aiCar.behavior.mistake_chance *= 1.5; // More mistakes on easy
      aiCar.behavior.reaction_time *= 1.3; // Slower reactions
    }
    
    aiCars.push(aiCar);
  }
}

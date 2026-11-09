// Create AI cars with advanced behavior
function createAICars() {
  aiCars.length = 0;

  const playerTeamName = teamKeyToName[selectedTeam];

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


    const aiCar = {
      x: slot.x, // Grid slot behind the start line, following the circuit
      y: slot.y,
      angle: slot.angle, // Facing along the track
      velocity: { x: Math.cos(slot.angle) * 0.1, y: Math.sin(slot.angle) * 0.1 }, // Small initial roll forwards
      speed: 0.1, // Small initial speed
      isSliding: false, // Flag to track when car is sliding/drifting
      // Core performance stats affected by team attributes
      maxSpeed: 0, // Set by applyTeamSetup() below
      acceleration: 0,
      friction: 0.95,
      brakingPower: 0,
      turnSpeed: 0,
      size: 18,
      color: team.color,
      name: team.name,
      // Team attributes for gameplay effects
      teamAttributes: team.attributes,
      // Race state
      currentCheckpoint: 1,
      checkpointsHit: freshCheckpointsHit(),
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
      tireWearRate: 0.06,
      reliabilityFactor: 1,
      fuel: 100,
      paceNoise: 1,
      paceNoiseLap: -1,
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

    // Attributes set the car's performance; the base figures carry a little car-to-car variety
    const perf = applyTeamSetup(
      aiCar,
      team.attributes,
      {
        maxSpeed: 7.8 + Math.random() * 0.6,
        acceleration: 0.2 + Math.random() * 0.04,
        turnSpeed: 0.055 + Math.random() * 0.015,
        friction: 0.94 + Math.random() * 0.02,
        brakingPower: 0.12 + Math.random() * 0.03,
        tyreWearRate: 0.06,
      },
      difficultyMultiplier
    );

    // Add AI behavior engine, with the driver traits taken from the team's ratings
    aiCar.behavior = new AIBehavior(aiCar);
    aiCar.behavior.aggressiveness = perf.aggression;
    aiCar.behavior.overtaking_ability = 0.3 + perf.aggression * 0.6;
    aiCar.behavior.pace_consistency = 0.95 - perf.paceVariance;
    aiCar.behavior.smoothness = Math.min(0.95, aiCar.behavior.smoothness * (1.2 - perf.paceVariance * 4));
    aiCar.behavior.mistake_chance = (1 - aiCar.behavior.smoothness) * 0.003 * perf.mistakeFactor;
    aiCar.behavior.lookAheadDistance = 60 + aiCar.behavior.awareness * 80;
    
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

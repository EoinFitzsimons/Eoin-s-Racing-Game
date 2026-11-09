/**
 * Teams and the car attribute model
 *
 * Every team is rated 1-20 on thirteen attributes (roughly 135 points each). The same
 * ratings drive the player's car and the AI through carPerformanceFromAttributes(), so a
 * strength on the team card is a strength on the circuit.
 */
const attributeDefinitions = [
  { key: "topSpeed", label: "Top Speed", short: "SPD", group: "Engine", description: "Maximum straight-line speed" },
  { key: "acceleration", label: "Acceleration", short: "ACC", group: "Engine", description: "How quickly the car reaches top speed out of corners" },
  { key: "corneringGrip", label: "Cornering Grip", short: "GRP", group: "Chassis", description: "Mechanical grip: how sharply the car turns at any speed" },
  { key: "braking", label: "Braking", short: "BRK", group: "Chassis", description: "Stopping power into corners" },
  { key: "aeroEfficiency", label: "Aero Efficiency", short: "AER", group: "Aero", description: "Low drag: higher top speed and less speed lost when coasting" },
  { key: "downforce", label: "Downforce", short: "DWN", group: "Aero", description: "Extra grip in fast corners at the cost of some straight-line speed" },
  { key: "fuelEfficiency", label: "Fuel Efficiency", short: "FUE", group: "Strategy", description: "Burns less fuel, so the car sheds weight and stays quick all race" },
  { key: "tyreManagement", label: "Tyre Management", short: "TYR", group: "Strategy", description: "Slower tyre wear across a race distance" },
  { key: "reliability", label: "Reliability", short: "REL", group: "Strategy", description: "Resistance to damage from contact and kerbs" },
  { key: "pitCrew", label: "Pit Crew", short: "PIT", group: "Strategy", description: "Faster pit stops when changing tyres and repairing damage" },
  { key: "wetWeather", label: "Wet Weather", short: "WET", group: "Driver", description: "How much grip the car keeps in rain and storms" },
  { key: "consistency", label: "Consistency", short: "CON", group: "Driver", description: "Smaller lap-time variance and fewer driver mistakes" },
  { key: "aggression", label: "Aggression", short: "AGG", group: "Driver", description: "More overtaking attempts and a stronger nitro, but harder contact" },
];
const ATTRIBUTE_BUDGET_MIN = 130;
const ATTRIBUTE_BUDGET_MAX = 140;

const aiTeams = [
  {
    name: "Emerald Isle Racing",
    color: "#169873",
    country: "Ireland",
    founded: 2018,
    championships: 2,
    wins: 15,
    attributes: {
      topSpeed: 10,
      acceleration: 9,
      corneringGrip: 14,
      braking: 11,
      aeroEfficiency: 7,
      downforce: 10,
      fuelEfficiency: 12,
      tyreManagement: 10,
      reliability: 6,
      pitCrew: 15,
      wetWeather: 7,
      consistency: 8,
      aggression: 12,
    }, // Total: 131
  },
  {
    name: "Dragon Force Motorsport",
    color: "#8e2043",
    country: "Wales",
    founded: 2016,
    championships: 1,
    wins: 8,
    attributes: {
      topSpeed: 17,
      acceleration: 17,
      corneringGrip: 8,
      braking: 11,
      aeroEfficiency: 13,
      downforce: 4,
      fuelEfficiency: 11,
      tyreManagement: 7,
      reliability: 8,
      pitCrew: 10,
      wetWeather: 14,
      consistency: 13,
      aggression: 6,
    }, // Total: 139
  },
  {
    name: "Highland Racing Team",
    color: "#0F52BA",
    country: "Scotland",
    founded: 2020,
    championships: 0,
    wins: 3,
    attributes: {
      topSpeed: 8,
      acceleration: 9,
      corneringGrip: 16,
      braking: 13,
      aeroEfficiency: 10,
      downforce: 12,
      fuelEfficiency: 14,
      tyreManagement: 12,
      reliability: 9,
      pitCrew: 12,
      wetWeather: 9,
      consistency: 8,
      aggression: 6,
    }, // Total: 138
  },
  {
    name: "Britannia Motors",
    color: "#191970",
    country: "England",
    founded: 2015,
    championships: 3,
    wins: 28,
    attributes: {
      topSpeed: 19,
      acceleration: 13,
      corneringGrip: 8,
      braking: 12,
      aeroEfficiency: 12,
      downforce: 6,
      fuelEfficiency: 12,
      tyreManagement: 3,
      reliability: 7,
      pitCrew: 17,
      wetWeather: 8,
      consistency: 12,
      aggression: 9,
    }, // Total: 138
  },
  {
    name: "Tricolore Racing",
    color: "#30D5C8",
    country: "France",
    founded: 2017,
    championships: 1,
    wins: 12,
    attributes: {
      topSpeed: 11,
      acceleration: 10,
      corneringGrip: 12,
      braking: 12,
      aeroEfficiency: 9,
      downforce: 10,
      fuelEfficiency: 13,
      tyreManagement: 13,
      reliability: 8,
      pitCrew: 10,
      wetWeather: 10,
      consistency: 9,
      aggression: 6,
    }, // Total: 133
  },
  {
    name: "Kaiser Motorsport",
    color: "#F7F7FF",
    country: "Germany",
    founded: 2014,
    championships: 4,
    wins: 35,
    attributes: {
      topSpeed: 14,
      acceleration: 14,
      corneringGrip: 8,
      braking: 16,
      aeroEfficiency: 10,
      downforce: 11,
      fuelEfficiency: 10,
      tyreManagement: 6,
      reliability: 6,
      pitCrew: 7,
      wetWeather: 13,
      consistency: 12,
      aggression: 8,
    }, // Total: 135
  },
  {
    name: "Iberian Speed",
    color: "#A0522D",
    country: "Spain",
    founded: 2019,
    championships: 0,
    wins: 5,
    attributes: {
      topSpeed: 15,
      acceleration: 12,
      corneringGrip: 10,
      braking: 8,
      aeroEfficiency: 12,
      downforce: 8,
      fuelEfficiency: 14,
      tyreManagement: 7,
      reliability: 8,
      pitCrew: 11,
      wetWeather: 10,
      consistency: 12,
      aggression: 12,
    }, // Total: 139
  },
  {
    name: "Veloce Italia",
    color: "#7851A9",
    country: "Italy",
    founded: 2013,
    championships: 2,
    wins: 18,
    attributes: {
      topSpeed: 16,
      acceleration: 18,
      corneringGrip: 9,
      braking: 8,
      aeroEfficiency: 11,
      downforce: 12,
      fuelEfficiency: 8,
      tyreManagement: 6,
      reliability: 5,
      pitCrew: 11,
      wetWeather: 15,
      consistency: 7,
      aggression: 8,
    }, // Total: 134
  },
  {
    name: "Adriatic Racing",
    color: "#FF8C42",
    country: "Croatia",
    founded: 2021,
    championships: 0,
    wins: 2,
    attributes: {
      topSpeed: 10,
      acceleration: 12,
      corneringGrip: 13,
      braking: 12,
      aeroEfficiency: 8,
      downforce: 12,
      fuelEfficiency: 14,
      tyreManagement: 10,
      reliability: 9,
      pitCrew: 8,
      wetWeather: 6,
      consistency: 15,
      aggression: 4,
    }, // Total: 133
  },
  {
    name: "Liberty Racing",
    color: "#0d0d0d",
    country: "USA",
    founded: 2012,
    championships: 1,
    wins: 9,
    attributes: {
      topSpeed: 17,
      acceleration: 14,
      corneringGrip: 7,
      braking: 9,
      aeroEfficiency: 12,
      downforce: 9,
      fuelEfficiency: 10,
      tyreManagement: 4,
      reliability: 11,
      pitCrew: 14,
      wetWeather: 7,
      consistency: 14,
      aggression: 12,
    }, // Total: 140
  },
  {
    name: "Rising Sun Motors",
    color: "#E0115F",
    country: "Japan",
    founded: 2016,
    championships: 0,
    wins: 6,
    attributes: {
      topSpeed: 12,
      acceleration: 12,
      corneringGrip: 17,
      braking: 13,
      aeroEfficiency: 7,
      downforce: 10,
      fuelEfficiency: 14,
      tyreManagement: 8,
      reliability: 6,
      pitCrew: 12,
      wetWeather: 11,
      consistency: 6,
      aggression: 11,
    }, // Total: 139
  },
  {
    name: "Celestial Motors",
    color: "#2fa889",
    country: "China",
    founded: 2018,
    championships: 0,
    wins: 4,
    attributes: {
      topSpeed: 15,
      acceleration: 9,
      corneringGrip: 8,
      braking: 11,
      aeroEfficiency: 12,
      downforce: 9,
      fuelEfficiency: 8,
      tyreManagement: 6,
      reliability: 9,
      pitCrew: 13,
      wetWeather: 11,
      consistency: 14,
      aggression: 11,
    }, // Total: 136
  },
  {
    name: "Maharaja Motors",
    color: "#ffa347",
    country: "India",
    founded: 2020,
    championships: 0,
    wins: 1,
    attributes: {
      topSpeed: 12,
      acceleration: 13,
      corneringGrip: 12,
      braking: 10,
      aeroEfficiency: 6,
      downforce: 6,
      fuelEfficiency: 13,
      tyreManagement: 7,
      reliability: 16,
      pitCrew: 16,
      wetWeather: 8,
      consistency: 12,
      aggression: 8,
    }, // Total: 139
  },
  {
    name: "Samba Racing Team",
    color: "#42d653",
    country: "Brazil",
    founded: 2011,
    championships: 2,
    wins: 22,
    attributes: {
      topSpeed: 12,
      acceleration: 20,
      corneringGrip: 13,
      braking: 7,
      aeroEfficiency: 10,
      downforce: 12,
      fuelEfficiency: 14,
      tyreManagement: 5,
      reliability: 5,
      pitCrew: 11,
      wetWeather: 14,
      consistency: 6,
      aggression: 8,
    }, // Total: 137
  },
  {
    name: "Velocidad Venezuela",
    color: "#FFEF00",
    country: "Venezuela",
    founded: 2021,
    championships: 0,
    wins: 1,
    attributes: {
      topSpeed: 9,
      acceleration: 9,
      corneringGrip: 14,
      braking: 15,
      aeroEfficiency: 4,
      downforce: 9,
      fuelEfficiency: 20,
      tyreManagement: 8,
      reliability: 10,
      pitCrew: 11,
      wetWeather: 10,
      consistency: 15,
      aggression: 4,
    }, // Total: 138
  },
  {
    name: "Regina Curse",
    color: "#FF77BC",
    country: "Romania",
    founded: 2022,
    championships: 0,
    wins: 0,
    attributes: {
      topSpeed: 9,
      acceleration: 8,
      corneringGrip: 9,
      braking: 11,
      aeroEfficiency: 10,
      downforce: 11,
      fuelEfficiency: 12,
      tyreManagement: 8,
      reliability: 12,
      pitCrew: 16,
      wetWeather: 6,
      consistency: 14,
      aggression: 9,
    }, // Total: 135
  },
];

// Original values so the reset button can undo a randomisation
const originalTeamAttributes = aiTeams.map((team) => ({
  name: team.name,
  attributes: { ...team.attributes },
}));

function getTeamByName(name) {
  return aiTeams.find((team) => team.name === name);
}

// Map from the team-select card key to the team name
const teamKeyToName = {
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

/**
 * Turns 1-20 ratings into the numbers the simulation uses. `scale` is the difficulty
 * multiplier (AI) or player attribute multiplier, applied to the core performance figures.
 */
function carPerformanceFromAttributes(attributes, scale = 1) {
  const n = (key) => (attributes[key] ?? 10) / 20;
  const aeroBias = n("aeroEfficiency") - 0.5; // -0.5 (draggy) to +0.5 (slippery)
  const downforceBias = n("downforce") - 0.5;
  return {
    maxSpeedMultiplier: (1 + n("topSpeed") + aeroBias * 0.16 - downforceBias * 0.08) * scale,
    accelerationMultiplier: (1 + n("acceleration")) * scale,
    turnMultiplier: (1 + n("corneringGrip") * 0.8 + n("downforce") * 0.3) * scale,
    brakingMultiplier: (1 + n("braking")) * scale,
    // Extra drag subtracted from the coasting friction coefficient each step
    drag: Math.max(0, 0.004 * (0.5 - aeroBias) + 0.002 * downforceBias),
    tyreWearDivisor: 0.4 + n("tyreManagement") * 1.2,
    reliabilityFactor: 0.8 + n("reliability") * 0.4,
    // Fuel: burn per simulation step at full throttle, and how much a full tank weighs the car down
    fuelBurnRate: 0.0065 * (1.5 - n("fuelEfficiency")),
    fuelMassPenalty: 0.14,
    pitStopSeconds: 4.2 - n("pitCrew") * 2.7,
    // Share of the weather grip penalty that still applies (0.65 for the best wet drivers, 1.35 for the worst)
    wetPenaltyFactor: 1.35 - n("wetWeather") * 0.7,
    paceVariance: (1 - n("consistency")) * 0.08,
    mistakeFactor: 1.6 - n("consistency"),
    aggression: 0.3 + n("aggression") * 0.6,
    nitroBoost: 1.55 + n("aggression") * 0.5,
    damageMultiplier: 0.8 + n("aggression") * 0.4,
  };
}

/**
 * Applies a team's attributes to a car. `base` holds the unmodified performance figures
 * (player.baseMaxSpeed etc. or the randomised AI base values); the result is stored on
 * `car.setup` so damage can be re-applied on top of it later.
 */
function applyTeamSetup(car, attributes, base, scale = 1) {
  const perf = carPerformanceFromAttributes(attributes, scale);
  car.teamAttributes = attributes;
  car.performance = perf;
  car.setup = {
    maxSpeed: base.maxSpeed * perf.maxSpeedMultiplier,
    acceleration: base.acceleration * perf.accelerationMultiplier,
    turnSpeed: base.turnSpeed * perf.turnMultiplier,
    friction: base.friction,
    brakingPower: base.brakingPower * perf.brakingMultiplier,
  };
  car.maxSpeed = car.setup.maxSpeed;
  car.acceleration = car.setup.acceleration;
  car.turnSpeed = car.setup.turnSpeed;
  car.friction = car.setup.friction;
  car.brakingPower = car.setup.brakingPower;
  car.tyreWearRate = base.tyreWearRate / perf.tyreWearDivisor;
  car.tireWearRate = car.tyreWearRate;
  car.reliabilityFactor = perf.reliabilityFactor;
  car.fuel = 100;
  car.fuelBurnRate = perf.fuelBurnRate;
  car.pitStopSeconds = perf.pitStopSeconds;
  return perf;
}

// The player's car: base figures from world.js scaled by the difficulty's player multiplier
function applyPlayerTeamSetup(attributes) {
  const scale = difficultySettings[gameDifficulty].playerAttributeMultiplier;
  return applyTeamSetup(
    player,
    attributes,
    {
      maxSpeed: player.baseMaxSpeed,
      acceleration: player.baseAcceleration,
      turnSpeed: player.baseTurnSpeed,
      friction: player.baseFriction,
      brakingPower: player.baseBrakingPower || 0.15,
      tyreWearRate: 0.15,
    },
    scale
  );
}

// Grip multiplier for the current weather, softened or worsened by the car's wet-weather rating
function weatherGripFor(car) {
  const base = weatherEffects[gameWeather] ? weatherEffects[gameWeather].gripMultiplier : 1;
  const factor = car.performance ? car.performance.wetPenaltyFactor : 1;
  return Math.max(0.2, 1 - (1 - base) * factor);
}

// Heavier fuel loads blunt acceleration and cornering; the car sharpens as the tank empties
function fuelMassFactor(car) {
  const penalty = car.performance ? car.performance.fuelMassPenalty : 0.14;
  const load = Math.max(0, Math.min(100, car.fuel ?? 100)) / 100;
  return 1 / (1 + penalty * load);
}

function burnFuel(car, throttle) {
  if (!gameRunning || car.fuel === undefined) return;
  const speedRatio = car.maxSpeed > 0 ? Math.min(1.5, (car.speed || 0) / car.maxSpeed) : 0;
  const burn = (car.fuelBurnRate || 0.0065) * (0.35 + throttle * (0.65 + speedRatio));
  car.fuel = Math.max(0, car.fuel - burn);
}

// Randomly distributes the same points budget across the thirteen attributes, keeping the
// 1-20 range and giving each team one to three specialisms
function randomizeTeamAttributes() {
  aiTeams.forEach((team) => {
    const keys = attributeDefinitions.map((definition) => definition.key);
    const attributes = {};
    keys.forEach((key) => (attributes[key] = 4));
    const budget = ATTRIBUTE_BUDGET_MIN + Math.floor(Math.random() * (ATTRIBUTE_BUDGET_MAX - ATTRIBUTE_BUDGET_MIN + 1));
    let remaining = budget - keys.length * 4;

    const pool = [...keys];
    const specialisms = [];
    const specialismCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < specialismCount && pool.length > 0; i++) {
      specialisms.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    let bonus = Math.floor(remaining * 0.45);
    specialisms.forEach((key) => {
      const share = Math.min(Math.floor(bonus / specialisms.length), 20 - attributes[key]);
      attributes[key] += share;
      remaining -= share;
    });

    let guard = 1000;
    while (remaining > 0 && guard-- > 0) {
      const open = keys.filter((key) => attributes[key] < 20);
      if (open.length === 0) break;
      attributes[open[Math.floor(Math.random() * open.length)]]++;
      remaining--;
    }
    team.attributes = attributes;
  });
  populateTeamAttributes();
}

function randomiseTeamAttributes() {
  randomizeTeamAttributes();
}

function resetTeamAttributes() {
  originalTeamAttributes.forEach((original) => {
    const team = getTeamByName(original.name);
    if (team) team.attributes = { ...original.attributes };
  });
  populateTeamAttributes();
}

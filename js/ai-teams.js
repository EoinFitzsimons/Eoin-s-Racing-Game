// Team system with 6 attributes (1-20 scale, 60 total points per team)
const aiTeams = [
  {
    name: "Emerald Isle Racing",
    color: "#169873",
    country: "Ireland",
    founded: 2018,
    championships: 2,
    wins: 15,
    attributes: {
      speed: 12,
      acceleration: 10,
      handling: 14,
      braking: 12,
      reliability: 7,
      tireManagement: 10,
    }, // Total: 65
  },
  {
    name: "Dragon Force Motorsport",
    color: "#8e2043",
    country: "Wales",
    founded: 2016,
    championships: 1,
    wins: 8,
    attributes: {
      speed: 14,
      acceleration: 16,
      handling: 8,
      braking: 9,
      reliability: 8,
      tireManagement: 7,
    }, // Total: 62
  },
  {
    name: "Highland Racing Team",
    color: "#0F52BA",
    country: "Scotland",
    founded: 2020,
    championships: 0,
    wins: 3,
    attributes: {
      speed: 8,
      acceleration: 9,
      handling: 16,
      braking: 13,
      reliability: 9,
      tireManagement: 12,
    }, // Total: 67
  },
  {
    name: "Britannia Motors",
    color: "#191970",
    country: "England",
    founded: 2015,
    championships: 3,
    wins: 28,
    attributes: {
      speed: 18,
      acceleration: 12,
      handling: 8,
      braking: 11,
      reliability: 6,
      tireManagement: 3,
    }, // Total: 58
  },
  {
    name: "Tricolore Racing",
    color: "#30D5C8",
    country: "France",
    founded: 2017,
    championships: 1,
    wins: 12,
    attributes: {
      speed: 11,
      acceleration: 11,
      handling: 12,
      braking: 12,
      reliability: 9,
      tireManagement: 14,
    }, // Total: 69
  },
  {
    name: "Kaiser Motorsport",
    color: "#F7F7FF",
    country: "Germany",
    founded: 2014,
    championships: 4,
    wins: 35,
    attributes: {
      speed: 13,
      acceleration: 13,
      handling: 7,
      braking: 16,
      reliability: 6,
      tireManagement: 6,
    }, // Total: 61
  },
  {
    name: "Iberian Speed",
    color: "#A0522D",
    country: "Spain",
    founded: 2019,
    championships: 0,
    wins: 5,
    attributes: {
      speed: 15,
      acceleration: 12,
      handling: 10,
      braking: 8,
      reliability: 8,
      tireManagement: 7,
    }, // Total: 60
  },
  {
    name: "Veloce Italia",
    color: "#7851A9",
    country: "Italy",
    founded: 2013,
    championships: 2,
    wins: 18,
    attributes: {
      speed: 16,
      acceleration: 18,
      handling: 9,
      braking: 8,
      reliability: 4,
      tireManagement: 5,
    }, // Total: 60
  },
  {
    name: "Adriatic Racing",
    color: "#FF8C42",
    country: "Croatia",
    founded: 2021,
    championships: 0,
    wins: 2,
    attributes: {
      speed: 10,
      acceleration: 11,
      handling: 11,
      braking: 11,
      reliability: 9,
      tireManagement: 8,
    }, // Total: 60
  },
  {
    name: "Liberty Racing",
    color: "#0d0d0d",
    country: "USA",
    founded: 2012,
    championships: 1,
    wins: 9,
    attributes: {
      speed: 17,
      acceleration: 14,
      handling: 6,
      braking: 8,
      reliability: 11,
      tireManagement: 4,
    }, // Total: 60
  },
  {
    name: "Rising Sun Motors",
    color: "#E0115F",
    country: "Japan",
    founded: 2016,
    championships: 0,
    wins: 6,
    attributes: {
      speed: 11,
      acceleration: 12,
      handling: 14,
      braking: 13,
      reliability: 4,
      tireManagement: 6,
    }, // Total: 60
  },
  {
    name: "Celestial Motors",
    color: "#2fa889",
    country: "China",
    founded: 2018,
    championships: 0,
    wins: 4,
    attributes: {
      speed: 16,
      acceleration: 10,
      handling: 8,
      braking: 11,
      reliability: 9,
      tireManagement: 6,
    }, // Total: 60
  },
  {
    name: "Maharaja Motors",
    color: "#ffa347",
    country: "India",
    founded: 2020,
    championships: 0,
    wins: 1,
    attributes: {
      speed: 9,
      acceleration: 10,
      handling: 10,
      braking: 9,
      reliability: 15,
      tireManagement: 7,
    }, // Total: 60
  },
  {
    name: "Samba Racing Team",
    color: "#42d653",
    country: "Brazil",
    founded: 2011,
    championships: 2,
    wins: 22,
    attributes: {
      speed: 12,
      acceleration: 19,
      handling: 13,
      braking: 7,
      reliability: 5,
      tireManagement: 4,
    }, // Total: 60
  },
  {
    name: "Velocidad Venezuela",
    color: "#FFEF00",
    country: "Venezuela",
    founded: 2021,
    championships: 0,
    wins: 1,
    attributes: {
      speed: 7,
      acceleration: 9,
      handling: 13,
      braking: 14,
      reliability: 9,
      tireManagement: 8,
    }, // Total: 60
  },
  {
    name: "Regina Curse",
    color: "#FF77BC",
    country: "Romania",
    founded: 2022,
    championships: 0,
    wins: 0,
    attributes: {
      speed: 9,
      acceleration: 8,
      handling: 10,
      braking: 12,
      reliability: 13,
      tireManagement: 8,
    }, // Total: 60
  },
];

// Save original team attributes for reset functionality
const originalTeamAttributes = aiTeams.map(team => ({ 
  name: team.name, 
  attributes: { ...team.attributes } 
}));

// Randomize team attributes while keeping a balanced but unique distribution
function randomizeTeamAttributes() {
  // Generate random but balanced attributes for each team
  aiTeams.forEach(team => {
    // Create a total attribute budget for this team (60-70 points)
    const totalBudget = 60 + Math.floor(Math.random() * 10);
    
    // Reset attributes to calculate from scratch
    const attributes = {
      speed: 0,
      acceleration: 0,
      handling: 0,
      braking: 0,
      reliability: 0,
      tireManagement: 0
    };
    
    // Ensure each attribute gets at least 4 points as a base value
    Object.keys(attributes).forEach(attr => {
      attributes[attr] = 4;
    });
    
    // Remaining points to distribute (after allocating base values)
    let remainingPoints = totalBudget - 24; // 24 = 6 attributes * 4 base points
    
    // Define team's specialization (1-3 attributes that get bonus points)
    const specializations = [];
    const attributeKeys = Object.keys(attributes);
    
    // Select 1-3 specializations randomly
    const specializationCount = 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < specializationCount; i++) {
      const randomIndex = Math.floor(Math.random() * attributeKeys.length);
      const attribute = attributeKeys[randomIndex];
      
      if (!specializations.includes(attribute)) {
        specializations.push(attribute);
      }
      
      // Remove the attribute to prevent duplicates
      attributeKeys.splice(randomIndex, 1);
      
      if (attributeKeys.length === 0) break;
    }
    
    // Give bonus points to specializations (60% of remaining points)
    const specializationPoints = Math.floor(remainingPoints * 0.6);
    let bonusPointsRemaining = specializationPoints;
    
    // First pass: calculate how many points can be assigned to each specialization without exceeding 20
    const maxPointsPerSpecialization = {};
    specializations.forEach(attr => {
      maxPointsPerSpecialization[attr] = 20 - attributes[attr]; // Max points this attribute can accept
    });
    
    // Second pass: distribute points respecting the 20-point maximum
    specializations.forEach(attr => {
      // Calculate fair share based on remaining points and specializations
      const fairShare = Math.floor(bonusPointsRemaining / specializations.length);
      // Calculate how many points to actually add (either fair share or max possible)
      const pointsToAdd = Math.min(fairShare, maxPointsPerSpecialization[attr]);
      
      attributes[attr] += pointsToAdd;
      bonusPointsRemaining -= pointsToAdd;
      remainingPoints -= pointsToAdd;
    });
    
    // If we have leftover specialization points that couldn't be distributed,
    // add them back to the remaining points pool for random distribution
    if (bonusPointsRemaining > 0) {
      remainingPoints += bonusPointsRemaining;
    }
    
    // Distribute remaining points randomly
    while (remainingPoints > 0) {
      const randomAttr = Object.keys(attributes)[Math.floor(Math.random() * 6)];
      
      // Cap each attribute at 20
      if (attributes[randomAttr] < 20) {
        attributes[randomAttr]++;
        remainingPoints--;
      } else {
        // If this attribute is already at max, find another attribute that isn't maxed out
        const availableAttributes = Object.keys(attributes).filter(attr => attributes[attr] < 20);
        
        // If no attributes are below max, break the loop (rare edge case)
        if (availableAttributes.length === 0) break;
        
        // Pick a random attribute that isn't maxed and increment it
        const alternateAttr = availableAttributes[Math.floor(Math.random() * availableAttributes.length)];
        attributes[alternateAttr]++;
        remainingPoints--;
      }
    }
    
    // Final check to ensure no attribute exceeds 20
    Object.keys(attributes).forEach(attr => {
      if (attributes[attr] > 20) {
        const excess = attributes[attr] - 20;
        attributes[attr] = 20;
        // Redistribute excess points to attributes below max
        let redistributed = 0;
        while (redistributed < excess) {
          const availableAttributes = Object.keys(attributes).filter(a => attributes[a] < 20);
          if (availableAttributes.length === 0) break;
          
          const randomAttr = availableAttributes[Math.floor(Math.random() * availableAttributes.length)];
          attributes[randomAttr]++;
          redistributed++;
        }
      }
    });
    
    // Apply the new attributes
    team.attributes = attributes;
  });
  
  // Update display
  populateTeamAttributes();
}

// Reset team attributes to their original values
function resetTeamAttributes() {
  originalTeamAttributes.forEach(originalTeam => {
    const team = aiTeams.find(t => t.name === originalTeam.name);
    if (team) {
      team.attributes = { ...originalTeam.attributes };
    }
  });
  
  // Update display
  populateTeamAttributes();
}

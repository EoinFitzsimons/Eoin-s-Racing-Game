// Track collision detection for larger track
function isPointOnTrack(x, y) {
  // The grid area straddles the line, so it always counts as asphalt, as does the pit lane
  if (isInStartZone(x, y) || isOnPitLane(x, y)) {
    window.lastTrackSurfaceInfo = { surface: "asphalt", gripModifier: 1.0, distanceFromCenter: 0, segmentInfo: null };
    return true; // Always allow cars in the starting area
  }

  // Calculate distance from point to track centerline for rest of track
  let minDistance = Infinity;
  let nearestSegment = null;

  for (let i = 0; i < track.path.length; i++) {
    const current = track.path[i];
    const next = track.path[(i + 1) % track.path.length];

    // Distance from point to line segment
    const segmentInfo = distanceToLineSegmentWithInfo(
      x,
      y,
      current.x,
      current.y,
      next.x,
      next.y
    );

    if (segmentInfo.distance < minDistance) {
      minDistance = segmentInfo.distance;
      nearestSegment = segmentInfo;
    }
  }

  // Use nearestSegment for track surface detection
  let trackSurface = "asphalt"; // Default surface type
  let gripModifier = 1.0; // Default grip level

  if (nearestSegment) {
    // Determine surface type based on distance from track center
    const distanceFromCenter = minDistance;
    const trackRadius = track.width / 2;

    if (
      distanceFromCenter > trackRadius - 15 &&
      distanceFromCenter <= trackRadius
    ) {
      // Close to track edge - kerbs with lower grip
      trackSurface = "kerb";
      gripModifier = 0.85; // Reduced grip on kerbs
    } else if (distanceFromCenter > trackRadius) {
      // Off track - grass/gravel
      trackSurface = "grass";
      gripModifier = 0.4; // Much lower grip off track
    }

    // Store surface info for potential use by calling functions
    if (typeof window !== "undefined") {
      window.lastTrackSurfaceInfo = {
        surface: trackSurface,
        gripModifier: gripModifier,
        distanceFromCenter: distanceFromCenter,
        segmentInfo: nearestSegment,
      };
    }
  }

  // Much more restrictive track boundaries to prevent checkpoint skipping
  const trackRadius = track.width / 2 - 5; // Tighter track boundary detection radius
  return minDistance <= trackRadius;
}

// Distance calculation with comprehensive track information
function distanceToLineSegmentWithInfo(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    // Degenerate segment - just return distance to point
    const distance = Math.sqrt(
      (px - x1) * (px - x1) + (py - y1) * (py - y1)
    );
    return {
      distance: distance,
      projX: x1,
      projY: y1,
      t: 0,
    };
  }

  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared)
  );
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  const distance = Math.sqrt(
    (px - projX) * (px - projX) + (py - projY) * (py - projY)
  );

  return {
    distance: distance,
    projX: projX,
    projY: projY,
    t: t,
  };
}

// Helper function to check if car is in starting area during race start
function isInStartingAreaDuringRaceStart(car) {
  const raceTime = gameRunning ? (gameNow() - raceStartTime) / 1000 : 0;
  return raceTime < 2 && isInStartZone(car.x, car.y);
}

// Helper function to apply surface-specific effects
function applySurfaceEffects(car, surfaceInfo) {
  if (surfaceInfo.surface === "grass") {
    // Much harsher penalty for going off track
    car.velocity.x *= 0.5; // Reduced from 0.75
    car.velocity.y *= 0.5;

    if (Math.random() < 0.5) { // More frequent effects
      addSparkle(
        car.x + (Math.random() - 0.5) * 20,
        car.y + (Math.random() - 0.5) * 20
      );
    }
  } else if (surfaceInfo.surface === "kerb") {
    car.velocity.x *= 0.85; // Slightly harsher kerb penalty
    car.velocity.y *= 0.85;
  }
}

// Helper function to find closest point on track
function findClosestTrackPoint(car) {
  let closestPoint = null;
  let minDistance = Infinity;
  let bestSegmentInfo = null;

  for (let i = 0; i < track.path.length; i++) {
    const current = track.path[i];
    const next = track.path[(i + 1) % track.path.length];

    const segmentInfo = distanceToLineSegmentWithInfo(
      car.x,
      car.y,
      current.x,
      current.y,
      next.x,
      next.y
    );

    if (segmentInfo.distance < minDistance) {
      minDistance = segmentInfo.distance;
      closestPoint = { x: segmentInfo.projX, y: segmentInfo.projY };
      bestSegmentInfo = segmentInfo;
    }
  }

  return { closestPoint, bestSegmentInfo };
}

/**
 * Car Repositioning System for Track Boundary Violations
 *
 * When a car goes off-track, this system smoothly guides it back to a safe position
 * while applying realistic physics effects like velocity damping and tire marks.
 *
 * Process:
 * 1. Calculate outward direction from closest track point
 * 2. Position car at safe distance inside track boundary
 * 3. Apply gradual correction to prevent sudden jumps
 * 4. Adjust velocity to simulate off-track grip loss
 * 5. Add tire marks to show where car went off-track
 */
function repositionCarOnTrack(car, closestPoint) {
  const outwardX = car.x - closestPoint.x;
  const outwardY = car.y - closestPoint.y;
  const outwardLength = Math.sqrt(
    outwardX * outwardX + outwardY * outwardY
  );

  if (outwardLength <= 0.1) return;

  // Calculate normalized outward direction vector
  const normalX = outwardX / outwardLength;
  const normalY = outwardY / outwardLength;

  // Position car just inside track boundary with safety margin
  const safeDistance = track.width / 2 - 10; // More restrictive positioning
  const targetX = closestPoint.x + normalX * safeDistance;
  const targetY = closestPoint.y + normalY * safeDistance;

  // Apply immediate correction to prevent track cutting
  const correctionStrength = 0.8; // Much more aggressive repositioning
  car.x = car.x + (targetX - car.x) * correctionStrength;
  car.y = car.y + (targetY - car.y) * correctionStrength;

  // Apply physics effects and visual feedback
  adjustCarVelocity(car, normalX, normalY);
  addTireMark(car.x, car.y, car.angle);
}

/**
 * Velocity Adjustment for Off-Track Physics
 *
 * Simulates the loss of grip and momentum when a car leaves the track surface.
 * Uses vector decomposition to maintain tangential speed while damping normal impact.
 */
function adjustCarVelocity(car, normalX, normalY) {
  const velocityMagnitude = Math.sqrt(
    car.velocity.x * car.velocity.x + car.velocity.y * car.velocity.y
  );

  if (velocityMagnitude <= 0.1) return;

  // Decompose velocity into tangential and normal components
  const tangentialX = -normalY; // Perpendicular to normal (track direction)
  const tangentialY = normalX;

  const tangentialComponent =
    car.velocity.x * tangentialX + car.velocity.y * tangentialY;
  const normalComponent =
    car.velocity.x * normalX + car.velocity.y * normalY;

  // Heavily damp the normal component (into track boundary) while preserving tangential
  const dampedNormalComponent = Math.min(0, normalComponent * 0.3);

  car.velocity.x =
    tangentialX * tangentialComponent * 0.98 +
    normalX * dampedNormalComponent;
  car.velocity.y =
    tangentialY * tangentialComponent * 0.98 +
    normalY * dampedNormalComponent;
}

// Improved track collision handling
function handleTrackCollision(car) {
  if (isInStartingAreaDuringRaceStart(car)) {
    return;
  }

  const onTrack = isPointOnTrack(car.x, car.y);
  car.surface = (window.lastTrackSurfaceInfo && window.lastTrackSurfaceInfo.surface) || "asphalt";
  if (!onTrack) {
    addSparkle(car.x, car.y);
    playOffTrackSound(car);

    const surfaceInfo = window.lastTrackSurfaceInfo || {
      surface: "grass",
      gripModifier: 0.4,
      distanceFromCenter: 100,
    };

    // Apply much harsher off-track penalties
    applySurfaceEffects(car, surfaceInfo);
    
    // Additional speed penalty for going off track
    car.velocity.x *= 0.6; // More severe speed reduction
    car.velocity.y *= 0.6;

    const { closestPoint, bestSegmentInfo } = findClosestTrackPoint(car);

    if (closestPoint && bestSegmentInfo) {
      // If car is extremely far off track, teleport immediately
      if (surfaceInfo.distanceFromCenter > track.width) {
        // Immediate teleport for extreme cases
        const normalX = (car.x - closestPoint.x) / surfaceInfo.distanceFromCenter;
        const normalY = (car.y - closestPoint.y) / surfaceInfo.distanceFromCenter;
        const safeDistance = track.width / 2 - 15;
        
        car.x = closestPoint.x + normalX * safeDistance;
        car.y = closestPoint.y + normalY * safeDistance;
        car.velocity.x *= 0.3; // Severe speed penalty for extreme off-track
        car.velocity.y *= 0.3;
      } else {
        repositionCarOnTrack(car, closestPoint);
      }
    }
  }
}

// Input handling
const keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (e.code === "KeyM" && !e.repeat && !["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
    toggleSound();
  }
  if (e.code === "KeyP" && !e.repeat && !["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
    togglePlayerPitRequest();
  }

  // Carousel navigation in team selection screen
  if (
    document.getElementById("teamSelectionScreen").style.display !==
    "none"
  ) {
    if (e.code === "ArrowLeft") {
      e.preventDefault();
      previousTeam();
    } else if (e.code === "ArrowRight") {
      e.preventDefault();
      nextTeam();
    } else if (e.code === "Enter" && selectedTeam) {
      e.preventDefault();
      proceedToRace();
    }
  }

  // Start race with spacebar in start screen
  if (document.getElementById("startScreen").style.display !== "none") {
    if (e.code === "Space") {
      e.preventDefault();
      startRace();
    }
  }
});
document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

// Touch controls: each finger presses whichever on-screen button it is currently over
const touchKeys = {};
const touchPointers = new Map();
const touchControls = document.getElementById("touchControls");

function isControlPressed(...codes) {
  return codes.some((code) => keys[code] || touchKeys[code]);
}

function refreshTouchKeys() {
  const pressed = new Set(touchPointers.values());
  touchControls.querySelectorAll(".touch-btn").forEach((button) => {
    const code = button.dataset.control;
    touchKeys[code] = pressed.has(code);
    button.classList.toggle("pressed", touchKeys[code]);
  });
}

function controlAtPoint(x, y) {
  const element = document.elementFromPoint(x, y);
  const button = element && element.closest(".touch-btn");
  return button && touchControls.contains(button) ? button.dataset.control : null;
}

function handleTouchPointer(e) {
  if (e.type === "pointerdown") {
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch (error) {
      // Pointer capture is optional; elementFromPoint still tracks the finger
    }
  } else if (!touchPointers.has(e.pointerId)) {
    return;
  }
  e.preventDefault();
  touchPointers.set(e.pointerId, controlAtPoint(e.clientX, e.clientY));
  refreshTouchKeys();
}

function releaseTouchPointer(e) {
  if (touchPointers.delete(e.pointerId)) refreshTouchKeys();
}

function releaseAllTouchControls() {
  touchPointers.clear();
  refreshTouchKeys();
}

touchControls.addEventListener("pointerdown", handleTouchPointer);
touchControls.addEventListener("pointermove", handleTouchPointer);
touchControls.addEventListener("pointerup", releaseTouchPointer);
touchControls.addEventListener("pointercancel", releaseTouchPointer);
touchControls.addEventListener("contextmenu", (e) => e.preventDefault());
window.addEventListener("blur", releaseAllTouchControls);

// Swipe the team carousel on touch screens
const teamCarousel = document.querySelector(".team-carousel");
let carouselSwipeStart = null;
teamCarousel.addEventListener("pointerdown", (e) => {
  if (e.pointerType !== "mouse") carouselSwipeStart = { x: e.clientX, y: e.clientY };
});
teamCarousel.addEventListener("pointerup", (e) => {
  if (!carouselSwipeStart) return;
  const dx = e.clientX - carouselSwipeStart.x;
  const dy = e.clientY - carouselSwipeStart.y;
  carouselSwipeStart = null;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) nextTeam();
    else previousTeam();
  }
});
teamCarousel.addEventListener("pointercancel", () => {
  carouselSwipeStart = null;
});

// Screen layout: phones play landscape on a full-screen canvas, and the race pauses while held upright
const DESKTOP_CANVAS_WIDTH = 1400;
const DESKTOP_CANVAS_HEIGHT = 900;
const COMPACT_CANVAS_HEIGHT = 540;
const compactLandscapeQuery = window.matchMedia("(orientation: landscape) and (max-height: 540px)");
const portraitPhoneQuery = window.matchMedia("(orientation: portrait) and (max-width: 900px)");
const canLockLandscape = Boolean(
  document.documentElement.requestFullscreen && screen.orientation && screen.orientation.lock
);
let rotatePromptDismissed = false;
let layoutPaused = false;

function updateScreenLayout() {
  const compact = compactLandscapeQuery.matches;
  const width = compact
    ? Math.round((COMPACT_CANVAS_HEIGHT * window.innerWidth) / window.innerHeight)
    : DESKTOP_CANVAS_WIDTH;
  const height = compact ? COMPACT_CANVAS_HEIGHT : DESKTOP_CANVAS_HEIGHT;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  layoutPaused =
    document.body.classList.contains("touch-device") && portraitPhoneQuery.matches && !rotatePromptDismissed;
  if (layoutPaused) releaseAllTouchControls();
}

function markTouchDevice() {
  if (document.body.classList.contains("touch-device")) return;
  document.body.classList.add("touch-device");
  updateScreenLayout();
}

async function enterLandscapeFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    }
    await screen.orientation.lock("landscape");
  } catch (error) {
    // Some browsers allow full screen without orientation locking; turning the phone still works
  }
  updateScreenLayout();
}

function dismissRotatePrompt() {
  rotatePromptDismissed = true;
  document.body.classList.add("rotate-dismissed");
  updateScreenLayout();
}

if (canLockLandscape) document.body.classList.add("fullscreen-supported");
if (window.matchMedia("(pointer: coarse)").matches) markTouchDevice();
window.addEventListener(
  "pointerdown",
  (e) => {
    if (e.pointerType === "touch") markTouchDevice();
  },
  { passive: true }
);
window.addEventListener("resize", updateScreenLayout);
window.addEventListener("orientationchange", updateScreenLayout);
updateScreenLayout();

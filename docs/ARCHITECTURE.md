# Architecture

Eoin's Racing Game is a single-page HTML5 Canvas game. There is no framework, bundler or server: `index.html` loads a handful of stylesheets and scripts and everything runs in the browser, with records kept in `localStorage`.

## Scripts and what they own

The scripts are classic `<script>` tags that share one global scope, loaded in this order:

| File | Owns |
| --- | --- |
| `js/teams.js` | Team themes (CSS variables per livery), the team carousel, colour contrast helpers, `proceedToRace()` |
| `js/state.js` | Canvas and context, camera, race state flags, the fixed-step clock (`SIMULATION_STEP_MS`, `gameNow()`), difficulty and weather settings, lap timing variables |
| `js/leaderboards.js` | Race and Time Trial leaderboards, import/export, `escapeHtml()`, difficulty/weather/mode pickers |
| `js/input.js` | Keyboard state, touch controls, carousel swipe, screen layout (`updateScreenLayout()`), fullscreen and rotate prompt |
| `js/world.js` | The circuit (`track`), the smoothed centreline (`track.path`), the `player` object, `aiCars`, grid slots, render interpolation (`renderPose()`) |
| `js/ai-teams.js` | The 16 teams' attributes and the randomise/reset helpers |
| `js/effects.js` | Tyre marks, sparks, flames, rain and lightning |
| `js/ai-cars.js` | `createAICars()`: builds the field from the teams and difficulty |
| `js/collisions.js` | Car-to-car collisions, damage, the grip model |
| `js/player.js` | Player input handling, steering, nitro, tyre wear, Time Trial lap completion |
| `js/ai.js` | AI driving: waypoints, overtaking and defending, braking, nitro |
| `js/race.js` | Checkpoints, lap counting, race completion, standings, gaps, the standings panel |
| `js/track-collision.js` | On/off-track detection along `track.path`, kerb and grass penalties |
| `js/render-track.js` | The baked track layer (tarmac, kerbs, start line, gates) and grass |
| `js/render-cars.js` | Car sprites, wheels, effects, team codes |
| `js/ui.js` | Telemetry and broadcast bar updates, race complete screen |
| `js/audio.js` | Web Audio: engine loops, screech, nitro, impacts, mute |
| `js/game.js` | `updateSimulationStep()`, `gameLoop()`, `startRace()`, restart and return to menu |

## A frame

`gameLoop(timestamp)` runs on `requestAnimationFrame`:

1. The elapsed time is added to an accumulator (zero while the tab is hidden or the portrait prompt is up). While the accumulator holds at least one `SIMULATION_STEP_MS` (1/60 s), `updateSimulationStep()` runs: player physics, AI, collisions, checkpoints, standings, camera. `gameNow()` returns this simulation clock, so lap times do not depend on the display's refresh rate.
2. `renderAlpha` is the fraction of a step left in the accumulator. Cars and the camera are drawn at poses blended between the previous and current step (`renderPose()`), which keeps motion smooth at 120 Hz and 144 Hz.
3. Drawing: grass, the pre-rendered track layer, tyre marks, flames, cars (a cached sprite per livery plus live wheels), sparks, weather, then the DOM HUD is updated in `updateUI()`.
4. `updateAudio()` sets engine pitch and volume from speed and throttle, screech from grip usage, and silences everything when the race is not running.

## The circuit

`track.waypoints` are the corner points the AI aims for. `buildTrackPath()` runs a centripetal Catmull-Rom spline through them to produce `track.path`, which is what is drawn and what `isPointOnTrack()` measures against, so the kerbs you see are the kerbs that cost you grip. `getTrackLayer()` paints the whole circuit once per weather setting into an offscreen canvas; `drawTrack()` blits the visible part.

## Persistence

| Key | Contents |
| --- | --- |
| `circuitRacerLeaderboard` | Race results, top 10 per weather and difficulty, ranked by finishing position then time |
| `circuitRacerTimeTrialLeaderboard` | Time Trial laps |
| `circuitRacerLapRecord` | All-time fastest race lap |
| `circuitRacerSoundMuted` | `"1"` when sound is off |

Imported records are validated (name must be a non-empty string, time a positive finite number) and escaped before display.

## Mobile

A device is treated as touch once `(pointer: coarse)` matches or a touch pointer is seen. In landscape under 540 px tall the canvas is resized to fill the screen at the device's aspect ratio (`updateScreenLayout()`), and on-screen controls appear. In portrait a prompt asks the player to turn the phone and the simulation pauses until they do or dismiss it.

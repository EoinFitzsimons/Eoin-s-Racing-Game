# Changelog

Notable changes to Eoin's Racing Game. Entries reference the pull request that made them.

## Unreleased

- Split `index.html` into `css/` and `js/` files, added `CONTRIBUTING.md`, `docs/ARCHITECTURE.md` and this changelog.

## 2026-11

- Engine sound now comes from a recorded Formula 1 car, crossfaded and pitched with the revs; overall volume lowered; kerb stripes restored; grid laid out along the circuit (#12).
- Telemetry and standings moved into fixed rails beside the canvas; the canvas keeps its aspect ratio instead of being squashed (#11).
- Smooth spline circuit with striped kerbs, cars redrawn as F1 sprites with steering wheels and a rain light, render interpolation between physics steps, and sound: engine, nearby AI engines, tyre screech, nitro, collisions, mute toggle (#10).
- Touch controls, landscape layout for phones, portrait prompt with pause, fullscreen and orientation lock where supported (#8, #9).
- Fixed-step physics independent of refresh rate, first lap timed, Time Trial records a single lap, standings correct on the opening lap, leaderboards ranked by position then time and split by weather and difficulty, imported names escaped, lap record saved, HUD overlaps and team colour contrast fixed, README and launch config updated (#7).

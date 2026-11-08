# Contributing

Thanks for helping with Eoin's Racing Game. The project is deliberately dependency-free: plain HTML, CSS and JavaScript with no build step, so anyone can clone it and play by opening a page.

## Running the game locally

The engine sound is loaded with `fetch()`, which browsers block for `file://` pages, so serve the folder over HTTP:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

Any static server works (`npx serve`, VS Code Live Server, and so on). Opening `index.html` straight from disk still runs, but falls back to the synthesised engine.

## Project layout

```
index.html        Markup only: screens, HUD, touch controls, modals
css/              Stylesheets, loaded in cascade order
  base.css        Reset, theme variables, page layout, canvas
  screens.css     Team selection, start screen, leaderboards, mode/difficulty/weather pickers
  hud.css         Broadcast bar, telemetry and standings rails, responsive rules
  mobile.css      Touch controls, rotate prompt, compact landscape layout
js/               Classic scripts sharing one global scope, loaded in dependency order
assets/audio/     Engine loops (see README credits)
docs/             Architecture notes
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for what each script owns and how a frame is processed.

## Making changes

- Keep the no-build, no-framework approach. New code goes in the existing `js/` file for its area, or a new file added to the `<script>` list in `index.html` after everything it depends on.
- Scripts are classic (not modules) on purpose: the markup uses inline `onclick` handlers and the files share globals. A later file may use anything declared in an earlier one; a top-level statement must not call into a later file.
- Use British English in code, comments and copy (`colour`, `initialise`, `tyre`), matching the existing text.
- Two-space indentation, double quotes, semicolons; follow the style of the surrounding code. `.editorconfig` covers the basics.
- Game logic runs in fixed 60 Hz steps (`SIMULATION_STEP_MS`). Anything that moves a car or counts time belongs in `updateSimulationStep()`; drawing happens once per animation frame and must not change game state.
- Don't trust saved or imported data: anything from `localStorage` or an imported JSON file is escaped with `escapeHtml()` before it is put in the page.

## Checking your change

There is no automated test suite yet. Before opening a pull request:

1. Serve the folder and open it in Chrome and one other browser with the console open. There should be no errors.
2. Play at least one Time Trial lap and the start of a Race, and check the thing you changed.
3. If you touched layout, also try a phone-sized window in landscape (about 844×390) and portrait.
4. If you touched physics, timing or standings, make sure a five-lap race still records five lap times and the leaderboards still save.

Scripted checks are welcome: Playwright (Python or Node) against the local server works well for driving the car and reading game state.

## Pull requests

- One topic per pull request, with a title that says what changed for the player.
- Include before/after screenshots for visual changes.
- Base follow-up work on `main`, not on another open pull request's branch.
- Note anything you could not test (a real phone, a particular browser) in the description.

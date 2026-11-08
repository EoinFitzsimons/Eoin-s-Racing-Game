# Eoin's Racing Game

A top-down Formula 1 style racing game for the browser. Pick one of 16 teams, race a 15-car field over five laps or set a Time Trial lap, in clear weather, rain or a storm. Plain HTML, CSS and JavaScript with no build step; works on desktop and on phones in landscape.

## Play

Serve the folder and open it in a browser (the engine sound is fetched, which `file://` pages block):

```bash
git clone https://github.com/EoinFitzsimons/Eoin-s-Racing-Game.git
cd Eoin-s-Racing-Game
python3 -m http.server 8000
# open http://localhost:8000/
```

Opening `index.html` straight from disk also works, with a synthesised engine instead of the recording.

### Controls

| Key | Action |
| --- | --- |
| **W** / **↑** | Accelerate |
| **S** / **↓** | Brake / reverse |
| **A** / **←** | Turn left |
| **D** / **→** | Turn right |
| **SPACE** | Nitro boost |
| **M** | Sound on/off |

On a phone or tablet, steering arrows sit at the bottom left and NITRO, BRAKE and THROTTLE at the bottom right. Several buttons can be held at once and a thumb can slide between left and right. Swipe the team carousel to browse teams. The game plays in landscape: held upright it asks you to turn the phone and pauses until you do (or choose "Continue in portrait"). Where the browser allows it (Chrome on Android), **Play in Landscape** and **Full Screen** go full screen and lock the orientation; on iPhone turn the phone, or add the game to the home screen to lose the browser bars.

## Features

- **16 teams**, each with speed, acceleration, handling, braking, reliability and tyre management on a 1–20 scale, a livery colour that themes the whole interface, and matching AI behaviour.
- **Race mode**: five laps against 15 AI cars that overtake, defend, use nitro and make mistakes according to difficulty (Easy, Medium, Hard). Collision protection for the first 15 seconds of the race.
- **Time Trial**: one flying lap on an empty track, with a best-times list and exportable records.
- **Weather**: clear, rain and storm change grip, visibility, the look of the track and the tyre compound.
- **Physics**: fixed-step simulation so lap times are identical on every monitor; grip, tyre wear, damage and off-track penalties; kerbs cost grip, grass costs a lot more.
- **Leaderboards** kept in the browser: race results ranked by finishing position then time, top 10 for each weather and difficulty combination; Time Trial laps; the all-time lap record.
- **Sound**: a recorded Formula 1 engine pitched with the revs through seven gears, nearby AI engines, tyre screech as grip runs out, nitro, collisions.
- **Broadcast-style HUD**: telemetry and live standings in rails either side of the track, lap and sector timing in the bar below.

## Teams

| Team | Code | Country | Speed | Accel | Handling | Braking | Reliability | Tyres |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Emerald Isle Racing | EIR | Ireland | 12 | 10 | 14 | 12 | 7 | 10 |
| Dragon Force Motorsport | DFM | Wales | 14 | 16 | 8 | 9 | 8 | 7 |
| Highland Racing Team | HRT | Scotland | 8 | 9 | 16 | 13 | 9 | 12 |
| Britannia Motors | BRT | England | 18 | 12 | 8 | 11 | 6 | 3 |
| Tricolore Racing | TCR | France | 11 | 11 | 12 | 12 | 9 | 14 |
| Kaiser Motorsport | KMS | Germany | 13 | 13 | 7 | 16 | 6 | 6 |
| Iberian Speed | IBS | Spain | 15 | 12 | 10 | 8 | 8 | 7 |
| Veloce Italia | VIT | Italy | 16 | 18 | 9 | 8 | 4 | 5 |
| Adriatic Racing | ADR | Croatia | 10 | 11 | 11 | 11 | 9 | 8 |
| Liberty Racing | LBR | USA | 17 | 14 | 6 | 8 | 11 | 4 |
| Rising Sun Motors | RSM | Japan | 11 | 12 | 14 | 13 | 4 | 6 |
| Celestial Motors | CEM | China | 16 | 10 | 8 | 11 | 9 | 6 |
| Maharaja Motors | MHJ | India | 9 | 10 | 10 | 9 | 15 | 7 |
| Samba Racing Team | SRT | Brazil | 12 | 19 | 13 | 7 | 5 | 4 |
| Velocidad Venezuela | VVR | Venezuela | 7 | 9 | 13 | 14 | 9 | 8 |
| Regina Curse | RGC | Romania | 9 | 8 | 10 | 12 | 13 | 8 |

Ratings can be randomised from the team screen for a different balance, and reset to these defaults.

## Project structure

```
index.html          Markup only
css/                Stylesheets (base, screens, hud, mobile)
js/                 Game code as classic scripts loaded in order (see docs/ARCHITECTURE.md)
assets/audio/       Engine loops
docs/               Architecture notes
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to run, change and check the game, [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the code fits together, and [CHANGELOG.md](CHANGELOG.md) for what has changed.

## Browser support

Current Chrome, Edge, Firefox and Safari on desktop; Chrome and Safari on phones and tablets. Orientation locking needs Chrome on Android; everything else works everywhere.

## Credits

- Engine loops are cut from ["F-1raceCar-IdleAndRaceStartDemo"](https://freesound.org/people/Ears68/sounds/181187/) by Ears68 on Freesound, released under CC0 (public domain).
- Orbitron typeface from Google Fonts.


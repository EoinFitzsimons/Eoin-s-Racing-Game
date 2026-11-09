# Eoin's Racing Game

A top-down Formula 1 style racing game for the browser. Pick one of 16 teams, choose one of six circuits, then race a 15-car field over five laps or set a Time Trial lap, in clear weather, rain or a storm. Plain HTML, CSS and JavaScript with no build step; works on desktop and on phones in landscape.

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
| **P** | Request a pit stop (Race mode): box at the end of the lap for tyres, repairs and fuel |
| **M** | Sound on/off |

On a phone or tablet, steering arrows sit at the bottom left and NITRO, BRAKE and THROTTLE at the bottom right. Several buttons can be held at once and a thumb can slide between left and right. Swipe the team carousel to browse teams. The game plays in landscape: held upright it asks you to turn the phone and pauses until you do (or choose "Continue in portrait"). Where the browser allows it (Chrome on Android), **Play in Landscape** and **Full Screen** go full screen and lock the orientation; on iPhone turn the phone, or add the game to the home screen to lose the browser bars.

## Features

- **16 teams**, each rated 1–20 on thirteen car and driver attributes (see below) shown as a radar chart and bars with tooltips on the team screen, a livery colour that themes the whole interface, and AI drivers whose behaviour comes from the same ratings. Ratings can be randomised and reset.
- **Six circuits** chosen before the race from mini-maps drawn from each centreline: the original glen circuit plus five layouts inspired by famous tracks (see below). Kerbs, collision, AI racing lines, the in-race minimap and the pit lane all come from the circuit data.
- **Pit stops**: press **P** to box at the end of the lap; the car follows the pit lane at the speed limit, waits at the box for a time set by the team's pit-crew rating, and rejoins with fresh tyres, repaired damage and a full tank. AI drivers pit when their tyres, damage or fuel demand it.
- **Fuel**: a full tank blunts acceleration and cornering; the car sharpens as fuel burns off. Fuel efficiency sets the burn rate; run dry and the car limps.
- **Race mode**: five laps against 15 AI cars that overtake, defend, use nitro and make mistakes according to difficulty (Easy, Medium, Hard). Collision protection for the first 15 seconds of the race.
- **Time Trial**: one flying lap on an empty track, with a best-times list and exportable records.
- **Weather**: clear, rain and storm change grip, visibility, the look of the track and the tyre compound. How much grip a car keeps in the wet depends on its wet-weather rating.
- **Physics**: fixed-step simulation so lap times are identical on every monitor; grip, tyre wear, damage and off-track penalties; kerbs cost grip, grass costs a lot more.
- **Leaderboards** kept in the browser: race results ranked by finishing position then time, top 10 for each circuit, weather and difficulty combination; Time Trial laps; a lap record for every circuit.
- **Sound**: a recorded Formula 1 engine pitched with the revs through seven gears, nearby AI engines, tyre screech as grip runs out, nitro, collisions.
- **Broadcast-style HUD**: telemetry and live standings in rails either side of the track, lap and sector timing in the bar below.

## Teams

Every team is rated 1–20 on thirteen attributes, roughly 135 points in total, and the same ratings drive the player's car and the AI:

| Attribute | Effect |
| --- | --- |
| Top Speed (SPD) | Maximum straight-line speed |
| Acceleration (ACC) | How quickly the car reaches top speed out of corners |
| Cornering Grip (GRP) | Mechanical grip: how sharply the car turns |
| Braking (BRK) | Stopping power into corners |
| Aero Efficiency (AER) | Low drag: more top speed, less speed lost coasting |
| Downforce (DWN) | Extra turning grip at the cost of some top speed |
| Fuel Efficiency (FUE) | Burns less fuel, so the car sheds weight and stays quick |
| Tyre Management (TYR) | Slower tyre wear |
| Reliability (REL) | Resistance to damage from contact |
| Pit Crew (PIT) | Shorter pit stops |
| Wet Weather (WET) | Grip kept in rain and storms |
| Consistency (CON) | Smaller lap-time variance and fewer driver wobbles or AI mistakes |
| Aggression (AGG) | More overtaking attempts and a stronger nitro, but harder contact and more damage |

| Team | Code | Country | SPD | ACC | GRP | BRK | AER | DWN | FUE | TYR | REL | PIT | WET | CON | AGG |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Emerald Isle Racing | EIR | Ireland | 10 | 9 | 14 | 11 | 7 | 10 | 12 | 10 | 6 | 15 | 7 | 8 | 12 |
| Dragon Force Motorsport | DFM | Wales | 17 | 17 | 8 | 11 | 13 | 4 | 11 | 7 | 8 | 10 | 14 | 13 | 6 |
| Highland Racing Team | HRT | Scotland | 8 | 9 | 16 | 13 | 10 | 12 | 14 | 12 | 9 | 12 | 9 | 8 | 6 |
| Britannia Motors | BRT | England | 19 | 13 | 8 | 12 | 12 | 6 | 12 | 3 | 7 | 17 | 8 | 12 | 9 |
| Tricolore Racing | TCR | France | 11 | 10 | 12 | 12 | 9 | 10 | 13 | 13 | 8 | 10 | 10 | 9 | 6 |
| Kaiser Motorsport | KMS | Germany | 14 | 14 | 8 | 16 | 10 | 11 | 10 | 6 | 6 | 7 | 13 | 12 | 8 |
| Iberian Speed | IBS | Spain | 15 | 12 | 10 | 8 | 12 | 8 | 14 | 7 | 8 | 11 | 10 | 12 | 12 |
| Veloce Italia | VIT | Italy | 16 | 18 | 9 | 8 | 11 | 12 | 8 | 6 | 5 | 11 | 15 | 7 | 8 |
| Adriatic Racing | ADR | Croatia | 10 | 12 | 13 | 12 | 8 | 12 | 14 | 10 | 9 | 8 | 6 | 15 | 4 |
| Liberty Racing | LBR | USA | 17 | 14 | 7 | 9 | 12 | 9 | 10 | 4 | 11 | 14 | 7 | 14 | 12 |
| Rising Sun Motors | RSM | Japan | 12 | 12 | 17 | 13 | 7 | 10 | 14 | 8 | 6 | 12 | 11 | 6 | 11 |
| Celestial Motors | CEM | China | 15 | 9 | 8 | 11 | 12 | 9 | 8 | 6 | 9 | 13 | 11 | 14 | 11 |
| Maharaja Motors | MHJ | India | 12 | 13 | 12 | 10 | 6 | 6 | 13 | 7 | 16 | 16 | 8 | 12 | 8 |
| Samba Racing Team | SRT | Brazil | 12 | 20 | 13 | 7 | 10 | 12 | 14 | 5 | 5 | 11 | 14 | 6 | 8 |
| Velocidad Venezuela | VVR | Venezuela | 9 | 9 | 14 | 15 | 4 | 9 | 20 | 8 | 10 | 11 | 10 | 15 | 4 |
| Regina Curse | RGC | Romania | 9 | 8 | 9 | 11 | 10 | 11 | 12 | 8 | 12 | 16 | 6 | 14 | 9 |

Ratings can be randomised from the team screen for a different balance, and reset to these defaults.

## Circuits

Circuit names are our own; the shapes are inspired by famous tracks.

| Circuit | Country | Inspired by | Character |
| --- | --- | --- | --- |
| Gleann Luais | Ireland | The original circuit: a flowing glen with a long ridge straight and a tight hairpin | Flowing |
| Lombardy Park | Italy | Monza: long straights broken by chicanes, a sweeping Curva Grande and a long parabolic final bend | Top speed |
| Ardennes Forest | Belgium | Spa-Francorchamps: a hairpin after the line, the Eau Rouge and Raidillon climb, the Kemmel straight and double-apex Pouhon | High speed |
| Northampton Aerodrome | England | Silverstone: Copse into the Maggotts, Becketts and Chapel esses, the Hangar straight and the Luffield loop | Fast sweeps |
| Ise Bay | Japan | Suzuka: a figure-of-eight with a crossover, the esses, a hairpin, Spoon and the flat-out 130R | Technical |
| Harbour Street Circuit | Monaco | Monaco: a narrow street circuit with a tight first corner, a climb, a hairpin, a tunnel bend, a chicane and the swimming-pool esses | Street |

Each circuit is a list of centreline points, a width, two sector gates and a pit-lane side in `js/circuits.js`; everything else (kerbs, collision, AI lines, minimap, records) is derived from that.

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


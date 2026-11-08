/**
 * Main Game Loop - Core Engine
 * Executes every frame to update game state and render all visual elements.
 * This function coordinates all game systems in the correct order.
 */
/**
 * Sound System
 *
 * Every sound is synthesised with the Web Audio API, so no audio files are needed:
 * engine notes that rise through the gears (player plus the nearest AI cars), tyre
 * screech that builds as grip runs out, a nitro hiss, and impact sounds for collisions
 * and excursions off the track. The AudioContext is created on the first user gesture.
 */
const SOUND_MUTED_KEY = "circuitRacerSoundMuted";
const MASTER_LEVEL = 0.45;
// Engine loops cut from a Formula 1 car recording (Freesound #181187 by Ears68, CC0):
// a 200 Hz idle and a 538 Hz full-throttle scream, pitched up and down with the revs
const ENGINE_SAMPLES = {
  idle: "assets/audio/engine-idle.mp3",
  high: "assets/audio/engine-high.mp3",
};
const ENGINE_GEARS = 7;
const AI_ENGINE_VOICES = 3;
let soundMuted = localStorage.getItem(SOUND_MUTED_KEY) === "1";
let audio = null;

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function createNoiseBuffer(context, seconds = 2) {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * seconds), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function softClipCurve(amount) {
  const curve = new Float32Array(512);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = ((1 + amount) * x) / (1 + amount * Math.abs(x));
  }
  return curve;
}

function createPanner(context, destination) {
  if (typeof context.createStereoPanner !== "function") return null;
  const panner = context.createStereoPanner();
  panner.connect(destination);
  return panner;
}

function smoothstep(edge0, edge1, value) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function createSampleLayer(context, buffer, destination) {
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const gain = context.createGain();
  gain.gain.value = 0;
  source.connect(gain);
  gain.connect(destination);
  source.start();
  return { source, gain };
}

function createEngineVoice(context, destination) {
  if (audio.engineBuffers) {
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 0.7;
    const gain = context.createGain();
    gain.gain.value = 0;
    const panner = createPanner(context, destination);
    filter.connect(gain);
    gain.connect(panner || destination);
    return {
      sampled: true,
      idle: createSampleLayer(context, audio.engineBuffers.idle, filter),
      high: createSampleLayer(context, audio.engineBuffers.high, filter),
      filter,
      gain,
      panner,
      gear: -2,
      level: 0,
    };
  }
  const oscillators = [
    { node: context.createOscillator(), type: "sawtooth", ratio: 1, detune: 0 },
    { node: context.createOscillator(), type: "square", ratio: 0.5, detune: 6 },
    { node: context.createOscillator(), type: "sawtooth", ratio: 2, detune: -5 },
  ];
  const shaper = context.createWaveShaper();
  shaper.curve = softClipCurve(2.5);
  shaper.oversample = "2x";
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 1.1;
  const gain = context.createGain();
  gain.gain.value = 0;
  const panner = createPanner(context, destination);

  oscillators.forEach((oscillator) => {
    oscillator.node.type = oscillator.type;
    oscillator.node.detune.value = oscillator.detune;
    oscillator.node.connect(shaper);
    oscillator.node.start();
  });
  shaper.connect(filter);
  filter.connect(gain);
  gain.connect(panner || destination);

  return { oscillators, filter, gain, panner, gear: -2, level: 0 };
}

function setEngineVoice(voice, rpm, throttle, level, pan) {
  const context = audio.context;
  const now = context.currentTime;
  if (voice.sampled) {
    // Crossfade from the idle loop to the full-throttle loop as the revs rise, pitching both
    const highMix = smoothstep(0.12, 0.5, rpm);
    voice.idle.gain.gain.setTargetAtTime(1 - highMix, now, 0.06);
    voice.high.gain.gain.setTargetAtTime(highMix, now, 0.06);
    voice.idle.source.playbackRate.setTargetAtTime(0.85 + rpm * 1.5, now, 0.05);
    voice.high.source.playbackRate.setTargetAtTime(0.32 + rpm * 0.93, now, 0.05);
    voice.filter.frequency.setTargetAtTime(900 + rpm * 2600 + throttle * 3500, now, 0.08);
  } else {
    const fundamental = 42 + rpm * 205;
    voice.oscillators.forEach((oscillator) => {
      oscillator.node.frequency.setTargetAtTime(fundamental * oscillator.ratio, now, 0.03);
    });
    voice.filter.frequency.setTargetAtTime(240 + rpm * 1900 + throttle * 900, now, 0.05);
  }
  voice.gain.gain.setTargetAtTime(level, now, 0.05);
  if (voice.panner) voice.panner.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), now, 0.08);
  voice.level = level;
}

// Gear and rev estimate from how close the car is to its top speed
function estimateEngineState(car, throttle) {
  const speed = Math.hypot(car.velocity.x, car.velocity.y);
  const ratio = clamp01(speed / (car.maxSpeed * 1.3));
  if (ratio < 0.025) return { rpm: 0.12 + throttle * 0.3, gear: -1 };
  const shaped = Math.pow(ratio, 0.75) * ENGINE_GEARS;
  const gear = Math.min(ENGINE_GEARS - 1, Math.floor(shaped));
  return { rpm: 0.36 + (shaped - gear) * 0.64, gear };
}

function createScreechVoice(context, destination) {
  const source = context.createBufferSource();
  source.buffer = audio.noiseBuffer;
  source.loop = true;
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  filter.Q.value = 1.6;
  const gain = context.createGain();
  gain.gain.value = 0;
  const panner = createPanner(context, destination);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(panner || destination);
  source.start();
  return { filter, gain, panner };
}

function setScreechVoice(voice, usage, pan) {
  const now = audio.context.currentTime;
  const wetFactor = gameWeather === "clear" ? 1 : 0.5;
  const level = Math.pow(clamp01(usage), 1.8) * 0.22 * wetFactor;
  voice.gain.gain.setTargetAtTime(level, now, 0.06);
  voice.filter.frequency.setTargetAtTime(1700 + usage * 900 + (Math.random() - 0.5) * 120, now, 0.05);
  if (voice.panner) voice.panner.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), now, 0.08);
}

async function loadEngineSamples(context) {
  const entries = await Promise.all(
    Object.entries(ENGINE_SAMPLES).map(async ([name, url]) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${url}: ${response.status}`);
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      return [name, buffer];
    })
  );
  return Object.fromEntries(entries);
}

function ensureAudio() {
  if (audio) {
    if (audio.context.state === "suspended") audio.context.resume().catch(() => {});
    return audio;
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  const context = new AudioContextClass();
  const master = context.createGain();
  master.gain.value = soundMuted ? 0 : MASTER_LEVEL;
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -14;
  compressor.ratio.value = 6;
  master.connect(compressor);
  compressor.connect(context.destination);
  audio = { context, master, noiseBuffer: createNoiseBuffer(context), engineBuffers: null };

  loadEngineSamples(context)
    .then((buffers) => {
      audio.engineBuffers = buffers;
    })
    .catch(() => {
      // Opened from disk or offline: fall back to the synthesised engine
    })
    .finally(() => {
      audio.playerEngine = createEngineVoice(context, master);
      audio.aiEngines = Array.from({ length: AI_ENGINE_VOICES }, () => createEngineVoice(context, master));
    });
  audio.playerScreech = createScreechVoice(context, master);
  audio.aiScreech = createScreechVoice(context, master);

  const nitroSource = context.createBufferSource();
  nitroSource.buffer = audio.noiseBuffer;
  nitroSource.loop = true;
  const nitroFilter = context.createBiquadFilter();
  nitroFilter.type = "highpass";
  nitroFilter.frequency.value = 2600;
  const nitroGain = context.createGain();
  nitroGain.gain.value = 0;
  nitroSource.connect(nitroFilter);
  nitroFilter.connect(nitroGain);
  nitroGain.connect(master);
  nitroSource.start();
  audio.nitroGain = nitroGain;

  return audio;
}

function setSoundMuted(muted) {
  soundMuted = muted;
  localStorage.setItem(SOUND_MUTED_KEY, muted ? "1" : "0");
  if (audio) audio.master.gain.setTargetAtTime(muted ? 0 : MASTER_LEVEL, audio.context.currentTime, 0.02);
  document.querySelectorAll(".sound-toggle").forEach((button) => {
    button.textContent = muted ? "Sound: Off" : "Sound: On";
    button.setAttribute("aria-pressed", muted ? "false" : "true");
  });
}

function toggleSound() {
  setSoundMuted(!soundMuted);
  if (!soundMuted) ensureAudio();
}

function silenceAudio() {
  if (!audio) return;
  const now = audio.context.currentTime;
  if (audio.playerEngine) {
    [audio.playerEngine, ...audio.aiEngines].forEach((voice) => voice.gain.gain.setTargetAtTime(0, now, 0.05));
  }
  [audio.playerScreech, audio.aiScreech].forEach((voice) => voice.gain.gain.setTargetAtTime(0, now, 0.05));
  audio.nitroGain.gain.setTargetAtTime(0, now, 0.05);
}

function proximityLevel(x, y) {
  const distance = Math.hypot(x - player.x, y - player.y);
  return Math.pow(clamp01(1 - distance / 900), 1.5);
}

function panFor(x) {
  return (x - player.x) / (canvas.width / 2);
}

// How hard the player's tyres are working: slip angle, hard braking or heavy steering at speed
function playerGripUsage() {
  const speed = Math.hypot(player.velocity.x, player.velocity.y);
  if (speed < 1.5 || player.surface === "grass") return 0;
  const movementAngle = Math.atan2(player.velocity.y, player.velocity.x);
  const slip = Math.abs(normalizeAngle(player.angle - movementAngle));
  let usage = (slip - 0.08) / 0.28;
  if (player.brakeInput && speed > 3.5) usage = Math.max(usage, Math.min(0.6, speed / 12));
  if (Math.abs(player.steerInput || 0) > 0 && speed > 4.5) usage = Math.max(usage, 0.2 + (speed - 4.5) / 8);
  return clamp01(usage);
}

function updateAudio() {
  if (!audio) return;
  if (!gameRunning || layoutPaused || document.hidden || soundMuted) {
    silenceAudio();
    return;
  }

  setScreechVoice(audio.playerScreech, playerGripUsage(), 0);
  audio.nitroGain.gain.setTargetAtTime(player.usingNitro ? 0.08 : 0, audio.context.currentTime, 0.06);
  if (!audio.playerEngine) return;

  const throttle = player.throttleInput || 0;
  const engine = estimateEngineState(player, throttle);
  const voice = audio.playerEngine;
  const level = 0.3 + throttle * 0.12 + (player.usingNitro ? 0.06 : 0);
  setEngineVoice(voice, engine.rpm, throttle, level, 0);
  if (voice.gear !== engine.gear && voice.gear !== -2 && engine.gear >= 0) {
    // Brief lift on the gear change, scheduled after the steady level so it is not overridden
    const now = audio.context.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setTargetAtTime(level * 0.35, now, 0.01);
    voice.gain.gain.setTargetAtTime(level, now + 0.07, 0.03);
  }
  voice.gear = engine.gear;

  if (isTimeTrialMode) {
    audio.aiEngines.forEach((aiVoice) => setEngineVoice(aiVoice, 0.2, 0, 0, 0));
    setScreechVoice(audio.aiScreech, 0, 0);
  } else {
    const nearest = aiCars
      .map((car) => ({ car, distance: Math.hypot(car.x - player.x, car.y - player.y) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, AI_ENGINE_VOICES);
    audio.aiEngines.forEach((aiVoice, index) => {
      const entry = nearest[index];
      if (!entry) {
        setEngineVoice(aiVoice, 0.2, 0, 0, 0);
        return;
      }
      const accelerating = entry.car.speed >= (entry.car.previousSpeedForAudio || 0) - 0.005;
      entry.car.previousSpeedForAudio = entry.car.speed;
      const aiThrottle = accelerating ? 0.9 : 0.2;
      const aiEngine = estimateEngineState(entry.car, aiThrottle);
      const attenuation = Math.pow(clamp01(1 - entry.distance / 650), 2);
      setEngineVoice(aiVoice, aiEngine.rpm, aiThrottle, 0.12 * attenuation, panFor(entry.car.x));
    });

    let aiUsage = 0;
    let aiPan = 0;
    aiCars.forEach((car) => {
      if (!car.isSliding || car.surface === "grass") return;
      const weight = Math.pow(clamp01(1 - Math.hypot(car.x - player.x, car.y - player.y) / 600), 2);
      if (weight > aiUsage) {
        aiUsage = weight;
        aiPan = panFor(car.x);
      }
    });
    setScreechVoice(audio.aiScreech, aiUsage * 0.6, aiPan);
  }

}

function playImpactSound(x, y, severity) {
  if (!audio || soundMuted || layoutPaused) return;
  const level = clamp01(severity) * proximityLevel(x, y);
  if (level < 0.02) return;
  const context = audio.context;
  const now = context.currentTime;
  const output = createPanner(context, audio.master) || audio.master;
  if (output.pan) output.pan.value = Math.max(-1, Math.min(1, panFor(x)));

  const thump = context.createOscillator();
  thump.type = "sine";
  thump.frequency.setValueAtTime(160, now);
  thump.frequency.exponentialRampToValueAtTime(42, now + 0.14);
  const thumpGain = context.createGain();
  thumpGain.gain.setValueAtTime(level * 0.9, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  thump.connect(thumpGain);
  thumpGain.connect(output);
  thump.start(now);
  thump.stop(now + 0.25);

  const crunch = context.createBufferSource();
  crunch.buffer = audio.noiseBuffer;
  const crunchFilter = context.createBiquadFilter();
  crunchFilter.type = "lowpass";
  crunchFilter.frequency.setValueAtTime(1400, now);
  crunchFilter.frequency.exponentialRampToValueAtTime(300, now + 0.2);
  const crunchGain = context.createGain();
  crunchGain.gain.setValueAtTime(level * 0.7, now);
  crunchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
  crunch.connect(crunchFilter);
  crunchFilter.connect(crunchGain);
  crunchGain.connect(output);
  crunch.start(now);
  crunch.stop(now + 0.26);

  [920, 1460].forEach((frequency) => {
    const clank = context.createOscillator();
    clank.type = "triangle";
    clank.frequency.value = frequency * (0.95 + Math.random() * 0.1);
    const clankGain = context.createGain();
    clankGain.gain.setValueAtTime(level * 0.22, now);
    clankGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    clank.connect(clankGain);
    clankGain.connect(output);
    clank.start(now);
    clank.stop(now + 0.12);
  });
}

function playOffTrackSound(car) {
  if (!audio || soundMuted || layoutPaused) return;
  const now = gameNow();
  if (car.lastOffTrackSoundTime && now - car.lastOffTrackSoundTime < 500) return;
  car.lastOffTrackSoundTime = now;
  const level = clamp01(Math.hypot(car.velocity.x, car.velocity.y) / 8) * proximityLevel(car.x, car.y) * 0.4;
  if (level < 0.02) return;
  const context = audio.context;
  const time = context.currentTime;
  const rumble = context.createBufferSource();
  rumble.buffer = audio.noiseBuffer;
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 320;
  const gain = context.createGain();
  gain.gain.setValueAtTime(level, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
  rumble.connect(filter);
  filter.connect(gain);
  gain.connect(audio.master);
  rumble.start(time);
  rumble.stop(time + 0.4);
}

document.addEventListener("visibilitychange", () => {
  if (!audio) return;
  if (document.hidden) audio.context.suspend().catch(() => {});
  else if (!soundMuted) audio.context.resume().catch(() => {});
});
["pointerdown", "keydown"].forEach((type) =>
  document.addEventListener(type, () => {
    if (audio && audio.context.state === "suspended" && !document.hidden) audio.context.resume().catch(() => {});
  })
);
setSoundMuted(soundMuted);

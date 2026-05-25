export const DEFAULT_NBACK_CONFIG = {
  colours:                ['red', 'blue', 'green', 'yellow'],
  warmupTrials:           10,
  warmupN:                1,
  twoBackWarmupTrials:    6,   
  scoredTrials:           40,
  scoredN:                2,
  targetRatio:            0.33,
  stimulusMs:             500,
  isiMs:                  2000,
  maxConsecutiveTargets:  2,
  maxConsecutiveNonTargets: 4,
};
export { DEFAULT_NBACK_CONFIG as NBACKCONFIG };

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }


function generateNBackSequence(n, totalTrials, targetRatio, config) {
  const targetCount = Math.round(totalTrials * targetRatio);
  const sequence    = [];
  for (let i = 0; i < n; i++) sequence.push(randomFrom(config.colours));
  let targetsPlaced = 0, consecutiveTargets = 0, consecutiveNonTargets = 0;
  for (let i = n; i < totalTrials + n; i++) {
    const remainingTargets = targetCount - targetsPlaced;
    const mustBeTarget     = remainingTargets >= (totalTrials + n) - i;
    const mustBeNonTarget  =
      consecutiveTargets    >= config.maxConsecutiveTargets    ||
      consecutiveNonTargets >= config.maxConsecutiveNonTargets ||
      remainingTargets      <= 0;
    const isTarget = mustBeTarget ? true : mustBeNonTarget ? false : Math.random() < targetRatio;
    let colour;
    if (isTarget) {
      colour = sequence[i - n];
      targetsPlaced++; consecutiveTargets++; consecutiveNonTargets = 0;
    } else {
      const f = sequence[i - n];       
      const prev = sequence[i - 1];   
      do { colour = randomFrom(config.colours) } while (colour === f || colour === prev);
      consecutiveTargets = 0; consecutiveNonTargets++;
    }
    sequence.push(colour);
  }
  return sequence.slice(n).map((colour, i) => ({
    id:             i,
    colour,
    nBackColour:    sequence[i],
    isTarget:       colour === sequence[i],
    scored:         true,
    scheduledAtMs:  i * (config.stimulusMs + config.isiMs),
  }));
}


function generateWarmupSequence(config) {
  // ── 1-back section ──────────────────────────────────────────────
  const oneBackCount   = Math.round(config.warmupTrials * 0.40);
  const sequence       = [randomFrom(config.colours)];
  let targetsPlaced    = 0;

  for (let i = 1; i < config.warmupTrials + 1; i++) {
    const remaining        = config.warmupTrials + 1 - i;
    const remainingTargets = oneBackCount - targetsPlaced;
    const isTarget = remainingTargets >= remaining ? true
                 : remainingTargets <= 0         ? false
                 : Math.random() < 0.40;
    let colour;
    if (isTarget) {
      colour = sequence[i - config.warmupN];
      targetsPlaced++;
    } else {
      const f = sequence[i - config.warmupN];
      const prev = sequence[i - 1];
      do { colour = randomFrom(config.colours) } while (colour === f || colour === prev);
    }
    sequence.push(colour);
  }

  const oneBackTrials = sequence.slice(1).map((colour, i) => ({
    id:           i,
    colour,
    nBackColour:  sequence[i],
    isTarget:     colour === sequence[i],
    scored:       false,
    block:        'warmup',
    warmupPhase:  '1back',        
    nLevel:       1,
    scheduledAtMs: i * (config.stimulusMs + config.isiMs),
  }));

  // ── 2-back section ──────────────────────────────────────────────
  const twoBackTrials = generateNBackSequence(
    2,
    config.twoBackWarmupTrials,
    0.33,
    config,
  ).map((t, i) => ({
    ...t,
    id:          config.warmupTrials + i,   
    scored:      false,
    block:       'warmup',
    warmupPhase: '2back',                   
    nLevel:      2,
    scheduledAtMs: (config.warmupTrials + i) * (config.stimulusMs + config.isiMs),
  }));

  return [...oneBackTrials, ...twoBackTrials];
}


export function generateFullSchedule(cfg = {}) {
  const config = { ...DEFAULT_NBACK_CONFIG, ...cfg };
  return {
    warmup: generateWarmupSequence(config),
    scored: generateNBackSequence(config.scoredN, config.scoredTrials, config.targetRatio, config),
  };
}


export function validateSchedule(scored) {
  const ratio = scored.filter((t) => t.isTarget).length / scored.length;
  if (ratio < 0.28 || ratio > 0.38) console.warn('N-Back target ratio out of bounds', ratio);
}
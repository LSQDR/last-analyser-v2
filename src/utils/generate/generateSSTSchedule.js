import { TASK_REGISTRY } from '../../config/taskRegistry.js'

const cfg = TASK_REGISTRY.find((t) => t.id === 'signalStop').config

export const DEFAULT_SST_CONFIG = {
  totalTrials:    cfg.totalTrials,
  stopRatio:      cfg.stopRatio,
  goDisplayMs:    cfg.goDisplayMs,
  itiMinMs:       cfg.itiMinMs,
  itiMaxMs:       cfg.itiMaxMs,
  initialSsdMs:   cfg.initialSsdMs,
  ssdStepMs:      cfg.ssdStepMs,
  ssdClampMinMs:  cfg.ssdClampMinMs,
  ssdClampMaxMs:  cfg.ssdClampMaxMs,
  practiceTrials: cfg.practiceTrials,
}

function randomBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function distributeStopTrials(totalTrials, stopCount) {
  const types = Array(totalTrials).fill('go');
  const eligible = [];
  for (let i = 4; i < totalTrials - 4; i++) eligible.push(i);
  const perQuarter = Math.floor(stopCount / 4);
  const quarters   = [[], [], [], []];
  eligible.forEach((i) => quarters[Math.floor(4 * i / totalTrials)].push(i));
  const chosen = new Set();
  quarters.forEach((q, qi) => {
    const take = qi < stopCount % 4 ? perQuarter + 1 : perQuarter;
    shuffle(q).slice(0, take).forEach((i) => chosen.add(i));
  });
  chosen.forEach((i) => (types[i] = 'stop'));
  for (let i = 0; i < types.length - 2; i++) {
    if (types[i] === 'stop' && types[i+1] === 'stop' && types[i+2] === 'stop') types[i+2] = 'go';
  }
  return types;
}

export function generateSSTSchedule(cfg = {}) {
  const config    = { ...DEFAULT_SST_CONFIG, ...cfg };
  const stopCount = Math.round(config.totalTrials * config.stopRatio);
  const types     = distributeStopTrials(config.totalTrials, stopCount);
  let cursor      = 0;
  return types.map((type, i) => {
    const iti   = randomBetween(config.itiMinMs, config.itiMaxMs);
    const trial = { id: i, type, scheduledAtMs: cursor, itiMs: iti, ssdMs: null };
    cursor += config.goDisplayMs + 200 + iti;
    return trial;
  });
}

export function generatePracticeSchedule(cfg = {}) {
  const config = { ...DEFAULT_SST_CONFIG, ...cfg };
  let cursor   = 0;
  return Array(config.practiceTrials).fill(null).map((_, i) => {
    const iti   = randomBetween(config.itiMinMs, config.itiMaxMs);
    const trial = { id: i, type: 'go', scheduledAtMs: cursor, itiMs: iti, ssdMs: null, isPractice: true };
    cursor += config.goDisplayMs + 200 + iti;
    return trial;
  });
}
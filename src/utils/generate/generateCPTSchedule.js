export const DEFAULT_CPT_CONFIG = {
  targetRatio: 0.25, isiMinMs: 1000, isiMaxMs: 2500,
  responseWindowMs: 1000, blockDurationMs: 90000,
  blockCount: 3, practiceDurationMs: 45000, maxConsecutiveTargets: 2,
};
export { DEFAULT_CPT_CONFIG as CPTCONFIG };

function randomBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function enforceTargetRatio(events, targetRatio) {
  const floor  = targetRatio - 0.03;
  const actual = events.filter((e) => e.type === 'target').length / events.length;
  if (actual >= floor) return events;
  const nonTargetIndices = events.map((e, i) => [e, i]).filter(([e]) => e.type === 'non-target').map(([, i]) => i);
  const needed = Math.round(targetRatio * events.length) - events.filter((e) => e.type === 'target').length;
  for (let k = 0; k < Math.min(needed, nonTargetIndices.length); k++) events[nonTargetIndices[k]].type = 'target';
  return events;
}

function buildBlock(durationMs, blockIndex, isPractice, config) {
  const events = [];
  let cursor = 0, consecutiveTargets = 0;
  while (cursor < durationMs) {
    const isi       = randomBetween(config.isiMinMs, config.isiMaxMs);
    const cycleTime = config.responseWindowMs + isi;
    if (cursor + cycleTime > durationMs) break;
    const forceNonTarget = consecutiveTargets >= config.maxConsecutiveTargets;
    const currentTargets = events.filter((e) => e.type === 'target').length;
    const isTarget = !forceNonTarget && currentTargets < Math.round(events.length * config.targetRatio)
      ? Math.random() < 0.35 : false;
    events.push({
      id: isPractice ? `p${events.length}` : `b${blockIndex}e${events.length}`,
      block: isPractice ? 0 : blockIndex, type: isTarget ? 'target' : 'non-target',
      scheduledAtMs: cursor, isiMs: isi, isPractice,
    });
    consecutiveTargets = isTarget ? consecutiveTargets + 1 : 0;
    cursor += cycleTime;
  }
  return enforceTargetRatio(events, config.targetRatio);
}

export function generateCPTSchedule(cfg = {}) {
  const config  = { ...DEFAULT_CPT_CONFIG, ...cfg };
  const practice = buildBlock(config.practiceDurationMs, 0, true,  config);
  const blocks   = Array.from({ length: config.blockCount }, (_, i) => buildBlock(config.blockDurationMs, i + 1, false, config));
  blocks.forEach((block, i) => {
    const ratio = block.filter((e) => e.type === 'target').length / block.length;
    if (ratio < 0.22 || ratio > 0.28) console.warn(`CPT Block ${i + 1} ratio out of bounds`, ratio.toFixed(3));
  });
  return { practice, blocks };
}
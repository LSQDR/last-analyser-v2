import { CPTDecayChart }     from '../components/dashboard/charts/CPTDecayChart.jsx';
import { SSTStaircaseChart } from '../components/dashboard/charts/SSTStaircaseChart.jsx';
import { StroopRTChart }     from '../components/dashboard/charts/StroopRTChart.jsx';
import { NBackSDTMatrix }    from '../components/dashboard/charts/NBackSDTMatrix.jsx';
import { getCPTBand, getSSTBand, getStroopBand, getNBackBand }     from '../utils/getBandLabels.js';
import {
  getSustainedAttentionInsight, getInhibitionInsight,
  getInterferenceInsight,       getWorkingMemoryInsight,
} from '../utils/getDomainInsights.js';

export const TASK_REGISTRY = [
  // ─── Task 1 — Sustained Attention (CPT) ──────────────────────────────────
  {
    id: 'tapThePulse', 
    storageKey: 'tapThePulse',
    name: 'Tap the Pulse', 
    shortName: 'Tap', 
    domain: 'Sustained Attention', 
    icon: '🎯',
    ChartComponent: CPTDecayChart,

    config: {
      targetRatio: 0.25, 
      isiMinMs: 1000, 
      isiMaxMs: 2500,
      responseWindowMs: 1000, 
      blockDurationMs: 90000,
      blockCount: 3, 
      practiceDurationMs: 45000, 
      maxConsecutiveTargets: 2,
    },

    getBand: (o) => getCPTBand(o.omissionRatepct, o.cvpct, o.attentionDecaySlope),
    getMetrics: (o) => [
      { label: 'Omission Rate',   
        value: o.omissionRatepct != null ? o.omissionRatepct.toFixed(1) + '%'  : '—', 
        flagged: o.omissionRatepct > 25, 
        threshold: '< 25%'  
      },
      { label: 'RT Variability',  
        value: o.cvpct != null ? o.cvpct.toFixed(1) + '%'  : '—', 
        flagged: o.cvpct > 35, 
        threshold: '< 35%'  
      },
      { label: 'Mean RT', 
        value: o.cleanMeanRTms != null ? Math.round(o.cleanMeanRTms) + 'ms' : '—', 
        flagged: false 
      },
      { label: 'Attention Decay', 
        value: o.attentionDecaySlope != null ? (o.attentionDecaySlope > 0 ? 'Present' : 'None') : '—', 
        flagged: o.attentionDecaySlope > 0 
      },
    ],
    getInsight: (score, overall) => getSustainedAttentionInsight(score, overall),
    flagFeedback: {
      highOmission: { 
        title: 'Omission rate > 25%', 
        text: 'Your miss rate on target stimuli was above the typical range. This may reflect variable sustained attention during the task.' 
      },
      attentionDecay: { 
        title: 'Attention decay detected',  
        text: 'Your attention appeared to decrease over time — more targets were missed in later rounds than earlier ones.' 
      },
      highVariability: { 
        title: 'RT variability (CV > 35%)', 
        text: 'Your response times varied considerably across trials. High RT variability is associated with inconsistent attentional engagement.' 
      },
    },
    columns: [
      { 
        key: 'index', 
        label: '#' 
      }, 
      { 
        key: 'type', 
        label: 'Type'
       }, 
       { 
        key: 'scheduledAtMs', 
        label: 'Scheduled ms' 
      },
      { 
        key: 'firesAt', 
        label: 'Fired At ms' 
      }, 
      { 
        key: 'responded', 
        label: 'Response' 
      },
      { 
        key: 'classification', 
        label: 'Classification' 
      }, 
      { key: 'rtms', 
        label: 'RT ms' 
      }, 
      { key: 'isi', 
        label: 'ISI ms' 
      },
    ],
  },

  // ─── Task 2 — Inhibition Control (SST) ───────────────────────────────────
  {
    id: 'signalStop', storageKey: 'signalStop',
    name: 'Signal Stop', shortName: 'Stop', domain: 'Inhibition Control', icon: '🛑',
    ChartComponent: SSTStaircaseChart,

    config: {
      totalTrials: 128, stopRatio: 0.25, goDisplayMs: 800,
      itiMinMs: 400, itiMaxMs: 700, initialSsdMs: 250,
      ssdStepMs: 50, ssdClampMinMs: 50, ssdClampMaxMs: 650, practiceTrials: 10,
    },

    getBand:    (o) => getSSTBand(o.SSRTms, o.SSRTisValid, o.stopAccuracypct),
    getMetrics: (o) => [
      { label: 'SSRT',          value: o.SSRTms != null ? (o.SSRTisValid ? Math.round(o.SSRTms) + 'ms' : 'Invalid') : '—', flagged: o.SSRTms > 300 && o.SSRTisValid, threshold: '< 300ms' },
      { label: 'Stop Accuracy', value: o.stopAccuracypct != null ? o.stopAccuracypct.toFixed(1) + '%' : '—', flagged: o.stopAccuracypct < 50, threshold: '≥ 50%' },
      { label: 'Go RT',         value: o.goRTms != null ? Math.round(o.goRTms) + 'ms' : '—', flagged: false },
    ],
    getInsight:   (score, overall) => getInhibitionInsight(score, overall),
    flagFeedback: {
      highSSRT:           { title: 'SSRT > 300ms',              text: 'Your estimated inhibition speed was above the typical adult range. This suggests the stop process may take longer than average to cancel an initiated response.' },
      lowStopAccuracy:    { title: 'Stop accuracy < 50%',       text: 'You responded on more than half of stop-signal trials. Consistently stopping when signalled is part of controlled inhibition.' },
      convergenceFailure: { title: 'Estimate reliability note', text: 'The stopping threshold task did not reach a stable estimate in this session. This can happen with very fast or very consistent stopping. The result is shown for reference but should be interpreted cautiously.' },
    },
    columns: [
      { key: 'index', label: '#' }, { key: 'trialType', label: 'Type' }, { key: 'ssd', label: 'SSD ms' },
      { key: 'responded', label: 'Response' }, { key: 'classification', label: 'Classification' }, { key: 'rtms', label: 'RT ms' },
    ],
  },

  // ─── Task 3 — Interference Control (Stroop) ──────────────────────────────
  {
    id: 'wordColourClash', storageKey: 'wordColourClash',
    name: 'Word Colour Clash', shortName: 'Stroop', domain: 'Interference Control', icon: '🎨',
    ChartComponent: StroopRTChart,

    config: {
      congruentCount: 40, incongruentCount: 40, neutralCount: 10,
      responseWindowMs: 2000, itiMs: 500,
    },

    getBand:    (o) => getStroopBand(o.trueInterferencems),
    getMetrics: (o) => [
      { label: 'Interference',     value: o.trueInterferencems     != null ? Math.round(o.trueInterferencems)     + 'ms' : '—', flagged: o.trueInterferencems     > 150, threshold: '< 150ms' },
      { label: 'Incong. Accuracy', value: o.incongruentAccuracypct != null ? o.incongruentAccuracypct.toFixed(1) + '%'  : '—', flagged: o.incongruentAccuracypct < 75,  threshold: '≥ 75%'  },
      { label: 'Facilitation',     value: o.facilitationms         != null ? Math.round(o.facilitationms)         + 'ms' : '—', flagged: false },
    ],
    getInsight:   (score, overall) => getInterferenceInsight(score, overall),
    flagFeedback: {
      highInterference:       { title: 'True interference > 150ms',  text: 'The conflicting word meaningfully slowed your response to the ink colour. A high interference score reflects stronger competition between automatic word-reading and controlled colour-naming.' },
      lowIncongruentAccuracy: { title: 'Incongruent accuracy < 75%', text: 'You made more errors on colour-conflict trials than is typical. Errors on these trials often reflect moments where the automatic word-reading response won over the intended colour response.' },
    },
    columns: [
      { key: 'index', label: '#' }, { key: 'condition', label: 'Condition' }, { key: 'word', label: 'Word' },
      { key: 'inkColour', label: 'Ink' }, { key: 'responded', label: 'Response' },
      { key: 'correct', label: 'Correct' }, { key: 'rtms', label: 'RT ms' },
    ],
  },

  // ─── Task 4 — Working Memory (N-Back) ────────────────────────────────────
  {
    id: 'matchOrPass', storageKey: 'matchOrPass',
    name: 'Match or Pass', shortName: 'N-Back', domain: 'Working Memory', icon: '🧠',
    ChartComponent: NBackSDTMatrix,

    config: {
      colours: ['red', 'blue', 'green', 'yellow'],
      warmupTrials: 10, warmupN: 1, scoredTrials: 40, scoredN: 2,
      targetRatio: 0.33, stimulusMs: 500, isiMs: 2000,
      maxConsecutiveTargets: 2, maxConsecutiveNonTargets: 4,
    },

    getBand:    (o) => getNBackBand(o.correctedHitRatepct),
    getMetrics: (o) => [
      { label: 'Corrected Hits', value: o.correctedHitRatepct != null ? o.correctedHitRatepct.toFixed(1) + '%' : '—', flagged: o.correctedHitRatepct < 60, threshold: '≥ 60%' },
      { label: 'd′',            value: o.dPrime              != null ? o.dPrime.toFixed(2)                    : '—', flagged: false },
      { label: 'False Alarms',  value: o.falseAlarmRatepct   != null ? o.falseAlarmRatepct.toFixed(1) + '%'  : '—', flagged: false },
    ],
    getInsight:   (score, overall) => getWorkingMemoryInsight(score, overall),
    flagFeedback: {
      lowCorrectedHitRate:           { title: 'Corrected hit rate < 60%', text: 'Your corrected hit rate — accounting for both successful matches and false alarms — was below the typical adult range. This may reflect difficulty updating and holding information in working memory.' },
      severeWorkingMemoryDifficulty: { title: 'Corrected hit rate < 40%', text: 'Your working memory updating score was considerably below the typical range. Scores at this level may reflect significant difficulty holding and comparing information across sequential items.' },
    },
    columns: [
      { key: 'index', label: '#' }, { key: 'isTarget', label: 'Target' }, { key: 'stimulus', label: 'Stimulus' },
      { key: 'nBackItem', label: '2-Back Item' }, { key: 'responded', label: 'Response' },
      { key: 'classification', label: 'Classification' }, { key: 'rtms', label: 'RT ms' },
    ],
  },
];

export const TASK_ORDER = TASK_REGISTRY.map((t) => t.id);

export function collectAllFlags(data) {
  if (!data) return [];
  return TASK_REGISTRY.flatMap((task) => data[task.id]?.overall?.flags ?? []);
}

import { CPTCharts }         from '../components/dashboard/charts/CPTCharts.jsx'
import { SSTStaircaseChart } from '../components/dashboard/charts/SSTStaircaseChart.jsx'
import { StroopRTChart }     from '../components/dashboard/charts/StroopRTChart.jsx'
import { NBackSDTMatrix }    from '../components/dashboard/charts/NBackSDTMatrix.jsx'
import { getCPTBand, getSSTBand, getStroopBand, getNBackBand }     from '../utils/getBandLabels.js'
import {
  getSustainedAttentionInsight, getInhibitionInsight,
  getInterferenceInsight,       getWorkingMemoryInsight,
} from '../utils/getDomainInsights.js'

export const TASK_REGISTRY = [
  // Task 1 
  {
    id: 'tapThePulse', 
    storageKey: 'tapThePulse',
    name: 'Tap the Pulse', 
    shortName: 'Tap', 
    domain: 'Sustained Attention', 
    icon: '🎯',
    ChartComponent: CPTCharts,

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
        {
          label: "Omission Rate",
          definition: "How often you missed a red circle. A higher rate suggests your attention lapsed. Typical adults miss fewer than 25% of targets.",
          value: o.omissionRatepct != null ? `${o.omissionRatepct.toFixed(1)}%` : null,
          flagged: o.omissionRatepct > 25,
          threshold: "25%",
        },
        {
          label: "RT Variability",
          definition: "How consistent your reaction speed was (Coefficient of Variation). High variability means your response times fluctuated a lot, a pattern linked to inconsistent sustained attention.",
          value: o.cvpct != null ? `${o.cvpct.toFixed(1)}%` : null,
          flagged: o.cvpct > 35,
          threshold: "35%",
        },
        {
          label: "Mean RT",
          definition: "Your average reaction time on target trials, with outlier responses removed. Reflects your baseline processing speed.",
          value: o.cleanMeanRTms != null ? `${Math.round(o.cleanMeanRTms)} ms` : null,
          flagged: false,
        },
        {
          label: "Attention Decay",
          definition: "Whether your miss rate increased from round 1 to round 3. 'Present' means attention faded over time, a common pattern in sustained attention research.",
          value: o.attentionDecaySlope != null ? (o.attentionDecaySlope > 0 ? "Present" : "None") : null,
          flagged: o.attentionDecaySlope > 0,
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
        text: 'Your attention appeared to decrease over time, more targets were missed in later rounds than earlier ones.' 
      },
      highVariability: { 
        title: 'RT variability (CV > 35%)', 
        text: 'Your response times varied considerably across trials. High RT variability is associated with inconsistent attentional engagement.' 
      },
    },
    columns: [
      { key: 'index', label: '#' }, 
      { key: 'type', label: 'Type'}, 
      { key: 'scheduledAtMs', label: 'Scheduled ms' },
      { key: 'firesAt', label: 'Fired At ms' }, 
      { key: 'responded', label: 'Response' },
      { key: 'classification', label: 'Classification' }, 
      { key: 'rtms', label: 'RT ms' }, 
      { key: 'isiMs', label: 'ISI ms' },
    ],
  },

  // ─── Task 2  ───────────────────────────────────
  {
    id: 'signalStop',
    storageKey: 'signalStop',
    name: 'Signal Stop',
    shortName: 'Stop',
    domain: 'Inhibition Control',
    icon: '🛑',
    ChartComponent: SSTStaircaseChart,

    config: {
      totalTrials: 128,
      stopRatio: 0.25,
      goDisplayMs: 800,
      itiMinMs: 400,
      itiMaxMs: 700,
      initialSsdMs: 250,
      ssdStepMs: 50,
      ssdClampMinMs: 50,
      ssdClampMaxMs: 650,
      practiceTrials: 10,
    },

    getBand: (o) => getSSTBand(o.SSRTms, o.SSRTisValid, o.stopAccuracypct),
    getMetrics: (o) => [
      {
        label: "SSRT",
        definition: "Stop-Signal Reaction Time. How quickly your brain can cancel a movement once it has started. Lower is faster. Typical adults score below 300 ms.",
        value: o.SSRTms != null ? (o.SSRTisValid ? `${Math.round(o.SSRTms)} ms` : "Invalid") : null,
        flagged: o.SSRTms > 300 && o.SSRTisValid,
        threshold: "300 ms",
      },
      {
        label: "Stop Accuracy",
        definition: "The percentage of stop-signal trials where you successfully held back. Should be close to 50%. The task is designed to make stopping and going equally likely.",
        value: o.stopAccuracypct != null ? `${o.stopAccuracypct.toFixed(1)}%` : null,
        flagged: o.stopAccuracypct < 50,
        threshold: "≥ 50%",
      },
      {
        label: "Go RT",
        definition: "Your average reaction time on normal trials with no stop signal. This baseline speed is used to estimate SSRT.",
        value: o.goRTms != null ? `${Math.round(o.goRTms)} ms` : null,
        flagged: false,
      },
    ],

    getInsight: (score, overall) => getInhibitionInsight(score, overall),
    flagFeedback: {
      highSSRT: {
        title: 'SSRT > 300ms',
        text: 'Your estimated inhibition speed was above the typical adult range. This suggests the stop process may take longer than average to cancel an initiated response.',
      },
      lowStopAccuracy: {
        title: 'Stop accuracy < 50%',
        text: 'You responded on more than half of stop-signal trials. Consistently stopping when signalled is part of controlled inhibition.',
      },
      convergenceFailure: {
        title: 'Estimate reliability note',
        text: 'The stopping threshold task did not reach a stable estimate in this session. This can happen with very fast or very consistent stopping. The result is shown for reference but should be interpreted cautiously.',
      },
    },
    columns: [
      { key: 'index', label: '#' },
      { key: 'type', label: 'Type' },
      { key: 'ssd', label: 'SSD ms' },
      { key: 'responded', label: 'Response' },
      { key: 'classification', label: 'Classification' },
      { key: 'rtms', label: 'RT ms' },
    ],
  },

  // ─── Task 3  ──────────────────────────────
  {
    id: 'wordColourClash',
    storageKey: 'wordColourClash',
    name: 'Word Colour Clash',
    shortName: 'Stroop',
    domain: 'Interference Control',
    icon: '🎨',
    ChartComponent: StroopRTChart,

    config: {
      congruentCount: 40,
      incongruentCount: 40,
      neutralCount: 10,
      responseWindowMs: 2000,
      itiMs: 500,
    },

    getBand: (o) => getStroopBand(o.trueInterferencems),
    getMetrics: (o) => [
      {
        label: "Interference",
        definition: "How much slower you were on colour-conflict trials compared to neutral trials. This measures how much automatic word-reading interfered with your response. Typical adults show less than ~150 ms.",
        value: o.trueInterferencems != null ? `${Math.round(o.trueInterferencems)} ms` : null,
        flagged: o.trueInterferencems > 150,
        threshold: "150 ms",
      },
      {
        label: "Incong. Accuracy",
        definition: "Your accuracy on conflict trials where the word meaning and ink colour differed. Errors here mean the written word overrode your intended response, the classic Stroop error.",
        value: o.incongruentAccuracypct != null ? `${o.incongruentAccuracypct.toFixed(1)}%` : null,
        flagged: o.incongruentAccuracypct < 75,
        threshold: "75%",
      },
      {
        label: "Facilitation",
        definition: "How much faster you were when the word and ink colour matched, compared to a neutral word. A positive value means matching stimuli gave you a speed boost.",
        value: o.facilitationms != null ? `${Math.round(o.facilitationms)} ms` : null,
        flagged: false,
      },
    ],

    getInsight: (score, overall) => getInterferenceInsight(score, overall),
    flagFeedback: {
      highInterference: {
        title: 'True interference > 150ms',
        text: 'The conflicting word meaningfully slowed your response to the ink colour. A high interference score reflects stronger competition between automatic word-reading and controlled colour-naming.',
      },
      lowIncongruentAccuracy: {
        title: 'Incongruent accuracy < 75%',
        text: 'You made more errors on colour-conflict trials than is typical. Errors on these trials often reflect moments where the automatic word-reading response won over the intended colour response.',
      },
    },
    columns: [
      { key: 'index', label: '#' },
      { key: 'condition', label: 'Condition' },
      { key: 'word', label: 'Word' },
      { key: 'inkColour', label: 'Ink' },
      { key: 'responded', label: 'Response' },
      { key: 'correct', label: 'Correct' },
      { key: 'rtms', label: 'RT ms' },
    ],
  },

  // ─── Task 4  ────────────────────────────────────
  {
    id: 'matchOrPass',
    storageKey: 'matchOrPass',
    name: 'Match or Pass',
    shortName: 'N-Back',
    domain: 'Working Memory',
    icon: '🧠',
    ChartComponent: NBackSDTMatrix,

    config: {
      colours: ['red', 'blue', 'green', 'yellow'],
      warmupTrials: 10,
      warmupN: 1,
      scoredTrials: 40,
      scoredN: 2,
      targetRatio: 0.33,
      stimulusMs: 500,
      isiMs: 2000,
      maxConsecutiveTargets: 2,
      maxConsecutiveNonTargets: 4,
    },

    getBand: (o) => getNBackBand(o.correctedHitRatepct),
    getMetrics: (o) => [
      {
        label: "Corrected Hits",
        definition: "Hit Rate minus False Alarm Rate. Subtracting false alarms gives a fairer picture of working memory accuracy by removing lucky guesses. Typical adults score above 60%.",
        value: o.correctedHitRatepct != null ? `${o.correctedHitRatepct.toFixed(1)}%` : null,
        flagged: o.correctedHitRatepct < 60,
        threshold: "60%",
      },
      {
        label: "d′",
        definition: "A signal detection measure of how clearly you distinguished matches from non-matches, regardless of how cautious or impulsive your strategy was. Higher values mean better sensitivity.",
        value: o.dPrime != null ? o.dPrime.toFixed(2) : null,
        flagged: false,
      },
      {
        label: "False Alarms",
        definition: "How often you said 'match' when there was no match. A high rate suggests impulsive or guessed responses rather than genuine working memory recall.",
        value: o.falseAlarmRatepct != null ? `${o.falseAlarmRatepct.toFixed(1)}%` : null,
        flagged: false,
      },
    ],

    getInsight: (score, overall) => getWorkingMemoryInsight(score, overall),
    flagFeedback: {
      lowCorrectedHitRate: {
        title: 'Corrected hit rate < 60%',
        text: 'Your corrected hit rate, accounting for both successful matches and false alarms, was below the typical adult range. This may reflect difficulty updating and holding information in working memory.',
      },
      severeWorkingMemoryDifficulty: {
        title: 'Corrected hit rate < 40%',
        text: 'Your working memory updating score was considerably below the typical range. Scores at this level may reflect significant difficulty holding and comparing information across sequential items.',
      },
    },
    columns: [
      { key: 'index', label: '#' },
      { key: 'isTarget', label: 'Target' },
      { key: 'stimulus', label: 'Stimulus' },
      { key: 'nBackItem', label: '2-Back Item' },
      { key: 'responded', label: 'Response' },
      { key: 'classification', label: 'Classification' },
      { key: 'rtms', label: 'RT ms' },
    ],
  },
]

export const TASK_ORDER = TASK_REGISTRY.map((t) => t.id)

export function collectAllFlags(data) {
  if (!data) return []
  return TASK_REGISTRY.flatMap((task) => data[task.id]?.overall?.flags ?? [])
}

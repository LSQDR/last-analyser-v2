# LAST-Analyser

**Educational use only.** This tool is for self-reflection and does not constitute a clinical or diagnostic assessment. Results should not be used to self-diagnose or replace professional evaluation.

It is a React and JavaScript app for four timed attention and executive-function tasks. It is not a validated clinical instrument.

There is no server and no account. Task results stay in `localStorage` in this browser. The researcher view reviews a completed run and exports that JSON locally. Nothing is transmitted.

## Setup

### Prerequisites

- Node.js `^20.19.0 || >=22.12.0`
- npm

### Install and run

```bash
git clone https://github.com/LSQDR/last-analyser-v2.git
cd last-analyser-v2
npm ci
npm run dev
```

The dev server prints a local URL. There is no hosted demo.

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Coverage for `src/utils/stats.js`, `src/utils/calcSSRT.js`, and `src/utils/compute/` |
| `npm run lint` | ESLint on `src/` |
| `npm run lint:fix` | ESLint with fixes |

## Tasks

The four tasks are original screens. The numbers below are the cutoffs and schedules in `src/config/taskRegistry.js`. They are not a licensed clinical battery, and they are not one validated threshold.

### 1. Tap the Pulse (continuous performance)

**Domain:** Sustained attention

A circle appears at a variable interval. Click when it is red.

**Flags in the app:** omission rate above 25%, reaction-time coefficient of variation above 35%, attention decay when the miss rate rises from block 1 to block 3.

**Schedule:** 3 blocks × 90 seconds, a 45-second practice, inter-stimulus interval 1000–2500ms, 1000ms response window.

### 2. Signal Stop (stop-signal)

**Domain:** Inhibition

Respond to the go signal. Withhold the response when the stop signal appears. Stop-signal reaction time uses the integration method described in `src/utils/calcSSRT.js` (Verbruggen et al. 2019).

**Flags in the app:** SSRT above 300ms when the estimate is valid, stop accuracy under 50%.

**Schedule:** 128 trials, 25% stop trials, 10 practice trials, inter-trial interval 400–700ms. A staircase adjusts the stop-signal delay.

### 3. Word Colour Clash (Stroop)

**Domain:** Interference

Name the ink colour, not the word.

**Flags in the app:** interference above 150ms, incongruent accuracy under 75%. Band labels in `src/utils/getBandLabels.js` use different cuts (under 130ms typical, over 200ms high). Those labels and the 150ms flag are both in the code. They are not a single published cutoff.

**Schedule:** 40 congruent, 40 incongruent, 10 neutral, 2000ms response window, 500ms inter-trial interval.

### 4. Match or Pass (2-back)

**Domain:** Working memory

Decide whether the current colour matches the one from two steps back.

**Flags in the app:** corrected hits under 60%.

**Schedule:** 10 warmup trials at 1-back, 40 scored trials at 2-back, about 33% targets, 500ms on, 2000ms between stimuli, four colours.

## Project structure

```
src/
├── components/
│   ├── dashboard/       # Result charts and metric tables
│   ├── researcher/      # Per-task metric rows and the event log
│   ├── shared/          # Disclaimer, mini result, auto-advance
│   └── tasks/           # The four task screens
├── config/              # Task registry: schedules, flags, charts
├── hooks/               # Task engines and dashboard loading
├── pages/               # Home, task router, dashboard, researcher view
└── utils/
    ├── classify/        # Response labels for each task
    ├── compute/         # Session and block metrics
    ├── generate/        # Trial schedules
    └── __tests__/       # Unit tests
```

## Testing

`npm test` runs 105 tests in 11 files. They cover:

- `src/utils/stats.js`
- `src/utils/calcSSRT.js`
- `src/utils/compute/computeCPTBlockMetrics.js`
- `src/utils/compute/computeCPTSessionMetrics.js` (short and long ISI means)
- `src/utils/compute/computeSSTMetrics.js`
- `src/utils/compute/computeStroopMetrics.js`
- `src/utils/compute/computeNBackMetrics.js`
- `src/utils/generate/generateCPTSchedule.js`
- `src/utils/generate/generateSSTSchedule.js`
- `src/utils/getBandLabels.js`
- `src/config/taskRegistry.js`

They do not cover `src/utils/classify/`, `generateNBackSchedule.js`, `generateStroopSchedule.js`, `storage.js`, the hooks, or the screens.

## Stack

- React 19 and JavaScript (no TypeScript source)
- React Router 7
- Recharts 3
- Vite 8
- Vitest 4
- ESLint 9

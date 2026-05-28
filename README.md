# LAST-Analyser

A React-based web application for administering and analyzing neuropsychological cognitive tasks. The application measures key attentional and executive function domains through standardized behavioral tasks.

## Project Overview

LAST-Analyser provides a comprehensive assessment platform for cognitive and attentional abilities. It delivers four validated cognitive tasks with real-time performance tracking, detailed analytics, and evidence-based interpretation of results. The application generates domain-specific insights and visualizes performance patterns to support research and clinical assessment.

### Key Features
- **Interactive Cognitive Tasks** — Four validated neuropsychological assessments
- **Real-time Analytics** — Performance metrics calculated during and after task completion
- **Detailed Dashboards** — Visual summaries of performance across all cognitive domains
- **Evidence-based Interpretation** — Automated insight generation based on performance thresholds
- **Researcher Mode** — Advanced data review and export capabilities

## Setup & Installation

### Prerequisites
- Node.js 16+ and npm

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LAST-Analyser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run lint` | Check code with ESLint |
| `npm run lint:fix` | Auto-fix linting issues |

## Available Tasks

### 1. **Tap the Pulse** (Continuous Performance Test)
**Domain:** Sustained Attention  
**Icon:** 🎯

Measures the ability to maintain focus over time. Participants respond to red circles appearing on screen at variable intervals.

**Key Metrics:**
- **Omission Rate** — How often targets were missed (threshold: 25%)
- **RT Variability** — Consistency of reaction times (threshold: 35%)
- **Attention Decay** — Whether attention decreased from round 1 to round 3
- **Mean RT** — Average reaction time on target trials

**Configuration:**
- 3 blocks × 90 seconds each
- 45-second practice round
- 1000–2500ms inter-stimulus intervals
- 1000ms response window

---

### 2. **Signal Stop** (Stop-Signal Task)
**Domain:** Inhibition Control  
**Icon:** 🛑

Measures the speed of response inhibition—how quickly the brain can cancel a planned movement. Participants must respond to "Go" signals but withhold responses to "Stop" signals.

**Key Metrics:**
- **SSRT** — Stop-Signal Reaction Time (threshold: 300ms). Lower is faster/better.
- **Stop Accuracy** — Percentage of successful stops (target: ~50%)
- **Go RT** — Baseline reaction time on non-stop trials

**Configuration:**
- 128 trials total (25% stop-signal trials)
- Adaptive staircase adjusts difficulty
- 10 practice trials
- 400–700ms inter-trial intervals

---

### 3. **Word Colour Clash** (Stroop Task)
**Domain:** Interference Control  
**Icon:** 🎨

Measures the ability to overcome automatic word-reading and respond to ink colour. Participants name the colour of words that may conflict with their meaning (e.g., the word "BLUE" printed in red ink).

**Key Metrics:**
- **Interference** — Slowdown on conflict trials vs. neutral trials (threshold: 150ms)
- **Incongruent Accuracy** — Accuracy on conflict trials (threshold: 75%)
- **Facilitation** — Speed boost when word and colour match

**Configuration:**
- 40 congruent trials (word and colour match)
- 40 incongruent trials (word and colour conflict)
- 10 neutral trials (color words only)
- 2000ms response window, 500ms inter-trial interval

---

### 4. **Match or Pass** (N-Back Task)
**Domain:** Working Memory  
**Icon:** 🧠

Measures working memory capacity and updating. Participants view colored squares and decide if the current square matches the one shown 2 positions back in the sequence.

**Key Metrics:**
- **Corrected Hits** — Hit rate minus false alarm rate (threshold: 60%)
- **d′** — Signal detection measure of sensitivity to matches vs. non-matches
- **False Alarms** — Errors where "match" was reported incorrectly

**Configuration:**
- 10 warmup trials (1-back) + 40 scored trials (2-back)
- 33% target match probability
- 500ms stimulus display, 2000ms inter-stimulus interval
- 4 colors (red, blue, green, yellow)

---

## Project Structure

```
src/
├── components/
│   ├── dashboard/       # Analytics and visualization components
│   ├── shared/          # Reusable UI components
│   └── tasks/           # Individual task components
├── hooks/               # Custom React hooks for task logic
├── pages/               # Page-level components (Home, Dashboard, etc.)
├── utils/
│   ├── classify/        # Response classification logic
│   ├── generate/        # Task stimulus generation
│   ├── __tests__/       # Test files
│   └── [utilities]      # Metrics calculation, insights, etc.
└── config/              # Task registry and configuration
```

## Testing

The project includes a comprehensive test suite with 54+ unit tests covering:
- Response classification across all task types
- Metrics calculation and statistical analysis
- Stimulus generation and scheduling
- SDT (Signal Detection Theory) computations

Run tests with `npm run test` or `npm run test:coverage` for coverage reports.

## Technology Stack

- **React 19** — UI framework
- **React Router 7** — Client-side routing
- **Recharts 3** — Data visualization and charts
- **Vite** — Build tool and dev server
- **Vitest** — Unit testing framework
- **ESLint** — Code quality



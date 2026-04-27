import { useNavigate } from 'react-router-dom'
import { useDashboardData }   from '../hooks/useDashboardData.js'
import { DashboardHeader }    from '../components/dashboard/DashboardHeader.jsx'
import { OverviewPanel }      from '../components/dashboard/OverviewPanel.jsx'
import { TaskCard, TaskCardPlaceholder } from '../components/dashboard/TaskCard.jsx'
import { CPTDecayChart }      from '../components/dashboard/charts/CPTDecayChart.jsx'
import { CPTISIChart }        from '../components/dashboard/charts/CPTISIChart.jsx'
import { SSTStaircaseChart }  from '../components/dashboard/charts/SSTStaircaseChart.jsx'
import { StroopRTChart }      from '../components/dashboard/charts/StroopRTChart.jsx'
import { InterferenceBand }   from '../components/dashboard/InterferenceBand.jsx'
import { NBackSDTMatrix }     from '../components/dashboard/charts/NBackSDTMatrix.jsx'
import { NBackGauge }         from '../components/dashboard/charts/NBackGauge.jsx'
import { InsightsSummary } from '../components/dashboard/InsightsSummary.jsx'
import { Link } from 'react-router-dom'
import '../components/dashboard/Dashboard.css'

// Chart wrappers compose the chart + any extra visual (e.g. band, gauge)
function CPTChart({ data }) {
  return <><CPTDecayChart data={data} /><CPTISIChart data={data} /></>
}
function SSTChart({ data }) {
  return <><SSTStaircaseChart data={data} /></>
}
function StroopChart({ data }) {
  return <><StroopRTChart data={data} /><InterferenceBand trueInterference={data.overall.trueInterferencems} /></>
}
function NBackChart({ data }) {
  return <><NBackSDTMatrix data={data} /><NBackGauge correctedHitRate={data.overall.correctedHitRatepct} /></>
}

const TASK_META = {
  task1: {
    id: 'task1', name: 'Tap the Pulse', domain: 'Sustained Attention',
    ChartComponent: CPTChart,
    metrics: o => [
      { label: 'Omission Rate',      value: `${o.omissionRatepct?.toFixed(1)}%`,    threshold: '25%',  flagged: o.omissionRatepct > 25    },
      { label: 'Commission Rate',    value: `${o.commissionRatepct?.toFixed(1)}%`,  threshold: '10%',  flagged: o.commissionRatepct > 10  },
      { label: 'Clean Mean RT',      value: o.cleanMeanRTms ? `${Math.round(o.cleanMeanRTms)}ms` : '—', threshold: null, flagged: false },
      { label: 'RT Variability (CV)',value: `${o.cvpct?.toFixed(1)}%`,             threshold: '35%',  flagged: o.cvpct > 35              },
      { label: 'Lapse Count',        value: o.lapseCount,                           threshold: null,   flagged: false                     },
      { label: 'Perseveration Count',value: o.perseverationCount,                  threshold: null,   flagged: false                     },
    ],
  },
  task2: {
    id: 'task2', name: 'Signal Stop', domain: 'Inhibition Control',
    ChartComponent: SSTChart,
    metrics: o => [
      { label: 'Est. Inhibition Speed (SSRT)', value: o.SSRTisValid ? `${o.SSRTms}ms` : 'See note', threshold: '300ms', flagged: o.SSRTisValid && o.SSRTms > 300 },
      { label: 'Stop Accuracy',                value: `${o.stopAccuracypct?.toFixed(1)}%`,            threshold: '50%',   flagged: o.stopAccuracypct < 50          },
      { label: 'Go Reaction Time',             value: o.goRTms ? `${Math.round(o.goRTms)}ms` : '—',  threshold: null,    flagged: false                           },
      { label: 'Failed Stop RT',               value: o.failedStopRTms ? `${Math.round(o.failedStopRTms)}ms` : '—', threshold: null, flagged: false               },
      { label: 'Race Model',                   value: o.raceModelHolds === null ? '—' : o.raceModelHolds ? 'Holds' : 'Violated', threshold: null, flagged: false   },
      { label: 'Go Omissions',                 value: o.goOmissions,                                 threshold: '5',     flagged: o.goOmissions > 5               },
    ],
  },
  task3: {
    id: 'task3', name: 'Word Colour Clash', domain: 'Interference Control',
    ChartComponent: StroopChart,
    metrics: o => [
      { label: 'True Interference',     value: `${Math.round(o.trueInterferencems)}ms`,    threshold: null, flagged: false },
      { label: 'Classic Interference',  value: `${Math.round(o.classicInterferencems)}ms`, threshold: null, flagged: false },
      { label: 'Facilitation',          value: `${Math.round(o.facilitationms)}ms`,        threshold: null, flagged: false },
      { label: 'Congruent Accuracy',    value: `${o.congruentAccuracypct?.toFixed(1)}%`,   threshold: '90%',flagged: o.congruentAccuracypct < 90     },
      { label: 'Incongruent Accuracy',  value: `${o.incongruentAccuracypct?.toFixed(1)}%`, threshold: '75%',flagged: o.incongruentAccuracypct < 75   },
      { label: 'Word-Interference Error Rate', value: `${o.wordInterferenceRatepct?.toFixed(1)}%`, threshold: null, flagged: false },
    ],
  },
  task4: {
    id: 'task4', name: 'Match or Pass', domain: 'Working Memory',
    ChartComponent: NBackChart,
    metrics: o => [
      { label: 'Corrected Hit Rate', value: `${o.correctedHitRatepct?.toFixed(1)}%`, threshold: '60%', flagged: o.correctedHitRatepct < 60 },
      { label: 'Hit Rate',           value: `${o.hitRatepct?.toFixed(1)}%`,          threshold: null,  flagged: false },
      { label: 'False Alarm Rate',   value: `${o.falseAlarmRatepct?.toFixed(1)}%`,   threshold: null,  flagged: false },
      { label: "d′ (d-prime)",       value: o.dPrime,                                threshold: null,  flagged: false },
      { label: 'Mean Response RT',   value: o.meanResponseRTms ? `${Math.round(o.meanResponseRTms)}ms` : '—', threshold: null, flagged: false },
      { label: 'Omissions',          value: o.omissions,                             threshold: '5',   flagged: o.omissions > 5 },
    ],
  },
}

export function Dashboard() {
  const navigate       = useNavigate()
  const { data, status } = useDashboardData()

  if (status === 'loading') {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', color: '#888' }}>Loading…</div>
  }

  if (status === 'empty') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', color: '#eee' }}>
        <p style={{ color: '#888' }}>Complete at least one task to see your results.</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '1rem', padding: '0.75rem 2rem', background: '#3a7bd5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          Go Home
        </button>
      </div>
    )
  }

  return (
    <>
      <DashboardHeader data={data} />
      <main className="dashboard" id="main-content">
        <OverviewPanel data={data} />

        {Object.entries(TASK_META).map(([key, meta]) =>
          data[key]
            ? <TaskCard key={key} taskKey={{ task1:'tapThePulse', task2:'signalStop', task3:'wordColourClash', task4:'matchOrPass' }[key]} taskData={data[key]} meta={meta} />
            : <TaskCardPlaceholder key={key} taskName={meta.name} />
        )}

        <Link to="/researcher"
          style={{ fontSize: '0.82rem', color: '#555', textDecoration: 'none', marginBottom: '0.5rem', display: 'block', textAlign: 'center' }}>
          Researcher View →
        </Link>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button onClick={() => navigate('/')} style={{ padding: '0.75rem 2rem', background: 'transparent', color: '#888', border: '1px solid #444', borderRadius: 8, cursor: 'pointer' }}>
            ← Home
          </button>
        </div>
        <InsightsSummary data={data} />
      </main>
    </>
  )
}

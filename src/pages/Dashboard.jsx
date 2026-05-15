import { useNavigate }        from 'react-router-dom';
import { Link }               from 'react-router-dom';
import { TASK_REGISTRY }      from '../config/taskRegistry.js';
import { useDashboardData }   from '../hooks/useDashboardData.js';
import { DashboardHeader }    from '../components/dashboard/DashboardHeader.jsx';
import { OverviewPanel }      from '../components/dashboard/OverviewPanel.jsx';
import { TaskCard, TaskCardPlaceholder } from '../components/dashboard/TaskCard.jsx';
import { InsightsSummary }    from '../components/dashboard/InsightsSummary.jsx';
import { DisclaimerBanner } from '../components/shared/DisclaimerBanner.jsx';
import './Dashboard.css';

export function Dashboard() {
  const navigate = useNavigate();
  const { data, status } = useDashboardData();

  if (status === 'loading') {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', color: '#888' }}>Loading</div>;
  }

  if (status === 'empty') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', color: '#eee' }}>
        <p style={{ color: '#888' }}>Complete at least one task to see your results.</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '1rem', padding: '0.75rem 2rem', background: '#3a7bd5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <>
      <DashboardHeader data={data} />
      <DisclaimerBanner />
      <main className="dashboard" id="main-content">
        <InsightsSummary data={data} />
        <OverviewPanel data={data} />

        {TASK_REGISTRY.map((task) =>
          data[task.id]
            ? <TaskCard            key={task.id} task={task} taskData={data[task.id]} />
            : <TaskCardPlaceholder key={task.id} task={task} />
        )}

        <div className="dashboard-researcher-link">
          <Link to="/researcher" className="researcher-link">
            Researcher View →
          </Link>
        </div>
      </main>
    </>
  );
}
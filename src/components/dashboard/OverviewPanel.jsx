import { collectAllFlags } from '../../config/taskRegistry.js';
import { FlagSummary } from './FlagSummary.jsx';
import { DomainRadarChart } from './DomainRadarChart.jsx';
import { DomainSummaryGrid } from './DomainSummaryGrid.jsx';

export function OverviewPanel({ data }) {
  const allFlags = collectAllFlags(data);

  return (
    <section className="overview-panel" aria-labelledby="overview-heading">
      <h2 id="overview-heading">Your Performance Overview</h2>
      <FlagSummary flags={allFlags} />
      <DomainRadarChart data={data} />
      <DomainSummaryGrid data={data} />
    </section>
  );
}

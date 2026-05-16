import {normaliseDomainScores} from '../../utils/normaliseDomainScores.js';
import {TASK_REGISTRY} from '../../config/taskRegistry.js';
import {BAND_COLOURS} from '../../utils/bandColours.js';
import './InsightsSummary.css';

export function InsightsSummary({ data }) {
  const scores = normaliseDomainScores(data);
  const scoreByTaskId = Object.fromEntries(scores.map(s => [s.taskId, s.score]));

  const rows = TASK_REGISTRY.map(task => {
    const taskData = data?.[task.id];
    const score = scoreByTaskId[task.id];
    const band = taskData ? task.getBand(taskData.overall) : null;
    const insight = task.getInsight(score, taskData?.overall);
    return { task, band, insight, attempted: !!taskData };
  });

  if (rows.filter(r => r.attempted).length === 0) return null;

  return (
    <section className="insights-summary" aria-labelledby="insights-heading">
      <h2 id="insights-heading">Your Session at a Glance</h2>
      <p className="insights-subtitle">
        One observation per domain for reflection only, not a clinical interpretation.
      </p>

      <div className="insights-grid">
        {rows.map(({ task, band, insight, attempted }) => {
          const chipColour = band ? BAND_COLOURS[band.colour]?.hex : null;
          return (
            <div
              key={task.id}
              className={`insight-card${!attempted ? ' insight-card--pending' : ''}`}
            >
              <div className="insight-card-header">
                <span className="insight-domain-label">{task.domain}</span>
                {band && chipColour && (
                  <span
                    className="insight-band-chip"
                    style={{ color: chipColour, borderColor: chipColour }}
                  >
                    {band.label}
                  </span>
                )}
              </div>
              <p className="insight-text">
                {attempted ? insight : 'Complete this task to see your insight.'}
              </p>
            </div>
          );
        })}
      </div>

      <p className="insights-disclaimer">
        These observations reflect your performance on this session only.
        Cognitive performance varies with sleep, mood, and environment.
        None of this constitutes a clinical assessment.
      </p>
    </section>
  );
}
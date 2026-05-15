import './DisclaimerBanner.css'

export function DisclaimerBanner() {
  return (
    <aside className="disclaimer-banner" role="note" aria-label="Important notice">
      <span className="disclaimer-banner__icon" aria-hidden="true">ⓘ</span>
      <p className="disclaimer-banner__text">
        <strong>Educational use only.</strong> This tool is for self-reflection
        and does not constitute a clinical or diagnostic assessment. Results
        should not be used to self-diagnose or replace professional evaluation.
      </p>
    </aside>
  );
}
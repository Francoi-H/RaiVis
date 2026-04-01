import styles from './ExecutionPanel.module.css';
import VariableViewer from './VariableViewer.jsx';
import OutputConsole from './OutputConsole.jsx';

export default function ExecutionPanel({
  steps,
  stepIndex,
  onStep,
  onRun,
  onReset,
  error,
  isRunning,
}) {
  const current = steps[stepIndex] ?? null;
  const hasSteps = steps.length > 0;
  const atEnd = stepIndex >= steps.length - 1;

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${styles.btnAccent}`}
          onClick={onStep}
          disabled={atEnd && hasSteps}
          title="Execute next step"
        >
          Step →
        </button>
        <button
          className={`${styles.btn} ${styles.btnGreen}`}
          onClick={onRun}
          disabled={isRunning || (atEnd && hasSteps)}
          title="Run to end"
        >
          {isRunning ? 'Running…' : 'Run ▶'}
        </button>
        <button
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={onReset}
          title="Reset execution"
        >
          Reset ↺
        </button>
        <span className={styles.counter}>
          {hasSteps ? `${stepIndex + 1} / ${steps.length}` : '—'}
        </span>
      </div>

      {error && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>✕</span>
          {error}
        </div>
      )}

      {current && (
        <div className={styles.currentStep}>
          <span className={styles.stepLabel}>step {stepIndex + 1}</span>
          <span className={styles.stepDesc}>{current.description}</span>
          <span className={styles.stepLine}>line {current.line}</span>
        </div>
      )}

      <div className={styles.panels}>
        <div className={styles.panel}>
          <VariableViewer variables={current?.variables ?? {}} />
        </div>
        <div className={styles.panel}>
          <OutputConsole output={current?.output ?? []} />
        </div>
      </div>

      {hasSteps && (
        <div className={styles.timeline}>
          <div className={styles.timelineHeader}>
            <span className={styles.label}>Execution timeline</span>
          </div>
          <div className={styles.timelineList}>
            {steps.map((step, i) => (
              <div
                key={i}
                className={`${styles.timelineItem} ${i === stepIndex ? styles.timelineActive : ''} ${i < stepIndex ? styles.timelineDone : ''}`}
                onClick={() => onStep(i)}
                title={step.description}
              >
                <span className={styles.timelineNum}>{i + 1}</span>
                <span className={styles.timelineDesc}>{step.description}</span>
                <span className={styles.timelineLine}>:{step.line}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

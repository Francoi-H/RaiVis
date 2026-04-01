import styles from './OutputConsole.module.css';

export default function OutputConsole({ output }) {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.label}>Output</span>
        {output.length > 0 && (
          <span className={styles.count}>{output.length} line{output.length !== 1 ? 's' : ''}</span>
        )}
      </div>
      <div className={styles.body}>
        {output.length === 0 ? (
          <span className={styles.empty}>console output appears here</span>
        ) : (
          output.map((line, i) => (
            <div className={styles.line} key={i}>
              <span className={styles.prompt}>{'>'}</span>
              <span className={styles.text}>{line}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import styles from './VariableViewer.module.css';

function formatValue(val) {
  if (val === undefined) return { text: 'undefined', kind: 'undef' };
  if (val === null) return { text: 'null', kind: 'undef' };
  if (typeof val === 'boolean') return { text: String(val), kind: 'bool' };
  if (typeof val === 'number') return { text: String(val), kind: 'num' };
  if (typeof val === 'string') return { text: `"${val}"`, kind: 'str' };
  return { text: String(val), kind: 'other' };
}

export default function VariableViewer({ variables }) {
  const entries = Object.entries(variables ?? {});

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.label}>Variables</span>
        <span className={styles.count}>{entries.length}</span>
      </div>
      {entries.length === 0 ? (
        <div className={styles.empty}>no variables declared yet</div>
      ) : (
        <div className={styles.list}>
          {entries.map(([key, val]) => {
            const { text, kind } = formatValue(val);
            return (
              <div className={styles.row} key={key}>
                <span className={styles.varName}>{key}</span>
                <span className={`${styles.varValue} ${styles[kind]}`}>{text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

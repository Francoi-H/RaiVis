import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.noise} />
      <div className={styles.grid} />

      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.navIcon}>⬡</span>
          <span className={styles.navText}>Raiviz</span>
        </div>
        <div className={styles.navActions}>
          {user ? (
            <button className={styles.btnPrimary} onClick={() => navigate('/dashboard')}>
              Open Dashboard
            </button>
          ) : (
            <>
              <button className={styles.btnGhost} onClick={() => navigate('/login')}>
                Sign in
              </button>
              <button className={styles.btnPrimary} onClick={() => navigate('/login')}>
                Get started
              </button>
            </>
          )}
        </div>
      </nav>

      <main className={styles.hero}>
        <div className={styles.badge}>step-by-step javascript execution</div>
        <h1 className={styles.headline}>
          See your code<br />
          <span className={styles.accent}>think out loud.</span>
        </h1>
        <p className={styles.sub}>
          Paste code. Step through it. Watch variables change, the stack shift,
          and control flow branch — one instruction at a time.
        </p>
        <div className={styles.ctas}>
          <button
            className={styles.ctaPrimary}
            onClick={() => navigate(user ? '/dashboard' : '/login')}
          >
            Start visualizing →
          </button>
        </div>

        <div className={styles.preview}>
          <div className={styles.previewBar}>
            <span className={styles.dot} style={{ background: '#f87171' }} />
            <span className={styles.dot} style={{ background: '#fbbf24' }} />
            <span className={styles.dot} style={{ background: '#4ade80' }} />
            <span className={styles.previewTitle}>example.js</span>
          </div>
          <div className={styles.previewBody}>
            <div className={styles.codeLine}>
              <span className={styles.lineNum}>1</span>
              <span className={styles.kw}>let</span>
              <span className={styles.var}> x</span>
              <span className={styles.op}> =</span>
              <span className={styles.num}> 5</span>
              <span>;</span>
            </div>
            <div className={`${styles.codeLine} ${styles.codeLineActive}`}>
              <span className={styles.lineNum}>2</span>
              <span className={styles.kw}>let</span>
              <span className={styles.var}> y</span>
              <span className={styles.op}> =</span>
              <span className={styles.var}> x</span>
              <span className={styles.op}> +</span>
              <span className={styles.num}> 2</span>
              <span>;</span>
              <span className={styles.stepArrow}>← step 2</span>
            </div>
            <div className={styles.codeLine}>
              <span className={styles.lineNum}>3</span>
              <span className={styles.fn}>console</span>
              <span>.</span>
              <span className={styles.fn}>log</span>
              <span>(</span>
              <span className={styles.var}>y</span>
              <span>);</span>
            </div>
          </div>
          <div className={styles.previewVars}>
            <span className={styles.varChip}>x <strong>= 5</strong></span>
            <span className={styles.varChip}>y <strong>= 7</strong></span>
          </div>
        </div>
      </main>
    </div>
  );
}

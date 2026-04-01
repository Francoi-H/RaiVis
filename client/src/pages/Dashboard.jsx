import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { buildSteps } from '../interpreter/interpreter.js';
import CodeEditor from '../components/CodeEditor.jsx';
import ExecutionPanel from '../components/ExecutionPanel.jsx';
import styles from './Dashboard.module.css';

const DEFAULT_CODE = `let x = 5;
let y = x + 2;
let z = x * y;

if (z > 30) {
  let result = z - 10;
  console.log(result);
} else {
  console.log(z);
}

let i = 0;
while (i < 3) {
  i = i + 1;
  console.log(i);
}
`;

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState(DEFAULT_CODE);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [snippets, setSnippets] = useState([]);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [showSnippets, setShowSnippets] = useState(false);
  const runTimer = useRef(null);

  useEffect(() => {
    loadSnippets();
    return () => clearInterval(runTimer.current);
  }, []);

  async function loadSnippets() {
    try {
      const data = await api.getSnippets(token);
      setSnippets(data.snippets);
    } catch {}
  }

  function compile() {
    const result = buildSteps(code);
    setError(result.error);
    setSteps(result.steps);
    setStepIndex(result.steps.length > 0 ? 0 : -1);
    return result;
  }

  function handleStep(targetIndex) {
    if (steps.length === 0) {
      const result = compile();
      if (result.error || result.steps.length === 0) return;
      return;
    }
    if (typeof targetIndex === 'number') {
      setStepIndex(targetIndex);
    } else {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }
  }

  function handleRun() {
    let result = { steps, error };
    if (steps.length === 0) {
      result = compile();
      if (result.error || result.steps.length === 0) return;
    }

    setIsRunning(true);
    let i = stepIndex < 0 ? 0 : stepIndex;
    const total = result.steps.length;

    runTimer.current = setInterval(() => {
      i++;
      setStepIndex(i);
      if (i >= total - 1) {
        clearInterval(runTimer.current);
        setIsRunning(false);
      }
    }, 120);
  }

  function handleReset() {
    clearInterval(runTimer.current);
    setIsRunning(false);
    setSteps([]);
    setStepIndex(-1);
    setError(null);
  }

  function handleCodeChange(val) {
    setCode(val);
    handleReset();
  }

  async function handleSave() {
    try {
      const snippet = await api.saveSnippet(token, saveTitle || 'Untitled', code);
      setSnippets((prev) => [snippet, ...prev]);
      setSaveMsg('Saved!');
      setShowSave(false);
      setSaveTitle('');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (err) {
      setSaveMsg(err.message);
    }
  }

  async function handleDeleteSnippet(id) {
    try {
      await api.deleteSnippet(token, id);
      setSnippets((prev) => prev.filter((s) => s.id !== id));
    } catch {}
  }

  function handleLoadSnippet(snippet) {
    setCode(snippet.code);
    handleReset();
    setShowSnippets(false);
  }

  const currentLine = steps[stepIndex]?.line ?? null;

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>⬡ Raiviz</span>
        </div>
        <div className={styles.headerCenter}>
          {currentLine && (
            <span className={styles.lineIndicator}>line {currentLine}</span>
          )}
        </div>
        <div className={styles.headerRight}>
          {saveMsg && <span className={styles.saveMsg}>{saveMsg}</span>}
          <button className={styles.headerBtn} onClick={() => setShowSnippets(!showSnippets)}>
            Snippets
          </button>
          <button className={styles.headerBtn} onClick={() => setShowSave(!showSave)}>
            Save
          </button>
          <span className={styles.userEmail}>{user?.email}</span>
          <button className={styles.headerBtnDanger} onClick={() => { logout(); navigate('/'); }}>
            Sign out
          </button>
        </div>
      </header>

      {showSave && (
        <div className={styles.saveBar}>
          <input
            className={styles.saveInput}
            placeholder="Snippet title..."
            value={saveTitle}
            onChange={(e) => setSaveTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <button className={styles.saveBtnOk} onClick={handleSave}>Save</button>
          <button className={styles.saveBtnCancel} onClick={() => setShowSave(false)}>Cancel</button>
        </div>
      )}

      {showSnippets && (
        <div className={styles.snippetDrawer}>
          <div className={styles.snippetDrawerHeader}>
            <span>Saved Snippets</span>
            <button className={styles.closeBtn} onClick={() => setShowSnippets(false)}>✕</button>
          </div>
          {snippets.length === 0 ? (
            <div className={styles.snippetEmpty}>No saved snippets yet.</div>
          ) : (
            snippets.map((s) => (
              <div className={styles.snippetItem} key={s.id}>
                <button className={styles.snippetLoad} onClick={() => handleLoadSnippet(s)}>
                  {s.title}
                  <span className={styles.snippetDate}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </button>
                <button className={styles.snippetDelete} onClick={() => handleDeleteSnippet(s.id)}>✕</button>
              </div>
            ))
          )}
        </div>
      )}

      <div className={styles.workspace}>
        <div className={styles.editorPane}>
          <div className={styles.paneHeader}>
            <span className={styles.paneTitle}>editor</span>
            {steps.length === 0 && (
              <button className={styles.compileBtn} onClick={compile}>
                Compile ↓
              </button>
            )}
          </div>
          <div className={styles.editorBody}>
            <CodeEditor
              code={code}
              onChange={handleCodeChange}
              currentLine={currentLine}
            />
          </div>
        </div>

        <div className={styles.executionPane}>
          <div className={styles.paneHeader}>
            <span className={styles.paneTitle}>execution</span>
          </div>
          <ExecutionPanel
            steps={steps}
            stepIndex={stepIndex < 0 ? 0 : stepIndex}
            onStep={handleStep}
            onRun={handleRun}
            onReset={handleReset}
            error={error}
            isRunning={isRunning}
          />
        </div>
      </div>
    </div>
  );
}

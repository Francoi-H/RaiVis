# Code Execution Visualizer

## Project Structure

```
code-visualizer/
  database/
    schema.sql
  server/
    models/
    routes/
    middleware/
    db.js
    server.js
    package.json
    .env.example
  client/
    src/
      interpreter/   ← tokenizer, parser, interpreter
      components/    ← CodeEditor, ExecutionPanel, VariableViewer, OutputConsole
      pages/         ← Home, Login, Dashboard
      context/       ← AuthContext
      lib/           ← api.js
    index.html
    vite.config.js
    package.json
```

---

## Setup

### 1. Database

```bash
createdb code_visualizer
psql code_visualizer < database/schema.sql
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your DB credentials and a JWT secret
npm run dev
```

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on http://localhost:5173  
Backend runs on http://localhost:4000

---

## Features (v1)

- Register / Login with JWT auth
- Monaco Editor with custom dark theme
- Custom JS interpreter supporting:
  - `let` / `const` declarations
  - Arithmetic: `+ - * /`
  - Comparison: `== != < > <= >=`
  - Logic: `&& ||`
  - Assignment
  - `if / else`
  - `while` loops
  - `console.log`
- Step-by-step execution with variable snapshots
- Run mode (auto-steps through all)
- Execution timeline (click any step to jump)
- Save / load code snippets per user

---

## Interpreter Architecture

```
source code
    ↓
tokenizer.js   → token stream
    ↓
parser.js      → AST with line numbers
    ↓
interpreter.js → builds array of Step snapshots
    ↓
Dashboard.jsx  → drives stepIndex into ExecutionPanel
```

Each step snapshot contains:
- `line` — source line number
- `description` — human-readable label
- `variables` — full variable state at that point
- `output` — console output accumulated so far

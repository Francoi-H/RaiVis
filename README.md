# RaiVis

A web app that lets you step through JavaScript code and watch it execute — variables update in real time, the call stack shifts as functions are called, and every instruction is logged in a timeline you can scrub through.

Built this to get a better understanding of how code actually runs under the hood.

---

## Stack

- React + Vite
- Monaco Editor
- Node.js + Express
- PostgreSQL
- JWT auth

---

## Running locally

**Database**
```bash
createdb raivis
psql raivis < database/schema.sql
```

**Backend**
```bash
cd server
npm install
cp .env.example .env
# fill in your DB credentials and a JWT secret
npm run dev
```

**Frontend**
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`

---

## What the interpreter supports

The execution engine is written from scratch — no `eval`, no external libraries.

- `let` / `const` / `var`
- Arithmetic and comparison operators
- `if / else`
- `while` and `for` loops with `break` / `continue`
- Functions (declarations, calls, recursion)
- Arrays with common methods (`push`, `pop`, `slice`, etc.)
- Objects
- `console.log`

---

## How it works

```
source code → tokenizer → parser → AST → interpreter → steps[]
```

The interpreter walks the AST and produces a snapshot after every instruction. Each snapshot holds the current variable state, call stack, and console output. The frontend just indexes into that array as you step forward or back.

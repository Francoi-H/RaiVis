import { parse } from './parser.js';

const MAX_STEPS = 1000;

export function buildSteps(source) {
  let ast;
  try {
    ast = parse(source);
  } catch (err) {
    return { steps: [], error: `Parse error: ${err.message}` };
  }

  const steps = [];
  const env = {};
  const output = [];
  let stepCount = 0;

  function snapshot(line, description) {
    steps.push({
      line,
      description,
      variables: { ...env },
      output: [...output],
    });
  }

  function evalExpr(node) {
    if (!node) return undefined;

    switch (node.type) {
      case 'Literal':
        return node.value;

      case 'Identifier': {
        if (!(node.name in env)) {
          throw new Error(`ReferenceError: ${node.name} is not defined`);
        }
        return env[node.name];
      }

      case 'UnaryExpr': {
        const v = evalExpr(node.operand);
        if (node.op === '-') return -v;
        if (node.op === '!') return !v;
        break;
      }

      case 'BinaryExpr': {
        const l = evalExpr(node.left);
        const r = evalExpr(node.right);
        switch (node.op) {
          case '+': return l + r;
          case '-': return l - r;
          case '*': return l * r;
          case '/': return l / r;
          case '==': return l == r;
          case '!=': return l != r;
          case '<': return l < r;
          case '>': return l > r;
          case '<=': return l <= r;
          case '>=': return l >= r;
          case '&&': return l && r;
          case '||': return l || r;
          default: throw new Error(`Unknown operator: ${node.op}`);
        }
      }

      case 'Assignment': {
        if (!(node.name in env)) {
          throw new Error(`ReferenceError: ${node.name} is not defined`);
        }
        const val = evalExpr(node.value);
        env[node.name] = val;
        return val;
      }

      case 'ConsoleLog': {
        const parts = node.args.map(a => String(evalExpr(a)));
        const msg = parts.join(' ');
        output.push(msg);
        snapshot(node.line, `console.log → "${msg}"`);
        return undefined;
      }

      case 'CallExpr':
        throw new Error(`Function calls are not supported in v1`);

      default:
        throw new Error(`Unknown expression type: ${node.type}`);
    }
  }

  function execNode(node) {
    if (stepCount++ > MAX_STEPS) {
      throw new Error('Execution limit reached (possible infinite loop)');
    }

    switch (node.type) {
      case 'Program':
      case 'Block':
        for (const stmt of node.body) {
          execNode(stmt);
        }
        break;

      case 'VarDecl': {
        const val = node.init !== null ? evalExpr(node.init) : undefined;
        env[node.name] = val;
        snapshot(node.line, `${node.kind} ${node.name} = ${formatVal(val)}`);
        break;
      }

      case 'ExpressionStatement': {
        const expr = node.expression;
        if (expr.type === 'ConsoleLog') {
          evalExpr(expr);
        } else if (expr.type === 'Assignment') {
          const val = evalExpr(expr.value);
          env[expr.name] = val;
          snapshot(node.line, `${expr.name} = ${formatVal(val)}`);
        } else {
          evalExpr(expr);
          snapshot(node.line, `expression`);
        }
        break;
      }

      case 'IfStatement': {
        const result = evalExpr(node.test);
        snapshot(node.line, `if (${formatVal(result)})`);
        if (result) {
          execNode(node.consequent);
        } else if (node.alternate) {
          execNode(node.alternate);
        }
        break;
      }

      case 'WhileStatement': {
        let guard = 0;
        while (true) {
          if (guard++ > MAX_STEPS) throw new Error('Infinite loop detected');
          const result = evalExpr(node.test);
          snapshot(node.line, `while (${formatVal(result)})`);
          if (!result) break;
          execNode(node.body);
        }
        break;
      }

      default:
        break;
    }
  }

  try {
    execNode(ast);
    return { steps, error: null };
  } catch (err) {
    return { steps, error: err.message };
  }
}

function formatVal(v) {
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return `"${v}"`;
  return String(v);
}

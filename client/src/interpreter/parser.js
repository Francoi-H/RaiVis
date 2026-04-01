import { tokenize, TT } from './tokenizer.js';

function parse(source) {
  const lines = source.split('\n');
  const lineMap = buildLineMap(source);
  const tokens = tokenize(source);
  let pos = 0;

  function peek() { return tokens[pos]; }
  function consume() { return tokens[pos++]; }
  function expect(type, value) {
    const t = consume();
    if (t.type !== type || (value !== undefined && t.value !== value)) {
      throw new Error(`Expected ${value ?? type} but got "${t.value}"`);
    }
    return t;
  }

  function currentLine() {
    return lineMap[pos] ?? 1;
  }

  function parseProgram() {
    const body = [];
    while (peek().type !== TT.EOF) {
      body.push(parseStatement());
    }
    return { type: 'Program', body };
  }

  function parseStatement() {
    const t = peek();

    if (t.type === TT.KEYWORD && (t.value === 'let' || t.value === 'const')) {
      return parseVarDecl();
    }
    if (t.type === TT.KEYWORD && t.value === 'if') {
      return parseIf();
    }
    if (t.type === TT.KEYWORD && t.value === 'while') {
      return parseWhile();
    }
    if (t.type === TT.PUNCTUATION && t.value === '{') {
      return parseBlock();
    }
    return parseExpressionStatement();
  }

  function parseVarDecl() {
    const line = currentLine();
    const kind = consume().value;
    const name = expect(TT.IDENTIFIER).value;
    let init = null;
    if (peek().type === TT.OPERATOR && peek().value === '=') {
      consume();
      init = parseExpression();
    }
    consumeSemicolon();
    return { type: 'VarDecl', kind, name, init, line };
  }

  function parseIf() {
    const line = currentLine();
    expect(TT.KEYWORD, 'if');
    expect(TT.PUNCTUATION, '(');
    const test = parseExpression();
    expect(TT.PUNCTUATION, ')');
    const consequent = parseStatement();
    let alternate = null;
    if (peek().type === TT.KEYWORD && peek().value === 'else') {
      consume();
      alternate = parseStatement();
    }
    return { type: 'IfStatement', test, consequent, alternate, line };
  }

  function parseWhile() {
    const line = currentLine();
    expect(TT.KEYWORD, 'while');
    expect(TT.PUNCTUATION, '(');
    const test = parseExpression();
    expect(TT.PUNCTUATION, ')');
    const body = parseStatement();
    return { type: 'WhileStatement', test, body, line };
  }

  function parseBlock() {
    const line = currentLine();
    expect(TT.PUNCTUATION, '{');
    const body = [];
    while (!(peek().type === TT.PUNCTUATION && peek().value === '}') && peek().type !== TT.EOF) {
      body.push(parseStatement());
    }
    expect(TT.PUNCTUATION, '}');
    return { type: 'Block', body, line };
  }

  function parseExpressionStatement() {
    const line = currentLine();
    const expr = parseExpression();
    consumeSemicolon();
    return { type: 'ExpressionStatement', expression: expr, line };
  }

  function parseExpression() {
    return parseAssignment();
  }

  function parseAssignment() {
    const left = parseLogicalOr();
    if (peek().type === TT.OPERATOR && peek().value === '=' && left.type === 'Identifier') {
      consume();
      const right = parseAssignment();
      return { type: 'Assignment', name: left.name, value: right, line: left.line };
    }
    return left;
  }

  function parseLogicalOr() {
    let left = parseLogicalAnd();
    while (peek().type === TT.OPERATOR && peek().value === '||') {
      const op = consume().value;
      const right = parseLogicalAnd();
      left = { type: 'BinaryExpr', op, left, right };
    }
    return left;
  }

  function parseLogicalAnd() {
    let left = parseEquality();
    while (peek().type === TT.OPERATOR && peek().value === '&&') {
      const op = consume().value;
      const right = parseEquality();
      left = { type: 'BinaryExpr', op, left, right };
    }
    return left;
  }

  function parseEquality() {
    let left = parseRelational();
    while (peek().type === TT.OPERATOR && (peek().value === '==' || peek().value === '!=')) {
      const op = consume().value;
      const right = parseRelational();
      left = { type: 'BinaryExpr', op, left, right };
    }
    return left;
  }

  function parseRelational() {
    let left = parseAddSub();
    while (peek().type === TT.OPERATOR && ['<', '>', '<=', '>='].includes(peek().value)) {
      const op = consume().value;
      const right = parseAddSub();
      left = { type: 'BinaryExpr', op, left, right };
    }
    return left;
  }

  function parseAddSub() {
    let left = parseMulDiv();
    while (peek().type === TT.OPERATOR && (peek().value === '+' || peek().value === '-')) {
      const op = consume().value;
      const right = parseMulDiv();
      left = { type: 'BinaryExpr', op, left, right };
    }
    return left;
  }

  function parseMulDiv() {
    let left = parseUnary();
    while (peek().type === TT.OPERATOR && (peek().value === '*' || peek().value === '/')) {
      const op = consume().value;
      const right = parseUnary();
      left = { type: 'BinaryExpr', op, left, right };
    }
    return left;
  }

  function parseUnary() {
    if (peek().type === TT.OPERATOR && peek().value === '!') {
      consume();
      return { type: 'UnaryExpr', op: '!', operand: parseUnary() };
    }
    if (peek().type === TT.OPERATOR && peek().value === '-') {
      consume();
      return { type: 'UnaryExpr', op: '-', operand: parseUnary() };
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const line = currentLine();
    const t = peek();

    if (t.type === TT.NUMBER) {
      consume();
      return { type: 'Literal', value: t.value, line };
    }
    if (t.type === TT.STRING) {
      consume();
      return { type: 'Literal', value: t.value, line };
    }
    if (t.type === TT.KEYWORD && (t.value === 'true' || t.value === 'false')) {
      consume();
      return { type: 'Literal', value: t.value === 'true', line };
    }
    if (t.type === TT.IDENTIFIER) {
      consume();
      if (t.value === 'console.log' || (t.value === 'console' && peek().value !== '.')) {
        return parseConsoleLog(line);
      }
      if (peek().type === TT.PUNCTUATION && peek().value === '(') {
        return parseCallExpr(t.value, line);
      }
      return { type: 'Identifier', name: t.value, line };
    }
    if (t.type === TT.PUNCTUATION && t.value === '(') {
      consume();
      const expr = parseExpression();
      expect(TT.PUNCTUATION, ')');
      return expr;
    }
    throw new Error(`Unexpected token: "${t.value}"`);
  }

  function parseConsoleLog(line) {
    expect(TT.PUNCTUATION, '(');
    const args = [];
    while (!(peek().type === TT.PUNCTUATION && peek().value === ')') && peek().type !== TT.EOF) {
      args.push(parseExpression());
      if (peek().type === TT.PUNCTUATION && peek().value === ',') consume();
    }
    expect(TT.PUNCTUATION, ')');
    return { type: 'ConsoleLog', args, line };
  }

  function parseCallExpr(name, line) {
    expect(TT.PUNCTUATION, '(');
    const args = [];
    while (!(peek().type === TT.PUNCTUATION && peek().value === ')') && peek().type !== TT.EOF) {
      args.push(parseExpression());
      if (peek().type === TT.PUNCTUATION && peek().value === ',') consume();
    }
    expect(TT.PUNCTUATION, ')');
    return { type: 'CallExpr', callee: name, args, line };
  }

  function consumeSemicolon() {
    if (peek().type === TT.PUNCTUATION && peek().value === ';') consume();
  }

  return parseProgram();
}

function buildLineMap(source) {
  const map = {};
  const lines = source.split('\n');
  let charPos = 0;
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    map[charPos] = lineNum + 1;
    charPos += lines[lineNum].length + 1;
  }
  return map;
}

export { parse };

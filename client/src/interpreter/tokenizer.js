const TT = {
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  IDENTIFIER: 'IDENTIFIER',
  KEYWORD: 'KEYWORD',
  OPERATOR: 'OPERATOR',
  PUNCTUATION: 'PUNCTUATION',
  EOF: 'EOF',
};

const KEYWORDS = new Set(['let', 'const', 'if', 'else', 'while', 'true', 'false']);
const OPERATORS = new Set(['+', '-', '*', '/', '=', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!']);

function tokenize(source) {
  const tokens = [];
  let i = 0;

  while (i < source.length) {
    let ch = source[i];

    if (ch === '\n' || ch === '\r' || ch === ' ' || ch === '\t') {
      i++;
      continue;
    }

    if (ch === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++;
      continue;
    }

    if (ch >= '0' && ch <= '9') {
      let num = '';
      while (i < source.length && ((source[i] >= '0' && source[i] <= '9') || source[i] === '.')) {
        num += source[i++];
      }
      tokens.push({ type: TT.NUMBER, value: parseFloat(num) });
      continue;
    }

    if (ch === '"' || ch === "'") {
      const quote = ch;
      let str = '';
      i++;
      while (i < source.length && source[i] !== quote) {
        str += source[i++];
      }
      i++;
      tokens.push({ type: TT.STRING, value: str });
      continue;
    }

    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
      let word = '';
      while (i < source.length && ((source[i] >= 'a' && source[i] <= 'z') || (source[i] >= 'A' && source[i] <= 'Z') || (source[i] >= '0' && source[i] <= '9') || source[i] === '_' || source[i] === '.')) {
        word += source[i++];
      }
      if (KEYWORDS.has(word)) {
        tokens.push({ type: TT.KEYWORD, value: word });
      } else {
        tokens.push({ type: TT.IDENTIFIER, value: word });
      }
      continue;
    }

    const twoChar = source[i] + source[i + 1];
    if (OPERATORS.has(twoChar)) {
      tokens.push({ type: TT.OPERATOR, value: twoChar });
      i += 2;
      continue;
    }

    if (OPERATORS.has(ch)) {
      tokens.push({ type: TT.OPERATOR, value: ch });
      i++;
      continue;
    }

    if ('();,{}'.includes(ch)) {
      tokens.push({ type: TT.PUNCTUATION, value: ch });
      i++;
      continue;
    }

    i++;
  }

  tokens.push({ type: TT.EOF, value: null });
  return tokens;
}

export { tokenize, TT };

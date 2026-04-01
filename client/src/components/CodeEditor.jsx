import Editor from '@monaco-editor/react';

const MONACO_OPTIONS = {
  fontSize: 13,
  fontFamily: "'IBM Plex Mono', monospace",
  lineHeight: 22,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  renderLineHighlight: 'none',
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
  padding: { top: 16, bottom: 16 },
  lineNumbers: 'on',
  glyphMargin: false,
  folding: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 3,
};

export default function CodeEditor({ code, onChange, currentLine, readOnly }) {
  function handleMount(editor, monaco) {
    editor.onDidChangeModelContent(() => {
      onChange(editor.getValue());
    });
  }

  function handleBeforeMount(monaco) {
    monaco.editor.defineTheme('execviz', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'normal' },
        { token: 'number', foreground: 'fb923c' },
        { token: 'string', foreground: '86efac' },
        { token: 'identifier', foreground: '67e8f9' },
        { token: 'comment', foreground: '4b5563' },
      ],
      colors: {
        'editor.background': '#111118',
        'editor.foreground': '#e8e8f0',
        'editor.lineHighlightBackground': '#00000000',
        'editor.lineHighlightBorder': '#00000000',
        'editorLineNumber.foreground': '#3a3a50',
        'editorLineNumber.activeForeground': '#8888aa',
        'editor.selectionBackground': '#7c6af730',
        'editor.inactiveSelectionBackground': '#7c6af718',
        'editorCursor.foreground': '#7c6af7',
        'editorWidget.background': '#1a1a24',
        'editorSuggestWidget.background': '#1a1a24',
      },
    });
  }

  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      value={code}
      theme="execviz"
      options={{ ...MONACO_OPTIONS, readOnly: readOnly ?? false }}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
    />
  );
}

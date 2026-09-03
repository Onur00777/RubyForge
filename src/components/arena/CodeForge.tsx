"use client";

import { useEffect, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface Props {
  fileName: string;
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
}

export function CodeForge({ fileName, code, onChange, onRun }: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const runRef = useRef(onRun);
  useEffect(() => {
    runRef.current = onRun;
  }, [onRun]);

  const handleMount: OnMount = (instance, monaco) => {
    editorRef.current = instance;
    monaco.editor.defineTheme("rubyforge", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A6274", fontStyle: "italic" },
        { token: "string", foreground: "FF6B8A" },
        { token: "keyword", foreground: "FF1E56" },
        { token: "number", foreground: "F5B942" },
        { token: "regexp", foreground: "34D399" },
      ],
      colors: {
        "editor.background": "#040407",
        "editor.foreground": "#F4F1F6",
        "editorLineNumber.foreground": "#4A4452",
        "editorLineNumber.activeForeground": "#FF1E56",
        "editor.selectionBackground": "#FF1E5633",
        "editor.lineHighlightBackground": "#120C1288",
        "editorCursor.foreground": "#FF1E56",
        "editorIndentGuide.background": "#221C26",
        "editorGutter.background": "#040407",
        "scrollbarSlider.background": "#FF1E5633",
      },
    });
    monaco.editor.setTheme("rubyforge");
    instance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current());
  };

  return (
    <div className="min-h-0 flex-1" aria-label={fileName}>
      <Editor
        height="100%"
        language="ruby"
        theme="rubyforge"
        value={code}
        onChange={(value) => onChange(value ?? "")}
        onMount={handleMount}
        options={{
          fontFamily: "JetBrains Mono, Fira Code, Consolas, monospace",
          fontSize: 14,
          lineHeight: 22,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          tabSize: 2,
          padding: { top: 14, bottom: 14 },
          renderLineHighlight: "line",
          automaticLayout: true,
          wordWrap: "on",
        }}
      />
    </div>
  );
}

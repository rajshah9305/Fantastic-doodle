import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "@/contexts/ThemeContext";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  language = "html",
  readOnly = false,
}: CodeEditorProps) {
  const { theme } = useTheme();

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "");
  };

  return (
    <div className="h-full w-full">
      <Editor
        value={value}
        language={language}
        theme={theme === "dark" ? "vs-dark" : "vs-light"}
        onChange={handleEditorChange}
        options={{
          automaticLayout: true,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly,
          wordWrap: "on",
          padding: { top: 16, bottom: 16 },
          fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
          fontLigatures: true,
        }}
      />
    </div>
  );
}

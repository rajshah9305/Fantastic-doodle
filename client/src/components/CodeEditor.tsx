import Editor from "@monaco-editor/react";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";

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
  const [fontSize, setFontSize] = useState(window.innerWidth < 768 ? 16 : 14);

  useEffect(() => {
    const handleResize = () => {
      setFontSize(window.innerWidth < 768 ? 16 : 14);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          minimap: { enabled: window.innerWidth >= 1024 },
          fontSize: fontSize,
          lineHeight: fontSize * 1.5,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: true,
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

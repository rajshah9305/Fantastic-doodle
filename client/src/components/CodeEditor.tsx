import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Lock, FileCode } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  filename?: string;
  className?: string;
}

export default function CodeEditor({
  value,
  onChange,
  language = "html",
  readOnly = false,
  filename = "untitled",
  className,
}: CodeEditorProps) {
  const { theme } = useTheme();

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "");
  };

  return (
    <div className={cn(
      "flex flex-col h-full w-full rounded-xl overflow-hidden border border-zinc-800 bg-[#1e1e1e] shadow-2xl font-mono ring-1 ring-white/5",
      className
    )}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-zinc-800 select-none">
        <div className="flex items-center gap-4">
          {/* Window Controls */}
          <div className="flex gap-2 group">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] group-hover:bg-[#ff5f56]/80 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] group-hover:bg-[#ffbd2e]/80 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] group-hover:bg-[#27c93f]/80 transition-colors" />
          </div>

          {/* Filename */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/50 px-3 py-1 rounded-md border border-zinc-800/50 shadow-inner">
            <FileCode size={13} className="text-blue-400" />
            <span className="font-medium tracking-wide opacity-90">{filename}</span>
          </div>
        </div>

        {/* Metadata / Status */}
        <div className="flex items-center gap-3">
          {readOnly && (
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-zinc-500">
              <Lock size={12} />
              <span>Read Only</span>
            </div>
          )}
          <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500/80">
            {language}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative bg-[#1e1e1e]">
        <Editor
          value={value}
          language={language}
          theme="vs-dark"
          onChange={handleEditorChange}
          options={{
            automaticLayout: true,
            minimap: { enabled: true, scale: 0.75 },
            fontSize: 13,
            lineHeight: 20,
            lineNumbers: "on",
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly,
            wordWrap: "on",
            padding: { top: 16, bottom: 16 },
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Menlo', monospace",
            fontLigatures: true,
            renderLineHighlight: "all",
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            matchBrackets: "always",
            guides: {
                indentation: true,
                bracketPairs: true
            }
          }}
        />
      </div>
    </div>
  );
}

import { useRef, useEffect } from "react";

interface LivePreviewProps {
  code: string;
  title?: string;
}

export default function LivePreview({
  code,
  title = "Preview",
}: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;

    if (doc) {
      let finalCode = code;

      // Ensure the code has a basic HTML structure if it's just a fragment
      if (!code.toLowerCase().includes("<html") && !code.toLowerCase().includes("<!doctype")) {
        finalCode = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
            </style>
          </head>
          <body>
            ${code}
          </body>
          </html>
        `;
      }

      doc.open();
      doc.write(finalCode);
      doc.close();
    }
  }, [code]);

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950 border-2 border-orange-600/50 shadow-[4px_4px_0px_0px_rgba(234,88,12,0.4)] overflow-hidden">
      {/* Preview chrome bar */}
      <div className="h-8 bg-black border-b border-orange-600/30 flex items-center px-3 gap-1.5 shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600" />
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600" />
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600" />
        <span className="ml-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest truncate">
          {title}
        </span>
      </div>
      <iframe
        ref={iframeRef}
        className="w-full flex-1 border-0 bg-white"
        sandbox="allow-scripts allow-same-origin"
        title={title}
      />
    </div>
  );
}

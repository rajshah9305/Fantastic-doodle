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
    <div className="h-full w-full bg-white rounded-lg overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
        title={title}
      />
    </div>
  );
}

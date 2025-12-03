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
      doc.open();
      doc.write(code);
      doc.close();
    }
  }, [code]);

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
        title={title}
      />
    </div>
  );
}

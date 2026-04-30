export interface AppCodeParts {
  title?: string;
  htmlCode?: string | null;
  cssCode?: string | null;
  jsCode?: string | null;
}

const DEFAULT_BODY_STYLE =
  "body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }";

export function buildHtmlDocument(parts: AppCodeParts, includeBaseStyle = false): string {
  const title = parts.title || "Generated App";
  const styles = `${includeBaseStyle ? `${DEFAULT_BODY_STYLE}\n` : ""}${parts.cssCode || ""}`.trim();

  // Basic cleanup to prevent nested head/body if AI returns full HTML
  let htmlBody = (parts.htmlCode || "").trim();

  // If the AI returned a full document, try to extract just the body content
  if (htmlBody.toLowerCase().includes("<body")) {
    const bodyMatch = htmlBody.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      htmlBody = bodyMatch[1].trim();
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    ${styles}
  </style>
</head>
<body>
  ${htmlBody}
  <script>
    ${parts.jsCode || ""}
  </script>
</body>
</html>`;
}

export function buildCodeBundle(parts: Pick<AppCodeParts, "htmlCode" | "cssCode" | "jsCode">): string {
  return `${parts.htmlCode || ""}

<style>
${parts.cssCode || ""}
</style>

<script>
${parts.jsCode || ""}
</script>`;
}

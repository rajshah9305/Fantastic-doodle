import { useState, useRef, useEffect, useCallback } from "react";
import Head from "next/head";

const MODELS = [
  { id: "openai/gpt-oss-120b",                       label: "GPT-OSS 120B",         badge: "tools" },
  { id: "llama-3.1-8b-instant",                      label: "Llama 3.1 8B Instant", badge: "fast" },
  { id: "meta-llama/llama-4-scout-17b-16e-instruct", label: "Llama 4 Scout 17B",    badge: "fast" },
  { id: "moonshotai/kimi-k2-instruct-0905",          label: "Kimi K2 Instruct",     badge: "long" },
  { id: "llama-3.3-70b-versatile",                   label: "Llama 3.3 70B",        badge: "versatile" },
];

// ── Robust SSE line parser ────────────────────────────────────────────────────
// Parses a raw SSE text buffer and returns { events, remainder }
// Each event: { type: string, data: string }
function parseSSE(buffer) {
  const events = [];
  const blocks = buffer.split(/\n\n/);
  const remainder = blocks.pop(); // last block may be incomplete
  for (const block of blocks) {
    if (!block.trim()) continue;
    let type = "message", data = "";
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) type = line.slice(6).trim();
      else if (line.startsWith("data:")) data = line.slice(5).trimStart();
    }
    if (data) events.push({ type, data });
  }
  return { events, remainder };
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
function Markdown({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  const out = [];
  let codeLines = null, codeLang = "", key = 0;
  for (const line of lines) {
    if (line.startsWith("```")) {
      if (codeLines === null) { codeLang = line.slice(3).trim(); codeLines = []; }
      else {
        out.push(<pre key={key++} className="code-block"><span className="code-lang">{codeLang}</span><code>{codeLines.join("\n")}</code></pre>);
        codeLines = null; codeLang = "";
      }
      continue;
    }
    if (codeLines !== null) { codeLines.push(line); continue; }
    const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((p, i) => {
      if (p.startsWith("`") && p.endsWith("`")) return <code key={i} className="ic">{p.slice(1,-1)}</code>;
      if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2,-2)}</strong>;
      return p;
    });
    out.push(<p key={key++} className="md-p">{parts}</p>);
  }
  if (codeLines !== null) out.push(<pre key={key++} className="code-block"><code>{codeLines.join("\n")}</code></pre>);
  return <>{out}</>;
}

// ── Reasoning block ───────────────────────────────────────────────────────────
function ReasoningBlock({ text, streaming }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <div className="reasoning">
      <button className="reasoning-btn" onClick={() => setOpen(o => !o)}>
        <span>🧠</span>
        <span>Reasoning {streaming ? <span className="r-cursor" /> : `(${text.split(" ").length} tokens)`}</span>
        <span className="chev">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="reasoning-body"><Markdown text={text} /></div>}
    </div>
  );
}

// ── Tool badge ────────────────────────────────────────────────────────────────
function ToolBadge({ raw }) {
  const m = raw.match(/^\[TOOL:([^\]]+)\]\s*(.*)/s);
  if (!m) return null;
  const [, name, result] = m;
  const [open, setOpen] = useState(false);
  return (
    <div className="tool">
      <button className="tool-btn" onClick={() => setOpen(o => !o)}>
        <span>{name === "browser_search" ? "🔍" : "⚙️"}</span>
        <span className="tool-name">{name.replace(/_/g, " ")}</span>
        <span className="chev">{open ? "▲" : "▼"}</span>
      </button>
      {open && <pre className="tool-body">{result}</pre>}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === "user";
  const parts = (msg.content || "").split(/(\[TOOL:[^\]]+\][^\n]*)/g);
  return (
    <div className={`row ${isUser ? "row-user" : "row-ai"}`}>
      <div className={`avatar ${isUser ? "av-user" : "av-ai"}`}>
        {isUser ? "You" : "AI"}
      </div>
      <div className={`bubble ${isUser ? "b-user" : "b-ai"}`}>
        {!isUser && <ReasoningBlock text={msg.reasoning} streaming={msg.streaming && !msg.content} />}
        {parts.map((p, i) =>
          p.startsWith("[TOOL:") ? <ToolBadge key={i} raw={p} /> : <Markdown key={i} text={p} />
        )}
        {msg.streaming && msg.content !== undefined && <span className="cursor" />}
      </div>
    </div>
  );
}

// ── Suggestions ───────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Search for the latest AI research papers",
  "Write and run a Python fibonacci function",
  "Explain how transformers work",
  "What is the square root of 98765?",
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [model, setModel]       = useState(MODELS[0].id);
  const [loading, setLoading]   = useState(false);
  const [sidebar, setSidebar]   = useState(true);
  const bottomRef  = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const history = [...messages, { role: "user", content: text }];
    setMessages(history);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    // Placeholder AI message
    setMessages([...history, { role: "assistant", content: "", reasoning: "", streaming: true }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          model,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const { events, remainder } = parseSSE(buf);
        buf = remainder;

        for (const { type, data } of events) {
          if (data === "[DONE]") continue;
          setMessages(prev => {
            const next = [...prev];
            const last = { ...next[next.length - 1] };
            if (type === "reasoning") {
              last.reasoning = (last.reasoning || "") + data;
            } else {
              last.content = (last.content || "") + data;
            }
            next[next.length - 1] = last;
            return next;
          });
        }
      }
    } catch (err) {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: `⚠️ ${err.message}`, reasoning: "" };
        return next;
      });
    } finally {
      setMessages(prev => {
        const next = [...prev];
        if (next.length) next[next.length - 1] = { ...next[next.length - 1], streaming: false };
        return next;
      });
      setLoading(false);
    }
  }, [input, messages, model, loading]);

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  const clear = () => setMessages([]);
  const sel   = MODELS.find(m => m.id === model);

  return (
    <>
      <Head><title>Groq AI Agent Platform</title><meta name="viewport" content="width=device-width,initial-scale=1" /></Head>
      <div className="app">

        {/* ── Sidebar ── */}
        <aside className={`sidebar ${sidebar ? "sb-open" : "sb-closed"}`}>
          <div className="sb-head">
            {sidebar && <span className="logo">⚡ Groq Agent</span>}
            <button className="icon-btn" onClick={() => setSidebar(s => !s)}>{sidebar ? "◀" : "▶"}</button>
          </div>
          {sidebar && <>
            <div className="sb-section">
              <p className="sb-label">Model</p>
              {MODELS.map(m => (
                <button key={m.id} className={`model-btn ${model === m.id ? "mb-active" : ""}`} onClick={() => setModel(m.id)}>
                  <span className="mb-label">{m.label}</span>
                  <span className={`badge bdg-${m.badge}`}>{m.badge}</span>
                </button>
              ))}
            </div>
            <div className="sb-section">
              <button className="new-btn" onClick={clear}>+ New Chat</button>
            </div>
            <div className="sb-foot"><span className="foot-txt">Powered by Groq</span></div>
          </>}
        </aside>

        {/* ── Chat ── */}
        <div className="chat">
          {/* Header */}
          <div className="chat-head">
            <div className="ch-left">
              {!sidebar && <button className="icon-btn" onClick={() => setSidebar(true)}>▶</button>}
              <span className="ch-model">{sel?.label}</span>
              {sel?.badge === "tools" && <span className="ch-badge">🔧 Tools + Reasoning</span>}
            </div>
            <button className="icon-btn" onClick={clear} title="Clear chat">🗑</button>
          </div>

          {/* Messages */}
          <div className="msgs">
            {messages.length === 0 && (
              <div className="empty">
                <div className="empty-icon">⚡</div>
                <h2 className="empty-title">Groq AI Agent Platform</h2>
                <p className="empty-sub">Select a model and start chatting. GPT-OSS 120B supports tools and shows its reasoning chain.</p>
                <div className="suggestions">
                  {SUGGESTIONS.map(s => (
                    <button key={s} className="sug" onClick={() => { setInput(s); textareaRef.current?.focus(); }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="input-wrap">
            <div className="input-box">
              <textarea
                ref={textareaRef}
                className="input-ta"
                placeholder="Message the AI… (Shift+Enter for newline)"
                value={input}
                onChange={e => { setInput(e.target.value); resize(); }}
                onKeyDown={onKey}
                rows={1}
                disabled={loading}
              />
              <button className={`send-btn ${loading ? "send-loading" : ""}`} onClick={send} disabled={loading || !input.trim()}>
                {loading ? "⏳" : "➤"}
              </button>
            </div>
            <p className="input-hint">
              {sel?.badge === "tools" ? "Reasons before answering · Can search the web and run code" : `${sel?.label} · Multi-turn · Streaming`}
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #__next { height: 100%; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0d0d0f; color: #e2e2e8; font-size: 14px; }

        /* ── Layout ── */
        .app   { display: flex; height: 100vh; overflow: hidden; }
        .chat  { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }

        /* ── Sidebar ── */
        .sidebar    { display: flex; flex-direction: column; background: #111115; border-right: 1px solid #1f1f26; transition: width .2s ease; overflow: hidden; flex-shrink: 0; }
        .sb-open    { width: 240px; }
        .sb-closed  { width: 44px; }
        .sb-head    { display: flex; align-items: center; justify-content: space-between; padding: 14px 10px; border-bottom: 1px solid #1f1f26; min-height: 52px; }
        .logo       { font-size: 14px; font-weight: 700; color: #f97316; white-space: nowrap; overflow: hidden; }
        .icon-btn   { background: none; border: none; color: #666; cursor: pointer; font-size: 13px; padding: 5px 7px; border-radius: 6px; line-height: 1; flex-shrink: 0; }
        .icon-btn:hover { background: #1e1e26; color: #e2e2e8; }
        .sb-section { padding: 10px 8px; border-bottom: 1px solid #1a1a22; }
        .sb-label   { font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: #444; margin-bottom: 6px; padding: 0 4px; }
        .model-btn  { display: flex; align-items: center; gap: 6px; width: 100%; background: none; border: none; color: #aaa; cursor: pointer; padding: 7px 8px; border-radius: 8px; font-size: 12px; text-align: left; transition: background .15s; }
        .model-btn:hover { background: #1a1a24; color: #e2e2e8; }
        .mb-active  { background: #18182e !important; color: #f97316 !important; }
        .mb-label   { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .badge      { font-size: 9px; padding: 2px 5px; border-radius: 8px; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
        .bdg-tools      { background: #f97316; color: #000; }
        .bdg-fast       { background: #22c55e; color: #000; }
        .bdg-long       { background: #3b82f6; color: #fff; }
        .bdg-versatile  { background: #a855f7; color: #fff; }
        .new-btn    { width: 100%; padding: 9px; background: #f97316; color: #000; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s; }
        .new-btn:hover { background: #fb923c; }
        .sb-foot    { margin-top: auto; padding: 12px 10px; }
        .foot-txt   { font-size: 10px; color: #333; display: block; text-align: center; }

        /* ── Chat header ── */
        .chat-head  { display: flex; align-items: center; justify-content: space-between; padding: 0 20px; height: 52px; border-bottom: 1px solid #1a1a22; background: #0d0d0f; flex-shrink: 0; }
        .ch-left    { display: flex; align-items: center; gap: 10px; }
        .ch-model   { font-size: 14px; font-weight: 600; color: #e2e2e8; }
        .ch-badge   { font-size: 11px; color: #f97316; background: #1c1000; padding: 2px 8px; border-radius: 10px; }

        /* ── Messages ── */
        .msgs { flex: 1; overflow-y: auto; padding: 20px 0 8px; scroll-behavior: smooth; }
        .msgs::-webkit-scrollbar { width: 5px; }
        .msgs::-webkit-scrollbar-thumb { background: #2a2a36; border-radius: 3px; }

        /* ── Empty state ── */
        .empty       { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 24px 24px; max-width: 600px; margin: 0 auto; }
        .empty-icon  { font-size: 44px; margin-bottom: 14px; }
        .empty-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #e2e2e8; }
        .empty-sub   { font-size: 13px; color: #666; line-height: 1.6; margin-bottom: 24px; max-width: 440px; }
        .suggestions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; max-width: 480px; }
        .sug         { background: #111115; border: 1px solid #1f1f26; color: #aaa; padding: 11px 13px; border-radius: 10px; font-size: 12px; cursor: pointer; text-align: left; line-height: 1.4; transition: border-color .15s, color .15s; }
        .sug:hover   { border-color: #f97316; color: #e2e2e8; }

        /* ── Message rows ── */
        .row      { display: flex; align-items: flex-start; gap: 10px; padding: 8px 20px; max-width: 820px; width: 100%; margin: 0 auto; }
        .row-user { flex-direction: row-reverse; }
        .avatar   { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .av-user  { background: #f97316; color: #000; }
        .av-ai    { background: #1e1e2a; color: #777; border: 1px solid #2a2a36; }
        .bubble   { max-width: calc(100% - 44px); padding: 11px 14px; border-radius: 14px; line-height: 1.65; word-break: break-word; }
        .b-user   { background: #1a1a30; border: 1px solid #28284a; color: #e2e2e8; border-bottom-right-radius: 4px; }
        .b-ai     { background: #111115; border: 1px solid #1f1f26; color: #d0d0da; border-bottom-left-radius: 4px; }

        /* ── Cursor ── */
        .cursor   { display: inline-block; width: 2px; height: 13px; background: #f97316; margin-left: 2px; vertical-align: text-bottom; animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }

        /* ── Reasoning ── */
        .reasoning      { background: #0c0c18; border: 1px solid #1e1e38; border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
        .reasoning-btn  { display: flex; align-items: center; gap: 7px; width: 100%; background: none; border: none; color: #7878cc; cursor: pointer; padding: 8px 11px; font-size: 12px; text-align: left; }
        .reasoning-btn:hover { background: #0f0f20; }
        .reasoning-body { padding: 10px 12px; font-size: 12px; color: #7878aa; border-top: 1px solid #1e1e38; line-height: 1.6; }
        .chev           { margin-left: auto; font-size: 9px; color: #444; }
        .r-cursor       { display: inline-block; width: 6px; height: 6px; background: #7878cc; border-radius: 50%; margin-left: 4px; animation: blink 1s step-end infinite; }

        /* ── Tool badge ── */
        .tool      { background: #0a0e0a; border: 1px solid #1a2a1a; border-radius: 10px; margin: 6px 0; overflow: hidden; }
        .tool-btn  { display: flex; align-items: center; gap: 7px; width: 100%; background: none; border: none; color: #22c55e; cursor: pointer; padding: 8px 11px; font-size: 12px; text-align: left; }
        .tool-btn:hover { background: #0c160c; }
        .tool-name { flex: 1; font-weight: 600; text-transform: capitalize; }
        .tool-body { padding: 10px 12px; font-size: 11px; color: #777; font-family: monospace; white-space: pre-wrap; word-break: break-all; border-top: 1px solid #1a2a1a; max-height: 200px; overflow-y: auto; }

        /* ── Markdown ── */
        .md-p  { margin: 3px 0; }
        .md-p:empty { height: 6px; }
        .ic    { background: #1e1e2a; color: #f97316; padding: 1px 5px; border-radius: 4px; font-family: "Fira Code", monospace; font-size: 12px; }
        .code-block { background: #09090d; border: 1px solid #1e1e26; border-radius: 10px; padding: 12px 14px; margin: 8px 0; overflow-x: auto; position: relative; }
        .code-block code { font-family: "Fira Code", "Cascadia Code", monospace; font-size: 12px; color: #9ecf9e; white-space: pre; }
        .code-lang { position: absolute; top: 5px; right: 9px; font-size: 9px; color: #444; text-transform: uppercase; letter-spacing: .05em; }

        /* ── Input ── */
        .input-wrap { padding: 12px 20px 16px; border-top: 1px solid #1a1a22; background: #0d0d0f; flex-shrink: 0; }
        .input-box  { display: flex; align-items: flex-end; gap: 8px; background: #111115; border: 1px solid #1f1f26; border-radius: 14px; padding: 9px 10px; transition: border-color .15s; }
        .input-box:focus-within { border-color: #f97316; }
        .input-ta   { flex: 1; background: none; border: none; outline: none; color: #e2e2e8; font-size: 14px; line-height: 1.5; resize: none; max-height: 180px; font-family: inherit; }
        .input-ta::placeholder { color: #3a3a48; }
        .send-btn   { background: #f97316; border: none; color: #000; width: 34px; height: 34px; border-radius: 9px; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background .15s; }
        .send-btn:hover:not(:disabled) { background: #fb923c; }
        .send-btn:disabled { background: #222230; color: #444; cursor: not-allowed; }
        .send-loading { background: #1a1a28 !important; }
        .input-hint { font-size: 11px; color: #333; margin-top: 7px; text-align: center; }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .sb-open { width: 200px; }
          .row { padding: 6px 12px; }
          .suggestions { grid-template-columns: 1fr; }
          .chat-head { padding: 0 12px; }
          .input-wrap { padding: 10px 12px 14px; }
        }
      `}</style>
    </>
  );
}

import Groq from "groq-sdk";

let groq: Groq | null = null;

/**
 * Validates and retrieves the Groq API key
 * Throws an error if key is missing or invalid
 */
function validateGroqApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "GROQ_API_KEY is required. Add it to your .env file and restart the server."
    );
  }
  
  const trimmedKey = apiKey.trim();
  // Allow test keys in development
  if (trimmedKey.startsWith("gsk_test_") || trimmedKey.startsWith("test_")) {
    return trimmedKey;
  }
  
  if (trimmedKey.length < 10) {
    throw new Error(
      "Invalid GROQ_API_KEY: Key appears incomplete (minimum 10 characters)."
    );
  }
  
  return trimmedKey;
}

/**
 * Mock response generator for development
 */
function generateMockAppCode(prompt: string): Record<string, string> {
  // Check if prompt contains keywords to return specific app
  if (prompt.toLowerCase().includes("todo")) {
    return {
      title: "Todo List App",
      htmlCode: "<div class='container'><h1>Todo List</h1><div class='input-group'><input type='text' id='todoInput' placeholder='Add a new todo...' /><button onclick='addTodo()'>Add</button></div><ul id='todoList' class='todo-list'></ul></div>",
      cssCode: ".container { max-width: 600px; margin: 40px auto; font-family: system-ui; } h1 { color: #ea580c; border: 2px solid #000; padding: 10px; text-align: center; } .input-group { display: flex; gap: 10px; margin: 20px 0; } input { flex: 1; padding: 10px; border: 2px solid #000; font-size: 16px; } button { padding: 10px 20px; background: #ea580c; color: white; border: 2px solid #000; cursor: pointer; font-weight: bold; box-shadow: 4px 4px 0 rgba(0,0,0,1); } button:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 rgba(0,0,0,1); } .todo-list { list-style: none; padding: 0; } .todo-item { padding: 10px; border: 2px solid #000; margin: 10px 0; display: flex; justify-content: space-between; align-items: center; } .delete-btn { background: #dc2626; color: white; border: none; padding: 5px 10px; cursor: pointer; font-weight: bold; }",
      jsCode: "const todos = []; function addTodo() { const input = document.getElementById('todoInput'); if (input.value.trim()) { todos.push(input.value); input.value = ''; renderTodos(); } } function deleteTodo(index) { todos.splice(index, 1); renderTodos(); } function renderTodos() { const list = document.getElementById('todoList'); list.innerHTML = ''; todos.forEach((todo, i) => { const li = document.createElement('li'); li.className = 'todo-item'; li.innerHTML = `<span>${todo}</span><button class='delete-btn' onclick='deleteTodo(${i})'>Delete</button>`; list.appendChild(li); }); }"
    };
  }

  if (prompt.toLowerCase().includes("calculator")) {
    return {
      title: "Calculator App",
      htmlCode: "<div class='calc-container'><div class='calc-display' id='display'>0</div><div class='calc-buttons'><button onclick='addNumber(7)'>7</button><button onclick='addNumber(8)'>8</button><button onclick='addNumber(9)'>9</button><button onclick='setOp(\"+\")' class='op'>+</button><button onclick='addNumber(4)'>4</button><button onclick='addNumber(5)'>5</button><button onclick='addNumber(6)'>6</button><button onclick='setOp(\"-\")' class='op'>-</button><button onclick='addNumber(1)'>1</button><button onclick='addNumber(2)'>2</button><button onclick='addNumber(3)'>3</button><button onclick='setOp(\"*\")' class='op'>×</button><button onclick='addNumber(0)' class='zero'>0</button><button onclick='calculate()' class='equals'>=</button></div></div>",
      cssCode: ".calc-container { max-width: 300px; margin: 50px auto; border: 3px solid #000; background: #000; } .calc-display { background: #ffd700; color: #000; font-size: 32px; padding: 20px; text-align: right; font-weight: bold; border: 2px solid #000; } .calc-buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; } button { padding: 20px; font-size: 18px; border: 2px solid #000; background: #ffffff; cursor: pointer; font-weight: bold; transition: all 0.1s; } button:hover { background: #f0f0f0; transform: translate(-2px, -2px); box-shadow: 4px 4px 0 rgba(0,0,0,1); } button:active { transform: translate(0, 0); } .op { background: #ea580c; color: white; } .op:hover { background: #cc4400; } .equals { grid-column: span 2; background: #22c55e; color: white; font-size: 20px; } .zero { grid-column: span 2; }",
      jsCode: "let display = '0'; let firstNum = null; let op = null; function addNumber(n) { if (display === '0') display = String(n); else display += String(n); updateDisplay(); } function setOp(operation) { if (firstNum === null) firstNum = parseFloat(display); else if (op) calculate(); op = operation; display = '0'; } function calculate() { if (firstNum !== null && op) { const secondNum = parseFloat(display); let result; switch(op) { case '+': result = firstNum + secondNum; break; case '-': result = firstNum - secondNum; break; case '*': result = firstNum * secondNum; break; default: result = secondNum; } display = String(result); firstNum = null; op = null; updateDisplay(); } } function updateDisplay() { document.getElementById('display').textContent = display; }"
    };
  }

  // Default mock app
  return {
    title: "Sample App",
    htmlCode: "<div class='container'><h1>Welcome to Your App</h1><p>This is a generated app from your description.</p></div>",
    cssCode: ".container { max-width: 800px; margin: 40px auto; padding: 20px; font-family: system-ui; } h1 { color: #ea580c; border: 3px solid #000; padding: 15px; box-shadow: 4px 4px 0 rgba(0,0,0,1); }",
    jsCode: "console.log('App initialized');"
  };
}

/**
 * Singleton Groq client getter with lazy initialization
 * Ensures only one instance is created across the application
 */
export function getGroqClient(): Groq {
  if (!groq) {
    try {
      const apiKey = validateGroqApiKey();
      // Use mock client in development with test keys
      if (apiKey.startsWith("gsk_test_") || apiKey.startsWith("test_")) {
        console.log("[Groq] Using mock client for development");
        return {
          chat: {
            completions: {
              create: async (params: any) => {
                const userMessage = params.messages?.find((m: any) => m.role === "user")?.content || "";
                const mockApp = generateMockAppCode(userMessage);
                return {
                  choices: [{
                    message: {
                      content: JSON.stringify(mockApp)
                    }
                  }]
                };
              }
            }
          }
        } as any;
      }
      
      groq = new Groq({
        apiKey,
        dangerouslyAllowBrowser: false,
        timeout: 60000, // 60s timeout
        maxRetries: 3,
      });
    } catch (error) {
      groq = null;
      throw new Error(
        `Failed to initialize Groq client: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
  return groq;
}

export async function testGroqConnection(): Promise<string> {
  try {
    const client = getGroqClient();
    await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "test" }],
      max_tokens: 10,
    });
    return "connected";
  } catch (error) {
    return `failed: ${error instanceof Error ? error.message : "unknown"}`;
  }
}


export const PERSONAL_INFO = {
  name: "Raj Shah",
  role: "AI & Full-Stack Engineer",
  bio: "I build high-performance digital ecosystems and intelligent agents. Specializing in Next.js, Python, and scalable AI infrastructure, I deliver robust software solutions that are fault-tolerant, scalable, and engineered for production excellence.",
  email: "contact@rajai.org",
  github: "https://github.com/rajshah9305",
  linkedin: "https://www.linkedin.com/in/rajshah9305",
  location: "Calgary, Canada",
  coordinates: "LAT 51.0447° N / LON 114.0719° W",
  availability: "AVAILABLE / Q1—Q2",
  version: "V.04 · 2026",
  website: "https://www.rajai.org",
  stats: [
    { label: "YEARS SHIPPING", value: "8+" },
    { label: "PRODUCTION SYSTEMS", value: "40+" },
    { label: "AI INFERENCES/DAY", value: "10K+" },
    { label: "UPTIME SLA", value: "99.9%" },
  ],
};

export const SKILLS = [
  { category: "Languages", items: ["TypeScript", "Python", "Rust", "SQL", "HTML/CSS"] },
  { category: "Frontend", items: ["React", "Next.js 15", "Tailwind CSS", "Three.js", "Framer Motion"] },
  { category: "Backend & AI", items: ["Node.js", "Django", "FastAPI", "LangChain", "PyTorch", "OpenAI API"] },
  { category: "Infrastructure", items: ["AWS", "Docker", "PostgreSQL", "Vercel", "CI/CD"] },
];

export type Project = {
  id: string;
  number: string;
  title: string;
  desc: string;
  tags: string[];
  stat: string;
  links: { live?: string; github?: string };
  icon: "brain" | "cpu" | "database" | "zap" | "layers" | "code" | "bot";
  featured?: boolean;
};

export const PROJECTS: Project[] = [
  {
    id: "p1",
    number: "01",
    title: "RAJ AI PLATFORM",
    desc: "A flagship Generative AI platform integrating multi-modal LLMs. Features real-time RAG (Retrieval-Augmented Generation), custom agent workflows, and a high-performance responsive UI.",
    tags: ["NEXT.JS", "PYTHON", "LANGCHAIN", "PINECONE"],
    stat: "10K+ INFERENCES",
    links: {
      live: "https://www.rajai.org",
      github: "https://github.com/rajshah9305/raj-ai-platform",
    },
    icon: "brain",
    featured: true,
  },
  {
    id: "p2",
    number: "02",
    title: "AI AGENT ORCHESTRATION",
    desc: "A high-speed AI agent management platform with Cerebras integration. Includes a real-time 3D dashboard, multi-framework support (AutoGen, CrewAI, LangGraph), and WebSocket-driven updates.",
    tags: ["TYPESCRIPT", "NEXT.JS", "THREE.JS", "CEREBRAS", "REDIS"],
    stat: "5 AI FRAMEWORKS",
    links: {
      github: "https://github.com/rajshah9305/AIAgentOrchestrationPlatform",
    },
    icon: "bot",
    featured: true,
  },
  {
    id: "p3",
    number: "03",
    title: "AI APP BUILDER",
    desc: "An enterprise-grade platform that converts natural language into production-ready React applications. Features real-time streaming, Monaco Editor integration, and automated Vercel deployment.",
    tags: ["NEXT.JS", "CEREBRAS", "LLAMA-4", "PRISMA", "POSTGRESQL"],
    stat: "ZERO-CODE DEPLOY",
    links: {
      github: "https://github.com/rajshah9305/AIAppBuilder-CerebrasAI-llama-4",
    },
    icon: "code",
    featured: true,
  },
  {
    id: "p4",
    number: "04",
    title: "RAJ AI UI ENGINE",
    desc: "Automated UI component generation from natural language prompts. Supports multiple AI providers and features live previews, code export, and custom GLSL shader backgrounds.",
    tags: ["REACT", "TYPESCRIPT", "THREE.JS", "OPENAI API", "VITE"],
    stat: "5 DESIGN VARIANTS",
    links: {
      github: "https://github.com/rajshah9305/AIpreviewwindow",
    },
    icon: "zap",
    featured: true,
  },
  {
    id: "p5",
    number: "05",
    title: "CREW AI PLATFORM",
    desc: "Enterprise AI agent orchestration powered by Google Gemini. Includes drag-and-drop management, real-time execution monitoring, and persistent storage with PostgreSQL.",
    tags: ["TYPESCRIPT", "REACT", "GEMINI", "POSTGRESQL", "DRIZZLE ORM"],
    stat: "ENTERPRISE GRADE",
    links: {
      github: "https://github.com/rajshah9305/Crewsaisingle",
    },
    icon: "cpu",
  },
  {
    id: "p6",
    number: "06",
    title: "SCIVIZ DESIGN SYSTEM",
    desc: "A production-ready design system tailored for scientific visualization. Features a library of themed UI components, high-performance rendering, and comprehensive documentation.",
    tags: ["REACT", "TYPESCRIPT", "TAILWIND CSS", "POSTGRESQL"],
    stat: "FULL DESIGN SYSTEM",
    links: {
      github: "https://github.com/rajshah9305/SciViz-Design-System",
    },
    icon: "layers",
  },
  {
    id: "p7",
    number: "07",
    title: "AGENT ORCHESTRA",
    desc: "A modern AI agent platform with a visual workflow builder. Supports multiple agent frameworks with real-time monitoring and secure JWT authentication.",
    tags: ["PYTHON", "FLASK", "REACT", "WEBSOCKETS", "TAILWIND CSS"],
    stat: "VISUAL WORKFLOW",
    links: {
      github: "https://github.com/rajshah9305/aIagenter",
    },
    icon: "bot",
  },
  {
    id: "p8",
    number: "08",
    title: "DISTRIBUTED SYSTEMS API",
    desc: "A high-throughput microservices architecture designed for real-time data streaming and low-latency processing.",
    tags: ["RUST", "GRPC", "POSTGRESQL", "KAFKA"],
    stat: "<1MS LATENCY",
    links: {
      github: "https://github.com/rajshah9305/distributed-systems-api",
    },
    icon: "database",
  },
];

export const EXPERIENCE = [
  {
    id: "e1",
    year: "2023 — PRESENT",
    role: "Senior Software Engineer",
    company: "Nexus AI Systems",
    desc: "Led the architectural shift to a microservices ecosystem, enhancing deployment efficiency by 40%. Directed the integration of enterprise LLMs for mission-critical automation pipelines.",
    skills: ["LLMs", "Microservices", "CI/CD", "Python"],
  },
  {
    id: "e2",
    year: "2021 — 2023",
    role: "Full-Stack Developer",
    company: "Elevate Digital Labs",
    desc: "Developed and maintained high-traffic Next.js applications for a global user base. Optimized database performance, reducing query response times by 60% through advanced indexing and query refactoring.",
    skills: ["Next.js", "PostgreSQL", "React", "Node.js"],
  },
  {
    id: "e3",
    year: "2017 — 2021",
    role: "B.S. Computer Science",
    company: "Georgia Institute of Technology",
    desc: "Specialized in Artificial Intelligence and Systems Architecture. Conducted research in distributed computing and graduated with High Honors.",
    skills: ["AI/ML", "Systems", "Research", "Algorithms"],
  },
];

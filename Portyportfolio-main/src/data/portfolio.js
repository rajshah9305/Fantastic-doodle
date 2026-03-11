import {
  Terminal,
  Cpu,
  Layers,
  Database,
  Search,
  LayoutTemplate,
  Server,
  Zap,
  Eye,
  Lock,
  Network,
  Shield,
  Cloud,
  BarChart3,
  Smartphone
} from 'lucide-react';

export const PORTFOLIO_DATA = {
  profile: {
    name: "RAJ SHAH",
    title: "FULL STACK ARCHITECT",
    tagline: "SYSTEMS_OVER_TEMPLATES",
    location: "GUJARAT, IN",
    availability: "AVAILABLE FOR WORK",
    socials: {
      github: "https://github.com/rajshah9305",
      linkedin: "https://linkedin.com/in/rajshah9305",
      twitter: "https://twitter.com/rajshah9305",
      email: "rajshah9305@gmail.com"
    }
  },
  stats: [
    { label: "EXPERIENCE", value: "04Y+" },
    { label: "PROJECTS", value: "30+" },
    { label: "STACK", value: "MERN/PY" },
    { label: "COMMIT_RATE", value: "DAILY" }
  ],
  services: [
    {
      id: "01",
      title: "System Architecture",
      desc: "Designing scalable, fault-tolerant backend infrastructures using microservices or monoliths depending on scale.",
      icon: Server,
      details: {
        fullDescription: "I design and implement enterprise-grade system architectures that scale from MVP to millions of users. My approach combines modern cloud-native patterns with battle-tested architectural principles.",
        capabilities: [
          "Microservices & API Gateway Design",
          "Database Schema & Query Optimization",
          "Load Balancing & Auto-scaling",
          "Event-Driven Architecture",
          "CQRS & Event Sourcing Patterns"
        ],
        technologies: ["AWS", "Docker", "Kubernetes", "PostgreSQL", "Redis", "RabbitMQ"],
        deliverables: ["Architecture Diagrams", "Technical Specifications", "Infrastructure as Code", "Performance Benchmarks"]
      }
    },
    {
      id: "02",
      title: "MVP Engineering",
      desc: "Rapid prototyping and development of Minimum Viable Products for startups, focusing on speed-to-market and code quality.",
      icon: Zap,
      details: {
        fullDescription: "I help startups validate their ideas quickly by building production-ready MVPs in weeks, not months. Focus on core features, clean code, and technical debt prevention.",
        capabilities: [
          "Rapid Full-Stack Development",
          "Product Feature Prioritization",
          "Technical Feasibility Analysis",
          "Scalable Foundation Setup",
          "CI/CD Pipeline Configuration"
        ],
        technologies: ["Next.js", "React", "Node.js", "Supabase", "Vercel", "Stripe"],
        deliverables: ["Working MVP", "Source Code", "Deployment Setup", "Technical Documentation"]
      }
    },
    {
      id: "03",
      title: "UI/UX Engineering",
      desc: "Translating complex Figma designs into pixel-perfect, responsive, and accessible frontend code.",
      icon: LayoutTemplate,
      details: {
        fullDescription: "I bridge the gap between design and development, transforming static designs into interactive, performant, and accessible web experiences that work flawlessly across all devices.",
        capabilities: [
          "Pixel-Perfect Implementation",
          "Responsive & Mobile-First Design",
          "Animation & Micro-interactions",
          "WCAG 2.1 Accessibility Compliance",
          "Performance Optimization"
        ],
        technologies: ["React", "TypeScript", "Tailwind CSS", "Framer Motion", "GSAP", "Three.js"],
        deliverables: ["Production Code", "Component Library", "Style Guide", "Performance Report"]
      }
    }
  ],
  experience: [
    {
      period: "2024 - PRESENT",
      role: "Senior Full Stack Engineer",
      company: "FREELANCE / CONTRACT",
      desc: "Architecting enterprise-grade solutions for international clients. Specializing in AI-agent integration and high-performance web apps."
    },
    {
      period: "2022 - 2024",
      role: "Lead Developer",
      company: "TECH INNOVATIONS INC.",
      desc: "Led a team of 5 engineers. Migrated legacy monolithic architecture to AWS microservices, reducing latency by 40%."
    },
    {
      period: "2020 - 2022",
      role: "Frontend Specialist",
      company: "CREATIVE STUDIO",
      desc: "Developed award-winning immersive websites using WebGL and Three.js. Focus on animation performance and mobile optimization."
    }
  ],
  skills: [
    { category: "ENGINEERING", items: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL"] },
    { category: "INTERFACE", items: ["Tailwind", "WebGL", "Framer Motion", "GSAP"] },
    { category: "INTELLIGENCE", items: ["LangChain", "Python", "OpenAI", "TensorFlow"] },
    { category: "INFRASTRUCTURE", items: ["Docker", "AWS", "Vercel", "Supabase"] }
  ],
  projects: [
    {
      id: "01",
      title: "AGENT_GPT",
      category: "ARTIFICIAL INTELLIGENCE",
      tech: ["Next.js 14", "TypeScript", "Cerebras"],
      description: "Autonomous recursive agent orchestrator. Capable of self-prompting, task decomposition, and multi-agent coordination.",
      link: "https://github.com/rajshah9305/v0-ai-agent-visualization",
      stat: "99.9% ACCURACY",
      icon: Cpu,
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: "02",
      title: "AURA_WEAVE",
      category: "IMMERSIVE WEB",
      tech: ["WebGL", "Three.js", "GSAP"],
      description: "Non-linear digital experience for creative agencies. Features complex shader transitions, scroll-linked physics, and a custom rendering pipeline.",
      link: "https://github.com/rajshah9305/aurora-orchestrator",
      stat: "60FPS LOCKED",
      icon: Layers,
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: "03",
      title: "ELITE_SCRAPER",
      category: "DATA WARFARE",
      tech: ["Python", "Selenium", "Proxies"],
      description: "Enterprise-grade extraction engine. Bypasses modern fingerprinting and anti-bot measures. Features rotating proxy pools and headless browser clustering.",
      link: "https://github.com/rajshah9305/awsmetagpt",
      stat: "10K+ RPS",
      icon: Search,
      image: "https://images.unsplash.com/photo-1558494949-efdeb6bf80d1?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: "04",
      title: "PROMPT_CRAFT",
      category: "SAAS INFRASTRUCTURE",
      tech: ["React", "Redux", "Supabase"],
      description: "Version control system for LLM prompts. Allows engineering teams to test, iterate, and deploy prompts like code. Includes A/B testing suite.",
      link: "https://github.com/rajshah9305/raj-ai-app-builder",
      stat: "V 2.1.0",
      icon: Database,
      image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: "05",
      title: "ECHO_PROTOCOL",
      category: "REAL-TIME SYSTEMS",
      tech: ["Socket.io", "Redis", "Node.js"],
      description: "End-to-end encrypted messaging infrastructure designed for zero-latency communication. Features ephemeral message storage.",
      link: "https://github.com/rajshah9305/kindred-heart-story",
      stat: "< 50ms LATENCY",
      icon: Terminal,
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: "06",
      title: "NEURAL_VISION",
      category: "MACHINE LEARNING",
      tech: ["PyTorch", "OpenCV", "FastAPI"],
      description: "High-performance object detection pipeline optimized for edge deployment. Processes video streams in real-time with custom trained YOLOv8 models.",
      link: "https://github.com/rajshah9305/Auraka",
      stat: "95% MAP",
      icon: Eye,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: "07",
      title: "QUANTUM_GRID",
      category: "DISTRIBUTED COMPUTING",
      tech: ["Rust", "WASM", "libp2p"],
      description: "Decentralized compute sharing protocol allowing browsers to contribute idle processing power to scientific simulations.",
      link: "https://github.com/rajshah9305/groqqcrewwss",
      stat: "1M+ OPS/SEC",
      icon: Network,
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: "08",
      title: "CIPHER_VAULT",
      category: "CRYPTOGRAPHY",
      tech: ["Go", "gRPC", "AES-256"],
      description: "Zero-knowledge proof storage solution for enterprise secrets. Ensures mathematical privacy without trusting the storage provider.",
      link: "https://github.com/rajshah9305/nocodeaoigemini",
      stat: "MIL-SPEC SEC",
      icon: Lock,
      image: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: "09",
      title: "VELOCITY_TRADE",
      category: "FINTECH ENGINE",
      tech: ["C++", "Python", "FPGA"],
      description: "High-frequency trading execution engine designed for microsecond latency arbitrage. Optimized for kernel bypass networking.",
      link: "https://github.com/rajshah9305/taxkeepAI",
      stat: "10μs LATENCY",
      icon: BarChart3,
      image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: "10",
      title: "AERO_STREAM",
      category: "MEDIA INFRASTRUCTURE",
      tech: ["Elixir", "Phoenix", "WebRTC"],
      description: "Adaptive bitrate video streaming server capable of handling millions of concurrent connections with minimal resource footprint.",
      link: "https://github.com/rajshah9305/hoteldeposits",
      stat: "4K HDR LIVE",
      icon: Cloud,
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: "11",
      title: "NANO_FACTORY",
      category: "IOT ORCHESTRATION",
      tech: ["Node.js", "MQTT", "Docker"],
      description: "Lightweight container orchestration system specifically built for low-power edge devices and industrial IoT sensors.",
      link: "https://github.com/rajshah9305/Fantastic-doodle",
      stat: "5MB FOOTPRINT",
      icon: Smartphone,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000"
    },
    {
      id: "12",
      title: "SENTINEL_CORE",
      category: "CYBERSECURITY",
      tech: ["Python", "TensorFlow", "eBPF"],
      description: "Kernel-level intrusion detection system using anomaly detection to identify zero-day exploits in real-time.",
      link: "https://github.com/rajshah9305/codingnexusai",
      stat: "99.8% DETECTION",
      icon: Shield,
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=2000"
    }
  ]
};

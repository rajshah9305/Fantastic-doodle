import { motion } from "framer-motion";
import {
  Code2,
  ArrowRight,
  Clock,
  Calculator,
  Timer,
  Cloud,
  MessageSquare,
  Music,
  Camera,
  Heart,
  TrendingUp,
  FileText,
  Palette,
  Gamepad2,
} from "lucide-react";
import { useLocation } from "wouter";

const examples = [
  {
    id: 1,
    title: "Todo List App",
    description: "A modern task manager with drag-and-drop, filters, and local storage",
    icon: FileText,
    difficulty: "Beginner",
    time: "5 min",
    prompt: "A todo list app with add, delete, mark complete, and filter functionality. Use a clean modern design with gradient background.",
    tags: ["Productivity", "CRUD", "LocalStorage"],
  },
  {
    id: 2,
    title: "Weather Dashboard",
    description: "Real-time weather display with 5-day forecast and location search",
    icon: Cloud,
    difficulty: "Intermediate",
    time: "8 min",
    prompt: "A weather dashboard showing current weather, 5-day forecast, temperature, humidity, and wind speed. Include a search bar for different cities.",
    tags: ["API", "Dashboard", "Real-time"],
  },
  {
    id: 3,
    title: "Pomodoro Timer",
    description: "Focus timer with work/break intervals and statistics tracking",
    icon: Timer,
    difficulty: "Beginner",
    time: "6 min",
    prompt: "A pomodoro timer with 25-minute work sessions, 5-minute breaks, pause/resume, and session counter. Modern minimalist design.",
    tags: ["Productivity", "Timer", "Statistics"],
  },
  {
    id: 4,
    title: "Calculator",
    description: "Scientific calculator with history and keyboard support",
    icon: Calculator,
    difficulty: "Beginner",
    time: "5 min",
    prompt: "A calculator with basic arithmetic operations, clear button, and calculation history. Clean design with large buttons.",
    tags: ["Utility", "Math", "Interactive"],
  },
  {
    id: 5,
    title: "Kanban Board",
    description: "Project management board with drag-and-drop cards",
    icon: TrendingUp,
    difficulty: "Advanced",
    time: "12 min",
    prompt: "A Kanban board with three columns (To Do, In Progress, Done). Cards should be draggable between columns. Include add card functionality.",
    tags: ["Project Management", "Drag & Drop", "Workflow"],
  },
  {
    id: 6,
    title: "Chat Interface",
    description: "Real-time messaging UI with emoji support",
    icon: MessageSquare,
    difficulty: "Intermediate",
    time: "9 min",
    prompt: "A chat interface with message bubbles, timestamp, user avatars, and an input field. Include emoji picker and send button.",
    tags: ["Communication", "UI", "Real-time"],
  },
  {
    id: 7,
    title: "Music Player",
    description: "Audio player with playlist and controls",
    icon: Music,
    difficulty: "Intermediate",
    time: "10 min",
    prompt: "A music player with play/pause, next/previous, progress bar, volume control, and a playlist. Modern glassmorphism design.",
    tags: ["Media", "Audio", "Entertainment"],
  },
  {
    id: 8,
    title: "Photo Gallery",
    description: "Image grid with lightbox and filters",
    icon: Camera,
    difficulty: "Intermediate",
    time: "8 min",
    prompt: "A photo gallery with grid layout, lightbox modal for full-size view, and category filters. Include smooth transitions.",
    tags: ["Media", "Images", "Gallery"],
  },
  {
    id: 9,
    title: "Expense Tracker",
    description: "Budget manager with charts and categories",
    icon: TrendingUp,
    difficulty: "Advanced",
    time: "15 min",
    prompt: "An expense tracker with add/delete transactions, category filters, total balance, and a simple bar chart showing spending by category.",
    tags: ["Finance", "Charts", "Analytics"],
  },
  {
    id: 10,
    title: "Quiz App",
    description: "Interactive quiz with score tracking",
    icon: Gamepad2,
    difficulty: "Intermediate",
    time: "10 min",
    prompt: "A quiz app with multiple choice questions, score tracking, timer, and results page. Include next/previous navigation.",
    tags: ["Education", "Interactive", "Game"],
  },
  {
    id: 11,
    title: "Recipe Finder",
    description: "Search and display recipes with ingredients",
    icon: Heart,
    difficulty: "Intermediate",
    time: "9 min",
    prompt: "A recipe finder with search functionality, recipe cards showing image, title, ingredients, and cooking time. Grid layout with hover effects.",
    tags: ["Food", "Search", "Cards"],
  },
  {
    id: 12,
    title: "Color Palette Generator",
    description: "Generate and save color schemes",
    icon: Palette,
    difficulty: "Beginner",
    time: "7 min",
    prompt: "A color palette generator that creates random color schemes. Show 5 colors with hex codes, copy to clipboard, and generate new palette button.",
    tags: ["Design", "Utility", "Creative"],
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "text-emerald-500 border-emerald-900/30 bg-emerald-900/10";
    case "Intermediate":
      return "text-amber-500 border-amber-900/30 bg-amber-900/10";
    case "Advanced":
      return "text-red-500 border-red-900/30 bg-red-900/10";
    default:
      return "text-slate-500 border-slate-900/30 bg-slate-900/10";
  }
};

export default function Examples() {
  const [, navigate] = useLocation();

  const handleUseExample = (prompt: string) => {
    window.location.href = `/?prompt=${encodeURIComponent(prompt)}`;
  };

  return (
    <div className="min-h-screen bg-black text-slate-300 overflow-hidden font-sans relative">
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 border-b-4 border-black bg-zinc-950/80 backdrop-blur-md px-4 sm:px-12 py-4"
      >
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600 flex items-center justify-center text-white font-black text-lg sm:text-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              R
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tighter uppercase leading-none">
                RAJ AI STUDIO
              </h1>
              <p className="text-[10px] sm:text-xs text-orange-500 font-mono font-black uppercase tracking-widest mt-1">Examples</p>
            </div>
          </motion.button>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate("/")}
              className="px-3 sm:px-5 py-2 text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/templates")}
              className="px-3 sm:px-5 py-2 text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors border-l-2 border-zinc-800"
            >
              Templates
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-12 py-8 sm:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-20"
        >
          <h1 className="text-4xl xs:text-5xl sm:text-7xl font-black mb-6 tracking-tighter uppercase leading-none">
            <span className="text-white block">EXAMPLE</span>
            <span className="text-orange-600 block">CONSTRUCTIONS</span>
          </h1>
          <p className="text-sm sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium italic">
            "Get inspired by these ready-to-use blueprints. One click to manifest your next app."
          </p>
        </motion.div>

        {/* Examples Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {examples.map((example, index) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="group relative bg-zinc-950 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(234,88,12,0.3)] transition-all flex flex-col"
            >
              {/* Card Content */}
              <div className="p-6 space-y-6 flex-1 flex flex-col">
                {/* Icon & Difficulty */}
                <div className="flex items-center justify-between shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-600 flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <example.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <span className={`px-3 py-1.5 border-2 border-black text-[10px] font-mono font-black uppercase tracking-widest ${getDifficultyColor(example.difficulty)}`}>
                    {example.difficulty}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-black text-white mb-3 uppercase tracking-tight group-hover:text-orange-500 transition-colors">
                    {example.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3 font-medium">
                    {example.description}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-[10px] font-mono font-black text-orange-600 uppercase tracking-widest shrink-0">
                  <div className="flex items-center gap-2">
                    <Clock size={12} />
                    <span>Est: {example.time}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  {example.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-zinc-900/50 text-[9px] font-mono font-black text-slate-600 uppercase tracking-wider"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleUseExample(example.prompt)}
                  className="w-full py-4 bg-orange-600 text-white font-mono text-sm font-black uppercase tracking-widest hover:bg-orange-700 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3 shrink-0"
                >
                  <Code2 size={16} />
                  <span>Construct Now</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

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
    description:
      "A modern task manager with drag-and-drop, filters, and local storage",
    icon: FileText,
    difficulty: "Beginner",
    time: "5 min",
    prompt:
      "A todo list app with add, delete, mark complete, and filter functionality. Use a clean modern design with gradient background.",
    tags: ["Productivity", "CRUD", "LocalStorage"],
  },
  {
    id: 2,
    title: "Weather Dashboard",
    description:
      "Real-time weather display with 5-day forecast and location search",
    icon: Cloud,
    difficulty: "Intermediate",
    time: "8 min",
    prompt:
      "A weather dashboard showing current weather, 5-day forecast, temperature, humidity, and wind speed. Include a search bar for different cities.",
    tags: ["API", "Dashboard", "Real-time"],
  },
  {
    id: 3,
    title: "Pomodoro Timer",
    description:
      "Focus timer with work/break intervals and statistics tracking",
    icon: Timer,
    difficulty: "Beginner",
    time: "6 min",
    prompt:
      "A Pomodoro timer with 25-minute work sessions, 5-minute breaks, pause/resume, and session counter. Modern minimalist design.",
    tags: ["Productivity", "Timer", "Statistics"],
  },
  {
    id: 4,
    title: "Calculator",
    description: "Scientific calculator with history and keyboard support",
    icon: Calculator,
    difficulty: "Beginner",
    time: "5 min",
    prompt:
      "A calculator with basic arithmetic operations, clear button, and calculation history. Clean design with large buttons.",
    tags: ["Utility", "Math", "Interactive"],
  },
  {
    id: 5,
    title: "Kanban Board",
    description: "Project management board with drag-and-drop cards",
    icon: TrendingUp,
    difficulty: "Advanced",
    time: "12 min",
    prompt:
      "A Kanban board with three columns (To Do, In Progress, Done). Cards should be draggable between columns. Include add card functionality.",
    tags: ["Project Management", "Drag & Drop", "Workflow"],
  },
  {
    id: 6,
    title: "Chat Interface",
    description: "Real-time messaging UI with emoji support",
    icon: MessageSquare,
    difficulty: "Intermediate",
    time: "9 min",
    prompt:
      "A chat interface with message bubbles, timestamp, user avatars, and an input field. Include emoji picker and send button.",
    tags: ["Communication", "UI", "Real-time"],
  },
  {
    id: 7,
    title: "Music Player",
    description: "Audio player with playlist and controls",
    icon: Music,
    difficulty: "Intermediate",
    time: "10 min",
    prompt:
      "A music player with play/pause, next/previous, progress bar, volume control, and a playlist. Modern glassmorphism design.",
    tags: ["Media", "Audio", "Entertainment"],
  },
  {
    id: 8,
    title: "Photo Gallery",
    description: "Image grid with lightbox and filters",
    icon: Camera,
    difficulty: "Intermediate",
    time: "8 min",
    prompt:
      "A photo gallery with grid layout, lightbox modal for full-size view, and category filters. Include smooth transitions.",
    tags: ["Media", "Images", "Gallery"],
  },
  {
    id: 9,
    title: "Expense Tracker",
    description: "Budget manager with charts and categories",
    icon: TrendingUp,
    difficulty: "Advanced",
    time: "15 min",
    prompt:
      "An expense tracker with add/delete transactions, category filters, total balance, and a simple bar chart showing spending by category.",
    tags: ["Finance", "Charts", "Analytics"],
  },
  {
    id: 10,
    title: "Quiz App",
    description: "Interactive quiz with score tracking",
    icon: Gamepad2,
    difficulty: "Intermediate",
    time: "10 min",
    prompt:
      "A quiz app with multiple choice questions, score tracking, timer, and results page. Include next/previous navigation.",
    tags: ["Education", "Interactive", "Game"],
  },
  {
    id: 11,
    title: "Recipe Finder",
    description: "Search and display recipes with ingredients",
    icon: Heart,
    difficulty: "Intermediate",
    time: "9 min",
    prompt:
      "A recipe finder with search functionality, recipe cards showing image, title, ingredients, and cooking time. Grid layout with hover effects.",
    tags: ["Food", "Search", "Cards"],
  },
  {
    id: 12,
    title: "Color Palette Generator",
    description: "Generate and save color schemes",
    icon: Palette,
    difficulty: "Beginner",
    time: "7 min",
    prompt:
      "A color palette generator that creates random color schemes. Show 5 colors with hex codes, copy to clipboard, and generate new palette button.",
    tags: ["Design", "Utility", "Creative"],
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "text-emerald-400 border-emerald-900/50 bg-emerald-900/20";
    case "Intermediate":
      return "text-amber-400 border-amber-900/50 bg-amber-900/20";
    case "Advanced":
      return "text-red-400 border-red-900/50 bg-red-900/20";
    default:
      return "text-slate-400 border-slate-900/50 bg-slate-900/20";
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
        className="relative z-10 border-b border-orange-900/30 bg-black/80 backdrop-blur-sm px-3 xs:px-4 sm:px-6 md:px-12 py-3 sm:py-4"
      >
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 xs:gap-3 sm:gap-4"
          >
            <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-orange-600 flex items-center justify-center text-white font-bold text-sm xs:text-base sm:text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              A
            </div>
            <div>
              <h1 className="text-base xs:text-lg sm:text-xl font-bold text-white tracking-tight">
                AI STUDIO
              </h1>
              <p className="text-[10px] xs:text-xs text-orange-500 font-mono">Examples</p>
            </div>
          </motion.button>

          <div className="flex items-center gap-1 xs:gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="px-2 xs:px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-mono font-bold uppercase text-slate-400 hover:text-orange-400 transition-colors"
            >
              Home
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/templates")}
              className="px-2 xs:px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-mono font-bold uppercase text-slate-400 hover:text-orange-400 transition-colors"
            >
              Templates
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-12 py-6 sm:py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black mb-3 sm:mb-4 tracking-tighter">
            <span className="text-white">EXAMPLE </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              APPS
            </span>
          </h1>
          <p className="text-sm xs:text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-4">
            Get inspired by these ready-to-use examples. Click any card to
            generate it instantly.
          </p>
        </motion.div>

        {/* Examples Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {examples.map((example, index) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -4 }}
              className="group relative bg-zinc-950 border border-orange-900/30 rounded-lg overflow-hidden hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] transition-all"
            >
              {/* Card Content */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Icon & Difficulty */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-600 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <example.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <span className={`px-2 sm:px-3 py-1 border rounded text-[10px] xs:text-xs font-mono ${getDifficultyColor(example.difficulty)}`}>
                    {example.difficulty}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2 group-hover:text-orange-400 transition-colors">
                    {example.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">
                    {example.description}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-3 sm:gap-4 text-[10px] xs:text-xs text-slate-500 font-mono">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{example.time}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {example.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-zinc-900/50 rounded text-[9px] xs:text-[10px] sm:text-xs font-mono text-slate-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUseExample(example.prompt)}
                  className="w-full py-2.5 sm:py-3 bg-orange-600 text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-orange-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
                >
                  <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Generate App</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

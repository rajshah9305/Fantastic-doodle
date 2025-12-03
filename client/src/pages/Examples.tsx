import { motion } from "framer-motion";
import {
  Sparkles,
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
    color: "from-blue-500 to-cyan-500",
    difficulty: "Beginner",
    time: "5 min",
    prompt:
      "A todo list app with add, delete, mark complete, and filter functionality. Use a clean modern design with gradient background.",
    tags: ["Productivity", "CRUD", "LocalStorage"],
    preview:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Weather Dashboard",
    description:
      "Real-time weather display with 5-day forecast and location search",
    icon: Cloud,
    color: "from-cyan-500 to-teal-500",
    difficulty: "Intermediate",
    time: "8 min",
    prompt:
      "A weather dashboard showing current weather, 5-day forecast, temperature, humidity, and wind speed. Include a search bar for different cities.",
    tags: ["API", "Dashboard", "Real-time"],
    preview:
      "https://images.unsplash.com/photo-1592210454359-9043f067919b?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Pomodoro Timer",
    description:
      "Focus timer with work/break intervals and statistics tracking",
    icon: Timer,
    color: "from-orange-500 to-red-500",
    difficulty: "Beginner",
    time: "6 min",
    prompt:
      "A Pomodoro timer with 25-minute work sessions, 5-minute breaks, pause/resume, and session counter. Modern minimalist design.",
    tags: ["Productivity", "Timer", "Statistics"],
    preview:
      "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    title: "Calculator",
    description: "Scientific calculator with history and keyboard support",
    icon: Calculator,
    color: "from-indigo-500 to-blue-500",
    difficulty: "Beginner",
    time: "5 min",
    prompt:
      "A calculator with basic arithmetic operations, clear button, and calculation history. Clean design with large buttons.",
    tags: ["Utility", "Math", "Interactive"],
    preview:
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    title: "Kanban Board",
    description: "Project management board with drag-and-drop cards",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-500",
    difficulty: "Advanced",
    time: "12 min",
    prompt:
      "A Kanban board with three columns (To Do, In Progress, Done). Cards should be draggable between columns. Include add card functionality.",
    tags: ["Project Management", "Drag & Drop", "Workflow"],
    preview:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    title: "Chat Interface",
    description: "Real-time messaging UI with emoji support",
    icon: MessageSquare,
    color: "from-pink-500 to-rose-500",
    difficulty: "Intermediate",
    time: "9 min",
    prompt:
      "A chat interface with message bubbles, timestamp, user avatars, and an input field. Include emoji picker and send button.",
    tags: ["Communication", "UI", "Real-time"],
    preview:
      "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=400&h=300&fit=crop",
  },
  {
    id: 7,
    title: "Music Player",
    description: "Audio player with playlist and controls",
    icon: Music,
    color: "from-violet-500 to-purple-500",
    difficulty: "Intermediate",
    time: "10 min",
    prompt:
      "A music player with play/pause, next/previous, progress bar, volume control, and a playlist. Modern glassmorphism design.",
    tags: ["Media", "Audio", "Entertainment"],
    preview:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop",
  },
  {
    id: 8,
    title: "Photo Gallery",
    description: "Image grid with lightbox and filters",
    icon: Camera,
    color: "from-amber-500 to-orange-500",
    difficulty: "Intermediate",
    time: "8 min",
    prompt:
      "A photo gallery with grid layout, lightbox modal for full-size view, and category filters. Include smooth transitions.",
    tags: ["Media", "Images", "Gallery"],
    preview:
      "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=300&fit=crop",
  },
  {
    id: 9,
    title: "Expense Tracker",
    description: "Budget manager with charts and categories",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500",
    difficulty: "Advanced",
    time: "15 min",
    prompt:
      "An expense tracker with add/delete transactions, category filters, total balance, and a simple bar chart showing spending by category.",
    tags: ["Finance", "Charts", "Analytics"],
    preview:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop",
  },
  {
    id: 10,
    title: "Quiz App",
    description: "Interactive quiz with score tracking",
    icon: Gamepad2,
    color: "from-fuchsia-500 to-pink-500",
    difficulty: "Intermediate",
    time: "10 min",
    prompt:
      "A quiz app with multiple choice questions, score tracking, timer, and results page. Include next/previous navigation.",
    tags: ["Education", "Interactive", "Game"],
    preview:
      "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&h=300&fit=crop",
  },
  {
    id: 11,
    title: "Recipe Finder",
    description: "Search and display recipes with ingredients",
    icon: Heart,
    color: "from-red-500 to-pink-500",
    difficulty: "Intermediate",
    time: "9 min",
    prompt:
      "A recipe finder with search functionality, recipe cards showing image, title, ingredients, and cooking time. Grid layout with hover effects.",
    tags: ["Food", "Search", "Cards"],
    preview:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop",
  },
  {
    id: 12,
    title: "Color Palette Generator",
    description: "Generate and save color schemes",
    icon: Palette,
    color: "from-cyan-500 to-blue-500",
    difficulty: "Beginner",
    time: "7 min",
    prompt:
      "A color palette generator that creates random color schemes. Show 5 colors with hex codes, copy to clipboard, and generate new palette button.",
    tags: ["Design", "Utility", "Creative"],
    preview:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop",
  },
];

export default function Examples() {
  const [, navigate] = useLocation();

  const handleUseExample = (prompt: string) => {
    // Navigate to home with prompt parameter
    window.location.href = `/?prompt=${encodeURIComponent(prompt)}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 border-b border-white/10 bg-transparent backdrop-blur-md px-6 md:px-12 py-4"
      >
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                AI Studio
              </h1>
              <p className="text-xs text-slate-500">Examples</p>
            </div>
          </motion.button>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Home
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/templates")}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Templates
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent">
              Example Apps
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get inspired by these ready-to-use examples. Click any card to
            generate it instantly.
          </p>
        </motion.div>

        {/* Examples Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {examples.map((example, index) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-white/20"
            >
              {/* Card Content */}
              <div className="p-6 space-y-4">
                {/* Icon */}
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${example.color} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <example.icon className="w-7 h-7 text-white" />
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {example.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {example.description}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{example.time}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {example.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600"
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
                  className={`w-full py-3 bg-gradient-to-r ${example.color} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group`}
                >
                  <Code2 className="w-4 h-4" />
                  <span>Generate This App</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

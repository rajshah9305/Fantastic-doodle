import { motion } from "framer-motion";
import {
  ArrowRight,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Heart,
  Newspaper,
  Utensils,
  Dumbbell,
  Music,
  Camera,
  Gamepad2,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";

const templates = [
  {
    id: 1,
    title: "Landing Page",
    description:
      "Modern landing page with hero section, features, testimonials, and CTA",
    icon: Globe,
    category: "Marketing",
    devices: ["Desktop", "Mobile"],
    prompt:
      "A modern landing page with hero section featuring large heading and CTA button, features section with 3 columns, testimonials carousel, and footer. Use gradient background and modern design.",
    tags: ["Marketing", "Business", "Conversion"],
  },
  {
    id: 2,
    title: "E-commerce Product Page",
    description:
      "Product showcase with image gallery, details, and add to cart",
    icon: ShoppingBag,
    category: "E-commerce",
    devices: ["Desktop", "Tablet", "Mobile"],
    prompt:
      "An e-commerce product page with image gallery, product title, price, description, size selector, quantity picker, and add to cart button. Include related products section.",
    tags: ["Shopping", "Retail", "Product"],
  },
  {
    id: 3,
    title: "Portfolio Website",
    description: "Creative portfolio with project showcase and about section",
    icon: Briefcase,
    category: "Portfolio",
    devices: ["Desktop", "Mobile"],
    prompt:
      "A portfolio website with hero section, about me, skills grid, project gallery with hover effects, and contact form. Modern minimalist design with smooth animations.",
    tags: ["Personal", "Creative", "Professional"],
  },
  {
    id: 4,
    title: "Blog Layout",
    description: "Clean blog design with article cards and sidebar",
    icon: Newspaper,
    category: "Content",
    devices: ["Desktop", "Tablet"],
    prompt:
      "A blog layout with featured post, article cards in grid, sidebar with categories and recent posts, and pagination. Clean typography and readable design.",
    tags: ["Content", "Writing", "Publishing"],
  },
  {
    id: 5,
    title: "Dashboard UI",
    description: "Admin dashboard with charts, stats, and data tables",
    icon: Monitor,
    category: "Business",
    devices: ["Desktop"],
    prompt:
      "An admin dashboard with sidebar navigation, stat cards showing metrics, line chart, bar chart, recent activity list, and data table. Modern dark theme with blue accents.",
    tags: ["Analytics", "Admin", "Data"],
  },
  {
    id: 6,
    title: "Restaurant Menu",
    description: "Digital menu with categories, items, and prices",
    icon: Utensils,
    category: "Food & Beverage",
    devices: ["Tablet", "Mobile"],
    prompt:
      "A restaurant menu with category tabs, food items with images, descriptions, prices, and dietary icons. Include search and filter options. Elegant design.",
    tags: ["Restaurant", "Menu", "Food"],
  },
  {
    id: 7,
    title: "Fitness Tracker",
    description: "Workout tracking interface with progress visualization",
    icon: Dumbbell,
    category: "Health & Fitness",
    devices: ["Mobile", "Tablet"],
    prompt:
      "A fitness tracker with workout log, progress charts, exercise library, and goal setting. Include calendar view and statistics. Motivational design with bold colors.",
    tags: ["Fitness", "Health", "Tracking"],
  },
  {
    id: 8,
    title: "Learning Platform",
    description: "Online course interface with lessons and progress",
    icon: GraduationCap,
    category: "Education",
    devices: ["Desktop", "Tablet"],
    prompt:
      "An online learning platform with course cards, lesson list, video player placeholder, progress bar, and quiz section. Clean educational design.",
    tags: ["Education", "Learning", "Courses"],
  },
  {
    id: 9,
    title: "Music Streaming",
    description: "Music app interface with playlists and player",
    icon: Music,
    category: "Entertainment",
    devices: ["Desktop", "Mobile"],
    prompt:
      "A music streaming interface with playlist grid, now playing bar, album art, play controls, and queue. Dark theme with vibrant accent colors.",
    tags: ["Music", "Audio", "Streaming"],
  },
  {
    id: 10,
    title: "Photo Gallery",
    description: "Image showcase with masonry layout and lightbox",
    icon: Camera,
    category: "Media",
    devices: ["Desktop", "Tablet"],
    prompt:
      "A photo gallery with masonry grid layout, category filters, lightbox modal for full view, and image details. Elegant and minimal design.",
    tags: ["Photography", "Gallery", "Portfolio"],
  },
  {
    id: 11,
    title: "Gaming Leaderboard",
    description: "Competitive ranking display with player stats",
    icon: Gamepad2,
    category: "Gaming",
    devices: ["Desktop", "Mobile"],
    prompt:
      "A gaming leaderboard with player rankings, avatars, scores, and stats. Include filters for time period and game mode. Futuristic gaming aesthetic.",
    tags: ["Gaming", "Competition", "Stats"],
  },
  {
    id: 12,
    title: "Dating Profile",
    description: "User profile card with swipe interface",
    icon: Heart,
    category: "Social",
    devices: ["Mobile"],
    prompt:
      "A dating app profile card with photo, bio, interests tags, and swipe buttons (like/pass). Include match notification modal. Modern and playful design.",
    tags: ["Social", "Dating", "Mobile"],
  },
];

export default function Templates() {
  const [, navigate] = useLocation();

  const handleUseTemplate = (prompt: string) => {
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
              <p className="text-[10px] xs:text-xs text-orange-500 font-mono">Templates</p>
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
              onClick={() => navigate("/examples")}
              className="px-2 xs:px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-mono font-bold uppercase text-slate-400 hover:text-orange-400 transition-colors"
            >
              Examples
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
            <span className="text-white">DESIGN </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              TEMPLATES
            </span>
          </h1>
          <p className="text-sm xs:text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-4">
            Professional templates for every use case. Customize and deploy in
            minutes.
          </p>
        </motion.div>

        {/* Templates Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -4 }}
              className="group relative bg-zinc-950 border border-orange-900/30 rounded-lg overflow-hidden hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] transition-all"
            >
              {/* Card Content */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Icon & Category */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-600 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <template.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <span className="px-2 sm:px-3 py-1 bg-zinc-900 border border-orange-900/50 rounded text-[10px] xs:text-xs font-mono text-orange-400">
                    {template.category}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2 group-hover:text-orange-400 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Devices */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {template.devices.map(device => (
                    <div
                      key={device}
                      className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-zinc-900 border border-orange-900/30 rounded text-[9px] xs:text-[10px] sm:text-xs font-mono text-slate-400"
                    >
                      {device === "Desktop" && <Monitor className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                      {device === "Tablet" && <Tablet className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                      {device === "Mobile" && (
                        <Smartphone className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      )}
                      <span className="hidden xs:inline">{device}</span>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {template.tags.map(tag => (
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
                  onClick={() => handleUseTemplate(template.prompt)}
                  className="w-full py-2.5 sm:py-3 bg-orange-600 text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-orange-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Use Template</span>
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

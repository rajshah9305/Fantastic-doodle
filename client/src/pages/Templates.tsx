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
    description: "Modern landing page with hero section, features, testimonials, and CTA",
    icon: Globe,
    category: "Marketing",
    devices: ["Desktop", "Mobile"],
    prompt: "A modern landing page with hero section featuring large heading and CTA button, features section with 3 columns, testimonials carousel, and footer. Use gradient background and modern design.",
    tags: ["Marketing", "Business", "Conversion"],
  },
  {
    id: 2,
    title: "E-commerce Product Page",
    description: "Product showcase with image gallery, details, and add to cart",
    icon: ShoppingBag,
    category: "E-commerce",
    devices: ["Desktop", "Tablet", "Mobile"],
    prompt: "An e-commerce product page with image gallery, product title, price, description, size selector, quantity picker, and add to cart button. Include related products section.",
    tags: ["Shopping", "Retail", "Product"],
  },
  {
    id: 3,
    title: "Portfolio Website",
    description: "Creative portfolio with project showcase and about section",
    icon: Briefcase,
    category: "Portfolio",
    devices: ["Desktop", "Mobile"],
    prompt: "A portfolio website with hero section, about me, skills grid, project gallery with hover effects, and contact form. Modern minimalist design with smooth animations.",
    tags: ["Personal", "Creative", "Professional"],
  },
  {
    id: 4,
    title: "Blog Layout",
    description: "Clean blog design with article cards and sidebar",
    icon: Newspaper,
    category: "Content",
    devices: ["Desktop", "Tablet"],
    prompt: "A blog layout with featured post, article cards in grid, sidebar with categories and recent posts, and pagination. Clean typography and readable design.",
    tags: ["Content", "Writing", "Publishing"],
  },
  {
    id: 5,
    title: "Dashboard UI",
    description: "Admin dashboard with charts, stats, and data tables",
    icon: Monitor,
    category: "Business",
    devices: ["Desktop"],
    prompt: "An admin dashboard with sidebar navigation, stat cards showing metrics, line chart, bar chart, recent activity list, and data table. Modern dark theme with blue accents.",
    tags: ["Analytics", "Admin", "Data"],
  },
  {
    id: 6,
    title: "Restaurant Menu",
    description: "Digital menu with categories, items, and prices",
    icon: Utensils,
    category: "Food & Beverage",
    devices: ["Tablet", "Mobile"],
    prompt: "A restaurant menu with category tabs, food items with images, descriptions, prices, and dietary icons. Include search and filter options. Elegant design.",
    tags: ["Restaurant", "Menu", "Food"],
  },
  {
    id: 7,
    title: "Fitness Tracker",
    description: "Workout tracking interface with progress visualization",
    icon: Dumbbell,
    category: "Health & Fitness",
    devices: ["Mobile", "Tablet"],
    prompt: "A fitness tracker with workout log, progress charts, exercise library, and goal setting. Include calendar view and statistics. Motivational design with bold colors.",
    tags: ["Fitness", "Health", "Tracking"],
  },
  {
    id: 8,
    title: "Learning Platform",
    description: "Online course interface with lessons and progress",
    icon: GraduationCap,
    category: "Education",
    devices: ["Desktop", "Tablet"],
    prompt: "An online learning platform with course cards, lesson list, video player placeholder, progress bar, and quiz section. Clean educational design.",
    tags: ["Education", "Learning", "Courses"],
  },
  {
    id: 9,
    title: "Music Streaming",
    description: "Music app interface with playlists and player",
    icon: Music,
    category: "Entertainment",
    devices: ["Desktop", "Mobile"],
    prompt: "A music streaming interface with playlist grid, now playing bar, album art, play controls, and queue. Dark theme with vibrant accent colors.",
    tags: ["Music", "Audio", "Streaming"],
  },
  {
    id: 10,
    title: "Photo Gallery",
    description: "Image showcase with masonry layout and lightbox",
    icon: Camera,
    category: "Media",
    devices: ["Desktop", "Tablet"],
    prompt: "A photo gallery with masonry grid layout, category filters, lightbox modal for full view, and image details. Elegant and minimal design.",
    tags: ["Photography", "Gallery", "Portfolio"],
  },
  {
    id: 11,
    title: "Gaming Leaderboard",
    description: "Competitive ranking display with player stats",
    icon: Gamepad2,
    category: "Gaming",
    devices: ["Desktop", "Mobile"],
    prompt: "A gaming leaderboard with player rankings, avatars, scores, and stats. Include filters for time period and game mode. Futuristic gaming aesthetic.",
    tags: ["Gaming", "Competition", "Stats"],
  },
  {
    id: 12,
    title: "Dating Profile",
    description: "User profile card with swipe interface",
    icon: Heart,
    category: "Social",
    devices: ["Mobile"],
    prompt: "A dating app profile card with photo, bio, interests tags, and swipe buttons (like/pass). Include match notification modal. Modern and playful design.",
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
              <p className="text-[10px] sm:text-xs text-orange-500 font-mono font-black uppercase tracking-widest mt-1">Templates</p>
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
              onClick={() => navigate("/examples")}
              className="px-3 sm:px-5 py-2 text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors border-l-2 border-zinc-800"
            >
              Examples
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
            <span className="text-white block">DESIGN</span>
            <span className="text-orange-600 block">TEMPLATES</span>
          </h1>
          <p className="text-sm sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium italic">
            "Professional structures for every use case. Select, customize, and deploy at lightspeed."
          </p>
        </motion.div>

        {/* Templates Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="group relative bg-zinc-950 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(234,88,12,0.3)] transition-all flex flex-col"
            >
              {/* Card Content */}
              <div className="p-6 space-y-6 flex-1 flex flex-col">
                {/* Icon & Category */}
                <div className="flex items-center justify-between shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-600 flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <template.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <span className="px-3 py-1.5 bg-zinc-900 border-2 border-black text-[10px] font-mono font-black text-orange-400 uppercase tracking-widest">
                    {template.category}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-black text-white mb-3 uppercase tracking-tight group-hover:text-orange-500 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3 font-medium">
                    {template.description}
                  </p>
                </div>

                {/* Devices */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {template.devices.map(device => (
                    <div
                      key={device}
                      className="flex items-center gap-2 px-2 py-1 bg-zinc-900 border-2 border-black text-[9px] font-mono font-black text-slate-400 uppercase"
                    >
                      {device === "Desktop" && <Monitor size={10} />}
                      {device === "Tablet" && <Tablet size={10} />}
                      {device === "Mobile" && <Smartphone size={10} />}
                      <span>{device}</span>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  {template.tags.map(tag => (
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
                  onClick={() => handleUseTemplate(template.prompt)}
                  className="w-full py-4 bg-orange-600 text-white font-mono text-sm font-black uppercase tracking-widest hover:bg-orange-700 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3 shrink-0"
                >
                  <Zap size={16} className="fill-current" />
                  <span>Initiate</span>
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

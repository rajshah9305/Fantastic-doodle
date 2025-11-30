import { motion } from "framer-motion";
import { 
  Sparkles, Code2, ArrowRight,
  Smartphone, Monitor, Tablet, Globe,
  ShoppingBag, Briefcase, GraduationCap, Heart,
  Newspaper, Utensils, Dumbbell,
  Music, Camera, Gamepad2, Zap
} from "lucide-react";
import { useLocation } from "wouter";

const templates = [
  {
    id: 1,
    title: "Landing Page",
    description: "Modern landing page with hero section, features, testimonials, and CTA",
    icon: Globe,
    color: "from-blue-500 to-cyan-500",
    category: "Marketing",
    devices: ["Desktop", "Mobile"],
    prompt: "A modern landing page with hero section featuring large heading and CTA button, features section with 3 columns, testimonials carousel, and footer. Use gradient background and modern design.",
    tags: ["Marketing", "Business", "Conversion"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
  },
  {
    id: 2,
    title: "E-commerce Product Page",
    description: "Product showcase with image gallery, details, and add to cart",
    icon: ShoppingBag,
    color: "from-emerald-500 to-teal-500",
    category: "E-commerce",
    devices: ["Desktop", "Tablet", "Mobile"],
    prompt: "An e-commerce product page with image gallery, product title, price, description, size selector, quantity picker, and add to cart button. Include related products section.",
    tags: ["Shopping", "Retail", "Product"],
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=400&fit=crop"
  },
  {
    id: 3,
    title: "Portfolio Website",
    description: "Creative portfolio with project showcase and about section",
    icon: Briefcase,
    color: "from-violet-500 to-purple-500",
    category: "Portfolio",
    devices: ["Desktop", "Mobile"],
    prompt: "A portfolio website with hero section, about me, skills grid, project gallery with hover effects, and contact form. Modern minimalist design with smooth animations.",
    tags: ["Personal", "Creative", "Professional"],
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop"
  },
  {
    id: 4,
    title: "Blog Layout",
    description: "Clean blog design with article cards and sidebar",
    icon: Newspaper,
    color: "from-orange-500 to-red-500",
    category: "Content",
    devices: ["Desktop", "Tablet"],
    prompt: "A blog layout with featured post, article cards in grid, sidebar with categories and recent posts, and pagination. Clean typography and readable design.",
    tags: ["Content", "Writing", "Publishing"],
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop"
  },
  {
    id: 5,
    title: "Dashboard UI",
    description: "Admin dashboard with charts, stats, and data tables",
    icon: Monitor,
    color: "from-indigo-500 to-blue-500",
    category: "Business",
    devices: ["Desktop"],
    prompt: "An admin dashboard with sidebar navigation, stat cards showing metrics, line chart, bar chart, recent activity list, and data table. Modern dark theme with blue accents.",
    tags: ["Analytics", "Admin", "Data"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
  },
  {
    id: 6,
    title: "Restaurant Menu",
    description: "Digital menu with categories, items, and prices",
    icon: Utensils,
    color: "from-amber-500 to-orange-500",
    category: "Food & Beverage",
    devices: ["Tablet", "Mobile"],
    prompt: "A restaurant menu with category tabs, food items with images, descriptions, prices, and dietary icons. Include search and filter options. Elegant design.",
    tags: ["Restaurant", "Menu", "Food"],
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop"
  },
  {
    id: 7,
    title: "Fitness Tracker",
    description: "Workout tracking interface with progress visualization",
    icon: Dumbbell,
    color: "from-green-500 to-emerald-500",
    category: "Health & Fitness",
    devices: ["Mobile", "Tablet"],
    prompt: "A fitness tracker with workout log, progress charts, exercise library, and goal setting. Include calendar view and statistics. Motivational design with bold colors.",
    tags: ["Fitness", "Health", "Tracking"],
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop"
  },
  {
    id: 8,
    title: "Learning Platform",
    description: "Online course interface with lessons and progress",
    icon: GraduationCap,
    color: "from-cyan-500 to-blue-500",
    category: "Education",
    devices: ["Desktop", "Tablet"],
    prompt: "An online learning platform with course cards, lesson list, video player placeholder, progress bar, and quiz section. Clean educational design.",
    tags: ["Education", "Learning", "Courses"],
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=400&fit=crop"
  },
  {
    id: 9,
    title: "Music Streaming",
    description: "Music app interface with playlists and player",
    icon: Music,
    color: "from-pink-500 to-rose-500",
    category: "Entertainment",
    devices: ["Desktop", "Mobile"],
    prompt: "A music streaming interface with playlist grid, now playing bar, album art, play controls, and queue. Dark theme with vibrant accent colors.",
    tags: ["Music", "Audio", "Streaming"],
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop"
  },
  {
    id: 10,
    title: "Photo Gallery",
    description: "Image showcase with masonry layout and lightbox",
    icon: Camera,
    color: "from-fuchsia-500 to-pink-500",
    category: "Media",
    devices: ["Desktop", "Tablet"],
    prompt: "A photo gallery with masonry grid layout, category filters, lightbox modal for full view, and image details. Elegant and minimal design.",
    tags: ["Photography", "Gallery", "Portfolio"],
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=400&fit=crop"
  },
  {
    id: 11,
    title: "Gaming Leaderboard",
    description: "Competitive ranking display with player stats",
    icon: Gamepad2,
    color: "from-purple-500 to-indigo-500",
    category: "Gaming",
    devices: ["Desktop", "Mobile"],
    prompt: "A gaming leaderboard with player rankings, avatars, scores, and stats. Include filters for time period and game mode. Futuristic gaming aesthetic.",
    tags: ["Gaming", "Competition", "Stats"],
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop"
  },
  {
    id: 12,
    title: "Dating Profile",
    description: "User profile card with swipe interface",
    icon: Heart,
    color: "from-red-500 to-pink-500",
    category: "Social",
    devices: ["Mobile"],
    prompt: "A dating app profile card with photo, bio, interests tags, and swipe buttons (like/pass). Include match notification modal. Modern and playful design.",
    tags: ["Social", "Dating", "Mobile"],
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop"
  }
];

export default function Templates() {
  const [, navigate] = useLocation();

  const handleUseTemplate = (prompt: string) => {
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
              <p className="text-xs text-slate-500">Templates</p>
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
              onClick={() => navigate("/examples")}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Examples
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
              Design Templates
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Professional templates for every use case. Customize and deploy in minutes.
          </p>
        </motion.div>

        {/* Templates Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-white/20"
            >
              {/* Card Content */}
              <div className="p-6 space-y-4">
                {/* Icon & Category */}
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 bg-gradient-to-br ${template.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <template.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                    {template.category}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{template.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{template.description}</p>
                </div>

                {/* Devices */}
                <div className="flex items-center gap-2">
                  {template.devices.map((device) => (
                    <div
                      key={device}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600"
                    >
                      {device === "Desktop" && <Monitor className="w-3 h-3" />}
                      {device === "Tablet" && <Tablet className="w-3 h-3" />}
                      {device === "Mobile" && <Smartphone className="w-3 h-3" />}
                      <span>{device}</span>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-slate-50 rounded-lg text-xs font-medium text-slate-500"
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
                  className={`w-full py-3 bg-gradient-to-r ${template.color} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Use This Template</span>
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

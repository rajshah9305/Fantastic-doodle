import { Outlet, NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, GitBranch, Code2, Settings, History, BarChart3, Brain, Sparkles, MessageSquare, Bot } from "lucide-react";

const Layout = () => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Agents", href: "/agents", icon: Bot },
    { name: "Pipeline", href: "/pipeline", icon: GitBranch },
    { name: "Code Studio", href: "/code-studio", icon: Code2 },
    { name: "Models", href: "/models", icon: Settings },
    { name: "History", href: "/history", icon: History },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  // Chat page manages its own full-height layout
  const isChatPage = location.pathname === "/chat";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 w-full bg-white border-b border-black/8 shadow-[0_1px_0_0_hsl(0_0%_0%/0.06)]">
        <div className="container flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-xl bg-gradient-hero shadow-glow">
              <Brain className="h-5 w-5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary animate-pulse border-2 border-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-black flex items-center gap-1.5">
                AI Pipeline
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </h1>
              <p className="text-[10px] font-medium text-black/40 tracking-wider uppercase">Agent Orchestrator</p>
            </div>
          </div>

          <nav className="flex items-center gap-0.5 bg-black/4 p-1 rounded-xl overflow-x-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-white shadow-sm shadow-primary/30"
                      : "text-black/50 hover:text-black hover:bg-black/6"
                  }`
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className={isChatPage ? "flex-1 flex flex-col overflow-hidden container px-6 max-w-7xl mx-auto" : "container py-6 px-6 max-w-7xl mx-auto flex-1 pb-8"}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

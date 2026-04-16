import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Save, User, Bell, Palette } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export default function Settings() {
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem("userSettings");
      if (saved) {
        const settings = JSON.parse(saved);
        return {
          name: settings.name || "User",
          email: settings.email || "user@example.com",
          notifications: settings.notifications ?? true,
          autoSave: settings.autoSave ?? true,
        };
      }
    } catch (error) {
      // Ignore parse errors, use defaults
    }
    return {
      name: "User",
      email: "user@example.com",
      notifications: true,
      autoSave: true,
    };
  };

  const [name, setName] = useState(loadSettings().name);
  const [email, setEmail] = useState(loadSettings().email);
  const [notifications, setNotifications] = useState(loadSettings().notifications);
  const [autoSave, setAutoSave] = useState(loadSettings().autoSave);

  const handleSave = () => {
    try {
      localStorage.setItem("userSettings", JSON.stringify({
        name,
        email,
        notifications,
        autoSave,
        theme,
      }));
      toast.success("Settings saved successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to save settings: ${errorMessage}`);
    }
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

      <div className="relative z-10 container mx-auto px-3 xs:px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-4 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-mono font-bold uppercase bg-zinc-900 text-slate-400 border border-orange-900/50 hover:border-orange-500 hover:text-orange-400 rounded transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-black text-white mb-2 tracking-tighter">
            SETTINGS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your account and application preferences
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Profile Settings */}
          <div className="bg-zinc-950 border border-orange-900/30 rounded-lg overflow-hidden hover:border-orange-500/50 transition-all">
            <div className="p-4 sm:p-6 border-b border-orange-900/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-600 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">Profile</h2>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-slate-400">
                    Update your personal information
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-xs sm:text-sm font-mono text-orange-400 uppercase">
                  Name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-900 border border-orange-900/50 hover:border-orange-500/70 text-white placeholder:text-slate-500 rounded font-mono text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:bg-zinc-800 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs sm:text-sm font-mono text-orange-400 uppercase">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-900 border border-orange-900/50 hover:border-orange-500/70 text-white placeholder:text-slate-500 rounded font-mono text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:bg-zinc-800 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="bg-zinc-950 border border-orange-900/30 rounded-lg overflow-hidden hover:border-orange-500/50 transition-all">
            <div className="p-4 sm:p-6 border-b border-orange-900/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-600 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">Appearance</h2>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-slate-400">
                    Customize how the app looks
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-mono text-orange-400 uppercase">Theme</p>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-slate-400 mt-1">
                    Current theme: <span className="text-white">{theme}</span>
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  disabled={!toggleTheme}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-mono font-bold uppercase bg-zinc-900 text-white border border-orange-900/50 hover:border-orange-500 hover:bg-zinc-800 rounded transition-all disabled:opacity-50"
                >
                  Toggle Theme
                </button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-zinc-950 border border-orange-900/30 rounded-lg overflow-hidden hover:border-orange-500/50 transition-all">
            <div className="p-4 sm:p-6 border-b border-orange-900/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-600 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">Preferences</h2>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-slate-400">
                    Configure your app preferences
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-mono text-orange-400 uppercase">Notifications</p>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-slate-400 mt-1">
                    Receive notifications about your apps
                  </p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full transition-all relative ${
                    notifications ? "bg-orange-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full absolute top-0.5 transition-all shadow-md ${
                      notifications ? "left-6 sm:left-7" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-mono text-orange-400 uppercase">Auto-save</p>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-slate-400 mt-1">
                    Automatically save changes in the editor
                  </p>
                </div>
                <button
                  onClick={() => setAutoSave(!autoSave)}
                  className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full transition-all relative ${
                    autoSave ? "bg-orange-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full absolute top-0.5 transition-all shadow-md ${
                      autoSave ? "left-6 sm:left-7" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-4 sm:px-6 py-2.5 sm:py-3 font-mono text-xs sm:text-sm font-bold uppercase bg-orange-600 text-white hover:bg-orange-700 border border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

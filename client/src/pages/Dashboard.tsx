import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Code,
  Calendar,
  Trash2,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { GeneratedApp } from "@shared/types";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<{ id: number; title: string } | null>(null);

  const { data: apps, isLoading, refetch } = trpc.apps.list.useQuery();

  const deleteMutation = trpc.apps.delete.useMutation({
    onSuccess: () => {
      toast.success("App deleted successfully");
      refetch();
      setDeleteDialogOpen(false);
      setAppToDelete(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete app: ${error.message || "An unexpected error occurred"}`);
    },
  });

  const filteredApps = apps?.filter(
    (app: GeneratedApp) =>
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const handleDeleteClick = (id: number, title: string) => {
    setAppToDelete({ id, title });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (appToDelete) {
      deleteMutation.mutate({ id: appToDelete.id });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-slate-400 font-mono">LOADING WORKSPACE...</p>
        </div>
      </div>
    );
  }

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

      {/* Header */}
      <header className="h-16 xs:h-18 sm:h-20 border-b-4 border-black bg-zinc-950 flex items-center justify-between px-4 xs:px-6 md:px-8 z-20 relative gap-2 shrink-0">
        <div className="flex items-center gap-3 xs:gap-4 sm:gap-6 min-w-0 flex-1">
          <button
            onClick={() => navigate("/")}
            className="hover:text-white transition-colors flex-shrink-0 group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-600 flex items-center justify-center text-white font-black text-lg sm:text-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-active:translate-x-[1px] group-active:translate-y-[1px] group-active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              R
            </div>
          </button>
          <div className="h-8 w-1 bg-zinc-800 hidden sm:block"></div>
          <h1 className="text-sm xs:text-base sm:text-2xl font-black text-white tracking-tighter uppercase truncate">
            Dashboard
          </h1>
        </div>
        <button
          onClick={() => navigate("/")}
          className="group relative px-3 xs:px-4 sm:px-6 py-2 sm:py-3 font-mono text-[10px] xs:text-xs sm:text-sm font-black uppercase tracking-widest transition-all bg-orange-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] min-h-[44px] flex items-center gap-2"
          title="Create new app"
        >
          <Plus size={16} className="flex-shrink-0" />
          <span className="hidden xs:inline">New App</span>
          <span className="xs:hidden">New</span>
        </button>
      </header>

      <div className="relative z-10 container mx-auto px-4 xs:px-6 py-6 sm:py-10">
         {/* Search & Create Section */}
         <div className="mb-8 sm:mb-12 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-6">
           {/* Search Bar */}
           <div className="flex-1 min-w-0">
             <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-600 group-focus-within:text-orange-400 transition-colors" />
               <input
                 type="text"
                 placeholder="Search your apps..."
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 className="w-full pl-12 pr-4 py-3 sm:py-4 bg-zinc-900 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-white placeholder:text-slate-600 rounded-none font-mono text-sm focus:outline-none focus:border-orange-600 transition-all"
               />
             </div>
           </div>

           {/* Create Generation Button */}
           <button
             onClick={() => navigate("/")}
             className="w-full sm:w-auto px-6 py-3 sm:py-4 font-mono text-xs sm:text-sm font-black uppercase bg-zinc-900 text-white hover:bg-zinc-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none transition-all flex items-center justify-center gap-3 shrink-0"
             title="Create a new AI-generated app"
           >
             <Sparkles className="w-4 h-4 text-orange-500" />
             <span>AI Generation</span>
           </button>
         </div>

        {/* Stats */}
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-6 mb-10 sm:mb-16">
          {[
            { label: "Total Apps", value: apps?.length || 0, icon: Code },
            { label: "This Month", value: apps?.filter((app: GeneratedApp) => {
                const date = new Date(app.generatedAt);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length || 0, icon: Calendar },
            { label: "Success Rate", value: "100%", icon: Sparkles, color: "text-orange-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-950 border-4 border-black p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-600/5 rotate-45 translate-x-8 -translate-y-8 transition-transform group-hover:scale-150" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <p className="text-[10px] sm:text-xs font-mono font-black text-orange-600 uppercase tracking-widest">{stat.label}</p>
                <stat.icon className="w-4 h-4 text-orange-600" />
              </div>
              <p className={`text-2xl sm:text-4xl font-black relative z-10 ${stat.color || "text-white"}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Apps Grid */}
        {filteredApps && filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredApps.map((app: GeneratedApp) => (
              <div key={app.id} className="bg-zinc-950 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(234,88,12,0.3)] transition-all flex flex-col h-full group">
                <div className="p-5 border-b-4 border-black bg-zinc-900 group-hover:bg-zinc-800 transition-colors shrink-0">
                  <h3 className="text-base sm:text-lg font-black text-white mb-2 line-clamp-1 uppercase tracking-tight group-hover:text-orange-500">{app.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed italic">
                    "{app.prompt}"
                  </p>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-6">
                  <div className="text-[10px] font-mono font-black text-orange-600 uppercase flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(app.generatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate(`/editor/${app.id}`)}
                      className="px-3 py-2.5 text-[10px] sm:text-xs font-mono font-black uppercase bg-zinc-900 text-white border-2 border-black hover:bg-zinc-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2"
                      title="Edit app"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => navigate(`/app/${app.id}`)}
                      className="px-3 py-2.5 text-[10px] sm:text-xs font-mono font-black uppercase bg-orange-600 text-white border-2 border-black hover:bg-orange-700 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2"
                      title="View app"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(app.id, app.title)}
                      disabled={deleteMutation.isPending}
                      className="col-span-2 px-3 py-2.5 text-[10px] sm:text-xs font-mono font-black uppercase bg-zinc-900 text-red-500 border-2 border-black hover:bg-red-950/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      title="Delete app"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Destroy</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-950 border-4 border-black p-12 sm:p-20 text-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <Code className="w-16 h-16 text-orange-600/20 mx-auto mb-6" />
            <h3 className="text-xl sm:text-3xl font-black text-white mb-4 uppercase tracking-tighter">No constructions found</h3>
            <p className="text-sm sm:text-lg text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? `Zero matches for "${searchQuery}". Re-evaluate your search parameters.`
                : "Your workspace is empty. Start a new generation to see your ideas take shape."}
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto px-8 py-4 font-mono text-sm font-black uppercase bg-orange-600 text-white hover:bg-orange-700 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3 mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              <span>Initiate First App</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-zinc-950 border-4 border-black text-white rounded-none shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-white">Confirm Destruction</DialogTitle>
            <DialogDescription className="text-slate-400 font-medium pt-2">
              Are you certain you want to destroy <span className="text-orange-500 font-bold underline">"{appToDelete?.title}"</span>? This process is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-4 mt-6">
            <button
              onClick={() => {
                setDeleteDialogOpen(false);
                setAppToDelete(null);
              }}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-3 text-xs font-mono font-black uppercase bg-zinc-800 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-3 text-xs font-mono font-black uppercase bg-red-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Destroy"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

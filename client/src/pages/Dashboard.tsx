import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your apps...</p>
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
      <header className="h-13 xs:h-14 sm:h-16 border-b border-orange-900/30 bg-black/80 backdrop-blur-sm flex items-center justify-between px-3 xs:px-4 sm:px-4 md:px-6 z-20 relative gap-2">
        <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={() => navigate("/")}
            className="hover:text-white transition-colors flex-shrink-0"
          >
            <div className="w-6 xs:w-7 sm:w-8 h-6 xs:h-7 sm:h-8 bg-orange-600 flex items-center justify-center text-white font-bold text-xs xs:text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              A
            </div>
          </button>
          <div className="h-4 xs:h-5 sm:h-6 w-px bg-orange-900/30 hidden sm:block flex-shrink-0"></div>
          <h1 className="text-xs xs:text-sm sm:text-lg font-bold text-white tracking-wide uppercase truncate">
            Dashboard
          </h1>
        </div>
        <button
          onClick={() => navigate("/")}
          className="group relative px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 font-mono text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out flex items-center gap-1 xs:gap-1.5 sm:gap-2 bg-orange-600 text-white hover:bg-orange-700 border border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] min-h-[32px] xs:min-h-[36px] sm:min-h-0 flex-shrink-0"
          title="Create new app"
        >
          <Plus size={14} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="hidden xs:inline">New</span>
          <span className="hidden sm:inline">App</span>
        </button>
      </header>

      <div className="relative z-10 container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-3 xs:py-4 sm:py-6 md:py-8">
         {/* Search & Create Section */}
         <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
           {/* Search Bar */}
           <div className="flex-1 min-w-0">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-600 flex-shrink-0" />
               <input
                 type="text"
                 placeholder="Search apps..."
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-zinc-900 border border-orange-900/50 hover:border-orange-500/70 text-white placeholder:text-slate-500 rounded-lg font-mono text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:bg-zinc-800 transition-all"
               />
             </div>
           </div>

           {/* Create Generation Button */}
           <button
             onClick={() => navigate("/")}
             className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 font-mono text-xs sm:text-sm font-bold uppercase bg-orange-600 text-white hover:bg-orange-700 border border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded transition-all flex items-center justify-center sm:justify-start gap-2 flex-shrink-0"
             title="Create a new AI-generated app"
           >
             <Sparkles className="w-4 h-4 flex-shrink-0" />
             <span className="hidden xs:inline">New Generation</span>
             <span className="xs:hidden">New</span>
           </button>
         </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-zinc-950 border border-orange-900/30 rounded-lg p-3 sm:p-5 hover:border-orange-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] xs:text-[10px] sm:text-xs font-mono text-slate-500 uppercase">Total Apps</p>
              <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
            </div>
            <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-white">{apps?.length || 0}</p>
          </div>

          <div className="bg-zinc-950 border border-orange-900/30 rounded-lg p-3 sm:p-5 hover:border-orange-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] xs:text-[10px] sm:text-xs font-mono text-slate-500 uppercase">This Month</p>
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
            </div>
            <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-white">
              {apps?.filter((app: GeneratedApp) => {
                const date = new Date(app.generatedAt);
                const now = new Date();
                return (
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear()
                );
              }).length || 0}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-zinc-950 border border-orange-900/30 rounded-lg p-3 sm:p-5 hover:border-orange-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] xs:text-[10px] sm:text-xs font-mono text-slate-500 uppercase">AI Powered</p>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
            </div>
            <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-orange-500">100%</p>
          </div>
        </div>

        {/* Apps Grid */}
        {filteredApps && filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredApps.map((app: GeneratedApp) => (
              <div key={app.id} className="bg-zinc-950 border border-orange-900/30 rounded-lg overflow-hidden hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(234,88,12,0.1)] transition-all group flex flex-col h-full">
                <div className="p-3 xs:p-4 sm:p-5 border-b border-orange-900/30 flex-shrink-0">
                  <h3 className="text-xs xs:text-sm sm:text-base font-bold text-white mb-1 line-clamp-2 group-hover:text-orange-400 transition-colors">{app.title}</h3>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-slate-400 line-clamp-2">
                    {app.prompt}
                  </p>
                </div>
                <div className="p-3 xs:p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="text-[9px] xs:text-[10px] sm:text-xs text-orange-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{new Date(app.generatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 xs:gap-2 sm:gap-2">
                    <button
                      onClick={() => navigate(`/editor/${app.id}`)}
                      className="px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold uppercase bg-zinc-900 text-white border border-orange-900/50 hover:border-orange-500 hover:bg-zinc-800 rounded transition-all min-h-[32px] xs:min-h-[36px] flex items-center justify-center gap-1"
                      title="Edit app"
                    >
                      <Code className="w-3 h-3 flex-shrink-0" />
                      <span className="hidden xs:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => navigate(`/app/${app.id}`)}
                      className="px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold uppercase bg-zinc-900 text-white border border-orange-900/50 hover:border-orange-500 hover:bg-zinc-800 rounded transition-all min-h-[32px] xs:min-h-[36px] flex items-center justify-center gap-1"
                      title="View app"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="hidden xs:inline">View</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(app.id, app.title)}
                      disabled={deleteMutation.isPending}
                      className="col-span-2 px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold uppercase bg-red-900/20 text-red-500 border border-red-900/50 hover:border-red-500 hover:bg-red-900/30 rounded transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                      title="Delete app"
                    >
                      <Trash2 className="w-3 h-3 flex-shrink-0" />
                      <span className="hidden xs:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-950 border border-orange-900/30 rounded-lg p-6 xs:p-8 sm:p-12 text-center">
            <Code className="w-12 xs:w-14 sm:w-16 h-12 xs:h-14 sm:h-16 text-orange-600/30 mx-auto mb-3 xs:mb-4 flex-shrink-0" />
            <h3 className="text-base xs:text-lg sm:text-xl font-bold text-white mb-2">No apps found</h3>
            <p className="text-xs xs:text-sm sm:text-base text-slate-400 mb-4 xs:mb-6">
              {searchQuery
                ? "No apps match your search. Try a different query."
                : "Get started by creating your first AI-generated app!"}
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full xs:w-auto px-4 xs:px-6 py-2.5 xs:py-3 font-mono text-xs xs:text-sm font-bold uppercase bg-orange-600 text-white hover:bg-orange-700 border border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>Create Your First App</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete App</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{appToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setAppToDelete(null);
              }}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

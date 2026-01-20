import { Link, useLocation } from "wouter";
import { useClearChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Trash2, 
  TrendingUp, 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function Sidebar() {
  const [location] = useLocation();
  const { mutate: clearChat, isPending: isClearing } = useClearChat();
  const { toast } = useToast();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleClearChat = () => {
    clearChat(undefined, {
      onSuccess: () => {
        toast({
          title: "Chat cleared",
          description: "Your conversation history has been removed.",
        });
        setShowClearDialog(false);
      }
    });
  };

  const handleNewChat = () => {
    clearChat(undefined, {
      onSuccess: () => {
        toast({
          title: "New Chat Started",
          description: "Previous history has been cleared.",
        });
      }
    });
  };

  const navItems = [
    { icon: MessageSquare, label: "Chat", href: "/" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0">
      <div className="p-6 border-b border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors" onClick={handleNewChat}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold font-display tracking-tight text-white">
            Stock<span className="text-primary">AI</span>
          </h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-mono">
            Menu
          </p>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              location === item.href 
                ? "bg-primary/10 text-primary font-medium shadow-sm border border-primary/20" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-1"
            )}>
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                location === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-border/50">
        <button 
          onClick={() => setShowClearDialog(true)}
          disabled={isClearing}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
          Clear History
        </button>

        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent className="border-border/50 bg-card/95 backdrop-blur">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-display flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-destructive" />
                Clear Chat History
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-base pt-2">
                This will permanently delete all your chat messages and conversation history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleClearChat}
                disabled={isClearing}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isClearing ? "Clearing..." : "Clear History"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}

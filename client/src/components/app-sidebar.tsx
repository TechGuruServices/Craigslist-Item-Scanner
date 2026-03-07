import { Link, useLocation } from "wouter";
import { LayoutDashboard, RadioReceiver, RefreshCw, Activity, MessageSquare } from "lucide-react";
import { useTriggerCheck } from "@/hooks/use-jobs";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const [location] = useLocation();
  const { mutate: triggerCheck, isPending } = useTriggerCheck();
  const { toast } = useToast();

  const handleTrigger = () => {
    triggerCheck(undefined, {
      onSuccess: () => {
        toast({
          title: "Sync complete",
          description: "Successfully checked all active RSS feeds.",
        });
      },
      onError: (err) => {
        toast({
          title: "Sync failed",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  const navItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Monitors", url: "/monitors", icon: RadioReceiver },
    { title: "AI Assistant", url: "/chat", icon: MessageSquare },
  ];

  return (
    <Sidebar className="border-r border-border/50 bg-card">
      <SidebarContent>
        <SidebarGroup className="py-6">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4 px-4">
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url}
                    className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium transition-colors"
                  >
                    <Link href={item.url} className="flex items-center gap-3 px-4 py-2.5 rounded-lg">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <button
          onClick={handleTrigger}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-primary-foreground bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
          {isPending ? 'Syncing Feeds...' : 'Force Sync Now'}
        </button>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3 text-primary" />
          <span>System active</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

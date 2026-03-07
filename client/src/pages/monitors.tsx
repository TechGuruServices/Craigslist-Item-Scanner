import { useState } from "react";
import { format } from "date-fns";
import { Plus, Settings2, Trash2, Edit2, PlayCircle, StopCircle, RadioReceiver } from "lucide-react";
import { useMonitors, useDeleteMonitor } from "@/hooks/use-monitors";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MonitorForm } from "@/components/monitor-form";
import { type MonitorResponse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Monitors() {
  const { data: monitors, isLoading } = useMonitors();
  const { mutate: deleteMonitor } = useDeleteMonitor();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<MonitorResponse | null>(null);

  const handleCreate = () => {
    setEditingMonitor(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (monitor: MonitorResponse) => {
    setEditingMonitor(monitor);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this monitor? All associated items will also be removed.")) {
      deleteMonitor(id, {
        onSuccess: () => {
          toast({ title: "Monitor deleted", description: "Monitor and its items have been removed." });
        }
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Active Monitors</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your Craigslist RSS feeds to scrape for free stuff.</p>
        </div>
        
        <Button 
          onClick={handleCreate}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-6 py-5 h-auto hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          <span className="font-semibold text-base">Add Monitor</span>
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl border-border/50 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-display">
              {editingMonitor ? "Edit Monitor" : "Create Monitor"}
            </DialogTitle>
          </DialogHeader>
          <MonitorForm 
            initialData={editingMonitor || undefined} 
            onSuccess={() => setIsDialogOpen(false)} 
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6">
              <div className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-1/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : monitors?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl">
          <div className="bg-primary/10 p-6 rounded-full mb-6 text-primary">
            <RadioReceiver className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-display font-semibold mb-2">No monitors yet</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Create your first monitor by providing a Craigslist RSS search URL. We'll automatically fetch new items as they appear.
          </p>
          <Button 
            onClick={handleCreate}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Monitor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {monitors?.map((monitor) => (
            <Card 
              key={monitor.id} 
              className={`p-6 transition-all duration-300 hover:shadow-xl group border-l-4 ${
                monitor.active 
                  ? "border-l-primary shadow-sm hover:border-l-primary bg-card" 
                  : "border-l-muted-foreground/30 bg-muted/30 opacity-75"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold font-display text-foreground truncate">
                      {monitor.name}
                    </h3>
                    <Badge variant={monitor.active ? "default" : "secondary"} className={monitor.active ? "bg-primary/10 text-primary hover:bg-primary/20 border-0" : ""}>
                      {monitor.active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground font-mono truncate bg-muted/50 p-2 rounded-md border border-border/50 mb-4 inline-block max-w-full">
                    {monitor.url}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                    <Settings2 className="w-4 h-4" />
                    <span>
                      Last checked: {monitor.lastChecked 
                        ? format(new Date(monitor.lastChecked), "MMM d, yyyy h:mm a") 
                        : "Never"}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(monitor)}
                    className="hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(monitor.id)}
                    className="hover:border-destructive hover:text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

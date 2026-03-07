import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ExternalLink, Trash2, MapPin, Tag, PackageSearch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useItems, useDeleteItem } from "@/hooks/use-items";
import { useMonitors } from "@/hooks/use-monitors";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// Helper to strip HTML and extract preview from Craigslist CDATA description
function stripHtml(html: string) {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export default function Dashboard() {
  const { data: items, isLoading: itemsLoading } = useItems();
  const { data: monitors } = useMonitors();
  const { mutate: deleteItem } = useDeleteItem();
  const { toast } = useToast();
  
  const [filterMonitor, setFilterMonitor] = useState<number | 'all'>('all');

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    deleteItem(id, {
      onSuccess: () => {
        toast({ title: "Item removed", description: "The item has been cleared from your dashboard." });
      }
    });
  };

  const filteredItems = items?.filter(item => 
    filterMonitor === 'all' ? true : item.monitorId === filterMonitor
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Recent Finds</h1>
          <p className="text-muted-foreground mt-1 text-lg">Fresh free items discovered from your feeds.</p>
        </div>
        
        {monitors && monitors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterMonitor === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterMonitor('all')}
              className={`rounded-full transition-all ${filterMonitor === 'all' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : ''}`}
            >
              All Items
            </Button>
            {monitors.map(m => (
              <Button
                key={m.id}
                variant={filterMonitor === m.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterMonitor(m.id)}
                className={`rounded-full transition-all ${filterMonitor === m.id ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : ''}`}
              >
                {m.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {itemsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="p-5 space-y-4">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl">
          <div className="bg-primary/10 p-6 rounded-full mb-6 text-primary">
            <PackageSearch className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-display font-semibold mb-2">No items found</h2>
          <p className="text-muted-foreground max-w-md">
            We haven't found any items matching your criteria yet. Ensure your monitors are active and try triggering a manual sync.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map((item, i) => {
              const monitor = monitors?.find(m => m.id === item.monitorId);
              const descriptionText = item.description ? stripHtml(item.description).slice(0, 140) + "..." : "No description available.";
              const postedDate = item.postedAt ? new Date(item.postedAt) : new Date(item.createdAt);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group h-full"
                  >
                    <Card className="h-full flex flex-col p-6 border border-border/50 hover:border-primary/40 bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <ExternalLink className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3 text-xs font-medium text-primary uppercase tracking-wider">
                        <Tag className="w-3.5 h-3.5" />
                        {monitor?.name || 'Unknown Monitor'}
                      </div>
                      
                      <h3 className="text-xl font-bold text-foreground line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm flex-grow line-clamp-3 mb-6 leading-relaxed">
                        {descriptionText}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground font-medium">
                            {formatDistanceToNow(postedDate, { addSuffix: true })}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70">
                            {format(postedDate, 'MMM d, h:mm a')}
                          </span>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2 z-10 relative"
                          onClick={(e) => handleDelete(item.id, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </a>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

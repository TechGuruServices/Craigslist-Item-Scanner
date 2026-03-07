import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import Parser from "rss-parser";

const parser = new Parser();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // AI Chat API
  app.get(api.ai.messages.path, async (_req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post(api.ai.chat.path, async (req, res) => {
    try {
      const { message } = api.ai.chat.input.parse(req.body);
      
      // Save user message
      await storage.createMessage({
        role: "user",
        content: message,
      });

      let aiContent = "";
      try {
        const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          body: JSON.stringify({
            model: "llama3", // Defaulting to llama3, user can change if needed
            prompt: message,
            stream: false,
          }),
        });

        if (ollamaResponse.ok) {
          const data = await ollamaResponse.json() as { response: string };
          aiContent = data.response;
        } else {
          throw new Error("Ollama connection failed");
        }
      } catch (error) {
        console.error("Ollama error:", error);
        aiContent = `I couldn't connect to your local Ollama instance at http://localhost:11434. Please make sure Ollama is running on your machine. (Error: ${error instanceof Error ? error.message : String(error)})`;
      }
      
      const assistantMessage = await storage.createMessage({
        role: "assistant",
        content: aiContent,
      });

      // assistantMessage.content contains the AI response
      res.json({ response: assistantMessage.content });
    } catch (err) {
      console.error("AI Chat Error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Monitors API
  app.get(api.monitors.list.path, async (req, res) => {
    const allMonitors = await storage.getMonitors();
    res.json(allMonitors);
  });

  app.get(api.monitors.get.path, async (req, res) => {
    const monitor = await storage.getMonitor(Number(req.params.id));
    if (!monitor) {
      return res.status(404).json({ message: 'Monitor not found' });
    }
    res.json(monitor);
  });

  app.post(api.monitors.create.path, async (req, res) => {
    try {
      const input = api.monitors.create.input.parse(req.body);
      const monitor = await storage.createMonitor(input);
      res.status(201).json(monitor);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.monitors.update.path, async (req, res) => {
    try {
      const input = api.monitors.update.input.parse(req.body);
      const monitor = await storage.updateMonitor(Number(req.params.id), input);
      if (!monitor) {
        return res.status(404).json({ message: 'Monitor not found' });
      }
      res.json(monitor);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.monitors.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const monitor = await storage.getMonitor(id);
    if (!monitor) {
      return res.status(404).json({ message: 'Monitor not found' });
    }
    await storage.deleteMonitor(id);
    res.status(204).send();
  });

  // Items API
  app.get(api.items.list.path, async (req, res) => {
    const monitorId = req.query.monitorId ? Number(req.query.monitorId) : undefined;
    const allItems = await storage.getItems(monitorId);
    res.json(allItems);
  });

  app.delete(api.items.delete.path, async (req, res) => {
    await storage.deleteItem(Number(req.params.id));
    res.status(204).send();
  });

  // Trigger Check API
  app.post(api.jobs.triggerCheck.path, async (req, res) => {
    try {
      await checkFeeds();
      res.json({ message: "Check completed successfully" });
    } catch (error: any) {
      console.error("Error checking feeds:", error);
      res.status(500).json({ message: error.message || "Failed to check feeds" });
    }
  });

  // Setup periodic checking (every 15 minutes)
  const CHECK_INTERVAL = 15 * 60 * 1000;
  setInterval(() => {
    checkFeeds().catch(err => console.error("Periodic feed check failed:", err));
  }, CHECK_INTERVAL);

  return httpServer;
}

async function checkFeeds() {
  const allMonitors = await storage.getMonitors();
  
  for (const monitor of allMonitors) {
    if (!monitor.active) continue;
    
    try {
      const feed = await parser.parseURL(monitor.url);
      
      let newItemsCount = 0;
      for (const item of feed.items) {
        const guid = item.guid || item.link;
        if (!guid) continue;
        
        // Check if item already exists
        const existingItem = await storage.getItemByGuid(guid);
        if (!existingItem) {
          await storage.createItem({
            monitorId: monitor.id,
            title: item.title || "No Title",
            link: item.link || "",
            description: item.contentSnippet || item.content || "",
            postedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            guid: guid,
          });
          newItemsCount++;
        }
      }
      
      // Update last checked time
      await storage.updateMonitor(monitor.id, { lastChecked: new Date() });
      console.log(`Checked monitor ${monitor.name}: ${newItemsCount} new items`);
      
    } catch (error) {
      console.error(`Failed to parse feed for monitor ${monitor.name}:`, error);
    }
  }
}

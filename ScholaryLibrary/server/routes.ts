import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPaperSchema, paperImportSchema } from "@shared/schema";
import { z } from "zod";

async function fetchPdfAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/pdf')) {
    throw new Error('URL does not point to a PDF file');
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/papers", async (_req, res) => {
    const papers = await storage.getAllPapers();
    res.json(papers);
  });

  app.get("/api/papers/:id", async (req, res) => {
    const paper = await storage.getPaper(Number(req.params.id));
    if (!paper) {
      res.status(404).json({ message: "Paper not found" });
      return;
    }
    res.json(paper);
  });

  app.post("/api/papers", async (req, res) => {
    try {
      const paper = insertPaperSchema.parse(req.body);
      const created = await storage.createPaper(paper);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid paper data", errors: error.errors });
        return;
      }
      throw error;
    }
  });

  app.post("/api/papers/import", async (req, res) => {
    try {
      const { url, title } = paperImportSchema.parse(req.body);
      console.log('Starting PDF import from:', url);

      const pdfData = await fetchPdfAsBase64(url);
      console.log('PDF import successful');

      const paper = await storage.createPaper({
        title: title || url.split('/').pop()?.replace('.pdf', '') || 'Untitled Paper',
        url,
        pdfData,
      });

      res.status(201).json(paper);
    } catch (error) {
      console.error('Import error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid import data", errors: error.errors });
        return;
      }
      res.status(500).json({ 
        message: "Failed to import paper",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.patch("/api/papers/:id", async (req, res) => {
    const paper = await storage.getPaper(Number(req.params.id));
    if (!paper) {
      res.status(404).json({ message: "Paper not found" });
      return;
    }

    const updated = await storage.updatePaper(paper.id, req.body);
    res.json(updated);
  });

  app.delete("/api/papers/:id", async (req, res) => {
    const paper = await storage.getPaper(Number(req.params.id));
    if (!paper) {
      res.status(404).json({ message: "Paper not found" });
      return;
    }

    await storage.deletePaper(paper.id);
    res.status(204).send();
  });

  app.get("/api/search", async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ message: "Search query required" });
      return;
    }

    const results = await storage.searchPapers(query);
    res.json(results);
  });

  const httpServer = createServer(app);
  return httpServer;
}
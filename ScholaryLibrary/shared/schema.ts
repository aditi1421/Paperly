import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const papers = pgTable("papers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url"),
  pdfData: text("pdf_data").notNull(), // Base64 encoded PDF
  readingProgress: integer("reading_progress").default(0),
  isFavorite: boolean("is_favorite").default(false),
});

export const insertPaperSchema = createInsertSchema(papers).omit({
  id: true,
  readingProgress: true,
  isFavorite: true,
});

export type InsertPaper = z.infer<typeof insertPaperSchema>;
export type Paper = typeof papers.$inferSelect;

// Schema for paper import
export const paperImportSchema = z.object({
  url: z.string().url("Please enter a valid URL")
    .refine(url => url.toLowerCase().endsWith('.pdf'), {
      message: "URL must point to a PDF file"
    }),
  title: z.string().optional(),
});

export type PaperImport = z.infer<typeof paperImportSchema>;
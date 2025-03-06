import { papers, type Paper, type InsertPaper } from "@shared/schema";

export interface IStorage {
  getPaper(id: number): Promise<Paper | undefined>;
  getAllPapers(): Promise<Paper[]>;
  createPaper(paper: InsertPaper): Promise<Paper>;
  updatePaper(id: number, update: Partial<Paper>): Promise<Paper>;
  deletePaper(id: number): Promise<void>;
  searchPapers(query: string): Promise<Paper[]>;
}

export class MemStorage implements IStorage {
  private papers: Map<number, Paper>;
  private currentId: number;

  constructor() {
    this.papers = new Map();
    this.currentId = 1;
  }

  async getPaper(id: number): Promise<Paper | undefined> {
    return this.papers.get(id);
  }

  async getAllPapers(): Promise<Paper[]> {
    return Array.from(this.papers.values());
  }

  async createPaper(insertPaper: InsertPaper): Promise<Paper> {
    const id = this.currentId++;
    const paper: Paper = {
      ...insertPaper,
      id,
      readingProgress: 0,
      isFavorite: false,
    };
    this.papers.set(id, paper);
    return paper;
  }

  async updatePaper(id: number, update: Partial<Paper>): Promise<Paper> {
    const paper = await this.getPaper(id);
    if (!paper) throw new Error("Paper not found");

    const updatedPaper = { ...paper, ...update };
    this.papers.set(id, updatedPaper);
    return updatedPaper;
  }

  async deletePaper(id: number): Promise<void> {
    this.papers.delete(id);
  }

  async searchPapers(query: string): Promise<Paper[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.papers.values()).filter(paper => 
      paper.title.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export const storage = new MemStorage();
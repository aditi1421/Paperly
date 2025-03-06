import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPaperSchema, paperImportSchema, type InsertPaper, type PaperImport } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import DragDrop from "@/components/DragDrop";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function Upload() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<InsertPaper>({
    resolver: zodResolver(insertPaperSchema),
    defaultValues: {
      title: "",
    },
  });

  const handleFileProcess = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload a PDF file smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        form.setValue("pdfData", base64.split(",")[1]);
        form.setValue("title", file.name.replace(".pdf", ""));
      };
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read the PDF file",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the PDF file",
        variant: "destructive",
      });
    }
  };

  const handleDrop = async (files: FileList | null, url?: string) => {
    if (url) {
      // Handle URL drop
      try {
        if (!url.toLowerCase().endsWith('.pdf')) {
          toast({
            title: "Invalid URL",
            description: "Please provide a direct link to a PDF file",
            variant: "destructive",
          });
          return;
        }

        setIsUploading(true);
        const response = await apiRequest("POST", "/api/papers/import", {
          url,
          title: url.split('/').pop()?.replace('.pdf', '')
        });
        const paper = await response.json();
        toast({ title: "Paper imported successfully" });
        setLocation(`/read/${paper.id}`);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to import paper",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // Handle file drop
    if (files?.length) {
      await handleFileProcess(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileProcess(file);
    }
  };

  const onSubmit = async (data: InsertPaper) => {
    try {
      setIsUploading(true);
      const response = await apiRequest("POST", "/api/papers", data);
      const paper = await response.json();
      toast({ title: "Paper uploaded successfully" });
      setLocation(`/read/${paper.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload paper",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-serif mb-6">Upload Paper</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <DragDrop 
            onDrop={handleDrop}
            className="cursor-pointer"
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>PDF File</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload Paper"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
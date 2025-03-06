import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paperImportSchema, type PaperImport } from "@shared/schema";
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

export default function Import() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);

  const form = useForm<PaperImport>({
    resolver: zodResolver(paperImportSchema),
    defaultValues: {
      url: "",
      title: "",
    },
  });

  const onSubmit = async (data: PaperImport) => {
    try {
      setIsImporting(true);
      const response = await apiRequest("POST", "/api/papers/import", data);
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
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-serif mb-6">Import Paper</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paper URL</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://example.com/paper.pdf" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Paper title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isImporting}>
            {isImporting ? "Importing..." : "Import Paper"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

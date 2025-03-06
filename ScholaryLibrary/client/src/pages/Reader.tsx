import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Paper } from "@shared/schema";
import PDFViewer from "@/components/PDFViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reader() {
  const { id } = useParams();

  const { data: paper, isLoading } = useQuery<Paper>({
    queryKey: [`/api/papers/${id}`],
  });

  const updateProgress = async (progress: number) => {
    if (!paper) return;

    try {
      await apiRequest("PATCH", `/api/papers/${paper.id}`, {
        readingProgress: progress,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/papers/${id}`] });
    } catch (error) {
      console.error("Failed to update reading progress:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="w-full aspect-[1/1.4]" />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl">Paper not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
        </Link>

        <div className="text-sm text-muted-foreground">
          Progress: {paper.readingProgress}%
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4">
        <PDFViewer
          pdfData={paper.pdfData}
          onProgress={updateProgress}
        />
      </div>
    </div>
  );
}
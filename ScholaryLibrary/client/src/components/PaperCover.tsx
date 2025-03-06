import { Link } from "wouter";
import { Paper } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function PaperCover({ paper }: { paper: Paper }) {
  const { toast } = useToast();

  const toggleFavorite = async () => {
    try {
      await apiRequest("PATCH", `/api/papers/${paper.id}`, {
        isFavorite: !paper.isFavorite,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/papers"] });
      toast({
        title: paper.isFavorite ? "Removed from favorites" : "Added to favorites",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/read/${paper.id}`}>
        <a className="block p-4">
          <div className="aspect-[2/3] bg-accent rounded-md flex flex-col items-center justify-center p-4 text-center">
            <h3 className="font-serif text-lg line-clamp-4">{paper.title || "Untitled Paper"}</h3>
            {paper.readingProgress > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                Progress: {paper.readingProgress}%
              </div>
            )}
          </div>
        </a>
      </Link>

      <button
        onClick={toggleFavorite}
        className="absolute top-2 right-2 p-2 rounded-full bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Heart
          className={`h-4 w-4 ${paper.isFavorite ? "fill-red-500 text-red-500" : ""}`}
        />
      </button>
    </Card>
  );
}
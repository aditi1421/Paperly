import { useQuery } from "@tanstack/react-query";
import { Paper } from "@shared/schema";
import PaperCover from "./PaperCover";
import { Skeleton } from "@/components/ui/skeleton";

export default function LibraryGrid({ query }: { query?: string }) {
  const { data: papers, isLoading } = useQuery<Paper[]>({
    queryKey: query ? ["/api/search", query] : ["/api/papers"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
        ))}
      </div>
    );
  }

  if (!papers?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No papers found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {papers.map((paper) => (
        <PaperCover key={paper.id} paper={paper} />
      ))}
    </div>
  );
}

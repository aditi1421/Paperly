import { useLocation } from "wouter";
import LibraryGrid from "@/components/LibraryGrid";

export default function Home() {
  const [location] = useLocation();
  const query = new URLSearchParams(location.split("?")[1]).get("q") || undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif">
          {query ? `Search Results: ${query}` : "Your Library"}
        </h1>
      </div>
      <LibraryGrid query={query} />
    </div>
  );
}

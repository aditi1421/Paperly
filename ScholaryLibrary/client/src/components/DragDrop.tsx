import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";

interface DragDropProps {
  onDrop: (files: FileList | null, url?: string) => void;
  className?: string;
}

export default function DragDrop({ onDrop, className }: DragDropProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    // Check if it's a URL drop
    const url = e.dataTransfer.getData('text/uri-list');
    if (url) {
      onDrop(null, url);
      return;
    }

    // Handle file drop
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onDrop(files);
    }
  };

  return (
    <Card
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        isDragging && "border-primary bg-primary/5",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-2">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-lg font-medium">
          Drop PDF files or links here
        </p>
        <p className="text-sm text-muted-foreground">
          or click to select files
        </p>
      </div>
    </Card>
  );
}

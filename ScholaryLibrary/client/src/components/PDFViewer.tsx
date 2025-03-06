import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Set worker
const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface PDFViewerProps {
  pdfData: string;
  onProgress?: (progress: number) => void;
}

export default function PDFViewer({ pdfData, onProgress }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let pdf: pdfjs.PDFDocumentProxy;
    const container = containerRef.current;
    if (!container) return;

    const renderPage = async (pageNum: number, pdf: pdfjs.PDFDocumentProxy) => {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        canvas.className = "mb-4 shadow-lg rounded";
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        container.appendChild(canvas);

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        if (onProgress) {
          onProgress(Math.round((pageNum / pdf.numPages) * 100));
        }
      } catch (error) {
        console.error("Failed to render PDF page:", error);
        toast({
          title: "Error",
          description: "Failed to render PDF page",
          variant: "destructive",
        });
      }
    };

    const loadPDF = async () => {
      try {
        setIsLoading(true);
        container.innerHTML = ''; // Clear previous content

        if (!pdfData) {
          throw new Error("No PDF data provided");
        }

        // Ensure we have valid base64 data
        const base64Data = pdfData.includes('base64,') 
          ? pdfData.split('base64,')[1]
          : pdfData;

        // Create Uint8Array from base64
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Load the PDF
        pdf = await pdfjs.getDocument({ data: bytes }).promise;

        // Render all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          await renderPage(pageNum, pdf);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load PDF:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load PDF",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    loadPDF();

    return () => {
      if (pdf) {
        pdf.destroy();
      }
    };
  }, [pdfData, onProgress, toast]);

  if (isLoading) {
    return <Skeleton className="w-full aspect-[1/1.4]" />;
  }

  return (
    <div className="w-full overflow-auto bg-white rounded-lg p-4">
      <div ref={containerRef} className="flex flex-col items-center" />
    </div>
  );
}
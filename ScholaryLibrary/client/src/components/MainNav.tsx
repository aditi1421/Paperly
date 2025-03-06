import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Library, Upload, Link as LinkIcon } from "lucide-react";
import SearchBar from "./SearchBar";

export default function MainNav() {
  const [location] = useLocation();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            <a className="text-xl font-semibold">Paperly</a>
          </Link>

          <div className="hidden md:flex gap-4">
            <Link href="/">
              <Button variant={location === "/" ? "default" : "ghost"}>
                <Library className="mr-2 h-4 w-4" />
                Library
              </Button>
            </Link>
            <Link href="/upload">
              <Button variant={location === "/upload" ? "default" : "ghost"}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </Link>
            <Link href="/import">
              <Button variant={location === "/import" ? "default" : "ghost"}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Import
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <SearchBar />
        </div>
      </div>
    </nav>
  );
}
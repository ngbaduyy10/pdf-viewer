'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen, Menu } from "lucide-react";
import { useRef } from "react";
import { HighlightItem } from "@/lib/types";
import Search from "./Search";
import Highlight from "./Highlight";

interface HeaderProps {
  file: File | null;
  setFile: (file: File) => void;
  currentPage: number;
  numPages: number;
  setNumPages: (numPages: number) => void;
  pageInput: string;
  setPageInput: (value: string) => void;
  pageElementsRef: React.RefObject<Map<number, HTMLDivElement>>;
  setHighlights: React.Dispatch<React.SetStateAction<HighlightItem[]>>;
  onToggleSidebar: () => void;
}

export default function Header({ 
  file,
  setFile,
  currentPage,
  numPages,
  setNumPages,
  pageInput,
  setPageInput,
  pageElementsRef,
  setHighlights,
  onToggleSidebar,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setNumPages(0);
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = Number(pageInput);
      if (target >= 1 && target <= numPages) {
        const el = pageElementsRef.current.get(target);
        el?.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        setPageInput(String(currentPage));
      }
      (e.target as HTMLInputElement).blur();
    }
  };
  
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-5 flex-between">
      <div className="flex items-center gap-3">
        <Button onClick={onToggleSidebar} className="bg-secondary text-primary hover:text-white">
          <Menu className="size-5 stroke-3" />
        </Button>
        <h1 className="text-2xl font-semibold mr-6">PDF Viewer</h1>
        {file && <Search />}
      </div>
      <div className="flex items-center gap-2">
        {file && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              {file.name}
              <span className="mx-1">—</span>
              <input
                type="number"
                min={1}
                max={numPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyDown={handlePageInputKeyDown}
                onBlur={() => setPageInput(String(currentPage))}
                className="w-10 text-center border border-primary rounded px-1 py-0.5 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none"
              />
              <span>of {numPages} {numPages > 1 ? 'pages' : 'page'}</span>
            </span>
            <Highlight setHighlights={setHighlights} />
          </div>
        )}
        <Button onClick={() => fileInputRef.current?.click()}>
          <FolderOpen className="size-5" />
          Choose PDF
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </header>
  );
}
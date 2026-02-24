'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, FolderOpen, Highlighter, Menu, X } from "lucide-react";

interface HeaderProps {
  file: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  currentPage: number;
  numPages: number;
  pageInput: string;
  setPageInput: (value: string) => void;
  handlePageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleSidebar: () => void;
  onHighlight: () => void;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onSearchNext: () => void;
  onSearchPrev: () => void;
  onClearSearch: () => void;
  totalMatches: number;
  currentMatchIndex: number;
}

export default function Header({ 
  file,
  fileInputRef,
  currentPage,
  numPages,
  pageInput,
  setPageInput,
  handlePageInputKeyDown,
  handleFileChange,
  onToggleSidebar,
  onHighlight,
  searchText,
  onSearchTextChange,
  onSearchNext,
  onSearchPrev,
  onClearSearch,
  totalMatches,
  currentMatchIndex,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-5 flex-between">
      <div className="flex items-center gap-3">
        <Button onClick={onToggleSidebar} className="bg-secondary text-primary hover:text-white">
          <Menu className="size-5 stroke-3" />
        </Button>
        <h1 className="text-2xl font-semibold mr-6">PDF Viewer</h1>
        <div className="flex items-center gap-1">
          <Input
            type="text"
            placeholder="Search text..."
            className="w-50"
            value={searchText}
            onChange={(e) => onSearchTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.shiftKey ? onSearchPrev() : onSearchNext();
              }
              if (e.key === 'Escape') {
                onClearSearch();
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
          {searchText && (
            <>
              <span className="text-xs text-muted-foreground whitespace-nowrap min-w-12 text-center">
                {totalMatches > 0 ? `${currentMatchIndex + 1}/${totalMatches}` : 'No results'}
              </span>
              <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={onSearchPrev}>
                <ChevronUp className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={onSearchNext}>
                <ChevronDown className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={onClearSearch}>
                <X className="size-4" />
              </Button>
            </>
          )}
        </div>
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
            <Button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onHighlight}
              className="bg-secondary text-primary hover:text-white"
            >
              <Highlighter className="size-5" />
              Highlight
            </Button>
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
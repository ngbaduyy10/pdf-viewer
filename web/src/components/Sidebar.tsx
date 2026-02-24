'use client';

import { useCallback } from 'react';
import { Highlighter, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { HighlightItem } from '@/lib/types';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highlights: HighlightItem[];
  setHighlights: React.Dispatch<React.SetStateAction<HighlightItem[]>>;
}

export default function Sidebar({ open, onOpenChange, highlights, setHighlights }: SidebarProps) {
  const removeHighlight = useCallback((highlightId: string) => {
    document
      .querySelectorAll(`mark[data-highlight-id="${highlightId}"]`)
      .forEach((mark) => {
        const parent = mark.parentNode!;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
        parent.normalize();
      });
    setHighlights((prev) => prev.filter((h) => h.id !== highlightId));

  }, []);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 sm:max-w-80 p-0 gap-0 border-none">
        <SheetHeader className="px-4 pt-4 pb-3">
          <SheetTitle className="flex items-center gap-2">
            <Highlighter className="size-4 text-muted-foreground" />
            <div className="text-sm font-medium">
              Highlights
              {highlights.length > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({highlights.length})
                </span>
              )}
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Search and highlight tools for PDF
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="px-4 py-4">
          {highlights.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Select text in the PDF and click Highlight to add.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {highlights.map((h) => (
                <div
                  key={h.id}
                  className="group flex-between gap-2 rounded-md border border-border p-2 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-muted-foreground">
                      Page {h.pageNumber}
                    </span>
                    <p className="mt-0.5 line-clamp-2 break-words">{h.text}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeHighlight(h.id)}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import { useState } from 'react';
import { Search, Highlighter, ChevronUp, ChevronDown, X, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { HighlightItem } from '@/lib/types';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highlights: HighlightItem[];
  onRemoveHighlight: (id: string) => void;
}

export default function Sidebar({ open, onOpenChange, highlights, onRemoveHighlight }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

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

        {/* <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Search in PDF</h3>
          </div>
          <div className="flex items-center gap-1">
            <Input
              placeholder="Search text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                0 results found
              </span>
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="size-7">
                  <ChevronUp className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7">
                  <ChevronDown className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator /> */}

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
                  className="group flex items-start gap-2 rounded-md border border-border p-2 text-xs"
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
                    className="size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemoveHighlight(h.id)}
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

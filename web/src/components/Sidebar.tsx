'use client';

import { useState } from 'react';
import { Search, Highlighter, ChevronUp, ChevronDown, X } from 'lucide-react';
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

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function Sidebar({ open, onOpenChange }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 sm:max-w-80 p-0 gap-0 border-none">
        <SheetHeader className="px-4 pt-4 pb-3">
          <SheetTitle>Tools</SheetTitle>
          <SheetDescription className="sr-only">
            Search and highlight tools for PDF
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="px-4 py-4">
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

        <Separator />

        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Highlighter className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Highlight</h3>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

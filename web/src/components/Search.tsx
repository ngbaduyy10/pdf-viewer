'use client';

import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useCallback, useEffect, useRef, useState } from "react";


export default function Search() {
  const [searchText, setSearchText] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const searchMatchesRef = useRef<HTMLElement[]>([]);

  const clearSearchHighlights = useCallback(() => {
    document.querySelectorAll('mark.pdf-search-highlight').forEach((mark) => {
      const parent = mark.parentNode!;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
      parent.normalize();
    });
    searchMatchesRef.current = [];
    setTotalMatches(0);
    setCurrentMatchIndex(0);
  }, []);

  const performSearch = useCallback((text: string) => {
    clearSearchHighlights();
    if (!text.trim()) return;

    const docEl = document.querySelector('.react-pdf__Document');
    if (!docEl) return;

    const matches: HTMLElement[] = [];
    const lowerText = text.toLowerCase();

    const textLayers = docEl.querySelectorAll('.react-pdf__Page__textContent');
    const allTextNodes: Text[] = [];
    textLayers.forEach((layer) => {
      const walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        allTextNodes.push(walker.currentNode as Text);
      }
    });

    for (const textNode of allTextNodes) {
      const nodeText = textNode.nodeValue || '';
      const lowerNodeText = nodeText.toLowerCase();

      const positions: number[] = [];
      let searchFrom = 0;
      while (true) {
        const idx = lowerNodeText.indexOf(lowerText, searchFrom);
        if (idx === -1) break;
        positions.push(idx);
        searchFrom = idx + lowerText.length;
      }
      if (positions.length === 0) continue;

      let remaining = textNode;
      for (let i = positions.length - 1; i >= 0; i--) {
        const pos = positions[i];
        const end = pos + lowerText.length;

        if (end < remaining.length) remaining.splitText(end);
        const matchNode = pos > 0 ? remaining.splitText(pos) : remaining;

        const mark = document.createElement('mark');
        mark.className = 'pdf-search-highlight';
        matchNode.parentNode!.insertBefore(mark, matchNode);
        mark.appendChild(matchNode);
        matches.unshift(mark);
      }
    }

    searchMatchesRef.current = matches;
    setTotalMatches(matches.length);

    if (matches.length > 0) {
      setCurrentMatchIndex(0);
      matches[0].classList.add('current');
      matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [clearSearchHighlights]);

  useEffect(() => {
    const timer = setTimeout(() => performSearch(searchText), 300);
    return () => clearTimeout(timer);
  }, [searchText, performSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    clearSearchHighlights();
  }, [clearSearchHighlights]);
  
  const navigateSearch = useCallback((direction: 'next' | 'prev') => {
    const matches = searchMatchesRef.current;
    if (matches.length === 0) return;

    setCurrentMatchIndex((prev) => {
      matches[prev]?.classList.remove('current');
      const next = direction === 'next'
        ? (prev + 1) % matches.length
        : (prev - 1 + matches.length) % matches.length;
      matches[next]?.classList.add('current');
      matches[next]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return next;
    });
  }, []);
  
  return (
    <div className="flex items-center gap-1">
      <Input
        type="text"
        placeholder="Search text..."
        className="w-50"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.shiftKey ? navigateSearch('prev') : navigateSearch('next');
          }
          if (e.key === 'Escape') {
            handleClearSearch();
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
      {searchText && (
        <>
          <span className="text-xs text-muted-foreground whitespace-nowrap min-w-10 text-center">
            {totalMatches > 0 ? `${currentMatchIndex + 1}/${totalMatches}` : 'No results'}
          </span>
          <Button variant="ghost" size="icon" className="size-5 shrink-0" onClick={() => navigateSearch('prev')}>
            <ChevronUp className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-5 shrink-0" onClick={() => navigateSearch('next')}>
            <ChevronDown className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-5 shrink-0" onClick={handleClearSearch}>
            <X className="size-4" />
          </Button>
        </>
      )}
    </div>
  );
}
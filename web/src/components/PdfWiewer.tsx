'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { HighlightItem } from '@/lib/types';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function highlightRange(range: Range, highlightId: string) {
  const startContainer = range.startContainer;
  const endContainer = range.endContainer;

  if (
    startContainer === endContainer &&
    startContainer.nodeType === Node.TEXT_NODE
  ) {
    const textNode = startContainer as Text;
    if (range.endOffset < textNode.length) textNode.splitText(range.endOffset);
    const target =
      range.startOffset > 0 ? textNode.splitText(range.startOffset) : textNode;
    const mark = document.createElement('mark');
    mark.className = 'pdf-highlight';
    mark.dataset.highlightId = highlightId;
    target.parentNode!.insertBefore(mark, target);
    mark.appendChild(target);
    return;
  }

  const root =
    range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentElement!
      : (range.commonAncestorContainer as Element);

  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let inRange = false;
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (node === startContainer) inRange = true;
    if (inRange) textNodes.push(node);
    if (node === endContainer) break;
  }

  for (let i = textNodes.length - 1; i >= 0; i--) {
    const textNode = textNodes[i];
    const start = textNode === startContainer ? range.startOffset : 0;
    const end = textNode === endContainer ? range.endOffset : textNode.length;
    if (start >= end) continue;

    if (end < textNode.length) textNode.splitText(end);
    const target = start > 0 ? textNode.splitText(start) : textNode;
    const mark = document.createElement('mark');
    mark.className = 'pdf-highlight';
    mark.dataset.highlightId = highlightId;
    target.parentNode!.insertBefore(mark, target);
    mark.appendChild(target);
  }
}

export default function PdfViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());
  const searchMatchesRef = useRef<HTMLElement[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setNumPages(0);
    }
  };

  const handleHighlight = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const ancestor = range.commonAncestorContainer;
    const ancestorEl =
      ancestor instanceof Element ? ancestor : ancestor.parentElement;
    if (!ancestorEl?.closest('.react-pdf__Document')) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    const pageDiv = ancestorEl.closest('[data-page]');
    const pageNumber = pageDiv
      ? Number(pageDiv.getAttribute('data-page'))
      : 0;

    const id = crypto.randomUUID();
    highlightRange(range, id);
    selection.removeAllRanges();

    setHighlights((prev) => [...prev, { id, text: selectedText, pageNumber }]);
  }, []);

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

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    clearSearchHighlights();
  }, [clearSearchHighlights]);

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

  const pageRef = useCallback((node: HTMLDivElement | null, pageNumber: number) => {
    if (!node) return;

    pageElementsRef.current.set(pageNumber, node);

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible.length > 0) {
            const page = Number(visible[0].target.getAttribute('data-page'));
            if (page) {
              setCurrentPage(page);
              setPageInput(String(page));
            }
          }
        },
        { threshold: 0.5 },
      );
    }

    node.setAttribute('data-page', String(pageNumber));
    observerRef.current.observe(node);
  }, []);

  return (
    <>
      <Header
        file={file}
        fileInputRef={fileInputRef}
        currentPage={currentPage}
        numPages={numPages}
        pageInput={pageInput}
        setPageInput={setPageInput}
        handlePageInputKeyDown={handlePageInputKeyDown}
        handleFileChange={handleFileChange}
        onToggleSidebar={() => setSidebarOpen(true)}
        onHighlight={handleHighlight}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        onSearchNext={() => navigateSearch('next')}
        onSearchPrev={() => navigateSearch('prev')}
        onClearSearch={handleClearSearch}
        totalMatches={totalMatches}
        currentMatchIndex={currentMatchIndex}
      />
      
      <Sidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        highlights={highlights}
        onRemoveHighlight={removeHighlight}
      />
      
      <main className="flex-1 overflow-auto bg-gray-100">
        {!file ? (
          <div className="flex-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground text-lg mb-4">
                No PDF selected
              </p>
            </div>
          </div>
        ) : (
          <div className="py-6 flex-center">
            <Document
              file={file}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={
                <div className="flex-center p-12 text-muted-foreground">
                  Loading PDF...
                </div>
              }
              error={
                <div className="flex-center p-12 text-destructive">
                  Failed to load PDF.
                </div>
              }
            >
              {Array.from({ length: numPages }, (_, i) => (
                <div key={i + 1} ref={(node) => pageRef(node, i + 1)}>
                  <Page
                    pageNumber={i + 1}
                    className="mx-auto mb-4 shadow-lg"
                    width={600}
                  />
                </div>
              ))}
            </Document>
          </div>
        )}
      </main>
    </>
  );
}
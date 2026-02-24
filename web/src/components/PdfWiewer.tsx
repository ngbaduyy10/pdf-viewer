'use client';

import { useState, useRef } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Preview from './Preview';
import { HighlightItem } from '@/lib/types';

export default function PdfViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const pageElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());

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
    <>
      <Header
        file={file}
        currentPage={currentPage}
        numPages={numPages}
        pageInput={pageInput}
        setPageInput={setPageInput}
        handlePageInputKeyDown={handlePageInputKeyDown}
        handleFileChange={handleFileChange}
        setHighlights={setHighlights}
        onToggleSidebar={() => setSidebarOpen(true)}
      />
      
      <Preview
        file={file}
        numPages={numPages}
        setNumPages={setNumPages}
        setCurrentPage={setCurrentPage}
        setPageInput={setPageInput}
        pageElementsRef={pageElementsRef}
      />

      <Sidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        highlights={highlights}
        setHighlights={setHighlights}
      />
    </>
  );
}
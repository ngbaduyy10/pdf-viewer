'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { HighlightItem } from '@/lib/types';

const Preview = dynamic(() => import('@/components/Preview'), {
  ssr: false,
});

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const pageElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());

  return (
    <div className="flex flex-col h-screen">
      <Header
        file={file}
        setFile={setFile}
        currentPage={currentPage}
        numPages={numPages}
        setNumPages={setNumPages}
        pageInput={pageInput}
        setPageInput={setPageInput}
        pageElementsRef={pageElementsRef}
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
    </div>
  );
}

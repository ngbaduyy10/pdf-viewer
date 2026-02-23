'use client';

import { useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PdfViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
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
      />
      
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
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
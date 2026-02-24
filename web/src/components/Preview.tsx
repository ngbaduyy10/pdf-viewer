import { Document, Page, pdfjs } from "react-pdf";
import { useRef, useCallback } from "react";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PreviewProps {
  file: File | null;
  numPages: number;
  setNumPages: (numPages: number) => void;
  setCurrentPage: (page: number) => void;
  setPageInput: (page: string) => void;
  pageElementsRef: React.RefObject<Map<number, HTMLDivElement>>;
}

export default function Preview({ file, numPages, setNumPages, setCurrentPage, setPageInput, pageElementsRef }: PreviewProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

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
  );
}
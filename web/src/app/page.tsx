'use client';

import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/PdfWiewer"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <PdfViewer />
    </div>
);
}

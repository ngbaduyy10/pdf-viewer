import { Highlighter } from "lucide-react";
import { Button } from "./ui/button";
import { useCallback } from "react";
import { HighlightItem } from "@/lib/types";

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

interface HighlightProps {
  setHighlights: React.Dispatch<React.SetStateAction<HighlightItem[]>>;
}

export default function Highlight({ setHighlights }: HighlightProps) {
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
  }, [setHighlights]);

  return (
    <Button
      onMouseDown={(e) => e.preventDefault()}
      onClick={handleHighlight}
      className="bg-secondary text-primary hover:text-white"
    >
      <Highlighter className="size-5" />
      Highlight
    </Button>
  );
}
# 📄 PDF Viewer

A web-based PDF reader with core features: document viewing, manual highlighting, and in-document text search.

## ✨ Main Features

- **View PDF**: upload a PDF file and render pages using `react-pdf`.
- **Highlight**: select text and click `Highlight` to mark it and store it in the sidebar list.
- **Search**: find text (case-insensitive), highlight all matches, and navigate with `next/prev`.

## 🚀 Run the Project

### 📥 1) Clone from Git

```bash
git clone <repo-url>
cd pdf-viewer
```

### 💻 2) Run Frontend

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## 🧠 Search & Match Rendering (Short Explanation)

### 🔎 (a) How related results are computed

In the current implementation, "related results" means **all matches for the current query**:

- The query is normalized to lowercase.
- The frontend scans all text nodes inside PDF text layers (`.react-pdf__Page__textContent`).
- For each node, it repeatedly uses `indexOf` to find every occurrence.
- Each occurrence becomes one result and is collected into the `matches` list.
- `totalMatches` stores the count, and `currentMatchIndex` tracks the focused result.

### 🎯 (b) How the FE locates and renders matched areas

The frontend does not draw highlights on the PDF canvas. Instead, it edits the rendered text-layer DOM:

- Start from `.react-pdf__Document` and collect text layers for all pages.
- Use `TreeWalker` to iterate through text nodes.
- When a match is found, use `splitText` at the start/end offsets.
- Wrap the matched segment with `<mark class="pdf-search-highlight">...</mark>`.
- Add `.current` to the active match and bring it into view with `scrollIntoView`.

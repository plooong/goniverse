# GON (Good Or Not) Comic-Style Knowledge Library

## Role
You are a pragmatic frontend engineer and visual designer building a static GitHub Pages site.

## Task
Build a polished, comic-style personal knowledge library called **GON (Good Or Not)**. The site must let public visitors browse a registry of markdown knowledge files and read each file in a dedicated book reader page.

## Context
- The repository is intended to be public and deployed with GitHub Pages from the repository root.
- Existing knowledge files live in `knowledge/` and must not be renamed, moved, or modified.
- Each knowledge entry is a markdown file rendered directly in the browser.
- The initial subject area is IT knowledge: DevOps, Cloud, Software Engineering, SRE, Platform Engineering, and Architecture.
- The visual direction is a comic-style interface inspired by the Google Kubernetes comic: bold outlines, panels, speech bubbles, playful accents, and readable documentation layouts.

## Required File Structure
Create or update the site using this structure:

```text
website/
├── index.html
├── book.html
├── css/
│   └── comic.css
├── js/
│   └── app.js
├── assets/
│   └── mascot.svg
└── knowledge/
    ├── assets/
    │   └── {book-slug}/
    │       └── images referenced by that book's markdown
    └── {book-slug}-knowledge.md
```

## Hard Constraints
- Use only plain HTML, CSS, and JavaScript.
- Do not add build tools, frameworks, bundlers, package managers, static site generators, or external markdown libraries.
- Render markdown in-browser with a custom JavaScript parser.
- Generate the book list from a `BOOKS` registry array in `js/app.js`.
- Keep the `knowledge/` folder untouched except for reading existing files.
- Use browser APIs that work on GitHub Pages.
- Do not rely on `file://` behavior; local testing must use an HTTP server because markdown is loaded with `fetch()`.
- Keep the site responsive across desktop, tablet, and mobile.
- Add a dark mode toggle with `localStorage` persistence.
- Treat markdown file contents as untrusted content for rendering purposes. Do not execute scripts from markdown.

## Existing Books
Add these entries to the `BOOKS` array:

```js
const BOOKS = [
  {
    slug: 'certified-kubernetes-administrator-cka-study-guide',
    title: 'CKA Study Guide',
    tags: ['Kubernetes', 'DevOps', 'CKA']
  },
  {
    slug: 'aws-for-solutions-architects-the-definitive-guide-to-aws-solutions-architecture',
    title: 'AWS for Solutions Architects',
    tags: ['AWS', 'Cloud', 'Architecture']
  },
  {
    slug: 'the-principles-of-beautiful-web-design',
    title: 'The Principles of Beautiful Web Design, 4th Edition',
    tags: ['Website', 'Frontend', 'Design']
  }
];
```

Slug contract:

```text
BOOKS[n].slug -> knowledge/{slug}-knowledge.md
```

Markdown image contract:

```text
Markdown source path: assets/{book-slug}/image.png
Resolved browser path: knowledge/assets/{book-slug}/image.png
```

## Page Requirements

### `index.html` - Library Homepage
Build the first screen as the usable library homepage, not a marketing landing page.

Required elements:
- Header with `assets/mascot.svg`, the title `GON`, and a speech bubble:
  `Welcome to my Knowledge Vault! Good Or Not - you decide.`
- Dark mode toggle in the header.
- Responsive book grid generated from the `BOOKS` registry.
- Each book card must show title, tags, and a clear action to open the reader.
- Book links must route to `book.html?slug={slug}`.
- Include empty/error states for missing or malformed registry data.

### `book.html` - Book Reader
Build a reader optimized for long technical markdown.

Required elements:
- Same header and dark mode behavior as the homepage.
- Sticky table-of-contents sidebar generated from H2 headings.
- Rendered markdown content in the main reading area.
- Mobile layout where the TOC remains usable without covering the content.
- Loading, not-found, and fetch-error states.
- A clear way to return to the library homepage.

Markdown styling:
- `h2`: comic panel titles with accent border and light background.
- Tables: responsive wrappers, strong borders, and primary-colored headers.
- Images: resolved path, comic frame, border, and shadow.
- Code blocks: terminal-style dark background with yellow text.
- Blockquotes: speech-bubble style.
- Inline code: subtle highlighted background.
- Links: visually distinct, keyboard accessible, and readable in both themes.

## Markdown Parser Requirements
Implement a compact parser in `js/app.js` that supports at minimum:
- H1, H2, H3 headings.
- Paragraphs.
- Bold and italic text.
- Inline code.
- Fenced code blocks.
- Blockquotes.
- Ordered and unordered lists.
- Markdown links.
- Markdown images with the required path rewriting.
- Tables with header rows.

Parser safety:
- Escape raw HTML from markdown by default.
- Do not inject unsanitized markdown directly with `innerHTML`.
- Only generate the controlled HTML elements needed for supported markdown features.
- If a markdown feature is unsupported, render it as readable plain text instead of failing.

## Design Direction
- Use comic-style panels, borders, shadows, captions, and speech bubbles while keeping the reader comfortable for dense technical content.
- The interface should feel playful but still useful for repeated reading and reference.
- Avoid oversized hero sections, decorative-only cards, and text that explains how to use the UI.
- Use stable responsive dimensions so cards, buttons, headers, and TOC items do not shift awkwardly.
- Ensure text never overlaps or overflows its controls on common mobile and desktop widths.
- Make both light and dark themes complete, not just inverted colors.

## Implementation Notes
- Centralize the `BOOKS` array and shared helpers in `js/app.js`.
- Use query parameters to identify the selected book:

```text
book.html?slug={slug}
```

- Use semantic HTML landmarks where practical.
- Use accessible labels for icon-only controls.
- Persist theme using `localStorage`.
- Prefer small, readable functions over one large script.
- Keep comments sparse and useful.

## Local Testing
The site must be tested through an HTTP server:

```bash
python3 -m http.server 3000
```

Then visit:

```text
http://127.0.0.1:3000
```

Opening `index.html` directly with `file://` is expected to fail for markdown loading because of `fetch()` restrictions. This is acceptable and should not be treated as a bug.

## Acceptance Criteria
- `index.html` loads over `http://127.0.0.1:3000` and displays all current books.
- Every book card links to `book.html?slug={slug}`.
- `book.html` fetches and renders `knowledge/{slug}-knowledge.md`.
- Images referenced as `assets/{book-slug}/...` render from `knowledge/assets/{book-slug}/...`.
- The generated TOC includes H2 headings and scrolls to the correct sections.
- Dark mode persists after refresh and works on both pages.
- The layout is usable at mobile and desktop widths.
- Missing slug, unknown slug, and failed fetch states are handled gracefully.
- Raw HTML or script-like markdown content is escaped rather than executed.
- No external runtime dependencies are introduced.

## Final Response Expected From The Implementer
After implementation, report:
- Files changed.
- How to run locally.
- What validation was performed.
- Any known limitations or follow-up work.

# GONiverse

Good Or Not - up to you.

GONiverse is a comic-style static knowledge library for personal technical notes. It publishes markdown knowledge files as a browsable website with a homepage, book cards, a markdown reader, generated table of contents, responsive layout, and dark mode.

## Features

- Plain HTML, CSS, and JavaScript
- No build tools, frameworks, or static site generator
- GitHub Pages friendly
- Comic-inspired visual style
- Animated dragon mascot
- Light/dark mode with `localStorage` persistence
- Searchable book grid
- In-browser markdown rendering
- H2-based table of contents in the reader
- Styled markdown tables, code blocks, images, blockquotes, and inline code
- Responsive layout for desktop, tablet, and mobile

## Project Structure

```text
.
├── index.html
├── book.html
├── css/
│   └── comic.css
├── js/
│   └── app.js
├── assets/
│   └── mascot-animated.svg
└── knowledge/
    ├── assets/
    ├── aws-for-solutions-architects-the-definitive-guide-to-aws-solutions-architecture-knowledge.md
    ├── certified-kubernetes-administrator-cka-study-guide-knowledge.md
    └── the-principles-of-beautiful-web-design-knowledge.md
```

## Local Development

The reader loads markdown files with `fetch()`, so open the site through a local HTTP server instead of `file://`.

```bash
python3 -m http.server 3000
```

Then open:

```text
http://127.0.0.1:3000
```

## Adding A New Book

1. Add the markdown file:

```text
knowledge/{slug}-knowledge.md
```

2. Put referenced images under:

```text
knowledge/assets/{slug}-knowledge/
```

3. Register the book in `js/app.js`:

```js
{
  slug: "book-file-name-without-knowledge-md",
  title: "Display Title",
  description: "Short description shown on the homepage.",
  tags: ["Tag1", "Tag2"],
}
```

The slug must match the markdown filename without the `-knowledge.md` suffix.

For example:

```text
knowledge/certified-kubernetes-administrator-cka-study-guide-knowledge.md
```

uses:

```js
slug: "certified-kubernetes-administrator-cka-study-guide"
```

## Markdown Image Paths

Markdown files can reference images like this:

```md
![Diagram](assets/book-slug-knowledge/image.png)
```

The site rewrites `assets/...` paths to `knowledge/assets/...` when rendering the markdown.

## Deploying To GitHub Pages

1. Push this folder to a public GitHub repository.
2. Open the repository on GitHub.
3. Go to **Settings** -> **Pages**.
4. Set **Source** to **Deploy from a branch**.
5. Select:
   - Branch: `main`
   - Folder: `/ (root)`
6. Save.

The site will be available at:

```text
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/
```

## Notes

- Keep `index.html` in the repository root when publishing from `/ (root)`.
- This project intentionally avoids external markdown libraries.
- Large knowledge files and diagrams are rendered client-side in the browser.
- Add `.nojekyll` if GitHub Pages ever processes files unexpectedly.

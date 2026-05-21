const BOOKS = [
  {
    slug: "certified-kubernetes-administrator-cka-study-guide",
    title: "CKA Study Guide",
    description: "Kubernetes administration, cluster operations, scheduling, storage, networking, and exam practice.",
    tags: ["Kubernetes", "CKA"],
  },
  {
    slug: "certified-kubernetes-security-specialist-cks-study-guide",
    title: "CKS Study Guide",
    description: "Kubernetes security, cluster hardening, workload isolation, supply chain defense, runtime detection, and exam practice.",
    tags: ["Kubernetes", "Security", "CKS"],
  },
  {
    slug: "aws-for-solutions-architects-the-definitive-guide-to-aws-solutions-architecture",
    title: "AWS for Solutions Architects",
    description: "Architecture decisions across AWS compute, networking, storage, security, CloudOps, and data systems.",
    tags: ["AWS",  "Architecture", "Solutions"],
  },
  {
    slug: "system-design-on-aws-building-and-scaling-enterprise-solutions",
    title: "System Design on AWS",
    description: "System design tradeoffs, AWS service selection, Day 0 to Day N scaling, and enterprise architecture playbooks.",
    tags: ["AWS", "Architecture", "System Design"],
  },
  {
    slug: "the-devops-handbook",
    title: "The DevOps Handbook",
    description: "DevOps mental models, flow, feedback, continual learning, delivery pipelines, telemetry, security, and compliance.",
    tags: ["DevOps", "SRE", "Delivery"],
  },
  {
    slug: "the-principles-of-beautiful-web-design",
    title: "The Principles of Beautiful Web Design",
    description: "Source-grounded design notes on layout, color, typography, texture, imagery, and responsive web interfaces.",
    tags: ["Web Design", "Frontend"],
  },
];

const state = {
  headings: [],
};

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setFooterYear();

  if (document.body.dataset.page === "home") {
    initHome();
  }

  if (document.body.dataset.page === "book") {
    initReader();
  }
});

function initTheme() {
  const storedTheme = localStorage.getItem("gon-theme");
  const theme = storedTheme || "light";
  document.documentElement.dataset.theme = theme;
  updateThemeButtons(theme);

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem("gon-theme", nextTheme);
      updateThemeButtons(nextTheme);
    });
  });
}

function updateThemeButtons(theme) {
  document.querySelectorAll("[data-theme-icon]").forEach((icon) => {
    icon.textContent = theme === "dark" ? "Sun" : "Moon";
  });
}

function setFooterYear() {
  const year = document.getElementById("footer-year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

function initHome() {
  const grid = document.getElementById("book-grid");
  const search = document.getElementById("book-search");
  const stats = document.getElementById("library-stats");

  const render = () => {
    const query = search.value.trim().toLowerCase();
    const books = BOOKS.filter((book) => {
      const haystack = [book.title, book.description, ...book.tags].join(" ").toLowerCase();
      return haystack.includes(query);
    });

    stats.innerHTML = `
      <span>${books.length} shown</span>
      <span>${BOOKS.length} total</span>
      <span>${uniqueTags(BOOKS).length} tags</span>
    `;
    grid.innerHTML = books.map(renderBookCard).join("");

    if (!books.length) {
      grid.innerHTML = `<div class="empty-panel">No matching knowledge issues yet.</div>`;
    }
  };

  search.addEventListener("input", render);
  render();
}

function renderBookCard(book, index) {
  const tagHtml = book.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  return `
    <a class="book-card" href="book.html?book=${encodeURIComponent(book.slug)}">
      <span class="book-card__number">NSFW ${String(index + 1).padStart(2, "0")}</span>
      <h3>${escapeHtml(book.title)}</h3>
      <p>${escapeHtml(book.description)}</p>
      <span class="tag-row">${tagHtml}</span>
      <span class="book-card__cta">Open knowledge file</span>
    </a>
  `;
}

function uniqueTags(books) {
  return [...new Set(books.flatMap((book) => book.tags))];
}

function initReader() {
  const select = document.getElementById("book-select");
  const params = new URLSearchParams(window.location.search);
  const requestedSlug = params.get("book");
  const selectedBook = BOOKS.find((book) => book.slug === requestedSlug) || BOOKS[0];

  select.innerHTML = BOOKS.map(
    (book) => `<option value="${escapeHtml(book.slug)}">${escapeHtml(book.title)}</option>`
  ).join("");
  select.value = selectedBook.slug;
  select.addEventListener("change", () => {
    window.location.href = `book.html?book=${encodeURIComponent(select.value)}`;
  });

  loadBook(selectedBook);
}

async function loadBook(book) {
  const title = document.getElementById("book-title");
  const tags = document.getElementById("book-tags");
  const content = document.getElementById("markdown-content");
  const loading = document.getElementById("loading-panel");

  document.title = `${book.title} - GON Reader`;
  title.textContent = book.title;
  tags.innerHTML = book.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  loading.hidden = false;
  content.innerHTML = "";

  try {
    const response = await fetch(`knowledge/${book.slug}-knowledge.md`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const markdown = await response.text();
    const rendered = renderMarkdown(markdown);
    content.innerHTML = rendered;
    renderToc();
  } catch (error) {
    content.innerHTML = `
      <div class="empty-panel">
        <h2>Knowledge file could not be loaded</h2>
        <p>Run a local HTTP server before testing this site, then open <code>http://127.0.0.1:3000</code>.</p>
        <p class="muted">Error: ${escapeHtml(error.message)}</p>
      </div>
    `;
    document.getElementById("toc").innerHTML = "";
  } finally {
    loading.hidden = true;
  }
}

function renderToc() {
  const toc = document.getElementById("toc");

  if (!state.headings.length) {
    toc.innerHTML = `<p class="muted">No H2 panels found.</p>`;
    return;
  }

  toc.innerHTML = state.headings
    .map((heading) => `<a href="#${heading.id}">${escapeHtml(heading.text)}</a>`)
    .join("");
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  const usedIds = new Map();
  state.headings = [];

  let index = 0;
  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```([A-Za-z0-9_-]+)?\s*$/);
    if (fence) {
      const language = fence[1] || "text";
      const code = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(`<pre><code data-language="${escapeHtml(language)}">${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    if (isTableStart(lines, index)) {
      const tableLines = [];
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        tableLines.push(lines[index]);
        index += 1;
      }
      blocks.push(renderTable(tableLines));
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = stripInlineMarkdown(heading[2]);
      const id = uniqueId(slugify(text), usedIds);

      if (level === 2) {
        state.headings.push({ id, text });
      }

      blocks.push(
        `<h${level} id="${id}" class="${level === 2 ? "panel-title" : ""}">${formatInline(heading[2])}</h${level}>`
      );
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quotes = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quotes.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(`<blockquote>${formatParagraphs(quotes)}</blockquote>`);
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*+]\s+/, ""));
        index += 1;
      }
      blocks.push(`<ul>${items.map((item) => `<li>${formatInline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(`<ol>${items.map((item) => `<li>${formatInline(item)}</li>`).join("")}</ol>`);
      continue;
    }

    const paragraph = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^```/.test(lines[index]) &&
      !/^(#{1,6})\s+/.test(lines[index]) &&
      !/^>\s?/.test(lines[index]) &&
      !/^\s*[-*+]\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index]) &&
      !isTableStart(lines, index)
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(`<p>${formatInline(paragraph.join(" "))}</p>`);
  }

  return blocks.join("\n");
}

function isTableStart(lines, index) {
  return Boolean(
    lines[index] &&
      lines[index].includes("|") &&
      lines[index + 1] &&
      /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1])
  );
}

function renderTable(tableLines) {
  const rows = tableLines.map((row) =>
    row
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim())
  );
  const header = rows[0] || [];
  const body = rows.slice(2);

  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${header.map((cell) => `<th>${formatInline(cell)}</th>`).join("")}</tr></thead>
        <tbody>
          ${body
            .map(
              (row) =>
                `<tr>${row
                  .map((cell, cellIndex) => {
                    const label = header[cellIndex] || `Column ${cellIndex + 1}`;
                    return `<td data-label="${escapeHtml(stripInlineMarkdown(label))}">${formatInline(cell)}</td>`;
                  })
                  .join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function formatParagraphs(lines) {
  return lines
    .join("\n")
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${formatInline(paragraph.replace(/\n/g, " "))}</p>`)
    .join("");
}

function formatInline(text) {
  let html = escapeHtml(text);

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
    return `<img src="${escapeHtml(resolveAssetPath(src))}" alt="${escapeHtml(alt)}" loading="lazy" />`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${label}</a>`;
  });
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  return html;
}

function resolveAssetPath(src) {
  const cleanSrc = src.trim().replace(/^\.\//, "");
  if (/^(https?:|data:|#|\/)/.test(cleanSrc)) {
    return cleanSrc;
  }
  if (cleanSrc.startsWith("knowledge/")) {
    return cleanSrc;
  }
  if (cleanSrc.startsWith("assets/")) {
    return `knowledge/${cleanSrc}`;
  }
  return cleanSrc;
}

function stripInlineMarkdown(text) {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/[`*_]/g, "")
    .trim();
}

function uniqueId(base, usedIds) {
  const fallback = base || "section";
  const count = usedIds.get(fallback) || 0;
  usedIds.set(fallback, count + 1);
  return count ? `${fallback}-${count + 1}` : fallback;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

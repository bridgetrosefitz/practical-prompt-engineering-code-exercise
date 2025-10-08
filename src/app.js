// Prompt Library App
// Storage keys
const STORAGE_KEY = "promptLibrary.v1";

// Utilities
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function readPrompts() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function writePrompts(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function createId() {
  return (
    "p_" +
    Math.random().toString(36).slice(2, 7) +
    Date.now().toString(36).slice(-4)
  );
}

function truncateWords(text, limit = 16) {
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text.trim();
  return words.slice(0, limit).join(" ") + "…";
}

// Ratings
function setRating(promptId, value) {
  const list = readPrompts();
  const idx = list.findIndex(p => p.id === promptId);
  if (idx === -1) return;
  const next = Math.min(5, Math.max(0, Number(value) || 0));
  list[idx].rating = next;
  writePrompts(list);
  renderPrompts();
}

function renderStars(rating) {
  const r = Math.min(5, Math.max(0, Number(rating) || 0));
  return Array.from({ length: 5 }, (_, i) => {
    const val = i + 1;
    const filled = val <= r;
    return `
      <button
        type="button"
        class="star"
        data-star="${val}"
        aria-label="Rate ${val} star${val > 1 ? 's' : ''}"
        aria-pressed="${filled}"
        ${filled ? 'data-filled="true"' : ''}
      >${filled ? '★' : '☆'}</button>`;
  }).join("");
}

function renderPrompts() {
  const list = readPrompts();
  const container = $("#prompts-list");
  const empty = $("#empty-state");
  container.innerHTML = "";

  if (list.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  for (const p of list) {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.id = p.id;

    const h3 = document.createElement("h3");
    h3.className = "card-title";
    h3.textContent = p.title || "Untitled";

    const preview = document.createElement("p");
    preview.className = "card-preview";
    preview.textContent = truncateWords(p.content || "", 22) || "No content";

    // Rating UI
    const ratingWrap = document.createElement("div");
    ratingWrap.className = "rating";
    ratingWrap.setAttribute("role", "radiogroup");
    ratingWrap.setAttribute("aria-label", "Rate prompt effectiveness");
    ratingWrap.innerHTML = renderStars(p.rating || 0);

    const del = document.createElement("button");
    del.className = "btn-danger";
    del.type = "button";
    del.textContent = "Delete";
    del.addEventListener("click", () => deletePrompt(p.id));

    const footer = document.createElement("div");
    footer.className = "card-footer";
    footer.appendChild(del);

    // Rating interactions
    ratingWrap.addEventListener("click", e => {
      const btn = e.target.closest("button.star");
      if (!btn) return;
      const val = Number(btn.dataset.star);
      const current = (readPrompts().find(x => x.id === p.id)?.rating) || 0;
      // toggle-to-clear when clicking same value
      setRating(p.id, current === val ? 0 : val);
    });
    ratingWrap.addEventListener("keydown", e => {
      const current = (readPrompts().find(x => x.id === p.id)?.rating) || 0;
      if (["ArrowRight", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        setRating(p.id, Math.min(5, current + 1));
      } else if (["ArrowLeft", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        setRating(p.id, Math.max(0, current - 1));
      } else if (/^[1-5]$/.test(e.key)) {
        e.preventDefault();
        setRating(p.id, Number(e.key));
      } else if (e.key === "0" || e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        setRating(p.id, 0);
      }
    });
    ratingWrap.tabIndex = 0;

    card.append(h3, preview, ratingWrap, footer);
    container.append(card);
  }
}

function deletePrompt(id) {
  const list = readPrompts();
  const next = list.filter(p => p.id !== id);
  writePrompts(next);
  renderPrompts();
}

function handleSubmit(e) {
  e.preventDefault();
  const title = $("#title").value.trim();
  const content = $("#content").value.trim();
  if (!title || !content) {
    // simple UX hint
    [$("#title"), $("#content")].forEach(el => {
      if (!el.value.trim()) {
        el.focus();
      }
    });
    return;
  }

  const list = readPrompts();
  const prompt = { id: createId(), title, content, createdAt: Date.now(), rating: 0 };
  list.unshift(prompt); // newest first
  writePrompts(list);
  e.target.reset();
  renderPrompts();
}

function boot() {
  const form = $("#prompt-form");
  form.addEventListener("submit", handleSubmit);
  renderPrompts();
}

document.addEventListener("DOMContentLoaded", boot);

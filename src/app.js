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

    const del = document.createElement("button");
    del.className = "btn-danger";
    del.type = "button";
    del.textContent = "Delete";
    del.addEventListener("click", () => deletePrompt(p.id));

    const footer = document.createElement("div");
    footer.className = "card-footer";
    footer.appendChild(del);

    card.append(h3, preview, footer);
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
  const prompt = { id: createId(), title, content, createdAt: Date.now() };
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

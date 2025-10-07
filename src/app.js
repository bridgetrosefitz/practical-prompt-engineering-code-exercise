(() => {
  const STORAGE_KEY = 'prompt-library.v1';

  /** @typedef {{ id: string; title: string; content: string; createdAt: number }} Prompt */

  // DOM references
  const form = document.getElementById('prompt-form');
  const titleEl = /** @type {HTMLInputElement} */ (document.getElementById('title'));
  const contentEl = /** @type {HTMLTextAreaElement} */ (document.getElementById('content'));
  const listEl = /** @type {HTMLUListElement} */ (document.getElementById('list'));
  const emptyEl = document.getElementById('empty');
  const countEl = document.getElementById('count');

  /** @returns {Prompt[]} */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /** @param {Prompt[]} prompts */
  function save(prompts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    } catch {}
  }

  /** @returns {string} */
  function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  /** @type {Prompt[]} */
  let prompts = load();

  function render() {
    // sort newest first
    const items = [...prompts].sort((a, b) => b.createdAt - a.createdAt);
    listEl.innerHTML = '';

    if (items.length === 0) {
      emptyEl.style.display = 'block';
    } else {
      emptyEl.style.display = 'none';
    }
    countEl.textContent = String(items.length);

    for (const p of items) {
      const li = document.createElement('li');
      li.className = 'card';

      const header = document.createElement('div');
      header.className = 'card-header';

      const h3 = document.createElement('h3');
      h3.className = 'card-title';
      h3.textContent = p.title;

      const actions = document.createElement('div');
      actions.className = 'row';

      const del = document.createElement('button');
      del.className = 'danger';
      del.textContent = 'Delete';
      del.setAttribute('aria-label', `Delete ${p.title}`);
      del.addEventListener('click', () => {
        prompts = prompts.filter((x) => x.id !== p.id);
        save(prompts);
        render();
      });

      actions.appendChild(del);
      header.appendChild(h3);
      header.appendChild(actions);

      const pre = document.createElement('pre');
      pre.className = 'prompt-text';
      pre.textContent = p.content;

      const meta = document.createElement('div');
      meta.className = 'meta';
      const date = new Date(p.createdAt).toLocaleString();
      meta.textContent = date;

      li.appendChild(header);
      li.appendChild(pre);
      li.appendChild(meta);
      listEl.appendChild(li);
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = titleEl.value.trim();
    const content = contentEl.value.trim();
    if (!title || !content) return;

    const prompt = { id: uid(), title, content, createdAt: Date.now() };
    prompts.push(prompt);
    save(prompts);
    form.reset();
    render();
  });

  // initial render
  render();
})();

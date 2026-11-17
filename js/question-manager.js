/**
 * Vragen & Categorieën Platform (QuizStore + Beheer UI)
 * Slaat eigen vragen en categorieën op in localStorage en ondersteunt CSV/JSON import & export.
 */
(() => {
  const LS_CATS_KEY = 'buzz_custom_categories_v1';
  const LS_QUESTIONS_KEY = 'buzz_custom_questions_v1';

  const COLOR_PRESETS = [
    { label: 'Blauw', value: 'from-sky-400 to-blue-600' },
    { label: 'Groen', value: 'from-emerald-400 to-teal-600' },
    { label: 'Paars', value: 'from-fuchsia-500 to-purple-700' },
    { label: 'Rood', value: 'from-rose-400 to-red-600' },
    { label: 'Oranje', value: 'from-amber-400 to-orange-500' },
    { label: 'Indigo', value: 'from-indigo-400 to-violet-600' }
  ];

  class QuizStoreEngine {
    constructor() {
      this.categories = this._load(LS_CATS_KEY, window.BUZZ_CATEGORIES || []);
      this.questions = this._load(LS_QUESTIONS_KEY, window.BUZZ_QUESTIONS || []);
    }

    _load(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // Negeer corrupte localStorage data
      }
      return JSON.parse(JSON.stringify(fallback));
    }

    _save() {
      localStorage.setItem(LS_CATS_KEY, JSON.stringify(this.categories));
      localStorage.setItem(LS_QUESTIONS_KEY, JSON.stringify(this.questions));
      if (typeof window.onQuizStoreUpdated === 'function') {
        window.onQuizStoreUpdated();
      }
    }

    getCategories() {
      return this.categories;
    }

    getQuestions() {
      return this.questions;
    }

    addCategory({ title, subtitle, icon, color }) {
      const slug =
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'custom';
      let id = slug;
      let n = 2;
      while (this.categories.some((c) => c.id === id)) {
        id = `${slug}-${n++}`;
      }
      const cat = {
        id,
        title: title.trim(),
        subtitle: (subtitle || 'Eigen categorie').trim(),
        icon: (icon || '📚').trim(),
        color: color || 'from-indigo-400 to-violet-600'
      };
      this.categories.push(cat);
      this._save();
      return cat;
    }

    deleteCategory(catId) {
      if (catId === 'mix') return;
      this.categories = this.categories.filter((c) => c.id !== catId);
      this.questions = this.questions.filter((q) => q.category !== catId);
      this._save();
    }

    saveQuestion(qObj) {
      if (qObj.id) {
        const idx = this.questions.findIndex((q) => q.id === qObj.id);
        if (idx !== -1) {
          this.questions[idx] = qObj;
          this._save();
          return;
        }
      }
      qObj.id = `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      this.questions.unshift(qObj);
      this._save();
    }

    deleteQuestion(id) {
      this.questions = this.questions.filter((q) => q.id !== id);
      this._save();
    }

    resetDefaults() {
      this.categories = JSON.parse(JSON.stringify(window.BUZZ_CATEGORIES || []));
      this.questions = JSON.parse(JSON.stringify(window.BUZZ_QUESTIONS || []));
      this._save();
    }

    exportJson() {
      return JSON.stringify(
        {
          version: 1,
          exportedAt: new Date().toISOString(),
          categories: this.categories,
          questions: this.questions
        },
        null,
        2
      );
    }

    importJson(jsonText) {
      const data = JSON.parse(jsonText);
      if (!data || !Array.isArray(data.questions)) {
        throw new Error('Ongeldig JSON-bestand: "questions" lijst ontbreekt.');
      }
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        this.categories = data.categories;
      }
      this.questions = data.questions;
      this._save();
      return data.questions.length;
    }

    /**
     * CSV formaat (puntkomma ; of komma , gescheiden):
     * categorie;badge;vraag;optie1;optie2;optie3;optie4;juist(1-4);uitleg
     */
    importCsv(csvText, targetCategoryId) {
      const lines = csvText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      let added = 0;
      lines.forEach((line, idx) => {
        const sep = line.includes(';') ? ';' : ',';
        const cols = line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ''));
        if (cols.length < 7) return;
        // Skip header row
        if (idx === 0 && cols[0].toLowerCase().includes('vraag') || (idx === 0 && cols[2] && cols[2].toLowerCase() === 'vraag')) {
          return;
        }

        // Ondersteun zowel 9 kolommen (met categorie & badge) als 7 kolommen (vraag + 4 opties + juist + uitleg)
        let catId = targetCategoryId || 'algemeen';
        let badge = '📚 Eigen Vraag';
        let question, o1, o2, o3, o4, correctRaw, explanation;

        if (cols.length >= 9) {
          catId = cols[0] || catId;
          badge = cols[1] || badge;
          [question, o1, o2, o3, o4, correctRaw, explanation] = cols.slice(2, 9);
        } else {
          [question, o1, o2, o3, o4, correctRaw, explanation] = cols.slice(0, 7);
        }

        if (!question || !o1 || !o2 || !o3 || !o4) return;
        // Als categorie nog niet bestaat, maak hem automatisch aan
        if (catId !== 'mix' && !this.categories.some((c) => c.id === catId)) {
          this.addCategory({ title: catId, subtitle: 'Geïmporteerde categorie', icon: '📚' });
        }

        const cNum = parseInt(correctRaw, 10);
        const correct = Number.isFinite(cNum) && cNum >= 1 && cNum <= 4 ? cNum - 1 : 0;

        this.questions.unshift({
          id: `csv-${Date.now()}-${idx}`,
          category: catId === 'mix' ? 'algemeen' : catId,
          badge,
          question,
          options: [o1, o2, o3, o4],
          correct,
          explanation: explanation || 'Goed gedaan!'
        });
        added++;
      });

      if (added === 0) {
        throw new Error('Geen geldige vragen gevonden. Controleer of elke regel minimaal 7 velden heeft.');
      }
      this._save();
      return added;
    }
  }

  window.QuizStore = new QuizStoreEngine();

  /* ==================== BEHEER MODAL UI ==================== */
  const modal = document.getElementById('modalQuestionManager');
  const btnOpen = document.getElementById('btnOpenQuestionManager');
  const btnClose = document.getElementById('btnCloseQuestionManager');
  if (!modal || !btnOpen) return;

  const qForm = document.getElementById('qmQuestionForm');
  const qCatSelect = document.getElementById('qmQuestionCategory');
  const qBadgeInput = document.getElementById('qmQuestionBadge');
  const qTextInput = document.getElementById('qmQuestionText');
  const qOptInputs = [0, 1, 2, 3].map((i) => document.getElementById(`qmOpt${i}`));
  const qExplInput = document.getElementById('qmQuestionExpl');
  const qListEl = document.getElementById('qmQuestionList');
  const qFilterSelect = document.getElementById('qmFilterCategory');
  const qCountBadge = document.getElementById('qmTotalCount');

  const catForm = document.getElementById('qmCategoryForm');
  const catTitleInput = document.getElementById('qmCatTitle');
  const catSubInput = document.getElementById('qmCatSub');
  const catIconInput = document.getElementById('qmCatIcon');
  const catColorSelect = document.getElementById('qmCatColor');
  const catChipsEl = document.getElementById('qmCategoryChips');

  const csvTargetSelect = document.getElementById('qmCsvCategory');
  const csvTextarea = document.getElementById('qmCsvInput');
  const btnImportCsv = document.getElementById('btnQmImportCsv');
  const btnDownloadSampleCsv = document.getElementById('btnQmSampleCsv');
  const btnExportJson = document.getElementById('btnQmExportJson');
  const inputImportJson = document.getElementById('inputQmImportJson');
  const btnResetDefaults = document.getElementById('btnQmResetDefaults');
  const statusMsg = document.getElementById('qmStatusMsg');

  const tabBtns = modal.querySelectorAll('[data-qm-tab]');
  const tabPanels = modal.querySelectorAll('[data-qm-panel]');

  function showStatus(msg, isError = false) {
    if (!statusMsg) return;
    statusMsg.textContent = msg;
    statusMsg.className = `text-xs font-bold px-3 py-1.5 rounded-xl ${
      isError ? 'bg-red-500/20 text-red-300 border border-red-400/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
    }`;
    statusMsg.classList.remove('hidden');
    setTimeout(() => statusMsg.classList.add('hidden'), 4500);
  }

  function populateCategorySelects() {
    const cats = window.QuizStore.getCategories().filter((c) => c.id !== 'mix');
    [qCatSelect, csvTargetSelect].forEach((sel) => {
      if (!sel) return;
      const prev = sel.value;
      sel.innerHTML = '';
      cats.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.icon} ${c.title}`;
        sel.appendChild(opt);
      });
      if (prev && cats.some((c) => c.id === prev)) sel.value = prev;
    });

    if (qFilterSelect) {
      const prevF = qFilterSelect.value;
      qFilterSelect.innerHTML = '<option value="all">Alle categorieën</option>';
      cats.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.icon} ${c.title}`;
        qFilterSelect.appendChild(opt);
      });
      if (prevF) qFilterSelect.value = prevF;
    }

    if (catColorSelect && catColorSelect.options.length === 0) {
      COLOR_PRESETS.forEach((cp) => {
        const opt = document.createElement('option');
        opt.value = cp.value;
        opt.textContent = cp.label;
        catColorSelect.appendChild(opt);
      });
    }

    if (catChipsEl) {
      catChipsEl.innerHTML = '';
      cats.forEach((c) => {
        const count = window.QuizStore.getQuestions().filter((q) => q.category === c.id).length;
        const chip = document.createElement('div');
        chip.className = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-white/15 text-xs font-bold';
        chip.innerHTML = `
          <span>${c.icon} ${c.title} <span class="text-amber-300">(${count})</span></span>
          ${
            !['media-1', 'media-2', 'media-3', 'algemeen'].includes(c.id)
              ? `<button type="button" data-del-cat="${c.id}" class="text-rose-400 hover:text-rose-300 cursor-pointer" title="Verwijder categorie">✕</button>`
              : ''
          }
        `;
        catChipsEl.appendChild(chip);
      });
      catChipsEl.querySelectorAll('[data-del-cat]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (confirm('Deze categorie en bijbehorende vragen verwijderen?')) {
            window.QuizStore.deleteCategory(btn.dataset.delCat);
            refreshAll();
          }
        });
      });
    }
  }

  function renderQuestionList() {
    if (!qListEl) return;
    const filter = qFilterSelect ? qFilterSelect.value : 'all';
    const allQ = window.QuizStore.getQuestions();
    if (qCountBadge) qCountBadge.textContent = `${allQ.length} vragen`;

    const filtered = filter === 'all' ? allQ : allQ.filter((q) => q.category === filter);
    qListEl.innerHTML = '';

    if (filtered.length === 0) {
      qListEl.innerHTML = '<div class="text-sm text-slate-400 text-center py-6">Nog geen vragen in deze categorie.</div>';
      return;
    }

    const optColors = ['🔵', '🟠', '🟢', '🟡'];
    filtered.forEach((q) => {
      const item = document.createElement('div');
      item.className = 'p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 flex items-start justify-between gap-3';
      item.innerHTML = `
        <div class="min-w-0 flex-1">
          <div class="text-[11px] font-bold text-amber-300 mb-1">${q.badge || q.category}</div>
          <div class="font-bold text-sm text-white mb-1.5">${q.question}</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-300">
            ${q.options
              .map(
                (opt, i) =>
                  `<div class="${i === q.correct ? 'text-emerald-300 font-bold' : 'opacity-75'}">${optColors[i]} ${opt} ${
                    i === q.correct ? '✓' : ''
                  }</div>`
              )
              .join('')}
          </div>
        </div>
        <button type="button" data-del-q="${q.id}" class="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 text-xs font-bold cursor-pointer shrink-0" title="Verwijder vraag">
          🗑️
        </button>
      `;
      qListEl.appendChild(item);
    });

    qListEl.querySelectorAll('[data-del-q]').forEach((btn) => {
      btn.addEventListener('click', () => {
        window.QuizStore.deleteQuestion(btn.dataset.delQ);
        refreshAll();
        showStatus('Vraag verwijderd.');
      });
    });
  }

  function refreshAll() {
    populateCategorySelects();
    renderQuestionList();
  }

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.qmTab;
      tabBtns.forEach((b) => {
        const active = b.dataset.qmTab === target;
        b.className = `px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
          active ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
        }`;
      });
      tabPanels.forEach((p) => {
        p.classList.toggle('hidden', p.dataset.qmPanel !== target);
      });
    });
  });

  if (qForm) {
    qForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const correctRadio = qForm.querySelector('input[name="qmCorrect"]:checked');
      const correct = correctRadio ? Number(correctRadio.value) : 0;
      const catId = qCatSelect.value;
      const catObj = window.QuizStore.getCategories().find((c) => c.id === catId);

      window.QuizStore.saveQuestion({
        category: catId,
        badge: qBadgeInput.value.trim() || `${catObj ? catObj.icon : '📚'} ${catObj ? catObj.title : 'Eigen'}`,
        question: qTextInput.value.trim(),
        options: qOptInputs.map((inp) => inp.value.trim()),
        correct,
        explanation: qExplInput.value.trim() || 'Goed geredeneerd!'
      });

      qTextInput.value = '';
      qOptInputs.forEach((inp) => (inp.value = ''));
      qExplInput.value = '';
      refreshAll();
      showStatus('✅ Vraag opgeslagen! Hij staat meteen klaar in de quiz.');
    });
  }

  if (catForm) {
    catForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!catTitleInput.value.trim()) return;
      const created = window.QuizStore.addCategory({
        title: catTitleInput.value,
        subtitle: catSubInput.value,
        icon: catIconInput.value || '📚',
        color: catColorSelect.value
      });
      catTitleInput.value = '';
      catSubInput.value = '';
      refreshAll();
      if (qCatSelect) qCatSelect.value = created.id;
      showStatus(`✅ Categorie "${created.title}" toegevoegd!`);
    });
  }

  if (qFilterSelect) {
    qFilterSelect.addEventListener('change', renderQuestionList);
  }

  if (btnImportCsv) {
    btnImportCsv.addEventListener('click', () => {
      try {
        const count = window.QuizStore.importCsv(csvTextarea.value, csvTargetSelect.value);
        csvTextarea.value = '';
        refreshAll();
        showStatus(`✅ ${count} vragen geïmporteerd!`);
      } catch (err) {
        showStatus(err.message, true);
      }
    });
  }

  if (btnDownloadSampleCsv) {
    btnDownloadSampleCsv.addEventListener('click', () => {
      const sample = [
        'categorie;badge;vraag;optie1;optie2;optie3;optie4;juist(1-4);uitleg',
        'algemeen;🌍 Voorbeeld;Hoeveel dagen heeft een schrikkeljaar?;364;365;366;360;3;In een schrikkeljaar heeft februari 29 dagen dus 366 dagen in totaal!',
        'media-2;🚀 Cyberdetective;Wat doe je bij een verdacht linkje?;Meteen klikken;Doorsturen;Niet klikken en checken bij een volwassene;Opslaan;3;Klik nooit op verdachte links.'
      ].join('\n');
      const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'buzz-vragen-voorbeeld.csv';
      a.click();
    });
  }

  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      const blob = new Blob([window.QuizStore.exportJson()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'buzz-mediawijsheid-vragen.json';
      a.click();
    });
  }

  if (inputImportJson) {
    inputImportJson.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const count = window.QuizStore.importJson(text);
        refreshAll();
        showStatus(`✅ ${count} vragen geladen uit JSON-bestand!`);
      } catch (err) {
        showStatus(err.message, true);
      }
      inputImportJson.value = '';
    });
  }

  if (btnResetDefaults) {
    btnResetDefaults.addEventListener('click', () => {
      if (confirm('Weet je zeker dat je wilt terugkeren naar de standaardvragen?')) {
        window.QuizStore.resetDefaults();
        refreshAll();
        showStatus('Standaardvragen en categorieën hersteld.');
      }
    });
  }

  btnOpen.addEventListener('click', () => {
    refreshAll();
    modal.classList.remove('hidden');
  });

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }
})();

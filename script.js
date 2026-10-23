(() => {
  'use strict';

  const STORAGE_KEYS = {
    tasks: 'dearme_tasks',
    moods: 'dearme_moods',
    journals: 'dearme_journals'
  };
  const MOODS = [
    { name: 'Senang', emoji: '😊', icon: 'fa-face-grin-stars' },
    { name: 'Tenang', emoji: '😌', icon: 'fa-face-smile' },
    { name: 'Biasa saja', emoji: '😐', icon: 'fa-face-meh' },
    { name: 'Lelah', emoji: '😮‍💨', icon: 'fa-face-tired' },
    { name: 'Sedih', emoji: '😔', icon: 'fa-face-sad-tear' },
    { name: 'Kewalahan', emoji: '🥺', icon: 'fa-face-dizzy' }
  ];
  const PROMPTS = [
    'Apa satu hal yang ingin kamu lepaskan hari ini?',
    'Hal kecil apa yang membuatmu tersenyum belakangan ini?',
    'Apa yang paling kamu butuhkan dari dirimu sendiri hari ini?',
    'Apa satu hal yang sudah kamu lakukan dengan baik hari ini?',
    'Jika temanmu merasakan hal yang sama, apa yang ingin kamu katakan kepadanya?',
    'Apa yang ingin kamu ingat dari hari ini?'
  ];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const safeRead = (key) => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const state = {
    tasks: safeRead(STORAGE_KEYS.tasks),
    moods: safeRead(STORAGE_KEYS.moods),
    journals: safeRead(STORAGE_KEYS.journals),
    selectedMood: null,
    timerSeconds: 25 * 60,
    timerInitialSeconds: 25 * 60,
    timerInterval: null,
    timerRunning: false
  };

  function persist(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      toast('Penyimpanan browser penuh atau tidak tersedia. Ekspor data dan coba lagi.', true);
      return false;
    }
  }
  function escapeHTML(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }
  function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  function dateFromLocalInput(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return 'Tanggal tidak tersedia';
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  }
  function formatDeadline(value) {
    const date = dateFromLocalInput(value) || new Date(value);
    if (Number.isNaN(date.getTime())) return 'Deadline tidak valid';
    return `${formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' })} · ${new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date)}`;
  }
  function taskIsOverdue(task) {
    const date = dateFromLocalInput(task.deadline) || new Date(task.deadline);
    return !task.completed && !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
  }
  function moodEmoji(name) {
    return (MOODS.find(mood => mood.name === name) || {}).emoji || '🌱';
  }
  function toast(message, isError = false) {
    const region = $('#toast-region');
    const element = document.createElement('div');
    element.className = `toast${isError ? ' error' : ''}`;
    const icon = document.createElement('i');
    icon.className = `fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}`;
    const text = document.createElement('span');
    text.textContent = message;
    element.append(icon, text);
    region.append(element);
    window.setTimeout(() => element.remove(), 3600);
  }

  // Navigasi
  function navigate(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;
    $$('.page-section').forEach(section => section.classList.toggle('active', section.id === targetId));
    $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.target === targetId));
    const activeLink = $(`.nav-item[data-target="${targetId}"]`);
    $('#page-breadcrumb').textContent = activeLink ? activeLink.querySelector('span')?.textContent || 'Beranda' : 'Beranda';
    $('#sidebar').classList.remove('mobile-open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (targetId === 'dashboard') renderDashboard();
  }
  $$('.nav-item').forEach(item => item.addEventListener('click', event => {
    event.preventDefault();
    navigate(item.dataset.target);
  }));
  $$('[data-go]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.go)));
  $('#mobile-menu').addEventListener('click', () => $('#sidebar').classList.toggle('mobile-open'));
  document.addEventListener('click', event => {
    if (window.innerWidth <= 640 && $('#sidebar').classList.contains('mobile-open') &&
        !$('#sidebar').contains(event.target) && !$('#mobile-menu').contains(event.target)) {
      $('#sidebar').classList.remove('mobile-open');
    }
  });

  // Modal accessible: close button, backdrop click, and Escape.
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const firstField = modal.querySelector('input:not([type="hidden"]), textarea, select, button');
    if (firstField) window.setTimeout(() => firstField.focus(), 50);
  }
  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
    if (!$('.modal-backdrop.active')) document.body.style.overflow = '';
  }
  $$('[data-close]').forEach(button => button.addEventListener('click', () => closeModal(button.dataset.close)));
  $$('.modal-backdrop').forEach(modal => modal.addEventListener('click', event => {
    if (event.target === modal) closeModal(modal.id);
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      $$('.modal-backdrop.active').forEach(modal => closeModal(modal.id));
    }
  });

  // Tugas
  const taskModal = $('#task-modal');
  $('#open-task-modal').addEventListener('click', () => openTaskForm());
  function openTaskForm(task = null) {
    $('#task-form').reset();
    $('#task-id').value = task ? String(task.id) : '';
    $('#task-title').value = task?.title || '';
    $('#task-subject').value = task?.subject || '';
    $('#task-deadline').value = task?.deadline || '';
    $('#task-priority').value = task?.priority || 'Sedang';
    $('#task-note').value = task?.note || '';
    $('#task-modal-title').textContent = task ? 'Edit tugas' : 'Tambah tugas';
    openModal('task-modal');
  }
  $('#task-form').addEventListener('submit', event => {
    event.preventDefault();
    const idValue = $('#task-id').value;
    const task = {
      id: idValue ? Number(idValue) : Date.now(),
      title: $('#task-title').value.trim(),
      subject: $('#task-subject').value.trim(),
      deadline: $('#task-deadline').value,
      priority: $('#task-priority').value,
      note: $('#task-note').value.trim(),
      completed: idValue ? !!state.tasks.find(item => item.id === Number(idValue))?.completed : false,
      createdAt: idValue ? (state.tasks.find(item => item.id === Number(idValue))?.createdAt || Date.now()) : Date.now()
    };
    if (!task.title || !task.subject || !dateFromLocalInput(task.deadline)) {
      toast('Periksa kembali nama, mata kuliah, dan tenggat tugas.', true);
      return;
    }
    if (idValue) state.tasks = state.tasks.map(item => item.id === task.id ? task : item);
    else state.tasks.push(task);
    if (!persist(STORAGE_KEYS.tasks, state.tasks)) return;
    closeModal('task-modal');
    renderTasks();
    renderDashboard();
    toast(idValue ? 'Tugas berhasil diperbarui.' : 'Tugas berhasil ditambahkan.');
  });
  function changeTaskStatus(id) {
    state.tasks = state.tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
    persist(STORAGE_KEYS.tasks, state.tasks);
    renderTasks(); renderDashboard();
    toast(state.tasks.find(task => task.id === id)?.completed ? 'Satu langkah berhasil diselesaikan. Hebat!' : 'Status tugas diperbarui.');
  }
  function deleteTask(id) {
    const task = state.tasks.find(item => item.id === id);
    if (!task || !window.confirm(`Hapus tugas "${task.title}"?`)) return;
    state.tasks = state.tasks.filter(item => item.id !== id);
    persist(STORAGE_KEYS.tasks, state.tasks);
    renderTasks(); renderDashboard();
    toast('Tugas telah dihapus.');
  }
  function renderTasks() {
    const keyword = $('#search-task').value.trim().toLocaleLowerCase('id-ID');
    const filter = $('#filter-task').value;
    const sort = $('#sort-task').value;
    const priorityOrder = { Tinggi: 0, Sedang: 1, Rendah: 2 };
    let tasks = state.tasks.filter(task => {
      const matches = `${task.title || ''} ${task.subject || ''} ${task.note || ''}`.toLocaleLowerCase('id-ID').includes(keyword);
      if (!matches) return false;
      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      if (filter === 'overdue') return taskIsOverdue(task);
      return true;
    });
    tasks.sort((a, b) => {
      if (sort === 'priority') return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1) || (new Date(a.deadline) - new Date(b.deadline));
      if (sort === 'newest') return (b.createdAt || b.id) - (a.createdAt || a.id);
      return new Date(a.deadline) - new Date(b.deadline);
    });
    const container = $('#tasks-list');
    if (!tasks.length) {
      container.innerHTML = `<div class="panel empty-state"><i class="fa-regular fa-clipboard"></i><p>${keyword || filter !== 'all' ? 'Tidak ada tugas yang cocok dengan pencarianmu.' : 'Belum ada tugas di sini. Kamu bisa mulai dengan satu langkah kecil.'}</p>${!keyword && filter === 'all' ? '<button class="btn-soft" id="empty-add-task"><i class="fa-solid fa-plus"></i> Tambah tugas pertama</button>' : ''}</div>`;
      $('#empty-add-task')?.addEventListener('click', () => openTaskForm());
    } else {
      container.innerHTML = tasks.map(task => {
        const overdue = taskIsOverdue(task);
        return `<article class="task-card${task.completed ? ' is-completed' : ''}">
          <button class="task-card-check" data-task-action="toggle" data-id="${escapeHTML(String(task.id))}" aria-label="${task.completed ? 'Tandai belum selesai' : 'Tandai selesai'}" title="${task.completed ? 'Tandai belum selesai' : 'Tandai selesai'}"><i class="fa-solid fa-check"></i></button>
          <div class="task-card-body">
            <div class="task-card-top"><div><div class="task-name">${escapeHTML(task.title)}</div><span class="task-subject">${escapeHTML(task.subject)}</span></div>
            <div class="task-card-actions"><button class="mini-action" data-task-action="edit" data-id="${escapeHTML(String(task.id))}" aria-label="Edit tugas" title="Edit tugas"><i class="fa-solid fa-pen"></i></button><button class="mini-action delete" data-task-action="delete" data-id="${escapeHTML(String(task.id))}" aria-label="Hapus tugas" title="Hapus tugas"><i class="fa-regular fa-trash-can"></i></button></div></div>
            ${task.note ? `<p class="task-note">${escapeHTML(task.note)}</p>` : ''}
            <div class="task-meta"><span class="meta-chip${overdue ? ' late' : ''}"><i class="fa-regular fa-clock"></i>${escapeHTML(formatDeadline(task.deadline))}${overdue ? ' · Terlambat' : ''}</span><span class="priority-chip priority-${escapeHTML(task.priority || 'Sedang')}"><i class="fa-solid fa-flag"></i> Prioritas ${escapeHTML(task.priority || 'Sedang')}</span></div>
          </div></article>`;
      }).join('');
    }
    $('#task-total').textContent = state.tasks.length;
    const pending = state.tasks.filter(task => !task.completed).length;
    const completed = state.tasks.length - pending;
    $('#task-pending').textContent = pending;
    $('#task-completed').textContent = completed;
    const percent = state.tasks.length ? Math.round(completed / state.tasks.length * 100) : 0;
    $('#task-progress-label').textContent = `${percent}%`;
    $('#task-progress-bar').style.width = `${percent}%`;
    $('#nav-pending-count').textContent = pending;
  }
  $('#tasks-list').addEventListener('click', event => {
    const button = event.target.closest('[data-task-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    if (button.dataset.taskAction === 'toggle') changeTaskStatus(id);
    if (button.dataset.taskAction === 'edit') {
      const task = state.tasks.find(item => item.id === id);
      if (task) openTaskForm(task);
    }
    if (button.dataset.taskAction === 'delete') deleteTask(id);
  });
  $('#search-task').addEventListener('input', renderTasks);
  $('#filter-task').addEventListener('change', renderTasks);
  $('#sort-task').addEventListener('change', renderTasks);

  // Suasana hati
  $('#mood-options').addEventListener('click', event => {
    const button = event.target.closest('[data-mood]');
    if (!button) return;
    state.selectedMood = button.dataset.mood;
    $$('.mood-btn').forEach(item => {
      const selected = item.dataset.mood === state.selectedMood;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
  });
  $('#save-mood-btn').addEventListener('click', () => {
    if (!state.selectedMood) {
      toast('Pilih suasana hati yang paling mendekati perasaanmu.', true);
      return;
    }
    const today = localDateKey();
    const existingIndex = state.moods.findIndex(item => (item.dateKey || '') === today);
    const mood = {
      id: existingIndex >= 0 ? state.moods[existingIndex].id : Date.now(),
      mood: state.selectedMood,
      icon: (MOODS.find(item => item.name === state.selectedMood) || {}).icon || 'fa-face-smile',
      note: $('#mood-note').value.trim(),
      dateKey: today,
      timestamp: new Date().toISOString()
    };
    if (existingIndex >= 0) state.moods[existingIndex] = mood;
    else state.moods.unshift(mood);
    if (!persist(STORAGE_KEYS.moods, state.moods)) return;
    $('#mood-note').value = '';
    renderMoodHistory(); renderMoodInsight(); renderDashboard();
    toast(existingIndex >= 0 ? 'Catatan suasana hati hari ini diperbarui.' : 'Terima kasih sudah meluangkan waktu untuk dirimu.');
  });
  $('#mood-period').addEventListener('change', renderMoodHistory);
  function getMoodDate(mood) {
    if (mood.dateKey) return new Date(`${mood.dateKey}T12:00:00`);
    if (mood.timestamp) return new Date(mood.timestamp);
    return null;
  }
  function renderMoodHistory() {
    const period = $('#mood-period').value;
    const cutoff = period === 'all' ? null : new Date(Date.now() - Number(period) * 86400000);
    const moods = state.moods.filter(mood => {
      const date = getMoodDate(mood);
      return !cutoff || (date && date >= cutoff);
    }).sort((a, b) => (getMoodDate(b)?.getTime() || 0) - (getMoodDate(a)?.getTime() || 0));
    const container = $('#mood-history-list');
    if (!moods.length) {
      container.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="fa-regular fa-heart"></i><p>Belum ada catatan pada periode ini.</p></div>';
      return;
    }
    container.innerHTML = moods.map(mood => {
      const date = getMoodDate(mood);
      return `<article class="mood-history-card"><div class="mood-history-top"><div class="mood-history-feeling"><span>${moodEmoji(mood.mood)}</span>${escapeHTML(mood.mood)}</div><time class="mood-history-date">${escapeHTML(date ? formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' }) : mood.date || '')}</time></div>${mood.note ? `<p class="mood-history-note">${escapeHTML(mood.note)}</p>` : ''}</article>`;
    }).join('');
  }
  function renderMoodInsight() {
    const today = localDateKey();
    const todaysMood = state.moods.find(mood => (mood.dateKey || (getMoodDate(mood) ? localDateKey(getMoodDate(mood)) : '') ) === today);
    if (todaysMood) {
      $('#mood-summary').innerHTML = `<div class="summary-emoji">${moodEmoji(todaysMood.mood)}</div><div><strong>Hari ini kamu merasa ${escapeHTML(todaysMood.mood.toLocaleLowerCase('id-ID'))}</strong><span>${todaysMood.note ? escapeHTML(todaysMood.note) : 'Kamu sudah memberi ruang untuk mengenali perasaanmu.'}</span></div>`;
    } else {
      $('#mood-summary').innerHTML = '<div class="summary-emoji">🌱</div><div><strong>Mulai dari hari ini</strong><span>Catat suasana hatimu untuk melihat riwayatnya di sini.</span></div>';
    }
    const weekCutoff = new Date(Date.now() - 7 * 86400000);
    const weekMoods = state.moods.filter(mood => {
      const date = getMoodDate(mood);
      return date && date >= weekCutoff;
    });
    $('#mood-week-count').textContent = weekMoods.length;
    const counts = weekMoods.reduce((acc, mood) => { acc[mood.mood] = (acc[mood.mood] || 0) + 1; return acc; }, {});
    const common = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    $('#mood-most-common').textContent = common ? `${moodEmoji(common[0])} ${common[0]}` : '—';
  }

  // Jurnal
  $('#open-journal-modal').addEventListener('click', () => openJournalForm());
  function openJournalForm(journal = null) {
    $('#journal-form').reset();
    $('#journal-id').value = journal ? String(journal.id) : '';
    $('#journal-title').value = journal?.title || '';
    $('#journal-category').value = journal?.category || 'Refleksi';
    $('#journal-content').value = journal?.content || '';
    $('#journal-modal-title').textContent = journal ? 'Edit jurnal' : 'Tulis jurnal';
    openModal('journal-modal');
  }
  $('#journal-form').addEventListener('submit', event => {
    event.preventDefault();
    const idValue = $('#journal-id').value;
    const existing = idValue ? state.journals.find(item => item.id === Number(idValue)) : null;
    const journal = {
      id: idValue ? Number(idValue) : Date.now(),
      title: $('#journal-title').value.trim(),
      category: $('#journal-category').value,
      content: $('#journal-content').value.trim(),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!journal.title || !journal.content) {
      toast('Judul dan isi jurnal tidak boleh kosong.', true);
      return;
    }
    if (idValue) state.journals = state.journals.map(item => item.id === journal.id ? journal : item);
    else state.journals.unshift(journal);
    if (!persist(STORAGE_KEYS.journals, state.journals)) return;
    closeModal('journal-modal');
    renderJournals(); renderDashboard();
    toast(idValue ? 'Jurnal berhasil diperbarui.' : 'Catatan jurnal berhasil disimpan.');
  });
  function deleteJournal(id) {
    const journal = state.journals.find(item => item.id === id);
    if (!journal || !window.confirm(`Hapus jurnal "${journal.title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    state.journals = state.journals.filter(item => item.id !== id);
    persist(STORAGE_KEYS.journals, state.journals);
    renderJournals(); renderDashboard();
    toast('Catatan jurnal telah dihapus.');
  }
  function renderJournals() {
    const keyword = $('#search-journal').value.trim().toLocaleLowerCase('id-ID');
    const category = $('#filter-journal').value;
    const journals = state.journals.filter(journal => {
      const matchesKeyword = `${journal.title || ''} ${journal.content || ''}`.toLocaleLowerCase('id-ID').includes(keyword);
      return matchesKeyword && (category === 'all' || (journal.category || 'Refleksi') === category);
    }).sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    const container = $('#journal-list');
    if (!journals.length) {
      container.innerHTML = `<div class="panel empty-state" style="grid-column:1/-1"><i class="fa-solid fa-book-open"></i><p>${keyword || category !== 'all' ? 'Belum ada jurnal yang sesuai dengan pencarianmu.' : 'Belum ada catatan jurnal. Kamu bisa mulai menulis kapan pun siap.'}</p>${!keyword && category === 'all' ? '<button class="btn-soft" id="empty-add-journal"><i class="fa-solid fa-pen"></i> Tulis jurnal pertama</button>' : ''}</div>`;
      $('#empty-add-journal')?.addEventListener('click', () => openJournalForm());
      return;
    }
    container.innerHTML = journals.map(journal => {
      const date = new Date(journal.updatedAt || journal.createdAt);
      return `<article class="journal-card"><div class="journal-card-top"><span class="journal-category">${escapeHTML(({ Refleksi: 'Refleksi diri', Akademik: 'Akademik', Syukur: 'Rasa syukur', Bebas: 'Catatan bebas' })[journal.category] || 'Refleksi diri')}</span><time>${escapeHTML(Number.isNaN(date.getTime()) ? '' : formatDate(date))}</time></div><h3>${escapeHTML(journal.title)}</h3><p class="journal-excerpt">${escapeHTML(journal.content)}</p><div class="journal-card-footer"><button class="btn-outline" data-journal-action="edit" data-id="${escapeHTML(String(journal.id))}"><i class="fa-solid fa-pen"></i> Edit</button><button class="btn-outline" data-journal-action="delete" data-id="${escapeHTML(String(journal.id))}"><i class="fa-regular fa-trash-can"></i> Hapus</button></div></article>`;
    }).join('');
  }
  $('#journal-list').addEventListener('click', event => {
    const button = event.target.closest('[data-journal-action]');
    if (!button) return;
    const journal = state.journals.find(item => item.id === Number(button.dataset.id));
    if (!journal) return;
    if (button.dataset.journalAction === 'edit') openJournalForm(journal);
    if (button.dataset.journalAction === 'delete') deleteJournal(journal.id);
  });
  $('#search-journal').addEventListener('input', renderJournals);
  $('#filter-journal').addEventListener('change', renderJournals);
  $('#new-prompt').addEventListener('click', () => {
    const current = $('#journal-prompt-text').textContent;
    const choices = PROMPTS.filter(prompt => prompt !== current);
    $('#journal-prompt-text').textContent = choices[Math.floor(Math.random() * choices.length)];
  });

  // Dashboard
  function renderDashboard() {
    const pendingTasks = state.tasks.filter(task => !task.completed);
    const overdueCount = pendingTasks.filter(taskIsOverdue).length;
    $('#dash-pending-tasks').textContent = pendingTasks.length;
    $('#dash-overdue').textContent = overdueCount ? `${overdueCount} tugas melewati deadline` : 'Tidak ada tugas terlambat';
    $('#dash-journal-count').textContent = state.journals.length;
    const today = localDateKey();
    const todayMood = state.moods.find(mood => (mood.dateKey || (getMoodDate(mood) ? localDateKey(getMoodDate(mood)) : '')) === today);
    $('#dash-today-mood').textContent = todayMood ? `${moodEmoji(todayMood.mood)} ${todayMood.mood}` : 'Belum dicatat';
    const upcoming = pendingTasks.slice().sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 4);
    const container = $('#upcoming-tasks');
    if (!upcoming.length) {
      container.innerHTML = '<div class="empty-state compact"><i class="fa-regular fa-circle-check"></i><p>Belum ada tugas yang menunggu. Beri dirimu ruang untuk bernapas.</p><button class="text-link" data-go="tasks">Lihat daftar tugas</button></div>';
      container.querySelector('[data-go]')?.addEventListener('click', () => navigate('tasks'));
    } else {
      container.innerHTML = upcoming.map(task => {
        const overdue = taskIsOverdue(task);
        return `<div class="upcoming-item"><button class="task-check" data-upcoming-toggle="${escapeHTML(String(task.id))}" aria-label="Tandai ${escapeHTML(task.title)} selesai"><i class="fa-solid fa-check"></i></button><div class="upcoming-main"><strong>${escapeHTML(task.title)}</strong><span>${escapeHTML(task.subject)}</span></div><span class="due-chip${overdue ? ' late' : ''}">${overdue ? 'Terlambat' : escapeHTML(formatDate(dateFromLocalInput(task.deadline), { day: 'numeric', month: 'short' }))}</span></div>`;
      }).join('');
      container.querySelectorAll('[data-upcoming-toggle]').forEach(button => button.addEventListener('click', () => changeTaskStatus(Number(button.dataset.upcomingToggle))));
    }
    $('#nav-pending-count').textContent = pendingTasks.length;
  }

  // Ekspor/impor dan pengelolaan data
  function exportData() {
    const backup = {
      app: 'DearMe',
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      tasks: state.tasks,
      moods: state.moods,
      journals: state.journals
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dearme-cadangan-${localDateKey()}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Cadangan DearMe berhasil disiapkan.');
  }
  $('#export-data').addEventListener('click', exportData);
  $('#export-data-bottom').addEventListener('click', exportData);
  $('#import-data').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('Ukuran file cadangan terlalu besar (maksimal 10 MB).');
      const backup = JSON.parse(await file.text());
      if (!backup || backup.app !== 'DearMe' || !Array.isArray(backup.tasks) || !Array.isArray(backup.moods) || !Array.isArray(backup.journals)) {
        throw new Error('Format cadangan tidak sesuai dengan DearMe.');
      }
      const validId = item => Number.isSafeInteger(Number(item?.id)) && Number(item.id) > 0;
      const validTasks = backup.tasks.every(item => item && typeof item === 'object' && validId(item) && typeof item.title === 'string' && typeof item.subject === 'string' && typeof item.deadline === 'string' && typeof item.completed === 'boolean');
      const validMoods = backup.moods.every(item => item && typeof item === 'object' && validId(item) && typeof item.mood === 'string' && (typeof item.dateKey === 'string' || typeof item.timestamp === 'string'));
      const validJournals = backup.journals.every(item => item && typeof item === 'object' && validId(item) && typeof item.title === 'string' && typeof item.content === 'string');
      if (!validTasks || !validMoods || !validJournals) throw new Error('Sebagian data di file cadangan tidak valid atau tidak lengkap.');
      if (!window.confirm('Impor cadangan akan mengganti data DearMe yang ada di browser ini. Pastikan kamu sudah mengekspor data saat ini jika ingin menyimpannya. Lanjutkan?')) return;

      const next = {
        tasks: backup.tasks.map(item => ({ ...item, id: Number(item.id), title: item.title, subject: item.subject, note: typeof item.note === 'string' ? item.note : '', priority: ['Tinggi', 'Sedang', 'Rendah'].includes(item.priority) ? item.priority : 'Sedang', completed: item.completed, createdAt: Number(item.createdAt) || Number(item.id) })),
        moods: backup.moods.map(item => ({ ...item, id: Number(item.id), mood: MOODS.some(mood => mood.name === item.mood) ? item.mood : 'Biasa saja', note: typeof item.note === 'string' ? item.note : '' })),
        journals: backup.journals.map(item => ({ ...item, id: Number(item.id), title: item.title, content: item.content, category: ['Refleksi', 'Akademik', 'Syukur', 'Bebas'].includes(item.category) ? item.category : 'Refleksi' }))
      };
      const keys = [STORAGE_KEYS.tasks, STORAGE_KEYS.moods, STORAGE_KEYS.journals];
      const previousStorage = keys.map(key => localStorage.getItem(key));
      try {
        localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(next.tasks));
        localStorage.setItem(STORAGE_KEYS.moods, JSON.stringify(next.moods));
        localStorage.setItem(STORAGE_KEYS.journals, JSON.stringify(next.journals));
      } catch (storageError) {
        keys.forEach((key, index) => {
          try {
            if (previousStorage[index] === null) localStorage.removeItem(key);
            else localStorage.setItem(key, previousStorage[index]);
          } catch { /* Best-effort rollback when browser storage is unavailable. */ }
        });
        throw new Error('Data tidak dapat disimpan. Periksa ruang penyimpanan browser.');
      }
      state.tasks = next.tasks;
      state.moods = next.moods;
      state.journals = next.journals;
      renderTasks(); renderMoodHistory(); renderMoodInsight(); renderJournals(); renderDashboard();
      toast('Cadangan berhasil diimpor.');
    } catch (error) {
      toast(error.message || 'File cadangan tidak dapat dibaca.', true);
    } finally {
      event.target.value = '';
    }
  });
  $('#clear-data').addEventListener('click', () => {
    if (!window.confirm('Hapus SEMUA tugas, riwayat suasana hati, dan jurnal dari browser ini? Tindakan ini tidak bisa dibatalkan. Ekspor cadangan terlebih dahulu jika diperlukan.')) return;
    state.tasks = []; state.moods = []; state.journals = []; state.selectedMood = null;
    Object.values(STORAGE_KEYS).forEach(key => { try { localStorage.removeItem(key); } catch { /* State can still be cleared for this session. */ } });
    renderTasks(); renderMoodHistory(); renderMoodInsight(); renderJournals(); renderDashboard();
    $$('.mood-btn').forEach(button => { button.classList.remove('selected'); button.setAttribute('aria-pressed', 'false'); });
    $('#mood-note').value = '';
    toast('Data DearMe di browser ini telah dihapus.');
  });

  // Timer fokus
  function updateTimerDisplay() {
    const minutes = Math.floor(state.timerSeconds / 60);
    const seconds = state.timerSeconds % 60;
    $('#timer-display').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.title = state.timerRunning ? `${$('#timer-display').textContent} · DearMe` : 'DearMe — Ruang Kecil untuk Dirimu';
  }
  function stopTimer() {
    if (state.timerInterval) window.clearInterval(state.timerInterval);
    state.timerInterval = null;
    state.timerRunning = false;
  }
  function resetTimer(seconds = state.timerInitialSeconds) {
    stopTimer();
    state.timerSeconds = seconds;
    state.timerInitialSeconds = seconds;
    $('#timer-start').innerHTML = '<i class="fa-solid fa-play"></i> Mulai';
    $('#timer-status').textContent = 'Kamu bisa mulai kapan saja.';
    updateTimerDisplay();
  }
  $('#open-timer').addEventListener('click', () => openModal('timer-modal'));
  $$('.timer-preset').forEach(button => button.addEventListener('click', () => {
    $$('.timer-preset').forEach(item => item.classList.toggle('active', item === button));
    resetTimer(Number(button.dataset.minutes) * 60);
  }));
  $('#timer-start').addEventListener('click', () => {
    if (state.timerRunning) {
      stopTimer();
      $('#timer-start').innerHTML = '<i class="fa-solid fa-play"></i> Lanjutkan';
      $('#timer-status').textContent = 'Timer dijeda. Kamu bisa melanjutkan kapan saja.';
      return;
    }
    if (state.timerSeconds <= 0) resetTimer();
    state.timerRunning = true;
    $('#timer-start').innerHTML = '<i class="fa-solid fa-pause"></i> Jeda';
    $('#timer-status').textContent = 'Fokus pada satu hal. Kamu sedang berusaha.';
    state.timerInterval = window.setInterval(() => {
      state.timerSeconds -= 1;
      updateTimerDisplay();
      if (state.timerSeconds <= 0) {
        stopTimer();
        state.timerSeconds = 0;
        updateTimerDisplay();
        $('#timer-start').innerHTML = '<i class="fa-solid fa-rotate-left"></i> Mulai lagi';
        $('#timer-status').textContent = 'Waktunya selesai. Ambil jeda dan apresiasi usahamu.';
        toast('Sesi fokus selesai. Saatnya mengambil jeda!');
      }
    }, 1000);
  });
  $('#timer-reset').addEventListener('click', () => resetTimer());

  // Inisialisasi
  const now = new Date();
  $('#today-label').textContent = formatDate(now, { day: 'numeric', month: 'short', year: 'numeric' });
  $('#long-date').textContent = formatDate(now, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const hour = now.getHours();
  $('#welcome-heading').innerHTML = `${hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam'}, kamu. <span class="heading-sparkle">✳</span>`;
  $('#greeting-avatar').textContent = 'D';
  renderTasks();
  renderMoodHistory();
  renderMoodInsight();
  renderJournals();
  renderDashboard();
})();

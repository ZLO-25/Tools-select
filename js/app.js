/**
 * Tools-select 主應用程式控制器
 * 負責：多工具切換、15種圖表互動控制、決策精靈篩選、書籤收藏、隨機抽卡學習與深淺色主題
 */
(function () {
  const state = {
    currentView: 'chart-workbench', // 'chart-workbench' | 'chart-overview' | 'hub-directory'
    activeGoal: 'all',
    searchQuery: '',
    selectedChartId: 'bar',
    chartParams: {},
    bookmarks: JSON.parse(localStorage.getItem('tools_select_bookmarks') || '[]'),
    theme: localStorage.getItem('tools_select_theme') || 'dark'
  };

  // Initialize default parameters for all 15 charts
  window.CHARTS_DATA.forEach(c => {
    state.chartParams[c.id] = {};
    c.controls.forEach(ctrl => {
      state.chartParams[c.id][ctrl.key] = ctrl.value;
    });
  });

  function applyTheme() {
    if (state.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    const themeBtn = document.getElementById('btn-theme');
    if (themeBtn) {
      themeBtn.textContent = state.theme === 'light' ? '🌙 切換深色' : '☀️ 切換淺色';
    }
  }

  function getFilteredCharts() {
    return window.CHARTS_DATA.filter(c => {
      const matchGoal = state.activeGoal === 'all' || c.goalIds.includes(state.activeGoal);
      const q = state.searchQuery.trim().toLowerCase();
      const matchSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        c.enName.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.scenarios.some(s => s.toLowerCase().includes(q));
      return matchGoal && matchSearch;
    });
  }

  function renderGoalButtons() {
    const mount = document.getElementById('goal-buttons');
    if (!mount) return;
    mount.innerHTML = window.CHART_GOALS.map(g => `
      <button class="goal-btn ${state.activeGoal === g.id ? 'active' : ''}" data-goal="${g.id}" title="${g.desc}">
        ${g.label}
      </button>
    `).join('');

    mount.querySelectorAll('.goal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeGoal = btn.dataset.goal;
        const filtered = getFilteredCharts();
        if (filtered.length > 0 && !filtered.some(c => c.id === state.selectedChartId)) {
          state.selectedChartId = filtered[0].id;
        }
        renderAll();
      });
    });
  }

  function renderSidebarList() {
    const listEl = document.getElementById('chart-nav-list');
    if (!listEl) return;
    const filtered = getFilteredCharts();

    if (filtered.length === 0) {
      listEl.innerHTML = `<div style="padding:1.2rem;text-align:center;color:var(--text-secondary);">找不到符合條件的圖表，請清除篩選關鍵字。</div>`;
      return;
    }

    listEl.innerHTML = filtered.map(c => {
      const isFav = state.bookmarks.includes(c.id);
      return `
        <div class="chart-nav-item ${c.id === state.selectedChartId ? 'active' : ''}" data-id="${c.id}">
          <div class="chart-nav-left">
            <span class="chart-num">${c.number}</span>
            <div>
              <div class="chart-nav-title">${c.name} ${isFav ? '⭐' : ''}</div>
              <span class="chart-nav-sub">${c.enName}</span>
            </div>
          </div>
          <span class="cat-tag">${c.category}</span>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.chart-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        state.selectedChartId = item.dataset.id;
        renderSidebarList();
        renderActiveStage();
      });
    });
  }

  function renderActiveStage() {
    const chart = window.CHARTS_DATA.find(c => c.id === state.selectedChartId) || window.CHARTS_DATA[0];
    const params = state.chartParams[chart.id];
    const isFav = state.bookmarks.includes(chart.id);

    document.getElementById('stage-title').innerHTML = `
      <span>#${chart.number} ${chart.name}</span>
      <span class="tool-badge">${chart.enName}</span>
      <span class="cat-tag">${chart.category}</span>
    `;
    document.getElementById('stage-summary').textContent = chart.summary;

    const favBtn = document.getElementById('btn-bookmark');
    if (favBtn) {
      favBtn.className = `btn-icon ${isFav ? 'bookmarked' : ''}`;
      favBtn.innerHTML = isFav ? '⭐ 已收藏常用' : '☆ 加入收藏';
    }

    // Render SVG Canvas
    const svgMount = document.getElementById('svg-mount');
    svgMount.innerHTML = window.renderChartSVG(chart.id, params);
    bindTooltips(svgMount);

    // Render Interactive Controls
    const ctrlMount = document.getElementById('controls-list');
    ctrlMount.innerHTML = chart.controls.map(ctrl => {
      const curVal = params[ctrl.key];
      if (ctrl.type === 'range') {
        return `
          <div class="control-group">
            <label class="control-label">
              <span>${ctrl.label}</span>
              <strong id="val-${ctrl.key}">${curVal}${ctrl.unit || ''}</strong>
            </label>
            <input type="range" data-key="${ctrl.key}" min="${ctrl.min}" max="${ctrl.max}" step="${ctrl.step}" value="${curVal}" />
          </div>
        `;
      }
      if (ctrl.type === 'select') {
        return `
          <div class="control-group">
            <label class="control-label"><span>${ctrl.label}</span></label>
            <select class="control-select" data-key="${ctrl.key}">
              ${ctrl.options.map(opt => `<option value="${opt.value}" ${opt.value === curVal ? 'selected' : ''}>${opt.label}</option>`).join('')}
            </select>
          </div>
        `;
      }
      if (ctrl.type === 'checkbox') {
        return `
          <label class="control-checkbox">
            <input type="checkbox" data-key="${ctrl.key}" ${curVal ? 'checked' : ''} />
            <span>${ctrl.label}</span>
          </label>
        `;
      }
      return '';
    }).join('');

    // Bind live control events
    ctrlMount.querySelectorAll('input, select').forEach(el => {
      const eventName = el.type === 'range' ? 'input' : 'change';
      el.addEventListener(eventName, () => {
        const key = el.dataset.key;
        const val = el.type === 'checkbox' ? el.checked : el.value;
        state.chartParams[chart.id][key] = val;
        const labelStrong = document.getElementById(`val-${key}`);
        const ctrlDef = chart.controls.find(c => c.key === key);
        if (labelStrong && ctrlDef) {
          labelStrong.textContent = `${val}${ctrlDef.unit || ''}`;
        }
        svgMount.innerHTML = window.renderChartSVG(chart.id, state.chartParams[chart.id]);
        bindTooltips(svgMount);
      });
    });

    // Render Purpose, Scenarios, Caveats
    document.getElementById('list-purpose').innerHTML = chart.purpose.map(x => `<li>${x}</li>`).join('');
    document.getElementById('list-scenarios').innerHTML = chart.scenarios.map(x => `<li>${x}</li>`).join('');
    document.getElementById('list-caveats').innerHTML = chart.caveats.map(x => `<li>${x}</li>`).join('');
  }

  function renderOverviewWall() {
    const wall = document.getElementById('overview-grid');
    if (!wall) return;
    const filtered = getFilteredCharts();
    wall.innerHTML = filtered.map(c => `
      <div class="mini-chart-card" data-id="${c.id}">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="tool-badge">#${c.number} ${c.category}</span>
          <span style="font-size:0.78rem;color:var(--text-secondary);">${c.enName}</span>
        </div>
        <h3 style="font-size:1.1rem;margin-top:0.2rem;">${c.name}</h3>
        <p style="font-size:0.84rem;color:var(--text-secondary);flex:1;">${c.summary}</p>
        <div style="font-size:0.78rem;color:var(--accent-primary);font-weight:600;margin-top:0.4rem;">
          👉 點擊進入互動調整與完整解析
        </div>
      </div>
    `).join('');

    wall.querySelectorAll('.mini-chart-card').forEach(card => {
      card.addEventListener('click', () => {
        state.selectedChartId = card.dataset.id;
        switchView('chart-workbench');
      });
    });
  }

  function renderToolsHubDirectory() {
    const grid = document.getElementById('tool-directory-grid');
    if (!grid) return;
    grid.innerHTML = window.TOOLS_REGISTRY.map(t => `
      <div class="tool-hub-card ${t.status === 'planned' ? 'coming-soon' : ''}" data-tool-id="${t.id}" data-status="${t.status}">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <span style="font-size:1.75rem;">${t.icon}</span>
            <span class="tool-badge ${t.status === 'planned' ? 'planned' : ''}">${t.badge}</span>
          </div>
          <h3 style="font-size:1.15rem;margin-bottom:0.2rem;">${t.title}</h3>
          <div style="font-size:0.76rem;color:var(--text-muted);margin-bottom:0.65rem;">${t.subtitle}</div>
          <p style="font-size:0.86rem;color:var(--text-secondary);">${t.description}</p>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:0.8rem;border-top:1px solid var(--border-color);font-size:0.78rem;">
          <span style="color:var(--text-secondary);">分類：${t.category}</span>
          <strong style="color:${t.status === 'active' ? 'var(--accent-primary)' : 'var(--text-muted)'};">
            ${t.status === 'active' ? '開啟工具 →' : '預留擴充插槽'}
          </strong>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.tool-hub-card').forEach(card => {
      card.addEventListener('click', () => {
        if (card.dataset.status === 'active') {
          switchView('chart-workbench');
        }
      });
    });
  }

  function bindTooltips(container) {
    const tipEl = document.getElementById('chart-tooltip');
    if (!tipEl) return;
    container.querySelectorAll('[data-tip]').forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        tipEl.textContent = el.getAttribute('data-tip');
        tipEl.style.opacity = '1';
      });
      el.addEventListener('mousemove', (e) => {
        tipEl.style.left = `${e.clientX + 14}px`;
        tipEl.style.top = `${e.clientY - 28}px`;
      });
      el.addEventListener('mouseleave', () => {
        tipEl.style.opacity = '0';
      });
    });
  }

  function switchView(viewName) {
    state.currentView = viewName;
    document.getElementById('view-workbench').classList.toggle('hidden', viewName !== 'chart-workbench');
    document.getElementById('view-overview').classList.toggle('hidden', viewName !== 'chart-overview');
    document.getElementById('view-hub').classList.toggle('hidden', viewName !== 'hub-directory');
    document.getElementById('shared-filter-section').classList.toggle('hidden', viewName === 'hub-directory');

    document.querySelectorAll('[data-nav-view]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.navView === viewName);
    });

    renderAll();
  }

  function renderAll() {
    renderGoalButtons();
    renderSidebarList();
    renderActiveStage();
    renderOverviewWall();
    renderToolsHubDirectory();
    const favCountEl = document.getElementById('stat-fav-count');
    if (favCountEl) favCountEl.textContent = state.bookmarks.length;
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    renderAll();

    // Navigation buttons
    document.querySelectorAll('[data-nav-view]').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.navView));
    });

    // Random chart button ("沒事時隨手抽卡學習")
    document.getElementById('btn-random').addEventListener('click', () => {
      const others = window.CHARTS_DATA.filter(c => c.id !== state.selectedChartId);
      const pick = others[Math.floor(Math.random() * others.length)];
      state.activeGoal = 'all';
      state.searchQuery = '';
      document.getElementById('search-input').value = '';
      state.selectedChartId = pick.id;
      switchView('chart-workbench');
    });

    // Search input
    document.getElementById('search-input').addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      const filtered = getFilteredCharts();
      if (filtered.length > 0 && !filtered.some(c => c.id === state.selectedChartId)) {
        state.selectedChartId = filtered[0].id;
      }
      renderSidebarList();
      renderActiveStage();
      renderOverviewWall();
    });

    // Reset current chart parameters
    document.getElementById('btn-reset-params').addEventListener('click', () => {
      const chart = window.CHARTS_DATA.find(c => c.id === state.selectedChartId);
      if (!chart) return;
      chart.controls.forEach(ctrl => {
        state.chartParams[chart.id][ctrl.key] = ctrl.value;
      });
      renderActiveStage();
    });

    // Bookmark button
    document.getElementById('btn-bookmark').addEventListener('click', () => {
      const id = state.selectedChartId;
      const idx = state.bookmarks.indexOf(id);
      if (idx === -1) state.bookmarks.push(id);
      else state.bookmarks.splice(idx, 1);
      localStorage.setItem('tools_select_bookmarks', JSON.stringify(state.bookmarks));
      renderAll();
    });

    // Prev / Next chart keyboard or button navigation
    document.getElementById('btn-prev-chart').addEventListener('click', () => {
      const list = getFilteredCharts();
      const idx = list.findIndex(c => c.id === state.selectedChartId);
      if (idx > 0) {
        state.selectedChartId = list[idx - 1].id;
        renderSidebarList();
        renderActiveStage();
      }
    });

    document.getElementById('btn-next-chart').addEventListener('click', () => {
      const list = getFilteredCharts();
      const idx = list.findIndex(c => c.id === state.selectedChartId);
      if (idx >= 0 && idx < list.length - 1) {
        state.selectedChartId = list[idx + 1].id;
        renderSidebarList();
        renderActiveStage();
      }
    });

    // Theme toggle
    document.getElementById('btn-theme').addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('tools_select_theme', state.theme);
      applyTheme();
    });
  });
})();

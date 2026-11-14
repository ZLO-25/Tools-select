/**
 * Tools-select 主應用程式控制器
 * 負責：PM 17種圖表工作台、PM 10大實戰工具箱(大人學/TOC)、自訂數據編輯、PNG/SVG 高解析匯出與多工具切換
 */
(function () {
  const state = {
    currentView: 'chart-workbench', // 'chart-workbench' | 'pm-workbench' | 'chart-overview' | 'hub-directory'
    activeGoal: 'all',
    searchQuery: '',
    selectedChartId: window.CHARTS_DATA[0] ? window.CHARTS_DATA[0].id : 'gantt',
    selectedPmToolId: window.PM_TOOLS_DATA[0] ? window.PM_TOOLS_DATA[0].id : 'toc-cloud',
    chartParams: {},
    pmParams: {},
    bookmarks: JSON.parse(localStorage.getItem('tools_select_bookmarks') || '[]'),
    theme: localStorage.getItem('tools_select_theme') || 'dark'
  };

  // Initialize default parameters for 17 charts
  window.CHARTS_DATA.forEach(c => {
    state.chartParams[c.id] = {
      customTitle: c.defaultTitle || c.name,
      customData: c.defaultData || ''
    };
    c.controls.forEach(ctrl => {
      state.chartParams[c.id][ctrl.key] = ctrl.value;
    });
  });

  // Initialize default editable fields for 10 PM tools
  window.PM_TOOLS_DATA.forEach(t => {
    state.pmParams[t.id] = {};
    t.editableFields.forEach(f => {
      state.pmParams[t.id][f.key] = f.value;
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

  // Export SVG as .svg file
  function exportSVGFile(mountId, filename) {
    const svgEl = document.querySelector(`#${mountId} svg`);
    if (!svgEl) return;
    const clone = svgEl.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const source = '<?xml version="1.0" standalone="no"?>\r\n' + new XMLSerializer().serializeToString(clone);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Export SVG as 2x HiDPI PNG image for slides/reports
  function exportPNGFile(mountId, filename) {
    const svgEl = document.querySelector(`#${mountId} svg`);
    if (!svgEl) return;
    const vb = (svgEl.getAttribute('viewBox') || '0 0 720 370').split(/\s+/).map(Number);
    const w = vb[2] || 720;
    const h = vb[3] || 370;

    const clone = svgEl.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', w);
    clone.setAttribute('height', h);
    if (!clone.style.background) {
      clone.style.background = '#0f172a';
    }

    const svgStr = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = function () {
      const scale = 2; // 2x HiDPI for crisp PowerPoint / Keynote slides
      const canvas = document.createElement('canvas');
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);

      canvas.toBlob(function (pngBlob) {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
    };
    img.src = url;
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

    // Custom Title & Data Editor sync
    const titleInput = document.getElementById('chart-custom-title');
    const dataInput = document.getElementById('chart-custom-data');
    const hintEl = document.getElementById('chart-data-hint');
    titleInput.value = params.customTitle || '';
    dataInput.value = params.customData || '';
    dataInput.disabled = !chart.defaultData;
    dataInput.placeholder = chart.defaultData ? '' : '此圖表由右側統計滑桿即時產生模擬樣本';
    hintEl.textContent = chart.defaultDataHint || '';

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

    document.getElementById('list-purpose').innerHTML = chart.purpose.map(x => `<li>${x}</li>`).join('');
    document.getElementById('list-scenarios').innerHTML = chart.scenarios.map(x => `<li>${x}</li>`).join('');
    document.getElementById('list-caveats').innerHTML = chart.caveats.map(x => `<li>${x}</li>`).join('');
  }

  // PM 10 Tools Workbench
  function renderPmSidebar() {
    const listEl = document.getElementById('pm-nav-list');
    if (!listEl) return;
    listEl.innerHTML = window.PM_TOOLS_DATA.map(t => `
      <div class="chart-nav-item ${t.id === state.selectedPmToolId ? 'active' : ''}" data-pm-id="${t.id}">
        <div class="chart-nav-left">
          <span class="chart-num">${t.number}</span>
          <div>
            <div class="chart-nav-title">${t.name}</div>
            <span class="chart-nav-sub">${t.enName}</span>
          </div>
        </div>
        <span class="cat-tag">${t.badge}</span>
      </div>
    `).join('');

    listEl.querySelectorAll('.chart-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        state.selectedPmToolId = item.dataset.pmId;
        renderPmSidebar();
        renderActivePmStage();
      });
    });
  }

  function renderActivePmStage() {
    const tool = window.PM_TOOLS_DATA.find(t => t.id === state.selectedPmToolId) || window.PM_TOOLS_DATA[0];
    const fields = state.pmParams[tool.id];

    document.getElementById('pm-stage-title').innerHTML = `
      <span>#${tool.number} ${tool.name}</span>
      <span class="tool-badge">${tool.enName}</span>
      <span class="cat-tag">${tool.category}</span>
    `;
    document.getElementById('pm-stage-summary').textContent = tool.summary;

    const svgMount = document.getElementById('pm-svg-mount');
    svgMount.innerHTML = window.renderPmToolSVG(tool.id, fields);
    bindTooltips(svgMount);

    const fieldsGrid = document.getElementById('pm-fields-grid');
    fieldsGrid.innerHTML = tool.editableFields.map(f => {
      const val = fields[f.key];
      if (f.type === 'select') {
        return `
          <div class="control-group">
            <label class="control-label"><span>${f.label}</span></label>
            <select class="control-select" data-pm-key="${f.key}">
              ${f.options.map(opt => `<option value="${opt.value}" ${opt.value === val ? 'selected' : ''}>${opt.label}</option>`).join('')}
            </select>
          </div>
        `;
      }
      return `
        <div class="control-group">
          <label class="control-label"><span>${f.label}</span></label>
          <input type="text" class="control-input" data-pm-key="${f.key}" value="${String(val || '').replace(/"/g, '&quot;')}" />
        </div>
      `;
    }).join('');

    fieldsGrid.querySelectorAll('input, select').forEach(el => {
      const evt = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evt, () => {
        const key = el.dataset.pmKey;
        state.pmParams[tool.id][key] = el.value;
        svgMount.innerHTML = window.renderPmToolSVG(tool.id, state.pmParams[tool.id]);
        bindTooltips(svgMount);
      });
    });

    document.getElementById('pm-list-purpose').innerHTML = tool.purpose.map(x => `<li>${x}</li>`).join('');
    document.getElementById('pm-list-scenarios').innerHTML = tool.scenarios.map(x => `<li>${x}</li>`).join('');
    document.getElementById('pm-list-caveats').innerHTML = tool.caveats.map(x => `<li>${x}</li>`).join('');
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
          👉 點擊進入互動調整與匯出
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
      <div class="tool-hub-card ${t.status === 'planned' ? 'coming-soon' : ''}" data-view="${t.targetView || 'chart-workbench'}" data-item="${t.targetItemId || ''}" data-status="${t.status}">
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
            ${t.status === 'active' ? '立即開啟 →' : '預留擴充插槽'}
          </strong>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.tool-hub-card').forEach(card => {
      card.addEventListener('click', () => {
        if (card.dataset.status !== 'active') return;
        const targetView = card.dataset.view;
        const targetItem = card.dataset.item;
        if (targetView === 'pm-workbench' && targetItem) {
          state.selectedPmToolId = targetItem;
        } else if (targetView === 'chart-workbench' && targetItem) {
          state.selectedChartId = targetItem;
        }
        switchView(targetView);
      });
    });
  }

  function bindTooltips(container) {
    const tipEl = document.getElementById('chart-tooltip');
    if (!tipEl) return;
    container.querySelectorAll('[data-tip]').forEach(el => {
      el.addEventListener('mouseenter', () => {
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
    document.getElementById('view-pm-workbench').classList.toggle('hidden', viewName !== 'pm-workbench');
    document.getElementById('view-overview').classList.toggle('hidden', viewName !== 'chart-overview');
    document.getElementById('view-hub').classList.toggle('hidden', viewName !== 'hub-directory');

    const showFilter = viewName === 'chart-workbench' || viewName === 'chart-overview';
    document.getElementById('shared-filter-section').classList.toggle('hidden', !showFilter);

    document.querySelectorAll('[data-nav-view]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.navView === viewName);
    });

    renderAll();
  }

  function renderAll() {
    renderGoalButtons();
    renderSidebarList();
    renderActiveStage();
    renderPmSidebar();
    renderActivePmStage();
    renderOverviewWall();
    renderToolsHubDirectory();
    const favCountEl = document.getElementById('stat-fav-count');
    if (favCountEl) favCountEl.textContent = state.bookmarks.length;
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    renderAll();

    document.querySelectorAll('[data-nav-view]').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.navView));
    });

    // Random chart button
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

    // Custom title & custom data live editing for Charts
    document.getElementById('chart-custom-title').addEventListener('input', (e) => {
      state.chartParams[state.selectedChartId].customTitle = e.target.value;
      const svgMount = document.getElementById('svg-mount');
      svgMount.innerHTML = window.renderChartSVG(state.selectedChartId, state.chartParams[state.selectedChartId]);
      bindTooltips(svgMount);
    });

    document.getElementById('chart-custom-data').addEventListener('input', (e) => {
      state.chartParams[state.selectedChartId].customData = e.target.value;
      const svgMount = document.getElementById('svg-mount');
      svgMount.innerHTML = window.renderChartSVG(state.selectedChartId, state.chartParams[state.selectedChartId]);
      bindTooltips(svgMount);
    });

    document.getElementById('btn-reset-custom-data').addEventListener('click', () => {
      const chart = window.CHARTS_DATA.find(c => c.id === state.selectedChartId);
      if (!chart) return;
      state.chartParams[chart.id].customTitle = chart.defaultTitle || chart.name;
      state.chartParams[chart.id].customData = chart.defaultData || '';
      renderActiveStage();
    });

    // Reset chart slider params
    document.getElementById('btn-reset-params').addEventListener('click', () => {
      const chart = window.CHARTS_DATA.find(c => c.id === state.selectedChartId);
      if (!chart) return;
      chart.controls.forEach(ctrl => {
        state.chartParams[chart.id][ctrl.key] = ctrl.value;
      });
      renderActiveStage();
    });

    // Reset PM tool fields
    document.getElementById('btn-pm-reset').addEventListener('click', () => {
      const tool = window.PM_TOOLS_DATA.find(t => t.id === state.selectedPmToolId);
      if (!tool) return;
      tool.editableFields.forEach(f => {
        state.pmParams[tool.id][f.key] = f.value;
      });
      renderActivePmStage();
    });

    // Export buttons for Charts
    document.getElementById('btn-chart-export-png').addEventListener('click', () => {
      exportPNGFile('svg-mount', `PM-Chart-${state.selectedChartId}`);
    });
    document.getElementById('btn-chart-export-svg').addEventListener('click', () => {
      exportSVGFile('svg-mount', `PM-Chart-${state.selectedChartId}`);
    });

    // Export buttons for PM Tools
    document.getElementById('btn-pm-export-png').addEventListener('click', () => {
      exportPNGFile('pm-svg-mount', `PM-Tool-${state.selectedPmToolId}`);
    });
    document.getElementById('btn-pm-export-svg').addEventListener('click', () => {
      exportSVGFile('pm-svg-mount', `PM-Tool-${state.selectedPmToolId}`);
    });

    // Bookmark
    document.getElementById('btn-bookmark').addEventListener('click', () => {
      const id = state.selectedChartId;
      const idx = state.bookmarks.indexOf(id);
      if (idx === -1) state.bookmarks.push(id);
      else state.bookmarks.splice(idx, 1);
      localStorage.setItem('tools_select_bookmarks', JSON.stringify(state.bookmarks));
      renderAll();
    });

    // Prev / Next chart
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

/**
 * PM 常用 17 種數據與專案圖表 SVG 即時渲染引擎
 * 支援：1. 滑桿參數即時互動；2. 使用者自訂標題與數據即時解析；3. 高解析度 PNG / SVG 匯出相容樣式
 */
(function () {
  const PALETTE = [
    '#38bdf8', '#818cf8', '#34d399', '#fbbf24',
    '#fb7185', '#a78bfa', '#2dd4bf', '#f97316'
  ];

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function createSVG(w = 720, h = 370, title = '') {
    let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" style="background:#0f172a;border-radius:12px;font-family:'Inter','Microsoft JhengHei',sans-serif;">`;
    if (title) {
      s += `<text x="${w / 2}" y="26" text-anchor="middle" fill="#f8fafc" font-size="15.5" font-weight="800">${esc(title)}</text>`;
    }
    return s;
  }

  function parseLines(raw) {
    return String(raw || '')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
  }

  // 1. Gantt Chart
  function renderGantt(p) {
    const w = 720, h = 370, padL = 150, padR = 35, padT = 54, padB = 40;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const delay = Number(p.delayDays) || 0;
    const todayW = Number(p.todayWeek) || 6;

    const lines = parseLines(p.customData);
    let tasks = lines.map((ln, idx) => {
      const parts = ln.split(',').map(x => x.trim());
      const id = idx + 1;
      const name = parts[0] || `任務 ${id}`;
      const baseStart = Number(parts[1]) || 0;
      const baseDur = Math.max(1, Number(parts[2]) || 2);
      const prog = Math.min(100, Math.max(0, Number(parts[3]) || 0));
      const crit = parts[4] === '1' || parts[4] === 'true';
      const dep = Number(parts[5]) || 0;
      return { id, name, start: baseStart, dur: baseDur, prog, crit, dep };
    });

    if (tasks.length === 0) {
      tasks = [
        { id: 1, name: '1. 需求規格訪談', start: 0, dur: 2, prog: 100, crit: true, dep: 0 },
        { id: 2, name: '2. UI/UX 原型設計', start: 2, dur: 2, prog: 100, crit: false, dep: 1 },
        { id: 3, name: '3. 核心架構與API', start: 2, dur: 3, prog: 70, crit: true, dep: 1 },
        { id: 4, name: '4. 前端互動開發', start: 4, dur: 3, prog: 50, crit: false, dep: 2 },
        { id: 5, name: '5. 系統整合與壓測', start: 5, dur: 2, prog: 20, crit: true, dep: 3 },
        { id: 6, name: '6. 正式上線里程碑★', start: 7, dur: 1, prog: 0, crit: true, dep: 5 }
      ];
    }

    // Apply delay ripple on critical path tasks after week 2
    tasks.forEach(t => {
      if (t.crit && t.start >= 2 && t.id === 3) {
        t.dur += delay;
      } else if (t.crit && t.start >= 4) {
        t.start += delay;
      }
    });

    const totalWeeks = Math.max(12, ...tasks.map(t => t.start + t.dur + 1));
    let svg = createSVG(w, h, p.customTitle);
    const xAt = (wk) => padL + (wk / totalWeeks) * plotW;
    const rowH = plotH / tasks.length;

    for (let wk = 0; wk <= totalWeeks; wk++) {
      const x = xAt(wk);
      svg += `<line x1="${x}" y1="${padT - 8}" x2="${x}" y2="${padT + plotH}" stroke="#94a3b8" stroke-opacity="0.16" stroke-dasharray="3 3"/>`;
      if (wk < totalWeeks) {
        svg += `<text x="${x + (plotW / totalWeeks) / 2}" y="${padT - 10}" text-anchor="middle" fill="#cbd5e1" font-size="11">W${wk + 1}</text>`;
      }
    }

    tasks.forEach((t, i) => {
      const y = padT + i * rowH;
      const barY = y + (rowH - 22) / 2;
      const x1 = xAt(t.start);
      const bw = Math.max(14, (t.dur / totalWeeks) * plotW);
      const isCrit = p.showCritical && t.crit;
      const baseColor = isCrit ? '#fb7185' : '#38bdf8';

      svg += `<text x="${padL - 10}" y="${y + rowH / 2 + 4}" text-anchor="end" fill="#f8fafc" font-size="12" font-weight="${isCrit ? '700' : '500'}">${esc(t.name)}</text>`;
      svg += `<rect x="${x1}" y="${barY}" width="${bw}" height="22" rx="6" fill="${baseColor}" fill-opacity="0.28" stroke="${baseColor}" stroke-width="1.8" data-tip="${esc(t.name)} | W${t.start + 1}~W${t.start + t.dur} | 完成:${t.prog}%"/>`;

      if (t.prog > 0) {
        const pw = (t.prog / 100) * bw;
        svg += `<rect x="${x1}" y="${barY}" width="${pw}" height="22" rx="6" fill="${baseColor}" fill-opacity="0.88"/>`;
      }
      svg += `<text x="${x1 + bw + 6}" y="${barY + 15}" fill="#e2e8f0" font-size="11">${t.prog}%</text>`;

      if (p.showDeps && t.dep > 0) {
        const prevIdx = tasks.findIndex(x => x.id === t.dep);
        if (prevIdx >= 0) {
          const prev = tasks[prevIdx];
          const px2 = xAt(prev.start + prev.dur);
          const py = padT + prevIdx * rowH + rowH / 2;
          const cy = y + rowH / 2;
          svg += `<path d="M ${px2} ${py} L ${px2 + 8} ${py} L ${px2 + 8} ${cy} L ${x1 - 3} ${cy}" fill="none" stroke="#fbbf24" stroke-width="1.6" stroke-dasharray="3 2"/>`;
          svg += `<polygon points="${x1},${cy} ${x1 - 5},${cy - 3.5} ${x1 - 5},${cy + 3.5}" fill="#fbbf24"/>`;
        }
      }
    });

    const tx = xAt(todayW);
    svg += `<line x1="${tx}" y1="${padT - 10}" x2="${tx}" y2="${padT + plotH + 6}" stroke="#34d399" stroke-width="2.5"/>`;
    svg += `<rect x="${tx - 34}" y="${padT + plotH + 6}" width="68" height="18" rx="4" fill="#34d399"/>`;
    svg += `<text x="${tx}" y="${padT + plotH + 18}" text-anchor="middle" fill="#0b0f19" font-size="10.5" font-weight="800">今日 W${todayW}</text>`;

    return svg + '</svg>';
  }

  // 2. River Chart (Channel & Streamgraph)
  function renderRiver(p) {
    const w = 720, h = 370, padL = 58, padR = 32, padT = 56, padB = 45;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const bwMul = Number(p.bandWidth) / 100;

    const lines = parseLines(p.customData);
    let rows = lines.map(ln => {
      const parts = ln.split(',').map(x => x.trim());
      return {
        label: parts[0] || 'W',
        mean: Number(parts[1]) || 50,
        half: (Number(parts[2]) || 14) * bwMul,
        actual: Number(parts[3]) || 52
      };
    });

    if (rows.length < 3) {
      rows = [
        { label: 'W1', mean: 48, half: 12 * bwMul, actual: 46 },
        { label: 'W2', mean: 52, half: 14 * bwMul, actual: 55 },
        { label: 'W3', mean: 56, half: 15 * bwMul, actual: 62 },
        { label: 'W4', mean: 61, half: 13 * bwMul, actual: 59 },
        { label: 'W5', mean: 58, half: 16 * bwMul, actual: 52 },
        { label: 'W6', mean: 64, half: 18 * bwMul, actual: 68 },
        { label: 'W7', mean: 69, half: 15 * bwMul, actual: 88 },
        { label: 'W8', mean: 72, half: 14 * bwMul, actual: 75 }
      ];
    }

    const xAt = (i) => padL + (i / (rows.length - 1)) * plotW;
    let svg = createSVG(w, h, p.customTitle);

    if (p.riverMode === 'channel') {
      const maxV = Math.max(115, ...rows.map(r => Math.max(r.mean + r.half * 1.5, r.actual))) + 10;
      const toY = (v) => padT + plotH - (Math.max(0, v) / maxV) * plotH;

      for (let i = 0; i <= 4; i++) {
        const v = Math.round((maxV * i) / 4);
        const y = toY(v);
        svg += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#94a3b8" stroke-opacity="0.14" stroke-dasharray="4 4"/>`;
        svg += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="#cbd5e1" font-size="11">${v}</text>`;
      }

      const upper2 = rows.map((r, i) => `${xAt(i)},${toY(r.mean + r.half * 1.45)}`).join(' L ');
      const lower2 = [...rows].reverse().map((r, idx) => {
        const i = rows.length - 1 - idx;
        return `${xAt(i)},${toY(r.mean - r.half * 1.45)}`;
      }).join(' L ');
      svg += `<path d="M ${upper2} L ${lower2} Z" fill="#38bdf8" fill-opacity="0.16"/>`;

      const upper1 = rows.map((r, i) => `${xAt(i)},${toY(r.mean + r.half)}`).join(' L ');
      const lower1 = [...rows].reverse().map((r, idx) => {
        const i = rows.length - 1 - idx;
        return `${xAt(i)},${toY(r.mean - r.half)}`;
      }).join(' L ');
      svg += `<path d="M ${upper1} L ${lower1} Z" fill="#38bdf8" fill-opacity="0.34" stroke="#38bdf8" stroke-opacity="0.5" stroke-width="1.5"/>`;

      const meanLine = rows.map((r, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${toY(r.mean)}`).join(' ');
      svg += `<path d="${meanLine}" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="5 4"/>`;

      if (p.showActualLine) {
        const actLine = rows.map((r, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${toY(r.actual)}`).join(' ');
        svg += `<path d="${actLine}" fill="none" stroke="#fbbf24" stroke-width="3"/>`;
        rows.forEach((r, i) => {
          const isOut = r.actual > r.mean + r.half || r.actual < r.mean - r.half;
          svg += `<circle cx="${xAt(i)}" cy="${toY(r.actual)}" r="${isOut ? 6.5 : 4.5}" fill="${isOut ? '#fb7185' : '#fbbf24'}" stroke="#0b0f19" stroke-width="1.5" data-tip="${esc(r.label)} 實際:${r.actual} (河道:${r.mean}±${Math.round(r.half)}) ${isOut ? '⚠️破岸異常!' : ''}"/>`;
        });
      }

      rows.forEach((r, i) => {
        svg += `<text x="${xAt(i)}" y="${padT + plotH + 22}" text-anchor="middle" fill="#cbd5e1" font-size="11">${esc(r.label)}</text>`;
      });
      svg += `<text x="${padL}" y="${padT - 8}" fill="#38bdf8" font-size="11.5">🌊 淺藍走廊 = 安全河道區間　|　虛線 = 預期中心線　|　<tspan fill="#fbbf24" font-weight="700">黃線 = 實際值 (紅點為破岸預警)</tspan></text>`;
    } else {
      const cy = padT + plotH / 2;
      const scale = 0.95 * bwMul;
      const cats = [
        { name: '核心產品線', color: '#38bdf8', vals: rows.map(r => r.mean * 0.6) },
        { name: '新創孵化線', color: '#818cf8', vals: rows.map(r => r.actual * 0.5) },
        { name: '維運基礎線', color: '#34d399', vals: rows.map(r => r.half * 1.8) }
      ];
      const totals = rows.map((_, i) => cats.reduce((s, c) => s + c.vals[i], 0));
      let runningOffset = rows.map((_, i) => -totals[i] / 2);

      cats.forEach((c) => {
        const yBotArr = runningOffset.map(v => cy + v * scale);
        const yTopArr = runningOffset.map((v, i) => cy + (v + c.vals[i]) * scale);
        const topPts = yTopArr.map((y, i) => `${xAt(i)},${y.toFixed(1)}`).join(' L ');
        const botPts = [...yBotArr].reverse().map((y, idx) => {
          const i = rows.length - 1 - idx;
          return `${xAt(i)},${y.toFixed(1)}`;
        }).join(' L ');
        svg += `<path d="M ${topPts} L ${botPts} Z" fill="${c.color}" fill-opacity="0.82" stroke="#0b0f19" stroke-width="1.5" data-tip="主題河流：${c.name}"/>`;
        runningOffset = runningOffset.map((v, i) => v + c.vals[i]);
      });

      rows.forEach((r, i) => {
        svg += `<text x="${xAt(i)}" y="${padT + plotH + 22}" text-anchor="middle" fill="#cbd5e1" font-size="11">${esc(r.label)}</text>`;
      });
    }
    return svg + '</svg>';
  }

  // 3. Bar / Column Chart
  function renderBar(p) {
    const lines = parseLines(p.customData);
    let data = lines.map(ln => {
      const [label, val] = ln.split(',').map(x => x.trim());
      return { label: label || '項目', val: Number(val) || 0 };
    }).filter(d => d.val > 0);

    if (data.length === 0) {
      data = [
        { label: 'AI客服引擎', val: 92 },
        { label: '會員權限中心', val: 84 },
        { label: '結帳金流模組', val: 68 },
        { label: '數據報表後台', val: 54 },
        { label: '推播通知服務', val: 47 }
      ];
    }

    if (p.sortMode === 'desc') data.sort((a, b) => b.val - a.val);
    if (p.sortMode === 'asc') data.sort((a, b) => a.val - b.val);

    const baseOffset = Number(p.yBaseline) || 0;
    const w = 720, h = 370;
    let svg = createSVG(w, h, p.customTitle);
    const maxVal = Math.max(100, ...data.map(d => d.val)) * 1.08;

    if (p.orientation === 'vertical') {
      const padL = 62, padR = 32, padT = 52, padB = 50;
      const plotW = w - padL - padR, plotH = h - padT - padB;

      for (let i = 0; i <= 4; i++) {
        const v = Math.round(baseOffset + ((maxVal - baseOffset) * i) / 4);
        const y = padT + plotH - (i / 4) * plotH;
        svg += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#94a3b8" stroke-opacity="0.14" stroke-dasharray="4 4"/>`;
        svg += `<text x="${padL - 10}" y="${y + 4}" text-anchor="end" fill="#cbd5e1" font-size="11">${v}</text>`;
      }

      const step = plotW / data.length;
      const barW = Math.min(64, step * 0.56);
      data.forEach((d, idx) => {
        const ratio = Math.max(0.02, (d.val - baseOffset) / Math.max(1, maxVal - baseOffset));
        const bh = ratio * plotH;
        const x = padL + idx * step + (step - barW) / 2;
        const y = padT + plotH - bh;
        const color = PALETTE[idx % PALETTE.length];
        svg += `<rect x="${x}" y="${y}" width="${barW}" height="${bh}" rx="6" fill="${color}" data-tip="${esc(d.label)}: ${d.val}"/>`;
        if (p.showValues) {
          svg += `<text x="${x + barW / 2}" y="${y - 7}" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="700">${d.val}</text>`;
        }
        svg += `<text x="${x + barW / 2}" y="${padT + plotH + 22}" text-anchor="middle" fill="#cbd5e1" font-size="11.5">${esc(d.label)}</text>`;
      });
    } else {
      const padL = 115, padR = 55, padT = 48, padB = 32;
      const plotW = w - padL - padR, plotH = h - padT - padB;
      const step = plotH / data.length;
      const barH = Math.min(36, step * 0.62);

      data.forEach((d, idx) => {
        const ratio = Math.max(0.02, (d.val - baseOffset) / Math.max(1, maxVal - baseOffset));
        const bw = ratio * plotW;
        const y = padT + idx * step + (step - barH) / 2;
        const color = PALETTE[idx % PALETTE.length];
        svg += `<text x="${padL - 10}" y="${y + barH / 2 + 4}" text-anchor="end" fill="#f8fafc" font-size="12">${esc(d.label)}</text>`;
        svg += `<rect x="${padL}" y="${y}" width="${bw}" height="${barH}" rx="6" fill="${color}" data-tip="${esc(d.label)}: ${d.val}"/>`;
        if (p.showValues) {
          svg += `<text x="${padL + bw + 8}" y="${y + barH / 2 + 4}" fill="#f8fafc" font-size="12" font-weight="700">${d.val}</text>`;
        }
      });
    }
    return svg + '</svg>';
  }

  // 4. Waterfall Chart
  function renderWaterfall(p) {
    const w = 720, h = 370, padL = 62, padR = 32, padT = 52, padB = 48;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const gScale = Number(p.growthBoost) / 100;
    const cScale = Number(p.costScale) / 100;

    const lines = parseLines(p.customData);
    let rawSteps = lines.map(ln => {
      const [label, valStr, typeStr] = ln.split(',').map(x => x.trim());
      const v = Number(valStr) || 0;
      const t = (typeStr || (v >= 0 ? 'plus' : 'minus')).toLowerCase();
      return {
        label: label || '項目',
        val: t === 'plus' ? Math.round(v * gScale) : (t === 'minus' ? -Math.abs(Math.round(v * cScale)) : v),
        type: t
      };
    });

    if (rawSteps.length < 2) {
      rawSteps = [
        { label: '原定基準工時', val: 100, type: 'total' },
        { label: '+客戶新增報表', val: Math.round(35 * gScale), type: 'plus' },
        { label: '+資安合規追加', val: Math.round(25 * gScale), type: 'plus' },
        { label: '-砍除次要動畫', val: -Math.round(20 * cScale), type: 'minus' },
        { label: '-自動化節省', val: -Math.round(15 * cScale), type: 'minus' },
        { label: '最終核定工時', val: 0, type: 'total' }
      ];
    }

    let running = 0;
    const bars = rawSteps.map((st, idx) => {
      if (idx === 0) {
        running = st.val;
        return { ...st, start: 0, end: running, display: running };
      }
      if (idx === rawSteps.length - 1 && st.type === 'total') {
        return { ...st, start: 0, end: running, display: running };
      }
      const prev = running;
      running += st.val;
      return { ...st, start: prev, end: running, display: st.val };
    });

    const maxV = Math.max(160, ...bars.map(b => Math.max(b.start, b.end))) * 1.15;
    const toY = (v) => padT + plotH - (Math.max(0, v) / maxV) * plotH;

    let svg = createSVG(w, h, p.customTitle);
    for (let i = 0; i <= 4; i++) {
      const v = Math.round((maxV * i) / 4);
      const y = toY(v);
      svg += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#94a3b8" stroke-opacity="0.14" stroke-dasharray="4 4"/>`;
      svg += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="#cbd5e1" font-size="11">${v}</text>`;
    }

    const step = plotW / bars.length;
    const bw = Math.min(62, step * 0.56);

    bars.forEach((b, i) => {
      const x = padL + i * step + (step - bw) / 2;
      const yTop = toY(Math.max(b.start, b.end));
      const yBot = toY(Math.min(b.start, b.end));
      const bh = Math.max(4, yBot - yTop);
      const color = b.type === 'total' ? '#38bdf8' : (b.type === 'plus' ? '#34d399' : '#fb7185');

      svg += `<rect x="${x}" y="${yTop}" width="${bw}" height="${bh}" rx="5" fill="${color}" data-tip="${esc(b.label)}: ${b.display > 0 && b.type !== 'total' ? '+' : ''}${b.display}"/>`;
      svg += `<text x="${x + bw / 2}" y="${yTop - 7}" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="700">${b.display > 0 && b.type !== 'total' ? '+' : ''}${b.display}</text>`;
      svg += `<text x="${x + bw / 2}" y="${padT + plotH + 22}" text-anchor="middle" fill="#cbd5e1" font-size="11.5">${esc(b.label)}</text>`;

      if (p.showConnectors && i < bars.length - 1) {
        const nextX = padL + (i + 1) * step + (step - bw) / 2;
        const connY = toY(b.end);
        svg += `<line x1="${x + bw}" y1="${connY}" x2="${nextX}" y2="${connY}" stroke="#cbd5e1" stroke-opacity="0.45" stroke-dasharray="3 3"/>`;
      }
    });

    return svg + '</svg>';
  }

  // 5. Line Chart
  function renderLine(p) {
    const w = 720, h = 370, padL = 58, padR = 32, padT = 54, padB = 45;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const vol = Number(p.volatility) || 0;
    const slope = Number(p.slope) || 0;
    const noiseSeeds = [0.2, -0.7, 0.5, -0.4, 0.9, -0.6, 0.3, 0.8, -0.5, 0.4, -0.3, 0.6];

    const lines = parseLines(p.customData);
    let pts = lines.map((ln, i) => {
      const [m, v] = ln.split(',').map(x => x.trim());
      const base = (Number(v) || 50) + (i / Math.max(1, lines.length - 1)) * slope;
      return { m: m || `T${i + 1}`, val: Math.max(5, Math.round(base + (noiseSeeds[i % noiseSeeds.length] * vol))) };
    });

    if (pts.length < 2) {
      pts = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'].map((m, i) => ({
        m,
        val: Math.round(45 + i * 4 + slope * (i / 7) + noiseSeeds[i] * vol)
      }));
    }

    const maPts = pts.map((d, i) => {
      const slice = pts.slice(Math.max(0, i - 2), i + 1);
      return { m: d.m, val: Math.round(slice.reduce((s, x) => s + x.val, 0) / slice.length) };
    });

    const allVals = pts.map(d => d.val);
    const minV = Math.max(0, Math.min(...allVals) - 12);
    const maxV = Math.max(...allVals) + 15;

    let svg = createSVG(w, h, p.customTitle);
    for (let i = 0; i <= 4; i++) {
      const v = Math.round(minV + ((maxV - minV) * i) / 4);
      const y = padT + plotH - (i / 4) * plotH;
      svg += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#94a3b8" stroke-opacity="0.14" stroke-dasharray="4 4"/>`;
      svg += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="#cbd5e1" font-size="11">${v}</text>`;
    }

    const toCoord = (arr) => arr.map((d, i) => ({
      x: padL + (i / (arr.length - 1)) * plotW,
      y: padT + plotH - ((d.val - minV) / Math.max(1, maxV - minV)) * plotH,
      val: d.val,
      m: d.m
    }));

    const coords = toCoord(pts);
    const maCoords = toCoord(maPts);

    const buildPath = (cArr, smooth) => {
      if (!smooth) return cArr.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
      let d = `M ${cArr[0].x.toFixed(1)},${cArr[0].y.toFixed(1)}`;
      for (let i = 0; i < cArr.length - 1; i++) {
        const p0 = cArr[i], p1 = cArr[i + 1];
        const midX = (p0.x + p1.x) / 2;
        d += ` C ${midX.toFixed(1)},${p0.y.toFixed(1)} ${midX.toFixed(1)},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
      }
      return d;
    };

    svg += `<path d="${buildPath(coords, p.smooth)}" fill="none" stroke="#38bdf8" stroke-width="3"/>`;
    if (p.showMA) {
      svg += `<path d="${buildPath(maCoords, true)}" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="6 4"/>`;
    }

    coords.forEach((c) => {
      svg += `<circle cx="${c.x}" cy="${c.y}" r="5" fill="#38bdf8" stroke="#0b0f19" stroke-width="2" data-tip="${esc(c.m)}: ${c.val}"/>`;
      svg += `<text x="${c.x}" y="${padT + plotH + 22}" text-anchor="middle" fill="#cbd5e1" font-size="11.5">${esc(c.m)}</text>`;
    });

    return svg + '</svg>';
  }

  // 6. Funnel Chart
  function renderFunnel(p) {
    const w = 720, h = 370, cx = 310;
    const lines = parseLines(p.customData);
    let stages = lines.map((ln, idx) => {
      const [name, rateStr] = ln.split(',').map(x => x.trim());
      return {
        name: name || `階段 ${idx + 1}`,
        rate: Math.max(2, Math.min(100, Number(rateStr) || 50)),
        color: PALETTE[idx % PALETTE.length]
      };
    });

    if (stages.length < 2) {
      const r2 = Number(p.step2Rate);
      const r3 = Math.min(r2, Number(p.step3Rate));
      const r4 = Math.min(r3, Number(p.step4Rate));
      stages = [
        { name: '1. 看到新功能提示', rate: 100, color: '#38bdf8' },
        { name: '2. 點擊進入體驗', rate: r2, color: '#818cf8' },
        { name: '3. 完成首次操作', rate: r3, color: '#a78bfa' },
        { name: '4. 隔週回訪留存', rate: r4, color: '#34d399' }
      ];
    }

    const maxW = 430;
    const topY = 50;
    const stepH = Math.min(64, Math.floor((h - topY - 30) / stages.length) - 6);
    let svg = createSVG(w, h, p.customTitle);

    stages.forEach((st, i) => {
      const nextRate = i < stages.length - 1 ? stages[i + 1].rate : st.rate * 0.82;
      const wTop = (st.rate / 100) * maxW;
      const wBot = (nextRate / 100) * maxW;
      const y1 = topY + i * (stepH + 6);
      const y2 = y1 + stepH;

      const pts = `${cx - wTop / 2},${y1} ${cx + wTop / 2},${y1} ${cx + wBot / 2},${y2} ${cx - wBot / 2},${y2}`;
      svg += `<polygon points="${pts}" fill="${st.color}" fill-opacity="0.86" data-tip="${esc(st.name)}: ${st.rate}%"/>`;
      svg += `<text x="${cx}" y="${y1 + stepH / 2 + 5}" text-anchor="middle" fill="#0b0f19" font-size="13" font-weight="800">${esc(st.name)} · ${st.rate}%</text>`;

      if (p.showDropoff && i > 0) {
        const conv = Math.round((st.rate / stages[i - 1].rate) * 100);
        svg += `<text x="${cx + maxW / 2 + 20}" y="${y1 + 12}" fill="#cbd5e1" font-size="12">↳ 環比轉化: <tspan fill="#fbbf24" font-weight="700">${conv}%</tspan></text>`;
      }
    });

    return svg + '</svg>';
  }

  // 7. Bubble Priority Matrix Chart
  function renderBubble(p) {
    const w = 720, h = 370, padL = 58, padR = 32, padT = 50, padB = 45;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const scale = Number(p.sizeScale) / 100;

    const lines = parseLines(p.customData);
    let items = lines.map((ln, idx) => {
      const parts = ln.split(',').map(x => x.trim());
      return {
        name: parts[0] || `項目${idx + 1}`,
        x: Math.max(5, Math.min(95, Number(parts[1]) || 50)),
        y: Math.max(5, Math.min(95, Number(parts[2]) || 50)),
        rev: Math.max(10, Number(parts[3]) || 60),
        color: parts[4] || PALETTE[idx % PALETTE.length]
      };
    });

    let svg = createSVG(w, h, p.customTitle);
    const toX = (v) => padL + (v / 100) * plotW;
    const toY = (v) => padT + plotH - (v / 100) * plotH;

    if (p.showQuadrants) {
      svg += `<line x1="${toX(50)}" y1="${padT}" x2="${toX(50)}" y2="${padT + plotH}" stroke="#94a3b8" stroke-opacity="0.3" stroke-dasharray="5 5"/>`;
      svg += `<line x1="${padL}" y1="${toY(50)}" x2="${w - padR}" y2="${toY(50)}" stroke="#94a3b8" stroke-opacity="0.3" stroke-dasharray="5 5"/>`;
      svg += `<text x="${w - padR - 8}" y="${padT + 18}" text-anchor="end" fill="#38bdf8" font-size="11.5" font-weight="700">★ 第一象限：高價值 × 高可行性 (優先排入)</text>`;
      svg += `<text x="${padL + 8}" y="${padT + 18}" fill="#818cf8" font-size="11.5" font-weight="700">🚀 第二象限：高價值長期戰略</text>`;
    }

    items.forEach((d) => {
      const r = Math.sqrt(d.rev) * 2.3 * scale;
      svg += `<circle cx="${toX(d.x)}" cy="${toY(d.y)}" r="${r.toFixed(1)}" fill="${d.color}" fill-opacity="0.62" stroke="${d.color}" stroke-width="2" data-tip="${esc(d.name)} | 可行性:${d.x} 商業價值:${d.y} 規模:${d.rev}"/>`;
      if (p.showLabels) {
        svg += `<text x="${toX(d.x)}" y="${toY(d.y) + 4}" text-anchor="middle" fill="#f8fafc" font-size="11.5" font-weight="700">${esc(d.name)}</text>`;
      }
    });

    svg += `<text x="${padL + plotW / 2}" y="${h - 10}" text-anchor="middle" fill="#cbd5e1" font-size="12">實作可行性 (X) × 商業價值影響力 (Y) × 氣泡面積=規模</text>`;
    return svg + '</svg>';
  }

  // 8. Bullet Chart
  function renderBullet(p) {
    const w = 720, h = 370, padL = 140, padR = 50;
    const plotW = w - padL - padR;
    const targetShift = Number(p.targetLevel) / 100;
    const actualMul = Number(p.actualBoost) / 100;

    const lines = parseLines(p.customData);
    let kpis = lines.map(ln => {
      const [name, act, tgt] = ln.split(',').map(x => x.trim());
      return {
        name: name || 'KPI',
        actual: Math.min(100, Math.round((Number(act) || 80) * actualMul)),
        target: Math.min(98, Math.round((Number(tgt) || 85) * targetShift))
      };
    });

    let svg = createSVG(w, h, p.customTitle);
    const stepY = Math.min(68, Math.floor((h - 85) / kpis.length));
    kpis.forEach((k, idx) => {
      const y = 52 + idx * stepY;
      const barH = 36;
      svg += `<text x="${padL - 12}" y="${y + barH / 2 + 5}" text-anchor="end" fill="#f8fafc" font-size="12.5" font-weight="600">${esc(k.name)}</text>`;

      if (p.showZones) {
        svg += `<rect x="${padL}" y="${y}" width="${plotW * 0.6}" height="${barH}" rx="4" fill="#94a3b8" fill-opacity="0.12"/>`;
        svg += `<rect x="${padL + plotW * 0.6}" y="${y}" width="${plotW * 0.25}" height="${barH}" fill="#94a3b8" fill-opacity="0.22"/>`;
        svg += `<rect x="${padL + plotW * 0.85}" y="${y}" width="${plotW * 0.15}" height="${barH}" rx="4" fill="#94a3b8" fill-opacity="0.32"/>`;
      }

      const actW = (k.actual / 100) * plotW;
      const tgtX = padL + (k.target / 100) * plotW;
      const color = k.actual >= k.target ? '#34d399' : '#38bdf8';

      svg += `<rect x="${padL}" y="${y + 10}" width="${actW}" height="${barH - 20}" rx="3" fill="${color}" data-tip="${esc(k.name)} | 實際: ${k.actual}% / 目標: ${k.target}%"/>`;
      svg += `<line x1="${tgtX}" y1="${y + 4}" x2="${tgtX}" y2="${y + barH - 4}" stroke="#fbbf24" stroke-width="3.5" data-tip="目標線: ${k.target}%"/>`;
      svg += `<text x="${padL + plotW + 8}" y="${y + barH / 2 + 5}" fill="#f8fafc" font-size="12" font-weight="700">${k.actual}%</text>`;
    });

    svg += `<text x="${padL}" y="${h - 12}" fill="#cbd5e1" font-size="11.5">■ 中心條 = 實際達成　|　<tspan fill="#fbbf24" font-weight="700">┃ 亮黃垂直線 = 目標值 (Target)</tspan></text>`;
    return svg + '</svg>';
  }

  // 9. Radar Chart
  function renderRadar(p) {
    const lines = parseLines(p.customData);
    let allAxes = lines.map(ln => {
      const [label, a, b] = ln.split(',').map(x => x.trim());
      return { label: label || '維度', a: Number(a) || 80, b: Number(b) || 70 };
    });

    const n = Math.min(allAxes.length, Number(p.axisCount) || 6);
    const axes = allAxes.slice(0, n);
    const w = 720, h = 370, cx = 295, cy = 192, R = 118;
    const op = (Number(p.fillOpacity) / 100).toFixed(2);
    let svg = createSVG(w, h, p.customTitle);

    [0.25, 0.5, 0.75, 1].forEach((lvl) => {
      const pts = axes.map((_, i) => {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return `${(cx + R * lvl * Math.cos(ang)).toFixed(1)},${(cy + R * lvl * Math.sin(ang)).toFixed(1)}`;
      }).join(' ');
      svg += `<polygon points="${pts}" fill="none" stroke="#94a3b8" stroke-opacity="0.22"/>`;
    });

    axes.forEach((ax, i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const x2 = cx + R * Math.cos(ang), y2 = cy + R * Math.sin(ang);
      const lx = cx + (R + 28) * Math.cos(ang), ly = cy + (R + 22) * Math.sin(ang);
      svg += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#94a3b8" stroke-opacity="0.22"/>`;
      svg += `<text x="${lx}" y="${ly + 4}" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="600">${esc(ax.label)}</text>`;
    });

    const buildPoly = (key, color, name) => {
      const pts = axes.map((ax, i) => {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const val = Math.min(100, Math.max(0, ax[key])) / 100;
        return { x: cx + R * val * Math.cos(ang), y: cy + R * val * Math.sin(ang), label: ax.label, score: ax[key] };
      });
      const polyStr = pts.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
      svg += `<polygon points="${polyStr}" fill="${color}" fill-opacity="${op}" stroke="${color}" stroke-width="2.5"/>`;
      pts.forEach(pt => {
        svg += `<circle cx="${pt.x}" cy="${pt.y}" r="4.5" fill="${color}" data-tip="${name} - ${esc(pt.label)}: ${pt.score}分"/>`;
      });
    };

    buildPoly('a', '#38bdf8', '方案 A');
    if (p.compareSecond) buildPoly('b', '#fbbf24', '方案 B');

    svg += `<g transform="translate(515, 70)">
      <rect x="0" y="0" width="14" height="14" rx="3" fill="#38bdf8"/><text x="22" y="12" fill="#f8fafc" font-size="12.5">方案 A</text>
      ${p.compareSecond ? `<rect x="0" y="28" width="14" height="14" rx="3" fill="#fbbf24"/><text x="22" y="40" fill="#f8fafc" font-size="12.5">方案 B</text>` : ''}
    </g>`;

    return svg + '</svg>';
  }

  // 10. Heatmap
  function renderHeatmap(p) {
    const w = 720, h = 370, padL = 95, padR = 25, padT = 62, padB = 30;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const cols = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
    const lines = parseLines(p.customData);
    const rows = lines.map(ln => {
      const [name, valsStr] = ln.split('|').map(x => (x || '').trim());
      const vals = (valsStr || '').split(',').map(v => Number(v.trim()) || 50).slice(0, 6);
      while (vals.length < 6) vals.push(50);
      return { name: name || '團隊', vals };
    });

    const contrast = Number(p.contrast) / 100;
    let svg = createSVG(w, h, p.customTitle);
    const cw = plotW / cols.length;
    const ch = plotH / rows.length;

    const getColor = (val) => {
      const norm = Math.max(0, Math.min(1, ((val - 50) * contrast + 50) / 100));
      if (p.palette === 'emerald') return `rgb(20, ${Math.round(60 + norm * 175)}, ${Math.round(80 + norm * 80)})`;
      if (p.palette === 'diverging') {
        if (norm < 0.5) return `rgb(${Math.round(56 + norm * 360)}, ${Math.round(189 + norm * 100)}, 248)`;
        const t = (norm - 0.5) * 2;
        return `rgb(251, ${Math.round(210 - t * 130)}, ${Math.round(210 - t * 110)})`;
      }
      return `rgba(56, 189, 248, ${(0.18 + norm * 0.8).toFixed(2)})`;
    };

    rows.forEach((row, r) => {
      const y = padT + r * ch;
      svg += `<text x="${padL - 10}" y="${y + ch / 2 + 4}" text-anchor="end" fill="#f8fafc" font-size="12">${esc(row.name)}</text>`;
      row.vals.forEach((val, c) => {
        const x = padL + c * cw;
        svg += `<rect x="${x + 2}" y="${y + 2}" width="${cw - 4}" height="${ch - 4}" rx="6" fill="${getColor(val)}" data-tip="${esc(row.name)} ${cols[c]}: ${val}%"/>`;
        if (p.showNumbers) {
          svg += `<text x="${x + cw / 2}" y="${y + ch / 2 + 5}" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">${val}%</text>`;
        }
      });
    });

    cols.forEach((col, c) => {
      svg += `<text x="${padL + c * cw + cw / 2}" y="${padT - 10}" text-anchor="middle" fill="#cbd5e1" font-size="12">${col}</text>`;
    });

    return svg + '</svg>';
  }

  // 11. Pie / Donut Chart
  function renderPie(p) {
    const lines = parseLines(p.customData);
    let rawItems = lines.map(ln => {
      const [name, val] = ln.split(',').map(x => x.trim());
      return { name: name || '項目', val: Math.max(0.1, Number(val) || 10) };
    });

    const count = Math.min(rawItems.length, Number(p.sliceCount) || 4);
    const chosen = rawItems.slice(0, count);
    if (rawItems.length > count) {
      const restSum = rawItems.slice(count).reduce((s, x) => s + x.val, 0);
      chosen.push({ name: '其他項目', val: Number(restSum.toFixed(1)) });
    }

    const total = chosen.reduce((s, x) => s + x.val, 0) || 100;
    const w = 720, h = 370, cx = 235, cy = 195, R = 122;
    const r = (Number(p.innerRadius) / 100) * R;
    let svg = createSVG(w, h, p.customTitle);

    let startAngle = -Math.PI / 2;
    chosen.forEach((item, idx) => {
      const frac = item.val / total;
      const angle = frac * Math.PI * 2;
      const endAngle = startAngle + angle;
      const midAngle = startAngle + angle / 2;
      const explode = (idx === 0 && p.explodeFirst) ? 12 : 0;
      const ox = Math.cos(midAngle) * explode, oy = Math.sin(midAngle) * explode;

      const x1 = cx + ox + R * Math.cos(startAngle), y1 = cy + oy + R * Math.sin(startAngle);
      const x2 = cx + ox + R * Math.cos(endAngle), y2 = cy + oy + R * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const color = PALETTE[idx % PALETTE.length];

      let pathD = '';
      if (r <= 1) {
        pathD = `M ${cx + ox} ${cy + oy} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      } else {
        const ix1 = cx + ox + r * Math.cos(endAngle), iy1 = cy + oy + r * Math.sin(endAngle);
        const ix2 = cx + ox + r * Math.cos(startAngle), iy2 = cy + oy + r * Math.sin(startAngle);
        pathD = `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${r} ${r} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
      }

      const pct = ((item.val / total) * 100).toFixed(1);
      svg += `<path d="${pathD}" fill="${color}" stroke="#0b0f19" stroke-width="2" data-tip="${esc(item.name)}: ${pct}%"/>`;
      startAngle = endAngle;
    });

    if (r > 35) {
      svg += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#cbd5e1" font-size="12">總計</text>`;
      svg += `<text x="${cx}" y="${cy + 18}" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="800">100%</text>`;
    }

    chosen.forEach((item, idx) => {
      const ly = 72 + idx * 34;
      const color = PALETTE[idx % PALETTE.length];
      const pct = ((item.val / total) * 100).toFixed(1);
      svg += `<rect x="420" y="${ly - 11}" width="14" height="14" rx="4" fill="${color}"/>`;
      svg += `<text x="444" y="${ly}" fill="#f8fafc" font-size="13">${esc(item.name)}</text>`;
      svg += `<text x="665" y="${ly}" text-anchor="end" fill="#38bdf8" font-weight="700" font-size="13">${pct}%</text>`;
    });

    return svg + '</svg>';
  }

  // 12. Treemap
  function renderTreemap(p) {
    const w = 720, h = 370, pad = Number(p.gap);
    const lines = parseLines(p.customData);
    const coords = [
      { x: 25, y: 46, bw: 280, bh: 295, color: '#0284c7' },
      { x: 305, y: 46, bw: 230, bh: 170, color: '#4f46e5' },
      { x: 535, y: 46, bw: 160, bh: 170, color: '#7c3aed' },
      { x: 305, y: 216, bw: 195, bh: 125, color: '#0d9488' },
      { x: 500, y: 216, bw: 115, bh: 125, color: '#d97706' },
      { x: 615, y: 216, bw: 80, bh: 125, color: '#475569' }
    ];

    let svg = createSVG(w, h, p.customTitle);
    coords.forEach((b, idx) => {
      const ln = lines[idx] || `模組 ${idx + 1}, 15, +正常`;
      const [name, pct, status] = ln.split(',').map(x => (x || '').trim());
      const isBad = (status || '').includes('-');
      const fill = p.colorBy === 'performance' ? (isBad ? '#e11d48' : '#059669') : b.color;
      const rx = b.x + pad / 2, ry = b.y + pad / 2;
      const rw = b.bw - pad, rh = b.bh - pad;
      svg += `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="8" fill="${fill}" fill-opacity="0.86" data-tip="${esc(name)}: ${pct}% (${esc(status)})"/>`;
      svg += `<text x="${rx + 12}" y="${ry + 26}" fill="#ffffff" font-size="13" font-weight="700">${esc(name)}</text>`;
      if (p.showPct) {
        svg += `<text x="${rx + 12}" y="${ry + 48}" fill="rgba(255,255,255,0.9)" font-size="12" font-weight="600">${pct}% (${esc(status)})</text>`;
      }
    });
    return svg + '</svg>';
  }

  // 13. Sankey Diagram
  function renderSankey(p) {
    const w = 720, h = 370;
    const shift = Number(p.flowShift) / 100;
    const curv = Number(p.curvature) / 100;
    const vCloud = Math.round(60 * shift), vEnterprise = 40;
    const total = vCloud + vEnterprise;
    const vProfit = Math.round(total * 0.36), vRD = Math.round(total * 0.38), vOps = total - vProfit - vRD;

    let svg = createSVG(w, h, p.customTitle);
    const xL = 55, xM = 335, xR = 615, nodeW = 22, s = 1.75, midY = 72;
    const hCloud = vCloud * s, hEnt = vEnterprise * s, hTotal = total * s;
    const hProf = vProfit * s, hRD = vRD * s, hOps = vOps * s;

    const drawRibbon = (x1, y1, x2, y2, thick, color, tip) => {
      const cx1 = x1 + (x2 - x1) * curv, cx2 = x2 - (x2 - x1) * curv;
      svg += `<path d="M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${thick}" stroke-opacity="0.48" data-tip="${tip}"/>`;
    };
    const drawNode = (x, y, nh, color, label, val, alignLeft = true) => {
      svg += `<rect x="${x}" y="${y}" width="${nodeW}" height="${nh}" rx="5" fill="${color}"/>`;
      const tx = alignLeft ? x + nodeW + 8 : x - 8;
      svg += `<text x="${tx}" y="${y + nh / 2 + 4}" text-anchor="${alignLeft ? 'start' : 'end'}" fill="#f8fafc" font-size="12" font-weight="600">${label}${p.showFlowValues ? ` (${val}M)` : ''}</text>`;
    };

    drawRibbon(xL + nodeW, 72 + hCloud / 2, xM, midY + hCloud / 2, hCloud, '#38bdf8', `AI雲端 → 總資源池: ${vCloud}M`);
    drawRibbon(xL + nodeW, 212 + hEnt / 2, xM, midY + hCloud + hEnt / 2, hEnt, '#818cf8', `企業授權 → 總資源池: ${vEnterprise}M`);
    drawRibbon(xM + nodeW, midY + hProf / 2, xR, 60 + hProf / 2, hProf, '#34d399', `總池 → 商業淨利: ${vProfit}M`);
    drawRibbon(xM + nodeW, midY + hProf + hRD / 2, xR, 162 + hRD / 2, hRD, '#fbbf24', `總池 → 研發投入: ${vRD}M`);
    drawRibbon(xM + nodeW, midY + hProf + hRD + hOps / 2, xR, 265 + hOps / 2, hOps, '#fb7185', `總池 → 營運成本: ${vOps}M`);

    drawNode(xL, 72, hCloud, '#38bdf8', 'AI 雲端訂閱', vCloud, true);
    drawNode(xL, 212, hEnt, '#818cf8', '企業授權', vEnterprise, true);
    drawNode(xM, midY, hTotal, '#e2e8f0', '總資源匯聚', total, true);
    drawNode(xR, 60, hProf, '#34d399', '商業淨利', vProfit, false);
    drawNode(xR, 162, hRD, '#fbbf24', '研發再投入', vRD, false);
    drawNode(xR, 265, hOps, '#fb7185', '營運成本', vOps, false);

    return svg + '</svg>';
  }

  // 14. Area / Cumulative Flow Diagram (CFD)
  function renderArea(p) {
    const w = 720, h = 370, padL = 58, padR = 32, padT = 56, padB = 45;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const alpha = (Number(p.opacity) / 100).toFixed(2);
    const lines = parseLines(p.customData);
    const rows = lines.map(ln => {
      const [q, v1, v2, v3] = ln.split(',').map(x => x.trim());
      return { q: q || 'W', s1: Number(v1) || 20, s2: Number(v2) || 20, s3: Number(v3) || 15 };
    });

    const mode = p.mode;
    const maxVal = mode === 'percent' ? 100 : Math.max(150, ...rows.map(r => r.s1 + r.s2 + r.s3)) * 1.08;
    let svg = createSVG(w, h, p.customTitle);

    for (let i = 0; i <= 4; i++) {
      const v = Math.round((maxVal * i) / 4);
      const y = padT + plotH - (i / 4) * plotH;
      svg += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#94a3b8" stroke-opacity="0.14" stroke-dasharray="4 4"/>`;
      svg += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="#cbd5e1" font-size="11">${v}${mode === 'percent' ? '%' : ''}</text>`;
    }

    const xAt = (i) => padL + (i / (rows.length - 1)) * plotW;
    const yAt = (val) => padT + plotH - (val / maxVal) * plotH;
    const seriesMeta = [
      { name: '已完成 (Done)', color: '#38bdf8', vals: rows.map(r => r.s1) },
      { name: '進行中 (WIP)', color: '#818cf8', vals: rows.map(r => r.s2) },
      { name: '待處理 (To-Do)', color: '#34d399', vals: rows.map(r => r.s3) }
    ];

    if (mode === 'overlap') {
      seriesMeta.forEach((s) => {
        const topPts = s.vals.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' L ');
        svg += `<path d="M ${xAt(0)},${yAt(0)} L ${topPts} L ${xAt(rows.length - 1)},${yAt(0)} Z" fill="${s.color}" fill-opacity="${alpha}" stroke="${s.color}" stroke-width="2"/>`;
      });
    } else {
      let prevTop = rows.map(() => 0);
      seriesMeta.forEach((s) => {
        const currTop = s.vals.map((v, i) => {
          const sumAll = rows[i].s1 + rows[i].s2 + rows[i].s3 || 1;
          const val = mode === 'percent' ? (v / sumAll) * 100 : v;
          return prevTop[i] + val;
        });
        const topLine = currTop.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' L ');
        const botLine = [...prevTop].reverse().map((v, idx) => `${xAt(rows.length - 1 - idx)},${yAt(v)}`).join(' L ');
        svg += `<path d="M ${topLine} L ${botLine} Z" fill="${s.color}" fill-opacity="${alpha}" stroke="${s.color}" stroke-width="2"/>`;
        prevTop = currTop;
      });
    }

    rows.forEach((r, i) => {
      svg += `<text x="${xAt(i)}" y="${padT + plotH + 22}" text-anchor="middle" fill="#cbd5e1" font-size="12">${esc(r.q)}</text>`;
    });

    seriesMeta.forEach((s, i) => {
      svg += `<rect x="${padL + i * 145}" y="34" width="12" height="12" rx="3" fill="${s.color}"/>`;
      svg += `<text x="${padL + i * 145 + 18}" y="44" fill="#f8fafc" font-size="11.5">${s.name}</text>`;
    });

    return svg + '</svg>';
  }

  // 15. Scatter Plot
  function renderScatter(p) {
    const w = 720, h = 370, padL = 58, padR = 32, padT = 50, padB = 45;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const rTarget = Number(p.correlation) / 100;
    const N = Number(p.sampleCount);

    const pts = [];
    for (let i = 0; i < N; i++) {
      const u1 = ((i * 37 + 13) % 97) / 97, u2 = ((i * 53 + 29) % 89) / 89;
      const z1 = (u1 - 0.5) * 2.2, z2 = (u2 - 0.5) * 2.2;
      const yNorm = rTarget * z1 + Math.sqrt(Math.max(0, 1 - rTarget * rTarget)) * z2;
      pts.push({ x: Math.min(95, Math.max(5, 50 + z1 * 32)), y: Math.min(95, Math.max(5, 50 + yNorm * 32)), outlier: false });
    }
    if (p.showOutlier) {
      pts.push({ x: 22, y: 88, outlier: true });
      pts.push({ x: 28, y: 92, outlier: true });
    }

    const meanX = pts.reduce((s, d) => s + d.x, 0) / pts.length;
    const meanY = pts.reduce((s, d) => s + d.y, 0) / pts.length;
    const b1 = (pts.reduce((s, d) => s + (d.x - meanX) * (d.y - meanY), 0)) / (pts.reduce((s, d) => s + (d.x - meanX) ** 2, 0) || 1);
    const b0 = meanY - b1 * meanX;

    let svg = createSVG(w, h, p.customTitle);
    const toX = (v) => padL + (v / 100) * plotW;
    const toY = (v) => padT + plotH - (v / 100) * plotH;

    for (let i = 0; i <= 4; i++) {
      const v = i * 25, y = toY(v);
      svg += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#94a3b8" stroke-opacity="0.14" stroke-dasharray="4 4"/>`;
      svg += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="#cbd5e1" font-size="11">${v}</text>`;
    }

    if (p.showTrend) {
      svg += `<line x1="${toX(5)}" y1="${toY(Math.max(0, Math.min(100, b0 + b1 * 5)))}" x2="${toX(95)}" y2="${toY(Math.max(0, Math.min(100, b0 + b1 * 95)))}" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="6 4"/>`;
    }

    pts.forEach((d, idx) => {
      svg += `<circle cx="${toX(d.x)}" cy="${toY(d.y)}" r="${d.outlier ? 7 : 5}" fill="${d.outlier ? '#fb7185' : '#38bdf8'}" fill-opacity="0.85" stroke="#0b0f19" stroke-width="1.5" data-tip="${d.outlier ? '⚠️ 嚴重低估異常點' : '任務 #' + (idx + 1)} (預估=${d.x.toFixed(0)}, 實際=${d.y.toFixed(0)})"/>`;
    });

    return svg + '</svg>';
  }

  // 16. Box Plot
  function renderBoxPlot(p) {
    const w = 720, h = 370, padL = 58, padR = 32, padT = 50, padB = 45;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const spread = Number(p.spread) / 100;
    const lines = parseLines(p.customData);
    const groups = lines.map((ln, idx) => {
      const [name, med, q1, q3, out] = ln.split(',').map(x => x.trim());
      return {
        name: name || `組別 ${idx + 1}`,
        med: Number(med) || 55,
        q1: Number(q1) || 42,
        q3: Number(q3) || 68,
        outliers: out ? [Number(out)] : [],
        color: PALETTE[idx % PALETTE.length]
      };
    });

    let svg = createSVG(w, h, p.customTitle);
    const toY = (v) => padT + plotH - (Math.max(5, Math.min(98, v)) / 100) * plotH;

    for (let i = 0; i <= 4; i++) {
      const v = i * 25, y = toY(v);
      svg += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#94a3b8" stroke-opacity="0.14" stroke-dasharray="4 4"/>`;
      svg += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="#cbd5e1" font-size="11">${v}h</text>`;
    }

    const step = plotW / groups.length;
    groups.forEach((g, idx) => {
      const cx = padL + idx * step + step / 2;
      const q1 = g.med - (g.med - g.q1) * spread;
      const q3 = g.med + (g.q3 - g.med) * spread;
      const iqr = q3 - q1;
      const lowW = Math.max(8, q1 - 1.2 * iqr), highW = Math.min(94, q3 + 1.2 * iqr);

      svg += `<line x1="${cx}" y1="${toY(highW)}" x2="${cx}" y2="${toY(lowW)}" stroke="${g.color}" stroke-width="2"/>`;
      svg += `<line x1="${cx - 16}" y1="${toY(highW)}" x2="${cx + 16}" y2="${toY(highW)}" stroke="${g.color}" stroke-width="2"/>`;
      svg += `<line x1="${cx - 16}" y1="${toY(lowW)}" x2="${cx + 16}" y2="${toY(lowW)}" stroke="${g.color}" stroke-width="2"/>`;

      const boxTop = toY(q3), boxH = Math.max(6, toY(q1) - boxTop);
      svg += `<rect x="${cx - 30}" y="${boxTop}" width="60" height="${boxH}" rx="4" fill="${g.color}" fill-opacity="0.28" stroke="${g.color}" stroke-width="2" data-tip="${esc(g.name)} | Q1:${q1.toFixed(0)} 中位數:${g.med} Q3:${q3.toFixed(0)}"/>`;
      svg += `<line x1="${cx - 30}" y1="${toY(g.med)}" x2="${cx + 30}" y2="${toY(g.med)}" stroke="#fff" stroke-width="2.5"/>`;

      if (p.showJitter) {
        [-12, -6, 4, 11, -3, 8].forEach((jx, jIdx) => {
          svg += `<circle cx="${cx + jx}" cy="${toY(q1 + ((jIdx + 0.5) / 6) * iqr)}" r="2.8" fill="#fff" fill-opacity="0.65"/>`;
        });
      }
      if (p.showOutliers) {
        g.outliers.forEach(ov => {
          svg += `<circle cx="${cx}" cy="${toY(ov)}" r="5.5" fill="#fb7185" stroke="#0b0f19" stroke-width="1.5" data-tip="離群值: ${ov}h"/>`;
        });
      }
      svg += `<text x="${cx}" y="${padT + plotH + 22}" text-anchor="middle" fill="#f8fafc" font-size="12">${esc(g.name)}</text>`;
    });

    return svg + '</svg>';
  }

  // 17. Histogram
  function renderHistogram(p) {
    const w = 720, h = 370, padL = 58, padR = 32, padT = 52, padB = 45;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const bins = Number(p.binCount);
    const type = p.distType;

    const samples = [];
    for (let i = 0; i < 300; i++) {
      const u = (i + 0.5) / 300;
      let val = 50;
      if (type === 'normal') val = 50 + Math.sin(i * 1.7) * 16 + Math.cos(i * 3.1) * 12;
      else if (type === 'bimodal') val = (i % 2 === 0 ? 30 : 72) + Math.sin(i * 2.3) * 10 + Math.cos(i * 5.1) * 6;
      else val = 12 + Math.pow(u, 2.2) * 78 + Math.sin(i * 4.3) * 4;
      samples.push(Math.max(1, Math.min(99, val)));
    }

    const counts = new Array(bins).fill(0);
    samples.forEach(v => { counts[Math.min(bins - 1, Math.floor((v / 100) * bins))]++; });
    const maxC = Math.max(...counts, 10);
    const mean = samples.reduce((s, x) => s + x, 0) / samples.length;
    const sorted = [...samples].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    let svg = createSVG(w, h, p.customTitle);
    const binW = plotW / bins;
    counts.forEach((c, i) => {
      const bh = (c / maxC) * plotH;
      const x = padL + i * binW, y = padT + plotH - bh;
      svg += `<rect x="${x + 0.8}" y="${y}" width="${Math.max(2, binW - 1.6)}" height="${bh}" fill="#38bdf8" fill-opacity="0.78" stroke="#0b0f19" stroke-width="1" data-tip="區間 [${Math.round((i / bins) * 100)}~${Math.round(((i + 1) / bins) * 100)}]: ${c} 筆"/>`;
    });

    if (p.showMeanMedian) {
      const mx = padL + (mean / 100) * plotW, mdx = padL + (median / 100) * plotW;
      svg += `<line x1="${mx}" y1="${padT}" x2="${mx}" y2="${padT + plotH}" stroke="#fb7185" stroke-width="2.5" stroke-dasharray="5 3"/>`;
      svg += `<text x="${mx + 6}" y="${padT + 16}" fill="#fb7185" font-size="11.5" font-weight="700">平均數 ${mean.toFixed(1)}</text>`;
      svg += `<line x1="${mdx}" y1="${padT}" x2="${mdx}" y2="${padT + plotH}" stroke="#fbbf24" stroke-width="2.5"/>`;
      svg += `<text x="${mdx - 6}" y="${padT + 32}" text-anchor="end" fill="#fbbf24" font-size="11.5" font-weight="700">中位數 ${median.toFixed(1)}</text>`;
    }

    return svg + '</svg>';
  }

  const RENDERERS = {
    gantt: renderGantt,
    river: renderRiver,
    bar: renderBar,
    waterfall: renderWaterfall,
    line: renderLine,
    funnel: renderFunnel,
    bubble: renderBubble,
    bullet: renderBullet,
    radar: renderRadar,
    heatmap: renderHeatmap,
    pie: renderPie,
    treemap: renderTreemap,
    sankey: renderSankey,
    area: renderArea,
    scatter: renderScatter,
    boxplot: renderBoxPlot,
    histogram: renderHistogram
  };

  window.renderChartSVG = function (chartId, params) {
    const fn = RENDERERS[chartId];
    return fn ? fn(params) : '';
  };
})();

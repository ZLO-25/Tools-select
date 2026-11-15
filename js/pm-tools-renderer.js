/**
 * 10 大 PM 實戰思維與管理工具 SVG 視覺渲染引擎
 * 支援即時讀取使用者自訂文字與參數，高清晰大字體排版，可匯出 (PNG / SVG) 圖表
 */
(function () {
  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // CJK-aware line wrapper: full-width char = 1 unit, ASCII = 0.55 unit
  function wrapLines(text, maxUnits = 15, maxLines = 2) {
    const s = String(text || '').trim();
    if (!s) return [''];
    const lines = [];
    let cur = '';
    let units = 0;
    for (const ch of s) {
      const w = ch.charCodeAt(0) > 255 ? 1 : 0.56;
      if (units + w > maxUnits && cur.length > 0) {
        lines.push(cur);
        cur = ch;
        units = w;
        if (lines.length === maxLines - 1) {
          // Put remaining into last line (trim only if absurdly long)
          const idx = s.indexOf(cur, lines.join('').length);
          const rest = s.slice(idx);
          lines.push(rest);
          return lines;
        }
      } else {
        cur += ch;
        units += w;
      }
    }
    if (cur) lines.push(cur);
    return lines.slice(0, maxLines);
  }

  function renderCenteredLines(lines, cx, centerY, lineHeight, fontSize, fill, weight = '600') {
    return lines.map((ln, idx) => {
      const ty = centerY + (idx - (lines.length - 1) / 2) * lineHeight + fontSize * 0.35;
      return `<text x="${cx}" y="${ty.toFixed(1)}" text-anchor="middle" fill="${fill}" font-size="${fontSize}" font-weight="${weight}">${esc(ln)}</text>`;
    }).join('');
  }

  function svgHeader(w = 780, h = 430) {
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" style="background:#0f172a;border-radius:12px;font-family:'Inter','Microsoft JhengHei',sans-serif;">`;
  }

  // 1. TOC Evaporating Cloud (TOC 衝突圖)
  function renderTocCloud(f) {
    const w = 780, h = 440;
    let svg = svgHeader(w, h);
    svg += `<text x="390" y="32" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="800">${esc(f.title)}</text>`;

    const drawBox = (x, y, bw, bh, tag, text, stroke, fill) => {
      svg += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/>`;
      svg += `<rect x="${x + 10}" y="${y - 12}" width="124" height="22" rx="6" fill="${stroke}"/>`;
      svg += `<text x="${x + 72}" y="${y + 3}" text-anchor="middle" fill="#0b0f19" font-size="12.5" font-weight="800">${esc(tag)}</text>`;
      const lines = wrapLines(text, 13, 3);
      svg += renderCenteredLines(lines, x + bw / 2, y + bh / 2 + 4, 20, 14, '#f8fafc', '600');
    };

    drawBox(24, 138, 184, 108, 'A. 共同目標', f.goalA, '#38bdf8', 'rgba(56,189,248,0.14)');
    drawBox(262, 66, 208, 92, 'B. 必要條件 1', f.reqB, '#34d399', 'rgba(52,211,153,0.13)');
    drawBox(262, 222, 208, 92, 'C. 必要條件 2', f.reqC, '#818cf8', 'rgba(129,140,248,0.13)');
    drawBox(532, 66, 222, 92, 'D. 行動主張 1', f.actD, '#fbbf24', 'rgba(251,191,36,0.13)');
    drawBox(532, 222, 222, 92, "D'. 對立主張 2", f.actDPrime, '#fb7185', 'rgba(251,113,133,0.13)');

    svg += `<path d="M 262 112 L 210 170" stroke="#34d399" stroke-width="2.5"/>`;
    svg += `<path d="M 262 268 L 210 212" stroke="#818cf8" stroke-width="2.5"/>`;
    svg += `<path d="M 532 112 L 472 112" stroke="#fbbf24" stroke-width="2.5"/>`;
    svg += `<path d="M 532 268 L 472 268" stroke="#fb7185" stroke-width="2.5"/>`;

    svg += `<line x1="643" y1="160" x2="643" y2="220" stroke="#fb7185" stroke-width="3" stroke-dasharray="4 3"/>`;
    svg += `<rect x="588" y="175" width="110" height="26" rx="13" fill="#fb7185"/>`;
    svg += `<text x="643" y="193" text-anchor="middle" fill="#0b0f19" font-size="13" font-weight="800">⚡ 直接衝突</text>`;

    svg += `<rect x="24" y="334" width="730" height="88" rx="10" fill="rgba(251,191,36,0.1)" stroke="#fbbf24" stroke-width="1.6" stroke-dasharray="5 3"/>`;
    svg += `<text x="42" y="364" fill="#fbbf24" font-size="13.5" font-weight="700">🔍 暴露背後錯誤假設：${esc(f.assumption)}</text>`;
    svg += `<text x="42" y="398" fill="#34d399" font-size="14" font-weight="700">💡 破局注入方案：${esc(f.injection)}</text>`;

    return svg + '</svg>';
  }

  // 2. Project Iron Triangle & Trade-off Matrix
  function renderIronTriangle(f) {
    const w = 780, h = 430;
    let svg = svgHeader(w, h);
    svg += `<text x="390" y="32" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="800">${esc(f.title)}</text>`;

    svg += `<polygon points="175,82 65,274 285,274" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="3"/>`;
    svg += `<text x="175" y="202" text-anchor="middle" fill="#fbbf24" font-size="16.5" font-weight="800">核心品質</text>`;
    svg += `<text x="175" y="224" text-anchor="middle" fill="#cbd5e1" font-size="12.5">(Quality)</text>`;

    const badgeColor = (dim) => {
      if (f.fixedDim === dim) return '#fb7185';
      if (f.optimizeDim === dim) return '#38bdf8';
      return '#34d399';
    };

    svg += `<circle cx="175" cy="82" r="31" fill="${badgeColor('time')}"/><text x="175" y="80" text-anchor="middle" fill="#0b0f19" font-size="13.5" font-weight="800">時間</text><text x="175" y="96" text-anchor="middle" fill="#0b0f19" font-size="11.5" font-weight="700">Time</text>`;
    svg += `<circle cx="65" cy="274" r="31" fill="${badgeColor('scope')}"/><text x="65" y="272" text-anchor="middle" fill="#0b0f19" font-size="13.5" font-weight="800">範疇</text><text x="65" y="288" text-anchor="middle" fill="#0b0f19" font-size="11.5" font-weight="700">Scope</text>`;
    svg += `<circle cx="285" cy="274" r="31" fill="${badgeColor('cost')}"/><text x="285" y="272" text-anchor="middle" fill="#0b0f19" font-size="13.5" font-weight="800">成本</text><text x="285" y="288" text-anchor="middle" fill="#0b0f19" font-size="11.5" font-weight="700">Cost</text>`;

    const tx = 342, ty = 74, cw = 128, rh = 58;
    const cols = ['🔒 固定', '🎯 優化', '🌊 調節'];
    const dims = [
      { id: 'time', name: '時間 (Time)' },
      { id: 'scope', name: '範疇 (Scope)' },
      { id: 'cost', name: '成本 (Cost)' }
    ];

    cols.forEach((col, cIdx) => {
      svg += `<rect x="${tx + 118 + cIdx * cw}" y="${ty}" width="${cw - 6}" height="40" rx="6" fill="#1e293b"/>`;
      svg += `<text x="${tx + 118 + cIdx * cw + (cw - 6) / 2}" y="${ty + 26}" text-anchor="middle" fill="#e2e8f0" font-size="13.5" font-weight="700">${col}</text>`;
    });

    dims.forEach((d, rIdx) => {
      const y = ty + 48 + rIdx * rh;
      svg += `<rect x="${tx}" y="${y}" width="112" height="${rh - 8}" rx="6" fill="#1e293b"/>`;
      svg += `<text x="${tx + 56}" y="${y + 30}" text-anchor="middle" fill="#f8fafc" font-size="13.5" font-weight="700">${d.name}</text>`;

      ['fixedDim', 'optimizeDim', 'acceptDim'].forEach((k, cIdx) => {
        const checked = f[k] === d.id;
        const cellX = tx + 118 + cIdx * cw;
        const fill = checked ? (cIdx === 0 ? 'rgba(251,113,133,0.25)' : cIdx === 1 ? 'rgba(56,189,248,0.25)' : 'rgba(52,211,153,0.25)') : 'rgba(30,41,59,0.45)';
        const stroke = checked ? (cIdx === 0 ? '#fb7185' : cIdx === 1 ? '#38bdf8' : '#34d399') : 'rgba(148,163,184,0.2)';
        svg += `<rect x="${cellX}" y="${y}" width="${cw - 6}" height="${rh - 8}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>`;
        if (checked) {
          svg += `<text x="${cellX + (cw - 6) / 2}" y="${y + 31}" text-anchor="middle" fill="#fff" font-size="16" font-weight="800">✔ 已選取</text>`;
        }
      });
    });

    const chosenSet = new Set([f.fixedDim, f.optimizeDim, f.acceptDim]);
    const warnMsg = chosenSet.size < 3
      ? '⚠️ 大人學提醒：三個維度請分別指派不同角色（一欄一勾），切勿同時固定兩項以上！'
      : `✅ 裁決原則：${f.ruleNote}`;

    const ruleLines = wrapLines(warnMsg, 44, 2);
    svg += `<rect x="30" y="330" width="720" height="78" rx="10" fill="rgba(56,189,248,0.1)" stroke="#38bdf8" stroke-width="1.6"/>`;
    ruleLines.forEach((ln, idx) => {
      svg += `<text x="48" y="${360 + idx * 24}" fill="#f8fafc" font-size="14" font-weight="600">${esc(ln)}</text>`;
    });

    return svg + '</svg>';
  }

  // 3. Stakeholder Power-Interest Grid
  function renderStakeholderGrid(f) {
    const w = 780, h = 430, padL = 78, padR = 36, padT = 54, padB = 56;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    let svg = svgHeader(w, h);
    svg += `<text x="390" y="32" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="800">${esc(f.title)}</text>`;

    const mx = padL + plotW / 2, my = padT + plotH / 2;
    svg += `<rect x="${padL}" y="${padT}" width="${plotW / 2}" height="${plotH / 2}" fill="rgba(251,191,36,0.1)" stroke="rgba(148,163,184,0.28)"/>`;
    svg += `<rect x="${mx}" y="${padT}" width="${plotW / 2}" height="${plotH / 2}" fill="rgba(251,113,133,0.12)" stroke="rgba(148,163,184,0.28)"/>`;
    svg += `<rect x="${padL}" y="${my}" width="${plotW / 2}" height="${plotH / 2}" fill="rgba(148,163,184,0.06)" stroke="rgba(148,163,184,0.28)"/>`;
    svg += `<rect x="${mx}" y="${my}" width="${plotW / 2}" height="${plotH / 2}" fill="rgba(56,189,248,0.1)" stroke="rgba(148,163,184,0.28)"/>`;

    svg += `<text x="${padL + 12}" y="${padT + 24}" fill="#fbbf24" font-size="13.5" font-weight="700">⚠️ 高權力 × 低關切：保持滿意 (潛在否決地雷)</text>`;
    svg += `<text x="${mx + 12}" y="${padT + 24}" fill="#fb7185" font-size="13.5" font-weight="700">🔥 高權力 × 高關切：重點密切管理</text>`;
    svg += `<text x="${padL + 12}" y="${my + 24}" fill="#cbd5e1" font-size="13.5" font-weight="700">🌱 低權力 × 低關切：定期監督</text>`;
    svg += `<text x="${mx + 12}" y="${my + 24}" fill="#38bdf8" font-size="13.5" font-weight="700">📢 低權力 × 高關切：隨時告知透明溝通</text>`;

    ['s1', 's2', 's3', 's4', 's5', 's6'].forEach(k => {
      const parts = String(f[k] || '').split(',').map(s => s.trim());
      if (parts.length < 3) return;
      const name = parts[0];
      const power = Math.max(5, Math.min(95, Number(parts[1]) || 50));
      const interest = Math.max(5, Math.min(95, Number(parts[2]) || 50));
      const att = parts[3] || '中立';

      const cx = padL + (interest / 100) * plotW;
      const cy = padT + plotH - (power / 100) * plotH;
      const color = att.includes('反') ? '#fb7185' : (att.includes('支') ? '#34d399' : '#fbbf24');

      svg += `<circle cx="${cx}" cy="${cy}" r="12" fill="${color}" stroke="#0b0f19" stroke-width="2" data-tip="${esc(name)} | 權力:${power} 關切:${interest} (${esc(att)})"/>`;
      svg += `<rect x="${cx - 66}" y="${cy + 15}" width="132" height="24" rx="5" fill="rgba(15,23,42,0.92)" stroke="${color}" stroke-width="1.2"/>`;
      svg += `<text x="${cx}" y="${cy + 31}" text-anchor="middle" fill="#f8fafc" font-size="12.5" font-weight="600">${esc(name)}</text>`;
    });

    svg += `<text x="${padL + plotW / 2}" y="${h - 16}" text-anchor="middle" fill="#cbd5e1" font-size="13.5" font-weight="600">利益關切度 (Interest) ➔　|　圓點顏色：🟢支持　🟡中立　🔴反對</text>`;
    svg += `<text x="26" y="${padT + plotH / 2}" text-anchor="middle" fill="#cbd5e1" font-size="13.5" font-weight="600" transform="rotate(-90, 26, ${padT + plotH / 2})">權力影響力 (Power) ➔</text>`;

    return svg + '</svg>';
  }

  // 4. WBS Work Breakdown Structure
  function renderWbsBuilder(f) {
    const w = 780, h = 430;
    let svg = svgHeader(w, h);

    svg += `<rect x="220" y="20" width="340" height="48" rx="10" fill="#38bdf8" stroke="#e0f2fe" stroke-width="2"/>`;
    svg += `<text x="390" y="50" text-anchor="middle" fill="#0b0f19" font-size="16" font-weight="800">${esc(f.title)}</text>`;

    svg += `<line x1="390" y1="68" x2="390" y2="96" stroke="#38bdf8" stroke-width="2.5"/>`;
    svg += `<line x1="145" y1="96" x2="635" y2="96" stroke="#38bdf8" stroke-width="2.5"/>`;

    const cols = [
      { title: f.col1Title, items: String(f.col1Items || '').split(','), cx: 145, color: '#38bdf8' },
      { title: f.col2Title, items: String(f.col2Items || '').split(','), cx: 390, color: '#818cf8' },
      { title: f.col3Title, items: String(f.col3Items || '').split(','), cx: 635, color: '#34d399' }
    ];

    cols.forEach(c => {
      svg += `<line x1="${c.cx}" y1="96" x2="${c.cx}" y2="120" stroke="${c.color}" stroke-width="2.5"/>`;
      svg += `<rect x="${c.cx - 110}" y="120" width="220" height="44" rx="8" fill="rgba(30,41,59,0.95)" stroke="${c.color}" stroke-width="2"/>`;
      svg += `<text x="${c.cx}" y="147" text-anchor="middle" fill="${c.color}" font-size="14.5" font-weight="800">${esc(c.title)}</text>`;

      c.items.map(s => s.trim()).filter(Boolean).slice(0, 4).forEach((item, idx) => {
        const iy = 186 + idx * 54;
        svg += `<line x1="${c.cx - 90}" y1="${idx === 0 ? 164 : iy - 14}" x2="${c.cx - 90}" y2="${iy + 20}" stroke="${c.color}" stroke-width="2"/>`;
        svg += `<line x1="${c.cx - 90}" y1="${iy + 20}" x2="${c.cx - 74}" y2="${iy + 20}" stroke="${c.color}" stroke-width="2"/>`;
        svg += `<rect x="${c.cx - 74}" y="${iy}" width="184" height="40" rx="6" fill="#1e293b" stroke="rgba(148,163,184,0.35)"/>`;
        svg += `<text x="${c.cx + 18}" y="${iy + 25}" text-anchor="middle" fill="#f1f5f9" font-size="13.5" font-weight="600">${esc(item)}</text>`;
      });
    });

    svg += `<text x="390" y="410" text-anchor="middle" fill="#cbd5e1" font-size="13">💡 大人學 WBS 100% 法則：以「可交付成果（名詞）」拆解，下層總和 = 100% 上層範疇</text>`;
    return svg + '</svg>';
  }

  // 5. CCPM Critical Chain Buffer Fever Chart
  function renderCcpmBuffer(f) {
    const w = 780, h = 430, padL = 74, padR = 48, padT = 52, padB = 56;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    let svg = svgHeader(w, h);
    svg += `<text x="390" y="32" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="800">${esc(f.title)}</text>`;

    const toX = (v) => padL + (Math.max(0, Math.min(100, v)) / 100) * plotW;
    const toY = (v) => padT + plotH - (Math.max(0, Math.min(100, v)) / 100) * plotH;

    svg += `<polygon points="${toX(0)},${toY(100)} ${toX(100)},${toY(100)} ${toX(100)},${toY(88)} ${toX(0)},${toY(32)}" fill="rgba(251,113,133,0.28)"/>`;
    svg += `<polygon points="${toX(0)},${toY(32)} ${toX(100)},${toY(88)} ${toX(100)},${toY(62)} ${toX(0)},${toY(12)}" fill="rgba(251,191,36,0.26)"/>`;
    svg += `<polygon points="${toX(0)},${toY(12)} ${toX(100)},${toY(62)} ${toX(100)},${toY(0)} ${toX(0)},${toY(0)}" fill="rgba(52,211,153,0.24)"/>`;

    svg += `<text x="${toX(14)}" y="${toY(82)}" fill="#fb7185" font-size="14.5" font-weight="800">🔴 紅區：立即啟動救援趕工 (Act)</text>`;
    svg += `<text x="${toX(44)}" y="${toY(56)}" fill="#fbbf24" font-size="14.5" font-weight="800">🟡 黃區：擬定緩衝應變對策 (Plan)</text>`;
    svg += `<text x="${toX(64)}" y="${toY(24)}" fill="#34d399" font-size="14.5" font-weight="800">🟢 綠區：健康推進 (Monitor)</text>`;

    const pts = [{ x: 0, y: 0, label: 'Start' }];
    ['p1', 'p2', 'p3', 'p4', 'p5'].forEach((k, idx) => {
      const parts = String(f[k] || '').split(',').map(s => Number(s.trim()));
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        pts.push({ x: parts[0], y: parts[1], label: `W${(idx + 1) * 2}` });
      }
    });

    const pathD = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${toX(pt.x)},${toY(pt.y)}`).join(' ');
    svg += `<path d="${pathD}" fill="none" stroke="#f8fafc" stroke-width="3"/>`;

    pts.forEach(pt => {
      svg += `<circle cx="${toX(pt.x)}" cy="${toY(pt.y)}" r="6.5" fill="#38bdf8" stroke="#0b0f19" stroke-width="2" data-tip="${pt.label}: 完成度 ${pt.x}% / 緩衝消耗 ${pt.y}%"/>`;
      svg += `<text x="${toX(pt.x)}" y="${toY(pt.y) - 12}" text-anchor="middle" fill="#f8fafc" font-size="12.5" font-weight="700">${pt.label}(${pt.x}%,${pt.y}%)</text>`;
    });

    svg += `<text x="${padL + plotW / 2}" y="${h - 16}" text-anchor="middle" fill="#cbd5e1" font-size="13.5" font-weight="600">關鍵鏈任務完成進度 (%) ➔</text>`;
    svg += `<text x="26" y="${padT + plotH / 2}" text-anchor="middle" fill="#cbd5e1" font-size="13.5" font-weight="600" transform="rotate(-90, 26, ${padT + plotH / 2})">專案總緩衝消耗比例 (%) ➔</text>`;

    return svg + '</svg>';
  }

  // 6. RACI Matrix with Auto Health-Check
  function renderRaciMatrix(f) {
    const w = 780, h = 430;
    let svg = svgHeader(w, h);
    svg += `<text x="390" y="34" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="800">${esc(f.title)}</text>`;

    const roles = String(f.roles || '').split(',').map(s => s.trim()).slice(0, 4);
    while (roles.length < 4) roles.push(`角色 ${roles.length + 1}`);

    const tx = 28, ty = 60, taskW = 225, colW = 105, statusW = 72, rh = 62;
    svg += `<rect x="${tx}" y="${ty}" width="${taskW - 6}" height="42" rx="6" fill="#1e293b"/>`;
    svg += `<text x="${tx + taskW / 2}" y="${ty + 27}" text-anchor="middle" fill="#cbd5e1" font-size="13.5" font-weight="700">工作包 / 關鍵決策項目</text>`;

    roles.forEach((r, idx) => {
      const cx = tx + taskW + idx * colW;
      svg += `<rect x="${cx}" y="${ty}" width="${colW - 6}" height="42" rx="6" fill="#1e293b"/>`;
      svg += `<text x="${cx + (colW - 6) / 2}" y="${ty + 27}" text-anchor="middle" fill="#38bdf8" font-size="13.5" font-weight="700">${esc(r)}</text>`;
    });

    svg += `<text x="${tx + taskW + 4 * colW + statusW / 2}" y="${ty + 27}" text-anchor="middle" fill="#cbd5e1" font-size="13.5" font-weight="700">健檢</text>`;

    ['row1', 'row2', 'row3', 'row4'].forEach((rk, rIdx) => {
      const y = ty + 52 + rIdx * rh;
      const raw = String(f[rk] || '');
      const [taskName, cellsStr] = raw.split('|').map(s => (s || '').trim());
      const cells = (cellsStr || '').split(',').map(s => s.trim().toUpperCase());

      svg += `<rect x="${tx}" y="${y}" width="${taskW - 6}" height="${rh - 8}" rx="6" fill="#1e293b"/>`;
      svg += `<text x="${tx + 12}" y="${y + 33}" fill="#f8fafc" font-size="13.5" font-weight="600">${esc(taskName || '未命名任務')}</text>`;

      let aCount = 0;
      let rCount = 0;
      for (let c = 0; c < 4; c++) {
        const val = cells[c] || '-';
        if (val.includes('A')) aCount++;
        if (val.includes('R')) rCount++;

        const cx = tx + taskW + c * colW;
        const badgeColor = val.includes('A') ? '#fb7185' : (val.includes('R') ? '#38bdf8' : (val.includes('C') ? '#fbbf24' : '#94a3b8'));
        svg += `<rect x="${cx}" y="${y}" width="${colW - 6}" height="${rh - 8}" rx="6" fill="rgba(30,41,59,0.65)" stroke="${badgeColor}" stroke-width="1.8"/>`;
        svg += `<text x="${cx + (colW - 6) / 2}" y="${y + 33}" text-anchor="middle" fill="${badgeColor}" font-size="15.5" font-weight="800">${esc(val)}</text>`;
      }

      const sx = tx + taskW + 4 * colW + statusW / 2;
      const isOk = aCount === 1 && rCount >= 1;
      const tip = aCount === 0 ? '⚠️ 缺少當責者(A)' : (aCount > 1 ? '⚠️ 多頭馬車(超過1個A)' : (rCount === 0 ? '⚠️ 無人執行(R)' : '✅ 權責健全'));
      svg += `<text x="${sx}" y="${y + 33}" text-anchor="middle" fill="${isOk ? '#34d399' : '#fb7185'}" font-size="13.5" font-weight="700" data-tip="${tip}">${isOk ? '✅ 正常' : '⚠️ 異常'}</text>`;
    });

    svg += `<text x="390" y="396" text-anchor="middle" fill="#cbd5e1" font-size="13"><tspan fill="#fb7185" font-weight="700">A = Accountable (唯一當責)</tspan>　|　<tspan fill="#38bdf8" font-weight="700">R = Responsible (執行)</tspan>　|　<tspan fill="#fbbf24" font-weight="700">C = Consulted (諮詢)</tspan>　|　I = Informed (告知)</text>`;
    return svg + '</svg>';
  }

  // 7. Risk Probability-Impact Matrix
  function renderRiskMatrix(f) {
    const w = 780, h = 430;
    let svg = svgHeader(w, h);
    svg += `<text x="390" y="32" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="800">${esc(f.title)}</text>`;

    const gx = 68, gy = 60, cell = 58;
    for (let r = 0; r < 5; r++) {
      const prob = 5 - r;
      svg += `<text x="${gx - 10}" y="${gy + r * cell + 34}" text-anchor="end" fill="#cbd5e1" font-size="12.5">機率 ${prob}</text>`;
      for (let c = 0; c < 5; c++) {
        const imp = c + 1;
        const score = prob * imp;
        const fill = score >= 15 ? 'rgba(251,113,133,0.34)' : (score >= 8 ? 'rgba(251,191,36,0.26)' : 'rgba(52,211,153,0.2)');
        svg += `<rect x="${gx + c * cell}" y="${gy + r * cell}" width="${cell - 3}" height="${cell - 3}" rx="5" fill="${fill}"/>`;
      }
    }
    for (let c = 0; c < 5; c++) {
      svg += `<text x="${gx + c * cell + 28}" y="${gy + 5 * cell + 22}" text-anchor="middle" fill="#cbd5e1" font-size="12.5">衝擊 ${c + 1}</text>`;
    }

    ['r1', 'r2', 'r3', 'r4', 'r5'].forEach((rk, idx) => {
      const parts = String(f[rk] || '').split(',').map(s => s.trim());
      if (parts.length < 3) return;
      const name = parts[0];
      const p = Math.max(1, Math.min(5, Number(parts[1]) || 3));
      const imp = Math.max(1, Math.min(5, Number(parts[2]) || 3));
      const strat = parts.slice(3).join(', ') || '監控中';

      const cx = gx + (imp - 1) * cell + 28 + (idx % 2) * 8 - 4;
      const cy = gy + (5 - p) * cell + 28;
      const score = p * imp;
      const color = score >= 15 ? '#fb7185' : (score >= 8 ? '#fbbf24' : '#34d399');

      svg += `<circle cx="${cx}" cy="${cy}" r="13" fill="${color}" stroke="#0b0f19" stroke-width="2" data-tip="${esc(name)} (P=${p}, I=${imp}, Score=${score})"/>`;
      svg += `<text x="${cx}" y="${cy + 4.5}" text-anchor="middle" fill="#0b0f19" font-size="12" font-weight="800">R${idx + 1}</text>`;

      const ry = 58 + idx * 66;
      svg += `<rect x="374" y="${ry}" width="382" height="58" rx="8" fill="#1e293b" stroke="${color}" stroke-width="1.6"/>`;
      svg += `<text x="388" y="${ry + 23}" fill="${color}" font-size="13.5" font-weight="800">${esc(name)} (風險值 ${score})</text>`;
      svg += `<text x="388" y="${ry + 45}" fill="#e2e8f0" font-size="13">🛡️ ${esc(strat)}</text>`;
    });

    return svg + '</svg>';
  }

  // 8. TOC Current Reality Tree (CRT Root Cause) - No text clipping, 2-line wrap + large legible font
  function renderTocCrt(f) {
    const w = 780, h = 460;
    let svg = svgHeader(w, h);
    svg += `<text x="390" y="30" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="800">${esc(f.title)}</text>`;

    // Top row: 3 UDEs (height 76 so 2-line text fits comfortably)
    const udes = [f.ude1, f.ude2, f.ude3];
    udes.forEach((u, i) => {
      const x = 22 + i * 250;
      svg += `<rect x="${x}" y="52" width="236" height="78" rx="9" fill="rgba(251,113,133,0.14)" stroke="#fb7185" stroke-width="1.8"/>`;
      svg += `<text x="${x + 118}" y="73" text-anchor="middle" fill="#fb7185" font-size="12.5" font-weight="800">表面不理想現象 UDE ${i + 1}</text>`;
      const lines = wrapLines(u, 14, 2);
      svg += renderCenteredLines(lines, x + 118, 102, 19, 13.5, '#f8fafc', '600');
    });

    // Middle row: 2 intermediate causes
    const mids = [
      { text: f.mid1, x: 75 },
      { text: f.mid2, x: 425 }
    ];
    mids.forEach((m, i) => {
      svg += `<rect x="${m.x}" y="172" width="280" height="76" rx="9" fill="rgba(251,191,36,0.14)" stroke="#fbbf24" stroke-width="1.8"/>`;
      svg += `<text x="${m.x + 140}" y="193" text-anchor="middle" fill="#fbbf24" font-size="12.5" font-weight="800">中層結構原因 ${i + 1}</text>`;
      const lines = wrapLines(m.text, 17, 2);
      svg += renderCenteredLines(lines, m.x + 140, 222, 19, 13.5, '#f8fafc', '600');
    });

    // Bottom Root Cause
    svg += `<rect x="80" y="286" width="620" height="72" rx="10" fill="rgba(56,189,248,0.18)" stroke="#38bdf8" stroke-width="2.5"/>`;
    svg += `<text x="390" y="310" text-anchor="middle" fill="#38bdf8" font-size="13.5" font-weight="800">🔥 最底層核心根因 (Core Problem / Bottleneck)</text>`;
    const rcLines = wrapLines(f.rootCause, 36, 2);
    svg += renderCenteredLines(rcLines, 390, 338, 19, 14.5, '#ffffff', '700');

    // Upward causal arrows
    svg += `<line x1="270" y1="286" x2="215" y2="250" stroke="#38bdf8" stroke-width="2.5"/>`;
    svg += `<line x1="510" y1="286" x2="565" y2="250" stroke="#38bdf8" stroke-width="2.5"/>`;
    svg += `<line x1="215" y1="172" x2="140" y2="132" stroke="#fbbf24" stroke-width="2.2"/>`;
    svg += `<line x1="215" y1="172" x2="390" y2="132" stroke="#fbbf24" stroke-width="2.2"/>`;
    svg += `<line x1="565" y1="172" x2="390" y2="132" stroke="#fbbf24" stroke-width="2.2"/>`;
    svg += `<line x1="565" y1="172" x2="640" y2="132" stroke="#fbbf24" stroke-width="2.2"/>`;

    // Action solution bar
    svg += `<rect x="40" y="376" width="700" height="66" rx="9" fill="rgba(52,211,153,0.15)" stroke="#34d399" stroke-width="2"/>`;
    const actLines = wrapLines(`🎯 拔除根因的高槓桿解方：${f.action}`, 40, 2);
    svg += renderCenteredLines(actLines, 390, 409, 22, 14.5, '#34d399', '700');

    return svg + '</svg>';
  }

  // 9. PERT Three-Point Estimator
  function renderPertEstimator(f) {
    const w = 780, h = 430;
    let svg = svgHeader(w, h);
    svg += `<text x="390" y="32" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="800">${esc(f.title)}</text>`;

    const items = ['t1', 't2', 't3', 't4'].map(k => {
      const p = String(f[k] || '').split(',').map(s => s.trim());
      const name = p[0] || '工作包';
      const O = Math.max(0.5, Number(p[1]) || 2);
      const M = Math.max(O, Number(p[2]) || 4);
      const P = Math.max(M, Number(p[3]) || 9);
      const E = (O + 4 * M + P) / 6;
      const sd = (P - O) / 6;
      return { name, O, M, P, E, sd, var: sd * sd };
    });

    const totalE = items.reduce((s, x) => s + x.E, 0);
    const totalSD = Math.sqrt(items.reduce((s, x) => s + x.var, 0));
    const p85 = totalE + 1.04 * totalSD;
    const p95 = totalE + 1.65 * totalSD;

    items.forEach((it, i) => {
      const y = 62 + i * 56;
      svg += `<rect x="30" y="${y}" width="720" height="46" rx="8" fill="#1e293b"/>`;
      svg += `<text x="46" y="${y + 29}" fill="#f8fafc" font-size="14" font-weight="700">${esc(it.name)}</text>`;
      svg += `<text x="235" y="${y + 29}" fill="#cbd5e1" font-size="13.5">O=${it.O}d / M=${it.M}d / P=${it.P}d</text>`;
      svg += `<text x="425" y="${y + 29}" fill="#38bdf8" font-size="14" font-weight="700">期望值 E = ${it.E.toFixed(1)} 天</text>`;
      svg += `<text x="590" y="${y + 29}" fill="#fbbf24" font-size="13.5" font-weight="600">σ = ±${it.sd.toFixed(2)} 天</text>`;
    });

    const cards = [
      { label: '50% 機率準時 (期望總和 E)', val: `${totalE.toFixed(1)} 天`, sub: '⚠️ 形同擲硬幣，勿當死線', color: '#38bdf8', x: 30 },
      { label: '85% 把握準時 (E + 1.04σ)', val: `${p85.toFixed(1)} 天`, sub: '✅ 實務最推薦基準排程', color: '#34d399', x: 275 },
      { label: '95% 合約死線 (E + 1.65σ)', val: `${p95.toFixed(1)} 天`, sub: '🛡️ 適用具罰則之外部合約', color: '#fbbf24', x: 520 }
    ];

    cards.forEach(c => {
      svg += `<rect x="${c.x}" y="302" width="230" height="104" rx="10" fill="rgba(30,41,59,0.9)" stroke="${c.color}" stroke-width="2"/>`;
      svg += `<text x="${c.x + 115}" y="330" text-anchor="middle" fill="${c.color}" font-size="13" font-weight="700">${c.label}</text>`;
      svg += `<text x="${c.x + 115}" y="366" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="800">${c.val}</text>`;
      svg += `<text x="${c.x + 115}" y="392" text-anchor="middle" fill="#cbd5e1" font-size="12">${c.sub}</text>`;
    });

    return svg + '</svg>';
  }

  // 10. MoSCoW Prioritization & Capacity Board
  function renderMoscowBoard(f) {
    const w = 780, h = 430;
    let svg = svgHeader(w, h);
    svg += `<text x="390" y="30" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="800">${esc(f.title)}</text>`;

    const cap = Math.max(10, Number(f.capacity) || 100);
    const parseItems = (str) => String(str || '').split(',').map(s => {
      const [n, d] = s.split(':').map(x => (x || '').trim());
      return { name: n, days: Number(d) || 0 };
    }).filter(x => x.name);

    const must = parseItems(f.mustList);
    const should = parseItems(f.shouldList);
    const could = parseItems(f.couldList);
    const wont = parseItems(f.wontList);

    const sumDays = (arr) => arr.reduce((s, x) => s + x.days, 0);
    const mDays = sumDays(must), sDays = sumDays(should), cDays = sumDays(could), wDays = sumDays(wont);
    const activeTotal = mDays + sDays + cDays;
    const mustPct = Math.round((mDays / cap) * 100);

    svg += `<rect x="30" y="48" width="720" height="40" rx="8" fill="#1e293b"/>`;
    const mw = Math.min(720, (mDays / cap) * 720);
    const sw = Math.min(720 - mw, (sDays / cap) * 720);
    const cw = Math.min(720 - mw - sw, (cDays / cap) * 720);
    svg += `<rect x="30" y="48" width="${mw}" height="40" rx="6" fill="#fb7185"/>`;
    svg += `<rect x="${30 + mw}" y="48" width="${sw}" height="40" fill="#fbbf24"/>`;
    svg += `<rect x="${30 + mw + sw}" y="48" width="${cw}" height="40" fill="#34d399"/>`;
    svg += `<text x="390" y="73" text-anchor="middle" fill="#0b0f19" font-size="13.5" font-weight="800">產能負載：Must(${mDays}d, ${mustPct}%) + Should(${sDays}d) + Could(${cDays}d) = ${activeTotal} / ${cap} 人天 ${mustPct > 65 ? '⚠️ Must過高(>60%)' : '✅ 健康配比'}</text>`;

    const boxes = [
      { title: `M - Must Have 必做 (${mDays}d)`, items: must, x: 30, y: 104, color: '#fb7185' },
      { title: `S - Should Have 應做 (${sDays}d)`, items: should, x: 400, y: 104, color: '#fbbf24' },
      { title: `C - Could Have 緩衝池 (${cDays}d)`, items: could, x: 30, y: 262, color: '#34d399' },
      { title: `W - Won't Have 本期排除 (${wDays}d)`, items: wont, x: 400, y: 262, color: '#94a3b8' }
    ];

    boxes.forEach(b => {
      svg += `<rect x="${b.x}" y="${b.y}" width="350" height="146" rx="10" fill="rgba(30,41,59,0.8)" stroke="${b.color}" stroke-width="2"/>`;
      svg += `<text x="${b.x + 14}" y="${b.y + 26}" fill="${b.color}" font-size="14.5" font-weight="800">${b.title}</text>`;
      b.items.slice(0, 3).forEach((it, idx) => {
        const iy = b.y + 42 + idx * 32;
        svg += `<rect x="${b.x + 12}" y="${iy}" width="326" height="27" rx="5" fill="#0f172a"/>`;
        svg += `<text x="${b.x + 22}" y="${iy + 18}" fill="#f8fafc" font-size="13">${esc(it.name)}</text>`;
        svg += `<text x="${b.x + 328}" y="${iy + 18}" text-anchor="end" fill="${b.color}" font-size="13" font-weight="700">${it.days} 人天</text>`;
      });
    });

    return svg + '</svg>';
  }

  const PM_RENDERERS = {
    'toc-cloud': renderTocCloud,
    'iron-triangle': renderIronTriangle,
    'stakeholder-grid': renderStakeholderGrid,
    'wbs-builder': renderWbsBuilder,
    'ccpm-buffer': renderCcpmBuffer,
    'raci-matrix': renderRaciMatrix,
    'risk-matrix': renderRiskMatrix,
    'toc-crt': renderTocCrt,
    'pert-estimator': renderPertEstimator,
    'moscow-board': renderMoscowBoard
  };

  window.renderPmToolSVG = function (toolId, fields) {
    const fn = PM_RENDERERS[toolId];
    return fn ? fn(fields) : '';
  };
})();

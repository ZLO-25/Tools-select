/**
 * 10 大 PM 實戰思維與管理工具 SVG 視覺渲染引擎
 * 支援即時讀取使用者自訂文字與參數，生成高解析度可匯出 (PNG / SVG) 圖表
 */
(function () {
  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function wrapText(text, maxLen = 14) {
    const s = String(text || '');
    if (s.length <= maxLen) return [s];
    const lines = [];
    for (let i = 0; i < s.length; i += maxLen) {
      lines.push(s.slice(i, i + maxLen));
    }
    return lines.slice(0, 3);
  }

  function svgHeader(w = 760, h = 400) {
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" style="background:#0f172a;border-radius:12px;font-family:'Inter','Microsoft JhengHei',sans-serif;">`;
  }

  // 1. TOC Evaporating Cloud (TOC 衝突圖)
  function renderTocCloud(f) {
    const w = 760, h = 400;
    let svg = svgHeader(w, h);
    svg += `<text x="380" y="30" text-anchor="middle" fill="#f8fafc" font-size="16" font-weight="800">${esc(f.title)}</text>`;

    const drawBox = (x, y, bw, bh, tag, text, stroke, fill) => {
      svg += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/>`;
      svg += `<rect x="${x + 10}" y="${y - 11}" width="110" height="20" rx="5" fill="${stroke}"/>`;
      svg += `<text x="${x + 65}" y="${y + 3}" text-anchor="middle" fill="#0b0f19" font-size="11" font-weight="800">${esc(tag)}</text>`;
      const lines = wrapText(text, 15);
      lines.forEach((ln, idx) => {
        const ty = y + bh / 2 + (idx - (lines.length - 1) / 2) * 18 + 6;
        svg += `<text x="${x + bw / 2}" y="${ty}" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="600">${esc(ln)}</text>`;
      });
    };

    // A: Goal (Left)
    drawBox(30, 130, 175, 95, 'A. 共同目標', f.goalA, '#38bdf8', 'rgba(56,189,248,0.14)');
    // B & C: Requirements (Middle)
    drawBox(265, 62, 195, 82, 'B. 必要條件 1', f.reqB, '#34d399', 'rgba(52,211,153,0.13)');
    drawBox(265, 205, 195, 82, 'C. 必要條件 2', f.reqC, '#818cf8', 'rgba(129,140,248,0.13)');
    // D & D': Prerequisites in conflict (Right)
    drawBox(525, 62, 205, 82, 'D. 行動主張 1', f.actD, '#fbbf24', 'rgba(251,191,36,0.13)');
    drawBox(525, 205, 205, 82, "D'. 對立主張 2", f.actDPrime, '#fb7185', 'rgba(251,113,133,0.13)');

    // Arrows
    svg += `<path d="M 265 103 L 208 160" stroke="#34d399" stroke-width="2.2"/>`;
    svg += `<path d="M 265 246 L 208 192" stroke="#818cf8" stroke-width="2.2"/>`;
    svg += `<path d="M 525 103 L 462 103" stroke="#fbbf24" stroke-width="2.2"/>`;
    svg += `<path d="M 525 246 L 462 246" stroke="#fb7185" stroke-width="2.2"/>`;

    // Conflict lightning between D and D'
    svg += `<line x1="627" y1="146" x2="627" y2="203" stroke="#fb7185" stroke-width="3" stroke-dasharray="4 3"/>`;
    svg += `<rect x="577" y="162" width="100" height="24" rx="12" fill="#fb7185"/>`;
    svg += `<text x="627" y="178" text-anchor="middle" fill="#0b0f19" font-size="11.5" font-weight="800">⚡ 直接衝突</text>`;

    // Bottom Assumption & Injection Banner
    svg += `<rect x="30" y="308" width="700" height="76" rx="10" fill="rgba(251,191,36,0.1)" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="5 3"/>`;
    svg += `<text x="46" y="332" fill="#fbbf24" font-size="12.5" font-weight="700">🔍 暴露背後錯誤假設：${esc(f.assumption)}</text>`;
    svg += `<text x="46" y="362" fill="#34d399" font-size="13" font-weight="700">💡 破局注入方案 (Injection)：${esc(f.injection)}</text>`;

    return svg + '</svg>';
  }

  // 2. Project Iron Triangle & Trade-off Matrix
  function renderIronTriangle(f) {
    const w = 760, h = 400;
    let svg = svgHeader(w, h);
    svg += `<text x="380" y="32" text-anchor="middle" fill="#f8fafc" font-size="16" font-weight="800">${esc(f.title)}</text>`;

    // Left: Iron Triangle visual
    svg += `<polygon points="175,75 65,265 285,265" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="3"/>`;
    svg += `<text x="175" y="195" text-anchor="middle" fill="#fbbf24" font-size="15" font-weight="800">核心品質</text>`;
    svg += `<text x="175" y="215" text-anchor="middle" fill="#94a3b8" font-size="11">(Quality)</text>`;

    const badgeColor = (dim) => {
      if (f.fixedDim === dim) return { c: '#fb7185', t: '🔒 固定死線' };
      if (f.optimizeDim === dim) return { c: '#38bdf8', t: '🎯 盡力優化' };
      return { c: '#34d399', t: '🌊 彈性調節' };
    };

    const bTime = badgeColor('time');
    const bScope = badgeColor('scope');
    const bCost = badgeColor('cost');

    svg += `<circle cx="175" cy="75" r="28" fill="${bTime.c}"/><text x="175" y="73" text-anchor="middle" fill="#0b0f19" font-size="11.5" font-weight="800">時間</text><text x="175" y="87" text-anchor="middle" fill="#0b0f19" font-size="9.5" font-weight="700">Time</text>`;
    svg += `<circle cx="65" cy="265" r="28" fill="${bScope.c}"/><text x="65" y="263" text-anchor="middle" fill="#0b0f19" font-size="11.5" font-weight="800">範疇</text><text x="65" y="277" text-anchor="middle" fill="#0b0f19" font-size="9.5" font-weight="700">Scope</text>`;
    svg += `<circle cx="285" cy="265" r="28" fill="${bCost.c}"/><text x="285" y="263" text-anchor="middle" fill="#0b0f19" font-size="11.5" font-weight="800">成本</text><text x="285" y="277" text-anchor="middle" fill="#0b0f19" font-size="9.5" font-weight="700">Cost</text>`;

    // Right: Consensus Matrix Table
    const tx = 340, ty = 72, cw = 125, rh = 54;
    const cols = ['🔒 固定 (Constrain)', '🎯 優化 (Optimize)', '🌊 調節 (Accept)'];
    const dims = [
      { id: 'time', name: '時間時程 (Time)' },
      { id: 'scope', name: '功能範疇 (Scope)' },
      { id: 'cost', name: '成本資源 (Cost)' }
    ];

    cols.forEach((col, cIdx) => {
      svg += `<rect x="${tx + 120 + cIdx * cw}" y="${ty}" width="${cw - 6}" height="38" rx="6" fill="#1e293b"/>`;
      svg += `<text x="${tx + 120 + cIdx * cw + (cw - 6) / 2}" y="${ty + 24}" text-anchor="middle" fill="#e2e8f0" font-size="11.5" font-weight="700">${col}</text>`;
    });

    dims.forEach((d, rIdx) => {
      const y = ty + 46 + rIdx * rh;
      svg += `<rect x="${tx}" y="${y}" width="114" height="${rh - 8}" rx="6" fill="#1e293b"/>`;
      svg += `<text x="${tx + 57}" y="${y + 28}" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="700">${d.name}</text>`;

      ['fixedDim', 'optimizeDim', 'acceptDim'].forEach((k, cIdx) => {
        const checked = f[k] === d.id;
        const cellX = tx + 120 + cIdx * cw;
        const fill = checked ? (cIdx === 0 ? 'rgba(251,113,133,0.25)' : cIdx === 1 ? 'rgba(56,189,248,0.25)' : 'rgba(52,211,153,0.25)') : 'rgba(30,41,59,0.45)';
        const stroke = checked ? (cIdx === 0 ? '#fb7185' : cIdx === 1 ? '#38bdf8' : '#34d399') : 'rgba(148,163,184,0.2)';
        svg += `<rect x="${cellX}" y="${y}" width="${cw - 6}" height="${rh - 8}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>`;
        if (checked) {
          svg += `<text x="${cellX + (cw - 6) / 2}" y="${y + 30}" text-anchor="middle" fill="#fff" font-size="16" font-weight="800">✔ 已選取</text>`;
        }
      });
    });

    // Warning if duplicate selection
    const chosenSet = new Set([f.fixedDim, f.optimizeDim, f.acceptDim]);
    const warnMsg = chosenSet.size < 3
      ? '⚠️ 大人學提醒：三個維度請分別指派不同角色（一欄一勾），切勿同時固定兩項以上！'
      : `✅ 裁決原則：${f.ruleNote}`;

    svg += `<rect x="35" y="320" width="690" height="54" rx="10" fill="rgba(56,189,248,0.1)" stroke="#38bdf8" stroke-width="1.5"/>`;
    svg += `<text x="52" y="352" fill="#f8fafc" font-size="12.5" font-weight="600">${esc(warnMsg)}</text>`;

    return svg + '</svg>';
  }

  // 3. Stakeholder Power-Interest Grid
  function renderStakeholderGrid(f) {
    const w = 760, h = 400, padL = 75, padR = 40, padT = 50, padB = 50;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    let svg = svgHeader(w, h);
    svg += `<text x="380" y="30" text-anchor="middle" fill="#f8fafc" font-size="16" font-weight="800">${esc(f.title)}</text>`;

    // 4 Quadrants
    const mx = padL + plotW / 2, my = padT + plotH / 2;
    svg += `<rect x="${padL}" y="${padT}" width="${plotW / 2}" height="${plotH / 2}" fill="rgba(251,191,36,0.1)" stroke="rgba(148,163,184,0.25)"/>`;
    svg += `<rect x="${mx}" y="${padT}" width="${plotW / 2}" height="${plotH / 2}" fill="rgba(251,113,133,0.12)" stroke="rgba(148,163,184,0.25)"/>`;
    svg += `<rect x="${padL}" y="${my}" width="${plotW / 2}" height="${plotH / 2}" fill="rgba(148,163,184,0.06)" stroke="rgba(148,163,184,0.25)"/>`;
    svg += `<rect x="${mx}" y="${my}" width="${plotW / 2}" height="${plotH / 2}" fill="rgba(56,189,248,0.1)" stroke="rgba(148,163,184,0.25)"/>`;

    svg += `<text x="${padL + 12}" y="${padT + 22}" fill="#fbbf24" font-size="12" font-weight="700">⚠️ 高權力 × 低關切：保持滿意 (Keep Satisfied - 潛在否決地雷)</text>`;
    svg += `<text x="${mx + 12}" y="${padT + 22}" fill="#fb7185" font-size="12" font-weight="700">🔥 高權力 × 高關切：重點密切管理 (Manage Closely)</text>`;
    svg += `<text x="${padL + 12}" y="${my + 22}" fill="#94a3b8" font-size="12" font-weight="700">🌱 低權力 × 低關切：定期監督 (Monitor)</text>`;
    svg += `<text x="${mx + 12}" y="${my + 22}" fill="#38bdf8" font-size="12" font-weight="700">📢 低權力 × 高關切：隨時告知透明溝通 (Keep Informed)</text>`;

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

      svg += `<circle cx="${cx}" cy="${cy}" r="11" fill="${color}" stroke="#0b0f19" stroke-width="2" data-tip="${esc(name)} | 權力:${power} 關切:${interest} (${esc(att)})"/>`;
      svg += `<rect x="${cx - 58}" y="${cy + 14}" width="116" height="20" rx="5" fill="rgba(15,23,42,0.88)" stroke="${color}" stroke-width="1"/>`;
      svg += `<text x="${cx}" y="${cy + 28}" text-anchor="middle" fill="#f8fafc" font-size="11" font-weight="600">${esc(name)}</text>`;
    });

    svg += `<text x="${padL + plotW / 2}" y="${h - 14}" text-anchor="middle" fill="#cbd5e1" font-size="12" font-weight="600">利益關切度 (Interest) ➔　|　圓點顏色：🟢支持　🟡中立　🔴反對</text>`;
    svg += `<text x="22" y="${padT + plotH / 2}" text-anchor="middle" fill="#cbd5e1" font-size="12" font-weight="600" transform="rotate(-90, 22, ${padT + plotH / 2})">權力影響力 (Power) ➔</text>`;

    return svg + '</svg>';
  }

  // 4. WBS Work Breakdown Structure
  function renderWbsBuilder(f) {
    const w = 760, h = 400;
    let svg = svgHeader(w, h);

    // Root node
    svg += `<rect x="230" y="22" width="300" height="46" rx="10" fill="#38bdf8" stroke="#e0f2fe" stroke-width="2"/>`;
    svg += `<text x="380" y="50" text-anchor="middle" fill="#0b0f19" font-size="14" font-weight="800">${esc(f.title)}</text>`;

    // Tree connector lines
    svg += `<line x1="380" y1="68" x2="380" y2="95" stroke="#38bdf8" stroke-width="2.5"/>`;
    svg += `<line x1="145" y1="95" x2="615" y2="95" stroke="#38bdf8" stroke-width="2.5"/>`;

    const cols = [
      { title: f.col1Title, items: String(f.col1Items || '').split(','), cx: 145, color: '#38bdf8' },
      { title: f.col2Title, items: String(f.col2Items || '').split(','), cx: 380, color: '#818cf8' },
      { title: f.col3Title, items: String(f.col3Items || '').split(','), cx: 615, color: '#34d399' }
    ];

    cols.forEach(c => {
      svg += `<line x1="${c.cx}" y1="95" x2="${c.cx}" y2="118" stroke="${c.color}" stroke-width="2.5"/>`;
      svg += `<rect x="${c.cx - 102}" y="118" width="204" height="42" rx="8" fill="rgba(30,41,59,0.95)" stroke="${c.color}" stroke-width="2"/>`;
      svg += `<text x="${c.cx}" y="144" text-anchor="middle" fill="${c.color}" font-size="13" font-weight="800">${esc(c.title)}</text>`;

      c.items.map(s => s.trim()).filter(Boolean).slice(0, 4).forEach((item, idx) => {
        const iy = 182 + idx * 52;
        svg += `<line x1="${c.cx - 82}" y1="${idx === 0 ? 160 : iy - 14}" x2="${c.cx - 82}" y2="${iy + 18}" stroke="${c.color}" stroke-width="1.8"/>`;
        svg += `<line x1="${c.cx - 82}" y1="${iy + 18}" x2="${c.cx - 68}" y2="${iy + 18}" stroke="${c.color}" stroke-width="1.8"/>`;
        svg += `<rect x="${c.cx - 68}" y="${iy}" width="170" height="36" rx="6" fill="#1e293b" stroke="rgba(148,163,184,0.3)"/>`;
        svg += `<text x="${c.cx + 17}" y="${iy + 23}" text-anchor="middle" fill="#f1f5f9" font-size="12" font-weight="600">${esc(item)}</text>`;
      });
    });

    svg += `<text x="380" y="384" text-anchor="middle" fill="#94a3b8" font-size="11.5">💡 大人學 WBS 100% 法則：以「可交付成果（名詞）」拆解，下層總和 = 100% 上層範疇</text>`;
    return svg + '</svg>';
  }

  // 5. CCPM Critical Chain Buffer Fever Chart
  function renderCcpmBuffer(f) {
    const w = 760, h = 400, padL = 70, padR = 45, padT = 48, padB = 52;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    let svg = svgHeader(w, h);
    svg += `<text x="380" y="30" text-anchor="middle" fill="#f8fafc" font-size="16" font-weight="800">${esc(f.title)}</text>`;

    const toX = (v) => padL + (Math.max(0, Math.min(100, v)) / 100) * plotW;
    const toY = (v) => padT + plotH - (Math.max(0, Math.min(100, v)) / 100) * plotH;

    // 3 Fever Zones: Green (bottom-right), Yellow (middle channel), Red (top-left)
    // Red polygon: top-left above (0,35) to (100,90)
    svg += `<polygon points="${toX(0)},${toY(100)} ${toX(100)},${toY(100)} ${toX(100)},${toY(88)} ${toX(0)},${toY(32)}" fill="rgba(251,113,133,0.28)"/>`;
    // Yellow channel: between (0,32)->(100,88) and (0,12)->(100,65)
    svg += `<polygon points="${toX(0)},${toY(32)} ${toX(100)},${toY(88)} ${toX(100)},${toY(62)} ${toX(0)},${toY(12)}" fill="rgba(251,191,36,0.26)"/>`;
    // Green zone: below (0,12)->(100,62)
    svg += `<polygon points="${toX(0)},${toY(12)} ${toX(100)},${toY(62)} ${toX(100)},${toY(0)} ${toX(0)},${toY(0)}" fill="rgba(52,211,153,0.24)"/>`;

    svg += `<text x="${toX(18)}" y="${toY(82)}" fill="#fb7185" font-size="13" font-weight="800">🔴 紅區：立即啟動救援趕工 (Act)</text>`;
    svg += `<text x="${toX(48)}" y="${toY(56)}" fill="#fbbf24" font-size="13" font-weight="800">🟡 黃區：擬定緩衝應變對策 (Plan)</text>`;
    svg += `<text x="${toX(68)}" y="${toY(24)}" fill="#34d399" font-size="13" font-weight="800">🟢 綠區：健康推進 (Monitor)</text>`;

    // Parse checkpoints
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
      svg += `<circle cx="${toX(pt.x)}" cy="${toY(pt.y)}" r="6" fill="#38bdf8" stroke="#0b0f19" stroke-width="2" data-tip="${pt.label}: 完成度 ${pt.x}% / 緩衝消耗 ${pt.y}%"/>`;
      svg += `<text x="${toX(pt.x)}" y="${toY(pt.y) - 10}" text-anchor="middle" fill="#f8fafc" font-size="11" font-weight="700">${pt.label}(${pt.x}%,${pt.y}%)</text>`;
    });

    svg += `<text x="${padL + plotW / 2}" y="${h - 14}" text-anchor="middle" fill="#cbd5e1" font-size="12" font-weight="600">關鍵鏈任務完成進度 (%) ➔</text>`;
    svg += `<text x="22" y="${padT + plotH / 2}" text-anchor="middle" fill="#cbd5e1" font-size="12" font-weight="600" transform="rotate(-90, 22, ${padT + plotH / 2})">專案總緩衝消耗比例 (%) ➔</text>`;

    return svg + '</svg>';
  }

  // 6. RACI Matrix with Auto Health-Check
  function renderRaciMatrix(f) {
    const w = 760, h = 400;
    let svg = svgHeader(w, h);
    svg += `<text x="380" y="32" text-anchor="middle" fill="#f8fafc" font-size="16" font-weight="800">${esc(f.title)}</text>`;

    const roles = String(f.roles || '').split(',').map(s => s.trim()).slice(0, 4);
    while (roles.length < 4) roles.push(`角色 ${roles.length + 1}`);

    const tx = 35, ty = 56, taskW = 215, colW = 102, statusW = 62, rh = 56;
    // Header
    svg += `<rect x="${tx}" y="${ty}" width="${taskW - 6}" height="38" rx="6" fill="#1e293b"/>`;
    svg += `<text x="${tx + taskW / 2}" y="${ty + 24}" text-anchor="middle" fill="#94a3b8" font-size="12" font-weight="700">工作包 / 關鍵決策項目</text>`;

    roles.forEach((r, idx) => {
      const cx = tx + taskW + idx * colW;
      svg += `<rect x="${cx}" y="${ty}" width="${colW - 6}" height="38" rx="6" fill="#1e293b"/>`;
      svg += `<text x="${cx + (colW - 6) / 2}" y="${ty + 24}" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="700">${esc(r)}</text>`;
    });

    svg += `<text x="${tx + taskW + 4 * colW + statusW / 2}" y="${ty + 24}" text-anchor="middle" fill="#cbd5e1" font-size="11.5" font-weight="700">健檢</text>`;

    ['row1', 'row2', 'row3', 'row4'].forEach((rk, rIdx) => {
      const y = ty + 46 + rIdx * rh;
      const raw = String(f[rk] || '');
      const [taskName, cellsStr] = raw.split('|').map(s => (s || '').trim());
      const cells = (cellsStr || '').split(',').map(s => s.trim().toUpperCase());

      svg += `<rect x="${tx}" y="${y}" width="${taskW - 6}" height="${rh - 8}" rx="6" fill="#1e293b"/>`;
      svg += `<text x="${tx + 12}" y="${y + 29}" fill="#f8fafc" font-size="12" font-weight="600">${esc(taskName || '未命名任務')}</text>`;

      let aCount = 0;
      let rCount = 0;
      for (let c = 0; c < 4; c++) {
        const val = cells[c] || '-';
        if (val.includes('A')) aCount++;
        if (val.includes('R')) rCount++;

        const cx = tx + taskW + c * colW;
        const badgeColor = val.includes('A') ? '#fb7185' : (val.includes('R') ? '#38bdf8' : (val.includes('C') ? '#fbbf24' : '#64748b'));
        svg += `<rect x="${cx}" y="${y}" width="${colW - 6}" height="${rh - 8}" rx="6" fill="rgba(30,41,59,0.65)" stroke="${badgeColor}" stroke-width="1.6"/>`;
        svg += `<text x="${cx + (colW - 6) / 2}" y="${y + 30}" text-anchor="middle" fill="${badgeColor}" font-size="14" font-weight="800">${esc(val)}</text>`;
      }

      const sx = tx + taskW + 4 * colW + statusW / 2;
      const isOk = aCount === 1 && rCount >= 1;
      const tip = aCount === 0 ? '⚠️ 缺少當責者(A)' : (aCount > 1 ? '⚠️ 多頭馬車(超過1個A)' : (rCount === 0 ? '⚠️ 無人執行(R)' : '✅ 權責健全'));
      svg += `<text x="${sx}" y="${y + 30}" text-anchor="middle" fill="${isOk ? '#34d399' : '#fb7185'}" font-size="12" font-weight="700" data-tip="${tip}">${isOk ? '✅ 正常' : '⚠️ 異常'}</text>`;
    });

    svg += `<text x="380" y="366" text-anchor="middle" fill="#cbd5e1" font-size="12"><tspan fill="#fb7185" font-weight="700">A = Accountable (唯一當責拍板)</tspan>　|　<tspan fill="#38bdf8" font-weight="700">R = Responsible (實際執行)</tspan>　|　<tspan fill="#fbbf24" font-weight="700">C = Consulted (事前諮詢)</tspan>　|　I = Informed (事後告知)</text>`;
    return svg + '</svg>';
  }

  // 7. Risk Probability-Impact Matrix
  function renderRiskMatrix(f) {
    const w = 760, h = 400;
    let svg = svgHeader(w, h);
    svg += `<text x="380" y="30" text-anchor="middle" fill="#f8fafc" font-size="16" font-weight="800">${esc(f.title)}</text>`;

    const gx = 60, gy = 55, cell = 56;
    for (let r = 0; r < 5; r++) {
      const prob = 5 - r;
      svg += `<text x="${gx - 10}" y="${gy + r * cell + 32}" text-anchor="end" fill="#cbd5e1" font-size="11">機率 ${prob}</text>`;
      for (let c = 0; c < 5; c++) {
        const imp = c + 1;
        const score = prob * imp;
        const fill = score >= 15 ? 'rgba(251,113,133,0.34)' : (score >= 8 ? 'rgba(251,191,36,0.26)' : 'rgba(52,211,153,0.2)');
        svg += `<rect x="${gx + c * cell}" y="${gy + r * cell}" width="${cell - 3}" height="${cell - 3}" rx="5" fill="${fill}"/>`;
      }
    }
    for (let c = 0; c < 5; c++) {
      svg += `<text x="${gx + c * cell + 26}" y="${gy + 5 * cell + 18}" text-anchor="middle" fill="#cbd5e1" font-size="11">衝擊 ${c + 1}</text>`;
    }

    // Parse risks and plot both on grid and right-side action list
    ['r1', 'r2', 'r3', 'r4', 'r5'].forEach((rk, idx) => {
      const parts = String(f[rk] || '').split(',').map(s => s.trim());
      if (parts.length < 3) return;
      const name = parts[0];
      const p = Math.max(1, Math.min(5, Number(parts[1]) || 3));
      const imp = Math.max(1, Math.min(5, Number(parts[2]) || 3));
      const strat = parts.slice(3).join(', ') || '監控中';

      const cx = gx + (imp - 1) * cell + 27 + (idx % 2) * 8 - 4;
      const cy = gy + (5 - p) * cell + 27;
      const score = p * imp;
      const color = score >= 15 ? '#fb7185' : (score >= 8 ? '#fbbf24' : '#34d399');

      svg += `<circle cx="${cx}" cy="${cy}" r="12" fill="${color}" stroke="#0b0f19" stroke-width="2" data-tip="${esc(name)} (P=${p}, I=${imp}, Score=${score})"/>`;
      svg += `<text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="#0b0f19" font-size="10.5" font-weight="800">R${idx + 1}</text>`;

      // Right side card
      const ry = 55 + idx * 60;
      svg += `<rect x="360" y="${ry}" width="375" height="52" rx="8" fill="#1e293b" stroke="${color}" stroke-width="1.6"/>`;
      svg += `<text x="372" y="${ry + 21}" fill="${color}" font-size="12" font-weight="800">${esc(name)} (風險值 ${score})</text>`;
      svg += `<text x="372" y="${ry + 41}" fill="#e2e8f0" font-size="11.5">🛡️ ${esc(strat)}</text>`;
    });

    return svg + '</svg>';
  }

  // 8. TOC Current Reality Tree (CRT Root Cause)
  function renderTocCrt(f) {
    const w = 760, h = 400;
    let svg = svgHeader(w, h);
    svg += `<text x="380" y="28" text-anchor="middle" fill="#f8fafc" font-size="16" font-weight="800">${esc(f.title)}</text>`;

    // Top row: 3 UDEs
    const udes = [f.ude1, f.ude2, f.ude3];
    udes.forEach((u, i) => {
      const x = 35 + i * 235;
      svg += `<rect x="${x}" y="48" width="220" height="54" rx="8" fill="rgba(251,113,133,0.14)" stroke="#fb7185" stroke-width="1.8"/>`;
      svg += `<text x="${x + 110}" y="68" text-anchor="middle" fill="#fb7185" font-size="10.5" font-weight="800">表面不理想現象 UDE ${i + 1}</text>`;
      svg += `<text x="${x + 110}" y="89" text-anchor="middle" fill="#f8fafc" font-size="11.5" font-weight="600">${esc(u).slice(0, 17)}</text>`;
    });

    // Middle row: 2 intermediate causes
    const mids = [
      { text: f.mid1, x: 105 },
      { text: f.mid2, x: 415 }
    ];
    mids.forEach((m, i) => {
      svg += `<rect x="${m.x}" y="148" width="240" height="54" rx="8" fill="rgba(251,191,36,0.14)" stroke="#fbbf24" stroke-width="1.8"/>`;
      svg += `<text x="${m.x + 120}" y="168" text-anchor="middle" fill="#fbbf24" font-size="10.5" font-weight="800">中層結構原因 ${i + 1}</text>`;
      svg += `<text x="${m.x + 120}" y="189" text-anchor="middle" fill="#f8fafc" font-size="11.5" font-weight="600">${esc(m.text).slice(0, 19)}</text>`;
    });

    // Bottom Root Cause
    svg += `<rect x="130" y="246" width="500" height="58" rx="10" fill="rgba(56,189,248,0.18)" stroke="#38bdf8" stroke-width="2.5"/>`;
    svg += `<text x="380" y="268" text-anchor="middle" fill="#38bdf8" font-size="11.5" font-weight="800">🔥 最底層核心根因 (Core Problem / Bottleneck)</text>`;
    svg += `<text x="380" y="291" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">${esc(f.rootCause)}</text>`;

    // Upward causal arrows
    svg += `<line x1="280" y1="246" x2="225" y2="204" stroke="#38bdf8" stroke-width="2.2"/>`;
    svg += `<line x1="480" y1="246" x2="535" y2="204" stroke="#38bdf8" stroke-width="2.2"/>`;
    svg += `<line x1="225" y1="148" x2="145" y2="104" stroke="#fbbf24" stroke-width="2"/>`;
    svg += `<line x1="225" y1="148" x2="380" y2="104" stroke="#fbbf24" stroke-width="2"/>`;
    svg += `<line x1="535" y1="148" x2="380" y2="104" stroke="#fbbf24" stroke-width="2"/>`;
    svg += `<line x1="535" y1="148" x2="615" y2="104" stroke="#fbbf24" stroke-width="2"/>`;

    // Action solution bar
    svg += `<rect x="60" y="324" width="640" height="52" rx="8" fill="rgba(52,211,153,0.15)" stroke="#34d399" stroke-width="1.8"/>`;
    svg += `<text x="380" y="355" text-anchor="middle" fill="#34d399" font-size="13" font-weight="700">🎯 拔除根因的高槓桿解方：${esc(f.action)}</text>`;

    return svg + '</svg>';
  }

  // 9. PERT Three-Point Estimator
  function renderPertEstimator(f) {
    const w = 760, h = 400;
    let svg = svgHeader(w, h);
    svg += `<text x="380" y="30" text-anchor="middle" fill="#f8fafc" font-size="16" font-weight="800">${esc(f.title)}</text>`;

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

    // Table & Range bars
    items.forEach((it, i) => {
      const y = 62 + i * 54;
      svg += `<rect x="35" y="${y}" width="690" height="44" rx="8" fill="#1e293b"/>`;
      svg += `<text x="50" y="${y + 27}" fill="#f8fafc" font-size="12.5" font-weight="700">${esc(it.name)}</text>`;
      svg += `<text x="235" y="${y + 27}" fill="#94a3b8" font-size="12">O=${it.O}d / M=${it.M}d / P=${it.P}d</text>`;
      svg += `<text x="415" y="${y + 27}" fill="#38bdf8" font-size="12.5" font-weight="700">期望值 E = ${it.E.toFixed(1)} 天</text>`;
      svg += `<text x="575" y="${y + 27}" fill="#fbbf24" font-size="12" font-weight="600">標準差 σ = ±${it.sd.toFixed(2)} 天</text>`;
    });

    // Summary Confidence Cards
    const cards = [
      { label: '50% 機率準時 (期望總和 E)', val: `${totalE.toFixed(1)} 天`, sub: '⚠️ 形同擲硬幣，不可直接當死線承諾', color: '#38bdf8', x: 35 },
      { label: '85% 把握準時承諾 (E + 1.04σ)', val: `${p85.toFixed(1)} 天`, sub: '✅ 實務最推薦的專案基準排程工期', color: '#34d399', x: 270 },
      { label: '95% 高把握合約死線 (E + 1.65σ)', val: `${p95.toFixed(1)} 天`, sub: '🛡️ 適用具違約罰則之外部客戶合約', color: '#fbbf24', x: 505 }
    ];

    cards.forEach(c => {
      svg += `<rect x="${c.x}" y="290" width="220" height="88" rx="10" fill="rgba(30,41,59,0.9)" stroke="${c.color}" stroke-width="2"/>`;
      svg += `<text x="${c.x + 110}" y="314" text-anchor="middle" fill="${c.color}" font-size="11.5" font-weight="700">${c.label}</text>`;
      svg += `<text x="${c.x + 110}" y="346" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="800">${c.val}</text>`;
      svg += `<text x="${c.x + 110}" y="366" text-anchor="middle" fill="#94a3b8" font-size="10">${c.sub}</text>`;
    });

    return svg + '</svg>';
  }

  // 10. MoSCoW Prioritization & Capacity Board
  function renderMoscowBoard(f) {
    const w = 760, h = 400;
    let svg = svgHeader(w, h);
    svg += `<text x="380" y="28" text-anchor="middle" fill="#f8fafc" font-size="16" font-weight="800">${esc(f.title)}</text>`;

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

    // Top Capacity Gauge Bar
    svg += `<rect x="35" y="45" width="690" height="36" rx="8" fill="#1e293b"/>`;
    const mw = Math.min(690, (mDays / cap) * 690);
    const sw = Math.min(690 - mw, (sDays / cap) * 690);
    const cw = Math.min(690 - mw - sw, (cDays / cap) * 690);
    svg += `<rect x="35" y="45" width="${mw}" height="36" rx="6" fill="#fb7185"/>`;
    svg += `<rect x="${35 + mw}" y="45" width="${sw}" height="36" fill="#fbbf24"/>`;
    svg += `<rect x="${35 + mw + sw}" y="45" width="${cw}" height="36" fill="#34d399"/>`;
    svg += `<text x="380" y="68" text-anchor="middle" fill="#0b0f19" font-size="12" font-weight="800">產能負載：Must(${mDays}d, ${mustPct}%) + Should(${sDays}d) + Could(${cDays}d) = ${activeTotal} / ${cap} 人天 ${mustPct > 65 ? '⚠️ Must佔比過高(>60%)' : '✅ 健康配比'}</text>`;

    const boxes = [
      { title: `M - Must Have 必做 (${mDays}d)`, items: must, x: 35, y: 96, color: '#fb7185' },
      { title: `S - Should Have 應做 (${sDays}d)`, items: should, x: 388, y: 96, color: '#fbbf24' },
      { title: `C - Could Have 緩衝池 (${cDays}d)`, items: could, x: 35, y: 245, color: '#34d399' },
      { title: `W - Won't Have 本期排除 (${wDays}d)`, items: wont, x: 388, y: 245, color: '#94a3b8' }
    ];

    boxes.forEach(b => {
      svg += `<rect x="${b.x}" y="${b.y}" width="337" height="135" rx="10" fill="rgba(30,41,59,0.8)" stroke="${b.color}" stroke-width="2"/>`;
      svg += `<text x="${b.x + 14}" y="${b.y + 24}" fill="${b.color}" font-size="13" font-weight="800">${b.title}</text>`;
      b.items.slice(0, 3).forEach((it, idx) => {
        const iy = b.y + 38 + idx * 29;
        svg += `<rect x="${b.x + 12}" y="${iy}" width="313" height="24" rx="5" fill="#0f172a"/>`;
        svg += `<text x="${b.x + 22}" y="${iy + 16}" fill="#f8fafc" font-size="11.5">${esc(it.name)}</text>`;
        svg += `<text x="${b.x + 315}" y="${iy + 16}" text-anchor="end" fill="${b.color}" font-size="11.5" font-weight="700">${it.days} 人天</text>`;
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

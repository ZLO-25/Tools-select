/**
 * 15種常用圖表 SVG 互動渲染引擎 (Zero-dependency, 高解析度自適應)
 */
(function () {
  const PALETTE = [
    '#38bdf8', '#818cf8', '#34d399', '#fbbf24',
    '#fb7185', '#a78bfa', '#2dd4bf', '#f97316'
  ];

  function createSVG(w = 680, h = 340) {
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img">`;
  }

  // 1. Bar / Column Chart
  function renderBar(p) {
    const raw = [
      { label: '雲端服務', val: 92 },
      { label: 'AI 訂閱', val: 84 },
      { label: '企業授權', val: 68 },
      { label: '硬體設備', val: 54 },
      { label: '顧問培訓', val: 47 },
      { label: '廣告聯播', val: 61 }
    ];
    let data = [...raw];
    if (p.sortMode === 'desc') data.sort((a, b) => b.val - a.val);
    if (p.sortMode === 'asc') data.sort((a, b) => a.val - b.val);

    const baseOffset = Number(p.yBaseline) || 0;
    const w = 680, h = 340;
    let svg = createSVG(w, h);

    if (p.orientation === 'vertical') {
      const padL = 60, padR = 30, padT = 30, padB = 50;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const maxVal = 100;

      // Grid lines
      for (let i = 0; i <= 4; i++) {
        const v = Math.round(baseOffset + ((maxVal - baseOffset) * i) / 4);
        const y = padT + plotH - (i / 4) * plotH;
        svg += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="currentColor" stroke-opacity="0.12" stroke-dasharray="4 4"/>`;
        svg += `<text x="${padL - 10}" y="${y + 4}" text-anchor="end" fill="currentColor" opacity="0.65" font-size="11">${v}M</text>`;
      }

      if (baseOffset > 0) {
        svg += `<text x="${w - padR}" y="${padT - 8}" text-anchor="end" fill="#fbbf24" font-size="11" font-weight="600">⚠️ 警告：Y軸起點被截斷為 ${baseOffset}M (視覺差距被誇大)</text>`;
      }

      const step = plotW / data.length;
      const barW = step * 0.56;
      data.forEach((d, idx) => {
        const ratio = Math.max(0.02, (d.val - baseOffset) / (maxVal - baseOffset));
        const bh = ratio * plotH;
        const x = padL + idx * step + (step - barW) / 2;
        const y = padT + plotH - bh;
        const color = PALETTE[idx % PALETTE.length];
        svg += `<rect x="${x}" y="${y}" width="${barW}" height="${bh}" rx="6" fill="${color}" data-tip="${d.label}: ${d.val}M (基準起點 ${baseOffset}M)"/>`;
        if (p.showValues) {
          svg += `<text x="${x + barW / 2}" y="${y - 7}" text-anchor="middle" fill="currentColor" font-size="12" font-weight="700">${d.val}M</text>`;
        }
        svg += `<text x="${x + barW / 2}" y="${padT + plotH + 22}" text-anchor="middle" fill="currentColor" opacity="0.85" font-size="12">${d.label}</text>`;
      });
    } else {
      // Horizontal Bar
      const padL = 92, padR = 55, padT = 28, padB = 35;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const maxVal = 100;
      const step = plotH / data.length;
      const barH = step * 0.6;

      data.forEach((d, idx) => {
        const ratio = Math.max(0.02, (d.val - baseOffset) / (maxVal - baseOffset));
        const bw = ratio * plotW;
        const y = padT + idx * step + (step - barH) / 2;
        const color = PALETTE[idx % PALETTE.length];
        svg += `<text x="${padL - 10}" y="${y + barH / 2 + 4}" text-anchor="end" fill="currentColor" opacity="0.88" font-size="12">${d.label}</text>`;
        svg += `<rect x="${padL}" y="${y}" width="${bw}" height="${barH}" rx="6" fill="${color}" data-tip="${d.label}: ${d.val}M"/>`;
        if (p.showValues) {
          svg += `<text x="${padL + bw + 8}" y="${y + barH / 2 + 4}" fill="currentColor" font-size="12" font-weight="700">${d.val}M</text>`;
        }
      });
    }
    return svg + '</svg>';
  }

  // 2. Line Chart
  function renderLine(p) {
    const w = 680, h = 340, padL = 55, padR = 30, padT = 30, padB = 45;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const noiseSeeds = [0.2, -0.7, 0.5, -0.4, 0.9, -0.6, 0.3, 0.8, -0.5, 0.4, -0.3, 0.6];
    const vol = Number(p.volatility);
    const slope = Number(p.slope);

    const pts = months.map((m, i) => {
      const base = 100 + (i / 11) * slope * 2.2;
      const val = Math.max(15, Math.round(base + noiseSeeds[i] * vol));
      return { m, val };
    });

    const maPts = pts.map((d, i) => {
      const slice = pts.slice(Math.max(0, i - 2), i + 1);
      const avg = Math.round(slice.reduce((s, x) => s + x.val, 0) / slice.length);
      return { m: d.m, val: avg };
    });

    const allVals = pts.map(d => d.val);
    const minV = Math.min(40, ...allVals) - 10;
    const maxV = Math.max(180, ...allVals) + 15;

    let svg = createSVG(w, h);
    for (let i = 0; i <= 4; i++) {
      const v = Math.round(minV + ((maxV - minV) * i) / 4);
      const y = padT + plotH - (i / 4) * plotH;
      svg += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="currentColor" stroke-opacity="0.12" stroke-dasharray="4 4"/>`;
      svg += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="currentColor" opacity="0.65" font-size="11">${v}</text>`;
    }

    const toCoord = (arr) => arr.map((d, i) => ({
      x: padL + (i / (arr.length - 1)) * plotW,
      y: padT + plotH - ((d.val - minV) / (maxV - minV)) * plotH,
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
      svg += `<circle cx="${c.x}" cy="${c.y}" r="5" fill="#38bdf8" stroke="#0b0f19" stroke-width="2" data-tip="${c.m} 實際值: ${c.val}"/>`;
      svg += `<text x="${c.x}" y="${padT + plotH + 22}" text-anchor="middle" fill="currentColor" opacity="0.8" font-size="11">${c.m}</text>`;
    });

    svg += `<g transform="translate(${padL + 10}, ${padT - 10})">
      <circle cx="0" cy="0" r="4" fill="#38bdf8"/><text x="8" y="4" fill="currentColor" font-size="11">月活躍指數 (原始)</text>
      ${p.showMA ? `<line x1="125" y1="0" x2="145" y2="0" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="4 2"/><text x="150" y="4" fill="#fbbf24" font-size="11">3期移動平均線 (MA)</text>` : ''}
    </g>`;

    return svg + '</svg>';
  }

  // 3. Pie / Donut Chart
  function renderPie(p) {
    const rawItems = [
      { name: '直接訪問', val: 38 },
      { name: '自然搜尋 (SEO)', val: 27 },
      { name: '付費廣告', val: 16 },
      { name: '社群導流', val: 9 },
      { name: '電子報 EDM', val: 5 },
      { name: '聯盟行銷', val: 3 },
      { name: '外部推薦', val: 1.2 },
      { name: '其他來源', val: 0.8 }
    ];
    const count = Number(p.sliceCount);
    const chosen = rawItems.slice(0, count - 1);
    const restSum = rawItems.slice(count - 1).reduce((s, x) => s + x.val, 0);
    chosen.push({ name: count < 8 ? '其他合併項目' : '其他來源', val: Number(restSum.toFixed(1)) });

    const total = chosen.reduce((s, x) => s + x.val, 0);
    const w = 680, h = 340, cx = 235, cy = 170, R = 122;
    const r = (Number(p.innerRadius) / 100) * R;
    let svg = createSVG(w, h);

    let startAngle = -Math.PI / 2;
    chosen.forEach((item, idx) => {
      const frac = item.val / total;
      const angle = frac * Math.PI * 2;
      const endAngle = startAngle + angle;
      const midAngle = startAngle + angle / 2;
      const explode = (idx === 0 && p.explodeFirst) ? 12 : 0;
      const ox = Math.cos(midAngle) * explode;
      const oy = Math.sin(midAngle) * explode;

      const x1 = cx + ox + R * Math.cos(startAngle);
      const y1 = cy + oy + R * Math.sin(startAngle);
      const x2 = cx + ox + R * Math.cos(endAngle);
      const y2 = cy + oy + R * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const color = PALETTE[idx % PALETTE.length];

      let pathD = '';
      if (r <= 1) {
        pathD = `M ${cx + ox} ${cy + oy} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      } else {
        const ix1 = cx + ox + r * Math.cos(endAngle);
        const iy1 = cy + oy + r * Math.sin(endAngle);
        const ix2 = cx + ox + r * Math.cos(startAngle);
        const iy2 = cy + oy + r * Math.sin(startAngle);
        pathD = `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${r} ${r} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
      }

      svg += `<path d="${pathD}" fill="${color}" stroke="#0b0f19" stroke-width="2" data-tip="${item.name}: ${item.val}%"/>`;
      startAngle = endAngle;
    });

    if (r > 35) {
      svg += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="currentColor" font-size="12" opacity="0.7">總流量佔比</text>`;
      svg += `<text x="${cx}" y="${cy + 18}" text-anchor="middle" fill="currentColor" font-size="18" font-weight="800">100%</text>`;
    }

    // Legend on right
    chosen.forEach((item, idx) => {
      const ly = 52 + idx * 32;
      const color = PALETTE[idx % PALETTE.length];
      svg += `<rect x="415" y="${ly - 11}" width="14" height="14" rx="4" fill="${color}"/>`;
      svg += `<text x="438" y="${ly}" fill="currentColor" font-size="13">${item.name}</text>`;
      svg += `<text x="630" y="${ly}" text-anchor="end" fill="currentColor" font-weight="700" font-size="13">${item.val}%</text>`;
    });

    if (count >= 7) {
      svg += `<text x="415" y="318" fill="#fbbf24" font-size="11.5" font-weight="600">💡 切塊達 ${count} 項時細小扇形已難以辨識，建議控制在 5 項內</text>`;
    }

    return svg + '</svg>';
  }

  // 4. Area / Stacked Area Chart
  function renderArea(p) {
    const w = 680, h = 340, padL = 55, padR = 30, padT = 32, padB = 45;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'];
    const s1 = [30, 35, 42, 48, 55, 62, 70, 78]; // 核心訂閱
    const s2 = [25, 28, 26, 32, 38, 40, 45, 52]; // 企業增購
    const s3 = [18, 15, 20, 22, 19, 25, 28, 30]; // 專業服務
    const alpha = (Number(p.opacity) / 100).toFixed(2);

    let svg = createSVG(w, h);
    const mode = p.mode;
    const maxVal = mode === 'percent' ? 100 : (mode === 'stacked' ? 170 : 90);

    for (let i = 0; i <= 4; i++) {
      const v = Math.round((maxVal * i) / 4);
      const y = padT + plotH - (i / 4) * plotH;
      svg += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="currentColor" stroke-opacity="0.12" stroke-dasharray="4 4"/>`;
      svg += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="currentColor" opacity="0.65" font-size="11">${v}${mode === 'percent' ? '%' : 'M'}</text>`;
    }

    const xAt = (i) => padL + (i / (quarters.length - 1)) * plotW;
    const yAt = (val) => padT + plotH - (val / maxVal) * plotH;

    const seriesMeta = [
      { name: '核心訂閱', color: '#38bdf8', vals: s1 },
      { name: '企業增購', color: '#818cf8', vals: s2 },
      { name: '專業顧問', color: '#34d399', vals: s3 }
    ];

    if (mode === 'overlap') {
      seriesMeta.forEach((s) => {
        const topPts = s.vals.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' L ');
        const areaD = `M ${xAt(0)},${yAt(0)} L ${topPts} L ${xAt(quarters.length - 1)},${yAt(0)} Z`;
        svg += `<path d="${areaD}" fill="${s.color}" fill-opacity="${alpha}" stroke="${s.color}" stroke-width="2"/>`;
      });
    } else {
      let prevTop = quarters.map(() => 0);
      seriesMeta.forEach((s) => {
        const currTop = s.vals.map((v, i) => {
          const sumAll = s1[i] + s2[i] + s3[i];
          const val = mode === 'percent' ? (v / sumAll) * 100 : v;
          return prevTop[i] + val;
        });
        const topLine = currTop.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' L ');
        const botLine = [...prevTop].reverse().map((v, idx) => {
          const origIdx = quarters.length - 1 - idx;
          return `${xAt(origIdx)},${yAt(v)}`;
        }).join(' L ');
        const areaD = `M ${topLine} L ${botLine} Z`;
        svg += `<path d="${areaD}" fill="${s.color}" fill-opacity="${alpha}" stroke="${s.color}" stroke-width="2"/>`;
        prevTop = currTop;
      });
    }

    quarters.forEach((q, i) => {
      svg += `<text x="${xAt(i)}" y="${padT + plotH + 22}" text-anchor="middle" fill="currentColor" opacity="0.8" font-size="12">${q}</text>`;
    });

    seriesMeta.forEach((s, i) => {
      svg += `<rect x="${padL + i * 115}" y="6" width="12" height="12" rx="3" fill="${s.color}"/>`;
      svg += `<text x="${padL + i * 115 + 18}" y="16" fill="currentColor" font-size="11.5">${s.name}</text>`;
    });

    return svg + '</svg>';
  }

  // 5. Scatter Plot
  function renderScatter(p) {
    const w = 680, h = 340, padL = 55, padR = 30, padT = 30, padB = 45;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const rTarget = Number(p.correlation) / 100;
    const N = Number(p.sampleCount);

    const pts = [];
    for (let i = 0; i < N; i++) {
      // Deterministic pseudo-normal generator
      const u1 = ((i * 37 + 13) % 97) / 97;
      const u2 = ((i * 53 + 29) % 89) / 89;
      const z1 = (u1 - 0.5) * 2.2;
      const z2 = (u2 - 0.5) * 2.2;
      const yNorm = rTarget * z1 + Math.sqrt(Math.max(0, 1 - rTarget * rTarget)) * z2;
      const xv = Math.min(95, Math.max(5, 50 + z1 * 32));
      const yv = Math.min(95, Math.max(5, 50 + yNorm * 32));
      pts.push({ x: xv, y: yv, outlier: false });
    }

    if (p.showOutlier) {
      pts.push({ x: 90, y: 12, outlier: true });
      pts.push({ x: 86, y: 16, outlier: true });
    }

    // Linear regression
    const meanX = pts.reduce((s, d) => s + d.x, 0) / pts.length;
    const meanY = pts.reduce((s, d) => s + d.y, 0) / pts.length;
    const num = pts.reduce((s, d) => s + (d.x - meanX) * (d.y - meanY), 0);
    const den = pts.reduce((s, d) => s + (d.x - meanX) ** 2, 0) || 1;
    const b1 = num / den;
    const b0 = meanY - b1 * meanX;

    let svg = createSVG(w, h);
    for (let i = 0; i <= 4; i++) {
      const v = i * 25;
      const y = padT + plotH - (i / 4) * plotH;
      svg += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="currentColor" stroke-opacity="0.12" stroke-dasharray="4 4"/>`;
      svg += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="currentColor" opacity="0.65" font-size="11">${v}</text>`;
    }

    const toX = (v) => padL + (v / 100) * plotW;
    const toY = (v) => padT + plotH - (v / 100) * plotH;

    if (p.showTrend) {
      const y1 = Math.max(0, Math.min(100, b0 + b1 * 5));
      const y2 = Math.max(0, Math.min(100, b0 + b1 * 95));
      svg += `<line x1="${toX(5)}" y1="${toY(y1)}" x2="${toX(95)}" y2="${toY(y2)}" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="6 4"/>`;
    }

    pts.forEach((d, idx) => {
      const color = d.outlier ? '#fb7185' : '#38bdf8';
      const rad = d.outlier ? 7 : 5;
      svg += `<circle cx="${toX(d.x)}" cy="${toY(d.y)}" r="${rad}" fill="${color}" fill-opacity="0.82" stroke="#0b0f19" stroke-width="1.5" data-tip="${d.outlier ? '⚠️ 離群點' : '樣本 #' + (idx + 1)} (X=${d.x.toFixed(1)}, Y=${d.y.toFixed(1)})"/>`;
    });

    svg += `<text x="${padL + plotW / 2}" y="${h - 8}" text-anchor="middle" fill="currentColor" opacity="0.75" font-size="12">廣告研發投入指數 (X) → 轉換效益表現 (Y) | 估計斜率 b=${b1.toFixed(2)}</text>`;
    return svg + '</svg>';
  }

  // 6. Bubble Chart
  function renderBubble(p) {
    const w = 680, h = 340, padL = 55, padR = 30, padT = 30, padB = 45;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const scale = Number(p.sizeScale) / 100;
    const items = [
      { name: 'AI 旗艦雲', x: 78, y: 82, rev: 120, cat: '高成長核心', color: '#38bdf8' },
      { name: '智慧中台', x: 66, y: 70, rev: 85, cat: '高成長核心', color: '#38bdf8' },
      { name: '傳統 ERP', x: 82, y: 28, rev: 140, cat: '金牛成熟線', color: '#34d399' },
      { name: '資安防護', x: 58, y: 64, rev: 65, cat: '高成長核心', color: '#38bdf8' },
      { name: '邊緣運算', x: 30, y: 76, rev: 40, cat: '潛力新星', color: '#818cf8' },
      { name: '低代碼平台', x: 38, y: 62, rev: 50, cat: '潛力新星', color: '#818cf8' },
      { name: '舊版報表', x: 25, y: 24, rev: 35, cat: '待轉型業務', color: '#fb7185' }
    ];

    let svg = createSVG(w, h);
    const toX = (v) => padL + (v / 100) * plotW;
    const toY = (v) => padT + plotH - (v / 100) * plotH;

    if (p.showQuadrants) {
      svg += `<line x1="${toX(50)}" y1="${padT}" x2="${toX(50)}" y2="${padT + plotH}" stroke="currentColor" stroke-opacity="0.28" stroke-dasharray="5 5"/>`;
      svg += `<line x1="${padL}" y1="${toY(50)}" x2="${w - padR}" y2="${toY(50)}" stroke="currentColor" stroke-opacity="0.28" stroke-dasharray="5 5"/>`;
      svg += `<text x="${w - padR - 8}" y="${padT + 16}" text-anchor="end" fill="#38bdf8" font-size="11" opacity="0.85">★ 第一象限：高市佔 × 高成長</text>`;
      svg += `<text x="${padL + 8}" y="${padT + 16}" fill="#818cf8" font-size="11" opacity="0.85">🚀 第二象限：明日之星</text>`;
    }

    items.forEach((d) => {
      // Area proportional encoding: radius proportional to sqrt(rev)
      const r = Math.sqrt(d.rev) * 2.4 * scale;
      svg += `<circle cx="${toX(d.x)}" cy="${toY(d.y)}" r="${r.toFixed(1)}" fill="${d.color}" fill-opacity="0.62" stroke="${d.color}" stroke-width="2" data-tip="${d.name} (${d.cat}) | 市佔:${d.x}% 年增:${d.y}% 營收:${d.rev}M"/>`;
      if (p.showLabels) {
        svg += `<text x="${toX(d.x)}" y="${toY(d.y) + 4}" text-anchor="middle" fill="currentColor" font-size="11" font-weight="600">${d.name}</text>`;
      }
    });

    svg += `<text x="${padL + plotW / 2}" y="${h - 8}" text-anchor="middle" fill="currentColor" opacity="0.75" font-size="12">相對市佔率 (X) × 營收年增率 (Y) × 氣泡面積=總營收規模 ($r \\propto \\sqrt{\\text{Rev}}$)</text>`;
    return svg + '</svg>';
  }

  // 7. Radar Chart
  function renderRadar(p) {
    const allAxes = [
      { label: '推論效能', a: 90, b: 72 },
      { label: '成本效益', a: 74, b: 92 },
      { label: '易用程度', a: 86, b: 80 },
      { label: '生態整合', a: 88, b: 65 },
      { label: '資安合規', a: 82, b: 88 },
      { label: '擴展彈性', a: 91, b: 70 },
      { label: '離線能力', a: 62, b: 85 },
      { label: '多語支援', a: 94, b: 76 }
    ];
    const n = Number(p.axisCount);
    const axes = allAxes.slice(0, n);
    const w = 680, h = 340, cx = 290, cy = 172, R = 122;
    const op = (Number(p.fillOpacity) / 100).toFixed(2);
    let svg = createSVG(w, h);

    // Concentric rings
    [0.25, 0.5, 0.75, 1].forEach((lvl) => {
      const pts = axes.map((_, i) => {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return `${(cx + R * lvl * Math.cos(ang)).toFixed(1)},${(cy + R * lvl * Math.sin(ang)).toFixed(1)}`;
      }).join(' ');
      svg += `<polygon points="${pts}" fill="none" stroke="currentColor" stroke-opacity="0.16"/>`;
    });

    axes.forEach((ax, i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const x2 = cx + R * Math.cos(ang);
      const y2 = cy + R * Math.sin(ang);
      const lx = cx + (R + 24) * Math.cos(ang);
      const ly = cy + (R + 20) * Math.sin(ang);
      svg += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-opacity="0.18"/>`;
      svg += `<text x="${lx}" y="${ly + 4}" text-anchor="middle" fill="currentColor" font-size="12" font-weight="500">${ax.label}</text>`;
    });

    const buildPoly = (key, color, name) => {
      const pts = axes.map((ax, i) => {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const val = ax[key] / 100;
        return {
          x: cx + R * val * Math.cos(ang),
          y: cy + R * val * Math.sin(ang),
          label: ax.label,
          score: ax[key]
        };
      });
      const polyStr = pts.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
      svg += `<polygon points="${polyStr}" fill="${color}" fill-opacity="${op}" stroke="${color}" stroke-width="2.5"/>`;
      pts.forEach(pt => {
        svg += `<circle cx="${pt.x}" cy="${pt.y}" r="4.5" fill="${color}" data-tip="${name} - ${pt.label}: ${pt.score}分"/>`;
      });
    };

    buildPoly('a', '#38bdf8', '方案 A (旗艦版)');
    if (p.compareSecond) {
      buildPoly('b', '#fbbf24', '方案 B (輕量版)');
    }

    svg += `<g transform="translate(495, 50)">
      <rect x="0" y="0" width="14" height="14" rx="3" fill="#38bdf8"/><text x="22" y="12" fill="currentColor" font-size="12.5">方案 A (旗艦版)</text>
      ${p.compareSecond ? `<rect x="0" y="28" width="14" height="14" rx="3" fill="#fbbf24"/><text x="22" y="40" fill="currentColor" font-size="12.5">方案 B (輕量版)</text>` : ''}
    </g>`;

    return svg + '</svg>';
  }

  // 8. Histogram
  function renderHistogram(p) {
    const w = 680, h = 340, padL = 55, padR = 30, padT = 32, padB = 45;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const bins = Number(p.binCount);
    const type = p.distType;

    // Generate 300 deterministic samples in [0, 100]
    const samples = [];
    for (let i = 0; i < 300; i++) {
      const u = (i + 0.5) / 300;
      let val = 50;
      if (type === 'normal') {
        val = 50 + Math.sin(i * 1.7) * 16 + Math.cos(i * 3.1) * 12;
      } else if (type === 'bimodal') {
        const center = i % 2 === 0 ? 30 : 72;
        val = center + Math.sin(i * 2.3) * 10 + Math.cos(i * 5.1) * 6;
      } else {
        // Right skewed
        val = 12 + Math.pow(u, 2.2) * 78 + Math.sin(i * 4.3) * 4;
      }
      samples.push(Math.max(1, Math.min(99, val)));
    }

    const counts = new Array(bins).fill(0);
    samples.forEach(v => {
      const idx = Math.min(bins - 1, Math.floor((v / 100) * bins));
      counts[idx]++;
    });

    const maxC = Math.max(...counts, 10);
    const mean = samples.reduce((s, x) => s + x, 0) / samples.length;
    const sorted = [...samples].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    let svg = createSVG(w, h);
    const binW = plotW / bins;

    counts.forEach((c, i) => {
      const bh = (c / maxC) * plotH;
      const x = padL + i * binW;
      const y = padT + plotH - bh;
      const rStart = Math.round((i / bins) * 100);
      const rEnd = Math.round(((i + 1) / bins) * 100);
      svg += `<rect x="${x + 0.8}" y="${y}" width="${Math.max(2, binW - 1.6)}" height="${bh}" fill="#38bdf8" fill-opacity="0.78" stroke="#0b0f19" stroke-width="1" data-tip="區間 [${rStart}~${rEnd}]: 共 ${c} 筆樣本"/>`;
    });

    if (p.showMeanMedian) {
      const mx = padL + (mean / 100) * plotW;
      const mdx = padL + (median / 100) * plotW;
      svg += `<line x1="${mx}" y1="${padT}" x2="${mx}" y2="${padT + plotH}" stroke="#fb7185" stroke-width="2.5" stroke-dasharray="5 3"/>`;
      svg += `<text x="${mx + 5}" y="${padT + 14}" fill="#fb7185" font-size="11" font-weight="700">平均數 ${mean.toFixed(1)}</text>`;
      svg += `<line x1="${mdx}" y1="${padT}" x2="${mdx}" y2="${padT + plotH}" stroke="#fbbf24" stroke-width="2.5"/>`;
      svg += `<text x="${mdx - 5}" y="${padT + 28}" text-anchor="end" fill="#fbbf24" font-size="11" font-weight="700">中位數 ${median.toFixed(1)}</text>`;
    }

    svg += `<text x="${padL + plotW / 2}" y="${h - 8}" text-anchor="middle" fill="currentColor" opacity="0.75" font-size="12">連續數值分箱區間 (共 ${bins} 箱，柱體相連代表連續區間)</text>`;
    return svg + '</svg>';
  }

  // 9. Box Plot
  function renderBoxPlot(p) {
    const w = 680, h = 340, padL = 55, padR = 30, padT = 30, padB = 45;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const spread = Number(p.spread) / 100;

    const groups = [
      { name: '演算法 A (基準)', med: 52, q1: 42, q3: 64, outliers: [91, 15], color: '#38bdf8' },
      { name: '演算法 B (穩定)', med: 68, q1: 62, q3: 74, outliers: [88], color: '#34d399' },
      { name: '演算法 C (高波動)', med: 58, q1: 35, q3: 79, outliers: [95, 12], color: '#818cf8' },
      { name: '演算法 D (極速)', med: 75, q1: 65, q3: 84, outliers: [28], color: '#fbbf24' }
    ];

    let svg = createSVG(w, h);
    const toY = (v) => padT + plotH - (Math.max(5, Math.min(98, v)) / 100) * plotH;

    for (let i = 0; i <= 4; i++) {
      const v = i * 25;
      const y = toY(v);
      svg += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="currentColor" stroke-opacity="0.12" stroke-dasharray="4 4"/>`;
      svg += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="currentColor" opacity="0.65" font-size="11">${v}ms</text>`;
    }

    const step = plotW / groups.length;
    groups.forEach((g, idx) => {
      const cx = padL + idx * step + step / 2;
      const q1 = g.med - (g.med - g.q1) * spread;
      const q3 = g.med + (g.q3 - g.med) * spread;
      const iqr = q3 - q1;
      const lowWhisker = Math.max(8, q1 - 1.2 * iqr);
      const highWhisker = Math.min(94, q3 + 1.2 * iqr);

      // Whisker line
      svg += `<line x1="${cx}" y1="${toY(highWhisker)}" x2="${cx}" y2="${toY(lowWhisker)}" stroke="${g.color}" stroke-width="2"/>`;
      svg += `<line x1="${cx - 16}" y1="${toY(highWhisker)}" x2="${cx + 16}" y2="${toY(highWhisker)}" stroke="${g.color}" stroke-width="2"/>`;
      svg += `<line x1="${cx - 16}" y1="${toY(lowWhisker)}" x2="${cx + 16}" y2="${toY(lowWhisker)}" stroke="${g.color}" stroke-width="2"/>`;

      // IQR Box
      const boxTop = toY(q3);
      const boxH = Math.max(6, toY(q1) - boxTop);
      svg += `<rect x="${cx - 30}" y="${boxTop}" width="60" height="${boxH}" rx="4" fill="${g.color}" fill-opacity="0.28" stroke="${g.color}" stroke-width="2" data-tip="${g.name} | Q1:${q1.toFixed(0)} 中位數:${g.med} Q3:${q3.toFixed(0)}"/>`;
      // Median line
      svg += `<line x1="${cx - 30}" y1="${toY(g.med)}" x2="${cx + 30}" y2="${toY(g.med)}" stroke="#fff" stroke-width="2.5"/>`;

      if (p.showJitter) {
        [-12, -6, 4, 11, -3, 8].forEach((jx, jIdx) => {
          const jv = q1 + ((jIdx + 0.5) / 6) * iqr;
          svg += `<circle cx="${cx + jx}" cy="${toY(jv)}" r="2.8" fill="#fff" fill-opacity="0.65"/>`;
        });
      }

      if (p.showOutliers) {
        g.outliers.forEach(ov => {
          svg += `<circle cx="${cx}" cy="${toY(ov)}" r="5" fill="#fb7185" stroke="#0b0f19" stroke-width="1.5" data-tip="離群值 (Outlier): ${ov}ms"/>`;
        });
      }

      svg += `<text x="${cx}" y="${padT + plotH + 22}" text-anchor="middle" fill="currentColor" font-size="12">${g.name}</text>`;
    });

    return svg + '</svg>';
  }

  // 10. Heatmap
  function renderHeatmap(p) {
    const w = 680, h = 340, padL = 75, padR = 25, padT = 36, padB = 35;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const days = ['週一', '週二', '週三', '週四', '週五'];
    const hours = ['09:00', '12:00', '15:00', '18:00', '21:00', '24:00'];
    const baseMat = [
      [42, 68, 74, 55, 62, 28],
      [48, 72, 81, 60, 66, 30],
      [50, 78, 88, 65, 74, 35],
      [46, 75, 84, 70, 82, 45],
      [55, 82, 90, 86, 96, 68]
    ];
    const contrast = Number(p.contrast) / 100;

    let svg = createSVG(w, h);
    const cw = plotW / hours.length;
    const ch = plotH / days.length;

    const getColor = (val) => {
      const norm = Math.max(0, Math.min(1, ((val - 50) * contrast + 50) / 100));
      if (p.palette === 'emerald') {
        const g = Math.round(60 + norm * 175);
        const b = Math.round(80 + norm * 80);
        return `rgb(20, ${g}, ${b})`;
      }
      if (p.palette === 'diverging') {
        if (norm < 0.5) {
          const t = norm * 2;
          return `rgb(${Math.round(56 + t * 180)}, ${Math.round(189 + t * 50)}, 248)`;
        }
        const t = (norm - 0.5) * 2;
        return `rgb(251, ${Math.round(220 - t * 130)}, ${Math.round(220 - t * 110)})`;
      }
      // sky default
      return `rgba(56, 189, 248, ${(0.15 + norm * 0.82).toFixed(2)})`;
    };

    days.forEach((day, r) => {
      const y = padT + r * ch;
      svg += `<text x="${padL - 10}" y="${y + ch / 2 + 4}" text-anchor="end" fill="currentColor" font-size="12">${day}</text>`;
      hours.forEach((hr, c) => {
        const x = padL + c * cw;
        const val = baseMat[r][c];
        svg += `<rect x="${x + 2}" y="${y + 2}" width="${cw - 4}" height="${ch - 4}" rx="6" fill="${getColor(val)}" data-tip="${day} ${hr} 活躍熱度: ${val}"/>`;
        if (p.showNumbers) {
          svg += `<text x="${x + cw / 2}" y="${y + ch / 2 + 5}" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">${val}</text>`;
        }
      });
    });

    hours.forEach((hr, c) => {
      svg += `<text x="${padL + c * cw + cw / 2}" y="${padT - 10}" text-anchor="middle" fill="currentColor" opacity="0.8" font-size="12">${hr}</text>`;
    });

    return svg + '</svg>';
  }

  // 11. Treemap
  function renderTreemap(p) {
    const w = 680, h = 340, pad = Number(p.gap);
    const blocks = [
      { name: 'AI 算力與基礎設施', pct: 32, chg: '+14.2%', x: 20, y: 20, bw: 270, bh: 300, color: '#0284c7', perfColor: '#10b981' },
      { name: '企業 SaaS 應用', pct: 22, chg: '+6.8%', x: 290, y: 20, bw: 220, bh: 175, color: '#4f46e5', perfColor: '#059669' },
      { name: '資安與合規系統', pct: 15, chg: '+4.1%', x: 510, y: 20, bw: 150, bh: 175, color: '#7c3aed', perfColor: '#34d399' },
      { name: '電商與支付金流', pct: 14, chg: '-2.4%', x: 290, y: 195, bw: 185, bh: 125, color: '#0d9488', perfColor: '#e11d48' },
      { name: '物聯網與邊緣設備', pct: 10, chg: '+1.5%', x: 475, y: 195, bw: 110, bh: 125, color: '#d97706', perfColor: '#047857' },
      { name: '傳統硬體維護', pct: 7, chg: '-5.8%', x: 585, y: 195, bw: 75, bh: 125, color: '#475569', perfColor: '#be123c' }
    ];

    let svg = createSVG(w, h);
    blocks.forEach((b) => {
      const fill = p.colorBy === 'performance' ? b.perfColor : b.color;
      const rx = b.x + pad / 2, ry = b.y + pad / 2;
      const rw = b.bw - pad, rh = b.bh - pad;
      svg += `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="8" fill="${fill}" fill-opacity="0.86" data-tip="${b.name}: 佔比 ${b.pct}% (年增 ${b.chg})"/>`;
      svg += `<text x="${rx + 12}" y="${ry + 26}" fill="#ffffff" font-size="13" font-weight="700">${b.name}</text>`;
      if (p.showPct) {
        svg += `<text x="${rx + 12}" y="${ry + 48}" fill="rgba(255,255,255,0.9)" font-size="12" font-weight="600">佔比 ${b.pct}% (${b.chg})</text>`;
      }
    });
    return svg + '</svg>';
  }

  // 12. Funnel Chart
  function renderFunnel(p) {
    const w = 680, h = 340, cx = 310;
    const r2 = Number(p.step2Rate);
    const r3 = Math.min(r2, Number(p.step3Rate));
    const r4 = Math.min(r3, Number(p.step4Rate));

    const stages = [
      { name: '1. 廣告進站曝光', rate: 100, count: 10000, color: '#38bdf8' },
      { name: '2. 瀏覽商品詳情', rate: r2, count: r2 * 100, color: '#818cf8' },
      { name: '3. 加入購物車', rate: r3, count: r3 * 100, color: '#a78bfa' },
      { name: '4. 完成結帳付款', rate: r4, count: r4 * 100, color: '#34d399' }
    ];

    const maxW = 420;
    const stepH = 64;
    const topY = 30;
    let svg = createSVG(w, h);

    stages.forEach((st, i) => {
      const nextRate = i < stages.length - 1 ? stages[i + 1].rate : st.rate * 0.82;
      const wTop = (st.rate / 100) * maxW;
      const wBot = (nextRate / 100) * maxW;
      const y1 = topY + i * (stepH + 6);
      const y2 = y1 + stepH;

      const pts = `${cx - wTop / 2},${y1} ${cx + wTop / 2},${y1} ${cx + wBot / 2},${y2} ${cx - wBot / 2},${y2}`;
      svg += `<polygon points="${pts}" fill="${st.color}" fill-opacity="0.85" data-tip="${st.name}: ${st.count}人 (${st.rate}%)"/>`;
      svg += `<text x="${cx}" y="${y1 + stepH / 2 + 5}" text-anchor="middle" fill="#0b0f19" font-size="13" font-weight="800">${st.name} · ${st.rate}%</text>`;

      if (p.showDropoff && i > 0) {
        const conv = Math.round((st.rate / stages[i - 1].rate) * 100);
        svg += `<text x="${cx + maxW / 2 + 24}" y="${y1 + 12}" fill="currentColor" font-size="12" opacity="0.85">↳ 環比轉化率: <tspan fill="#fbbf24" font-weight="700">${conv}%</tspan></text>`;
      }
    });

    return svg + '</svg>';
  }

  // 13. Waterfall Chart
  function renderWaterfall(p) {
    const w = 680, h = 340, padL = 58, padR = 30, padT = 32, padB = 48;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const gScale = Number(p.growthBoost) / 100;
    const cScale = Number(p.costScale) / 100;

    const rawSteps = [
      { label: '期初營收', val: 100, type: 'total' },
      { label: '+新客訂閱', val: Math.round(45 * gScale), type: 'plus' },
      { label: '+企業增購', val: Math.round(30 * gScale), type: 'plus' },
      { label: '-伺服器成本', val: -Math.round(28 * cScale), type: 'minus' },
      { label: '-行銷與研發', val: -Math.round(35 * cScale), type: 'minus' },
      { label: '期末淨利', val: 0, type: 'total' }
    ];

    let running = 0;
    const bars = rawSteps.map((st, idx) => {
      if (idx === 0) {
        running = st.val;
        return { ...st, start: 0, end: running, display: running };
      }
      if (idx === rawSteps.length - 1) {
        return { ...st, start: 0, end: running, display: running };
      }
      const prev = running;
      running += st.val;
      return { ...st, start: prev, end: running, display: st.val };
    });

    const maxV = Math.max(220, ...bars.map(b => Math.max(b.start, b.end))) + 20;
    const toY = (v) => padT + plotH - (Math.max(0, v) / maxV) * plotH;

    let svg = createSVG(w, h);
    for (let i = 0; i <= 4; i++) {
      const v = Math.round((maxV * i) / 4);
      const y = toY(v);
      svg += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="currentColor" stroke-opacity="0.12" stroke-dasharray="4 4"/>`;
      svg += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="currentColor" opacity="0.65" font-size="11">${v}M</text>`;
    }

    const step = plotW / bars.length;
    const bw = step * 0.54;

    bars.forEach((b, i) => {
      const x = padL + i * step + (step - bw) / 2;
      const yTop = toY(Math.max(b.start, b.end));
      const yBot = toY(Math.min(b.start, b.end));
      const bh = Math.max(4, yBot - yTop);
      const color = b.type === 'total' ? '#38bdf8' : (b.type === 'plus' ? '#34d399' : '#fb7185');

      svg += `<rect x="${x}" y="${yTop}" width="${bw}" height="${bh}" rx="5" fill="${color}" data-tip="${b.label}: ${b.display > 0 && b.type !== 'total' ? '+' : ''}${b.display}M"/>`;
      svg += `<text x="${x + bw / 2}" y="${yTop - 7}" text-anchor="middle" fill="currentColor" font-size="12" font-weight="700">${b.display > 0 && b.type !== 'total' ? '+' : ''}${b.display}M</text>`;
      svg += `<text x="${x + bw / 2}" y="${padT + plotH + 22}" text-anchor="middle" fill="currentColor" font-size="11.5">${b.label}</text>`;

      if (p.showConnectors && i < bars.length - 1) {
        const nextX = padL + (i + 1) * step + (step - bw) / 2;
        const connY = toY(b.end);
        svg += `<line x1="${x + bw}" y1="${connY}" x2="${nextX}" y2="${connY}" stroke="currentColor" stroke-opacity="0.45" stroke-dasharray="3 3"/>`;
      }
    });

    return svg + '</svg>';
  }

  // 14. Sankey Diagram
  function renderSankey(p) {
    const w = 680, h = 340;
    const shift = Number(p.flowShift) / 100;
    const curv = Number(p.curvature) / 100;

    const vCloud = Math.round(60 * shift);
    const vEnterprise = 40;
    const total = vCloud + vEnterprise;
    const vProfit = Math.round(total * 0.36);
    const vRD = Math.round(total * 0.38);
    const vOps = total - vProfit - vRD;

    let svg = createSVG(w, h);
    const xL = 55, xM = 315, xR = 575, nodeW = 22;

    // Nodes
    const drawNode = (x, y, nh, color, label, val, alignLeft = true) => {
      svg += `<rect x="${x}" y="${y}" width="${nodeW}" height="${nh}" rx="5" fill="${color}"/>`;
      const tx = alignLeft ? x + nodeW + 8 : x - 8;
      const anchor = alignLeft ? 'start' : 'end';
      svg += `<text x="${tx}" y="${y + nh / 2 + 4}" text-anchor="${anchor}" fill="currentColor" font-size="12" font-weight="600">${label}${p.showFlowValues ? ` (${val}M)` : ''}</text>`;
    };

    const drawRibbon = (x1, y1, x2, y2, thick, color, tip) => {
      const cx1 = x1 + (x2 - x1) * curv;
      const cx2 = x2 - (x2 - x1) * curv;
      const d = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
      svg += `<path d="${d}" fill="none" stroke="${color}" stroke-width="${thick}" stroke-opacity="0.48" data-tip="${tip}"/>`;
    };

    // Scale height: 1.8px per unit
    const s = 1.8;
    const hCloud = vCloud * s;
    const hEnt = vEnterprise * s;
    const hTotal = total * s;
    const midY = 55;

    // Left to Middle ribbons
    drawRibbon(xL + nodeW, 55 + hCloud / 2, xM, midY + hCloud / 2, hCloud, '#38bdf8', `AI 雲端訂閱 → 總營收池: ${vCloud}M`);
    drawRibbon(xL + nodeW, 195 + hEnt / 2, xM, midY + hCloud + hEnt / 2, hEnt, '#818cf8', `企業授權方案 → 總營收池: ${vEnterprise}M`);

    // Middle to Right ribbons
    const hProf = vProfit * s, hRD = vRD * s, hOps = vOps * s;
    drawRibbon(xM + nodeW, midY + hProf / 2, xR, 42 + hProf / 2, hProf, '#34d399', `總營收 → 營業淨利: ${vProfit}M`);
    drawRibbon(xM + nodeW, midY + hProf + hRD / 2, xR, 145 + hRD / 2, hRD, '#fbbf24', `總營收 → 研發投入: ${vRD}M`);
    drawRibbon(xM + nodeW, midY + hProf + hRD + hOps / 2, xR, 250 + hOps / 2, hOps, '#fb7185', `總營收 → 營運與行銷: ${vOps}M`);

    // Draw nodes on top
    drawNode(xL, 55, hCloud, '#38bdf8', 'AI 雲端訂閱', vCloud, true);
    drawNode(xL, 195, hEnt, '#818cf8', '企業授權', vEnterprise, true);
    drawNode(xM, midY, hTotal, '#e2e8f0', '總營收匯聚', total, true);
    drawNode(xR, 42, hProf, '#34d399', '營業淨利', vProfit, false);
    drawNode(xR, 145, hRD, '#fbbf24', '研發投入', vRD, false);
    drawNode(xR, 250, hOps, '#fb7185', '營運成本', vOps, false);

    return svg + '</svg>';
  }

  // 15. Bullet Chart
  function renderBullet(p) {
    const w = 680, h = 340, padL = 115, padR = 45;
    const plotW = w - padL - padR;
    const targetShift = Number(p.targetLevel) / 80;
    const actualMul = Number(p.actualBoost) / 100;

    const kpis = [
      { name: '年度經常性營收', actual: Math.min(100, Math.round(86 * actualMul)), target: Math.min(98, Math.round(82 * targetShift)) },
      { name: '企業客戶續約率', actual: Math.min(100, Math.round(92 * actualMul)), target: Math.min(98, Math.round(85 * targetShift)) },
      { name: 'NPS 淨推薦分數', actual: Math.min(100, Math.round(74 * actualMul)), target: Math.min(98, Math.round(78 * targetShift)) },
      { name: '新產品滲透率', actual: Math.min(100, Math.round(68 * actualMul)), target: Math.min(98, Math.round(75 * targetShift)) }
    ];

    let svg = createSVG(w, h);
    kpis.forEach((k, idx) => {
      const y = 42 + idx * 70;
      const barH = 38;
      svg += `<text x="${padL - 12}" y="${y + barH / 2 + 5}" text-anchor="end" fill="currentColor" font-size="12.5" font-weight="600">${k.name}</text>`;

      if (p.showZones) {
        svg += `<rect x="${padL}" y="${y}" width="${plotW * 0.6}" height="${barH}" rx="4" fill="currentColor" fill-opacity="0.08"/>`;
        svg += `<rect x="${padL + plotW * 0.6}" y="${y}" width="${plotW * 0.25}" height="${barH}" fill="currentColor" fill-opacity="0.16"/>`;
        svg += `<rect x="${padL + plotW * 0.85}" y="${y}" width="${plotW * 0.15}" height="${barH}" rx="4" fill="currentColor" fill-opacity="0.24"/>`;
      } else {
        svg += `<rect x="${padL}" y="${y}" width="${plotW}" height="${barH}" rx="4" fill="currentColor" fill-opacity="0.1"/>`;
      }

      const actW = (k.actual / 100) * plotW;
      const tgtX = padL + (k.target / 100) * plotW;
      const color = k.actual >= k.target ? '#34d399' : '#38bdf8';

      svg += `<rect x="${padL}" y="${y + 11}" width="${actW}" height="${barH - 22}" rx="3" fill="${color}" data-tip="${k.name} | 實際達成: ${k.actual}% / 目標: ${k.target}%"/>`;
      svg += `<line x1="${tgtX}" y1="${y + 4}" x2="${tgtX}" y2="${y + barH - 4}" stroke="#fbbf24" stroke-width="3.5" data-tip="目標基準線 (Target): ${k.target}%"/>`;
      svg += `<text x="${padL + plotW + 8}" y="${y + barH / 2 + 5}" fill="currentColor" font-size="12" font-weight="700">${k.actual}%</text>`;
    });

    svg += `<text x="${padL}" y="325" fill="currentColor" opacity="0.75" font-size="11.5">■ 中心實心條 = 實際表現　|　<tspan fill="#fbbf24" font-weight="700">┃ 亮黃垂直線 = 目標值 (Target)</tspan>　|　背景深淺階梯 = 待加強 / 良好 / 優秀區間</text>`;
    return svg + '</svg>';
  }

  // 16. River Chart (Band Channel & Streamgraph)
  function renderRiver(p) {
    const w = 680, h = 340, padL = 55, padR = 30, padT = 32, padB = 45;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const bwMul = Number(p.bandWidth) / 100;
    const xAt = (i) => padL + (i / (months.length - 1)) * plotW;

    let svg = createSVG(w, h);

    if (p.riverMode === 'channel') {
      // Mode A: Confidence / Historical Range Channel River Chart
      const meanVals = [48, 52, 56, 61, 58, 64, 69, 72, 68, 74, 78, 82];
      const halfBand = [12, 14, 15, 13, 16, 18, 15, 14, 17, 15, 16, 14].map(v => v * bwMul);
      const actualVals = [46, 55, 62, 59, 52, 68, 86, 75, 64, 79, 83, 88];
      const toY = (v) => padT + plotH - (Math.max(5, Math.min(115, v)) / 120) * plotH;

      for (let i = 0; i <= 4; i++) {
        const v = i * 30;
        const y = toY(v);
        svg += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="currentColor" stroke-opacity="0.12" stroke-dasharray="4 4"/>`;
        svg += `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="currentColor" opacity="0.65" font-size="11">${v}</text>`;
      }

      // Outer 2x band & Inner 1x band
      const upper2 = meanVals.map((m, i) => `${xAt(i)},${toY(m + halfBand[i] * 1.45)}`).join(' L ');
      const lower2 = [...meanVals].reverse().map((m, idx) => {
        const i = meanVals.length - 1 - idx;
        return `${xAt(i)},${toY(m - halfBand[i] * 1.45)}`;
      }).join(' L ');
      svg += `<path d="M ${upper2} L ${lower2} Z" fill="#38bdf8" fill-opacity="0.16"/>`;

      const upper1 = meanVals.map((m, i) => `${xAt(i)},${toY(m + halfBand[i])}`).join(' L ');
      const lower1 = [...meanVals].reverse().map((m, idx) => {
        const i = meanVals.length - 1 - idx;
        return `${xAt(i)},${toY(m - halfBand[i])}`;
      }).join(' L ');
      svg += `<path d="M ${upper1} L ${lower1} Z" fill="#38bdf8" fill-opacity="0.34" stroke="#38bdf8" stroke-opacity="0.45" stroke-width="1.5"/>`;

      // Mean line
      const meanLine = meanVals.map((m, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${toY(m)}`).join(' ');
      svg += `<path d="${meanLine}" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="5 4"/>`;

      // Actual trajectory
      if (p.showActualLine) {
        const actLine = actualVals.map((a, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${toY(a)}`).join(' ');
        svg += `<path d="${actLine}" fill="none" stroke="#fbbf24" stroke-width="3"/>`;
        actualVals.forEach((a, i) => {
          const isOut = a > meanVals[i] + halfBand[i] || a < meanVals[i] - halfBand[i];
          svg += `<circle cx="${xAt(i)}" cy="${toY(a)}" r="${isOut ? 6 : 4.5}" fill="${isOut ? '#fb7185' : '#fbbf24'}" stroke="#0b0f19" stroke-width="1.5" data-tip="${months[i]} 實際值:${a} (河道中心:${meanVals[i]} ±${Math.round(halfBand[i])}) ${isOut ? '⚠️ 突破常態河道!' : ''}"/>`;
        });
      }

      months.forEach((m, i) => {
        svg += `<text x="${xAt(i)}" y="${padT + plotH + 22}" text-anchor="middle" fill="currentColor" opacity="0.8" font-size="11">${m}</text>`;
      });
      svg += `<text x="${padL + 8}" y="${padT - 8}" fill="#38bdf8" font-size="11.5">🌊 淺藍帶 = 歷史常態河道區間 (±1σ / ±2σ)　|　虛線 = 五年均值　|　<tspan fill="#fbbf24" font-weight="700">黃線 = 當期實際值 (紅點為破岸異常)</tspan></text>`;
    } else {
      // Mode B: ThemeRiver / Streamgraph (Centered organic streams)
      const cats = [
        { name: 'AI 雲端服務', color: '#38bdf8', vals: [18, 22, 28, 34, 40, 46, 52, 56, 60, 64, 68, 72] },
        { name: '行動端應用', color: '#818cf8', vals: [30, 32, 29, 31, 35, 38, 36, 34, 37, 39, 36, 35] },
        { name: '傳統桌機軟體', color: '#34d399', vals: [42, 38, 35, 30, 26, 24, 20, 18, 16, 15, 14, 12] }
      ];
      const cy = padT + plotH / 2;
      const scale = 1.15 * bwMul;

      const totals = months.map((_, i) => cats.reduce((s, c) => s + c.vals[i], 0));
      let runningOffset = months.map((_, i) => -totals[i] / 2);

      cats.forEach((c) => {
        const yBotArr = runningOffset.map(v => cy + v * scale);
        const yTopArr = runningOffset.map((v, i) => cy + (v + c.vals[i]) * scale);
        const topPts = yTopArr.map((y, i) => `${xAt(i)},${y.toFixed(1)}`).join(' L ');
        const botPts = [...yBotArr].reverse().map((y, idx) => {
          const i = months.length - 1 - idx;
          return `${xAt(i)},${y.toFixed(1)}`;
        }).join(' L ');
        svg += `<path d="M ${topPts} L ${botPts} Z" fill="${c.color}" fill-opacity="0.82" stroke="#0b0f19" stroke-width="1.5" data-tip="主題河流：${c.name}"/>`;
        runningOffset = runningOffset.map((v, i) => v + c.vals[i]);
      });

      months.forEach((m, i) => {
        svg += `<text x="${xAt(i)}" y="${padT + plotH + 22}" text-anchor="middle" fill="currentColor" opacity="0.8" font-size="11">${m}</text>`;
      });

      cats.forEach((c, idx) => {
        svg += `<rect x="${padL + idx * 140}" y="8" width="12" height="12" rx="3" fill="${c.color}"/>`;
        svg += `<text x="${padL + idx * 140 + 18}" y="18" fill="currentColor" font-size="11.5">${c.name}</text>`;
      });
    }

    return svg + '</svg>';
  }

  // 17. Gantt Chart
  function renderGantt(p) {
    const w = 680, h = 340, padL = 135, padR = 30, padT = 38, padB = 38;
    const plotW = w - padL - padR, plotH = h - padT - padB;
    const totalWeeks = 12;
    const delay = Number(p.delayDays);
    const todayW = Number(p.todayWeek);

    const tasks = [
      { id: 1, name: '1. 需求規格訪談', start: 0, dur: 2, prog: 100, crit: true, dep: null },
      { id: 2, name: '2. UI/UX 原型設計', start: 2, dur: 2, prog: 100, crit: false, dep: 1 },
      { id: 3, name: '3. 核心架構與 API', start: 2, dur: 3 + delay, prog: 70, crit: true, dep: 1 },
      { id: 4, name: '4. 前端互動介面開發', start: 4, dur: 3, prog: 50, crit: false, dep: 2 },
      { id: 5, name: '5. 系統整合與壓測', start: 5 + delay, dur: 2, prog: 20, crit: true, dep: 3 },
      { id: 6, name: '6. 正式上線里程碑 ★', start: 7 + delay, dur: 1, prog: 0, crit: true, dep: 5, milestone: true }
    ];

    let svg = createSVG(w, h);
    const xAt = (wk) => padL + (wk / totalWeeks) * plotW;
    const rowH = plotH / tasks.length;

    // Week grid columns
    for (let wk = 0; wk <= totalWeeks; wk++) {
      const x = xAt(wk);
      svg += `<line x1="${x}" y1="${padT - 8}" x2="${x}" y2="${padT + plotH}" stroke="currentColor" stroke-opacity="0.12" stroke-dasharray="3 3"/>`;
      if (wk < totalWeeks) {
        svg += `<text x="${x + (plotW / totalWeeks) / 2}" y="${padT - 12}" text-anchor="middle" fill="currentColor" opacity="0.75" font-size="11">W${wk + 1}</text>`;
      }
    }

    // Task bars
    tasks.forEach((t, i) => {
      const y = padT + i * rowH;
      const barY = y + (rowH - 22) / 2;
      const x1 = xAt(t.start);
      const bw = Math.max(14, (t.dur / totalWeeks) * plotW);
      const isCrit = p.showCritical && t.crit;
      const baseColor = isCrit ? '#fb7185' : '#38bdf8';

      svg += `<text x="${padL - 10}" y="${y + rowH / 2 + 4}" text-anchor="end" fill="currentColor" font-size="12" font-weight="${isCrit ? '700' : '500'}">${t.name}</text>`;

      // Background planned bar
      svg += `<rect x="${x1}" y="${barY}" width="${bw}" height="22" rx="6" fill="${baseColor}" fill-opacity="0.28" stroke="${baseColor}" stroke-width="1.8" data-tip="${t.name} | 排程: W${t.start + 1}~W${t.start + t.dur} | 完成度: ${t.prog}% ${isCrit ? '(🔥要徑任務)' : ''}"/>`;

      // Progress fill
      if (t.prog > 0) {
        const pw = (t.prog / 100) * bw;
        svg += `<rect x="${x1}" y="${barY}" width="${pw}" height="22" rx="6" fill="${baseColor}" fill-opacity="0.88"/>`;
      }

      svg += `<text x="${x1 + bw + 6}" y="${barY + 15}" fill="currentColor" font-size="11" opacity="0.85">${t.prog}%</text>`;

      // Dependency connector
      if (p.showDeps && t.dep) {
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

    // Today vertical line
    const tx = xAt(todayW);
    svg += `<line x1="${tx}" y1="${padT - 10}" x2="${tx}" y2="${padT + plotH + 6}" stroke="#34d399" stroke-width="2.5"/>`;
    svg += `<rect x="${tx - 34}" y="${padT + plotH + 4}" width="68" height="18" rx="4" fill="#34d399"/>`;
    svg += `<text x="${tx}" y="${padT + plotH + 16}" text-anchor="middle" fill="#0b0f19" font-size="10.5" font-weight="800">今日 W${todayW}</text>`;

    return svg + '</svg>';
  }

  const RENDERERS = {
    bar: renderBar,
    line: renderLine,
    pie: renderPie,
    area: renderArea,
    scatter: renderScatter,
    bubble: renderBubble,
    radar: renderRadar,
    histogram: renderHistogram,
    boxplot: renderBoxPlot,
    heatmap: renderHeatmap,
    treemap: renderTreemap,
    funnel: renderFunnel,
    waterfall: renderWaterfall,
    sankey: renderSankey,
    bullet: renderBullet,
    river: renderRiver,
    gantt: renderGantt
  };

  window.renderChartSVG = function (chartId, params) {
    const fn = RENDERERS[chartId];
    return fn ? fn(params) : '';
  };
})();

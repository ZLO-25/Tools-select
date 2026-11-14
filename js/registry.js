/**
 * Tools-select 工具註冊中心 (PM 專案與產品經理全能工具箱)
 * 點選任一工具卡片即可直接開啟對應的互動編輯與匯出工作台！
 */
window.TOOLS_REGISTRY = [
  {
    id: 'pm-frameworks-10',
    targetView: 'pm-workbench',
    targetItemId: 'toc-cloud',
    title: 'PM 10大實戰思維與管理工具箱 (大人學/TOC)',
    subtitle: 'TOC Evaporating Cloud, Iron Triangle, Stakeholder Grid, WBS, CCPM, RACI, Risk, CRT, PERT, MoSCoW',
    category: 'PM 決策與破局框架',
    status: 'active',
    badge: '核心工具 · 10種可編輯匯出',
    icon: '🧠',
    description: '收錄大人學與高德拉特 TOC 限制理論、PMBOK 最實用的 10 個 PM 工具：TOC 衝突圖（蒸發雲）、專案鐵三角共識矩陣、利害關係人權力利益矩陣、WBS 拆解、關鍵鏈緩衝河道圖、RACI 權責健檢、風險矩陣、TOC 現況根因樹、PERT 三點估時與 MoSCoW 看板。支援自訂文字與匯出 PNG/SVG！',
    tags: ['大人學', 'TOC限制理論', '專案管理', '可匯出圖檔'],
    updatedAt: '2026-11'
  },
  {
    id: 'chart-selector-17',
    targetView: 'chart-workbench',
    targetItemId: 'gantt',
    title: 'PM 常用 17 種數據與排程圖表工作台',
    subtitle: 'Gantt, River/Channel, Waterfall, Funnel, Bubble Matrix, Bullet, CFD & More',
    category: '數據視覺化與排程',
    status: 'active',
    badge: '核心工具 · 17種可調可匯出',
    icon: '📊',
    description: '依 PM 實務使用頻率排序（#1 甘特圖、#2 河道區間圖、#3 長條圖、#4 瀑布增減圖...至 #17 直方圖），支援滑桿調整、自訂輸入專案數據、即時預覽並一鍵匯出高解析度 PNG 簡報圖片與 SVG 向量檔。',
    tags: ['甘特圖', '河道圖', '瀑布圖', '自訂數據匯出'],
    updatedAt: '2026-11'
  },
  {
    id: 'quick-jump-toc',
    targetView: 'pm-workbench',
    targetItemId: 'toc-cloud',
    title: 'TOC 衝突圖 / 蒸發雲產生器',
    subtitle: 'Evaporating Cloud Conflict Resolution',
    category: 'TOC 限制理論',
    status: 'active',
    badge: '快速啟動',
    icon: '⚡',
    description: '面對「準時上線 vs 品質穩定」、「客製化 vs 標準化」等跨部門兩難衝突時，拆解共同目標、必要條件與隱藏假設，產出雙贏破局圖。',
    tags: ['TOC衝突圖', '雙贏破局', '跨部門談判'],
    updatedAt: '2026-11'
  },
  {
    id: 'quick-jump-stakeholder',
    targetView: 'pm-workbench',
    targetItemId: 'stakeholder-grid',
    title: '利害關係人權力×利益作戰矩陣',
    subtitle: 'Stakeholder Power-Interest Grid',
    category: '專案政治學',
    status: 'active',
    badge: '快速啟動',
    icon: '🎯',
    description: '盤點專案 Sponsor、各部門主管與關鍵窗口的權力、關切度與支持/反對態度，視覺化標出潛在否決地雷。',
    tags: ['向上管理', '大人學', '利害關係人'],
    updatedAt: '2026-11'
  },
  {
    id: 'quick-jump-ccpm',
    targetView: 'pm-workbench',
    targetItemId: 'ccpm-buffer',
    title: 'CCPM 關鍵鏈緩衝消耗河道圖',
    subtitle: 'Critical Chain Fever Chart',
    category: '時程與風險控管',
    status: 'active',
    badge: '快速啟動',
    icon: '🌊',
    description: '追蹤「關鍵鏈完成進度 % vs 專案緩衝消耗 %」在綠黃紅三色河道中的落點，提早預警時程失控風險。',
    tags: ['關鍵鏈', '緩衝管理', '河道圖'],
    updatedAt: '2026-11'
  },
  {
    id: 'quick-jump-pert',
    targetView: 'pm-workbench',
    targetItemId: 'pert-estimator',
    title: 'PERT 三點科學估時與信心計算機',
    subtitle: 'Three-Point Estimation (O / M / P)',
    category: '科學估時',
    status: 'active',
    badge: '快速啟動',
    icon: '⏱️',
    description: '輸入樂觀 (O)、最可能 (M)、悲觀 (P) 工期，自動計算期望均值、標準差與 85% / 95% 準時交付把握的安全工期。',
    tags: ['科學估時', '風險量化', '合約押期'],
    updatedAt: '2026-11'
  }
];

/**
 * Tools-select 工具註冊中心 (Extensible Registry)
 * 未來新增任何新工具時，只需在此陣列加入一筆設定即可自動顯示於首頁工具大廳與導覽列！
 */
window.TOOLS_REGISTRY = [
  {
    id: 'chart-selector-15',
    title: '17種常用數據與專案圖表互動指南',
    subtitle: 'Interactive Data Visualization & Chart Selector',
    category: '數據分析與專案管理',
    status: 'active',
    badge: '核心工具 · 17種可調圖表',
    icon: '📊',
    description: '收錄 17 種最常用的數據與專案管理圖表（含河道圖、甘特圖、桑基圖、瀑布圖等），提供即時參數滑桿調整、視覺比較、核心用途、常見商業/工程場景與設計避坑注意事項。',
    tags: ['資料視覺化', '圖表選擇', '專案管理', '互動教學'],
    updatedAt: '2026-11'
  },
  {
    id: 'stat-test-selector',
    title: '統計檢定方法決策樹 (預留擴充)',
    subtitle: 'Statistical Test Selector (t-test, ANOVA, Chi-square)',
    category: '數據分析與視覺化',
    status: 'planned',
    badge: '規劃中模組',
    icon: '🧪',
    description: '根據變數型態（連續/類別）、組數與常態性假設，快速挑選適合的統計檢定方法並預覽分佈圖。',
    tags: ['統計檢定', 'A/B Test', '實驗設計'],
    updatedAt: '預留插槽'
  },
  {
    id: 'color-palette-lab',
    title: '圖表與介面無障礙配色實驗室 (預留擴充)',
    subtitle: 'Data Viz Color Palette & Contrast Checker',
    category: '設計與前端工具',
    status: 'planned',
    badge: '規劃中模組',
    icon: '🎨',
    description: '針對多序列圖表、色盲友善 (Colorblind-safe) 與深淺色主題進行即時配色模擬與對比度檢測。',
    tags: ['配色指南', '色盲友善', 'UI/UX'],
    updatedAt: '預留插槽'
  },
  {
    id: 'regex-playground',
    title: '常見資料清洗與正則速查器 (預留擴充)',
    subtitle: 'Data Cleaning & Regex Interactive Cheatsheet',
    category: '開發者工具',
    status: 'planned',
    badge: '規劃中模組',
    icon: '🛠️',
    description: '常用資料格式驗證、時間戳轉換與欄位正規化互動工具，支援即時測試與語法拆解。',
    tags: ['資料處理', 'Regex', '效率工具'],
    updatedAt: '預留插槽'
  }
];

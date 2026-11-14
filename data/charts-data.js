/**
 * PM 常用 17 種數據與專案圖表完整資料庫 (依 PM 實務使用頻率與重要性排序 #1 ~ #17)
 * 每張圖表皆支援：1. 即時滑桿參數調整；2. 自訂圖表標題與數據編輯；3. 一鍵匯出 PNG / SVG / CSV
 */
window.CHART_GOALS = [
  { id: 'all', label: '🌟 PM 常用排序 (17)', desc: '依 PM 實務使用頻率排序全部 17 種圖表' },
  { id: 'schedule', label: '📅 時程、緩衝與流向', desc: '甘特圖、河道區間圖、看板累積流量圖、桑基圖' },
  { id: 'compare', label: '📏 優先級與績效比較', desc: '長條圖、子彈圖、氣泡四象限、雷達圖' },
  { id: 'part', label: '🥧 預算、範疇與漏斗拆解', desc: '瀑布增減圖、漏斗圖、矩形樹狀圖、圓餅圖' },
  { id: 'dist', label: '🔔 工期風險與穩定度分佈', desc: '熱力圖、散佈圖、盒鬚圖、直方圖' }
];

window.CHARTS_DATA = [
  {
    id: 'gantt',
    number: 1,
    name: '甘特圖 (專案時程與要徑圖)',
    enName: 'Gantt Chart',
    category: 'PM 排程核心',
    goalIds: ['schedule', 'compare'],
    summary: '【PM 使用率 No.1】以橫向時間軸呈現工作包的「起訖時間、工期、完成度、前置依賴關係與要徑 (Critical Path)」，是跨部門對齊時程的共同語言。',
    defaultTitle: 'Q4 產品改版專案甘特圖與要徑追蹤',
    defaultDataHint: '格式：任務名稱, 起始週(0起算), 工期週數, 完成度%, 是否要徑(1/0), 前置任務編號',
    defaultData: '1. 需求規格訪談, 0, 2, 100, 1, 0\n2. UI/UX 原型設計, 2, 2, 100, 0, 1\n3. 核心架構與API, 2, 3, 70, 1, 1\n4. 前端互動開發, 4, 3, 50, 0, 2\n5. 系統整合與壓測, 5, 2, 20, 1, 3\n6. 正式上線里程碑★, 7, 1, 0, 1, 5',
    controls: [
      { key: 'todayWeek', label: '當前檢視基準日 (Today 線位置)', type: 'range', min: 1, max: 11, step: 1, value: 6, unit: '週' },
      { key: 'delayDays', label: '要徑任務延誤模擬 (觀察骨牌效應)', type: 'range', min: 0, max: 3, step: 1, value: 0, unit: '週' },
      { key: 'showDeps', label: '顯示任務前置依賴箭頭 (Dependencies)', type: 'checkbox', value: true },
      { key: 'showCritical', label: '高亮顯示要徑任務 (Critical Path)', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>全局掌控平行與序列關係</strong>：一眼看清哪些工作包可以平行推進、哪些卡在前置任務尚未完成。',
      '<strong>要徑識別與延誤預警</strong>：搭配「今日基準線 (Today Line)」，立即抓出進度落後且沒有浮時 (Float) 的要徑任務。'
    ],
    scenarios: [
      '<strong>專案 Kick-off 與指導委員會匯報</strong>：展示各階段里程碑與跨部門交付節點。',
      '<strong>範疇變更衝擊評估</strong>：當老闆臨時插單時，拉動延誤滑桿展示對最終上線日的連鎖推遲。'
    ],
    caveats: [
      '<strong>粒度切勿過細</strong>：簡報用甘特圖建議維持在 6~15 個高階工作包 (WBS Level 2/3)，細碎日常任務請放進 Jira/Kanban。',
      '<strong>務必標示 Today 線與依賴箭頭</strong>：沒有 Today 線就看不出落後；沒有依賴線就看不出骨牌效應。'
    ]
  },
  {
    id: 'river',
    number: 2,
    name: '河道圖 (燃盡區間／主題河流圖)',
    enName: 'River / Channel & Stream Chart',
    category: 'PM 風險與趨勢監控',
    goalIds: ['schedule', 'dist'],
    summary: '【PM 控管利器】支援雙模式：1. 上下界區間通道河道圖（追蹤專案燃盡速度、成本或系統指標是否偏離安全走廊）；2. 主題河流圖（觀察多產品線資源消長）。',
    defaultTitle: '專案交付速率與安全河道區間監控',
    defaultDataHint: '格式：月份/週次, 河道中心預期值, 河道半寬(容許波幅), 實際觀測值',
    defaultData: 'W1, 48, 12, 46\nW2, 52, 14, 55\nW3, 56, 15, 62\nW4, 61, 13, 59\nW5, 58, 16, 52\nW6, 64, 18, 68\nW7, 69, 15, 88\nW8, 72, 14, 75\nW9, 68, 17, 64\nW10, 74, 15, 79',
    controls: [
      { key: 'riverMode', label: '河道圖型態切換', type: 'select', value: 'channel', options: [
        { value: 'channel', label: '區間通道河道圖 (預期中心線 + 上下界安全走廊)' },
        { value: 'stream', label: '主題河流圖 (Streamgraph 多類別消長)' }
      ]},
      { key: 'bandWidth', label: '安全河道寬度倍率', type: 'range', min: 50, max: 160, step: 10, value: 100, unit: '%' },
      { key: 'showActualLine', label: '顯示當期實際觀測軌跡線', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>區分「正常波動」與「結構性失控」</strong>：專案指標本來就會小幅起伏，只要在淺藍色安全河道內就不必過度干預；一旦「破岸（紅點）」則立即啟動根因調查。',
      '<strong>預測樂觀／悲觀落點走廊</strong>：向高層報告營收或燃盡預測時，用河道呈現「最佳、最可能、最差」三條路徑包絡線。'
    ],
    scenarios: [
      '<strong>敏捷燃盡／燃起河道 (Burn-up Confidence Channel)</strong>：追蹤每 Sprint 累積完成點數是否落在準時交付走廊內。',
      '<strong>雲端成本與 SLA 監控</strong>：監控每日 API 延遲或伺服器費用是否突破歷史同期的 $\\pm 2\\sigma$ 河道。'
    ],
    caveats: [
      '<strong>必須定義清楚河道上下界的意義</strong>：例如是「樂觀/悲觀預估範圍」還是「歷史 $\\pm 2\\sigma$ 標準差」，讓團隊對破岸警報有明確共識。'
    ]
  },
  {
    id: 'bar',
    number: 3,
    name: '長條圖 / 柱狀圖',
    enName: 'Bar / Column Chart',
    category: '比較類',
    goalIds: ['compare'],
    summary: '最直覺的跨項目比較工具，PM 最常用來比較各模組工時負載、各功能用戶許願票數或跨部門產出。',
    defaultTitle: '各產品模組研發人天投入比較',
    defaultDataHint: '格式：項目名稱, 數值 (每行一筆)',
    defaultData: 'AI客服引擎, 92\n會員與權限中心, 84\n結帳金流模組, 68\n數據報表後台, 54\n推播通知服務, 47\n舊系統資料遷移, 61',
    controls: [
      { key: 'orientation', label: '排列方向', type: 'select', value: 'vertical', options: [
        { value: 'vertical', label: '垂直柱狀圖 (Column)' },
        { value: 'horizontal', label: '水平長條圖 (Bar - 適合長功能名稱)' }
      ]},
      { key: 'sortMode', label: '資料排序', type: 'select', value: 'desc', options: [
        { value: 'raw', label: '依輸入順序' },
        { value: 'desc', label: '由高到低 (遞減)' },
        { value: 'asc', label: '由低到高 (遞增)' }
      ]},
      { key: 'yBaseline', label: '數值軸起點偏移 (模擬截斷誤導)', type: 'range', min: 0, max: 45, step: 5, value: 0, unit: '' },
      { key: 'showValues', label: '顯示資料數值標籤', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>精準比對項目高低與排名</strong>：搭配由高到低排序，一秒讓老闆看出哪個模組吃掉最多資源或帶來最高效益。',
      '<strong>水平長條圖適合功能清單</strong>：當需求名稱超過 6 個中文字時，切換為水平長條圖最易閱讀。'
    ],
    scenarios: [
      '<strong>資源負載盤點</strong>：各工程職系（前端/後端/QA/設計）本季工時負荷比較。',
      '<strong>用戶痛點與需求投票</strong>：客戶回饋抱怨次數排行、功能許願池票數統計。'
    ],
    caveats: [
      '<strong>嚴禁截斷長條圖起點</strong>：柱體長度代表絕對比例，座標軸必須從 `0` 開始，否則會嚴重扭曲倍數關係。'
    ]
  },
  {
    id: 'waterfall',
    number: 4,
    name: '瀑布圖 (預算／範疇增減橋接圖)',
    enName: 'Waterfall / Bridge Chart',
    category: 'PM 變更與財務拆解',
    goalIds: ['part', 'compare'],
    summary: 'PM 向高層解釋「為什麼專案預算／總工時／目標營收從期初 A 變成期末 B」的最佳橋接工具（Bridge Analysis）。',
    defaultTitle: '專案總工時變更橋接分析 (Scope Creep 拆解)',
    defaultDataHint: '格式：項目名稱, 增減數值, 類型(total=總計柱 / plus=增加 / minus=減少)',
    defaultData: '原定基準工時, 100, total\n+客戶新增報表, 35, plus\n+資安合規追加, 25, plus\n-砍除次要動畫, -20, minus\n-自動化測試節省, -15, minus\n最終核定總工時, 125, total',
    controls: [
      { key: 'growthBoost', label: '正向增加項目縮放', type: 'range', min: 60, max: 150, step: 10, value: 100, unit: '%' },
      { key: 'costScale', label: '負向扣除項目縮放', type: 'range', min: 60, max: 150, step: 10, value: 100, unit: '%' },
      { key: 'showConnectors', label: '顯示階梯連接虛線', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>清楚交代來龍去脈</strong>：浮空綠色柱代表追加項目，浮空紅色柱代表削減或節省項目，落地藍柱代表期初與期末總計。'
    ],
    scenarios: [
      '<strong>範疇蔓延 (Scope Creep) 匯報</strong>：原定 100 人天 + 新增 CR1 + 新增 CR2 − 裁剪功能 = 最新 125 人天。',
      '<strong>專案預算損益拆解</strong>：核定預算 − 人事支出 − 外包費用 − 雲端授權 = 剩餘可用預算。'
    ],
    caveats: [
      '<strong>顏色語意需一致且畫出連接線</strong>：讓讀者視線能順著階梯虛線追蹤每一步加減法。'
    ]
  },
  {
    id: 'line',
    number: 5,
    name: '折線圖 (速率與指標趨勢)',
    enName: 'Line Chart',
    category: '趨勢類',
    goalIds: ['schedule'],
    summary: '追蹤連續時間序列的斜率變化，PM 常用於 Sprint Velocity（團隊交付速率）、未關閉 Bug 收斂趨勢與產品留存率追蹤。',
    defaultTitle: '各 Sprint 團隊交付點數 (Velocity) 走勢',
    defaultDataHint: '格式：時間點標籤, 數值 (每行一筆)',
    defaultData: 'S1, 42\nS2, 48\nS3, 45\nS4, 56\nS5, 52\nS6, 64\nS7, 61\nS8, 70\nS9, 68\nS10, 76',
    controls: [
      { key: 'volatility', label: '額外波動雜訊模擬', type: 'range', min: 0, max: 40, step: 5, value: 0, unit: '' },
      { key: 'slope', label: '長期成長斜率調整', type: 'range', min: -20, max: 40, step: 5, value: 0, unit: '' },
      { key: 'showMA', label: '疊加 3 期移動平均線 (MA)', type: 'checkbox', value: true },
      { key: 'smooth', label: '平滑曲線插值', type: 'checkbox', value: false }
    ],
    purpose: [
      '<strong>觀察交付穩定度與長期趨勢</strong>：搭配移動平均線 (MA)，過濾單一 Sprint 因請假或環境問題造成的短期震盪。'
    ],
    scenarios: [
      '<strong>上線前 Bug 收斂曲線</strong>：每日新開 Bug 數 vs 已修復 Bug 數的死亡交叉與收斂。',
      '<strong>產品北極星指標追蹤</strong>：DAU / 轉換率週趨勢。'
    ],
    caveats: [
      '<strong>同圖折線勿超過 4 條</strong>：線條過多會難以辨識，應只高亮核心指標。'
    ]
  },
  {
    id: 'funnel',
    number: 6,
    name: '漏斗圖 (轉化率與需求篩選漏斗)',
    enName: 'Funnel Chart',
    category: '佔比與結構類',
    goalIds: ['part', 'compare'],
    summary: '定位多階段線性流程中「哪一關流失最嚴重」，廣泛用於用戶轉化漏斗與產品創意篩選漏斗。',
    defaultTitle: '新功能上線用戶採用與付費轉化漏斗',
    defaultDataHint: '格式：階段名稱, 留存百分比(0-100)',
    defaultData: '1. 看到新功能提示, 100\n2. 點擊進入體驗, 65\n3. 完成首次核心操作, 36\n4. 隔週再次回訪留存, 18',
    controls: [
      { key: 'step2Rate', label: '第二階段留存微調', type: 'range', min: 30, max: 90, step: 5, value: 65, unit: '%' },
      { key: 'step3Rate', label: '第三階段留存微調', type: 'range', min: 15, max: 70, step: 5, value: 36, unit: '%' },
      { key: 'step4Rate', label: '最終階段轉化微調', type: 'range', min: 5, max: 45, step: 2, value: 18, unit: '%' },
      { key: 'showDropoff', label: '標註階段間環比轉化率 (Conversion %)', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>一眼抓出轉換瓶頸</strong>：快速計算每兩關之間的環比轉化率，決定下個 Sprint 該優化哪個步驟。'
    ],
    scenarios: [
      '<strong>產品 Onboarding 流程</strong>：註冊 → 驗證信箱 → 建立首個專案 → 邀請團隊成員。',
      '<strong>PMO 提案篩選漏斗</strong>：收集點子 → 初審立項 → PoC 驗證 → 正式投產。'
    ],
    caveats: [
      '<strong>僅適用於嚴格順序子集流程</strong>：若用戶會跳關或來回循環，請改用桑基圖 (#13)。'
    ]
  },
  {
    id: 'bubble',
    number: 7,
    name: '氣泡圖 (價值×可行性四象限矩陣)',
    enName: 'Bubble / Priority Matrix Chart',
    category: 'PM 優先級決策',
    goalIds: ['compare'],
    summary: '產品與專案優先級排序神器：橫軸放「實作可行性／低成本」，縱軸放「商業價值／影響力」，氣泡面積代表「預估工時或營收規模」。',
    defaultTitle: '產品 Backlog 優先級四象限氣泡矩陣',
    defaultDataHint: '格式：功能名稱, 可行性X(0-100), 商業價值Y(0-100), 規模大小, 類別色碼',
    defaultData: 'AI智慧摘要, 78, 86, 110, #38bdf8\n一鍵匯出簡報, 82, 72, 75, #38bdf8\n舊版報表重構, 75, 28, 120, #34d399\nSSO單一登入, 60, 68, 65, #38bdf8\n語音即時操控, 28, 78, 90, #818cf8\n自訂佈景主題, 40, 32, 45, #fb7185',
    controls: [
      { key: 'sizeScale', label: '氣泡面積縮放倍率', type: 'range', min: 50, max: 160, step: 10, value: 100, unit: '%' },
      { key: 'showQuadrants', label: '顯示四象限十字決策分割線', type: 'checkbox', value: true },
      { key: 'showLabels', label: '顯示功能名稱標籤', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>視覺化 Quick Wins (速贏項目)</strong>：右上角第一象限（高價值×高可行性）即為本季最優先排入 Roadmap 的黃金項目。'
    ],
    scenarios: [
      '<strong>季度 Roadmap 優先級工作坊</strong>：把所有部門提的需求投射到四象限，用客觀維度取代誰嗓門大聽誰的。'
    ],
    caveats: [
      '<strong>氣泡大小必須對應「面積」而非半徑</strong>：本引擎已自動以 $\\sqrt{\\text{Value}}$ 計算半徑，避免面積膨脹四倍的視覺誤導。'
    ]
  },
  {
    id: 'bullet',
    number: 8,
    name: '子彈圖 (OKR / KPI 目標達成圖)',
    enName: 'Bullet Chart',
    category: '比較類',
    goalIds: ['compare'],
    summary: '高密度戰情室首選：在單一橫條同時呈現「目前實際達成值、季度目標線 (Target) 與落後/達標/超標背景區間」。',
    defaultTitle: '部門季度 OKR 關鍵結果達成追蹤',
    defaultDataHint: '格式：KPI名稱, 實際達成%, 目標基準%',
    defaultData: '專案準時交付率, 88, 85\n關鍵里程碑達成, 92, 90\n客戶滿意度 CSAT, 76, 80\n自動化測試覆蓋率, 72, 75',
    controls: [
      { key: 'targetLevel', label: '目標基準線微調倍率', type: 'range', min: 80, max: 120, step: 5, value: 100, unit: '%' },
      { key: 'actualBoost', label: '實際達成值微調倍率', type: 'range', min: 80, max: 120, step: 5, value: 100, unit: '%' },
      { key: 'showZones', label: '顯示背景品質區間 (待加強/良好/優秀)', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>取代佔空間的圓形儀表板</strong>：一次並排檢視 4~8 項專案健康度指標與目標差距。'
    ],
    scenarios: [
      '<strong>PMO 月度經營檢討會</strong>：並排展示預算執行率、進度達成率、品質達標率。'
    ],
    caveats: [
      '<strong>清楚標示亮黃色垂直短線代表「目標值 (Target)」</strong>：超過亮黃線即轉為翠綠色達標狀態。'
    ]
  },
  {
    id: 'radar',
    number: 9,
    name: '雷達圖 (方案評估與職能盤點)',
    enName: 'Radar / Spider Chart',
    category: '比較類',
    goalIds: ['compare'],
    summary: '多維度綜合能力比對工具，PM 常用於「廠商遴選 / 技術方案比較」或「團隊技能矩陣盤點」。',
    defaultTitle: '技術架構方案 A vs 方案 B 多維度評估',
    defaultDataHint: '格式：評估維度, 方案A分數(0-100), 方案B分數(0-100)',
    defaultData: '開發速度, 88, 72\n系統擴展性, 85, 92\n維運成本效益, 74, 86\n資安合規度, 90, 78\n團隊熟悉度, 92, 65\n社群生態支援, 86, 70',
    controls: [
      { key: 'axisCount', label: '顯示維度軸數', type: 'range', min: 5, max: 8, step: 1, value: 6, unit: '軸' },
      { key: 'compareSecond', label: '疊加對照方案 B', type: 'checkbox', value: true },
      { key: 'fillOpacity', label: '多邊形填色濃度', type: 'range', min: 10, max: 65, step: 5, value: 30, unit: '%' }
    ],
    purpose: [
      '<strong>一眼看出互補與短板</strong>：清楚呈現自研方案 vs 外購方案在成本、速度、維護性上的取捨。'
    ],
    scenarios: [
      '<strong>RFP 供應商評選簡報</strong>：比較兩家投標廠商在六大評分項目的優劣。',
      '<strong>競品功能輪廓分析</strong>：我方產品 vs 主要競品的綜合體驗分數。'
    ],
    caveats: [
      '<strong>所有維度必須同方向（愈外圈代表愈好）且同量尺（0~100分）</strong>。'
    ]
  },
  {
    id: 'heatmap',
    number: 10,
    name: '熱力圖 (跨部門資源與時段熱區)',
    enName: 'Heatmap',
    category: '關聯與多維度類',
    goalIds: ['dist', 'compare'],
    summary: '以二維矩陣搭配色彩深淺呈現高密度數據，適合檢視「各團隊跨週次資源負載熱區」或「產品功能點擊熱區」。',
    defaultTitle: '各工程職系未來六週資源負載熱力圖 (%)',
    defaultDataHint: '格式：列名稱 | 6個欄位的數值(逗號分隔)',
    defaultData: '前端團隊 | 65, 78, 92, 95, 70, 55\n後端團隊 | 82, 88, 90, 75, 68, 60\nAI演算法 | 50, 65, 85, 88, 92, 80\nQA測試組 | 40, 45, 60, 85, 96, 90\nUI/UX設計 | 92, 85, 60, 50, 45, 40',
    controls: [
      { key: 'palette', label: '色階配色方案', type: 'select', value: 'sky', options: [
        { value: 'sky', label: '深海藍青漸層 (Sequential)' },
        { value: 'emerald', label: '翠綠能量漸層' },
        { value: 'diverging', label: '藍白紅雙極警訊色階 (超載自動轉紅)' }
      ]},
      { key: 'contrast', label: '熱區對比強化', type: 'range', min: 60, max: 150, step: 10, value: 100, unit: '%' },
      { key: 'showNumbers', label: '於格內顯示精確數值', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>瞬間抓出資源瓶頸週次</strong>：一眼看出哪一週哪個職系負載超過 90%（紅區），提前進行任務平滑化 (Resource Leveling)。'
    ],
    scenarios: [
      '<strong>多專案人力衝突盤點</strong>：部門 × 月份的工時負荷率矩陣。',
      '<strong>用戶留存 Cohort 矩陣</strong>：各梯次用戶在不同週次的活躍留存率。'
    ],
    caveats: [
      '<strong>有明確警戒線（如 85% 負載）時，切換為「藍白紅雙極色階」最能凸顯超載紅區</strong>。'
    ]
  },
  {
    id: 'pie',
    number: 11,
    name: '圓餅圖 / 甜甜圈圖 (預算與工時佔比)',
    enName: 'Pie / Donut Chart',
    category: '佔比與結構類',
    goalIds: ['part'],
    summary: '快速呈現「總和 100%」的簡單結構比例，適合在開案簡報呈現預算四大塊分配或工時結構。',
    defaultTitle: '專案總預算配置結構 (100%)',
    defaultDataHint: '格式：分類名稱, 數值',
    defaultData: '研發人力成本, 46\n雲端與AI算力, 26\n外部顧問與資安, 16\n行銷與上市推廣, 12',
    controls: [
      { key: 'innerRadius', label: '內圈挖空比例 (0%=圓餅, >40%=甜甜圈)', type: 'range', min: 0, max: 72, step: 4, value: 52, unit: '%' },
      { key: 'sliceCount', label: '顯示切塊上限', type: 'range', min: 3, max: 8, step: 1, value: 4, unit: '項' },
      { key: 'explodeFirst', label: '凸顯最大佔比區塊', type: 'checkbox', value: false }
    ],
    purpose: [
      '<strong>直觀傳達主導比例</strong>：讓決策者一秒看懂哪一塊佔了將近一半或四分之三。'
    ],
    scenarios: [
      '<strong>專案成本結構簡報</strong>、<strong>客訴問題前四大類型佔比</strong>。'
    ],
    caveats: [
      '<strong>切塊請控制在 5 項以內</strong>：超過 5 項時請合併為「其他」，或改用水平長條圖與矩形樹狀圖。'
    ]
  },
  {
    id: 'treemap',
    number: 12,
    name: '矩形樹狀圖 (WBS 預算與權重版圖)',
    enName: 'Treemap',
    category: '佔比與結構類',
    goalIds: ['part', 'compare'],
    summary: '當分類項目較多時取代圓餅圖，並可同時用「矩形面積 = 預算/工時規模」與「顏色 = 進度狀態/超支率」編碼雙維度。',
    defaultTitle: '專案各子系統預算規模與執行狀態版圖',
    defaultDataHint: '格式：模組名稱, 佔比%, 狀態標籤',
    defaultData: 'AI核心推論引擎, 32, +進度超前\n企業權限與SSO, 22, +正常推進\n高併發金流閘道, 16, +正常推進\n舊資料清洗遷移, 14, -輕微延誤\n自動化監控告警, 10, +正常推進\n多語系在地化, 6, -待補資源',
    controls: [
      { key: 'gap', label: '區塊間距 (Padding)', type: 'range', min: 2, max: 10, step: 1, value: 4, unit: 'px' },
      { key: 'colorBy', label: '色彩編碼依據', type: 'select', value: 'category', options: [
        { value: 'category', label: '依系統模組分類著色' },
        { value: 'performance', label: '依進度健康度著色 (綠正常 / 紅延誤)' }
      ]},
      { key: 'showPct', label: '顯示佔比與狀態標籤', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>高空間效率的全景圖</strong>：一張圖看清哪些模組規模最大，以及大模組是否亮紅燈。'
    ],
    scenarios: [
      '<strong>大型專案 WBS 權重分佈</strong>、<strong>IT 部門年度維運成本版圖</strong>。'
    ],
    caveats: [
      '<strong>面積僅能代表正數規模</strong>：負向偏差請用顏色呈現。'
    ]
  },
  {
    id: 'sankey',
    number: 13,
    name: '桑基圖 (預算流向與用戶路徑流轉)',
    enName: 'Sankey Diagram',
    category: '關聯與多維度類',
    goalIds: ['schedule', 'part'],
    summary: '以流帶寬度呈現「多對多」的資源分配或用戶跨頁面流轉，遵循左進右出流量守恆。',
    defaultTitle: '研發資源投入 → 產品線 → 商業價值產出流向',
    defaultDataHint: '調整右側滑桿可即時改變流帶曲率與核心業務權重',
    defaultData: 'AI雲端訂閱:60, 企業授權:40 -> 營業淨利:36%, 研發再投入:38%, 營運成本:26%',
    controls: [
      { key: 'curvature', label: '流帶彎曲平滑度', type: 'range', min: 20, max: 80, step: 5, value: 50, unit: '%' },
      { key: 'flowShift', label: '核心業務流量權重調整', type: 'range', min: 60, max: 150, step: 10, value: 100, unit: '%' },
      { key: 'showFlowValues', label: '顯示節點流量數值', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>追蹤資源從哪裡來、往哪裡去</strong>：一眼看清主幹道與支流比例。'
    ],
    scenarios: [
      '<strong>PMO 年度人力資源分派流向</strong>、<strong>App 用戶進站後的跨頁流轉路徑分析</strong>。'
    ],
    caveats: [
      '<strong>將小於 2% 的極細支流合併</strong>：避免畫面變成糾結的毛線球。'
    ]
  },
  {
    id: 'area',
    number: 14,
    name: '面積圖 / 看板累積流量圖 (CFD)',
    enName: 'Stacked Area / Cumulative Flow Diagram',
    category: '趨勢類',
    goalIds: ['schedule', 'part'],
    summary: '敏捷看板與專案追蹤利器：堆疊各階段任務數量（Done 已完成 / Doing 進行中 / To-Do 待辦），一眼看出「進行中 (WIP)」是否越堆越厚造成卡關！',
    defaultTitle: '敏捷專案累積流量圖 (CFD - 已完成/進行中/待辦)',
    defaultDataHint: '格式：週次, 已完成(底層), 進行中WIP(中層), 新進入待辦(頂層)',
    defaultData: 'W1, 15, 20, 18\nW2, 24, 22, 15\nW3, 35, 25, 16\nW4, 46, 28, 18\nW5, 58, 30, 16\nW6, 70, 26, 20\nW7, 84, 24, 18\nW8, 98, 20, 15',
    controls: [
      { key: 'mode', label: '堆疊模式', type: 'select', value: 'stacked', options: [
        { value: 'stacked', label: '堆疊總量 (標準看板累積流量 CFD)' },
        { value: 'percent', label: '100% 百分比結構佔比' },
        { value: 'overlap', label: '重疊比較模式' }
      ]},
      { key: 'opacity', label: '填色不透明度', type: 'range', min: 25, max: 90, step: 5, value: 70, unit: '%' }
    ],
    purpose: [
      '<strong>診斷流程瓶頸</strong>：在 CFD 累積流量圖中，中間紫色帶（進行中 WIP）的垂直高度代表當前在製品數量，水平寬度代表平均前置時間 (Lead Time)。'
    ],
    scenarios: [
      '<strong>Scrum / Kanban 雙週復盤會</strong>：檢查團隊是否開了太多半成品卻遲遲無法結案 (Done)。'
    ],
    caveats: [
      '<strong>將最穩定累積的「已完成 (Done)」放在最底層</strong>，如此中間層的厚度變化最容易判讀。'
    ]
  },
  {
    id: 'scatter',
    number: 15,
    name: '散佈圖 (預估 vs 實際工時相關性)',
    enName: 'Scatter Plot',
    category: '關聯與多維度類',
    goalIds: ['dist'],
    summary: '檢驗兩個連續變數的相關性與離群點，PM 可用來分析「預估點數 (Story Points) vs 實際耗時天數」是否一致。',
    defaultTitle: '任務複雜度預估 (X) vs 實際耗時 (Y) 散佈分析',
    defaultDataHint: '可直接使用右側滑桿模擬相關係數與離群值，或輸入自訂座標 (X, Y)',
    defaultData: '',
    controls: [
      { key: 'correlation', label: '相關係數強度 (r)', type: 'range', min: -90, max: 95, step: 5, value: 75, unit: '%' },
      { key: 'sampleCount', label: '任務樣本數量 (N)', type: 'range', min: 15, max: 80, step: 5, value: 40, unit: '點' },
      { key: 'showTrend', label: '顯示線性迴歸趨勢線', type: 'checkbox', value: true },
      { key: 'showOutlier', label: '標示嚴重低估之異常任務 (Outliers)', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>校準團隊估時準確度</strong>：找出那些「預估很小、實際卻拖很久」的異常點，分析是否因為隱藏技術債或需求不明。'
    ],
    scenarios: [
      '<strong>Sprint 估時準確度復盤</strong>、<strong>行銷投入金額 vs 轉換效益相關性分析</strong>。'
    ],
    caveats: [
      '<strong>相關不等於因果</strong>：留意少數極端離群值對迴歸線的扭曲。'
    ]
  },
  {
    id: 'boxplot',
    number: 16,
    name: '盒鬚圖 (團隊交付週期穩定度比較)',
    enName: 'Box Plot',
    category: '分佈類',
    goalIds: ['dist', 'compare'],
    summary: '並排比較多個團隊或不同任務類型的交付時間「中位數、四分位距 (IQR 穩定度) 與極端塞車離群值」。',
    defaultTitle: '各敏捷小組任務交付週期 (Cycle Time) 穩定度盒鬚圖',
    defaultDataHint: '格式：組別名稱, 中位數, Q1(25%), Q3(75%), 離群值',
    defaultData: 'A組 (核心平台), 52, 42, 64, 91\nB組 (高穩定度), 68, 62, 74, 88\nC組 (高波動組), 58, 35, 79, 95\nD組 (增長實驗), 75, 65, 84, 28',
    controls: [
      { key: 'spread', label: '群組離散程度縮放 (IQR)', type: 'range', min: 50, max: 160, step: 10, value: 100, unit: '%' },
      { key: 'showOutliers', label: '顯示超過 1.5×IQR 的塞車離群點', type: 'checkbox', value: true },
      { key: 'showJitter', label: '疊加個別任務散點 (Jitter Points)', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>看穿平均值背後的波動風險</strong>：A 組與 C 組平均速度差不多，但 C 組箱體極寬代表交付時間忽快忽慢、難以預測。'
    ],
    scenarios: [
      '<strong>SLA 服務水準承諾評估</strong>：利用第 75 百分位 ($Q_3$) 或上鬍鬚端點作為對外 SLA 承諾基準。'
    ],
    caveats: [
      '<strong>建議勾選「疊加個別任務散點」</strong>，讓非統計背景的團隊成員也能直觀看懂箱體含義。'
    ]
  },
  {
    id: 'histogram',
    number: 17,
    name: '直方圖 (任務工期與指標分佈)',
    enName: 'Histogram',
    category: '分佈類',
    goalIds: ['dist'],
    summary: '將連續數據分箱 (Bins) 觀察真實分佈形狀——專案工期往往呈現「右偏長尾分佈」而非對稱常態分佈！',
    defaultTitle: '專案任務實際完成時間分佈與長尾分析',
    defaultDataHint: '調整右側「分箱區間數量」與「右偏長尾分佈」觀察平均數與中位數差距',
    defaultData: '',
    controls: [
      { key: 'binCount', label: '分箱區間數量 (Bins)', type: 'range', min: 5, max: 25, step: 1, value: 12, unit: '箱' },
      { key: 'distType', label: '資料分佈型態模擬', type: 'select', value: 'skewed', options: [
        { value: 'skewed', label: '右偏長尾分佈 (真實專案工期常見型態！)' },
        { value: 'normal', label: '常態鐘形分佈 (Normal)' },
        { value: 'bimodal', label: '雙峰分佈 (兩類不同難度任務混合)' }
      ]},
      { key: 'showMeanMedian', label: '顯示平均數 (Mean) 與中位數 (Median) 線', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>理解為什麼專案總是比平均預估慢</strong>：因為工期有下限（不可能小於 0）卻沒有上限（意外延誤可長達數週），形成右偏長尾，導致平均數大於中位數。'
    ],
    scenarios: [
      '<strong>蒙地卡羅工期風險模擬結果分佈</strong>、<strong>客戶回應時間分佈</strong>。'
    ],
    caveats: [
      '<strong>分箱數 (Bins) 不宜過少或過多</strong>：建議在 10~20 箱之間切換觀察是否隱藏雙峰。'
    ]
  }
];

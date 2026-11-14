/**
 * PM 實戰思維與管理工具箱資料庫 (收錄 10 個大人學 / TOC 限制理論 / PMBOK 經典工具)
 * 每個工具皆支援使用者自訂文字或數值，並即時渲染成可匯出 (PNG / SVG) 的視覺圖表！
 */
window.PM_TOOLS_DATA = [
  {
    id: 'toc-cloud',
    number: 1,
    name: 'TOC 衝突圖 (蒸發雲)',
    enName: 'TOC Evaporating Cloud / Conflict Resolution Diagram',
    category: 'TOC 限制理論 · 大人學破局思維',
    badge: '雙贏破局神器',
    summary: '源自高德拉特《目標》限制理論 (TOC)，也是大人學極力推崇的衝突拆解工具。將看似非黑即白的「立場衝突 (D vs D\')」往回推導出背後的「需求 (B、C)」與「共同目標 (A)」，找出隱藏的錯誤假設並注入破局方案。',
    editableFields: [
      { key: 'title', label: '衝突主題名稱', type: 'text', value: '產品準時上線 vs 零重大 Bug 衝突圖' },
      { key: 'goalA', label: 'A. 共同目標 (Objective)', type: 'text', value: '打造讓客戶滿意且具商業成功的產品' },
      { key: 'reqB', label: 'B. 必要條件 1 (Requirement B)', type: 'text', value: '確保系統穩定、維護品牌口碑' },
      { key: 'reqC', label: 'C. 必要條件 2 (Requirement C)', type: 'text', value: '搶佔市場先機、履行客戶合約承諾' },
      { key: 'actD', label: 'D. 行動主張 1 (Prerequisite D)', type: 'text', value: '延後兩週上線，做完完整回歸測試' },
      { key: 'actDPrime', label: 'D\'. 對立主張 2 (Prerequisite D\')', type: 'text', value: '本週五如期上線，邊上線邊修 Bug' },
      { key: 'assumption', label: '⚡ 暴露背後的錯誤假設', type: 'text', value: '假設「所有功能都必須在同一天一次性全量開放給所有客戶」' },
      { key: 'injection', label: '💡 破局注入方案 (Injection)', type: 'text', value: '分階段發布 (Feature Flag)：本週五準時上線核心穩定功能，次要模組標示 Beta 灰度開放' }
    ],
    purpose: [
      '<strong>把「對人不對事」轉為邏輯拆解</strong>：專案中研發與業務、PM 與老闆常因行動主張 (D 與 D\') 針鋒相對，但雙方其實都想達成同一個共同目標 (A)。',
      '<strong>挑戰箭頭背後的隱藏假設</strong>：TOC 認為世上沒有真正的兩難，只有尚未被檢視的「隱藏假設」。打破 B→D、C→D\' 或 D↔D\' 的假設即可雙贏，不必妥協和稀泥。'
    ],
    scenarios: [
      '<strong>上市時程 vs 產品品質</strong>：業務要求準時交貨 (D\') vs 工程堅持延後修完所有問題 (D)。',
      '<strong>客製化需求 vs 標準化架構</strong>：大客戶要求專屬客製修改 vs 研發堅持只維護單一標準版。',
      '<strong>跨部門資源爭奪</strong>：長期技術債重構 vs 短期新功能衝刺。'
    ],
    caveats: [
      '<strong>B 與 C 必須寫成「名詞／狀態需求」而非行動</strong>：千萬別把手段放進 B 與 C（例如「多寫測試」是手段 D，「系統穩定度受信任」才是需求 B）。',
      '<strong>尋求「破局 (Breakthrough)」而非「各退一步 (Compromise)」</strong>：各退一步往往兩邊都不討好，直接針對箭頭假設提出注入方案 (Injection) 才能徹底蒸發衝突。'
    ]
  },
  {
    id: 'iron-triangle',
    number: 2,
    name: '專案鐵三角與優先級共識矩陣',
    enName: 'Project Iron Triangle & Trade-off Matrix',
    category: '大人學開案心法 · 範疇與期望管理',
    badge: '開案必簽共識',
    summary: '大人學專案管理強調：時間 (Time)、範疇 (Scope)、成本/資源 (Cost) 三者不可能同時固定！開案前必須與老闆/客戶達成「哪一個不可退讓、哪一個作為調節閥」的明確共識。',
    editableFields: [
      { key: 'title', label: '專案名稱', type: 'text', value: 'Q4 企業AI客服改版專案 - 鐵三角取捨共識' },
      { key: 'fixedDim', label: '🔒 固定不可退讓 (Constrain - 只能選1項)', type: 'select', value: 'time', options: [
        { value: 'time', label: '時間固定 (Deadline 死線不可動)' },
        { value: 'scope', label: '範疇固定 (功能規格一項都不能少)' },
        { value: 'cost', label: '預算/資源固定 (人頭與經費絕對不加)' }
      ]},
      { key: 'optimizeDim', label: '🎯 盡力優化 (Optimize - 選1項)', type: 'select', value: 'cost', options: [
        { value: 'cost', label: '預算/資源控制 (在死線內盡量省成本)' },
        { value: 'scope', label: '範疇最大化 (在死線內盡量多做核心功能)' },
        { value: 'time', label: '時間最佳化 (盡快交付上市)' }
      ]},
      { key: 'acceptDim', label: '🌊 彈性調節閥 (Accept / Trade-off - 選1項)', type: 'select', value: 'scope', options: [
        { value: 'scope', label: '範疇可裁剪 (砍次要功能、分期交付 MVP)' },
        { value: 'time', label: '時間可順延 (允許延後上線以保品質與規格)' },
        { value: 'cost', label: '資源可追加 (緊急時可外包或加派人手)' }
      ]},
      { key: 'ruleNote', label: '當危機發生時的裁決原則', type: 'text', value: '若上線前兩週發現進度落後，優先將 P2 報表匯出功能移至 Phase 2，絕不延誤 11/30 死線。' }
    ],
    purpose: [
      '<strong>破除「既要馬兒好，又要馬兒不吃草」</strong>：讓老闆與客戶在專案平靜期就先簽下取捨原則，避免火燒屁股時全體陷入情緒爭執。',
      '<strong>明確團隊決策邊界</strong>：三個維度必須分別填入「固定 (Constrain)」、「優化 (Optimize)」與「接受妥協 (Accept)」，一欄只能放一個勾！'
    ],
    scenarios: [
      '<strong>法規或檔期死線專案</strong>：如雙11促銷、法規生效日——「時間固定」，「範疇」必須作為調節閥。',
      '<strong>高安全性醫療／飛安系統</strong>：「範疇與品質固定」，「時間與成本」必須彈性配合。',
      '<strong>固定總價外包案</strong>：當預算封頂時，必須嚴格控管範疇變更 (Change Request)。'
    ],
    caveats: [
      '<strong>切勿讓三個維度都填「固定」</strong>：若老闆堅持三個都不能退，PM 應在開案會議展示此圖，詢問：「如果到了倒數第 7 天發生不可抗力延誤，我們該砍次要功能還是延後 3 天？」迫使排定先後順序。'
    ]
  },
  {
    id: 'stakeholder-grid',
    number: 3,
    name: '利害關係人權力×利益矩陣',
    enName: 'Stakeholder Power-Interest Grid',
    category: '大人學專案政治學 · 向上與跨部門管理',
    badge: '搞定人的關鍵',
    summary: '大人學經典心法：「專案失敗往往不是技術問題，而是某個關鍵人物覺得沒被尊重。」透過權力影響力 (Power) 與利益關切度 (Interest) 四象限，精準配置 PM 的溝通心力。',
    editableFields: [
      { key: 'title', label: '專案利害關係人盤點名稱', type: 'text', value: 'ERP 跨部門導入案 - 關鍵人物權力利益矩陣' },
      { key: 's1', label: '人物 1 (格式：姓名/職稱, 權力0-100, 關切0-100, 支持/中立/反對)', type: 'text', value: '陳副總 (Sponsor), 90, 85, 支持' },
      { key: 's2', label: '人物 2', type: 'text', value: '財務部林協理, 82, 35, 反對' },
      { key: 's3', label: '人物 3', type: 'text', value: '客服組長小張, 30, 88, 支持' },
      { key: 's4', label: '人物 4', type: 'text', value: '資安稽核專員, 75, 72, 中立' },
      { key: 's5', label: '人物 5', type: 'text', value: '外包工程PM, 40, 78, 支持' },
      { key: 's6', label: '人物 6', type: 'text', value: '行政總務窗口, 25, 25, 中立' }
    ],
    purpose: [
      '<strong>四大象限差異化經營策略</strong>：右上「高權力×高關切（重點管理 Manage Closely）」、左上「高權力×低關切（保持滿意 Keep Satisfied — 最容易在最後關頭否決專案的地雷！）」、右下「低權力×高關切（隨時告知 Keep Informed）」。',
      '<strong>結合態度色標（綠支持／黃中立／紅反對）</strong>：一眼看出哪位高權力者目前持保留或反對態度，提前私下拜會化解阻力。'
    ],
    scenarios: [
      '<strong>跨部門數位轉型與系統導入</strong>：搞清楚誰有否決權、誰的工作流程會被改變。',
      '<strong>大型組織改組或流程變更</strong>：識別隱形影響者與潛在反對者。'
    ],
    caveats: [
      '<strong>千萬別忽略左上角「高權力、低關切」的大佬</strong>：例如法務長、資安長或財務長，平時不參加例會，但上線前夕一票否決。務必定期主動摘要匯報！',
      '<strong>此圖屬於 PM 內部機密作戰地圖</strong>：匯出圖檔供核心團隊對齊策略即可，切勿直接貼在公開大群組標註誰是「反對派」。'
    ]
  },
  {
    id: 'wbs-builder',
    number: 4,
    name: 'WBS 工作分解結構圖 (100% 法則)',
    enName: 'Work Breakdown Structure (WBS)',
    category: '大人學專案基石 · 範疇拆解',
    badge: '杜絕漏項神器',
    summary: '專案管理的萬流歸宗工具。將最終目標拆解為可交付成果（名詞導向 Deliverable-oriented），確保不重不漏（100% Rule），直到拆出可估時、可指派單一負責人的最小工作包 (Work Package)。',
    editableFields: [
      { key: 'title', label: '專案總交付目標 (Level 1)', type: 'text', value: '新世代品牌電商 App 上線專案' },
      { key: 'col1Title', label: '支柱 1 名稱 (Level 2)', type: 'text', value: '1.0 產品設計交付物' },
      { key: 'col1Items', label: '支柱 1 工作包 (逗號分隔)', type: 'text', value: '1.1 需求規格書, 1.2 UI高保真設計稿, 1.3 易用性測試報告' },
      { key: 'col2Title', label: '支柱 2 名稱 (Level 2)', type: 'text', value: '2.0 核心系統交付物' },
      { key: 'col2Items', label: '支柱 2 工作包 (逗號分隔)', type: 'text', value: '2.1 會員與金流API, 2.2 iOS/Android雙端App, 2.3 壓測與資安報告' },
      { key: 'col3Title', label: '支柱 3 名稱 (Level 2)', type: 'text', value: '3.0 營運與上市準備' },
      { key: 'col3Items', label: '支柱 3 工作包 (逗號分隔)', type: 'text', value: '3.1 客服SOP手冊, 3.2 首波推廣素材包, 3.3 雙商店上架審核' }
    ],
    purpose: [
      '<strong>把抽象大餅變成具體清單</strong>：沒有 WBS，所有的估時與報價都是憑空猜測。',
      '<strong>100% 包含法則</strong>：下層所有節點的總和必須 100% 等於上層父節點，不多做鍍金功能 (Gold Plating)，也不遺漏隱形工作（如教育訓練、資料移轉、上架審核）。'
    ],
    scenarios: [
      '<strong>專案開案範疇界定</strong>：與客戶或團隊確認「我們到底要交付哪些具體的東西」。',
      '<strong>成本估算與時程排定前置</strong>：先有 WBS 工作包，才能展開甘特圖與 RACI 矩陣。'
    ],
    caveats: [
      '<strong>請用「名詞（交付物）」而非「動詞」命名</strong>：例如寫「測試報告（名詞，定義明確）」而非「進行測試（動詞，不知道測到什麼程度才算完）」。',
      '<strong>8/80 法則</strong>：最底層的工作包工期建議控制在 8 小時（1天）至 80 小時（2週）之間，且只有唯一一個負責人。'
    ]
  },
  {
    id: 'ccpm-buffer',
    number: 5,
    name: 'CCPM 關鍵鏈緩衝河道圖 (Fever Chart)',
    enName: 'Critical Chain Project Buffer Fever Chart',
    category: 'TOC 限制理論 · 專案時程控管',
    badge: '抗延誤預警雷達',
    summary: '高德拉特 TOC「關鍵鏈專案管理 (CCPM)」核心控管圖：解決「學生症候群（拖到最後一刻才動工）」與「帕金森定律（提早做完也不說）」。以橫軸「關鍵鏈完成度 %」對照縱軸「專案緩衝消耗度 %」，在綠黃紅三色河道上即時追蹤專案健康度！',
    editableFields: [
      { key: 'title', label: '專案關鍵鏈追蹤名稱', type: 'text', value: 'AI 平台研發關鍵鏈 - 緩衝消耗河道圖 (Fever Chart)' },
      { key: 'p1', label: '檢查點 W2 (格式：完成%, 緩衝消耗%)', type: 'text', value: '15, 10' },
      { key: 'p2', label: '檢查點 W4', type: 'text', value: '32, 28' },
      { key: 'p3', label: '檢查點 W6', type: 'text', value: '48, 52' },
      { key: 'p4', label: '檢查點 W8', type: 'text', value: '68, 72' },
      { key: 'p5', label: '檢查點 W10 (目前)', type: 'text', value: '85, 76' }
    ],
    purpose: [
      '<strong>打破每個任務各自藏安全時間的浪費</strong>：將各任務砍半後的安全時間集中放到專案尾端成為「專案緩衝 (Project Buffer)」。',
      '<strong>三色斜率河道即時決策</strong>：軌跡在「綠區（正常觀察）」、「黃區（擬定趕工對策 Plan）」、「紅區（立即啟動救援行動 Act）」一目了然！'
    ],
    scenarios: [
      '<strong>研發與工程專案週會檢核</strong>：不必爭論單一任務遲到幾天，直接看「整體完成進度 vs 總緩衝消耗比例」。',
      '<strong>多專案組合戰情室 (PMO)</strong>：同時把 10 個專案的最新落點畫在同一張 Fever Chart 上，一眼看出哪個專案在紅區需要主管支援。'
    ],
    caveats: [
      '<strong>斜率比絕對位置更重要</strong>：若專案只完成了 20%，卻已經吃掉 50% 的緩衝區，代表軌跡正急遽衝向紅區，必須立刻介入排除瓶頸！'
    ]
  },
  {
    id: 'raci-matrix',
    number: 6,
    name: 'RACI 權責分工矩陣 (含自動健檢)',
    enName: 'RACI Responsibility Assignment Matrix',
    category: '跨部門協作 · 組織治理',
    badge: '終結踢皮球',
    summary: '釐清跨部門專案中「誰動手做 (R)、誰負最終成敗責任拍板 (A)、事前該問誰 (C)、事後通知誰 (I)」，並內建大人學式權責健檢（自動偵測有無「多頭馬車」或「無人當責」）。',
    editableFields: [
      { key: 'title', label: 'RACI 矩陣標題', type: 'text', value: '新產品上市跨部門 RACI 權責矩陣' },
      { key: 'roles', label: '角色欄位 (4個角色，逗號分隔)', type: 'text', value: '產品PM, 研發Lead, 行銷經理, 業務總監' },
      { key: 'row1', label: '任務 1 (任務名 | 4個角色的R/A/C/I)', type: 'text', value: '產品規格與定價策略 | A, C, R, C' },
      { key: 'row2', label: '任務 2', type: 'text', value: '核心功能開發與測試 | C, A/R, I, I' },
      { key: 'row3', label: '任務 3', type: 'text', value: '上市發表會與公關稿 | C, I, A/R, C' },
      { key: 'row4', label: '任務 4', type: 'text', value: '大客戶首波推廣簽約 | C, I, C, A/R' }
    ],
    purpose: [
      '<strong>區分 R (執行者) 與 A (當責拍板者)</strong>：Responsible 是捲起袖子做事的人（可以有多人）；Accountable 是對結果負全責、擁有唯一否決與拍板權的人。',
      '<strong>區分 C (雙向諮詢) 與 I (單向告知)</strong>：避免把所有人都拉進會裡當 C（導致會議癱瘓），大部分人只需要事後收信當 I。'
    ],
    scenarios: [
      '<strong>跨部門專案 Kick-off 會議</strong>：白紙黑字對齊各部門在每個階段的角色。',
      '<strong>流程改造與 SOP 制定</strong>：解決灰色地帶「三不管」問題。'
    ],
    caveats: [
      '<strong>黃金鐵律：每一列任務「只能有唯一一個 A (Accountable)」</strong>！如果一件事有兩個 A，出事時一定互相推託；如果沒有 A，這件事永遠不會有人拍板。'
    ]
  },
  {
    id: 'risk-matrix',
    number: 7,
    name: '風險機率×衝擊矩陣與應對四策',
    enName: 'Risk Probability-Impact Matrix & Mitigation',
    category: '風險管理 · 危機預演',
    badge: '事前拆彈指南',
    summary: '將專案潛在風險依「發生機率 (Probability)」與「衝擊程度 (Impact)」投射至 5×5 紅黃綠熱區矩陣，並搭配四大風險應對策略（規避、減輕、轉嫁、承受）。',
    editableFields: [
      { key: 'title', label: '風險評估矩陣標題', type: 'text', value: '雲端系統遷移專案 - 關鍵風險矩陣' },
      { key: 'r1', label: '風險 1 (名稱, 機率1-5, 衝擊1-5, 策略)', type: 'text', value: 'R1 舊資料庫格式不相容, 4, 5, 減輕: 提前兩週跑試遷移腳本' },
      { key: 'r2', label: '風險 2', type: 'text', value: 'R2 第三方金流API審核延遲, 4, 4, 規避: 改用已簽約之現有閘道' },
      { key: 'r3', label: '風險 3', type: 'text', value: 'R3 核心前端工程師請長假, 2, 4, 減輕: 落實雙人Code Review交接' },
      { key: 'r4', label: '風險 4', type: 'text', value: 'R4 機房硬體突發斷電, 1, 5, 轉嫁: 採用雲端雙可用區自動備援' },
      { key: 'r5', label: '風險 5', type: 'text', value: 'R5 說明文件翻譯小幅延遲, 3, 2, 承受: 預留2天人工校對緩衝' }
    ],
    purpose: [
      '<strong>視覺化風險熱區 (Risk Score = P × I)</strong>：右上角紅區（高機率×高衝擊）必須在開案期就投入資源進行「規避 (Avoid)」或「減輕 (Mitigate)」，絕不能等發生才救火。',
      '<strong>區分「預防措施 (Mitigation)」與「應變計畫 (Contingency Plan)」</strong>：事前降低機率叫減輕；萬一發生後啟動的 B 計畫叫應變。'
    ],
    scenarios: [
      '<strong>新技術導入或系統切換上線</strong>：盤點技術、法規、供應商與人力風險。',
      '<strong>高階主管指導委員會 (Steering Committee) 匯報</strong>：帶著紅區風險與應對方案請主管協助決策。'
    ],
    caveats: [
      '<strong>風險描述必須包含「原因 → 風險事件 → 造成的後果」</strong>：不要只寫「進度延誤」四個字，要寫「因第三方 API 文件未定案，可能導致串接重工，造成上線延誤兩週」。'
    ]
  },
  {
    id: 'toc-crt',
    number: 8,
    name: 'TOC 現況樹與根因分析 (CRT / 5 Whys)',
    enName: 'TOC Current Reality Tree & Root Cause Analysis',
    category: 'TOC 限制理論 · 問題分析與解決',
    badge: '抓出真正瓶頸',
    summary: '當專案同時爆發十幾個亂象（加班、Bug多、客戶抱怨、需求一直改），千萬別頭痛醫頭！TOC 現況樹幫你從表面的「不理想現象 (UDE)」順著因果箭頭往下追查，鎖定佔 80% 影響力的單一「核心根因 (Core Problem)」。',
    editableFields: [
      { key: 'title', label: '問題根因分析標題', type: 'text', value: '研發團隊「越忙越延誤」之 TOC 現況根因樹' },
      { key: 'ude1', label: '表面症狀 UDE 1 (最上層結果)', type: 'text', value: '專案頻繁延誤、客戶滿意度下滑' },
      { key: 'ude2', label: '表面症狀 UDE 2', type: 'text', value: '工程師頻繁切換任務、加班嚴重卻產出低' },
      { key: 'ude3', label: '表面症狀 UDE 3', type: 'text', value: '測試階段抓出大量規格不符的重工 Bug' },
      { key: 'mid1', label: '中層原因 1', type: 'text', value: '每位工程師同時背負 4~5 個未完成專案 (WIP過高)' },
      { key: 'mid2', label: '中層原因 2', type: 'text', value: '需求未經收斂就倉促派工動手寫扣' },
      { key: 'rootCause', label: '🔥 最底層核心根因 (Core Root Cause)', type: 'text', value: '缺乏開案優先級總量管制 (WIP Limit) 與 DoR (準備就緒定義) 門檻' },
      { key: 'action', label: '🎯 槓桿解方 (高價值對策)', type: 'text', value: '導入看板在製品上限 (WIP≤2) 並強制執行開案前 PRD 驗收條件確認' }
    ],
    purpose: [
      '<strong>區分「症狀 (UDE)」與「病因 (Root Cause)」</strong>：團隊常把時間花在處理最上層的表面症狀（如要求大家多加班、加開檢討會），卻沒解決底層結構性瓶頸。',
      '<strong>找到最高槓桿的切入點</strong>：只要拔除最底層的單一核心根因，上方一連串的負面症狀就會自動消退。'
    ],
    scenarios: [
      '<strong>專案復盤會議 (Retrospective / Post-mortem)</strong>：找出重大事故或長期效率低落的根本原因。',
      '<strong>組織流程改善提案</strong>：向管理層證明為什麼某項制度改革能同時解決三個部門的痛點。'
    ],
    caveats: [
      '<strong>檢驗因果邏輯是否充分</strong>：每一條由下往上的箭頭，都要用「如果 [下層原因]，那麼就會導致 [上層結果]，因為...」來檢驗是否有邏輯跳躍。'
    ]
  },
  {
    id: 'pert-estimator',
    number: 9,
    name: 'PERT 三點估算與工期信心計算機',
    enName: 'PERT Three-Point Estimation & Confidence Interval',
    category: '科學估時 · 風險量化',
    badge: '告別拍腦袋估時',
    summary: '大人學估時實務：工程師報「單一數字」永遠不準！改問三個數字——樂觀工期 ($O$)、最可能工期 ($M$)、悲觀工期 ($P$)，透過加權公式 $E=(O+4M+P)/6$ 與標準差 $\\sigma=(P-O)/6$，算出有 $85\\%$ 與 $95\\%$ 把握準時交付的安全承諾工期！',
    editableFields: [
      { key: 'title', label: '估時專案名稱', type: 'text', value: '支付系統升級專案 - PERT 三點科學估時' },
      { key: 't1', label: '工作包 1 (名稱, 樂觀O, 最可能M, 悲觀P 天數)', type: 'text', value: '金流API串接, 4, 6, 14' },
      { key: 't2', label: '工作包 2', type: 'text', value: '前端結帳頁改版, 3, 5, 10' },
      { key: 't3', label: '工作包 3', type: 'text', value: '高併發壓力測試, 2, 4, 12' },
      { key: 't4', label: '工作包 4', type: 'text', value: '資安弱點掃描與修補, 2, 3, 9' }
    ],
    purpose: [
      '<strong>量化不確定性風險</strong>：當悲觀值 ($P$) 遠大於最可能值 ($M$) 時，標準差 $\\sigma$ 會變大，視覺上立刻凸顯哪個工作包藏著高風險未知數。',
      '<strong>提供管理層「帶有機率信心的承諾」</strong>：直接告訴老闆：「期望均值是 19.3 天（只有 50% 機率準時），若要達到 85% 把握準時，建議對外承諾 22.1 天；95% 把握則為 24.0 天。」'
    ],
    scenarios: [
      '<strong>外包報價與客戶合約押期</strong>：避免用只有 50% 成功率的期望值去簽具有罰則的死線合約。',
      '<strong>新技術研發估時</strong>：識別不確定性最高（標準差最大）的模組，優先進行 PoC 概念驗證。'
    ],
    caveats: [
      '<strong>多任務串聯時，總標準差是「變異數相加開根號」</strong>：即 $\\sigma_{\\text{total}} = \\sqrt{\\sum \\sigma_i^2}$，而非把每個任務的悲觀值直接全部硬加（直接硬加會造成過度灌水，這也是統計與 CCPM 的核心精神）。'
    ]
  },
  {
    id: 'moscow-board',
    number: 10,
    name: 'MoSCoW 需求優先級與容量裁剪看板',
    enName: 'MoSCoW Prioritization & Capacity Board',
    category: '產品管理 · 範疇控制',
    badge: '需求防爆盾牌',
    summary: '當利害關係人把所有需求都標成「最高優先級」時，使用 MoSCoW 法則強制將需求分流至 Must have（本版必做 $\le 60\\%$ 產能）、Should have、Could have（緩衝調節池）與 Won\'t have（明確排除），守住團隊產能上限！',
    editableFields: [
      { key: 'title', label: '版本範疇規劃標題', type: 'text', value: 'V2.0 雙11改版 MoSCoW 需求範疇與產能分配' },
      { key: 'capacity', label: '團隊本週期總可用人天 (Capacity)', type: 'text', value: '100' },
      { key: 'mustList', label: 'Must Have 必做核心 (名稱:人天, 逗號分隔)', type: 'text', value: '購物車高併發結帳:25, 優惠券疊加計算:20, 信用卡3D驗證:15' },
      { key: 'shouldList', label: 'Should Have 重要應做', type: 'text', value: '訂單即時推播通知:12, 退換貨自助申請:10' },
      { key: 'couldList', label: 'Could Have 若有餘裕可做 (緩衝池)', type: 'text', value: '深色模式主題:8, 節慶動態下雪特效:6' },
      { key: 'wontList', label: 'Won\'t Have 本次明確不做 (移至下期)', type: 'text', value: '跨國多幣別結算:30, AI穿搭虛擬試衣間:45' }
    ],
    purpose: [
      '<strong>保護團隊不超載（Must Have 建議控制在總產能 60% 以內）</strong>：留出 20% 給 Should Have、20% 給 Could Have，如此一旦遇到突發狀況，隨時可捨棄 Could Have 確保如期上線。',
      '<strong>明確列出 Won\'t Have 的價值</strong>：把「這次不做什麼」白紙黑字寫出來，是防止專案中途發生範疇蔓延 (Scope Creep) 最有效的護身符。'
    ],
    scenarios: [
      '<strong>Sprint Planning 與季度 Roadmap 排程</strong>：與業務、行銷及客戶進行「容量交換（要塞新功能進 Must，就得把等量工時的舊項目移出）」。'
    ],
    caveats: [
      '<strong>切勿讓 Must Have 塞滿 100% 產能</strong>：如果 Must 佔了 95% 產能，代表你的專案完全沒有任何範疇調節彈性，只要一個小意外就會違約延誤！'
    ]
  }
];

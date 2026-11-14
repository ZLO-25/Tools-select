/**
 * 15種常用數據圖表完整資料庫
 * 包含：分類、決策標籤、互動控制項定義、核心用途、常見場景、設計注意事項
 */
window.CHART_GOALS = [
  { id: 'all', label: '🌟 全部圖表 (15)', desc: '瀏覽所有15種經典數據圖表' },
  { id: 'compare', label: '📏 比較數值高低', desc: '比較不同項目、群組或多維度能力表現' },
  { id: 'trend', label: '📈 觀察時間趨勢與增減', desc: '追蹤隨時間變化的走勢、累積量或結構增減' },
  { id: 'part', label: '🥧 剖析佔比與階層結構', desc: '呈現各部分佔整體的比例、多層結構或轉化流失' },
  { id: 'dist', label: '🔔 檢視統計分佈與離群值', desc: '看數據集中趨勢、偏態、雙峰或極端異常值' },
  { id: 'corr', label: '🔗 探索關聯、矩陣與流向', desc: '分析多變數相關性、密度矩陣或資源流轉路徑' }
];

window.CHARTS_DATA = [
  {
    id: 'bar',
    number: 1,
    name: '長條圖 / 柱狀圖',
    enName: 'Bar / Column Chart',
    category: '比較類',
    goalIds: ['compare'],
    summary: '最直覺的類別數值比較工具，利用長度視覺編碼精準呈現各項目高低差異。',
    controls: [
      { key: 'orientation', label: '排列方向', type: 'select', value: 'vertical', options: [
        { value: 'vertical', label: '垂直柱狀圖 (Column)' },
        { value: 'horizontal', label: '水平長條圖 (Bar - 適合長標籤)' }
      ]},
      { key: 'sortMode', label: '資料排序', type: 'select', value: 'desc', options: [
        { value: 'raw', label: '原始順序' },
        { value: 'desc', label: '由高到低 (遞減)' },
        { value: 'asc', label: '由低到高 (遞增)' }
      ]},
      { key: 'yBaseline', label: 'Y軸起點偏移 (模擬截斷誤導)', type: 'range', min: 0, max: 50, step: 5, value: 0, unit: '%' },
      { key: 'showValues', label: '顯示資料數值標籤', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>精準長度比對</strong>：人類視覺對「對齊同一起點的長度差異」辨識度最高，適合跨類別精確比較。',
      '<strong>排名與差距呈現</strong>：搭配遞減或遞增排序後，能一眼看出第一名、最後一名與中位群組的差距。',
      '<strong>靈活轉向</strong>：當類別名稱很長或項目超過 8 個時，轉為水平長條圖可避免文字重疊或歪斜。'
    ],
    scenarios: [
      '<strong>電商與零售</strong>：各產品線月度營收排行、各分店業績比較。',
      '<strong>營運與行銷</strong>：不同廣告投放管道的獲客數量 (CAC / Leads) 對比。',
      '<strong>問卷與民調</strong>：複選題各選項得票數或滿意度評分比較。'
    ],
    caveats: [
      '<strong>嚴禁任意截斷數值軸起點</strong>：柱狀圖以「柱體長度」代表數值，Y 軸（或水平 X 軸）必須從 <code>0</code> 開始（試著調整上方「Y軸起點偏移」滑桿，觀察截斷後如何誇大微小差距！）。',
      '<strong>非時間序列優先排序</strong>：若橫軸不是月份或等級順序，請務必依數值由高到低排序，避免讀者視線來回跳躍。',
      '<strong>避免 3D 特效與過窄間距</strong>：柱與柱之間建議保留約 25%~40% 柱寬的留白。'
    ]
  },
  {
    id: 'line',
    number: 2,
    name: '折線圖',
    enName: 'Line Chart',
    category: '趨勢類',
    goalIds: ['trend'],
    summary: '呈現連續時間序列或有序變數的變化斜率、週期波動與長期趨勢。',
    controls: [
      { key: 'volatility', label: '波動幅度 (Noise)', type: 'range', min: 5, max: 60, step: 5, value: 20, unit: '' },
      { key: 'slope', label: '長期成長斜率', type: 'range', min: -30, max: 50, step: 5, value: 25, unit: '' },
      { key: 'showMA', label: '疊加移動平均線 (MA)', type: 'checkbox', value: true },
      { key: 'smooth', label: '平滑曲線插值', type: 'checkbox', value: false }
    ],
    purpose: [
      '<strong>捕捉變化速率（斜率）</strong>：強調資料隨時間推移的上升、下降、急遽轉折與季節性規律。',
      '<strong>多序列走勢對照</strong>：可在同一座標系同時比較 2~4 條序列的同步性或背離現象。',
      '<strong>降噪與趨勢提取</strong>：常搭配移動平均線（Moving Average）過濾短期雜訊。'
    ],
    scenarios: [
      '<strong>產品指標追蹤</strong>：DAU/MAU 日活躍用戶走勢、網站每日流量變化。',
      '<strong>金融與總經</strong>：股價走勢、匯率波動、CPI 物價指數年增率。',
      '<strong>工程監控</strong>：伺服器 CPU 負載率、API 回應延遲時間序列。'
    ],
    caveats: [
      '<strong>橫軸必須具備連續或有序關係</strong>：切勿把無順序的類別（如：蘋果、香蕉、橘子）用折線連起來，那會產生虛假的「斜率」暗示。',
      '<strong>同圖折線不宜超過 4~5 條</strong>：線條過多會變成難以閱讀的「義大利麵圖 (Spaghetti Chart)」，此時應改用高亮單一線條或小多圖 (Small Multiples)。',
      '<strong>長寬比影響斜率感受</strong>：建議讓主要趨勢線平均斜率接近 30°~45° (Banking to 45°)，避免過扁掩蓋波動或過窄製造恐慌。'
    ]
  },
  {
    id: 'pie',
    number: 3,
    name: '圓餅圖 / 甜甜圈圖',
    enName: 'Pie / Donut Chart',
    category: '佔比與結構類',
    goalIds: ['part'],
    summary: '以圓心角度與扇形面積呈現「部分佔整體 (100%)」的簡單比例關係。',
    controls: [
      { key: 'innerRadius', label: '內圈挖空比例 (0%=圓餅, >40%=甜甜圈)', type: 'range', min: 0, max: 72, step: 4, value: 48, unit: '%' },
      { key: 'sliceCount', label: '分類數量 (觀察過多切塊的影響)', type: 'range', min: 3, max: 8, step: 1, value: 4, unit: '項' },
      { key: 'explodeFirst', label: '凸顯最大區塊 (Explode)', type: 'checkbox', value: false }
    ],
    purpose: [
      '<strong>快速建立整體感</strong>：直觀傳達「總和為 100%」以及某單一項目是否佔據主導地位（如過半、四分之一）。',
      '<strong>甜甜圈中心資訊區</strong>：挖空內圈做成甜甜圈圖 (Donut Chart) 後，中心可放置總計數值或核心 KPI，且視覺更聚焦於弧長。'
    ],
    scenarios: [
      '<strong>市場與財務</strong>：前三大品牌市佔率結構、公司營收來源四大部門佔比。',
      '<strong>流量分析</strong>：網站訪客裝置佔比（行動裝置 vs 桌機 vs 平板）。',
      '<strong>預算配置</strong>：專案經費在人事、研發、行銷三大塊的分配比例。'
    ],
    caveats: [
      '<strong>切塊數量建議控制在 5 項以內</strong>：當切塊超過 5~6 個時，請將細小項目合併為「其他 (Others)」並放在最後（試著把上方滑桿調到 8 項感受擁擠程度）。',
      '<strong>不適合比較相近數值</strong>：人眼很難分辨 23% 與 25% 的扇形角度差異，若需精確比較高低請改用長條圖。',
      '<strong>排序規則</strong>：建議從 12 點鐘方向開始，依數值由大到小順時針排列，「其他」永遠放在最後一塊。'
    ]
  },
  {
    id: 'area',
    number: 4,
    name: '面積圖 / 堆疊面積圖',
    enName: 'Area / Stacked Area Chart',
    category: '趨勢類',
    goalIds: ['trend', 'part'],
    summary: '結合折線圖的「時間趨勢」與填充區域的「數量規模／結構佔比變化」。',
    controls: [
      { key: 'mode', label: '堆疊模式', type: 'select', value: 'stacked', options: [
        { value: 'stacked', label: '堆疊總量 (Stacked Area)' },
        { value: 'percent', label: '100% 百分比結構 (100% Stacked)' },
        { value: 'overlap', label: '重疊比較 (Overlapping)' }
      ]},
      { key: 'opacity', label: '填色不透明度', type: 'range', min: 25, max: 90, step: 5, value: 65, unit: '%' }
    ],
    purpose: [
      '<strong>同時呈現總量趨勢與子類別貢獻</strong>：堆疊面積圖能看出整體的消長，以及各子類別隨時間的擴張或萎縮。',
      '<strong>100% 結構演變</strong>：切換為百分比堆疊時，可清楚觀察各項目隨時間的市佔率此消彼長。'
    ],
    scenarios: [
      '<strong>訂閱與營收分析</strong>：新客營收、續訂營收、升級營收隨月份累加的總 ARR 變化。',
      '<strong>能源與資源結構</strong>：歷年再生能源、燃氣、燃煤發電量總和與佔比推移。',
      '<strong>流量來源演進</strong>：自然搜尋、社群、直接流量在過去一年的結構變化。'
    ],
    caveats: [
      '<strong>只有最底層與最頂層有水平基準線</strong>：堆疊面積圖中，中間層的起伏會受到下層波動的影響，若要精確比較中間各層的斜率，應改用折線圖或重疊模式。',
      '<strong>避免重疊遮擋</strong>：若使用不堆疊的重疊面積圖，務必將填色透明度設在 30%~50% 以下，否則大面積會蓋住小面積。',
      '<strong>將最穩定的序列放在最底層</strong>：減少上層序列因底層劇烈震盪而難以判讀。'
    ]
  },
  {
    id: 'scatter',
    number: 5,
    name: '散佈圖',
    enName: 'Scatter Plot',
    category: '關聯與多維度類',
    goalIds: ['corr', 'dist'],
    summary: '在二維平面投射成對連續變數，揭示正負相關性、非線性模式、分群與離群值。',
    controls: [
      { key: 'correlation', label: '相關係數強度 (r)', type: 'range', min: -90, max: 95, step: 5, value: 75, unit: '%' },
      { key: 'sampleCount', label: '樣本點數量 (N)', type: 'range', min: 15, max: 90, step: 5, value: 45, unit: '點' },
      { key: 'showTrend', label: '顯示線性迴歸趨勢線', type: 'checkbox', value: true },
      { key: 'showOutlier', label: '加入極端離群值 (Outliers)', type: 'checkbox', value: false }
    ],
    purpose: [
      '<strong>檢驗兩變數間的關係</strong>：直觀判斷兩連續變數為正相關、負相關、無相關或曲線關係。',
      '<strong>發掘自然分群与異常點</strong>：一眼識別偏離主群體的離群樣本 (Outliers) 或潛在聚落 (Clusters)。'
    ],
    scenarios: [
      '<strong>商業與定價分析</strong>：廣告投入金額 (X) 與帶來營收 (Y) 的邊際效益關係。',
      '<strong>人資與績效</strong>：員工年資 (X) 與薪資水準 (Y) 的分佈與離群點檢測。',
      '<strong>科學與醫療</strong>：藥物劑量與生理指標反應強度的相關性驗證。'
    ],
    caveats: [
      '<strong>相關不等於因果 (Correlation ≠ Causation)</strong>：兩變數高度相關可能受第三個潛在混淆變數 (Confounder) 驅動，解讀時切勿直接武斷推論因果。',
      '<strong>過度繪製 (Overplotting)</strong>：當資料點超過數百點時會嚴重重疊，應調降點的不透明度、縮小半徑，或改用密度分佈／六角格圖。',
      '<strong>留意離群值對迴歸線的拉扯</strong>：試著勾選上方「加入極端離群值」，觀察少數極端點如何扭曲整體迴歸斜率！'
    ]
  },
  {
    id: 'bubble',
    number: 6,
    name: '氣泡圖',
    enName: 'Bubble Chart',
    category: '關聯與多維度類',
    goalIds: ['corr', 'compare'],
    summary: '在散佈圖 (X, Y) 基礎上加入「氣泡面積（第3維）」與「顏色分類（第4維）」，適合四象限策略決策。',
    controls: [
      { key: 'sizeScale', label: '氣泡面積縮放倍率', type: 'range', min: 50, max: 160, step: 10, value: 100, unit: '%' },
      { key: 'showQuadrants', label: '顯示四象限平均分割線', type: 'checkbox', value: true },
      { key: 'showLabels', label: '顯示項目名稱標籤', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>單圖濃縮四維資訊</strong>：同時對照 X 軸指標、Y 軸指標、規模大小（面積）與類別（顏色）。',
      '<strong>策略矩陣與象限分析</strong>：搭配平均值或目標十字分割線，快速區分「高成長高毛利（明星區）」、「高規模低轉換（待優化區）」等策略象限。'
    ],
    scenarios: [
      '<strong>產品組合管理 (BCG 矩陣變體)</strong>：市佔率 (X) × 年增率 (Y) × 營收規模 (氣泡大小) × 產品線 (顏色)。',
      '<strong>全球經濟與人口統計</strong>：人均 GDP (X) × 平均壽命 (Y) × 總人口數 (氣泡大小) × 洲別 (顏色)。',
      '<strong>專案優先級評估</strong>：預期影響力 (X) × 實作可行性 (Y) × 所需預算 (氣泡大小)。'
    ],
    caveats: [
      '<strong>務必用「面積 (Area)」而非「半徑 (Radius)」編碼數值</strong>：若將數值直接對應到半徑，數值大 2 倍時面積會暴增為 4 倍，造成嚴重視覺誤導（正確做法為 $r \\propto \\sqrt{\\text{Value}}$）。',
      '<strong>氣泡不可包含負數或零</strong>：面積無法表達負值，若有負數請改用顏色冷暖或雙軸呈現。',
      '<strong>控制氣泡數量在 20 個以內</strong>：過多氣泡會互相遮擋，大氣泡應繪製在下層或使用半透明填色。'
    ]
  },
  {
    id: 'radar',
    number: 7,
    name: '雷達圖 / 蜘蛛網圖',
    enName: 'Radar / Spider Chart',
    category: '比較類',
    goalIds: ['compare'],
    summary: '將多個評估維度呈放射狀排列，適合對比少數個體的綜合能力輪廓、優勢與短板。',
    controls: [
      { key: 'axisCount', label: '評估維度數量 (軸數)', type: 'range', min: 5, max: 8, step: 1, value: 6, unit: '軸' },
      { key: 'compareSecond', label: '疊加第二個對照對象 (產品 B)', type: 'checkbox', value: true },
      { key: 'fillOpacity', label: '多邊形填色濃度', type: 'range', min: 10, max: 65, step: 5, value: 30, unit: '%' }
    ],
    purpose: [
      '<strong>多維度能力輪廓剖析</strong>：一眼看出某個體是「全能均衡型」還是「偏科特化型」，快速找出強項與短板。',
      '<strong>雙對象屬性交集比較</strong>：將兩個產品、候選人或方案疊加，清楚呈現彼此互補或領先的維度。'
    ],
    scenarios: [
      '<strong>產品競品評估</strong>：手機或 SaaS 軟體在效能、價格競爭力、易用性、續航、生態系、售後等維度評分。',
      '<strong>HR 人才職能盤點</strong>：候選人在技術力、溝通力、領導力、領域知識、執行力的雷達輪廓。',
      '<strong>運動與遊戲數值</strong>：球員或角色的速度、力量、防守、耐力、技巧綜合面板。'
    ],
    caveats: [
      '<strong>維度軸順序會改變多邊形面積</strong>：相鄰兩軸的高分會圍出較大三角形面積，因此不能單靠「圍出來的面積大小」判定總分高低。',
      '<strong>所有維度必須標準化至相同量尺（如 0~100 分）</strong>：且方向一致（愈往外圈代表愈好）。',
      '<strong>疊加對象不宜超過 2~3 個</strong>：超過 3 個多邊形重疊時會完全無法分辨邊界。'
    ]
  },
  {
    id: 'histogram',
    number: 8,
    name: '直方圖',
    enName: 'Histogram',
    category: '分佈類',
    goalIds: ['dist'],
    summary: '將連續型數據切分為相鄰數值區間 (Bins)，計算各區間落點頻次，揭示常態、偏態或雙峰分佈。',
    controls: [
      { key: 'binCount', label: '分箱區間數量 (Bins - 關鍵參數！)', type: 'range', min: 5, max: 25, step: 1, value: 12, unit: '箱' },
      { key: 'distType', label: '資料分佈型態模擬', type: 'select', value: 'normal', options: [
        { value: 'normal', label: '常態鐘形分佈 (Normal)' },
        { value: 'bimodal', label: '雙峰分佈 (Bimodal - 兩群體混合)' },
        { value: 'skewed', label: '右偏長尾分佈 (Right-Skewed - 如薪資/客單價)' }
      ]},
      { key: 'showMeanMedian', label: '顯示平均數 (Mean) 與中位數 (Median) 線', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>洞察整體分佈形狀</strong>：平均值往往會騙人！直方圖能揭露數據是否對稱、集中在何處、是否有長尾或隱藏著兩個不同子群體（雙峰）。',
      '<strong>比較平均數與中位數差距</strong>：在偏態分佈中，直觀看到平均數如何被極端長尾拉偏。'
    ],
    scenarios: [
      '<strong>用戶行為與電商</strong>：客單價分佈、用戶單次停留時長分佈、年齡層連續分佈。',
      '<strong>品管與製程工程</strong>：零件尺寸公差分佈、API 回應時間 (Latency) 分佈。',
      '<strong>教育與評量</strong>：全校考生成績分佈（檢查是否呈現常態或兩極化雙峰）。'
    ],
    caveats: [
      '<strong>直方圖 ≠ 柱狀圖</strong>：直方圖的橫軸是「連續數值區間」，柱與柱之間<strong>緊密相連無空隙</strong>；柱狀圖則是離散類別且有空隙。',
      '<strong>分箱數 (Bin Width) 決定你看到的真相</strong>：試著將上方「資料分佈型態」選為「雙峰分佈」，並把分箱數調到 5 箱——你會發現雙峰特徵完全消失！實務上建議多切換幾種 Bin 寬度檢驗。'
    ]
  },
  {
    id: 'boxplot',
    number: 9,
    name: '盒鬚圖 / 箱形圖',
    enName: 'Box Plot',
    category: '分佈類',
    goalIds: ['dist', 'compare'],
    summary: '以五數綜合（最小值、Q1、中位數、Q3、最大值）與離群點，並排比較多組數據的集中度與離散度。',
    controls: [
      { key: 'spread', label: '群組離散程度 (IQR 寬度)', type: 'range', min: 50, max: 160, step: 10, value: 100, unit: '%' },
      { key: 'showOutliers', label: '顯示超過 1.5×IQR 的極端離群點', type: 'checkbox', value: true },
      { key: 'showJitter', label: '疊加原始樣本散點 (Jitter Points)', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>五數統計精華一目了然</strong>：箱體代表中間 50% 數據的範圍（第 25 百分位 $Q_1$ 至第 75 百分位 $Q_3$，即四分位距 $IQR$），箱內橫線為中位數 ($Q_2$)。',
      '<strong>跨群組穩健比較</strong>：相比只畫平均數的長條圖，盒鬚圖能同時比較多個部門、實驗組與對照組的「中位數高低」、「穩定度（箱體長短）」與「異常值多寡」。'
    ],
    scenarios: [
      '<strong>A/B 測試與實驗分析</strong>：比較 4 種不同演算法或網頁版本的轉換時間與穩定度。',
      '<strong>薪酬結構分析</strong>：比較不同職等或工程職系的薪資分佈區間與極端高薪點。',
      '<strong>多機台良率監控</strong>：比較不同生產線的輸出穩定度，快速抓出變異過大的機台。'
    ],
    caveats: [
      '<strong>單純盒鬚圖會隱藏雙峰特徵</strong>：若數據是雙峰分佈，箱體看起來仍是一個普通方盒。解決方案是勾選上方的「疊加原始樣本散點 (Jitter Points)」或搭配小提琴圖！',
      '<strong>向非統計背景聽眾展示時需加註圖例</strong>：首次簡報時建議標註 $Q_1$、中位數、$Q_3$ 與 $1.5 \\times IQR$ 鬍鬚定義。'
    ]
  },
  {
    id: 'heatmap',
    number: 10,
    name: '熱力圖 / 矩陣圖',
    enName: 'Heatmap',
    category: '關聯與多維度類',
    goalIds: ['corr', 'trend', 'compare'],
    summary: '以二維網格搭配色彩深淺編碼數值強度，瞬間在龐大交叉矩陣中鎖定熱區與冷區。',
    controls: [
      { key: 'palette', label: '色階配色方案', type: 'select', value: 'sky', options: [
        { value: 'sky', label: '深海藍青漸層 (Sequential)' },
        { value: 'emerald', label: '翠綠能量漸層 (Viridis-like)' },
        { value: 'diverging', label: '藍白紅雙極對比 (Diverging - 適合正負差異)' }
      ]},
      { key: 'contrast', label: '熱區對比強化', type: 'range', min: 60, max: 150, step: 10, value: 100, unit: '%' },
      { key: 'showNumbers', label: '於格內顯示精確數值', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>高密度雙維度交叉檢視</strong>：當行列項目眾多（如 7 天 × 24 小時，或 10 個變數 × 10 個變數），折線圖或柱狀圖會徹底崩潰，熱力圖則能以顏色深淺瞬間呈現聚落。',
      '<strong>特徵相關係數矩陣</strong>：機器學習與統計分析中，檢視多變數兩兩之間的皮爾森相關係數 ($-1$ 到 $+1$)。'
    ],
    scenarios: [
      '<strong>營運時段與人力排班</strong>：一週七天 × 各時段的客服進線量、外送訂單熱區。',
      '<strong>產品留存率分析 (Cohort Analysis)</strong>：不同註冊月份用戶在後續第 1~12 個月的留存率矩陣。',
      '<strong>網站點擊與特徵相關矩陣</strong>：檢查模型特徵之間的共線性。'
    ],
    caveats: [
      '<strong>選對色階類型（單向 vs 雙極）</strong>：若數值只有 0 到正無窮（如訂單量），請用單向深淺漸層；若數值有「正負中心點（如 0% 成長率、相關係數 0）」，請切換為「藍白紅雙極對比色階」。',
      '<strong>避免彩虹色階 (Rainbow Jet)</strong>：傳統彩虹色階沒有自然的明度遞增感，且對色覺辨識不友善。',
      '<strong>格內文字反差</strong>：當開啟格內數值時，注意深底色配淺字、淺底色配深字以維持可讀性。'
    ]
  },
  {
    id: 'treemap',
    number: 11,
    name: '矩形樹狀圖',
    enName: 'Treemap',
    category: '佔比與結構類',
    goalIds: ['part', 'compare'],
    summary: '以嵌套矩形面積呈現「多層級（樹狀）結構」與龐大分類項目的佔比，空間利用率極高。',
    controls: [
      { key: 'gap', label: '區塊間距 (Padding)', type: 'range', min: 2, max: 10, step: 1, value: 4, unit: 'px' },
      { key: 'colorBy', label: '色彩編碼依據', type: 'select', value: 'category', options: [
        { value: 'category', label: '依主領域分類著色 (Category)' },
        { value: 'performance', label: '依漲跌表現著色 (紅綠冷暖 - 股市風)' }
      ]},
      { key: 'showPct', label: '顯示佔比百分比', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>突破圓餅圖的項目數量限制</strong>：當分類有 10~30 個甚至包含「大類 → 子類」兩層結構時，矩形樹狀圖能緊湊地把 100% 空間分割完畢。',
      '<strong>雙指標同時編碼（面積 + 顏色）</strong>：最經典用法是以「矩形面積」代表規模（如市值、預算），並以「顏色紅綠深淺」代表漲跌幅或達成率。'
    ],
    scenarios: [
      '<strong>金融股市版圖 (S&P 500 Map)</strong>：各產業板塊與個股市值大小（面積）× 當日漲跌幅（顏色）。',
      '<strong>政府預算與企業成本拆解</strong>：各部門與子專案的預算佔比與年增率。',
      '<strong>硬碟空間與雲端資源分析</strong>：快速找出哪個資料夾或檔案吃掉最多容量。'
    ],
    caveats: [
      '<strong>不適合包含負數或零作為面積</strong>：面積只能表達正數規模，負數變化率應交給「顏色」來表達。',
      '<strong>極小區塊文字截斷問題</strong>：佔比小於 2% 的細碎矩形放不下標籤，需搭配滑鼠懸停 (Tooltip) 顯示詳情。',
      '<strong>長寬比應接近正方形 (Squarified)</strong>：避免切出又細又長的長條，因為人眼對細長矩形與接近正方形的面積比較會有誤差。'
    ]
  },
  {
    id: 'funnel',
    number: 12,
    name: '漏斗圖',
    enName: 'Funnel Chart',
    category: '佔比與結構類',
    goalIds: ['part', 'compare'],
    summary: '專為「線性多階段流程」設計，直觀呈現從起點到終點的各階段留存率與流失瓶頸。',
    controls: [
      { key: 'step2Rate', label: '第二階段留存率 (瀏覽商品)', type: 'range', min: 30, max: 90, step: 5, value: 65, unit: '%' },
      { key: 'step3Rate', label: '第三階段留存率 (加入購物車)', type: 'range', min: 15, max: 70, step: 5, value: 35, unit: '%' },
      { key: 'step4Rate', label: '最終階段轉化率 (完成結帳)', type: 'range', min: 5, max: 45, step: 2, value: 16, unit: '%' },
      { key: 'showDropoff', label: '標註階段轉化率 (Conversion %)', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>定位流程流失瓶頸</strong>：一眼看出哪兩個階段之間縮水最嚴重，幫助團隊決定優先優化哪個環節。',
      '<strong>同時呈現絕對數量與相對轉化率</strong>：梯形寬度反映留存規模，階段間百分比反映環比轉化效率。'
    ],
    scenarios: [
      '<strong>電商購物漏斗 (AARRR)</strong>：進站曝光 → 瀏覽商品頁 → 加入購物車 → 進入結帳 → 完成付款。',
      '<strong>B2B 銷售管道 (Sales Pipeline)</strong>：潛在名單 (Leads) → 合格商機 (MQL) → 提案報價 → 簽約成交。',
      '<strong>招募流程</strong>：收到履歷 → 一面通過 → 技術面試 → 發出 Offer → 報到入職。'
    ],
    caveats: [
      '<strong>必須是嚴格的「順序子集流程」</strong>：下一階段人數必須小於或等於上一階段。若流程可跳過步驟或來回循環，請改用桑基圖 (Sankey Diagram)！',
      '<strong>以「寬度」而非「面積」對應數值時需標清數字</strong>：梯形斜邊有時會產生視覺面積錯覺，務必在旁標註明確人數與轉化百分比。'
    ]
  },
  {
    id: 'waterfall',
    number: 13,
    name: '瀑布圖 (增減橋接圖)',
    enName: 'Waterfall / Bridge Chart',
    category: '趨勢類',
    goalIds: ['trend', 'part', 'compare'],
    summary: '拆解「期初值如何經過一連串正負增減項目，最終變成期末總計」的結構橋樑。',
    controls: [
      { key: 'growthBoost', label: '正向營收貢獻倍率', type: 'range', min: 60, max: 160, step: 10, value: 110, unit: '%' },
      { key: 'costScale', label: '成本與費用扣除倍率', type: 'range', min: 60, max: 160, step: 10, value: 100, unit: '%' },
      { key: 'showConnectors', label: '顯示階梯連接虛線', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>視覺化加減法帳本</strong>：浮空的色塊代表中間的「正貢獻（綠色/藍色向上）」與「負扣除（紅/玫瑰色向下）」，落地到底部的柱體則代表期初、小計與期末總計。',
      '<strong>解釋變動原因 (Bridge Analysis)</strong>：回答「為什麼今年淨利比去年少了 200 萬？各自是哪幾個因素拉升或拖累？」'
    ],
    scenarios: [
      '<strong>財務損益表拆解 (P&L)</strong>：營業收入 − 銷貨成本 − 行銷費用 − 研發費用 + 業外收入 = 稅前淨利。',
      '<strong>SaaS 訂閱客戶數變動</strong>：月初用戶數 + 本月新增 + 喚醒回流 − 本月退訂 = 月底活躍用戶數。',
      '<strong>預算差異分析</strong>：年度原定預算 ± 各季度追加與削減 = 最終實際支出。'
    ],
    caveats: [
      '<strong>顏色語意必須絕對一致</strong>：務必清楚區分「總計柱（通常深灰或深藍落地）」、「正向增加（翠綠/天藍）」與「負向減少（珊瑚紅）」。',
      '<strong>務必畫出水平連接虛線</strong>：讓讀者能輕鬆追蹤前一柱的終點如何接續到下一柱的起點。'
    ]
  },
  {
    id: 'sankey',
    number: 14,
    name: '桑基圖 / 流向圖',
    enName: 'Sankey Diagram',
    category: '關聯與多維度類',
    goalIds: ['corr', 'part'],
    summary: '以「流帶寬度」按比例呈現資源、資金、能量或用戶在多節點網路間的分流與匯聚，遵循流量守恆。',
    controls: [
      { key: 'curvature', label: '流帶彎曲平滑度', type: 'range', min: 20, max: 80, step: 5, value: 50, unit: '%' },
      { key: 'flowShift', label: '核心業務流量權重調整', type: 'range', min: 60, max: 150, step: 10, value: 100, unit: '%' },
      { key: 'showFlowValues', label: '顯示節點流量數值', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>追蹤多對多的來龍去脈</strong>：當「多個來源」流向「多個中間處理站」再流向「多個去向」時，桑基圖能一眼看出最粗的主幹道與細微支流。',
      '<strong>流量守恆透明化</strong>：左進總和 = 右出總和，非常適合財報拆解（如各大科技巨頭季報的營收→毛利→淨利與支出桑基圖）。'
    ],
    scenarios: [
      '<strong>企業財報結構視覺化</strong>：各產品線營收匯總為總營收，再分流至研發成本、營業成本、稅金與純益。',
      '<strong>網站用戶行為路徑</strong>：從不同進站管道進入首頁、商品頁、部落格，最終分流至結帳或跳出。',
      '<strong>能源與碳排流向</strong>：發電廠各種能源輸入，經過傳輸損耗，最終流向工業、民生與交通部門。'
    ],
    caveats: [
      '<strong>節點層級與分支不宜過碎</strong>：若每個節點都切出十幾條細如髮絲的連線，畫面會變成糾結的毛線球；應將小於 2% 的流量合併為「其他」。',
      '<strong>避免逆向迴圈 (Cycles)</strong>：標準桑基圖應保持由左至右單向流動，若有迴圈會大幅降低易讀性。'
    ]
  },
  {
    id: 'bullet',
    number: 15,
    name: '子彈圖 / 目標達成圖',
    enName: 'Bullet Chart',
    category: '比較類',
    goalIds: ['compare', 'part'],
    summary: '由資訊設計大師 Stephen Few 設計，用來取代佔空間的傳統圓形儀表板，在極小空間內同時呈現「實際表現、目標線與好壞區間」。',
    controls: [
      { key: 'targetLevel', label: '年度目標基準線位置', type: 'range', min: 60, max: 95, step: 5, value: 80, unit: '%' },
      { key: 'actualBoost', label: '實際業績達成調整', type: 'range', min: 50, max: 125, step: 5, value: 95, unit: '%' },
      { key: 'showZones', label: '顯示背景品質區間 (待加強/良好/優秀)', type: 'checkbox', value: true }
    ],
    purpose: [
      '<strong>高密度 KPI 目標對照</strong>：中心實心長條代表「實際達成值」，垂直亮色短橫線代表「目標值 (Target)」，背景三段深淺色塊代表「不及格／尚可／優秀」的品質區間。',
      '<strong>完美取代低效率的扇形碼表 (Gauge)</strong>：傳統圓形時速表佔用大量空間卻只能顯示一個數字；子彈圖可以一次並排比較 5~10 個部門的目標達成狀況。'
    ],
    scenarios: [
      '<strong>高階主管戰情室 (Executive Dashboard)</strong>：營收達成率、毛利率、NPS 淨推薦值、客戶留存率並排追蹤。',
      '<strong>OKR / KPI 季度檢核</strong>：各團隊當前進度相較於季度目標線（Target）與挑戰目標（Stretch Goal）的位置。',
      '<strong>伺服器與配額監控</strong>：各叢集當前負載相較於安全區、警戒區與危險閾值。'
    ],
    caveats: [
      '<strong>背景區間建議使用同色系的明度深淺</strong>：避免把背景塗成刺眼的紅黃綠大色塊而搶走中心「實際表現柱」與「目標線」的視覺焦點。',
      '<strong>清楚標註目標線圖例</strong>：確保讀者知道垂直短線代表「目標值 (Target)」而非最大值。'
    ]
  }
];

const state = {
  role: "customer",
  filters: { company: "", agency: "", search: "", status: "active", category: "" },
  voucherCount: 3,
  permissions: {
    proposal: { label: "企劃書內容", note: "撰寫、改寫與儲存企劃書", customer: { read: true, edit: true, approve: false }, admin: { read: true, edit: true, approve: true } },
    budget: { label: "本案經費設定", note: "總經費、補助款、自籌款與科目上限", customer: { read: true, edit: false, approve: false }, admin: { read: true, edit: true, approve: true } },
    sustainability: { label: "SDGs / ESG 規則", note: "永續目標、ESG 面向與 KPI", customer: { read: true, edit: false, approve: false }, admin: { read: true, edit: true, approve: true } },
    closeout: { label: "結案附件", note: "憑證、照片與結案報告", customer: { read: true, edit: true, approve: false }, admin: { read: true, edit: true, approve: true } },
    review: { label: "文件審核狀態", note: "草稿、審核中、已完成、退回、封存", customer: { read: true, edit: false, approve: false }, admin: { read: true, edit: true, approve: true } },
    templates: { label: "範本與系統規則", note: "企劃書範本、結案範本與分析規則", customer: { read: true, edit: false, approve: false }, admin: { read: true, edit: true, approve: true } }
  },
  documents: [
    { title: "市場拓展計畫書", owner: "遠景顧問股份有限公司", agency: "經濟部", category: "商業企劃", updated: "2026-06-01", status: "審核中", statusClass: "review" },
    { title: "政府補助申請企劃", owner: "城市創新基金會", agency: "文化部", category: "政府補助", updated: "2026-05-29", status: "已完成", statusClass: "done" },
    { title: "品牌年度行銷方案", owner: "青創科技", agency: "數位發展部", category: "行銷方案", updated: "2026-05-26", status: "草稿", statusClass: "draft" },
    { title: "地方創生提案書", owner: "城市創新基金會", agency: "經濟部", category: "政府補助", updated: "2026-05-20", status: "審核中", statusClass: "review" },
    { title: "智慧服務導入計畫", owner: "遠景顧問股份有限公司", agency: "數位發展部", category: "企業內部專案", updated: "2026-05-18", status: "草稿", statusClass: "draft" },
    { title: "2024 市場拓展結案資料", owner: "遠景顧問股份有限公司", agency: "經濟部", category: "商業企劃", updated: "2025-01-18", status: "封存", statusClass: "archived" }
  ],
  vouchers: [
    { project: "經濟部｜市場拓展計畫書", name: "活動場地租借發票.pdf", type: "發票", amount: "NT$ 32,000", status: "已分類" },
    { project: "經濟部｜市場拓展計畫書", name: "成果手冊印刷收據.jpg", type: "收據", amount: "NT$ 18,500", status: "待確認" },
    { project: "文化部｜政府補助申請企劃", name: "活動紀錄成果冊.pdf", type: "成果附件", amount: "-", status: "已分類" }
  ],
  photos: [
    { project: "經濟部｜市場拓展計畫書", name: "成果發表現場_01.jpg", stage: "活動紀錄", note: "成果發表會與合作單位交流紀錄" },
    { project: "經濟部｜市場拓展計畫書", name: "展示攤位完成照_02.jpg", stage: "成果完成", note: "市場拓展展示素材與攤位完工照片" },
    { project: "文化部｜政府補助申請企劃", name: "工作坊執行中_01.jpg", stage: "執行中", note: "文化推廣工作坊民眾參與紀錄" }
  ],
  exports: [
    { name: "市場拓展計畫書_分析報告.pdf", type: "PDF", time: "今天 10:30" },
    { name: "政府補助申請企劃_簡報.pptx", type: "PPTX", time: "昨天 16:45" },
    { name: "品牌年度行銷方案_新版.docx", type: "DOCX", time: "2026-05-30" }
  ]
};

const $ = (selector) => document.querySelector(selector);

const loginView = $("#loginView");
const dashboardView = $("#dashboardView");
const loginForm = $("#loginForm");
const roleLabel = $("#roleLabel");
const toast = $("#toast");
const draftOutput = $("#draftOutput");
const companyFilter = $("#companyFilter");
const agencyFilter = $("#agencyFilter");
const compareSummary = $("#compareSummary");
const docSearch = $("#docSearch");
const docStatusFilter = $("#docStatusFilter");
const docCategoryFilter = $("#docCategoryFilter");
const librarySummary = $("#librarySummary");
const permissionList = $("#permissionList");
const voucherList = $("#voucherList");
const photoList = $("#photoList");
const closeoutReport = $("#closeoutReport");
const closeoutStatus = $("#closeoutStatus");
const closeoutProject = $("#closeoutProject");
const voucherProject = $("#voucherProject");
const voucherType = $("#voucherType");
const photoProject = $("#photoProject");
const photoStage = $("#photoStage");
const matchedTemplate = $("#matchedTemplate");
const matchedTemplateDesc = $("#matchedTemplateDesc");
const planSelect = $("#planSelect");
const referenceYear = $("#referenceYear");
const targetYear = $("#targetYear");
const planTemplateName = $("#planTemplateName");
const planTemplatePath = $("#planTemplatePath");
const planTemplateRule = $("#planTemplateRule");
const referenceTitle = $("#referenceTitle");
const referencePoints = $("#referencePoints");
const budgetTotal = $("#budgetTotal");
const budgetGrant = $("#budgetGrant");
const budgetSelf = $("#budgetSelf");
const budgetItems = $("#budgetItems");
const budgetSummary = $("#budgetSummary");
const budgetStatus = $("#budgetStatus");
const enableSustainability = $("#enableSustainability");
const sdgGoals = $("#sdgGoals");
const sustainabilityStatus = $("#sustainabilityStatus");
const sustainabilityImpact = $("#sustainabilityImpact");
const sustainabilityKpi = $("#sustainabilityKpi");

const closeoutTemplateMap = {
  "經濟部｜市場拓展計畫書": { name: "經濟部補助案結案報告範本", required: "發票、付款證明、成果照片、支出明細" },
  "文化部｜政府補助申請企劃": { name: "文化部成果結案報告範本", required: "收據、活動紀錄、成果冊、授權文件" },
  "數位發展部｜智慧服務導入計畫": { name: "數位服務導入結案範本", required: "發票、驗收紀錄、系統截圖、維運說明" }
};

const proposalTemplateMap = {
  "市場拓展計畫": {
    templateName: "市場拓展年度企劃範本",
    path: "/templates/proposal/market-expansion/annual-plan.docx",
    sections: "計畫背景、前年度成果、年度目標、執行策略、預算、KPI、風險控管",
    references: {
      "2025": ["延續 2025 年通路開發成果，強化重點市場轉換率。", "保留既有客群分析架構，新增年度 KPI 與預算配置。", "修正去年審查意見：補強量化效益與風險因應。"],
      "2024": ["延續 2024 年市場調查架構，將試辦成果轉為正式推廣策略。", "保留競品分析與通路盤點資料，更新年度銷售目標。", "新增補助審查常見問題回應。"],
      "2023": ["沿用 2023 年初版市場定位，補上後續成果佐證。", "延伸既有品牌溝通主軸，調整為年度推廣版本。", "加強預算與效益之間的對應說明。"]
    }
  },
  "政府補助申請企劃": {
    templateName: "政府補助案申請範本",
    path: "/templates/proposal/government-grant/application-standard.docx",
    sections: "計畫緣起、政策連結、執行方法、工作項目、經費表、預期效益、永續規劃",
    references: {
      "2025": ["延續 2025 年政策對應架構，補強公共效益與量化指標。", "保留審查委員建議回覆，調整成果驗證方式。", "新增跨單位合作與後續維運規劃。"],
      "2024": ["延續 2024 年補助申請格式，更新政策重點與服務對象。", "將試辦成果轉為正式推動計畫。", "補上支出合理性與附件佐證。"],
      "2023": ["沿用 2023 年問題定義與需求分析，更新執行策略。", "保留既有利害關係人分析。", "新增年度工作期程與風險控管。"]
    }
  },
  "智慧服務導入計畫": {
    templateName: "數位服務導入企劃範本",
    path: "/templates/proposal/digital-service/implementation-plan.docx",
    sections: "現況分析、系統需求、導入範圍、建置時程、驗收標準、維運計畫、資訊安全",
    references: {
      "2025": ["延續 2025 年系統導入成果，加入第二階段功能擴充。", "保留使用者回饋與操作流程優化方向。", "補強資安、維運與驗收標準。"],
      "2024": ["延續 2024 年需求盤點結果，調整導入優先順序。", "保留系統架構說明，更新成本與維護規劃。", "新增教育訓練與上線支援。"],
      "2023": ["沿用 2023 年數位轉型目標，補上導入效益。", "延伸既有流程改善建議。", "新增資料治理與權限控管章節。"]
    }
  }
};

const budgetSettings = {
  "市場拓展計畫": {
    total: 1200000,
    grant: 800000,
    self: 400000,
    items: [
      { name: "人事費", limit: 280000 },
      { name: "行銷推廣費", limit: 320000 },
      { name: "場地費", limit: 120000 },
      { name: "印刷製作費", limit: 90000 },
      { name: "委外服務費", limit: 260000 },
      { name: "行政雜支", limit: 50000 }
    ]
  },
  "政府補助申請企劃": {
    total: 850000,
    grant: 600000,
    self: 250000,
    items: [
      { name: "講師費", limit: 160000 },
      { name: "活動執行費", limit: 220000 },
      { name: "場地設備費", limit: 130000 },
      { name: "宣傳費", limit: 90000 },
      { name: "成果製作費", limit: 150000 },
      { name: "行政管理費", limit: 60000 }
    ]
  },
  "智慧服務導入計畫": {
    total: 2000000,
    grant: 1500000,
    self: 500000,
    items: [
      { name: "系統建置費", limit: 820000 },
      { name: "顧問服務費", limit: 360000 },
      { name: "教育訓練費", limit: 160000 },
      { name: "資安檢測費", limit: 180000 },
      { name: "維運服務費", limit: 280000 },
      { name: "專案管理費", limit: 120000 }
    ]
  }
};

const sdgLabels = [
  "SDG 1 消除貧窮", "SDG 2 消除飢餓", "SDG 3 健康福祉", "SDG 4 優質教育", "SDG 5 性別平權",
  "SDG 6 淨水衛生", "SDG 7 可負擔能源", "SDG 8 就業與經濟成長", "SDG 9 產業創新", "SDG 10 減少不平等",
  "SDG 11 永續城市", "SDG 12 責任消費生產", "SDG 13 氣候行動", "SDG 14 海洋生態", "SDG 15 陸域生態",
  "SDG 16 和平正義制度", "SDG 17 夥伴關係"
];

const sustainabilitySettings = {
  "市場拓展計畫": {
    sdgs: ["SDG 8 就業與經濟成長", "SDG 9 產業創新", "SDG 12 責任消費生產", "SDG 17 夥伴關係"],
    esg: ["S 社會", "G 治理"],
    impact: "促進在地產業合作與市場機會，建立透明成果揭露與夥伴協作機制。",
    kpi: "合作單位數、商機媒合件數、公開成果次數、參與企業滿意度。"
  },
  "政府補助申請企劃": {
    sdgs: ["SDG 4 優質教育", "SDG 8 就業與經濟成長", "SDG 10 減少不平等", "SDG 11 永續城市", "SDG 17 夥伴關係"],
    esg: ["S 社會", "G 治理"],
    impact: "提升公共參與、知識推廣與資源可近性，強化補助成果揭露。",
    kpi: "參與人次、弱勢或地方觸及數、活動場次、成果公開次數。"
  },
  "智慧服務導入計畫": {
    sdgs: ["SDG 9 產業創新", "SDG 11 永續城市", "SDG 12 責任消費生產", "SDG 16 和平正義制度"],
    esg: ["E 環境", "G 治理"],
    impact: "透過數位化降低紙本與重複作業，提升流程透明度、資料治理與服務效率。",
    kpi: "紙本減量、流程節省時數、系統使用率、資安檢核完成率。"
  }
};

const baseDraft = `一、計畫背景
本計畫延續既有執行成果，依據新年度政策方向、市場需求與內部資源配置，提出可執行且可衡量的年度企劃。

二、計畫目標
1. 延續前年度成果並轉化為新年度執行策略。
2. 補強審查意見中提及的量化效益、預算合理性與風險控管。
3. 依指定範本完成制式章節與附件內容。

三、執行項目
- 前年度成果盤點
- 新年度策略規劃
- 預算與時程安排
- KPI 與預期效益設定

四、預期效益
透過年度銜接與制式範本管理，降低重複撰寫成本，並讓新企劃書在邏輯、格式與審查資料上保持一致。`;

const closeoutDraft = `結案報告書

一、案件基本資料
案件名稱：經濟部｜市場拓展計畫書
執行期間：2026-01-01 至 2026-06-30
執行單位：遠景顧問股份有限公司

二、計畫執行成果
本案已完成市場資料蒐集、提案內容優化、推廣素材製作與成果彙整。執行期間依核定計畫推動各項工作，並完成對應成果文件與佐證資料歸檔。

三、經費與憑證整理
目前已上傳場地租借發票、印刷收據與相關付款證明。系統已依發票、收據、付款證明及成果附件進行初步分類，後續可由管理者進行審核確認。

四、照片紀錄
系統已彙整本案成果照片，包含執行中、活動紀錄與成果完成等階段，可作為結案報告附件與成果佐證。

五、效益說明
本案協助提升提案資料完整度，縮短文件彙整與簡報製作時間，並建立可追蹤的結案資料流程。

六、附件清單
1. 發票與收據憑證
2. 成果照片與活動紀錄
3. 支出明細表
4. 計畫成果摘要`;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function getFilteredDocuments() {
  return state.documents.filter((doc) => {
    const matchesCompany = !state.filters.company || doc.owner === state.filters.company;
    const matchesAgency = !state.filters.agency || doc.agency === state.filters.agency;
    const matchesCategory = !state.filters.category || doc.category === state.filters.category;
    const query = state.filters.search.trim().toLowerCase();
    const searchable = `${doc.title} ${doc.owner} ${doc.agency} ${doc.category} ${doc.status}`.toLowerCase();
    const matchesSearch = !query || searchable.includes(query);
    const activeStatuses = ["草稿", "審核中", "退回修改"];
    const matchesStatus =
      !state.filters.status ||
      (state.filters.status === "active" ? activeStatuses.includes(doc.status) : doc.status === state.filters.status);
    return matchesCompany && matchesAgency && matchesCategory && matchesSearch && matchesStatus;
  });
}

function getActiveDocuments() {
  return state.documents.filter((doc) => ["草稿", "審核中", "退回修改"].includes(doc.status));
}

function updateCompareSummary(count) {
  const company = state.filters.company || "全部公司";
  const agency = state.filters.agency || "全部部會";
  compareSummary.textContent = `${company} × ${agency}：${count} 份文件`;
}

function renderDocuments(targetId, limit, useFilters = false) {
  const target = $(`#${targetId}`);
  const sourceDocs = useFilters ? getFilteredDocuments() : getActiveDocuments();
  const docs = typeof limit === "number" ? sourceDocs.slice(0, limit) : sourceDocs;

  if (!docs.length) {
    target.innerHTML = `<article class="doc-row"><div><strong>沒有符合條件的文件</strong><div class="meta">請調整搜尋、狀態、分類、公司或公家部會條件後重新篩選。</div></div></article>`;
    updateCompareSummary(0);
    updateLibrarySummary(0);
    return;
  }

  target.innerHTML = docs.map((doc) => `
    <article class="doc-row">
      <div>
        <strong>${doc.title}</strong>
        <div class="meta">${doc.owner} · ${doc.agency} · ${doc.category} · 更新 ${doc.updated}</div>
      </div>
      <span class="status ${doc.statusClass}">${doc.status}</span>
    </article>
  `).join("");

  if (useFilters) {
    updateCompareSummary(sourceDocs.length);
    updateLibrarySummary(sourceDocs.length);
  }
}

function updateLibrarySummary(count) {
  if (!librarySummary) return;
  const statusLabel = docStatusFilter.value === "active" ? "待處理" : (docStatusFilter.value || "全部狀態");
  const categoryLabel = docCategoryFilter.value || "全部分類";
  const query = docSearch.value.trim() ? `，搜尋「${docSearch.value.trim()}」` : "";
  librarySummary.textContent = `${statusLabel} × ${categoryLabel}${query}：${count} 份文件`;
}

function statusClassFor(status) {
  if (status === "已完成") return "done";
  if (status === "草稿") return "draft";
  if (status === "封存") return "archived";
  return "review";
}

function renderReviewList() {
  const reviewList = $("#reviewList");
  reviewList.innerHTML = state.documents.map((doc, index) => `
    <article class="review-row">
      <div>
        <strong>${doc.title}</strong>
        <div class="meta">${doc.owner} · ${doc.agency} · ${doc.category} · 更新 ${doc.updated}</div>
      </div>
      <label>
        文件狀態
        <select class="review-status" data-index="${index}">
          <option ${doc.status === "草稿" ? "selected" : ""}>草稿</option>
          <option ${doc.status === "審核中" ? "selected" : ""}>審核中</option>
          <option ${doc.status === "已完成" ? "selected" : ""}>已完成</option>
          <option ${doc.status === "退回修改" ? "selected" : ""}>退回修改</option>
          <option ${doc.status === "封存" ? "selected" : ""}>封存</option>
        </select>
      </label>
    </article>
  `).join("");

  reviewList.querySelectorAll(".review-status").forEach((select) => {
    select.addEventListener("change", () => {
      const doc = state.documents[Number(select.dataset.index)];
      doc.status = select.value;
      doc.statusClass = statusClassFor(select.value);
      renderDocuments("recentDocs", 3);
      renderDocuments("docLibrary", undefined, true);
      renderReviewList();
      showToast(`已更新「${doc.title}」狀態`);
    });
  });
  applyPermissions();
}

function renderPermissionList() {
  permissionList.innerHTML = `
    <div class="permission-row header">
      <div>功能模組</div>
      <div>客戶讀取</div>
      <div>客戶編輯</div>
      <div>客戶審核</div>
      <div>管理讀取</div>
      <div>管理編輯</div>
      <div>管理審核</div>
    </div>
    ${Object.entries(state.permissions).map(([key, item]) => `
      <article class="permission-row">
        <div><strong>${item.label}</strong><small>${item.note}</small></div>
        ${["customer", "admin"].flatMap((role) => ["read", "edit", "approve"].map((action) => `
          <label class="permission-check" title="${role}-${action}">
            <input type="checkbox" data-module="${key}" data-role="${role}" data-action="${action}" ${item[role][action] ? "checked" : ""} />
          </label>
        `)).join("")}
      </article>
    `).join("")}
  `;

  permissionList.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      const item = state.permissions[input.dataset.module];
      item[input.dataset.role][input.dataset.action] = input.checked;
    });
  });
}

function renderExports() {
  $("#exportList").innerHTML = state.exports.map((item) => `
    <article class="export-row">
      <div><strong>${item.name}</strong><div class="meta">${item.type} · ${item.time}</div></div>
      <button class="secondary-btn" data-action="download">下載</button>
    </article>
  `).join("");
}

function renderSlides() {
  const slides = [
    ["01", "封面", "計畫名稱、提案單位、日期"],
    ["02", "背景與需求", "說明現況痛點與目標族群"],
    ["03", "解決方案", "平台功能、導入方式與使用情境"],
    ["04", "執行時程", "里程碑、工作項目與負責角色"],
    ["05", "預算規劃", "建置、人力、維運與 AI 成本"],
    ["06", "預期效益", "效率提升、品質控管與管理報表"]
  ];

  $("#slidesGrid").innerHTML = slides.map(([number, title, text]) => `
    <article class="slide-card"><span>${number}</span><strong>${title}</strong><p class="meta">${text}</p></article>
  `).join("");
}

function renderVouchers() {
  const currentProject = closeoutProject.value;
  const projectVouchers = state.vouchers.filter((item) => item.project === currentProject);

  if (!projectVouchers.length) {
    voucherList.innerHTML = `<article class="voucher-row"><div><strong>此案件尚未匯入憑證</strong><div class="meta">請先選擇案件與憑證類型，再新增憑證。</div></div></article>`;
    return;
  }

  voucherList.innerHTML = projectVouchers.map((item) => `
    <article class="voucher-row">
      <div>
        <strong>${item.name}</strong>
        <div class="meta">${item.project} · ${item.type} · ${item.amount}</div>
      </div>
      <span class="status ${item.status === "已分類" ? "done" : "review"}">${item.status}</span>
    </article>
  `).join("");
}

function renderPhotos() {
  const currentProject = closeoutProject.value;
  const projectPhotos = state.photos.filter((item) => item.project === currentProject);

  if (!projectPhotos.length) {
    photoList.innerHTML = `<article class="photo-row"><div class="photo-thumb">PHOTO</div><div><strong>此案件尚未匯入照片</strong><div class="meta">請先選擇案件與照片階段，再新增照片。</div></div></article>`;
    return;
  }

  photoList.innerHTML = projectPhotos.map((item, index) => `
    <article class="photo-row">
      <div class="photo-thumb">照片 ${index + 1}</div>
      <div>
        <strong>${item.name}</strong>
        <div class="meta">${item.project} · ${item.stage} · ${item.note}</div>
      </div>
      <span class="status done">已歸檔</span>
    </article>
  `).join("");
}

function updateCloseoutReadyState() {
  const currentCount = state.vouchers.filter((item) => item.project === closeoutProject.value).length;
  const photoCount = state.photos.filter((item) => item.project === closeoutProject.value).length;
  const ready = currentCount >= 3 && photoCount >= 2;
  closeoutStatus.textContent = ready ? "可生成報告" : "附件整理中";
  closeoutStatus.className = ready ? "status done" : "status review";
}

function updateCloseoutTemplateMatch() {
  const template = closeoutTemplateMap[closeoutProject.value];
  matchedTemplate.textContent = template.name;
  matchedTemplateDesc.textContent = `必要附件：${template.required}。系統會依此範本安排章節、附件清單與編排格式。`;
  voucherProject.value = closeoutProject.value;
  photoProject.value = closeoutProject.value;
  renderVouchers();
  renderPhotos();
  updateCloseoutReadyState();
}

function updateProposalReference() {
  const plan = proposalTemplateMap[planSelect.value];
  const year = referenceYear.value;
  const points = plan.references[year];
  planTemplateName.textContent = plan.templateName;
  planTemplatePath.textContent = plan.path;
  planTemplateRule.textContent = `制式章節：${plan.sections}。`;
  referenceTitle.textContent = `${year} ${planSelect.value}`;
  referencePoints.innerHTML = points.map((point) => `<li>${point}</li>`).join("");
  loadBudgetSettings();
  loadSustainabilitySettings();
}

function renderSdgOptions(selected = []) {
  sdgGoals.innerHTML = sdgLabels.map((label) => `
    <label><input type="checkbox" class="sdgOption" value="${label}" ${selected.includes(label) ? "checked" : ""} /> ${label}</label>
  `).join("");
}

function loadSustainabilitySettings() {
  const config = sustainabilitySettings[planSelect.value];
  renderSdgOptions(config.sdgs);
  document.querySelectorAll(".esgOption").forEach((input) => {
    input.checked = config.esg.includes(input.value);
  });
  sustainabilityImpact.value = config.impact;
  sustainabilityKpi.value = config.kpi;
  updateSustainabilityStatus();
}

function getSustainabilitySettings() {
  return {
    enabled: enableSustainability.checked,
    sdgs: [...document.querySelectorAll(".sdgOption:checked")].map((input) => input.value),
    esg: [...document.querySelectorAll(".esgOption:checked")].map((input) => input.value),
    impact: sustainabilityImpact.value.trim(),
    kpi: sustainabilityKpi.value.trim()
  };
}

function updateSustainabilityStatus() {
  const config = getSustainabilitySettings();
  const ready = config.enabled && config.sdgs.length > 0 && config.esg.length > 0;
  sustainabilityStatus.textContent = ready ? "已啟用" : "未完整";
  sustainabilityStatus.className = ready ? "status done" : "status review";
}

function formatMoney(value) {
  return `NT$ ${Number(value).toLocaleString("zh-TW")}`;
}

function getCurrentBudgetFromFields() {
  return {
    total: Number(budgetTotal.value || 0),
    grant: Number(budgetGrant.value || 0),
    self: Number(budgetSelf.value || 0),
    items: [...budgetItems.querySelectorAll("input")].map((input) => ({
      name: input.dataset.name,
      limit: Number(input.value || 0)
    }))
  };
}

function updateBudgetSummary() {
  const budget = getCurrentBudgetFromFields();
  const itemTotal = budget.items.reduce((sum, item) => sum + item.limit, 0);
  const sourceTotal = budget.grant + budget.self;
  const isValid = itemTotal <= budget.total && sourceTotal === budget.total;
  budgetStatus.textContent = isValid ? "符合上限" : "需調整";
  budgetStatus.className = isValid ? "status done" : "status review";
  budgetSummary.textContent = `目前科目合計 ${formatMoney(itemTotal)}，總經費上限 ${formatMoney(budget.total)}；補助款與自籌款合計 ${formatMoney(sourceTotal)}。`;
}

function loadBudgetSettings() {
  const budget = budgetSettings[planSelect.value];
  budgetTotal.value = budget.total;
  budgetGrant.value = budget.grant;
  budgetSelf.value = budget.self;
  budgetItems.innerHTML = budget.items.map((item) => `
    <label>${item.name}<input type="number" value="${item.limit}" data-name="${item.name}" /></label>
  `).join("");
  budgetItems.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", updateBudgetSummary);
  });
  updateBudgetSummary();
}

function switchView(viewId) {
  if (viewId === "admin" && state.role !== "admin") {
    showToast("此頁面需要管理者權限");
    viewId = "overview";
  }
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  $(`#${viewId}`).classList.add("active");
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.view === viewId);
  });
}

function applyPermissions() {
  const isAdmin = state.role === "admin";
  const currentRole = isAdmin ? "admin" : "customer";
  document.querySelectorAll(".admin-only").forEach((item) => {
    item.style.display = isAdmin ? "block" : "none";
  });

  const budgetEditable = state.permissions.budget[currentRole].edit;
  const sustainabilityEditable = state.permissions.sustainability[currentRole].edit;
  const reviewEditable = state.permissions.review[currentRole].edit || state.permissions.review[currentRole].approve;
  const templateEditable = state.permissions.templates[currentRole].edit;

  document.querySelectorAll(".admin-managed").forEach((section) => {
    const isBudget = section.classList.contains("budget-card");
    const isSustainability = section.classList.contains("sustainability-card");
    const editable = (isBudget && budgetEditable) || (isSustainability && sustainabilityEditable);
    section.classList.toggle("is-readonly", !editable);
    if (!section.querySelector(".readonly-note")) {
      const note = document.createElement("div");
      note.className = "readonly-note";
      note.textContent = "此區目前依權限設定為唯讀。";
      section.prepend(note);
    }
    section.querySelectorAll("input, select, textarea, button").forEach((control) => {
      const allowedForCustomer = ["generatePlanBtn", "rewriteBtn"].includes(control.id);
      control.disabled = !editable && !allowedForCustomer;
    });
  });

  document.querySelectorAll(".review-status").forEach((select) => {
    select.disabled = !reviewEditable;
  });

  ["#saveTemplateBtn", "#saveSustainabilityBtn"].forEach((selector) => {
    const button = $(selector);
    if (button) button.disabled = !templateEditable;
  });
}

function applyCrossFilter() {
  state.filters.company = companyFilter.value;
  state.filters.agency = agencyFilter.value;
  renderDocuments("docLibrary", undefined, true);
  switchView("documents");
  showToast("已依公司與公家部會交叉比對");
}

function applyLibraryFilters() {
  state.filters.search = docSearch.value;
  state.filters.status = docStatusFilter.value;
  state.filters.category = docCategoryFilter.value;
  renderDocuments("docLibrary", undefined, true);
}

document.querySelectorAll(".role-btn").forEach((button) => {
  button.addEventListener("click", () => {
    state.role = button.dataset.role;
    document.querySelectorAll(".role-btn").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    $("#email").value = state.role === "admin" ? "admin@example.com" : "client@example.com";
  });
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  roleLabel.textContent = state.role === "admin" ? "管理者模式" : "客戶模式";
  applyPermissions();
  switchView("overview");
  showToast("登入成功");
});

$("#logoutBtn").addEventListener("click", () => {
  dashboardView.classList.add("hidden");
  loginView.classList.remove("hidden");
  showToast("已登出");
});

document.querySelectorAll(".nav-link").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

$("#compareBtn").addEventListener("click", applyCrossFilter);
$("#clearCompareBtn").addEventListener("click", () => {
  companyFilter.value = "";
  agencyFilter.value = "";
  state.filters.company = "";
  state.filters.agency = "";
  renderDocuments("docLibrary", undefined, true);
  showToast("已清除交叉比對條件");
});

docSearch.addEventListener("input", () => {
  if (docSearch.value.trim() && docStatusFilter.value === "active") {
    docStatusFilter.value = "";
  }
  applyLibraryFilters();
});
docStatusFilter.addEventListener("change", applyLibraryFilters);
docCategoryFilter.addEventListener("change", applyLibraryFilters);

$("#addVoucherBtn").addEventListener("click", () => {
  state.voucherCount += 1;
  const selectedProject = voucherProject.value;
  const selectedType = voucherType.value;
  state.vouchers.push({
    project: selectedProject,
    name: `${selectedType}_${state.voucherCount}.pdf`,
    type: selectedType,
    amount: "NT$ 12,800",
    status: "已分類"
  });
  closeoutProject.value = selectedProject;
  updateCloseoutTemplateMatch();
  showToast("已依案件歸屬新增憑證");
});

$("#addPhotoBtn").addEventListener("click", () => {
  const selectedProject = photoProject.value;
  const selectedStage = photoStage.value;
  const photoNumber = state.photos.filter((item) => item.project === selectedProject).length + 1;
  state.photos.push({
    project: selectedProject,
    name: `${selectedStage}_成果照片_${photoNumber}.jpg`,
    stage: selectedStage,
    note: "原型示範照片，正式系統可填寫拍攝日期、地點與說明"
  });
  closeoutProject.value = selectedProject;
  updateCloseoutTemplateMatch();
  showToast("已依案件歸屬新增成果照片");
});

$("#generateCloseoutBtn").addEventListener("click", () => {
  const template = closeoutTemplateMap[closeoutProject.value];
  const sustainability = getSustainabilitySettings();
  const photoLines = state.photos
    .filter((item) => item.project === closeoutProject.value)
    .map((item, index) => `${index + 1}. ${item.name}｜${item.stage}｜${item.note}`)
    .join("\n") || "尚未上傳照片紀錄。";
  closeoutReport.value = closeoutDraft
    .replace("經濟部｜市場拓展計畫書", closeoutProject.value)
    .replace("一、案件基本資料", `套用範本：${template.name}\n必要附件：${template.required}、成果照片\n\n一、案件基本資料`)
    .replace("系統已彙整本案成果照片，包含執行中、活動紀錄與成果完成等階段，可作為結案報告附件與成果佐證。", `系統已彙整本案成果照片，包含執行中、活動紀錄與成果完成等階段，可作為結案報告附件與成果佐證。\n\n照片清單：\n${photoLines}`)
    .replace("五、效益說明", `五、SDGs / ESG 成果回報\n對應 SDGs：${sustainability.sdgs.join("、") || "未設定"}\nESG 面向：${sustainability.esg.join("、") || "未設定"}\n成果摘要：${sustainability.impact || "未設定"}\n成果指標：${sustainability.kpi || "未設定"}\n\n六、效益說明`)
    .replace("六、附件清單", "七、附件清單");
  updateCloseoutReadyState();
  showToast("AI 已依對應範本生成結案報告書草稿");
});

$("#exportCloseoutBtn").addEventListener("click", () => {
  state.exports.unshift({ name: `${closeoutProject.value.replace("｜", "_")}_結案報告書.docx`, type: "DOCX", time: "剛剛" });
  renderExports();
  switchView("exports");
  showToast("已建立結案報告匯出任務");
});

closeoutProject.addEventListener("change", updateCloseoutTemplateMatch);
$("[data-view-target='admin']").addEventListener("click", () => switchView("admin"));
$("#saveTemplateBtn").addEventListener("click", () => showToast("範本對應設定已儲存"));
$("#savePermissionBtn").addEventListener("click", () => {
  applyPermissions();
  showToast("權限設定已套用");
});
planSelect.addEventListener("change", updateProposalReference);
referenceYear.addEventListener("change", updateProposalReference);
[budgetTotal, budgetGrant, budgetSelf].forEach((input) => {
  input.addEventListener("input", updateBudgetSummary);
});
enableSustainability.addEventListener("change", updateSustainabilityStatus);
document.querySelectorAll(".esgOption").forEach((input) => input.addEventListener("change", updateSustainabilityStatus));
sustainabilityImpact.addEventListener("input", updateSustainabilityStatus);
sustainabilityKpi.addEventListener("input", updateSustainabilityStatus);
sdgGoals.addEventListener("change", updateSustainabilityStatus);
$("#saveSustainabilityBtn").addEventListener("click", () => showToast("SDGs / ESG 分析規則已儲存"));

document.body.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  if (!action) return;
  if (action === "upload") showToast("已建立上傳任務，可接續串接檔案上傳 API");
  if (action === "analyze") showToast("AI 分析已完成：已產生摘要、缺漏章節與改善建議");
  if (action === "download") showToast("範例下載任務已觸發");
});

$("#generatePlanBtn").addEventListener("click", () => {
  const plan = proposalTemplateMap[planSelect.value];
  const budget = getCurrentBudgetFromFields();
  const sustainability = getSustainabilitySettings();
  const year = referenceYear.value;
  const newYear = targetYear.value;
  const template = $("#templateSelect").value;
  const prompt = $("#promptInput").value.trim();
  const points = plan.references[year].map((point) => `- ${point}`).join("\n");
  const budgetRows = budget.items.map((item) => `| ${item.name} | ${formatMoney(item.limit)} | 依本案執行需求編列，AI 生成時不得超過此上限。 |`).join("\n");

  draftOutput.value = `計畫名稱：${newYear} ${planSelect.value}

一、前年度延續脈絡
本企劃書參照 ${year} 年度同計畫內容，並依 ${newYear} 年度目標進行延伸。前年度可延續重點如下：
${points}

二、套用範本
範本名稱：${plan.templateName}
範本位置：${plan.path}
制式章節：${plan.sections}

三、本案經費設定
總經費上限：${formatMoney(budget.total)}
補助款上限：${formatMoney(budget.grant)}
自籌款：${formatMoney(budget.self)}

經費概算表：
| 經費科目 | 編列上限 | 用途說明 |
|---|---:|---|
${budgetRows}

四、SDGs / ESG 分析
${sustainability.enabled ? `對應 SDGs：${sustainability.sdgs.join("、") || "未設定"}
ESG 面向：${sustainability.esg.join("、") || "未設定"}
永續影響摘要：${sustainability.impact || "未設定"}
量化指標 / KPI：${sustainability.kpi || "未設定"}` : "本案未啟用 SDGs / ESG 分析。"}

${baseDraft}

五、AI 生成設定
模板：${template}
需求：${prompt}

六、AI 補強摘要
本版本已依前年度計畫脈絡延伸，保留上下年度呼應，並套用該計畫的制式範本章節，後續可接續匯出為 Word 或轉換成簡報。`;
  showToast("已依年度參照與範本生成新版企劃書草稿");
});

$("#rewriteBtn").addEventListener("click", () => {
  draftOutput.value = draftOutput.value.replace(
    "本計畫延續既有執行成果",
    "本計畫承接前一年度執行成果與審查建議"
  );
  showToast("已套用正式語氣改寫");
});

$("#saveDraftBtn").addEventListener("click", () => showToast("已儲存為新版本 v1.1"));
$("#buildSlidesBtn").addEventListener("click", () => {
  renderSlides();
  showToast("已生成 6 頁簡報大綱");
});
$("#exportBtn").addEventListener("click", () => {
  state.exports.unshift({ name: "智慧計畫書管理平台_完整匯出.zip", type: "ZIP", time: "剛剛" });
  renderExports();
  showToast("已建立匯出任務");
});

draftOutput.value = baseDraft;
closeoutReport.value = "請先整理憑證，或點選「AI 生成結案報告書」產生草稿。";
renderDocuments("recentDocs", 3);
renderDocuments("docLibrary", undefined, true);
renderPermissionList();
renderReviewList();
renderExports();
renderSlides();
renderVouchers();
renderPhotos();
updateCloseoutReadyState();
updateCloseoutTemplateMatch();
updateProposalReference();
updateBudgetSummary();
loadSustainabilitySettings();

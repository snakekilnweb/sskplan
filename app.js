const SUPABASE_URL = "https://ddyrkfoatcxccgqqkowb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeXJrZm9hdGN4Y2NncXFrb3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNzA1MDIsImV4cCI6MjA5Njg0NjUwMn0.ntR5h1tDRHgs30PMDoZg_32kRqfIKrR8-At3wOUzczY";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = (selector) => document.querySelector(selector);

const STATUS_LABELS = {
  draft: "草稿",
  reviewing: "審核中",
  pending: "審核中",
  returned: "退回修改",
  completed: "已完成",
  archived: "封存",
  active: "進行中"
};

const STATUS_CLASS = {
  draft: "draft",
  reviewing: "review",
  pending: "review",
  returned: "review",
  completed: "done",
  archived: "archived",
  active: "review"
};

const state = {
  role: "customer",
  session: null,
  profile: null,
  projects: [],
  documents: [],
  closeoutReports: [],
  budgetSettings: [],
  budgetItems: [],
  sustainabilitySettings: [],
  vouchers: [],
  photos: [],
  trash: { documents: [], vouchers: [], photos: [] },
  exports: [
    { name: "文化推廣補助計畫書.pdf", type: "PDF", time: "今天" },
    { name: "文化推廣補助簡報.pptx", type: "PPTX", time: "昨天" }
  ],
  filters: { company: "", agency: "", search: "", status: "active", category: "" },
  permissions: {
    proposal: {
      label: "企劃書內容",
      note: "客戶可編輯草稿，管理者可審核。",
      customer: { read: true, edit: true, approve: false },
      admin: { read: true, edit: true, approve: true }
    },
    budget: {
      label: "經費設定",
      note: "每案經費上限由管理者維護。",
      customer: { read: true, edit: false, approve: false },
      admin: { read: true, edit: true, approve: true }
    },
    sustainability: {
      label: "SDGs / ESG",
      note: "管理者維護分析規則，客戶可補充內容。",
      customer: { read: true, edit: false, approve: false },
      admin: { read: true, edit: true, approve: true }
    },
    closeout: {
      label: "結案報告",
      note: "客戶可整理草稿，管理者負責審核。",
      customer: { read: true, edit: true, approve: false },
      admin: { read: true, edit: true, approve: true }
    },
    templates: {
      label: "範本與格式",
      note: "範本避免誤改，僅管理者可維護。",
      customer: { read: true, edit: false, approve: false },
      admin: { read: true, edit: true, approve: true }
    }
  }
};

const demoProjects = [
  {
    id: "demo-project",
    company_id: "demo-company",
    name: "文化推廣補助計畫",
    year: 2026,
    project_type: "文化補助",
    status: "draft",
    end_date: "2026-07-31",
    description: "用於測試計畫書生成、經費設定、SDGs/ESG、憑證、照片與結案報告流程。"
  }
];

const demoDocuments = [
  {
    id: "demo-document",
    project_id: "demo-project",
    title: "文化推廣補助計畫書草稿",
    year: 2026,
    version: 1,
    status: "draft",
    content:
      "一、計畫緣起\n本計畫旨在推動地方文化參與與藝文教育普及。\n\n二、計畫目標\n1. 辦理系列文化推廣活動。\n2. 建立地方社群與藝文團隊合作機制。\n3. 將 SDGs 與 ESG 分析納入計畫效益。"
  }
];

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function formatDate(value) {
  if (!value) return "尚未更新";
  return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium" }).format(new Date(value));
}

function formatMoney(value) {
  return `NT$ ${Number(value || 0).toLocaleString("zh-TW")}`;
}

function statusLabel(status) {
  return STATUS_LABELS[status] || status || "草稿";
}

function statusClass(status) {
  return STATUS_CLASS[status] || "draft";
}

function isPasswordRecoveryUrl() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return search.get("type") === "recovery" || hash.get("type") === "recovery";
}

function showPasswordResetPanel() {
  $("#loginView").classList.remove("hidden");
  $("#dashboardView").classList.add("hidden");
  $("#resetPasswordPanel").classList.remove("hidden");
  $("#password").required = false;
  $("#newPassword").focus();
}

function hidePasswordResetPanel() {
  $("#resetPasswordPanel").classList.add("hidden");
  $("#password").required = true;
  $("#newPassword").value = "";
  $("#confirmPassword").value = "";
}

function projectById(projectId) {
  return state.projects.find((project) => project.id === projectId) || {};
}

function projectAgency(project = {}) {
  const text = `${project.agency || ""} ${project.ministry || ""} ${project.department || ""} ${project.project_type || ""} ${project.name || ""} ${project.description || ""}`;
  if (text.includes("文化部") || text.includes("文化")) return "文化部";
  if (text.includes("經濟部") || text.includes("市場") || text.includes("商業")) return "經濟部";
  if (text.includes("數位發展部") || text.includes("數位") || text.includes("系統")) return "數位發展部";
  if (text.includes("教育部") || text.includes("教育")) return "教育部";
  return "其他";
}

function documentReferenceText(doc) {
  const project = projectById(doc.project_id);
  return `${doc.title || ""} ${doc.content || ""} ${project.name || ""} ${project.project_type || ""} ${project.description || ""}`.toLowerCase();
}

function referenceAgencyLabel(project = {}) {
  const text = `${project.agency || ""} ${project.ministry || ""} ${project.department || ""} ${project.project_type || ""} ${project.name || ""} ${project.description || ""}`;
  if (text.includes("文化部") || text.includes("文化") || text.includes("工藝")) return "文化部";
  if (text.includes("經濟部") || text.includes("市場") || text.includes("商業")) return "經濟部";
  if (text.includes("數位發展部") || text.includes("數位") || text.includes("系統")) return "數位發展部";
  if (text.includes("教育部") || text.includes("教育") || text.includes("人才")) return "教育部";
  return "其他";
}

function documentClassification(doc) {
  const project = projectById(doc.project_id);
  const content = doc.content || "";
  const classification = content.match(/分類：([^／\n]+)／([^\n]+)/);
  const title = doc.title || "";

  if (classification) {
    return {
      agency: classification[1].trim(),
      category: classification[2].trim()
    };
  }

  if (title.includes("城鄉") || title.includes("體驗") || title.includes("行程")) {
    return { agency: "經濟部", category: "商業企劃" };
  }

  return {
    agency: referenceAgencyLabel(project),
    category: project.project_type || "未分類"
  };
}

function safeStorageName(name) {
  const normalized = name.normalize("NFKD").replace(/[^\w.\-]+/g, "-");
  return normalized.replace(/-+/g, "-").replace(/^-|-$/g, "") || `file-${Date.now()}`;
}

function selectedProjectId(selector = "#planSelect") {
  return $(selector)?.value || state.projects[0]?.id || demoProjects[0]?.id || "unassigned";
}

function currentCompanyId() {
  return state.profile?.company_id || state.projects[0]?.company_id || demoProjects[0]?.company_id || null;
}

function buildProjectNameSuggestions() {
  const rawName = $("#newProjectName")?.value.trim();
  const description = $("#newProjectDescription")?.value.trim();
  const type = $("#newProjectType")?.value || "計畫";
  const agency = $("#newProjectAgency")?.value || "";
  const base = rawName || description.split(/[，。,.]/)[0] || type;
  const cleanBase = base.replace(/計畫$/, "").trim() || type;

  return [
    `${cleanBase}計畫`,
    `${cleanBase}與推廣應用計畫`,
    `${cleanBase}傳承及成果推廣計畫`,
    `${agency}${cleanBase}補助申請計畫`.replace(/^其他/, ""),
    `${cleanBase}年度執行與效益提升計畫`
  ].filter((item, index, array) => item && array.indexOf(item) === index).slice(0, 5);
}

function renderProjectNameSuggestions(names) {
  const list = $("#projectNameSuggestions");
  if (!list) return;

  list.innerHTML = names
    .map((name) => `<button class="name-suggestion" type="button" data-suggested-project-name="${name}">${name}</button>`)
    .join("");
}

async function createNewProjectFromEditor() {
  const name = $("#newProjectName")?.value.trim();
  const description = $("#newProjectDescription")?.value.trim();
  const year = Number($("#targetYear")?.value || new Date().getFullYear());
  const projectType = $("#newProjectType")?.value || "未分類";
  const agency = $("#newProjectAgency")?.value || "";
  const companyId = currentCompanyId();

  if (!name) {
    showToast("請先輸入或選擇一個計畫名稱。");
    $("#newProjectName")?.focus();
    return;
  }

  if (!companyId) {
    showToast("找不到公司資料，請先確認登入帳號已連到 profiles.company_id。");
    return;
  }

  const projectRecord = {
    company_id: companyId,
    name,
    year,
    project_type: projectType,
    status: "active",
    description: description || `${agency ? `${agency}｜` : ""}${projectType}｜${name}`
  };

  try {
    const { data, error } = await supabaseClient.from("projects").insert(projectRecord).select("*").single();
    if (error) throw error;

    state.projects.unshift(data);
    renderProjectOptions();
    $("#planSelect").value = data.id;
    document.querySelector('[data-project-mode="existing"]')?.click();
    showToast("新計畫已建立，可開始生成企劃書。");
  } catch (error) {
    showToast(`建立新計畫失敗：${error.message}`);
  }
}

async function uploadCaseFile({ bucket, file, projectId, fileType }) {
  if (!state.session || !state.profile) {
    throw new Error("請先登入後再上傳檔案。");
  }

  const companyId = state.profile.company_id || "shared";
  const storageKey = `${companyId}/${projectId}/${Date.now()}-${safeStorageName(file.name)}`;
  const uploadResult = await supabaseClient.storage.from(bucket).upload(storageKey, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (uploadResult.error) throw uploadResult.error;

  const publicUrl = supabaseClient.storage.from(bucket).getPublicUrl(storageKey).data.publicUrl;
  const fileRecord = {
    project_id: projectId,
    company_id: companyId,
    uploaded_by: state.profile.id,
    file_type: fileType,
    file_name: file.name,
    file_url: publicUrl,
    storage_key: storageKey,
    mime_type: file.type || "application/octet-stream",
    file_size: file.size,
    status: "active"
  };

  const { data, error } = await supabaseClient.from("files").insert(fileRecord).select("*").single();
  if (error) throw error;
  return data;
}

async function uploadProposalDocuments(files) {
  const isNewMode = document.querySelector('[data-project-mode="new"]')?.classList.contains("active");
  if (isNewMode) {
    throw new Error("請先按「建立新計畫」，再上傳計畫書。");
  }

  const projectId = selectedProjectId("#uploadProject");
  const uploadAgency = $("#uploadAgency")?.value || referenceAgencyLabel(projectById(projectId));
  const uploadCategory = $("#uploadCategory")?.value || projectById(projectId).project_type || "未分類";
  for (const file of files) {
    const fileRow = await uploadCaseFile({ bucket: "proposal-files", file, projectId, fileType: "proposal" });
    const project = projectById(projectId);
    const documentRow = {
      project_id: projectId,
      title: file.name.replace(/\.[^.]+$/, ""),
      year: project.year || new Date().getFullYear(),
      version: 1,
      status: "draft",
      content: `分類：${uploadAgency}／${uploadCategory}`,
      file_id: fileRow.id,
      created_by: state.profile.id,
      reviewed_by: null,
      reviewed_at: null
    };
    const { data, error } = await supabaseClient.from("proposal_documents").insert(documentRow).select("*").single();
    if (error) throw error;
    state.documents.unshift(data);
  }
  renderDocuments("recentDocs", 3);
  renderDocuments("docLibrary", undefined, true);
}

async function uploadVouchers(files) {
  const projectId = selectedProjectId("#voucherProject");
  const voucherType = $("#voucherType")?.value || "憑證";
  for (const file of files) {
    const fileRow = await uploadCaseFile({ bucket: "vouchers", file, projectId, fileType: "voucher" });
    const voucherRow = {
      project_id: projectId,
      file_id: fileRow.id,
      voucher_type: voucherType,
      amount: 0,
      status: "pending"
    };
    const { data, error } = await supabaseClient.from("vouchers").insert(voucherRow).select("*").single();
    if (error) throw error;
    state.vouchers.unshift({ ...data, file_name: file.name });
  }
  renderVouchers();
}

async function uploadPhotos(files) {
  const projectId = selectedProjectId("#photoProject");
  const stage = $("#photoStage")?.value || "成果照片";
  for (const file of files) {
    const fileRow = await uploadCaseFile({ bucket: "photos", file, projectId, fileType: "photo" });
    const photoRow = {
      project_id: projectId,
      file_id: fileRow.id,
      stage,
      caption: file.name.replace(/\.[^.]+$/, ""),
      status: "active"
    };
    const { data, error } = await supabaseClient.from("photos").insert(photoRow).select("*").single();
    if (error) throw error;
    state.photos.unshift({ ...data, file_name: file.name });
  }
  renderPhotos();
}

async function handleSelectedFiles(event, uploader, doneMessage) {
  const files = Array.from(event.target.files || []);
  event.target.value = "";
  if (!files.length) return;

  try {
    showToast(`正在上傳 ${files.length} 個檔案...`);
    await uploader(files);
    showToast(doneMessage);
  } catch (error) {
    showToast(`上傳失敗：${error.message}`);
  }
}

async function archiveRecord(table, id) {
  const { error } = await supabaseClient.from(table).update({ status: "archived" }).eq("id", id);
  if (error) throw error;
}

async function deleteUploadedRecord(type, id) {
  if (!id || id.startsWith("demo")) {
    showToast("示範資料不會寫入資料庫，無需刪除。");
    return;
  }

  const tableMap = {
    document: "proposal_documents",
    voucher: "vouchers",
    photo: "photos"
  };

  const table = tableMap[type];
  if (!table) return;

  const confirmed = window.confirm("確定要刪除此筆資料嗎？系統會先封存紀錄，避免誤刪後無法復原。");
  if (!confirmed) return;

  try {
    const sourceMap = {
      document: state.documents,
      voucher: state.vouchers,
      photo: state.photos
    };
    const targetRecord = sourceMap[type]?.find((item) => item.id === id);

    await archiveRecord(table, id);
    if (targetRecord?.file_id) {
      await archiveRecord("files", targetRecord.file_id);
    }

    if (type === "document") {
      state.documents = state.documents.filter((item) => item.id !== id);
      renderDocuments("recentDocs", 3);
      renderDocuments("docLibrary", undefined, true);
    }
    if (type === "voucher") {
      state.vouchers = state.vouchers.filter((item) => item.id !== id);
      renderVouchers();
    }
    if (type === "photo") {
      state.photos = state.photos.filter((item) => item.id !== id);
      renderPhotos();
    }
    showToast("資料已封存並從目前列表移除。");
  } catch (error) {
    showToast(`刪除失敗：${error.message}`);
  }
}

function trashTable(type) {
  return {
    document: "proposal_documents",
    voucher: "vouchers",
    photo: "photos"
  }[type];
}

function removeFromTrashState(type, id) {
  const key = {
    document: "documents",
    voucher: "vouchers",
    photo: "photos"
  }[type];
  if (key) state.trash[key] = state.trash[key].filter((item) => item.id !== id);
}

function activeStateKey(type) {
  return {
    document: "documents",
    voucher: "vouchers",
    photo: "photos"
  }[type];
}

async function restoreTrashRecord(type, id) {
  const table = trashTable(type);
  const key = activeStateKey(type);
  if (!table || !key) return;

  const item = state.trash[key].find((record) => record.id === id);
  if (!item) return;

  try {
    const nextStatus = type === "document" ? "draft" : type === "voucher" ? "pending" : "active";
    const { error } = await supabaseClient.from(table).update({ status: nextStatus }).eq("id", id);
    if (error) throw error;
    if (item.file_id) await supabaseClient.from("files").update({ status: "active" }).eq("id", item.file_id);

    item.status = nextStatus;
    state[key].unshift(item);
    removeFromTrashState(type, id);
    renderAll();
    showToast("資料已還原。");
  } catch (error) {
    showToast(`還原失敗：${error.message}`);
  }
}

async function permanentlyDeleteTrashRecord(type, id) {
  const table = trashTable(type);
  const key = activeStateKey(type);
  if (!table || !key) return;

  const item = state.trash[key].find((record) => record.id === id);
  if (!item) return;

  const confirmed = window.confirm("確定永久刪除此筆資料嗎？這個動作無法復原。");
  if (!confirmed) return;

  try {
    const { error } = await supabaseClient.from(table).delete().eq("id", id);
    if (error) throw error;
    if (item.file_id) await supabaseClient.from("files").delete().eq("id", item.file_id);

    removeFromTrashState(type, id);
    renderTrash();
    showToast("資料已永久刪除。");
  } catch (error) {
    showToast(`永久刪除失敗：${error.message}`);
  }
}

function getDisplayDocuments() {
  const documents = state.documents.length ? state.documents : demoDocuments;
  const query = state.filters.search.trim().toLowerCase();
  const activeStatuses = ["draft", "reviewing", "pending", "returned", "active"];

  return documents.filter((doc) => {
    const project = projectById(doc.project_id);
    const classification = documentClassification(doc);
    const text = `${doc.title || ""} ${project.name || ""} ${classification.agency || ""} ${classification.category || ""} ${project.project_type || ""} ${doc.status || ""}`.toLowerCase();
    const matchesSearch = !query || text.includes(query);
    const matchesStatus =
      !state.filters.status ||
      (state.filters.status === "active" ? activeStatuses.includes(doc.status || "draft") : statusLabel(doc.status) === state.filters.status);
    const matchesAgency = !state.filters.agency || classification.agency === state.filters.agency;
    const matchesCategory = !state.filters.category || classification.category === state.filters.category;
    return matchesSearch && matchesStatus && matchesAgency && matchesCategory;
  });
}

function renderDocuments(targetId, limit, useFilters = false) {
  const target = $(`#${targetId}`);
  if (!target) return;

  const source = useFilters ? getDisplayDocuments() : getDisplayDocuments().slice(0, 3);
  const docs = typeof limit === "number" ? source.slice(0, limit) : source;

  if (!docs.length) {
    target.innerHTML = `
      <article class="doc-row">
        <div>
          <strong>目前沒有符合條件的文件</strong>
          <div class="meta">請調整搜尋條件，或先新增一份企劃書草稿。</div>
        </div>
      </article>`;
    updateLibrarySummary(0);
    return;
  }

  target.innerHTML = docs
    .map((doc) => {
      const project = projectById(doc.project_id);
      const classification = documentClassification(doc);
      return `
        <article class="doc-row">
          <div>
            <strong>${doc.title || "未命名企劃書"}</strong>
            <div class="meta">${project.name || "未指定專案"} ｜ ${classification.agency} ｜ ${classification.category} ｜ ${formatDate(doc.updated_at || doc.created_at)}</div>
          </div>
          <div class="row-actions">
            <span class="status ${statusClass(doc.status)}">${statusLabel(doc.status)}</span>
            <button class="danger-btn" type="button" data-delete-type="document" data-delete-id="${doc.id}">刪除</button>
          </div>
        </article>`;
    })
    .join("");

  updateLibrarySummary(docs.length);
}

function updateLibrarySummary(count) {
  const librarySummary = $("#librarySummary");
  if (!librarySummary) return;

  const status = $("#docStatusFilter")?.value || "全部狀態";
  const agency = $("#docAgencyFilter")?.value || "全部部會";
  const category = $("#docCategoryFilter")?.value || "全部分類";
  const statusText = status === "active" ? "待處理" : status;
  librarySummary.textContent = `${statusText} ｜ ${agency} ｜ ${category}，共 ${count} 份文件。`;
}

function renderProjectOptions() {
  const projects = state.projects.length ? state.projects : demoProjects;
  const optionHtml = projects
    .map((project) => `<option value="${project.id}">${project.name}</option>`)
    .join("");

  ["#planSelect", "#closeoutProject", "#voucherProject", "#photoProject", "#uploadProject"].forEach((selector) => {
    const select = $(selector);
    if (select) select.innerHTML = optionHtml;
  });
}

function renderBudgets() {
  const budget = state.budgetSettings[0];
  const items = state.budgetItems;

  $("#budgetTotal").value = budget?.total_budget_limit || 1000000;
  $("#budgetGrant").value = budget?.grant_limit || 800000;
  $("#budgetSelf").value = budget?.self_funding || 200000;

  const budgetItems = $("#budgetItems");
  budgetItems.innerHTML = (items.length
    ? items
    : [
        { item_name: "人事費", limit_amount: 300000 },
        { item_name: "場地費", limit_amount: 200000 },
        { item_name: "行銷宣傳費", limit_amount: 150000 },
        { item_name: "材料費", limit_amount: 200000 }
      ])
    .map(
      (item) => `
        <label>${item.item_name || item.name}
          <input type="number" value="${item.limit_amount || item.planned_amount || item.limit || 0}" data-name="${item.item_name || item.name}" />
        </label>`
    )
    .join("");

  budgetItems.querySelectorAll("input").forEach((input) => input.addEventListener("input", updateBudgetSummary));
  updateBudgetSummary();
}

function updateBudgetSummary() {
  const total = Number($("#budgetTotal").value || 0);
  const grant = Number($("#budgetGrant").value || 0);
  const selfFunding = Number($("#budgetSelf").value || 0);
  const itemTotal = [...$("#budgetItems").querySelectorAll("input")].reduce((sum, input) => sum + Number(input.value || 0), 0);
  const isValid = itemTotal <= total && grant + selfFunding === total;

  $("#budgetStatus").textContent = isValid ? "符合上限" : "需調整";
  $("#budgetStatus").className = isValid ? "status done" : "status review";
  $("#budgetSummary").textContent = `目前科目合計 ${formatMoney(itemTotal)}，總經費上限 ${formatMoney(total)}，補助與自籌合計 ${formatMoney(grant + selfFunding)}。`;
}

function renderSustainability() {
  const settings = state.sustainabilitySettings[0];
  const selectedSdgs = settings?.sdg_goals || ["SDG4", "SDG8", "SDG11", "SDG17"];
  const selectedEsg = settings?.esg_dimensions || ["S", "G"];
  const sdgLabels = [
    "SDG1", "SDG2", "SDG3", "SDG4", "SDG5", "SDG6", "SDG7", "SDG8", "SDG9",
    "SDG10", "SDG11", "SDG12", "SDG13", "SDG14", "SDG15", "SDG16", "SDG17"
  ];

  $("#sdgGoals").innerHTML = sdgLabels
    .map((label) => `<label><input type="checkbox" class="sdgOption" value="${label}" ${selectedSdgs.includes(label) ? "checked" : ""} /> ${label}</label>`)
    .join("");

  document.querySelectorAll(".esgOption").forEach((input) => {
    input.checked = selectedEsg.includes(input.value[0]) || selectedEsg.includes(input.value);
    input.addEventListener("change", updateSustainabilityStatus);
  });

  $("#sustainabilityImpact").value =
    settings?.impact_summary || "本計畫聚焦文化教育推廣、地方參與、青年培力與跨單位合作，具備社會面與治理面的永續效益。";
  $("#sustainabilityKpi").value =
    settings?.kpi_items || "參與人次、活動場次、合作單位數、成果曝光次數、滿意度調查";

  $("#sdgGoals").addEventListener("change", updateSustainabilityStatus);
  $("#enableSustainability").addEventListener("change", updateSustainabilityStatus);
  updateSustainabilityStatus();
}

function getSustainabilitySettings() {
  return {
    enabled: $("#enableSustainability").checked,
    sdgs: [...document.querySelectorAll(".sdgOption:checked")].map((input) => input.value),
    esg: [...document.querySelectorAll(".esgOption:checked")].map((input) => input.value),
    impact: $("#sustainabilityImpact").value.trim(),
    kpi: $("#sustainabilityKpi").value.trim()
  };
}

function updateSustainabilityStatus() {
  const settings = getSustainabilitySettings();
  const ready = settings.enabled && settings.sdgs.length && settings.esg.length;
  $("#sustainabilityStatus").textContent = ready ? "已啟用" : "未完整";
  $("#sustainabilityStatus").className = ready ? "status done" : "status review";
}

function getDaysUntil(dateValue) {
  if (!dateValue) return null;
  const endDate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(endDate.getTime())) return null;
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.ceil((endDate - todayStart) / 86400000);
}

function getCloseoutReminders() {
  const threshold = Number($("#reminderLeadDays")?.value || 30);
  const projects = state.projects.length ? state.projects : demoProjects;
  return projects
    .map((project) => {
      const days = getDaysUntil(project.end_date);
      let level = "normal";
      let label = "尚未進入提醒期";
      if (days === null) {
        level = "missing";
        label = "未設定結束日";
      } else if (days < 0) {
        level = "overdue";
        label = `已逾期 ${Math.abs(days)} 天`;
      } else if (days <= threshold) {
        level = "urgent";
        label = `剩 ${days} 天`;
      }
      return { project, days, level, label };
    })
    .sort((a, b) => {
      if (a.days === null) return 1;
      if (b.days === null) return -1;
      return a.days - b.days;
    });
}

function renderCloseoutReminders() {
  const list = $("#closeoutReminderList");
  const summary = $("#reminderSummary");
  if (!list || !summary) return;

  const reminders = getCloseoutReminders();
  const active = reminders.filter((item) => ["urgent", "overdue", "missing"].includes(item.level));

  summary.textContent = active.length ? `${active.length} 件需注意` : "目前正常";
  summary.className = active.length ? "status review" : "status done";

  list.innerHTML = reminders
    .map((item) => {
      const project = item.project;
      const cssClass = item.level === "overdue" ? "overdue" : item.level === "urgent" ? "urgent" : "ready";
      const endDate = project.end_date ? formatDate(project.end_date) : "尚未設定";
      const actionText =
        item.level === "overdue"
          ? "請立即補齊憑證、照片與結案報告草稿。"
          : item.level === "urgent"
            ? "建議開始確認憑證、照片、經費核銷與成果摘要。"
            : item.level === "missing"
              ? "請先回專案資料補上結案日期。"
              : "尚未進入提醒期，可持續整理執行資料。";
      return `
        <article class="reminder-item ${cssClass}">
          <strong>${project.name || "未命名專案"}</strong>
          <span class="status ${item.level === "overdue" || item.level === "urgent" ? "review" : "done"}">${item.label}</span>
          <small>結案日期：${endDate}<br />${actionText}</small>
        </article>`;
    })
    .join("");
}

function renderCloseout() {
  const report = state.closeoutReports[0];
  const project = projectById(report?.project_id) || state.projects[0] || demoProjects[0];
  $("#matchedTemplate").textContent = "文化補助結案報告範本";
  $("#matchedTemplateDesc").textContent = "系統會依案件所屬部會與案件類型自動套用章節、附件與格式規則。";
  $("#closeoutReport").value =
    report?.content ||
    `一、計畫摘要\n${project.name} 以文化推廣、地方參與及藝文教育為核心，透過系列活動與社區合作提升民眾參與。\n\n二、照片紀錄\n後續將依 photos 表中的照片自動整理。\n\n三、經費核銷\n後續將依 vouchers 表中的憑證自動整理。\n\n四、SDGs / ESG 成果\n本案將對應永續目標並整理社會面與治理面效益。`;
}

function renderVouchers() {
  const target = $("#voucherList");
  const vouchers = state.vouchers.length
    ? state.vouchers
    : [
        { file_name: "invoice-001.pdf", voucher_type: "發票", amount: 32000, status: "pending" },
        { file_name: "receipt-001.pdf", voucher_type: "收據", amount: 18500, status: "pending" }
      ];

  target.innerHTML = vouchers
    .map(
      (item) => `
        <article class="voucher-row">
          <div>
            <strong>${item.file_name || item.invoice_number || "未命名憑證"}</strong>
            <div class="meta">${item.voucher_type || "憑證"} ｜ ${formatMoney(item.amount)} ｜ ${statusLabel(item.status)}</div>
          </div>
          <div class="row-actions">
            <span class="status ${statusClass(item.status)}">${statusLabel(item.status)}</span>
            <button class="danger-btn" type="button" data-delete-type="voucher" data-delete-id="${item.id || "demo-voucher"}">刪除</button>
          </div>
        </article>`
    )
    .join("");
}

function renderPhotos() {
  const target = $("#photoList");
  const photos = state.photos.length
    ? state.photos
    : [
        { caption: "活動現場紀錄", stage: "執行中", location: "台北", status: "active" },
        { caption: "成果分享會", stage: "成果完成", location: "台北", status: "active" }
      ];

  target.innerHTML = photos
    .map(
      (item, index) => `
        <article class="photo-row">
          <div class="photo-thumb">照片 ${index + 1}</div>
          <div>
            <strong>${item.caption || "照片紀錄"}</strong>
            <div class="meta">${item.stage || "活動紀錄"} ｜ ${item.location || "未填地點"} ｜ ${statusLabel(item.status)}</div>
          </div>
          <span class="status done">已歸檔</span>
        </article>`
    )
    .join("");
}

function renderPhotos() {
  const target = $("#photoList");
  const photos = state.photos.length
    ? state.photos
    : [
        { id: "demo-photo-1", caption: "成果活動照片", stage: "執行中", location: "未設定", status: "active" },
        { id: "demo-photo-2", caption: "結案成果紀錄", stage: "成果完成", location: "未設定", status: "active" }
      ];

  target.innerHTML = photos
    .map(
      (item, index) => `
        <article class="photo-row">
          <div class="photo-thumb">照片 ${index + 1}</div>
          <div>
            <strong>${item.caption || item.file_name || "照片紀錄"}</strong>
            <div class="meta">${item.stage || "照片紀錄"} ｜ ${item.location || "未設定地點"} ｜ ${statusLabel(item.status)}</div>
          </div>
          <div class="row-actions">
            <span class="status done">已上傳</span>
            <button class="danger-btn" type="button" data-delete-type="photo" data-delete-id="${item.id || "demo-photo"}">刪除</button>
          </div>
        </article>`
    )
    .join("");
}

function renderExports() {
  $("#exportList").innerHTML = state.exports
    .map(
      (item) => `
        <article class="export-row">
          <div><strong>${item.name}</strong><div class="meta">${item.type} ｜ ${item.time}</div></div>
          <button class="secondary-btn" data-action="download">下載</button>
        </article>`
    )
    .join("");
}

function renderSlides() {
  const slides = [
    ["01", "計畫背景", "說明補助案目的、地方需求與核心問題。"],
    ["02", "執行策略", "整理活動設計、社區合作與推廣方法。"],
    ["03", "經費配置", "呈現總經費、補助款、自籌款與主要科目。"],
    ["04", "SDGs / ESG", "說明永續目標與社會影響。"],
    ["05", "預期效益", "整理參與人次、合作單位與成果曝光。"],
    ["06", "後續展望", "提出延續機制與成果擴散方式。"]
  ];

  $("#slidesGrid").innerHTML = slides
    .map(([number, title, text]) => `<article class="slide-card"><span>${number}</span><strong>${title}</strong><p class="meta">${text}</p></article>`)
    .join("");
}

function renderPermissions() {
  const list = $("#permissionList");
  if (!list) return;

  list.innerHTML = `
    <div class="permission-row header">
      <div>功能</div><div>客戶讀取</div><div>客戶編輯</div><div>客戶審核</div><div>管理者讀取</div><div>管理者編輯</div><div>管理者審核</div>
    </div>
    ${Object.entries(state.permissions)
      .map(
        ([key, item]) => `
          <article class="permission-row">
            <div><strong>${item.label}</strong><small>${item.note}</small></div>
            ${["customer", "admin"]
              .flatMap((role) =>
                ["read", "edit", "approve"].map(
                  (action) => `
                    <label class="permission-check">
                      <input type="checkbox" data-module="${key}" data-role="${role}" data-action="${action}" ${item[role][action] ? "checked" : ""} />
                    </label>`
                )
              )
              .join("")}
          </article>`
      )
      .join("")}`;

  list.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      state.permissions[input.dataset.module][input.dataset.role][input.dataset.action] = input.checked;
      applyPermissions();
    });
  });
}

function renderReviewList() {
  const reviewList = $("#reviewList");
  if (!reviewList) return;

  const docs = state.documents.length ? state.documents : demoDocuments;
  reviewList.innerHTML = docs
    .map(
      (doc) => `
        <article class="review-row">
          <div>
            <strong>${doc.title}</strong>
            <div class="meta">${projectById(doc.project_id).name || "測試專案"} ｜ ${statusLabel(doc.status)}</div>
          </div>
          <label>
            審核狀態
            <select class="review-status" data-id="${doc.id}">
              <option value="draft" ${doc.status === "draft" ? "selected" : ""}>草稿</option>
              <option value="reviewing" ${doc.status === "reviewing" ? "selected" : ""}>審核中</option>
              <option value="returned" ${doc.status === "returned" ? "selected" : ""}>退回修改</option>
              <option value="completed" ${doc.status === "completed" ? "selected" : ""}>已完成</option>
              <option value="archived" ${doc.status === "archived" ? "selected" : ""}>封存</option>
            </select>
          </label>
        </article>`
    )
    .join("");

  reviewList.querySelectorAll(".review-status").forEach((select) => {
    select.addEventListener("change", async () => {
      const doc = state.documents.find((item) => item.id === select.dataset.id);
      if (!doc) return;
      doc.status = select.value;
      await supabaseClient.from("proposal_documents").update({ status: select.value }).eq("id", doc.id);
      renderDocuments("recentDocs", 3);
      renderDocuments("docLibrary", undefined, true);
      showToast("文件狀態已更新");
    });
  });
}

function renderTrash() {
  const list = $("#trashList");
  const summary = $("#trashSummary");
  if (!list || !summary) return;

  const items = [
    ...state.trash.documents.map((item) => ({ ...item, trashType: "document", typeLabel: "計畫書", name: item.title })),
    ...state.trash.vouchers.map((item) => ({ ...item, trashType: "voucher", typeLabel: "憑證", name: item.file_name || item.invoice_number || item.voucher_type })),
    ...state.trash.photos.map((item) => ({ ...item, trashType: "photo", typeLabel: "照片", name: item.caption || item.file_name }))
  ];

  summary.textContent = `${items.length} 筆封存`;

  if (!items.length) {
    list.innerHTML = `
      <article class="trash-row">
        <div>
          <strong>目前沒有封存資料</strong>
          <div class="meta">刪除的計畫書、憑證與照片會出現在這裡。</div>
        </div>
      </article>`;
    return;
  }

  list.innerHTML = items
    .map((item) => {
      const project = projectById(item.project_id);
      return `
        <article class="trash-row">
          <div>
            <strong>${item.name || "未命名資料"}</strong>
            <div class="meta">${item.typeLabel} ｜ ${project.name || "未指定案件"} ｜ 已封存</div>
          </div>
          <div class="row-actions">
            <button class="secondary-btn" type="button" data-restore-type="${item.trashType}" data-restore-id="${item.id}">還原</button>
            <button class="danger-btn" type="button" data-permanent-delete-type="${item.trashType}" data-permanent-delete-id="${item.id}">永久刪除</button>
          </div>
        </article>`;
    })
    .join("");
}

function applyPermissions() {
  const isAdmin = state.role === "admin";
  $("#roleLabel").textContent = isAdmin ? "管理者模式" : "客戶模式";
  document.querySelectorAll(".admin-only").forEach((item) => {
    item.style.display = isAdmin ? "block" : "none";
  });

  document.querySelectorAll(".review-status").forEach((select) => {
    select.disabled = !isAdmin;
  });

  ["#saveTemplateBtn", "#saveSustainabilityBtn", "#savePermissionBtn"].forEach((selector) => {
    const button = $(selector);
    if (button) button.disabled = !isAdmin;
  });
}

function switchView(viewId) {
  if ((viewId === "admin" || viewId === "trash") && state.role !== "admin") {
    showToast("此區域需要管理者權限");
    viewId = "overview";
  }

  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  $(`#${viewId}`)?.classList.add("active");
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.view === viewId);
  });
}

async function loadSupabaseData() {
  const [projectsRes, docsRes, reportsRes, budgetRes, sustainabilityRes, vouchersRes, photosRes] = await Promise.all([
    supabaseClient.from("projects").select("*").order("created_at", { ascending: false }),
    supabaseClient.from("proposal_documents").select("*").order("created_at", { ascending: false }),
    supabaseClient.from("closeout_reports").select("*").order("created_at", { ascending: false }),
    supabaseClient.from("budget_settings").select("*").order("created_at", { ascending: false }),
    supabaseClient.from("sustainability_settings").select("*").order("created_at", { ascending: false }),
    supabaseClient.from("vouchers").select("*").order("created_at", { ascending: false }),
    supabaseClient.from("photos").select("*").order("created_at", { ascending: false })
  ]);

  if (projectsRes.error) throw projectsRes.error;

  const allDocuments = docsRes.data?.length ? docsRes.data : demoDocuments;
  const allVouchers = vouchersRes.data || [];
  const allPhotos = photosRes.data || [];

  state.projects = projectsRes.data?.length ? projectsRes.data : demoProjects;
  state.documents = allDocuments.filter((item) => item.status !== "archived");
  state.closeoutReports = reportsRes.data || [];
  state.budgetSettings = budgetRes.data || [];
  state.sustainabilitySettings = sustainabilityRes.data || [];
  state.vouchers = allVouchers.filter((item) => item.status !== "archived");
  state.photos = allPhotos.filter((item) => item.status !== "archived");
  state.trash = {
    documents: allDocuments.filter((item) => item.status === "archived"),
    vouchers: allVouchers.filter((item) => item.status === "archived"),
    photos: allPhotos.filter((item) => item.status === "archived")
  };

  if (state.budgetSettings[0]) {
    const { data } = await supabaseClient
      .from("budget_items")
      .select("*")
      .eq("budget_setting_id", state.budgetSettings[0].id)
      .order("sort_order", { ascending: true });
    state.budgetItems = data || [];
  }
}

async function loadProfile() {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", state.session.user.id)
    .single();

  if (error) throw error;
  state.profile = data;
  state.role = data.role || "customer";
}

function renderReferenceMatches() {
  const list = $("#referenceMatchList");
  if (!list) return;

  const selectedProject = projectById($("#planSelect")?.value);
  const selectedYear = $("#referenceYear")?.value;
  const agencyFilter = $("#referenceAgencyFilter")?.value || referenceAgencyLabel(selectedProject);
  const typeFilter = $("#referenceTypeFilter")?.value || selectedProject.project_type || "";
  const keyword = ($("#referenceKeyword")?.value || "").trim().toLowerCase();
  const documents = state.documents.length ? state.documents : demoDocuments;

  const candidates = documents
    .filter((doc) => doc.status !== "archived")
    .map((doc) => ({ doc, project: projectById(doc.project_id) }))
    .filter(({ doc, project }) => {
      const sameAgency = !agencyFilter || referenceAgencyLabel(project) === agencyFilter;
      const sameType =
        !typeFilter ||
        project.project_type === typeFilter ||
        documentReferenceText(doc).includes(typeFilter.toLowerCase());
      const sameYear = !selectedYear || String(doc.year || project.year || "").includes(String(selectedYear));
      const keywordMatch = !keyword || documentReferenceText(doc).includes(keyword);
      return sameAgency && sameType && sameYear && keywordMatch;
    })
    .slice(0, 5);

  if (!candidates.length) {
    list.innerHTML = `
      <article class="reference-match empty">
        <strong>尚未找到精準參考文件</strong>
        <small>可放寬部會、類型或關鍵字，或先上傳同類型的舊計畫書。</small>
      </article>`;
    return;
  }

  list.innerHTML = candidates
    .map(({ doc, project }) => `
      <article class="reference-match">
        <strong>${doc.title || "未命名計畫書"}</strong>
        <small>${referenceAgencyLabel(project)} ｜ ${project.project_type || "未分類"} ｜ ${doc.year || project.year || "未設定年度"}</small>
      </article>`)
    .join("");
}

function renderAll() {
  renderProjectOptions();
  renderDocuments("recentDocs", 3);
  renderDocuments("docLibrary", undefined, true);
  renderBudgets();
  renderSustainability();
  renderCloseout();
  renderCloseoutReminders();
  renderVouchers();
  renderPhotos();
  renderExports();
  renderSlides();
  renderPermissions();
  renderReviewList();
  renderReferenceMatches();
  renderTrash();
  applyPermissions();
}

async function enterDashboard(session) {
  state.session = session;
  await loadProfile();
  await loadSupabaseData();
  $("#loginView").classList.add("hidden");
  $("#dashboardView").classList.remove("hidden");
  renderAll();
  switchView("overview");
  showToast("登入成功，已載入 Supabase 資料");
}

function bindEvents() {
  document.querySelectorAll(".role-btn").forEach((button) => {
    button.addEventListener("click", () => {
      state.role = button.dataset.role;
      document.querySelectorAll(".role-btn").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      $("#email").value = state.role === "admin" ? "admin@example.com" : "client@example.com";
    });
  });

  $("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = $("#email").value.trim();
    const password = $("#password").value;

    if (!password) {
      showToast("請輸入 Supabase Authentication 的帳號密碼");
      return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      showToast(`登入失敗：${error.message}`);
      return;
    }

    try {
      await enterDashboard(data.session);
    } catch (loadError) {
      showToast(`資料載入失敗：${loadError.message}`);
    }
  });

  $("#forgotPasswordBtn").addEventListener("click", async () => {
    const email = $("#email").value.trim();

    if (!email) {
      showToast("請先輸入要重設密碼的 Email。");
      $("#email").focus();
      return;
    }

    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      showToast(`重設信寄送失敗：${error.message}`);
      return;
    }

    showToast("重設密碼信已寄出，請到信箱收信。");
  });

  $("#saveNewPasswordBtn").addEventListener("click", async () => {
    const newPassword = $("#newPassword").value;
    const confirmPassword = $("#confirmPassword").value;

    if (newPassword.length < 6) {
      showToast("新密碼至少需要 6 個字元。");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("兩次輸入的新密碼不一致。");
      return;
    }

    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });

    if (error) {
      showToast(`密碼更新失敗：${error.message}`);
      return;
    }

    hidePasswordResetPanel();
    await supabaseClient.auth.signOut();
    showToast("密碼已更新，請使用新密碼重新登入。");
  });

  $("#logoutBtn").addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    state.session = null;
    $("#dashboardView").classList.add("hidden");
    $("#loginView").classList.remove("hidden");
    showToast("已登出");
  });

  document.querySelectorAll(".nav-link").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  $("#compareBtn").addEventListener("click", () => {
    switchView("documents");
    showToast("已套用交叉比對搜尋");
  });

  $("#clearCompareBtn").addEventListener("click", () => {
    $("#companyFilter").value = "";
    $("#agencyFilter").value = "";
    showToast("已清除交叉比對條件");
  });

  $("#docSearch").addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    if (state.filters.search && $("#docStatusFilter").value === "active") {
      $("#docStatusFilter").value = "";
      state.filters.status = "";
    }
    renderDocuments("docLibrary", undefined, true);
  });

  $("#docStatusFilter").addEventListener("change", (event) => {
    state.filters.status = event.target.value;
    renderDocuments("docLibrary", undefined, true);
  });

  $("#docAgencyFilter").addEventListener("change", (event) => {
    state.filters.agency = event.target.value;
    renderDocuments("docLibrary", undefined, true);
  });

  $("#docCategoryFilter").addEventListener("change", (event) => {
    state.filters.category = event.target.value;
    renderDocuments("docLibrary", undefined, true);
  });

  ["#referenceAgencyFilter", "#referenceTypeFilter", "#referenceYear", "#planSelect"].forEach((selector) => {
    $(selector)?.addEventListener("change", renderReferenceMatches);
  });

  $("#referenceKeyword")?.addEventListener("input", renderReferenceMatches);

  ["#budgetTotal", "#budgetGrant", "#budgetSelf"].forEach((selector) => {
    $(selector).addEventListener("input", updateBudgetSummary);
  });

  $("#reminderLeadDays")?.addEventListener("change", renderCloseoutReminders);

  $("#generatePlanBtn").addEventListener("click", () => {
    const project = state.projects.find((item) => item.id === $("#planSelect").value) || state.projects[0] || demoProjects[0];
    const budgetTotal = $("#budgetTotal").value;
    const sustainability = getSustainabilitySettings();
    $("#draftOutput").value = `計畫名稱：${project.name}

一、計畫緣起
本計畫延續既有年度執行成果，聚焦地方文化推廣、社區參與與藝文教育普及，並以可量化成果作為申請與審查基礎。

二、計畫目標
1. 辦理系列文化推廣活動。
2. 建立地方社群與藝文團隊合作機制。
3. 提升青年與居民參與文化活動的機會。
4. 將 SDGs 與 ESG 分析納入計畫效益。

三、經費概算
本案總經費上限為 ${formatMoney(budgetTotal)}，AI 撰寫時將依據系統中的經費設定與細項上限編列。

四、SDGs / ESG 分析
對應目標：${sustainability.sdgs.join("、")}
ESG 面向：${sustainability.esg.join("、")}
分析摘要：${sustainability.impact}

五、預期效益
預計建立可延續的地方文化參與模式，並形成可供結案報告與簡報使用的成果資料。`;
    showToast("已依 Supabase 專案資料產生企劃書草稿");
  });

  $("#rewriteBtn").addEventListener("click", () => showToast("已模擬改寫段落，正式版會串接 AI API"));
  $("#saveDraftBtn").addEventListener("click", () => showToast("草稿儲存功能下一步會寫回 proposal_documents"));
  $("#buildSlidesBtn").addEventListener("click", () => {
    renderSlides();
    showToast("已產生簡報大綱");
  });
  $("#exportBtn").addEventListener("click", () => {
    state.exports.unshift({ name: "文化推廣補助計畫_匯出檔.zip", type: "ZIP", time: "剛剛" });
    renderExports();
    showToast("已建立匯出任務");
  });
  $("#documentFileInput").addEventListener("change", (event) =>
    handleSelectedFiles(event, uploadProposalDocuments, "計畫書已上傳並建立文件紀錄。")
  );
  $("#voucherFileInput").addEventListener("change", (event) =>
    handleSelectedFiles(event, uploadVouchers, "憑證已上傳並歸檔到案件。")
  );
  $("#photoFileInput").addEventListener("change", (event) =>
    handleSelectedFiles(event, uploadPhotos, "照片已上傳並加入結案照片紀錄。")
  );
  $("#addVoucherBtn").addEventListener("click", () => $("#voucherFileInput").click());
  $("#addPhotoBtn").addEventListener("click", () => $("#photoFileInput").click());

  document.querySelectorAll("[data-project-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const isNew = button.dataset.projectMode === "new";
      document.querySelectorAll("[data-project-mode]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      $("#newProjectFields").classList.toggle("hidden", !isNew);
      document.querySelector(".existing-project-field")?.classList.toggle("hidden", isNew);
    });
  });

  $("#suggestProjectNamesBtn").addEventListener("click", () => {
    const names = buildProjectNameSuggestions();
    renderProjectNameSuggestions(names);
    showToast("已產生計畫名稱建議。");
  });

  $("#createProjectBtn").addEventListener("click", createNewProjectFromEditor);
  $("#generateCloseoutBtn").addEventListener("click", () => {
    renderCloseout();
    showToast("已依現有資料產生結案報告草稿");
  });
  $("#exportCloseoutBtn").addEventListener("click", () => {
    state.exports.unshift({ name: "文化推廣補助計畫結案報告.docx", type: "DOCX", time: "剛剛" });
    renderExports();
    switchView("exports");
    showToast("已建立結案報告匯出任務");
  });
  $("#savePermissionBtn").addEventListener("click", () => showToast("權限設定已套用於畫面，正式版會寫回 permissions 表"));
  $("#saveCategoryBtn")?.addEventListener("click", () => showToast("分類主檔已套用於畫面，正式版會寫回計畫分類表"));
  $("#saveTemplateBtn").addEventListener("click", () => showToast("範本設定正式版會寫回 templates 表"));
  $("#saveSustainabilityBtn").addEventListener("click", () => showToast("SDGs / ESG 規則正式版會寫回 sustainability_settings 表"));

  document.body.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-type]");
    if (deleteButton) {
      deleteUploadedRecord(deleteButton.dataset.deleteType, deleteButton.dataset.deleteId);
      return;
    }

    const restoreButton = event.target.closest("[data-restore-type]");
    if (restoreButton) {
      restoreTrashRecord(restoreButton.dataset.restoreType, restoreButton.dataset.restoreId);
      return;
    }

    const permanentDeleteButton = event.target.closest("[data-permanent-delete-type]");
    if (permanentDeleteButton) {
      permanentlyDeleteTrashRecord(permanentDeleteButton.dataset.permanentDeleteType, permanentDeleteButton.dataset.permanentDeleteId);
      return;
    }

    const suggestionButton = event.target.closest("[data-suggested-project-name]");
    if (suggestionButton) {
      $("#newProjectName").value = suggestionButton.dataset.suggestedProjectName;
      showToast("已套用建議計畫名稱。");
      return;
    }

    const action = event.target.dataset.action;
    if (action === "upload") $("#documentFileInput").click();
    if (action === "analyze") showToast("AI 分析下一步會串接後端 API");
    if (action === "download") showToast("正式版會下載 Storage 中的匯出檔");
    if (event.target.dataset.viewTarget === "admin") switchView("admin");
  });
}

async function init() {
  bindEvents();
  state.projects = demoProjects;
  state.documents = demoDocuments;
  renderAll();

  supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      showPasswordResetPanel();
      showToast("請設定新密碼。");
    }
  });

  if (isPasswordRecoveryUrl()) {
    showPasswordResetPanel();
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    try {
      await enterDashboard(data.session);
    } catch {
      await supabaseClient.auth.signOut();
    }
  }
}

init();

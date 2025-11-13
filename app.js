// app.js (FINAL) - render bonito + autopopular + sync Firestore + import/export + cache

import { auth } from "./firebase.js";
import { salvarItem, deletarItem, carregarFinancas } from "./firestore.js";
import { contasIniciais } from "./seed.js";

// Local storage key
const STORAGE_KEY = "flow_cache_v1";

// In-memory
let items = [];

// Helpers
const $ = (sel) => document.querySelector(sel);
const moneyBR = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// --- UI: build small control bar (export/import/new) ---
function buildControls() {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.gap = "10px";
  wrapper.style.alignItems = "center";
  wrapper.style.marginBottom = "16px";

  const newBtn = document.createElement("button");
  newBtn.textContent = "+ Novo item";
  newBtn.style.padding = "8px 10px";
  newBtn.style.borderRadius = "10px";
  newBtn.style.background = "#7b61ff";
  newBtn.style.color = "#fff";
  newBtn.onclick = () => openModal();

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Exportar CSV";
  exportBtn.style.padding = "8px 10px";
  exportBtn.onclick = exportCSV;

  const importBtn = document.createElement("button");
  importBtn.textContent = "Importar CSV";
  importBtn.style.padding = "8px 10px";
  importBtn.onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const text = await f.text();
      const parsed = parseCSVToArray(text);
      mergeItemsFromArray(parsed);
    };
    input.click();
  };

  wrapper.appendChild(newBtn);
  wrapper.appendChild(exportBtn);
  wrapper.appendChild(importBtn);

  // insert before cards
  const first = document.body.firstElementChild;
  first ? document.body.insertBefore(wrapper, first.nextSibling) : document.body.appendChild(wrapper);
}

// --- Auth / Load flow ---
auth.onAuthStateChanged(async (user) => {
  if (!user) return (window.location = "login.html");

  try {
    // Try load from Firestore
    let dados = await carregarFinancas();
    // If empty => autopopulate
    if (!dados || dados.length === 0) {
      console.log("Nenhum dado no Firestore — auto-populando com seed.");
      for (const item of contasIniciais) {
        // ensure id exists
        const it = Object.assign({}, item);
        if (!it.id) it.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        await salvarItem(it);
      }
      dados = await carregarFinancas();
    }
    items = dados || [];
    cacheSave(items);
    render();
  } catch (err) {
    // Offline or Firestore failed — load from cache
    console.warn("Falha ao carregar Firestore, usando cache local:", err);
    items = cacheLoad();
    render();
  }

  // Build top controls
  buildControls();

  // Listen network back online to try sync
  window.addEventListener("online", syncLocalToFirestore);
});

// --- Cache helpers ---
function cacheSave(arr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {
    console.warn("Não foi possível salvar cache:", e);
  }
}

function cacheLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// --- Sync local cache to Firestore on reconnect ---
async function syncLocalToFirestore() {
  if (!navigator.onLine) return;
  const cached = cacheLoad();
  if (!cached || !cached.length) return;
  try {
    for (const it of cached) {
      await salvarItem(it);
    }
    // reload from server
    items = await carregarFinancas();
    cacheSave(items);
    render();
    console.log("Sincronização local -> Firestore concluída.");
  } catch (e) {
    console.warn("Erro durante sync:", e);
  }
}

// --- Render: cards bonitos ---
function render() {
  const container = document.getElementById("cards");
  if (!container) return;
  container.innerHTML = "";

  // optionally sort: incomes first, then goals, then expenses
  const sorted = items.slice().sort((a, b) => {
    const order = { income: 0, investment: 1, cofrinho: 2, goal: 3, fixed: 4, variable: 5, limit: 6 };
    return (order[a.type] || 99) - (order[b.type] || 99);
  });

  for (const i of sorted) {
    const card = document.createElement("div");
    card.className = "card";

    // cover (optional image or gradient by type)
    const cover = document.createElement("div");
    cover.className = "card-cover";
    // subtle different gradient per type
    if (i.type === "income") cover.style.backgroundImage = "linear-gradient(90deg,#d1f7e7,#bff6ff)";
    else if (i.type === "fixed") cover.style.backgroundImage = "linear-gradient(90deg,#fff4d6,#ffd6e6)";
    else if (i.type === "variable") cover.style.backgroundImage = "linear-gradient(90deg,#e9ecff,#f3e8ff)";
    else if (i.type === "goal") cover.style.backgroundImage = "linear-gradient(90deg,#ffd6a5,#ffb6b9)";
    else if (i.type === "cofrinho") cover.style.backgroundImage = "linear-gradient(90deg,#fff1e6,#fff6d6)";
    else cover.style.backgroundImage = "linear-gradient(90deg,#e6f7ff,#e6ffe6)";

    const content = document.createElement("div");
    content.className = "card-content";

    // tipo
    const tipo = document.createElement("div");
    tipo.className = "card-type";
    tipo.innerText = traduzirTipo(i.type);

    // título (editable)
    const title = document.createElement("div");
    title.className = "card-title";
    title.contentEditable = true;
    title.innerText = i.title || "(sem título)";
    title.addEventListener("blur", async (e) => {
      i.title = e.target.innerText.trim();
      await trySaveLocalThenRemote(i);
    });

    // owner
    const owner = document.createElement("div");
    owner.className = "card-owner";
    owner.innerText = i.owner || "";

    // valor
    const val = document.createElement("div");
    val.className = "card-value";
    val.innerText = moneyBR(i.value);

    // tags
    const tagsWrap = document.createElement("div");
    tagsWrap.className = "card-tags";
    (i.tags || []).forEach((t) => {
      const tag = document.createElement("div");
      tag.className = "tag";
      tag.innerText = t;
      tagsWrap.appendChild(tag);
    });

    content.appendChild(tipo);
    content.appendChild(title);
    content.appendChild(owner);
    content.appendChild(val);
    content.appendChild(tagsWrap);

    // progresso (para goals/cofrinho)
    if (i.type === "goal" || i.type === "cofrinho") {
      const box = document.createElement("div");
      box.className = "progress-box";

      const label = document.createElement("div");
      label.className = "progress-label";
      label.innerText = "Progresso";

      const bar = document.createElement("div");
      bar.className = "progress-bar";

      const fill = document.createElement("div");
      fill.className = "progress-fill";
      const pct = Math.min(100, Math.round(((i.progress || 0) / (i.target || (i.value || 1))) * 100));
      fill.style.width = pct + "%";

      bar.appendChild(fill);

      const pctText = document.createElement("div");
      pctText.className = "progress-percent";
      pctText.innerText = pct + "%";

      box.appendChild(label);
      box.appendChild(bar);
      box.appendChild(pctText);

      content.appendChild(box);
    }

    // actions
    const actions = document.createElement("div");
    actions.className = "card-actions";

    const btnEdit = document.createElement("button");
    btnEdit.className = "btn-small";
    btnEdit.innerText = "Editar";
    btnEdit.onclick = () => openModal(i);

    const btnDel = document.createElement("button");
    btnDel.className = "btn-small";
    btnDel.innerText = "Excluir";
    btnDel.onclick = async () => {
      if (!confirm("Excluir item?")) return;
      try {
        await deletarItem(i.id);
      } catch (e) {
        // if offline, remove locally and mark to sync later
        console.warn("Remoção Firestore falhou, removendo local e salvando cache:", e);
      }
      items = items.filter((x) => x.id !== i.id);
      cacheSave(items);
      render();
    };

    actions.appendChild(btnEdit);
    actions.appendChild(btnDel);
    content.appendChild(actions);

    card.appendChild(cover);
    card.appendChild(content);
    container.appendChild(card);
  }
}

// --- utility to translate types
function traduzirTipo(t) {
  return {
    income: "Renda",
    fixed: "Despesa Fixa",
    variable: "Despesa Variável",
    goal: "Meta",
    cofrinho: "Cofrinho",
    limit: "Limite",
    investment: "Investimento"
  }[t] || t;
}

// --- try save locally then remote
async function trySaveLocalThenRemote(item) {
  // ensure id
  if (!item.id) item.id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);

  // update local list
  const idx = items.findIndex((x) => x.id === item.id);
  if (idx >= 0) items[idx] = item;
  else items.unshift(item);

  cacheSave(items);
  render();

  // try remote
  if (navigator.onLine) {
    try {
      await salvarItem(item);
      // refresh from server
      items = await carregarFinancas();
      cacheSave(items);
      render();
    } catch (e) {
      console.warn("Falha ao salvar no Firestore, mantido no cache:", e);
    }
  } else {
    console.log("Offline — item salvo no cache, será sincronizado ao reconectar.");
  }
}

// --- Modal for new/edit item
function openModal(editItem) {
  // create modal only if not exists
  if (document.getElementById("flow-modal")) {
    populateModal(editItem);
    return;
  }

  const modal = document.createElement("div");
  modal.id = "flow-modal";
  Object.assign(modal.style, {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
  });

  const card = document.createElement("div");
  Object.assign(card.style, { background: "#fff", padding: "18px", borderRadius: "12px", width: "340px", maxWidth: "92%" });

  card.innerHTML = `
    <h3 id="modal-title">Novo item</h3>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
      <input id="m_title" placeholder="Título" style="padding:10px;border-radius:8px;" />
      <input id="m_subtitle" placeholder="Subtítulo" style="padding:10px;border-radius:8px;" />
      <select id="m_type" style="padding:10px;border-radius:8px;">
        <option value="income">Renda</option>
        <option value="fixed">Despesa Fixa</option>
        <option value="variable">Despesa Variável</option>
        <option value="goal">Meta</option>
        <option value="cofrinho">Cofrinho</option>
        <option value="limit">Limite</option>
        <option value="investment">Investimento</option>
      </select>
      <input id="m_owner" placeholder="Responsável" style="padding:10px;border-radius:8px;" />
      <input id="m_value" placeholder="Valor (ex: 150.00)" style="padding:10px;border-radius:8px;" />
      <input id="m_target" placeholder="Meta/Alvo (opcional)" style="padding:10px;border-radius:8px;" />
      <input id="m_progress" placeholder="Guardado/Gasto até agora (opcional)" style="padding:10px;border-radius:8px;" />
      <input id="m_tags" placeholder="tags separados por vírgula" style="padding:10px;border-radius:8px;" />
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px;">
        <button id="m_cancel" style="padding:8px 12px;border-radius:8px;">Cancelar</button>
        <button id="m_save" style="padding:8px 12px;border-radius:8px;background:#00cc94;color:#fff;border:none;">Salvar</button>
      </div>
    </div>
  `;

  modal.appendChild(card);
  document.body.appendChild(modal);

  document.getElementById("m_cancel").onclick = () => { modal.remove(); };
  document.getElementById("m_save").onclick = async () => {
    const it = {
      id: editItem ? editItem.id : Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      title: document.getElementById("m_title").value.trim(),
      subtitle: document.getElementById("m_subtitle").value.trim(),
      type: document.getElementById("m_type").value,
      owner: document.getElementById("m_owner").value.trim(),
      value: parseFloat((document.getElementById("m_value").value || "0").replace(",",".")) || 0,
      target: parseFloat((document.getElementById("m_target").value || "0").replace(",", ".")) || 0,
      progress: parseFloat((document.getElementById("m_progress").value || "0").replace(",", ".")) || 0,
      tags: (document.getElementById("m_tags").value || "").split(",").map(s => s.trim()).filter(Boolean)
    };
    await trySaveLocalThenRemote(it);
    modal.remove();
  };

  populateModal(editItem);
}

function populateModal(editItem) {
  if (!editItem) {
    document.getElementById("modal-title").innerText = "Novo item";
    document.getElementById("m_title").value = "";
    document.getElementById("m_subtitle").value = "";
    document.getElementById("m_type").value = "variable";
    document.getElementById("m_owner").value = "";
    document.getElementById("m_value").value = "";
    document.getElementById("m_target").value = "";
    document.getElementById("m_progress").value = "";
    document.getElementById("m_tags").value = "";
    return;
  }
  document.getElementById("modal-title").innerText = "Editar item";
  document.getElementById("m_title").value = editItem.title || "";
  document.getElementById("m_subtitle").value = editItem.subtitle || "";
  document.getElementById("m_type").value = editItem.type || "variable";
  document.getElementById("m_owner").value = editItem.owner || "";
  document.getElementById("m_value").value = editItem.value || "";
  document.getElementById("m_target").value = editItem.target || "";
  document.getElementById("m_progress").value = editItem.progress || "";
  document.getElementById("m_tags").value = (editItem.tags || []).join(", ");
}

// --- CSV export
function exportCSV() {
  const cols = ['id','type','title','subtitle','owner','value','target','progress','date','tags'];
  const rows = [cols.join(',')].concat(items.map(it => cols.map(c => {
    let v = it[c] === undefined ? '' : it[c];
    if (Array.isArray(v)) v = v.join(';');
    // escape
    return `"${String(v).replace(/"/g,'""')}"`;
  }).join(',')));
  const blob = new Blob([rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "flow_export.csv";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// --- CSV parse (robust split)
function parseCSVToArray(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines.shift().split(',').map(h => h.replace(/"/g,'').trim());
  const parsed = lines.map(l => {
    const cols = l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c => c.replace(/^"|"$/g,''));
    const obj = {};
    headers.forEach((h,i) => { obj[h] = cols[i] || ''; });
    if (obj.tags) obj.tags = obj.tags.split(';').filter(Boolean);
    obj.value = parseFloat((obj.value || '0').replace(',', '.')) || 0;
    obj.target = parseFloat((obj.target || '0').replace(',', '.')) || 0;
    obj.progress = parseFloat((obj.progress || '0').replace(',', '.')) || 0;
    obj.id = obj.id || '';
    return obj;
  });
  return parsed;
}

// --- merge items from CSV (dedupe by type+title+value+date+owner)
async function mergeItemsFromArray(parsed) {
  if (!parsed || !parsed.length) return alert("CSV vazio ou inválido.");
  const existingKeys = new Set(items.map(k => keyOf(k)));
  const toAdd = [];
  for (const it of parsed) {
    const k = keyOf(it);
    if (existingKeys.has(k)) continue;
    if (!it.id) it.id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    toAdd.push(it);
    existingKeys.add(k);
  }
  // save each
  for (const it of toAdd) {
    await trySaveLocalThenRemote(it);
  }
  alert(`Importação concluída. ${toAdd.length} item(s) adicionados.`);
}

// key generator
function keyOf(it) {
  return `${it.type}||${(it.title||'').trim().toLowerCase()}||${String(it.value||'0')}||${it.date||''}||${(it.owner||'').trim().toLowerCase()}`;
}

// --- Logout helper
window.logout = () => auth.signOut().then(()=> window.location="login.html");

// --- initial render call if items already present
document.addEventListener("DOMContentLoaded", () => {
  // if user already loaded items (auth.onAuthStateChanged will call render)
  const container = document.getElementById("cards");
  if (!container) {
    // nothing
  }
});

// app.js - enhanced cards prototype with metas, cofrinho, limites, investimentos
const STORAGE_KEY = 'flow_cards_vfinal';
let items = [];

const sample = [
  // metas (goal) with target and progress
  {id:'g1', type:'goal', title:'Viagem Bali', subtitle:'Meta de viagem', owner:'Família', value:15000, target:15000, progress:1200, date:'2025-12-01', image:'', tags:['viagem','curto prazo']},
  {id:'g2', type:'goal', title:'Macbook 14 Pro', subtitle:'Meta tech', owner:'Thiago', value:15000, target:15000, progress:3000, date:'2025-12-01', image:'', tags:['eletrônicos']},
  // cofrinho (monthly savings goals)
  {id:'c1', type:'cofrinho', title:'Cofrinho Mensal', subtitle:'Meta do mês', owner:'Thiago', value:300, target:3600, progress:1700, date:'2025', image:'', tags:['poupança']},
  // limits per category
  {id:'l1', type:'limit', title:'Limite - Mercado', subtitle:'Alimentação', owner:'Casa', value:1000, progress:930, date:'2025-06', image:'', tags:['limite','mercado']},
  {id:'l2', type:'limit', title:'Limite - Combustível', subtitle:'Transporte', owner:'Thiago', value:1000, progress:700, date:'2025-06', image:'', tags:['limite','combustível']},
  // investments
  {id:'i1', type:'investment', title:'CDB', subtitle:'Mercado Pago', owner:'Investimentos', value:10000, date:'2025-01-01', image:'', tags:['renda fixa']},
  {id:'i2', type:'investment', title:'Bitcoin', subtitle:'C6 Bank', owner:'Investimentos', value:2500, date:'2025-01-01', image:'', tags:['renda variável']},
  // incomes and expenses (examples)
  {id:'e1', type:'income', title:'Salário Thiago (média)', subtitle:'Renda', owner:'Thiago', value:5500, date:'2025-01-01', tags:[]},
  {id:'e2', type:'variable', title:'Gasolina', subtitle:'Transporte', owner:'Thiago', value:350, date:'2025-06-12', tags:[]},
  {id:'e3', type:'fixed', title:'Internet/Telefone', subtitle:'Despesa Fixa', owner:'Casa', value:128.99, date:'2025-01-05', tags:[]},
];

function load(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){ try{ items = JSON.parse(raw); }catch(e){ items = sample; } }
  else { items = sample; save(); }
  render();
}

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); renderSummary(); }

function formatBR(v){ return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

function renderSummary(){
  const income = items.filter(i=>i.type==='income').reduce((s,i)=>s+Number(i.value||0),0);
  const expense = items.filter(i=>i.type!=='income' && i.type!=='investment' && i.type!=='goal' && i.type!=='cofrinho' && i.type!=='limit').reduce((s,i)=>s+Number(i.value||0),0);
  document.getElementById('totalIncome').innerText = formatBR(income);
  document.getElementById('totalExpense').innerText = formatBR(expense);
  document.getElementById('balance').innerText = formatBR(income-expense);
}

function render(){
  const container = document.getElementById('cards'); container.innerHTML='';
  const filter = document.getElementById('filterType').value;
  const q = document.getElementById('search').value.toLowerCase();
  items.filter(i=>{ if(filter!=='all' && i.type!==filter) return false; if(q && !( (i.title||'') + (i.subtitle||'') + (i.owner||'') ).toLowerCase().includes(q)) return false; return true; }).forEach(i=>{
    const el = document.createElement('article'); el.className='card'; el.dataset.id=i.id; el.dataset.type=i.type;
    const coverStyle = i.image ? `style="background-image:url('${i.image}')"` : '';
    el.innerHTML = `
      <div class="cover" ${coverStyle}></div>
      <div class="pad">
        <div class="type">${i.subtitle||i.type}</div>
        <div class="title" contenteditable="true">${escapeHtml(i.title)}</div>
        <div class="subtitle">${i.owner||''}</div>
        <div class="value">${formatBR(i.value)}</div>
        <div class="meta"></div>
      </div>`;

    // add specific UI parts per type
    const meta = el.querySelector('.meta');
    if(i.type==='goal' || i.type==='cofrinho' || i.type==='limit'){
      const target = Number(i.target||i.value||0);
      const progress = Number(i.progress||0);
      const pct = target>0 ? Math.max(0, Math.min(100, Math.round((progress/target)*100))) : 0;
      meta.innerHTML = `<div class="badge">Meta: ${formatBR(target)}</div>
        <div class="badge">Guardado: ${formatBR(progress)}</div>
        <div class="progress"><i style="width:${pct}%"></i></div>
        <div class="badge">${pct}%</div>`;
    } else if(i.type==='investment'){
      meta.innerHTML = `<div class="badge">Investido: ${formatBR(i.value)}</div>`;
    } else if(i.type==='limit'){
      // handled above in goal-like
    } else {
      meta.innerHTML = `<div class="tag">${(i.tags||[]).join(', ')}</div>`;
    }

    // actions
    const actions = document.createElement('div'); actions.className='actions';
    const editBtn = document.createElement('button'); editBtn.className='btn-small'; editBtn.innerText='Editar';
    const delBtn = document.createElement('button'); delBtn.className='btn-small'; delBtn.innerText='×';
    actions.appendChild(editBtn); actions.appendChild(delBtn); el.appendChild(actions);

    // inline edit handlers
    el.querySelector('.title').addEventListener('blur', e=>{ const it=find(i.id); it.title = e.target.innerText.trim(); save(); });
    editBtn.addEventListener('click', ()=> openModal(i));
    delBtn.addEventListener('click', ()=>{ if(confirm('Apagar item?')){ remove(i.id); } });

    container.appendChild(el);
  });
  renderSummary();
}

function escapeHtml(s){ return (s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
function find(id){ return items.find(x=>x.id===id); }
function remove(id){ items = items.filter(x=>x.id!==id); save(); }
function newid(){ return Date.now().toString(36); }

// modal interactions
function openModal(item){
  const modal = document.getElementById('modal'); const form = document.getElementById('itemForm');
  modal.classList.remove('hidden'); form.dataset.edit = item ? item.id : '';
  document.getElementById('modalTitle').innerText = item ? 'Editar item' : 'Novo item';
  form.title.value = item ? item.title : '';
  form.subtitle.value = item ? item.subtitle : '';
  form.type.value = item ? item.type : 'variable';
  form.owner.value = item ? item.owner : '';
  form.value.value = item ? item.value : '';
  form.target.value = item ? item.target||'' : '';
  form.progress.value = item ? item.progress||'' : '';
  form.date.value = item ? item.date : '';
  form.tags.value = item ? (item.tags||[]).join(',') : '';
  form.image.value = item ? item.image||'' : '';
}

document.getElementById('newItem').addEventListener('click', ()=> openModal());
document.getElementById('cancelBtn').addEventListener('click', ()=> document.getElementById('modal').classList.add('hidden'));
document.getElementById('itemForm').addEventListener('submit', e=>{
  e.preventDefault(); const f=e.target; const id=f.dataset.edit || newid();
  const obj = {
    id,
    title: f.title.value.trim(),
    subtitle: f.subtitle.value.trim(),
    type: f.type.value,
    owner: f.owner.value.trim(),
    value: parseFloat((f.value.value||'0').replace(',','.'))||0,
    target: parseFloat((f.target.value||'0').replace(',','.'))||0,
    progress: parseFloat((f.progress.value||'0').replace(',','.'))||0,
    date: f.date.value || '',
    tags: f.tags.value ? f.tags.value.split(',').map(t=>t.trim()) : [],
    image: f.image.value || ''
  };
  const existing = find(id);
  if(existing) Object.assign(existing,obj); else items.unshift(obj);
  f.reset(); document.getElementById('modal').classList.add('hidden'); save();
});

// CSV export/import (full schema)
function exportCSV(){
  const cols = ['id','type','title','subtitle','owner','value','target','progress','date','tags','image'];
  const rows = [cols.join(',')].concat(items.map(it=>cols.map(c=>{
    let v = it[c]===undefined?'':it[c];
    if(Array.isArray(v)) v = v.join(';');
    return `"${String(v).replace(/"/g,'""')}"`;
  }).join(',')));
  const blob = new Blob([rows.join('\\n')],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='flow_export.csv'; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
}
document.getElementById('exportBtn').addEventListener('click', exportCSV);
document.getElementById('importBtn').addEventListener('click', ()=> document.getElementById('fileInput').click());
document.getElementById('fileInput').addEventListener('change', e=>{ const f=e.target.files[0]; if(!f) return; const reader=new FileReader(); reader.onload=ev=>{ parseCSV(ev.target.result); }; reader.readAsText(f,'utf-8'); });
function parseCSV(text){
  const lines = text.split(/\\r?\\n/).filter(Boolean); if(!lines.length) return;
  const headers = lines.shift().split(',').map(h=>h.replace(/"/g,'').trim());
  const parsed = lines.map(l=>{ const cols = l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c=>c.replace(/^"|"$/g,'')); const obj={}; headers.forEach((h,i)=> obj[h]=cols[i]||''); if(obj.tags) obj.tags = obj.tags.split(';').filter(Boolean); obj.value = parseFloat((obj.value||'0').replace(',','.'))||0; obj.target = parseFloat((obj.target||'0').replace(',','.'))||0; obj.progress = parseFloat((obj.progress||'0').replace(',','.'))||0; obj.id = obj.id || newid(); return obj; });
  items = parsed; save(); alert('Importado ('+items.length+' itens)');
}

// placeholder firebase action (requires firebaseConfig in firebase.js)
document.getElementById('syncBtn').addEventListener('click', ()=> alert('Para conectar, cole seu firebaseConfig em firebase.js e reabra.'));

// init
load();

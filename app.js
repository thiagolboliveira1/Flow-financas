// app.js - FLOW (versão final pronta)
// Requer: firebase-app-compat + firebase-auth-compat + firebase-firestore-compat (carregados no index.html)
// NOTA: se for usar outro projeto Firebase substitua o firebaseConfig abaixo.

// ---------------------------
// Configuração Firebase (use a sua)
// ---------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCrxOosiL8YqIB8yf5v9xq0Dje_AiE31pU",
  authDomain: "flow-financeiro-61209.firebaseapp.com",
  projectId: "flow-financeiro-61209",
  storageBucket: "flow-financeiro-61209.firebasestorage.app",
  messagingSenderId: "370100494331",
  appId: "1:370100494331:web:b4eaad52efa988ab15355e"
};

// Inicializa Firebase (compat)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
db.enablePersistence && db.enablePersistence().catch(()=>{ /* se não suportar no browser */ });

// ---------------------------
// Utilitários
// ---------------------------
const $ = id => document.getElementById(id);
function moneyToNumber(str){
  if(!str) return 0;
  return parseFloat(String(str).replace(/[R$\s.]/g,'').replace(',','.')) || 0;
}
function formatMoney(v){
  return 'R$ ' + v.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
}

// ---------------------------
// Importar dados da Família (dados base que você me passou)
// ---------------------------
const defaultContas = [
  // RENDAS
  { tipo: "Renda", descricao: "Salário Thiago (média)", valor: 5500, periodicidade: "mensal" },
  { tipo: "Renda", descricao: "Salário Adriele (média)", valor: 600, periodicidade: "mensal" },

  // DESPESAS FIXAS
  { tipo: "Despesa Fixa", descricao: "Aluguel", valor: 1600, vencimento: 1 },
  { tipo: "Despesa Fixa", descricao: "Luz (variável)", valor: 278.96, vencimento: 30 },
  { tipo: "Despesa Fixa", descricao: "Água (variável)", valor: 137.26, vencimento: 12 },
  { tipo: "Despesa Fixa", descricao: "Mercado", valor: 500, vencimento: 10 },
  { tipo: "Despesa Fixa", descricao: "Internet / Telefone", valor: 128.99, vencimento: 25 },
  { tipo: "Despesa Fixa", descricao: "Carro (parcela)", valor: 767.32, vencimento: 15 },
  { tipo: "Despesa Fixa", descricao: "Cartão Nubank (parcela)", valor: 232.78, vencimento: 20 },
  { tipo: "Despesa Fixa", descricao: "Ailos (24x)", valor: 196.63, vencimento: 20 },
  { tipo: "Despesa Fixa", descricao: "TIM móvel", valor: 48.99, vencimento: 5 },
  { tipo: "Despesa Fixa", descricao: "Cartão Gabriel (Sofá)", valor: 250, vencimento: 10 },

  // DESPESAS VARIÁVEIS
  { tipo: "Despesa Variável", descricao: "Lazer", valor: 150 },
  { tipo: "Despesa Variável", descricao: "Delivery", valor: 0 },
  { tipo: "Despesa Variável", descricao: "Farmácia (mês)", valor: 150 },
  { tipo: "Despesa Variável", descricao: "Gasolina", valor: 250 },
  { tipo: "Despesa Variável", descricao: "Empréstimo Jeitto", valor: 221.10, vencimento: 10 },
  { tipo: "Despesa Variável", descricao: "Empréstimo W (2x)", valor: 300 },
  { tipo: "Despesa Variável", descricao: "MEI (regularizar)", valor: 100 },
  { tipo: "Despesa Variável", descricao: "Manutenção preventiva carro", valor: 2300 },
  { tipo: "Despesa Variável", descricao: "DPVAT", valor: 94.61, vencimento: 31 },
  { tipo: "Despesa Variável", descricao: "Multa", valor: 137.89 },

  // DÍVIDAS / METAS
  { tipo: "Meta", descricao: "Pagar Andrey (negociar)", valor: 3000 },
  { tipo: "Meta", descricao: "Pagar Gabriel (negociar)", valor: 2000 },
  { tipo: "Meta", descricao: "Limpar Serasa Thiago (Claro)", valor: 325.52 },
  { tipo: "Meta", descricao: "Limpar Serasa Thiago (Shoppe)", valor: 173.59 },
  { tipo: "Meta", descricao: "Limpar nome Adriele", valor: 3000 },
  { tipo: "Meta", descricao: "Poupança emergencial (objetivo)", valor: 5000 },
  { tipo: "Meta", descricao: "13º do Thiago (reservar)", valor: 5500 }
];

// ---------------------------
// Função: importa todos os itens default no Firestore (coleção "contas")
// ---------------------------
async function importFamiliaOliveira(){
  try{
    $('importStatus') && ($('importStatus').innerText = "Importando dados...");
    const batch = db.batch();
    const root = db.collection('contas');
    defaultContas.forEach(item => {
      const doc = root.doc(); // id novo
      const payload = Object.assign({}, item, { criadoEm: firebase.firestore.FieldValue.serverTimestamp() });
      batch.set(doc, payload);
    });
    await batch.commit();
    $('importStatus') && ($('importStatus').innerText = "✅ Contas importadas com sucesso!");
    renderContas(); // atualiza tela
  }catch(err){
    console.error(err);
    $('importStatus') && ($('importStatus').innerText = "Erro ao importar: " + err.message);
    alert("Erro ao importar dados: " + err.message);
  }
}

// ---------------------------
// Renderiza KPIs e Contas
// ---------------------------
async function calcKPIs(){
  const snapshot = await db.collection('contas').get();
  let entradas = 0, saidas = 0;
  snapshot.forEach(doc => {
    const d = doc.data();
    if(d.tipo && d.tipo.toLowerCase().includes('renda')) entradas += Number(d.valor) || 0;
    else if(d.tipo && (d.tipo.toLowerCase().includes('despesa') || d.tipo.toLowerCase().includes('meta'))) saidas += Number(d.valor) || 0;
  });
  const saldo = entradas - saidas;
  $('incomeValue').innerText = formatMoney(entradas);
  $('expenseValue').innerText = formatMoney(saidas);
  $('balanceValue').innerText = formatMoney(saldo);
}

async function renderContas(){
  // remove lista antiga se existir
  const existing = document.querySelector('.contas-list');
  if(existing) existing.remove();

  const lista = document.createElement('section');
  lista.classList.add('contas-list');
  lista.innerHTML = "<h2>Minhas Contas</h2>";
  document.body.appendChild(lista);

  const snapshot = await db.collection('contas').orderBy('tipo').get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const item = document.createElement('div');
    item.classList.add('conta-item');
    item.innerHTML = `
      <strong>${data.tipo}:</strong> ${data.descricao || ''} <br>
      Valor: <span class="valor" contenteditable="true" data-id="${doc.id}">${Number(data.valor || 0).toFixed(2).replace('.',',')}</span>
      ${data.vencimento ? `<div class="venc">Vence dia: ${data.vencimento}</div>` : ''}
      <hr>
    `;
    lista.appendChild(item);
  });

  // adiciona evento de salvar blur
  document.querySelectorAll('.valor').forEach(el => {
    el.addEventListener('blur', async (e) => {
      const id = e.target.getAttribute('data-id');
      const raw = e.target.textContent.trim().replace(/\./g,'').replace(',','.');
      const novo = parseFloat(raw);
      if(isNaN(novo)){
        alert('Valor inválido');
        return;
      }
      try{
        await db.collection('contas').doc(id).update({ valor: novo });
        alert('💾 Valor atualizado!');
        calcKPIs();
      }catch(err){
        alert('Erro ao salvar: ' + err.message);
      }
    });
  });
}

// ---------------------------
// Adicionar transação simples (usa colecao "transacoes")
// ---------------------------
async function addTransaction(tipo, descricao, valor){
  try{
    await db.collection('transacoes').add({
      tipo, descricao, valor: Number(valor), criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
    // opcional: também adiciona como item na coleção 'contas' se quiser
    await calcKPIs();
    alert('Transação registrada!');
  }catch(err){
    alert('Erro: ' + err.message);
  }
}

// ---------------------------
// Eventos UI
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
  // botões de importar e de adicionar
  const importBtn = $('importData');
  if(importBtn) importBtn.addEventListener('click', importFamiliaOliveira);

  const addIncomeBtn = $('addIncome');
  if(addIncomeBtn) addIncomeBtn.addEventListener('click', async ()=>{
    const v = prompt('Valor da receita (ex: 4500.00)');
    if(!v) return;
    const desc = prompt('Descrição (ex: Venda / Salário)');
    await addTransaction('Receita', desc || 'Receita', moneyToNumber(v));
    calcKPIs();
  });

  const addExpenseBtn = $('addExpense');
  if(addExpenseBtn) addExpenseBtn.addEventListener('click', async ()=>{
    const v = prompt('Valor da despesa (ex: 120.00)');
    if(!v) return;
    const desc = prompt('Descrição (ex: Mercado / Gasolina)');
    await addTransaction('Despesa', desc || 'Despesa', moneyToNumber(v));
    calcKPIs();
  });

  // Autenticação simples: mostra modal se não logado
  const authModal = $('authModal');
  const btnSignIn = $('btnSignIn');
  const btnSignUp = $('btnSignUp');
  const btnSignOut = $('btnSignOut');
  const userBar = $('userBar');
  const userEmail = $('userEmail');
  const authMsg = $('authMsg');

  if(btnSignIn) btnSignIn.addEventListener('click', async ()=>{
    const email = $('email').value.trim();
    const pw = $('password').value.trim();
    if(!email || !pw) return authMsg && (authMsg.innerText = 'Preencha e-mail e senha');
    try{
      await auth.signInWithEmailAndPassword(email, pw);
      authModal.style.display = 'none';
    }catch(err){
      authMsg && (authMsg.innerText = 'Erro: ' + err.message);
    }
  });

  if(btnSignUp) btnSignUp.addEventListener('click', async ()=>{
    const email = $('email').value.trim();
    const pw = $('password').value.trim();
    if(!email || !pw) return authMsg && (authMsg.innerText = 'Preencha e-mail e senha');
    try{
      await auth.createUserWithEmailAndPassword(email, pw);
      authModal.style.display = 'none';
    }catch(err){
      authMsg && (authMsg.innerText = 'Erro: ' + err.message);
    }
  });

  if(btnSignOut) btnSignOut.addEventListener('click', async ()=>{
    await auth.signOut(); // assíncrono
  });

  // Listener de autenticação
  auth.onAuthStateChanged(user => {
    if(user){
      // logado
      userBar.style.display = 'flex';
      userEmail.innerText = user.email;
      if(authModal) authModal.style.display = 'none';
      // já renderiza
      renderContas();
      calcKPIs();
    }else{
      // não logado
      if(authModal) authModal.style.display = 'flex';
      userBar.style.display = 'none';
    }
  });

  // Render inicial (se já tiver sessão)
  renderContas();
  calcKPIs();
});

// ---------------------------
// Exports / helpers para debug (opcional)
// ---------------------------
window._FLOW = {
  importFamiliaOliveira,
  renderContas,
  calcKPIs
};

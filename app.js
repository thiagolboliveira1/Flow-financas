// app.js - Flow PWA (compat SDK)
// -------------------------------
// >>> Antes de rodar: cole sua firebaseConfig abaixo <<<

const firebaseConfig = {
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // permite leitura/escrita apenas para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

// Inicializa Firebase (compat)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM refs
const authModal = document.getElementById('authModal');
const emailEl = document.getElementById('email');
const passEl = document.getElementById('password');
const btnSignIn = document.getElementById('btnSignIn');
const btnSignUp = document.getElementById('btnSignUp');
const authMsg = document.getElementById('authMsg');
const userBar = document.getElementById('userBar');
const userEmail = document.getElementById('userEmail');
const btnSignOut = document.getElementById('btnSignOut');

const incomeValue = document.getElementById('incomeValue');
const expenseValue = document.getElementById('expenseValue');
const balanceValue = document.getElementById('balanceValue');

const addIncomeBtn = document.getElementById('addIncome');
const addExpenseBtn = document.getElementById('addExpense');
const importBtn = document.getElementById('importData');
const importStatus = document.getElementById('importStatus');

const goalProgress = document.getElementById('goalProgress');
const goalLabel = document.getElementById('goalLabel');
const addGoalBtn = document.getElementById('addGoal');

// --- Auth UI ---
function showAuth(show){
  authModal.setAttribute('aria-hidden', show ? 'false' : 'true');
}
auth.onAuthStateChanged(user => {
  if(user){
    showAuth(false);
    userBar.style.display = 'flex';
    userEmail.textContent = user.email;
    // render data
    renderContas();
    renderGoal();
  } else {
    userBar.style.display = 'none';
    // pedir login
    showAuth(true);
  }
});

btnSignUp.addEventListener('click', async () => {
  const email = emailEl.value.trim();
  const pass = passEl.value;
  if(!email || !pass) return authMsg.textContent = 'Preencha e-mail e senha.';
  try{
    await auth.createUserWithEmailAndPassword(email, pass);
    authMsg.textContent = 'Conta criada e logado!';
  }catch(e){
    authMsg.textContent = e.message;
  }
});

btnSignIn.addEventListener('click', async () => {
  const email = emailEl.value.trim();
  const pass = passEl.value;
  if(!email || !pass) return authMsg.textContent = 'Preencha e-mail e senha.';
  try{
    await auth.signInWithEmailAndPassword(email, pass);
    authMsg.textContent = '';
  }catch(e){
    authMsg.textContent = e.message;
  }
});

btnSignOut.addEventListener('click', () => auth.signOut());

// --- Funções de UI/DB ---
async function renderContas(){
  // limpa listas prévias
  const existing = document.querySelector('.contas-list');
  if(existing) existing.remove();

  const lista = document.createElement('section');
  lista.classList.add('contas-list');
  lista.innerHTML = '<h2>Minhas Contas</h2>';
  document.body.appendChild(lista);

  const snapshot = await db.collection('contas').orderBy('tipo').get();
  let entradas = 0, saidas = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    const item = document.createElement('div');
    item.className = 'conta-item';
    const valor = (data.valor || 0);
    if(data.tipo && data.tipo.toLowerCase().includes('renda')) entradas += valor;
    if(data.tipo && data.tipo.toLowerCase().includes('despesa')) saidas += valor;

    item.innerHTML = `
      <strong>${data.tipo}:</strong> ${data.descricao || ''}
      <div>Valor: <span class="valor" contenteditable="true" data-id="${doc.id}">${valor.toFixed(2)}</span></div>
      <div class="muted">Venc: ${data.vencimento || '-'}</div>
      <hr>
    `;
    lista.appendChild(item);
  });

  incomeValue.textContent = `R$ ${entradas.toFixed(2)}`;
  expenseValue.textContent = `R$ ${saidas.toFixed(2)}`;
  balanceValue.textContent = `R$ ${(entradas - saidas).toFixed(2)}`;

  // permite editar valores (on blur atualiza no Firestore)
  document.querySelectorAll('.valor').forEach(el => {
    el.addEventListener('blur', async () => {
      const id = el.getAttribute('data-id');
      const novo = parseFloat(el.textContent.replace(',', '.')) || 0;
      try{
        await db.collection('contas').doc(id).update({ valor: novo });
        alert('💾 Valor atualizado!');
        renderContas(); // re-render
      }catch(e){
        alert('Erro ao atualizar: ' + e.message);
      }
    });
  });
}

// --- Meta (goals) simples ---
async function renderGoal(){
  const q = await db.collection('goals').limit(1).get();
  if(q.empty){
    goalProgress.value = 0;
    goalLabel.textContent = 'Meta: R$ 0 / R$ 0';
    return;
  }
  const doc = q.docs[0];
  const g = doc.data();
  const atual = g.atual || 0;
  const alvo = g.alvo || 0;
  const pct = alvo > 0 ? Math.min(100, Math.round((atual / alvo) * 100)) : 0;
  goalProgress.value = pct;
  goalLabel.textContent = `Meta: R$ ${atual.toFixed(2)} / R$ ${alvo.toFixed(2)}`;
}
addGoalBtn.addEventListener('click', async () => {
  const alvo = parseFloat(prompt('Valor da meta (R$):') || '0');
  if(isNaN(alvo) || alvo<=0) return;
  await db.collection('goals').add({alvo, atual:0, createdAt: firebase.firestore.Timestamp.now()});
  renderGoal();
});

// --- Adicionar receita/despesa rápido (apenas cria documento) ---
addIncomeBtn.addEventListener('click', async () => {
  const desc = prompt('Descrição da receita:','Venda / Recebimento') || 'Receita';
  const valor = parseFloat(prompt('Valor (R$):','0') || '0');
  if(isNaN(valor)) return alert('Valor inválido');
  await db.collection('contas').add({
    tipo:'Renda',
    descricao: desc,
    valor,
    createdAt: firebase.firestore.Timestamp.now()
  });
  renderContas();
});

addExpenseBtn.addEventListener('click', async () => {
  const desc = prompt('Descrição da despesa:','Despesa') || 'Despesa';
  const valor = parseFloat(prompt('Valor (R$):','0') || '0');
  if(isNaN(valor)) return alert('Valor inválido');
  await db.collection('contas').add({
    tipo:'Despesa',
    descricao: desc,
    valor,
    createdAt: firebase.firestore.Timestamp.now()
  });
  renderContas();
});

// --- Importar dataset "Família Oliveira" (exemplo com contas que você passou) ---
importBtn.addEventListener('click', async () => {
  if(!confirm('Importar dados da Família Oliveira: isso adicionará várias contas no seu Firestore. Continuar?')) return;
  importStatus.textContent = 'Importando...';
  try{
    // lista de contas baseada nas informações que você enviou
    const contas = [
      // Rendas
      { tipo: 'Renda', descricao: 'Salário Thiago (média)', valor: 5500 },
      { tipo: 'Renda', descricao: 'Salário Adriele (média)', valor: 600 },

      // Despesas Fixas
      { tipo: 'Despesa Fixa', descricao: 'Aluguel', valor: 1600, vencimento: 'mensal' },
      { tipo: 'Despesa Fixa', descricao: 'Luz', valor: 278.96 },
      { tipo: 'Despesa Fixa', descricao: 'Água', valor: 137.26 },
      { tipo: 'Despesa Fixa', descricao: 'Mercado', valor: 500 },
      { tipo: 'Despesa Fixa', descricao: 'Internet/Telefone', valor: 128.99 },
      { tipo: 'Despesa Fixa', descricao: 'Carro (parcela)', valor: 767.32 },
      { tipo: 'Despesa Fixa', descricao: 'Cartão Nubank', valor: 232.78 },
      { tipo: 'Despesa Fixa', descricao: 'Ailos (24x)', valor: 196.63 },
      { tipo: 'Despesa Fixa', descricao: 'Internet TIM móvel', valor: 48.99 },
      { tipo: 'Despesa Fixa', descricao: 'Cartão Gabriel (Sofá)', valor: 250.00 },

      // Despesas variáveis
      { tipo: 'Despesa Variável', descricao: 'Lazer', valor: 150 },
      { tipo: 'Despesa Variável', descricao: 'Delivery', valor: 0 },
      { tipo: 'Despesa Variável', descricao: 'Farmácia', valor: 150 },
      { tipo: 'Despesa Variável', descricao: 'Gasolina', valor: 250 },
      { tipo: 'Despesa Variável', descricao: 'Empréstimo Jeitto', valor: 221.10 },
      { tipo: 'Despesa Variável', descricao: 'Empréstimo W (2x)', valor: 300 },
      { tipo: 'Despesa Variável', descricao: 'MEI', valor: 100 },
      // dívidas e metas
      { tipo: 'Meta', descricao: 'Pagar Andrey', valor: 3000 },
      { tipo: 'Meta', descricao: 'Pagar Gabriel', valor: 2000 },
      { tipo: 'Meta', descricao: 'Limpar Serasa Thiago', valor: 325.52 },
      { tipo: 'Meta', descricao: 'Limpar Serasa Shoppe', valor: 173.59 },
      { tipo: 'Meta', descricao: 'Limpar nome Adriele', valor: 3000 },
      { tipo: 'Meta', descricao: 'Manutenção preventiva carro', valor: 2300 },
      { tipo: 'Meta', descricao: 'DPVAT + Multa', valor: 232.50 }
    ];

    // grava cada conta
    const batch = db.batch ? db.batch() : null;
    for(const c of contas){
      const ref = db.collection('contas').doc(); // novo doc
      if(batch) batch.set(ref, {...c, createdAt: firebase.firestore.Timestamp.now()});
      else await ref.set({...c, createdAt: firebase.firestore.Timestamp.now()});
    }
    if(batch) await batch.commit();

    importStatus.textContent = '✅ Contas importadas com sucesso!';
    alert('Contas importadas com sucesso!');
    renderContas();
  }catch(e){
    importStatus.textContent = 'Erro ao importar: ' + e.message;
    alert('Erro ao importar: ' + e.message);
  }
});

// Auto-render se usuário já logado
setTimeout(()=> {
  if(auth.currentUser) { renderContas(); renderGoal(); }
}, 800);

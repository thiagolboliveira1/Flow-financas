// ==== CONFIG DO THIAGO ====
const firebaseConfig = {
  apiKey: "AIzaSyCrxOosiL8YqIB8yf5v9xq0Dje_AiE31pU",
  authDomain: "flow-financeiro-61209.firebaseapp.com",
  projectId: "flow-financeiro-61209",
  storageBucket: "flow-financeiro-61209.firebasestorage.app",
  messagingSenderId: "370100494331",
  appId: "1:370100494331:web:b4eaad52efa988ab15355e"
};

// Init Firebase + Firestore (compat)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ==== Helpers ====
const fmt = v => (Number(v) || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const $ = sel => document.querySelector(sel);

// elementos da UI
const elIncome = $('#incomeValue');
const elExpense = $('#expenseValue');
const elBalance = $('#balanceValue');
const goalBar = $('#goalProgress');
const goalLabel = $('#goalLabel');

// mês atual (para filtro de exibição)
function sameMonth(d, ref=new Date()){
  const x = d instanceof Date ? d : d?.toDate?.() || new Date(d);
  return x.getFullYear() === ref.getFullYear() && x.getMonth() === ref.getMonth();
}

// ==== Liga os botões ====
$('#addIncome').addEventListener('click', async ()=>{
  const val = Number(prompt('Valor da RECEITA (ex.: 300)') || '0');
  if(!val) return;
  await db.collection('transactions').add({
    amount: val,
    category: 'Renda',
    type: 'receita',
    createdAt: firebase.firestore.Timestamp.now()
  });
  alert('Receita adicionada!');
});

$('#addExpense').addEventListener('click', async ()=>{
  const val = Number(prompt('Valor da DESPESA (ex.: 120)') || '0');
  if(!val) return;
  const cat = prompt('Categoria (ex.: Mercado)') || 'Outros';
  await db.collection('transactions').add({
    amount: val,
    category: cat,
    type: 'despesa',
    createdAt: firebase.firestore.Timestamp.now()
  });
  alert('Despesa adicionada!');
});

// ==== KPIs em tempo real (filtra por mês no cliente para evitar precisar de índice) ====
db.collection('transactions')
  .orderBy('createdAt','desc')
  .limit(200)
  .onSnapshot(snap=>{
    let gains=0, expenses=0;
    snap.forEach(doc=>{
      const t = doc.data();
      if(!sameMonth(t.createdAt)) return;
      const a = Number(t.amount)||0;
      const type = (t.type||'').toLowerCase();
      if(type === 'receita') gains += a; else expenses += a;
    });
    elIncome.textContent = fmt(gains);
    elExpense.textContent = fmt(expenses);
    elBalance.textContent = fmt(gains - expenses);
  });

// ==== Meta principal (pega o primeiro doc da coleção goals) ====
db.collection('goals').limit(1).get().then(q=>{
  if(q.empty){
    goalBar.value = 0; goalBar.max = 100;
    goalLabel.textContent = 'Meta: R$ 0 / R$ 0';
    return;
  }
  const g = q.docs[0].data();
  const current = Number(g.currentAmount)||0;
  const target  = Number(g.targetAmount)||0;
  const pct = target>0 ? Math.min(100, Math.round((current/target)*100)) : 0;
  goalBar.max = 100;
  goalBar.value = pct;
  goalLabel.textContent = `Meta: ${fmt(current)} / ${fmt(target)}`;
}).catch(console.error);

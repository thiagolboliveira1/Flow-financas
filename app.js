// Configuração Firebase — Projeto Flow Financeiro Thiago
const firebaseConfig = {
  apiKey: "AIzaSyCrxOosiL8YqIB8yf5v9xq0Dje_AiE31pU",
  authDomain: "flow-financeiro-61209.firebaseapp.com",
  projectId: "flow-financeiro-61209",
  storageBucket: "flow-financeiro-61209.firebasestorage.app",
  messagingSenderId: "370100494331",
  appId: "1:370100494331:web:b4eaad52efa988ab15355e"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Ativa persistência offline
db.enablePersistence().catch((err) => {
  console.log("Offline persistence error:", err.code);
});

// Login automático (usuário padrão Thiago)
auth.signInWithEmailAndPassword("thiago.oliveira20251014@gmail.com", "flow1234")
  .then(() => console.log("Login automático realizado"))
  .catch(() => console.log("Login automático falhou ou usuário não existe"));

// Funções principais
const fmt = (v) => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Elementos
const incomeValue = document.getElementById("incomeValue");
const expenseValue = document.getElementById("expenseValue");
const balanceValue = document.getElementById("balanceValue");
const goalProgress = document.getElementById("goalProgress");
const goalLabel = document.getElementById("goalLabel");

// Dados locais
let incomes = [];
let expenses = [];
let goal = { atual: 0, meta: 0 };

// Atualiza tela
function updateUI() {
  const totalIncome = incomes.reduce((a, b) => a + b.amount, 0);
  const totalExpense = expenses.reduce((a, b) => a + b.amount, 0);
  const balance = totalIncome - totalExpense;

  incomeValue.textContent = fmt(totalIncome);
  expenseValue.textContent = fmt(totalExpense);
  balanceValue.textContent = fmt(balance);

  if (goal.meta > 0) {
    const percent = Math.min((goal.atual / goal.meta) * 100, 100);
    goalProgress.value = percent;
    goalLabel.textContent = `Meta: ${fmt(goal.atual)} / ${fmt(goal.meta)}`;
  }
}

// Adiciona meta
document.getElementById("addGoal").addEventListener("click", async () => {
  const valorMeta = prompt("Qual o valor total da meta?");
  if (!valorMeta) return;
  const meta = parseFloat(valorMeta);
  goal = { atual: 0, meta };
  await db.collection("goals").add(goal);
  updateUI();
});

// Adiciona receita
document.getElementById("addIncome").addEventListener("click", async () => {
  const desc = prompt("Descrição da receita:");
  const valor = parseFloat(prompt("Valor da receita:"));
  if (!valor) return;
  const income = { description: desc, amount: valor };
  incomes.push(income);
  await db.collection("incomes").add(income);
  updateUI();
});

// Adiciona despesa
document.getElementById("addExpense").addEventListener("click", async () => {
  const desc = prompt("Descrição da despesa:");
  const valor = parseFloat(prompt("Valor da despesa:"));
  if (!valor) return;
  const expense = { description: desc, amount: valor };
  expenses.push(expense);
  await db.collection("expenses").add(expense);
  updateUI();
});

// Importa dados da Família Oliveira
document.getElementById("importData").addEventListener("click", async () => {
  alert("Importando dados da Família Oliveira...");
  const data = [
    { type: "expense", description: "Aluguel", amount: 1600 },
    { type: "expense", description: "Luz", amount: 278.96 },
    { type: "expense", description: "Água", amount: 253.88 },
    { type: "expense", description: "Mercado", amount: 500 },
    { type: "expense", description: "Internet", amount: 128.99 },
    { type: "expense", description: "Carro", amount: 767.32 },
    { type: "expense", description: "Cartão Nubank", amount: 232.78 },
    { type: "income", description: "Salário Thiago", amount: 5500 },
    { type: "income", description: "Salário Adriele", amount: 600 }
  ];
  for (let item of data) {
    if (item.type === "income") incomes.push(item);
    else expenses.push(item);
  }
  updateUI();
  alert("Dados importados com sucesso!");
});

// Tema claro/escuro
const themeBtn = document.getElementById("themeToggle");
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

updateUI();

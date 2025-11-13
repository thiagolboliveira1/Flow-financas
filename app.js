// =========================================
//  FLOW — APP.JS COMPLETO E OTIMIZADO
//  Thiago Oliveira — 2025
// =========================================


// -----------------------------------------------------
// 1) CONFIGURAÇÃO DO FIREBASE
// -----------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyCrxOosiL8YqIB8yf5v9xq0Dje_AiE31pU",
  authDomain: "flow-financeiro-61209.firebaseapp.com",
  projectId: "flow-financeiro-61209",
  storageBucket: "flow-financeiro-61209.firebasestorage.app",
  messagingSenderId: "370100494331",
  appId: "1:370100494331:web:b4eaad52efa988ab15355e"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();



// -----------------------------------------------------
// 2) CONTROLE DE AUTENTICAÇÃO
// -----------------------------------------------------

function showAuthModal(show = true) {
  const modal = document.getElementById("authModal");
  if (!modal) return;
  modal.style.display = show ? "flex" : "none";
}

function updateUserBar(user) {
  const bar = document.getElementById("userBar");
  const emailLabel = document.getElementById("userEmail");

  if (user) {
    emailLabel.textContent = user.email;
    bar.style.display = "flex";
  } else {
    bar.style.display = "none";
  }
}

// LOGIN
document.getElementById("btnSignIn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();
  const msg = document.getElementById("authMsg");

  try {
    await auth.signInWithEmailAndPassword(email, pass);
    msg.textContent = "";
  } catch (e) {
    msg.textContent = "Erro: " + e.message;
  }
});

// CADASTRAR
document.getElementById("btnSignUp").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();
  const msg = document.getElementById("authMsg");

  try {
    await auth.createUserWithEmailAndPassword(email, pass);
    msg.textContent = "";
  } catch (e) {
    msg.textContent = "Erro: " + e.message;
  }
});

// SAIR
document.getElementById("btnSignOut").addEventListener("click", () => {
  auth.signOut();
});


// VERIFICA LOGIN AUTOMÁTICO
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    showAuthModal(true);
    updateUserBar(null);
    return;
  }

  showAuthModal(false);
  updateUserBar(user);

  // Carregar os dados automaticamente quando estiver logado
  renderDashboard();
  renderContas();
});



// -----------------------------------------------------
// 3) DASHBOARD (Entradas / Saídas / Saldo / Meta)
// -----------------------------------------------------

async function renderDashboard() {
  const uid = auth.currentUser.uid;

  const snap = await db
    .collection("contas")
    .where("uid", "==", uid)
    .get();

  let entradas = 0;
  let saidas = 0;

  snap.forEach(doc => {
    const c = doc.data();
    const valor = parseFloat(c.valor || 0);

    if (c.tipo === "Renda") entradas += valor;
    if (c.tipo.includes("Despesa")) saidas += valor;
  });

  document.getElementById("incomeValue").textContent = "R$ " + entradas;
  document.getElementById("expenseValue").textContent = "R$ " + saidas;
  document.getElementById("balanceValue").textContent = "R$ " + (entradas - saidas);
}



// -----------------------------------------------------
// 4) IMPORTAÇÃO COMPLETA DA FAMÍLIA OLIVEIRA
// -----------------------------------------------------

document.getElementById("importData").addEventListener("click", async () => {
  const uid = auth.currentUser.uid;
  const now = firebase.firestore.Timestamp.now();
  const status = document.getElementById("importStatus");

  status.textContent = "Importando contas...";

  const contas = [

    // RENDAS
    { tipo: "Renda", descricao: "Salário Thiago (média)", valor: 5500 },
    { tipo: "Renda", descricao: "Salário Adriele (média)", valor: 600 },

    // DESPESAS FIXAS
    { tipo: "Despesa Fixa", descricao: "Aluguel", valor: 1600 },
    { tipo: "Despesa Fixa", descricao: "Luz", valor: 278.96 },
    { tipo: "Despesa Fixa", descricao: "Água", valor: 253.88 },
    { tipo: "Despesa Fixa", descricao: "Mercado", valor: 500 },
    { tipo: "Despesa Fixa", descricao: "Internet/Telefone", valor: 128.99 },
    { tipo: "Despesa Fixa", descricao: "Carro (financiamento)", valor: 767.32 },
    { tipo: "Despesa Fixa", descricao: "Cartão Nubank", valor: 232.78 },
    { tipo: "Despesa Fixa", descricao: "Ailos", valor: 196.63 },
    { tipo: "Despesa Fixa", descricao: "Internet TIM", valor: 48.99 },
    { tipo: "Despesa Fixa", descricao: "Cartão Gabriel Sofá", valor: 250 },

    // DESPESAS VARIÁVEIS
    { tipo: "Despesa Variável", descricao: "Lazer", valor: 150 },
    { tipo: "Despesa Variável", descricao: "Delivery", valor: 0 },
    { tipo: "Despesa Variável", descricao: "Farmácia", valor: 150 },
    { tipo: "Despesa Variável", descricao: "Gasolina", valor: 250 },
    { tipo: "Despesa Variável", descricao: "Empréstimo Jeitto", valor: 221.1 },
    { tipo: "Despesa Variável", descricao: "Empréstimo W", valor: 300 },
    { tipo: "Despesa Variável", descricao: "MEI", valor: 100 },
    { tipo: "Despesa Variável", descricao: "Manutenção Carro", valor: 2300 },
    { tipo: "Despesa Variável", descricao: "DPVAT + Multa", valor: 232.5 },

    // METAS
    { tipo: "Meta", descricao: "Pagar Andrey", valor: 3000 },
    { tipo: "Meta", descricao: "Pagar Gabriel", valor: 2000 },
    { tipo: "Meta", descricao: "Limpar nome Claro", valor: 325.52 },
    { tipo: "Meta", descricao: "Limpar nome Shopee", valor: 173.59 },
    { tipo: "Meta", descricao: "Limpar nome Adriele", valor: 3000 },
    { tipo: "Meta", descricao: "Poupança Emergencial", valor: 0 },
    { tipo: "Meta", descricao: "Reservar 13º Thiago", valor: 0 },
  ];

  for (let c of contas) {
    await db.collection("contas").add({
      uid,
      ...c,
      criadoEm: now
    });
  }

  status.textContent = "✔ Importação concluída!";
  await renderDashboard();
  await renderContas();
});



// -----------------------------------------------------
// 5) RENDERIZAR LISTA DE CONTAS + EDIÇÃO
// -----------------------------------------------------

async function renderContas() {
  const uid = auth.currentUser.uid;
  const container = document.getElementById("contasContainer");

  container.innerHTML = `
    <h2 style="margin:10px 0 18px">Minhas Contas</h2>
  `;

  const snap = await db
    .collection("contas")
    .where("uid", "==", uid)
    .get();

  snap.forEach(doc => {
    const c = doc.data();

    const item = document.createElement("div");
    item.className = "card";
    item.style.marginBottom = "12px";

    item.innerHTML = `
      <strong>${c.tipo}</strong><br>
      ${c.descricao}<br>
      <span contenteditable="true" class="valor" data-id="${doc.id}">
        ${c.valor}
      </span>
    `;

    container.appendChild(item);
  });

  // Salvar valor editado
  document.querySelectorAll(".valor").forEach(el => {
    el.addEventListener("blur", async () => {
      const id = el.getAttribute("data-id");
      const novo = parseFloat(el.textContent);

      if (isNaN(novo)) {
        alert("Valor inválido");
        return;
      }

      await db.collection("contas").doc(id).update({ valor: novo });
      renderDashboard();
    });
  });
}



// -----------------------------------------------------
// 6) ADICIONAR RECEITA / DESPESA MANUAL
// -----------------------------------------------------

document.getElementById("addIncome").addEventListener("click", async () => {
  const valor = parseFloat(prompt("Valor da receita:"));
  if (isNaN(valor)) return;

  await db.collection("contas").add({
    uid: auth.currentUser.uid,
    tipo: "Renda",
    descricao: "Receita manual",
    valor
  });

  renderDashboard();
  renderContas();
});

document.getElementById("addExpense").addEventListener("click", async () => {
  const valor = parseFloat(prompt("Valor da despesa:"));
  if (isNaN(valor)) return;

  await db.collection("contas").add({
    uid: auth.currentUser.uid,
    tipo: "Despesa Variável",
    descricao: "Despesa manual",
    valor
  });

  renderDashboard();
  renderContas();
});



// -----------------------------------------------------
// 7) ADICIONAR META
// -----------------------------------------------------

document.getElementById("addGoal").addEventListener("click", async () => {
  const descricao = prompt("Descrição da Meta:");
  if (!descricao) return;

  const valor = parseFloat(prompt("Valor da Meta:"));
  if (isNaN(valor)) return;

  await db.collection("contas").add({
    uid: auth.currentUser.uid,
    tipo: "Meta",
    descricao,
    valor
  });

  renderContas();
});

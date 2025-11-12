// ----------------------------
// 📦 IMPORTAR DADOS COMPLETOS DA FAMÍLIA OLIVEIRA
// ----------------------------
document.getElementById("importData").addEventListener("click", async () => {
  alert("Importando dados da Família Oliveira...");

  const uid = auth.currentUser ? auth.currentUser.uid : "thiago_offline";
  const now = firebase.firestore.Timestamp.now();

  // Todas as contas e metas com valores editáveis
  const contas = [
    // 💵 Rendas
    { tipo: "Renda", descricao: "Salário Thiago", valor: 5500 },
    { tipo: "Renda", descricao: "Salário Adriele", valor: 600 },

    // 🧾 Despesas Fixas
    { tipo: "Despesa Fixa", descricao: "Aluguel", valor: 1600 },
    { tipo: "Despesa Fixa", descricao: "Luz", valor: 278.96 },
    { tipo: "Despesa Fixa", descricao: "Água", valor: 253.88 },
    { tipo: "Despesa Fixa", descricao: "Mercado", valor: 500 },
    { tipo: "Despesa Fixa", descricao: "Internet Residencial", valor: 128.99 },
    { tipo: "Despesa Fixa", descricao: "Carro (22/48)", valor: 767.32 },
    { tipo: "Despesa Fixa", descricao: "Cartão Nubank", valor: 232.78 },
    { tipo: "Despesa Fixa", descricao: "Ailos (24 parcelas)", valor: 196.63 },
    { tipo: "Despesa Fixa", descricao: "Internet TIM Móvel", valor: 48.99 },
    { tipo: "Despesa Fixa", descricao: "Cartão Gabriel Sofá", valor: 250 },

    // 💸 Despesas Variáveis
    { tipo: "Despesa Variável", descricao: "Lazer", valor: 150 },
    { tipo: "Despesa Variável", descricao: "Delivery", valor: 0 },
    { tipo: "Despesa Variável", descricao: "Farmácia", valor: 150 },
    { tipo: "Despesa Variável", descricao: "Gasolina", valor: 250 },
    { tipo: "Despesa Variável", descricao: "Empréstimo Jeitto", valor: 221.10 },
    { tipo: "Despesa Variável", descricao: "Empréstimo W", valor: 300 },
    { tipo: "Despesa Variável", descricao: "MEI", valor: 100 },
    { tipo: "Despesa Variável", descricao: "Manutenção do carro", valor: 2300 },
    { tipo: "Despesa Variável", descricao: "DPVAT + Multa", valor: 232.50 },

    // 🎯 Metas e Dívidas
    { tipo: "Meta", descricao: "Pagar Andrey", valor: 3000 },
    { tipo: "Meta", descricao: "Pagar Gabriel", valor: 2000 },
    { tipo: "Meta", descricao: "Limpar nome Thiago (Claro)", valor: 325.52 },
    { tipo: "Meta", descricao: "Limpar nome Thiago (Shopee)", valor: 173.59 },
    { tipo: "Meta", descricao: "Limpar nome Adriele", valor: 3000 },
    { tipo: "Meta", descricao: "Reserva emergencial", valor: 0 },
    { tipo: "Meta", descricao: "13º Thiago (guardar fim de ano)", valor: 0 }
  ];

  // Salvar no Firebase
  for (const c of contas) {
    await db.collection("contas").add({
      uid,
      ...c,
      criadoEm: now
    });
  }

  alert("✅ Contas importadas com sucesso!");
  renderContas();
});

// ----------------------------
// 🧾 FUNÇÃO DE LISTAR E EDITAR CONTAS NA TELA
// ----------------------------
async function renderContas() {
  const lista = document.createElement("section");
  lista.classList.add("contas-list");
  lista.innerHTML = "<h2>Minhas Contas</h2>";

  const snapshot = await db.collection("contas").get();
  snapshot.forEach((doc) => {
    const data = doc.data();
    const item = document.createElement("div");
    item.classList.add("conta-item");
    item.innerHTML = `
      <strong>${data.tipo}:</strong> ${data.descricao}<br>
      Valor: <span class="valor" contenteditable="true" data-id="${doc.id}">${data.valor}</span>
      <hr>
    `;
    lista.appendChild(item);
  });

  document.body.appendChild(lista);

  // Evento para editar valores
  document.querySelectorAll(".valor").forEach((el) => {
    el.addEventListener("blur", async () => {
      const id = el.getAttribute("data-id");
      const novoValor = parseFloat(el.textContent);
      if (isNaN(novoValor)) return alert("Valor inválido!");
      await db.collection("contas").doc(id).update({ valor: novoValor });
      alert("💾 Valor atualizado!");
    });
  });
}

// Exibe as contas automaticamente se já estiverem salvas
renderContas();

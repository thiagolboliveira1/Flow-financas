// --- inicialização (você já tem isso)
const db = firebase.firestore();
const auth = firebase.auth();

// --- FUNÇÕES DE AUTENTICAÇÃO (compat)
async function signUp(email, password) {
  try {
    const userCred = await auth.createUserWithEmailAndPassword(email, password);
    alert("Conta criada: " + userCred.user.email);
    return userCred.user;
  } catch (err) {
    alert("Erro cadastro: " + err.message);
    throw err;
  }
}

async function signIn(email, password) {
  try {
    const userCred = await auth.signInWithEmailAndPassword(email, password);
    alert("Entrou: " + userCred.user.email);
    return userCred.user;
  } catch (err) {
    alert("Erro login: " + err.message);
    throw err;
  }
}

function signOut() {
  auth.signOut().then(()=> alert("Desconectado"));
}

// --- observa estado de autenticação (útil para mostrar email/avatar)
auth.onAuthStateChanged(user => {
  const userBar = document.getElementById("userBar");
  const userEmail = document.getElementById("userEmail");
  if (user) {
    // usuário logado
    if (userBar) userBar.style.display = "flex";
    if (userEmail) userEmail.textContent = user.email;
    // carrega dados do Firestore (ex: contas)
    renderContas();
  } else {
    if (userBar) userBar.style.display = "none";
    if (userEmail) userEmail.textContent = "";
    // opcional: esvaziar listas
  }
});

// --- conectar botões do HTML
document.getElementById("btnSignUp")?.addEventListener("click", async ()=> {
  const email = document.getElementById("email").value;
  const pass  = document.getElementById("password").value;
  await signUp(email, pass);
});

document.getElementById("btnSignIn")?.addEventListener("click", async ()=> {
  const email = document.getElementById("email").value;
  const pass  = document.getElementById("password").value;
  await signIn(email, pass);
});

document.getElementById("btnSignOut")?.addEventListener("click", ()=> signOut());

// --- Exemplo simples de gravação (somente após login)
async function addTransaction(data) {
  const user = auth.currentUser;
  if (!user) return alert("Faça login para gravar.");
  try {
    await db.collection("transactions").add({
      ...data,
      uid: user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("Transação adicionada!");
  } catch (err) {
    alert("Erro DB: " + err.message);
  }
}

// --- Exemplo de leitura (somente após login)
async function renderContas() {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const snapshot = await db.collection("contas")
      .where("uid","==", user.uid)
      .get();
    // processa e mostra na tela
    // (substitua pela sua função de render)
    console.log("contas snapshot size:", snapshot.size);
  } catch (err) {
    alert("Erro ler contas: " + err.message);
  }
}

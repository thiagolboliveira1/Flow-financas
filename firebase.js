// ===========================
//  FLOW – Firebase Inicialização
// ===========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ----------------------------------------
// CONFIGURAÇÃO REAL DO SEU PROJETO FIREBASE
// ----------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCrxOosiL8YqIB8yf5v9xq0Dje_AiE31pU",
  authDomain: "flow-financeiro-61209.firebaseapp.com",
  projectId: "flow-financeiro-61209",
  storageBucket: "flow-financeiro-61209.firebasestorage.app",
  messagingSenderId: "370100494331",
  appId: "1:370100494331:web:b4eaad52efa988ab15355e"
};

// Inicializa o app
export const app = initializeApp(firebaseConfig);

// Firestore (banco de dados)
export const db = getFirestore(app);

// Auth (login)
export const auth = getAuth(app);

// ==========================================
//  FLOW – Firestore (Salvar / Ler / Deletar)
// ==========================================

import { db, auth } from "./firebase.js";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ----------------------------------------------------
// Salva ou atualiza um item (card) no Firestore
// ----------------------------------------------------
export async function salvarItem(item) {
  const uid = auth.currentUser.uid;

  const ref = doc(db, `usuarios/${uid}/financas/${item.id}`);
  await setDoc(ref, item, { merge: true });
}

// ----------------------------------------------------
// Deleta um item
// ----------------------------------------------------
export async function deletarItem(id) {
  const uid = auth.currentUser.uid;

  const ref = doc(db, `usuarios/${uid}/financas/${id}`);
  await deleteDoc(ref);
}

// ----------------------------------------------------
// Carrega todas as finanças do usuário logado
// ----------------------------------------------------
export async function carregarFinancas() {
  const uid = auth.currentUser.uid;

  const ref = collection(db, `usuarios/${uid}/financas`);
  const snap = await getDocs(ref);

  return snap.docs.map((doc) => doc.data());
}

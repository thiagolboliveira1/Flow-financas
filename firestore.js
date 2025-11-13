import { db, auth } from './firebase.js';
import { collection, doc, setDoc, deleteDoc, getDocs }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function salvarItem(item){
  const uid=auth.currentUser.uid;
  await setDoc(doc(db,`usuarios/${uid}/financas/${item.id}`),item,{merge:true});
}
export async function deletarItem(id){
  const uid=auth.currentUser.uid;
  await deleteDoc(doc(db,`usuarios/${uid}/financas/${id}`));
}
export async function carregarFinancas(){
  const uid=auth.currentUser.uid;
  const snap=await getDocs(collection(db,`usuarios/${uid}/financas`));
  return snap.docs.map(d=>d.data());
}

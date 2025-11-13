import { auth } from './firebase.js';
import { salvarItem, deletarItem, carregarFinancas } from './firestore.js';

let items=[];

auth.onAuthStateChanged(async user=>{
  if(!user) return window.location="login.html";
  items = await carregarFinancas();
  render();
});

function render(){
  const div=document.getElementById("cards");
  div.innerHTML="";
  items.forEach(i=>{
    const el=document.createElement("div");
    el.style.padding="12px";
    el.style.margin="8px";
    el.style.background="#fff";
    el.style.borderRadius="8px";
    el.innerHTML=`<b>${i.title}</b><br>R$ ${i.value}`;
    div.appendChild(el);
  });
}

window.logout = ()=> auth.signOut();

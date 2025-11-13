import { auth } from './firebase.js';
import { salvarItem, deletarItem, carregarFinancas } from './firestore.js';
import { contasIniciais } from './seed.js';

let items=[];

auth.onAuthStateChanged(async user=>{
  if(!user) return window.location="login.html";

  let dados = await carregarFinancas();

  // AUTO POPULAR
  if(dados.length===0){
    for(const item of contasIniciais){
      await salvarItem(item);
    }
    dados = await carregarFinancas();
  }

  items = dados;
  render();
});

function render(){
  const div=document.getElementById("cards");
  div.innerHTML="";
  items.forEach(i=>{
    const el=document.createElement("div");
    el.className="card";
    el.innerHTML=`<b>${i.title}</b><br>R$ ${i.value}`;
    div.appendChild(el);
  });
}

window.logout = ()=> auth.signOut();

import { auth } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.getElementById("loginBtn").onclick = async ()=>{
  const email=document.getElementById("email").value;
  const pass=document.getElementById("password").value;
  try{
    await signInWithEmailAndPassword(auth,email,pass);
    window.location.href="index.html";
  }catch(e){alert(e.message);}
};

document.getElementById("registerBtn").onclick = async ()=>{
  const email=document.getElementById("email").value;
  const pass=document.getElementById("password").value;
  try{
    await createUserWithEmailAndPassword(auth,email,pass);
    alert("Conta criada. Faça login.");
  }catch(e){alert(e.message);}
};

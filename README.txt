
FLOW — Cards (FINAL)
====================

O pacote que você recebeu aqui é uma versão **card-based** do FLOW com os tipos que você mostrou nas imagens:
- Metas (goal) com progresso / porcentagem
- Cofrinho (cofrinho mensal / anual)
- Limites por categoria (mostra gasto atual + saldo)
- Investimentos (resumo)
- Rendas / Despesas (cards clássicos)
- Export / Import CSV com colunas completas
- Armazenamento em LocalStorage (funciona offline)
- Placeholder para Firebase (firebase.js) — cole seu firebaseConfig se quiser sincronizar

Como abrir
1. Baixe e extraia o ZIP.
2. Abra `index.html` no Koder ou no Safari (iPhone).
3. Para conectar ao Firebase: abra `firebase.js` e cole seu firebaseConfig (objeto). Depois eu posso te ajudar a ligar Firestore/Realtime + autenticação se quiser.

O que eu já fiz (conforme você pediu - opção 3: tema + firebase-ready)
- Apliquei visual no estilo das imagens (cards com capa, badges, progresso).
- Adicionei exemplos preenchidos para metas, cofres, limites, investimentos e despesas.
- Mantive export/import CSV e edição inline (título e salvar por modal).
- Deixei `firebase.js` pronto para você colar o objeto sem expor nada sensível aqui.

Próximos passos que eu posso fazer já agora (escolha uma):
A) Integrar Firestore (salvar/ler automaticamente) — você precisa me enviar seu firebaseConfig.  
B) Ajustar responsividade/estética exatamente com suas cores/imagens (posso usar as imagens que você mandou como capa dos cards).  
C) Gerar versão `.zip` com seu firebaseConfig já embutido (você precisa enviar o objeto firebaseConfig aqui).

Se quiser que eu já integre com seu Firebase e teste leitura/escrita, **cole aqui** seu firebaseConfig (o objeto com apiKey, authDomain, projectId, etc.).
Se preferir, só me diga qual dos próximos passos (A, B ou C) você quer que eu faça agora.

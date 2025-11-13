
FLOW — Cards (FIXED IMPORT)
==========================

O que foi corrigido nesta versão (feito agora):
- Ao carregar, o app verifica dados no LocalStorage e remove duplicatas automaticamente (mantendo a primeira ocorrência).
- Importação CSV agora pergunta se você quer MESCLAR (OK) ou SUBSTITUIR (Cancelar) quando já existe uma importação anterior.
  - Mesclar: adiciona novos items sem duplicar (compara por tipo+titulo+valor+data+responsável).
  - Substituir: apaga os dados atuais e importa somente os registros do CSV (também remove duplicatas internas).
- Após import bem-sucedida, uma flag é salva em LocalStorage para evitar importações acidentais sem aviso.
- Mantive o layout card-based (visual) e funcionalidade de export/import, edição inline e modal.

Como usar (rapidamente):
1. Baixe e extraia o ZIP.
2. Abra `index.html` no Koder ou Safari (iPhone).
3. Se você já importou acidentalmente antes, ao abrir a nova versão ela tentará remover duplicatas automaticamente.
4. Para importar um CSV novo: toque em "Importar CSV". Se já houver uma importação anterior, você será perguntado se quer MESCLAR (OK) ou SUBSTITUIR (Cancel).
5. Exporte backup antes de testar, caso queira (botão Exportar CSV).

Se quiser, eu posso:
- Aplicar a remoção de duplicatas direto no LocalStorage atual sem você precisar abrir a nova versão (rodando um script aqui).
- Colar seu firebaseConfig e integrar Firestore/Autenticação.

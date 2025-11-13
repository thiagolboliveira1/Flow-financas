// seed.js
// Dados iniciais (contas reais da Família Oliveira)
// Usado para auto-popular na primeira vez que o usuário loga

export const contasIniciais = [
  // RENDAS
  {
    id: "inc_thiago",
    type: "income",
    title: "Salário Thiago (média)",
    subtitle: "Renda (comissão/produção)",
    owner: "Thiago",
    value: 5500,
    date: "2025-01-01",
    tags: ["salário", "média"]
  },
  {
    id: "inc_adriele",
    type: "income",
    title: "Salário Adriele (média)",
    subtitle: "Renda",
    owner: "Adriele",
    value: 600,
    date: "2025-01-01",
    tags: ["salário"]
  },

  // DESPESAS FIXAS
  {
    id: "fix_aluguel",
    type: "fixed",
    title: "Aluguel",
    subtitle: "Despesa Fixa",
    owner: "Casa",
    value: 1600,
    tags: ["moradia"]
  },
  {
    id: "fix_luz",
    type: "fixed",
    title: "Luz",
    subtitle: "Despesa (variável mês a mês)",
    owner: "Casa",
    value: 278.96,
    tags: ["luz"]
  },
  {
    id: "fix_agua",
    type: "fixed",
    title: "Água (última conta)",
    subtitle: "Despesa (variável)",
    owner: "Casa",
    value: 137.26,
    date: "2025-10-12",
    tags: ["agua"]
  },
  {
    id: "fix_mercado",
    type: "variable",
    title: "Mercado (estimado)",
    subtitle: "Despesa Mensal",
    owner: "Casa",
    value: 500,
    tags: ["mercado"]
  },
  {
    id: "fix_internet",
    type: "fixed",
    title: "Internet / Telefone",
    subtitle: "Despesa Fixa",
    owner: "Casa",
    value: 128.99,
    tags: ["internet"]
  },
  {
    id: "fix_carro",
    type: "fixed",
    title: "Carro (parcela)",
    subtitle: "Financiamento - 22/48 pagas",
    owner: "Thiago",
    value: 767.32,
    date: "15",
    tags: ["carro","financiamento"]
  },
  {
    id: "fix_nubank",
    type: "variable",
    title: "Cartão Nubank",
    subtitle: "Fatura",
    owner: "Casa",
    value: 232.78,
    date: "2025-11-20",
    tags: ["cartão","nubank"]
  },
  {
    id: "fix_ailos",
    type: "fixed",
    title: "Ailos (parcela)",
    subtitle: "24x acordo",
    owner: "Thiago",
    value: 196.63,
    date: "20",
    tags: ["parcelamento","ailos"]
  },
  {
    id: "fix_tim",
    type: "fixed",
    title: "Internet TIM móvel",
    subtitle: "Fatura",
    owner: "Casa",
    value: 48.99,
    tags: ["tim","móvel"]
  },
  {
    id: "fix_gabriel_sofa",
    type: "fixed",
    title: "Cartão Gabriel Sofá",
    subtitle: "Parcelamento",
    owner: "Gabriel",
    value: 250,
    tags: ["sofa","parcelamento"]
  },

  // DESPESAS VARIÁVEIS
  {
    id: "var_lazer",
    type: "variable",
    title: "Lazer",
    subtitle: "Despesa Variável",
    owner: "Família",
    value: 150,
    tags: ["lazer"]
  },
  {
    id: "var_delivery",
    type: "variable",
    title: "Delivery",
    subtitle: "Despesa Variável",
    owner: "Família",
    value: 0,
    tags: ["delivery"]
  },
  {
    id: "var_farmacia",
    type: "variable",
    title: "Farmácia",
    subtitle: "Despesa Variável",
    owner: "Família",
    value: 150,
    tags: ["farmácia"]
  },
  {
    id: "var_gasolina",
    type: "variable",
    title: "Gasolina",
    subtitle: "Despesa Variável",
    owner: "Thiago",
    value: 250,
    tags: ["combustível","gasolina"]
  },
  {
    id: "var_jeitto",
    type: "variable",
    title: "Empréstimo Jeitto",
    subtitle: "Parcelamento",
    owner: "Thiago",
    value: 221.10,
    date: "2025-11-10",
    tags: ["empréstimo","jeitto"]
  },
  {
    id: "var_w",
    type: "variable",
    title: "Empréstimo W",
    subtitle: "2x (próxima parcela)",
    owner: "Thiago",
    value: 300,
    tags: ["empréstimo","w"]
  },
  {
    id: "var_mei",
    type: "variable",
    title: "MEI (a regularizar)",
    subtitle: "Contribuição/pendente",
    owner: "Thiago",
    value: 100,
    tags: ["MEI","atrasado"]
  },

  // DÍVIDAS / OBJETIVOS DE PAGAMENTO
  {
    id: "debt_andrey",
    type: "goal",
    title: "Pagar dívida Andrey",
    subtitle: "Dívida - acordo possível",
    owner: "Thiago",
    value: 3000,
    target: 3000,
    progress: 0,
    tags: ["dívida","andrey"]
  },
  {
    id: "debt_gabriel",
    type: "goal",
    title: "Pagar dívida Gabriel",
    subtitle: "Dívida - acordo possível",
    owner: "Thiago",
    value: 2000,
    target: 2000,
    progress: 0,
    tags: ["dívida","gabriel"]
  },

  // METAS / LIMPAR NOME
  {
    id: "meta_serasa_thiago_claro",
    type: "goal",
    title: "Limpar nome - Thiago (Claro)",
    subtitle: "Claro - acordo possível",
    owner: "Thiago",
    value: 325.52,
    target: 325.52,
    progress: 0,
    tags: ["serasa","claro"]
  },
  {
    id: "meta_shopee",
    type: "goal",
    title: "Shoppe (limpar)",
    subtitle: "Shoppe - dívida",
    owner: "Thiago",
    value: 173.59,
    target: 173.59,
    progress: 0,
    tags: ["serasa","shopee"]
  },
  {
    id: "meta_serasa_adriele",
    type: "goal",
    title: "Limpar nome - Adriele",
    subtitle: "Acordo possível",
    owner: "Adriele",
    value: 3000,
    target: 3000,
    progress: 0,
    tags: ["serasa","adriele"]
  },

  // COFRINHOS / RESERVAS
  {
    id: "cofrinho_emergencial",
    type: "cofrinho",
    title: "Poupança Emergencial",
    subtitle: "Reserva de emergência",
    owner: "Família",
    value: 0,
    target: 10000,
    progress: 0,
    tags: ["poupança","emergencial"]
  },
  {
    id: "cofrinho_13th",
    type: "cofrinho",
    title: "13º do Thiago (reservar)",
    subtitle: "Reserva anual",
    owner: "Thiago",
    value: 0,
    target: 5500,
    progress: 0,
    tags: ["13º","reserva"]
  },

  // MANUTENÇÃO / TRIBUTOS
  {
    id: "manut_carro",
    type: "goal",
    title: "Manutenção preventiva do carro",
    subtitle: "Oficina / peças",
    owner: "Thiago",
    value: 2300,
    target: 2300,
    progress: 0,
    tags: ["manutenção","carro"]
  },
  {
    id: "dpvat",
    type: "variable",
    title: "DPVAT",
    subtitle: "Seguro obrigatório",
    owner: "Thiago",
    value: 94.61,
    date: "2025-10-31",
    tags: ["dpvat"]
  },
  {
    id: "multa",
    type: "variable",
    title: "Multa (a pagar)",
    subtitle: "Multa trânsito + taxas",
    owner: "Thiago",
    value: 137.89,
    tags: ["multa"]
  },
  {
    id: "multa_combined",
    type: "variable",
    title: "Multa + DPVAT (total)",
    subtitle: "Pagamento conjunto sugerido",
    owner: "Thiago",
    value: 232.50,
    date: "2025-10-31",
    tags: ["multa","dpvat"]
  },

  // LIMITES / ALOCAÇÕES (informativos)
  {
    id: "limit_carro",
    type: "limit",
    title: "Orçamento - Carro",
    subtitle: "Alocação 15%",
    owner: "Thiago",
    value: 0,
    tags: ["alocacao","15%"]
  },
  {
    id: "limit_nubank",
    type: "limit",
    title: "Orçamento - Nubank",
    subtitle: "Alocação 20%",
    owner: "Casa",
    value: 0,
    tags: ["alocacao","20%"]
  },
  {
    id: "limit_ailos",
    type: "limit",
    title: "Orçamento - Ailos",
    subtitle: "Alocação 20%",
    owner: "Thiago",
    value: 0,
    tags: ["alocacao","20%"]
  },
  {
    id: "limit_internet",
    type: "limit",
    title: "Orçamento - Internet",
    subtitle: "Alocação 20%",
    owner: "Casa",
    value: 0,
    tags: ["alocacao","20%"]
  },
  {
    id: "limit_agua",
    type: "limit",
    title: "Orçamento - Água",
    subtitle: "Alocação 12%",
    owner: "Casa",
    value: 0,
    tags: ["alocacao","12%"]
  },
  {
    id: "limit_luz",
    type: "limit",
    title: "Orçamento - Luz",
    subtitle: "Alocação 30%",
    owner: "Casa",
    value: 0,
    tags: ["alocacao","30%"]
  },
  {
    id: "limit_sofa",
    type: "limit",
    title: "Orçamento - Sofá (Gabriel)",
    subtitle: "Alocação 10%",
    owner: "Gabriel",
    value: 0,
    tags: ["alocacao","10%"]
  },
  {
    id: "limit_mei",
    type: "limit",
    title: "Orçamento - MEI",
    subtitle: "Alocação 25%",
    owner: "Thiago",
    value: 0,
    tags: ["alocacao","25%"]
  }
];

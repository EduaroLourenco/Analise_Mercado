/* Dados da análise — Aditivo para Radiador 1 L.
   Para criar uma nova análise, copie este arquivo, troque os valores e
   registre-o em uma página HTML (ver PADRAO_REUTILIZAVEL.md). */
(window.ANALISES = window.ANALISES || {}).radiador = {
  file: "aditivo_radiador_1l.html",
  title: "Aditivo para Radiador 1 L",
  category: "Arrefecedor e Anticongelante",
  marketplace: "Mercado Livre",
  period: "01/09/2026 a 30/09/2026",
  compare: "mês anterior",
  verdict: "Um mercado de R$ 11 milhões por mês, em alta e sem dono: nenhum dos comparáveis de 1 L passa de 0,35% da receita da categoria. Aqui ganha quem executa melhor, não quem chegou primeiro.",
  lede: "Análise da categoria de arrefecimento e do subsegmento de 1 litro para orientar posicionamento, arquitetura de oferta, conteúdo e execução competitiva.",
  hubSummary: "Categoria grande, pulverizada e em crescimento. O litro é disputado em quatro territórios de preço.",

  cat: {
    rev: 11e6, revDelta: -1.6, sales: 158e3, salesDelta: 1.15, ticket: 69, ticketDelta: -2.72,
    active: 159e3, activeDelta: 0.67, selling: 2100, sellingDelta: 1.29,
    revPerSeller: 1800, revPerSellerDelta: -7.06, full: 789, fullDelta: 3.95,
    medal: 37.2, monopoly: 8.4, catalog: 2.31
  },
  kpiNotes: {
    rev: "Praticamente estável no mês; a queda vem do ticket, não da demanda.",
    sales: "O volume cresce mesmo com a receita levemente menor.",
    ticket: "Preço e mix médios pressionados.",
    selling: "Muitos itens ativos, com o giro concentrado em uma parcela pequena.",
    active: "Oferta extremamente extensa.",
    revPerSeller: "Alta dispersão de receita entre as operações.",
    full: "Só cerca de 0,5% dos anúncios ativos está no Full."
  },
  insights: [
    { t: "O mês recuou, a tendência é de alta", p: "A receita caiu 1,6% contra agosto, mas está cerca de 20% acima de setembro de 2025 e 67% acima de dezembro de 2024 (leitura aproximada do gráfico do relatório). As vendas subiram 1,15% no mês: quem cedeu foi o ticket." },
    { t: "Pulverização extrema", p: "A monopolização é de apenas 8,4%. Os seis anúncios de 1 L mais comparáveis somam perto de 1,7% da receita da categoria — o maior deles, sozinho, fica em 0,33%. Não há um líder a derrubar; há espaço a ocupar." },
    { t: "O litro é disputado em quatro territórios", p: "Original de montadora, concentrado, pronto uso e kit convivem com tickets de R$ 27 a R$ 69. O cliente compara marca, especificação e compatibilidade — não apenas volume e preço." }
  ],
  marketTitle: "O que a estrutura diz",
  marketCallouts: [
    { c: "green", t: "Mercado amplo", p: "158 mil vendas no mês e cerca de 6,1 mil vendedores com receita (estimativa: receita da categoria ÷ receita média por vendedor). Há lugar para várias marcas e posicionamentos." },
    { c: "amber", t: "Publicar não é girar", p: "De 159 mil anúncios, 2,1 mil venderam. Quem vende faz, em média, 75 vendas e R$ 5,2 mil no mês — os comparáveis de 1 L fazem de 5 a 7 vezes isso." },
    { c: "blue", t: "Full e catálogo ainda são raros", p: "789 anúncios em Full (+3,95%) e 2,31% dos produtos em catálogo. Logística e ficha completa são diferenciais disponíveis, não requisitos já nivelados." }
  ],

  product: {
    nav: "Segmento 1 litro",
    title: "O recorte de 1 litro",
    q: "Por quais critérios o cliente escolhe um aditivo de 1 L?",
    cards: [
      { t: "Tipo químico e uso", p: "“Pronto uso” e “concentrado” são atributos centrais. A apresentação precisa eliminar a dúvida de aplicação e deixar a diferença explícita." },
      { t: "Compatibilidade", p: "Vários anúncios trazem montadoras e modelos no título. Compatibilidade funciona como filtro de confiança e como mecanismo de descoberta na busca." },
      { t: "Cor e especificação", p: "Rosa, azul e outras cores aparecem repetidamente. O anúncio precisa explicar a especificação correta sem incentivar a escolha apenas pela cor." },
      { t: "Marca e originalidade", p: "Mopar, Honda, Petronas, Tirreno, Wurth e Paraflu mostram que a marca é parte relevante do valor percebido — e sustenta ticket duas vezes maior." },
      { t: "Arquitetura de volume", p: "A unidade de 1 L compete também com kits 4×1 L e galões. Uma escada clara de quantidade evita perder o cliente de reposição recorrente." },
      { t: "Logística e confiança", p: "Frete grátis, reputação, avaliações e idade do anúncio ajudam a converter em uma categoria com mais de cem mil ofertas." }
    ]
  },

  benchTitle: "Benchmark de ofertas de 1 L",
  benchQ: "Quem vende, quanto vende e a que preço?",
  segments: [
    { id: "mont", label: "Original de montadora" },
    { id: "pronto", label: "Pronto uso" },
    { id: "conc", label: "Concentrado" },
    { id: "kit", label: "Kit 4×1 L" }
  ],
  offers: [
    { name: "Aditivo Radiador Coolant Antifreeze Mopar 1L", brand: "Mopar", seg: "mont", price: "≈ R$ 67,98", rev: 36760, sales: 614, type: "Clássico", ship: "Frete grátis", imgs: 8, reviews: 441, rating: 5.0 },
    { name: "Aditivo Arrefecimento Fluido Radiador Honda 1L", brand: "Honda", seg: "mont", price: "R$ 63,84–78,45", rev: 30597, sales: 473, imgs: 4, reviews: 1473, rating: 4.9 },
    { name: "Petronas Coolant Up Concentrado Orgânico 1L", brand: "Petronas", seg: "conc", price: "R$ 29,35–186,90", rev: 29900, sales: 615, imgs: 9, reviews: 987, rating: 4.9 },
    { name: "Tirreno HT-A Pronto Uso 1L", brand: "Tirreno", seg: "pronto", price: "R$ 23,00–85,91", rev: 27609, sales: 702, type: "Mais vendido", imgs: 7, reviews: 3865, rating: 5.0 },
    { name: "Wurth Fluido Radiador 1L Kit x4", brand: "Wurth", seg: "kit", price: "R$ 59,95–78,90", rev: 25307, sales: 368, imgs: 11, reviews: 174, rating: 5.0 },
    { name: "Paraflu Pronto Uso Rosa 1L", brand: "Paraflu", seg: "pronto", price: "≈ R$ 35,90", rev: 34553, sales: 1299, type: "Clássico", ship: "Frete grátis", imgs: 6, reviews: 1718, rating: 5.0 }
  ],
  benchInsights: [
    { t: "O volume mora no pronto uso", p: "Tirreno e Paraflu respondem por 49% das unidades do recorte, com ticket implícito perto de R$ 31. É o território de giro — e o de menor preço." },
    { t: "A montadora captura valor", p: "Mopar e Honda fazem 36% da receita com 27% das unidades. O ticket de cerca de R$ 62 é o dobro do pronto uso: originalidade e compatibilidade sustentam preço." },
    { t: "O kit eleva o ticket, não o preço do litro", p: "O kit Wurth tem o maior ticket do recorte (≈ R$ 69) e, se for de fato 4×1 L como indica o título, o litro mais barato (≈ R$ 17). Quantidade é alavanca de conveniência." }
  ],

  season: {
    start: [2024, 12], revScale: 1e6, volScale: 1e3,
    rev: [6.57, 6.09, 6.11, 6.37, 7.59, 8.95, 7.21, 8.01, 8.93, 9.12, 9.14, 9.34, 8.82, 9.57, 9.29, 7.8, 8.96, 9.68, 10.73, 10.51, 11.12, 10.95],
    vol: [81.88, 75.0, 80.0, 83.12, 93.75, 92.5, 94.38, 110.0, 124.4, 126.25, 127.5, 124.69, 126.25, 113.18, 123.75, 112.95, 123.87, 136.55, 144.38, 140.46, 156.56, 158.12],
    img: "assets/img/sazonalidade-radiador-original.png",
    tag: "Estável, sem período de pico",
    title: "Sem pico sazonal, com tendência de alta",
    text: "A ferramenta classifica a categoria como estável porque não há um mês que domine o ano. Mas estável na sazonalidade não é parado: em 21 meses as vendas quase dobraram, enquanto o ticket médio recuou. A demanda é contínua — presença, estoque, cobertura de palavras-chave e reputação pesam mais que calendário promocional.",
    next: "Próximo evento indicado: Dia das Crianças, 12/10."
  },

  share: { def: 0.2, max: 1.5, step: 0.05, ticket: 45, ticketNote: "Padrão: ticket implícito médio dos comparáveis de 1 L (≈ R$ 45)." },

  plan: [
    { t: "Escolher um território de posicionamento", p: "Decidir se o produto será vendido por especificação técnica, compatibilidade, marca premium, praticidade do pronto uso ou custo por litro. Evitar a mensagem genérica.", kpi: "ticket implícito frente ao do território escolhido" },
    { t: "Ganhar a busca por compatibilidade", p: "Mapear veículos, especificações e termos de busca realmente compatíveis e refletir isso no título, na ficha técnica e nas imagens.", kpi: "posição orgânica nos termos de montadora e modelo" },
    { t: "Construir a escada de quantidade", p: "1 L como porta de entrada; kits com múltiplas unidades para elevar o ticket e competir com quem trabalha volume.", kpi: "participação dos kits nas vendas" },
    { t: "Elevar a prova visual", p: "Carrossel com embalagem, modo de uso, indicação de pronto uso ou concentrado, compatibilidades e especificações. Os comparáveis usam de 4 a 11 imagens.", kpi: "conversão do anúncio" },
    { t: "Priorizar reputação e avaliações", p: "37,2% dos vendedores têm medalha e os comparáveis acumulam de 174 a 3.865 avaliações. Em mercado pulverizado, reputação converte e sustenta preço.", kpi: "número de avaliações e nota" },
    { t: "Monitorar preço por subsegmento", p: "Comparar pronto uso com pronto uso, concentrado com concentrado e original com original. Misturar os grupos distorce a leitura competitiva.", kpi: "faixa de preço do subsegmento, mês a mês" }
  ],
  limits: "Os dados de categoria incluem ofertas adjacentes ao produto-alvo (galões, kits e outros volumes). Por isso a leitura combina a visão macro da categoria com um recorte de seis anúncios mais comparáveis — uma amostra, não o universo do 1 L."
};

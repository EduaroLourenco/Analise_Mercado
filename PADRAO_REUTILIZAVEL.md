# Padrão reutilizável — Análise de Mercado Interativa

## Objetivo
Apresentar ao cliente, de forma visual e comercial, o tamanho do mercado, sua dinâmica, os principais concorrentes, a arquitetura de produtos/ofertas e o jogo competitivo recomendado. Não usar lucro, margem ou rentabilidade quando os dados não forem confiáveis.

## Como criar uma nova análise
1. Copie `assets/js/data-radiador.js` para `assets/js/data-<nome>.js` e troque a chave (`.radiador`) e os valores.
2. Copie `aditivo_radiador_1l.html`, ajuste `<title>`, `data-analise="<nome>"` e o `<script>` de dados.
3. Inclua o novo arquivo de dados no `index.html` — o cartão e a coluna do comparativo aparecem sozinhos.

Tudo o que é derivado (ticket implícito, fatia da categoria, peso por território, variação em 12 meses, simuladores) é calculado em `assets/js/app.js` a partir dos dados brutos. Só os textos de leitura são escritos à mão.

## Ordem padrão
1. Visão executiva
2. Tamanho e dinâmica do mercado
3. Produto ou subsegmento-alvo
4. Mapa de concorrência
5. Sazonalidade
6. Plano competitivo recomendado
7. Metodologia e limitações

## Indicadores prioritários
- Receita da categoria e variação
- Vendas e variação
- Ticket médio
- Produtos totais e produtos com venda
- Receita média por vendedor
- Monopolização / concentração
- % de vendedores com medalha
- Full, frete grátis, catálogo
- Preço/faixa de preço
- Avaliações, nota, número de imagens, idade do anúncio
- Marcas e vendedores mais relevantes
- Arquitetura de volume/kit
- Sazonalidade

## Indicadores derivados (calculados)
- Ticket implícito = receita do anúncio ÷ vendas do anúncio
- Fatia da categoria = receita do anúncio ÷ receita da categoria
- Produto médio com giro = vendas (ou receita) da categoria ÷ produtos com venda
- Vendedores com receita ≈ receita da categoria ÷ receita média por vendedor
- Decomposição da variação de receita em volume e ticket
- Variação em 12 meses, a partir da série histórica

## Sistema visual
- Fundo geral: #F4F6F8
- Superfícies: branco
- Texto: #132238
- Azul de ação: #1F5EFF
- Verde positivo: #147D64
- Âmbar de atenção: #9A6500
- Vermelho de queda: #B43A3A
- Sidebar: #0F1C2E
- Bordas: #DDE3EA
- Séries dos gráficos (territórios), nesta ordem: #1F5EFF, #D2520F, #0AA39A, #B8369A — conjunto validado para daltonismo; verde, âmbar e vermelho ficam reservados para variação
- Tipografia: Inter / system UI
- Cards com raio 16–20px, sombras discretas
- Animação apenas em hover/transições leves

## Regras de UX
- Abrir com uma frase de leitura e quatro KPIs no máximo
- Toda seção responde a uma pergunta comercial, escrita como subtítulo
- Usar tabelas para benchmarking e barras simples para comparação
- Nunca dois eixos no mesmo gráfico: séries de escalas diferentes viram índice (base 100) ou gráficos separados
- Evitar gráficos decorativos ou 3D
- Dar contexto para toda variação percentual (contra o quê, sobre qual base)
- Separar categoria ampla de recorte comparável
- Sempre explicitar limitações dos dados; dado ausente aparece como “n/d”
- Priorizar leitura top-down: macro → produto → concorrência → ação
- Funcionar no celular e sair bem em PDF (botão “Salvar em PDF”)

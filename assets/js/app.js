/* Market Review — renderizador das análises.
   Cada página declara <body data-analise="id"> e carrega um arquivo de dados
   que registra window.ANALISES[id]. O index (sem data-analise) monta o índice. */
(function () {
  "use strict";
  const A_ALL = window.ANALISES || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const SERIES = ["var(--s1)", "var(--s2)", "var(--s3)", "var(--s4)"];
  const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

  /* ---------- formatação ---------- */
  const nf = (n, d = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const brl = (n, d = 0) => "R$ " + nf(n, d);
  const pct = (n, d = 1) => nf(n, d) + "%";
  function short(n) {
    if (n >= 1e6) return nf(n / 1e6, n % 1e6 ? 1 : 0) + " mi";
    if (n >= 1e3) return nf(n / 1e3, n % 1e3 && n < 1e5 ? 1 : 0) + " mil";
    return nf(n);
  }
  const brlShort = (n) => "R$ " + short(n);
  function deltaHTML(d, suffix = "") {
    const dir = d > 0 ? "up" : d < 0 ? "down" : "flat";
    const arrow = d > 0 ? "▲" : d < 0 ? "▼" : "•";
    return `<span class="delta ${dir}">${arrow} ${nf(Math.abs(d), 2).replace(/,?0+$/, "")}%${suffix}</span>`;
  }
  const nd = '<span class="nd">n/d</span>';
  const signed = (v, d = 0) => (v > 0 ? "+" : v < 0 ? "−" : "") + nf(Math.abs(v), d) + "%";

  /* ---------- tooltip ---------- */
  let tip;
  function showTip(html, x, y) {
    if (!tip) { tip = document.createElement("div"); tip.id = "tip"; tip.setAttribute("role", "status"); document.body.appendChild(tip); }
    tip.innerHTML = html; tip.classList.add("show");
    const r = tip.getBoundingClientRect();
    let left = x + 14, top = y + 14;
    if (left + r.width > innerWidth - 8) left = x - r.width - 14;
    if (top + r.height > innerHeight - 8) top = y - r.height - 14;
    tip.style.left = Math.max(8, left) + "px"; tip.style.top = Math.max(8, top) + "px";
  }
  const hideTip = () => tip && tip.classList.remove("show");
  const tipRow = (k, v) => `<div class="row"><span>${k}</span><strong>${v}</strong></div>`;

  /* ---------- derivados ---------- */
  function derive(A) {
    const c = A.cat;
    A.offers.forEach((o) => { o.ticket = o.rev / o.sales; o.share = (o.rev / c.rev) * 100; });
    const s = A.season, n = s.rev.length;
    s.labels = s.rev.map((_, i) => { const m = s.start[1] - 1 + i; return MONTHS[m % 12] + "/" + String(s.start[0] + Math.floor(m / 12)).slice(2); });
    s.ticket = s.rev.map((r, i) => (r * s.revScale) / (s.vol[i] * s.volScale));
    const ch = (arr, a, b) => (arr[b] / arr[a] - 1) * 100;
    A.d = {
      sellPct: (c.selling / c.active) * 100,
      perProdSales: c.sales / c.selling, perProdRev: c.rev / c.selling,
      sellers: c.rev / c.revPerSeller, fullPct: (c.full / c.active) * 100,
      yoyRev: ch(s.rev, n - 13, n - 1), yoyVol: ch(s.vol, n - 13, n - 1), yoyTicket: ch(s.ticket, n - 13, n - 1),
      totRev: ch(s.rev, 0, n - 1), totVol: ch(s.vol, 0, n - 1), totTicket: ch(s.ticket, 0, n - 1),
      peak: s.labels[s.rev.indexOf(Math.max(...s.rev))],
      setRev: A.offers.reduce((t, o) => t + o.rev, 0), setSales: A.offers.reduce((t, o) => t + o.sales, 0)
    };
    return A;
  }

  /* ---------- gráfico de linhas ---------- */
  function niceTicks(min, max, count = 4) {
    const span = max - min || 1, raw = span / count, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count + 0.5) || 10 * mag;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, t = [];
    for (let v = lo; v <= hi + step / 1e6; v += step) t.push(+v.toFixed(6));
    return t;
  }
  function lineChart(el, cfg) {
    function draw() {
      const W = Math.max(320, el.clientWidth), H = cfg.height || 300, labelsRight = cfg.series.length > 1;
      const m = { t: 14, r: labelsRight ? 96 : 20, b: 28, l: 52 };
      const all = cfg.series.flatMap((s) => s.values);
      const ticks = niceTicks(Math.min(...all), Math.max(...all));
      const y0 = ticks[0], y1 = ticks[ticks.length - 1], n = cfg.labels.length;
      const X = (i) => m.l + (i / (n - 1)) * (W - m.l - m.r), Y = (v) => m.t + (1 - (v - y0) / (y1 - y0)) * (H - m.t - m.b);
      let h = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${cfg.aria}"><g class="grid">`;
      ticks.forEach((t) => { h += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}"/><text x="${m.l - 8}" y="${Y(t) + 4}" text-anchor="end">${cfg.fmtAxis(t)}</text>`; });
      h += "</g>";
      const every = W < 560 ? 6 : 3;
      cfg.labels.forEach((l, i) => { if ((n - 1 - i) % every === 0) h += `<text x="${X(i)}" y="${H - 8}" text-anchor="middle">${l}</text>`; });
      if (cfg.baseline != null) h += `<line class="axis" stroke-dasharray="3 3" x1="${m.l}" x2="${W - m.r}" y1="${Y(cfg.baseline)}" y2="${Y(cfg.baseline)}"/>`;
      cfg.series.forEach((s) => {
        h += `<path d="${s.values.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join("")}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
        h += `<circle cx="${X(n - 1)}" cy="${Y(s.values[n - 1])}" r="4" fill="${s.color}" stroke="#fff" stroke-width="2"/>`;
      });
      if (labelsRight) {
        const ends = cfg.series.map((s) => ({ s, y: Y(s.values[n - 1]) })).sort((a, b) => a.y - b.y);
        for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 15) ends[i].y = ends[i - 1].y + 15;
        ends.forEach((e) => { h += `<text class="lab" x="${W - m.r + 10}" y="${e.y + 4}">${e.s.name}</text>`; });
      }
      h += `<line class="axis cross" y1="${m.t}" y2="${H - m.b}" visibility="hidden"/>`;
      cfg.series.forEach((s, k) => { h += `<circle class="hov" data-k="${k}" r="5" fill="${s.color}" stroke="#fff" stroke-width="2" visibility="hidden"/>`; });
      h += `<rect class="hit" x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" fill="transparent"/></svg>`;
      el.innerHTML = h;
      const svg = $("svg", el), cross = $(".cross", el), hov = $$(".hov", el);
      function move(ev) {
        const p = ev.touches ? ev.touches[0] : ev, r = svg.getBoundingClientRect();
        const px = ((p.clientX - r.left) / r.width) * W;
        const i = Math.max(0, Math.min(n - 1, Math.round(((px - m.l) / (W - m.l - m.r)) * (n - 1))));
        cross.setAttribute("x1", X(i)); cross.setAttribute("x2", X(i)); cross.setAttribute("visibility", "visible");
        hov.forEach((c, k) => { c.setAttribute("cx", X(i)); c.setAttribute("cy", Y(cfg.series[k].values[i])); c.setAttribute("visibility", "visible"); });
        showTip(`<b>${cfg.labels[i]}</b>` + cfg.tip(i), p.clientX, p.clientY);
      }
      function leave() { cross.setAttribute("visibility", "hidden"); hov.forEach((c) => c.setAttribute("visibility", "hidden")); hideTip(); }
      const hit = $(".hit", el);
      hit.addEventListener("mousemove", move); hit.addEventListener("mouseleave", leave);
      hit.addEventListener("touchstart", move, { passive: true }); hit.addEventListener("touchmove", move, { passive: true }); hit.addEventListener("touchend", leave);
    }
    draw();
    if (el._ro) el._ro.disconnect();
    let w = el.clientWidth;
    el._ro = new ResizeObserver(() => { if (Math.abs(el.clientWidth - w) > 4) { w = el.clientWidth; draw(); } });
    el._ro.observe(el);
  }

  function seasonChart(A, el, mode) {
    const s = A.season, idx = (arr) => arr.map((v) => (v / arr[0]) * 100);
    const full = (i) => tipRow("Receita", brlShort(s.rev[i] * s.revScale)) + tipRow("Vendas", short(s.vol[i] * s.volScale)) + tipRow("Ticket médio", brl(s.ticket[i]));
    const revAxis = (v) => (s.revScale === 1e6 ? "R$ " + nf(v, v % 1 ? 1 : 0) + " mi" : "R$ " + nf(v) + " mil");
    const cfgs = {
      indice: { series: [{ name: "Vendas", color: SERIES[1], values: idx(s.vol) }, { name: "Receita", color: SERIES[0], values: idx(s.rev) }, { name: "Ticket médio", color: SERIES[2], values: idx(s.ticket) }], fmtAxis: (v) => nf(v), baseline: 100,
        tip: (i) => tipRow("Vendas", nf(idx(s.vol)[i])) + tipRow("Receita", nf(idx(s.rev)[i])) + tipRow("Ticket médio", nf(idx(s.ticket)[i])) + `<div class="row" style="margin-top:4px"><span>${s.labels[0]} = 100</span></div>` },
      receita: { series: [{ name: "Receita", color: SERIES[0], values: s.rev }], fmtAxis: revAxis, tip: full },
      vendas: { series: [{ name: "Vendas", color: SERIES[1], values: s.vol }], fmtAxis: (v) => nf(v, v % 1 ? 1 : 0) + " mil", tip: full },
      ticket: { series: [{ name: "Ticket médio", color: SERIES[2], values: s.ticket }], fmtAxis: (v) => "R$ " + nf(v), tip: full }
    };
    const c = cfgs[mode];
    lineChart(el, Object.assign(c, { labels: s.labels, aria: `Evolução mensal da categoria, ${s.labels[0]} a ${s.labels[s.labels.length - 1]}` }));
    const lg = el.parentNode.querySelector(".legend");
    lg.innerHTML = c.series.length > 1 ? c.series.map((x) => `<span><i class="sw" style="--c:${x.color}"></i>${x.name}</span>`).join("") + `<span>Índice: ${s.labels[0]} = 100</span>` : "";
  }

  /* ---------- blocos ---------- */
  const metric = (label, value, delta, sub) => `<div class="card metric"><div class="label">${label}</div><div class="value num">${value}</div>${delta}<div class="sub">${sub}</div></div>`;
  const head = (h, q) => `<div class="section-head"><h2>${h}</h2><p class="q">${q}</p></div>`;
  const insights = (list) => `<div class="insights">${list.map((i) => `<article><h3>${i.t}</h3><p>${i.p}</p></article>`).join("")}</div>`;
  function waffle(p) {
    let h = `<div class="waffle" role="img" aria-label="${nf(p, 1)} de cada 100 anúncios venderam">`;
    for (let i = 0; i < 100; i++) { const f = Math.max(0, Math.min(1, p - i)); h += f >= 1 ? '<i class="on"></i>' : f > 0 ? `<i class="part" style="--w:${f * 100}%"></i>` : "<i></i>"; }
    return h + "</div>";
  }
  function decomp(c) {
    const rows = [["Vendas (volume)", c.salesDelta], ["Ticket médio", c.ticketDelta], ["Receita", c.revDelta]];
    const max = Math.max(...rows.map((r) => Math.abs(r[1])));
    return rows.map(([l, v], i) => `<div class="div-row"${i === 2 ? ' style="font-weight:700;border-top:1px solid var(--line);padding-top:9px"' : ""}><span>${l}</span><div class="div-track"><div class="div-bar ${v < 0 ? "neg" : "pos"}" style="width:${(Math.abs(v) / max) * 46}%"></div></div><span class="v num">${signed(v, 2)}</span></div>`).join("");
  }

  function renderAnalysis(A) {
    derive(A);
    const c = A.cat, d = A.d, k = A.kpiNotes, P = A.product, s = A.season, vs = " vs. " + A.compare;
    document.title = `${A.title} — Análise de Mercado`;
    const nav = [["visao", "Visão executiva"], ["mercado", "Tamanho e dinâmica"], ["produto", P.nav], ["concorrencia", "Concorrência"], ["sazonalidade", "Sazonalidade"], ["estrategia", "Plano recomendado"], ["metodologia", "Metodologia"]];
    const segColor = Object.fromEntries(A.segments.map((g, i) => [g.id, SERIES[i]]));
    const segLabel = Object.fromEntries(A.segments.map((g) => [g.id, g.label]));

    const segRows = A.segments.map((g) => {
      const of = A.offers.filter((o) => o.seg === g.id), r = of.reduce((t, o) => t + o.rev, 0), v = of.reduce((t, o) => t + o.sales, 0);
      return `<div class="barrow"><div class="barlabel"><i class="sw" style="--c:${segColor[g.id]}"></i> <b>${g.label}</b></div><div><div class="bar" title="Receita"><div class="fill" style="width:${(r / d.setRev) * 100}%;background:${segColor[g.id]}"></div></div><div class="bar" title="Unidades" style="margin-top:3px;height:6px"><div class="fill" style="width:${(v / d.setSales) * 100}%;background:${segColor[g.id]};opacity:.45"></div></div></div><div class="barvalue num">${pct((r / d.setRev) * 100, 0)} · ${pct((v / d.setSales) * 100, 0)}<div class="note" style="font-weight:500">ticket ${brl(r / v)}</div></div></div>`;
    }).join("");

    $("#app").innerHTML = `
<div class="shell">
<aside class="side">
  <a class="brand" href="index.html">Market Review</a>
  <div class="meta">Análise comercial e competitiva<br>${A.category}</div>
  <nav class="nav" aria-label="Seções">${nav.map(([id, l]) => `<a href="#${id}">${l}</a>`).join("")}</nav>
  <a class="back" href="index.html">Todas as análises</a>
  <div class="foot">Sem análise de lucro ou rentabilidade.<br>Dados do relatório de mercado enviado.</div>
</aside>
<main class="main">
  <header class="hero">
    <div>
      <div class="context">Análise de mercado no ${A.marketplace}</div>
      <h1>${A.title}</h1>
      <p class="verdict">${A.verdict}</p>
      <p class="lede">${A.lede}</p>
    </div>
    <dl class="period">
      <div><dt>Período-base</dt><dd>${A.period}</dd></div>
      <div><dt>Categoria</dt><dd>${A.category}</dd></div>
      <div class="hero-actions"><button class="btn" id="print">Salvar em PDF</button></div>
    </dl>
  </header>

  <section class="section" id="visao">
    ${head("Visão executiva", "O que o cliente precisa entender em 60 segundos?")}
    <div class="grid g4">
      ${metric("Receita da categoria", brlShort(c.rev), deltaHTML(c.revDelta, vs), k.rev)}
      ${metric("Vendas", short(c.sales), deltaHTML(c.salesDelta), k.sales)}
      ${metric("Ticket médio", brl(c.ticket), deltaHTML(c.ticketDelta), k.ticket)}
      ${metric("Produtos com venda", short(c.selling), deltaHTML(c.sellingDelta), k.selling)}
    </div>
    ${insights(A.insights)}
  </section>

  <section class="section" id="mercado">
    ${head("Tamanho e dinâmica do mercado", "Qual é o tamanho do jogo e como ele está estruturado?")}
    <div class="grid g3">
      ${metric("Produtos ativos", short(c.active), deltaHTML(c.activeDelta), k.active)}
      ${metric("Receita média por vendedor", brlShort(c.revPerSeller), deltaHTML(c.revPerSellerDelta), k.revPerSeller)}
      ${metric("Anúncios em Full", nf(c.full), deltaHTML(c.fullDelta), k.full)}
    </div>
    <div class="grid g2 mt">
      <div class="card">
        <h3>De onde veio a variação da receita</h3>
        <p class="hint">Receita = vendas × ticket médio. Variação contra o ${A.compare}.</p>
        ${decomp(c)}
        <p class="note" style="margin-top:10px">${c.salesDelta > 0 && c.revDelta < 0 ? "O volume cresceu; a receita só caiu porque o ticket médio recuou." : Math.abs(c.salesDelta) > Math.abs(c.ticketDelta) ? "A maior parte da queda veio do volume; o ticket respondeu pelo restante." : "A maior parte da variação veio do ticket médio."}</p>
      </div>
      <div class="card">
        <h3>De cada 100 anúncios, ${nf(d.sellPct, 1)} venderam</h3>
        <p class="hint">${short(c.selling)} produtos com venda em ${short(c.active)} ativos.</p>
        ${waffle(d.sellPct)}
        <p class="note" style="margin-top:12px">Quem vende faz em média ${nf(d.perProdSales)} vendas e ${brlShort(Math.round(d.perProdRev / 100) * 100)} no mês.</p>
      </div>
    </div>
    <div class="grid g2 mt">
      <div class="card">
        <h3>Estrutura competitiva</h3>
        <p class="hint">Participação de cada fator na categoria.</p>
        ${[["Vendedores com medalha", c.medal, 1], ["Monopolização", c.monopoly, 1], ["Produtos em catálogo", c.catalog, 2], ["Anúncios em Full", d.fullPct, 1]].map(([l, v, dg]) => `<div class="barrow"><div class="barlabel">${l}</div><div class="bar"><div class="fill" style="width:${v}%"></div></div><div class="barvalue num">${pct(v, dg)}</div></div>`).join("")}
        <p class="note" style="margin-top:8px">Monopolização: quanto da receita se concentra nos maiores vendedores, segundo a ferramenta. Full calculado sobre os anúncios ativos.</p>
      </div>
      <div class="card"><h3>${A.marketTitle}</h3><div class="callouts" style="margin-top:12px">${A.marketCallouts.map((x) => `<div class="callout"><span class="dot ${x.c}"></span><div><strong>${x.t}</strong><span>${x.p}</span></div></div>`).join("")}</div></div>
    </div>
    <div class="card mt">
      <h3>Quanto vale uma fatia deste mercado</h3>
      <p class="hint">Simulação sobre a receita do período-base (${brlShort(c.rev)}). Não considera custo, margem ou tarifa.</p>
      <div class="sim">
        <div>
          <div class="field"><label for="sh">Participação na receita da categoria <output id="sh-o"></output></label><input type="range" id="sh" min="${A.share.step}" max="${A.share.max}" step="${A.share.step}" value="${A.share.def}"></div>
          <div class="field"><label for="tk">Ticket médio do anúncio (R$)</label><input type="number" id="tk" min="1" step="1" value="${A.share.ticket}" inputmode="decimal"><span class="note">${A.share.ticketNote}</span></div>
          <div class="presets"><span class="note" style="align-self:center">Referências:</span>${[...A.offers].sort((a, b) => b.share - a.share).slice(0, 4).map((o) => `<button class="chip" data-share="${o.share.toFixed(2)}">${o.brand} ${pct(o.share, 2)}</button>`).join("")}</div>
        </div>
        <div class="result" aria-live="polite">
          <div class="stat"><b class="num" id="r-rev"></b><span>receita por mês</span></div>
          <div class="stat"><b class="num" id="r-un"></b><span>vendas por mês</span></div>
          <div class="stat"><b class="num" id="r-day"></b><span>vendas por dia</span></div>
          <div class="stat"><b class="num" id="r-x"></b><span>vezes o produto médio com giro</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="produto">
    ${head(P.title, P.q)}
    ${P.kpis ? `<div class="grid g4">${P.kpis.map((x) => metric(x.label, x.value, `<span class="delta ${x.dir}">${x.delta}</span>`, x.sub)).join("")}</div>` : ""}
    <div class="insights"${P.kpis ? "" : ' style="margin-top:0"'}>${P.cards.map((i) => `<article><h3>${i.t}</h3><p>${i.p}</p></article>`).join("")}</div>
    ${A.reviews ? `
    <div class="card mt" style="margin-top:22px">
      <h3>Em quanto tempo o alvo alcança a prova social dos concorrentes</h3>
      <p class="hint">Hoje: ${A.reviews.current} avaliações. A taxa de avaliação por venda é uma premissa — ajuste conforme o histórico real da conta.</p>
      <div class="sim">
        <div>
          <div class="field"><label for="rv-s">Vendas por mês <output id="rv-s-o"></output></label><input type="range" id="rv-s" min="10" max="300" step="5" value="${A.reviews.sales}"></div>
          <div class="field"><label for="rv-r">Compradores que avaliam <output id="rv-r-o"></output></label><input type="range" id="rv-r" min="2" max="40" step="1" value="${A.reviews.rate}"></div>
        </div>
        <div id="rv-out" aria-live="polite"></div>
      </div>
    </div>` : ""}
  </section>

  <section class="section" id="concorrencia">
    ${head(A.benchTitle, A.benchQ)}
    <div class="controls">
      <span class="lbl">Território</span>
      ${A.segments.map((g) => `<button class="chip" data-seg="${g.id}" aria-pressed="true" style="--c:${segColor[g.id]}"><i class="sw"></i>${g.label}</button>`).join("")}
      <span class="spacer"></span>
      <span class="lbl">Comparar por</span>
      <div class="seg" id="bm" role="group" aria-label="Métrica">${[["rev", "Receita"], ["sales", "Vendas"], ["ticket", "Ticket"], ["reviews", "Avaliações"]].map(([m, l], i) => `<button data-m="${m}" aria-pressed="${!i}">${l}</button>`).join("")}</div>
    </div>
    <div class="grid g21">
      <div class="grid"><div class="card"><h3 id="bars-t"></h3><p class="hint" id="bars-h"></p><div id="bars"></div></div>
      <div class="card"><h3>Peso de cada território no recorte</h3><p class="hint">Barra cheia: % da receita dos comparáveis · barra fina: % das unidades.</p>${segRows}</div></div>
      <div class="card"><h3>Preço contra volume</h3><p class="hint">Ticket implícito × vendas no período. O tamanho do círculo é a receita.</p><div class="chart" id="scatter"></div></div>
    </div>
    <div class="table-wrap mt"><table class="table" id="tbl"><thead></thead><tbody></tbody></table></div>
    <p class="note" style="margin-top:8px">Clique no cabeçalho para ordenar. Ticket implícito = receita ÷ vendas; pode ficar abaixo do preço anunciado por promoções e variações. “n/d” = dado ausente no relatório.</p>
    ${insights(A.benchInsights)}
  </section>

  <section class="section" id="sazonalidade">
    ${head("Sazonalidade e evolução", "A demanda depende de calendário ou é contínua?")}
    <div class="grid g21">
      <div class="card">
        <div class="controls" style="margin-bottom:6px"><div class="seg" id="sm" role="group" aria-label="Série">${[["indice", "Índice"], ["receita", "Receita"], ["vendas", "Vendas"], ["ticket", "Ticket médio"]].map(([m, l], i) => `<button data-m="${m}" aria-pressed="${!i}">${l}</button>`).join("")}</div></div>
        <div class="chart" id="season"></div><div class="legend"></div>
        <div class="statline">
          <div class="stat"><b class="num">${signed(d.yoyRev)}</b><span>receita vs. ${s.labels[s.labels.length - 13]}</span></div>
          <div class="stat"><b class="num">${signed(d.yoyVol)}</b><span>vendas vs. ${s.labels[s.labels.length - 13]}</span></div>
          <div class="stat"><b class="num">${signed(d.yoyTicket)}</b><span>ticket médio vs. ${s.labels[s.labels.length - 13]}</span></div>
        </div>
        <details class="orig"><summary>Ver o gráfico original do relatório</summary><img src="${s.img}" alt="Gráfico original de receita e vendas da categoria, com feriados e eventos comerciais" loading="lazy"></details>
      </div>
      <div class="card">
        <span class="tag blue">${s.tag}</span>
        <h3 style="font-size:17px;margin:12px 0 8px">${s.title}</h3>
        <p style="font-size:13px;color:var(--ink2);line-height:1.6">${s.text}</p>
        <p class="note" style="margin-top:12px">${s.next}</p>
        <p class="note" style="margin-top:12px">Valores mensais aproximados, digitalizados do gráfico do relatório (margem de ±2%). O último ponto confere com os indicadores do período-base.</p>
      </div>
    </div>
  </section>

  <section class="section" id="estrategia">
    ${head("Jogo competitivo recomendado", "O que fazer, em ordem de prioridade, sem entrar em margem?")}
    <div class="card"><div class="plan">${A.plan.map((p, i) => `<div class="step"><div class="n">${i + 1}</div><div><strong>${p.t}</strong><p>${p.p}</p><div class="kpi"><b>Acompanhar:</b> ${p.kpi}</div></div></div>`).join("")}</div></div>
  </section>

  <section class="section" id="metodologia">
    ${head("Metodologia e leitura correta", "Como estes números foram obtidos e até onde eles valem?")}
    <div class="card"><div class="grid g2">
      <div><h3>O que está sendo medido</h3><p class="note" style="margin-bottom:10px">Receita, vendas, volume de ofertas, produtos com venda, Full, catálogo, preço, reputação e intensidade competitiva — estrutura de demanda e execução comercial, não margem, lucro ou rentabilidade.</p>
        <ul class="formulas">
          <li><b>Ticket implícito</b> = receita do anúncio ÷ vendas do anúncio.</li>
          <li><b>Participação</b> = receita do anúncio ÷ receita da categoria no período.</li>
          <li><b>Vendedores com receita</b> ≈ receita da categoria ÷ receita média por vendedor.</li>
          <li><b>Produto médio com giro</b> = vendas (ou receita) da categoria ÷ produtos com venda.</li>
          <li><b>Variação da receita</b> ≈ variação das vendas combinada com a do ticket médio.</li>
        </ul></div>
      <div><h3>Limitações</h3><p class="note">${A.limits}</p><p class="note" style="margin-top:8px">Os indicadores de categoria vêm arredondados no relatório (por exemplo, “${brlShort(c.rev)}”), então os valores derivados são aproximações. A série histórica foi digitalizada do gráfico. Tudo aqui é sinal de mercado, não auditoria financeira.</p></div>
    </div></div>
  </section>
</main></div>`;

    /* --- simulador de participação --- */
    const sh = $("#sh"), tk = $("#tk");
    function simShare() {
      const p = +sh.value, t = Math.max(1, +tk.value || A.share.ticket), rev = (c.rev * p) / 100, un = rev / t;
      $("#sh-o").textContent = pct(p, 2);
      $("#r-rev").textContent = brl(Math.round(rev)); $("#r-un").textContent = nf(Math.round(un));
      $("#r-day").textContent = nf(un / 30, un / 30 < 10 ? 1 : 0); $("#r-x").textContent = nf(rev / d.perProdRev, 1) + "×";
    }
    sh.addEventListener("input", simShare); tk.addEventListener("input", simShare);
    $$("[data-share]").forEach((b) => b.addEventListener("click", () => { sh.value = Math.min(+sh.max, Math.round(+b.dataset.share / A.share.step) * A.share.step); simShare(); }));
    simShare();

    /* --- simulador de avaliações --- */
    if (A.reviews) {
      const rs = $("#rv-s"), rr = $("#rv-r"), targets = A.offers.filter((o) => !o.target && o.reviews).sort((a, b) => a.reviews - b.reviews);
      const simRev = () => {
        const per = (+rs.value * +rr.value) / 100;
        $("#rv-s-o").textContent = rs.value; $("#rv-r-o").textContent = rr.value + "%";
        const max = targets[targets.length - 1].reviews;
        $("#rv-out").innerHTML = `<p class="note" style="margin-bottom:8px">≈ ${nf(per, 1)} novas avaliações por mês</p>` + targets.map((o) => {
          const mo = Math.ceil((o.reviews - A.reviews.current) / per);
          return `<div class="barrow"><div class="barlabel"><b>${o.brand}</b> · ${nf(o.reviews)}</div><div class="bar"><div class="fill" style="width:${(o.reviews / max) * 100}%;background:${segColor[o.seg]}"></div></div><div class="barvalue num">${mo > 24 ? nf(mo / 12, 1) + " anos" : mo + (mo === 1 ? " mês" : " meses")}</div></div>`;
        }).join("");
      };
      rs.addEventListener("input", simRev); rr.addEventListener("input", simRev); simRev();
    }

    /* --- concorrência --- */
    const state = { m: "rev", segs: new Set(A.segments.map((g) => g.id)), sort: "rev", dir: -1 };
    const M = {
      rev: { t: "Receita por anúncio", h: "Receita no período-base.", f: (v) => brl(v) },
      sales: { t: "Vendas por anúncio", h: "Unidades vendidas no período-base.", f: (v) => nf(v) },
      ticket: { t: "Ticket implícito por anúncio", h: "Receita ÷ vendas.", f: (v) => brl(v, 2) },
      reviews: { t: "Avaliações acumuladas", h: "Prova social de cada anúncio.", f: (v) => nf(v) }
    };
    const offerTip = (o) => `<b>${o.name}</b>` + tipRow("Território", segLabel[o.seg]) + tipRow("Receita", brl(o.rev)) + tipRow("Vendas", nf(o.sales)) + tipRow("Ticket implícito", brl(o.ticket, 2)) + tipRow("Fatia da categoria", pct(o.share, 2)) + (o.reviews ? tipRow("Avaliações", nf(o.reviews)) : "");
    const bindTip = (root, sel) => $$(sel, root).forEach((n) => { const o = A.offers[+n.dataset.i]; n.addEventListener("mousemove", (e) => showTip(offerTip(o), e.clientX, e.clientY)); n.addEventListener("mouseleave", hideTip); });
    const visible = () => A.offers.filter((o) => state.segs.has(o.seg));

    function drawBars() {
      const mm = M[state.m], list = visible().filter((o) => o[state.m] != null).sort((a, b) => b[state.m] - a[state.m]), max = Math.max(...list.map((o) => o[state.m]), 1);
      $("#bars-t").textContent = mm.t; $("#bars-h").textContent = mm.h;
      $("#bars").innerHTML = list.length ? list.map((o) => `<div class="barrow${o.target ? " is-target" : ""}" data-i="${A.offers.indexOf(o)}"><div class="barlabel"><b>${o.brand}</b></div><div class="bar"><div class="fill" style="width:${(o[state.m] / max) * 100}%;background:${segColor[o.seg]}"></div></div><div class="barvalue num">${mm.f(o[state.m])}</div></div>`).join("") : '<p class="note">Selecione ao menos um território.</p>';
      bindTip($("#bars"), ".barrow");
    }
    function drawScatter() {
      const el = $("#scatter"), list = visible(), W = Math.max(300, el.clientWidth), H = 380, m = { t: 14, r: 18, b: 40, l: 46 };
      if (!list.length) { el.innerHTML = '<p class="note">Selecione ao menos um território.</p>'; return; }
      const xt = niceTicks(0, Math.max(...A.offers.map((o) => o.ticket)) * 1.08, 4), yt = niceTicks(0, Math.max(...A.offers.map((o) => o.sales)) * 1.08, 4);
      const X = (v) => m.l + (v / xt[xt.length - 1]) * (W - m.l - m.r), Y = (v) => H - m.b - (v / yt[yt.length - 1]) * (H - m.t - m.b);
      const rmax = Math.max(...A.offers.map((o) => o.rev)), R = (v) => 5 + Math.sqrt(v / rmax) * 8;
      let h = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Ticket implícito e vendas de cada anúncio"><g class="grid">`;
      yt.forEach((t) => { h += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}"/><text x="${m.l - 8}" y="${Y(t) + 4}" text-anchor="end">${nf(t)}</text>`; });
      xt.forEach((t) => { h += `<text x="${X(t)}" y="${H - m.b + 16}" text-anchor="middle">R$ ${nf(t)}</text>`; });
      h += `</g><text x="${m.l + (W - m.l - m.r) / 2}" y="${H - 4}" text-anchor="middle">ticket implícito</text><text x="12" y="${m.t + (H - m.t - m.b) / 2}" text-anchor="middle" transform="rotate(-90 12 ${m.t + (H - m.t - m.b) / 2})">vendas</text>`;
      const placed = list.map((o) => ({ x0: X(o.ticket) - R(o.rev), x1: X(o.ticket) + R(o.rev), y0: Y(o.sales) - R(o.rev), y1: Y(o.sales) + R(o.rev), o }));
      let labels = "";
      [...list].sort((a, b) => b.rev - a.rev).forEach((o) => {
        const cx = X(o.ticket), cy = Y(o.sales), r = R(o.rev), w = o.brand.length * 6.8 + 6;
        h += `<circle class="pt" data-i="${A.offers.indexOf(o)}" cx="${cx}" cy="${cy}" r="${r}" fill="${segColor[o.seg]}" fill-opacity=".85" stroke="#fff" stroke-width="2" style="cursor:pointer"/>`;
        const opts = [[cx + r + 5, cy + 4, "start"], [cx - r - 5, cy + 4, "end"], [cx, cy - r - 6, "middle"], [cx, cy + r + 14, "middle"]];
        const box = ([x, y, a]) => ({ x0: a === "start" ? x : a === "end" ? x - w : x - w / 2, x1: a === "start" ? x + w : a === "end" ? x : x + w / 2, y0: y - 11, y1: y + 3 });
        const ok = (b) => b.x0 >= m.l && b.x1 <= W - 2 && b.y0 >= 0 && !placed.some((p) => p.o !== o && !(b.x1 < p.x0 || b.x0 > p.x1 || b.y1 < p.y0 || b.y0 > p.y1));
        const pick = opts.find((p) => ok(box(p))) || opts[0];
        placed.push(box(pick));
        labels += `<text class="lab" x="${pick[0]}" y="${pick[1]}" text-anchor="${pick[2]}"${o.target ? ' style="fill:var(--blue)"' : ""}>${o.brand}</text>`;
      });
      el.innerHTML = h + labels + "</svg>"; bindTip(el, ".pt");
    }
    const COLS = [
      { k: "name", l: "Oferta", r: (o) => `<div class="offer">${o.name}${o.target ? ' <span class="tag blue">Alvo</span>' : ""}<small><i class="sw" style="--c:${segColor[o.seg]}"></i>${segLabel[o.seg]}</small></div>` },
      { k: "price", l: "Preço anunciado", r: (o) => o.price || nd, ns: 1 },
      { k: "rev", l: "Receita", n: 1, r: (o) => brl(o.rev) },
      { k: "sales", l: "Vendas", n: 1, r: (o) => nf(o.sales) },
      { k: "ticket", l: "Ticket implícito", n: 1, r: (o) => brl(o.ticket, 2) },
      { k: "share", l: "Fatia da categoria", n: 1, r: (o) => pct(o.share, 2) },
      { k: "reviews", l: "Avaliações", n: 1, r: (o) => (o.reviews != null ? nf(o.reviews) : nd) },
      { k: "rating", l: "Nota", n: 1, r: (o) => (o.rating != null ? nf(o.rating, 1) : nd) },
      { k: "imgs", l: "Imagens", n: 1, r: (o) => (o.imgs != null ? o.imgs : nd) },
      { k: "ship", l: "Anúncio e frete", ns: 1, r: (o) => [o.type, o.ship].filter(Boolean).join(" · ") || nd }
    ];
    function drawTable() {
      $("#tbl thead").innerHTML = "<tr>" + COLS.map((cl) => cl.ns ? `<th><button disabled style="cursor:default">${cl.l}</button></th>` : `<th class="${cl.n ? "r" : ""}"${state.sort === cl.k ? ` aria-sort="${state.dir < 0 ? "descending" : "ascending"}"` : ""}><button data-k="${cl.k}">${cl.l}<span class="arrow">${state.sort === cl.k ? (state.dir < 0 ? "▼" : "▲") : "↕"}</span></button></th>`).join("") + "</tr>";
      const col = COLS.find((x) => x.k === state.sort);
      const list = visible().sort((a, b) => { const x = a[col.k], y = b[col.k]; if (x == null) return 1; if (y == null) return -1; return (col.n ? x - y : String(x).localeCompare(String(y), "pt-BR")) * state.dir; });
      $("#tbl tbody").innerHTML = list.map((o) => `<tr class="${o.target ? "is-target" : ""}">${COLS.map((cl) => `<td class="${cl.n ? "r" : ""}">${cl.r(o)}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="${COLS.length}" class="note">Selecione ao menos um território.</td></tr>`;
      $$("#tbl th button[data-k]").forEach((b) => b.addEventListener("click", () => { const kk = b.dataset.k; if (state.sort === kk) state.dir *= -1; else { state.sort = kk; state.dir = COLS.find((x) => x.k === kk).n ? -1 : 1; } drawTable(); }));
    }
    const drawBench = () => { drawBars(); drawScatter(); drawTable(); };
    $$("[data-seg]").forEach((b) => b.addEventListener("click", () => { const id = b.dataset.seg; state.segs.has(id) ? state.segs.delete(id) : state.segs.add(id); b.setAttribute("aria-pressed", state.segs.has(id)); drawBench(); }));
    $$("#bm button").forEach((b) => b.addEventListener("click", () => { state.m = b.dataset.m; $$("#bm button").forEach((x) => x.setAttribute("aria-pressed", x === b)); drawBars(); }));
    drawBench();
    let sw = $("#scatter").clientWidth;
    new ResizeObserver(() => { const w = $("#scatter").clientWidth; if (Math.abs(w - sw) > 4) { sw = w; drawScatter(); } }).observe($("#scatter"));

    /* --- sazonalidade --- */
    seasonChart(A, $("#season"), "indice");
    $$("#sm button").forEach((b) => b.addEventListener("click", () => { $$("#sm button").forEach((x) => x.setAttribute("aria-pressed", x === b)); seasonChart(A, $("#season"), b.dataset.m); }));

    /* --- navegação e impressão --- */
    $("#print").addEventListener("click", () => window.print());
    window.addEventListener("beforeprint", () => $$("details.orig").forEach((x) => (x.open = false)));
    const navs = $$(".nav a");
    const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) navs.forEach((n) => { const on = n.getAttribute("href") === "#" + e.target.id; n.classList.toggle("active", on); if (on) n.setAttribute("aria-current", "true"); else n.removeAttribute("aria-current"); }); }), { rootMargin: "-20% 0px -70% 0px" });
    $$("section[id]").forEach((x) => obs.observe(x));
  }

  /* ---------- índice ---------- */
  function spark(s) {
    const v = s.rev, W = 320, H = 56, mn = Math.min(...v), mx = Math.max(...v), X = (i) => 3 + (i / (v.length - 1)) * (W - 6), Y = (x) => H - 5 - ((x - mn) / (mx - mn)) * (H - 10);
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="56" preserveAspectRatio="none" role="img" aria-label="Receita mensal da categoria, ${s.labels[0]} a ${s.labels[v.length - 1]}"><path d="${v.map((x, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(x).toFixed(1)).join("")}" fill="none" stroke="var(--blue)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
  }
  function renderHub() {
    const list = Object.values(A_ALL).map(derive);
    const row = (l, f, note) => `<tr><td><b style="font-weight:650">${l}</b>${note ? `<div class="note">${note}</div>` : ""}</td>${list.map((A) => `<td class="r">${f(A)}</td>`).join("")}</tr>`;
    $("#app").innerHTML = `
<div class="hub">
  <header class="hub-head">
    <div class="context" style="font-size:13px;font-weight:700;color:var(--blue)">Market Review</div>
    <h1>Análises de mercado</h1>
    <p>Leitura comercial de categorias do Mercado Livre: tamanho, dinâmica, concorrência e plano de ação. Período-base de ${list[0].period}. Sem análise de lucro ou rentabilidade.</p>
  </header>
  <div class="hub-cards">${list.map((A) => `
    <a class="hub-card" href="${A.file}">
      <div class="cat">${A.category}</div><h2>${A.title}</h2><p>${A.hubSummary}</p>
      <div class="mini"><div><b class="num">${brlShort(A.cat.rev)}</b><span>receita no mês</span></div><div><b class="num">${short(A.cat.sales)}</b><span>vendas</span></div><div><b class="num">${signed(A.d.yoyRev)}</b><span>receita em 12 meses</span></div></div>
      <div class="spark">${spark(A.season)}<div class="note">Receita da categoria, ${A.season.labels[0]} a ${A.season.labels[A.season.labels.length - 1]} (aprox.)</div></div>
      <span class="go">Abrir análise</span>
    </a>`).join("")}</div>
  <section class="section">
    ${head("Os dois mercados lado a lado", "Onde o jogo é maior, e onde é mais fácil de entrar?")}
    <div class="table-wrap"><table class="table cmp" style="min-width:560px"><thead><tr><th><button disabled style="cursor:default">Indicador</button></th>${list.map((A) => `<th class="r"><button disabled style="cursor:default">${A.title}</button></th>`).join("")}</tr></thead><tbody>
      ${row("Receita da categoria no mês", (A) => `${brlShort(A.cat.rev)} ${deltaHTML(A.cat.revDelta)}`)}
      ${row("Vendas no mês", (A) => `${short(A.cat.sales)} ${deltaHTML(A.cat.salesDelta)}`)}
      ${row("Ticket médio", (A) => `${brl(A.cat.ticket)} ${deltaHTML(A.cat.ticketDelta)}`)}
      ${row("Receita em 12 meses", (A) => signed(A.d.yoyRev), "set/26 contra set/25, leitura aproximada")}
      ${row("Vendas em 12 meses", (A) => signed(A.d.yoyVol), "leitura aproximada")}
      ${row("Ticket médio em 12 meses", (A) => signed(A.d.yoyTicket), "leitura aproximada")}
      ${row("Anúncios ativos", (A) => short(A.cat.active))}
      ${row("Anúncios que venderam", (A) => pct(A.d.sellPct, 1), "produtos com venda ÷ ativos")}
      ${row("Venda média por produto com giro", (A) => nf(A.d.perProdSales) + " vendas")}
      ${row("Monopolização", (A) => pct(A.cat.monopoly, 1))}
      ${row("Vendedores com medalha", (A) => pct(A.cat.medal, 1))}
      ${row("Produtos em catálogo", (A) => pct(A.cat.catalog, 2))}
    </tbody></table></div>
    ${insights([
      { t: "Escala contra acesso", p: "O mercado de aditivos é cerca de 17 vezes maior em receita, mas só 1,3% dos anúncios vende. No de lubrificantes para armamentos, 12,6% dos anúncios giram: é menor e mais fácil de entrar." },
      { t: "Concentração diferente", p: "A monopolização é de 8,4% nos aditivos e de 28% nos lubrificantes. No primeiro não há líder; no segundo há um grupo forte, mas nenhum incontornável." },
      { t: "Demanda em alta nos dois", p: "Em 12 meses as vendas cresceram cerca de 25% nos aditivos e 12% nos lubrificantes. Nos aditivos o ticket médio cedeu perto de 4%; nos lubrificantes ficou estável. A queda de setembro nos lubrificantes é de mês, não de tendência." }
    ])}
  </section>
  <p class="note" style="margin-top:32px">Dados dos relatórios de mercado enviados. Metodologia e limitações em cada análise. Padrão de construção em <a href="PADRAO_REUTILIZAVEL.md">PADRAO_REUTILIZAVEL.md</a>.</p>
</div>`;
  }

  const id = document.body.dataset.analise;
  if (id && A_ALL[id]) renderAnalysis(A_ALL[id]); else renderHub();
})();

/* Grão de Bruma — catálogo, filtros, sacola e interações (demonstração, sem backend). */
(function () {
  "use strict";

  var catalog = window.GDB_CATALOG;
  var photos = window.GDB_PHOTOS || {};
  var products = catalog.products;
  var byId = {};
  products.forEach(function (p) { byId[p.id] = p; });

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  function money(cents) { return brl.format(cents / 100); }
  function $(sel) { return document.querySelector(sel); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fold(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function listPt(arr) {
    if (arr.length < 2) return arr.join("");
    return arr.slice(0, -1).join(", ") + " e " + arr[arr.length - 1];
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- Fotos: desfoque some quando a imagem termina de carregar ---------- */
  function photoHTML(ph, eager) {
    var c = ph.credit || {};
    return '<div class="photo"><img src="' + esc(ph.src) + '" alt="' + esc(ph.alt || "") + '"' +
      (eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"' +
      ' data-author="' + esc(c.author || "") + '" data-source="' + esc(c.source || "") + '" data-url="' + esc(c.url || "") + '"></div>';
  }
  // Se a foto não carregar, some com ela e com a moldura; a ilustração continua no lugar.
  function dropPhoto(box) {
    box.hidden = true;
    var frame = box.parentNode;
    if (frame && (frame.classList.contains("origin-photo") || frame.classList.contains("guide-photo"))) frame.hidden = true;
    if (frame && frame.classList.contains("card-visual")) frame.classList.remove("has-photo");
  }
  function refreshCredits() {
    var seen = {}, items = [];
    document.querySelectorAll(".photo.loaded img[data-url]").forEach(function (img) {
      var u = img.dataset.url;
      if (!u || seen[u]) return;
      seen[u] = true;
      items.push('<a href="' + esc(u) + '" rel="noopener" target="_blank">' + esc(img.dataset.author) + "</a> (" + esc(img.dataset.source) + ")");
    });
    var pc = $("#photo-credits");
    pc.innerHTML = items.length ? "Fotos: " + items.join(", ") + "." : "";
    pc.hidden = !items.length;
  }
  function wirePhotos(root) {
    (root || document).querySelectorAll(".photo img").forEach(function (img) {
      var box = img.parentNode;
      if (img.complete && img.naturalWidth) { box.classList.add("loaded"); refreshCredits(); }
      else if (img.complete) dropPhoto(box);
      else {
        img.addEventListener("load", function () { box.classList.add("loaded"); refreshCredits(); }, { once: true });
        img.addEventListener("error", function () { dropPhoto(box); }, { once: true });
      }
    });
  }

  /* ---------- Embalagem ilustrada (SVG gerado a partir dos dados) ---------- */
  function wrapName(name) {
    var words = name.replace(" — ", " ").split(" ");
    var lines = [], line = "";
    words.forEach(function (w) {
      if ((line + " " + w).trim().length > 11 && line) { lines.push(line); line = w; }
      else { line = (line + " " + w).trim(); }
    });
    if (line) lines.push(line);
    return lines.slice(0, 3);
  }

  function bagGroup(p, opts) {
    var c = p.pack;
    var name = opts && opts.label ? [opts.label] : wrapName(p.name);
    var weight = opts && opts.weight ? opts.weight : p.weightGrams + " g";
    var y0 = 158 - (name.length - 1) * 9;
    var text = name.map(function (l, i) {
      return '<text x="100" y="' + (y0 + i * 18) + '" text-anchor="middle" font-family="DM Serif Display, Georgia, serif" font-size="16" fill="' + c.ink + '">' + esc(l) + "</text>";
    }).join("");
    return '' +
      '<path d="M30 30 H170 L178 238 Q178 252 164 252 H36 Q22 252 22 238 Z" fill="' + c.bag + '"/>' +
      '<rect x="26" y="14" width="148" height="22" rx="3" fill="' + c.bag + '"/>' +
      '<path d="M26 30 H174" stroke="rgba(0,0,0,.18)" stroke-width="2"/>' +
      '<path d="M40 24 H160" stroke="rgba(255,255,255,.18)" stroke-width="1" stroke-dasharray="3 3"/>' +
      '<rect x="44" y="76" width="112" height="146" rx="6" fill="' + c.label + '"/>' +
      '<circle cx="100" cy="106" r="15" fill="#24372D"/>' +
      '<path d="M100 95 C93 99 90 105 92 111 C94 117 98 120 100 121 C106 118 110 112 109 106 C108 101 104 97 100 95 Z" fill="#D9C8A3"/>' +
      '<path d="M99.5 97 C97.5 102 97.5 105 99.5 109 C101.5 112 102 115 100.5 119" fill="none" stroke="#24372D" stroke-width="1.6" stroke-linecap="round"/>' +
      text +
      '<path d="M66 ' + (y0 + name.length * 18 - 2) + ' H134" stroke="' + c.band + '" stroke-width="1.5"/>' +
      '<text x="100" y="' + (y0 + name.length * 18 + 16) + '" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="10" letter-spacing="2.5" fill="' + c.ink + '">' + esc(String(weight).toUpperCase()) + "</text>";
  }

  function bagSVG(p) {
    if (p.category === "kits") return kitSVG();
    return '<svg viewBox="0 0 200 262" role="img" aria-label="' + esc("Embalagem ilustrativa de " + p.name) + '">' + bagGroup(p) + "</svg>";
  }

  function kitSVG() {
    var picks = [byId["gdb-003"], byId["gdb-001"], byId["gdb-002"]];
    var g = picks.map(function (p, i) {
      var x = [10, 140, 270][i], y = i === 1 ? 0 : 30, s = i === 1 ? .7 : .62;
      return '<g transform="translate(' + (x + (i === 1 ? -4 : 6)) + " " + y + ") scale(" + s + ')">' + bagGroup(p, { label: p.shortName, weight: "100 g" }) + "</g>";
    }).join("");
    return '<svg class="kit-svg" viewBox="0 0 420 200" role="img" aria-label="Kit ilustrativo com três embalagens de 100 g">' + g + "</svg>";
  }

  /* Grão de café em SVG, na cor do ponto de torra (usado no controle e na animação da sacola) */
  function beanSVG(fill) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48">' +
      '<ellipse cx="20" cy="24" rx="15" ry="20" fill="' + fill + '"/>' +
      '<path d="M19 6 C14 15 14 21 19.5 26 C25 31 25.5 37 21 43" fill="none" stroke="rgba(0,0,0,.38)" stroke-width="2.6" stroke-linecap="round"/>' +
      '<ellipse cx="13" cy="16" rx="3" ry="6" fill="rgba(255,255,255,.18)" transform="rotate(-18 13 16)"/></svg>';
  }

  /* ---------- Catálogo ---------- */
  var state = { q: "", cat: "todos", sort: "destaque" };
  var grid = $("#product-grid");

  function matches(p) {
    if (state.cat !== "todos" && p.category !== state.cat) return false;
    if (!state.q) return true;
    var hay = fold([p.name, p.description, p.intensity, "torra " + p.roast, p.category === "kits" ? "kit presente" : "cafe especial"]
      .concat(p.sensoryProfile, p.recommendedMethods, p.grindOptions).join(" "));
    return fold(state.q).split(/\s+/).filter(Boolean).every(function (t) { return hay.indexOf(t) !== -1; });
  }

  function sorted(list) {
    var l = list.slice();
    if (state.sort === "preco-asc") l.sort(function (a, b) { return a.priceCents - b.priceCents; });
    if (state.sort === "preco-desc") l.sort(function (a, b) { return b.priceCents - a.priceCents; });
    if (state.sort === "nome") l.sort(function (a, b) { return a.name.localeCompare(b.name, "pt-BR"); });
    return l;
  }

  function card(p) {
    var grind = p.grindOptions.length > 1
      ? '<label for="grind-' + p.id + '">Moagem</label><select id="grind-' + p.id + '">' +
        p.grindOptions.map(function (g) { return "<option>" + esc(g) + "</option>"; }).join("") + "</select>"
      : p.grindOptions.length === 1
        ? '<p class="card-fixed">Disponível em ' + esc(p.grindOptions[0]) + ".</p>"
        : '<p class="card-fixed">' + esc(cap(p.contents)) + ".</p>";
    var specs = p.category === "kits"
      ? "<dt>Ideal para</dt><dd>" + esc(cap(listPt(p.recommendedMethods))) + "</dd>"
      : "<dt>Torra</dt><dd>" + esc(cap(p.roast)) + "</dd><dt>Intensidade</dt><dd>" + esc(cap(p.intensity)) + "</dd><dt>Preparo</dt><dd>" + esc(cap(listPt(p.recommendedMethods))) + "</dd>";
    var visual = bagSVG(p) + (p.photo ? photoHTML(p.photo) : "");
    return '<li data-id="' + p.id + '"><article class="card">' +
      '<div class="card-visual' + (p.photo ? " has-photo" : "") + '">' + (p.category === "kits" ? '<span class="badge">Para presentear</span>' : "") + visual + "</div>" +
      '<div class="card-body">' +
        '<div class="card-top"><h3>' + esc(p.name) + '</h3><span class="price">' + money(p.priceCents) + "</span></div>" +
        '<p class="notes">' + esc(cap(listPt(p.sensoryProfile))) + "</p>" +
        '<p class="card-desc">' + esc(p.description) + "</p>" +
        '<dl class="specs">' + specs + "<dt>Peso</dt><dd>" + p.weightGrams + " g</dd></dl>" +
        '<div class="card-actions">' + grind +
          '<button type="button" class="btn btn-primary btn-block" data-add="' + p.id + '"' + (p.available ? "" : " disabled") + ">" +
          (p.available ? "Adicionar à sacola" : "Indisponível") + "</button>" +
        "</div>" +
      "</div></article></li>";
  }

  // Reorganiza os cartões com FLIP: quem fica desliza para a nova posição, quem entra aparece.
  var firstRender = true;
  function renderCatalog() {
    var before = {}, grinds = {};
    grid.querySelectorAll("li[data-id]").forEach(function (li) {
      before[li.dataset.id] = li.getBoundingClientRect();
      var sel = li.querySelector("select");
      if (sel) grinds[li.dataset.id] = sel.value;
    });
    var list = sorted(products.filter(matches));
    grid.innerHTML = list.map(card).join("");
    wirePhotos(grid);
    Object.keys(grinds).forEach(function (id) { var s = document.getElementById("grind-" + id); if (s) s.value = grinds[id]; });
    $("#empty").hidden = list.length > 0;
    $("#result-count").textContent = list.length === products.length
      ? products.length + " produtos"
      : list.length + (list.length === 1 ? " produto encontrado" : " produtos encontrados");
    if (reduceMotion || firstRender) { firstRender = false; return; }
    grid.querySelectorAll("li[data-id]").forEach(function (li, i) {
      var old = before[li.dataset.id];
      if (!old) { li.style.animationDelay = (i * 40) + "ms"; li.classList.add("card-in"); return; }
      var now = li.getBoundingClientRect();
      var dx = old.left - now.left, dy = old.top - now.top;
      if (dx || dy) li.animate([{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }], { duration: 420, easing: "cubic-bezier(.2,.7,.2,1)" });
    });
  }

  var qInput = $("#q");
  qInput.addEventListener("input", function () { state.q = qInput.value; renderCatalog(); });
  $("#sort").addEventListener("change", function (e) { state.sort = e.target.value; renderCatalog(); });
  function setCat(cat) {
    state.cat = cat;
    document.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.cat === cat)); });
  }
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () { setCat(chip.dataset.cat); renderCatalog(); });
  });
  $("#clear-filters").addEventListener("click", function () {
    state.q = ""; qInput.value = ""; setCat("todos");
    renderCatalog(); qInput.focus();
  });
  document.querySelectorAll("[data-filter-q]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      state.q = b.dataset.filterQ; qInput.value = state.q;
      setCat("todos");
      $("#cafes").scrollIntoView();
      renderCatalog();
      qInput.focus({ preventScroll: true });
    });
  });
  $("#search-open").addEventListener("click", function () {
    $("#cafes").scrollIntoView();
    qInput.focus({ preventScroll: true });
  });

  /* ---------- Torrador: escala de torra interativa ---------- */
  var roast = $("#roast");
  var zones = [
    { key: "clara", max: 33, label: "Torra clara" },
    { key: "media", max: 66, label: "Torra média" },
    { key: "escura", max: 100, label: "Torra média-escura" }
  ];
  var roastStops = [[0, [201, 163, 107]], [45, [156, 107, 63]], [75, [94, 59, 37]], [100, [46, 30, 21]]];
  function roastColor(v) {
    for (var i = 1; i < roastStops.length; i++) {
      var a = roastStops[i - 1], b = roastStops[i];
      if (v <= b[0]) {
        var t = (v - a[0]) / (b[0] - a[0]);
        return "rgb(" + a[1].map(function (c, k) { return Math.round(c + (b[1][k] - c) * t); }).join(",") + ")";
      }
    }
    return "rgb(46,30,21)";
  }
  function updateRoast() {
    var v = +roast.value;
    var zone = zones.filter(function (z) { return v <= z.max; })[0];
    roast.style.setProperty("--bean", 'url("data:image/svg+xml,' + encodeURIComponent(beanSVG(roastColor(v))) + '")');
    roast.setAttribute("aria-valuetext", zone.label);
    document.querySelectorAll(".profile").forEach(function (el) { el.classList.toggle("active", el.dataset.zone === zone.key); });
    document.querySelectorAll(".roast-ticks span").forEach(function (el, i) { el.classList.toggle("on", zones[i] === zone); });
  }
  roast.addEventListener("input", updateRoast);
  document.querySelectorAll(".profile").forEach(function (el) {
    el.addEventListener("click", function () {
      roast.value = { clara: 12, media: 50, escura: 86 }[el.dataset.zone];
      updateRoast();
    });
  });
  updateRoast();

  /* ---------- Sacola ---------- */
  var KEY = "gdb-cart-v1";
  var cart = load();
  var lastAdded = null;

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      // Revalida contra o catálogo: descarta itens, moagens ou quantidades inválidas.
      return raw.filter(function (l) {
        var p = byId[l.id];
        return p && p.available && (p.grindOptions.length === 0 ? !l.grind : p.grindOptions.indexOf(l.grind) !== -1) && l.qty >= 1 && l.qty <= 10;
      });
    } catch (e) { return []; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* sem armazenamento: sacola dura só nesta visita */ } }

  function add(id, grind) {
    var p = byId[id];
    if (!p || !p.available) return;
    var line = cart.filter(function (l) { return l.id === id && l.grind === grind; })[0];
    if (line) line.qty = Math.min(10, line.qty + 1);
    else { line = { id: id, grind: grind, qty: 1 }; cart.push(line); }
    lastAdded = line;
    save(); renderCart();
    // O botão e o grão já mostram a confirmação; aqui só avisamos leitores de tela.
    announce(p.name + " adicionado à sacola");
  }

  function count() { return cart.reduce(function (n, l) { return n + l.qty; }, 0); }
  function subtotal() { return cart.reduce(function (s, l) { return s + byId[l.id].priceCents * l.qty; }, 0); }

  function renderCart() {
    var n = count();
    var badge = $("#cart-count");
    badge.textContent = n;
    badge.dataset.zero = String(n === 0);
    $("#cart-btn-label").textContent = "Sacola, " + n + (n === 1 ? " item" : " itens");
    $("#cart-items").innerHTML = cart.map(function (l, i) {
      var p = byId[l.id];
      return '<li class="cart-item' + (l === lastAdded ? " new" : "") + '">' +
        '<div class="cart-thumb" aria-hidden="true">' + (p.category === "kits" ? kitSVG() : bagSVG(p)) + "</div>" +
        "<div><h3>" + esc(p.name) + '</h3><p class="cart-meta">' + esc(cap(l.grind || p.contents)) + ", " + money(p.priceCents) + " cada</p>" +
        '<div class="qty" role="group" aria-label="Quantidade de ' + esc(p.name) + '">' +
          '<button type="button" data-dec="' + i + '" aria-label="Diminuir quantidade">−</button>' +
          "<output>" + l.qty + "</output>" +
          '<button type="button" data-inc="' + i + '" aria-label="Aumentar quantidade"' + (l.qty >= 10 ? " disabled" : "") + ">+</button>" +
        "</div></div>" +
        '<div class="cart-line"><span>' + money(p.priceCents * l.qty) + '</span><button type="button" class="remove" data-remove="' + i + '">Remover</button></div>' +
        "</li>";
    }).join("");
    lastAdded = null;
    var empty = cart.length === 0;
    $("#cart-empty").hidden = !empty;
    $("#cart-foot").hidden = empty;
    var sub = $("#cart-subtotal");
    var next = money(subtotal());
    if (sub.textContent !== next) { sub.textContent = next; flash(sub); }
    $("#checkout-msg").hidden = true;
  }

  function flash(el) { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }

  var CHECK = '<svg class="check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  function confirmButton(btn) {
    clearTimeout(btn._t);
    btn.classList.add("added");
    btn.innerHTML = CHECK + "Adicionado";
    btn._t = setTimeout(function () { btn.classList.remove("added"); btn.textContent = "Adicionar à sacola"; }, 1600);
  }

  // Um grão sai do botão e cai na sacola do cabeçalho, mostrando para onde o item foi.
  function flyBean(from, color) {
    var cartBtn = $("#cart-open");
    var bump = function () {
      var c = $("#cart-count");
      [c, cartBtn].forEach(function (el) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); });
    };
    if (reduceMotion || !from.animate) { bump(); return; }
    var a = from.getBoundingClientRect(), b = cartBtn.getBoundingClientRect();
    var bean = document.createElement("div");
    bean.className = "flying-bean";
    bean.innerHTML = beanSVG(color);
    document.body.appendChild(bean);
    var x0 = a.left + a.width / 2 - 11, y0 = a.top + a.height / 2 - 14;
    var x1 = b.left + b.width / 2 - 11, y1 = b.top + b.height / 2 - 14;
    var mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 120;
    bean.animate([
      { transform: "translate(" + x0 + "px," + y0 + "px) rotate(0) scale(1)" },
      { transform: "translate(" + mx + "px," + my + "px) rotate(200deg) scale(1.15)", offset: .45 },
      { transform: "translate(" + x1 + "px," + y1 + "px) rotate(400deg) scale(.5)", opacity: .6 }
    ], { duration: 750, easing: "cubic-bezier(.45,.05,.55,.95)" }).onfinish = function () { bean.remove(); bump(); };
  }

  grid.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]");
    if (!b) return;
    var p = byId[b.dataset.add];
    var sel = document.getElementById("grind-" + p.id);
    var grind = sel ? sel.value : (p.grindOptions[0] || "");
    add(p.id, grind);
    confirmButton(b);
    flyBean(b, roastColor({ "clara": 12, "média": 50, "média-escura": 86 }[p.roast] || 60));
  });

  $("#cart-items").addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t) return;
    var i, name;
    if (t.dataset.inc) { i = +t.dataset.inc; cart[i].qty = Math.min(10, cart[i].qty + 1); }
    else if (t.dataset.dec) {
      i = +t.dataset.dec; cart[i].qty -= 1;
      if (cart[i].qty < 1) { name = byId[cart[i].id].name; cart.splice(i, 1); notify(name + " removido da sacola"); }
    }
    else if (t.dataset.remove) { i = +t.dataset.remove; name = byId[cart[i].id].name; cart.splice(i, 1); notify(name + " removido da sacola"); }
    else return;
    save(); renderCart();
    var focusTarget = $("#cart-items button") || $("#cart-close");
    if (!document.body.contains(t)) focusTarget.focus();
  });

  $("#checkout").addEventListener("click", function () {
    // Sem provedor de pagamento: apenas informa o modo demonstração.
    var msg = $("#checkout-msg");
    msg.hidden = false;
    msg.textContent = "Checkout em modo demonstração. Total de " + money(subtotal()) + " calculado a partir do catálogo, mas nenhum pedido foi criado e nenhum pagamento foi cobrado.";
  });

  /* Abrir e fechar a sacola, com foco preso no painel */
  var drawer = $("#cart"), scrim = $("#scrim"), opener = null;
  function openCart() {
    opener = document.activeElement;
    drawer.hidden = false; scrim.hidden = false;
    document.body.classList.add("locked");
    $("#cart-close").focus();
  }
  function closeCart() {
    drawer.hidden = true; scrim.hidden = true;
    document.body.classList.remove("locked");
    if (opener && opener.focus) opener.focus();
  }
  $("#cart-open").addEventListener("click", openCart);
  $("#cart-close").addEventListener("click", closeCart);
  scrim.addEventListener("click", closeCart);
  $("#cart-browse").addEventListener("click", function () { closeCart(); });
  document.addEventListener("keydown", function (e) {
    if (drawer.hidden) return;
    if (e.key === "Escape") { closeCart(); return; }
    if (e.key !== "Tab") return;
    var f = drawer.querySelectorAll("button:not([disabled]), a[href], select");
    f = Array.prototype.filter.call(f, function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* Feedback: toast visual + região viva para leitores de tela */
  var toastTimer;
  function announce(text) { $("#announcer").textContent = text; }
  function notify(text) {
    announce(text);
    var t = $("#toast");
    t.textContent = text; t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }

  /* Menu móvel */
  var menuBtn = $("#menu-toggle"), menu = $("#menu");
  menuBtn.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) { menu.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.setAttribute("aria-label", "Abrir menu"); }
  });

  /* Cabeçalho: sombra ao rolar e marcação da seção atual no menu */
  var header = $("#site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if ("IntersectionObserver" in window) {
    var links = {};
    menu.querySelectorAll("a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
        if (links[en.target.id]) links[en.target.id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });
  }

  /* Fotos das seções, quando existirem em data.js */
  if (photos.hero) $("#hero-photo").innerHTML = photoHTML(photos.hero, true);
  if (photos.origem) { var op = $("#origin-photo"); op.innerHTML = photoHTML(photos.origem); op.hidden = false; }
  if (photos.guias) {
    document.querySelectorAll(".guide[data-guide]").forEach(function (g) {
      var ph = photos.guias[g.dataset.guide];
      if (ph) g.insertAdjacentHTML("afterbegin", '<div class="guide-photo">' + photoHTML(ph) + "</div>");
    });
  }

  /* Vídeo de fundo do topo: versão horizontal no computador e vertical no celular.
     Toca sozinho e sem som; com movimento reduzido fica parado na imagem de capa. */
  var heroVideo = $("#hero-video"), videoToggle = $("#video-toggle");
  if (heroVideo && heroVideo.canPlayType) {
    var narrow = window.matchMedia("(max-width: 760px)").matches;
    var base = "assets/cafe-fumaca" + (narrow ? "" : "-largo");
    /* MP4 (H.264) toca em qualquer navegador; WebM, mais leve, só onde o suporte é garantido.
       Se o WebM falhar, volta para o MP4. */
    var apple = /Apple/.test(navigator.vendor || "");
    var webm = !apple && heroVideo.canPlayType('video/webm; codecs="vp9"') === "probably";
    heroVideo.poster = base + "-poster.jpg";
    heroVideo.src = base + (webm ? ".webm" : ".mp4");
    heroVideo.addEventListener("error", function () {
      if (/\.webm$/.test(heroVideo.src)) { heroVideo.src = base + ".mp4"; if (!reduceMotion) heroVideo.play().catch(function () {}); }
    });
    var setToggle = function () {
      var paused = heroVideo.paused;
      videoToggle.classList.toggle("paused", paused);
      videoToggle.setAttribute("aria-label", paused ? "Reproduzir o vídeo de fundo" : "Pausar o vídeo de fundo");
    };
    heroVideo.addEventListener("play", setToggle);
    heroVideo.addEventListener("pause", setToggle);
    videoToggle.addEventListener("click", function () { if (heroVideo.paused) heroVideo.play(); else heroVideo.pause(); });
    videoToggle.hidden = false;
    if (!reduceMotion) { var tryPlay = heroVideo.play(); if (tryPlay && tryPlay.catch) tryPlay.catch(setToggle); }
    setToggle();
  }
  renderCatalog();
  renderCart();
  wirePhotos();

  /* Revelação ao rolar: blocos abaixo da dobra sobem suavemente quando entram na tela */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var groups = [".section-head", ".product-grid > li", ".roaster", ".profile", ".split-copy", ".table-scroll",
      ".grind-table tbody tr", ".origin-copy", ".principles li", ".guide", ".faq details", ".footer-grid > *"];
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        reveal.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    groups.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        if (el.getBoundingClientRect().top < window.innerHeight) return; // o que já está na tela fica parado
        el.style.setProperty("--d", (i % 4) * 90 + "ms");
        el.classList.add("will-reveal");
        reveal.observe(el);
      });
    });
  }

  /* Paralaxe na serra do topo: camadas mais próximas se movem mais ao rolar */
  if (!reduceMotion) {
    var layers = [[".ridge.r1", .06], [".fog-band.f1", .1], [".ridge.r2", .13], [".fog-band.f2", .17], [".ridge.r3", .22], [".hero-bg", .18]]
      .map(function (l) { return [document.querySelector(l[0]), l[1]]; })
      .filter(function (l) { return l[0]; });
    var heroEl = $("#topo"), ticking = false;
    var paint = function () {
      ticking = false;
      var y = Math.min(window.scrollY, heroEl.offsetHeight);
      layers.forEach(function (l) { l[0].style.translate = "0 " + (y * l[1]).toFixed(1) + "px"; });
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
  }
})();

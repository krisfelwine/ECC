/* =====================================================================
   LE RÉVEIL · DCLIC HLM : MOTEUR DE LA PRÉSENTATION
   Les textes sont dans contenu.js et la carte dans quartiers.js :
   il n'est normalement pas nécessaire de modifier ce fichier.
   ===================================================================== */
(function () {
  'use strict';

  const C = window.CONTENU;
  const K = window.CARTE;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (sel) => document.querySelector(sel);

  if (!C || !K) {
    document.body.innerHTML = '<p style="color:#fff;font:28px sans-serif;padding:60px;line-height:1.5">' +
      'Erreur : le fichier contenu.js ou quartiers.js est introuvable ou contient une faute de frappe ' +
      '(guillemet ou virgule manquant). Annulez votre dernière modification puis rechargez la page.</p>';
    return;
  }
  if (C.general.titreOnglet) document.title = C.general.titreOnglet;

  /* ------------------------------------------------------------------
     Outils
     ------------------------------------------------------------------ */
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function svg(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach((k) => n.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(n);
    return n;
  }
  const nbQuartiers = K.quartiers.length;
  function remplir(t) { return String(t == null ? '' : t).replace(/\{n\}/g, nbQuartiers); }

  /* "texte avec *mots en valeur*" -> liste de mots, chaque mot = segments */
  function decouper(texte) {
    const mots = [];
    let accent = false;
    let coller = false;
    remplir(texte).split('*').forEach((part, idx) => {
      if (idx > 0) accent = !accent;
      part.split(/(\s+)/).forEach((tok) => {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { coller = false; return; }
        if (coller && mots.length) mots[mots.length - 1].push({ t: tok, accent });
        else mots.push([{ t: tok, accent }]);
        coller = true;
      });
    });
    return mots;
  }

  /* Affiche un texte mot par mot ; renvoie l'instant de fin */
  function motParMot(parent, texte, debut, pas) {
    const mots = decouper(texte);
    mots.forEach((segs, i) => {
      const s = el('span', 'mot');
      segs.forEach((sg) => s.appendChild(sg.accent ? el('em', null, sg.t) : document.createTextNode(sg.t)));
      s.style.animationDelay = (debut + i * pas).toFixed(2) + 's';
      parent.appendChild(s);
      if (i < mots.length - 1) parent.appendChild(document.createTextNode(' '));
    });
    return debut + mots.length * pas;
  }

  function texteRiche(parent, texte) {
    remplir(texte).split('*').forEach((p, i) => {
      if (p) parent.appendChild(i % 2 ? el('em', null, p) : document.createTextNode(p));
    });
  }

  function retarder(n, s) { n.style.animationDelay = s.toFixed(2) + 's'; return n; }

  /* Logo : image logo-dclic.png, ou texte de secours si le fichier manque */
  function logo(cls) {
    const box = el('div', 'logo ' + (cls || ''));
    const img = new Image();
    img.alt = C.general.sigle;
    img.draggable = false;
    img.onerror = () => {
      box.innerHTML = '';
      const parts = String(C.general.sigle).split(' ');
      const t = el('div', 'logo-texte', parts[0]);
      if (parts.length > 1) t.appendChild(el('span', null, parts.slice(1).join(' ')));
      box.appendChild(t);
    };
    img.src = C.general.logo;
    box.appendChild(img);
    return box;
  }

  function icone(nom) {
    const s = svg('svg', { viewBox: '0 0 24 24', class: 'ico' });
    svg('use', { href: '#ico-' + nom }, s);
    return s;
  }

  /* Arcs décoratifs en croissant, comme dans le logo */
  function arcs() {
    const s = svg('svg', { class: 'arcs', viewBox: '0 0 1920 1080', preserveAspectRatio: 'xMidYMid slice' });
    const croissant = 'M0,-400 A400,400 0 0 1 0,400 A520,520 0 0 0 0,-400 Z';
    [
      ['translate(1500 620) rotate(38) scale(1.3)', 'arc arc-a'],
      ['translate(1390 540) rotate(38) scale(.95)', 'arc arc-b'],
      ['translate(300 230) rotate(218) scale(.42)', 'arc arc-c']
    ].forEach(([tr, cls]) => {
      const g = svg('g', { transform: tr }, s);
      svg('path', { d: croissant, class: cls }, g);
    });
    return s;
  }

  /* ------------------------------------------------------------------
     Mise à l'échelle 1920 x 1080
     ------------------------------------------------------------------ */
  const stage = $('#stage');
  function ajusterEchelle() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }
  window.addEventListener('resize', ajusterEchelle);
  ajusterEchelle();

  /* ------------------------------------------------------------------
     État général
     ------------------------------------------------------------------ */
  const state = { mode: 'accueil', pause: false, t: 0, scene: -1, diapo: 0, etape: 0, tc: 0, points: [] };
  const couches = { accueil: $('#accueil'), clip: $('#clip'), carte: $('#carte') };
  function afficherCouche(nom) {
    Object.keys(couches).forEach((k) => couches[k].classList.toggle('actif', k === nom));
  }

  const sweep = $('#sweep');
  function lancerBalayage(decalage) {
    sweep.classList.remove('go');
    void sweep.offsetWidth;
    sweep.style.animationDelay = (decalage || 0) + 's';
    sweep.classList.add('go');
  }

  function definirPause(p) {
    state.pause = p;
    document.body.classList.toggle('is-paused', p);
  }

  function majCompteurs(racine, temps) {
    racine.querySelectorAll('[data-to]').forEach((n) => {
      const to = +n.dataset.to;
      const st = +n.dataset.start || 0;
      const du = +n.dataset.dur || 1;
      const p = Math.max(0, Math.min(1, (temps - st) / du));
      n.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    });
  }

  /* ------------------------------------------------------------------
     Écran d'attente
     ------------------------------------------------------------------ */
  (function construireAccueil() {
    couches.accueil.appendChild(arcs());
    const c = el('div', 'centre');
    c.appendChild(logo('zoom'));
    c.appendChild(retarder(el('div', 'consigne rise', C.ecranAccueil.consigne), 1));
    couches.accueil.appendChild(c);
  })();

  $('#logo-coin').appendChild(logo(''));
  $('#clip-arcs').appendChild(arcs());
  $('#carte-arcs').appendChild(arcs());

  const aide = $('#aide');
  (C.aide || []).forEach((l) => aide.appendChild(el('div', null, l)));
  let minuterieAide = null;
  function montrerAide(duree) {
    aide.classList.add('visible');
    clearTimeout(minuterieAide);
    if (duree) minuterieAide = setTimeout(() => aide.classList.remove('visible'), duree);
  }

  /* ==================================================================
     PARTIE 1 : LE CLIP
     ================================================================== */
  const L = C.clip;
  const PAS_LECON = 3.3;
  const PAS_PHASE = 5.5;

  function centre(s) { const c = el('div', 'centre'); s.appendChild(c); return c; }

  function construireLecons(s) {
    const h = el('div', 'entete');
    const n = el('span', 'compteur-geant', '0');
    Object.assign(n.dataset, { to: L.lecons.length, start: 0.3, dur: 1.4 });
    const t = el('span', 'entete-titre');
    motParMot(t, L.leconsTitre, 0.7, 0.12);
    h.append(n, t);
    s.appendChild(h);

    const g = el('div', 'grille');
    s.appendChild(g);
    L.lecons.forEach((txt, i) => {
      const num = String(i + 1).padStart(2, '0');
      const carte = retarder(el('div', 'lecon'), 1.0 + i * 0.08);
      const inner = retarder(el('div', 'lecon-inner'), 2.6 + i * PAS_LECON);
      const recto = el('div', 'face recto');
      recto.appendChild(el('span', 'grand-num', num));
      const verso = el('div', 'face verso');
      verso.appendChild(el('span', 'petit-num', num));
      const p = el('p');
      texteRiche(p, txt);
      verso.appendChild(p);
      inner.append(recto, verso);
      carte.appendChild(inner);
      g.appendChild(carte);
      /* réduit le texte s'il est trop long pour la carte */
      let fs = 31;
      while (verso.scrollHeight > verso.clientHeight + 1 && fs > 18) { fs -= 1; p.style.fontSize = fs + 'px'; }
    });
  }

  function construireReveil(s) {
    const w = el('div', 'reveil');
    const mots = remplir(L.reveil).split(/\s+/).filter(Boolean);
    let d = 0.5;
    mots.forEach((m, i) => {
      const ligne = el('div', 'reveil-ligne' + (mots.length > 1 && i === 0 ? ' petit' : ''));
      Array.from(m).forEach((ch) => { ligne.appendChild(retarder(el('span', 'lettre', ch), d)); d += 0.09; });
      w.appendChild(ligne);
    });
    centre(s).appendChild(w);
    s.appendChild(retarder(el('div', 'flash'), d + 0.15));
  }

  function construirePhases(s) {
    const N = L.phases.length;
    const h = el('div', 'entete');
    const n = el('span', 'compteur-geant', '0');
    Object.assign(n.dataset, { to: N, start: 0.3, dur: 1.2 });
    const t = el('span', 'entete-titre');
    motParMot(t, L.phasesTitre, 0.6, 0.1);
    h.append(n, t);
    s.appendChild(h);

    const frise = el('div', 'frise');
    s.appendChild(frise);
    frise.appendChild(el('div', 'frise-base'));
    const debutNoeud = (i) => 2.4 + i * PAS_PHASE;
    for (let i = 0; i <= N; i++) {
      const a = i === 0 ? 0 : (2 * i - 1) / (2 * N);
      const b = i === N ? 1 : (2 * i + 1) / (2 * N);
      const seg = el('div', 'frise-seg');
      seg.style.left = (a * 100) + '%';
      seg.style.width = ((b - a) * 100) + '%';
      retarder(seg, i === N ? debutNoeud(N - 1) + 2.5 : debutNoeud(i) - 0.7);
      frise.appendChild(seg);
    }
    L.phases.forEach((ph, i) => {
      const col = el('div', 'phase');
      col.style.left = (i / N * 100) + '%';
      col.style.width = (100 / N) + '%';
      col.appendChild(retarder(el('div', 'phase-noeud', String(i + 1)), debutNoeud(i)));
      col.appendChild(retarder(el('div', 'phase-num rise', remplir(ph.numero)), debutNoeud(i) + 0.25));
      const tt = el('div', 'phase-titre');
      motParMot(tt, ph.titre, debutNoeud(i) + 0.5, 0.09);
      col.appendChild(tt);
      frise.appendChild(col);
    });
  }

  const SCENES = [
    { bg: 'blanc', dur: 4.5, build(s) {
      const c = centre(s);
      c.appendChild(logo('logo-ouverture zoom'));
      if (L.presente) c.appendChild(retarder(el('div', 'presente rise', L.presente), 1.5));
    } },
    { bg: 'noir', dur: 7, build(s) {
      const p = el('div', 'phrase');
      motParMot(p, L.perdu, 0.8, 0.32);
      centre(s).appendChild(p);
    } },
    { bg: 'noir', dur: 7, build(s) {
      const c = centre(s);
      const p1 = el('div', 'phrase');
      const fin = motParMot(p1, L.ecoute, 0.5, 0.3);
      const p2 = el('div', 'phrase');
      motParMot(p2, L.compris, fin + 1.1, 0.3);
      c.append(p1, p2);
    } },
    { bg: 'nuit', dur: 2.6 + L.lecons.length * PAS_LECON + 3.2, sweep: true, coin: true, build: construireLecons },
    { bg: 'bleu', dur: 6, sweep: true, build: construireReveil },
    { bg: 'nuit', dur: 7.5, sweep: true, coin: true, build(s) {
      const p = el('div', 'phrase');
      motParMot(p, L.municipale, 0.6, 0.28);
      centre(s).appendChild(p);
    } },
    { bg: 'nuit', dur: 2.4 + L.phases.length * PAS_PHASE + 3, coin: true, build: construirePhases },
    { bg: 'bleu', dur: 5.5, sweep: true, build(s) {
      const c = centre(s);
      const p = el('div', 'devise');
      const fin = motParMot(p, L.devise, 0.6, 0.4);
      c.appendChild(p);
      if (L.deviseTraduction) c.appendChild(retarder(el('div', 'traduction rise', remplir(L.deviseTraduction)), fin + 0.5));
    } },
    { bg: 'blanc', dur: 6.5, build(s) {
      centre(s).appendChild(logo('logo-final zoom'));
    } }
  ];

  const debuts = [];
  let total = 0;
  SCENES.forEach((sc) => { debuts.push(total); total += sc.dur; });

  const clip = couches.clip;
  const sceneBox = $('#scene');
  const barre = $('#barre');
  let balayageFait = -1;

  function entrerScene(i, viaSaut) {
    state.scene = i;
    const sc = SCENES[i];
    clip.className = 'layer actif bg-' + sc.bg;
    sceneBox.innerHTML = '';
    const s = el('div', 'scene');
    s.style.animation = 'sceneOut .5s ease ' + Math.max(0, sc.dur - 0.5).toFixed(2) + 's forwards';
    sceneBox.appendChild(s);
    sc.build(s);
    stage.classList.toggle('coin', !!sc.coin);
    if (viaSaut && sc.sweep) lancerBalayage(-0.45);
  }

  function majClip() {
    if (state.t >= total) { allerCarte(0); return; }
    let i = state.scene < 0 ? 0 : state.scene;
    while (i < SCENES.length - 1 && state.t >= debuts[i + 1]) i++;
    while (i > 0 && state.t < debuts[i]) i--;
    if (i !== state.scene) entrerScene(i, false);
    const suivante = SCENES[i + 1];
    const lt = state.t - debuts[i];
    /* le balayage démarre juste avant la scène suivante (ou la carte) */
    if ((!suivante || suivante.sweep) && lt >= SCENES[i].dur - 0.45 && balayageFait !== i) {
      balayageFait = i;
      lancerBalayage(0);
    }
    barre.style.transform = 'scaleX(' + (state.t / total).toFixed(4) + ')';
  }

  function lancerClip() {
    state.mode = 'clip';
    state.t = 0;
    state.scene = -1;
    balayageFait = -1;
    definirPause(false);
    aide.classList.remove('visible');
    afficherCouche('clip');
    majClip();
  }

  function sauterScene(i) {
    if (i < 0) i = 0;
    if (i >= SCENES.length) { lancerBalayage(-0.45); allerCarte(0); return; }
    state.t = debuts[i] + 0.001;
    balayageFait = -1;
    entrerScene(i, true);
  }

  /* ==================================================================
     PARTIE 2 : LA CARTE
     ================================================================== */
  const map = $('#map');
  const plan = $('#plan');
  const gZones = $('#g-zones');
  const gSous = $('#g-sous');
  const gLabels = $('#g-labels');
  const gSur = $('#g-sur');
  const clipCommune = $('#clip-commune');
  const panel = $('#panel');
  const cloture = $('#cloture');
  const compteur = $('#compteur');
  const centres = {};

  $('#plan-titre').textContent = remplir(C.carte.titre);
  $('#plan-note').textContent = remplir(C.carte.note);

  (function construireCarte() {
    K.quartiers.forEach((q, i) => {
      const pts = q.points.trim().split(/\s+/).map((p) => p.split(',').map(Number));
      const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
      const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
      const c = q.etiquette ? { x: q.etiquette.x, y: q.etiquette.y } : { x: cx, y: cy };
      centres[q.nom] = c;
      const poly = svg('polygon', { points: q.points, class: 'zone' }, gZones);
      poly.style.setProperty('--i', i);
      const t = svg('text', { x: c.x.toFixed(1), y: (c.y + 7).toFixed(1), class: 'zlabel' }, gLabels);
      t.textContent = q.nom;
      t.dataset.nom = q.nom;
      svg('polygon', { points: q.points }, clipCommune);
    });
  })();

  const centreDe = (nom) => centres[nom] || { x: 500, y: 300 };
  function cacherLabel(nom) {
    gLabels.querySelectorAll('.zlabel').forEach((t) => { if (t.dataset.nom === nom) t.classList.add('cache'); });
  }
  function enveloppe(x, y, parent) { return svg('g', { transform: 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')' }, parent); }

  function etiquette(parent, texte, dy) {
    if (!texte) return;
    const g = svg('g', { transform: 'translate(0 ' + dy + ')', class: 'etiq' }, parent);
    const r = svg('rect', { rx: 18, ry: 18, height: 40, y: -28 }, g);
    const t = svg('text', { y: 0 }, g);
    t.textContent = remplir(texte);
    let w = 0;
    try { w = t.getComputedTextLength(); } catch (e) { w = 0; }
    if (!w) w = String(texte).length * 13;
    r.setAttribute('width', w + 36);
    r.setAttribute('x', -(w + 36) / 2);
  }

  /* Animations de la carte, diapo par diapo */
  const ANIM_CARTE = {
    repositionnement(d) {
      if (!d.motCarte) return;
      const t = svg('text', { x: 500, y: 355, class: 'mot-carte' }, gSous);
      t.textContent = remplir(d.motCarte);
    },

    phase1() {
      K.quartiers.forEach((q, i) => {
        const c = centreDe(q.nom);
        const types = q.tournages || [];
        const inner = svg('g', { class: 'badges' }, enveloppe(c.x, c.y + 38, gSur));
        retarder(inner, i * 0.55 + 1.2);
        types.forEach((ty, k) => {
          const b = enveloppe((k - (types.length - 1) / 2) * 36, 0, inner);
          svg('circle', { r: 16, class: 'badge-fond ' + ty }, b);
          svg('use', { href: '#ico-' + ty, x: -9, y: -9, width: 18, height: 18, class: 'badge-ico' }, b);
        });
      });
    },

    phase2(d) {
      const c = centreDe(K.quartierCandidat);
      const zone = svg('g', { 'clip-path': 'url(#clip-commune)' }, gSous);
      for (let k = 0; k < 3; k++) {
        retarder(svg('circle', { r: 50, class: 'onde' }, enveloppe(c.x, c.y, zone)), k * 1.2 + 0.6);
      }
      cacherLabel(K.quartierCandidat);
      const inner = svg('g', { class: 'pop' }, enveloppe(c.x, c.y, gSur));
      retarder(inner, 0.4);
      svg('circle', { r: 40, class: 'pastille' }, inner);
      svg('use', { href: '#ico-micro', x: -22, y: -22, width: 44, height: 44, class: 'pastille-ico' }, inner);
      etiquette(inner, d.etiquetteCarte, 74);
    },

    phase3(d) {
      const lieu = K.lieuAG;
      const A = centreDe(lieu);
      K.quartiers.forEach((q, i) => {
        if (q.nom === lieu) return;
        const S = centreDe(q.nom);
        const dx = A.x - S.x;
        const dy = A.y - S.y;
        const len = Math.hypot(dx, dy);
        if (len < 80) return;
        const ux = dx / len;
        const uy = dy / len;
        const D = { x: S.x + ux * 30, y: S.y + 22 + uy * 20 };
        const E = { x: A.x - ux * 52, y: A.y - uy * 52 };
        const off = len * 0.16 * (i % 2 ? 1 : -1);
        const Q = { x: (D.x + E.x) / 2 - uy * off, y: (D.y + E.y) / 2 + ux * off };
        const dd = 'M' + D.x.toFixed(1) + ',' + D.y.toFixed(1) + ' Q' + Q.x.toFixed(1) + ',' + Q.y.toFixed(1) + ' ' + E.x.toFixed(1) + ',' + E.y.toFixed(1);
        const delai = 0.7 + i * 0.16;
        retarder(svg('path', { d: dd, class: 'fleche', pathLength: 1 }, gSur), delai);
        retarder(svg('path', { d: dd, class: 'flux', pathLength: 1 }, gSur), delai + 1.1);
        const ang = Math.atan2(E.y - Q.y, E.x - Q.x) * 180 / Math.PI;
        const tete = svg('g', { transform: 'translate(' + E.x.toFixed(1) + ' ' + E.y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')' }, gSur);
        retarder(svg('polygon', { points: '6,0 -14,-11 -14,11', class: 'pointe' }, tete), delai + 0.9);
      });
      cacherLabel(lieu);
      const g = enveloppe(A.x, A.y, gSur);
      for (let k = 0; k < 2; k++) retarder(svg('circle', { r: 40, class: 'pulse' }, g), 2.4 + k * 1.1);
      const inner = svg('g', { class: 'pop' }, g);
      retarder(inner, 0.3);
      svg('circle', { r: 40, class: 'pastille' }, inner);
      const t = svg('text', { y: 10, class: 'pastille-txt' }, inner);
      t.textContent = remplir(d.sigleAG || 'AG');
      etiquette(inner, d.etiquetteCarte, 76);
    },

    maillage(d) {
      const c0 = centreDe(K.quartierCandidat);
      const masse = svg('g', { class: 'pop' }, enveloppe(c0.x, c0.y, gSous));
      svg('circle', { r: 130, class: 'masse' }, masse);
      let graine = 7;
      const alea = () => { graine = (graine * 9301 + 49297) % 233280; return graine / 233280; };
      const points = [];
      K.quartiers.forEach((q, i) => {
        const c = centreDe(q.nom);
        for (let k = 0; k < 6; k++) {
          const resp = k === 0;
          const a = alea() * Math.PI * 2;
          const r = Math.sqrt(alea()) * 110;
          const avant = { x: c0.x + Math.cos(a) * r, y: c0.y + Math.sin(a) * r };
          let apres;
          if (resp) apres = { x: c.x, y: c.y + 42 };
          else {
            const b = (k - 1) / 5 * Math.PI * 2 - Math.PI / 2;
            apres = { x: c.x + Math.cos(b) * 28, y: c.y + 42 + Math.sin(b) * 20 };
          }
          const dot = svg('circle', { r: resp ? 10 : 7, class: resp ? 'point resp' : 'point' }, gSur);
          dot.style.transitionDelay = (i * 0.06 + k * 0.03).toFixed(2) + 's';
          retarder(dot, 0.3 + alea() * 0.8);
          points.push({ dot, avant, apres });
        }
      });
      const cand = svg('g', { class: 'candidat' }, enveloppe(c0.x, c0.y, gSur));
      etiquette(cand, d.etiquetteCandidat, -150);
      state.points = points;
      placerPoints();
    },

    veille() {
      const cx = 500;
      const cy = 300;
      const R = 560;
      const zone = svg('g', { 'clip-path': 'url(#clip-commune)' }, gSous);
      [130, 260, 390].forEach((r) => svg('circle', { cx, cy, r, class: 'radar-anneau' }, zone));
      const rot = svg('g', { class: 'radar' }, zone);
      svg('circle', { cx, cy, r: R, fill: 'none', stroke: 'none' }, rot);
      const a = 50 * Math.PI / 180;
      const x2 = (cx + R * Math.cos(a)).toFixed(1);
      const y2 = (cy + R * Math.sin(a)).toFixed(1);
      svg('path', { d: 'M' + cx + ',' + cy + ' L' + (cx + R) + ',' + cy + ' A' + R + ',' + R + ' 0 0 1 ' + x2 + ',' + y2 + ' Z', class: 'radar-cone' }, rot);
      svg('line', { x1: cx, y1: cy, x2, y2, class: 'radar-ligne' }, rot);
      K.quartiers.forEach((q) => {
        const c = centreDe(q.nom);
        const bx = c.x;
        const by = c.y - 34;
        const ang = Math.atan2(by - cy, bx - cx) * 180 / Math.PI;
        const delai = ((((ang - 50) % 360) + 360) % 360) / 360 * 4;
        retarder(svg('circle', { cx: bx.toFixed(1), cy: by.toFixed(1), r: 9, class: 'blip' }, gSur), delai);
      });
    }
  };

  function placerPoints() {
    const ap = state.etape >= 1;
    state.points.forEach((p) => {
      const P = ap ? p.apres : p.avant;
      p.dot.style.transform = 'translate(' + P.x.toFixed(1) + 'px, ' + P.y.toFixed(1) + 'px)';
    });
    map.classList.toggle('apres', ap);
    panel.querySelectorAll('.etat').forEach((e) => {
      e.classList.toggle('actif', e.classList.contains(ap ? 'apres' : 'avant'));
    });
  }

  function nbEtapes(d) { return d.avant && d.apres ? 2 : 1; }

  /* ---------- Panneau de texte ---------- */
  function construirePanneau(d) {
    panel.innerHTML = '';
    panel.classList.add('actif');
    panel.style.setProperty('--k', 1);
    const box = el('div', 'contenu');
    panel.appendChild(box);
    let t = 0.15;
    const ajoute = (n, pas, parent) => {
      n.classList.add('rise');
      retarder(n, t);
      t += pas == null ? 0.15 : pas;
      (parent || box).appendChild(n);
      return n;
    };
    const faireListe = (items, numerotee) => {
      const ul = el(numerotee ? 'ol' : 'ul', 'liste');
      items.forEach((it, k) => {
        const o = typeof it === 'string' ? { texte: it } : it;
        const li = el('li');
        if (numerotee) li.appendChild(el('span', 'num', String(k + 1)));
        else if (o.icone) { const r = el('span', 'ico-rond ' + o.icone); r.appendChild(icone(o.icone)); li.appendChild(r); }
        else li.appendChild(el('span', 'puce'));
        const tx = el('span', 'txt');
        texteRiche(tx, o.texte);
        li.appendChild(tx);
        ajoute(li, 0.22, ul);
      });
      return ul;
    };

    if (d.kicker) ajoute(el('div', 'kicker', remplir(d.kicker)), 0.15);
    if (d.titre) {
      const h = el('h1', 'titre');
      t = motParMot(h, d.titre, t, 0.07) + 0.1;
      box.appendChild(h);
    }
    if (d.sousTitre) { const p = el('p', 'sous-titre'); texteRiche(p, d.sousTitre); ajoute(p, 0.2); }
    if (d.avant || d.apres) {
      const w = el('div', 'etats');
      [['avant', d.avant], ['apres', d.apres]].forEach(([cl, o]) => {
        if (!o) return;
        const e = el('div', 'etat ' + cl);
        e.appendChild(el('h3', null, remplir(o.titre)));
        const p = el('p');
        texteRiche(p, o.texte);
        e.appendChild(p);
        w.appendChild(e);
      });
      ajoute(w, 0.25);
    }
    if (d.blocs) {
      d.blocs.forEach((b) => {
        const bl = el('div', 'bloc');
        box.appendChild(bl);
        if (b.titre) ajoute(el('h3', null, remplir(b.titre)), 0.12, bl);
        if (b.texte) { const p = el('p'); texteRiche(p, b.texte); ajoute(p, 0.2, bl); }
        if (b.liste) bl.appendChild(faireListe(b.liste, b.numerotee));
      });
    }
    if (d.liste) box.appendChild(faireListe(d.liste, d.numerotee));
    if (d.citation) { const q = el('p', 'citation'); texteRiche(q, d.citation); ajoute(q, 0.2); }
    if (d.note) { const n = el('div', 'note'); texteRiche(n, d.note); ajoute(n, 0.2); }
    if (d.pied) ajoute(el('div', 'pied', remplir(d.pied)));

    /* réduit légèrement la taille si le texte déborde */
    let k = 1;
    while (box.offsetHeight > panel.clientHeight && k > 0.6) {
      k -= 0.04;
      panel.style.setProperty('--k', k.toFixed(2));
    }
  }

  function construireCloture(d) {
    cloture.innerHTML = '';
    cloture.classList.add('actif');
    cloture.appendChild(retarder(logo('logo-cloture zoom'), 0.3));
    const h = el('h1', 'cloture-titre');
    const fin = motParMot(h, d.titre, 1.1, 0.14);
    cloture.appendChild(h);
    if (d.devise) {
      const p = el('p', 'cloture-devise rise');
      texteRiche(p, d.devise);
      cloture.appendChild(retarder(p, fin + 0.4));
    }
    if (d.pied) cloture.appendChild(retarder(el('p', 'cloture-pied rise', remplir(d.pied)), fin + 0.9));
  }

  function afficherDiapo(i) {
    const d = C.diapos[i];
    state.diapo = i;
    state.etape = 0;
    state.tc = 0;
    state.points = [];
    /* relance proprement les animations de la carte */
    map.setAttribute('data-scene', '');
    map.classList.remove('apres');
    void map.getBoundingClientRect();
    map.setAttribute('data-scene', d.scene || 'neutre');
    gSous.innerHTML = '';
    gSur.innerHTML = '';
    gLabels.querySelectorAll('.cache').forEach((t) => t.classList.remove('cache'));

    const centree = d.miseEnPage === 'centre';
    plan.classList.toggle('fond', centree);
    stage.classList.toggle('coin', !centree);
    if (centree) {
      panel.classList.remove('actif');
      panel.innerHTML = '';
      construireCloture(d);
    } else {
      cloture.classList.remove('actif');
      cloture.innerHTML = '';
      construirePanneau(d);
    }
    const anim = ANIM_CARTE[d.scene];
    if (anim) anim(d);
    compteur.textContent = (i + 1) + ' / ' + C.diapos.length;
  }

  function allerCarte(i) {
    state.mode = 'carte';
    definirPause(false);
    afficherCouche('carte');
    sceneBox.innerHTML = '';
    afficherDiapo(Math.max(0, Math.min(C.diapos.length - 1, i)));
  }

  function suivant() {
    const d = C.diapos[state.diapo];
    if (state.etape < nbEtapes(d) - 1) { state.etape++; placerPoints(); return; }
    if (state.diapo < C.diapos.length - 1) afficherDiapo(state.diapo + 1);
  }

  function precedent() {
    if (state.etape > 0) { state.etape--; placerPoints(); return; }
    if (state.diapo > 0) afficherDiapo(state.diapo - 1);
  }

  /* ==================================================================
     Clavier, souris, plein écran
     ================================================================== */
  function basculerPleinEcran() {
    const doc = document;
    const elt = doc.documentElement;
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      const req = elt.requestFullscreen || elt.webkitRequestFullscreen;
      if (req) { const r = req.call(elt); if (r && r.catch) r.catch(() => {}); }
    } else {
      const sortir = doc.exitFullscreen || doc.webkitExitFullscreen;
      if (sortir) sortir.call(doc);
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    const avancer = ['ArrowRight', 'ArrowDown', 'PageDown', 'Enter'].includes(k);
    const reculer = ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(k);

    if (k === 'f' || k === 'F') { basculerPleinEcran(); }
    else if (k === 'r' || k === 'R') { lancerClip(); }
    else if (k === 'c' || k === 'C') { lancerBalayage(-0.45); allerCarte(0); }
    else if (k === 'h' || k === 'H' || k === '?') { aide.classList.contains('visible') ? aide.classList.remove('visible') : montrerAide(0); }
    else if (k === ' ' || k === 'Spacebar') {
      if (state.mode === 'accueil') lancerClip();
      else if (state.mode === 'clip') definirPause(!state.pause);
      else suivant();
    }
    else if (avancer) {
      if (e.repeat) { e.preventDefault(); return; }
      if (state.mode === 'accueil') lancerClip();
      else if (state.mode === 'clip') sauterScene(state.scene + 1);
      else suivant();
    }
    else if (reculer) {
      if (e.repeat) { e.preventDefault(); return; }
      if (state.mode === 'clip') sauterScene(state.scene - 1);
      else if (state.mode === 'carte') precedent();
    }
    else return;
    e.preventDefault();
  });

  stage.addEventListener('click', () => {
    if (state.mode === 'accueil') lancerClip();
    else if (state.mode === 'carte') suivant();
  });

  let minuterieCurseur = null;
  document.addEventListener('mousemove', () => {
    document.body.classList.remove('cache-curseur');
    clearTimeout(minuterieCurseur);
    minuterieCurseur = setTimeout(() => document.body.classList.add('cache-curseur'), 2500);
  });

  /* ==================================================================
     Boucle d'animation
     ================================================================== */
  let dernier = null;
  function boucle(ts) {
    const dt = dernier == null ? 0 : Math.min(0.1, (ts - dernier) / 1000);
    dernier = ts;
    if (state.mode === 'clip') {
      if (!state.pause) { state.t += dt; majClip(); }
      if (state.mode === 'clip' && state.scene >= 0) majCompteurs(sceneBox, state.t - debuts[state.scene]);
    } else if (state.mode === 'carte') {
      state.tc += dt;
    }
    requestAnimationFrame(boucle);
  }

  /* Démarrage : écran d'attente. ?carte=4 ouvre directement la diapo 4 (répétitions). */
  const m = /[?&]carte=(\d+)/.exec(location.search);
  if (m) allerCarte(parseInt(m[1], 10) - 1);
  else { afficherCouche('accueil'); montrerAide(7000); }
  requestAnimationFrame(boucle);
})();

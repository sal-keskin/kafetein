(() => {
  'use strict';

  /* ---------- constants ---------- */

  const DAY = 1440;        // minutes shown on the chart
  const DAY_START = 360;   // the chart day runs 06:00 -> 06:00
  const KA = 4.2;          // absorption rate, 1/h (peak roughly 50 min after a drink)
  const STORE = 'kafetein:v1';
  const DEFAULTS = { weight: 60, half: 5, bed: '23:00', esp: 63, tea: 25 };
  const FIELDS = [
    { key: 'weight', min: 30, max: 200, step: 1, unit: 'kg' },
    { key: 'half', min: 2, max: 15, step: 0.5, unit: 'h' },
    { key: 'esp', min: 10, max: 300, step: 5, unit: 'mg' },
    { key: 'tea', min: 5, max: 150, step: 5, unit: 'mg' },
  ];
  const FONT = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, "Roboto Mono", monospace';
  const C = { fg: '#e8e8e8', dim: '#878787', axis: '#3a3a3a', hour: '#757575', blue: '#4c82f7' };

  const I18N = {
    tr: {
      docTitle: 'Kafetein · Kafein ve tein hesaplayıcı',
      title: 'KAFETEİN', settings: 'AYARLAR', close: 'KAPAT',
      langBtn: 'EN', langLabel: 'Switch to English',
      esp: 'ESPRESSO', tea: 'ÇAY',
      nEsp: n => `${n} ESPRESSO`, nTea: n => `${n} ÇAY`,
      empty: 'HENÜZ BİR ŞEY İÇMEDİN',
      half: h => `YARI ÖMÜR ${h} SA`,
      limit: mg => `SINIR ${mg} MG`,
      over: mg => `SINIR ${mg} MG AŞILDI`,
      peak: mg => `TEPE ${mg} MG`,
      bed: t => `UYKU ${t}`,
      bedLeft: mg => `${mg} MG HÂLÂ SENDE`,
      lastCup: t => `SON FİNCAN EN GEÇ ${t}`,
      lastGlass: t => `SON BARDAK EN GEÇ ${t}`,
      enough: 'BUGÜNLÜK YETER',
      now: mg => `ŞU AN ${mg} MG`,
      hint: 'İÇTİĞİNİ EKLE · SAATİNİ SÜRÜKLE',
      del: 'SİL', earlier: '15 dakika erkene al', later: '15 dakika ileri al',
      addEsp: mg => `Bir fincan espresso ekle, ${mg} mg kafein`,
      addTea: mg => `Bir bardak çay ekle, ${mg} mg kafein`,
      logItem: (t, name, mg) => `${t}, ${name}, ${mg} mg. Seç`,
      chartLabel: (peak, pt, bt, bmg) => `Kafein grafiği. Tepe ${peak} mg, saat ${pt}. Uyku saati ${bt}, vücutta kalan ${bmg} mg.`,
      chartEmpty: 'Kafein grafiği. Henüz içecek eklenmedi.',
      weight: 'KİLO', halfLife: 'YARI ÖMÜR', espSet: 'ESPRESSO · 1 FİNCAN', teaSet: 'ÇAY · 1 BARDAK ~100 ML',
      bedtime: 'UYKU SAATİ', language: 'DİL',
      dec: 'Azalt', inc: 'Artır',
      unit: { kg: 'KG', h: 'SA', mg: 'MG' },
      resetDay: 'GÜNÜ SIFIRLA', resetSet: 'VARSAYILAN AYARLAR',
      note1: 'Varsayılan: 60 kg yetişkin kadın. Tein, çaydaki kafeinin adıdır; ikisi aynı moleküldür.',
      note2: 'Yarı ömür kişiye göre değişir: sigara içenlerde yaklaşık 3 sa, doğum kontrol hapı kullananlarda yaklaşık 10 sa, hamilelikte 10–15 sa. Çay demine göre bardak başına 15–40 mg arasında oynar.',
      note3: (limit, thr) => `Günlük sınır ${limit} mg (5,7 mg/kg, EFSA). Uyku eşiği ${thr} mg (yaklaşık 0,8 mg/kg, pratik bir kural). Bu bir tahmindir, tıbbi tavsiye değildir.`,
    },
    en: {
      docTitle: 'Kafetein · Caffeine calculator for coffee and tea',
      title: 'KAFETEIN', settings: 'SETTINGS', close: 'CLOSE',
      langBtn: 'TR', langLabel: 'Türkçeye geç',
      esp: 'ESPRESSO', tea: 'TEA',
      nEsp: n => `${n} ESPRESSO`, nTea: n => `${n} TEA`,
      empty: 'NOTHING YET TODAY',
      half: h => `HALF-LIFE ${h}H`,
      limit: mg => `LIMIT ${mg} MG`,
      over: mg => `OVER LIMIT ${mg} MG`,
      peak: mg => `PEAK ${mg} MG`,
      bed: t => `BED ${t}`,
      bedLeft: mg => `${mg} MG STILL IN YOU`,
      lastCup: t => `LAST CUP BY ${t}`,
      lastGlass: t => `LAST GLASS BY ${t}`,
      enough: 'ENOUGH FOR TODAY',
      now: mg => `NOW ${mg} MG`,
      hint: 'ADD A DRINK · DRAG ITS TIME',
      del: 'DELETE', earlier: '15 minutes earlier', later: '15 minutes later',
      addEsp: mg => `Add one cup of espresso, ${mg} mg caffeine`,
      addTea: mg => `Add one glass of tea, ${mg} mg caffeine`,
      logItem: (t, name, mg) => `${t}, ${name}, ${mg} mg. Select`,
      chartLabel: (peak, pt, bt, bmg) => `Caffeine chart. Peak ${peak} mg at ${pt}. Bedtime ${bt}, ${bmg} mg still in the body.`,
      chartEmpty: 'Caffeine chart. No drinks added yet.',
      weight: 'WEIGHT', halfLife: 'HALF-LIFE', espSet: 'ESPRESSO · 1 CUP', teaSet: 'TEA · 1 GLASS ~100 ML',
      bedtime: 'BEDTIME', language: 'LANGUAGE',
      dec: 'Decrease', inc: 'Increase',
      unit: { kg: 'KG', h: 'H', mg: 'MG' },
      resetDay: 'CLEAR TODAY', resetSet: 'DEFAULT SETTINGS',
      note1: 'Default: a 60 kg adult woman. Theine ("tein") is the caffeine in tea; it is the same molecule.',
      note2: 'Half-life varies by person: about 3 h for smokers, about 10 h on the contraceptive pill, 10–15 h in pregnancy. A glass of Turkish tea holds roughly 15–40 mg depending on how strong it is brewed.',
      note3: (limit, thr) => `Daily limit ${limit} mg (5.7 mg/kg, EFSA). Sleep threshold ${thr} mg (about 0.8 mg/kg, a rule of thumb). This is an estimate, not medical advice.`,
    },
  };
  const LABEL_KEY = { weight: 'weight', half: 'halfLife', esp: 'espSet', tea: 'teaSet' };

  // Dot-matrix icons: '#' bright dot, '+' faint dot.
  const ICON_ESP = [
    '....+..+......',
    '...+..+.......',
    '....+..+......',
    '..............',
    '.#########....',
    '.###########..',
    '.#########.##.',
    '.#########.##.',
    '.###########..',
    '..#######.....',
    '...#####......',
    '..............',
    '#############.',
  ];
  const ICON_TEA = [
    '..+++++++++..',
    '..+.......+..',
    '..#########..',
    '..#########..',
    '...#######...',
    '....#####....',
    '....#####....',
    '...#######...',
    '..#########..',
    '..#########..',
    '..#########..',
    '...#######...',
    '....#####....',
    '#############',
  ];

  /* ---------- helpers ---------- */

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad2 = n => String(n).padStart(2, '0');
  const fmt = t => {
    const m = ((Math.round(t) + DAY_START) % DAY + DAY) % DAY;
    return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function dayKey() {
    const d = new Date(Date.now() - DAY_START * 60000);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }
  function nowT() {
    const d = new Date();
    return ((d.getHours() * 60 + d.getMinutes() - DAY_START) % DAY + DAY) % DAY;
  }

  function dotIcon(rows, pitch) {
    let c = '';
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === '.') return;
      const bright = ch === '#';
      c += `<circle cx="${x * pitch + pitch / 2}" cy="${y * pitch + pitch / 2}" r="${pitch * (bright ? 0.4 : 0.28)}" opacity="${bright ? 1 : 0.5}"/>`;
    }));
    const w = rows[0].length * pitch, h = rows.length * pitch;
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="currentColor" aria-hidden="true">${c}</svg>`;
  }

  /* ---------- state ---------- */

  const S = { lang: 'tr', set: { ...DEFAULTS }, day: dayKey(), drinks: [], sel: null };
  let nextId = 1;

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (!raw) return;
      if (raw.lang === 'en' || raw.lang === 'tr') S.lang = raw.lang;
      if (raw.set) {
        for (const f of FIELDS) {
          const v = Number(raw.set[f.key]);
          if (Number.isFinite(v)) S.set[f.key] = clamp(v, f.min, f.max);
        }
        if (/^\d\d:\d\d$/.test(raw.set.bed)) S.set.bed = raw.set.bed;
      }
      if (raw.day === S.day && Array.isArray(raw.drinks)) {
        for (const d of raw.drinks) {
          if ((d.type === 'esp' || d.type === 'tea') && Number.isFinite(d.t)) {
            S.drinks.push({ id: nextId++, type: d.type, t: clamp(d.t, 0, DAY - 5) });
          }
        }
      }
    } catch (e) { /* storage unavailable: run with defaults */ }
  }
  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({
        lang: S.lang, set: S.set, day: S.day,
        drinks: S.drinks.map(d => ({ type: d.type, t: d.t })),
      }));
    } catch (e) { /* ignore */ }
  }

  /* ---------- caffeine model ---------- */

  const mgOf = type => S.set[type];
  const ke = () => Math.LN2 / S.set.half;
  const tmax = k => Math.log(KA / k) / (KA - k);
  // Fraction of a dose in the body tau hours after drinking it.
  const F = (tau, k) => tau <= 0 ? 0 : KA / (KA - k) * (Math.exp(-k * tau) - Math.exp(-KA * tau));
  const levelAt = t => {
    const k = ke();
    let s = 0;
    for (const d of S.drinks) s += mgOf(d.type) * F((t - d.t) / 60, k);
    return s;
  };
  const bedT = () => {
    const [h, m] = S.set.bed.split(':').map(Number);
    return ((h * 60 + m - DAY_START) % DAY + DAY) % DAY;
  };
  const dailyLimit = () => Math.round(S.set.weight * 5.7 / 10) * 10;
  const sleepThr = () => Math.max(5, Math.round(S.set.weight * (5 / 6) / 5) * 5);

  // Latest time the last drink of the day can be taken so that what it
  // leaves at bedtime (or later, if it is still being absorbed) stays
  // under the sleep threshold.
  function cutoff() {
    const k = ke(), tm = tmax(k), bt = bedT();
    const G = tau => tau <= 0 ? 0 : F(Math.max(tau, tm), k);
    const sorted = [...S.drinks].sort((a, b) => a.t - b.t);
    const last = sorted.pop();
    const type = last ? last.type : 'esp';
    let others = 0;
    for (const d of sorted) others += mgOf(d.type) * G((bt - d.t) / 60);
    const r = (sleepThr() - others) / mgOf(type);
    if (r <= 0) return { type, enough: true };
    if (r >= F(tm, k)) return { type, t: bt };
    let lo = tm, hi = 72;
    for (let i = 0; i < 48; i++) {
      const mid = (lo + hi) / 2;
      if (F(mid, k) > r) lo = mid; else hi = mid;
    }
    const t = Math.floor((bt - hi * 60) / 5) * 5;
    return t < 0 ? { type, enough: true } : { type, t };
  }

  /* ---------- chart ---------- */

  const cv = $('#chart');
  const ctx = cv.getContext('2d');
  const wrap = cv.parentElement;
  let G = null;       // geometry
  let T = null;       // target model
  let D = null;       // displayed levels (tweened towards T)
  let anim = null;
  let drag = null;
  let markers = [];

  function measure() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    const padL = 14, padR = 30, padT = 34, band = 74;
    const plotW = w - padL - padR, plotH = Math.max(60, h - padT - band);
    let step = 15;
    if (plotW / 96 < 4.6) step = 20;
    if (plotW / 72 < 3.6) step = 30;
    const cols = DAY / step, pitch = plotW / cols;
    const rows = Math.max(6, Math.floor(plotH / pitch));
    G = { w, h, dpr, padL, padT, plotW, plotH, plotB: padT + plotH, step, cols, pitch, rows };
    return true;
  }
  const xOf = t => G.padL + t / DAY * G.plotW;
  const tOf = x => (x - G.padL) / G.plotW * DAY;

  function model() {
    const k = ke(), riseWin = tmax(k) * 60 + G.step * 0.5;
    const { cols, step } = G;
    const res = new Float32Array(cols), rise = new Float32Array(cols), sel = new Float32Array(cols);
    const col = new Array(cols);
    for (let i = 0; i < cols; i++) {
      const ts = (i + 1) * step;
      let age = Infinity, selRising = false, selAge = Infinity;
      for (const d of S.drinks) {
        const tau = ts - d.t;
        if (tau <= 0) continue;
        const v = mgOf(d.type) * F(tau / 60, k);
        const rising = tau <= riseWin;
        if (d.id === S.sel) { sel[i] = v; selRising = rising; selAge = (tau - riseWin) / 60; }
        else if (rising) rise[i] += v;
        else res[i] += v;
        if (!rising) age = Math.min(age, (tau - riseWin) / 60);
      }
      col[i] = { age, selRising, selAge };
    }
    let peak = { t: 0, mg: 0 };
    for (let t = 0; t <= DAY; t += 2) {
      const v = levelAt(t);
      if (v > peak.mg) peak = { t, mg: v };
    }
    const bt = bedT(), thr = sleepThr();
    let scaleMax = Math.ceil(Math.max(peak.mg * 1.04, thr * 1.4, 110) / 20) * 20;
    if (drag && T) scaleMax = Math.max(scaleMax, T.scaleMax);
    T = { res, rise, sel, col, peak, bt, bedMg: levelAt(bt), thr, scaleMax };
  }

  function recompute(animate) {
    if (!G) return;
    const prev = D;
    model();
    const same = prev && prev.res.length === G.cols;
    if (animate && !reduceMotion.matches) {
      const from = same ? prev : { res: new Float32Array(G.cols), rise: new Float32Array(G.cols), sel: new Float32Array(G.cols) };
      D = { res: from.res.slice(), rise: from.rise.slice(), sel: from.sel.slice() };
      anim = { from, start: performance.now(), dur: same ? 320 : 700 };
      requestAnimationFrame(frame);
    } else {
      anim = null;
      D = { res: T.res, rise: T.rise, sel: T.sel };
      draw();
    }
  }

  function frame(now) {
    if (!anim) return;
    const p = clamp((now - anim.start) / anim.dur, 0, 1);
    const e = 1 - Math.pow(1 - p, 3);
    for (const key of ['res', 'rise', 'sel']) {
      const a = anim.from[key], b = T[key], o = D[key];
      for (let i = 0; i < o.length; i++) o[i] = a[i] + (b[i] - a[i]) * e;
    }
    draw();
    if (p < 1) requestAnimationFrame(frame); else anim = null;
  }

  function dot(x, y, r, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 6.2832);
    ctx.fill();
  }

  function draw() {
    if (!G || !T || !D) return;
    const L = I18N[S.lang];
    const { w, h, dpr, padL, padT, plotW, plotH, plotB, cols, pitch, rows } = G;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    const frac = clamp((plotH - 72) / plotH, 0.4, 0.72);
    const mgRow = T.scaleMax / (rows * frac);
    const yOf = mg => plotB - mg / mgRow * pitch;
    const axisY = plotB + 8;
    const rBig = pitch * 0.42;

    // sleep threshold
    const thrY = Math.round(yOf(T.thr)) + 0.5;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(padL - 2, thrY); ctx.lineTo(padL + plotW + 4, thrY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = `10px ${FONT}`;
    ctx.fillStyle = C.hour;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(T.thr), padL + plotW + 8, thrY);

    // dots
    for (let i = 0; i < cols; i++) {
      const x = padL + (i + 0.5) * pitch;
      const c = T.col[i];
      const res = D.res[i] / mgRow, rise = res + D.rise[i] / mgRow, tot = rise + D.sel[i] / mgRow;
      const top = Math.floor(tot + 0.5);
      const fresh = Number.isFinite(c.age) ? Math.exp(-Math.max(0, c.age) / 4) : 1;
      const gA = 0.2 + 0.46 * fresh, gR = pitch * (0.2 + 0.11 * fresh);
      const blueA = c.selRising ? 1 : clamp(1 - c.selAge / 1.6, 0, 1);
      for (let r = 0; r < rows; r++) {
        const y = plotB - (r + 0.5) * pitch;
        const rc = r + 0.5;
        if (rc <= tot) {
          if (rc <= res) dot(x, y, gR, '#bdbdbd', gA);
          else if (rc <= rise) dot(x, y, rBig, '#f0f0f0', 1);
          else if (c.selRising) dot(x, y, rBig, C.blue, 1);
          else {
            dot(x, y, gR, '#bdbdbd', gA * (1 - blueA * 0.7));
            if (blueA > 0) dot(x, y, pitch * 0.24, C.blue, blueA);
          }
        } else {
          const kAbove = r - top;
          if (top > 0 && kAbove < 5) {
            const a = [0.24, 0.16, 0.1, 0.06, 0.035][kAbove] * (0.45 + 0.55 * fresh);
            const selTop = D.sel[i] / mgRow > 0.5 && blueA > 0;
            dot(x, y, pitch * 0.15, selTop ? C.blue : '#cfcfcf', selTop ? a * 2.2 * blueA + a * (1 - blueA) : a);
          } else {
            dot(x, y, pitch * 0.11, '#ffffff', 0.02 + 0.075 * Math.pow(1 - r / rows, 1.6));
          }
        }
      }
    }
    ctx.globalAlpha = 1;

    // axis, ticks, hour labels
    ctx.strokeStyle = C.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, axisY + 0.5); ctx.lineTo(padL + plotW, axisY + 0.5);
    for (let hr = 0; hr <= 24; hr += 3) {
      const x = Math.round(xOf(hr * 60)) + 0.5;
      ctx.moveTo(x, axisY); ctx.lineTo(x, axisY + 6);
    }
    ctx.stroke();
    ctx.font = `10px ${FONT}`;
    ctx.fillStyle = C.hour;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    for (let hr = 0; hr <= 24; hr += 6) ctx.fillText(pad2((6 + hr) % 24), xOf(hr * 60), axisY + 64);

    // now tick
    const nx = Math.round(xOf(nowT())) + 0.5;
    ctx.strokeStyle = C.fg;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(nx, axisY - 4); ctx.lineTo(nx, axisY + 7); ctx.stroke();

    // drink stems and markers
    markers = [];
    const sorted = [...S.drinks].sort((a, b) => a.t - b.t);
    for (const d of sorted) {
      const x = xOf(d.t), selected = d.id === S.sel;
      let lvl = 0;
      while (lvl < 2 && markers.some(m => m.lvl === lvl && Math.abs(m.x - x) < 11)) lvl++;
      const mg = mgOf(d.type);
      const r = clamp(2.6 + mg / 22, 3.2, 6.5);
      markers.push({ id: d.id, x, y: axisY + 20 + lvl * 11, r, lvl, selected, t: d.t });
      const topY = yOf(levelAt(d.t + (tmax(ke()) * 60))) - pitch;
      for (let y = axisY - 5; y > topY; y -= 4) dot(x, y, 0.75, selected ? C.blue : '#9a9a9a', selected ? 0.95 : 0.55);
    }
    for (const m of markers) dot(m.x, m.y, m.r + (m.selected ? 1 : 0), m.selected ? C.blue : '#dcdcdc', 1);
    const sm = markers.find(m => m.selected);
    if (sm) {
      ctx.font = `11px ${FONT}`;
      ctx.fillStyle = C.blue;
      ctx.textAlign = 'center';
      const tw = ctx.measureText(fmt(sm.t)).width / 2;
      ctx.fillText(fmt(sm.t), clamp(sm.x, tw + 1, w - tw - 1), axisY + 49);
    }

    // bedtime and peak annotations
    ctx.font = `11px ${FONT}`;
    ctx.textBaseline = 'alphabetic';
    const lh = 14, labTop = 3;
    const place = (x, width) => (x + 6 + width <= w - 1 ? [x + 6, 'left'] : [x - 6 - width, 'right']);

    const bx = Math.round(xOf(T.bt)) + 0.5;
    const bedLines = [L.bed(S.set.bed), L.bedLeft(Math.round(T.bedMg))];
    const bedW = Math.max(...bedLines.map(s => ctx.measureText(s).width));
    const [bedX] = place(bx, bedW);
    ctx.strokeStyle = '#8a8a8a';
    ctx.beginPath(); ctx.moveTo(bx, labTop); ctx.lineTo(bx, axisY); ctx.stroke();
    ctx.textAlign = 'left';
    ctx.fillStyle = C.fg;
    ctx.fillText(bedLines[0], bedX, labTop + 10);
    ctx.fillStyle = T.bedMg > T.thr + 0.5 ? C.fg : C.dim;
    ctx.fillText(bedLines[1], bedX, labTop + 10 + lh);

    if (S.drinks.length && T.peak.mg >= 1) {
      const px = Math.round(xOf(T.peak.t)) + 0.5;
      const peakLines = [L.peak(Math.round(T.peak.mg)), fmt(T.peak.t)];
      const pw = Math.max(...peakLines.map(s => ctx.measureText(s).width));
      const peakTopY = yOf(T.peak.mg) - pitch * 0.5 - 4;
      const clear = x0 => x0 >= 1 && x0 + pw <= w - 1 && !(bx > x0 - 5 && bx < x0 + pw + 5);
      const hitsBed = x0 => x0 < bedX + bedW + 8 && x0 + pw > bedX - 8;
      const opts = [px + 6, px - 6 - pw];
      let lx = opts.find(x0 => clear(x0) && !hitsBed(x0)), ly = labTop;
      if (lx === undefined) {
        lx = opts.find(clear);
        ly = labTop + 2 * lh + 6;
        if (lx === undefined) lx = clamp(px + 6, 1, w - pw - 1);
      }
      ly = Math.min(ly, Math.max(labTop, peakTopY - 2 * lh - 4));
      ctx.strokeStyle = '#6f6f6f';
      ctx.beginPath(); ctx.moveTo(px, ly); ctx.lineTo(px, Math.max(ly, peakTopY)); ctx.stroke();
      ctx.fillStyle = C.fg;
      ctx.fillText(peakLines[0], lx, ly + 10);
      ctx.fillStyle = C.dim;
      ctx.fillText(peakLines[1], lx, ly + 10 + lh);
    }
  }

  /* ---------- pointer interaction ---------- */

  function pick(px, py) {
    let best = null;
    for (const m of markers) {
      const dx = Math.abs(px - m.x);
      const reach = py >= G.plotB ? 22 : 12;
      if (dx > reach) continue;
      const score = dx + Math.abs(py - m.y) * (py >= G.plotB ? 0.5 : 0) - (m.selected ? 3 : 0);
      if (!best || score < best.score) best = { m, score };
    }
    return best && best.m;
  }

  cv.addEventListener('pointerdown', e => {
    if (!G) return;
    const b = cv.getBoundingClientRect();
    const px = e.clientX - b.left, py = e.clientY - b.top;
    const m = pick(px, py);
    if (!m) {
      if (S.sel !== null) { S.sel = null; refresh(true); }
      return;
    }
    e.preventDefault();
    S.sel = m.id;
    drag = { id: m.id, off: px - m.x, moved: false, x0: px };
    try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    refresh(false);
  });
  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    const b = cv.getBoundingClientRect();
    const px = e.clientX - b.left;
    if (!drag.moved && Math.abs(px - drag.x0) < 4) return;
    drag.moved = true;
    const d = S.drinks.find(d => d.id === drag.id);
    if (!d) return;
    const t = clamp(Math.round(tOf(px - drag.off) / 5) * 5, 0, DAY - 5);
    if (t !== d.t) { d.t = t; refresh(false); }
  });
  const endDrag = () => {
    if (!drag) return;
    drag = null;
    save();
    refresh(true);
  };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);

  /* ---------- DOM ---------- */

  function buildFields() {
    $('#fields').innerHTML = FIELDS.map(f => `
      <div class="row">
        <label for="f-${f.key}" data-i18n="${LABEL_KEY[f.key]}"></label>
        <div class="stepper" data-key="${f.key}">
          <button type="button" class="btn small" data-d="-1" data-i18n-label="dec">−</button>
          <input type="number" id="f-${f.key}" inputmode="decimal" min="${f.min}" max="${f.max}" step="${f.step}">
          <span class="unit" data-unit="${f.unit}"></span>
          <button type="button" class="btn small" data-d="1" data-i18n-label="inc">+</button>
        </div>
      </div>`).join('');
  }

  function syncInputs() {
    for (const f of FIELDS) $(`#f-${f.key}`).value = S.set[f.key];
    $('#bed').value = S.set.bed;
  }

  function updateUI() {
    const L = I18N[S.lang];
    const num = v => String(v).replace('.', S.lang === 'tr' ? ',' : '.');
    document.documentElement.lang = S.lang;
    document.title = L.docTitle;
    for (const el of $$('[data-i18n]')) el.textContent = L[el.dataset.i18n];
    for (const el of $$('[data-i18n-label]')) el.setAttribute('aria-label', L[el.dataset.i18nLabel]);
    for (const el of $$('[data-unit]')) el.textContent = L.unit[el.dataset.unit];
    for (const el of $$('[data-lang]')) el.setAttribute('aria-pressed', String(el.dataset.lang === S.lang));

    const nE = S.drinks.filter(d => d.type === 'esp').length;
    const nT = S.drinks.length - nE;
    const total = nE * S.set.esp + nT * S.set.tea;
    const limit = dailyLimit();
    const parts = [];
    if (nE) parts.push(L.nEsp(nE));
    if (nT) parts.push(L.nTea(nT));
    $('#stats').textContent = parts.length ? [...parts, `${total} MG`].join(' · ') : L.empty;
    $('#stats2').textContent = `${L.half(num(S.set.half))} · ${total > limit ? L.over(limit) : L.limit(limit)}`;
    $('#stats2').classList.toggle('warn', total > limit);

    $('#subEsp').textContent = `~30 ML · ${S.set.esp} MG`;
    $('#subTea').textContent = `~100 ML · ${S.set.tea} MG`;
    $('#addEsp').setAttribute('aria-label', L.addEsp(S.set.esp));
    $('#addTea').setAttribute('aria-label', L.addTea(S.set.tea));
    $('#note3').textContent = L.note3(limit, sleepThr());

    const cut = cutoff();
    $('#lastCup').textContent = cut.enough ? L.enough : (cut.type === 'tea' ? L.lastGlass : L.lastCup)(fmt(cut.t));
    $('#nowLevel').textContent = L.now(Math.round(levelAt(nowT())));

    const sel = S.drinks.find(d => d.id === S.sel);
    $('#hint').hidden = !!sel;
    $('#selctl').hidden = !sel;
    if (sel) $('#sellabel').textContent = `${fmt(sel.t)} · ${L[sel.type]} · ${mgOf(sel.type)} MG`;

    const sorted = [...S.drinks].sort((a, b) => a.t - b.t);
    $('#log').innerHTML = sorted.map(d =>
      `<li><button type="button" data-id="${d.id}">${L.logItem(fmt(d.t), L[d.type].toLowerCase(), mgOf(d.type))}</button></li>`).join('');

    if (T) {
      cv.setAttribute('aria-label', S.drinks.length
        ? L.chartLabel(Math.round(T.peak.mg), fmt(T.peak.t), S.set.bed, Math.round(T.bedMg))
        : L.chartEmpty);
    }
  }

  function refresh(animate) {
    recompute(animate);
    updateUI();
  }

  function addDrink(type) {
    const d = { id: nextId++, type, t: clamp(Math.round(nowT() / 5) * 5, 0, DAY - 5) };
    S.drinks.push(d);
    S.sel = d.id;
    save();
    refresh(true);
  }

  function nudge(delta) {
    const d = S.drinks.find(d => d.id === S.sel);
    if (!d) return;
    d.t = clamp(d.t + delta, 0, DAY - 5);
    save();
    refresh(true);
  }

  function setField(key, value) {
    const f = FIELDS.find(f => f.key === key);
    if (!Number.isFinite(value)) return;
    S.set[key] = clamp(Math.round(value / (f.step < 1 ? 0.5 : 1)) * (f.step < 1 ? 0.5 : 1), f.min, f.max);
    save();
    refresh(true);
  }

  function bind() {
    $('#addEsp').addEventListener('click', () => addDrink('esp'));
    $('#addTea').addEventListener('click', () => addDrink('tea'));
    $('#earlier').addEventListener('click', () => nudge(-15));
    $('#later').addEventListener('click', () => nudge(15));
    $('#del').addEventListener('click', () => {
      S.drinks = S.drinks.filter(d => d.id !== S.sel);
      S.sel = null;
      save();
      refresh(true);
    });
    $('#log').addEventListener('click', e => {
      const b = e.target.closest('button[data-id]');
      if (!b) return;
      S.sel = Number(b.dataset.id);
      refresh(true);
      $('#earlier').focus();
    });

    const setLang = lang => { S.lang = lang; save(); refresh(false); };
    $('#langBtn').addEventListener('click', () => setLang(S.lang === 'tr' ? 'en' : 'tr'));
    for (const b of $$('[data-lang]')) b.addEventListener('click', () => setLang(b.dataset.lang));

    const dlg = $('#settings');
    $('#settingsBtn').addEventListener('click', () => { syncInputs(); dlg.showModal(); });
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      // Light dismiss where closedby="any" is not supported yet.
      const outside = e => {
        const r = dlg.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      dlg.addEventListener('pointerdown', e => { pressedOutside = outside(e); });
      dlg.addEventListener('pointerup', e => { if (pressedOutside && outside(e)) dlg.close(); });
    }
    dlg.addEventListener('close', syncInputs);

    $('#fields').addEventListener('click', e => {
      const b = e.target.closest('button[data-d]');
      if (!b) return;
      const key = b.parentElement.dataset.key;
      const f = FIELDS.find(f => f.key === key);
      const dir = Number(b.dataset.d);
      const v = S.set[key] / f.step;
      // Step to the next multiple so 63 -> 65 or 60 rather than 68 or 58.
      setField(key, (dir > 0 ? Math.floor(v + 1e-9) + 1 : Math.ceil(v - 1e-9) - 1) * f.step);
      syncInputs();
    });
    $('#fields').addEventListener('change', e => {
      if (e.target.matches('input[type="number"]')) {
        setField(e.target.id.slice(2), Number(e.target.value));
        syncInputs();
      }
    });
    $('#bed').addEventListener('change', e => {
      if (/^\d\d:\d\d/.test(e.target.value)) {
        S.set.bed = e.target.value.slice(0, 5);
        save();
        refresh(true);
      }
    });
    $('#resetDay').addEventListener('click', () => {
      S.drinks = [];
      S.sel = null;
      save();
      refresh(true);
    });
    $('#resetSet').addEventListener('click', () => {
      S.set = { ...DEFAULTS };
      save();
      syncInputs();
      refresh(true);
    });
  }

  function tick() {
    const key = dayKey();
    if (key !== S.day) {
      S.day = key;
      S.drinks = [];
      S.sel = null;
      save();
      refresh(true);
    } else if (!drag && !anim) {
      updateUI();
      draw();
    }
  }

  /* ---------- start ---------- */

  load();
  buildFields();
  $('#icoEsp').innerHTML = dotIcon(ICON_ESP, 2.3);
  $('#icoTea').innerHTML = dotIcon(ICON_TEA, 2.3);
  bind();
  syncInputs();
  updateUI();

  let first = true;
  new ResizeObserver(() => {
    if (!measure()) return;
    recompute(first);
    first = false;
    updateUI();
  }).observe(wrap);

  if (document.fonts && document.fonts.load) {
    document.fonts.load(`11px ${FONT}`, 'TEPE ŞĞİ 0').then(() => { if (!anim) draw(); }).catch(() => {});
  }
  setInterval(tick, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
})();

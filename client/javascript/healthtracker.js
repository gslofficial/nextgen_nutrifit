/* =========================================================
   NextGen NutriFit - Health Tracker
   Methods (see "The science" section on the page):
   - BMR: Mifflin-St Jeor (Am J Clin Nutr 1990;51:241-7)
   - TDEE: BMR x physical activity level (FAO/WHO/UNU)
   - BMI: WHO categories (+ optional Asian cut-offs, WHO 2004)
   - Macros: IOM AMDR ranges, protein per ISSN 2017 / RDA
   - Fiber: IOM 14 g per 1,000 kcal
   - Water: EFSA adequate intake (total water)
   - Limits: WHO free sugars, saturated fat, sodium
   Educational estimates only - not medical advice.
   ========================================================= */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var STORE_KEY = 'ngnf_health_history_v1';
  var LB = 0.45359237, IN = 2.54;

  var state = { unit: 'metric', sex: 'male' };

  /* ---------- helpers ---------- */
  function round(n, d) { var p = Math.pow(10, d || 0); return Math.round(n * p) / p; }
  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }
  function fmt(n) { return Number(n).toLocaleString('en-US'); }

  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }

  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch (e) { return []; }
  }
  function saveHistory(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(-30))); return true; } catch (e) { return false; }
  }

  /* ---------- units ---------- */
  function setUnit(u) {
    if (u === state.unit) return;
    var w = parseFloat($('weight').value);
    var cmv = getHeightCm();
    state.unit = u;

    document.querySelectorAll('#unitSeg .seg-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.unit === u);
    });
    $('weightUnit').textContent = u === 'metric' ? 'kg' : 'lb';
    $('heightMetric').classList.toggle('hidden', u !== 'metric');
    $('heightImperial').classList.toggle('hidden', u === 'metric');

    if (!isNaN(w)) $('weight').value = u === 'metric' ? round(w * LB, 1) : round(w / LB, 1);
    if (cmv) {
      if (u === 'metric') { $('height').value = round(cmv, 1); }
      else {
        var totalIn = cmv / IN;
        $('heightFt').value = Math.floor(totalIn / 12);
        $('heightIn').value = round(totalIn % 12, 1);
      }
    }
  }

  function getHeightCm() {
    if (state.unit === 'metric') {
      var h = parseFloat($('height').value);
      return isNaN(h) ? null : h;
    }
    var ft = parseFloat($('heightFt').value);
    var inch = parseFloat($('heightIn').value) || 0;
    if (isNaN(ft)) return null;
    return (ft * 12 + inch) * IN;
  }
  function getWeightKg() {
    var w = parseFloat($('weight').value);
    if (isNaN(w)) return null;
    return state.unit === 'metric' ? w : w * LB;
  }

  /* ---------- core science ---------- */
  var PROTEIN_PER_KG = { '1.2': 0.8, '1.375': 1.2, '1.55': 1.6, '1.725': 1.8, '1.9': 2.0 };

  function bmiCategory(bmi, asian) {
    var c = asian ? [18.5, 23, 27.5] : [18.5, 25, 30];
    if (bmi < c[0]) return 'Underweight';
    if (bmi < c[1]) return 'Healthy weight';
    if (bmi < c[2]) return asian ? 'Overweight (increased risk)' : 'Overweight';
    return asian ? 'Obese (high risk)' : 'Obese';
  }

  function calculate(i) {
    var warnings = [];
    var hm = i.heightCm / 100;
    var bmi = i.weightKg / (hm * hm);
    var bmrRaw = 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age + (i.sex === 'male' ? 5 : -161);
    var tdee = bmrRaw * i.pal;

    // goal adjustment
    var adj = 0;
    if (i.goal === 'lose') {
      if (bmi < 18.5) {
        warnings.push('Your BMI is below 18.5, so no calorie deficit is applied. Please speak with a doctor or dietitian before trying to lose weight.');
      } else {
        adj = -Math.min(500, tdee * 0.2);
      }
    } else if (i.goal === 'gain') {
      adj = 300;
    }
    var target = tdee + adj;

    var floor = i.sex === 'male' ? 1500 : 1200;
    if (target < floor) {
      target = floor;
      warnings.push('Your target was raised to the safe minimum of ' + fmt(floor) + ' kcal/day. Diets below this level should only be followed under medical supervision.');
    }
    target = Math.round(target);

    // protein: g per kg, using adjusted body weight when BMI >= 30
    var ppk = PROTEIN_PER_KG[String(i.pal)] || 1.2;
    if (i.goal === 'lose') ppk = Math.min(2.0, ppk + 0.2);
    var refW = i.weightKg;
    if (bmi >= 30) {
      var ideal = 25 * hm * hm;
      refW = ideal + 0.25 * (i.weightKg - ideal);
    }
    var proteinG = refW * ppk;
    var proteinPct = (proteinG * 4 / target) * 100;
    if (proteinPct > 35) { proteinPct = 35; proteinG = target * 0.35 / 4; }
    if (proteinPct < 10) { proteinPct = 10; proteinG = target * 0.10 / 4; }

    // fat: 25% of energy, within AMDR 20-35%; carbs fill the rest (target 45-65%)
    var fatPct = 25;
    var carbPct = 100 - proteinPct - fatPct;
    if (carbPct < 45 && fatPct > 20) {
      fatPct = Math.max(20, 100 - proteinPct - 45);
      carbPct = 100 - proteinPct - fatPct;
    }
    if (carbPct > 65) {
      fatPct = Math.min(35, fatPct + (carbPct - 65));
      carbPct = 100 - proteinPct - fatPct;
    }
    var fatG = target * fatPct / 100 / 9;
    var carbG = target * carbPct / 100 / 4;
    if (carbPct < 45) warnings.push('Your protein need is high for this calorie level, so carbohydrate falls just below the 45% AMDR range. This is fine short-term for most healthy adults.');

    // other targets
    var fiber = (target / 1000) * 14;
    var water = i.sex === 'male' ? 2.5 : 2.0;
    var sugarMax = target * 0.10 / 4;
    var satMax = target * 0.10 / 9;

    // healthy weight range
    var lo = i.asian ? 18.5 : 18.5, hi = i.asian ? 22.9 : 24.9;
    var wLo = lo * hm * hm, wHi = hi * hm * hm;

    if (bmi >= 30 || (i.asian && bmi >= 27.5)) warnings.push('A BMI in this range is linked with higher health risk. A doctor can check waist size, blood pressure and blood tests for a fuller picture.');
    if (i.age > 65) warnings.push('For adults over 65, protein and calorie needs can differ. A healthcare professional can tailor these targets.');

    return {
      bmi: round(bmi, 1), bmiCat: bmiCategory(bmi, i.asian),
      bmr: Math.round(bmrRaw), tdee: Math.round(tdee), target: target, adj: Math.round(adj),
      proteinG: Math.round(proteinG), carbG: Math.round(carbG), fatG: Math.round(fatG),
      proteinPct: Math.round(proteinPct), carbPct: Math.round(carbPct), fatPct: Math.round(fatPct),
      fiber: Math.round(fiber), water: water, sugarMax: Math.round(sugarMax), satMax: Math.round(satMax),
      wLo: round(wLo, 1), wHi: round(wHi, 1), lo: lo, hi: hi,
      warnings: warnings
    };
  }

  /* ---------- reading + validating the form ---------- */
  function readInputs() {
    var errors = [];
    var age = parseInt($('age').value, 10);
    var w = getWeightKg();
    var h = getHeightCm();

    if (!$('consent').checked) errors.push('Please tick the disclaimer box to continue.');
    if ($('special').checked) {
      return { special: true, errors: [] };
    }
    if (isNaN(age) || age < 18 || age > 80) errors.push('Age must be between 18 and 80. This calculator is for healthy adults.');
    if (w === null || w < 30 || w > 300) errors.push('Enter a weight between ' + (state.unit === 'metric' ? '30 and 300 kg.' : '66 and 661 lb.'));
    if (h === null || h < 120 || h > 230) errors.push('Enter a height between 120 and 230 cm' + (state.unit === 'imperial' ? ' (about 3 ft 11 in to 7 ft 7 in).' : '.'));

    return {
      errors: errors,
      data: {
        sex: state.sex, age: age, weightKg: w, heightCm: h,
        pal: parseFloat($('activity').value), goal: $('goal').value, asian: $('asianCut').checked
      }
    };
  }

  /* ---------- render ---------- */
  function setText(id, v) { $(id).textContent = v; }

  function render(r, i) {
    $('resultsEmpty').classList.add('hidden');
    $('resultsBody').classList.remove('hidden');
    $('printBtn').classList.remove('hidden');

    setText('resKcal', fmt(r.target));
    setText('resBmr', fmt(r.bmr) + ' kcal');
    setText('resTdee', fmt(r.tdee) + ' kcal');
    var note = 'Maintenance level.';
    if (i.goal === 'lose' && r.adj < 0) note = 'About ' + fmt(Math.abs(r.adj)) + ' kcal below maintenance for gradual fat loss (roughly 0.25-0.5 kg per week).';
    if (i.goal === 'gain') note = '300 kcal above maintenance for a lean gain with resistance training.';
    setText('resGoalNote', note);

    setText('bmiVal', r.bmi);
    setText('bmiCat', r.bmiCat);
    setText('bmiRange', 'Healthy range for your height: ' + r.wLo + ' - ' + r.wHi + ' kg');
    var marker = clamp((r.bmi - 15) / (40 - 15), 0, 1) * 100;
    $('bmiMarker').style.left = marker + '%';

    setText('pGrams', r.proteinG + ' g'); setText('pPct', r.proteinPct + '%');
    setText('cGrams', r.carbG + ' g'); setText('cPct', r.carbPct + '%');
    setText('fGrams', r.fatG + ' g'); setText('fPct', r.fatPct + '%');
    setText('donutKcal', fmt(r.target));
    var pEnd = r.proteinPct, cEnd = r.proteinPct + r.carbPct;
    $('donut').style.background =
      'conic-gradient(var(--c-protein) 0 ' + pEnd + '%, var(--c-carb) ' + pEnd + '% ' + cEnd + '%, var(--c-fat) ' + cEnd + '% 100%)';

    setText('fiberVal', r.fiber + ' g');
    setText('waterVal', r.water.toFixed(1) + ' L');
    setText('sugarVal', r.sugarMax + ' g');
    setText('satVal', r.satMax + ' g');
    setText('weightRange', r.wLo + ' - ' + r.wHi + ' kg');
    setText('weightRangeNote', 'BMI ' + r.lo + ' - ' + r.hi);

    var wl = $('warnList');
    wl.innerHTML = '';
    r.warnings.forEach(function (w) {
      var li = document.createElement('li');
      li.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i><span></span>';
      li.lastChild.textContent = w;
      wl.appendChild(li);
    });
    wl.classList.toggle('hidden', r.warnings.length === 0);
  }

  function renderSpecial() {
    $('resultsEmpty').classList.remove('hidden');
    $('resultsBody').classList.add('hidden');
    $('printBtn').classList.add('hidden');
    $('resultsEmpty').innerHTML =
      '<div class="empty-icon">🩺</div><h3>Please get personalised advice</h3>' +
      '<p>Nutrition needs change during pregnancy, breastfeeding, childhood and with many medical conditions. A doctor or registered dietitian can give you safe targets. Standard equations on this page are not designed for these situations.</p>';
  }

  /* ---------- history ---------- */
  function renderHistory() {
    var list = loadHistory();
    var body = $('historyBody');
    body.innerHTML = '';
    $('historyEmpty').classList.toggle('hidden', list.length > 0);
    list.slice(-8).reverse().forEach(function (e) {
      var tr = document.createElement('tr');
      var d = new Date(e.t);
      var cells = [
        d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
        e.weight + ' kg', e.bmi, fmt(e.kcal), e.protein + ' / ' + e.carbs + ' / ' + e.fats
      ];
      cells.forEach(function (c) { var td = document.createElement('td'); td.textContent = c; tr.appendChild(td); });
      body.appendChild(tr);
    });
    renderSpark(list);
  }

  function renderSpark(list) {
    var svg = $('spark');
    svg.innerHTML = '';
    var pts = list.slice(-12);
    if (pts.length < 2) { $('sparkNote').textContent = 'Save at least two entries to see a trend.'; return; }
    var ws = pts.map(function (p) { return p.weight; });
    var min = Math.min.apply(null, ws), max = Math.max.apply(null, ws);
    var span = Math.max(max - min, 1);
    var coords = pts.map(function (p, idx) {
      var x = 10 + idx * (280 / (pts.length - 1));
      var y = 75 - ((p.weight - min) / span) * 60;
      return [x, y];
    });
    var line = coords.map(function (c) { return c[0].toFixed(1) + ',' + c[1].toFixed(1); }).join(' ');
    var ns = 'http://www.w3.org/2000/svg';
    var area = document.createElementNS(ns, 'polygon');
    area.setAttribute('points', '10,85 ' + line + ' 290,85');
    area.setAttribute('class', 'spark-area');
    var pl = document.createElementNS(ns, 'polyline');
    pl.setAttribute('points', line);
    pl.setAttribute('class', 'spark-line');
    svg.appendChild(area); svg.appendChild(pl);
    coords.forEach(function (c) {
      var dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', c[0]); dot.setAttribute('cy', c[1]); dot.setAttribute('r', 3);
      dot.setAttribute('class', 'spark-dot');
      svg.appendChild(dot);
    });
    var diff = round(ws[ws.length - 1] - ws[0], 1);
    $('sparkNote').textContent = (diff > 0 ? '+' : '') + diff + ' kg since your first of these ' + pts.length + ' entries.';
  }

  /* ---------- saving ---------- */
  async function persist(i, r) {
    var list = loadHistory();
    list.push({
      t: Date.now(), weight: round(i.weightKg, 1), height: round(i.heightCm, 1), bmi: r.bmi,
      kcal: r.target, protein: r.proteinG, carbs: r.carbG, fats: r.fatG, fiber: r.fiber,
      sex: i.sex, age: i.age, pal: i.pal, goal: i.goal
    });
    var localOk = saveHistory(list);
    renderHistory();

    var status = $('saveStatus');
    try {
      var res = await fetch('/auth/health-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: round(i.weightKg, 1), height: round(i.heightCm, 1),
          calories: r.target, protein: r.proteinG, fats: r.fatG, carbs: r.carbG, fiber: r.fiber,
          bmi: r.bmi, goal: i.goal
        })
      });
      if (res.ok) {
        status.textContent = 'Saved to your account.';
        toast('Targets calculated and saved to your account 💾');
        return;
      }
      throw new Error('bad status');
    } catch (err) {
      status.textContent = localOk ? 'Saved on this device only (could not reach your account).' : 'Calculated, but could not be saved.';
      toast(localOk ? 'Calculated and saved on this device.' : 'Calculated locally, but could not save.');
    }
  }

  /* ---------- events ---------- */
  document.querySelectorAll('#unitSeg .seg-btn').forEach(function (b) {
    b.addEventListener('click', function () { setUnit(b.dataset.unit); });
  });
  document.querySelectorAll('#sexSeg .seg-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      state.sex = b.dataset.sex;
      document.querySelectorAll('#sexSeg .seg-btn').forEach(function (x) { x.classList.toggle('active', x === b); });
    });
  });

  $('healthForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('formError');
    var inp = readInputs();

    if (inp.errors.length) { err.textContent = inp.errors[0]; return; }
    err.textContent = '';
    if (inp.special) { renderSpecial(); return; }

    // restore the empty-state markup if it was replaced
    var r = calculate(inp.data);
    render(r, inp.data);
    persist(inp.data, r);
    if (window.matchMedia('(max-width: 900px)').matches) {
      $('resultsBody').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  $('healthForm').addEventListener('reset', function () {
    $('formError').textContent = '';
    setTimeout(function () {
      state.sex = 'male';
      document.querySelectorAll('#sexSeg .seg-btn').forEach(function (x) { x.classList.toggle('active', x.dataset.sex === 'male'); });
    }, 0);
  });

  $('loadLast').addEventListener('click', function () {
    var list = loadHistory();
    if (!list.length) { toast('No saved entries yet.'); return; }
    var l = list[list.length - 1];
    if (state.unit !== 'metric') setUnit('metric');
    $('age').value = l.age; $('weight').value = l.weight; $('height').value = l.height;
    $('activity').value = String(l.pal); $('goal').value = l.goal;
    state.sex = l.sex;
    document.querySelectorAll('#sexSeg .seg-btn').forEach(function (x) { x.classList.toggle('active', x.dataset.sex === l.sex); });
    toast('Loaded your last entry.');
  });

  $('clearHistory').addEventListener('click', function () {
    if (!loadHistory().length) return;
    if (confirm('Delete all saved entries from this browser?')) {
      try { localStorage.removeItem(STORE_KEY); } catch (e) {}
      renderHistory();
      toast('History cleared.');
    }
  });

  $('printBtn').addEventListener('click', function () { window.print(); });

  var menu = $('menuToggle');
  if (menu) menu.addEventListener('click', function () { $('navLinks').classList.toggle('open'); });
  document.querySelectorAll('#navLinks a').forEach(function (a) {
    a.addEventListener('click', function () { $('navLinks').classList.remove('open'); });
  });

  $('year').textContent = new Date().getFullYear();
  renderHistory();
})();
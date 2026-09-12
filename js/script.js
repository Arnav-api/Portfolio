(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     File-name lookup (used for breadcrumb / tabs / palette)
  ========================================================= */
  var FILES = {
    home:         { name: 'home.md',          icon: 'md' },
    experience:   { name: 'experience.js',    icon: 'js' },
    projects:     { name: 'projects/',        icon: 'folder' },
    skills:       { name: 'skills.json',      icon: 'json' },
    education:    { name: 'education.yml',    icon: 'yml' },
    achievements: { name: 'achievements.log', icon: 'log' },
    contact:      { name: 'contact.sh',       icon: 'sh' }
  };

  var views = Array.prototype.slice.call(document.querySelectorAll('.view'));
  var fileButtons = Array.prototype.slice.call(document.querySelectorAll('.file'));
  var breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  var tabbar = document.getElementById('tabbar');
  var statusFile = document.getElementById('statusFile');
  var panelScroll = document.getElementById('panelScroll');

  var openTabs = ['home'];

  function renderTabs() {
    tabbar.innerHTML = '';
    openTabs.forEach(function (key) {
      var btn = document.createElement('button');
      btn.className = 'tab' + (key === currentView ? ' active' : '');
      btn.dataset.tab = key;
      btn.textContent = FILES[key].name;
      btn.addEventListener('click', function () { showView(key); });
      tabbar.appendChild(btn);
    });
  }

  var currentView = 'home';

  function showView(key, opts) {
    opts = opts || {};
    if (!FILES[key]) key = 'home';
    currentView = key;

    views.forEach(function (v) {
      v.classList.toggle('active', v.dataset.view === key);
    });

    fileButtons.forEach(function (b) {
      b.classList.toggle('active', b.dataset.target === key && !b.dataset.project);
    });

    breadcrumbCurrent.textContent = FILES[key].name;
    statusFile.textContent = FILES[key].name;

    if (openTabs.indexOf(key) === -1) openTabs.push(key);
    renderTabs();

    if (!opts.skipHash) {
      history.replaceState(null, '', '#' + key);
    }

    panelScroll.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });

    if (key === 'achievements') revealLog();
    closeExplorerMobile();

    if (opts.project) {
      var card = document.getElementById('project-' + opts.project);
      if (card) {
        setTimeout(function () {
          card.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
          card.classList.add('flash');
          setTimeout(function () { card.classList.remove('flash'); }, 900);
        }, 80);
      }
    }
  }

  fileButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      showView(btn.dataset.target, { project: btn.dataset.project });
    });
  });

  // Folder expand/collapse
  var projectsFolder = document.getElementById('projectsFolder');
  projectsFolder.addEventListener('click', function () {
    var expanded = projectsFolder.getAttribute('aria-expanded') === 'true';
    projectsFolder.setAttribute('aria-expanded', String(!expanded));
  });

  // Hash routing
  function routeFromHash() {
    var key = location.hash.replace('#', '');
    if (FILES[key]) showView(key, { skipHash: true });
  }
  window.addEventListener('hashchange', routeFromHash);
  if (location.hash) routeFromHash();

  // "Open contact.sh" button on hero
  document.querySelectorAll('[data-jump]').forEach(function (el) {
    el.addEventListener('click', function () { showView(el.dataset.jump); });
  });

  /* =========================================================
     Mobile explorer toggle
  ========================================================= */
  var explorer = document.getElementById('explorer');
  var menuToggle = document.getElementById('menuToggle');
  var scrim = document.getElementById('explorerScrim');

  function openExplorerMobile() {
    explorer.classList.add('open');
    scrim.classList.add('show');
    menuToggle.setAttribute('aria-expanded', 'true');
  }
  function closeExplorerMobile() {
    explorer.classList.remove('open');
    scrim.classList.remove('show');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  menuToggle.addEventListener('click', function () {
    explorer.classList.contains('open') ? closeExplorerMobile() : openExplorerMobile();
  });
  scrim.addEventListener('click', closeExplorerMobile);

  /* =========================================================
     Typing effect for the hero name
  ========================================================= */
  var typedNameEl = document.getElementById('typedName');
  var FULL_NAME = 'Arnav Khandelwal';
  if (reduceMotion) {
    typedNameEl.textContent = FULL_NAME;
  } else {
    var i = 0;
    (function typeStep() {
      typedNameEl.textContent = FULL_NAME.slice(0, i);
      i++;
      if (i <= FULL_NAME.length) {
        setTimeout(typeStep, 55);
      } else {
        typedNameEl.classList.add('done');
      }
    })();
  }

  /* =========================================================
     Animated stat counters (run once, on first view of home)
  ========================================================= */
  var countersRan = false;
  function runCounters() {
    if (countersRan) return;
    countersRan = true;
    document.querySelectorAll('.statcard-num').forEach(function (el) {
      var final = el.dataset.final ? parseFloat(el.dataset.final) : parseInt(el.dataset.count, 10);
      var isDecimal = !!el.dataset.final;
      if (reduceMotion) {
        el.textContent = isDecimal ? final.toFixed(2) : final;
        return;
      }
      var start = 0;
      var duration = 900;
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var val = start + (final - start) * eased;
        el.textContent = isDecimal ? val.toFixed(2) : Math.round(val);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  setTimeout(runCounters, 350);

  /* =========================================================
     Skill cross-filter: click a .tag to highlight matching
     bullets / project cards elsewhere on the page
  ========================================================= */
  var allTags = Array.prototype.slice.call(document.querySelectorAll('.tag[data-skill]'));
  var activeSkill = null;
  var skillsHint = document.getElementById('skillsHint');

  function normalizeSkill(s) { return s.trim().toLowerCase(); }

  function applySkillFilter(skill) {
    activeSkill = activeSkill === skill ? null : skill;

    allTags.forEach(function (t) {
      t.classList.toggle('tag--active', activeSkill && normalizeSkill(t.dataset.skill) === normalizeSkill(activeSkill));
    });

    var anyFilter = !!activeSkill;

    document.querySelectorAll('.tl-list li').forEach(function (li) {
      if (!anyFilter) { li.classList.remove('dimmed'); return; }
      var hasTag = li.querySelector('.tag[data-skill]');
      var matches = Array.prototype.some.call(li.querySelectorAll('.tag[data-skill]'), function (t) {
        return normalizeSkill(t.dataset.skill) === normalizeSkill(activeSkill);
      });
      li.classList.toggle('dimmed', !matches);
    });

    document.querySelectorAll('.project-card').forEach(function (card) {
      if (!anyFilter) { card.classList.remove('dimmed'); return; }
      var matches = Array.prototype.some.call(card.querySelectorAll('.tag[data-skill]'), function (t) {
        return normalizeSkill(t.dataset.skill) === normalizeSkill(activeSkill);
      });
      card.classList.toggle('dimmed', !matches);
    });

    if (skillsHint) {
      skillsHint.textContent = activeSkill
        ? 'Showing where "' + activeSkill + '" is used — in Experience and Projects. Click it again to clear.'
        : 'Select a skill above to filter matching experience and projects.';
    }
  }

  allTags.forEach(function (t) {
    t.addEventListener('click', function () { applySkillFilter(t.dataset.skill); });
  });

  /* =========================================================
     Achievements log — staggered reveal ("tail -f")
  ========================================================= */
  var logRevealed = false;
  function revealLog() {
    if (logRevealed) return;
    logRevealed = true;
    var lines = document.querySelectorAll('.logline');
    lines.forEach(function (line, idx) {
      if (reduceMotion) {
        line.classList.add('shown');
        return;
      }
      setTimeout(function () { line.classList.add('shown'); }, idx * 180);
    });
  }

  /* =========================================================
     Copy to clipboard
  ========================================================= */
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  document.querySelectorAll('[data-copy]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var value = el.dataset.copy;
      var done = function () { showToast('Copied "' + value + '" to clipboard'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done).catch(function () { fallbackCopy(value, done); });
      } else {
        fallbackCopy(value, done);
      }
    });
  });

  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); cb(); } catch (e) { showToast('Could not copy — please copy manually'); }
    document.body.removeChild(ta);
  }

  /* =========================================================
     Mini terminal in contact.sh
  ========================================================= */
  var terminalOutput = document.getElementById('terminalOutput');
  var terminalInput = document.getElementById('terminalInput');

  var LINKS = {
    github: 'https://github.com/Arnav-api',
    linkedin: 'https://www.linkedin.com/in/arnav-khandelwal-414546313/',
    leetcode: 'https://leetcode.com/u/Arnav1_Khandelwal0/'
  };

  function printLine(html, cls) {
    var p = document.createElement('p');
    if (cls) p.className = cls;
    p.innerHTML = html;
    terminalOutput.appendChild(p);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  var COMMANDS = {
    help: function () {
      printLine('Available commands:');
      printLine('&nbsp;&nbsp;<span class="tk-str">help</span> — list commands');
      printLine('&nbsp;&nbsp;<span class="tk-str">whoami</span> — who is this, anyway');
      printLine('&nbsp;&nbsp;<span class="tk-str">open github|linkedin|leetcode</span> — open a profile');
      printLine('&nbsp;&nbsp;<span class="tk-str">email</span> / <span class="tk-str">call</span> — copy contact details');
      printLine('&nbsp;&nbsp;<span class="tk-str">clear</span> — clear the screen');
    },
    whoami: function () {
      printLine('Arnav Khandelwal — Software Engineer. DSA, Django/DRF, computer vision & ML systems.', 'out-ok');
    },
    clear: function () { terminalOutput.innerHTML = ''; },
    email: function () {
      fallbackOrClipboard('aarnavlko@gmail.com');
      printLine('Copied <span class="tk-str">aarnavlko@gmail.com</span> to clipboard.', 'out-ok');
    },
    call: function () {
      fallbackOrClipboard('+91 9415111172');
      printLine('Copied <span class="tk-str">+91 9415111172</span> to clipboard.', 'out-ok');
    },
    'sudo make coffee': function () {
      printLine('sudo: sorry, this terminal is decaf-only. ☕', 'out-error');
    }
  };

  function fallbackOrClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
    }
  }

  function runCommand(raw) {
    var cmd = raw.trim();
    if (!cmd) return;
    printLine('<span class="prompt-sym">$</span> ' + escapeHtml(cmd));

    var lower = cmd.toLowerCase();
    if (COMMANDS[lower]) { COMMANDS[lower](); return; }

    var openMatch = lower.match(/^open\s+(github|linkedin|leetcode)$/);
    if (openMatch) {
      var url = LINKS[openMatch[1]];
      printLine('Opening <span class="tk-str">' + url + '</span> …', 'out-ok');
      window.open(url, '_blank', 'noopener');
      return;
    }

    printLine('command not found: ' + escapeHtml(cmd) + ' — try <span class="tk-str">help</span>', 'out-error');
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var val = terminalInput.value;
        terminalInput.value = '';
        runCommand(val);
      }
    });
  }

  /* =========================================================
     Command palette
  ========================================================= */
  var paletteOverlay = document.getElementById('paletteOverlay');
  var paletteInput = document.getElementById('paletteInput');
  var paletteList = document.getElementById('paletteList');
  var paletteTrigger = document.getElementById('paletteTrigger');

  var PALETTE_ITEMS = [
    { label: 'home.md', hint: 'Section', icon: 'md', action: function () { showView('home'); } },
    { label: 'experience.js', hint: 'Section', icon: 'js', action: function () { showView('experience'); } },
    { label: 'projects / ecommerce.py', hint: 'Project', icon: 'py', action: function () { showView('projects', { project: 'ecommerce' }); } },
    { label: 'projects / motogp.ipynb', hint: 'Project', icon: 'ipynb', action: function () { showView('projects', { project: 'motogp' }); } },
    { label: 'projects / ensemble.py', hint: 'Project', icon: 'py', action: function () { showView('projects', { project: 'ensemble' }); } },
    { label: 'projects / capstone.py', hint: 'Project', icon: 'py', action: function () { showView('projects', { project: 'capstone' }); } },
    { label: 'skills.json', hint: 'Section', icon: 'json', action: function () { showView('skills'); } },
    { label: 'education.yml', hint: 'Section', icon: 'yml', action: function () { showView('education'); } },
    { label: 'achievements.log', hint: 'Section', icon: 'log', action: function () { showView('achievements'); } },
    { label: 'contact.sh', hint: 'Section', icon: 'sh', action: function () { showView('contact'); } },
    { label: 'Open GitHub profile', hint: '↗ external', icon: 'gh', action: function () { window.open(LINKS.github, '_blank', 'noopener'); } },
    { label: 'Open LinkedIn profile', hint: '↗ external', icon: 'li', action: function () { window.open(LINKS.linkedin, '_blank', 'noopener'); } },
    { label: 'Open LeetCode profile', hint: '↗ external', icon: 'lc', action: function () { window.open(LINKS.leetcode, '_blank', 'noopener'); } },
    { label: 'Copy email address', hint: 'aarnavlko@gmail.com', icon: 'sh', action: function () { fallbackOrClipboard('aarnavlko@gmail.com'); showToast('Copied email to clipboard'); } }
  ];

  var paletteActiveIndex = 0;
  var paletteFiltered = PALETTE_ITEMS.slice();

  function renderPalette() {
    paletteList.innerHTML = '';
    if (!paletteFiltered.length) {
      var empty = document.createElement('li');
      empty.className = 'palette-empty';
      empty.textContent = 'No matches.';
      paletteList.appendChild(empty);
      return;
    }
    paletteFiltered.forEach(function (item, idx) {
      var li = document.createElement('li');
      li.className = 'palette-item' + (idx === paletteActiveIndex ? ' active' : '');
      li.innerHTML = '<span class="ficon ficon--' + item.icon + '"></span><span>' + item.label + '</span><span class="palette-item-meta">' + item.hint + '</span>';
      li.addEventListener('click', function () { runPaletteItem(item); });
      li.addEventListener('mousemove', function () { paletteActiveIndex = idx; renderPalette(); });
      paletteList.appendChild(li);
    });
  }

  function runPaletteItem(item) {
    item.action();
    closePalette();
  }

  function openPalette() {
    paletteOverlay.hidden = false;
    paletteInput.value = '';
    paletteFiltered = PALETTE_ITEMS.slice();
    paletteActiveIndex = 0;
    renderPalette();
    setTimeout(function () { paletteInput.focus(); }, 10);
  }
  function closePalette() {
    paletteOverlay.hidden = true;
    paletteTrigger.focus();
  }

  paletteTrigger.addEventListener('click', openPalette);
  paletteOverlay.addEventListener('click', function (e) {
    if (e.target === paletteOverlay) closePalette();
  });

  paletteInput.addEventListener('input', function () {
    var q = paletteInput.value.trim().toLowerCase();
    paletteFiltered = PALETTE_ITEMS.filter(function (item) {
      return item.label.toLowerCase().indexOf(q) !== -1 || item.hint.toLowerCase().indexOf(q) !== -1;
    });
    paletteActiveIndex = 0;
    renderPalette();
  });

  paletteInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); paletteActiveIndex = Math.min(paletteActiveIndex + 1, paletteFiltered.length - 1); renderPalette(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); paletteActiveIndex = Math.max(paletteActiveIndex - 1, 0); renderPalette(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (paletteFiltered[paletteActiveIndex]) runPaletteItem(paletteFiltered[paletteActiveIndex]); }
    else if (e.key === 'Escape') { closePalette(); }
  });

  document.addEventListener('keydown', function (e) {
    var isK = e.key === 'k' || e.key === 'K';
    if ((e.ctrlKey || e.metaKey) && isK) {
      e.preventDefault();
      paletteOverlay.hidden ? openPalette() : closePalette();
    }
    if (e.key === 'Escape' && !paletteOverlay.hidden) closePalette();
  });

  /* =========================================================
     Clock (Jaipur / IST-friendly local time)
  ========================================================= */
  var clockEl = document.getElementById('clock');
  function tickClock() {
    var d = new Date();
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    clockEl.textContent = hh + ':' + mm;
  }
  tickClock();
  setInterval(tickClock, 15000);

  /* =========================================================
     Optional live GitHub stat (fails silently — static hosting,
     no build step, no server. Purely a nice-to-have.)
  ========================================================= */
  var githubStat = document.getElementById('githubStat');
  fetch('https://api.github.com/users/Arnav-api')
    .then(function (r) { if (!r.ok) throw new Error('no'); return r.json(); })
    .then(function (data) {
      if (typeof data.public_repos === 'number') {
        githubStat.textContent = 'GitHub · ' + data.public_repos + ' public repos';
      }
    })
    .catch(function () { githubStat.textContent = 'GitHub · @Arnav-api'; });

})();

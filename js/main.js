/* 大雨・台風から命を守る 防災LP  —  外部ライブラリなし */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- 目次メニュー（スマホ・タブレット） ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var toc = document.getElementById('toc');
  var backdrop = document.getElementById('tocBackdrop');

  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.menu-label').textContent = open ? '閉じる' : '目次';
    toc.classList.toggle('is-open', open);
    backdrop.hidden = !open;
    if (open) {
      var first = toc.querySelector('a');
      if (first) first.focus();
    }
  }

  if (menuBtn && toc) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    backdrop.addEventListener('click', function () { setMenu(false); });
    toc.addEventListener('click', function (e) {
      if (e.target.closest('a') && menuBtn.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  /* ---------- 自宅周辺の危険チェック ---------- */
  var riskList = document.getElementById('riskChecklist');
  var result = document.getElementById('checkResult');
  var countEl = document.getElementById('checkCount');

  if (riskList && result && countEl) {
    riskList.addEventListener('change', function () {
      var n = riskList.querySelectorAll('input:checked').length;
      result.classList.toggle('is-hit', n > 0);
      countEl.hidden = n === 0;
      countEl.textContent = n + '個 当てはまりました';
    });
  }

  /* ---------- 家族で確認すること（この端末にだけ保存） ---------- */
  var STORE_KEY = 'bousai-lp-family-check';
  var familyList = document.getElementById('familyChecklist');

  function loadFamily() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveFamily(data) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) { /* 保存できない環境では何もしない */ }
  }

  if (familyList) {
    var saved = loadFamily();
    familyList.querySelectorAll('input[data-key]').forEach(function (input) {
      input.checked = !!saved[input.dataset.key];
    });
    familyList.addEventListener('change', function (e) {
      var input = e.target;
      if (!input.dataset || !input.dataset.key) return;
      var data = loadFamily();
      data[input.dataset.key] = input.checked;
      saveFamily(data);
    });
  }

  /* ---------- 共有（Web Share API → LINE / URLコピー） ---------- */
  var shareBtn = document.getElementById('shareBtn');
  var fallback = document.getElementById('shareFallback');
  var lineShare = document.getElementById('lineShare');
  var copyBtn = document.getElementById('copyBtn');
  var statusEl = document.getElementById('shareStatus');

  var shareUrl = location.href.split('#')[0];
  var shareTitle = 'その雨、大丈夫ですか？｜大雨・台風から命を守る';
  var shareText = '大雨・台風から自分と家族の命を守るためのポイントです。家族で一緒に確認しておこう。';

  function showStatus(msg) {
    statusEl.textContent = msg;
  }

  function showFallback() {
    fallback.hidden = false;
    lineShare.href = 'https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(shareUrl);
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var isWeb = /^https?:$/.test(location.protocol);
      if (navigator.share && isWeb) {
        navigator.share({ title: shareTitle, text: shareText, url: shareUrl })
          .then(function () { showStatus('共有しました。ありがとうございます。'); })
          .catch(function (err) {
            if (err && err.name === 'AbortError') return; // ユーザーが閉じた場合
            showFallback();
          });
      } else {
        showFallback();
        if (!isWeb) showStatus('公開後のURLで共有できます（ローカル表示中）');
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var done = function () { showStatus('URLをコピーしました。LINEやメールに貼り付けて送れます。'); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(shareUrl).then(done, legacyCopy);
      } else {
        legacyCopy();
      }
      function legacyCopy() {
        var ta = document.createElement('textarea');
        ta.value = shareUrl;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); }
        catch (e) { showStatus('コピーできませんでした。アドレスバーのURLをコピーしてください。'); }
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- ページ先頭へ戻るボタン ---------- */
  var toTop = document.getElementById('toTop');
  if (toTop) {
    var onScroll = function () { toTop.classList.toggle('is-show', window.scrollY > 600); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- スクロールでふわっと表示 ---------- */
  var targets = document.querySelectorAll(
    '.sec-title, .card, .check-item, .point-list li, .illust, .alert, .key-msg, .sign-grid li,' +
    '.step, .tool-card, .icon-grid li, .chip-grid li, .before-grid li, .lv-row, .promise-list li, .union-card, .danger-card, .mega-msg, .phone, .kiki-legend'
  );
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach(function (el) {
      el.classList.add('reveal');
      io.observe(el);
    });
  }
})();

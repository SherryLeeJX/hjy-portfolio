/* ============================================================
   黄嘉怡 · 作品集 —— 页面渲染 + 灯箱
   数据全部来自 data.js 的 SITE_DATA，file:// 协议可直接打开
   ============================================================ */
(function () {
  "use strict";
  var D = typeof SITE_DATA !== "undefined" ? SITE_DATA : null;
  if (!D) return;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ---------- 导航 / 页脚 ---------- */
  function buildChrome() {
    var page = document.body.getAttribute("data-page") || "";
    var nav = $(".nav .nav-links");
    if (nav) {
      var links = [{ key: "home", label: "关于我", href: "index.html" }].concat(
        D.modules.map(function (m) { return { key: m.key, label: m.title, href: m.key + ".html" }; })
      );
      nav.innerHTML = links.map(function (l) {
        return '<a href="' + l.href + '"' + (l.key === page ? ' aria-current="page"' : "") + ">" + esc(l.label) + "</a>";
      }).join("");
    }
    var foot = $("#footer-inner");
    if (foot) {
      foot.innerHTML =
        '<div><span class="name">' + esc(D.site.name) + '</span><span class="en">Interior &amp; Furniture Design</span></div>' +
        '<div class="meta">电话 ' + esc(D.site.phone) + ' · © 2026 作品集</div>';
    }
  }

  /* ---------- 瀑布流单项 ---------- */
  function figureHTML(it, idx) {
    var stage = it.stage ? '<span class="stage">' + esc(it.stage) + "</span>" : "";
    return (
      '<figure class="ph reveal" data-idx="' + idx + '">' +
      '<div class="frame">' +
      '<img src="' + esc(it.thumb) + '" alt="' + esc(it.caption) + '" width="' + it.w + '" height="' + it.h + '" loading="lazy" decoding="async">' +
      "</div>" +
      "<figcaption><span class=\"cap\">" + esc(it.caption) + "</span>" + stage + "</figcaption>" +
      "</figure>"
    );
  }

  /* ---------- 各页面渲染 ---------- */
  function renderHome() {
    var s = D.site;
    var hero = $("#hero");
    hero.innerHTML =
      '<div class="hero-text">' +
      '<p class="eyebrow">' + esc(s.eyebrow) + "</p>" +
      "<h1>" + esc(s.name) + "</h1>" +
      '<p class="role">' + esc(s.role) + "</p>" +
      '<p class="bio">' + esc(s.bio) + "</p>" +
      '<ul class="skills">' + s.skills.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") + "</ul>" +
      '<div class="hero-meta"><span><b>求职意向</b>　室内设计师 / 家具设计师</span>' +
      '<span><b>联系电话</b>　' + esc(s.phone) + "</span></div>" +
      '<div class="hero-actions"><a class="btn btn-solid" href="#works">浏览作品</a></div>' +
      "</div>" +
      '<figure class="hero-photo"><div class="mat">' +
      '<img src="' + esc(s.photo) + '" alt="' + esc(s.name) + ' 工作照" width="1200" height="1500" fetchpriority="high">' +
      "</div><figcaption>PORTFOLIO 2026</figcaption></figure>";

    var grid = $("#module-grid");
    grid.innerHTML = D.modules.map(function (m) {
      return (
        '<a class="m-card reveal" href="' + m.key + '.html">' +
        '<div class="cover"><img src="' + esc(m.cover) + '" alt="' + esc(m.title) + '" loading="lazy"></div>' +
        '<div class="row"><span class="no">' + m.no + "</span><h3>" + esc(m.title) + '</h3><span class="en">' + esc(m.en) + "</span></div>" +
        "<p>" + esc(m.desc) + " · 共 " + m.count + " 张</p>" +
        '<span class="go">查看模块</span>' +
        "</a>"
      );
    }).join("");
  }

  function renderRenders() {
    var g = D.galleries.renders;
    $("#page-title").textContent = g.title;
    $("#page-en").textContent = g.en;
    $("#page-sub").textContent = g.sub;
    $("#page-count").textContent = g.items.length + " 项作品";
    $("#gallery").innerHTML = g.items.map(figureHTML).join("");
  }

  function renderModel3d() {
    var g = D.galleries.model3d;
    var total = g.groups.reduce(function (n, x) { return n + x.items.length; }, 0);
    $("#page-title").textContent = g.title;
    $("#page-en").textContent = g.en;
    $("#page-sub").textContent = g.sub;
    $("#page-count").textContent = g.groups.length + " 组 · " + total + " 项作品";
    $("#gallery").innerHTML = g.groups.map(function (grp, gi) {
      return (
        '<section class="f-group">' +
        '<div class="f-head"><span class="no">' + String(gi + 1).padStart(2, "0") + "</span>" +
        "<h2>" + esc(grp.name) + '</h2><span class="sub">' + esc(grp.sub) + '</span><span class="rule"></span></div>' +
        '<div class="masonry cols-2" data-flat="1">' +
        grp.items.map(figureHTML).join("") +
        "</div></section>"
      );
    }).join("");
  }

  function renderDrawings() {
    var g = D.galleries.drawings;
    $("#page-title").textContent = g.title;
    $("#page-en").textContent = g.en;
    $("#page-sub").textContent = g.sub;
    $("#page-count").textContent = g.items.length + " 张图纸";
    $("#gallery").innerHTML =
      '<div class="dwg-grid">' +
      g.items.map(function (it, i) {
        return figureHTML(it, i).replace("</figcaption>", "</figcaption>");
      }).join("") +
      "</div>" +
      '<p class="dwg-foot">施工图均以 AutoCAD 绘制；灯箱内可查看大图，或点击「查看 PDF」获取原始文件。</p>';
    // 给施工图灯箱补充 PDF 链接（lightbox 渲染时读取 data-pdf）
    $("#gallery").querySelectorAll(".ph").forEach(function (el, i) {
      var pdf = g.items[i].pdf;
      if (pdf) el.setAttribute("data-pdf", pdf);
    });
  }

  /* ---------- 灯箱 ---------- */
  var lightbox = (function () {
    var box, img, cap, count, items = [], cur = 0;
    var links = [];

    function collect() {
      links = Array.prototype.slice.call(document.querySelectorAll(".ph"));
      links.forEach(function (el, i) {
        el.addEventListener("click", function () { open(i); });
      });
    }

    function flatItems() {
      // model3d 页面每个分组独立 masonry，但灯箱跨组连续浏览
      items = links.map(function (el) {
        var imgEl = el.querySelector("img");
        var thumb = imgEl ? imgEl.getAttribute("src") : "";
        var full = thumb.replace(/_t\.jpg$/, ".jpg");
        return {
          full: full,
          caption: el.querySelector(".cap") ? el.querySelector(".cap").textContent : "",
          pdf: el.getAttribute("data-pdf") || ""
        };
      });
    }

    function render() {
      var it = items[cur];
      img.src = it.full;
      img.alt = it.caption;
      cap.innerHTML = esc(it.caption) +
        (it.pdf ? ' <a href="' + esc(it.pdf) + '" target="_blank" rel="noopener">查看 PDF</a>' : "");
      count.textContent = (cur + 1) + " / " + items.length;
      // 预加载相邻大图
      [cur + 1, cur - 1].forEach(function (n) {
        if (items[n]) { var pre = new Image(); pre.src = items[n].full; }
      });
    }

    function open(i) {
      cur = i; render();
      box.classList.add("open");
      document.body.classList.add("lb-lock");
      $(".lb-close").focus();
    }
    function close() {
      box.classList.remove("open");
      document.body.classList.remove("lb-lock");
      img.src = "";
    }
    function step(d) {
      if (!items.length) return;
      cur = (cur + d + items.length) % items.length;
      render();
    }

    function init() {
      box = $("#lightbox");
      if (!box) return;
      img = $("#lb-img"); cap = $("#lb-caption"); count = $("#lb-count");
      $(".lb-close").addEventListener("click", close);
      $(".lb-prev").addEventListener("click", function () { step(-1); });
      $(".lb-next").addEventListener("click", function () { step(1); });
      box.addEventListener("click", function (e) {
        if (e.target === box || e.target.classList.contains("lb-stage")) close();
      });
      document.addEventListener("keydown", function (e) {
        if (!box.classList.contains("open")) return;
        if (e.key === "Escape") close();
        else if (e.key === "ArrowLeft") step(-1);
        else if (e.key === "ArrowRight") step(1);
      });
      collect();
      flatItems();
    }

    return { init: init };
  })();

  /* ---------- 瀑布流布局（网格跨度，保持行优先顺序） ---------- */
  var MASONRY_ROW = 8, MASONRY_GAP = 26, FRAME_EXTRA = 18; // 8px 内边距×2 + 1px 边框×2

  function layoutMasonry(grid) {
    var style = getComputedStyle(grid);
    var cols = style.gridTemplateColumns.split(" ").length;
    var colW = (grid.clientWidth - MASONRY_GAP * (cols - 1)) / cols;
    grid.querySelectorAll(".ph").forEach(function (fig) {
      var img = fig.querySelector("img");
      var cap = fig.querySelector("figcaption");
      if (!img || !cap) return;
      var frameH = colW * img.height / img.width + FRAME_EXTRA;
      var capH = cap.offsetHeight;
      var span = Math.max(1, Math.ceil((frameH + capH + MASONRY_GAP) / (MASONRY_ROW + MASONRY_GAP)));
      fig.style.gridRowEnd = "span " + span;
    });
  }

  var masonryTimer = null;
  function layoutAllMasonry() {
    document.querySelectorAll(".masonry").forEach(layoutMasonry);
  }
  window.addEventListener("resize", function () {
    clearTimeout(masonryTimer);
    masonryTimer = setTimeout(layoutAllMasonry, 120);
  });
  window.addEventListener("load", layoutAllMasonry);

  /* ---------- 入场动画 ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 启动 ---------- */
  function boot() {
    buildChrome();
    var page = document.body.getAttribute("data-page");
    if (page === "home") renderHome();
    else if (page === "renders") renderRenders();
    else if (page === "model3d") renderModel3d();
    else if (page === "drawings") renderDrawings();
    lightbox.init();
    layoutAllMasonry();
    initReveal();
  }
  // 脚本位于 </body> 前，DOM 已解析完毕，直接启动即可
  boot();
})();

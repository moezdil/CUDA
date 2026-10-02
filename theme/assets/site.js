// CUDA. Colour mode, page chrome, and the two diagrams lessons can drop in as tags:
//   <cuda-launch blocks="2" threads="64" fn="test01"></cuda-launch>
//   <sm-scheduler blocks="6" sms="3"></sm-scheduler>

// UI strings go through T (and F, which fills {0}, {1}... placeholders). window.I18N maps English to a translation.
function T(s){ var d = window.I18N; return (d && d[s]) || s; }
function F(s){ var a = arguments; return T(s).replace(/\{(\d)\}/g, function(m, i){ return a[+i + 1]; }); }

(function(){
  var KEY = "cuda-mode", btn = document.getElementById("mode-toggle");
  function apply(mode){
    if (mode === "light") { document.documentElement.setAttribute("data-mode", "light"); }
    else { document.documentElement.removeAttribute("data-mode"); }
    if (btn) {
      btn.innerHTML = mode === "light"
        ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
        : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
      btn.title = mode === "light" ? T("Dark mode") : T("Light mode");
    }
    try { localStorage.setItem(KEY, mode); } catch (e) {}
  }
  apply(document.documentElement.getAttribute("data-mode") === "light" ? "light" : "dark");
  if (btn) btn.addEventListener("click", function(){
    apply(document.documentElement.getAttribute("data-mode") === "light" ? "dark" : "light");
  });
})();

// Close the language menu on an outside click.
document.addEventListener("click", function(e){
  var m = document.querySelector("details.lang[open]");
  if (m && !m.contains(e.target)) { m.removeAttribute("open"); }
});

(function(){
  var nav = document.querySelector("nav");
  if (!nav) { return; }
  var bar = nav.appendChild(document.createElement("div")), queued = false;
  bar.className = "progress";
  function draw(){
    queued = false;
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? Math.min(1, scrollY / h) * 100 : 0) + "%";
  }
  addEventListener("scroll", function(){ if (!queued) { queued = true; requestAnimationFrame(draw); } }, { passive: true });
  draw();
})();

document.querySelectorAll(".prose .highlight:not(.language-text)").forEach(function(box){
  var b = box.appendChild(document.createElement("button"));
  b.type = "button"; b.className = "copy"; b.textContent = T("copy");
  b.addEventListener("click", function(){
    navigator.clipboard.writeText(box.querySelector("code").innerText).then(function(){
      b.textContent = T("copied");
      setTimeout(function(){ b.textContent = T("copy"); }, 1200);
    });
  });
});

document.querySelectorAll(".prose .language-text code").forEach(function(c){
  c.innerHTML = c.innerHTML.split("\n").map(function(l){
    return /^\s*\.\.\.\s*$/.test(l) ? '<span class="o-dim">' + l + "</span>"
      : l.replace(/(&lt;-.*)$/, '<span class="o-note">$1</span>').replace(/\b\d+\b(?![^<]*>)/g, function(n){ return /ID|Idx|Dim|warpSize/.test(l) ? '<span class="o-num">' + n + "</span>" : n; });
  }).join("\n");
});

document.querySelectorAll(".prose :not(pre) > code").forEach(function(c){ if (c.textContent.length < 30) { c.classList.add("nw"); } });

// The Glossary list at the end of a lesson becomes a grid of term cards.
document.querySelectorAll(".prose h2").forEach(function(h){
  var ul = h.nextElementSibling;
  if (h.textContent.trim() !== T("Glossary") || !ul || ul.tagName !== "UL") { return; }
  ul.className = "glossary";
  ul.querySelectorAll("li").forEach(function(li){
    var m = li.innerHTML.match(/: |：/);
    if (m && m.index > 0) { li.innerHTML = '<b class="g-term">' + li.innerHTML.slice(0, m.index) + "</b><span>" + li.innerHTML.slice(m.index + m[0].length) + "</span>"; }
  });
  glossaryRail(h, ul);
});

// Wide screens: a right rail shows the glossary terms of the section in view. Each term
// belongs to the first section (heading plus text, code blocks left out) that mentions it.
function glossaryRail(gh, ul){
  var doc = document.querySelector(".doc"), hs = [].slice.call(document.querySelectorAll(".prose h2"));
  if (!doc) { return; }
  var texts = hs.map(function(h){
    var s = h.textContent;
    for (var n = h.nextElementSibling; n && n.tagName !== "H2"; n = n.nextElementSibling) {
      if (n.tagName === "PRE" || n.classList.contains("highlight")) { continue; }
      var c = n.cloneNode(true);
      c.querySelectorAll("pre,.highlight").forEach(function(x){ x.remove(); });
      s += "\n" + c.textContent;
    }
    return h === gh ? "" : s;
  });
  var groups = hs.map(function(){ return []; }), found = false, tr = document.documentElement.lang === "tr";
  ul.querySelectorAll("li").forEach(function(li){
    var g = li.querySelector(".g-term");
    if (!g) { return; }
    var t = g.textContent, paren = t.match(/[（(]([^,，)）]+)/);
    var name = t.split(/\s*[（(]/)[0].trim();
    var words = [name].concat(name.split(" / "), [].map.call(g.querySelectorAll("code"), function(c){ return c.textContent.trim(); }), paren ? [paren[1].trim()] : []);
    var res = words.filter(Boolean).map(function(w){
      return new RegExp("(?<![A-Za-z0-9_])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + (/[A-Za-z0-9]$/.test(w) && !(tr && w.length > 3) ? "(?:e?s)?(?![A-Za-z0-9_])" : ""), "i");
    });
    // the section that first mentions a term lists it first; later sections that use it list it again below
    var first = true;
    for (var k = 0; k < texts.length; k++) {
      if (res.some(function(r){ return r.test(texts[k]); })) { groups[k].push({ h: li.innerHTML, first: first }); first = false; found = true; }
    }
  });
  groups = groups.map(function(g){
    return g.filter(function(x){ return x.first; }).concat(g.filter(function(x){ return !x.first; })).slice(0, 7);
  });
  if (!found) { return; }
  var rail = doc.appendChild(document.createElement("aside")), cur = -2, queued = false;
  rail.className = "rail";
  rail.setAttribute("aria-label", T("Terms in this section"));
  rail.innerHTML = '<div class="rail-in" hidden><b class="rail-h">' + T("In this section") + '</b><p class="rail-s"></p><ul></ul></div>';
  var box = rail.firstChild;
  function draw(){
    queued = false;
    var k = -1;
    hs.forEach(function(h, i){ if (h.getBoundingClientRect().top < innerHeight * 0.3) { k = i; } });
    if (k === cur) { return; }
    cur = k;
    var list = k < 0 ? [] : groups[k];
    box.hidden = !list.length;
    if (!list.length) { return; }
    box.querySelector(".rail-s").textContent = hs[k].textContent.replace(/¶$/, "").trim();
    box.querySelector("ul").innerHTML = list.map(function(x, i){ return "<li" + (x.first ? "" : ' class="again"') + ' style="--i:' + i + '">' + x.h + "</li>"; }).join("");
  }
  function ask(){ if (!queued) { queued = true; requestAnimationFrame(draw); } }
  addEventListener("scroll", ask, { passive: true });
  addEventListener("resize", ask);
  addEventListener("load", ask);
  draw();
}

// GitHub alert syntax (> [!NOTE], > [!TIP], > [!WARNING]) becomes titled callouts.
// Markdown merges back-to-back quotes, so each marked paragraph starts its own box.
document.querySelectorAll(".prose blockquote").forEach(function(q){
  var cur = null, names = { NOTE: T("Note"), TIP: T("Hint"), WARNING: T("Watch out") };
  [].slice.call(q.children).forEach(function(k){
    var m = k.tagName === "P" && k.innerHTML.match(/^\s*\[!(NOTE|TIP|WARNING)\]\s*(<br>)?\s*/);
    if (m) {
      cur = document.createElement("blockquote");
      cur.className = "callout " + m[1].toLowerCase();
      cur.innerHTML = '<b class="callout-t">' + names[m[1]] + "</b>";
      k.innerHTML = k.innerHTML.slice(m[0].length);
      q.parentNode.insertBefore(cur, q);
    }
    if (cur) { cur.appendChild(k); }
  });
  if (cur && !q.children.length) { q.remove(); }
});

// Every block is drawn as rows of 32 lanes, one row per warp, so a launch that
// is not a multiple of 32 shows the lanes the hardware still pays for.
var STEPS = [1, 2, 4, 8, 16, 32, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024, 1536, 2048];
customElements.define("cuda-launch", class extends HTMLElement {
  connectedCallback(){
    if (this.ready) { return; }
    this.ready = true;
    var el = this, fn = el.getAttribute("fn") || "kernel";
    var B = +el.getAttribute("blocks") || 1, N = +el.getAttribute("threads") || 1;
    var steps = STEPS.indexOf(N) < 0 ? STEPS.concat(N).sort(function(a, b){ return a - b; }) : STEPS;
    el.classList.add("dg");
    el.innerHTML =
      '<div class="dg-head"><code class="dg-call"></code><div class="dg-ctl">' +
      '<label>' + T("blocks") + ' <input type="range" min="1" max="8" value="' + B + '"></label>' +
      '<label>' + T("threads / block") + ' <input type="range" min="0" max="' + (steps.length - 1) + '" value="' + steps.indexOf(N) + '"></label>' +
      '<button class="dg-btn" type="button">' + T("run") + '</button></div></div><div class="dg-stats"></div><div class="dg-grid"></div>' +
      '<div class="dg-legend"><span><i style="background:var(--accent)"></i><i style="background:var(--cool)"></i><i style="background:var(--y)"></i><i style="background:var(--v)"></i>' + T("warps 0 1 2 3, repeating") + '</span><span><i style="background:var(--border)"></i>' + T("idle lane") + '</span><span>' + T("one row = one warp = 32 lanes") + '</span></div>' +
      '<div class="dg-read"></div>';
    var ins = el.querySelectorAll("input"), grid = el.querySelector(".dg-grid"), read = el.querySelector(".dg-read");
    var idle = T("Hover or tap a lane to see the IDs that thread reads.");

    function draw(){
      B = +ins[0].value; N = steps[+ins[1].value];
      var W = Math.ceil(N / 32);
      el.querySelector(".dg-call").innerHTML = '<span class="fn">' + fn + '</span>&lt;&lt;&lt;<span class="n">' + B +
        '</span>, <span class="n">' + N + '</span>&gt;&gt;&gt;();';
      el.querySelector(".dg-stats").innerHTML = N > 1024 ? "<span>gridDim.x <b>" + B + "</b></span><span>blockDim.x <b>" + N + "</b></span>" :
        "<span>gridDim.x <b>" + B + "</b></span><span>blockDim.x <b>" + N + "</b></span><span>" + T("threads") + " <b>" + B * N +
        "</b></span><span>" + T("warps") + " <b>" + B * W + "</b></span><span>" + T("idle lanes") + " <b>" + B * (W * 32 - N) + "</b></span>";
      read.innerHTML = idle;
      if (N > 1024) {
        grid.innerHTML = '<div class="dg-err"><b>' + T("launch dropped.") + '</b> ' + F("{0} threads per block is over the 1024 limit.", N) + " " +
          T("It compiles, then the driver rejects it at runtime. No output, no crash. <code>cudaGetLastError()</code> returns <code>cudaErrorInvalidConfiguration</code>.") + "</div>";
        return;
      }
      var html = "";
      for (var b = 0; b < B; b++) {
        html += '<div class="dg-block"><div class="dg-bh"><b>' + F("block {0}", b) + '</b><span>blockIdx.x = ' + b + '</span></div><div class="dg-cells" data-b="' + b + '">';
        for (var t = 0; t < W * 32; t++) {
          html += t < N ? '<i class="a w' + ((t >> 5) & 3) + '" data-t="' + t + '"></i>' : '<i data-t="' + t + '"></i>';
        }
        html += "</div></div>";
      }
      grid.innerHTML = html;
    }
    function clear(){
      el.querySelectorAll(".same").forEach(function(c){ c.classList.remove("same"); });
      el.querySelectorAll(".mate,.hot").forEach(function(c){ c.classList.remove("mate", "hot"); });
    }
    function point(e){
      var cell = e.target.closest("i[data-t]");
      if (!cell) { return; }
      clear();
      var cells = cell.parentNode, b = +cells.dataset.b, t = +cell.dataset.t, w = t >> 5, l = t & 31;
      cells.classList.add("same");
      for (var k = w * 32; k < w * 32 + 32; k++) { cells.children[k].classList.add("mate"); }
      cell.classList.add("hot");
      read.innerHTML = t >= N
        ? F("block <b>{0}</b> · warp <b>{1}</b> · lane <b>{2}</b> is <em>idle</em>. The warp is scheduled as 32 lanes, but only {3} of them have a thread.", b, w, l, N - w * 32)
        : F("blockIdx.x <b>{0}</b> · threadIdx.x <b>{1}</b> · warp <b>{1} / 32 = {2}</b> · lane <b>{1} % 32 = {3}</b>", b, t, w, l) + "<br>" +
          F("global id = blockIdx.x × blockDim.x + threadIdx.x = {0} × {1} + {2} = <em>{3}</em>", b, N, t, b * N + t);
    }
    grid.addEventListener("mouseover", point);
    grid.addEventListener("click", point);
    grid.addEventListener("mouseleave", function(){ clear(); read.innerHTML = idle; });
    var timer = 0, btn = el.querySelector(".dg-btn");
    // Warps light up one at a time: all 32 lanes of a warp run together, blocks take turns in any order.
    btn.addEventListener("click", function(){
      clearInterval(timer);
      var rows = [];
      el.querySelectorAll(".dg-cells").forEach(function(cells){
        cells.querySelectorAll("i.ran").forEach(function(c){ c.classList.remove("ran"); });
        for (var w = 0; w < cells.children.length / 32; w++) { rows.push([cells, w]); }
      });
      if (!rows.length) { return; }
      rows.sort(function(){ return Math.random() - .5; });
      grid.classList.add("running");
      var i = 0, step = Math.max(12, 2400 / rows.length);
      timer = setInterval(function(){
        var r = rows[i++];
        for (var k = r[1] * 32; k < r[1] * 32 + 32; k++) { r[0].children[k].classList.add("ran"); }
        read.innerHTML = F("block <b>{0}</b> · warp <b>{1}</b> runs. All 32 lanes of a warp run together.", r[0].dataset.b, r[1]);
        if (i === rows.length) { clearInterval(timer); setTimeout(function(){ grid.classList.remove("running"); read.innerHTML = idle; }, 900); }
      }, step);
    });
    ins.forEach(function(i){ i.addEventListener("input", function(){ clearInterval(timer); grid.classList.remove("running"); draw(); }); });
    draw();
  }
});

// Blocks wait in a queue and each SM takes the next one when it is free. Run
// times are random, so the order blocks finish in changes from run to run.
customElements.define("sm-scheduler", class extends HTMLElement {
  connectedCallback(){
    if (this.ready) { return; }
    this.ready = true;
    var el = this, N = +el.getAttribute("blocks") || 4, S = +el.getAttribute("sms") || 2, runs = 0;
    var sms = "";
    for (var s = 0; s < S; s++) { sms += '<div class="dg-sm"><span>SM ' + s + '</span></div>'; }
    el.classList.add("dg");
    el.innerHTML = '<div class="dg-head"><code class="dg-call">' + F("{0} blocks → {1} SMs", N, S) + '</code>' +
      '<button class="dg-btn" type="button">' + T("launch") + '</button></div><div class="dg-sched"><div class="dg-queue"></div>' +
      '<div class="dg-sms">' + sms + '</div><div class="dg-out">' + T("Press launch. Each line is a block finishing and flushing its output.") + '</div></div>';
    var btn = el.querySelector(".dg-btn"), queue = el.querySelector(".dg-queue"), out = el.querySelector(".dg-out");
    var slots = el.querySelectorAll(".dg-sm");

    btn.addEventListener("click", function(){
      runs++;
      btn.disabled = true;
      out.innerHTML = F("run {0}", runs) + "<br>";
      queue.innerHTML = "";
      for (var b = 0; b < N; b++) {
        var c = queue.appendChild(document.createElement("span"));
        c.className = "dg-chip"; c.dataset.b = b; c.textContent = F("block {0}", b);
      }
      var left = N;
      function feed(s){
        var c = queue.firstChild;
        if (!c) { return; }
        slots[s].appendChild(c);
        var d = 600 + Math.random() * 1600;
        c.style.setProperty("--d", d + "ms");
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ c.style.setProperty("--p", "100%"); }); });
        setTimeout(function(){
          c.remove();
          out.innerHTML += F("<b>block {0}</b> done on SM {1}", c.dataset.b, s) + "<br>";
          if (--left === 0) { btn.disabled = false; btn.textContent = T("run again"); }
          feed(s);
        }, d);
      }
      for (var s = 0; s < S; s++) { setTimeout(feed.bind(null, s), Math.random() * 350); }
    });
  }
});

// Grid, blocks, (warps) and threads as nested boxes. Click a level on the right to highlight it.
customElements.define("cuda-hierarchy", class extends HTMLElement {
  connectedCallback(){
    if (this.ready) { return; }
    this.ready = true;
    var el = this, warps = this.hasAttribute("warps");
    var levels = [["grid", T("Grid"), T("All blocks of one kernel launch.")], ["block", T("Block"), T("A group of threads on one SM. They can share memory.")]]
      .concat(warps ? [["warp", T("Warp"), T("32 threads that always run together.")]] : [])
      .concat([["thread", T("Thread"), T("Runs one copy of the kernel.")]]);
    var blocks = "";
    for (var b = 0; b < 3; b++) {
      var inner = "";
      if (warps) {
        for (var w = 0; w < 2; w++) {
          var dots = ""; for (var t = 0; t < 32; t++) { dots += "<i></i>"; }
          inner += '<div class="hw"><span>' + F("warp {0}", w) + '</span><div class="dots" style="--d:' + (b * 2 + w) * .45 + 's">' + dots + "</div></div>";
        }
      } else {
        for (var t = 0; t < 3; t++) { inner += '<div class="ht">' + F("thread {0}", t) + "</div>"; }
        inner += '<div class="ht more">…</div>';
      }
      blocks += '<div class="hb"><span>' + F("block {0}", b) + "</span>" + inner + "</div>";
    }
    el.classList.add("dg");
    el.innerHTML = '<div class="dg-hier"><div class="hg"><span>' + T("grid · one kernel launch") + '</span><div class="hbs">' + blocks + "</div></div>" +
      '<div class="hl">' + levels.map(function(l){ return '<button type="button" data-k="' + l[0] + '"><b>' + l[1] + "</b><small>" + l[2] + "</small></button>"; }).join("") + "</div></div>";
    el.querySelector(".hl").addEventListener("click", function(e){
      var b = e.target.closest("button");
      if (!b) { return; }
      var on = !b.classList.contains("on");
      el.querySelectorAll(".hl button").forEach(function(x){ x.classList.remove("on"); });
      el.querySelector(".dg-hier").dataset.focus = on ? b.dataset.k : "";
      if (on) { b.classList.add("on"); }
    });
  }
});

// Compute capability across data center generations: what grew and what stayed the same.
customElements.define("cc-progress", class extends HTMLElement {
  connectedCallback(){
    if (this.ready) { return; }
    this.ready = true;
    var gens = [["Pascal", "6.0", 64, 64], ["Volta", "7.0", 64, 96], ["Ampere", "8.0", 64, 164], ["Hopper", "9.0", 128, 228], ["Blackwell", "10.0", 128, 228]];
    var same = [T("32 threads per warp"), T("64 warps per SM"), T("2048 threads per SM"), T("65,536 registers per SM"), T("1024 threads per block")];
    this.classList.add("dg");
    this.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Compute capability over time") + '</span><span class="dg-note">' + T("data center GPUs, per SM") + '</span></div>' +
      '<div class="dg-ccp">' + gens.map(function(g){
        return '<div><b>' + g[0] + '</b><span class="cc">CC ' + g[1] + "</span>" +
          '<div class="bar"><small>' + T("FP32 cores") + '</small><i style="--w:' + (g[2] / 128 * 100) + '%"></i><em>' + g[2] + "</em></div>" +
          '<div class="bar sm"><small>' + T("shared memory") + '</small><i style="--w:' + (g[3] / 228 * 100) + '%"></i><em>' + g[3] + " KB</em></div></div>";
      }).join("") + '</div><div class="dg-title sub">' + T("Did not change since CC 6.0") + '</div><div class="dg-facts">' +
      same.map(function(x){ return "<span>" + x + "</span>"; }).join("") + "</div>" +
      '<p class="dg-note">' + T("These hold for the x.0 chips above. CC 8.6, 8.9 (the L40S in these lessons) and 12.0 allow only 48 warps and 1536 threads per SM.") + "</p>";
  }
});

// The CPU does not wait for a kernel. Without cudaDeviceSynchronize() the program can end before the GPU prints.
customElements.define("kernel-sync", class extends HTMLElement {
  connectedCallback(){
    if (this.ready) { return; }
    this.ready = true;
    var el = this, cmd = el.getAttribute("cmd") || "./first_kernel", out = (el.getAttribute("out") || "Block ID: 0  ===  Thread ID: 0").split("|");
    var sync = 0, timers = [];
    el.classList.add("dg");
    el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Who waits for whom?") + '</span><div class="dg-tabs"><button type="button" data-i="0" class="on">' + T("without sync") + '</button><button type="button" data-i="1">' + T("with cudaDeviceSynchronize()") + '</button></div></div>' +
      '<div class="dg-sync"></div><div class="dg-term"></div><div class="dg-head"><button class="dg-btn" type="button">' + T("run") + '</button><span class="dg-note"></span></div>';
    var lanes = el.querySelector(".dg-sync"), term = el.querySelector(".dg-term"), note = el.querySelector(".dg-note");
    function steps(){
      return sync
        ? [["cpu", T("launch kernel")], ["gpu", T("kernel starts")], ["cpu", T("cudaDeviceSynchronize() waits"), "wait"], ["gpu", T("threads call printf")], ["gpu", T("kernel ends, output flushed")], ["out"], ["cpu", "return 0"]]
        : [["cpu", T("launch kernel")], ["gpu", T("kernel starts")], ["cpu", T("return 0, program ends")], ["gpu", T("cut off before printing"), "dead"]];
    }
    function reset(){
      timers.forEach(clearTimeout); timers = [];
      var st = steps();
      lanes.innerHTML = ["cpu", "gpu"].map(function(l){
        return '<div><span>' + l.toUpperCase() + '</span>' + st.map(function(x, i){ return x[0] === l ? '<i data-i="' + i + '" class="' + (x[2] || "") + '">' + x[1] + "</i>" : ""; }).join("") + "</div>";
      }).join("");
      term.innerHTML = "$ " + cmd;
      note.textContent = "";
    }
    function run(){
      reset();
      steps().forEach(function(x, i){
        timers.push(setTimeout(function(){
          var seg = lanes.querySelector('[data-i="' + i + '"]');
          if (seg) { seg.classList.add("on"); }
          if (x[0] === "out") { term.innerHTML += out.map(function(l){ return "<br>" + l; }).join(""); }
        }, 250 + i * 650));
      });
      timers.push(setTimeout(function(){
        term.innerHTML += "<br>$";
        note.textContent = sync ? T("The CPU waited, so every line arrived.") : T("The CPU did not wait. The program ended before the GPU could print.");
      }, 400 + steps().length * 650));
    }
    el.querySelectorAll(".dg-tabs button").forEach(function(b){
      b.addEventListener("click", function(){
        el.querySelectorAll(".dg-tabs button").forEach(function(x){ x.classList.toggle("on", x === b); });
        sync = +b.dataset.i; run();
      });
    });
    el.querySelector(".dg-btn").addEventListener("click", run);
    reset();
  }
});

// Each thread writes its line into a buffer when it finishes. The buffer prints in that order, which changes every run.
customElements.define("printf-order", class extends HTMLElement {
  connectedCallback(){
    if (this.ready) { return; }
    this.ready = true;
    var el = this, N = +el.getAttribute("threads") || 4, runs = 0;
    el.classList.add("dg");
    var th = "";
    for (var t = 0; t < N; t++) { th += '<span class="dg-chip" data-t="' + t + '">' + F("thread {0}", t) + "</span>"; }
    el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("printf order is not fixed") + '</span><button class="dg-btn" type="button">' + T("run") + '</button></div>' +
      '<div class="dg-pf"><div><span class="dg-lbl">' + T("threads") + '</span><div class="th">' + th + '</div></div><div><span class="dg-lbl">' + T("printf buffer") + '</span><div class="buf"></div></div></div>' +
      '<div class="dg-term">$ ./first_kernel</div>';
    var btn = el.querySelector(".dg-btn"), buf = el.querySelector(".buf"), term = el.querySelector(".dg-term");
    btn.addEventListener("click", function(){
      runs++; btn.disabled = true; buf.innerHTML = ""; term.innerHTML = "$ ./first_kernel";
      el.querySelectorAll(".th .dg-chip").forEach(function(c){ c.classList.remove("done"); });
      var order = [];
      for (var t = 0; t < N; t++) { order.push(t); }
      order.sort(function(){ return Math.random() - .5; });
      order.forEach(function(t, i){
        setTimeout(function(){
          el.querySelector('.th [data-t="' + t + '"]').classList.add("done");
          buf.innerHTML += "<div>Thread ID: " + t + "</div>";
        }, 300 + i * 450);
      });
      setTimeout(function(){
        term.innerHTML += order.map(function(t){ return "<br>Block ID: 0  ===  Thread ID: " + t; }).join("") + "<br>$ <span class='dg-note'>" + F("run {0}, order {1}", runs, order.join(" ")) + "</span>";
        btn.disabled = false; btn.textContent = T("run again");
      }, 500 + N * 450);
    });
  }
});

// The CUDA track diagrams below share this: a tag that builds itself once, and segmented tabs.
var CALM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
function cuda(name, build){
  customElements.define(name, class extends HTMLElement {
    connectedCallback(){
      if (this.ready) { return; }
      this.ready = true;
      this.classList.add("dg");
      this.setAttribute("role", "group");
      build(this);
    }
  });
}
function segs(items, on, label){
  return '<div class="dg-tabs" role="group" aria-label="' + label + '">' + items.map(function(t, i){
    return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === on) + '"' + (i === on ? ' class="on"' : "") + ">" + t + "</button>";
  }).join("") + "</div>";
}
function segOn(box, i){
  box.querySelectorAll("button").forEach(function(x, k){ x.classList.toggle("on", k === i); x.setAttribute("aria-pressed", k === i); });
}
function onSegs(box, fn){
  box.addEventListener("click", function(e){
    var b = e.target.closest("button[data-i]");
    if (b) { segOn(box, +b.dataset.i); fn(+b.dataset.i); }
  });
}
function term(label, v, cls){ return '<span class="' + cls + '"><small>' + label + "</small><b>" + v + "</b></span>"; }

// Blocks of threads above, the same threads as one flat row of global IDs below. Pick a thread to see the formula with its numbers.
cuda("global-id", function(el){
  var sel = [2, 3], timer = 0;
  el.setAttribute("aria-label", T("Global thread ID"));
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Global thread ID") + '</span><div class="dg-ctl">' +
    '<label>' + T("blocks") + ' <b class="nb"></b><input type="range" min="1" max="4" value="3" aria-label="' + T("blocks") + '"></label>' +
    '<label>' + T("threads / block") + ' <b class="nt"></b><input type="range" min="1" max="8" value="4" aria-label="' + T("threads / block") + '"></label>' +
    '<button class="dg-btn" type="button">' + T("play") + '</button></div></div>' +
    '<code class="dg-call"></code><div class="gi-grid"></div>' +
    '<span class="dg-lbl">' + T("the same threads as one flat row of global IDs") + '</span><div class="gi-flat"></div>' +
    '<div class="dg-eq" aria-live="polite"></div><div class="dg-info"></div>';
  var ins = el.querySelectorAll("input"), grid = el.querySelector(".gi-grid"), flat = el.querySelector(".gi-flat"), btn = el.querySelector(".dg-btn"), B, N;
  function draw(){
    B = +ins[0].value; N = +ins[1].value;
    el.querySelector(".nb").textContent = B; el.querySelector(".nt").textContent = N;
    sel = [Math.min(sel[0], B - 1), Math.min(sel[1], N - 1)];
    el.querySelector(".dg-call").innerHTML = '<span class="fn">kernel</span>&lt;&lt;&lt;<span class="n">' + B + '</span>, <span class="n">' + N + '</span>&gt;&gt;&gt;();';
    var g = "", f = "";
    for (var b = 0; b < B; b++) {
      g += '<div class="gi-blk c' + b + '"><div class="dg-bh"><b>' + F("block {0}", b) + "</b><span>blockIdx.x = " + b + '</span></div><div class="gi-th">';
      for (var t = 0; t < N; t++) {
        g += '<button type="button" data-b="' + b + '" data-t="' + t + '" aria-label="' + F("block {0}, thread {1}", b, t) + '">' + t + "</button>";
        f += '<button type="button" class="c' + b + '" data-b="' + b + '" data-t="' + t + '" aria-label="' + F("global ID {0}", b * N + t) + '">' + (b * N + t) + "</button>";
      }
      g += "</div></div>";
    }
    grid.innerHTML = g; flat.innerHTML = f;
    show();
  }
  function show(){
    var b = sel[0], t = sel[1], id = b * N + t;
    el.querySelectorAll("[data-t]").forEach(function(c){
      c.classList.toggle("hot", +c.dataset.b === b && +c.dataset.t === t);
      c.classList.toggle("mine", +c.dataset.b === b);
    });
    el.querySelector(".dg-eq").innerHTML = term("blockIdx.x", b, "e1") + "<i>×</i>" + term("blockDim.x", N, "e2") + "<i>+</i>" + term("threadIdx.x", t, "e3") + "<i>=</i>" + term(T("global ID"), id, "e4");
    el.querySelector(".dg-info").innerHTML = F("Block {0} starts at global ID {0} × {1} = <b>{2}</b>. Thread {3} is {3} places further, so its global ID is {2} + {3} = <em>{4}</em>.", b, N, b * N, t, id);
  }
  function stop(){ clearInterval(timer); timer = 0; btn.textContent = T("play"); }
  function choose(e){
    var c = e.target.closest("[data-t]");
    if (!c || (sel[0] === +c.dataset.b && sel[1] === +c.dataset.t)) { return; }
    if (e.type === "click") { stop(); }
    sel = [+c.dataset.b, +c.dataset.t]; show();
  }
  ["click", "mouseover", "focusin"].forEach(function(k){ grid.addEventListener(k, choose); flat.addEventListener(k, choose); });
  btn.addEventListener("click", function(){
    if (timer) { stop(); return; }
    var id = 0;
    btn.textContent = T("stop");
    function tick(){ sel = [Math.floor(id / N), id % N]; show(); if (++id >= B * N) { stop(); } }
    tick();
    if (id < B * N) { timer = setInterval(tick, 700); }
  });
  ins.forEach(function(i){ i.addEventListener("input", function(){ stop(); draw(); }); });
  draw();
});

// Type a launch configuration and check it against the hardware limits, row by row.
cuda("block-limits", function(el){
  var presets = [[[256, 1, 1], [4, 1, 1]], [[16, 16, 1], [8, 8, 1]], [[32, 32, 2], [1, 1, 1]], [[8, 8, 128], [2, 1, 1]], [[2048, 1, 1], [1, 1, 1]], [[32, 1, 1], [1, 70000, 1]]];
  function box(name, sub, k){
    return '<fieldset><legend><code>' + name + "</code> " + sub + "</legend>" + ["x", "y", "z"].map(function(a, i){
      return '<label>' + a + ' <input type="number" min="1" step="1" inputmode="numeric" data-k2="' + (k * 3 + i) + '" aria-label="' + name + "." + a + '"></label>';
    }).join("") + "</fieldset>";
  }
  el.setAttribute("aria-label", T("Is this launch valid?"));
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Is this launch valid?") + '</span><span class="dg-note">' + T("try a preset or type your own numbers") + '</span></div>' +
    segs(presets.map(function(p){ return "&lt;&lt;&lt;(" + p[1].join(",") + "), (" + p[0].join(",") + ")&gt;&gt;&gt;"; }), 0, T("presets")) +
    '<div class="bl-in">' + box("blockDim", T("threads per block"), 0) + box("gridDim", T("blocks in the grid"), 1) + "</div>" +
    '<code class="bl-code"></code><div class="bl-meter"><div class="bar"><i></i></div><span></span></div><ul class="bl-checks"></ul><div class="dg-info" aria-live="polite"></div>';
  var ins = el.querySelectorAll("input"), tb = el.querySelector(".dg-tabs");
  var LIM = [[0, 1024, "1024"], [1, 1024, "1024"], [2, 64, "64"], [3, 2147483647, "2^31 - 1"], [4, 65535, "65535"], [5, 65535, "65535"]];
  function draw(){
    var v = [].map.call(ins, function(i){ return Math.max(1, Math.floor(+i.value) || 1); });
    var tpb = v[0] * v[1] * v[2], nb = v[3] * v[4] * v[5], rows = [], ok = true;
    LIM.forEach(function(l){
      var good = v[l[0]] <= l[1]; ok = ok && good;
      rows.push([(l[0] < 3 ? "blockDim." : "gridDim.") + "xyz"[l[0] % 3], v[l[0]] + (good ? " ≤ " : " &gt; ") + l[2], good]);
    });
    rows.splice(3, 0, [T("threads per block"), v[0] + " × " + v[1] + " × " + v[2] + " = <b>" + tpb + "</b>" + (tpb <= 1024 ? " ≤ " : " &gt; ") + "1024", tpb <= 1024]);
    ok = ok && tpb <= 1024;
    el.querySelector(".bl-code").innerHTML = "dim3 block(" + v.slice(0, 3).join(", ") + ");<br>dim3 grid(" + v.slice(3).join(", ") + ');<br><span class="fn">kernel</span>&lt;&lt;&lt;grid, block&gt;&gt;&gt;();';
    el.querySelector(".bl-checks").innerHTML = rows.map(function(r){
      return '<li class="' + (r[2] ? "ok" : "no") + '"><span aria-hidden="true">' + (r[2] ? "✓" : "✕") + "</span><code>" + r[0] + "</code><b>" + r[1] + "</b></li>";
    }).join("");
    var m = el.querySelector(".bl-meter");
    m.classList.toggle("over", tpb > 1024);
    m.querySelector("i").style.width = Math.min(100, tpb / 1024 * 100) + "%";
    m.querySelector("span").innerHTML = F("{0} of 1024 threads per block · {1} warps", "<b>" + tpb + "</b>", Math.ceil(tpb / 32));
    el.querySelector(".dg-info").innerHTML = ok
      ? F("<b>Valid.</b> {0} blocks × {1} threads = <em>{2}</em> threads in total.", nb, tpb, nb * tpb)
      : T("<b>Launch fails.</b> It compiles, but the kernel never runs. <code>cudaGetLastError()</code> returns <code>cudaErrorInvalidConfiguration</code>.");
  }
  function preset(i){ presets[i][0].concat(presets[i][1]).forEach(function(x, k){ ins[k].value = x; }); draw(); }
  onSegs(tb, preset);
  ins.forEach(function(i){ i.addEventListener("input", function(){ segOn(tb, -1); draw(); }); });
  preset(0);
});

// One block as rows of 32 lanes, one row per warp. Pick a thread to see its warp and lane worked out.
cuda("warp-lane", function(el){
  var lanes = "";
  for (var l = 0; l < 32; l++) { lanes += "<i>" + (l % 8 === 0 ? l : "") + "</i>"; }
  el.setAttribute("aria-label", T("Warp and lane of a thread"));
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Warp and lane of a thread") + '</span><div class="dg-ctl">' +
    '<label>' + T("threads / block") + ' <b class="nn"></b><input type="range" min="1" max="256" value="128" aria-label="' + T("threads / block") + '"></label>' +
    '<label>threadIdx.x <b class="nt"></b><input type="range" min="0" max="127" value="33" aria-label="threadIdx.x"></label></div></div>' +
    '<div class="dg-stats"></div><div class="wl"><div class="wl-row lanes"><span>' + T("lane") + '</span><div class="wl-cells">' + lanes + '</div></div><div class="wl-rows"></div></div>' +
    '<div class="dg-eq wl-eq" aria-live="polite"></div><div class="dg-info"></div>';
  var ins = el.querySelectorAll("input"), rows = el.querySelector(".wl-rows"), N = 0;
  function draw(){
    N = +ins[0].value;
    var W = Math.ceil(N / 32), h = "";
    ins[1].max = N - 1;
    if (+ins[1].value > N - 1) { ins[1].value = N - 1; }
    for (var w = 0; w < W; w++) {
      h += '<div class="wl-row" data-w="' + w + '"><span>' + F("warp {0}", w) + '</span><div class="wl-cells">';
      for (var k = w * 32; k < w * 32 + 32; k++) { h += k < N ? '<i class="a w' + (w & 3) + '" data-t="' + k + '"></i>' : '<i class="idle"></i>'; }
      h += "</div></div>";
    }
    rows.innerHTML = h;
    el.querySelector(".nn").textContent = N;
    el.querySelector(".dg-stats").innerHTML = "<span>blockDim.x <b>" + N + "</b></span><span>" + T("warps") + " <b>" + W + "</b></span><span>" + T("idle lanes") + " <b>" + (W * 32 - N) + "</b></span>";
    show();
  }
  function show(){
    var t = +ins[1].value, w = t >> 5, l = t & 31;
    el.querySelector(".nt").textContent = t;
    rows.querySelectorAll(".wl-row").forEach(function(r){ r.classList.toggle("on", +r.dataset.w === w); });
    rows.querySelectorAll("i").forEach(function(c, k){ c.classList.toggle("col", (k & 31) === l); c.classList.toggle("hot", k === t); });
    el.querySelectorAll(".lanes i").forEach(function(c, k){ c.classList.toggle("col", k === l); });
    el.querySelector(".wl-eq").innerHTML = '<div><span class="e2">warp</span> = threadIdx.x / 32 = ' + t + " / 32 = <b class='e2'>" + w + "</b></div>" +
      '<div><span class="e3">lane</span> = threadIdx.x % 32 = ' + t + " % 32 = <b class='e3'>" + l + "</b></div>";
    el.querySelector(".dg-info").innerHTML = F("Thread <b>{0}</b> is in warp <em>{1}</em> at lane <em>{2}</em>, because {1} × 32 + {2} = {0}.", t, w, l) + " " +
      T("<code>/</code> between two ints drops the remainder, and <code>%</code> gives exactly that remainder.") +
      (N % 32 ? " " + F("The last warp has only {0} threads, so {1} of its lanes are idle.", N % 32, 32 - N % 32) : "");
  }
  function point(e){ var c = e.target.closest("i[data-t]"); if (c && +c.dataset.t !== +ins[1].value) { ins[1].value = c.dataset.t; show(); } }
  rows.addEventListener("mouseover", point);
  rows.addEventListener("click", point);
  ins[0].addEventListener("input", draw);
  ins[1].addEventListener("input", show);
  draw();
});

// The CUDA platform in five layers. Click a layer or anything in it to read what it is.
cuda("cuda-stack", function(el){
  var L = [
    [T("Languages"), T("how you write GPU code"), T("You write GPU code in one of these. All of them run on the same GPU."), [
      ["CUDA C/C++", T("the main one"), T("C++ with a few additions such as <code>__global__</code> and <code>&lt;&lt;&lt; &gt;&gt;&gt;</code>. Every kernel in these lessons is written in it.")],
      ["CUDA Fortran", T("Fortran + CUDA"), T("Fortran with the same CUDA ideas. Common in older science and weather code.")],
      ["OpenACC", T("directive-based"), T("You add <code>#pragma acc</code> directive lines above normal C or Fortran loops, and the compiler writes the GPU code. No kernels by hand.")],
      ["Python", "CuPy · Numba · CUDA Python", T("<b>CuPy</b> gives you NumPy-style arrays that live on the GPU. <b>Numba</b> compiles Python functions into GPU kernels. <b>NVIDIA CUDA Python</b> gives direct access to the CUDA driver and runtime from Python.")]]],
    [T("AI libraries"), T("ready-made fast GPU code"), T("Fast GPU code you call instead of writing it. PyTorch and TensorFlow use these under the hood."), [
      ["cuDNN", T("deep learning"), T("CUDA Deep Neural Network library. Building blocks like convolution and attention, tuned for each GPU.")],
      ["cuBLAS", T("linear algebra"), T("CUDA Basic Linear Algebra Subprograms. Matrix and vector math, above all matrix multiply.")],
      ["TensorRT", T("inference"), T("Takes a trained model and makes it run as fast as possible on one specific GPU.")],
      ["NCCL", T("multi-GPU"), T("NVIDIA Collective Communications Library, said like \"nickel\". Moves data between GPUs, which you need to train on more than one GPU.")]]],
    [T("Tools"), T("measure and debug"), T("Tools that show where time goes and find bugs."), [
      ["Nsight Systems", T("timeline profiler"), T("Records CPU and GPU work on one timeline for the whole program, so you see where it waits.")],
      ["Nsight Compute", T("kernel profiler"), T("Looks deep into one kernel, at how busy the SMs are and how well it uses memory.")],
      ["Compute Sanitizer", T("memory error checker"), T("Runs your program and reports bad memory access inside kernels, like reading past the end of an array.")]]],
    [T("Compiler"), T("from .cu file to GPU code"), T("Turns your <code>.cu</code> file into a program the GPU can run."), [
      ["nvcc", T("the CUDA compiler"), T("NVIDIA CUDA Compiler. Splits a <code>.cu</code> file in two. Host code goes to the normal C++ compiler, device code to NVIDIA's compiler.")],
      ["PTX", T("virtual ISA"), T("Parallel Thread Execution. A virtual instruction set that is not tied to one GPU. It is stored inside the program.")],
      ["SASS", T("real machine code"), T("Streaming ASSembler. The real machine code for one GPU generation, for example <code>sm_89</code>.")],
      [T("driver JIT"), T("PTX → SASS at run time"), T("Just-in-time compilation. If the program has no SASS for your GPU, the driver turns the stored PTX into SASS when it starts. That is how old programs run on new GPUs.")]]],
    [T("Hardware capabilities"), T("built into the GPU"), T("Features of the GPU chip itself. Software can use them, but cannot add them."), [
      ["Tensor Cores", T("matrix math"), T("Units inside each SM made for matrix math. Much faster than the FP32 cores for FP16 and FP8 matrix work, which is what AI needs.")],
      ["MIG", T("one GPU, up to 7 parts"), T("Multi-Instance GPU. Splits one GPU into up to 7 isolated instances. Each one acts like its own GPU, with its own SMs and memory.")],
      ["Dynamic Parallelism", T("kernels launch kernels"), T("A running kernel can launch another kernel from the GPU, without going back to the CPU.")],
      ["GPUDirect", T("direct data paths"), T("GPUs send data to each other or to a network card directly, without a detour through system memory.")]]]
  ];
  el.setAttribute("aria-label", T("The CUDA platform"));
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("The CUDA platform") + '</span><span class="dg-note">' + T("click a layer or any part of it") + '</span></div><div class="cs">' +
    L.map(function(l, i){
      return '<div class="cs-layer l' + i + '"><button type="button" class="cs-name" data-k="' + i + '"><b>' + l[0] + "</b><small>" + l[1] + '</small></button><div class="cs-items">' +
        l[3].map(function(it, j){ return '<button type="button" data-k="' + i + "." + j + '"><b>' + it[0] + "</b><small>" + it[1] + "</small></button>"; }).join("") + "</div></div>";
    }).join("") + '</div><div class="dg-info" aria-live="polite"></div>';
  var info = el.querySelector(".dg-info");
  el.querySelector(".cs").addEventListener("click", function(e){
    var b = e.target.closest("[data-k]");
    if (!b) { return; }
    var k = b.dataset.k.split(".").map(Number), l = L[k[0]];
    el.querySelectorAll("[data-k].on,.cs-layer.cur").forEach(function(x){ x.classList.remove("on", "cur"); });
    b.classList.add("on");
    b.closest(".cs-layer").classList.add("cur");
    info.innerHTML = k.length === 1
      ? "<b>" + l[0] + "</b><br>" + l[2] + "<br>" + F("This layer holds {0}.", l[3].map(function(it){ return it[0]; }).join(", "))
      : "<b>" + l[3][k[1]][0] + "</b> · " + l[0] + "<br>" + l[3][k[1]][2];
  });
  el.querySelector('[data-k="0.0"]').click();
});

// c = a + b, once as a CPU loop (one element per step), once as GPU threads (all elements in one step).
cuda("vector-add", function(el){
  var N = Math.max(2, Math.min(32, +el.getAttribute("n") || 16)), gpu = 0, done = 0, steps = 0, timer = 0;
  var code = ["<span class='k'>for</span> (int i = 0; i &lt; " + N + "; i++) {<br>    c[i] = a[i] + b[i];<br>}",
    "<span class='fn'>vectorAdd</span>&lt;&lt;&lt;1, " + N + "&gt;&gt;&gt;(a, b, c);<br><span class='dg-note'>// " + T("inside the kernel, every thread runs:") + "</span><br>int i = threadIdx.x;  c[i] = a[i] + b[i];"];
  function row(n, f){ var h = '<div class="va-row ' + n + '"><span>' + n + "</span>"; for (var i = 0; i < N; i++) { h += "<i>" + f(i) + "</i>"; } return h + "</div>"; }
  el.setAttribute("aria-label", T("Adding two arrays"));
  el.innerHTML = '<div class="dg-head"><span class="dg-title">c = a + b</span>' + segs([T("CPU loop"), T("GPU threads")], 0, T("mode")) + "</div>" +
    '<pre class="dg-code"></pre><div class="va" style="--n:' + N + '">' + row("i", function(i){ return i; }) + row("a", function(i){ return i; }) + row("b", function(i){ return N - i; }) +
    row("c", function(){ return ""; }) + '</div><div class="dg-head"><div class="dg-ctl"><button class="dg-btn go" type="button">' + T("play") + '</button><button class="dg-btn alt one" type="button">' + T("step") +
    '</button><button class="dg-btn alt clr" type="button">' + T("reset") + '</button></div><span class="dg-big">' + T("step count") + ' <b>0</b></span></div><div class="dg-info" aria-live="polite"></div>';
  var box = el.querySelector(".va"), cells = function(r){ return box.querySelectorAll("." + r + " i"); }, info = el.querySelector(".dg-info");
  function reset(){
    clearInterval(timer); timer = 0; done = steps = 0;
    box.classList.toggle("gpu", !!gpu);
    el.querySelector(".dg-code").innerHTML = code[gpu];
    box.querySelectorAll("i").forEach(function(c){ c.classList.remove("on", "now"); });
    cells("c").forEach(function(c){ c.textContent = ""; });
    count();
    info.innerHTML = gpu ? F("{0} threads, one per element. Thread i adds element i. They all run at the same time.", N) : T("One CPU core walks the loop, one element per step, in order.");
  }
  function count(){ el.querySelector(".dg-big b").textContent = steps; }
  function fill(i){
    cells("c")[i].textContent = N;
    ["i", "a", "b", "c"].forEach(function(r){ cells(r)[i].classList.add("on", "now"); });
  }
  function step(){
    if (done >= N) { return false; }
    box.querySelectorAll(".now").forEach(function(c){ c.classList.remove("now"); });
    steps++;
    if (gpu) { for (var i = 0; i < N; i++) { fill(i); } done = N; }
    else { fill(done); info.innerHTML = F("Step {0}, i = {1}, c[{1}] = a[{1}] + b[{1}] = {2} + {3} = <em>{4}</em>", steps, done, done, N - done, N); done++; }
    count();
    if (done === N) {
      info.innerHTML = gpu ? F("<b>Done in 1 step.</b> {0} threads each added one pair at the same time. The CPU loop needs {0} steps.", N)
        : F("<b>Done in {0} steps.</b> One element per step. With one GPU thread per element it takes 1 step.", N);
    }
    return done < N;
  }
  el.querySelector(".one").addEventListener("click", function(){ clearInterval(timer); timer = 0; if (done >= N) { reset(); } step(); });
  el.querySelector(".clr").addEventListener("click", reset);
  el.querySelector(".go").addEventListener("click", function(){
    reset();
    if (gpu || CALM) { while (step()) {} return; }
    step();
    timer = setInterval(function(){ if (!step()) { clearInterval(timer); timer = 0; } }, 320);
  });
  onSegs(el.querySelector(".dg-tabs"), function(i){ gpu = i; reset(); });
  reset();
});

// Host memory and device memory side by side, stepped through the six steps of a CUDA program.
cuda("host-device-flow", function(el){
  var N = 8, cur = 0, ARR = ["a", "b", "c"];
  // For each step: the code, what it does, and when each array gets its values (step index) or is freed (5).
  var S = [
    [T("allocate"), "int *h_a = (int *)malloc(bytes);\nint *h_b = (int *)malloc(bytes);\nint *h_c = (int *)malloc(bytes);\nCHECK(cudaMalloc(&d_a, bytes));\nCHECK(cudaMalloc(&d_b, bytes));\nCHECK(cudaMalloc(&d_c, bytes));",
      T("Reserve memory on both sides, <code>malloc</code> on the host and <code>cudaMalloc</code> on the device. New memory holds leftover garbage, shown as ?.")],
    [T("fill"), "for (int i = 0; i < N; i++) {\n    h_a[i] = i;\n    h_b[i] = N - i;\n}",
      T("The CPU writes the inputs into host memory. The device arrays still hold garbage.")],
    [T("copy in"), "CHECK(cudaMemcpy(d_a, h_a, bytes, cudaMemcpyHostToDevice));\nCHECK(cudaMemcpy(d_b, h_b, bytes, cudaMemcpyHostToDevice));",
      T("<code>cudaMemcpy</code> copies <code>h_a</code> to <code>d_a</code> and <code>h_b</code> to <code>d_b</code> over PCIe. Destination first, then source.")],
    [T("launch"), "vectorAdd<<<1, N>>>(d_a, d_b, d_c, N);",
      T("The kernel runs on the GPU. Thread i reads <code>d_a[i]</code> and <code>d_b[i]</code> and writes <code>d_c[i]</code>. It only touches device memory.")],
    [T("copy back"), "CHECK(cudaMemcpy(h_c, d_c, bytes, cudaMemcpyDeviceToHost));",
      F("<code>cudaMemcpy</code> copies <code>d_c</code> back into <code>h_c</code>. Now the CPU can read the result. Every element is i + (N - i) = {0}.", N)],
    [T("free"), "CHECK(cudaFree(d_a));\nCHECK(cudaFree(d_b));\nCHECK(cudaFree(d_c));\nfree(h_a);\nfree(h_b);\nfree(h_c);",
      T("<code>cudaFree</code> gives the device memory back, <code>free</code> the host memory. Nothing is left.")]
  ];
  var when = { h_a: 1, h_b: 1, h_c: 4, d_a: 2, d_b: 2, d_c: 3 };
  function side(p, name){
    return '<div class="hd-side ' + p + '"><span class="dg-lbl">' + name + "</span>" + ARR.map(function(a){
      var c = ""; for (var i = 0; i < N; i++) { c += '<i style="--i:' + i + '"></i>'; }
      return '<div class="hd-arr" data-a="' + p + "_" + a + '"><code>' + p + "_" + a + "</code><div>" + c + "</div></div>";
    }).join("") + (p === "d" ? '<div class="hd-kernel">vectorAdd&lt;&lt;&lt;1, N&gt;&gt;&gt;</div>' : "") + "</div>";
  }
  el.setAttribute("aria-label", T("The six steps"));
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("The six steps") + '</span><span class="dg-note">' + F("N = {0} here so it fits. The code in this lesson uses N = 1024.", N) + "</span></div>" +
    segs(S.map(function(s, i){ return (i + 1) + " · " + s[0]; }), 0, T("steps")) +
    '<div class="hd">' + side("h", T("host memory (CPU)")) + '<div class="hd-link"><span>PCIe</span><b aria-hidden="true"></b></div>' + side("d", T("device memory (GPU)")) + "</div>" +
    '<pre class="dg-code"></pre><div class="dg-info" aria-live="polite"></div>' +
    '<div class="dg-head"><div class="dg-ctl"><button class="dg-btn alt prev" type="button" aria-label="' + T("previous step") + '">← ' + T("back") + '</button>' +
    '<button class="dg-btn next" type="button" aria-label="' + T("next step") + '">' + T("next step") + ' →</button></div><span class="dg-note pos"></span></div>';
  var tb = el.querySelector(".dg-tabs"), hd = el.querySelector(".hd");
  function go(i){
    cur = Math.max(0, Math.min(5, i));
    segOn(tb, cur);
    hd.dataset.s = cur;
    el.querySelectorAll(".hd-arr").forEach(function(r){
      var a = r.dataset.a, full = cur >= when[a] && cur < 5;
      r.classList.toggle("gone", cur === 5);
      r.classList.toggle("new", cur === when[a]);
      r.querySelectorAll("i").forEach(function(c, k){
        c.textContent = cur === 5 ? "" : !full ? "?" : a.slice(-1) === "a" ? k : a.slice(-1) === "b" ? N - k : N;
        c.classList.toggle("v", full);
      });
    });
    el.querySelector(".dg-code").textContent = S[cur][1];
    el.querySelector(".dg-info").innerHTML = "<b>" + (cur + 1) + " · " + S[cur][0] + "</b><br>" + S[cur][2];
    el.querySelector(".prev").disabled = cur === 0;
    el.querySelector(".next").disabled = cur === 5;
    el.querySelector(".pos").textContent = F("step {0} of {1}", cur + 1, 6);
  }
  onSegs(tb, go);
  el.querySelector(".prev").addEventListener("click", function(){ go(cur - 1); });
  el.querySelector(".next").addEventListener("click", function(){ go(cur + 1); });
  go(0);
});

// Pick threads per block and see the grid it gives on the L40S: the round-up formula, the extra threads in
// the last block, and how many of the SMs get a block at all. Limits are those of CC 8.9.
cuda("grid-size", function(el){
  var TS = [32, 64, 128, 256, 512, 1024, 100, 1000], NS = [2048, 2000], S = +el.getAttribute("sms") || 142, t = 256;
  var n0 = +el.getAttribute("n") || 2048, N = n0, lang = document.documentElement.lang || "en";
  if (NS.indexOf(n0) < 0) { NS.unshift(n0); }
  function fmt(x, d){ return x.toLocaleString(lang, { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  el.setAttribute("aria-label", T("Grid size on the L40S"));
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Grid size on the L40S") + '</span><span class="dg-note">' + F("{0} SMs · 48 warps and 24 blocks per SM", S) + "</span></div>" +
    '<span class="dg-lbl">' + T("threads per block") + "</span>" + segs(TS, TS.indexOf(t), T("threads per block")) +
    '<span class="dg-lbl">' + T("elements N") + "</span>" + segs(NS, NS.indexOf(n0), T("elements N")) +
    '<pre class="dg-code"></pre><div class="dg-stats"></div><div class="dg-read gs-txt"></div>' +
    '<span class="dg-lbl gs-lb"></span><div class="gs-cells"></div>' +
    '<div class="dg-legend"><span><i style="background:var(--accent)"></i>' + T("adds one element") + '</span><span><i class="gs-x"></i>' + T("fails <code>if (i &lt; n)</code>, does nothing") +
    '</span><span><i class="gs-idle"></i>' + T("idle lane, no thread") + "</span></div>" +
    '<span class="dg-lbl gs-sl">' + F("the {0} SMs of the L40S", S) + '</span><div class="gs-sms"></div>' +
    '<div class="dg-legend"><span><i class="gs-on"></i>' + T("SM with a block") + "</span><span>" + T("fill = warps in use, of 48") + "</span><span>" + T("usually one block per SM first, the hardware scheduler decides") + "</span></div>" +
    '<div class="dg-read gs-use"></div><div class="dg-info" aria-live="polite"></div>';
  var tabs = el.querySelectorAll(".dg-tabs");
  function draw(){
    var B = Math.floor((N + t - 1) / t), W = Math.ceil(t / 32), extra = B * t - N, per = Math.min(24, Math.floor(48 / W));
    var res = Math.min(B, S * per), wait = B - res, busy = Math.min(res, S), maxW = Math.ceil(res / S) * W, cap = S * 1536, on = res * t;
    el.querySelector(".dg-code").innerHTML = "int blocks = (N + threads - 1) / threads;\n<span class='dg-note'>//         = (" + N + " + " + t + " - 1) / " + t + " = " + (N + t - 1) + " / " + t + " = " + B +
      "</span>\n<span class='fn'>vectorAdd</span>&lt;&lt;&lt;" + B + ", " + t + "&gt;&gt;&gt;(d_a, d_b, d_c, N);";
    el.querySelector(".dg-stats").innerHTML = "<span>" + T("blocks") + " <b>" + B + "</b></span><span>" + T("threads") + " <b>" + B * t + "</b></span><span>" +
      T("extra threads") + " <b>" + extra + "</b></span><span>" + T("warps / block") + " <b>" + W + "</b></span>";
    el.querySelector(".gs-txt").innerHTML = (extra
      ? F("{0} × {1} = {2} threads for {3} elements, so <em>{4}</em> extra threads fail <code>if (i &lt; n)</code> and do nothing.", B, t, B * t, N, extra)
      : F("{0} × {1} = {2} threads for {3} elements, so no extra threads.", B, t, B * t, N)) + "<br>" +
      (t % 32 ? F("{0} threads per block is not a multiple of 32. That makes {1} warps, and the last warp of every block has {2} idle lanes.", t, W, 32 - t % 32)
        : F("{0} threads per block = {1} warps of 32, no idle lanes.", t, W));
    el.querySelector(".gs-lb").textContent = F("last block (block {0}) · global IDs {1} to {2}", B - 1, (B - 1) * t, B * t - 1);
    var c = "";
    for (var k = 0; k < W * 32; k++) { c += k >= t ? '<i class="gs-idle"></i>' : (B - 1) * t + k < N ? '<i class="a"></i>' : '<i class="gs-x"></i>'; }
    var cells = el.querySelector(".gs-cells");
    cells.innerHTML = c;
    cells.style.setProperty("--n", W > 1 ? 64 : 32);
    var s = "";
    for (var m = 0; m < S; m++) {
      var nb = Math.floor(res / S) + (m < res % S ? 1 : 0);
      s += "<i" + (nb ? ' class="gs-on" style="--f:' + nb * W / 48 + '"' : "") + "></i>";
    }
    el.querySelector(".gs-sms").innerHTML = s;
    el.querySelector(".gs-use").innerHTML = F("<b>{0}</b> of {1} SMs busy ({2}%)", busy, S, fmt(busy / S * 100, 1)) + "<br>" +
      F("<b>{0}</b> threads on the GPU, of {1} it can hold at once ({2}%)", fmt(on), fmt(cap), fmt(on / cap * 100, 1)) +
      (wait ? "<br>" + F("{0} more blocks wait until an SM is free.", wait) : "");
    el.querySelector(".dg-info").innerHTML = "<b>" + (busy < 20 ? (busy === 1 ? F("Only 1 SM works, {0} wait.", S - 1) : F("Only {0} SMs work, {1} wait.", busy, S - busy))
      : maxW < 48 ? (maxW === 1 ? F("{0} SMs work, but each holds just 1 warp of the 48 it could run.", busy) : F("{0} SMs work, but each holds just {1} warps of the 48 it could run.", busy, maxW))
      : T("Every SM is full, with 48 warps each.")) + "</b><br>" +
      (on < cap / 10 ? F("{0} elements are far too little work to fill this GPU.", N) : on < cap ? T("Still not enough threads to fill every SM.") : "");
  }
  onSegs(tabs[0], function(i){ t = TS[i]; draw(); });
  onSegs(tabs[1], function(i){ N = NS[i]; draw(); });
  draw();
});

// Timing with CUDA events, step by step on two lanes: what the CPU does and what sits in the GPU queue.
// Two toggles show the classic mistakes. Lengths are relative, not measured.
cuda("event-timing", function(el){
  var cur = 0, warm = true, sync = true, D = 24;
  var CODE = [[0, "<span class='fn'>vectorAdd</span>&lt;&lt;&lt;blocks, threads&gt;&gt;&gt;(d_a, d_b, d_c, N);"], [0, "cudaDeviceSynchronize();"], [1, "cudaEventRecord(start);"],
    [2, "<span class='k'>for</span> (int r = 0; r &lt; RUNS; r++) {"], [2, "    <span class='fn'>vectorAdd</span>&lt;&lt;&lt;blocks, threads&gt;&gt;&gt;(d_a, d_b, d_c, N);"], [2, "}"],
    [3, "cudaEventRecord(stop);"], [4, "cudaEventSynchronize(stop);"], [5, "cudaEventElapsedTime(&amp;ms, start, stop);"], [5, "float per_launch = ms / RUNS;"]];
  var NAMES = [T("warm-up"), T("record start"), T("queue kernels"), T("record stop"), T("wait for stop"), T("read time")];
  // The CPU clock t and the time g at which the GPU is free. A launch or record costs the CPU 1 unit,
  // a kernel takes 3 units on the GPU, the very first one 8 (one-time setup).
  function plan(){
    var P = [], t = 0, g = 0, first = true, mk = {};
    function seg(l, a, b, s, c, lab){ P.push({ l: l, a: a, b: b, s: s, c: c, lab: lab || "" }); }
    function launch(s){
      seg("cpu", t, ++t, s, "go");
      var a = Math.max(g, t), d = first ? 8 : 3;
      seg("gpu", a, a + d, s, first ? "k slow" : "k", first ? T("1st launch") : "K");
      g = a + d; first = false;
    }
    function record(s, name){ seg("cpu", t, ++t, s, "go"); g = Math.max(g, t); mk[name] = g; seg("gpu", g, g, s, "mark" + (g > D * .6 ? " r" : ""), name); }
    function wait(s, until){ if (until > t) { seg("cpu", t, until, s, "wait", T("waits")); t = until; } }
    if (warm) { launch(0); wait(0, g); }
    record(1, "start");
    for (var r = 0; r < 4; r++) { launch(2); }
    record(3, "stop");
    if (sync) { wait(4, mk.stop); }
    seg("cpu", t, t + 1, 5, sync ? "rd" : "rd bad");
    seg("gpu", mk.start, mk.stop, 5, sync ? "span" : "span bad", sync ? "ms" : "?");
    P.push({ l: "both", a: t, b: t, s: 5, c: "now" + (sync ? "" : " bad") });
    return P;
  }
  el.setAttribute("aria-label", T("Timing a kernel with CUDA events"));
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Timing a kernel with CUDA events") + '</span><div class="dg-tabs et-tg" role="group" aria-label="' + T("mistakes") + '">' +
    '<button type="button" data-m="w" aria-pressed="false">' + T("skip warm-up") + '</button><button type="button" data-m="s" aria-pressed="false">' + T("skip cudaEventSynchronize") + "</button></div></div>" +
    segs(NAMES.map(function(s, i){ return (i + 1) + " · " + s; }), 0, T("steps")) +
    '<div class="et"><div class="et-lane"><span>CPU</span><div class="et-tr cpu"></div></div><div class="et-lane"><span>GPU</span><div class="et-tr gpu"></div></div>' +
    '<span class="dg-note et-ax">' + T("time →") + "</span></div>" +
    '<div class="dg-legend"><span><i style="background:var(--cool)"></i>' + T("CPU call returns at once") + '</span><span><i class="et-w"></i>' + T("CPU waits") +
    '</span><span><i style="background:var(--accent)"></i>' + T("kernel") + '</span><span><i style="background:var(--y)"></i>' + T("one-time setup at first launch") + "</span></div>" +
    '<pre class="dg-code et-code"></pre><div class="dg-info" aria-live="polite"></div>' +
    '<div class="dg-head"><div class="dg-ctl"><button class="dg-btn alt prev" type="button" aria-label="' + T("previous step") + '">← ' + T("back") + "</button>" +
    '<button class="dg-btn next" type="button" aria-label="' + T("next step") + '">' + T("next step") + ' →</button></div><span class="dg-note pos"></span></div>';
  var tb = el.querySelectorAll(".dg-tabs")[1];
  function go(i){
    cur = Math.max(0, Math.min(5, i));
    segOn(tb, cur);
    var P = plan();
    ["cpu", "gpu"].forEach(function(l){
      el.querySelector(".et-tr." + l).innerHTML = P.filter(function(x){ return x.l === l || x.l === "both"; }).map(function(x){
        return '<i class="' + x.c + (x.s > cur ? " later" : x.s === cur ? " cur" : "") + '" style="left:' + x.a / D * 100 + "%;width:" + (x.b - x.a) / D * 100 + '%"' +
          (x.lab ? ' title="' + x.lab + '"' : "") + ">" + (x.lab ? "<b>" + x.lab + "</b>" : "") + "</i>";
      }).join("");
    });
    el.querySelector(".et-code").innerHTML = CODE.map(function(c, k){
      var off = (!warm && k < 2) || (!sync && k === 7);
      return '<span class="' + (off ? "off" : c[0] === cur ? "on" : "dim") + '">' + c[1] + "</span>";
    }).join("");
    var txt = [
      warm ? T("<b>Warm-up.</b> The first launch pays a one-time setup, so it is drawn long. <code>cudaDeviceSynchronize()</code> makes the CPU wait until it is done. None of it is timed.")
        : T("<b>Warm-up skipped.</b> Nothing runs yet. The slow first launch now happens inside the timed loop."),
      T("<b>Start marker.</b> <code>cudaEventRecord(start)</code> puts a marker into the GPU queue and returns at once. The CPU does not wait. The GPU notes the time when it reaches the marker."),
      warm ? T("<b>The loop.</b> Each launch only queues a kernel and returns. The CPU is done with the loop early and runs ahead, while the GPU works through the kernels one after another.")
        : T("<b>The loop.</b> Each launch only queues a kernel and returns. Without warm-up, the first of them is the slow one, and it sits inside the timed range."),
      T("<b>Stop marker.</b> <code>cudaEventRecord(stop)</code> queues the stop marker behind the kernels. Again the CPU does not wait."),
      sync ? T("<b>Wait for stop.</b> <code>cudaEventSynchronize(stop)</code> holds the CPU until the GPU has reached the stop marker. Now both times exist.")
        : T("<b>Wait skipped.</b> Without <code>cudaEventSynchronize(stop)</code> the CPU goes straight on, while the GPU is still busy with the kernels."),
      !sync ? T("<b>Too early.</b> The GPU has not reached stop yet, so there is no time to read. <code>cudaEventElapsedTime</code> returns <code>cudaErrorNotReady</code>, and <code>CHECK</code> stops the program.")
        : warm ? T("<b>Read the time.</b> <code>ms</code> is the time between the two markers, so it covers only the timed launches. <code>ms / RUNS</code> is the time of one launch.")
        : T("<b>Too large.</b> The time between the markers now includes the slow first launch, so <code>ms / RUNS</code> comes out larger than one normal launch.")
    ];
    el.querySelector(".dg-info").innerHTML = "<b>" + (cur + 1) + " · " + NAMES[cur] + "</b><br>" + txt[cur];
    el.querySelector(".prev").disabled = cur === 0;
    el.querySelector(".next").disabled = cur === 5;
    el.querySelector(".pos").textContent = F("step {0} of {1}", cur + 1, 6);
  }
  el.querySelector(".et-tg").addEventListener("click", function(e){
    var b = e.target.closest("button[data-m]");
    if (!b) { return; }
    var v = b.getAttribute("aria-pressed") !== "true";
    b.setAttribute("aria-pressed", v); b.classList.toggle("on", v);
    if (b.dataset.m === "w") { warm = !v; } else { sync = !v; }
    go(cur);
  });
  onSegs(tb, go);
  el.querySelector(".prev").addEventListener("click", function(){ go(cur - 1); });
  el.querySelector(".next").addEventListener("click", function(){ go(cur + 1); });
  go(0);
});

// <div class="code-walk"> holds an ordered list whose items start with `1-3,7 cpu`. It walks
// through a copy of the code block above it in writing order. The original block is left alone.
(function(){
  var codes = [].filter.call(document.querySelectorAll(".prose pre > code"), function(c){ return !c.closest(".dg"); });
  function after(a, b){ return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING); }
  // The nearest code block above the walk. Under a repeated subheading (two programs, two walks), the block under its twin.
  function source(el){
    var h = el.previousElementSibling;
    while (h && !/^H[23]$/.test(h.tagName)) { h = h.previousElementSibling; }
    var twin = h && h.tagName === "H3" && [].filter.call(document.querySelectorAll(".prose h3"), function(x){ return x !== h && x.textContent.trim() === h.textContent.trim() && after(h, x); })[0];
    if (twin) {
      var next = codes.filter(function(c){ return after(c, twin); })[0], stop = twin.nextElementSibling;
      while (stop && !/^H[1-3]$/.test(stop.tagName)) { stop = stop.nextElementSibling; }
      if (next && (!stop || after(stop, next))) { return next; }
    }
    return codes.filter(function(c){ return after(el, c); }).pop();
  }
  // Split highlighted HTML into lines, closing and reopening spans that cross a line break.
  function lines(html){
    var out = [], cur = "", open = [];
    html.split(/(<[^>]+>)/).forEach(function(p){
      if (p[0] === "<") { if (p[1] === "/") { open.pop(); } else { open.push(p); } cur += p; return; }
      var parts = p.split("\n");
      parts.forEach(function(s, i){
        if (i) { out.push(cur + open.map(function(){ return "</span>"; }).join("")); cur = open.join(""); }
        cur += s;
      });
    });
    if (cur.replace(/<[^>]+>/g, "")) { out.push(cur); }
    return out;
  }
  document.querySelectorAll(".prose .code-walk").forEach(function(el){
    var code = source(el), ol = el.querySelector("ol");
    if (!code || !ol) { return; }
    var steps = [].map.call(ol.children, function(li){
      var k = li.querySelector("code"), m = k && k.textContent.match(/^\s*([\d\s,-]+?)\s+(cpu|gpu)\s*$/i), ln = [];
      if (m) {
        m[1].split(",").forEach(function(r){
          var ab = r.split("-").map(Number), a = ab[0], b = ab.length > 1 ? ab[1] : a;
          for (var n = a; n <= b; n++) { ln.push(n); }
        });
        var html = li.innerHTML, at = html.indexOf(k.outerHTML);
        k = { place: m[2].toLowerCase(), spec: m[1].replace(/\s+/g, ""), lines: ln, html: (html.slice(0, at) + html.slice(at + k.outerHTML.length)).trim() };
      } else {
        k = { place: "", spec: "", lines: ln, html: li.innerHTML };
      }
      return k;
    });
    if (!steps.length) { return; }
    var L = lines(code.innerHTML), owner = {}, blank = L.map(function(l){ return !l.replace(/<[^>]+>/g, "").trim(); });
    steps.forEach(function(s, i){ s.lines.forEach(function(n){ if (!(n in owner)) { owner[n] = i; } }); });
    var box = code.closest(".highlight"), cls = box ? box.className : "highlight", cur = 0, write = 0;
    el.classList.add("dg", "cw");
    el.setAttribute("role", "group");
    el.setAttribute("aria-label", T("Code walkthrough"));
    ol.hidden = true;
    var ui = document.createElement("div");
    ui.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Code walkthrough") + "</span>" + segs([T("Read"), T("Write")], 0, T("mode")) + "</div>" +
      '<p class="dg-note cw-hint"></p><div class="' + cls + ' cw-code"><pre tabindex="0" aria-label="' + T("Code walkthrough") + '"><code>' +
      L.map(function(l, i){ return '<span class="cw-l' + (blank[i] ? " blank" : "") + (i + 1 in owner ? " " + steps[owner[i + 1]].place : "") + '" data-n="' + (i + 1) + '">' + l + "</span>"; }).join("") +
      '</code></pre></div>' +
      '<div class="dg-head cw-nav"><div class="dg-ctl"><button class="dg-btn alt prev" type="button" aria-label="' + T("previous step") + '">← ' + T("back") + "</button>" +
      '<button class="dg-btn next" type="button" aria-label="' + T("next step") + '">' + T("next step") + ' →</button></div><div class="cw-dots">' +
      steps.map(function(s, i){ return '<button type="button" class="' + s.place + '" data-s="' + i + '" aria-label="' + F("step {0} of {1}", i + 1, steps.length) + '"></button>'; }).join("") +
      '</div><span class="dg-note pos"></span></div><div class="cw-step" aria-live="polite"><div class="cw-meta"></div><div class="cw-text"></div></div>';
    while (ui.firstChild) { el.appendChild(ui.firstChild); }
    var pre = el.querySelector(".cw-code pre"), rows = el.querySelectorAll(".cw-l"), tb = el.querySelector(".dg-tabs");
    // keep the box as tall as the full program, so Write mode does not move the buttons
    if (pre.offsetHeight) { pre.style.height = pre.offsetHeight + "px"; }
    function go(i, moved){
      var prev = cur;
      cur = Math.max(0, Math.min(steps.length - 1, i));
      var s = steps[cur], seen = false, lastBlank = true, first = null;
      el.classList.toggle("writing", !!write);
      [].forEach.call(rows, function(r, k){
        var n = k + 1, o = owner[n], on = o === cur;
        // Write mode: a line shows once its step is reached. Blank lines show between visible lines, never twice in a row.
        var show = !write || (blank[k] ? seen && !lastBlank && rest(k) : o === undefined || o <= cur);
        if (show && !blank[k]) { seen = true; }
        if (show) { lastBlank = blank[k]; }
        r.hidden = !show;
        r.classList.toggle("on", on);
        r.classList.toggle("dim", !on && !blank[k]);
        r.classList.toggle("new", !!write && on && moved && cur > prev);
        if (on && !first) { first = r; }
      });
      function rest(k){ for (var j = k + 1; j < rows.length; j++) { if (!blank[j]) { var o = owner[j + 1]; if (o === undefined || o <= cur) { return true; } } } return false; }
      el.querySelector(".cw-meta").innerHTML = (s.place ? '<span class="cw-badge ' + s.place + '">' + s.place.toUpperCase() + "</span><span>" + (s.place === "gpu" ? T("runs on the GPU") : T("runs on the CPU")) + "</span>" : "") +
        (s.spec ? '<span class="cw-ln">' + (s.lines.length > 1 ? F("lines {0}", s.spec.replace(/,/g, ", ")) : F("line {0}", s.spec)) + "</span>" : "");
      el.querySelector(".cw-text").innerHTML = s.html;
      el.querySelector(".prev").disabled = cur === 0;
      el.querySelector(".next").disabled = cur === steps.length - 1;
      el.querySelector(".pos").textContent = F("step {0} of {1}", cur + 1, steps.length);
      el.querySelector(".cw-hint").textContent = write ? T("The program grows one step at a time, in the order you would type it.") : T("Every line is shown. Click a line to jump to the step that explains it.");
      el.querySelectorAll(".cw-dots button").forEach(function(d, k){ d.classList.toggle("on", k === cur); d.classList.toggle("done", k < cur); d.setAttribute("aria-current", k === cur ? "step" : "false"); });
      // Scroll the code box only, never the page.
      if (first) {
        var top = first.offsetTop, end = top + first.offsetHeight;
        if (top < pre.scrollTop + 36 || end > pre.scrollTop + pre.clientHeight) { pre.scrollTop = Math.max(0, top - 56); }
      }
    }
    onSegs(tb, function(i){ write = i; go(cur); });
    el.querySelector(".prev").addEventListener("click", function(){ go(cur - 1, 1); });
    el.querySelector(".next").addEventListener("click", function(){ go(cur + 1, 1); });
    el.querySelector(".cw-dots").addEventListener("click", function(e){ var d = e.target.closest("[data-s]"); if (d) { go(+d.dataset.s, 1); } });
    pre.addEventListener("click", function(e){
      var r = e.target.closest(".cw-l"), o = r && owner[r.dataset.n];
      if (o !== undefined && !(window.getSelection && String(getSelection()))) { go(o, 1); }
    });
    el.addEventListener("keydown", function(e){
      if (e.altKey || e.ctrlKey || e.metaKey) { return; }
      var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); go(cur + d, 1); }
      else if (e.key === "Home" || e.key === "End") { e.preventDefault(); go(e.key === "Home" ? 0 : steps.length - 1, 1); }
    });
    go(0);
  });
})();

(function(){
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !window.IntersectionObserver) { return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) { return; }
      io.unobserve(e.target);
      setTimeout(function(){ e.target.classList.add("revealed"); }, Math.min((e.target.dataset.revealIndex || 0) * 45, 260));
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  document.querySelectorAll("section:not(.hero) > .wrap > *").forEach(function(el, i){
    if (el.getBoundingClientRect().top < innerHeight) { return; }
    el.dataset.revealIndex = i % 8;
    el.classList.add("reveal");
    io.observe(el);
  });
})();

document.querySelectorAll(".side details").forEach(function(d){ if (matchMedia("(max-width:900px)").matches) { d.open = false; } });


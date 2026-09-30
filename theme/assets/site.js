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
    var i = li.innerHTML.indexOf(": ");
    if (i > 0) { li.innerHTML = '<b class="g-term">' + li.innerHTML.slice(0, i) + "</b><span>" + li.innerHTML.slice(i + 2) + "</span>"; }
  });
});

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
      '<div class="dg-legend"><span><i style="background:var(--accent)"></i><i style="background:var(--cool)"></i><i style="background:#e3b341"></i><i style="background:#bc8cff"></i>' + T("warps 0 1 2 3, repeating") + '</span><span><i style="background:var(--border)"></i>' + T("idle lane") + '</span><span>' + T("one row = one warp = 32 lanes") + '</span></div>' +
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
          T("It compiles, then the driver rejects it at runtime: no output, no crash. <code>cudaGetLastError()</code> returns <code>cudaErrorInvalidConfiguration</code>.") + "</div>";
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
        ? F("block <b>{0}</b> · warp <b>{1}</b> · lane <b>{2}</b> is <em>idle</em>: the warp is scheduled as 32 lanes, but only {3} of them have a thread.", b, w, l, N - w * 32)
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
      same.map(function(x){ return "<span>" + x + "</span>"; }).join("") + "</div>";
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

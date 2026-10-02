// Diagrams for the GPU track. Each one is a tag a lesson drops in, e.g. <arch-timeline focus="Volta"></arch-timeline>.

function def(name, build){
  customElements.define(name, class extends HTMLElement {
    connectedCallback(){
      if (this.ready) { return; }
      this.ready = true;
      this.classList.add("dg");
      build(this, this.querySelector.bind(this));
    }
  });
}
function tabs(items, on){
  return '<div class="dg-tabs">' + items.map(function(t, i){
    return '<button type="button" data-i="' + i + '"' + (i === on ? ' class="on"' : "") + ">" + t + "</button>";
  }).join("") + "</div>";
}
function onTabs(box, fn){
  box.querySelectorAll("button").forEach(function(b){
    b.addEventListener("click", function(){
      box.querySelectorAll("button").forEach(function(x){ x.classList.toggle("on", x === b); });
      fn(+b.dataset.i);
    });
  });
}
function pick(el, fn){
  el.addEventListener("click", function(e){
    var b = e.target.closest("[data-k]");
    if (!b || !el.contains(b)) { return; }
    el.querySelectorAll("[data-k].on").forEach(function(x){ x.classList.remove("on"); });
    b.classList.add("on");
    fn(b.dataset.k, b);
  });
}

// A horizontal timeline: click a node to read it. Shared by the history and architecture lessons.
function timeline(el, title, items, focus, card){
  var eras = [];
  items.forEach(function(it){ if (!eras.length || eras[eras.length - 1].n !== it.era) { eras.push({ n: it.era, c: 0 }); } eras[eras.length - 1].c++; });
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + title + '</span><span class="dg-note">' + T("click a node") + '</span></div>' +
    '<div class="dg-tl"><div class="dg-eras">' + eras.map(function(e, i){ return '<span class="e' + i + '" style="flex:' + e.c + '">' + e.n + "</span>"; }).join("") + "</div>" +
    '<div class="dg-nodes">' + items.map(function(it, i){
      return '<button type="button" data-k="' + i + '"' + (it.dim ? ' class="dim"' : "") + "><b>" + it.n + "</b><span>" + it.y + "</span>" + (it.bar ? '<i style="--h:' + it.bar + '"></i>' : "") + "</button>";
    }).join("") + '</div></div><div class="dg-info"></div>';
  var info = el.querySelector(".dg-info");
  pick(el.querySelector(".dg-nodes"), function(k){ info.innerHTML = card(items[+k]); });
  var start = Math.max(0, items.findIndex(function(it){ return it.n === focus; }));
  el.querySelectorAll(".dg-nodes button")[start].click();
}

def("gpu-history", function(el){
  var items = [
    { n: T("Founded"), y: "1993", era: T("graphics"), t: T("NVIDIA is founded.") },
    { n: "NV1", y: "1995", era: T("graphics"), t: T("The first product. Very small memory and almost no parallel work.") },
    { n: "RIVA 128", y: "1997", era: T("graphics"), t: T("3D graphics become fast for everyone, not only experts.") },
    { n: "GeForce 256", y: "1999", era: T("graphics"), t: T("The GeForce line starts. Many people can now buy a GPU.") },
    { n: "CUDA", y: "2007", era: T("compute"), t: T("CUDA arrives. You can now program a GPU for any math, not only graphics.") },
    { n: "AlexNet", y: "2012", era: T("AI"), t: T("A neural network trained on two GeForce cards wins a big contest. AI moves to GPUs.") },
    { n: T("Today"), y: "2020s", era: T("AI"), t: T("GPUs run games, AI, cloud and science. They are compute machines now.") }
  ];
  timeline(el, T("From graphics card to compute platform"), items, "GeForce 256", function(it){
    return "<b>" + it.n + " · " + it.y + "</b><br>" + it.t;
  });
});

var ARCHS = [
  { n: "Fermi", y: "2010", era: T("graphics & general compute"), cc: "2.x", tc: 0, chip: "GF100", tr: 3.0, t: T("Graphics and general compute in one design.") },
  { n: "Kepler", y: "2012", era: T("graphics & general compute"), cc: "3.x", tc: 0, chip: "GK110", tr: 7.1, t: T("More cores, less power per job.") },
  { n: "Maxwell", y: "2014", era: T("graphics & general compute"), cc: "5.x", tc: 0, chip: "GM200", tr: 8.0, t: T("Even more work per watt.") },
  { n: "Pascal", y: "2016", era: T("graphics & general compute"), cc: "6.x", tc: 0, chip: "GP100", tr: 15.3, t: T("Faster memory. Still a general-purpose design.") },
  { n: "Volta", y: "2017", era: T("AI becomes central"), cc: "7.0", tc: 1, chip: "GV100", tr: 21.1, t: T("Tensor Cores arrive. GPUs turn toward AI.") },
  { n: "Ampere", y: "2020", era: T("AI becomes central"), cc: "8.x", tc: 3, chip: "GA100", tr: 54.2, t: T("Stronger Tensor Cores and more memory speed.") },
  { n: "Hopper", y: "2022", era: T("AI becomes central"), cc: "9.0", tc: 4, chip: "GH100", tr: 80, t: T("Built for large AI models. Adds FP8.") },
  { n: "Blackwell", y: "2024", era: T("AI becomes central"), cc: "10.0 · 10.3 · 12.0", tc: 5, chip: "B200", tr: 208, t: T("Adds NVFP4, an even smaller number format for AI.") },
  { n: "Rubin", y: "2026", era: T("next"), cc: "10.7", t: T("Now arriving. New Tensor Cores and HBM4 memory.") },
  { n: "Rubin Ultra", y: "2027", era: T("next"), cc: "·", t: T("Planned. A bigger Rubin.") },
  { n: "Feynman", y: "2028", era: T("next"), cc: "·", t: T("Planned. Still more AI.") }
];
ARCHS.forEach(function(a){ if (a.tr) { a.bar = Math.sqrt(a.tr / 208).toFixed(3); } });

def("arch-timeline", function(el){
  timeline(el, T("NVIDIA architectures, and what each one changed"), ARCHS, el.getAttribute("focus") || "Volta", function(a){
    return "<b>" + a.n + " · " + a.y + "</b>" + (a.cc !== "·" ? " · " + T("compute capability") + " <b>" + a.cc + "</b>" : "") + "<br>" + a.t;
  });
});

def("cpu-vs-gpu", function(el){
  var devs = [{ n: "CPU", cores: 8, t: 1, d: T("8 fast cores · 1 tick per piece") }, { n: "GPU", cores: 64, t: 4, d: T("64 slower cores · 4 ticks per piece") }];
  var tasks = [{ n: T("64 independent pieces"), p: 64, chain: false }, { n: T("8 steps, each needs the last"), p: 8, chain: true }];
  var task = tasks[0], raf = 0;
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Same work, two designs") + '</span>' + tabs(tasks.map(function(t){ return t.n; }), 0) + "</div>" +
    devs.map(function(d){
      var c = ""; for (var i = 0; i < d.cores; i++) { c += "<i></i>"; }
      return '<div class="dg-dev"><div class="dg-dev-h"><b>' + d.n + "</b><span>" + d.d + '</span></div><div class="dg-cores ' + d.n + '">' + c +
        '</div><div class="dg-track"><i></i><span></span></div></div>';
    }).join("") + '<div class="dg-head"><button class="dg-btn" type="button">' + T("run") + '</button><span class="dg-note"></span></div>';
  var rows = el.querySelectorAll(".dg-dev"), note = el.querySelector(".dg-note");
  function total(d){ return task.chain ? task.p * d.t : Math.ceil(task.p / d.cores) * d.t; }
  function frame(now){
    devs.forEach(function(d, k){
      var T = total(d), done = now >= T, round = Math.floor(now / d.t);
      var active = done ? 0 : task.chain ? 1 : Math.min(d.cores, task.p - round * d.cores);
      rows[k].querySelectorAll(".dg-cores i").forEach(function(c, i){ c.classList.toggle("a", i < active); });
      rows[k].querySelector(".dg-track i").style.width = Math.min(100, now / T * 100) + "%";
      rows[k].querySelector(".dg-track span").textContent = done ? F("{0} ticks", T) : "";
    });
  }
  function run(){
    cancelAnimationFrame(raf);
    var end = Math.max.apply(null, devs.map(total)), t0 = performance.now();
    note.textContent = "";
    (function step(ts){
      var now = Math.min(end, (ts - t0) / 110);
      frame(now);
      if (now < end) { raf = requestAnimationFrame(step); return; }
      var c = total(devs[0]), g = total(devs[1]);
      note.textContent = g < c ? F("GPU wins, {0} vs {1} ticks. Many slow cores beat a few fast ones when work can be split.", g, c)
        : F("CPU wins, {0} vs {1} ticks. When each step waits for the last one, only speed matters.", c, g);
    })(t0);
  }
  onTabs(el.querySelector(".dg-tabs"), function(i){ task = tasks[i]; run(); });
  el.querySelector(".dg-btn").addEventListener("click", run);
  frame(0);
});

def("gpu-anatomy", function(el){
  var P = {
    cpu: [T("CPU and system RAM"), T("Runs your program and tells the GPU what to do. It has its own memory.")],
    pcie: ["PCIe", T("The link between CPU and GPU. Data goes over, results come back. Too much copying makes it slow.")],
    sm: [T("Streaming Multiprocessor (SM)"), T("A small processor inside the GPU. A GPU is many SMs working together.")],
    l2: [T("L2 cache"), T("A cache shared by all SMs. Bigger but slower than memory inside an SM.")],
    vram: ["VRAM", T("The GPU's own big memory. The slowest level.")],
    sched: [T("Warp schedulers"), T("Pick which group of 32 threads runs next.")],
    reg: [T("Registers"), T("The fastest storage. Each thread has its own.")],
    fp: [T("FP32 units"), T("Math with decimal numbers.")],
    int: [T("INT32 units"), T("Math with whole numbers, like counters and indexes.")],
    tc: ["Tensor Cores", T("Fast matrix math for AI.")],
    sfu: [T("Special function units"), T("Harder math like sin, cos and square roots.")],
    ldst: [T("Load / store units"), T("Move data between memory and the math units.")],
    smem: [T("Shared memory and L1"), T("Fast memory inside the SM. Threads in a block use it to share data.")]
  };
  var sms = ""; for (var i = 0; i < 12; i++) { sms += '<button type="button" data-k="sm">SM ' + i + "</button>"; }
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("What sits where") + '</span><span class="dg-note">' + T("click any part") + '</span></div>' +
    '<div class="dg-anat"><div class="dg-col"><span class="dg-lbl">' + T("host") + '</span><button type="button" data-k="cpu" class="tall">CPU<br>' + T("system RAM") + '</button></div>' +
    '<button type="button" data-k="pcie" class="dg-link">PCIe<br>⇄</button>' +
    '<div class="dg-col dg-gpu"><span class="dg-lbl">GPU</span><div class="dg-sms">' + sms + '</div><button type="button" data-k="l2">' + T("L2 cache · shared by all SMs") + '</button><button type="button" data-k="vram">VRAM</button></div>' +
    '<div class="dg-col dg-smx"><span class="dg-lbl">' + T("inside one SM") + '</span><button type="button" data-k="sched">' + T("warp schedulers") + '</button><button type="button" data-k="reg">' + T("register file") + '</button>' +
    '<div class="dg-units"><button type="button" data-k="fp">FP32</button><button type="button" data-k="int">INT32</button><button type="button" data-k="tc">Tensor</button><button type="button" data-k="sfu">SFU</button><button type="button" data-k="ldst">LD/ST</button></div>' +
    '<button type="button" data-k="smem">' + T("shared memory / L1") + '</button></div></div><div class="dg-info"></div>';
  var info = el.querySelector(".dg-info");
  pick(el.querySelector(".dg-anat"), function(k){ info.innerHTML = "<b>" + P[k][0] + "</b><br>" + P[k][1]; });
  el.querySelector('[data-k="sm"]').click();
});

def("arch-matrix", function(el){
  var cols = [["Tegra · Jetson", T("mobile, embedded")], ["GeForce", T("gaming, creators")], ["RTX pro", T("workstations")], [T("Data Center"), T("AI, HPC, cloud")]];
  var rows = [["Ampere", ["Jetson Orin", "RTX 3090", "RTX A6000", "A100"]], ["Ada Lovelace", ["", "RTX 4090", "RTX 6000 Ada", "L40S"]],
    ["Hopper", ["", "", "", "H100"]], ["Blackwell", ["Jetson Thor", "RTX 5090", "RTX PRO 6000", "B200"]]];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Architecture × generation") + '</span><span class="dg-note">' + T("click a GPU") + '</span></div>' +
    '<div class="dg-scroll"><table class="dg-mx"><tr><th><span>' + T("how it is built ↓") + '</span><span>' + T("where it is used →") + '</span></th>' +
    cols.map(function(c){ return "<th>" + c[0] + "<small>" + c[1] + "</small></th>"; }).join("") + "</tr>" +
    rows.map(function(r, i){
      return '<tr><th>' + r[0] + "</th>" + r[1].map(function(g, j){
        return "<td>" + (g ? '<button type="button" data-k="' + i + "," + j + '">' + g + "</button>" : '<span class="dg-none">·</span>') + "</td>";
      }).join("") + "</tr>";
    }).join("") + '</table></div><div class="dg-info"></div>';
  var info = el.querySelector(".dg-info");
  pick(el.querySelector(".dg-mx"), function(k){
    var ij = k.split(",").map(Number), r = rows[ij[0]], name = r[1][ij[1]];
    el.querySelectorAll(".dg-mx td,.dg-mx th").forEach(function(c){ c.classList.remove("row", "col"); });
    el.querySelectorAll(".dg-mx tr")[ij[0] + 1].querySelectorAll("td").forEach(function(c){ c.classList.add("row"); });
    el.querySelectorAll(".dg-mx tr").forEach(function(tr, i){ if (i) { tr.children[ij[1] + 1].classList.add("col"); } });
    var mates = r[1].filter(function(g){ return g && g !== name; });
    info.innerHTML = F("<b>{0}</b> has architecture <em>{1}</em> (how it is built) and generation <em>{2}</em> (where it is used).", name, r[0], cols[ij[1]][0]) +
      (mates.length ? "<br>" + F("The same design is also used as {0}.", mates.join(", ")) : "<br>" + F("{0} is only made for this use.", r[0]));
  });
  el.querySelector('[data-k="0,1"]').click();
});

def("gpu-compare", function(el){
  var rows = [[T("Chip"), "GA102", "GA100"], [T("Architecture"), "Ampere", "Ampere"], [T("Generation"), "GeForce", T("Data Center")],
    [T("FP32 CUDA cores"), "10,496", "6,912"], ["Tensor Cores", F("{0}, 3rd gen", "328"), F("{0}, 3rd gen", "432")], [T("Memory"), "24 GB GDDR6X", "40 GB HBM2"], [T("Bandwidth"), "936 GB/s", "1,555 GB/s"], [T("Cooling"), T("fans on the card"), T("passive, server airflow")]];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">RTX 3090 vs A100</span>' + tabs([T("everything"), T("what is the same"), T("what differs")], 0) + "</div>" +
    '<table class="dg-cmp"><tr><th></th><th>RTX 3090</th><th>A100 40 GB</th></tr>' + rows.map(function(r){
      return '<tr class="' + (r[1] === r[2] ? "same" : "diff") + '"><th>' + r[0] + "</th><td>" + r[1] + "</td><td>" + r[2] + "</td></tr>";
    }).join("") + "</table>" +
    '<div class="dg-bars"><div><span>RTX 3090</span><i style="width:100%"></i><b>10,496</b></div><div><span>A100</span><i style="width:65.9%"></i><b>6,912</b></div></div>' +
    '<p class="dg-note">' + T("The big core number counts only one kind of core. The A100 has fewer of them but more Tensor Cores and faster memory. Same architecture, different job.") + "</p>";
  var cmp = el.querySelector(".dg-cmp");
  onTabs(el.querySelector(".dg-tabs"), function(i){ cmp.className = "dg-cmp" + ["", " only-same", " only-diff"][i]; });
});

def("chip-vs-gpu", function(el){
  var kinds = [
    { chip: "GA102", vram: T("GDDR6X chips around the die"), pwr: T("power stages + 12-pin connector"), io: "HDMI · DisplayPort", cool: T("heatsink + fans") },
    { chip: "GA100", vram: T("HBM2 stacks on the package"), pwr: T("power from the server board"), io: T("no display outputs"), cool: T("passive heatsink, server fans") }
  ];
  var steps = [T("chip"), "+ VRAM", T("+ power"), T("+ outputs"), T("+ cooling")], step = 0, kind = 0;
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("GPU = chip + everything to make it usable") + '</span>' + tabs([T("GeForce card"), T("Data center module")], 0) + "</div>" +
    tabs(steps, 0) + '<div class="dg-board"><div class="p cool" data-s="4"></div><div class="p vram" data-s="1"></div><div class="p chip" data-s="0"></div>' +
    '<div class="p vram v2" data-s="1"></div><div class="p pwr" data-s="2"></div><div class="p io" data-s="3"></div></div><div class="dg-info"></div>';
  var tb = el.querySelectorAll(".dg-tabs");
  function draw(){
    var k = kinds[kind];
    el.querySelector(".dg-board").classList.toggle("dc", kind === 1);
    el.querySelectorAll(".dg-board .p").forEach(function(p){
      var s = +p.dataset.s, key = ["chip", "vram", "pwr", "io", "cool"][s];
      p.classList.toggle("off", s > step);
      p.innerHTML = s === 0 ? "<b>" + T("GPU chip") + "</b><small>" + k.chip + "</small>" : "<small>" + k[key] + "</small>";
    });
    el.querySelector(".dg-info").innerHTML = step === 0
      ? T("<b>The chip alone.</b> The silicon that does the math. No memory, no power, no cooling.")
      : F("<b>The GPU</b> = {0}.", [T("the chip"), "VRAM", T("power delivery"), T("outputs"), T("cooling")].slice(0, step + 1).join(" + ")) +
        (kind === 1 && step >= 3 ? " " + T("A data center module has no fans and no screen outputs. The server cools it.") : "");
  }
  onTabs(tb[0], function(i){ kind = i; draw(); });
  onTabs(tb[1], function(i){ step = i; draw(); });
  draw();
});

def("arch-family", function(el){
  var fams = [
    { n: "Ada Lovelace", aim: T("consumer and workstation first"), chips: [
      { c: "AD102", full: 144, p: [["RTX 4090", 128, "GeForce"], ["L40S", 142, T("Data Center")]] },
      { c: "AD103", full: 80, p: [["RTX 4080", 76, "GeForce"]] },
      { c: "AD104", full: 60, p: [["RTX 4070 Ti", 60, "GeForce"]] }] },
    { n: "Hopper", aim: T("data center AI only"), chips: [{ c: "GH100", full: 144, p: [["H100 SXM", 132, T("Data Center")]] }] }
  ];
  var fam = 0;
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("One architecture, many chips") + '</span>' + tabs(fams.map(function(f){ return f.n; }), 0) + '</div><div class="dg-tree"></div><div class="dg-info"></div>';
  var tree = el.querySelector(".dg-tree"), info = el.querySelector(".dg-info");
  function draw(){
    var f = fams[fam];
    tree.innerHTML = '<div class="dg-lvl"><span class="dg-lbl">' + T("architecture") + '</span><div class="dg-node arch"><b>' + f.n + "</b><small>" + f.aim + "</small></div></div>" +
      '<div class="dg-lvl"><span class="dg-lbl">' + T("chips") + '</span>' + f.chips.map(function(c, i){
        return '<div class="dg-branch"><div class="dg-node"><b>' + c.c + "</b><small>" + F("{0} SMs on the full die", c.full) + "</small></div>" +
          '<div class="dg-leaves">' + c.p.map(function(p, j){ return '<button type="button" data-k="' + i + "," + j + '"><b>' + p[0] + "</b><small>" + p[2] + "</small></button>"; }).join("") + "</div></div>";
      }).join("") + "</div>";
    tree.querySelector("[data-k]").click();
  }
  pick(tree, function(k){
    var ij = k.split(",").map(Number), f = fams[fam], c = f.chips[ij[0]], p = c.p[ij[1]], cells = "";
    for (var s = 0; s < c.full; s++) { cells += '<i class="' + (s < p[1] ? "a" : "") + '"></i>'; }
    info.innerHTML = F("<b>{0}</b> uses <b>{1}</b> with <em>{2} of {3}</em> SMs turned on", p[0], c.c, p[1], c.full) +
      (p[1] < c.full ? T(". Same chip, some parts turned off.") : T(", the full die.")) +
      '<div class="dg-smgrid">' + cells + "</div>" +
      (p[2] === "GeForce" ? T("Companies like ASUS and MSI then build their own cards with it.") :
        T("Data center parts go straight into servers."));
  });
  onTabs(el.querySelector(".dg-tabs"), function(i){ fam = i; draw(); });
  draw();
});

def("bandwidth-sim", function(el){
  var CORES = 4, JOBS = 3, WORK = 1;
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("4 cores, one memory") + '</span><div class="dg-ctl"><label>' + F("memory feeds {0} core(s) per tick", '<b class="n">4</b>') + ' <input type="range" min="1" max="4" value="1"></label><button class="dg-btn" type="button">' + T("play") + '</button></div></div>' +
    '<div class="dg-gantt"></div><div class="dg-legend"><span><i class="L"></i>' + T("receiving data") + '</span><span><i class="C"></i>' + T("computing") + '</span><span><i class="W"></i>' + T("waiting for memory") + '</span></div><div class="dg-info"></div>';
  var input = el.querySelector("input");
  function sim(N){
    var rows = [], left = [], free = [], queue = [];
    for (var c = 0; c < CORES; c++) { rows.push([]); left.push(JOBS); free.push(0); queue.push(c); }
    for (var t = 0; t < 60; t++) {
      if (left.every(function(x){ return !x; }) && free.every(function(f){ return f <= t; })) { return { rows: rows, T: t }; }
      var ready = queue.filter(function(c){ return left[c] && free[c] <= t; }), served = ready.slice(0, N);
      served.forEach(function(c){
        rows[c][t] = "L";
        for (var w = 1; w <= WORK; w++) { rows[c][t + w] = "C"; }
        free[c] = t + 1 + WORK; left[c]--;
        queue.splice(queue.indexOf(c), 1); queue.push(c);
      });
      ready.slice(N).forEach(function(c){ rows[c][t] = "W"; });
    }
  }
  function draw(){
    var N = +input.value, r = sim(N), busy = 0, html = "";
    el.querySelector(".n").textContent = N;
    r.rows.forEach(function(row, c){
      html += "<div><span>" + F("core {0}", c) + "</span>";
      for (var t = 0; t < 14; t++) { html += '<i data-t="' + t + '" class="' + (row[t] || "") + '"></i>'; if (row[t] === "C") { busy++; } }
      html += "</div>";
    });
    el.querySelector(".dg-gantt").innerHTML = html;
    el.querySelector(".dg-info").innerHTML = F("Done after <b>{0} ticks</b>. Cores spent <em>{1}%</em> of the time computing.", r.T, Math.round(busy / (CORES * r.T) * 100)) +
      (N === 1 ? " " + T("Memory feeds one core at a time. The others wait. This is a memory bottleneck.") : N === 4 ? " " + T("Memory feeds all four at once. Nobody waits.") : "");
  }
  var timer = 0;
  el.querySelector(".dg-btn").addEventListener("click", function(){
    clearInterval(timer);
    var cells = el.querySelectorAll(".dg-gantt i"), now = -1;
    cells.forEach(function(c){ c.style.opacity = .1; });
    timer = setInterval(function(){
      now++;
      cells.forEach(function(c){ if (+c.dataset.t === now) { c.style.opacity = 1; } });
      if (now >= 13) { clearInterval(timer); }
    }, 280);
  });
  input.addEventListener("input", function(){ clearInterval(timer); draw(); });
  draw();
});

def("bandwidth-calc", function(el){
  var presets = [["RTX 3090", 384, 19.5, "GDDR6X"], ["RTX 4090", 384, 21, "GDDR6X"], ["A100 40 GB", 5120, 2.43, "HBM2"], ["H100 SXM", 5120, 5.24, "HBM3"], ["B200", 8192, 8, "HBM3e"]];
  var widths = [128, 192, 256, 320, 384, 512, 1024, 2048, 3072, 4096, 5120, 6144, 8192];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("bandwidth = bus width × speed per pin") + '</span>' + tabs(presets.map(function(p){ return p[0]; }), 0) + "</div>" +
    '<div class="dg-ctl"><label>' + T("bus width") + ' <b class="w"></b> <input type="range" min="0" max="' + (widths.length - 1) + '"></label>' +
    '<label>' + T("speed per pin") + ' <b class="s"></b> <input type="range" min="1" max="32" step="0.01"></label></div>' +
    '<div class="dg-road"><div class="lanes"></div></div><div class="dg-big"><b></b> GB/s <span></span></div>';
  var ins = el.querySelectorAll("input"), tech = "";
  function draw(){
    var w = widths[+ins[0].value], s = +ins[1].value, gb = w * s / 8;
    el.querySelector(".w").textContent = w + "-bit";
    el.querySelector(".s").textContent = s + " Gb/s";
    el.querySelector(".dg-big b").textContent = Math.round(gb).toLocaleString("en-US");
    el.querySelector(".dg-big span").textContent = tech;
    var lanes = el.querySelector(".lanes");
    lanes.style.setProperty("--n", Math.max(2, Math.round(w / 128)));
    lanes.style.setProperty("--speed", (6 / s).toFixed(2) + "s");
  }
  function preset(i){
    var p = presets[i]; tech = p[3] + " · " + p[0];
    ins[0].value = widths.indexOf(p[1]); ins[1].value = p[2]; draw();
  }
  ins.forEach(function(i){ i.addEventListener("input", function(){ tech = T("custom"); draw(); }); });
  onTabs(el.querySelector(".dg-tabs"), preset);
  preset(0);
});

def("cores-clock", function(el){
  var OPS = 200;
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("200 operations, two GPUs") + '</span></div>' + ["A", "B"].map(function(n, i){
    return '<div class="dg-dev"><div class="dg-dev-h"><b>GPU ' + n + '</b><div class="dg-ctl"><label>' + T("cores") + ' <b class="c"></b><input type="range" min="50" max="400" step="50" value="' + (i ? 200 : 100) + '"></label>' +
      '<label>' + T("seconds per round") + ' <b class="t"></b><input type="range" min="1" max="5" value="' + (i ? 4 : 1) + '"></label></div></div><div class="dg-rounds"></div></div>';
  }).join("") + '<div class="dg-info"></div>';
  var devs = el.querySelectorAll(".dg-dev");
  function draw(){
    var res = [];
    devs.forEach(function(d){
      var ins = d.querySelectorAll("input"), c = +ins[0].value, t = +ins[1].value;
      d.querySelector(".c").textContent = c; d.querySelector(".t").textContent = t + " s";
      res.push({ r: Math.ceil(OPS / c), t: t });
    });
    var max = Math.max(res[0].r * res[0].t, res[1].r * res[1].t);
    devs.forEach(function(d, k){
      var r = res[k], bar = "";
      for (var i = 0; i < r.r; i++) { bar += '<i style="width:' + (r.t / max * 88) + '%">R' + (i + 1) + "</i>"; }
      d.querySelector(".dg-rounds").innerHTML = bar + "<b>" + r.r * r.t + " s</b>";
    });
    var a = res[0].r * res[0].t, b = res[1].r * res[1].t;
    el.querySelector(".dg-info").innerHTML = a === b ? T("A tie.") : F("GPU <b>{0}</b> finishes first.", a < b ? "A" : "B") + " " +
      T("More cores means fewer rounds. A faster clock means shorter rounds. You need both.");
  }
  el.querySelectorAll("input").forEach(function(i){ i.addEventListener("input", draw); });
  draw();
});

def("spec-reader", function(el){
  var gpus = [
    ["RTX 3090", "GA102", "Ampere", "GeForce", T("gaming, creators, personal workstations"), true],
    ["A100", "GA100", "Ampere", T("Data Center"), T("AI training, HPC, cloud"), false],
    ["RTX 4090", "AD102", "Ada Lovelace", "GeForce", T("gaming, creators"), true],
    ["L40S", "AD102", "Ada Lovelace", T("Data Center"), T("inference and graphics in servers"), false],
    ["H100", "GH100", "Hopper", T("Data Center"), T("training large AI models"), false],
    ["RTX 5090", "GB202", "Blackwell", "GeForce", T("gaming, creators, local AI"), true]
  ];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Three questions for any spec page") + '</span>' + tabs(gpus.map(function(g){ return g[0]; }), 0) + '</div><div class="dg-qa"></div>';
  function draw(i){
    var g = gpus[i];
    el.querySelector(".dg-qa").innerHTML =
      '<div><span>1 · ' + T("What architecture?") + "</span><b>" + g[2] + "</b><small>" + F("chip {0}, how it is built", g[1]) + "</small></div>" +
      '<div><span>2 · ' + T("What category?") + "</span><b>" + g[3] + "</b><small>" + T("where it is used") + "</small></div>" +
      '<div><span>3 · ' + T("Built for what?") + "</span><b>" + g[4] + "</b><small>" + T("the problem it solves") + "</small></div>" +
      '<div class="clue ' + (g[5] ? "fan" : "") + '"><span>' + T("visual clue") + "</span><b>" + (g[5] ? T("big fans") : T("no fans")) + "</b><small>" +
      (g[5] ? T("cools itself, so it lives in a desktop") : T("cooled by the server, so it lives in a rack")) + "</small></div>";
  }
  onTabs(el.querySelector(".dg-tabs"), draw);
  draw(0);
});

def("cc-explorer", function(el){
  var cc = [
    ["Maxwell", "5.x", ["no*", "no", "no", "no"], "6.5"], ["Pascal", "6.x", ["yes", "no", "no", "no"], "8.0"],
    ["Volta", "7.0", ["yes", "1st gen", "no", "no"], "9.0"], ["Ampere", "8.x", ["yes", "3rd gen", "no", "no"], "11.0"],
    ["Hopper", "9.0", ["yes", "4th gen", "yes", "no"], "11.8"], ["Blackwell", "10.0 · 12.0", ["yes", "5th gen", "yes", "yes"], "12.8"]
  ];
  var feats = [T("FP16 math"), "Tensor Cores", "FP8", "NVFP4"];
  var say = { "no*": T("no*"), no: T("no"), yes: T("yes"), "1st gen": T("1st gen"), "3rd gen": T("3rd gen"), "4th gen": T("4th gen"), "5th gen": T("5th gen") };
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("What does my GPU support?") + '</span>' + tabs(cc.map(function(c){ return c[0] + " " + c[1]; }), 3) + "</div>" +
    '<div class="dg-ccnum"></div><div class="dg-feats"></div><p class="dg-note">* ' + T("Only CC 5.3 has FP16 here. If the hardware is missing, software cannot add it.") + "</p>";
  function draw(i){
    var c = cc[i], v = c[1].split(" ")[0].split(".");
    el.querySelector(".dg-ccnum").innerHTML = "<span><b>" + v[0] + "</b><small>" + T("major, the architecture") + "</small></span><span class='dot'>.</span><span><b>" + v[1] + "</b><small>" + T("minor, a revision of it") + "</small></span>" +
      "<span class='need'>" + T("needs CUDA") + "<b>≥ " + c[3] + "</b></span>";
    el.querySelector(".dg-feats").innerHTML = feats.map(function(f, k){
      var ok = c[2][k].indexOf("no") !== 0;
      return '<div class="' + (ok ? "ok" : "") + '"><span>' + (ok ? "✓" : "✕") + "</span><b>" + f + "</b><small>" + say[c[2][k]] + "</small></div>";
    }).join("");
  }
  onTabs(el.querySelector(".dg-tabs"), draw);
  draw(3);
});

def("whitepaper-map", function(el){
  var parts = [
    [T("Key features"), T("Start here. It says what the new design is for.")],
    [T("SM design"), T("The most important part. Compare the SM with the one before it.")],
    [T("Performance"), T("How much faster it is than the last one.")],
    [T("Specifications"), T("The number tables. They look the same in every paper, so they are easy to compare.")]
  ];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("How every NVIDIA white paper is laid out") + '</span><span class="dg-note">' + T('search for the chip name + "white paper" and open the official PDF') + '</span></div>' +
    '<div class="dg-steps">' + parts.map(function(p, i){ return '<button type="button" data-k="' + i + '"><span>' + (i + 1) + "</span>" + p[0] + (i === 1 ? " ★" : "") + "</button>"; }).join("") +
    '</div><div class="dg-info"></div>';
  var info = el.querySelector(".dg-info");
  pick(el.querySelector(".dg-steps"), function(k){ info.innerHTML = "<b>" + parts[k][0] + "</b><br>" + parts[k][1]; });
  el.querySelector('[data-k="1"]').click();
});

def("volta-shift", function(el){
  var stream = ["FP", "INT", "FP", "FP", "INT", "FP", "INT", "INT", "FP", "FP"];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Mixed FP and INT work, cycle by cycle") + '</span>' + tabs(["Pascal", "Volta"], 0) + '<button class="dg-btn" type="button">' + T("play") + '</button></div><div class="dg-lanes"></div><div class="dg-info"></div>' +
    '<div class="dg-title sub">' + T("Transistors per flagship chip") + '</div><div class="dg-bars tr">' +
    [["GP100 · Pascal", 15.3], ["GV100 · Volta", 21.1], ["GA100 · Ampere", 54.2], ["GH100 · Hopper", 80], ["B200 · Blackwell", 208]].map(function(b){
      return "<div><span>" + b[0] + '</span><i style="width:' + (b[1] / 208 * 100) + '%"></i><b>' + b[1] + " B</b></div>";
    }).join("") + "</div>";
  function lane(name, ops){ return "<div><span>" + name + "</span>" + ops.map(function(o, c){ return '<i data-c="' + c + '" class="' + o + '">' + o + "</i>"; }).join("") + "</div>"; }
  function draw(v){
    var fp = stream.filter(function(o){ return o === "FP"; }), it = stream.filter(function(o){ return o === "INT"; });
    el.querySelector(".dg-lanes").innerHTML = v ? lane(T("FP32 path"), fp) + lane(T("INT32 path"), it) : lane(T("shared path"), stream);
    el.querySelector(".dg-info").innerHTML = v
      ? F("<b>{0} cycles.</b> Volta has two paths, so FP and INT run at the same time.", Math.max(fp.length, it.length))
      : F("<b>{0} cycles.</b> Pascal has one path, so FP and INT take turns.", stream.length);
  }
  var timer = 0;
  function play(){
    clearInterval(timer);
    var cells = el.querySelectorAll(".dg-lanes i"), c = -1;
    cells.forEach(function(x){ x.style.opacity = .12; });
    timer = setInterval(function(){
      c++;
      cells.forEach(function(x){ if (+x.dataset.c === c) { x.style.opacity = 1; } });
      if (c >= 10) { clearInterval(timer); }
    }, 380);
  }
  el.querySelector(".dg-btn").addEventListener("click", play);
  onTabs(el.querySelector(".dg-tabs"), function(v){ clearInterval(timer); draw(v); play(); });
  draw(0);
});

def("nvcc-pipeline", function(el){
  el.innerHTML = '<div class="dg-head"><span class="dg-title">nvcc -arch=sm_89 app.cu</span>' + tabs([T("run on L40S (sm_89)"), T("run on a newer GPU")], 0) + "</div>" +
    '<div class="dg-flow"><div class="st src">app.cu<small>' + T("host + device code") + '</small></div><div class="st">nvcc<small>' + T("splits the file") + '</small></div>' +
    '<div class="fork"><div class="path"><div class="st">' + T("host code") + '</div><div class="st">g++ / MSVC</div><div class="st">' + T("CPU machine code") + '</div></div>' +
    '<div class="path"><div class="st">' + T("device code") + '</div><div class="st ptx">PTX<small>' + T("virtual ISA, kept in the binary") + '</small></div><div class="st sass">SASS sm_89<small>' + T("real instructions") + '</small></div></div></div>' +
    '<div class="st">' + T("executable") + '<small>' + T("fatbinary with SASS + PTX") + '</small></div><div class="st drv">' + T("driver") + '<small></small></div><div class="st gpu">GPU</div></div><div class="dg-info"></div>';
  function draw(i){
    var f = el.querySelector(".dg-flow");
    f.classList.toggle("jit", i === 1);
    f.querySelector(".drv small").textContent = i ? T("JIT-compiles PTX for the new GPU") : T("loads the matching SASS");
    el.querySelector(".dg-info").innerHTML = i
      ? T("The binary has no SASS for this GPU. The driver turns the stored <b>PTX</b> into SASS. The program still runs.")
      : T("The binary already has <b>SASS for sm_89</b>. The driver loads it and runs it.");
  }
  onTabs(el.querySelector(".dg-tabs"), draw);
  draw(0);
});

function stack(el, title, layers, first){
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + title + '</span><span class="dg-note">' + T("click a layer") + '</span></div><div class="dg-stack">' +
    layers.map(function(l, i){ return '<button type="button" data-k="' + i + '"' + (l[3] ? ' class="' + l[3] + '"' : "") + "><b>" + l[0] + "</b><small>" + l[1] + "</small></button>"; }).join("") +
    '</div><div class="dg-info"></div>';
  var info = el.querySelector(".dg-info");
  pick(el.querySelector(".dg-stack"), function(k){ info.innerHTML = "<b>" + layers[k][0] + "</b><br>" + layers[k][2]; });
  el.querySelector('[data-k="' + (first || 0) + '"]').click();
}

def("toolchain-stack", function(el){
  stack(el, T("You write code at the top, the GPU runs it at the bottom"), [
    ["CLion", T("where you work"), T("You write code here. Build runs CMake.")],
    ["CMake", T("the project definition"), T("Describes how to build. Works on any machine.")],
    ["nvcc · CUDA Toolkit", T("compiler, runtime, libraries"), T("The compiler and libraries. Its version decides which GPUs you can target.")],
    [T("host compiler"), T("g++ on Linux, MSVC on Windows"), T("Compiles the CPU part. On Windows this is why Visual Studio must be installed.")],
    [T("NVIDIA driver"), T("must be new enough"), T("CUDA needs it. Too old a driver breaks things.")],
    ["GPU", T("runs the kernels"), T("The hardware that runs your kernel."), "hw"]
  ], 2);
});

def("wsl-layers", function(el){
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Where each piece is installed") + '</span>' + tabs(["WSL2", "WSL1"], 0) + '</div><div class="dg-wsl"></div><div class="dg-info"></div>';
  function draw(v1){
    el.querySelector(".dg-wsl").innerHTML =
      '<div class="box linux' + (v1 ? " off" : "") + '"><span class="dg-lbl">' + F("Linux distro in WSL{0}", v1 ? "1" : "2") + "</span><b>" + T("own users, own file system") + "</b>" +
      "<div class='ok'>✓ " + T("CUDA Toolkit from the wsl-ubuntu repo") + "</div><div class='no'>✕ " + T("no NVIDIA driver here") + "</div></div>" +
      '<div class="arrow">' + (v1 ? "✕ " + T("no GPU path") : "↓ " + T("uses the host driver")) + "</div>" +
      '<div class="box win"><span class="dg-lbl">' + T("Windows host") + '</span><div class="ok">✓ ' + T("NVIDIA driver installed here, once") + '</div></div><div class="arrow">↓</div><div class="box gpu">GPU</div>';
    el.querySelector(".dg-info").innerHTML = v1
      ? T("WSL1 cannot really use the GPU. Use WSL2.")
      : T("WSL2 reaches the GPU through the Windows driver. Do not install a driver inside Linux.");
  }
  onTabs(el.querySelector(".dg-tabs"), draw);
  draw(0);
});

def("install-steps", function(el){
  var steps = [
    [T("GPU is visible"), "nvidia-smi", T("If this fails, stop and fix the driver first. CUDA cannot work without it.")],
    [T("Add NVIDIA's WSL repository"), "wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb\nsudo dpkg -i cuda-keyring_1.1-1_all.deb", T("Not apt install nvidia-cuda-toolkit, because that package is outdated.")],
    [T("Install the toolkit"), "sudo apt-get update\nsudo apt-get -y install cuda-toolkit-13-3", T("Installs nvcc, the runtime and core libraries. Not a driver.")],
    [T("Check the compiler"), "nvcc --version", T("Should report CUDA 13.x.")],
    [T("Fix PATH if nvcc is missing"), "export PATH=/usr/local/cuda/bin:$PATH", T("Add the line to .bashrc or .zshrc to keep it.")]
  ];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Install checklist") + '</span><span class="dg-note">' + F("{0} / {1} done", '<b class="n">0</b>', steps.length) + '</span></div><div class="dg-prog"><i></i></div>' +
    '<ol class="dg-check">' + steps.map(function(s, i){
      return '<li><button type="button" data-k="' + i + '" aria-label="' + T("mark done") + '">✓</button><div><b>' + s[0] + "</b><pre><code>" + s[1] + "</code></pre><small>" + s[2] + "</small></div></li>";
    }).join("") + "</ol>";
  el.querySelector(".dg-check").addEventListener("click", function(e){
    var b = e.target.closest("button");
    if (!b) { return; }
    b.parentNode.classList.toggle("done");
    var n = el.querySelectorAll(".done").length;
    el.querySelector(".n").textContent = n;
    el.querySelector(".dg-prog i").style.width = n / steps.length * 100 + "%";
  });
});

// Time to move N GB over one link: PCIe 4.0 / 5.0 x16, NVLink-C2C, or the GPU's own memory. Speeds are peak, per direction.
def("data-path", function(el){
  var links = [
    { n: "PCIe 4.0 x16", bw: 31.5, who: "L40S, A100", note: "pcie" },
    { n: "PCIe 5.0 x16", bw: 63, who: "H100, B200, RTX 5090", note: "pcie" },
    { n: "NVLink-C2C", bw: 450, who: "Grace Hopper, Grace Blackwell", note: "c2c" },
    { n: T("GPU's own memory"), bw: 864, who: "L40S GDDR6", note: "vram" }
  ];
  var notes = {
    pcie: T("Peak for pinned host memory. From pageable memory the driver first copies the data into a pinned staging buffer, so the copy is slower."),
    c2c: T("Coherent link, so the GPU can also read ordinary pageable CPU memory directly, without a staging copy."),
    vram: T("No link involved. This is how fast the L40S reads data that is already on the GPU.")
  };
  var CALM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches), on = 0;
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Moving data to the GPU") + '</span>' + tabs(links.map(function(l){ return l.n; }), 0) + "</div>" +
    '<div class="dg-ctl"><label>' + F("data size {0}", '<b class="n"></b>') + ' <input type="range" min="1" max="48" value="4" aria-label="' + T("data size in GB") + '"></label></div>' +
    '<div class="dg-big dp-big"><b></b> <span></span></div><div class="dp-bars">' + links.map(function(l, i){
      return '<div class="dp-row" data-i="' + i + '"><span class="dp-name">' + l.n + "<small>" + l.who + '</small></span><div class="dp-track"><i></i></div><b class="dp-t"></b></div>';
    }).join("") + '</div><div class="dg-info" aria-live="polite"></div>';
  var input = el.querySelector("input"), rows = el.querySelectorAll(".dp-row");
  function fmt(s){
    return s >= 1 ? s.toFixed(2) + " s" : s * 1000 >= 10 ? Math.round(s * 1000) + " ms" : (s * 1000).toFixed(1) + " ms";
  }
  function draw(){
    var gb = +input.value, max = gb / links[0].bw, l = links[on], t = gb / l.bw;
    el.querySelector(".n").textContent = gb + " GB";
    el.querySelector(".dp-big b").textContent = fmt(t);
    el.querySelector(".dp-big span").textContent = gb + " GB / " + l.bw + " GB/s";
    rows.forEach(function(r, i){
      var s = gb / links[i].bw, fill = r.querySelector("i");
      r.classList.toggle("on", i === on);
      r.querySelector(".dp-t").textContent = fmt(s);
      fill.style.transitionDuration = CALM ? "0s" : (0.15 + 1.6 * s / max).toFixed(2) + "s";
      fill.style.width = "0";
      fill.getBoundingClientRect();
      fill.style.width = (s / max * 100).toFixed(2) + "%";
    });
    el.querySelector(".dg-info").innerHTML = (l.note === "vram" ? "" : F("<em>{0}×</em> the time of reading the same data from the L40S's own memory.", (864 / l.bw).toFixed(1)) + "<br>") + notes[l.note];
  }
  onTabs(el.querySelector(".dg-tabs"), function(i){ on = i; draw(); });
  input.addEventListener("input", draw);
  draw();
});

// One warp scheduler, N resident warps. Simplified model: every warp issues for 2 cycles, then waits 8 cycles for memory.
def("latency-hiding", function(el){
  var ISSUE = 2, WAIT = 8, CYC = 30, MAX = 8, timer = 0;
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("One warp scheduler, many warps") + '</span><div class="dg-ctl"><label>' + F("resident warps {0}", '<b class="n"></b>') +
    ' <input type="range" min="1" max="' + MAX + '" value="1" aria-label="' + T("resident warps") + '"></label><button class="dg-btn" type="button">' + T("play") + '</button></div></div>' +
    '<p class="dg-note">' + F("In this simplified model each warp issues for {0} cycles, then waits {1} cycles for memory.", ISSUE, WAIT) + '</p>' +
    '<div class="lh-grid"></div><div class="dg-legend"><span><i class="C"></i>' + T("issuing") + '</span><span><i class="W"></i>' + T("waiting for memory") + '</span><span><i class="lh-r"></i>' + T("ready, waiting its turn") + '</span><span><i class="lh-idle"></i>' + T("scheduler idle") + '</span></div>' +
    '<div class="lh-meter"><span>' + T("scheduler busy") + '</span><div><i></i></div><b></b></div><div class="dg-info"></div>';
  var input = el.querySelector("input");
  function sim(N){
    var rows = [], left = [], back = [], since = [], sched = [], cur = -1;
    for (var w = 0; w < N; w++) { rows.push([]); left.push(ISSUE); back.push(0); since.push(w); }
    for (var t = 0; t < CYC; t++) {
      var ready = [];
      for (w = 0; w < N; w++) { if (back[w] <= t) { if (!left[w]) { left[w] = ISSUE; since[w] = t; } ready.push(w); } }
      // keep issuing the same warp until it stalls, else take the warp that has been ready longest
      if (ready.indexOf(cur) < 0) { cur = ready.length ? ready.reduce(function(a, b){ return since[b] < since[a] ? b : a; }) : -1; }
      for (w = 0; w < N; w++) { rows[w][t] = back[w] > t ? "W" : w === cur ? "C" : "lh-r"; }
      sched[t] = cur >= 0 ? "C" : "lh-idle";
      if (cur >= 0 && !--left[cur]) { back[cur] = t + 1 + WAIT; cur = -1; }
    }
    return { rows: rows, sched: sched };
  }
  function row(label, cells, cls){
    return '<div' + (cls ? ' class="' + cls + '"' : "") + "><span>" + label + "</span>" + cells.map(function(c, t){ return '<i data-t="' + t + '" class="' + c + '"></i>'; }).join("") + "</div>";
  }
  function draw(){
    clearInterval(timer);
    var N = +input.value, r = sim(N), busy = r.sched.filter(function(c){ return c === "C"; }).length, pct = Math.round(busy / CYC * 100), need = Math.ceil((ISSUE + WAIT) / ISSUE);
    el.querySelector(".n").textContent = N;
    el.querySelector(".lh-grid").innerHTML = r.rows.map(function(c, w){ return row(F("warp {0}", w), c); }).join("") + row(T("issue"), r.sched, "lh-s");
    el.querySelector(".lh-meter i").style.width = pct + "%";
    el.querySelector(".lh-meter b").textContent = pct + "%";
    el.querySelector(".dg-info").innerHTML = F("The scheduler issued on <b>{0} of {1}</b> cycles.", busy, CYC) + " " +
      (N < need ? F("Too few warps. When all of them wait for memory, nobody can issue. About {0} warps hide this wait.", need)
        : N === need ? T("Just enough warps. While some wait, another one is always ready.")
        : T("Already full. Extra warps only wait their turn, they do not make the scheduler faster."));
  }
  el.querySelector(".dg-btn").addEventListener("click", function(){
    draw();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { return; }
    var cells = el.querySelectorAll(".lh-grid i"), now = -1;
    cells.forEach(function(c){ c.style.opacity = .1; });
    timer = setInterval(function(){
      now++;
      cells.forEach(function(c){ if (+c.dataset.t === now) { c.style.opacity = 1; } });
      if (now >= CYC - 1) { clearInterval(timer); }
    }, 90);
  });
  input.addEventListener("input", draw);
  draw();
});

// Memory hierarchy: a stacked pyramid, registers on top, global memory at the bottom. Pick a level to read its scope, size and wait.
def("mem-hierarchy", function(el){
  var GPUS = ["L40S", "H100 SXM"];
  // wait = load latency in clock cycles from published microbenchmarks: RTX 4090 (same AD102 chip as the L40S) and H800 (Hopper, like the H100).
  var L = [
    { k: "reg", n: T("Registers"), w: 34, c: "--thread", scope: 0, where: T("inside each SM, right next to the cores"),
      size: [T("256 KB per SM (65,536 registers), at most 255 per thread"), T("256 KB per SM (65,536 registers), at most 255 per thread")], wait: [0, 0] },
    { k: "smem", n: T("Shared memory / L1"), w: 52, c: "--block", scope: 1, where: T("inside each SM, one pool split between shared memory and L1"),
      size: [T("128 KB per SM, up to 100 KB of it as shared memory"), T("256 KB per SM, up to 228 KB of it as shared memory")], wait: [30, 29], wait2: [43, 41] },
    { k: "l2", n: T("L2 cache"), w: 74, c: "--cool", scope: 2, where: T("on the GPU chip, outside the SMs"),
      size: ["96 MB", "50 MB"], wait: [273, 263] },
    { k: "gmem", n: T("Global memory"), w: 100, c: "--accent", scope: 2, where: T("memory chips beside the GPU chip, GDDR6 on the L40S and HBM3 stacks in the package on the H100"),
      size: [T("48 GB of GDDR6 at 864 GB/s"), T("80 GB of HBM3 at 3.35 TB/s")], wait: [542, 479] }
  ];
  var S = [
    { k: "const", n: T("Constant memory"), c: "--warp", scope: 2, where: T("a read-only corner of global memory, cached in each SM"),
      size: [T("64 KB, with an 8 KB cache in each SM"), T("64 KB, with an 8 KB cache in each SM")], say: T("Fast when every thread of a warp reads the same address, because one read is broadcast to all of them.") },
    { k: "local", n: T("Local memory"), c: "--red", scope: 0, where: T("in global memory, cached in L1 and L2"),
      size: [T("up to 512 KB per thread"), T("up to 512 KB per thread")], say: T("Private to one thread, but it lives off-chip. A miss in the caches costs as much as a global memory read.") }
  ];
  var gpu = 0, cur = "smem";
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Where does the data live?") + "</span>" + tabs(GPUS, 0) + "</div>" +
    '<div class="mh-pyr"><span class="mh-ax">' + T("smaller, faster") + "</span>" + L.map(function(l){
      return '<button type="button" data-k="' + l.k + '" style="--w:' + l.w + "%;--c:var(" + l.c + ')">' + l.n + "</button>";
    }).join("") + '<span class="mh-ax">' + T("bigger, slower") + "</span>" +
    '<span class="dg-lbl">' + T("also kept in global memory") + '</span><div class="mh-side">' + S.map(function(l){
      return '<button type="button" data-k="' + l.k + '" style="--c:var(' + l.c + ')">' + l.n + "</button>";
    }).join("") + '</div></div><div class="dg-info" aria-live="polite"></div>';
  var info = el.querySelector(".dg-info");
  function find(k){ return L.concat(S).filter(function(l){ return l.k === k; })[0]; }
  function draw(){
    var l = find(cur), g = GPUS[gpu], max = L[3].wait[gpu], wait;
    if (l.say) { wait = l.say; }
    else if (!l.wait[gpu]) { wait = T("No wait, because the core reads registers as part of the instruction itself."); }
    else {
      wait = F("about <em>{0} cycles</em> to load", l.wait[gpu]) + (l.wait2 ? " " + F("(about {0} on an L1 hit)", l.wait2[gpu]) : "") +
        '<div class="dg-track mh-bar"><i style="width:' + Math.round(l.wait[gpu] / max * 100) + '%"></i><span>' + F("{0}% of a global memory load", Math.round(l.wait[gpu] / max * 100)) + "</span></div>";
    }
    info.innerHTML = "<b>" + l.n + "</b> · " + l.where +
      '<div class="dg-facts mh-scope">' + [T("one thread"), T("one block"), T("whole GPU")].map(function(s, i){
        return "<span" + (i === l.scope ? ' class="on"' : "") + ">" + s + "</span>";
      }).join("") + "</div>" +
      "<div>" + F("Size on the {0} is <b>{1}</b>", g, l.size[gpu]) + "</div><div>" + wait + "</div>" +
      (l.say ? "" : '<small class="mh-src">' + (gpu ? T("Cycles measured on an H800, a Hopper GPU like the H100.") : T("Cycles measured on an RTX 4090, which uses the same AD102 chip as the L40S.")) + "</small>");
  }
  pick(el.querySelector(".mh-pyr"), function(k){ cur = k; draw(); });
  onTabs(el.querySelector(".dg-tabs"), function(i){ gpu = i; draw(); });
  el.querySelector('[data-k="smem"]').click();
});

// Lesson 12: four scales of connected GPUs, from one card to a cluster of racks.
def("multi-gpu", function(el){
  function gpus(n, cls){ var s = ""; for (var i = 0; i < n; i++) { s += '<i class="mg-g' + (cls ? " " + cls : "") + '"></i>'; } return s; }
  function trays(n){ var s = ""; for (var i = 0; i < n; i++) { s += '<span class="mg-tray">' + gpus(4) + "</span>"; } return s; }
  var levels = [
    { tab: T("one GPU"), link: "PCIe 4.0 x16", bar: "PCIe 4.0", kind: "pcie", n: "1", spec: "64 GB/s", way: 32, ex: "L40S",
      draw: '<div class="mg-one"><div class="mg-box host">CPU</div><div class="mg-link pcie v"><span>PCIe</span></div><div class="mg-box gpu">GPU<small>L40S</small></div></div>',
      info: T("<b>One GPU.</b> Its only link goes to the CPU over PCIe, 64 GB/s for both directions and 32 GB/s each way. The L40S has no NVLink, so a second L40S could only be reached over PCIe too.") },
    { tab: T("8-GPU server"), link: "NVLink 4 · NVSwitch", bar: "NVLink 4 (H100)", kind: "nvl", n: "8", spec: "900 GB/s", way: 450, ex: "DGX H100",
      draw: '<div class="mg-srv"><div class="mg-row">' + gpus(4, "up") + '</div><div class="mg-sw">' + F("{0} NVSwitch chips", 4) + '</div><div class="mg-row">' + gpus(4, "dn") + "</div></div>",
      info: T("<b>8 GPUs, one board.</b> Every H100 connects to the NVSwitch chips with 18 NVLink links, 900 GB/s in total. Any GPU reaches any other at full speed, all at the same time.") },
    { tab: T("NVL72 rack"), link: "NVLink 5 · NVSwitch", bar: "NVLink 5 (B200)", kind: "nvl", n: "72", spec: "1.8 TB/s", way: 900, ex: "GB200 NVL72",
      draw: '<div class="mg-rack"><span class="dg-lbl">' + F("{0} compute trays", 10) + '</span><div class="mg-trays">' + trays(10) + '</div><div class="mg-sw">' + F("{0} NVLink switch trays", 9) + '</div><div class="mg-trays">' + trays(8) + '</div><span class="dg-lbl">' + F("{0} compute trays", 8) + "</span></div>",
      info: T("<b>72 GPUs, one NVLink domain.</b> 18 trays with 4 GPUs each, wired through 9 switch trays in the middle. Every GPU reaches every other at 1.8 TB/s, about 130 TB/s for the whole rack.") },
    { tab: T("cluster of racks"), link: "InfiniBand / Ethernet", bar: T("network"), kind: "net", n: "1000+", spec: "800 Gb/s", way: 100, ex: "GB300 NVL72",
      draw: '<div class="mg-clu"><div class="mg-racks">' + [0, 1, 2, 3].map(function(){ return '<div class="mg-mini"><b>NVL72</b><span>' + gpus(72) + "</span></div>"; }).join("") + '<div class="mg-more">…</div></div><div class="mg-sw net">' + T("network switches") + "</div></div>",
      info: T("<b>Many racks, one network.</b> Each GPU has its own network card, 400 or 800 Gb/s. 800 Gb/s is only 100 GB/s each way, 9 times less than NVLink inside the rack. Send only what must cross the network.") }
  ];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("From one GPU to a cluster") + "</span>" + tabs(levels.map(function(l){ return l.tab; }), 1) + "</div>" +
    '<div class="mg-stage"></div><div class="dg-facts"></div>' +
    '<span class="dg-lbl mg-bl">' + T("bandwidth per GPU, one way") + '</span><div class="dg-bars mg-bars">' + levels.map(function(l){
      return '<div><span>' + l.bar + '</span><i class="' + l.kind + '" style="width:' + (l.way / 900 * 100) + '%"></i><b>' + l.way + " GB/s</b></div>";
    }).join("") + '</div><div class="dg-info" aria-live="polite"></div>';
  function show(k){
    var l = levels[k];
    el.querySelector(".mg-stage").innerHTML = l.draw;
    el.querySelector(".dg-facts").innerHTML = "<span>" + T("GPUs") + ": <b>" + l.n + "</b></span><span>" + T("link") + ': <b class="mg-' + l.kind + '">' + l.link + "</b></span><span>" + T("per GPU") + ": <b>" + l.spec + "</b></span><span>" + T("example") + ": <b>" + l.ex + "</b></span>";
    el.querySelectorAll(".mg-bars div").forEach(function(d, i){ d.classList.toggle("on", i === k); });
    el.querySelector(".dg-info").innerHTML = l.info;
  }
  onTabs(el.querySelector(".dg-tabs"), show);
  show(1);
});

// Number formats: pick a format, type a value, see its bits (sign, exponent, mantissa) and how it is rounded.
// All rounding is exact: the typed decimal becomes a BigInt fraction, so no double rounding sneaks in.
def("num-formats", function(el){
  // name, exponent bits, mantissa bits, kind, use
  // kind: ieee = all-ones exponent is inf/NaN; fn = only S.1111.111 is NaN (E4M3); fin = no inf/NaN; int; nv = NVFP4
  var FM = [
    ["FP64", 11, 52, "ieee", T("science and simulation, where every digit counts")],
    ["FP32", 8, 23, "ieee", T("the default for CUDA cores and general GPU math")],
    ["TF32", 8, 10, "ieee", T("FP32 matrix math on Tensor Cores (Ampere and later), kept in 32-bit registers")],
    ["FP16", 5, 10, "ieee", T("training and inference, but small range, so training needs loss scaling")],
    ["BF16", 8, 7, "ieee", T("the standard for training, FP32 range with less precision")],
    ["FP8 E4M3", 4, 3, "fn", T("inference and the forward pass of training")],
    ["FP8 E5M2", 5, 2, "ieee", T("gradients in training, where range matters more")],
    ["FP6 E2M3", 2, 3, "fin", T("inference with a shared block scale (Blackwell)")],
    ["FP6 E3M2", 3, 2, "fin", T("inference with a shared block scale (Blackwell)")],
    ["FP4 E2M1", 2, 1, "fin", T("the 4-bit element inside NVFP4 and MXFP4, which alone holds only 15 values")],
    ["NVFP4", 2, 1, "nv", T("inference on Blackwell, and more and more training")],
    ["INT8", 0, 7, "int", T("quantized inference, whole numbers times a scale")]
  ];
  var presets = ["3.14159", "0.1", "1000", "0.00001"];
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("How a number is stored") + '</span><span class="dg-note">' + T("pick a format, type a value") + "</span></div>" +
    tabs(FM.map(function(f){ return f[0]; }), 1) +
    '<div class="dg-ctl nf-ctl"><label>' + T("value") + ' <input type="text" inputmode="decimal" spellcheck="false" value="3.14159"></label>' +
    '<span class="nf-pre">' + presets.map(function(p, i){ return '<button type="button" data-k="' + p + '"' + (i ? "" : ' class="on"') + ">" + p + "</button>"; }).join("") + "</span></div>" +
    '<div class="nf-bits"></div>' +
    '<div class="dg-legend"><span><i style="background:var(--warp)"></i>' + T("sign") + '</span><span><i style="background:var(--cool)"></i>' + T("exponent") + '</span><span><i style="background:var(--accent)"></i>' + T("mantissa") + '</span><span><i style="background:var(--block)"></i>' + T("integer / scale") + "</span></div>" +
    '<table class="dg-cmp nf-out"></table><div class="dg-stats nf-stats"></div><div class="dg-info"></div>';
  var inp = el.querySelector("input"), cur = 1;

  var B = BigInt, ZERO = B(0), ONE = B(1), TWO = B(2);
  function blen(n){ return n === ZERO ? 0 : n.toString(2).length; }
  function shl(n, k){ return k >= 0 ? n << B(k) : n >> B(-k); }
  function p10(k){ return B(10) ** B(k); }
  // "3.14159", "-1e-5" -> {n, d} with d > 0, or null
  function parse(s){
    var m = String(s).trim().replace(/,/g, "").match(/^([+-]?)(\d*)\.?(\d*)(?:e([+-]?\d{1,3}))?$/i);
    if (!m || !(m[2] + m[3])) { return null; }
    var e = (+m[4] || 0) - m[3].length, n = B(m[2] + m[3]) * (m[1] === "-" ? -ONE : ONE);
    return e >= 0 ? { n: n * p10(e), d: ONE } : { n: n, d: p10(-e) };
  }
  // exact fraction -> Number (works for tiny and huge values)
  function num(r){
    if (r.n === ZERO) { return 0; }
    var a = r.n < ZERO ? -r.n : r.n, k = 20 - (a.toString().length - r.d.toString().length);
    var q = k >= 0 ? a * p10(k) / r.d : a / (r.d * p10(-k));
    return (r.n < ZERO ? -1 : 1) * Number(q + "e" + (-k));
  }
  function dyad(q, p, neg){ var n = neg ? -q : q; return p >= 0 ? { n: shl(n, p), d: ONE } : { n: n, d: shl(ONE, -p) }; }
  function sub(a, b){ return { n: a.n * b.d - b.n * a.d, d: a.d * b.d }; }

  // Round |N/D| to a float with E exponent bits and M mantissa bits, round to nearest, ties to even.
  function enc(N, D, E, M, kind, sat){
    var bias = (1 << (E - 1)) - 1, emin = 1 - bias, top = (1 << E) - 1;
    var maxEf = kind === "ieee" ? top - 1 : top, maxMf = shl(ONE, M) - (kind === "fn" ? TWO : ONE);
    var mx = { ef: maxEf, mf: maxMf, q: maxMf + shl(ONE, M), p: maxEf - bias - M };
    if (N === ZERO) { return { ef: 0, mf: ZERO, q: ZERO, p: 0 }; }
    var e = blen(N) - blen(D);
    while (shl(N, -Math.min(e, 0)) < shl(D, Math.max(e, 0))) { e--; }
    while (shl(N, -Math.min(e + 1, 0)) >= shl(D, Math.max(e + 1, 0))) { e++; }
    var ex = Math.max(e, emin), s = M - ex;
    var nn = s >= 0 ? shl(N, s) : N, dd = s >= 0 ? D : shl(D, -s), r = nn / dd, rem = nn - r * dd;
    if (TWO * rem > dd || (TWO * rem === dd && r % TWO === ONE)) { r++; }
    if (r === shl(ONE, M + 1)) { r = shl(ONE, M); ex++; }
    var ef = r >= shl(ONE, M) ? ex + bias : 0, mf = ef ? r - shl(ONE, M) : r;
    if (ef > maxEf || (ef === maxEf && mf > maxMf)) {
      if (kind === "ieee" && !sat) { return { ef: top, mf: ZERO, inf: true }; }
      mx.clamp = true; return mx;
    }
    return { ef: ef, mf: mf, q: r, p: ex - M, under: r === ZERO };
  }
  function bin(v, w){ var s = v.toString(2); while (s.length < w) { s = "0" + s; } return s; }
  function fmt(v, sig){
    if (!isFinite(v)) { return v < 0 ? "−∞" : "∞"; }
    if (v === 0) { return "0"; }
    var a = Math.abs(v), s = a >= 1e6 || a < 1e-4 ? v.toExponential(sig - 1).replace(/\.?0+e/, "e") : v.toPrecision(sig).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
    return s.replace(/-/g, "−");
  }
  function cells(bits, cls){
    return bits.split("").map(function(b, i){ return '<i class="nf-' + cls[i] + (cls[i] === "k" && cls[i - 1] !== "k" ? " nf-gap" : "") + '">' + b + "</i>"; }).join("");
  }
  function row(k, v){ return "<tr><th>" + k + "</th><td>" + v + "</td></tr>"; }

  function draw(){
    var f = FM[cur], E = f[1], M = f[2], kind = f[3], x = parse(inp.value), sig = E === 11 ? 17 : 10;
    inp.setAttribute("aria-invalid", x ? "false" : "true");
    if (!x) { el.querySelector(".nf-out").innerHTML = row(T("value"), T("type a number such as 3.14159 or 1e-5")); return; }
    var neg = x.n < ZERO, N = neg ? -x.n : x.n, bits = "", cls = "", stored, note = "", formula = "", stats = [];
    if (kind === "int") {
      var r = N / x.d, rem = N - r * x.d;
      if (TWO * rem > x.d || (TWO * rem === x.d && r % TWO === ONE)) { r++; }
      var q = Number(r) * (neg ? -1 : 1);
      if (q > 127 || q < -128) { q = q > 0 ? 127 : -128; note = T("out of range, so it clamps to the end of the range"); }
      bits = bin((q + 256) % 256, 8); cls = "ssssssss".replace(/s/g, "i");
      stored = { n: B(q), d: ONE };
      formula = F("whole numbers from {0} to {1}, where the top bit counts −128 (two's complement)", "−128", "127");
      stats = [F("{0} bits", 8), F("largest {0}", "127"), T("256 values, all evenly spaced")];
    } else if (kind === "nv") {
      // assume this value is the largest |x| in its 16-value block: scale = amax / 6, stored in E4M3
      var sc = enc(N, x.d * B(6), 4, 3, "fn", true);
      if (sc.under || sc.q === ZERO) { stored = { n: ZERO, d: ONE }; bits = "0000"; cls = "seem"; note = T("too small, rounds to 0"); }
      else {
        var sd = dyad(sc.q, sc.p, false), el2 = enc(N * sd.d, x.d * sd.n, 2, 1, "fin", true);
        stored = dyad(el2.q * sc.q, el2.p + sc.p, neg);
        bits = (neg ? "1" : "0") + bin(el2.ef, 2) + bin(el2.mf, 1); cls = "seem";
        var sv = num(dyad(sc.q, sc.p, false));
        formula = F("scale s = {0} (FP8 E4M3, shared by 16 values) × element {1} (FP4 E2M1)", fmt(sv, 6), fmt(num(dyad(el2.q, el2.p, neg)), 4));
        bits += " 0" + bin(sc.ef, 4) + bin(sc.mf, 3); cls += " kkkkkkkk";
      }
      stats = [T("4 bits + one 8-bit scale per 16 values = 4.5 bits each"), F("largest {0} per block", "6 × 448 = 2,688"), T("plus one FP32 scale per tensor")];
    } else {
      var bias = (1 << (E - 1)) - 1, h = enc(N, x.d, E, M, kind, false);
      bits = (neg ? "1" : "0") + bin(h.ef, E) + bin(h.mf, M);
      cls = "s" + "e".repeat(E) + "m".repeat(M);
      if (h.inf) { stored = null; note = T("too big, becomes infinity"); }
      else {
        stored = dyad(h.q, h.p, neg);
        if (h.clamp) { note = T("too big, clamps to the largest value"); }
        else if (h.under) { note = T("too small, rounds to 0"); }
        formula = h.ef ? F("exponent field {0} − bias {1} = {2}, so the value is {3} × 2^{2} × {4}", h.ef, bias, fmt(h.ef - bias, 4), neg ? "−1" : "+1", fmt(1 + Number(h.mf) / Math.pow(2, M), sig))
          : F("exponent field 0 means a subnormal (or zero), value = {0} × 2^{1} × {2}", neg ? "−1" : "+1", fmt(1 - bias, 4), fmt(Number(h.mf) / Math.pow(2, M), sig));
      }
      var mx = enc(p10(400), ONE, E, M, kind, true), mxv = num(dyad(mx.q, mx.p, false));
      stats = [F("{0} bits", 1 + E + M), F("largest {0}", fmt(mxv, 6)), F("smallest normal {0}", fmt(Math.pow(2, 1 - bias), 3)), F("about {0} decimal digits", ((M + 1) * Math.LOG10E * Math.LN2).toFixed(1))];
    }
    var n = bits.replace(" ", "").length;
    el.querySelector(".nf-bits").style.setProperty("--n", Math.min(n, 32));
    el.querySelector(".nf-bits").className = "nf-bits" + (n > 19 ? " many" : "");
    el.querySelector(".nf-bits").setAttribute("aria-label", T("bits") + " " + bits);
    el.querySelector(".nf-bits").innerHTML = cells(bits.replace(" ", ""), cls.replace(" ", ""));
    var sv2 = stored ? num(stored) : (neg ? -Infinity : Infinity), err = stored ? num(sub(stored, x)) : NaN;
    el.querySelector(".nf-out").innerHTML =
      row(T("you typed"), inp.value.trim()) +
      row(T("stored as"), "<b>" + fmt(sv2, sig) + "</b>" + (note ? ' <span class="nf-warn">' + note + "</span>" : "")) +
      row(T("error"), isNaN(err) ? "∞" : err === 0 ? T("none, exact") : fmt(err, 3) + (num(x) ? " (" + fmt(Math.abs(err / num(x)) * 100, 3) + "%)" : "")) +
      row(T("bits"), '<code class="nf-raw">' + (kind === "int" || kind === "nv" ? bits : bits[0] + " " + bits.substr(1, E) + " " + bits.substr(1 + E)) + "</code>") +
      (formula ? row(T("how"), formula) : "");
    el.querySelector(".nf-stats").innerHTML = stats.map(function(s){ return "<span>" + s + "</span>"; }).join("");
    el.querySelector(".dg-info").innerHTML = "<b>" + f[0] + "</b>: " + f[4] + (kind === "nv" ? "<br>" + T("Here the typed value is taken as the largest value in its block of 16.") : "");
  }
  onTabs(el.querySelector(".dg-tabs"), function(i){ cur = i; draw(); });
  pick(el.querySelector(".nf-pre"), function(k){ inp.value = k; draw(); });
  inp.addEventListener("input", function(){ el.querySelectorAll(".nf-pre .on").forEach(function(b){ b.classList.remove("on"); }); draw(); });
  draw();
});

def("roofline-chart", function(el){
  // Peak FP32 (non-Tensor) in GFLOPS and memory bandwidth in GB/s, from NVIDIA's spec sheets.
  var gpus = [["L40S", 91600, 864], ["H100 SXM", 67000, 3350], ["RTX 5090", 104800, 1792]];
  // name, FLOPs, bytes per element (or per whole matrix multiply).
  var ks = [
    [T("vector add"), 1, 12, "c[i] = a[i] + b[i]"],
    ["SAXPY", 2, 12, "y[i] = a * x[i] + y[i]"],
    [T("dot product"), 2, 8, "s += x[i] * y[i]"],
    [F("matmul N = {0}", 256), 2 * Math.pow(256, 3), 12 * 256 * 256, "C = A × B"],
    [F("matmul N = {0}", 4096), 2 * Math.pow(4096, 3), 12 * 4096 * 4096, "C = A × B"]
  ];
  var W = 360, H = 230, L = 46, R = 12, TOP = 12, B = 34, X0 = -4, X1 = 10, Y0 = 1, Y1 = 5.5;
  function px(ai){ return L + (Math.log2(ai) - X0) / (X1 - X0) * (W - L - R); }
  function py(g){ return TOP + (Y1 - Math.log10(g)) / (Y1 - Y0) * (H - TOP - B); }
  function num(x){ return (+x.toPrecision(3)).toLocaleString("en-US"); }
  var grid = "";
  [1 / 16, 1 / 4, 1, 4, 16, 64, 256, 1024].forEach(function(a){
    grid += '<line class="rf-grid" x1="' + px(a) + '" x2="' + px(a) + '" y1="' + TOP + '" y2="' + (H - B) + '"/><text class="rf-tick" x="' + px(a) + '" y="' + (H - B + 13) + '" text-anchor="middle">' + (a < 1 ? "1/" + 1 / a : a < 1024 ? a : "1k") + "</text>";
  });
  [10, 100, 1000, 10000, 100000].forEach(function(g){
    grid += '<line class="rf-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + py(g) + '" y2="' + py(g) + '"/><text class="rf-tick" x="' + (L - 5) + '" y="' + (py(g) + 3) + '" text-anchor="end">' + (g < 1000 ? g : g / 1000 + "k") + "</text>";
  });
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("The roofline") + "</span>" + tabs(gpus.map(function(g){ return g[0]; }), 0) + "</div>" +
    '<div class="dg-stats"></div>' +
    '<svg class="rf-svg" viewBox="0 0 ' + W + " " + H + '" role="img">' + grid +
    '<text class="rf-axis" x="' + (L + (W - L - R) / 2) + '" y="' + (H - 4) + '" text-anchor="middle">' + T("arithmetic intensity (FLOP/byte)") + "</text>" +
    '<text class="rf-axis" transform="translate(11 ' + (TOP + (H - TOP - B) / 2) + ') rotate(-90)" text-anchor="middle">GFLOPS</text>' +
    '<polyline class="rf-mem"/><polyline class="rf-cmp"/><line class="rf-ridge"/><text class="rf-rl" text-anchor="middle"></text>' +
    '<g class="rf-dot"><circle r="6"/></g></svg>' +
    '<div class="dg-tabs rf-ks">' + ks.map(function(k, i){ return '<button type="button" data-k="' + i + '">' + k[0] + "</button>"; }).join("") + "</div>" +
    '<div class="dg-info" aria-live="polite"></div>';
  var g = gpus[0], k = ks[0], $ = el.querySelector.bind(el);
  function draw(){
    var peak = g[1], bw = g[2], ridge = peak / bw, xmin = Math.pow(2, X0), xmax = Math.pow(2, X1);
    $(".dg-stats").innerHTML = "<span>" + T("peak FP32") + " <b>" + (peak / 1000).toLocaleString("en-US") + " TFLOPS</b></span><span>" + T("bandwidth") + " <b>" + bw.toLocaleString("en-US") + " GB/s</b></span><span>" + T("ridge point") + " <b>" + num(ridge) + " FLOP/byte</b></span>";
    $(".rf-mem").setAttribute("points", px(xmin) + "," + py(xmin * bw) + " " + px(ridge) + "," + py(peak));
    $(".rf-cmp").setAttribute("points", px(ridge) + "," + py(peak) + " " + px(xmax) + "," + py(peak));
    var r = $(".rf-ridge"), rl = $(".rf-rl");
    r.setAttribute("x1", px(ridge)); r.setAttribute("x2", px(ridge)); r.setAttribute("y1", py(peak)); r.setAttribute("y2", H - B);
    rl.setAttribute("x", px(ridge)); rl.setAttribute("y", py(peak) - 5); rl.textContent = F("ridge {0}", num(ridge));
    var ai = k[1] / k[2], got = Math.min(peak, ai * bw), mem = ai < ridge;
    var dot = $(".rf-dot");
    dot.setAttribute("class", "rf-dot " + (mem ? "mem" : "cmp"));
    dot.style.transform = "translate(" + px(ai) + "px," + py(got) + "px)";
    var verdict = mem ? T("memory bound") : T("compute bound");
    $(".rf-svg").setAttribute("aria-label", F("{0} on the {1}, {2}, {3} GFLOPS", k[0], g[0], verdict, Math.round(got).toLocaleString("en-US")));
    $(".dg-info").innerHTML = ("<code>" + k[3] + "</code><br>" +
      F("{0} FLOP over {1} bytes = <b>{2} FLOP/byte</b>. The ridge point of the {3} is {4}.", k[1].toLocaleString("en-US"), k[2].toLocaleString("en-US"), num(ai), g[0], num(ridge)) + " " +
      F("<em>{0}</em> reaches at most <b>{1} GFLOPS</b>, {2}% of the peak. {3}", verdict, Math.round(got).toLocaleString("en-US"), +(got / peak * 100).toPrecision(2),
        mem ? T("Faster math would not help. Move fewer bytes.") : T("Memory keeps up. Now the math units are the limit, so Tensor Cores and better math help."))).replace(/。 /g, "。");
  }
  onTabs($(".dg-tabs"), function(i){ g = gpus[i]; draw(); });
  pick($(".rf-ks"), function(i){ k = ks[+i]; draw(); });
  $(".rf-ks button").click();
});

// CPU and GPU working together: copy in over PCIe, compute on the SMs, copy back.
def("cpu-gpu-trip", function(el){
  el.classList.add("cgt");
  var steps = [
    [T("start"), T("The input starts in system RAM, next to the CPU. The GPU cannot see it yet.")],
    [T("1 copy in"), T("The CPU sends the input over PCIe into VRAM. On the L40S this link moves about 32 GB/s each way, far slower than VRAM itself.")],
    [T("2 compute"), T("The SMs work on the data in VRAM, all at the same time. The CPU is free to do other work meanwhile.")],
    [T("3 copy back"), T("The results travel back over PCIe into system RAM, where the CPU can use them.")]
  ];
  var cells = ""; for (var i = 0; i < 8; i++) { cells += "<i></i>"; }
  var sms = ""; for (var j = 0; j < 8; j++) { sms += "<i></i>"; }
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("CPU and GPU, step by step") + "</span>" + tabs(steps.map(function(s){ return s[0]; }), 0) + "</div>" +
    '<div class="hdf-row"><div class="hdf-box hdf-host"><b>CPU</b><span>' + T("system RAM") + '</span><div class="hdf-mem hdf-ram">' + cells + "</div></div>" +
    '<div class="hdf-link"><span>PCIe</span><div class="hdf-lane"><i></i><i></i><i></i></div></div>' +
    '<div class="hdf-box hdf-dev"><b>GPU</b><span>SM</span><div class="hdf-sms">' + sms + '</div><span>VRAM</span><div class="hdf-mem hdf-vram">' + cells + "</div></div></div>" +
    '<div class="dg-head" style="margin:14px 0 0"><button class="dg-btn" type="button">' + T("play all steps") + '</button></div><div class="dg-info"></div>';
  var info = el.querySelector(".dg-info"), btns = el.querySelectorAll(".dg-tabs button"), timer = 0;
  function show(i){
    el.dataset.step = i;
    btns.forEach(function(b, k){ b.classList.toggle("on", k === i); });
    info.innerHTML = "<b>" + steps[i][0] + "</b><br>" + steps[i][1];
  }
  onTabs(el.querySelector(".dg-tabs"), function(i){ clearInterval(timer); show(i); });
  el.querySelector(".dg-btn").addEventListener("click", function(){
    clearInterval(timer); var i = 0; show(0);
    timer = setInterval(function(){ i++; if (i >= steps.length) { clearInterval(timer); return; } show(i); }, 1800);
  });
  show(0);
});

// Inside one SM: the four kinds of parts every SM has.
def("sm-inside", function(el){
  var P = {
    reg: [T("Registers"), T("The fastest storage there is. Every thread keeps its own variables here. On the L40S each SM has 65,536 registers, 256 KB in total.")],
    smem: [T("Shared memory"), T("A small, fast memory that the threads of one block use to swap data. On the L40S each SM has 128 KB, shared with the L1 cache.")],
    ctrl: [T("Control"), T("Warp schedulers decide which group of 32 threads runs next, every clock cycle. The L40S has 4 per SM.")],
    exec: [T("Execution units"), T("The units that do the actual math. The L40S has 128 FP32 cores and 4 Tensor Cores per SM, plus integer and special function units.")]
  };
  var tiles = ""; for (var i = 0; i < 24; i++) { tiles += "<i" + (i ? "" : ' class="on"') + "></i>"; }
  var units = ""; for (var j = 0; j < 32; j++) { units += "<i></i>"; }
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("Inside one SM") + '</span><span class="dg-note">' + T("click a part") + "</span></div>" +
    '<div class="smi-gpu"><div class="smi-tiles">' + tiles + "</div><span>" + T("one GPU is many SMs · the L40S has 142") + "</span></div>" +
    '<div class="smi-sm"><span class="smi-lbl">SM</span>' +
    '<button type="button" data-k="ctrl" class="smi-ctrl">' + T("control · warp schedulers") + "</button>" +
    '<button type="button" data-k="reg" class="smi-reg">' + T("registers") + "</button>" +
    '<button type="button" data-k="exec" class="smi-exec"><span>' + T("execution units") + '</span><span class="smi-units">' + units + "</span></button>" +
    '<button type="button" data-k="smem" class="smi-smem">' + T("shared memory / L1") + "</button></div>" +
    '<div class="dg-info"></div>';
  var info = el.querySelector(".dg-info");
  pick(el.querySelector(".smi-sm"), function(k){ info.innerHTML = "<b>" + P[k][0] + "</b><br>" + P[k][1]; });
  el.querySelector('[data-k="reg"]').click();
});

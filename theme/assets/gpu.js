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
    info.innerHTML = F("<b>{0}</b>: architecture <em>{1}</em> (how it is built). Generation <em>{2}</em> (where it is used).", name, r[0], cols[ij[1]][0]) +
      (mates.length ? "<br>" + F("Same design, other uses: {0}.", mates.join(", ")) : "<br>" + F("{0} is only made for this use.", r[0]));
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
      : F("<b>The GPU:</b> {0}.", [T("the chip"), "VRAM", T("power delivery"), T("outputs"), T("cooling")].slice(0, step + 1).join(" + ")) +
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
    el.querySelector(".dg-ccnum").innerHTML = "<span><b>" + v[0] + "</b><small>" + T("major: the architecture") + "</small></span><span class='dot'>.</span><span><b>" + v[1] + "</b><small>" + T("minor: a revision of it") + "</small></span>" +
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
  el.innerHTML = '<div class="dg-head"><span class="dg-title">' + T("How every NVIDIA white paper is laid out") + '</span><span class="dg-note">' + T('search: chip name + "white paper", open the official PDF') + '</span></div>' +
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
    '<div class="st">' + T("executable") + '<small>' + T("fatbinary: SASS + PTX") + '</small></div><div class="st drv">' + T("driver") + '<small></small></div><div class="st gpu">GPU</div></div><div class="dg-info"></div>';
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
    [T("Add NVIDIA's WSL repository"), "wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb\nsudo dpkg -i cuda-keyring_1.1-1_all.deb", T("Not apt install nvidia-cuda-toolkit: that package is outdated.")],
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

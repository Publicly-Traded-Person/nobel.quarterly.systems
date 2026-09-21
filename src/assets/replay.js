// Season replay: scrub through timeline.json and animate the board.
(async function () {
  const range = document.getElementById("replay-range");
  const play = document.getElementById("replay-play");
  const dateEl = document.getElementById("replay-date");
  const titleEl = document.getElementById("replay-title");
  const board = document.getElementById("replay-board");
  if (!range || !board) return;

  let data;
  try {
    const res = await fetch("/timeline.json", { cache: "no-store" });
    data = await res.json();
  } catch (e) {
    board.innerHTML = "<p>Could not load the timeline.</p>";
    return;
  }
  const timeline = data.timeline || [];
  const candidates = data.candidates || {};
  const themes = data.themes || {};
  if (timeline.length === 0) {
    board.innerHTML = "<p>No updates yet.</p>";
    return;
  }

  const TIERS = ["Lock", "Contender", "Darkhorse", "Field"];
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const mv = (m) =>
    m === "new"
      ? '<span class="mv mv-new">new</span>'
      : m > 0
        ? '<span class="mv mv-up">▲' + m + "</span>"
        : m < 0
          ? '<span class="mv mv-down">▼' + -m + "</span>"
          : '<span class="mv mv-flat">–</span>';

  function initials(name) {
    const parts = name.replace(/[,.]/g, "").trim().split(/\s+/).filter((p) => !/^[A-Z]$/.test(p));
    const first = parts[0] ? parts[0][0] : "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }

  function fmtDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1] + " " + d + ", " + y;
  }

  function rowHtml(s) {
    const c = candidates[s.id] || { name: s.id, affiliation: "", theme: "" };
    return (
      '<tr data-id="' + esc(s.id) + '">' +
      '<td class="c-rank">' + s.rank + "</td>" +
      '<td class="c-mv">' + mv(s.movement) + "</td>" +
      '<td class="c-face">' + (c.photo ? '<img class="face face-s" src="/' + esc(c.photo) + '" alt="" width="40" height="40">' : '<span class="face face-s face-initials" aria-hidden="true">' + esc(initials(c.name)) + "</span>") + "</td>" +
      '<td class="c-name"><a href="/candidates/' + esc(s.id) + '/">' + esc(c.name) + "</a>" +
      (s.sleeper ? ' <span class="badge badge-sleeper">Sleeper</span>' : "") +
      '<div class="aff">' + esc(c.affiliation) + "</div></td>" +
      '<td class="c-theme">' + esc(themes[c.theme] || c.theme || "") + "</td>" +
      '<td class="c-src">' + s.sourcesNaming + "</td>" +
      '<td class="c-score"><span class="score">' + s.composite.toFixed(1) + '</span><span class="bar" style="--w:' + Math.max(0, Math.min(100, s.composite)) + '%"></span></td>' +
      "</tr>"
    );
  }

  function tableHtml(snap) {
    const groups = {};
    snap.standings.forEach((s) => { (groups[s.tier] = groups[s.tier] || []).push(s); });
    let html = '<div class="rankings">';
    TIERS.forEach((t) => {
      const rows = groups[t];
      if (!rows || !rows.length) return;
      html +=
        '<section class="tier tier-' + t.toLowerCase() + '"><h3 class="tier-name">' + (t === "Field" ? "The Field" : t + "s") + "</h3>" +
        '<table class="standings"><thead><tr><th class="c-rank">#</th><th class="c-mv"></th><th class="c-face"></th><th class="c-name">Candidate</th><th class="c-theme">Field</th><th class="c-src">Sources</th><th class="c-score">Score</th></tr></thead><tbody>' +
        rows.map(rowHtml).join("") +
        "</tbody></table></section>";
    });
    return html + "</div>";
  }

  // FLIP: record positions, swap DOM, invert, play.
  function render(i) {
    const snap = timeline[i];
    const before = {};
    board.querySelectorAll("tr[data-id]").forEach((tr) => {
      before[tr.dataset.id] = tr.getBoundingClientRect().top;
    });
    const prevRanks = {};
    board.querySelectorAll("tr[data-id]").forEach((tr) => {
      prevRanks[tr.dataset.id] = tr.querySelector(".c-rank").textContent;
    });
    board.innerHTML = tableHtml(snap);
    board.querySelectorAll("tr[data-id]").forEach((tr) => {
      const id = tr.dataset.id;
      if (before[id] === undefined) return;
      const after = tr.getBoundingClientRect().top;
      const dy = before[id] - after;
      if (Math.abs(dy) > 1) {
        tr.style.transition = "none";
        tr.style.transform = "translateY(" + dy + "px)";
        requestAnimationFrame(() => {
          tr.style.transition = "";
          tr.style.transform = "";
        });
      }
      if (prevRanks[id] !== undefined && prevRanks[id] !== tr.querySelector(".c-rank").textContent) {
        tr.classList.add("flash");
      }
    });
    dateEl.textContent = fmtDate(snap.date);
    dateEl.setAttribute("datetime", snap.date);
    titleEl.textContent = snap.title;
    titleEl.href = "/updates/" + snap.slug + "/";
    range.value = String(i);
  }

  range.max = String(timeline.length - 1);
  let idx = timeline.length - 1;
  const fromHash = parseInt(location.hash.replace("#", ""), 10);
  if (!Number.isNaN(fromHash) && fromHash >= 0 && fromHash < timeline.length) idx = fromHash;
  render(idx);

  range.addEventListener("input", () => {
    idx = parseInt(range.value, 10);
    render(idx);
    stop();
  });

  let timer = null;
  function stop() {
    if (timer) { clearInterval(timer); timer = null; play.textContent = "▶"; }
  }
  play.addEventListener("click", () => {
    if (timer) return stop();
    if (idx >= timeline.length - 1) idx = -1;
    play.textContent = "❚❚";
    const step = () => {
      idx += 1;
      if (idx >= timeline.length) { idx = timeline.length - 1; return stop(); }
      render(idx);
    };
    step();
    timer = setInterval(step, 1600);
  });
})();

/* global React, ReactDOM */
const { useState, useMemo, useEffect, useCallback, useRef } = React;

// ─── localStorage helpers ─────────────────────────────────
const storage = {
  get(key, fallback) {
    try { const v = localStorage.getItem("civ6r_" + key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("civ6r_" + key, JSON.stringify(value)); } catch (e) {}
  }
};

// ─── Section header (collapsible) ──────────────────────────
function SectionHead({ roman, title, collapsed, onToggle, locked, extra }) {
  return (
    <div className="section-head">
      <span className="roman">{roman}</span>
      <h2 className="clickable" onClick={onToggle}>{title}</h2>
      {locked && collapsed && <span className="head-status">&#x2B22; Locked — won't randomize</span>}
      <span className="ornament"></span>
      <div className="head-actions">
        {extra}
        <button className="chev" onClick={onToggle} title={collapsed ? "Expand" : "Collapse (also stops randomizing)"}>
          {collapsed ? "\u25B8" : "\u25BE"}
        </button>
      </div>
    </div>
  );
}

// ─── tiny icons ────────────────────────────────────────────
const LockOpenIcon = () => (
  <svg className="lock-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="7" width="10" height="7" rx="1"/>
    <path d="M5 7 V5 a3 3 0 0 1 6 0"/>
  </svg>
);
const LockClosedIcon = () => (
  <svg className="lock-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="7" width="10" height="7" rx="1" fill="currentColor" fillOpacity="0.15"/>
    <path d="M5 7 V5 a3 3 0 0 1 6 0 V7"/>
  </svg>
);
const DieIcon = () => (
  <svg className="lock-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="2.5" y="2.5" width="11" height="11" rx="1.5"/>
    <circle cx="5.5" cy="5.5" r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="10.5" cy="5.5" r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="8"    cy="8"   r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="5.5" cy="10.5" r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="10.5" cy="10.5" r="0.9" fill="currentColor" stroke="none"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
    <path d="M3 8.5 L7 12 L13 4"/>
  </svg>
);

// ─── clipboard helper (fallback for file:// and older browsers) ──
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;left:-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  return Promise.resolve();
}

// ─── helpers ───────────────────────────────────────────────
const pick  = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickRange = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const toRoman = (n) => ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"][n] || String(n);

// Map size → recommended ranges for player count and city-states
const MAP_SIZE_RANGES = {
  "Duel":     { players: [2, 2],   cs: [0, 3]   },
  "Tiny":     { players: [3, 4],   cs: [3, 6]   },
  "Small":    { players: [4, 6],   cs: [6, 9]   },
  "Standard": { players: [6, 8],   cs: [9, 12]  },
  "Large":    { players: [8, 10],  cs: [12, 15] },
  "Huge":     { players: [10, 12], cs: [15, 18] },
};

// Compute leader pool from enabled DLCs minus banned leaders
function availableLeaders(dlcs, banned) {
  return window.LEADERS.filter(l =>
    (l.dlc === null || dlcs.has(l.dlc)) && !banned.has(l.id)
  );
}

// ─── lockable field control ────────────────────────────────
function LockableField({ label, options, value, locked, onChange, onLockToggle, onReroll, rolling }) {
  return (
    <div className="field">
      <div className="field-label">{label}</div>
      <div className="field-value-shell">
        <select
          className={"field-select " + (locked ? "locked " : "") + (rolling ? "flip-anim" : "")}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
        >
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <button className="btn-reroll" title="Reroll this" disabled={locked} onClick={onReroll}>
        <DieIcon />
      </button>
      <button
        className={"btn-icon " + (locked ? "locked" : "")}
        title={locked ? "Locked — won't randomize" : "Unlocked — will randomize"}
        onClick={onLockToggle}
      >
        {locked ? <LockClosedIcon/> : <LockOpenIcon/>}
      </button>
    </div>
  );
}

// ─── DLC card ──────────────────────────────────────────────
function DlcCard({ dlc, on, onToggle }) {
  return (
    <div className={"dlc-card " + (on ? "on" : "")} onClick={onToggle}>
      <div className="dlc-check">{on && <CheckIcon/>}</div>
      <div className="dlc-text">
        <div className="dlc-name">{dlc.name}</div>
        <div className="dlc-kind">{dlc.kind} &middot; {dlc.short}</div>
      </div>
    </div>
  );
}

// ─── Player row ────────────────────────────────────────────
function PlayerRow({ idx, kind, leaderId, locked, leaderPool, onChange, onLockToggle, onReroll, rolling }) {
  const leader = leaderPool.find(l => l.id === leaderId) || null;
  return (
    <div className={"player-row " + (kind === "Human" ? "human" : "")}>
      <div className="player-portrait">{toRoman(idx)}</div>
      <div className="player-kind-tag">{kind === "Human" ? "HUM" : "AI"}</div>
      <div>
        {leader ? (
          <div className={"player-leader" + (rolling ? " flip-anim" : "")}>
            {leader.leader}
            <span className="tag">{leader.tag}</span>
          </div>
        ) : (
          <div className="player-leader empty">— unassigned —</div>
        )}
      </div>
      <div className="field-value-shell" style={{minWidth: 0}}>
        <select
          className={"field-select " + (locked ? "locked" : "")}
          value={leaderId || ""}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">— pick a leader —</option>
          {leaderPool.map(l => (
            <option key={l.id} value={l.id}>{l.leader} &middot; {l.civ}</option>
          ))}
        </select>
      </div>
      <button className="btn-reroll" title="Reroll this leader" disabled={locked} onClick={onReroll}>
        <DieIcon/>
      </button>
      <button
        className={"btn-icon " + (locked ? "locked" : "")}
        title={locked ? "Locked" : "Unlocked"}
        onClick={onLockToggle}
      >
        {locked ? <LockClosedIcon/> : <LockOpenIcon/>}
      </button>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────
function App() {
  // — DLCs — load from localStorage, default to all-on
  const [dlcs, setDlcs] = useState(() => {
    const saved = storage.get("dlcs", null);
    return saved ? new Set(saved) : new Set(window.DLCS.map(d => d.id));
  });
  const toggleDlc = (id) => setDlcs(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  useEffect(() => { storage.set("dlcs", [...dlcs]); }, [dlcs]);

  // — Banned leaders (Feature 11) —
  const [bannedLeaders, setBannedLeaders] = useState(() => new Set(storage.get("banned", [])));
  const [showBanList, setShowBanList] = useState(false);
  useEffect(() => { storage.set("banned", [...bannedLeaders]); }, [bannedLeaders]);
  const toggleBan = (id) => setBannedLeaders(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // — Per-human DLC overrides —
  // null = use global DLC, Set = custom DLC for that player
  const [playerDlcs, setPlayerDlcs] = useState(() => {
    const saved = storage.get("playerDlcs", null);
    if (saved) return saved.map(function(d) { return d ? new Set(d) : null; });
    return [];
  });
  const [expandedPlayerDlc, setExpandedPlayerDlc] = useState(null);
  useEffect(() => {
    storage.set("playerDlcs", playerDlcs.map(function(d) { return d ? [...d] : null; }));
  }, [playerDlcs]);

  const togglePlayerDlc = (playerIdx, dlcId) => {
    setPlayerDlcs(prev => {
      const next = [...prev];
      if (!next[playerIdx]) next[playerIdx] = new Set(dlcs);
      const s = new Set(next[playerIdx]);
      s.has(dlcId) ? s.delete(dlcId) : s.add(dlcId);
      next[playerIdx] = s;
      return next;
    });
  };

  const enableCustomDlc = (playerIdx) => {
    setPlayerDlcs(prev => {
      const next = [...prev];
      next[playerIdx] = new Set(dlcs);
      return next;
    });
  };

  const resetPlayerDlc = (playerIdx) => {
    setPlayerDlcs(prev => {
      const next = [...prev];
      next[playerIdx] = null;
      return next;
    });
    setExpandedPlayerDlc(null);
  };

  // Get the effective leader pool for a given slot index
  const getSlotPool = (slotIndex) => {
    const slotDlcs = (slotIndex < humanCount && playerDlcs[slotIndex]) ? playerDlcs[slotIndex] : dlcs;
    return availableLeaders(slotDlcs, bannedLeaders);
  };

  // — Players —
  const [humanCount, setHumanCount] = useState(() => storage.get("humanCount", 1));
  const [aiCount, setAiCount]       = useState(() => storage.get("aiCount", 7));
  const [aiCountLocked, setAiCountLocked] = useState(false);
  useEffect(() => { storage.set("humanCount", humanCount); }, [humanCount]);
  useEffect(() => { storage.set("aiCount", aiCount); }, [aiCount]);

  const [slots, setSlots] = useState(() => {
    const h = storage.get("humanCount", 1);
    const a = storage.get("aiCount", 7);
    const arr = [];
    for (let i = 0; i < h; i++) arr.push({ kind: "Human", leaderId: null, locked: false });
    for (let i = 0; i < a; i++) arr.push({ kind: "AI", leaderId: null, locked: false });
    return arr;
  });

  // Reconcile slots when counts change
  useEffect(() => {
    setSlots(prev => {
      const total = humanCount + aiCount;
      const next = [];
      for (let i = 0; i < total; i++) {
        const kind = i < humanCount ? "Human" : "AI";
        const existing = prev[i];
        next.push(existing ? { ...existing, kind } : { kind, leaderId: null, locked: false });
      }
      return next;
    });
  }, [humanCount, aiCount]);

  // Reconcile per-human DLC array when human count changes
  useEffect(() => {
    setPlayerDlcs(prev => {
      const next = [...prev];
      while (next.length < humanCount) next.push(null);
      return next.slice(0, humanCount);
    });
  }, [humanCount]);

  // — Link map size toggle (Feature 12) —
  const [linkMapSize, setLinkMapSize] = useState(() => storage.get("linkMapSize", false));
  useEffect(() => { storage.set("linkMapSize", linkMapSize); }, [linkMapSize]);

  // — Settings —
  const initSettings = () => ({
    mapType:           { value: "Continents",   locked: false },
    mapSize:           { value: "Standard",     locked: false },
    difficulty:        { value: "Prince",       locked: false },
    gameSpeed:         { value: "Standard",     locked: false },
    startEra:          { value: "Ancient",      locked: false },
    resources:         { value: "Standard",     locked: false },
    worldAge:          { value: "Standard",     locked: false },
    temperature:       { value: "Standard",     locked: false },
    rainfall:          { value: "Standard",     locked: false },
    seaLevel:          { value: "Standard",     locked: false },
    disasterIntensity: { value: "2 — Standard", locked: false },
    cityStates:        { value: "12",           locked: false }
  });
  const [settings, setSettings] = useState(initSettings);

  // — Game modes —
  const [modes, setModes] = useState(() => {
    const o = {};
    window.GAME_MODES.forEach(m => { o[m.id] = { on: false, locked: false }; });
    return o;
  });

  // — Victory types —
  const [victories, setVictories] = useState(() => {
    const o = {};
    window.VICTORY_TYPES.forEach(v => { o[v.id] = { on: true, locked: false }; });
    return o;
  });

  // — Animation & nonce —
  const [rollNonce, setRollNonce] = useState(0);
  const [rolling, setRolling] = useState(false);

  // — Collapsed sections —
  const [collapsed, setCollapsed] = useState({
    dlc: false, players: false, rules: false, modes: false, victory: false, summary: false
  });
  const toggleCollapsed = (key) =>
    setCollapsed(c => ({ ...c, [key]: !c[key] }));

  // — Roll history (Feature 14) —
  const [rollHistory, setRollHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const skipHistory = useRef(false);

  // — Preset menu (Feature 13) —
  const [showPresets, setShowPresets] = useState(false);
  useEffect(() => {
    if (!showPresets) return;
    const close = () => setShowPresets(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [showPresets]);

  // — Toast notification —
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    var t = setTimeout(function() { setToast(null); }, 2500);
    return function() { clearTimeout(t); };
  }, [toast]);

  // ── Leader pools ──
  const leaderPool = useMemo(() => availableLeaders(dlcs, bannedLeaders), [dlcs, bannedLeaders]);
  const fullPool = useMemo(() => window.LEADERS.filter(l => l.dlc === null || dlcs.has(l.dlc)), [dlcs]);

  // Drop unavailable leaders from non-locked slots
  useEffect(() => {
    setSlots(prev => prev.map(s => {
      if (s.locked) return s;
      if (s.leaderId && !leaderPool.find(l => l.id === s.leaderId)) {
        return { ...s, leaderId: null };
      }
      return s;
    }));
  }, [leaderPool]);

  // ─── Setting handlers ────────────────────────────────────
  const setField = (key, patch) =>
    setSettings(s => ({ ...s, [key]: { ...s[key], ...patch } }));

  const rerollField = (key) => {
    const opts = window.OPTIONS[key];
    if (opts) setField(key, { value: pick(opts) });
  };

  // ─── Player handlers ─────────────────────────────────────
  const updateSlot = (i, patch) =>
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));

  const rerollSlot = (i) => {
    setSlots(prev => {
      const slotPool = getSlotPool(i);
      const used = new Set(prev.filter((s, idx) => idx !== i && s.leaderId).map(s => s.leaderId));
      const usedCivs = new Set(
        prev.filter((s, idx) => idx !== i && s.leaderId)
          .map(function(s) { var found = window.LEADERS.find(function(l) { return l.id === s.leaderId; }); return found ? found.civ : null; })
          .filter(Boolean)
      );
      let candidates = slotPool.filter(l => !used.has(l.id) && !usedCivs.has(l.civ));
      if (!candidates.length) candidates = slotPool.filter(l => !used.has(l.id));
      if (!candidates.length) candidates = slotPool;
      if (!candidates.length) return prev;
      return prev.map((s, idx) => idx === i ? { ...s, leaderId: pick(candidates).id } : s);
    });
  };

  // ─── Game mode handlers ──────────────────────────────────
  const modeAvailable = (m) => m.dlc ? dlcs.has(m.dlc) : true;
  const toggleMode = (id) => setModes(m => ({ ...m, [id]: { ...m[id], on: !m[id].on } }));
  const toggleModeLock = (id) => setModes(m => ({ ...m, [id]: { ...m[id], locked: !m[id].locked } }));
  const toggleVictory = (id) => setVictories(v => ({ ...v, [id]: { ...v[id], on: !v[id].on } }));
  const toggleVictoryLock = (id) => setVictories(v => ({ ...v, [id]: { ...v[id], locked: !v[id].locked } }));

  // ─── ROLL EVERYTHING ────────────────────────────────────
  const rollAll = useCallback(() => {
    setRolling(true);
    setTimeout(() => setRolling(false), 400);

    // 1. Roll settings synchronously so we can use the new map size
    let newSettings = {};
    Object.keys(settings).forEach(k => {
      newSettings[k] = { ...settings[k] };
    });

    if (!collapsed.rules) {
      Object.keys(newSettings).forEach(k => {
        if (!newSettings[k].locked) {
          newSettings[k] = { ...newSettings[k], value: pick(window.OPTIONS[k]) };
        }
      });
    }

    // 2. Player count — optionally linked to map size
    let newAi = aiCount;
    if (!collapsed.players && !aiCountLocked) {
      if (linkMapSize && !collapsed.rules) {
        const range = MAP_SIZE_RANGES[newSettings.mapSize.value];
        if (range) {
          const total = pickRange(range.players[0], range.players[1]);
          newAi = Math.max(1, total - humanCount);
        }
      } else {
        const aiMin = humanCount >= 2 ? 0 : 1;
        const totalMin = humanCount + aiMin;
        const totalMax = 12;
        const total = totalMin + Math.floor(Math.random() * (totalMax - totalMin + 1));
        newAi = Math.max(aiMin, total - humanCount);
      }
      setAiCount(newAi);
    }

    // Link city-states to map size
    if (linkMapSize && !collapsed.rules && !newSettings.cityStates.locked) {
      const range = MAP_SIZE_RANGES[newSettings.mapSize.value];
      if (range) {
        newSettings.cityStates = { ...newSettings.cityStates, value: String(pickRange(range.cs[0], range.cs[1])) };
      }
    }

    if (!collapsed.rules) {
      setSettings(newSettings);
    }

    // 3. Leaders — per-player DLC pools, most constrained first
    if (!collapsed.players) {
      setSlots(prev => {
        const total = humanCount + newAi;
        const sized = [];
        for (let i = 0; i < total; i++) {
          const kind = i < humanCount ? "Human" : "AI";
          const existing = prev[i];
          sized.push(existing ? { ...existing, kind } : { kind, leaderId: null, locked: false });
        }

        const lockedLeaders = new Set(sized.filter(s => s.locked && s.leaderId).map(s => s.leaderId));
        const lockedCivs = new Set(
          sized.filter(s => s.locked && s.leaderId)
            .map(function(s) { var found = window.LEADERS.find(function(l) { return l.id === s.leaderId; }); return found ? found.civ : null; })
            .filter(Boolean)
        );

        // Build per-slot pools for unlocked slots
        var unlocked = [];
        sized.forEach(function(s, i) {
          if (s.locked) return;
          var slotDlcs = (i < humanCount && playerDlcs[i]) ? playerDlcs[i] : dlcs;
          var pool = availableLeaders(slotDlcs, bannedLeaders).filter(function(l) { return !lockedLeaders.has(l.id); });
          unlocked.push({ idx: i, pool: pool });
        });

        // Assign most constrained (smallest pool) first
        unlocked.sort(function(a, b) { return a.pool.length - b.pool.length; });

        var usedLeaders = new Set(lockedLeaders);
        var usedCivs = new Set(lockedCivs);
        var assignments = {};

        unlocked.forEach(function(entry) {
          var available = entry.pool.filter(function(l) { return !usedLeaders.has(l.id); });
          var shuffled = available.slice().sort(function() { return Math.random() - 0.5; });
          var chosen = shuffled.find(function(l) { return !usedCivs.has(l.civ); });
          if (!chosen && shuffled.length) chosen = shuffled[0]; // allow civ duplicate as fallback
          if (chosen) {
            assignments[entry.idx] = chosen.id;
            usedLeaders.add(chosen.id);
            usedCivs.add(chosen.civ);
          } else {
            assignments[entry.idx] = null;
          }
        });

        return sized.map(function(s, i) {
          if (s.locked) return s;
          return { kind: s.kind, leaderId: assignments[i] !== undefined ? assignments[i] : null, locked: false };
        });
      });
    }

    // 4. Game modes
    if (!collapsed.modes) {
      setModes(prev => {
        const next = { ...prev };
        window.GAME_MODES.forEach(m => {
          if (prev[m.id].locked) return;
          if (!modeAvailable(m)) { next[m.id] = { ...prev[m.id], on: false }; return; }
          next[m.id] = { ...prev[m.id], on: Math.random() < 0.25 };
        });
        return next;
      });
    }

    // 5. Victories — keep at least one on
    if (!collapsed.victory) {
      setVictories(prev => {
        const next = { ...prev };
        window.VICTORY_TYPES.forEach(v => {
          if (prev[v.id].locked) return;
          if (v.dlc && !dlcs.has(v.dlc)) { next[v.id] = { ...prev[v.id], on: false }; return; }
          next[v.id] = { ...prev[v.id], on: Math.random() < 0.8 };
        });
        if (!Object.values(next).some(x => x.on)) {
          const cands = window.VICTORY_TYPES.filter(v => !next[v.id].locked && (!v.dlc || dlcs.has(v.dlc)));
          const c = pick(cands) || window.VICTORY_TYPES[0];
          next[c.id] = { ...next[c.id], on: true };
        }
        return next;
      });
    }

    setRollNonce(n => n + 1);
  }, [leaderPool, humanCount, aiCount, aiCountLocked, dlcs, collapsed, settings, linkMapSize, playerDlcs, bannedLeaders]);

  // ── History capture after each roll ──
  useEffect(() => {
    if (rollNonce === 0) return;
    if (skipHistory.current) { skipHistory.current = false; return; }
    const sv = {};
    Object.keys(settings).forEach(k => { sv[k] = settings[k].value; });
    setRollHistory(prev => [{
      ts: Date.now(),
      settings: sv,
      h: humanCount,
      a: aiCount,
      slots: slots.map(s => ({ kind: s.kind, leaderId: s.leaderId })),
      modes: Object.fromEntries(Object.entries(modes).filter(function(e) { return e[1].on; }).map(function(e) { return [e[0], true]; })),
      victories: Object.fromEntries(Object.entries(victories).filter(function(e) { return e[1].on; }).map(function(e) { return [e[0], true]; })),
    }, ...prev].slice(0, 10));
  }, [rollNonce]);

  // ─── Reset ──────────────────────────────────────────────
  const resetAll = () => {
    skipHistory.current = true;
    setSettings(initSettings());
    setSlots(prev => prev.map(s => ({ ...s, leaderId: null, locked: false })));
    setModes(() => {
      const o = {};
      window.GAME_MODES.forEach(m => { o[m.id] = { on: false, locked: false }; });
      return o;
    });
    setVictories(() => {
      const o = {};
      window.VICTORY_TYPES.forEach(v => { o[v.id] = { on: true, locked: false }; });
      return o;
    });
    setAiCountLocked(false);
    setRollNonce(n => n + 1);
  };

  // ─── Presets (Feature 13) ──────────────────────────────
  const applyPreset = (preset) => {
    setShowPresets(false);
    resetAll();

    switch (preset) {
      case "deity-domination":
        setSettings(prev => ({
          ...prev,
          difficulty: { value: "Deity", locked: true },
          mapType: { value: "Pangaea", locked: true },
        }));
        setVictories(() => {
          const o = {};
          window.VICTORY_TYPES.forEach(v => { o[v.id] = { on: v.id === "domination", locked: true }; });
          return o;
        });
        break;
      case "peaceful-builder":
        setSettings(prev => ({
          ...prev,
          difficulty: { value: "Settler", locked: true },
          mapSize: { value: "Large", locked: true },
          gameSpeed: { value: "Epic", locked: true },
        }));
        setVictories(() => {
          const o = {};
          window.VICTORY_TYPES.forEach(v => {
            o[v.id] = {
              on: v.id === "science" || v.id === "culture" || v.id === "score",
              locked: v.id === "domination",
            };
          });
          return o;
        });
        break;
      case "chaos":
        setModes(() => {
          const o = {};
          window.GAME_MODES.forEach(m => { o[m.id] = { on: modeAvailable(m), locked: modeAvailable(m) }; });
          return o;
        });
        setCollapsed({ dlc: false, players: false, rules: false, modes: false, victory: false, summary: false });
        break;
      case "duel":
        setHumanCount(1);
        setAiCount(1);
        setAiCountLocked(true);
        setSettings(prev => ({ ...prev, mapSize: { value: "Duel", locked: true } }));
        break;
      case "full-random":
        setCollapsed({ dlc: false, players: false, rules: false, modes: false, victory: false, summary: false });
        setAiCountLocked(false);
        break;
    }
  };

  // ─── Copy summary to clipboard (Feature 10) ──────────
  const copySummary = () => {
    const lines = ["=== GAME RANDOMIZER \u2014 YOUR DECREE ===", ""];
    summary.forEach(function(item) { lines.push(item[0] + ": " + item[1]); });
    lines.push("");
    slots.forEach(function(s, i) {
      var l = leaderPool.find(function(x) { return x.id === s.leaderId; });
      lines.push(s.kind + " " + toRoman(i + 1) + ": " + (l ? l.leader + " \u2014 " + l.civ : "Unassigned"));
    });
    lines.push("");
    var am = window.GAME_MODES.filter(function(m) { return modes[m.id] && modes[m.id].on && modeAvailable(m); }).map(function(m) { return m.name; });
    lines.push("Game Modes: " + (am.length ? am.join(", ") : "None"));
    var av = window.VICTORY_TYPES.filter(function(v) { return victories[v.id] && victories[v.id].on; }).map(function(v) { return v.name; });
    lines.push("Victories: " + av.join(", "));
    copyText(lines.join("\n")).then(function() {
      setToast("Summary copied to clipboard");
    });
  };

  // ─── Share link (Feature 10) ──────────────────────────
  const shareLink = () => {
    const state = {
      d: [...dlcs],
      h: humanCount,
      a: aiCount,
      s: {},
      sl: slots.map(function(s) { return s.leaderId || ""; }),
      m: Object.entries(modes).filter(function(e) { return e[1].on; }).map(function(e) { return e[0]; }),
      v: Object.entries(victories).filter(function(e) { return e[1].on; }).map(function(e) { return e[0]; }),
    };
    Object.keys(settings).forEach(function(k) { state.s[k] = settings[k].value; });
    var json = JSON.stringify(state);
    var url = window.location.origin + window.location.pathname + "#" + btoa(unescape(encodeURIComponent(json)));
    copyText(url).then(function() {
      setToast("Share link copied to clipboard");
    }).catch(function() {
      setToast("Failed to copy link");
    });
  };

  // ── Load from URL hash on mount ──
  useEffect(() => {
    var hash = window.location.hash.slice(1);
    if (!hash) return;
    try {
      var state = JSON.parse(decodeURIComponent(escape(atob(hash))));
      if (state.d) setDlcs(new Set(state.d));
      if (state.h) setHumanCount(state.h);
      if (state.a) setAiCount(state.a);
      if (state.s) {
        setSettings(function(prev) {
          var next = {};
          Object.keys(prev).forEach(function(k) {
            next[k] = state.s[k] ? { value: state.s[k], locked: false } : prev[k];
          });
          return next;
        });
      }
      if (state.sl) {
        var total = (state.h || 1) + (state.a || 7);
        setSlots(Array.from({ length: total }, function(_, i) {
          return {
            kind: i < (state.h || 1) ? "Human" : "AI",
            leaderId: state.sl[i] || null,
            locked: false,
          };
        }));
      }
      if (state.m) {
        setModes(function(prev) {
          var next = {};
          Object.keys(prev).forEach(function(k) { next[k] = { on: state.m.indexOf(k) !== -1, locked: false }; });
          return next;
        });
      }
      if (state.v) {
        setVictories(function(prev) {
          var next = {};
          Object.keys(prev).forEach(function(k) { next[k] = { on: state.v.indexOf(k) !== -1, locked: false }; });
          return next;
        });
      }
      history.replaceState(null, "", window.location.pathname);
    } catch (e) {}
  }, []);

  // ─── Restore from history ──────────────────────────────
  const restoreRoll = (snap) => {
    setSettings(function(prev) {
      var next = {};
      Object.keys(prev).forEach(function(k) {
        next[k] = snap.settings[k] ? { value: snap.settings[k], locked: false } : prev[k];
      });
      return next;
    });
    setHumanCount(snap.h);
    setAiCount(snap.a);
    setSlots(snap.slots.map(function(s) { return { kind: s.kind, leaderId: s.leaderId, locked: false }; }));
    if (snap.modes) {
      setModes(function(prev) {
        var next = {};
        Object.keys(prev).forEach(function(k) { next[k] = { on: !!snap.modes[k], locked: false }; });
        return next;
      });
    }
    if (snap.victories) {
      setVictories(function(prev) {
        var next = {};
        Object.keys(prev).forEach(function(k) { next[k] = { on: !!snap.victories[k], locked: false }; });
        return next;
      });
    }
  };

  // ─── Summary ────────────────────────────────────────────
  const summary = useMemo(() => [
    ["Map",         settings.mapType.value],
    ["Size",        settings.mapSize.value],
    ["Difficulty",  settings.difficulty.value],
    ["Speed",       settings.gameSpeed.value],
    ["Start Era",   settings.startEra.value],
    ["Resources",   settings.resources.value],
    ["World Age",   settings.worldAge.value],
    ["Temperature", settings.temperature.value],
    ["Rainfall",    settings.rainfall.value],
    ["Sea Level",   settings.seaLevel.value],
    ["Disasters",   settings.disasterIntensity.value],
    ["City-States", settings.cityStates.value],
    ["Players",     humanCount + " Human \u00B7 " + aiCount + " AI"],
  ], [settings, humanCount, aiCount]);

  // ─── Render ─────────────────────────────────────────────
  const settingsKeys = [
    ["Map Type",    "mapType"],
    ["Map Size",    "mapSize"],
    ["Difficulty",  "difficulty"],
    ["Game Speed",  "gameSpeed"],
    ["Start Era",   "startEra"],
    ["Resources",   "resources"],
    ["City-States", "cityStates"],
  ];
  const worldKeys = [
    ["World Age",    "worldAge"],
    ["Temperature",  "temperature"],
    ["Rainfall",     "rainfall"],
    ["Sea Level",    "seaLevel"],
    ["Disasters",    "disasterIntensity"],
  ];

  return (
    <div className="app">
      {/* ─── Masthead ─── */}
      <div className="masthead">
        <div className="title-block">
          <div className="eyebrow">— The Tome of Many Worlds —</div>
          <h1>Game Randomizer</h1>
          <div className="sub">An unofficial setup oracle for Civilization VI &middot; lock what you love, roll the rest.</div>
        </div>
        <div className="masthead-actions">
          <div className="preset-wrap">
            <button className="btn" onClick={function(e) { e.stopPropagation(); setShowPresets(function(v) { return !v; }); }}>Presets &#x25BE;</button>
            {showPresets && (
              <div className="preset-menu" onClick={function(e) { e.stopPropagation(); }}>
                <button onClick={function() { applyPreset("full-random"); }}>Full Random</button>
                <button onClick={function() { applyPreset("deity-domination"); }}>Deity Domination</button>
                <button onClick={function() { applyPreset("peaceful-builder"); }}>Peaceful Builder</button>
                <button onClick={function() { applyPreset("chaos"); }}>Chaos Mode</button>
                <button onClick={function() { applyPreset("duel"); }}>1v1 Duel</button>
              </div>
            )}
          </div>
          <button className="btn" onClick={resetAll}>Reset</button>
          <button className="btn btn-primary" onClick={rollAll}>&#x2684; Roll Everything</button>
        </div>
      </div>

      {/* ─── I · DLC ─── */}
      <div className={"section " + (collapsed.dlc ? "collapsed" : "")}>
        <SectionHead
          roman="I"
          title="Content Owned"
          collapsed={collapsed.dlc}
          onToggle={function() { toggleCollapsed("dlc"); }}
          extra={
            <React.Fragment>
              <button className="btn btn-ghost" onClick={function(e) { e.stopPropagation(); setDlcs(new Set(window.DLCS.map(function(d) { return d.id; }))); }}>Select All</button>
              <button className="btn btn-ghost" onClick={function(e) { e.stopPropagation(); setDlcs(new Set()); }}>Deselect All</button>
            </React.Fragment>
          }
        />
        <div className="panel">
          <div className="dlc-grid">
            {window.DLCS.map(function(d) {
              return <DlcCard key={d.id} dlc={d} on={dlcs.has(d.id)} onToggle={function() { toggleDlc(d.id); }} />;
            })}
          </div>
          <div className="note">Toggling off a pack removes its civilizations, leaders, and game modes from the random pool.</div>
        </div>
      </div>

      {/* ─── II · Players & Leaders ─── */}
      <div className={"section " + (collapsed.players ? "collapsed locked" : "")}>
        <SectionHead
          roman="II"
          title="Players &amp; Leaders"
          collapsed={collapsed.players}
          onToggle={function() { toggleCollapsed("players"); }}
          locked={true}
          extra={
            <button
              className={"btn btn-ghost" + (bannedLeaders.size > 0 ? " ban-active" : "")}
              onClick={function(e) { e.stopPropagation(); setShowBanList(function(v) { return !v; }); }}
            >
              {bannedLeaders.size > 0 ? "Bans (" + bannedLeaders.size + ")" : "Ban List"}
            </button>
          }
        />
        <div className="panel">
          {/* Ban list */}
          {showBanList && (
            <div className="ban-panel">
              <div className="ban-header">
                <span className="ban-title">Banned Leaders</span>
                <span className="ban-sub">Banned leaders are excluded from the random pool</span>
                {bannedLeaders.size > 0 && (
                  <button className="btn btn-ghost" onClick={function() { setBannedLeaders(new Set()); }} style={{marginLeft: "auto", padding: "4px 8px"}}>Clear All</button>
                )}
              </div>
              <div className="ban-grid">
                {fullPool.map(function(l) {
                  return (
                    <div
                      key={l.id}
                      className={"ban-chip " + (bannedLeaders.has(l.id) ? "banned" : "")}
                      onClick={function() { toggleBan(l.id); }}
                      title={l.leader + " \u00B7 " + l.civ}
                    >
                      <span className="ban-chip-name">{l.leader}</span>
                      <span className="ban-chip-civ">{l.civ}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="players-head">
            <div className="counter">
              <div className="counter-label">
                Human Players
                <span className="sublbl">Always your choice — never randomized.</span>
              </div>
              <div className="counter-ctrl">
                <button className="counter-btn" disabled={humanCount <= 1} onClick={function() { setHumanCount(function(n) { return Math.max(1, n - 1); }); }}>−</button>
                <div className="counter-num">{humanCount}</div>
                <button className="counter-btn" disabled={humanCount + aiCount >= 12} onClick={function() { setHumanCount(function(n) { return Math.min(12 - aiCount, n + 1); }); }}>+</button>
              </div>
            </div>
            <div className="counter">
              <div className="counter-label">
                AI Opponents
                <span className="sublbl">Lock the count, or let the dice decide.</span>
              </div>
              <div className="counter-ctrl">
                <button className="counter-btn" disabled={aiCount <= 0 || (aiCount <= 1 && humanCount < 2)} onClick={function() { setAiCount(function(n) { return Math.max(humanCount >= 2 ? 0 : 1, n - 1); }); }}>−</button>
                <div className="counter-num">{aiCount}</div>
                <button className="counter-btn" disabled={humanCount + aiCount >= 12} onClick={function() { setAiCount(function(n) { return Math.min(12 - humanCount, n + 1); }); }}>+</button>
                <button
                  className={"btn-icon " + (aiCountLocked ? "locked" : "")}
                  title={aiCountLocked ? "AI count is locked" : "AI count will randomize"}
                  onClick={function() { setAiCountLocked(function(v) { return !v; }); }}
                  style={{marginLeft: 6}}
                >
                  {aiCountLocked ? <LockClosedIcon/> : <LockOpenIcon/>}
                </button>
              </div>
            </div>
          </div>

          <div className="player-list">
            {slots.map(function(s, i) {
              var isHuman = s.kind === "Human";
              var slotPool = isHuman ? getSlotPool(i) : leaderPool;
              var hasCustomDlc = isHuman && playerDlcs[i] != null;
              return (
                <React.Fragment key={i}>
                  <PlayerRow
                    idx={i + 1}
                    kind={s.kind}
                    leaderId={s.leaderId}
                    locked={s.locked}
                    leaderPool={slotPool}
                    onChange={function(v) { updateSlot(i, { leaderId: v || null }); }}
                    onLockToggle={function() { updateSlot(i, { locked: !s.locked }); }}
                    onReroll={function() { rerollSlot(i); }}
                    rolling={rolling && !s.locked}
                  />
                  {isHuman && (
                    <div className="player-dlc-row">
                      <button
                        className={"player-dlc-toggle" + (hasCustomDlc ? " custom" : "")}
                        onClick={function() { setExpandedPlayerDlc(function(v) { return v === i ? null : i; }); }}
                      >
                        {hasCustomDlc
                          ? "Custom DLC (" + playerDlcs[i].size + "/" + window.DLCS.length + ")"
                          : "Using global DLC"}
                      </button>
                      {expandedPlayerDlc === i && (
                        <div className="player-dlc-picker">
                          {!hasCustomDlc && (
                            <button className="btn btn-ghost" style={{padding: "4px 10px", fontSize: 11}} onClick={function() { enableCustomDlc(i); }}>
                              Customize for this player
                            </button>
                          )}
                          {hasCustomDlc && (
                            <React.Fragment>
                              <div className="player-dlc-chips">
                                {window.DLCS.map(function(d) {
                                  return (
                                    <div
                                      key={d.id}
                                      className={"player-dlc-chip " + (playerDlcs[i].has(d.id) ? "on" : "")}
                                      onClick={function() { togglePlayerDlc(i, d.id); }}
                                      title={d.name}
                                    >
                                      {d.short}
                                    </div>
                                  );
                                })}
                              </div>
                              <button className="btn btn-ghost" style={{padding: "4px 10px", fontSize: 10, marginTop: 6}} onClick={function() { resetPlayerDlc(i); }}>
                                Reset to global
                              </button>
                            </React.Fragment>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── III · Rules of the World ─── */}
      <div className={"section " + (collapsed.rules ? "collapsed locked" : "")}>
        <SectionHead
          roman="III"
          title="Rules of the World"
          collapsed={collapsed.rules}
          onToggle={function() { toggleCollapsed("rules"); }}
          locked={true}
          extra={
            <button
              className={"btn btn-ghost" + (linkMapSize ? " link-active" : "")}
              onClick={function(e) { e.stopPropagation(); setLinkMapSize(function(v) { return !v; }); }}
              title="When enabled, player count and city-states scale to map size during rolls"
            >
              {linkMapSize ? "\u26D3 Map Link On" : "Map Link Off"}
            </button>
          }
        />
        <div className="cols-2">
          <div className="panel">
            <div style={{fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10}}>Match Settings</div>
            {settingsKeys.map(function(pair) {
              var label = pair[0], key = pair[1];
              return (
                <LockableField
                  key={key}
                  label={label}
                  options={window.OPTIONS[key]}
                  value={settings[key].value}
                  locked={settings[key].locked}
                  onChange={function(v) { setField(key, { value: v }); }}
                  onLockToggle={function() { setField(key, { locked: !settings[key].locked }); }}
                  onReroll={function() { rerollField(key); }}
                  rolling={rolling && !settings[key].locked}
                />
              );
            })}
          </div>
          <div className="panel">
            <div style={{fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10}}>World Climate</div>
            {worldKeys.map(function(pair) {
              var label = pair[0], key = pair[1];
              return (
                <LockableField
                  key={key}
                  label={label}
                  options={window.OPTIONS[key]}
                  value={settings[key].value}
                  locked={settings[key].locked}
                  onChange={function(v) { setField(key, { value: v }); }}
                  onLockToggle={function() { setField(key, { locked: !settings[key].locked }); }}
                  onReroll={function() { rerollField(key); }}
                  rolling={rolling && !settings[key].locked}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── IV · Game Modes ─── */}
      <div className={"section " + (collapsed.modes ? "collapsed locked" : "")}>
        <SectionHead
          roman="IV"
          title="Game Modes"
          collapsed={collapsed.modes}
          onToggle={function() { toggleCollapsed("modes"); }}
          locked={true}
        />
        <div className="panel">
          <div className="modes-grid">
            {window.GAME_MODES.map(function(m) {
              var available = modeAvailable(m);
              var dlc = window.DLCS.find(function(d) { return d.id === m.dlc; });
              return (
                <div
                  key={m.id}
                  className={"mode-card " + (modes[m.id].on && available ? "on " : "") + (!available ? "disabled" : "")}
                >
                  <div>
                    <div className="mode-name">{m.name}</div>
                    <span className="req">{available ? "Requires " + (dlc ? dlc.short : "base") : "Locked — enable " + (dlc ? dlc.name : "")}</span>
                  </div>
                  <button
                    className="mode-toggle"
                    disabled={!available}
                    onClick={function() { if (available) toggleMode(m.id); }}
                    title="Toggle mode"
                  />
                  <button
                    className={"btn-icon " + (modes[m.id].locked ? "locked" : "")}
                    onClick={function() { toggleModeLock(m.id); }}
                    title={modes[m.id].locked ? "Locked" : "Unlocked"}
                  >
                    {modes[m.id].locked ? <LockClosedIcon/> : <LockOpenIcon/>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── V · Paths to Victory ─── */}
      <div className={"section " + (collapsed.victory ? "collapsed locked" : "")}>
        <SectionHead
          roman="V"
          title="Paths to Victory"
          collapsed={collapsed.victory}
          onToggle={function() { toggleCollapsed("victory"); }}
          locked={true}
        />
        <div className="panel">
          <div className="modes-grid">
            {window.VICTORY_TYPES.map(function(v) {
              var available = !v.dlc || dlcs.has(v.dlc);
              var dlc = v.dlc && window.DLCS.find(function(d) { return d.id === v.dlc; });
              return (
                <div
                  key={v.id}
                  className={"mode-card " + (victories[v.id].on && available ? "on " : "") + (!available ? "disabled" : "")}
                >
                  <div>
                    <div className="mode-name">{v.name} Victory</div>
                    <span className="req">{available ? (dlc ? "Requires " + dlc.short : "Base game") : "Requires " + (dlc ? dlc.name : "")}</span>
                  </div>
                  <button
                    className="mode-toggle"
                    disabled={!available}
                    onClick={function() { if (available) toggleVictory(v.id); }}
                  />
                  <button
                    className={"btn-icon " + (victories[v.id].locked ? "locked" : "")}
                    onClick={function() { toggleVictoryLock(v.id); }}
                  >
                    {victories[v.id].locked ? <LockClosedIcon/> : <LockOpenIcon/>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── VI · Your Decree ─── */}
      <div className={"section " + (collapsed.summary ? "collapsed" : "")}>
        <SectionHead
          roman="VI"
          title="Your Decree"
          collapsed={collapsed.summary}
          onToggle={function() { toggleCollapsed("summary"); }}
          extra={
            <React.Fragment>
              <button className="btn btn-ghost" onClick={copySummary} title="Copy summary to clipboard">
                Copy
              </button>
              <button className="btn btn-ghost" onClick={shareLink} title="Copy share link to clipboard">
                Share Link
              </button>
            </React.Fragment>
          }
        />
        <div className="summary" key={"sum-" + rollNonce}>
          <h3>&#x2726;  By the dice, thus it shall be  &#x2726;</h3>
          <div className="summary-grid">
            {summary.map(function(item) {
              return (
                <div className="summary-item flip-anim" key={item[0]}>
                  <div className="k">{item[0]}</div>
                  <div className="v">{item[1]}</div>
                </div>
              );
            })}
          </div>
          <div className="compass"><span className="line"></span><span className="star">&#x269C;</span><span className="line"></span></div>
          <div className="summary-grid">
            {slots.map(function(s, i) {
              var l = leaderPool.find(function(x) { return x.id === s.leaderId; });
              return (
                <div className="summary-item flip-anim" key={i}>
                  <div className="k">{s.kind} &middot; Player {toRoman(i + 1)}</div>
                  <div className="v">{l ? l.leader + " — " + l.civ : "—"}</div>
                </div>
              );
            })}
          </div>
          <div className="compass"><span className="line"></span><span className="star">&#x269C;</span><span className="line"></span></div>
          <div className="summary-grid">
            <div className="summary-item flip-anim">
              <div className="k">Game Modes</div>
              <div className="v">
                {(function() {
                  var active = Object.entries(modes).filter(function(e) { return e[1].on && modeAvailable(window.GAME_MODES.find(function(g) { return g.id === e[0]; })); }).map(function(e) { return window.GAME_MODES.find(function(g) { return g.id === e[0]; }).name; });
                  return active.length ? active.join(" \u00B7 ") : <em style={{color: "var(--parchment-dim)"}}>None</em>;
                })()}
              </div>
            </div>
            <div className="summary-item flip-anim">
              <div className="k">Victories Enabled</div>
              <div className="v">
                {(function() {
                  var active = Object.entries(victories).filter(function(e) { return e[1].on; }).map(function(e) { return window.VICTORY_TYPES.find(function(g) { return g.id === e[0]; }).name; });
                  return active.length ? active.join(" \u00B7 ") : <em style={{color: "var(--parchment-dim)"}}>None</em>;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── VII · Roll History ─── */}
      {rollHistory.length > 0 && (
        <div className={"section " + (!showHistory ? "collapsed" : "")}>
          <SectionHead
            roman="VII"
            title={"Roll History (" + rollHistory.length + ")"}
            collapsed={!showHistory}
            onToggle={function() { setShowHistory(function(v) { return !v; }); }}
          />
          <div className="panel">
            <div className="history-list">
              {rollHistory.map(function(snap, idx) {
                var time = new Date(snap.ts);
                var timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                return (
                  <div className="history-entry" key={snap.ts}>
                    <div className="history-header">
                      <span className="history-num">Roll #{rollHistory.length - idx}</span>
                      <span className="history-time">{timeStr}</span>
                      <button className="btn btn-ghost history-restore" onClick={function() { restoreRoll(snap); }}>Restore</button>
                    </div>
                    <div className="history-summary">
                      {snap.settings.mapType} &middot; {snap.settings.mapSize} &middot; {snap.settings.difficulty} &middot; {snap.settings.gameSpeed}
                      <span className="history-players"> — {snap.h}H / {snap.a}AI</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="foot">
        Made for tabletop-style chaos. Lock what matters, leave the rest to fate.
        <div className="credit">— An unofficial fan tool &middot; not affiliated with any publisher —</div>
      </div>

      {toast && <div className="toast" key={toast}>{toast}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);

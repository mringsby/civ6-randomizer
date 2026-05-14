/* global React, ReactDOM */
const { useState, useMemo, useEffect, useCallback } = React;

// ─── Section header (collapsible) ──────────────────────────
function SectionHead({ roman, title, collapsed, onToggle, locked, extra }) {
  return (
    <div className="section-head">
      <span className="roman">{roman}</span>
      <h2 className="clickable" onClick={onToggle}>{title}</h2>
      {locked && collapsed && <span className="head-status">⬢ Locked — won't randomize</span>}
      <span className="ornament"></span>
      <div className="head-actions">
        {extra}
        <button className="chev" onClick={onToggle} title={collapsed ? "Expand" : "Collapse (also stops randomizing)"}>
          {collapsed ? "▸" : "▾"}
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

// ─── helpers ───────────────────────────────────────────────
const pick  = (arr) => arr[Math.floor(Math.random() * arr.length)];
const toRoman = (n) => ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"][n] || String(n);

// Compute leader pool from enabled DLCs
function availableLeaders(dlcs) {
  return window.LEADERS.filter(l => l.dlc === null || dlcs.has(l.dlc));
}

// ─── lockable field control ────────────────────────────────
function LockableField({ label, options, value, locked, onChange, onLockToggle, onReroll, animKey }) {
  return (
    <div className="field">
      <div className="field-label">{label}</div>
      <div className="field-value-shell">
        <select
          className={"field-select " + (locked ? "locked" : "")}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
        >
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <button
        className="btn-reroll"
        title="Reroll this"
        disabled={locked}
        onClick={onReroll}
      >
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
        <div className="dlc-kind">{dlc.kind} · {dlc.short}</div>
      </div>
    </div>
  );
}

// ─── Player row ────────────────────────────────────────────
function PlayerRow({ idx, kind, leaderId, locked, leaderPool, onChange, onLockToggle, onReroll, animKey }) {
  const leader = leaderPool.find(l => l.id === leaderId) || null;
  return (
    <div className={"player-row " + (kind === "Human" ? "human" : "")} key={animKey}>
      <div className="player-portrait">{toRoman(idx)}</div>
      <div className="player-kind-tag">{kind === "Human" ? "HUM" : "AI"}</div>
      <div>
        {leader ? (
          <div className="player-leader">
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
            <option key={l.id} value={l.id}>{l.leader} · {l.civ}</option>
          ))}
        </select>
      </div>
      <button
        className="btn-reroll"
        title="Reroll this leader"
        disabled={locked}
        onClick={onReroll}
      ><DieIcon/></button>
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
  // — DLCs (Set of ids; base is implicit) — start with main expansions on
  const [dlcs, setDlcs] = useState(() => new Set([
    "rf","gs","viking","poland","aus","perm","nub","khid",
    "maya","eth","byzgaul","bab","viet","port","ldr"
  ]));
  const toggleDlc = (id) => setDlcs(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  // — Players: counts + per-slot leader assignment
  const [humanCount, setHumanCount] = useState(1);
  const [aiCount, setAiCount]       = useState(7);
  const [aiCountLocked, setAiCountLocked] = useState(false);
  // slots: array of { kind, leaderId|null, locked }
  const [slots, setSlots] = useState(() => {
    const init = [];
    init.push({ kind: "Human", leaderId: null, locked: false });
    for (let i = 0; i < 7; i++) init.push({ kind: "AI", leaderId: null, locked: false });
    return init;
  });

  // Reconcile slots whenever counts change (preserve existing assignments)
  useEffect(() => {
    setSlots(prev => {
      const total = humanCount + aiCount;
      const next = [];
      for (let i = 0; i < total; i++) {
        const kind = i < humanCount ? "Human" : "AI";
        const existing = prev[i];
        if (existing) {
          next.push({ ...existing, kind });
        } else {
          next.push({ kind, leaderId: null, locked: false });
        }
      }
      return next;
    });
  }, [humanCount, aiCount]);

  // — Settings (categorical, lockable) —
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
    cityStates:        { value: "12",            locked: false }
  });
  const [settings, setSettings] = useState(initSettings);

  // — Game modes (each: { on, locked })
  const [modes, setModes] = useState(() => {
    const o = {};
    window.GAME_MODES.forEach(m => o[m.id] = { on: false, locked: false });
    return o;
  });

  // — Victory types (each: { on, locked })
  const [victories, setVictories] = useState(() => {
    const o = {};
    window.VICTORY_TYPES.forEach(v => o[v.id] = { on: true, locked: false });
    return o;
  });

  // For animation key cycling on roll
  const [rollNonce, setRollNonce] = useState(0);

  // Collapsed sections — when collapsed, that section is excluded from "Roll Everything"
  const [collapsed, setCollapsed] = useState({
    dlc: false, players: false, rules: false, modes: false, victory: false, summary: false
  });
  const toggleCollapsed = (key) =>
    setCollapsed(c => ({ ...c, [key]: !c[key] }));

  // ── Available leader pool (driven by DLCs) ──
  const leaderPool = useMemo(() => availableLeaders(dlcs), [dlcs]);

  // If DLCs change, drop assignments that became unavailable (unless locked)
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
    if (!opts) return;
    setField(key, { value: pick(opts) });
  };

  // ─── Player handlers ─────────────────────────────────────
  const updateSlot = (i, patch) =>
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));

  // Reroll a single slot — pick a leader not used by other locked slots
  const rerollSlot = (i) => {
    setSlots(prev => {
      const used = new Set(prev.filter((s, idx) => idx !== i && s.leaderId).map(s => s.leaderId));
      const usedCivs = new Set(
        prev.filter((s, idx) => idx !== i && s.leaderId)
          .map(s => leaderPool.find(l => l.id === s.leaderId)?.civ)
          .filter(Boolean)
      );
      // prefer leaders whose civ isn't already in play
      let candidates = leaderPool.filter(l => !used.has(l.id) && !usedCivs.has(l.civ));
      if (candidates.length === 0) candidates = leaderPool.filter(l => !used.has(l.id));
      if (candidates.length === 0) candidates = leaderPool;
      return prev.map((s, idx) => idx === i ? { ...s, leaderId: pick(candidates).id } : s);
    });
  };

  // ─── Game mode handlers ──────────────────────────────────
  const modeAvailable = (m) => m.dlc ? dlcs.has(m.dlc) : true;

  const toggleMode = (id) => setModes(m => ({ ...m, [id]: { ...m[id], on: !m[id].on } }));
  const toggleModeLock = (id) => setModes(m => ({ ...m, [id]: { ...m[id], locked: !m[id].locked } }));

  // Victories
  const toggleVictory = (id) => setVictories(v => ({ ...v, [id]: { ...v[id], on: !v[id].on } }));
  const toggleVictoryLock = (id) => setVictories(v => ({ ...v, [id]: { ...v[id], locked: !v[id].locked } }));

  // ─── ROLL EVERYTHING ────────────────────────────────────
  // Order matters: AI count first → build the slot array for that new total →
  // THEN assign leaders. Doing leaders before slot resize leaves new slots empty.
  const rollAll = useCallback(() => {
    // ── 1. Match & World settings ──
    if (!collapsed.rules) {
      setSettings(prev => {
        const next = { ...prev };
        Object.keys(prev).forEach(k => {
          if (!prev[k].locked) next[k] = { ...prev[k], value: pick(window.OPTIONS[k]) };
        });
        return next;
      });
    }

    // ── 2. Players: resolve AI count synchronously, then build slots & roll leaders ──
    if (!collapsed.players) {
      // Decide new AI count up front so leaders are rolled for the FINAL slot count
      let newAiCount = aiCount;
      if (!aiCountLocked) {
        const totalMin = Math.max(2, humanCount + 1);
        const totalMax = 12;
        const total = totalMin + Math.floor(Math.random() * (totalMax - totalMin + 1));
        newAiCount = Math.max(1, total - humanCount);
        setAiCount(newAiCount);
      }

      setSlots(prev => {
        const total = humanCount + newAiCount;
        // 1) Rebuild slots for the new size, preserving existing ones
        const sized = [];
        for (let i = 0; i < total; i++) {
          const kind = i < humanCount ? "Human" : "AI";
          const existing = prev[i];
          sized.push(existing ? { ...existing, kind } : { kind, leaderId: null, locked: false });
        }

        // 2) Collect locked leaders/civs that must stay
        const lockedLeaders = new Set(sized.filter(s => s.locked && s.leaderId).map(s => s.leaderId));
        const lockedCivs = new Set(
          sized.filter(s => s.locked && s.leaderId)
            .map(s => leaderPool.find(l => l.id === s.leaderId)?.civ)
            .filter(Boolean)
        );

        // 3) Shuffle the leader pool, then walk slots and assign uniquely
        let pool = leaderPool.filter(l => !lockedLeaders.has(l.id) && !lockedCivs.has(l.civ));
        pool = [...pool].sort(() => Math.random() - 0.5);

        const usedCivsRun = new Set(lockedCivs);
        return sized.map(s => {
          if (s.locked) return s;
          let idx = pool.findIndex(l => !usedCivsRun.has(l.civ));
          if (idx === -1) idx = 0;
          const chosen = pool.splice(idx, 1)[0];
          if (!chosen) return { ...s, leaderId: null };
          usedCivsRun.add(chosen.civ);
          return { ...s, leaderId: chosen.id };
        });
      });
    }

    // ── 3. Game modes ──
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

    // ── 4. Victories — keep at least one on ──
    if (!collapsed.victory) {
      setVictories(prev => {
        const next = { ...prev };
        window.VICTORY_TYPES.forEach(v => {
          if (prev[v.id].locked) return;
          if (v.dlc && !dlcs.has(v.dlc)) { next[v.id] = { ...prev[v.id], on: false }; return; }
          next[v.id] = { ...prev[v.id], on: Math.random() < 0.8 };
        });
        const anyOn = Object.values(next).some(x => x.on);
        if (!anyOn) {
          const candidates = window.VICTORY_TYPES.filter(v => !next[v.id].locked && (!v.dlc || dlcs.has(v.dlc)));
          const c = pick(candidates) || window.VICTORY_TYPES[0];
          next[c.id] = { ...next[c.id], on: true };
        }
        return next;
      });
    }

    setRollNonce(n => n + 1);
  }, [leaderPool, humanCount, aiCount, aiCountLocked, dlcs, collapsed]);

  // ─── Reset ──────────────────────────────────────────────
  const resetAll = () => {
    setSettings(initSettings());
    setSlots(prev => prev.map(s => ({ ...s, leaderId: null, locked: false })));
    setModes(() => {
      const o = {};
      window.GAME_MODES.forEach(m => o[m.id] = { on: false, locked: false });
      return o;
    });
    setVictories(() => {
      const o = {};
      window.VICTORY_TYPES.forEach(v => o[v.id] = { on: true, locked: false });
      return o;
    });
    setAiCountLocked(false);
    setRollNonce(n => n + 1);
  };

  // ─── Summary text ───────────────────────────────────────
  const summary = useMemo(() => {
    const items = [
      ["Map",          settings.mapType.value],
      ["Size",         settings.mapSize.value],
      ["Difficulty",   settings.difficulty.value],
      ["Speed",        settings.gameSpeed.value],
      ["Start Era",    settings.startEra.value],
      ["Resources",    settings.resources.value],
      ["World Age",    settings.worldAge.value],
      ["Temperature",  settings.temperature.value],
      ["Rainfall",     settings.rainfall.value],
      ["Sea Level",    settings.seaLevel.value],
      ["Disasters",    settings.disasterIntensity.value],
      ["City-States",  settings.cityStates.value],
      ["Players",      `${humanCount} Human · ${aiCount} AI`],
    ];
    return items;
  }, [settings, humanCount, aiCount]);

  // ─── Render ─────────────────────────────────────────────
  const settingsKeys = [
    ["Map Type",        "mapType"],
    ["Map Size",        "mapSize"],
    ["Difficulty",      "difficulty"],
    ["Game Speed",      "gameSpeed"],
    ["Start Era",       "startEra"],
    ["Resources",       "resources"],
    ["City-States",     "cityStates"],
  ];
  const worldKeys = [
    ["World Age",       "worldAge"],
    ["Temperature",     "temperature"],
    ["Rainfall",        "rainfall"],
    ["Sea Level",       "seaLevel"],
    ["Disasters",       "disasterIntensity"],
  ];

  return (
    <div className="app">
      {/* ─── Masthead ─── */}
      <div className="masthead">
        <div className="title-block">
          <div className="eyebrow">— The Tome of Many Worlds —</div>
          <h1>Game Randomizer</h1>
          <div className="sub">An unofficial setup oracle for 4X civilization-builder games · lock what you love, roll the rest.</div>
        </div>
        <div className="masthead-actions">
          <button className="btn" onClick={resetAll}>Reset</button>
          <button className="btn btn-primary" onClick={rollAll}>⚄ Roll Everything</button>
        </div>
      </div>

      {/* ─── DLC ─── */}
      <div className={"section " + (collapsed.dlc ? "collapsed" : "")}>
        <SectionHead
          roman="I"
          title="Content Owned"
          collapsed={collapsed.dlc}
          onToggle={() => toggleCollapsed("dlc")}
          extra={
            <>
              <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); setDlcs(new Set(window.DLCS.map(d => d.id))); }}>Select All</button>
              <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); setDlcs(new Set()); }}>Deselect All</button>
            </>
          }
        />
        <div className="panel">
          <div className="dlc-grid">
            {window.DLCS.map(d => (
              <DlcCard key={d.id} dlc={d} on={dlcs.has(d.id)} onToggle={() => toggleDlc(d.id)} />
            ))}
          </div>
          <div className="note">Toggling off a pack removes its civilizations, leaders, and game modes from the random pool.</div>
        </div>
      </div>

      {/* ─── Players ─── */}
      <div className={"section " + (collapsed.players ? "collapsed locked" : "")}>
        <SectionHead
          roman="II"
          title="Players & Leaders"
          collapsed={collapsed.players}
          onToggle={() => toggleCollapsed("players")}
          locked={true}
        />
        <div className="panel">
          <div className="players-head">
            <div className="counter">
              <div className="counter-label">
                Human Players
                <span className="sublbl">Always your choice — never randomized.</span>
              </div>
              <div className="counter-ctrl">
                <button className="counter-btn" disabled={humanCount <= 1} onClick={() => setHumanCount(n => Math.max(1, n - 1))}>−</button>
                <div className="counter-num">{humanCount}</div>
                <button className="counter-btn" disabled={humanCount + aiCount >= 12} onClick={() => setHumanCount(n => Math.min(12 - aiCount, n + 1))}>+</button>
              </div>
            </div>
            <div className="counter">
              <div className="counter-label">
                AI Opponents
                <span className="sublbl">Lock the count, or let the dice decide.</span>
              </div>
              <div className="counter-ctrl">
                <button className="counter-btn" disabled={aiCount <= 1} onClick={() => setAiCount(n => Math.max(1, n - 1))}>−</button>
                <div className="counter-num">{aiCount}</div>
                <button className="counter-btn" disabled={humanCount + aiCount >= 12} onClick={() => setAiCount(n => Math.min(12 - humanCount, n + 1))}>+</button>
                <button
                  className={"btn-icon " + (aiCountLocked ? "locked" : "")}
                  title={aiCountLocked ? "AI count is locked" : "AI count will randomize"}
                  onClick={() => setAiCountLocked(v => !v)}
                  style={{marginLeft: 6}}
                >
                  {aiCountLocked ? <LockClosedIcon/> : <LockOpenIcon/>}
                </button>
              </div>
            </div>
          </div>

          <div className="player-list">
            {slots.map((s, i) => (
              <PlayerRow
                key={i}
                idx={i + 1}
                kind={s.kind}
                leaderId={s.leaderId}
                locked={s.locked}
                leaderPool={leaderPool}
                onChange={v => updateSlot(i, { leaderId: v || null })}
                onLockToggle={() => updateSlot(i, { locked: !s.locked })}
                onReroll={() => rerollSlot(i)}
                animKey={`${i}-${rollNonce}-${s.leaderId}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Rules & World ─── */}
      <div className={"section " + (collapsed.rules ? "collapsed locked" : "")}>
        <SectionHead
          roman="III"
          title="Rules of the World"
          collapsed={collapsed.rules}
          onToggle={() => toggleCollapsed("rules")}
          locked={true}
        />
        <div className="cols-2">
          <div className="panel">
            <div style={{fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10}}>Match Settings</div>
            {settingsKeys.map(([label, key]) => (
              <LockableField
                key={key}
                label={label}
                options={window.OPTIONS[key]}
                value={settings[key].value}
                locked={settings[key].locked}
                onChange={v => setField(key, { value: v })}
                onLockToggle={() => setField(key, { locked: !settings[key].locked })}
                onReroll={() => rerollField(key)}
              />
            ))}
          </div>
          <div className="panel">
            <div style={{fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10}}>World Climate</div>
            {worldKeys.map(([label, key]) => (
              <LockableField
                key={key}
                label={label}
                options={window.OPTIONS[key]}
                value={settings[key].value}
                locked={settings[key].locked}
                onChange={v => setField(key, { value: v })}
                onLockToggle={() => setField(key, { locked: !settings[key].locked })}
                onReroll={() => rerollField(key)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Game Modes ─── */}
      <div className={"section " + (collapsed.modes ? "collapsed locked" : "")}>
        <SectionHead
          roman="IV"
          title="Game Modes"
          collapsed={collapsed.modes}
          onToggle={() => toggleCollapsed("modes")}
          locked={true}
        />
        <div className="panel">
          <div className="modes-grid">
            {window.GAME_MODES.map(m => {
              const available = modeAvailable(m);
              const dlc = window.DLCS.find(d => d.id === m.dlc);
              return (
                <div
                  key={m.id}
                  className={"mode-card " + (modes[m.id].on && available ? "on " : "") + (!available ? "disabled" : "")}
                >
                  <div>
                    <div className="mode-name">{m.name}</div>
                    <span className="req">{available ? `Requires ${dlc?.short || "base"}` : `Locked — enable ${dlc?.name}`}</span>
                  </div>
                  <button
                    className="mode-toggle"
                    disabled={!available}
                    onClick={() => available && toggleMode(m.id)}
                    title="Toggle mode"
                  />
                  <button
                    className={"btn-icon " + (modes[m.id].locked ? "locked" : "")}
                    onClick={() => toggleModeLock(m.id)}
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

      {/* ─── Victory ─── */}
      <div className={"section " + (collapsed.victory ? "collapsed locked" : "")}>
        <SectionHead
          roman="V"
          title="Paths to Victory"
          collapsed={collapsed.victory}
          onToggle={() => toggleCollapsed("victory")}
          locked={true}
        />
        <div className="panel">
          <div className="modes-grid">
            {window.VICTORY_TYPES.map(v => {
              const available = !v.dlc || dlcs.has(v.dlc);
              const dlc = v.dlc && window.DLCS.find(d => d.id === v.dlc);
              return (
                <div
                  key={v.id}
                  className={"mode-card " + (victories[v.id].on && available ? "on " : "") + (!available ? "disabled" : "")}
                >
                  <div>
                    <div className="mode-name">{v.name} Victory</div>
                    <span className="req">{available ? (dlc ? `Requires ${dlc.short}` : "Base game") : `Requires ${dlc?.name}`}</span>
                  </div>
                  <button
                    className="mode-toggle"
                    disabled={!available}
                    onClick={() => available && toggleVictory(v.id)}
                  />
                  <button
                    className={"btn-icon " + (victories[v.id].locked ? "locked" : "")}
                    onClick={() => toggleVictoryLock(v.id)}
                  >
                    {victories[v.id].locked ? <LockClosedIcon/> : <LockOpenIcon/>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Summary ─── */}
      <div className={"section " + (collapsed.summary ? "collapsed" : "")}>
        <SectionHead
          roman="VI"
          title="Your Decree"
          collapsed={collapsed.summary}
          onToggle={() => toggleCollapsed("summary")}
        />
        <div className="summary" key={`sum-${rollNonce}`}>
          <h3>✦  By the dice, thus it shall be  ✦</h3>
          <div className="summary-grid">
            {summary.map(([k, v]) => (
              <div className="summary-item" key={k}>
                <div className="k">{k}</div>
                <div className="v">{v}</div>
              </div>
            ))}
          </div>
          <div className="compass"><span className="line"></span><span className="star">⚜</span><span className="line"></span></div>
          <div className="summary-grid">
            {slots.map((s, i) => {
              const l = leaderPool.find(x => x.id === s.leaderId);
              return (
                <div className="summary-item" key={i}>
                  <div className="k">{s.kind} · Player {toRoman(i + 1)}</div>
                  <div className="v">{l ? `${l.leader} — ${l.civ}` : "—"}</div>
                </div>
              );
            })}
          </div>
          <div className="compass"><span className="line"></span><span className="star">⚜</span><span className="line"></span></div>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="k">Game Modes</div>
              <div className="v">
                {Object.entries(modes).filter(([id, m]) => m.on && modeAvailable(window.GAME_MODES.find(g => g.id === id))).map(([id]) => window.GAME_MODES.find(g => g.id === id).name).join(" · ") || <em style={{color: "var(--parchment-dim)"}}>None</em>}
              </div>
            </div>
            <div className="summary-item">
              <div className="k">Victories Enabled</div>
              <div className="v">
                {Object.entries(victories).filter(([id, v]) => v.on).map(([id]) => window.VICTORY_TYPES.find(g => g.id === id).name).join(" · ") || <em style={{color: "var(--parchment-dim)"}}>None</em>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="foot">
        Made for tabletop-style chaos. Lock what matters, leave the rest to fate.
        <div className="credit">— An unofficial fan tool · not affiliated with any publisher —</div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);

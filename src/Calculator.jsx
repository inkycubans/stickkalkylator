import { useState, useEffect, useRef } from "react";

const PERCENT = { hals:0.40, overarm:0.33, underarm:0.08, handled:0.20, skuldra:0.23 };

const EASE_OPTIONS = [
  { label:"Tajt",   value:0,  desc:"±0 cm" },
  { label:"Bekväm", value:10, desc:"+10 cm" },
  { label:"Lös",    value:16, desc:"+16 cm" },
];

const PRESET_SIZES = [
  { label:"XS", byst:82 },  { label:"S",  byst:88 },
  { label:"M",  byst:96 },  { label:"L",  byst:104 },
  { label:"XL", byst:114 }, { label:"2X", byst:125 },
  { label:"3X", byst:135 }, { label:"4X", byst:145 },
  { label:"5X", byst:150 },
];

const C = {
  hals:"#7aab8a", byst:"#c4956a", overarm:"#7a8fbb",
  underarm:"#b87aab", handled:"#a07850", skuldra:"#6a9ab0",
  lFram:"#c4826a", lBak:"#8a7ab0", lArm:"#7ab08a",
};

const P = {
  bg:"#f7f3ee", card:"#fff", border:"#e8ddd0",
  accent:"#9c6b3c", muted:"#a89880", text:"#2c1f14", light:"#f0e8dc",
};

function calcResults(bystKropp, ease, maskorPer10, varvPer10) {
  const byst = bystKropp + ease;
  const mpCm = maskorPer10 / 10, vpCm = varvPer10 / 10;
  const cms = {
    hals:     Math.round(byst * PERCENT.hals     * 10) / 10,
    byst,
    overarm:  Math.round(byst * PERCENT.overarm  * 10) / 10,
    underarm: Math.round(byst * PERCENT.underarm * 10) / 10,
    handled:  Math.round(byst * PERCENT.handled  * 10) / 10,
    skuldra:  Math.round(byst * PERCENT.skuldra  * 10) / 10,
  };
  const pcts = { hals:"40%", byst:"100%", overarm:"33%", underarm:"8%", handled:"20%", skuldra:"23%" };
  const r = {};
  Object.keys(cms).forEach(k => {
    r[k] = { cm:cms[k], pct:pcts[k], maskor:Math.round(cms[k]*mpCm), varv:Math.round(cms[k]*vpCm) };
  });
  return r;
}

// ── Flash hook ────────────────────────────────────────────────
function useFlash(value) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 500);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);
  return flash;
}

// ── Result card ───────────────────────────────────────────────
function ResultCard({ label, color, cm, pct, maskor, varv }) {
  const flash = useFlash(maskor);
  return (
    <div style={{
      background: flash ? "#fffbf0" : P.card,
      borderRadius:10, padding:"12px 16px", marginBottom:8,
      border:`1px solid ${flash ? color : P.border}`,
      borderLeft:`4px solid ${color}`,
      boxShadow: flash ? `0 0 0 3px ${color}22` : "0 1px 6px rgba(44,31,20,0.06)",
      transition:"all 0.35s ease",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:13, fontWeight:"bold", color:P.text }}>{label}</span>
        <span style={{ display:"flex", alignItems:"baseline", gap:5 }}>
          <span style={{ fontSize:20, fontWeight:"bold", color }}>{cm}</span>
          <span style={{ fontSize:12, color:P.muted }}>cm</span>
          <span style={{ fontSize:10, color:"#c8bdb0", marginLeft:2 }}>{pct}</span>
        </span>
      </div>
      <div style={{ marginTop:6, display:"flex", gap:16, fontSize:12, color:P.muted }}>
        <span>⬡ <strong style={{ color:P.text, fontSize:14, display:"inline-block", transform:flash?"scale(1.2)":"scale(1)", transition:"transform 0.2s" }}>{maskor}</strong> maskor</span>
        <span>≡ <strong style={{ color:P.text, fontSize:14 }}>{varv}</strong> varv</span>
      </div>
    </div>
  );
}

// ── Stitch card with animation ────────────────────────────────
function StitchCard({ label, color, suggestedMaskor }) {
  const flash = useFlash(suggestedMaskor);
  const [val, setVal] = useState("");
  const active = val !== "" ? Number(val) : suggestedMaskor;
  const diff   = val !== "" ? Number(val) - suggestedMaskor : 0;

  return (
    <div style={{
      background: flash ? "#fffbf0" : P.card,
      borderRadius:10, padding:"12px 14px", marginBottom:8,
      border:`1px solid ${flash ? color : P.border}`,
      borderLeft:`4px solid ${color}`,
      boxShadow: flash ? `0 0 0 3px ${color}22` : "0 1px 4px rgba(44,31,20,0.05)",
      transition:"all 0.35s ease",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
        <span style={{ fontSize:12, fontWeight:"bold", color:P.text }}>{label}</span>
        <span style={{ fontSize:16, fontWeight:"bold", color, transition:"all 0.2s" }}>
          {active} maskor
        </span>
      </div>
      <div style={{ fontSize:11, color:P.muted, marginBottom:8 }}>
        EPS-förslag: <span style={{ color, fontWeight:"bold" }}>{suggestedMaskor} maskor</span> — justera upp eller ner beroende på mönster och konstruktion
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <input type="number" value={val} placeholder={String(suggestedMaskor)}
          onChange={e => setVal(e.target.value)}
          style={{ width:80, padding:"5px 8px", border:`1.5px solid ${P.border}`, borderRadius:7, fontSize:14, fontFamily:"Georgia,serif", background:"#faf7f2", color, outline:"none" }} />
        <span style={{ fontSize:12, color:P.muted }}>Maskor</span>
        {diff !== 0 && (
          <span style={{ fontSize:11, color: diff > 0 ? "#7aab8a" : "#c4826a", fontStyle:"italic" }}>
            {diff > 0 ? "+" : ""}{diff}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Length card ───────────────────────────────────────────────
function LengthCard({ label, color, suggestedCm, varvPerCm }) {
  const flash = useFlash(suggestedCm);
  const [customCm,   setCustomCm]   = useState("");
  const [customVarv, setCustomVarv] = useState("");

  const prevSuggested = useRef(suggestedCm);
  useEffect(() => {
    if (prevSuggested.current !== suggestedCm) {
      setCustomCm("");
      setCustomVarv("");
      prevSuggested.current = suggestedCm;
    }
  }, [suggestedCm]);

  const activeCm   = customCm   !== "" ? Number(customCm)   : suggestedCm;
  const activeVarv = customVarv !== "" ? Number(customVarv)
    : (suggestedCm && varvPerCm ? Math.round(suggestedCm * varvPerCm) : 0);

  function handleCm(v) {
    setCustomCm(v);
    setCustomVarv(v && varvPerCm ? String(Math.round(Number(v) * varvPerCm)) : "");
  }
  function handleVarv(v) {
    setCustomVarv(v);
    setCustomCm(v && varvPerCm ? (Number(v) / varvPerCm).toFixed(1) : "");
  }

  return (
    <div style={{
      background: flash ? "#fffbf0" : P.card,
      borderRadius:10, padding:"12px 14px", marginBottom:8,
      border:`1px solid ${flash ? color : P.border}`,
      borderLeft:`4px solid ${color}`,
      boxShadow: flash ? `0 0 0 3px ${color}22` : "0 1px 4px rgba(44,31,20,0.05)",
      transition:"all 0.35s ease",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
        <span style={{ fontSize:12, fontWeight:"bold", color:P.text }}>{label}</span>
        <span style={{ fontSize:15, fontWeight:"bold", color }}>
          {activeCm} cm <span style={{ fontSize:11, color:P.muted }}>≡ {activeVarv} varv</span>
        </span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
        <input type="number" value={customCm} placeholder={String(suggestedCm)}
          onChange={e => handleCm(e.target.value)}
          style={{ width:68, padding:"5px 7px", border:`1.5px solid ${P.border}`, borderRadius:7, fontSize:13, fontFamily:"Georgia,serif", background:"#faf7f2", color, outline:"none" }} />
        <span style={{ fontSize:12, color:P.muted }}>cm</span>
        <span style={{ fontSize:11, color:P.border }}>↔</span>
        <input type="number" value={customVarv}
          placeholder={String(suggestedCm && varvPerCm ? Math.round(suggestedCm*varvPerCm) : "—")}
          onChange={e => handleVarv(e.target.value)}
          style={{ width:68, padding:"5px 7px", border:`1.5px solid ${P.border}`, borderRadius:7, fontSize:13, fontFamily:"Georgia,serif", background:"#faf7f2", color, outline:"none" }} />
        <span style={{ fontSize:12, color:P.muted }}>varv</span>
      </div>
    </div>
  );
}

// ── Validation panel ──────────────────────────────────────────
function ValidationPanel({ results }) {
  if (!results) return null;

  const checks = [
    {
      label: "Halsen passar över huvudet",
      ok:    results.hals.cm >= 50,
      tip:   `Hals ${results.hals.cm} cm — minimum ~50 cm för att kunna ta på tröjan`,
    },
    {
      label: "Ok-maskor jämnt delbara med 4 (raglan)",
      ok:    results.skuldra.maskor % 4 === 0,
      tip:   `${results.skuldra.maskor} maskor — ${results.skuldra.maskor % 4 === 0 ? "✓ delbart med 4" : `justera till ${results.skuldra.maskor - (results.skuldra.maskor % 4)} eller ${results.skuldra.maskor + (4 - results.skuldra.maskor % 4)}`}`,
    },
    {
      label: "Ärmens maskor rimliga",
      ok:    results.overarm.maskor >= 40 && results.overarm.maskor <= 200,
      tip:   `Överarm ${results.overarm.maskor} maskor`,
    },
    {
      label: "Handled jämnt delbar med 2 (mudd)",
      ok:    results.handled.maskor % 2 === 0,
      tip:   `${results.handled.maskor} maskor — ${results.handled.maskor % 2 === 0 ? "✓ jämnt" : "justera +1 eller -1"}`,
    },
  ];

  const allOk = checks.every(c => c.ok);

  return (
    <div style={{ background:P.card, borderRadius:12, padding:"14px 16px", marginBottom:8, boxShadow:"0 2px 8px rgba(44,31,20,0.06)", border:`1px solid ${allOk ? "#7aab8a" : "#e8b88a"}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${P.border}` }}>
        <span style={{ fontSize:16 }}>{allOk ? "✅" : "⚠️"}</span>
        <span style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:allOk ? "#7aab8a" : "#c4826a", fontWeight:"bold" }}>
          {allOk ? "Allt ser bra ut!" : "Kontrollera dessa punkter"}
        </span>
      </div>
      {checks.map((c, i) => (
        <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:6 }}>
          <span style={{ fontSize:13, flexShrink:0, marginTop:1 }}>{c.ok ? "✓" : "⚠"}</span>
          <div>
            <div style={{ fontSize:12, color: c.ok ? P.text : "#c4826a", fontWeight: c.ok ? "normal" : "bold" }}>{c.label}</div>
            <div style={{ fontSize:11, color:P.muted }}>{c.tip}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── SVG Sweater schematic — static shape, dynamic labels ─────
function SweaterSchematic({ results, lengdFram, lengdArm }) {
  if (!results) return null;

  return (
    <div style={{ background:P.card, borderRadius:12, padding:"12px 16px", marginBottom:8, boxShadow:"0 2px 8px rgba(44,31,20,0.06)", border:`1px solid ${P.border}` }}>
      <div style={{ fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:P.muted, marginBottom:10, paddingBottom:6, borderBottom:`1px solid ${P.border}` }}>
        Schematisk bild
      </div>
      <svg viewBox="0 0 340 220" style={{ width:"100%", height:"auto", display:"block" }}>

        {/* ── Static sweater shape ── */}

        {/* Left sleeve */}
        <path d="M 95,72 C 72,62 44,66 34,82 L 28,140 C 36,144 52,146 58,142 L 66,100 C 78,98 92,92 95,88 Z"
          fill="#f0e8dc" stroke="#7a5a3a" strokeWidth="1.4"/>
        {/* Left mudd ribbing */}
        <rect x="26" y="136" width="34" height="10" fill="#e8ddd0" stroke="#7a5a3a" strokeWidth="1"/>
        {[2,5,8].map(o=><line key={o} x1="26" y1={136+o} x2="60" y2={136+o} stroke="#7a5a3a" strokeWidth="0.5" strokeDasharray="2,2"/>)}

        {/* Right sleeve */}
        <path d="M 245,72 C 268,62 296,66 306,82 L 312,140 C 304,144 288,146 282,142 L 274,100 C 262,98 248,92 245,88 Z"
          fill="#f0e8dc" stroke="#7a5a3a" strokeWidth="1.4"/>
        {/* Right mudd ribbing */}
        <rect x="280" y="136" width="34" height="10" fill="#e8ddd0" stroke="#7a5a3a" strokeWidth="1"/>
        {[2,5,8].map(o=><line key={o} x1="280" y1={136+o} x2="314" y2={136+o} stroke="#7a5a3a" strokeWidth="0.5" strokeDasharray="2,2"/>)}

        {/* Body */}
        <path d="M 95,88 C 95,72 118,54 148,50 Q 170,46 192,50 C 222,54 245,72 245,88 L 245,170 L 95,170 Z"
          fill="#fdf8f3" stroke="#7a5a3a" strokeWidth="1.5"/>
        {/* Body bottom ribbing */}
        <rect x="95" y="162" width="150" height="10" fill="#f0e8dc" stroke="#7a5a3a" strokeWidth="1"/>
        {[2,5,8].map(o=><line key={o} x1="95" y1={162+o} x2="245" y2={162+o} stroke="#7a5a3a" strokeWidth="0.5" strokeDasharray="3,2"/>)}
        {/* Neck */}
        <path d="M 148,50 Q 170,62 192,50 Q 178,70 170,72 Q 162,70 148,50 Z"
          fill="#f0e8dc" stroke="#7a5a3a" strokeWidth="1"/>

        {/* ── Dynamic value labels ── */}

        {/* HALS — top center */}
        <line x1="148" y1="38" x2="192" y2="38" stroke={C.hals} strokeWidth="1"/>
        <line x1="148" y1="33" x2="148" y2="43" stroke={C.hals} strokeWidth="1.3"/>
        <line x1="192" y1="33" x2="192" y2="43" stroke={C.hals} strokeWidth="1.3"/>
        <text x="170" y="30" textAnchor="middle" fontSize="9" fontFamily="Georgia,serif" fill={C.hals} fontWeight="bold">
          {results.hals.cm} cm · {results.hals.maskor} maskor
        </text>

        {/* BYST — below body */}
        <line x1="95" y1="182" x2="245" y2="182" stroke={C.byst} strokeWidth="1"/>
        <line x1="95" y1="177" x2="95" y2="187" stroke={C.byst} strokeWidth="1.3"/>
        <line x1="245" y1="177" x2="245" y2="187" stroke={C.byst} strokeWidth="1.3"/>
        <text x="170" y="196" textAnchor="middle" fontSize="9" fontFamily="Georgia,serif" fill={C.byst} fontWeight="bold">
          {results.byst.cm} cm · {results.byst.maskor} maskor
        </text>

        {/* ÖVERARM — left sleeve top */}
        <line x1="66" y1="88" x2="95" y2="88" stroke={C.overarm} strokeWidth="1"/>
        <line x1="66" y1="83" x2="66" y2="93" stroke={C.overarm} strokeWidth="1.3"/>
        <line x1="95" y1="83" x2="95" y2="93" stroke={C.overarm} strokeWidth="1.3"/>
        <text x="80" y="80" textAnchor="middle" fontSize="8" fontFamily="Georgia,serif" fill={C.overarm} fontWeight="bold">
          {results.overarm.cm} cm
        </text>
        <text x="80" y="70" textAnchor="middle" fontSize="7.5" fontFamily="Georgia,serif" fill={C.overarm} opacity="0.8">
          {results.overarm.maskor} maskor
        </text>

        {/* HANDLED — left mudd */}
        <line x1="26" y1="152" x2="60" y2="152" stroke={C.handled} strokeWidth="1"/>
        <line x1="26" y1="147" x2="26" y2="157" stroke={C.handled} strokeWidth="1.3"/>
        <line x1="60" y1="147" x2="60" y2="157" stroke={C.handled} strokeWidth="1.3"/>
        <text x="43" y="166" textAnchor="middle" fontSize="8" fontFamily="Georgia,serif" fill={C.handled} fontWeight="bold">
          {results.handled.cm} cm
        </text>
        <text x="43" y="176" textAnchor="middle" fontSize="7.5" fontFamily="Georgia,serif" fill={C.handled} opacity="0.8">
          {results.handled.maskor} maskor
        </text>

        {/* LÄNGD — right side of body */}
        <line x1="254" y1="88" x2="254" y2="162" stroke={C.lFram} strokeWidth="1"/>
        <line x1="249" y1="88" x2="259" y2="88" stroke={C.lFram} strokeWidth="1.3"/>
        <line x1="249" y1="162" x2="259" y2="162" stroke={C.lFram} strokeWidth="1.3"/>
        <text x="268" y="128" textAnchor="middle" fontSize="8" fontFamily="Georgia,serif" fill={C.lFram} fontWeight="bold"
          transform="rotate(-90,268,128)">{lengdFram} cm</text>

        {/* UNDERÄRM — small right shoulder */}
        <line x1="258" y1="72" x2="258" y2="88" stroke={C.underarm} strokeWidth="1"/>
        <line x1="253" y1="72" x2="263" y2="72" stroke={C.underarm} strokeWidth="1.3"/>
        <line x1="253" y1="88" x2="263" y2="88" stroke={C.underarm} strokeWidth="1.3"/>
        <text x="280" y="82" textAnchor="middle" fontSize="7.5" fontFamily="Georgia,serif" fill={C.underarm}>
          {results.underarm.cm} cm
        </text>

      </svg>
    </div>
  );
}

function SliderWithInput({ label, val, set, min, max, color }) {
  return (
    <label style={{ flex:1, minWidth:120 }}>
      {label && <div style={{ fontSize:12, color:P.muted, marginBottom:6 }}>{label}</div>}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <input type="range" min={min} max={max} value={val}
          onChange={e => set(Number(e.target.value))}
          style={{ flex:1, accentColor:color||P.accent }} />
        <input type="number" value={val}
          onChange={e => { const n=Number(e.target.value); if(n>=min&&n<=max) set(n); }}
          style={{ width:54, padding:"4px 6px", border:`1.5px solid ${P.border}`, borderRadius:7, fontSize:16, fontFamily:"Georgia,serif", fontWeight:"bold", color:color||P.text, textAlign:"center", background:"#faf7f2", outline:"none" }} />
      </div>
    </label>
  );
}

function SectionLabel({ nr, text }) {
  return (
    <div style={{ fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:P.muted, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ width:20, height:20, borderRadius:"50%", background:`linear-gradient(135deg,${P.accent},#c4956a)`, color:"#fff", fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", flexShrink:0 }}>{nr}</span>
      {text}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function Calculator({ onResultsChange }) {
  const [maskor,    setMaskor]    = useState(19);
  const [varv,      setVarv]      = useState(28);
  const [bystKropp, setBystKropp] = useState(96);
  const [ease,      setEase]      = useState(10);
  const [results,   setResults]   = useState(null);

  useEffect(() => {
    const r = calcResults(bystKropp, ease, maskor, varv);
    setResults(r);
    onResultsChange && onResultsChange(r, bystKropp+ease);
  }, [bystKropp, ease, maskor, varv]);

  const vpCm      = varv / 10;
  const plaggByst = bystKropp + ease;
  const lengdFram = results ? Math.round(results.byst.cm * 0.40) : 0;
  const lengdArm  = results ? Math.round(results.byst.cm * 0.45) : 0;

  return (
    <div style={{ height:"100%", overflowY:"auto", background:P.bg }}>

      <div style={{ padding:"20px 22px 14px", borderBottom:`1px solid ${P.border}`, background:"linear-gradient(180deg,#fdf8f3,#f7f0e8)" }}>
        <div style={{ fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase", color:P.muted, marginBottom:4 }}>Universell · EPS-baserad</div>
        <div style={{ fontSize:24, fontWeight:"normal", color:P.text, letterSpacing:"-0.02em" }}>Stickkalkylator</div>
        <div style={{ width:36, height:2, background:`linear-gradient(90deg,${P.accent},#c4956a)`, marginTop:10, marginBottom:14, borderRadius:2 }} />
        <div style={{ fontSize:12, color:P.muted, lineHeight:1.7, padding:"12px 14px", background:"#f5ede0", borderRadius:8, border:`1px solid ${P.border}`, fontStyle:"italic" }}>
          Alla värden är beräknade enligt EPS och ska betraktas som riktmärken. Garnets tjocklek, kvalitet och din personliga masktäthet påverkar slutresultatet. Sticka alltid en provlapp på 10×10 cm innan du börjar.
        </div>
      </div>

      <div style={{ padding:"16px 18px" }}>

        {/* Input card */}
        <div style={{ background:P.card, borderRadius:12, padding:"18px", marginBottom:16, boxShadow:"0 2px 12px rgba(44,31,20,0.07)", border:`1px solid ${P.border}` }}>
          <SectionLabel nr="1" text="Masktäthet — per 10 cm" />
          <div style={{ display:"flex", gap:20, flexWrap:"wrap", marginBottom:10 }}>
            <SliderWithInput label="Maskor" val={maskor} set={setMaskor} min={5} max={40} />
            <SliderWithInput label="Varv"   val={varv}   set={setVarv}   min={5} max={60} />
          </div>
          <div style={{ padding:"7px 12px", background:P.light, borderRadius:8, fontSize:11, color:P.muted, display:"flex", gap:22, marginBottom:18 }}>
            <span>↔ {(maskor/10).toFixed(2)} maskor/cm</span>
            <span>↕ {(varv/10).toFixed(2)} varv/cm</span>
          </div>

          <div style={{ borderTop:`1px solid ${P.border}`, marginBottom:18 }} />
          <SectionLabel nr="2" text="Kroppsmått (byst)" />
          <div style={{ display:"flex", gap:5, marginBottom:12, flexWrap:"wrap" }}>
            {PRESET_SIZES.map(s => (
              <button key={s.label} onClick={() => setBystKropp(s.byst)} style={{
                padding:"4px 10px", borderRadius:16, border:"1.5px solid",
                borderColor: bystKropp===s.byst ? P.accent : P.border,
                background: bystKropp===s.byst ? `linear-gradient(135deg,${P.accent},#c4956a)` : "transparent",
                color: bystKropp===s.byst ? "#fff" : P.muted,
                fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif", transition:"all 0.2s",
                fontWeight: bystKropp===s.byst ? "bold" : "normal",
              }}>{s.label} {s.byst}</button>
            ))}
          </div>
          <SliderWithInput val={bystKropp} set={setBystKropp} min={60} max={160} color={C.byst} />

          <div style={{ borderTop:`1px solid ${P.border}`, margin:"18px 0" }} />
          <SectionLabel nr="3" text="Passform (ease / sittmån)" />
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
            {EASE_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setEase(opt.value)} style={{
                padding:"7px 16px", borderRadius:9, border:"1.5px solid",
                borderColor: ease===opt.value ? "#7a8fbb" : P.border,
                background: ease===opt.value ? "linear-gradient(135deg,#6a7fab,#8fa3cc)" : "transparent",
                color: ease===opt.value ? "#fff" : P.muted,
                fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif",
                transition:"all 0.2s", textAlign:"center", lineHeight:1.5,
                fontWeight: ease===opt.value ? "bold" : "normal",
              }}>
                <div>{opt.label}</div>
                <div style={{ fontSize:10, opacity:0.85 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
          <div style={{ padding:"8px 12px", background:P.light, borderRadius:8, fontSize:12, color:P.muted, display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
            <span>Kropp: <strong style={{ color:P.text }}>{bystKropp} cm</strong></span>
            <span style={{ color:"#c4a882" }}>+</span>
            <span>Ease: <strong style={{ color:P.text }}>{ease} cm</strong></span>
            <span style={{ color:"#c4a882" }}>=</span>
            <span style={{ fontWeight:"bold", color:C.byst, fontSize:14 }}>{plaggByst} cm plaggmått</span>
          </div>
        </div>

        {results && <>
          {/* Validation */}
          <ValidationPanel results={results} />

          {/* Result cards */}
          {[
            { key:"hals",     label:"Hals",          color:C.hals },
            { key:"byst",     label:"Byst (plagg)",   color:C.byst },
            { key:"overarm",  label:"Överarm",        color:C.overarm },
            { key:"underarm", label:"Underärm",       color:C.underarm },
            { key:"handled",  label:"Handled / Mudd", color:C.handled },
          ].map(({ key, label, color }) => (
            <ResultCard key={key} label={label} color={color}
              cm={results[key].cm} pct={results[key].pct}
              maskor={results[key].maskor} varv={results[key].varv} />
          ))}

          {/* Okdetaljer */}
          <div style={{ background:P.card, borderRadius:12, padding:"14px 16px", marginTop:6, marginBottom:8, boxShadow:"0 2px 8px rgba(44,31,20,0.06)", border:`1px solid ${P.border}` }}>
            <div style={{ fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:P.muted, marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${P.border}` }}>Okdetaljer</div>
            <StitchCard label="5. Slutmål för ok — maskor runt hela kroppen innan delning för ärmar" color={C.skuldra} suggestedMaskor={results.skuldra.maskor} />
            <StitchCard label="6. Fördelning av maskor — ärm och byst innan upplägning under ärm"  color={C.overarm} suggestedMaskor={results.overarm.maskor} />
          </div>

          {/* Längder */}
          <div style={{ background:P.card, borderRadius:12, padding:"14px 16px", marginBottom:16, boxShadow:"0 2px 8px rgba(44,31,20,0.06)", border:`1px solid ${P.border}` }}>
            <div style={{ fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:P.muted, marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${P.border}` }}>Längder</div>
            <LengthCard label="7. Längd fram" color={C.lFram} suggestedCm={lengdFram} varvPerCm={vpCm} />
            <LengthCard label="8. Längd bak"  color={C.lBak}  suggestedCm={lengdFram} varvPerCm={vpCm} />
            <LengthCard label="9. Längd ärm"  color={C.lArm}  suggestedCm={lengdArm}  varvPerCm={vpCm} />
          </div>
        </>}

        <div style={{ textAlign:"center", fontSize:10, color:"#c0b0a0", paddingBottom:20, letterSpacing:"0.08em" }}>
          Elizabeth Zimmermann's Percentage System · EPS
        </div>
      </div>
    </div>
  );
}

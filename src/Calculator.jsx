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
    hals:Math.round(byst*PERCENT.hals*10)/10, byst,
    overarm:Math.round(byst*PERCENT.overarm*10)/10,
    underarm:Math.round(byst*PERCENT.underarm*10)/10,
    handled:Math.round(byst*PERCENT.handled*10)/10,
    skuldra:Math.round(byst*PERCENT.skuldra*10)/10,
  };
  const pcts = { hals:"40%",byst:"100%",overarm:"33%",underarm:"8%",handled:"20%",skuldra:"23%" };
  const r = {};
  Object.keys(cms).forEach(k => {
    r[k] = { cm:cms[k], pct:pcts[k], maskor:Math.round(cms[k]*mpCm), varv:Math.round(cms[k]*vpCm) };
  });
  return r;
}

function ResultCard({ label, color, cm, pct, maskor, varv }) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(maskor);
  useEffect(() => {
    if (prev.current !== maskor) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 500);
      prev.current = maskor;
      return () => clearTimeout(t);
    }
  }, [maskor]);

  return (
    <div style={{
      background: flash ? "#fffbf0" : P.card,
      borderRadius: 10, padding:"12px 16px", marginBottom:8,
      border:`1px solid ${flash ? color : P.border}`,
      borderLeft:`4px solid ${color}`,
      boxShadow: flash ? `0 0 0 3px ${color}22` : "0 1px 6px rgba(44,31,20,0.06)",
      transition:"all 0.35s ease",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:13, fontWeight:"bold", color:P.text }}>{label}</span>
        <span style={{ display:"flex", alignItems:"baseline", gap:6 }}>
          <span style={{ fontSize:20, fontWeight:"bold", color, transition:"color 0.2s" }}>{cm}</span>
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

function StitchCard({ label, color, suggestedMaskor }) {
  const [val, setVal] = useState("");
  return (
    <div style={{ background:P.card, borderRadius:10, padding:"11px 14px", marginBottom:7, border:`1px solid ${P.border}`, borderLeft:`4px solid ${color}`, boxShadow:"0 1px 4px rgba(44,31,20,0.05)" }}>
      <div style={{ fontSize:12, fontWeight:"bold", marginBottom:8, color:P.text }}>{label}</div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <input type="number" value={val} placeholder={suggestedMaskor||"—"}
          onChange={e=>setVal(e.target.value)}
          style={{ width:72, padding:"5px 8px", border:`1.5px solid ${P.border}`, borderRadius:7, fontSize:14, fontFamily:"Georgia,serif", background:"#faf7f2", color }} />
        <span style={{ fontSize:12, color:P.muted }}>Maskor</span>
      </div>
    </div>
  );
}

function LengthCard({ label, color, varvPerCm }) {
  const [cm, setCm] = useState("");
  const varv = cm && varvPerCm ? Math.round(Number(cm)*varvPerCm) : null;
  return (
    <div style={{ background:P.card, borderRadius:10, padding:"11px 14px", marginBottom:7, border:`1px solid ${P.border}`, borderLeft:`4px solid ${color}`, boxShadow:"0 1px 4px rgba(44,31,20,0.05)" }}>
      <div style={{ fontSize:12, fontWeight:"bold", marginBottom:8, color:P.text }}>{label}</div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <input type="number" value={cm} placeholder="cm"
          onChange={e=>setCm(e.target.value)}
          style={{ width:65, padding:"5px 8px", border:`1.5px solid ${P.border}`, borderRadius:7, fontSize:14, fontFamily:"Georgia,serif", background:"#faf7f2", color }} />
        <span style={{ fontSize:12, color:P.muted }}>cm</span>
        {varv!==null && <span style={{ fontSize:12, color:P.muted }}>≡ <strong style={{ color:P.text, fontSize:13 }}>{varv}</strong> varv</span>}
      </div>
    </div>
  );
}

function SliderWithInput({ label, val, set, min, max, color }) {
  return (
    <label style={{ flex:1, minWidth:120 }}>
      {label && <div style={{ fontSize:12, color:P.muted, marginBottom:6, fontFamily:"Georgia,serif" }}>{label}</div>}
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <input type="range" min={min} max={max} value={val}
          onChange={e=>set(Number(e.target.value))}
          style={{ flex:1, accentColor:color||P.accent, height:4 }} />
        <input type="number" value={val}
          onChange={e=>{ const n=Number(e.target.value); if(n>=min&&n<=max) set(n); }}
          style={{ width:54, padding:"4px 6px", border:`1.5px solid ${P.border}`, borderRadius:7, fontSize:16, fontFamily:"Georgia,serif", fontWeight:"bold", color:color||P.text, textAlign:"center", background:"#faf7f2", outline:"none" }} />
      </div>
    </label>
  );
}

function SectionLabel({ nr, text }) {
  return (
    <div style={{ fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:P.muted, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ width:20, height:20, borderRadius:"50%", background:`linear-gradient(135deg,${P.accent},#c4956a)`, color:"#fff", fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", flexShrink:0, boxShadow:"0 1px 4px rgba(156,107,60,0.3)" }}>{nr}</span>
      {text}
    </div>
  );
}

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

  const vpCm = varv/10;
  const plaggByst = bystKropp + ease;

  return (
    <div style={{ height:"100%", overflowY:"auto", background:P.bg }}>

      {/* Header */}
      <div style={{ padding:"20px 22px 14px", borderBottom:`1px solid ${P.border}`, background:"linear-gradient(180deg,#fdf8f3,#f7f0e8)" }}>
        <div style={{ fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase", color:P.muted, marginBottom:4 }}>Universell · EPS-baserad</div>
        <div style={{ fontSize:24, fontWeight:"normal", color:P.text, fontFamily:"Georgia,serif", letterSpacing:"-0.02em" }}>Stickkalkylator</div>
        <div style={{ width:36, height:2, background:`linear-gradient(90deg,${P.accent},#c4956a)`, marginTop:10, borderRadius:2 }} />
      </div>

      <div style={{ padding:"16px 18px" }}>

        {/* Input card */}
        <div style={{ background:P.card, borderRadius:12, padding:"18px 18px", marginBottom:16, boxShadow:"0 2px 12px rgba(44,31,20,0.07)", border:`1px solid ${P.border}` }}>

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
              <button key={s.label} onClick={()=>setBystKropp(s.byst)} style={{
                padding:"4px 10px", borderRadius:16, border:`1.5px solid`,
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
              <button key={opt.value} onClick={()=>setEase(opt.value)} style={{
                padding:"7px 16px", borderRadius:9, border:`1.5px solid`,
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

        {/* Result cards */}
        {results && <>
          {[
            { key:"hals",     label:"Hals",         color:C.hals },
            { key:"byst",     label:"Byst (plagg)",  color:C.byst },
            { key:"overarm",  label:"Överarm",       color:C.overarm },
            { key:"underarm", label:"Underärm",      color:C.underarm },
            { key:"handled",  label:"Handled / Mudd",color:C.handled },
          ].map(({ key, label, color }) => (
            <ResultCard key={key} label={label} color={color}
              cm={results[key].cm} pct={results[key].pct}
              maskor={results[key].maskor} varv={results[key].varv} />
          ))}

          {/* Okdetaljer */}
          <div style={{ background:P.card, borderRadius:12, padding:"14px 16px", marginTop:6, marginBottom:8, boxShadow:"0 2px 8px rgba(44,31,20,0.06)", border:`1px solid ${P.border}` }}>
            <div style={{ fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:P.muted, marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${P.border}` }}>Okdetaljer</div>
            <StitchCard label="5. Skuldermått — ok innan delning" color={C.skuldra} suggestedMaskor={results.skuldra.maskor} />
            <StitchCard label="6. Fördelning maskor ärm / byst"  color={C.overarm} suggestedMaskor={results.overarm.maskor} />
          </div>

          {/* Längder */}
          <div style={{ background:P.card, borderRadius:12, padding:"14px 16px", marginBottom:16, boxShadow:"0 2px 8px rgba(44,31,20,0.06)", border:`1px solid ${P.border}` }}>
            <div style={{ fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:P.muted, marginBottom:10, paddingBottom:8, borderBottom:`1px solid ${P.border}` }}>Längder</div>
            <LengthCard label="7. Längd fram" color={C.lFram} varvPerCm={vpCm} />
            <LengthCard label="8. Längd bak"  color={C.lBak}  varvPerCm={vpCm} />
            <LengthCard label="9. Längd ärm"  color={C.lArm}  varvPerCm={vpCm} />
          </div>
        </>}

        <div style={{ textAlign:"center", fontSize:10, color:"#c0b0a0", paddingBottom:20, letterSpacing:"0.08em" }}>
          Elizabeth Zimmermann's Percentage System · EPS
        </div>
      </div>
    </div>
  );
}

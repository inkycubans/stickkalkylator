import { useState, useEffect, useRef } from "react";

const PERCENT = { hals:0.40, overarm:0.33, underarm:0.08, handled:0.20, skuldra:0.23 };

const EASE_OPTIONS = [
  { label:"Tajt",   value:0,  desc:"±0 cm" },
  { label:"Bekväm", value:10, desc:"+10 cm" },
  { label:"Lös",    value:16, desc:"+16 cm" },
];

const PRESET_SIZES = [
  { label:"XS", byst:82  }, { label:"S",  byst:88  }, { label:"M",  byst:96  },
  { label:"L",  byst:104 }, { label:"XL", byst:114 }, { label:"2X", byst:125 },
  { label:"3X", byst:135 }, { label:"4X", byst:145 }, { label:"5X", byst:150 },
];

const COLORS = {
  hals:"#7aab8a", byst:"#d4956a", overarm:"#7a8fbb",
  underarm:"#b87aab", handled:"#a07850", skuldra:"#6a9ab0",
  langdFram:"#c4826a", langdBak:"#8a7ab0", langdArm:"#7ab08a",
};

function calcResults(bystKropp, ease, maskorPer10, varvPer10) {
  const byst = bystKropp + ease;
  const mpCm = maskorPer10 / 10;
  const vpCm = varvPer10 / 10;
  const cms = {
    hals:     Math.round(byst * PERCENT.hals     * 10) / 10,
    byst,
    overarm:  Math.round(byst * PERCENT.overarm  * 10) / 10,
    underarm: Math.round(byst * PERCENT.underarm * 10) / 10,
    handled:  Math.round(byst * PERCENT.handled  * 10) / 10,
    skuldra:  Math.round(byst * PERCENT.skuldra  * 10) / 10,
  };
  const pcts = { hals:"40%", byst:"100%", overarm:"33%", underarm:"8%", handled:"20%", skuldra:"23%" };
  const result = {};
  Object.keys(cms).forEach(k => {
    result[k] = { cm:cms[k], pct:pcts[k], maskor:Math.round(cms[k]*mpCm), varv:Math.round(cms[k]*vpCm) };
  });
  return result;
}

function ResultCard({ label, color, cm, pct, maskor, varv }) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(maskor);
  useEffect(() => {
    if (prev.current !== maskor) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 450);
      prev.current = maskor;
      return () => clearTimeout(t);
    }
  }, [maskor]);
  return (
    <div style={{ background:flash?"#fffbe6":"#fff", borderRadius:10, padding:"11px 14px", marginBottom:7,
      boxShadow:flash?`0 0 0 2px ${color}`:"0 1px 6px rgba(0,0,0,0.05)",
      border:"1px solid #ede8e0", borderLeft:`4px solid ${color}`, transition:"background 0.3s, box-shadow 0.3s" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
        <span style={{ fontSize:12, fontWeight:"bold" }}>{label}</span>
        <span style={{ fontSize:17, fontWeight:"bold", color }}>{cm} cm <span style={{ fontSize:9, color:"#b0a090" }}>{pct}</span></span>
      </div>
      <div style={{ marginTop:5, display:"flex", gap:12, fontSize:12, color:"#7a6a52" }}>
        <span>⬡ <strong style={{ color:"#2c2416", display:"inline-block", transform:flash?"scale(1.2)":"scale(1)", transition:"transform 0.15s" }}>{maskor}</strong> maskor</span>
        <span>≡ <strong style={{ color:"#2c2416" }}>{varv}</strong> varv</span>
      </div>
    </div>
  );
}

function StitchCard({ label, color, suggestedMaskor }) {
  const [val, setVal] = useState("");
  return (
    <div style={{ background:"#fff", borderRadius:10, padding:"11px 14px", marginBottom:7,
      boxShadow:"0 1px 6px rgba(0,0,0,0.05)", border:"1px solid #ede8e0", borderLeft:`4px solid ${color}` }}>
      <div style={{ fontSize:12, fontWeight:"bold", marginBottom:7, color:"#2c2416" }}>{label}</div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <input type="number" value={val} placeholder={suggestedMaskor||"—"}
          onChange={e => setVal(e.target.value)}
          style={{ width:70, padding:"3px 7px", border:"1.5px solid #ddd6c8", borderRadius:6, fontSize:14, fontFamily:"Georgia,serif", background:"#faf7f2", color }} />
        <span style={{ fontSize:12, color:"#9c8a6e" }}>Maskor</span>
      </div>
    </div>
  );
}

function LengthCard({ label, color, varvPerCm }) {
  const [cm, setCm] = useState("");
  const varv = cm && varvPerCm ? Math.round(Number(cm) * varvPerCm) : null;
  return (
    <div style={{ background:"#fff", borderRadius:10, padding:"11px 14px", marginBottom:7,
      boxShadow:"0 1px 6px rgba(0,0,0,0.05)", border:"1px solid #ede8e0", borderLeft:`4px solid ${color}` }}>
      <div style={{ fontSize:12, fontWeight:"bold", marginBottom:7, color:"#2c2416" }}>{label}</div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <input type="number" value={cm} placeholder="cm"
          onChange={e => setCm(e.target.value)}
          style={{ width:65, padding:"3px 7px", border:"1.5px solid #ddd6c8", borderRadius:6, fontSize:14, fontFamily:"Georgia,serif", background:"#faf7f2", color }} />
        <span style={{ fontSize:12, color:"#9c8a6e" }}>cm</span>
        {varv !== null && <span style={{ fontSize:12, color:"#7a6a52" }}>≡ <strong style={{ color:"#2c2416" }}>{varv}</strong> varv</span>}
      </div>
    </div>
  );
}

function SliderWithInput({ label, val, set, min, max, color }) {
  return (
    <label style={{ flex:1, minWidth:120 }}>
      {label && <div style={{ fontSize:12, color:"#7a6a52", marginBottom:5 }}>{label}</div>}
      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
        <input type="range" min={min} max={max} value={val}
          onChange={e => set(Number(e.target.value))}
          style={{ flex:1, accentColor:color||"#c4a882" }} />
        <input type="number" value={val}
          onChange={e => { const n=Number(e.target.value); if(n>=min&&n<=max) set(n); }}
          style={{ width:52, padding:"2px 5px", border:"1.5px solid #ddd6c8", borderRadius:6, fontSize:16, fontFamily:"Georgia,serif", fontWeight:"bold", color:color||"#2c2416", textAlign:"center", background:"#faf7f2" }} />
      </div>
    </label>
  );
}

function SectionLabel({ nr, text }) {
  return (
    <div style={{ fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"#9c8a6e", marginBottom:12, display:"flex", alignItems:"center", gap:7 }}>
      <span style={{ width:18, height:18, borderRadius:"50%", background:"#c4a882", color:"#fff", fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", flexShrink:0 }}>{nr}</span>
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
    onResultsChange && onResultsChange(r, bystKropp + ease);
  }, [bystKropp, ease, maskor, varv]);

  const vpCm = varv / 10;
  const plaggByst = bystKropp + ease;

  return (
    <div style={{ height:"100%", overflowY:"auto" }}>
      <div style={{ padding:"18px 20px 12px", borderBottom:"1px solid #ede8e0" }}>
        <div style={{ fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase", color:"#9c8a6e", marginBottom:3 }}>Universell · EPS-baserad</div>
        <div style={{ fontSize:20, fontWeight:"normal", color:"#2c2416" }}>Stickkalkylator</div>
        <div style={{ width:28, height:2, background:"#c4a882", marginTop:7 }} />
      </div>

      <div style={{ padding:"14px 18px" }}>
        {/* Input card */}
        <div style={{ background:"#fff", borderRadius:10, padding:"14px 16px", marginBottom:14, boxShadow:"0 1px 8px rgba(0,0,0,0.06)", border:"1px solid #ede8e0" }}>
          <SectionLabel nr="1" text="Masktäthet — per 10 cm" />
          <div style={{ display:"flex", gap:18, flexWrap:"wrap", marginBottom:8 }}>
            <SliderWithInput label="Maskor" val={maskor} set={setMaskor} min={5} max={40} />
            <SliderWithInput label="Varv"   val={varv}   set={setVarv}   min={5} max={60} />
          </div>
          <div style={{ padding:"5px 10px", background:"#faf7f2", borderRadius:6, fontSize:11, color:"#7a6a52", display:"flex", gap:20, marginBottom:14 }}>
            <span>↔ {(maskor/10).toFixed(2)} maskor/cm</span>
            <span>↕ {(varv/10).toFixed(2)} varv/cm</span>
          </div>

          <div style={{ borderTop:"1px solid #ede8e0", marginBottom:14 }} />
          <SectionLabel nr="2" text="Kroppsmått (byst)" />
          <div style={{ display:"flex", gap:4, marginBottom:10, flexWrap:"wrap" }}>
            {PRESET_SIZES.map(s => (
              <button key={s.label} onClick={() => setBystKropp(s.byst)} style={{
                padding:"3px 8px", borderRadius:14, border:"1.5px solid",
                borderColor:bystKropp===s.byst?"#c4a882":"#ddd6c8",
                background:bystKropp===s.byst?"#c4a882":"transparent",
                color:bystKropp===s.byst?"#fff":"#7a6a52",
                fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif", transition:"all 0.15s"
              }}>{s.label} {s.byst}</button>
            ))}
          </div>
          <SliderWithInput val={bystKropp} set={setBystKropp} min={60} max={160} color="#d4956a" />

          <div style={{ borderTop:"1px solid #ede8e0", margin:"14px 0" }} />
          <SectionLabel nr="3" text="Passform (ease)" />
          <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:8 }}>
            {EASE_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setEase(opt.value)} style={{
                padding:"5px 12px", borderRadius:7, border:"1.5px solid",
                borderColor:ease===opt.value?"#7a8fbb":"#ddd6c8",
                background:ease===opt.value?"#7a8fbb":"transparent",
                color:ease===opt.value?"#fff":"#7a6a52",
                fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif",
                transition:"all 0.15s", textAlign:"center", lineHeight:1.4
              }}>
                <div style={{ fontWeight:"bold" }}>{opt.label}</div>
                <div style={{ fontSize:10, opacity:0.85 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
          <div style={{ padding:"5px 10px", background:"#faf7f2", borderRadius:6, fontSize:11, color:"#7a6a52", display:"flex", gap:6, flexWrap:"wrap" }}>
            <span>Kropp: <strong>{bystKropp} cm</strong></span>
            <span style={{ color:"#c4a882" }}>+</span>
            <span>Ease: <strong>{ease} cm</strong></span>
            <span style={{ color:"#c4a882" }}>=</span>
            <span>Plaggmått: <strong style={{ color:"#d4956a" }}>{plaggByst} cm</strong></span>
          </div>
        </div>

        {results && <>
          {[
            { key:"hals",     label:"Hals",        color:COLORS.hals },
            { key:"byst",     label:"Byst (plagg)", color:COLORS.byst },
            { key:"overarm",  label:"Överarm",      color:COLORS.overarm },
            { key:"underarm", label:"Underärm",     color:COLORS.underarm },
            { key:"handled",  label:"Handled/Mudd", color:COLORS.handled },
          ].map(({ key, label, color }) => (
            <ResultCard key={key} label={label} color={color}
              cm={results[key].cm} pct={results[key].pct}
              maskor={results[key].maskor} varv={results[key].varv} />
          ))}

          <div style={{ background:"#fff", borderRadius:10, padding:"12px 14px", marginTop:6, marginBottom:6, boxShadow:"0 1px 6px rgba(0,0,0,0.05)", border:"1px solid #ede8e0" }}>
            <div style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#9c8a6e", marginBottom:8 }}>Okdetaljer</div>
            <StitchCard label="5. Skuldermått — ok innan delning" color={COLORS.skuldra} suggestedMaskor={results.skuldra.maskor} />
            <StitchCard label="6. Fördelning maskor ärm / byst"  color={COLORS.overarm} suggestedMaskor={results.overarm.maskor} />
          </div>

          <div style={{ background:"#fff", borderRadius:10, padding:"12px 14px", marginBottom:6, boxShadow:"0 1px 6px rgba(0,0,0,0.05)", border:"1px solid #ede8e0" }}>
            <div style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#9c8a6e", marginBottom:8 }}>Längder</div>
            <LengthCard label="7. Längd fram" color={COLORS.langdFram} varvPerCm={vpCm} />
            <LengthCard label="8. Längd bak"  color={COLORS.langdBak}  varvPerCm={vpCm} />
            <LengthCard label="9. Längd ärm"  color={COLORS.langdArm}  varvPerCm={vpCm} />
          </div>
        </>}

        <div style={{ textAlign:"center", fontSize:10, color:"#b0a090", paddingBottom:16, letterSpacing:"0.06em" }}>
          EPS · Hals 40% · Överarm 33% · Underärm 8% · Handled 20%
        </div>
      </div>
    </div>
  );
}

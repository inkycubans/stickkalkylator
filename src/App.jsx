import { useState, useEffect, useRef } from "react";

// ── EPS percentages ──────────────────────────────────────────
const PERCENT = { hals: 0.40, overarm: 0.33, underarm: 0.08, handled: 0.20 };

const EASE_OPTIONS = [
  { label: "Tajt",   value: 0,  desc: "±0 cm" },
  { label: "Bekväm", value: 10, desc: "+10 cm" },
  { label: "Lös",    value: 16, desc: "+16 cm" },
];

const PRESET_SIZES = [
  { label: "XS", byst: 82 },
  { label: "S",  byst: 88 },
  { label: "M",  byst: 96 },
  { label: "L",  byst: 104 },
  { label: "XL", byst: 114 },
];

const COLORS = {
  byst: "#d4956a", hals: "#7aab8a", overarm: "#7a8fbb",
  underarm: "#b87aab", handled: "#a07850",
};

// ── Garnvikter med uppskattad meterbehov för en tröja (stl M) ──
// Baserat på branschstandard-uppskattningar
const YARN_WEIGHTS = [
  { id: "lace",     label: "Lace / Spets",   metersPerGram: 5.0, baseMeters: 1400 },
  { id: "fingering",label: "Fingering / Sock",metersPerGram: 3.5, baseMeters: 1200 },
  { id: "dk",       label: "DK / Lätt",       metersPerGram: 2.5, baseMeters: 900  },
  { id: "worsted",  label: "Worsted / Mellan", metersPerGram: 2.0, baseMeters: 700  },
  { id: "aran",     label: "Aran / Grovt",     metersPerGram: 1.6, baseMeters: 550  },
  { id: "bulky",    label: "Bulky / Tjockt",   metersPerGram: 1.2, baseMeters: 400  },
  { id: "superbulky",label:"Super Bulky",      metersPerGram: 0.8, baseMeters: 280  },
];

// ── Simulerade garner från "Garnbutiken" ──────────────────────
// I en riktig app skulle detta hämtas via API från t.ex. Hobbii eller Järbo
const MOCK_YARNS = [
  { id: 1, brand: "Järbo", name: "Garn Studio Drops Lima",     weight: "dk",      metersPerSkein: 100, pricePerSkein: 39,  colors: 48, img: "🟤" },
  { id: 2, brand: "Hobbii", name: "Friends Wool",              weight: "worsted", metersPerSkein: 200, pricePerSkein: 59,  colors: 62, img: "🔵" },
  { id: 3, brand: "Järbo", name: "Mio Merinoull",              weight: "fingering",metersPerSkein: 400, pricePerSkein: 89,  colors: 30, img: "🟡" },
  { id: 4, brand: "Hobbii", name: "Rainbow Cotton 8/4",        weight: "dk",      metersPerSkein: 170, pricePerSkein: 29,  colors: 80, img: "🟢" },
  { id: 5, brand: "Sandnes", name: "Peer Gynt",                weight: "worsted", metersPerSkein: 90,  pricePerSkein: 69,  colors: 55, img: "🟠" },
  { id: 6, brand: "Järbo", name: "Soft Merino Aran",           weight: "aran",    metersPerSkein: 100, pricePerSkein: 79,  colors: 24, img: "🟣" },
  { id: 7, brand: "Hobbii", name: "Amigo XL Super Chunky",     weight: "superbulky",metersPerSkein: 60, pricePerSkein: 49, colors: 40, img: "⚪" },
  { id: 8, brand: "Sandnes", name: "Tynn Merinoull",           weight: "fingering",metersPerSkein: 175, pricePerSkein: 55, colors: 45, img: "🔴" },
];

// Beräkna totalt meterbehov baserat på plaggstorlek och garnvikt
function calcMetersNeeded(bystPlagg, weightId) {
  const weight = YARN_WEIGHTS.find(w => w.id === weightId);
  if (!weight) return 0;
  // Skala baseMeters proportionellt mot bystmåttet (referens = 106 cm = bekväm M)
  const scaleFactor = (bystPlagg / 106) ** 1.5;
  return Math.round(weight.baseMeters * scaleFactor);
}

function calcResults(bystKropp, ease, maskorPer10, varvPer10) {
  const byst = bystKropp + ease;
  const mpCm = maskorPer10 / 10;
  const vpCm = varvPer10 / 10;
  const raw = {
    byst: byst,
    hals: Math.round(byst * PERCENT.hals * 10) / 10,
    overarm: Math.round(byst * PERCENT.overarm * 10) / 10,
    underarm: Math.round(byst * PERCENT.underarm * 10) / 10,
    handled: Math.round(byst * PERCENT.handled * 10) / 10,
  };
  const pct = { byst:"100%", hals:"40%", overarm:"33%", underarm:"8%", handled:"20%" };
  const result = {};
  Object.keys(raw).forEach(k => {
    result[k] = { cm: raw[k], pct: pct[k], maskor: Math.round(raw[k] * mpCm), varv: Math.round(raw[k] * vpCm) };
  });
  return result;
}

// ── Animated result card ──────────────────────────────────────
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
    <div style={{
      background: flash ? "#fffbe6" : "#fff",
      borderRadius: 10, padding: "11px 15px", marginBottom: 8,
      boxShadow: flash ? `0 0 0 2px ${color}` : "0 2px 8px rgba(0,0,0,0.05)",
      border: "1px solid #ede8e0", borderLeft: `4px solid ${color}`,
      transition: "background 0.3s, box-shadow 0.3s",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
        <span style={{ fontSize:13, fontWeight:"bold" }}>{label}</span>
        <span style={{ display:"flex", alignItems:"baseline", gap:5 }}>
          <span style={{ fontSize:19, fontWeight:"bold", color }}>{cm} cm</span>
          <span style={{ fontSize:10, color:"#b0a090" }}>{pct}</span>
        </span>
      </div>
      <div style={{ marginTop:5, display:"flex", gap:14, fontSize:13, color:"#7a6a52" }}>
        <span>⬡ <strong style={{ color:"#2c2416", fontSize:14, display:"inline-block", transform: flash?"scale(1.25)":"scale(1)", transition:"transform 0.15s" }}>{maskor}</strong> maskor</span>
        <span>≡ <strong style={{ color:"#2c2416", fontSize:14, display:"inline-block", transform: flash?"scale(1.25)":"scale(1)", transition:"transform 0.15s" }}>{varv}</strong> varv</span>
      </div>
    </div>
  );
}

function SectionLabel({ nr, text }) {
  return (
    <div style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"#9c8a6e", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ width:20, height:20, borderRadius:"50%", background:"#c4a882", color:"#fff", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", flexShrink:0 }}>{nr}</span>
      {text}
    </div>
  );
}

// ── Yarn cost panel ───────────────────────────────────────────
function YarnPanel({ bystPlagg }) {
  const [selectedWeight, setSelectedWeight] = useState("worsted");
  const [customMeters,   setCustomMeters]   = useState("");
  const [customPrice,    setCustomPrice]    = useState("");
  const [filterWeight,   setFilterWeight]   = useState("all");
  const [selectedYarn,   setSelectedYarn]   = useState(null);

  const metersNeeded = calcMetersNeeded(bystPlagg, selectedWeight);

  // Bestäm aktivt garn
  const activeYarn = selectedYarn
    ? MOCK_YARNS.find(y => y.id === selectedYarn)
    : null;

  const mPerSkein  = activeYarn ? activeYarn.metersPerSkein : Number(customMeters) || 0;
  const prPerSkein = activeYarn ? activeYarn.pricePerSkein  : Number(customPrice)  || 0;

  const skeinCount  = mPerSkein  > 0 ? Math.ceil(metersNeeded / mPerSkein) : 0;
  const totalCost   = skeinCount * prPerSkein;

  const filteredYarns = filterWeight === "all"
    ? MOCK_YARNS
    : MOCK_YARNS.filter(y => y.weight === filterWeight);

  // Synka vald garnvikt med filtret om man väljer ett garn
  function pickYarn(yarn) {
    setSelectedYarn(yarn.id);
    setSelectedWeight(yarn.weight);
    setCustomMeters("");
    setCustomPrice("");
  }

  return (
    <div style={{ background:"#fff", borderRadius:12, padding:"24px 28px", marginTop:24, boxShadow:"0 2px 14px rgba(0,0,0,0.06)", border:"1px solid #ede8e0" }}>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>🧶</span>
          <div>
            <div style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"#9c8a6e" }}>Steg 4</div>
            <div style={{ fontSize:15, fontWeight:"bold", color:"#2c2416" }}>Garnkalkyl & Kostnad</div>
          </div>
        </div>
        <div style={{ fontSize:12, color:"#9c8a6e", background:"#faf7f2", padding:"4px 12px", borderRadius:20, border:"1px solid #ede8e0" }}>
          Plaggmått: <strong style={{ color:"#d4956a" }}>{bystPlagg} cm</strong>
        </div>
      </div>

      {/* Garnvikt */}
      <div style={{ fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", color:"#9c8a6e", marginBottom:10 }}>
        Garnvikt / Tjocklek
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:20 }}>
        {YARN_WEIGHTS.map(w => (
          <button key={w.id} onClick={() => { setSelectedWeight(w.id); setSelectedYarn(null); setFilterWeight(w.id); }} style={{
            padding:"4px 11px", borderRadius:16, border:"1.5px solid",
            borderColor: selectedWeight===w.id ? "#c4a882" : "#ddd6c8",
            background: selectedWeight===w.id ? "#c4a882" : "transparent",
            color: selectedWeight===w.id ? "#fff" : "#7a6a52",
            fontSize:12, cursor:"pointer", fontFamily:"Georgia, serif", transition:"all 0.15s"
          }}>{w.label}</button>
        ))}
      </div>

      {/* Meterbehov-banner */}
      <div style={{ background:"linear-gradient(135deg,#faf0e6,#f5ede0)", borderRadius:10, padding:"14px 18px", marginBottom:20, border:"1px solid #e8d8c4", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ fontSize:11, color:"#9c8a6e", marginBottom:2 }}>Uppskattad garnåtgång</div>
          <div style={{ fontSize:28, fontWeight:"bold", color:"#d4956a" }}>{metersNeeded.toLocaleString("sv")} m</div>
        </div>
        <div style={{ fontSize:12, color:"#9c8a6e", maxWidth:200 }}>
          Baserat på {YARN_WEIGHTS.find(w=>w.id===selectedWeight)?.label} och plaggmått {bystPlagg} cm
        </div>
      </div>

      {/* Garnlista — simulerad butik */}
      <div style={{ fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", color:"#9c8a6e", marginBottom:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span>Välj garn <span style={{ color:"#c4a882", fontStyle:"italic", textTransform:"none", letterSpacing:0 }}>— simulerad butik</span></span>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={() => setFilterWeight("all")} style={{ padding:"2px 8px", borderRadius:10, border:"1px solid", borderColor: filterWeight==="all"?"#c4a882":"#ddd6c8", background: filterWeight==="all"?"#c4a882":"transparent", color: filterWeight==="all"?"#fff":"#7a6a52", fontSize:11, cursor:"pointer" }}>Alla</button>
          {["dk","worsted","aran"].map(w => (
            <button key={w} onClick={() => setFilterWeight(w)} style={{ padding:"2px 8px", borderRadius:10, border:"1px solid", borderColor: filterWeight===w?"#c4a882":"#ddd6c8", background: filterWeight===w?"#c4a882":"transparent", color: filterWeight===w?"#fff":"#7a6a52", fontSize:11, cursor:"pointer" }}>{w}</button>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8, marginBottom:20 }}>
        {filteredYarns.map(yarn => {
          const skeins = yarn.metersPerSkein > 0 ? Math.ceil(metersNeeded / yarn.metersPerSkein) : 0;
          const cost   = skeins * yarn.pricePerSkein;
          const sel    = selectedYarn === yarn.id;
          return (
            <button key={yarn.id} onClick={() => pickYarn(yarn)} style={{
              background: sel ? "#fdf6ee" : "#faf7f2",
              border: sel ? "2px solid #c4a882" : "1.5px solid #ede8e0",
              borderRadius:10, padding:"10px 12px", textAlign:"left",
              cursor:"pointer", fontFamily:"Georgia, serif",
              transition:"all 0.15s",
              boxShadow: sel ? "0 2px 10px rgba(196,168,130,0.3)" : "none"
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <span style={{ fontSize:18 }}>{yarn.img}</span>
                <div>
                  <div style={{ fontSize:11, color:"#9c8a6e" }}>{yarn.brand}</div>
                  <div style={{ fontSize:12, fontWeight:"bold", color:"#2c2416", lineHeight:1.2 }}>{yarn.name}</div>
                </div>
              </div>
              <div style={{ fontSize:11, color:"#7a6a52", marginBottom:6 }}>
                {yarn.metersPerSkein} m/nystan · {yarn.pricePerSkein} kr · {yarn.colors} färger
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                <span style={{ fontSize:12, color:"#9c8a6e" }}>{skeins} nystan</span>
                <span style={{ fontSize:15, fontWeight:"bold", color: sel?"#d4956a":"#2c2416" }}>{cost} kr</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Eget garn */}
      <div style={{ borderTop:"1px solid #ede8e0", paddingTop:16, marginBottom:20 }}>
        <div style={{ fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", color:"#9c8a6e", marginBottom:10 }}>
          Eller ange eget garn
        </div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {[
            { label:"Meter per nystan", val:customMeters, set:(v)=>{setCustomMeters(v);setSelectedYarn(null);}, placeholder:"t.ex. 200" },
            { label:"Pris per nystan (kr)", val:customPrice, set:(v)=>{setCustomPrice(v);setSelectedYarn(null);}, placeholder:"t.ex. 59" },
          ].map(({ label, val, set, placeholder }) => (
            <label key={label} style={{ flex:1, minWidth:150 }}>
              <div style={{ fontSize:12, color:"#7a6a52", marginBottom:5 }}>{label}</div>
              <input type="number" value={val} placeholder={placeholder}
                onChange={e => set(e.target.value)}
                style={{ width:"100%", padding:"7px 10px", border:"1.5px solid #ddd6c8", borderRadius:8, fontSize:15, fontFamily:"Georgia, serif", background:"#faf7f2", boxSizing:"border-box" }} />
            </label>
          ))}
        </div>
      </div>

      {/* Resultat */}
      {(skeinCount > 0 && totalCost > 0) && (
        <div style={{ background:"linear-gradient(135deg,#2c2416,#4a3828)", borderRadius:12, padding:"20px 24px", color:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={{ fontSize:11, color:"#c4a882", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:4 }}>
              {activeYarn ? `${activeYarn.brand} — ${activeYarn.name}` : "Eget garn"}
            </div>
            <div style={{ display:"flex", gap:24, alignItems:"baseline" }}>
              <div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginBottom:2 }}>Antal nystan</div>
                <div style={{ fontSize:32, fontWeight:"bold", color:"#c4a882" }}>{skeinCount}</div>
              </div>
              <div style={{ fontSize:24, color:"rgba(255,255,255,0.3)" }}>×</div>
              <div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginBottom:2 }}>Pris/nystan</div>
                <div style={{ fontSize:22, color:"#fff" }}>{prPerSkein} kr</div>
              </div>
              <div style={{ fontSize:24, color:"rgba(255,255,255,0.3)" }}>=</div>
              <div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginBottom:2 }}>Totalkostnad</div>
                <div style={{ fontSize:32, fontWeight:"bold", color:"#f0c070" }}>{totalCost} kr</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", maxWidth:160, lineHeight:1.5 }}>
            Köp gärna 1 extra nystan som buffert vid färgvariationer
          </div>
        </div>
      )}

      {(skeinCount === 0 || totalCost === 0) && (
        <div style={{ background:"#faf7f2", borderRadius:10, padding:"16px", textAlign:"center", color:"#9c8a6e", fontSize:13, border:"1px dashed #ddd6c8" }}>
          Välj ett garn ovan eller ange meter/pris för att se totalkostnaden
        </div>
      )}
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────
export default function Stickkalkylator() {
  const [maskor,    setMaskor]    = useState(19);
  const [varv,      setVarv]      = useState(28);
  const [bystKropp, setBystKropp] = useState(96);
  const [ease,      setEase]      = useState(10);
  const [results,   setResults]   = useState(null);

  useEffect(() => {
    setResults(calcResults(bystKropp, ease, maskor, varv));
  }, [bystKropp, ease, maskor, varv]);

  const plaggByst = bystKropp + ease;

  const RESULT_ROWS = [
    { key:"byst",     label:"Byst (plagg)",  color:COLORS.byst },
    { key:"hals",     label:"Hals",           color:COLORS.hals },
    { key:"overarm",  label:"Överarm",        color:COLORS.overarm },
    { key:"underarm", label:"Underärm",       color:COLORS.underarm },
    { key:"handled",  label:"Handled/Mudd",   color:COLORS.handled },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#faf7f2", fontFamily:"'Georgia', serif", display:"flex", flexDirection:"column", alignItems:"center", padding:"36px 16px", color:"#2c2416" }}>
      <div style={{ maxWidth:780, width:"100%" }}>

        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:10, letterSpacing:"0.3em", color:"#9c8a6e", textTransform:"uppercase", marginBottom:6 }}>Universell · EPS-baserad</div>
          <h1 style={{ fontSize:32, fontWeight:"normal", margin:0 }}>Stickkalkylator</h1>
          <div style={{ width:40, height:2, background:"#c4a882", margin:"12px auto 0" }} />
        </div>

        {/* Input panel */}
        <div style={{ background:"#fff", borderRadius:12, padding:"24px 28px", marginBottom:24, boxShadow:"0 2px 14px rgba(0,0,0,0.06)", border:"1px solid #ede8e0" }}>

          <SectionLabel nr="1" text="Masktäthet — per 10 cm" />
          <div style={{ display:"flex", gap:28, flexWrap:"wrap", marginBottom:10 }}>
            {[
              { label:"Maskor", val:maskor, set:setMaskor, min:5, max:40 },
              { label:"Varv",   val:varv,   set:setVarv,   min:5, max:60 },
            ].map(({ label, val, set, min, max }) => (
              <label key={label} style={{ flex:1, minWidth:140 }}>
                <div style={{ fontSize:13, color:"#7a6a52", marginBottom:6 }}>{label}</div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <input type="range" min={min} max={max} value={val}
                    onChange={e => set(Number(e.target.value))}
                    style={{ flex:1, accentColor:"#c4a882" }} />
                  <span style={{ fontSize:22, fontWeight:"bold", minWidth:34, textAlign:"right" }}>{val}</span>
                </div>
              </label>
            ))}
          </div>
          <div style={{ padding:"7px 14px", background:"#faf7f2", borderRadius:8, fontSize:12, color:"#7a6a52", display:"flex", gap:24, marginBottom:22 }}>
            <span>↔ {(maskor/10).toFixed(2)} maskor/cm</span>
            <span>↕ {(varv/10).toFixed(2)} varv/cm</span>
          </div>

          <div style={{ borderTop:"1px solid #ede8e0", marginBottom:22 }} />

          <SectionLabel nr="2" text="Kroppsmått (byst)" />
          <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
            {PRESET_SIZES.map(s => (
              <button key={s.label} onClick={() => setBystKropp(s.byst)} style={{
                padding:"5px 13px", borderRadius:20, border:"1.5px solid",
                borderColor: bystKropp===s.byst ? "#c4a882" : "#ddd6c8",
                background: bystKropp===s.byst ? "#c4a882" : "transparent",
                color: bystKropp===s.byst ? "#fff" : "#7a6a52",
                fontSize:13, cursor:"pointer", fontFamily:"Georgia, serif", transition:"all 0.15s"
              }}>{s.label} {s.byst}cm</button>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
            <input type="range" min={60} max={140} value={bystKropp}
              onChange={e => setBystKropp(Number(e.target.value))}
              style={{ flex:1, accentColor:"#d4956a" }} />
            <input type="number" value={bystKropp}
              onChange={e => setBystKropp(Number(e.target.value))}
              style={{ width:64, padding:"4px 8px", border:"1.5px solid #ddd6c8", borderRadius:8, fontSize:18, fontFamily:"Georgia, serif", fontWeight:"bold", color:"#d4956a", textAlign:"center", background:"#faf7f2" }} />
            <span style={{ fontSize:14, color:"#9c8a6e" }}>cm</span>
          </div>

          <div style={{ borderTop:"1px solid #ede8e0", marginBottom:22 }} />

          <SectionLabel nr="3" text="Passform (ease / sittmån)" />
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:10 }}>
            {EASE_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setEase(opt.value)} style={{
                padding:"7px 16px", borderRadius:10, border:"1.5px solid",
                borderColor: ease===opt.value ? "#7a8fbb" : "#ddd6c8",
                background: ease===opt.value ? "#7a8fbb" : "transparent",
                color: ease===opt.value ? "#fff" : "#7a6a52",
                fontSize:13, cursor:"pointer", fontFamily:"Georgia, serif",
                transition:"all 0.15s", textAlign:"center", lineHeight:1.4
              }}>
                <div style={{ fontWeight:"bold" }}>{opt.label}</div>
                <div style={{ fontSize:11, opacity:0.85 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
          <div style={{ padding:"7px 14px", background:"#faf7f2", borderRadius:8, fontSize:12, color:"#7a6a52", display:"flex", gap:8, flexWrap:"wrap" }}>
            <span>Kropp: <strong>{bystKropp} cm</strong></span>
            <span style={{ color:"#c4a882" }}>+</span>
            <span>Ease: <strong>{ease} cm</strong></span>
            <span style={{ color:"#c4a882" }}>=</span>
            <span>Plaggmått: <strong style={{ color:"#d4956a" }}>{plaggByst} cm</strong></span>
          </div>
        </div>

        {/* Resultatkort */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:8, marginBottom:4 }}>
          {results && RESULT_ROWS.map(({ key, label, color }) => (
            <ResultCard key={key} label={label} color={color}
              cm={results[key].cm} pct={results[key].pct}
              maskor={results[key].maskor} varv={results[key].varv}
            />
          ))}
        </div>

        {/* Garnpanel */}
        <YarnPanel bystPlagg={plaggByst} />

        <div style={{ textAlign:"center", marginTop:22, fontSize:11, color:"#b0a090", letterSpacing:"0.06em" }}>
          EPS · Hals 40% · Överarm 33% · Underärm 8% · Handled 20% · Garnåtgång är uppskattning
        </div>
      </div>
    </div>
  );
}

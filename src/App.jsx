import { useState } from "react";
import Binder from "./Binder";
import Calculator from "./Calculator";
import Inspector from "./Inspector";

export default function App() {
  const [results,       setResults]       = useState(null);
  const [bystPlagg,     setBystPlagg]     = useState(106);
  const [activeProject, setActiveProject] = useState(1);
  const [activePanel,   setActivePanel]   = useState("all"); // all | binder | calc | inspector

  function handleResultsChange(r, bp) {
    setResults(r);
    setBystPlagg(bp);
  }

  // Panel visibility helpers
  const show = (id) => activePanel === "all" || activePanel === id;

  return (
    <div style={{ fontFamily:"Georgia,serif", color:"#2c2416", height:"100vh", display:"flex", flexDirection:"column", background:"#faf7f2", overflow:"hidden" }}>

      {/* ── Top bar ── */}
      <div style={{ height:44, background:"#2c2416", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", flexShrink:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:18 }}>🧶</span>
          <span style={{ color:"#c4a882", fontSize:14, fontWeight:"bold", letterSpacing:"0.04em" }}>Stickkalkylator</span>
          <span style={{ color:"rgba(255,255,255,0.25)", fontSize:12, marginLeft:2 }}>· EPS</span>
        </div>

        {/* Panel switcher */}
        <div style={{ display:"flex", gap:3 }}>
          {[
            ["all",      "⊞",  "Alla"],
            ["binder",   "📁", "Binder"],
            ["calc",     "🧮", "Kalkyl"],
            ["inspector","✨", "Inspector"],
          ].map(([id, icon, label]) => (
            <button key={id} onClick={() => setActivePanel(id)} style={{
              padding:"3px 10px", borderRadius:12, border:"none",
              background: activePanel===id ? "#c4a882" : "rgba(255,255,255,0.08)",
              color: activePanel===id ? "#fff" : "rgba(255,255,255,0.55)",
              fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif",
              transition:"all 0.15s", display:"flex", alignItems:"center", gap:4
            }}><span>{icon}</span><span style={{ display:"none", "@media(minWidth:600px)":{ display:"inline" } }}>{label}</span></button>
          ))}
        </div>
      </div>

      {/* ── Three panels ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* BINDER */}
        <div style={{
          width:        show("binder") ? (activePanel==="binder" ? "100%" : "250px") : "0",
          minWidth:     show("binder") ? (activePanel==="binder" ? "100%" : "250px") : "0",
          overflow:     "hidden",
          borderRight:  show("binder") && activePanel!=="binder" ? "1px solid #ede8e0" : "none",
          transition:   "all 0.3s ease",
          flexShrink:   0,
        }}>
          <Binder activeProject={activeProject} setActiveProject={setActiveProject} />
        </div>

        {/* CALCULATOR */}
        <div style={{
          flex:        show("calc") ? 1 : 0,
          minWidth:    show("calc") ? (activePanel==="calc" ? "100%" : "280px") : "0",
          overflow:    "hidden",
          borderRight: show("calc") && activePanel!=="calc" ? "1px solid #ede8e0" : "none",
          transition:  "all 0.3s ease",
        }}>
          <Calculator onResultsChange={handleResultsChange} />
        </div>

        {/* INSPECTOR */}
        <div style={{
          width:       show("inspector") ? (activePanel==="inspector" ? "100%" : "300px") : "0",
          minWidth:    show("inspector") ? (activePanel==="inspector" ? "100%" : "300px") : "0",
          overflow:    "hidden",
          transition:  "all 0.3s ease",
          flexShrink:  0,
        }}>
          <Inspector results={results} bystPlagg={bystPlagg} />
        </div>

      </div>
    </div>
  );
}

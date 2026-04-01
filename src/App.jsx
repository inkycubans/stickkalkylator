import { useState } from "react";
import Binder from "./Binder";
import Calculator from "./Calculator";
import Inspector from "./Inspector";

export default function App() {
  const [results,        setResults]        = useState(null);
  const [bystPlagg,      setBystPlagg]      = useState(106);
  const [activeProject,  setActiveProject]  = useState(1);
  const [activePanel,    setActivePanel]    = useState("all");

  function handleResultsChange(r, bp) {
    setResults(r);
    setBystPlagg(bp);
  }

  const show = (id) => activePanel === "all" || activePanel === id;

  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#2c1f14",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#f7f3ee",
      overflow: "hidden",
    }}>

      {/* ── Top bar ── */}
      <div style={{
        height: 48,
        background: "linear-gradient(135deg, #3d2b1a 0%, #5c3d24 50%, #7a5230 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        flexShrink: 0,
        boxShadow: "0 2px 12px rgba(61,43,26,0.25)",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>🧶</span>
          <div>
            <span style={{ color:"#f0d9b5", fontSize:15, fontWeight:"bold", letterSpacing:"0.03em" }}>
              Stickkalkylator
            </span>
            <span style={{ color:"rgba(240,217,181,0.45)", fontSize:11, marginLeft:8 }}>EPS</span>
          </div>
        </div>

        {/* Panel switcher */}
        <div style={{ display:"flex", gap:4, background:"rgba(0,0,0,0.2)", borderRadius:20, padding:"3px" }}>
          {[
            ["all",       "⊞", "Alla"],
            ["binder",    "📁","Binder"],
            ["calc",      "🧮","Kalkyl"],
            ["inspector", "✨","Assistent"],
          ].map(([id, icon, label]) => (
            <button key={id} onClick={() => setActivePanel(id)} style={{
              padding: "4px 12px",
              borderRadius: 16,
              border: "none",
              background: activePanel === id
                ? "linear-gradient(135deg,#c4956a,#e8b88a)"
                : "transparent",
              color: activePanel === id ? "#fff" : "rgba(240,217,181,0.6)",
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "Georgia, serif",
              transition: "all 0.2s",
              fontWeight: activePanel === id ? "bold" : "normal",
            }}>{icon} {label}</button>
          ))}
        </div>
      </div>

      {/* ── Three panels ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* BINDER */}
        <div style={{
          width:      show("binder") ? (activePanel==="binder" ? "100%" : "240px") : "0",
          minWidth:   show("binder") ? (activePanel==="binder" ? "100%" : "240px") : "0",
          overflow:   "hidden",
          borderRight: "1px solid #e8ddd0",
          transition: "all 0.35s ease",
          flexShrink: 0,
          background: "linear-gradient(180deg, #fdf8f3 0%, #f7f0e8 100%)",
        }}>
          <Binder activeProject={activeProject} setActiveProject={setActiveProject} />
        </div>

        {/* CALCULATOR */}
        <div style={{
          flex:       show("calc") ? 1 : 0,
          minWidth:   show("calc") ? (activePanel==="calc" ? "100%" : "300px") : "0",
          overflow:   "hidden",
          borderRight: "1px solid #e8ddd0",
          transition: "all 0.35s ease",
          background: "#f7f3ee",
        }}>
          <Calculator onResultsChange={handleResultsChange} />
        </div>

        {/* INSPECTOR */}
        <div style={{
          width:     show("inspector") ? (activePanel==="inspector" ? "100%" : "310px") : "0",
          minWidth:  show("inspector") ? (activePanel==="inspector" ? "100%" : "310px") : "0",
          overflow:  "hidden",
          transition:"all 0.35s ease",
          flexShrink:0,
          background:"linear-gradient(180deg,#fdf8f3 0%,#f7f0e8 100%)",
        }}>
          <Inspector results={results} bystPlagg={bystPlagg} />
        </div>

      </div>
    </div>
  );
}

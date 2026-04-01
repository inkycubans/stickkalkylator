import { useState, useRef, useCallback } from "react";

const INITIAL_PROJECTS = [
  { id:1, name:"Vintertröja M",  date:"2026-03-08", size:"M",  note:"Raglan, mörkblå",  color:"#8fa8c8" },
  { id:2, name:"Sommarkofta S",  date:"2026-02-14", size:"S",  note:"Bomull, vit",       color:"#8fbb9a" },
];

const PALETTE = {
  bg:      "#fdf8f3",
  border:  "#e8ddd0",
  accent:  "#9c6b3c",
  muted:   "#a89880",
  text:    "#2c1f14",
  light:   "#f0e8dc",
  card:    "#fff",
};

// ── Moodboard ─────────────────────────────────────────────────
function Moodboard() {
  const [items,      setItems]      = useState([]);
  const [dragging,   setDragging]   = useState(null);
  const [dragOffset, setDragOffset] = useState({ x:0, y:0 });
  const boardRef = useRef(null);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    const rect  = boardRef.current?.getBoundingClientRect();
    files.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setItems(prev => [...prev, {
          id:    Date.now() + i,
          src:   ev.target.result,
          x:     (e.clientX - (rect?.left||0) - 60) + i*22,
          y:     (e.clientY - (rect?.top ||0) - 60) + i*22,
          w:     160, h:120,
          label: file.name.replace(/\.[^.]+$/, ""),
        }]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const onPaste = useCallback((e) => {
    const it   = Array.from(e.clipboardData.items);
    const img  = it.find(i => i.type.startsWith("image/"));
    if (!img) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setItems(prev => [...prev, {
        id:40+prev.length, src:ev.target.result,
        x:30+prev.length*18, y:30+prev.length*18, w:160, h:120, label:"Bild"
      }]);
    };
    reader.readAsDataURL(img.getAsFile());
  }, []);

  function startDrag(e, id) {
    e.preventDefault();
    const item = items.find(i => i.id===id);
    if (!item) return;
    setDragging(id);
    setDragOffset({ x:e.clientX-item.x, y:e.clientY-item.y });
  }

  function onMouseMove(e) {
    if (dragging===null) return;
    setItems(prev => prev.map(it =>
      it.id===dragging ? { ...it, x:e.clientX-dragOffset.x, y:e.clientY-dragOffset.y } : it
    ));
  }

  function addNote() {
    setItems(prev => [...prev, {
      id:Date.now(), type:"note", text:"Anteckning...",
      x:20+prev.length*14, y:20+prev.length*14, w:140, h:90, color:"#fef9c3"
    }]);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ display:"flex", gap:6, padding:"8px 12px", borderBottom:`1px solid ${PALETTE.border}`, background:PALETTE.bg, flexShrink:0 }}>
        <button onClick={addNote} style={{
          padding:"4px 12px", borderRadius:8,
          border:`1px solid ${PALETTE.border}`,
          background:"#fef9c3", color:PALETTE.text,
          fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif"
        }}>+ Notat</button>
        <span style={{ fontSize:11, color:PALETTE.muted, alignSelf:"center" }}>Dra bilder hit eller klistra in</span>
      </div>

      <div
        ref={boardRef} tabIndex={0}
        onDrop={onDrop} onDragOver={e=>e.preventDefault()}
        onPaste={onPaste} onMouseMove={onMouseMove}
        onMouseUp={() => setDragging(null)}
        onMouseLeave={() => setDragging(null)}
        style={{
          flex:1, position:"relative", overflow:"hidden", userSelect:"none",
          background: items.length===0
            ? `repeating-linear-gradient(45deg,#f5ede0 0,#f5ede0 10px,#fdf8f3 10px,#fdf8f3 20px)`
            : "#f5ede0",
          cursor: dragging!==null ? "grabbing" : "default",
        }}
      >
        {items.length===0 && (
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", color:PALETTE.muted, pointerEvents:"none" }}>
            <div style={{ fontSize:36, marginBottom:10 }}>🖼</div>
            <div style={{ fontSize:13, fontFamily:"Georgia,serif" }}>Dra bilder hit</div>
            <div style={{ fontSize:11, marginTop:4 }}>eller klistra in från urklipp</div>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} onMouseDown={e=>startDrag(e,item.id)} style={{
            position:"absolute", left:item.x, top:item.y, width:item.w,
            cursor:"grab", borderRadius:8, overflow:"hidden",
            boxShadow:"0 4px 16px rgba(61,43,26,0.18)",
            border:"3px solid #fff",
          }}>
            {item.type==="note" ? (
              <textarea
                value={item.text}
                onChange={e=>{e.stopPropagation(); setItems(prev=>prev.map(it=>it.id===item.id?{...it,text:e.target.value}:it));}}
                onMouseDown={e=>e.stopPropagation()}
                style={{ width:"100%", height:item.h, resize:"none", border:"none", outline:"none", background:item.color||"#fef9c3", padding:"8px 10px", fontSize:12, fontFamily:"Georgia,serif", color:PALETTE.text, display:"block" }}
              />
            ) : (
              <img src={item.src} alt={item.label} style={{ width:"100%", height:item.h, objectFit:"cover", display:"block", pointerEvents:"none" }} draggable={false} />
            )}
            {item.label && (
              <div style={{ background:"rgba(44,31,20,0.65)", padding:"3px 7px", fontSize:10, color:"#fff", fontFamily:"Georgia,serif" }}>{item.label}</div>
            )}
            <button onMouseDown={e=>{e.stopPropagation(); setItems(prev=>prev.filter(it=>it.id!==item.id));}} style={{
              position:"absolute", top:4, right:4, width:18, height:18,
              borderRadius:"50%", border:"none", background:"rgba(44,31,20,0.55)",
              color:"#fff", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"
            }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Binder ────────────────────────────────────────────────────
export default function Binder({ activeProject, setActiveProject }) {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [view,     setView]     = useState("projects");
  const [showNew,  setShowNew]  = useState(false);
  const [newName,  setNewName]  = useState("");

  const COLORS = ["#8fa8c8","#8fbb9a","#c4956a","#b87aab","#a07850","#6a9ab0"];

  function addProject() {
    if (!newName.trim()) return;
    const p = {
      id:    Date.now(),
      name:  newName,
      date:  new Date().toISOString().split("T")[0],
      size:  "M", note: "",
      color: COLORS[Math.floor(Math.random()*COLORS.length)]
    };
    setProjects(prev => [p, ...prev]);
    setActiveProject(p.id);
    setNewName(""); setShowNew(false);
  }

  const active = projects.find(p => p.id===activeProject);

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ padding:"20px 16px 14px", borderBottom:`1px solid ${PALETTE.border}` }}>
        <div style={{ fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase", color:PALETTE.muted, marginBottom:4 }}>Binder</div>
        <div style={{ fontSize:22, fontWeight:"bold", color:PALETTE.text, fontFamily:"Georgia,serif" }}>Mina projekt</div>
      </div>

      {/* View toggle */}
      <div style={{ display:"flex", padding:"8px 10px", gap:3, borderBottom:`1px solid ${PALETTE.border}`, background:PALETTE.bg }}>
        {[["projects","📁 Projekt"],["moodboard","🖼 Moodboard"]].map(([id,label]) => (
          <button key={id} onClick={()=>setView(id)} style={{
            flex:1, padding:"6px 0", borderRadius:8, border:"none",
            background: view===id
              ? "linear-gradient(135deg,#9c6b3c,#c4956a)"
              : "transparent",
            color: view===id ? "#fff" : PALETTE.muted,
            fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif",
            fontWeight: view===id ? "bold" : "normal",
            transition:"all 0.2s"
          }}>{label}</button>
        ))}
      </div>

      {/* Projects */}
      {view==="projects" && (
        <div style={{ flex:1, overflowY:"auto", padding:"10px 10px 0" }}>
          {projects.map(p => (
            <div key={p.id} onClick={()=>setActiveProject(p.id)} style={{
              padding:"12px 14px", borderRadius:10, marginBottom:7, cursor:"pointer",
              background: activeProject===p.id ? PALETTE.light : PALETTE.card,
              border: `1px solid ${activeProject===p.id ? p.color : PALETTE.border}`,
              borderLeft: `4px solid ${p.color}`,
              boxShadow: activeProject===p.id ? "0 2px 10px rgba(61,43,26,0.1)" : "0 1px 4px rgba(61,43,26,0.05)",
              transition:"all 0.2s"
            }}>
              <div style={{ fontSize:13, fontWeight:"bold", color:PALETTE.text }}>{p.name}</div>
              <div style={{ fontSize:11, color:PALETTE.muted, marginTop:2 }}>Stl {p.size} · {p.date}</div>
              {p.note && <div style={{ fontSize:11, color:"#7a6a52", marginTop:3, fontStyle:"italic" }}>{p.note}</div>}
            </div>
          ))}

          {showNew ? (
            <div style={{ padding:"12px 14px", background:PALETTE.card, borderRadius:10, border:`1.5px solid ${PALETTE.accent}`, marginBottom:8, boxShadow:"0 2px 10px rgba(61,43,26,0.08)" }}>
              <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addProject()}
                placeholder="Projektnamn..."
                style={{ width:"100%", border:"none", outline:"none", fontSize:13, fontFamily:"Georgia,serif", background:"transparent", marginBottom:10, boxSizing:"border-box", color:PALETTE.text }} />
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={addProject} style={{ flex:1, padding:"6px 0", background:`linear-gradient(135deg,#9c6b3c,#c4956a)`, color:"#fff", border:"none", borderRadius:7, fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif" }}>Spara</button>
                <button onClick={()=>setShowNew(false)} style={{ flex:1, padding:"6px 0", background:PALETTE.light, color:PALETTE.muted, border:"none", borderRadius:7, fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif" }}>Avbryt</button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setShowNew(true)} style={{ width:"100%", padding:"10px 0", background:"transparent", border:`1.5px dashed ${PALETTE.border}`, borderRadius:10, color:PALETTE.muted, fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif", marginBottom:10, transition:"all 0.2s" }}>
              + Nytt projekt
            </button>
          )}
        </div>
      )}

      {/* Moodboard */}
      {view==="moodboard" && (
        <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          {active && (
            <div style={{ padding:"6px 14px", background:PALETTE.light, borderBottom:`1px solid ${PALETTE.border}`, fontSize:11, color:PALETTE.muted, fontStyle:"italic" }}>
              {active.name}
            </div>
          )}
          <div style={{ flex:1, overflow:"hidden" }}>
            <Moodboard projectId={activeProject} />
          </div>
        </div>
      )}
    </div>
  );
}

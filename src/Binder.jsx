import { useState, useRef, useCallback } from "react";

const INITIAL_PROJECTS = [
  { id:1, name:"Vintertröja M",  date:"2026-03-08", size:"M",  note:"Raglan, mörkblå",  color:"#7a8fbb" },
  { id:2, name:"Sommarkofta S",  date:"2026-02-14", size:"S",  note:"Bomull, vit",       color:"#7aab8a" },
];

// ── Moodboard ─────────────────────────────────────────────────
function Moodboard({ projectId }) {
  const [items, setItems]       = useState([]);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x:0, y:0 });
  const boardRef = useRef(null);

  // Drop image files onto board
  const onDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    const rect = boardRef.current?.getBoundingClientRect();
    files.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setItems(prev => [...prev, {
          id: Date.now() + i,
          src: ev.target.result,
          x: (e.clientX - (rect?.left || 0) - 60) + i * 20,
          y: (e.clientY - (rect?.top  || 0) - 60) + i * 20,
          w: 160, h: 120,
          label: file.name.replace(/\.[^.]+$/, ""),
        }]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Also support URL drops / paste
  const onPaste = useCallback((e) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(it => it.type.startsWith("image/"));
    if (!imageItem) return;
    const file = imageItem.getAsFile();
    const reader = new FileReader();
    reader.onload = ev => {
      setItems(prev => [...prev, {
        id: Date.now(), src: ev.target.result,
        x: 40 + prev.length * 20, y: 40 + prev.length * 20,
        w: 160, h: 120, label: "Bild"
      }]);
    };
    reader.readAsDataURL(file);
  }, []);

  function startDrag(e, id) {
    e.preventDefault();
    const item = items.find(it => it.id === id);
    if (!item) return;
    setDragging(id);
    setDragOffset({ x: e.clientX - item.x, y: e.clientY - item.y });
  }

  function onMouseMove(e) {
    if (dragging === null) return;
    const rect = boardRef.current?.getBoundingClientRect();
    setItems(prev => prev.map(it =>
      it.id === dragging
        ? { ...it, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
        : it
    ));
  }

  function stopDrag() { setDragging(null); }

  function removeItem(id) { setItems(prev => prev.filter(it => it.id !== id)); }

  function addNote() {
    setItems(prev => [...prev, {
      id: Date.now(), type:"note",
      text: "Anteckning...",
      x: 30 + prev.length * 15, y: 30 + prev.length * 15,
      w: 140, h: 90, color:"#fef9c3", label:""
    }]);
  }

  function updateNoteText(id, text) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, text } : it));
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Toolbar */}
      <div style={{ display:"flex", gap:6, padding:"8px 12px", borderBottom:"1px solid #ede8e0", background:"#faf7f2", flexShrink:0 }}>
        <button onClick={addNote} style={{ padding:"4px 10px", borderRadius:6, border:"1px solid #ddd6c8", background:"#fef9c3", color:"#7a6a52", fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif" }}>
          + Notat
        </button>
        <span style={{ fontSize:11, color:"#b0a090", alignSelf:"center" }}>Dra bilder hit eller klistra in</span>
      </div>

      {/* Board */}
      <div
        ref={boardRef}
        tabIndex={0}
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onPaste={onPaste}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        style={{
          flex:1, position:"relative", overflow:"hidden",
          background: items.length === 0
            ? "repeating-linear-gradient(45deg,#f5f0ea 0px,#f5f0ea 10px,#faf7f2 10px,#faf7f2 20px)"
            : "#f5f0ea",
          cursor: dragging !== null ? "grabbing" : "default",
          userSelect:"none",
        }}
      >
        {items.length === 0 && (
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", color:"#b0a090", pointerEvents:"none" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🖼</div>
            <div style={{ fontSize:13 }}>Dra bilder hit</div>
            <div style={{ fontSize:11, marginTop:4 }}>eller klistra in från urklipp</div>
          </div>
        )}

        {items.map(item => (
          <div key={item.id}
            onMouseDown={e => startDrag(e, item.id)}
            style={{
              position:"absolute", left:item.x, top:item.y,
              width:item.w, cursor:"grab",
              boxShadow:"0 3px 12px rgba(0,0,0,0.15)",
              borderRadius:6, overflow:"hidden",
              border:"2px solid #fff",
              transition: dragging===item.id ? "none" : "box-shadow 0.2s",
            }}
          >
            {item.type === "note" ? (
              <textarea
                value={item.text}
                onChange={e => { e.stopPropagation(); updateNoteText(item.id, e.target.value); }}
                onMouseDown={e => e.stopPropagation()}
                style={{
                  width:"100%", height:item.h, resize:"none", border:"none", outline:"none",
                  background:item.color||"#fef9c3", padding:"8px 10px",
                  fontSize:12, fontFamily:"Georgia,serif", color:"#2c2416",
                  display:"block",
                }}
              />
            ) : (
              <img src={item.src} alt={item.label}
                style={{ width:"100%", height:item.h, objectFit:"cover", display:"block", pointerEvents:"none" }}
                draggable={false}
              />
            )}
            {/* Label */}
            {item.label && (
              <div style={{ background:"rgba(44,36,22,0.7)", padding:"3px 7px", fontSize:10, color:"#fff", fontFamily:"Georgia,serif" }}>
                {item.label}
              </div>
            )}
            {/* Remove button */}
            <button
              onMouseDown={e => { e.stopPropagation(); removeItem(item.id); }}
              style={{
                position:"absolute", top:3, right:3, width:18, height:18,
                borderRadius:"50%", border:"none", background:"rgba(44,36,22,0.6)",
                color:"#fff", fontSize:10, cursor:"pointer", display:"flex",
                alignItems:"center", justifyContent:"center", lineHeight:1
              }}
            >×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Binder main ───────────────────────────────────────────────
export default function Binder({ activeProject, setActiveProject }) {
  const [projects,  setProjects]  = useState(INITIAL_PROJECTS);
  const [view,      setView]      = useState("projects"); // projects | moodboard
  const [showNew,   setShowNew]   = useState(false);
  const [newName,   setNewName]   = useState("");

  function addProject() {
    if (!newName.trim()) return;
    const p = {
      id: Date.now(), name: newName,
      date: new Date().toISOString().split("T")[0],
      size:"M", note:"",
      color: ["#d4956a","#7aab8a","#7a8fbb","#b87aab","#a07850"][Math.floor(Math.random()*5)]
    };
    setProjects(prev => [p, ...prev]);
    setActiveProject(p.id);
    setNewName("");
    setShowNew(false);
  }

  const active = projects.find(p => p.id === activeProject);

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"#faf7f2" }}>

      {/* Header */}
      <div style={{ padding:"18px 14px 10px", borderBottom:"1px solid #ede8e0" }}>
        <div style={{ fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase", color:"#9c8a6e", marginBottom:3 }}>Binder</div>
        <div style={{ fontSize:20, fontWeight:"bold", color:"#2c2416" }}>Projekt</div>
      </div>

      {/* View toggle */}
      <div style={{ display:"flex", padding:"8px 10px", gap:4, borderBottom:"1px solid #ede8e0" }}>
        {[["projects","📁 Projekt"],["moodboard","🖼 Moodboard"]].map(([id, label]) => (
          <button key={id} onClick={() => setView(id)} style={{
            flex:1, padding:"5px 0", borderRadius:7, border:"none",
            background: view===id?"#2c2416":"transparent",
            color: view===id?"#fff":"#9c8a6e",
            fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif", transition:"all 0.15s"
          }}>{label}</button>
        ))}
      </div>

      {/* Projects view */}
      {view === "projects" && (
        <div style={{ flex:1, overflowY:"auto", padding:"10px 10px 0" }}>
          {projects.map(p => (
            <div key={p.id} onClick={() => setActiveProject(p.id)} style={{
              padding:"10px 12px", borderRadius:8, marginBottom:6, cursor:"pointer",
              background: activeProject===p.id?"#f0ebe3":"#fff",
              border: activeProject===p.id?`1.5px solid ${p.color}`:"1px solid #ede8e0",
              transition:"all 0.15s",
              borderLeft: `4px solid ${p.color}`
            }}>
              <div style={{ fontSize:13, fontWeight:"bold", color:"#2c2416" }}>{p.name}</div>
              <div style={{ fontSize:11, color:"#9c8a6e", marginTop:2 }}>Stl {p.size} · {p.date}</div>
              {p.note && <div style={{ fontSize:11, color:"#7a6a52", marginTop:3, fontStyle:"italic" }}>{p.note}</div>}
            </div>
          ))}

          {showNew ? (
            <div style={{ padding:"10px 12px", background:"#fff", borderRadius:8, border:"1.5px solid #c4a882", marginBottom:8 }}>
              <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key==="Enter" && addProject()}
                placeholder="Projektnamn..."
                style={{ width:"100%", border:"none", outline:"none", fontSize:13, fontFamily:"Georgia,serif", background:"transparent", marginBottom:8, boxSizing:"border-box" }} />
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={addProject} style={{ flex:1, padding:"4px 0", background:"#c4a882", color:"#fff", border:"none", borderRadius:6, fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif" }}>Spara</button>
                <button onClick={() => setShowNew(false)} style={{ flex:1, padding:"4px 0", background:"#ede8e0", color:"#7a6a52", border:"none", borderRadius:6, fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif" }}>Avbryt</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowNew(true)} style={{ width:"100%", padding:"8px 0", background:"transparent", border:"1.5px dashed #ddd6c8", borderRadius:8, color:"#9c8a6e", fontSize:12, cursor:"pointer", fontFamily:"Georgia,serif", marginBottom:10 }}>
              + Nytt projekt
            </button>
          )}
        </div>
      )}

      {/* Moodboard view */}
      {view === "moodboard" && (
        <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          {active && (
            <div style={{ padding:"6px 12px", background:"#fff", borderBottom:"1px solid #ede8e0", fontSize:11, color:"#9c8a6e" }}>
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

import { useState, useEffect, useRef } from "react";

const P = {
  bg:"#fdf8f3", card:"#fff", border:"#e8ddd0",
  accent:"#9c6b3c", muted:"#a89880", text:"#2c1f14", light:"#f0e8dc",
};

const QUICK = [
  "Vad är raglan?",
  "Hur stickar jag ok?",
  "Tips på garn till tröja",
  "Vad är ease?",
  "Skillnad DK och Worsted?",
];

export default function Inspector({ results, bystPlagg }) {
  const [messages, setMessages] = useState([
    { role:"assistant", text:"Hej! Jag är din stickassistent 🧶\n\nFråga mig om tekniker, mönster, garn eller hur EPS-systemet fungerar. Jag känner till dina aktuella kalkylatvärden och kan hjälpa dig direkt." }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey,  setApiKey]  = useState(() => localStorage.getItem("gemini_key")||"");
  const [showKey, setShowKey] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  function saveKey(k) {
    setApiKey(k);
    localStorage.setItem("gemini_key", k);
  }

  async function sendMessage(text) {
    const userMsg = (text||input).trim();
    if (!userMsg) return;
    if (!apiKey) { setShowKey(true); return; }

    setInput("");
    setMessages(prev => [...prev, { role:"user", text:userMsg }]);
    setLoading(true);

    const ctx = results ? `
Aktuella kalkylatvärden (plaggmått ${bystPlagg} cm):
- Hals: ${results.hals.cm} cm = ${results.hals.maskor} maskor
- Byst: ${results.byst.cm} cm = ${results.byst.maskor} maskor
- Överarm: ${results.overarm.cm} cm = ${results.overarm.maskor} maskor
- Underärm: ${results.underarm.cm} cm = ${results.underarm.maskor} maskor
- Handled: ${results.handled.cm} cm = ${results.handled.maskor} maskor
` : "";

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            contents:[{ role:"user", parts:[{ text:
              `Du är en erfaren stickningsassistent med djup kunskap om EPS (Elizabeth Zimmermanns procentmetod), raglan, yoke, drop shoulder, olika garnkvaliteter och sticktekniker. Svara på svenska, kort, varmt och praktiskt.
${ctx}
Fråga: ${userMsg}`
            }]}]
          })
        }
      );
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Kunde inte få svar, försök igen.";
      setMessages(prev => [...prev, { role:"assistant", text:reply }]);
    } catch {
      setMessages(prev => [...prev, { role:"assistant", text:"Något gick fel. Kontrollera din API-nyckel." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"linear-gradient(180deg,#fdf8f3 0%,#f7f0e8 100%)" }}>

      {/* Header */}
      <div style={{ padding:"20px 16px 14px", borderBottom:`1px solid ${P.border}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase", color:P.muted, marginBottom:4 }}>Inspector</div>
          <div style={{ fontSize:22, fontWeight:"bold", color:P.text, fontFamily:"Georgia,serif" }}>AI-assistent</div>
          <div style={{ fontSize:11, color:P.muted, marginTop:3 }}>Gemini · Stickningsexpert</div>
        </div>
        <button onClick={()=>setShowKey(!showKey)} style={{
          padding:"5px 12px", borderRadius:8, border:`1px solid ${P.border}`,
          background:apiKey?"#f0faf4":"transparent",
          color:apiKey?"#5a9a6a":P.muted,
          fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif", transition:"all 0.2s"
        }}>{apiKey ? "🔑 Aktiv" : "🔑 API"}</button>
      </div>

      {/* API key */}
      {showKey && (
        <div style={{ margin:"10px 14px", padding:"14px", background:P.card, borderRadius:10, border:`1px solid ${P.border}`, boxShadow:"0 2px 10px rgba(44,31,20,0.08)" }}>
          <div style={{ fontSize:12, color:P.muted, marginBottom:8, fontFamily:"Georgia,serif" }}>Gemini API-nyckel:</div>
          <input type="password" value={apiKey} onChange={e=>saveKey(e.target.value)}
            placeholder="AIza..."
            style={{ width:"100%", padding:"8px 10px", border:`1.5px solid ${P.border}`, borderRadius:7, fontSize:12, fontFamily:"Georgia,serif", background:"#faf7f2", boxSizing:"border-box", outline:"none" }} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
            <span style={{ fontSize:10, color:P.muted }}>Sparas lokalt i webbläsaren</span>
            <button onClick={()=>setShowKey(false)} style={{ padding:"4px 12px", background:`linear-gradient(135deg,${P.accent},#c4956a)`, color:"#fff", border:"none", borderRadius:6, fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif" }}>Stäng</button>
          </div>
        </div>
      )}

      {/* Context pill */}
      {results && (
        <div style={{ margin:"8px 14px 0", padding:"8px 12px", background:P.light, borderRadius:8, border:`1px solid ${P.border}` }}>
          <div style={{ fontSize:10, color:P.muted, marginBottom:5, letterSpacing:"0.1em", textTransform:"uppercase" }}>Aktuella värden</div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", fontSize:11, color:P.muted }}>
            <span>Byst <strong style={{ color:"#c4956a" }}>{results.byst.cm} cm</strong></span>
            <span>Hals <strong style={{ color:"#7aab8a" }}>{results.hals.cm} cm</strong></span>
            <span>Ärm <strong style={{ color:"#7a8fbb" }}>{results.overarm.cm} cm</strong></span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom:12, display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
            <div style={{
              maxWidth:"88%", padding:"10px 14px", borderRadius:12,
              background: m.role==="user"
                ? "linear-gradient(135deg,#3d2b1a,#5c3d24)"
                : P.card,
              color: m.role==="user" ? "#f0d9b5" : P.text,
              fontSize:13, lineHeight:1.65,
              border: m.role==="assistant" ? `1px solid ${P.border}` : "none",
              boxShadow: m.role==="assistant" ? "0 2px 8px rgba(44,31,20,0.07)" : "0 2px 8px rgba(44,31,20,0.2)",
              borderBottomRightRadius: m.role==="user" ? 3 : 12,
              borderBottomLeftRadius:  m.role==="assistant" ? 3 : 12,
              whiteSpace:"pre-wrap",
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", justifyContent:"flex-start", marginBottom:12 }}>
            <div style={{ padding:"10px 14px", borderRadius:12, borderBottomLeftRadius:3, background:P.card, border:`1px solid ${P.border}`, fontSize:13, color:P.muted, fontStyle:"italic" }}>
              Tänker...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div style={{ padding:"0 12px 8px", display:"flex", gap:5, flexWrap:"wrap" }}>
        {QUICK.map(q => (
          <button key={q} onClick={()=>sendMessage(q)} style={{
            padding:"4px 10px", background:P.light, border:`1px solid ${P.border}`,
            borderRadius:14, fontSize:10, color:P.muted, cursor:"pointer",
            fontFamily:"Georgia,serif", transition:"all 0.2s",
          }}>{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding:"8px 14px 14px", borderTop:`1px solid ${P.border}` }}>
        {!apiKey && (
          <button onClick={()=>setShowKey(true)} style={{
            width:"100%", padding:"9px 0", background:P.light,
            border:`1.5px dashed #c4956a`, borderRadius:9, color:P.muted,
            fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif", marginBottom:8,
            transition:"all 0.2s"
          }}>🔑 Ange Gemini API-nyckel för att aktivera assistenten</button>
        )}
        <div style={{ display:"flex", gap:7 }}>
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()}
            placeholder="Fråga om tekniker, mönster, garn..."
            style={{ flex:1, padding:"9px 12px", border:`1.5px solid ${P.border}`, borderRadius:9, fontSize:12, fontFamily:"Georgia,serif", background:"#faf7f2", outline:"none", color:P.text, transition:"border 0.2s" }}
            onFocus={e=>e.target.style.borderColor=P.accent}
            onBlur={e=>e.target.style.borderColor=P.border}
          />
          <button onClick={()=>sendMessage()} disabled={loading||!input.trim()} style={{
            padding:"9px 18px",
            background: input.trim()
              ? "linear-gradient(135deg,#3d2b1a,#5c3d24)"
              : P.light,
            color: input.trim() ? "#f0d9b5" : P.muted,
            border:"none", borderRadius:9, fontSize:14, cursor:"pointer",
            transition:"all 0.2s", fontWeight:"bold"
          }}>→</button>
        </div>
      </div>
    </div>
  );
}

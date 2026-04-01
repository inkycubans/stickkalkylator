import { useState, useEffect, useRef } from "react";

const QUICK_QUESTIONS = [
  "Vad är raglan?",
  "Hur stickar jag ok?",
  "Tips på garn till tröja",
  "Vad är ease?",
  "Skillnad DK och Worsted?",
];

export default function Inspector({ results, bystPlagg }) {
  const [messages, setMessages] = useState([
    { role:"assistant", text:"Hej! Jag är din stickassistent. Fråga mig om tekniker, mönster, garn eller hur EPS-systemet fungerar! 🧶" }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey,  setApiKey]  = useState(() => localStorage.getItem("gemini_key") || "");
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
    const userMsg = (text || input).trim();
    if (!userMsg) return;
    if (!apiKey) { setShowKey(true); return; }

    setInput("");
    setMessages(prev => [...prev, { role:"user", text:userMsg }]);
    setLoading(true);

    const context = results ? `
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
          method: "POST",
          headers: { "Content-Type":"application/json" },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{ text:
                `Du är en erfaren stickningsassistent med djup kunskap om EPS (Elizabeth Zimmermanns procentmetod), raglan, yoke, drop shoulder, olika garnkvaliteter och sticktekniker. Svara på svenska, kort och praktiskt.
${context}
Fråga: ${userMsg}`
              }]
            }]
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
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"#fff" }}>

      {/* Header */}
      <div style={{ padding:"18px 16px 12px", borderBottom:"1px solid #ede8e0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:"0.25em", textTransform:"uppercase", color:"#9c8a6e", marginBottom:3 }}>Inspector</div>
          <div style={{ fontSize:20, fontWeight:"bold", color:"#2c2416" }}>AI-assistent</div>
          <div style={{ fontSize:11, color:"#9c8a6e", marginTop:2 }}>Gemini · Stickningsexpert</div>
        </div>
        <button onClick={() => setShowKey(!showKey)} style={{
          padding:"4px 10px", borderRadius:8, border:"1px solid #ddd6c8",
          background:"transparent", color:"#9c8a6e", fontSize:11, cursor:"pointer",
          fontFamily:"Georgia,serif"
        }}>🔑 API</button>
      </div>

      {/* API key */}
      {showKey && (
        <div style={{ margin:"10px 12px", padding:"12px", background:"#fdf6ec", borderRadius:8, border:"1px solid #e8d8c4" }}>
          <div style={{ fontSize:12, color:"#7a6a52", marginBottom:6 }}>Gemini API-nyckel:</div>
          <input type="password" value={apiKey}
            onChange={e => saveKey(e.target.value)}
            placeholder="AIza..."
            style={{ width:"100%", padding:"6px 8px", border:"1.5px solid #ddd6c8", borderRadius:6, fontSize:12, fontFamily:"Georgia,serif", background:"#fff", boxSizing:"border-box" }} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6 }}>
            <span style={{ fontSize:10, color:"#b0a090" }}>Sparas lokalt i din webbläsare</span>
            <button onClick={() => setShowKey(false)} style={{ padding:"3px 10px", background:"#c4a882", color:"#fff", border:"none", borderRadius:5, fontSize:11, cursor:"pointer" }}>Stäng</button>
          </div>
        </div>
      )}

      {/* Current calc context */}
      {results && (
        <div style={{ margin:"8px 12px 0", padding:"8px 10px", background:"#faf7f2", borderRadius:7, border:"1px solid #ede8e0" }}>
          <div style={{ fontSize:10, color:"#9c8a6e", marginBottom:4, letterSpacing:"0.1em", textTransform:"uppercase" }}>Aktuella värden</div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", fontSize:11, color:"#7a6a52" }}>
            <span>Byst <strong style={{ color:"#d4956a" }}>{results.byst.cm}cm</strong></span>
            <span>Hals <strong style={{ color:"#7aab8a" }}>{results.hals.cm}cm</strong></span>
            <span>Ärm <strong style={{ color:"#7a8fbb" }}>{results.overarm.cm}cm</strong></span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom:10, display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
            <div style={{
              maxWidth:"88%", padding:"9px 12px", borderRadius:10,
              background:m.role==="user"?"#2c2416":"#f0ebe3",
              color:m.role==="user"?"#fff":"#2c2416",
              fontSize:12, lineHeight:1.6,
              borderBottomRightRadius:m.role==="user"?2:10,
              borderBottomLeftRadius:m.role==="assistant"?2:10,
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", justifyContent:"flex-start", marginBottom:10 }}>
            <div style={{ padding:"9px 12px", borderRadius:10, background:"#f0ebe3", fontSize:12, color:"#9c8a6e" }}>
              Tänker...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div style={{ padding:"0 12px 8px", display:"flex", gap:4, flexWrap:"wrap" }}>
        {QUICK_QUESTIONS.map(q => (
          <button key={q} onClick={() => sendMessage(q)} style={{
            padding:"3px 8px", background:"#f0ebe3", border:"1px solid #ddd6c8",
            borderRadius:12, fontSize:10, color:"#7a6a52", cursor:"pointer",
            fontFamily:"Georgia,serif", transition:"all 0.15s"
          }}>{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding:"8px 12px 12px", borderTop:"1px solid #ede8e0" }}>
        {!apiKey && (
          <button onClick={() => setShowKey(true)} style={{
            width:"100%", padding:"7px 0", background:"#fdf6ec",
            border:"1.5px dashed #c4a882", borderRadius:8, color:"#9c8a6e",
            fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif", marginBottom:8
          }}>🔑 Ange Gemini API-nyckel för att aktivera assistenten</button>
        )}
        <div style={{ display:"flex", gap:6 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==="Enter" && !e.shiftKey && sendMessage()}
            placeholder="Fråga om tekniker, mönster, garn..."
            style={{ flex:1, padding:"8px 10px", border:"1.5px solid #ddd6c8", borderRadius:8, fontSize:12, fontFamily:"Georgia,serif", background:"#faf7f2" }} />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
            padding:"8px 16px",
            background:input.trim()?"#2c2416":"#ede8e0",
            color:input.trim()?"#fff":"#9c8a6e",
            border:"none", borderRadius:8, fontSize:13, cursor:"pointer",
            transition:"all 0.15s"
          }}>→</button>
        </div>
      </div>
    </div>
  );
}

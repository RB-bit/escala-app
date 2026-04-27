import { QUICK_PROMPTS } from "../../data/brands"

export default function CoachTab({ selectedBrand, messages, isTyping, input, setInput, sendMessage, messagesEndRef }) {
    if (!selectedBrand) return null
    return (
        <>
            <div style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.02em" }}>Coach IA</div>
            <div style={{ background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", height: "calc(100vh - 200px)" }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {QUICK_PROMPTS.map((p, i) => (
                        <button key={i} onClick={() => sendMessage(p)} style={{ fontFamily: "monospace", fontSize: "11px", padding: "5px 10px", background: "#13131f", border: "1px solid #252538", borderRadius: "4px", color: "#5a5a78", cursor: "pointer" }}>{p}</button>
                    ))}
                </div>
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "16px" }}>
                    {messages.map((m, i) => (
                        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0, background: m.role === "ai" ? "rgba(232,255,71,0.12)" : "rgba(196,123,255,0.12)", border: m.role === "ai" ? "1px solid rgba(232,255,71,0.2)" : "1px solid rgba(196,123,255,0.2)" }}>
                                {m.role === "ai" ? "⚡" : "👤"}
                            </div>
                            <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", lineHeight: "1.6", background: m.role === "ai" ? "#13131f" : "rgba(196,123,255,0.1)", border: m.role === "ai" ? "1px solid #1c1c2e" : "1px solid rgba(196,123,255,0.2)" }}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(232,255,71,0.12)", border: "1px solid rgba(232,255,71,0.2)" }}>⚡</div>
                            <div style={{ padding: "14px", background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "10px", display: "flex", gap: "4px" }}>
                                {[0, 1, 2].map(i => <div key={i} style={{ width: "6px", height: "6px", background: "#5a5a78", borderRadius: "50%", animation: `typing 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div style={{ display: "flex", gap: "10px", paddingTop: "16px", borderTop: "1px solid #1c1c2e" }}>
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder={`Preguntale sobre ${selectedBrand.name}...`} style={{ flex: 1, background: "#13131f", border: "1px solid #252538", borderRadius: "8px", padding: "10px 14px", color: "#f0f0f8", fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: "13px", outline: "none" }} />
                    <button onClick={() => sendMessage()} disabled={isTyping || !input.trim()} style={{ background: "#e8ff47", color: "#000", border: "none", borderRadius: "8px", padding: "10px 18px", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: "700", fontSize: "13px", cursor: "pointer", opacity: isTyping || !input.trim() ? 0.4 : 1 }}>Enviar</button>
                </div>
            </div>
        </>
    )
}

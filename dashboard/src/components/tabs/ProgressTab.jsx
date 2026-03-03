import { LEVELS } from "../../data/brands"

export default function ProgressTab() {
    return (
        <>
            <div style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.02em" }}>Mi Progreso</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "20px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#5a5a78", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>🗺️ Mapa de niveles</div>
                    {LEVELS.map((l, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 0", borderBottom: i < LEVELS.length - 1 ? "1px solid #1c1c2e" : "none" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", flexShrink: 0, background: l.completed ? "#e8ff47" : l.current ? "transparent" : "#13131f", border: l.current ? "2px solid #e8ff47" : "2px solid #252538", color: l.completed ? "#000" : l.current ? "#e8ff47" : "#5a5a78", boxShadow: l.current ? "0 0 0 4px rgba(232,255,71,0.1)" : "none" }}>
                                {l.completed ? "✓" : l.current ? "▶" : i + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "14px", fontWeight: "700", color: l.current ? "#e8ff47" : l.completed ? "#f0f0f8" : "#5a5a78" }}>{l.emoji} {l.name}</div>
                                <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78" }}>{l.range}</div>
                            </div>
                            {l.current && <div style={{ width: "80px" }}>
                                <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#e8ff47", textAlign: "right", marginBottom: "4px" }}>68%</div>
                                <div style={{ height: "4px", background: "#252538", borderRadius: "2px" }}><div style={{ height: "100%", width: "68%", background: "#e8ff47", borderRadius: "2px" }} /></div>
                            </div>}
                        </div>
                    ))}
                </div>
                <div style={{ background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "20px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#5a5a78", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>📊 Stats del nivel</div>
                    {[
                        { label: "Facturación acumulada", value: "$1.36M ARS", color: "#e8ff47" },
                        { label: "Para siguiente nivel", value: "$640K restantes", color: "#f0f0f8" },
                        { label: "Días en nivel actual", value: "23 días", color: "#f0f0f8" },
                        { label: "Tasa de crecimiento", value: "+34% mensual", color: "#47ffc8" },
                        { label: "Proyección próximo mes", value: "$1.82M ARS", color: "#c47bff" },
                    ].map((s, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1c1c2e" }}>
                            <span style={{ fontSize: "13px", color: "#5a5a78" }}>{s.label}</span>
                            <span style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: "700", color: s.color }}>{s.value}</span>
                        </div>
                    ))}
                    <div style={{ marginTop: "16px", padding: "12px", background: "rgba(232,255,71,0.05)", border: "1px solid rgba(232,255,71,0.15)", borderRadius: "6px" }}>
                        <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#e8ff47", marginBottom: "4px" }}>PRÓXIMO OBJETIVO</div>
                        <div style={{ fontSize: "13px" }}>Conectar Tienda Nube para desbloquear análisis de stock y subir al nivel Grower más rápido.</div>
                    </div>
                </div>
            </div>
        </>
    )
}

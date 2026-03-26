export default function Topbar({ selectedBrand, brands }) {
    const brandCount = (brands || []).length
    return (
        <div style={{ gridColumn: "1/-1", background: "#0e0e1a", borderBottom: "1px solid #1c1c2e", display: "flex", alignItems: "center", padding: "0 24px", gap: "16px" }}>
            <div style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "-0.04em" }}>ESCALA <span style={{ color: "#e8ff47" }}>⚡</span></div>
            <div style={{ width: "1px", height: "20px", background: "#252538", margin: "0 8px" }} />
            {selectedBrand && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid #1c1c2e", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: selectedBrand.color, flexShrink: 0 }} />
                    {selectedBrand.emoji} {selectedBrand.name}
                </div>
            )}
            {!selectedBrand && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 12px", background: "rgba(232,255,71,0.07)", border: "1px solid rgba(232,255,71,0.2)", borderRadius: "6px", fontSize: "13px", fontWeight: "600", color: "#e8ff47" }}>
                    📊 Vista Consolidada — {brandCount} marcas
                </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(232,255,71,0.08)", border: "1px solid rgba(232,255,71,0.2)", borderRadius: "6px", padding: "4px 12px", fontFamily: "monospace", fontSize: "12px", color: "#e8ff47", marginLeft: "auto" }}>
                <div style={{ width: "6px", height: "6px", background: "#e8ff47", borderRadius: "50%", animation: "blink 1.5s infinite" }} />
                Score: 72/100
            </div>
            <div style={{ fontFamily: "monospace", fontSize: "11px", padding: "4px 10px", background: "rgba(196,123,255,0.1)", border: "1px solid rgba(196,123,255,0.25)", borderRadius: "4px", color: "#c47bff" }}>PLAYER · Nivel 3</div>
        </div>
    )
}

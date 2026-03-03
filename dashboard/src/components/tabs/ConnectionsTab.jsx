export default function ConnectionsTab({ selectedBrand, connections }) {
    return (
        <>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.02em" }}>Conexiones</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: `${selectedBrand.color}12`, border: `1px solid ${selectedBrand.color}30`, borderRadius: "5px", fontSize: "12px", fontWeight: "600", color: selectedBrand.color }}>
                    {selectedBrand.emoji} {selectedBrand.name}
                </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
                {connections.map((c, i) => (
                    <div key={i} style={{ background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}><span style={{ fontSize: "20px" }}>{c.icon}</span>{c.name}</div>
                            <span style={{ fontFamily: "monospace", fontSize: "10px", padding: "3px 8px", borderRadius: "3px", background: c.status === "connected" ? "rgba(71,255,200,0.12)" : c.status === "pending" ? "rgba(232,255,71,0.12)" : "rgba(90,90,120,0.15)", color: c.status === "connected" ? "#47ffc8" : c.status === "pending" ? "#e8ff47" : "#5a5a78" }}>
                                {c.status === "connected" ? "✓ CONECTADO" : c.status === "pending" ? "⏳ PENDIENTE" : "○ DESCONECTADO"}
                            </span>
                        </div>
                        <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78" }}>{c.detail}</div>
                        <button style={{ fontFamily: "monospace", fontSize: "11px", padding: "6px 12px", borderRadius: "4px", border: c.status === "disconnected" ? "none" : "1px solid #252538", background: c.status === "disconnected" ? "#e8ff47" : "transparent", color: c.status === "disconnected" ? "#000" : "#5a5a78", cursor: "pointer", fontWeight: c.status === "disconnected" ? "700" : "400" }}>{c.action}</button>
                    </div>
                ))}
            </div>
        </>
    )
}

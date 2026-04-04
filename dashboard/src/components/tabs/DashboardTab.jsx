import { BRANDS } from "../../data/brands"

export default function DashboardTab({ selectedBrand }) {
    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.02em" }}>Mission Control</div>
                    <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", marginTop: "2px" }}>Domingo 01/03/2026 · Última actualización hace 2 min</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", background: `${selectedBrand.color}12`, border: `1px solid ${selectedBrand.color}30`, borderRadius: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: selectedBrand.color }} />
                    <span style={{ fontSize: "13px", fontWeight: "600", color: selectedBrand.color }}>{selectedBrand.emoji} {selectedBrand.name}</span>
                </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                {[
                    { label: "FACTURACIÓN HOY", value: selectedBrand?.stats?.billing || "—", change: "↑ +23% vs ayer", color: "#e8ff47", up: true },
                    { label: "ROAS PROMEDIO", value: selectedBrand?.stats?.roas || "—", change: "↑ +0.3 esta semana", color: "#47ffc8", up: true },
                    { label: "GASTO ADS HOY", value: selectedBrand?.stats?.spend || "—", change: "↑ +12% vs ayer", color: "#ff6b47", up: false },
                    { label: "CAMPAÑAS ACTIVAS", value: String(selectedBrand?.stats?.activeCampaigns || 0), change: "0 en learning phase", color: "#c47bff", up: null },
                ].map((s, i) => (
                    <div key={i} style={{ background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "16px 18px", borderTop: `2px solid ${s.color}` }}>
                        <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#5a5a78", marginBottom: "8px" }}>{s.label}</div>
                        <div style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "-0.03em", color: s.color, marginBottom: "4px" }}>{s.value}</div>
                        <div style={{ fontFamily: "monospace", fontSize: "11px", color: s.up === true ? "#47ffc8" : s.up === false ? "#ff6b47" : "#5a5a78" }}>{s.change}</div>
                    </div>
                ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "20px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#5a5a78", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>📋 Misiones activas</div>
                    {[
                        { text: "Revisá las campañas en Learning Phase", p: "alta", done: false },
                        { text: "Conectá Tienda Nube para ver tu stock", p: "media", done: false },
                        { text: `Escalar campaña top (ROAS ${selectedBrand?.campaigns?.length ? Math.max(...selectedBrand.campaigns.map(c => c.roas)) : 0}x)`, p: "alta", done: false },
                        { text: "Meta Ads conectado ✓", p: "done", done: !!selectedBrand?.meta_connections?.length },
                    ].map((m, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid #1c1c2e", opacity: m.done ? 0.4 : 1 }}>
                            <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: m.done ? "none" : "2px solid #252538", background: m.done ? "#47ffc8" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", flexShrink: 0 }}>{m.done ? "✓" : ""}</div>
                            <span style={{ fontSize: "13px", flex: 1, textDecoration: m.done ? "line-through" : "none" }}>{m.text}</span>
                            <span style={{ fontFamily: "monospace", fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: m.p === "alta" ? "rgba(255,107,71,0.12)" : m.p === "done" ? "rgba(71,255,200,0.12)" : "rgba(90,90,120,0.15)", color: m.p === "alta" ? "#ff6b47" : m.p === "done" ? "#47ffc8" : "#5a5a78" }}>{m.p}</span>
                        </div>
                    ))}
                </div>
                <div style={{ background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "20px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#5a5a78", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>🏆 Logros recientes</div>
                    {[
                        { icon: "🔗", text: "Meta Ads conectado", sub: "Hace 2 horas", isNew: true },
                        { icon: "⚡", text: "ROAS supera 4x por 7 días", sub: "Hace 3 días", isNew: false },
                        { icon: "📈", text: "Primer millón del mes", sub: "Hace 5 días", isNew: false },
                        { icon: "🛍️", text: "50 órdenes en un día", sub: "Hace 1 semana", isNew: false },
                    ].map((a, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid #1c1c2e" }}>
                            <div style={{ fontSize: "20px", width: "32px", textAlign: "center" }}>{a.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "13px", fontWeight: "600" }}>{a.text}</div>
                                <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#5a5a78" }}>{a.sub}</div>
                            </div>
                            {a.isNew && <span style={{ fontFamily: "monospace", fontSize: "9px", padding: "2px 6px", borderRadius: "3px", background: "rgba(232,255,71,0.15)", color: "#e8ff47" }}>NEW</span>}
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

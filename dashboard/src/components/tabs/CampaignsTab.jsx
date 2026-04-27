export default function CampaignsTab({ selectedBrand, campaigns }) {
    if (!selectedBrand) return null
    return (
        <>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.02em" }}>Campañas Meta Ads</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: `${selectedBrand.color}12`, border: `1px solid ${selectedBrand.color}30`, borderRadius: "5px", fontSize: "12px", fontWeight: "600", color: selectedBrand.color }}>
                    {selectedBrand.emoji} {selectedBrand.name}
                </div>
            </div>
            <div style={{ background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "20px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>{["CAMPAÑA", "ESTADO", "PRESUPUESTO", "GASTADO", "ROAS", "IMPRESIONES"].map(h => <th key={h} style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.1em", color: "#5a5a78", textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #1c1c2e" }}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        {campaigns.map((c, i) => (
                            <tr key={i}>
                                <td style={{ padding: "12px", fontSize: "13px", fontWeight: "600", borderBottom: "1px solid #1c1c2e" }}>{c.name}</td>
                                <td style={{ padding: "12px", borderBottom: "1px solid #1c1c2e" }}>
                                    <span style={{ fontFamily: "monospace", fontSize: "10px", padding: "3px 8px", borderRadius: "3px", background: c.status === "active" ? "rgba(71,255,200,0.12)" : c.status === "learning" ? "rgba(232,255,71,0.12)" : "rgba(90,90,120,0.2)", color: c.status === "active" ? "#47ffc8" : c.status === "learning" ? "#e8ff47" : "#5a5a78" }}>
                                        {c.status === "active" ? "● ACTIVA" : c.status === "learning" ? "◐ LEARNING" : "○ PAUSADA"}
                                    </span>
                                </td>
                                <td style={{ padding: "12px", fontFamily: "monospace", fontSize: "12px", borderBottom: "1px solid #1c1c2e" }}>{c.budget}</td>
                                <td style={{ padding: "12px", fontFamily: "monospace", fontSize: "12px", borderBottom: "1px solid #1c1c2e" }}>{c.spent}</td>
                                <td style={{ padding: "12px", borderBottom: "1px solid #1c1c2e" }}>
                                    <span style={{ fontFamily: "monospace", fontSize: "12px", color: c.roas >= 4 ? "#47ffc8" : c.roas >= 2 ? "#e8ff47" : "#ff6b47" }}>{c.roas}x</span>
                                </td>
                                <td style={{ padding: "12px", fontFamily: "monospace", fontSize: "12px", color: "#5a5a78", borderBottom: "1px solid #1c1c2e" }}>{c.impressions}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

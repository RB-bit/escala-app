import { BRANDS } from "../data/brands"

export default function Sidebar({ selectedBrand, activeTab, isConsolidated, selectBrand, setActiveTab, nav }) {
    return (
        <div style={{ background: "#0e0e1a", borderRight: "1px solid #1c1c2e", padding: "20px 0", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>

            {/* BRAND SELECTOR */}
            <div style={{ padding: "4px 16px 12px", borderBottom: "1px solid #1c1c2e", marginBottom: "8px" }}>
                <div style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.15em", color: "#3a3a55", padding: "4px 4px 8px" }}>MARCAS</div>

                {/* Consolidated option */}
                <div
                    onClick={() => selectBrand(null)}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 8px", borderRadius: "6px", cursor: "pointer", background: isConsolidated ? "rgba(232,255,71,0.08)" : "transparent", border: isConsolidated ? "1px solid rgba(232,255,71,0.2)" : "1px solid transparent", marginBottom: "2px", transition: "all 0.15s" }}
                >
                    <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: "linear-gradient(135deg,#e8ff47,#47ffc8,#c47bff)", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: isConsolidated ? "#e8ff47" : "#5a5a78", flex: 1 }}>Todas las marcas</span>
                    <span style={{ fontFamily: "monospace", fontSize: "9px", padding: "2px 5px", borderRadius: "3px", background: "rgba(90,90,120,0.2)", color: "#5a5a78" }}>{BRANDS.length}</span>
                </div>

                {/* Individual brands */}
                {BRANDS.map(brand => (
                    <div
                        key={brand.id}
                        onClick={() => selectBrand(brand)}
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 8px", borderRadius: "6px", cursor: "pointer", background: selectedBrand?.id === brand.id ? "rgba(255,255,255,0.05)" : "transparent", border: selectedBrand?.id === brand.id ? `1px solid ${brand.color}30` : "1px solid transparent", marginBottom: "2px", transition: "all 0.15s" }}
                    >
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: brand.color, flexShrink: 0, boxShadow: selectedBrand?.id === brand.id ? `0 0 6px ${brand.color}80` : "none" }} />
                        <span style={{ fontSize: "12px", fontWeight: "600", color: selectedBrand?.id === brand.id ? brand.color : "#5a5a78", flex: 1 }}>{brand.emoji} {brand.name}</span>
                        <span style={{ fontFamily: "monospace", fontSize: "9px", padding: "2px 5px", borderRadius: "3px", background: `${brand.color}15`, color: brand.color }}>{brand.campaigns.filter(c => c.status === "active").length}▲</span>
                    </div>
                ))}
            </div>

            {/* NAV */}
            <div style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.15em", color: "#3a3a55", padding: "8px 20px 4px" }}>NAVEGACIÓN</div>
            {nav.map(item => (
                <div
                    key={item.id}
                    onClick={() => {
                        if (item.id === "consolidated") { selectBrand(null); return }
                        if (isConsolidated && item.id !== "consolidated") setActiveTab(item.id)
                        setActiveTab(item.id)
                    }}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 20px", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: activeTab === item.id && (!isConsolidated || item.id === "consolidated") ? "#f0f0f8" : "#5a5a78", background: activeTab === item.id && (!isConsolidated || item.id === "consolidated") ? "rgba(255,255,255,0.05)" : "transparent", borderLeft: activeTab === item.id && (!isConsolidated || item.id === "consolidated") ? "2px solid #e8ff47" : "2px solid transparent", transition: "all 0.15s" }}
                >
                    <span style={{ width: "20px", textAlign: "center" }}>{item.icon}</span>
                    {item.label}
                    {item.badge && <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: "10px", padding: "2px 6px", borderRadius: "3px", background: "rgba(232,255,71,0.15)", color: "#e8ff47" }}>{item.badge}</span>}
                </div>
            ))}
        </div>
    )
}

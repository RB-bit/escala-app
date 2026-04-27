import { useState } from "react"
import { createBrand } from "../../lib/brandsService"
import TeamSection from "../TeamSection"

export default function ConnectionsTab({ selectedBrand, connections, refreshBrands }) {
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({ slug: "", name: "", emoji: "🚀", color: "#e8ff47" })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await createBrand(formData)
            setShowModal(false)
            setFormData({ slug: "", name: "", emoji: "🚀", color: "#e8ff47" })
            if (refreshBrands) refreshBrands()
        } catch (err) {
            alert("Error al crear marca: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.02em" }}>Conexiones</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: `${selectedBrand.color}12`, border: `1px solid ${selectedBrand.color}30`, borderRadius: "5px", fontSize: "12px", fontWeight: "600", color: selectedBrand.color }}>
                        {selectedBrand.emoji} {selectedBrand.name}
                    </div>
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

            <TeamSection brand={selectedBrand} />

            {showModal && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "12px", padding: "24px", width: "400px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                        <div style={{ fontSize: "20px", fontWeight: "800", marginBottom: "20px" }}>Nueva Marca</div>
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "12px", color: "#5a5a78", fontFamily: "monospace" }}>NOMBRE</label>
                                <input 
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="Ej: Onafit"
                                    style={{ background: "#080810", border: "1px solid #1c1c2e", borderRadius: "6px", padding: "10px", color: "#f0f0f8" }}
                                />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "12px", color: "#5a5a78", fontFamily: "monospace" }}>SLUG (URL)</label>
                                <input 
                                    required
                                    value={formData.slug}
                                    onChange={e => setFormData({...formData, slug: e.target.value})}
                                    placeholder="ej-onafit"
                                    style={{ background: "#080810", border: "1px solid #1c1c2e", borderRadius: "6px", padding: "10px", color: "#f0f0f8" }}
                                />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "12px", color: "#5a5a78", fontFamily: "monospace" }}>EMOJI</label>
                                    <input 
                                        value={formData.emoji}
                                        onChange={e => setFormData({...formData, emoji: e.target.value})}
                                        style={{ background: "#080810", border: "1px solid #1c1c2e", borderRadius: "6px", padding: "10px", color: "#f0f0f8", textAlign: "center" }}
                                    />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "12px", color: "#5a5a78", fontFamily: "monospace" }}>COLOR</label>
                                    <input 
                                        type="color"
                                        value={formData.color}
                                        onChange={e => setFormData({...formData, color: e.target.value})}
                                        style={{ background: "#080810", border: "1px solid #1c1c2e", borderRadius: "6px", padding: "4px", color: "#f0f0f8", width: "100%", height: "42px", cursor: "pointer" }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ flex: 1, background: "transparent", border: "1px solid #252538", color: "#5a5a78", borderRadius: "6px", padding: "10px", fontWeight: "600", cursor: "pointer" }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    disabled={loading}
                                    type="submit"
                                    style={{ flex: 1, background: "#e8ff47", border: "none", color: "#000", borderRadius: "6px", padding: "10px", fontWeight: "800", cursor: "pointer" }}
                                >
                                    {loading ? "Creando..." : "Crear Marca"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

import { useState, useRef, useEffect } from "react"

// ─── BRAND DATA ────────────────────────────────────────────────────────────────
const BRANDS = [
  {
    id: "soy-rica",
    name: "Soy Rica",
    color: "#e8ff47",
    emoji: "🌺",
    metaAccounts: ["act_463270068395656"],
    tiendaNubeStores: [{ id: "sr_001", name: "soyrica.com.ar", status: "disconnected" }],
    users: ["camila@soyrica.com"],
    campaigns: [
      { name: "CBO - NAVIDAD 3/12/25", status: "active", budget: "$175.000", spent: "$156.000", roas: 5.8, impressions: "310K" },
      { name: "CBO - HOT SALE Mayo", status: "paused", budget: "$120.000", spent: "$120.000", roas: 4.1, impressions: "220K" },
      { name: "Retargeting — Carrito Abandonado", status: "active", budget: "$30.000", spent: "$22.000", roas: 7.2, impressions: "41K" },
    ],
    connections: [
      { name: "Meta Ads", icon: "📣", status: "connected", detail: "1 cuenta · 3 campañas activas", action: "Configurar" },
      { name: "Tienda Nube", icon: "🛍️", status: "disconnected", detail: "No conectado aún", action: "Conectar" },
      { name: "Google Ads", icon: "🔍", status: "pending", detail: "Pendiente de credenciales", action: "Conectar" },
      { name: "Google Drive", icon: "📁", status: "disconnected", detail: "No conectado", action: "Conectar" },
      { name: "Claude AI", icon: "🤖", status: "connected", detail: "Claude Sonnet 4.6 · Activo", action: "Configurar" },
      { name: "Shopify", icon: "🛒", status: "disconnected", detail: "No prioritario — Fase 03", action: "Conectar" },
    ],
    stats: { billing: "$847K", roas: "5.8x", spend: "$156K", activeCampaigns: 3 },
  },
  {
    id: "cavaliery",
    name: "Cavaliery",
    color: "#47ffc8",
    emoji: "👕",
    metaAccounts: ["act_1768818740001752"],
    tiendaNubeStores: [{ id: "cav_001", name: "cavaliery.com.ar", status: "disconnected" }],
    users: ["admin@cavaliery.com"],
    campaigns: [
      { name: "3x2 Marzo 🔥", status: "active", budget: "$60.000", spent: "$12.000", roas: 3.1, impressions: "88K" },
      { name: "Todo x $10.000", status: "active", budget: "$85.000", spent: "$71.000", roas: 4.4, impressions: "195K" },
      { name: "Mensajes Mayorista SS2026", status: "active", budget: "$6.000", spent: "$3.660", roas: 2.8, impressions: "29K" },
      { name: "VENTAS COMPRAS 2025", status: "active", budget: "$10.000", spent: "$0", roas: 0, impressions: "—" },
      { name: "Black Friday Remanente", status: "paused", budget: "$50.000", spent: "$50.000", roas: 5.1, impressions: "340K" },
    ],
    connections: [
      { name: "Meta Ads", icon: "📣", status: "connected", detail: "1 cuenta · 4 campañas activas", action: "Configurar" },
      { name: "Tienda Nube", icon: "🛍️", status: "disconnected", detail: "No conectado aún", action: "Conectar" },
      { name: "Google Ads", icon: "🔍", status: "disconnected", detail: "No conectado", action: "Conectar" },
      { name: "Google Drive", icon: "📁", status: "disconnected", detail: "No conectado", action: "Conectar" },
      { name: "Claude AI", icon: "🤖", status: "connected", detail: "Claude Sonnet 4.6 · Activo", action: "Configurar" },
      { name: "Shopify", icon: "🛒", status: "disconnected", detail: "No prioritario — Fase 03", action: "Conectar" },
    ],
    stats: { billing: "$1.2M", roas: "4.4x", spend: "$161K", activeCampaigns: 4 },
  },
  {
    id: "mamayoquiero",
    name: "MamaYoQuiero",
    color: "#c47bff",
    emoji: "👶",
    metaAccounts: ["act_177441357565547"],
    tiendaNubeStores: [{ id: "myq_001", name: "mamayoquiero.com.ar", status: "disconnected" }],
    users: ["hola@mamayoquiero.com"],
    campaigns: [
      { name: "CBO - Base - 45K/DÍA", status: "active", budget: "$165.000", spent: "$142.000", roas: 6.1, impressions: "284K" },
      { name: "CBO - DEEPOCKET 18/08", status: "active", budget: "$25.000", spent: "$20.897", roas: 3.9, impressions: "67K" },
      { name: "CBO - TEST ADS - (7/08) - 28k/day", status: "active", budget: "$23.500", spent: "$18.685", roas: 2.7, impressions: "43K" },
      { name: "CBO - TEST ADS - V2 (19/07)", status: "learning", budget: "$16.500", spent: "$15.157", roas: 1.9, impressions: "38K" },
      { name: "Catalogo OCT 24 - SEG PUBLICO", status: "paused", budget: "$16.500", spent: "$13.607", roas: 4.2, impressions: "112K" },
    ],
    connections: [
      { name: "Meta Ads", icon: "📣", status: "connected", detail: "1 cuenta · 4 campañas activas", action: "Configurar" },
      { name: "Tienda Nube", icon: "🛍️", status: "disconnected", detail: "No conectado aún", action: "Conectar" },
      { name: "Google Ads", icon: "🔍", status: "pending", detail: "Pendiente de credenciales", action: "Conectar" },
      { name: "Google Drive", icon: "📁", status: "connected", detail: "Reportes sincronizados", action: "Configurar" },
      { name: "Claude AI", icon: "🤖", status: "connected", detail: "Claude Sonnet 4.6 · Activo", action: "Configurar" },
      { name: "Shopify", icon: "🛒", status: "disconnected", detail: "No prioritario — Fase 03", action: "Conectar" },
    ],
    stats: { billing: "$2.1M", roas: "6.1x", spend: "$230K", activeCampaigns: 4 },
  },
]

const LEVELS = [
  { name: "Rookie", range: "$0 — $100K", emoji: "🌱", completed: true },
  { name: "Starter", range: "$100K — $500K", emoji: "🔥", completed: true },
  { name: "Player", range: "$500K — $2M", emoji: "⚡", current: true, progress: 68 },
  { name: "Grower", range: "$2M — $10M", emoji: "🚀", completed: false },
  { name: "Scaler", range: "$10M — $50M", emoji: "💎", completed: false },
  { name: "Legend", range: "$50M — $100M+", emoji: "👑", completed: false },
]

const INITIAL_MESSAGES = [
  { role: "ai", content: "¡Hola! Soy tu coach IA de ESCALA. Estoy conectado a tus campañas de Meta Ads. ¿En qué te puedo ayudar hoy?" },
]

const QUICK_PROMPTS = [
  "¿Cuál es mi mejor campaña?",
  "Analizá mis campañas en Learning Phase",
  "¿Cómo mejoro mi ROAS?",
  "Generá reporte semanal",
]

const TN_TOKEN = "28d21111011b71080d5668a9155619bb5f52c531"
const TN_STORE_ID = "2091475"
const TN_BASE = `https://api.tiendanube.com/2025-03/${TN_STORE_ID}`
const TN_HEADERS = {
  "Authentication": `bearer ${TN_TOKEN}`,
  "User-Agent": "ESCALA (hola@escala.app)",
  "Content-Type": "application/json",
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedBrand, setSelectedBrand] = useState(BRANDS[0])
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  // ── Tienda Nube state ──
  const [tnLoading, setTnLoading] = useState(false)
  const [tnError, setTnError] = useState(null)
  const [tnOrders, setTnOrders] = useState([])
  const [tnProducts, setTnProducts] = useState([])
  const [tnStore, setTnStore] = useState(null)
  const [tnFetched, setTnFetched] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const isConsolidated = selectedBrand === null
  const campaigns = isConsolidated ? [] : (selectedBrand?.campaigns ?? [])
  const connections = isConsolidated ? [] : (selectedBrand?.connections ?? [])

  const selectBrand = (brand) => {
    setSelectedBrand(brand)
    if (brand === null) setActiveTab("consolidated")
    else if (activeTab === "consolidated") setActiveTab("dashboard")
  }

  // ── Tienda Nube fetch ──
  const fetchTiendaNube = async () => {
    if (tnLoading) return
    setTnLoading(true)
    setTnError(null)
    try {
      const today = new Date().toISOString().split("T")[0]
      const monthStart = today.slice(0, 7) + "-01"

      const [ordersRes, productsRes, storeRes] = await Promise.all([
        fetch(`${TN_BASE}/orders?per_page=20&fields=id,number,customer,total,payment_status,created_at`, { headers: TN_HEADERS }),
        fetch(`${TN_BASE}/products?per_page=50&fields=id,name,price,stock_management,variants`, { headers: TN_HEADERS }),
        fetch(`${TN_BASE}/store`, { headers: TN_HEADERS }),
      ])

      if (!ordersRes.ok) throw new Error(`Orders API: ${ordersRes.status}`)
      if (!productsRes.ok) throw new Error(`Products API: ${productsRes.status}`)
      if (!storeRes.ok) throw new Error(`Store API: ${storeRes.status}`)

      const [orders, products, store] = await Promise.all([
        ordersRes.json(),
        productsRes.json(),
        storeRes.json(),
      ])

      setTnOrders(Array.isArray(orders) ? orders : [])
      setTnProducts(Array.isArray(products) ? products : [])
      setTnStore(store)
      setTnFetched(true)
    } catch (err) {
      setTnError(err.message)
    } finally {
      setTnLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "tiendanube" && !tnFetched && !tnLoading) {
      fetchTiendaNube()
    }
  }, [activeTab])

  const sendMessage = async (text) => {
    const msg = text || input
    if (!msg.trim()) return
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: msg }])
    setIsTyping(true)
    const brandCtx = selectedBrand
      ? `Marca activa: ${selectedBrand.name}. Campañas: ${selectedBrand.campaigns.map(c => c.name + " ROAS " + c.roas + "x estado " + c.status).join(", ")}.`
      : `Modo multi-marca con ${BRANDS.length} marcas: ${BRANDS.map(b => b.name).join(", ")}.`
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Sos el coach IA de ESCALA, una app gamificada para emprendedores argentinos de e-commerce. Tu objetivo es ayudar a los usuarios a escalar sus ventas de $0 a $100 millones de pesos argentinos. Respondé siempre en español, de forma concisa y accionable. ${brandCtx}`,
          messages: [{ role: "user", content: msg }]
        })
      })
      const data = await response.json()
      const reply = data.content?.[0]?.text || "No pude procesar tu consulta."
      setMessages(prev => [...prev, { role: "ai", content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: "ai", content: "Error de conexión. Verificá tu internet." }])
    }
    setIsTyping(false)
  }

  const nav = [
    { id: "consolidated", icon: "📊", label: "Todas las marcas" },
    { id: "dashboard", icon: "⚡", label: "Dashboard" },
    { id: "campaigns", icon: "📈", label: "Campañas", badge: isConsolidated ? null : String(campaigns.filter(c => c.status === "active").length) },
    { id: "tiendanube", icon: "🛍️", label: "Tienda Nube", badge: tnFetched ? String(tnOrders.length) : null },
    { id: "connections", icon: "🔗", label: "Conexiones", badge: isConsolidated ? null : `${connections.filter(c => c.status === "connected").length}/${connections.length}` },
    { id: "progress", icon: "🗺️", label: "Mi Progreso" },
    { id: "chat", icon: "🤖", label: "Coach IA" },
  ]

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gridTemplateRows: "56px 1fr", height: "100vh", background: "#080810", color: "#f0f0f8", fontFamily: "'Bricolage Grotesque',sans-serif", overflow: "hidden" }}>

      {/* TOPBAR */}
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
            📊 Vista Consolidada — {BRANDS.length} marcas
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(232,255,71,0.08)", border: "1px solid rgba(232,255,71,0.2)", borderRadius: "6px", padding: "4px 12px", fontFamily: "monospace", fontSize: "12px", color: "#e8ff47", marginLeft: "auto" }}>
          <div style={{ width: "6px", height: "6px", background: "#e8ff47", borderRadius: "50%", animation: "blink 1.5s infinite" }} />
          Score: 72/100
        </div>
        <div style={{ fontFamily: "monospace", fontSize: "11px", padding: "4px 10px", background: "rgba(196,123,255,0.1)", border: "1px solid rgba(196,123,255,0.25)", borderRadius: "4px", color: "#c47bff" }}>PLAYER · Nivel 3</div>
      </div>

      {/* SIDEBAR */}
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
              if (isConsolidated && item.id !== "consolidated") setSelectedBrand(BRANDS[0])
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

      {/* MAIN */}
      <div style={{ overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* ── CONSOLIDATED VIEW ── */}
        {isConsolidated && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.02em" }}>📊 Vista Consolidada</div>
                <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", marginTop: "2px" }}>Domingo 01/03/2026 · {BRANDS.length} marcas activas</div>
              </div>
            </div>

            {/* Aggregate KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
              {[
                { label: "FACTURACIÓN TOTAL HOY", value: "$4.14M", change: "↑ +18% vs ayer", color: "#e8ff47", up: true },
                { label: "ROAS PROMEDIO", value: "5.4x", change: "↑ +0.6 esta semana", color: "#47ffc8", up: true },
                { label: "GASTO ADS TOTAL HOY", value: "$547K", change: "↑ +9% vs ayer", color: "#ff6b47", up: false },
                { label: "CAMPAÑAS ACTIVAS", value: String(BRANDS.reduce((a, b) => a + b.campaigns.filter(c => c.status === "active").length, 0)), change: `en ${BRANDS.length} marcas`, color: "#c47bff", up: null },
              ].map((s, i) => (
                <div key={i} style={{ background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "16px 18px", borderTop: `2px solid ${s.color}` }}>
                  <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#5a5a78", marginBottom: "8px" }}>{s.label}</div>
                  <div style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "-0.03em", color: s.color, marginBottom: "4px" }}>{s.value}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "11px", color: s.up === true ? "#47ffc8" : s.up === false ? "#ff6b47" : "#5a5a78" }}>{s.change}</div>
                </div>
              ))}
            </div>

            {/* Brand cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
              {BRANDS.map(brand => {
                const active = brand.campaigns.filter(c => c.status === "active")
                const avgRoas = active.length ? (active.reduce((a, c) => a + c.roas, 0) / active.length).toFixed(1) : "—"
                const connCount = brand.connections.filter(c => c.status === "connected").length
                return (
                  <div
                    key={brand.id}
                    onClick={() => selectBrand(brand)}
                    style={{ background: "#0e0e1a", border: `1px solid ${brand.color}30`, borderRadius: "10px", padding: "20px", cursor: "pointer", transition: "all 0.2s", borderTop: `3px solid ${brand.color}` }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: `${brand.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{brand.emoji}</div>
                      <div>
                        <div style={{ fontWeight: "800", fontSize: "15px" }}>{brand.name}</div>
                        <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#5a5a78" }}>{brand.metaAccounts.length} cuenta Meta</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                      {[
                        { label: "FACTURACIÓN", value: brand.stats.billing, color: brand.color },
                        { label: "ROAS MED.", value: String(avgRoas) + "x", color: "#47ffc8" },
                        { label: "CAMPAÑAS ▲", value: String(active.length), color: "#f0f0f8" },
                        { label: "CONEXIONES", value: `${connCount}/${brand.connections.length}`, color: "#5a5a78" },
                      ].map((s, i) => (
                        <div key={i} style={{ background: "#13131f", borderRadius: "6px", padding: "10px 12px" }}>
                          <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#5a5a78", marginBottom: "4px" }}>{s.label}</div>
                          <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "700", color: s.color }}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: "11px", color: brand.color, display: "flex", alignItems: "center", gap: "6px" }}>
                      Ver detalle →
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ── DASHBOARD ── */}
        {activeTab === "dashboard" && !isConsolidated && <>
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
              { label: "FACTURACIÓN HOY", value: selectedBrand.stats.billing, change: "↑ +23% vs ayer", color: "#e8ff47", up: true },
              { label: "ROAS PROMEDIO", value: selectedBrand.stats.roas, change: "↑ +0.3 esta semana", color: "#47ffc8", up: true },
              { label: "GASTO ADS HOY", value: selectedBrand.stats.spend, change: "↑ +12% vs ayer", color: "#ff6b47", up: false },
              { label: "CAMPAÑAS ACTIVAS", value: String(selectedBrand.stats.activeCampaigns), change: "3 en learning phase", color: "#c47bff", up: null },
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
                { text: `Escalar campaña top (ROAS ${Math.max(...selectedBrand.campaigns.map(c => c.roas))}x)`, p: "alta", done: false },
                { text: "Meta Ads conectado ✓", p: "done", done: true },
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
        </>}

        {/* ── TIENDA NUBE ── */}
        {activeTab === "tiendanube" && !isConsolidated && (() => {
          // ── Derived metrics ──
          const totalOrders = tnOrders.length
          const totalRevenue = tnOrders.reduce((s, o) => s + parseFloat(o.total || 0), 0)
          const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

          // Products with stock
          const productsWithStock = tnProducts.map(p => {
            const allVariants = p.variants || []
            const totalStock = allVariants.reduce((s, v) => s + (parseInt(v.stock, 10) || 0), 0)
            const price = allVariants.length > 0 ? parseFloat(allVariants[0].price) : parseFloat(p.price || 0)
            const isLowStock = totalStock < 5
            return { id: p.id, name: typeof p.name === "object" ? (p.name.es || p.name.pt || Object.values(p.name)[0]) : p.name, price, stock: totalStock, isLowStock }
          })

          // Health score: 0–100
          const lowStockCount = productsWithStock.filter(p => p.isLowStock).length
          const stockRatio = productsWithStock.length > 0 ? 1 - lowStockCount / productsWithStock.length : 1
          const salesVelocity = Math.min(totalOrders / 20, 1) // 20 orders = full score
          const healthScore = Math.round((stockRatio * 60 + salesVelocity * 40) * 100) / 100
          const healthColor = healthScore >= 70 ? "#47ffc8" : healthScore >= 40 ? "#e8ff47" : "#ff6b47"
          const healthLabel = healthScore >= 70 ? "Excelente" : healthScore >= 40 ? "Regular" : "Crítico"

          const fmtARS = (n) => `$${Math.round(n).toLocaleString("es-AR")}`

          return (
            <>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.02em" }}>🛍️ Tienda Nube</div>
                  <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", marginTop: "2px" }}>
                    {tnStore ? `${tnStore.name || "Mi Tienda"} · ID ${TN_STORE_ID}` : `ID ${TN_STORE_ID}`}
                  </div>
                </div>
                <button
                  onClick={fetchTiendaNube}
                  disabled={tnLoading}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "transparent", border: "1px solid #252538", borderRadius: "6px", color: tnLoading ? "#5a5a78" : "#f0f0f8", fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: "12px", cursor: tnLoading ? "wait" : "pointer", transition: "all 0.15s" }}
                >
                  {tnLoading ? "⟳ Actualizando…" : "↻ Actualizar"}
                </button>
              </div>

              {/* Error */}
              {tnError && (
                <div style={{ padding: "14px 18px", background: "rgba(255,107,71,0.08)", border: "1px solid rgba(255,107,71,0.3)", borderRadius: "8px", fontFamily: "monospace", fontSize: "12px", color: "#ff6b47" }}>
                  ⚠ Error al conectar con la API: {tnError}
                </div>
              )}

              {/* Loading skeleton */}
              {tnLoading && !tnFetched && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{ background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "16px 18px", height: "80px", animation: "pulse 1.5s ease-in-out infinite" }} />
                  ))}
                </div>
              )}

              {/* ── KPI SUMMARY ── */}
              {(tnFetched || !tnLoading) && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                  {[
                    { label: "ÓRDENES TOTALES", value: tnFetched ? String(totalOrders) : "—", color: "#e8ff47" },
                    { label: "REVENUE TOTAL", value: tnFetched ? fmtARS(totalRevenue) : "—", color: "#47ffc8" },
                    { label: "TICKET PROMEDIO", value: tnFetched ? fmtARS(avgOrderValue) : "—", color: "#c47bff" },
                    { label: "SALUD DE TIENDA", value: tnFetched ? `${Math.round(healthScore)}/100` : "—", color: healthColor },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "16px 18px", borderTop: `2px solid ${s.color}` }}>
                      <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#5a5a78", marginBottom: "8px" }}>{s.label}</div>
                      <div style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "-0.03em", color: s.color, marginBottom: "4px" }}>
                        {tnLoading && !tnFetched ? <span style={{ opacity: 0.3 }}>…</span> : s.value}
                      </div>
                      {i === 3 && tnFetched && <div style={{ fontFamily: "monospace", fontSize: "11px", color: healthColor }}>{healthLabel}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* ── HEALTH SCORE BAR ── */}
              {tnFetched && (
                <div style={{ background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#f0f0f8" }}>📊 Score de Salud de Tienda</div>
                    <div style={{ fontFamily: "monospace", fontSize: "24px", fontWeight: "800", color: healthColor }}>{Math.round(healthScore)}<span style={{ fontSize: "14px", color: "#5a5a78" }}>/100</span></div>
                  </div>
                  <div style={{ height: "10px", background: "#13131f", borderRadius: "5px", overflow: "hidden", marginBottom: "12px" }}>
                    <div style={{ height: "100%", width: `${healthScore}%`, background: `linear-gradient(90deg, ${healthColor}80, ${healthColor})`, borderRadius: "5px", transition: "width 0.6s ease" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    {[
                      { label: "Stock saludable", value: `${productsWithStock.filter(p => !p.isLowStock).length} productos`, icon: "📦", color: "#47ffc8" },
                      { label: "Stock bajo (<5)", value: `${lowStockCount} productos`, icon: "⚠️", color: "#ff6b47" },
                      { label: "Velocidad de ventas", value: `${totalOrders} órdenes recientes`, icon: "🚀", color: "#c47bff" },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: "12px", background: "#13131f", borderRadius: "6px", border: `1px solid ${item.color}20` }}>
                        <div style={{ fontSize: "18px", marginBottom: "4px" }}>{item.icon}</div>
                        <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#5a5a78", marginBottom: "4px" }}>{item.label}</div>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: item.color }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── PRODUCTS TABLE ── */}
              {tnFetched && productsWithStock.length > 0 && (
                <div style={{ background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "20px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#f0f0f8", marginBottom: "16px" }}>📦 Productos ({productsWithStock.length})</div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>{["PRODUCTO", "PRECIO", "STOCK", "ESTADO"].map(h => (
                          <th key={h} style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.1em", color: "#5a5a78", textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #1c1c2e" }}>{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {productsWithStock.slice(0, 20).map((p, i) => (
                          <tr key={p.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                            <td style={{ padding: "11px 12px", fontSize: "13px", fontWeight: "500", borderBottom: "1px solid #1c1c2e", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
                            <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: "12px", color: "#47ffc8", borderBottom: "1px solid #1c1c2e" }}>{fmtARS(p.price)}</td>
                            <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: "12px", borderBottom: "1px solid #1c1c2e", color: p.isLowStock ? "#ff6b47" : "#f0f0f8" }}>{p.stock}</td>
                            <td style={{ padding: "11px 12px", borderBottom: "1px solid #1c1c2e" }}>
                              {p.isLowStock
                                ? <span style={{ fontFamily: "monospace", fontSize: "10px", padding: "3px 8px", borderRadius: "3px", background: "rgba(255,107,71,0.15)", color: "#ff6b47" }}>⚠ STOCK BAJO</span>
                                : <span style={{ fontFamily: "monospace", fontSize: "10px", padding: "3px 8px", borderRadius: "3px", background: "rgba(71,255,200,0.1)", color: "#47ffc8" }}>✓ OK</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── ORDERS TABLE ── */}
              {tnFetched && tnOrders.length > 0 && (
                <div style={{ background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "20px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#f0f0f8", marginBottom: "16px" }}>🧾 Órdenes Recientes ({totalOrders})</div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>{["N° ORDEN", "CLIENTE", "TOTAL", "PAGO", "FECHA"].map(h => (
                          <th key={h} style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.1em", color: "#5a5a78", textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #1c1c2e" }}>{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {tnOrders.slice(0, 15).map((o, i) => {
                          const payStatus = o.payment_status || "pending"
                          const payColor = payStatus === "paid" ? "#47ffc8" : payStatus === "pending" ? "#e8ff47" : "#ff6b47"
                          const payLabel = payStatus === "paid" ? "✓ PAGADO" : payStatus === "pending" ? "⏳ PENDIENTE" : payStatus.toUpperCase()
                          const customer = o.customer ? `${o.customer.name || o.customer.email || "—"}` : "—"
                          const orderDate = o.created_at ? new Date(o.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"
                          return (
                            <tr key={o.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                              <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: "12px", color: "#e8ff47", borderBottom: "1px solid #1c1c2e" }}>#{o.number || o.id}</td>
                              <td style={{ padding: "11px 12px", fontSize: "13px", borderBottom: "1px solid #1c1c2e", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer}</td>
                              <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: "12px", color: "#47ffc8", borderBottom: "1px solid #1c1c2e" }}>{fmtARS(parseFloat(o.total || 0))}</td>
                              <td style={{ padding: "11px 12px", borderBottom: "1px solid #1c1c2e" }}>
                                <span style={{ fontFamily: "monospace", fontSize: "10px", padding: "3px 8px", borderRadius: "3px", background: `${payColor}18`, color: payColor }}>{payLabel}</span>
                              </td>
                              <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", borderBottom: "1px solid #1c1c2e" }}>{orderDate}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {tnFetched && tnOrders.length === 0 && !tnLoading && (
                <div style={{ padding: "40px", textAlign: "center", background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>🛍️</div>
                  <div style={{ fontWeight: "700", marginBottom: "6px" }}>Sin órdenes recientes</div>
                  <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78" }}>No se encontraron órdenes en el período seleccionado.</div>
                </div>
              )}
            </>
          )
        })()}

        {/* ── CAMPAIGNS ── */}
        {activeTab === "campaigns" && !isConsolidated && <>
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
        </>}

        {/* ── CONNECTIONS ── */}
        {activeTab === "connections" && !isConsolidated && <>
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
        </>}

        {/* ── PROGRESS ── */}
        {activeTab === "progress" && !isConsolidated && <>
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
        </>}

        {/* ── COACH IA ── */}
        {activeTab === "chat" && !isConsolidated && <>
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
        </>}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #252538; border-radius: 2px; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes typing { 0%,100%{opacity:0.3;transform:translateY(0)} 50%{opacity:1;transform:translateY(-3px)} }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
      `}</style>
    </div>
  )
}

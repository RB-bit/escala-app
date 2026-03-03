import { useState, useRef, useEffect } from "react"
import { BRANDS, QUICK_PROMPTS, TN_BASE, TN_HEADERS } from "./data/brands"
import Topbar from "./components/Topbar"
import Sidebar from "./components/Sidebar"
import DashboardTab from "./components/tabs/DashboardTab"
import CampaignsTab from "./components/tabs/CampaignsTab"
import TiendaNubeTab from "./components/tabs/TiendaNubeTab"
import AdsTab from "./AdsTab"
import ConnectionsTab from "./components/tabs/ConnectionsTab"
import ProgressTab from "./components/tabs/ProgressTab"
import CoachTab from "./components/tabs/CoachTab"

const INITIAL_MESSAGES = [
  { role: "ai", content: "¡Hola! Soy tu coach IA de ESCALA. Estoy conectado a tus campañas de Meta Ads. ¿En qué te puedo ayudar hoy?" },
]

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
    { id: "ads", icon: "🎯", label: "Creación de Ads" },
    { id: "tiendanube", icon: "🛍️", label: "Tienda Nube", badge: tnFetched ? String(tnOrders.length) : null },
    { id: "connections", icon: "🔗", label: "Conexiones", badge: isConsolidated ? null : `${connections.filter(c => c.status === "connected").length}/${connections.length}` },
    { id: "progress", icon: "🗺️", label: "Mi Progreso" },
    { id: "chat", icon: "🤖", label: "Coach IA" },
  ]

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gridTemplateRows: "56px 1fr", height: "100vh", background: "#080810", color: "#f0f0f8", fontFamily: "'Bricolage Grotesque',sans-serif", overflow: "hidden" }}>

      <Topbar selectedBrand={selectedBrand} />

      <Sidebar
        selectedBrand={selectedBrand}
        activeTab={activeTab}
        isConsolidated={isConsolidated}
        selectBrand={selectBrand}
        setActiveTab={setActiveTab}
        nav={nav}
      />

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

        {activeTab === "dashboard" && !isConsolidated && <DashboardTab selectedBrand={selectedBrand} />}

        {activeTab === "tiendanube" && !isConsolidated && (
          <TiendaNubeTab
            tnLoading={tnLoading}
            tnError={tnError}
            tnOrders={tnOrders}
            tnProducts={tnProducts}
            tnStore={tnStore}
            tnFetched={tnFetched}
            fetchTiendaNube={fetchTiendaNube}
          />
        )}

        {activeTab === "campaigns" && !isConsolidated && <CampaignsTab selectedBrand={selectedBrand} campaigns={campaigns} />}

        {activeTab === "ads" && !isConsolidated && <AdsTab brand={selectedBrand} />}

        {activeTab === "connections" && !isConsolidated && <ConnectionsTab selectedBrand={selectedBrand} connections={connections} />}

        {activeTab === "progress" && !isConsolidated && <ProgressTab />}

        {activeTab === "chat" && !isConsolidated && (
          <CoachTab
            selectedBrand={selectedBrand}
            messages={messages}
            isTyping={isTyping}
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
          />
        )}

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

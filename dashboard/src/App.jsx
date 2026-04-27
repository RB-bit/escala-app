import { useState, useRef, useEffect, useCallback } from "react"
import { BRANDS as STATIC_BRANDS, QUICK_PROMPTS, TN_BASE, TN_HEADERS } from "./data/brands"
import { getBrands, getBrandsWithConnections, getBrandWithConnection, createBrand } from "./lib/brandsService"
import { getSession, onAuthChange, signOut } from "./lib/auth"
import { getMyRole } from "./lib/rolesService"
import Login from "./components/Login"
import Topbar from "./components/Topbar"
import Sidebar from "./components/Sidebar"
import DashboardTab from "./components/tabs/DashboardTab"
import CampaignsTab from "./components/tabs/CampaignsTab"
import TiendaNubeTab from "./components/tabs/TiendaNubeTab"
import AdsTab from "./AdsTab"
import ConnectionsTab from "./components/tabs/ConnectionsTab"
import ProgressTab from "./components/tabs/ProgressTab"
import CoachTab from "./components/tabs/CoachTab"
import ClientsTab from "./components/tabs/ClientsTab"
import DateFilter from "./components/DateFilter"

const INITIAL_MESSAGES = [
  { role: "ai", content: "¡Hola! Soy tu coach IA de ESCALA. Estoy conectado a tus campañas de Meta Ads. ¿En qué te puedo ayudar hoy?" },
]

export default function App() {
  // Detect TN OAuth callback early (not a hook — just a variable)
  const isCallback = window.location.pathname === '/auth/callback'

  const [brands, setBrands] = useState([])
  const [brandsLoading, setBrandsLoading] = useState(true)
  const initialLoadDone = useRef(false)
  const [session, setSession] = useState(undefined) // undefined = checking, null = no session
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showNewBrandModal, setShowNewBrandModal] = useState(false)
  const [newBrandLoading, setNewBrandLoading] = useState(false)
  const [newBrandData, setNewBrandData] = useState({ slug: "", name: "", emoji: "🚀", color: "#e8ff47" })
  const [datePreset, setDatePreset] = useState("this_month")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")

  const handleDateChange = ({ preset, customStart: cs, customEnd: ce }) => {
    setDatePreset(preset)
    if (preset === "custom") {
      setCustomStart(cs || "")
      setCustomEnd(ce || "")
    }
  }
  const messagesEndRef = useRef(null)

  // ── Brands fetch ──
  const fetchBrands = useCallback(async () => {
    const isFirstLoad = !initialLoadDone.current
    if (isFirstLoad) setBrandsLoading(true)
    try {
      const data = await getBrandsWithConnections()
      if (data && data.length > 0) {
        setBrands(data)
        if (isFirstLoad) setSelectedBrand(null)
      } else {
        setBrands(STATIC_BRANDS)
        if (isFirstLoad) setSelectedBrand(null)
      }
    } catch (err) {
      console.error("Error fetching brands from Supabase, falling back:", err)
      setBrands(STATIC_BRANDS)
      if (isFirstLoad) setSelectedBrand(null)
    } finally {
      initialLoadDone.current = true
      setBrandsLoading(false)
    }
  }, [])

  const handleCreateBrand = async (e) => {
    e.preventDefault()
    setNewBrandLoading(true)
    try {
      await createBrand(newBrandData)
      setShowNewBrandModal(false)
      setNewBrandData({ slug: "", name: "", emoji: "🚀", color: "#e8ff47" })
      fetchBrands()
    } catch (err) {
      console.error("Full error creating brand:", err)
      // Check if it's a duplicate slug error (Supabase code 23505 for unique violations)
      if (err.code === '23505' || err.message?.includes('duplicate key')) {
        const uniqueSlug = `${newBrandData.slug}-${Date.now()}`
        try {
          await createBrand({ ...newBrandData, slug: uniqueSlug })
          setShowNewBrandModal(false)
          setNewBrandData({ slug: "", name: "", emoji: "🚀", color: "#e8ff47" })
          fetchBrands()
          return
        } catch (retryErr) {
          alert(`Error al crear marca (reintento): ${retryErr.message}`)
        }
      } else {
        alert(`Error al crear marca: ${err.message || "Error desconocido"}. Verificá si RLS está desactivado en Supabase.`)
      }
    } finally {
      setNewBrandLoading(false)
    }
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }

  const handleNameChange = (name) => {
    setNewBrandData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  // ── TN OAuth callback: postMessage to opener and close popup ──
  useEffect(() => {
    if (!isCallback) return
    const params = new URLSearchParams(window.location.search)
    const code  = params.get('code')
    const error = params.get('error')
    if (window.opener) {
      window.opener.postMessage({ type: 'TN_OAUTH_CALLBACK', code, error }, window.location.origin)
      window.close()
    }
  }, [])

  useEffect(() => {
    // 1. Initial session check
    getSession().then(s => {
      setSession(s || null)
    })

    // 2. Auth changes listener — only react to sign-in/sign-out, not token refreshes
    const subscription = onAuthChange((s, event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setSession(s)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchBrands()
    }
  }, [session, fetchBrands])

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
  const stats = selectedBrand?.stats || { billing: "—", roas: "—", spend: "—", activeCampaigns: 0 }
  
  // Mapear meta_connections al formato que esperan los componentes
  const metaConn = selectedBrand?.meta_connections?.[0]
  const connections = isConsolidated ? [] : [
    { 
      name: "Meta Ads", 
      icon: "📣", 
      status: metaConn ? "connected" : "disconnected", 
      detail: metaConn ? `Cuenta: ${metaConn.ad_account_name || metaConn.ad_account_id}` : "No conectado", 
      action: metaConn ? "Configurar" : "Conectar" 
    },
    // Mantener los otros como placeholders por ahora si no están en la DB
    { name: "Tienda Nube", icon: "🛍️", status: "disconnected", detail: "No conectado aún", action: "Conectar" },
    { name: "Google Drive", icon: "📁", status: "disconnected", detail: "No conectado", action: "Conectar" },
    { name: "Claude AI", icon: "🤖", status: "connected", detail: "Claude Sonnet 4.6 · Activo", action: "Configurar" },
  ]

  const [brandDetailLoading, setBrandDetailLoading] = useState(false)

  const selectBrand = async (brand) => {
    if (brand === null) {
      setSelectedBrand(null)
      setActiveTab("consolidated")
    } else {
      setBrandDetailLoading(true)
      setSelectedBrand(brand)
      if (activeTab === "consolidated") setActiveTab("dashboard")
      try {
        const [fullBrand, myRole] = await Promise.all([
          getBrandWithConnection(brand.id),
          getMyRole(brand.id),
        ])
        setSelectedBrand({ ...fullBrand, myRole })
      } catch (err) {
        console.error("Error loading brand details:", err)
      } finally {
        setBrandDetailLoading(false)
      }
    }
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
      : `Modo multi-marca con ${brands.length} marcas: ${brands.map(b => b.name).join(", ")}.`
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

  // TN OAuth callback screen — shown in the popup while it posts the code and closes
  if (isCallback) {
    return (
      <div style={{
        background: '#080810', height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px'
      }}>
        <div style={{ fontSize: '32px' }}>🛍️</div>
        <div style={{ color: '#e8ff47', fontFamily: 'monospace', fontSize: '14px' }}>
          Conectando con Tienda Nube...
        </div>
      </div>
    )
  }

  if (session === undefined) {
    return (
      <div style={{ height: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px" }}>
        <div style={{ fontSize: "40px", animation: "pulse 1.5s infinite" }}>⚡</div>
        <div style={{ fontFamily: "monospace", fontSize: "14px", color: "#5a5a78" }}>Verificando sesión...</div>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  if (brandsLoading && brands.length === 0) {
    return (
      <div style={{ height: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px" }}>
        <div style={{ fontSize: "40px" }}>⚡</div>
        <div style={{ fontFamily: "monospace", fontSize: "14px", color: "#5a5a78", animation: "pulse 1.5s infinite" }}>Cargando ESCALA...</div>
      </div>
    )
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gridTemplateRows: "56px 1fr", height: "100vh", background: "#080810", color: "#f0f0f8", fontFamily: "'Bricolage Grotesque',sans-serif", overflow: "hidden" }}>

      <Topbar selectedBrand={selectedBrand} brands={brands} session={session} />

      <Sidebar
        selectedBrand={selectedBrand}
        activeTab={activeTab}
        isConsolidated={isConsolidated}
        selectBrand={selectBrand}
        setActiveTab={setActiveTab}
        nav={nav}
        brands={brands}
      />

      {/* MAIN */}
      <div style={{ overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* ── Global Date Filter ── */}
        {activeTab !== "chat" && activeTab !== "connections" && activeTab !== "progress" && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <DateFilter
              datePreset={datePreset}
              customStart={customStart}
              customEnd={customEnd}
              onChange={handleDateChange}
            />
          </div>
        )}

        {/* ── CONSOLIDATED VIEW ── the new multi-client tracking table */}
        {isConsolidated && (
          <>
            <ClientsTab
              brands={brands}
              onSelectBrand={selectBrand}
              onNewClient={() => setShowNewBrandModal(true)}
              onBrandDeleted={fetchBrands}
              datePreset={datePreset}
              customStart={customStart}
              customEnd={customEnd}
            />
            {/* Hidden legacy brand cards block — keeping structure intact below */}
            {false && brands.filter(Boolean).map(brand => {
                try {
                  const campaignsList = Array.isArray(brand.campaigns) ? brand.campaigns : []
                  const active = campaignsList.filter(c => c && c.status === "active")
                  const avgRoas = active.length ? (active.reduce((a, c) => a + (c.roas || 0), 0) / active.length).toFixed(1) : "—"
                  const connList = Array.isArray(brand.connections) ? brand.connections : []
                  const connCount = connList.filter(c => c && c.status === "connected").length
                  const brandStats = brand.stats || { billing: "—", roas: "—", spend: "—", activeCampaigns: 0 }
                  const brandColor = brand.color || "#e8ff47"

                  return (
                    <div
                      key={brand.id}
                      onClick={() => selectBrand(brand)}
                      style={{ background: "#0e0e1a", border: `1px solid ${brandColor}30`, borderRadius: "10px", padding: "20px", cursor: "pointer", transition: "all 0.2s", borderTop: `3px solid ${brandColor}` }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: `${brandColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{brand.emoji || "🚀"}</div>
                        <div>
                          <div style={{ fontWeight: "800", fontSize: "15px" }}>{brand.name}</div>
                          <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#5a5a78" }}>{(brand.metaAccounts || []).length} cuenta Meta</div>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                        {[
                          { label: "FACTURACIÓN", value: brandStats.billing || "—", color: brandColor },
                          { label: "ROAS MED.", value: String(avgRoas) + "x", color: "#47ffc8" },
                          { label: "CAMPAÑAS ▲", value: String(active.length), color: "#f0f0f8" },
                          { label: "CONEXIONES", value: `${connCount}/${connList.length}`, color: "#5a5a78" },
                        ].map((s, i) => (
                          <div key={i} style={{ background: "#13131f", borderRadius: "6px", padding: "10px 12px" }}>
                            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#5a5a78", marginBottom: "4px" }}>{s.label}</div>
                            <div style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: "700", color: s.color }}>{s.value}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontFamily: "monospace", fontSize: "11px", color: brandColor, display: "flex", alignItems: "center", gap: "6px" }}>
                        Ver detalle →
                      </div>
                    </div>
                  )
                } catch(e) {
                  console.error('Error rendering brand:', brand?.name, e)
                  return null
                }
              })}
          </>
        )}

        <div style={{ display: activeTab === "dashboard" && !isConsolidated ? "flex" : "none", flexDirection: "column", gap: "20px" }}>
          <DashboardTab selectedBrand={selectedBrand} datePreset={datePreset} customStart={customStart} customEnd={customEnd} />
        </div>

        <div style={{ display: activeTab === "tiendanube" && !isConsolidated ? "flex" : "none", flexDirection: "column", gap: "20px" }}>
          <TiendaNubeTab
            tnLoading={tnLoading}
            tnError={tnError}
            tnOrders={tnOrders}
            tnProducts={tnProducts}
            tnStore={tnStore}
            tnFetched={tnFetched}
            fetchTiendaNube={fetchTiendaNube}
          />
        </div>

        <div style={{ display: activeTab === "campaigns" && !isConsolidated ? "flex" : "none", flexDirection: "column", gap: "20px" }}>
          <CampaignsTab selectedBrand={selectedBrand} campaigns={campaigns} datePreset={datePreset} customStart={customStart} customEnd={customEnd} />
        </div>

        <div style={{ display: activeTab === "ads" && !isConsolidated ? "flex" : "none", flexDirection: "column", gap: "20px" }}>
          <AdsTab brand={selectedBrand} />
        </div>

        <div style={{ display: activeTab === "connections" && !isConsolidated ? "flex" : "none", flexDirection: "column", gap: "20px" }}>
          <ConnectionsTab selectedBrand={selectedBrand} connections={connections} refreshBrands={fetchBrands} />
        </div>

        <div style={{ display: activeTab === "progress" && !isConsolidated ? "flex" : "none", flexDirection: "column", gap: "20px" }}>
          <ProgressTab />
        </div>

        <div style={{ display: activeTab === "chat" && !isConsolidated ? "flex" : "none", flexDirection: "column", gap: "20px" }}>
          <CoachTab
            selectedBrand={selectedBrand}
            messages={messages}
            isTyping={isTyping}
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
          />
        </div>

      </div>

      {showNewBrandModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "12px", padding: "24px", width: "400px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ fontSize: "20px", fontWeight: "800", marginBottom: "20px" }}>Nueva Marca</div>
            <form onSubmit={handleCreateBrand} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", color: "#5a5a78", fontFamily: "monospace" }}>NOMBRE</label>
                <input 
                  required
                  value={newBrandData.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Ej: Onafit"
                  style={{ background: "#080810", border: "1px solid #1c1c2e", borderRadius: "6px", padding: "10px", color: "#f0f0f8" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", color: "#5a5a78", fontFamily: "monospace" }}>SLUG (URL AUTO-GENERADA)</label>
                <input 
                  readOnly
                  tabIndex="-1"
                  value={newBrandData.slug}
                  placeholder="url-de-la-marca"
                  style={{ background: "#0c0c16", border: "1px solid #1c1c2e", borderRadius: "6px", padding: "10px", color: "#5a5a78", cursor: "not-allowed", fontSize: "13px" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: "#5a5a78", fontFamily: "monospace" }}>EMOJI</label>
                  <input 
                    value={newBrandData.emoji}
                    onChange={e => setNewBrandData({ ...newBrandData, emoji: e.target.value })}
                    style={{ background: "#080810", border: "1px solid #1c1c2e", borderRadius: "6px", padding: "10px", color: "#f0f0f8", textAlign: "center" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: "#5a5a78", fontFamily: "monospace" }}>COLOR</label>
                  <input 
                    type="color"
                    value={newBrandData.color}
                    onChange={e => setNewBrandData({ ...newBrandData, color: e.target.value })}
                    style={{ background: "#080810", border: "1px solid #1c1c2e", borderRadius: "6px", padding: "4px", color: "#f0f0f8", width: "100%", height: "42px", cursor: "pointer" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button 
                  type="button"
                  onClick={() => setShowNewBrandModal(false)}
                  style={{ flex: 1, background: "transparent", border: "1px solid #252538", color: "#5a5a78", borderRadius: "6px", padding: "10px", fontWeight: "600", cursor: "pointer" }}
                >
                  Cancelar
                </button>
                <button 
                  disabled={newBrandLoading}
                  type="submit"
                  style={{ flex: 1, background: "#e8ff47", border: "none", color: "#000", borderRadius: "6px", padding: "10px", fontWeight: "800", cursor: "pointer" }}
                >
                  {newBrandLoading ? "Creando..." : "Crear Marca"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

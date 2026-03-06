// ─── BRAND DATA ────────────────────────────────────────────────────────────────
export const BRANDS = [
    {
        id: "soy-rica",
        name: "Soy Rica",
        color: "#e8ff47",
        emoji: "🌺",
        metaAccounts: ["act_463270068395656"],
        facebookPageId: "soy_rica_fb_id_placeholder",
        instagramAccountId: "soy_rica_ig_id_placeholder",
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
        id: "minoli",
        name: "Minoli",
        color: "#47c8ff",
        emoji: "✨",
        metaAccounts: ["act_2443487922504077"],
        facebookPageId: "minoli_fb_id_placeholder",
        instagramAccountId: "minoli_ig_id_placeholder",
        tiendaNubeStores: [],
        users: [],
        campaigns: [],
        connections: [
            { name: "Meta Ads", icon: "📣", status: "connected", detail: "1 cuenta conectada", action: "Configurar" },
            { name: "Tienda Nube", icon: "🛍️", status: "disconnected", detail: "No conectado aún", action: "Conectar" },
            { name: "Google Ads", icon: "🔍", status: "disconnected", detail: "No conectado", action: "Conectar" },
            { name: "Google Drive", icon: "📁", status: "disconnected", detail: "No conectado", action: "Conectar" },
            { name: "Claude AI", icon: "🤖", status: "connected", detail: "Claude Sonnet 4.6 · Activo", action: "Configurar" },
            { name: "Shopify", icon: "🛒", status: "disconnected", detail: "No prioritario — Fase 03", action: "Conectar" },
        ],
        stats: { billing: "—", roas: "—", spend: "—", activeCampaigns: 0 },
    },
    {
        id: "mamayoquiero",
        name: "MamaYoQuiero",
        color: "#c47bff",
        emoji: "👶",
        metaAccounts: ["act_177441357565547"],
        facebookPageId: "mamayoquiero_fb_id_placeholder",
        instagramAccountId: "mamayoquiero_ig_id_placeholder",
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

export const LEVELS = [
    { name: "Rookie", range: "$0 — $100K", emoji: "🌱", completed: true },
    { name: "Starter", range: "$100K — $500K", emoji: "🔥", completed: true },
    { name: "Player", range: "$500K — $2M", emoji: "⚡", current: true, progress: 68 },
    { name: "Grower", range: "$2M — $10M", emoji: "🚀", completed: false },
    { name: "Scaler", range: "$10M — $50M", emoji: "💎", completed: false },
    { name: "Legend", range: "$50M — $100M+", emoji: "👑", completed: false },
]

export const QUICK_PROMPTS = [
    "¿Cuál es mi mejor campaña?",
    "Analizá mis campañas en Learning Phase",
    "¿Cómo mejoro mi ROAS?",
    "Generá reporte semanal",
]

export const TN_TOKEN = import.meta.env.VITE_TN_TOKEN
export const TN_STORE_ID = "2091475"
export const TN_BASE = `https://api.tiendanube.com/2025-03/${TN_STORE_ID}`
export const TN_HEADERS = {
    "Authentication": `bearer ${TN_TOKEN}`,
    "User-Agent": "ESCALA (hola@escala.app)",
    "Content-Type": "application/json",
}

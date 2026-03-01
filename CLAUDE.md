# ESCALA · Project Memory
> Este archivo es la memoria del proyecto. Está en la raíz de `/Users/rodboss/desktop/app`. Al inicio de cada nueva sesión con Claude o Antigravity, referenciá este archivo para retomar el contexto completo.

---

## 🎯 Misión del proyecto

Construir una app gamificada para que cualquier emprendedor argentino con tienda en **Tienda Nube** o **Shopify** tenga un camino claro de **$0 a $100.000.000 ARS** en ventas online.

La app funciona como un RPG de negocios: cada usuario tiene un nivel de facturación, misiones activas generadas por IA basadas en su data real, y recompensas por cumplir objetivos de revenue.

**Visión a futuro:** Producto SaaS público con múltiples marcas, usuarios con roles, y onboarding propio.

---

## 👤 Datos del proyecto

- **Dueño:** RB-bit (GitHub)
- **Repo principal:** https://github.com/RB-bit/escala-app
- **Rama principal:** `main`
- **Ruta local:** `/Users/rodboss/desktop/app`
- **Antigravity workspace:** `/Users/rodboss/desktop/app` (trusted)
- **Node version:** v20.20.0 via nvm

---

## ⚙️ Setup crítico

### Activar Node 20 (requerido antes de correr cualquier comando npm/npx)
```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 20
```

### Correr el dashboard local
```bash
cd /Users/rodboss/desktop/app/dashboard && npm run dev
# Abre en http://localhost:5173
```

### Cargar variables de entorno Meta Ads
```bash
cd /Users/rodboss/desktop/app && set -a && source shared/auth/.env && set +a
```

### Correr MCP Meta Ads manualmente (para testear)
```bash
cd /Users/rodboss/desktop/app && set -a && source shared/auth/.env && set +a && npx -y meta-ads-mcp
```

---

## 🗂️ Estructura del proyecto

```
app/
├── agents/                          # Agentes futuros
├── dashboard/                       # App React (Vite) — localhost:5173
│   └── src/
│       └── App.jsx                  # Dashboard principal (multi-marca en progreso)
├── mcp-servers/                     # Submodules de repos forkeados
│   ├── meta-ads-analyzer/           # Fork: RB-bit/meta-ads-analyzer
│   ├── google-ads-analyzer/         # Fork: RB-bit/google-ads-analyzer
│   └── google-ads-mcp/              # Fork: RB-bit/google-ads-mcp
├── shared/
│   ├── auth/
│   │   ├── .env                     # Credenciales reales (nunca commitear)
│   │   └── tiendanube-config.example.json  # Generado por agente
│   └── docs/
│       └── tiendanube-api.md        # Generado por agente
├── .gitmodules
├── .gitignore
├── CLAUDE.md                        # Este archivo
├── ROADMAP.html                     # Roadmap visual interactivo
└── escala-dashboard.html            # Backup HTML del dashboard
```

---

## 🔧 Stack tecnológico

| Herramienta | Rol | Prioridad | Estado |
|---|---|---|---|
| Claude Sonnet 4.6 | Motor IA / Coach | P1 | ✅ Activo |
| Meta Ads API | Publicidad principal | P1 | ✅ Conectado |
| Google Drive API | Assets para ads | P1 | 🔜 Pendiente |
| Tienda Nube API | Data del negocio | P1 | 🔜 Pendiente |
| Google Ads API | Publicidad secundaria | P2 | 🔜 Pendiente |
| Antigravity AI | Orquestador agentes | P2 | ✅ Activo |
| Shopify API | E-commerce alternativo | P3 | ⏸ Fase 03 |

---

## ⚙️ MCP Servers configurados

### Archivo: `~/.gemini/antigravity/mcp_config.json`
```json
{
  "mcpServers": {
    "meta-ads": {
      "command": "/Users/rodboss/.nvm/versions/node/v20.20.0/bin/node",
      "args": ["/Users/rodboss/.nvm/versions/node/v20.20.0/bin/npx", "-y", "meta-ads-mcp"],
      "env": {
        "PATH": "/Users/rodboss/.nvm/versions/node/v20.20.0/bin:/usr/local/bin:/usr/bin:/bin",
        "META_ACCESS_TOKEN": "desde shared/auth/.env",
        "META_APP_SECRET": "desde shared/auth/.env",
        "META_AD_ACCOUNT_ID": "desde shared/auth/.env"
      }
    }
  }
}
```

**Estado:** ✅ 39 tools activas · 15 cuentas Meta Ads conectadas

### Variables en `shared/auth/.env`
```
META_ACCESS_TOKEN=...
META_AD_ACCOUNT_ID=act_...
META_APP_SECRET=...
```

> ⚠️ El token de Meta compartido accidentalmente en el chat fue regenerado.

---

## 🗺️ Roadmap — 4 Fases

### FASE 01 · MVP (Mes 1–3) · $0 → $1M ARS
- **F-00** Onboarding gamificado + conexión de cuentas *(en progreso)*
- **F-01** Publicar anuncios en Meta Ads desde Google Drive *(pendiente)*
- **F-02** Análisis campañas Meta Ads + reportes Claude ✅ *(funcionando)*
- **F-03** Dashboard Tienda Nube — *pre-req: registrarse como Partner App*

### FASE 02 · Core Intelligence (Mes 3–6) · $1M → $10M ARS
- **F-04** Coach IA de campañas
- **F-05** Análisis Google Ads integrado
- **F-06** Alertas inteligentes
- **F-07** Generador de copy para ads

### FASE 03 · Growth Automation (Mes 6–10) · $10M → $50M ARS
- **F-08** Agente autónomo de campañas
- **F-09** Sync stock ↔ ads
- **F-10** Reportes semanales automáticos
- **F-11** Integración Shopify

### FASE 04 · Scale Platform (Mes 10–14) · $50M → $100M ARS
- **F-12** Gamificación completa
- **F-13** Predicción de revenue
- **F-14** Multi-cuenta para agencias / SaaS público

---

## 🏢 Arquitectura multi-marca (en progreso)

Cada marca tiene:
```javascript
{
  id, name, color,
  metaAccounts: [],      // múltiples cuentas Meta Ads
  tiendaNubeStores: [],  // múltiples tiendas
  googleAdsAccounts: [],
  users: []              // con roles: owner / editor / viewer
}
```

Vista consolidada de todas las marcas + dashboard por marca individual.
Diseñado para escalar a SaaS: usuario → workspace → marcas → integraciones.

---

## 🎮 Sistema de gamificación

- **6 niveles:** Rookie → Starter → Player → Grower → Scaler → Legend
- **Misiones diarias** generadas por Claude basadas en data real
- **Score del negocio** 0–100
- **Badges** compartibles por hitos
- **Mapa de progreso** visual

---

## 📍 Estado actual

### ✅ Completado — Sesión 1 (01/03/2026)
- [x] Workspace local `/Users/rodboss/desktop/app`
- [x] Repo GitHub `RB-bit/escala-app` con branch tracking
- [x] 3 repos forkeados como submodules (meta-ads-analyzer, google-ads-analyzer, google-ads-mcp)
- [x] Meta Ads MCP funcionando — 39 tools, 15 cuentas activas
- [x] Dashboard React corriendo en localhost:5173 (Vite + React)
- [x] Coach IA con Claude Sonnet 4.6 integrado en el dashboard
- [x] Antigravity configurado: Agent-assisted + Claude Sonnet 4.6
- [x] ROADMAP.html commiteado
- [x] Node 20 instalado via nvm

### 🤖 Agente Antigravity trabajando (01/03/2026 — noche)
- [ ] Multi-marca en `dashboard/src/App.jsx`
- [ ] Documentación Tienda Nube API en `shared/docs/`
- [ ] `tiendanube-config.example.json` en `shared/auth/`

### 🔜 Próxima sesión
- [ ] Revisar trabajo del agente + testear multi-marca en localhost:5173
- [ ] Iniciar registro Partner App Tienda Nube → https://partners.tiendanube.com
- [ ] Conectar Google Ads API
- [ ] F-01: subir anuncios desde Google Drive → Meta Ads
- [ ] F-03: Dashboard Tienda Nube (stock + ventas)
- [ ] Deploy de la app (local → web)

---

## 🔐 Seguridad

- **NUNCA** commitear tokens o credenciales
- Todo en `shared/auth/.env` (en `.gitignore`)
- Antigravity: Trust solo en esta carpeta, nunca en carpetas padre
- Modo Agent-assisted — el agente pide aprobación antes de ejecutar
- Token Meta Ads: regenerar cada 60 días

---

## 💬 Cómo retomar en nueva sesión

### Con Antigravity Agent Manager:
> *"Read the CLAUDE.md file in the root of this project to understand the full context, then help me with: [tarea]"*

### Con Claude (claude.ai):
> *"Continuamos con el proyecto ESCALA. Acá está el CLAUDE.md: [pegá contenido]. Próximo paso: [tarea]."*

---

## 📝 Log de sesiones

### Sesión 1 — 01/03/2026
- Setup completo workspace y repo GitHub
- Meta Ads MCP conectado y funcionando (39 tools, 15 cuentas)
- Dashboard React con 5 tabs: Dashboard, Campañas, Conexiones, Progreso, Coach IA
- Arquitectura multi-marca iniciada (agente trabajando)
- Documentación Tienda Nube API (agente trabajando)
- Node 20 instalado via nvm para compatibilidad con MCP

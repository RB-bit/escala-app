# ESCALA · Project Memory
> Este archivo es la memoria del proyecto. Está en la raíz de `/Users/rodboss/desktop/app`. Al inicio de cada nueva sesión con Claude o Antigravity, referenciá este archivo para retomar el contexto completo.

---

## 🎯 Misión del proyecto

Construir una app gamificada para que cualquier emprendedor argentino con tienda en **Tienda Nube** o **Shopify** tenga un camino claro de **$0 a $100.000.000 ARS** en ventas online.

La app funciona como un RPG de negocios: cada usuario tiene un nivel de facturación, misiones activas generadas por IA basadas en su data real, y recompensas por cumplir objetivos de revenue.

**Visión a futuro:** Producto SaaS público con múltiples organizaciones, usuarios con roles, y onboarding propio.

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
cd /Users/rodboss/desktop/app/dashboard && npm run dev -- --open
# Abre en http://localhost:5173
```

### Cargar variables de entorno
```bash
cd /Users/rodboss/desktop/app && set -a && source shared/auth/.env && set +a
```

### Correr MCP Meta Ads manualmente (para testear)
```bash
cd /Users/rodboss/desktop/app && set -a && source shared/auth/.env && set +a && npx -y meta-ads-mcp
```

---

## 🏛️ Arquitectura del producto

### Jerarquía de datos
```
Organización (Master)
  ├── usuarios: [{ email, rol: "owner" | "editor" | "viewer" }]
  └── Proyectos (= marcas / tiendas)
        ├── usuarios: [{ email, rol: "owner" | "editor" | "viewer" }]
        ├── conexiones: { meta[], googleAds[], tiendaNube[], shopify[], googleDrive }
        ├── objetivos: { revenue, roas, periodo }
        └── tabs: Dashboard, Creación de Ads, Reporting, Progreso, Alertas
```

### Roles de usuario
- **Owner** — acceso total al proyecto y organización
- **Editor** — puede crear y editar contenido, no puede eliminar proyectos
- **Viewer** — solo lectura

Un usuario puede tener roles distintos en proyectos distintos dentro de la misma organización.

### Tabs por proyecto
| Tab | Descripción |
|---|---|
| Dashboard | KPIs del proyecto, misiones activas, logros |
| Creación de Ads | Flujo de 4 pasos: Research → Roadmap creativo → Assets Drive → Lanzamiento |
| Reporting | Campañas Meta Ads, métricas, evolución |
| Progreso | Objetivos del proyecto, nivel gamificado, stats |
| Alertas | Notificaciones transversales (ROAS bajo, stock crítico, overspend) |
| Conexiones | Estado de todas las integraciones |

### Flujo de Creación de Ads (4 pasos dentro del mismo tab)
```
1. Research / Análisis de cuenta publicitaria
   └── Claude analiza campañas activas → identifica qué está fatigando → sugiere ángulos
2. Creative Roadmap
   └── Hipótesis documentadas → priorización → brief por concepto
3. Assets de Drive
   └── Explorador de Google Drive → selección de archivos → preview
4. Lanzamiento a Meta
   └── Configuración de ad set → subida de assets → publicación directa
```

---

## 🗂️ Estructura del proyecto

```
app/
├── agents/                          # Agentes futuros
├── dashboard/                       # App React (Vite) — localhost:5173
│   ├── src/
│   │   └── App.jsx                  # Dashboard principal multi-marca
│   └── .env.local                   # Variables Vite (nunca commitear)
├── mcp-servers/                     # Submodules de repos forkeados
│   ├── meta-ads-analyzer/
│   ├── google-ads-analyzer/
│   └── google-ads-mcp/
├── shared/
│   ├── auth/
│   │   ├── .env                     # Credenciales reales (nunca commitear)
│   │   └── tiendanube-config.example.json
│   └── docs/
│       └── tiendanube-api.md
├── .gitmodules
├── .gitignore
├── CLAUDE.md                        # Este archivo
├── ROADMAP.html                     # Roadmap visual
└── escala-dashboard.html            # Backup HTML
```

---

## 🔧 Stack tecnológico

| Herramienta | Rol | Estado |
|---|---|---|
| Claude Sonnet 4.6 | Motor IA / Coach / Creative Intelligence | ✅ Activo |
| Meta Ads API | Publicidad principal + uploader de ads | ✅ Conectado |
| Google Drive API | Storage de assets para ads | 🔜 Próximo |
| Tienda Nube API | Data del negocio (órdenes, productos, stock) | ✅ Conectado |
| Google Ads API | Publicidad secundaria | 🔜 Fase 02 |
| Antigravity AI | Orquestador de agentes | ✅ Activo |
| Shopify API | E-commerce alternativo | ⏸ Fase 03 |

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
TIENDANUBE_APP_ID=27024
TIENDANUBE_CLIENT_SECRET=...
TIENDANUBE_ACCESS_TOKEN=...
TIENDANUBE_USER_ID=2091475
```

### Variables en `dashboard/.env.local` (Vite, nunca commitear)
```
VITE_TN_TOKEN=...
VITE_TN_STORE_ID=2091475
```

> ⚠️ Regenerar tokens de Meta cada 60 días.

---

## 🗺️ Roadmap — 4 Fases (revisado 03/03/2026)

### FASE 01 · MVP · $0 → $1M ARS
- **F-00** ✅ Dashboard multi-marca + arquitectura base
- **F-01** ✅ Meta Ads análisis + Coach IA
- **F-02** ✅ Tienda Nube dashboard (órdenes, productos, stock, health score)
- **F-03** 🔜 **Sistema de usuarios y permisos** (Owner/Editor/Viewer por proyecto) ← PRÓXIMO
- **F-04** 🔜 **Objetivos por proyecto — Sistema de Tests** (registro de tests de ads, producto y web · hit rate · ads ganadores · evaluación 3–7 días)
- **F-05** 🔜 **Google Drive → Meta Ads uploader** (Drive explorer + subida de imágenes/videos/reels)

### FASE 02 · Core Intelligence · $1M → $10M ARS
- **F-06** 🔜 Tab "Creación de Ads" con flujo de 4 pasos (Research → Roadmap → Assets → Launch)
- **F-07** 🔜 Creative Intelligence Report semanal (análisis de fatiga + top 5-10 conceptos a testear)
- **F-08** 🔜 Google Ads integrado
- **F-09** 🔜 Sistema de alertas transversal (ROAS bajo, stock crítico, overspend, learning phase)
- **F-10** 🔜 Reporting avanzado (evolución temporal, comparativas entre marcas)

### FASE 03 · Growth Automation · $10M → $50M ARS
- **F-11** 🔜 Agente autónomo de campañas
- **F-12** 🔜 Sync stock ↔ ads (pausa ads si stock bajo, reactiva con stock)
- **F-13** 🔜 Reportes PDF semanales automáticos
- **F-14** 🔜 Shopify integración

### FASE 04 · SaaS Público · $50M → $100M ARS
- **F-15** 🔜 Auth propio (login, onboarding, billing)
- **F-16** 🔜 Multi-organización pública
- **F-17** 🔜 Gamificación completa + leaderboard entre usuarios
- **F-18** 🔜 Predicción de revenue con IA

---

## 🎮 Sistema de gamificación

- **6 niveles:** Rookie → Starter → Player → Grower → Scaler → Legend
- **Misiones diarias** generadas por Claude basadas en data real
- **Score del negocio** 0–100
- **Badges** compartibles por hitos
- **Mapa de progreso** visual por proyecto
- **Vista consolidada** de la organización con suma de todos los proyectos

---

## 📍 Estado actual (03/03/2026)

### ✅ Completado
- [x] Dashboard React en localhost:5173 con 6 tabs
- [x] Arquitectura multi-marca (Soy Rica, Cavaliery, MamaYoQuiero)
- [x] Meta Ads MCP — 39 tools, 15 cuentas activas
- [x] Tienda Nube API — órdenes, productos, stock, health score
- [x] Coach IA con Claude Sonnet 4.6
- [x] Node 20 via nvm
- [x] Tokens en variables de entorno (no en código)
- [x] Tienda Nube Partner App creada (App ID: 27024)

### Próxima sesión
- [ ] Decidir: datos de Meta viven en brands (actual) o en meta_connections (original) — unificar antes del Prompt 3
- [ ] Prompt 2: Auth con Supabase (Login.jsx + auth gate)
- [ ] Prompt 3: OAuth flow Meta desde la UI (MetaConnectModal)
- [ ] F-04: Sistema de Tests (tab Tests por proyecto, tablas tests + winning_ads en Supabase)
- [ ] F-05: Google Drive + uploader a Meta

---

## 🔐 Seguridad

- **NUNCA** commitear tokens o credenciales
- Todo en `shared/auth/.env` y `dashboard/.env.local` (ambos en `.gitignore`)
- Antigravity: Trust solo en `/Users/rodboss/desktop/app`, nunca en carpetas padre
- Modo Agent-assisted — el agente pide aprobación antes de ejecutar
## REGLAS DE DESARROLLO

### CRÍTICO — Edición de archivos JSX/JS
- NUNCA usar scripts Python para editar archivos .jsx o .js
- Los scripts Python siempre introducen syntax errors en JSX
- Siempre editar los archivos directamente con las herramientas de edición de código
- Hacer cambios pequeños e incrementales, verificar que el archivo es JSX válido después de cada cambio
- Si el archivo tiene un syntax error, usar `git checkout -- <archivo>` para revertir

### CRÍTICO — Node version
- SIEMPRE activar Node 20 antes de cualquier comando npm/node:
  export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 20
- El proyecto falla con cualquier versión distinta de Node 20

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
- Node 20 instalado via nvm

### Sesión 2 — 03/03/2026
- F-02: Tienda Nube Partner App creada (App ID 27024), OAuth completado, API funcionando
- F-02: Tab Tienda Nube en dashboard con órdenes, productos, stock y health score reales
- Tokens movidos a variables de entorno (VITE_TN_TOKEN en .env.local)
- Arquitectura multi-marca completada por agente Antigravity
- Roadmap revisado con nueva estructura: Organización → Proyectos → Usuarios/Roles
- Flujo de Creación de Ads definido: Research → Roadmap → Assets Drive → Lanzamiento
- Identificado próximo feature crítico: Sistema de usuarios y permisos (F-03)

### Sesión 4 — 12/03/2026
- Brands migradas de hardcodeado a Supabase dinámico
- Creado brandsService.js con getBrands, createBrand, updateBrand
- App.jsx: carga brands desde Supabase al montar con fallback automático a brands.js
- Tabla brands extendida con campos: meta_accounts, facebook_page_id, instagram_account_id, connections (JSONB), stats (JSONB)
- SQL supabase_setup.sql generado con las 4 brands iniciales (Soy Rica, Cavaliery, MamaYoQuiero, Onafit)
- Loading screen con micro-animaciones agregado al mount de la app
- Botón "Nueva marca" + modal en tab Conexiones

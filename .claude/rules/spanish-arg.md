---
name: Spanish (Argentina) for UI
description: Toda la UI user-facing en español rioplatense (voseo)
---

# Español argentino en UI

## Aplica a

- Texto en JSX (`<button>`, `<h1>`, `<p>`, etc.)
- Mensajes de error mostrados al usuario
- Placeholders, labels, botones
- Notificaciones, toasts, alerts
- Mensajes del Coach IA dirigidos al usuario

## NO aplica a

- Comentarios de código (pueden ir en español neutro o inglés).
- Mensajes de commit (van en inglés, ver `rules/commit-style.md`).
- Variables, nombres de funciones, nombres de archivos (en inglés).
- Documentación interna (CLAUDE.md, este archivo, etc., flexibilidad).
- Logs y mensajes de consola (en inglés es ok).

## Convenciones

- **Voseo siempre:** "Iniciá sesión", "Configurá tu cuenta", "Cargá tu primer producto", "Subí los assets".
- "Vos" / "tu" / "tuyo", **nunca** "tú" / "ti" / "usted".
- Vocabulario marketero AR cuando aplique:
  - "facturación" (no "ingresos" sin contexto)
  - "ROAS", "campaña", "creatividad" (no "creativa")
  - "mercadería", "stock", "carrito"
- Argentinismos cuando sumen: "facturás", "vendés", "lográs", "subís".

## Ejemplos

✅ Bien:
- "Iniciá sesión con tu mail"
- "Cargá tu primera marca para arrancar"
- "Tu ROAS de esta semana es 3.2x"
- "Cerrar sesión"
- "Conectá tu cuenta de Meta Ads"

❌ Mal:
- "Login with email" (inglés)
- "Inicia sesión con tu correo" (neutro / mexicano)
- "Inicie sesión con su correo" (formal usted)
- "Carga tu primer producto" (sin acento, lectura ambigua)

## Notas técnicas

- Usar acentos correctos: "Iniciá", "Cargá", "Configurá", "Subí" (siempre en á/í final).
- "Email" se acepta como "email" o "mail", evitar "correo" (suena formal).
- Para términos técnicos sin traducción natural, dejarlos en inglés: "ROAS", "ad set", "pixel", "lead".

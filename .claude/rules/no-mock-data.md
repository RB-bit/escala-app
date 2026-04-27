---
name: No mock data
description: Siempre Supabase real con fallback explícito, nunca mocks ocultos
---

# No mocks, sí fallbacks explícitos

## Patrón actual del proyecto

ESCALA carga data desde Supabase. Si Supabase falla (offline, RLS bloqueando, error transitorio), usa un fallback estático con datos mínimos para que la UI no quede rota.

Ejemplo (en `App.jsx`):

```js
try {
  const brands = await getBrands(); // Supabase real
  setBrands(brands);
} catch (err) {
  console.error('Falling back to STATIC_BRANDS:', err);
  setBrands(STATIC_BRANDS); // de dashboard/src/data/brands.js
}
```

## SÍ

- Fallback estático **explícito**, comentado, con datos públicos (sin tokens, sin credenciales).
- Cuando agregás un nuevo servicio, definí qué pasa si falla — error visible al user, fallback, retry, lo que corresponda.

## NO

- ❌ Mocks de "prueba" en código de producción:
  ```js
  if (process.env.NODE_ENV === 'dev') return [{ id: 1, name: 'mock' }];
  ```
- ❌ Condicionales basadas en `__DEV__` o flags que devuelven data falsa.
- ❌ Mockeear servicios de auth, RLS o pagos por conveniencia.
- ❌ Comentar la llamada real y devolver un array hardcoded "mientras pruebo".

## Para tests (cuando los haya)

El proyecto todavía no tiene framework de testing. Cuando lo incorpore (vitest, jest), los mocks van **solo** en archivos `*.test.js` o `__tests__/`, **nunca** en código de producción.

## Por qué importa

Mocks ocultos en producción han sido fuente de bugs catastróficos en muchos proyectos: la app funciona perfecto en dev, falla en prod, y nadie sabe por qué. Si querés probar algo sin Supabase real, hacelo en un archivo de test o en una rama, no en el código vivo.

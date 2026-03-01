# Tienda Nube / Nuvemshop API — Integration Guide

> **Status:** Documentation only. No credentials obtained yet.
> **Last updated:** 2026-03-01

---

## 1. What Is Tienda Nube?

Tienda Nube (known as Nuvemshop in Brazil) is the leading e-commerce platform in Latin America, with 100,000+ stores across Argentina, Brazil, Mexico, and Colombia. For ESCALA, it's the primary store data source that allows us to pull orders, products, and stock levels.

---

## 2. Partner App vs. Private App — What ESCALA Needs

This is a critical architecture decision before any development:

### 🔓 Private App (single store)
| Property | Details |
|----------|---------|
| **Use case** | A store owner integrating with their own single store |
| **Auth** | Manual token generation from the store's admin panel |
| **Access** | One store only |
| **Registration** | No partner registration needed |
| **Suitable for ESCALA?** | ❌ No — ESCALA serves multiple clients with multiple stores |

### 🏢 Partner App (multi-store SaaS) ← **ESCALA needs this**
| Property | Details |
|----------|---------|
| **Use case** | Apps that install onto many stores (SaaS model) |
| **Auth** | OAuth 2.0 authorization flow — each store owner authorizes ESCALA |
| **Access** | Each `store_id` + `access_token` pair gives access to that store |
| **Registration** | ✅ Must register as a [Tienda Nube Partner](https://www.tiendanube.com/partners) |
| **Review process** | App must pass Tienda Nube's app review before going live |
| **Suitable for ESCALA?** | ✅ Yes |

> **Conclusion:** ESCALA must be registered as a Tienda Nube Partner App. This is the only way to let each client independently authorize access to their store's data via OAuth.

---

## 3. What Needs To Happen Before We Can Connect

### Pre-requisites checklist

1. **Register as a Tienda Nube Partner**
   - URL: https://www.tiendanube.com/partners
   - You'll get access to the Partners admin panel

2. **Create an App in the Partners panel**
   - Set a name, description, redirect URI
   - Select required OAuth scopes (see Section 5)
   - You'll receive: `client_id` (= `app_id`) and `client_secret`

3. **Set up a redirect endpoint**
   - A public URL (e.g. `https://escala.app/auth/tiendanube/callback`) that Tienda Nube can redirect to after the merchant authorizes
   - Needed for the OAuth flow — can't be `localhost` in production

4. **App review** (for live/public use)
   - Tienda Nube reviews apps before they appear in the marketplace
   - Estimated time: **2–4 weeks** for standard apps
   - Internal/beta testing can proceed before review via direct install URL

5. **Per-store installation**
   - Each client (store owner) visits:
     `https://www.tiendanube.com/apps/{app_id}/authorize`
   - Authorizes ESCALA's requested scopes
   - ESCALA receives an `access_token` + `store_id` (= `user_id`)
   - Store token: **non-expiring** (store revokes when they uninstall)

---

## 4. OAuth 2.0 Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     ESCALA OAuth Flow                           │
│                                                                 │
│  STEP 1                                                         │
│  Client visits:                                                 │
│  https://www.tiendanube.com/apps/{app_id}/authorize?state=XYZ  │
│           ↓                                                     │
│  STEP 2                                                         │
│  Merchant logs in + authorizes ESCALA's requested scopes        │
│           ↓                                                     │
│  STEP 3                                                         │
│  Tienda Nube redirects to:                                      │
│  https://escala.app/auth/tiendanube/callback?code=ABC&state=XYZ │
│  (code expires in 5 minutes)                                    │
│           ↓                                                     │
│  STEP 4                                                         │
│  ESCALA backend POSTs to exchange code for token:               │
│  POST https://www.tiendanube.com/apps/authorize/token           │
│  Body: { client_id, client_secret, grant_type: "authorization_code", code }
│           ↓                                                     │
│  STEP 5                                                         │
│  Response: { access_token, token_type, scope, user_id(=store_id)}
│  → Save (store_id, access_token) per client in ESCALA DB       │
└─────────────────────────────────────────────────────────────────┘
```

### Token exchange request example

```bash
curl -X POST https://www.tiendanube.com/apps/authorize/token \
  -H 'Content-Type: application/json' \
  -d '{
    "client_id": "YOUR_APP_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "grant_type": "authorization_code",
    "code": "TEMP_CODE_FROM_REDIRECT"
  }'
```

### Token exchange response

```json
{
  "access_token": "61181d08b7e328d256736hdcb671c3ce50b8af5",
  "token_type": "bearer",
  "scope": "read_orders,read_products,write_products,read_customers",
  "user_id": "789"
}
```

> `user_id` is the `store_id` — store it alongside the `access_token` in your DB.

### Security notes
- Use the `state` parameter for CSRF protection (hash of session or random nonce)
- Verify the `state` value on callback before exchanging the code
- Tokens don't expire unless the merchant uninstalls the app

---

## 5. Required Scopes for ESCALA

| Scope | Grants Access To | ESCALA Use |
|-------|-----------------|------------|
| `read_orders` | Orders, order history | Revenue reporting, abandoned checkout |
| `read_products` | Products, variants, images, categories | Stock analysis, catalog sync |
| `write_products` | Update product variants | Future: auto stock-ads sync |
| `read_customers` | Customer list | Audience building for Meta Ads |
| `read_content` | Store pages | Not needed initially |

> **Minimal MVP scopes:** `read_orders read_products read_customers`

---

## 6. Making API Requests

### Base URL

```
https://api.tiendanube.com/2025-03/{store_id}/{resource}
```

> For Brazilian stores: `https://api.nuvemshop.com.br/2025-03/{store_id}/{resource}`

### Required headers for every request

```http
Authentication: bearer ACCESS_TOKEN
User-Agent: ESCALA (hola@escala.app)
Content-Type: application/json
```

> Missing `User-Agent` returns `400 Bad Request`.

---

## 7. Key Endpoints

### 📦 Orders
```
GET /{store_id}/orders
GET /{store_id}/orders/{order_id}
```
Key fields: `id`, `number`, `status`, `payment_status`, `total`, `created_at`, `products[]`, `customer`

Useful filters: `?created_at_min=2026-01-01&status=open&per_page=200`

---

### 🛒 Products & Stock
```
GET /{store_id}/products
GET /{store_id}/products/{product_id}
GET /{store_id}/products/{product_id}/variants
```
Key variant fields: `id`, `sku`, `stock`, `price`, `promotional_price`

Stock is stored on **variants** (not the product itself).

---

### 🗺️ Locations / Stock per location (multi-warehouse)
```
GET /{store_id}/locations
```
For stores with multiple warehouses (Tienda Nube Next/Evolution plans).

---

### 👤 Customers
```
GET /{store_id}/customers
GET /{store_id}/customers/{customer_id}
```
Key fields: `id`, `email`, `name`, `total_spent`, `last_order_at`, `orders_count`

---

### 🏪 Store Information
```
GET /{store_id}
```
Returns store name, plan, main language, currency, etc.

---

### 🛒 Abandoned Checkouts
```
GET /{store_id}/checkouts
```
Useful for retargeting campaign audience building.

---

### 🔔 Webhooks
```
POST /{store_id}/webhooks
GET  /{store_id}/webhooks
```
Register webhooks on `orders/created`, `orders/updated`, `products/updated` to receive real-time notifications.

---

## 8. Rate Limits

Tienda Nube uses a **Leaky Bucket algorithm**:

| Plan | Bucket Size | Drain Rate |
|------|-------------|------------|
| Standard | 40 requests | 2 req/sec |
| Next / Evolution | 400 requests | 20 req/sec |

### Rate limit response headers
```http
x-rate-limit-limit: 40        # total bucket size
x-rate-limit-remaining: 35    # remaining before bucket is full
x-rate-limit-reset: 5000      # ms until bucket empties
```

> **429 Too Many Requests** — back off and retry after `x-rate-limit-reset` ms.

### Best practices
- Maximum **200 items per page** with `per_page=200`
- Use `Link` header for pagination instead of building URLs manually
- Use `x-total-count` header to know total items before paginating
- Rate limit is **per store per app** (isolated per client)

---

## 9. Pagination

```bash
# Page 1 (default)
GET /{store_id}/orders?per_page=200

# Check total
x-total-count: 850

# Navigate pages
Link: <...?page=2&per_page=200>; rel="next", <...?page=5&per_page=200>; rel="last"

# Page 2
GET /{store_id}/orders?page=2&per_page=200
```

---

## 10. Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `400` | Bad request / invalid JSON | Fix payload |
| `401` | Invalid or expired token | Re-authorize |
| `403` | Scope not granted | Request additional scopes |
| `404` | Resource not found | Check IDs |
| `415` | Missing `Content-Type` header | Add header |
| `422` | Invalid field values | Check field constraints |
| `429` | Rate limit exceeded | Wait `x-rate-limit-reset` ms |
| `5xx` | Tienda Nube server error | Retry with exponential backoff |

---

## 11. References

- [Official API Docs](https://tiendanube.github.io/api-documentation/intro)
- [Authentication Guide](https://tiendanube.github.io/api-documentation/authentication)
- [Order Resource](https://tiendanube.github.io/api-documentation/resources/order)
- [Product Resource](https://tiendanube.github.io/api-documentation/resources/product)
- [Product Variant](https://tiendanube.github.io/api-documentation/resources/product-variant)
- [Customer Resource](https://tiendanube.github.io/api-documentation/resources/customer)
- [Webhook Resource](https://tiendanube.github.io/api-documentation/resources/webhook)
- [Partner Registration](https://www.tiendanube.com/partners)

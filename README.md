# Quota

App para dividir suscripciones compartidas (Netflix, Spotify, etc.) y cobrar cuotas a tus amigos por **WhatsApp**, con **transferencia** (alias/CBU) y **Mercado Pago**.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [Supabase](https://supabase.com) (Auth + PostgreSQL)
- [Mercado Pago](https://www.mercadopago.com.ar/developers) (links de pago)

## Configuración local

1. Cloná el repo e instalá dependencias:

```bash
npm install
```

2. Copiá variables de entorno:

```bash
cp .env.example .env.local
```

3. Completá en `.env.local`:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (necesaria para el webhook de MP) |
| `MERCADOPAGO_ACCESS_TOKEN` | Access Token de tu app MP |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` en desarrollo |

4. En Supabase → SQL Editor, ejecutá en orden:

- `supabase_schema.sql` (esquema base)
- `supabase/migrations/20250523_payment_alias.sql`
- `supabase/migrations/20250523_billing_period.sql`

5. En **Ajustes** de la app configurá tu alias para transferencias.

6. Arrancá el servidor:

```bash
npm run dev
```

## Mercado Pago — Webhook

Para marcar pagos automáticamente cuando un amigo paga por link:

1. En [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app) → tu app → **Webhooks**.
2. URL de notificación: `https://TU_DOMINIO/api/webhooks/mercadopago`
3. Eventos: **Pagos**.
4. En local usá [ngrok](https://ngrok.com) o similar y poné esa URL en `NEXT_PUBLIC_APP_URL`.

## Ciclo mensual de cobros

Cada pago queda asociado a un período `YYYY-MM` (mes calendario, zona Argentina). Al cambiar de mes, los participantes vuelven a **pendiente** hasta que paguen o los marques como pagados.

## Scripts

```bash
npm run dev    # desarrollo
npm run build  # producción
npm run lint   # ESLint
```

## Estructura principal

```
src/
  app/(dashboard)/     # rutas autenticadas
  app/api/webhooks/    # webhook Mercado Pago
  lib/record-payment.ts
  types/database.ts
  utils/               # billing, fees, auth de grupos
```

## Plan gratuito vs Premium

- **Free:** 1 grupo.
- **Premium:** grupos ilimitados (página `/premium`, integración de pago pendiente).

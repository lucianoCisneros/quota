# Quota

Compartir suscripciones con amigos no debería ser un dolor de cabeza. **Quota** te permite dividir el costo de Netflix, Spotify, Disney+ y cualquier otro service — y cobrarles directo por WhatsApp con un link de pago de Mercado Pago o con tu alias/CBU para transferencia.

Cada mes, los participantes arrancan en "pendiente". Marcás como pagado cuando llega la plata. Simple, sin apps extra, sin idas y vueltas.

### Stack

[Next.js](https://nextjs.org) 16 · [Supabase](https://supabase.com) · [Tailwind CSS](https://tailwindcss.com) v4 · [Mercado Pago](https://www.mercadopago.com.ar/developers) · [Resend](https://resend.com)

## Migraciones

Cada migración de base de datos debe ejecutarse en el Editor SQL de Supabase en orden cronológico:

| Archivo | Descripción |
|---------|-------------|
| `supabase/migrations/20250523_billing_period.sql` | Agrega columna `billing_period` a payments |
| `supabase/migrations/20250523_payment_alias.sql` | Agrega columna `payment_alias` a users |
| `supabase/migrations/20250527_add_email_to_group_members.sql` | Agrega columna `email` a group_members |
| `supabase/migrations/20250601_mp_connect.sql` | Agrega columnas OAuth de Mercado Pago a users |

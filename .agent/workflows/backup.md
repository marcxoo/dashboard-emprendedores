---
description: Sincronizar backup de Supabase a PostgreSQL local
---

# Backup Supabase → PostgreSQL Local

## Opción 1: Backup Manual Completo

// turbo
```bash
node sync_to_local.js
```

## Opción 2: Sincronización en Tiempo Real

Ejecuta el servidor de sincronización junto con el dev server:

// turbo
```bash
node local_sync_server.js
```

Esto hace que cada emprendedor que registres se guarde automáticamente en PostgreSQL local.

**Tip:** Abre dos terminales:
1. Terminal 1: `npm run dev` (dashboard)
2. Terminal 2: `node local_sync_server.js` (sync)

## Verificar Backup en pgAdmin

1. Expande `emprendedores` → `Schemas` → `public` → `Tables`
2. Click derecho en `entrepreneurs` → "View/Edit Data" → "All Rows"

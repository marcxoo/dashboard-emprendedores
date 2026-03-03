# Dashboard Emprendedores

Panel de gestion para emprendimiento institucional con modulos de:

- emprendedores
- eventos
- ferias
- encuestas
- invitaciones
- certificados

El frontend corre como SPA con React + Vite y usa Supabase como base de datos remota.

## Stack

- `React 19`
- `Vite`
- `React Router`
- `Tailwind CSS`
- `Supabase JS`
- `Framer Motion`
- `Recharts`

## Estructura del proyecto

```text
.
├── api/                      # Endpoints serverless (Vercel)
├── database/
│   ├── checks/               # SQL de verificacion
│   ├── fixes/                # SQL de correcciones
│   ├── migrations/           # SQL de cambios evolutivos
│   └── schema/               # SQL de esquemas base
├── scripts/
│   ├── cloudinary/
│   ├── debug/
│   ├── maintenance/
│   ├── migrations/
│   └── surveys/
├── server/                   # Backend local para sync/backup
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── certificates/
│   │   │   ├── common/
│   │   │   ├── events/
│   │   │   ├── fairs/
│   │   │   ├── invitations/
│   │   │   ├── portal/
│   │   │   ├── surveys/
│   │   │   └── ui/
│   │   ├── context/
│   │   ├── data/
│   │   ├── lib/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── index.css
│   └── main.jsx
└── vite.config.js
```

## Requisitos

- `Node.js 20+`
- `npm`

## Variables de entorno

Crea `.env` basado en `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Para funciones de correo/firma y servidor local, agrega tambien las variables necesarias:

- `RESEND_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `LOCAL_PG_HOST`, `LOCAL_PG_PORT`, `LOCAL_PG_DATABASE`, `LOCAL_PG_USER`, `LOCAL_PG_PASSWORD`

## Comandos principales

- Desarrollo frontend:

```bash
npm run dev
```

- Build de produccion:

```bash
npm run build
```

- Lint:

```bash
npm run lint
```

- Preview del build:

```bash
npm run preview
```

## Sync/backup local (opcional)

- Levantar servidor local de sincronizacion:

```bash
node server/local_sync_server.js
```

- Ejecutar backup completo Supabase -> PostgreSQL local:

```bash
node server/sync_to_local.js
```

## Convenciones

- Usa alias `@` para importar desde `src/app`.
- Componentes de dominio en `src/app/components/<feature>`.
- SQL centralizado en `database/`.
- Scripts operativos centralizados en `scripts/`.

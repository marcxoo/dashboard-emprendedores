-- =============================================
-- ESQUEMA PARA POSTGRESQL LOCAL - BACKUP DE SUPABASE
-- Ejecutar este script en pgAdmin para crear las tablas
-- =============================================

-- 1. Tabla principal de emprendedores
CREATE TABLE IF NOT EXISTS entrepreneurs (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    nombre_emprendimiento TEXT,
    persona_contacto TEXT,
    telefono TEXT,
    correo TEXT,
    ciudad TEXT,
    actividad_economica TEXT,
    red_social TEXT,
    subcategoria_interna TEXT,
    categoria_principal TEXT,
    semaforizacion TEXT,
    veces_en_stand INTEGER DEFAULT 0,
    ultima_semana_participacion TEXT,
    ruc TEXT,
    notas TEXT
);

-- 2. Tabla de asignaciones de stands
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    id_asignacion TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    id_emprendedor INTEGER,
    id_stand INTEGER,
    semana TEXT,
    jornada TEXT,
    bloque TEXT,
    asistio BOOLEAN,
    estado TEXT,
    comentarios TEXT
);

-- 3. Tabla de ganancias
CREATE TABLE IF NOT EXISTS earnings (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    entrepreneur_id INTEGER,
    entrepreneur_name TEXT,
    amount NUMERIC,
    date DATE,
    week TEXT,
    notes TEXT
);

-- 4. Tabla de encuestas personalizadas
CREATE TABLE IF NOT EXISTS custom_surveys (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT,
    description TEXT,
    note TEXT,
    response_limit INTEGER,
    event_date DATE,
    event_time TEXT,
    event_location TEXT,
    show_urgency_banner BOOLEAN DEFAULT false,
    questions JSONB,
    survey_type TEXT,
    active BOOLEAN DEFAULT true
);

-- 5. Tabla de respuestas de encuestas
CREATE TABLE IF NOT EXISTS survey_responses (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    survey_id TEXT REFERENCES custom_surveys(id) ON DELETE CASCADE,
    answers JSONB
);

-- 6. Tabla de logs de invitaciones
CREATE TABLE IF NOT EXISTS invitation_logs (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    entrepreneur_id INTEGER,
    channel TEXT,
    message TEXT,
    status TEXT
);

-- 7. Tabla de ferias
CREATE TABLE IF NOT EXISTS fairs (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    date DATE,
    location TEXT,
    description TEXT,
    status TEXT DEFAULT 'active'
);

-- 8. Tabla de emprendedores de ferias
CREATE TABLE IF NOT EXISTS fair_entrepreneurs (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    business_name TEXT,
    category TEXT,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'active'
);

-- 9. Tabla de asignaciones de ferias
CREATE TABLE IF NOT EXISTS fair_assignments (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    fair_id TEXT REFERENCES fairs(id) ON DELETE CASCADE,
    entrepreneur_id TEXT REFERENCES fair_entrepreneurs(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'assigned',
    notes TEXT,
    UNIQUE(fair_id, entrepreneur_id)
);

-- 10. Tabla de ventas de ferias
CREATE TABLE IF NOT EXISTS fair_sales (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    fair_id TEXT REFERENCES fairs(id) ON DELETE CASCADE,
    entrepreneur_id TEXT REFERENCES fair_entrepreneurs(id) ON DELETE CASCADE,
    amount NUMERIC DEFAULT 0,
    notes TEXT
);

-- 11. Tabla de eventos 2026
CREATE TABLE IF NOT EXISTS events_2026 (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    month TEXT NOT NULL,
    type TEXT NOT NULL,
    name TEXT,
    scope TEXT,
    guest TEXT,
    date DATE,
    "startTime" TIME,
    "endTime" TIME,
    location TEXT,
    responsibles TEXT[],
    indicator TEXT,
    tracking JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active'
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_entrepreneurs_correo ON entrepreneurs(correo);
CREATE INDEX IF NOT EXISTS idx_entrepreneurs_categoria ON entrepreneurs(categoria_principal);
CREATE INDEX IF NOT EXISTS idx_assignments_semana ON assignments(semana);
CREATE INDEX IF NOT EXISTS idx_assignments_emprendedor ON assignments(id_emprendedor);

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Esquema creado exitosamente. Tablas listas para backup.';
END $$;

-- Esquema de persistencia de LINO para Neon PostgreSQL.
-- El inicializador scripts/init-postgres.js ejecuta estas mismas definiciones.

CREATE TABLE IF NOT EXISTS lino_tienda_state (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  documento JSONB NOT NULL,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lino_usuarios_state (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  usuarios JSONB NOT NULL DEFAULT '[]'::jsonb,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

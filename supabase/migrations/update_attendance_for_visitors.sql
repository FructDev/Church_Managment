-- Migration to support Visitors in Attendance System

-- 1. Alter 'asistencia_actividades' table
-- Make 'miembro_id' nullable to allow records without a registered member (visitors)
ALTER TABLE asistencia_actividades
ALTER COLUMN miembro_id DROP NOT NULL;

-- 2. Add 'nombre_visitante' column to store the name of non-members
ALTER TABLE asistencia_actividades
ADD COLUMN IF NOT EXISTS nombre_visitante TEXT;

-- 3. Add 'tipo_asistente' to distinguish between 'miembro' and 'visitante'
-- Default to 'miembro' for existing records to maintain consistency
ALTER TABLE asistencia_actividades
ADD COLUMN IF NOT EXISTS tipo_asistente TEXT DEFAULT 'miembro';

-- Optional: Add a check constraint to ensure data integrity
-- Either member_id is present OR guest_name is present (but not both empty, theoretically)
-- ALTER TABLE asistencia_actividades
-- ADD CONSTRAINT check_asistente_valido 
-- CHECK (
--   (tipo_asistente = 'miembro' AND miembro_id IS NOT NULL) OR 
--   (tipo_asistente = 'visitante' AND nombre_visitante IS NOT NULL)
-- );

COMMENT ON COLUMN asistencia_actividades.nombre_visitante IS 'Name of the visitor if the attendee is not a member';
COMMENT ON COLUMN asistencia_actividades.tipo_asistente IS 'Type of attendee: "miembro" or "visitante"';

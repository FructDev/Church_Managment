-- Fix RLS Policies for Finance Roles (Tesorero General)

-- 1. Transacciones (Ingresos/Egresos)
DROP POLICY IF EXISTS "Acceso total a financieros" ON "public"."transacciones";
CREATE POLICY "Acceso total a financieros" ON "public"."transacciones"
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
);

-- 2. Presupuestos
DROP POLICY IF EXISTS "Acceso total a financieros presupuestos" ON "public"."presupuestos";
CREATE POLICY "Acceso total a financieros presupuestos" ON "public"."presupuestos"
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
);

-- 3. Líneas de Presupuesto
DROP POLICY IF EXISTS "Acceso total a financieros lineas" ON "public"."lineas_presupuesto";
CREATE POLICY "Acceso total a financieros lineas" ON "public"."lineas_presupuesto"
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
);

-- 4. Cuentas Bancarias
DROP POLICY IF EXISTS "Acceso total a financieros cuentas" ON "public"."cuentas_bancarias";
CREATE POLICY "Acceso total a financieros cuentas" ON "public"."cuentas_bancarias"
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
);

-- 5. Movimientos Bancarios
DROP POLICY IF EXISTS "Acceso total a financieros mov bancarios" ON "public"."movimientos_bancarios";
CREATE POLICY "Acceso total a financieros mov bancarios" ON "public"."movimientos_bancarios"
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
);

-- 6. Caja Chica
DROP POLICY IF EXISTS "Acceso total a financieros caja chica" ON "public"."caja_chica";
CREATE POLICY "Acceso total a financieros caja chica" ON "public"."caja_chica"
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
);

-- 7. Movimientos Caja Chica
DROP POLICY IF EXISTS "Acceso total a financieros mov caja" ON "public"."movimientos_caja_chica";
CREATE POLICY "Acceso total a financieros mov caja" ON "public"."movimientos_caja_chica"
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
);

-- 8. Diezmos
DROP POLICY IF EXISTS "Acceso total a financieros diezmos" ON "public"."diezmos";
CREATE POLICY "Acceso total a financieros diezmos" ON "public"."diezmos"
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE rol IN ('admin', 'tesorero_general', 'tesorero', 'pastor', 'secretario_general')
  )
);

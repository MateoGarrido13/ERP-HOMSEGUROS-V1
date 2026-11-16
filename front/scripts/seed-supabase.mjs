// Histórico: las 3 cuentas de ejemplo se cargan ahora con `supabase/seed.sql`
// en cada `supabase db reset`. Este script queda por si hace falta recrearlas
// vía Auth Admin API sin resetear la base.
//
//   node --env-file=.env.local scripts/seed-supabase.mjs
//
// Usa la service role key (nunca la anon key): es el único lugar donde esa
// key se usa, fuera del navegador.

import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Corré con " +
      "node --env-file=front/.env.local supabase/seed.mjs",
  );
}

// Node 20 no tiene WebSocket global (llega en Node 22+); supabase-js lo
// necesita para el cliente de Realtime aunque este script no lo use.
const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});

const organizacion = "HOM Profesionales en Seguros";

const cuentas = [
  {
    email: "martin.gomez@hom.com.ar",
    password: "Martin2026",
    nombre: "Martín",
    apellido: "Gómez",
    dni: 25108421,
    telefono: "11 4321-9088",
    rol: "pas",
    matricula: "42108",
  },
  {
    email: "laura.rios@hom.com.ar",
    password: "Red2026",
    nombre: "Laura",
    apellido: "Ríos",
    dni: 27554213,
    telefono: "11 4321-2200",
    rol: "directivo",
  },
  {
    email: "pablo.sosa@hom.com.ar",
    password: "Admin2026",
    nombre: "Pablo",
    apellido: "Sosa",
    dni: 30112987,
    telefono: "11 4321-3311",
    rol: "administrativo",
  },
];

for (const cuenta of cuentas) {
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: cuenta.email,
    password: cuenta.password,
    email_confirm: true,
  });

  if (authError) {
    throw new Error(`No se pudo crear ${cuenta.email} en Supabase Auth: ${authError.message}`);
  }

  const { error: usuarioError } = await supabase.from("usuario").insert({
    id: authUser.user.id,
    email: cuenta.email,
    nombre: cuenta.nombre,
    apellido: cuenta.apellido,
    dni: cuenta.dni,
    telefono: cuenta.telefono,
    rol: cuenta.rol,
    organizacion,
    estado: "activo",
  });

  if (usuarioError) {
    throw new Error(`No se pudo crear la fila de usuario para ${cuenta.email}: ${usuarioError.message}`);
  }

  if (cuenta.rol === "pas") {
    const { error: productorError } = await supabase.from("productor").insert({
      id: authUser.user.id,
      matricula_ssn: cuenta.matricula,
    });

    if (productorError) {
      throw new Error(`No se pudo crear la fila de productor para ${cuenta.email}: ${productorError.message}`);
    }
  }

  console.log(`Creado: ${cuenta.email} (${cuenta.rol})`);
}

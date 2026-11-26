// Datos de ejemplo de desarrollo, ADITIVO e IDEMPOTENTE: se puede correr
// varias veces y sobre una base con datos; no borra usuarios ni cuentas.
//
//   node --env-file=.env.local scripts/seed-supabase.mjs
//
// 1. Cuentas de ejemplo (SUP-1 de la épica Acceso): se crean solo las que
//    faltan (por email). Incluye un segundo PAS para probar el aislamiento
//    (CA-7 de ERP-17).
// 2. Datos de ERP-17: asegurados y pólizas ficticios de cada PAS, y sus
//    avisos y leads. Los avisos y leads de las cuentas de ejemplo se
//    reemplazan en cada corrida (las fechas son relativas a hoy).
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
      "node --env-file=.env.local scripts/seed-supabase.mjs desde front/",
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
    email: "sofia.benitez@hom.com.ar",
    password: "Sofia2026",
    nombre: "Sofía",
    apellido: "Benítez",
    dni: 28774510,
    telefono: "11 4321-7755",
    rol: "pas",
    matricula: "43377",
  },
  {
    // PAS sin avisos ni leads (no figura en `datosPorPas`): sirve para probar
    // los estados vacíos de /pendientes (ERP-17 CA-2 y CA-4).
    email: "ignacio.vega@hom.com.ar",
    password: "Ignacio2026",
    nombre: "Ignacio",
    apellido: "Vega",
    dni: 29887766,
    telefono: "11 4321-4400",
    rol: "pas",
    matricula: "44550",
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

function falla(mensaje, error) {
  throw new Error(`${mensaje}: ${error.message}`);
}

async function asegurarCuenta(cuenta) {
  const { data: existente, error: errBuscar } = await supabase
    .from("usuario")
    .select("id")
    .eq("email", cuenta.email)
    .maybeSingle();
  if (errBuscar) falla(`No se pudo buscar ${cuenta.email}`, errBuscar);

  let id = existente?.id;
  if (!id) {
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: cuenta.email,
      password: cuenta.password,
      email_confirm: true,
    });
    if (authError) falla(`No se pudo crear ${cuenta.email} en Supabase Auth`, authError);
    id = authUser.user.id;

    const { error: usuarioError } = await supabase.from("usuario").insert({
      id,
      email: cuenta.email,
      nombre: cuenta.nombre,
      apellido: cuenta.apellido,
      dni: cuenta.dni,
      telefono: cuenta.telefono,
      rol: cuenta.rol,
      organizacion,
      estado: "activo",
    });
    if (usuarioError) falla(`No se pudo crear la fila de usuario para ${cuenta.email}`, usuarioError);
    console.log(`Creado: ${cuenta.email} (${cuenta.rol})`);
  }

  if (cuenta.rol === "pas") {
    const { error: productorError } = await supabase
      .from("productor")
      .upsert({ id, matricula_ssn: cuenta.matricula }, { onConflict: "id", ignoreDuplicates: true });
    if (productorError) falla(`No se pudo crear la fila de productor para ${cuenta.email}`, productorError);
  }

  return id;
}

// --- Datos de ERP-17 -------------------------------------------------------

function hoyArgentina() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function haceDias(dias) {
  const [a, m, d] = hoyArgentina().split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d - dias)).toISOString().slice(0, 10);
}

// Cada cliente tiene una póliza; `cobertura` es la del aviso (enum de la spec).
const datosPorPas = {
  "martin.gomez@hom.com.ar": {
    clientes: [
      { nombre: "Diego", apellido: "Ruiz", dni: "30111001", poliza: "AU-7788120", tipo: "AU", cobertura: "Automotor" },
      { nombre: "Laura", apellido: "Pérez", dni: "30111002", poliza: "HO-5521904", tipo: "HO", cobertura: "Integrales" },
      { nombre: "Camila", apellido: "Torres", dni: "30111003", poliza: "AU-7790233", tipo: "AU", cobertura: "Automotor" },
      { nombre: "Jorge", apellido: "Fernández", dni: "30111004", poliza: "AU-7791345", tipo: "AU", cobertura: "Automotor" },
      { nombre: "Marta", apellido: "Quiroga", dni: "30111005", poliza: "HO-5522016", tipo: "HO", cobertura: "Hogar" },
      { nombre: "Ramiro", apellido: "Suárez", dni: "30111006", poliza: "AU-7792457", tipo: "AU", cobertura: "Automotor" },
    ],
    // [índice de cliente, tipo, días atrás]
    avisos: [
      [0, "pago-rechazado", 35],
      [1, "cumpleanos", 34],
      [2, "cotizacion-enviada", 38],
      [3, "enviar-poliza", 29],
      [4, "pago-rechazado", 20],
      [5, "cumpleanos", 18],
      [0, "enviar-poliza", 15],
      [1, "cotizacion-enviada", 12],
      [2, "pago-rechazado", 10],
      [3, "cumpleanos", 7],
      [4, "enviar-poliza", 3],
      [5, "cotizacion-enviada", 0],
    ],
    // [cliente, ramo, origen, descripción, días atrás]
    leads: [
      ["Valeria Gómez", "Automotor", "Cotización enviada", "Quería asegurar un Fiat Cronos 2021. Se ofreció terceros completo y todavía no respondió.", 0],
      ["Nicolás Ibarra", "Hogar", "Retiró el bien", "Retiró el bien de su casa de la póliza anterior; espera nueva propuesta.", 1],
      ["Carolina Méndez", "Automotor", "Cotización enviada", "Consultó por una camioneta. Pidió comparar con otra compañía.", 3],
      ["Esteban Roldán", "Hogar", "Cotización enviada", "Departamento de dos ambientes en Caballito.", 5],
      ["Julieta Paz", "Accidentes personales", "Cotización enviada", "Cobertura para su equipo de fútbol amateur.", 8],
      ["Hernán Castro", "Automotor", "Retiró el bien", "Vendió el auto y vuelve a cotizar en unos días.", 10],
      ["Lucía Navarro", "ART", "Cotización enviada", "Estudio contable con cuatro empleados.", 14],
      ["Tomás Aguirre", "Hogar", "Cotización enviada", "Casa en country, pidió incluir objetos de valor.", 17],
      ["Mónica Ledesma", "Automotor", "Retiró el bien", "Cambió de vehículo; necesita cotización del nuevo.", 21],
      ["Sebastián Vera", "Automotor", "Cotización enviada", "Moto 150 cc, primera vez que se asegura.", 26],
      ["Florencia Díaz", "Hogar", "Cotización enviada", "Alquila; quiere cobertura básica.", 40],
    ],
  },
  "sofia.benitez@hom.com.ar": {
    clientes: [
      { nombre: "Andrea", apellido: "Molina", dni: "31222001", poliza: "AU-8801001", tipo: "AU", cobertura: "Automotor" },
      { nombre: "Gustavo", apellido: "Herrera", dni: "31222002", poliza: "HO-6602002", tipo: "HO", cobertura: "Hogar" },
    ],
    avisos: [
      [0, "pago-rechazado", 6],
      [1, "enviar-poliza", 2],
    ],
    leads: [
      ["Patricia Luna", "Hogar", "Cotización enviada", "Lead de la otra PAS: no lo debe ver Martín.", 2],
      ["Damián Rey", "Automotor", "Retiró el bien", "Lead de la otra PAS.", 9],
    ],
  },
};

async function asegurarAseguradora() {
  const { data, error } = await supabase
    .from("aseguradora")
    .upsert({ codigo: "DEMO", nombre: "Aseguradora de ejemplo" }, { onConflict: "codigo" })
    .select("id")
    .single();
  if (error) falla("No se pudo asegurar la aseguradora de ejemplo", error);
  return data.id;
}

async function asegurarCliente(idProductor, idAseguradora, c) {
  let { data: asegurado, error } = await supabase
    .from("asegurado")
    .select("id")
    .eq("id_productor", idProductor)
    .eq("numero_documento", c.dni)
    .maybeSingle();
  if (error) falla(`No se pudo buscar al asegurado ${c.apellido}`, error);

  if (!asegurado) {
    ({ data: asegurado, error } = await supabase
      .from("asegurado")
      .insert({
        id_productor: idProductor,
        nombre: c.nombre,
        apellido: c.apellido,
        email: `${c.nombre}.${c.apellido}@ejemplo.test`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""),
        tipo_documento_sigla: "DNI",
        numero_documento: c.dni,
      })
      .select("id")
      .single());
    if (error) falla(`No se pudo crear al asegurado ${c.apellido}`, error);
  }

  let { data: poliza, error: errPoliza } = await supabase
    .from("poliza")
    .select("id")
    .eq("id_aseguradora", idAseguradora)
    .eq("tipo", c.tipo)
    .eq("numero_poliza", c.poliza)
    .maybeSingle();
  if (errPoliza) falla(`No se pudo buscar la póliza ${c.poliza}`, errPoliza);

  if (!poliza) {
    ({ data: poliza, error: errPoliza } = await supabase
      .from("poliza")
      .insert({
        numero_poliza: c.poliza,
        id_aseguradora: idAseguradora,
        id_asegurado: asegurado.id,
        tipo: c.tipo,
        valor_poliza: 1500000,
        fecha_inicio: haceDias(200),
        fecha_fin: haceDias(-165),
        fecha_prox_pago: haceDias(-10),
        cuotas: 12,
      })
      .select("id")
      .single());
    if (errPoliza) falla(`No se pudo crear la póliza ${c.poliza}`, errPoliza);
  }

  return { idAsegurado: asegurado.id, idPoliza: poliza.id };
}

async function sembrarPendientes(email, idProductor, idAseguradora) {
  const datos = datosPorPas[email];
  if (!datos) return;

  const ids = [];
  for (const cliente of datos.clientes) {
    ids.push(await asegurarCliente(idProductor, idAseguradora, cliente));
  }

  // Reemplaza solo los avisos y leads de esta cuenta de ejemplo.
  for (const tabla of ["aviso", "lead"]) {
    const { error } = await supabase.from(tabla).delete().eq("id_productor", idProductor);
    if (error) falla(`No se pudieron limpiar ${tabla}s de ${email}`, error);
  }

  const { error: errAvisos } = await supabase.from("aviso").insert(
    datos.avisos.map(([i, tipo, dias]) => ({
      id_productor: idProductor,
      id_asegurado: ids[i].idAsegurado,
      id_poliza: ids[i].idPoliza,
      cobertura: datos.clientes[i].cobertura,
      tipo,
      fecha_importancia: haceDias(dias),
    })),
  );
  if (errAvisos) falla(`No se pudieron crear los avisos de ${email}`, errAvisos);

  const { error: errLeads } = await supabase.from("lead").insert(
    datos.leads.map(([cliente_nombre, ramo, origen, descripcion, dias]) => ({
      id_productor: idProductor,
      cliente_nombre,
      ramo,
      origen,
      descripcion,
      actualizado_en: haceDias(dias),
    })),
  );
  if (errLeads) falla(`No se pudieron crear los leads de ${email}`, errLeads);

  console.log(`Pendientes de ${email}: ${datos.avisos.length} avisos, ${datos.leads.length} leads`);
}

const idAseguradora = await asegurarAseguradora();
for (const cuenta of cuentas) {
  const id = await asegurarCuenta(cuenta);
  if (cuenta.rol === "pas") await sembrarPendientes(cuenta.email, id, idAseguradora);
}
console.log("Listo.");

import "server-only";

import { createClient } from "../supabase/server";
import { mapearAvisos, mapearLeads, type FilaAviso, type FilaLead, type PendientesRepo } from "./repo";
import type { Aviso, Lead } from "./types";

// Única implementación de PendientesRepo y único archivo del módulo que toca
// el SDK de Supabase. Corre con el cliente de la sesión del PAS: la RLS de
// `aviso` y `lead` (y el filtro por auth.uid() dentro de avisos_del_productor())
// limita lo que ve a su propio id_productor aunque `pasId` viniera mal.
// Solo lecturas: este módulo no escribe nada (RN-7, CA-8).
export class PendientesRepoSupabase implements PendientesRepo {
  // El alcance de los avisos lo fija auth.uid() dentro de la función, que es
  // el mismo id que `pasId` (sale de la sesión); no se confía en el argumento.
  async avisosDe(): Promise<Aviso[]> {
    const supabase = await createClient();
    // Función SECURITY DEFINER: resuelve cliente y número de póliza (tablas
    // cuya RLS no usa auth.uid()). Devuelve ya ordenado por fecha DESC.
    const { data, error } = await supabase.rpc("avisos_del_productor");
    if (error) throw new Error(`No se pudieron leer los avisos: ${error.message}`);
    return mapearAvisos((data ?? []) as FilaAviso[]);
  }

  async leadsDe(pasId: string): Promise<Lead[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lead")
      .select("id, origen, cliente_nombre, ramo, descripcion, actualizado_en")
      .eq("id_productor", pasId)
      .order("actualizado_en", { ascending: false })
      .order("created_at", { ascending: false })
      .returns<FilaLead[]>();
    if (error) throw new Error(`No se pudieron leer los leads: ${error.message}`);
    return mapearLeads(data ?? []);
  }
}

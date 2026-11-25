import { PendientesRepoSupabase } from "./repo.supabase";

// Punto único de entrada para las pantallas: si cambia la implementación,
// solo se toca este archivo.
export const pendientesRepo = new PendientesRepoSupabase();

/**
 * Entry point de la Edge Function `cotizar` (Supabase Edge Functions / Deno).
 *
 * Arraigado en: ADR-004, ADR-005 (contrato HTTP), ADR-006 (auth punto de extensión).
 *
 * Routing:
 * - POST /cotizar -> handler.handleCotizar
 * - Cualquier otro método -> 405 Method Not Allowed
 * - Cualquier otra ruta -> 404
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCotizar } from "./handler.ts";

const ALLOWED_METHODS = ["POST", "OPTIONS"];

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*", // TODO: restringir por variable de entorno (ADR-005)
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type, authorization",
      },
    });
  }

  // Solo POST permitido
  if (!ALLOWED_METHODS.includes(req.method)) {
    return new Response(
      JSON.stringify({ error: { code: "METODO_NO_PERMITIDO" } }),
      {
        status: 405,
        headers: {
          "content-type": "application/json",
          allow: "POST",
        },
      }
    );
  }

  // Ruta soportada: POST /cotizar
  if (url.pathname === "/cotizar" || url.pathname === "/cotizar/") {
    return handleCotizar(req);
  }

  return new Response(
    JSON.stringify({ error: { code: "RUTA_NO_ENCONTRADA" } }),
    {
      status: 404,
      headers: { "content-type": "application/json" },
    }
  );
}

serve(handler);

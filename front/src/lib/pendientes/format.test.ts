import { describe, expect, it } from "vitest";

import {
  avisoCountLabel,
  diasTranscurridosLabel,
  etiquetaTipoAviso,
  fechaHoyArgentina,
  formatFecha,
  leadCountLabel,
  paginar,
} from "./format";

describe("contadores", () => {
  it("avisos: 0, 1 y N", () => {
    expect(avisoCountLabel(0)).toBe("0 avisos");
    expect(avisoCountLabel(1)).toBe("1 aviso");
    expect(avisoCountLabel(7)).toBe("7 avisos");
  });

  it("leads: 0, 1 y M", () => {
    expect(leadCountLabel(0)).toBe("0 leads");
    expect(leadCountLabel(1)).toBe("1 lead");
    expect(leadCountLabel(3)).toBe("3 leads");
  });
});

describe("formatFecha", () => {
  it("convierte aaaa-mm-dd a dd/mm/aaaa", () => {
    expect(formatFecha("2026-10-21")).toBe("21/10/2026");
  });
});

describe("diasTranscurridosLabel", () => {
  const hoy = "2026-11-25";

  it("hoy, ayer y hace N días", () => {
    expect(diasTranscurridosLabel("2026-11-25", hoy)).toBe("Cargado hoy");
    expect(diasTranscurridosLabel("2026-11-24", hoy)).toBe("1 día transcurrido");
    expect(diasTranscurridosLabel("2026-11-15", hoy)).toBe("10 días transcurridos");
  });

  it("cruza meses y años", () => {
    expect(diasTranscurridosLabel("2025-12-31", "2026-01-02")).toBe("2 días transcurridos");
  });

  it("fecha futura se trata como hoy", () => {
    expect(diasTranscurridosLabel("2026-12-01", hoy)).toBe("Cargado hoy");
  });
});

describe("fechaHoyArgentina", () => {
  it("usa el día calendario de Buenos Aires, no el de UTC", () => {
    // 01:30 UTC del 26 = 22:30 del 25 en Argentina (UTC-3).
    expect(fechaHoyArgentina(new Date("2026-11-26T01:30:00Z"))).toBe("2026-11-25");
    // 03:00 UTC del 26 = 00:00 del 26 en Argentina.
    expect(fechaHoyArgentina(new Date("2026-11-26T03:00:00Z"))).toBe("2026-11-26");
  });
});

describe("etiquetaTipoAviso", () => {
  it("devuelve la etiqueta de cada tipo", () => {
    expect(etiquetaTipoAviso("pago-rechazado")).toBe("Pago rechazado");
    expect(etiquetaTipoAviso("cumpleanos")).toBe("Cumpleaños");
    expect(etiquetaTipoAviso("cotizacion-enviada")).toBe("Cotización enviada");
    expect(etiquetaTipoAviso("enviar-poliza")).toBe("Enviar póliza");
  });
});

describe("paginar", () => {
  const items = Array.from({ length: 12 }, (_, i) => i + 1);

  it("devuelve la página pedida y el total de páginas", () => {
    expect(paginar(items, 1, 5)).toEqual({ items: [1, 2, 3, 4, 5], pagina: 1, totalPaginas: 3 });
    expect(paginar(items, 3, 5)).toEqual({ items: [11, 12], pagina: 3, totalPaginas: 3 });
  });

  it("acota páginas fuera de rango y soporta lista vacía", () => {
    expect(paginar(items, 99, 10).pagina).toBe(2);
    expect(paginar(items, 0, 10).pagina).toBe(1);
    expect(paginar([], 1, 5)).toEqual({ items: [], pagina: 1, totalPaginas: 1 });
  });
});

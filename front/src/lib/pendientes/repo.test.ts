import { describe, expect, it, vi } from "vitest";

import { mapearAvisos, mapearLeads, type FilaAviso } from "./repo";

const fila = (over: Partial<FilaAviso> = {}): FilaAviso => ({
  id: "a1",
  tipo: "pago-rechazado",
  cobertura: "Automotor",
  fecha_importancia: "2026-10-21",
  cliente_apellido: "Ruiz",
  cliente_nombre: "Diego",
  numero_poliza: "AU-7788120",
  ...over,
});

describe("mapearAvisos", () => {
  it("mapea cliente, número de póliza y fecha, conservando el orden", () => {
    const avisos = mapearAvisos([fila({ id: "a1" }), fila({ id: "a2", tipo: "cumpleanos" })]);
    expect(avisos.map((a) => a.id)).toEqual(["a1", "a2"]);
    expect(avisos[0]).toEqual({
      id: "a1",
      tipo: "pago-rechazado",
      cobertura: "Automotor",
      fechaImportancia: "2026-10-21",
      cliente: { apellido: "Ruiz", nombre: "Diego" },
      numeroPoliza: "AU-7788120",
    });
  });

  it("descarta y registra un tipo fuera de RN-3 (CA-9)", () => {
    const registrar = vi.fn();
    const avisos = mapearAvisos([fila({ id: "ok" }), fila({ id: "mal", tipo: "enviar-cupon" })], registrar);
    expect(avisos.map((a) => a.id)).toEqual(["ok"]);
    expect(registrar).toHaveBeenCalledTimes(1);
    expect(registrar.mock.calls[0][0]).toContain("mal");
  });
});

describe("mapearLeads", () => {
  it("convierte las columnas al tipo Lead", () => {
    expect(
      mapearLeads([
        { id: "l1", origen: "Retiró el bien", cliente_nombre: "Ana", ramo: "Hogar", descripcion: "x", actualizado_en: "2026-11-01" },
      ]),
    ).toEqual([
      { id: "l1", origen: "Retiró el bien", clienteNombre: "Ana", ramo: "Hogar", descripcion: "x", actualizadoEn: "2026-11-01" },
    ]);
  });
});

---
status: draft
phase: 0
---

# Inventario verificado — iteración 1 (Phase 0)

Los casos de uso canónicos siguen en `front/docs/casos-de-uso/`. Este índice no los reemplaza: apunta a las rutas reales y las agrupa por feature SDD. Fuente de IDs in-scope: `PLAN_CON_SKILLS.MD` §3. Decisiones cerradas: `front/docs/cuestiones-a-resolver.md` «Resuelto (iteración 1)».

Índice narrativo del producto (no recreado aquí): [`front/docs/casos-de-uso/lista-casos-de-uso-HOM-ERP.md`](../front/docs/casos-de-uso/lista-casos-de-uso-HOM-ERP.md).

## Quick path

1. Leer el CU canónico por su ruta (tabla de abajo).
2. Cruzar el CU con la feature (`F-pendientes`, `F-multicotizador-auto`, `F-cartera`).
3. Tratar el prototipo Next como UX as-built, no como stack. Desvíos (un solo registro): [`as-built-prototipo-iteracion-1.md`](as-built-prototipo-iteracion-1.md).
4. Specify del walking skeleton puede incluir comparar (CU-18 ya tiene cuerpo).

## Features SDD

| Feature ID | Slice | CU ancla | Walking skeleton |
| --- | --- | --- | --- |
| `F-pendientes` | Bandeja avisos/leads | CU-05, CU-08* | CU-08d, CU-05d |
| `F-multicotizador-auto` | Hub ramos con API (Auto, Hogar, Consorcio, Comercio) | CU-09–18, CU-17b | CU-09 → CU-10 → CU-17 / CU-17b → CU-18 → CU-13 → CU-14 |
| `F-cartera` | Clientes y pólizas vigentes | CU-22–29 | CU-16 (`activa=true`) → CU-22 / CU-25 / CU-27 |

Seam: CU-08d abre cotizar; CU-16 es «Dar de alta» en Pendientes; CU-23 «+» redirige a cotizar.

## Inventario in-scope

Rutas relativas a `front/docs/casos-de-uso/`. **Presente** = cuerpo de CU (flujo, RN/SUP). **Stub** = archivo con solo el título. Ningún ID in-scope está ausente del disco.

### `F-pendientes`

| CU | Archivo | Estado |
| --- | --- | --- |
| CU-05 | `PAS/pendientes/CU-05-Pendientes_Ver_Pendientes.md` | presente |
| CU-05b | `PAS/pendientes/CU-05b-Pendientes_Aviso_Cumpleanos.md` | presente |
| CU-05c | `PAS/pendientes/CU-05c-Pendientes_Aviso_Pago_Rechazado.md` | presente |
| CU-05d | `PAS/pendientes/CU-05d-Pendientes_Aviso_Cotizacion_Enviada.md` | presente |
| CU-05e | `PAS/pendientes/CU-05e-Pendientes_Aviso_Enviar_Poliza.md` | presente |
| CU-05f | `PAS/pendientes/CU-05f-Pendientes_Aviso_Enviar_Cupon.md` | presente |
| CU-08b | `PAS/pendientes/CU-08b-Pendientes_Reactivar_Lead.md` | presente |
| CU-08c | `PAS/pendientes/CU-08c-Pendientes_Descartar_Lead.md` | presente |
| CU-08d | `PAS/pendientes/CU-08d-Lead_Enviar_Cotizacion.md` | presente |
| CU-08e | `PAS/pendientes/CU-08e-Pendientes_Editar_Descripcion_Lead.md` | presente |

Compañero de transiciones (no es un CU): `PAS/pendientes/TRANSICIONES.md`.

### `F-multicotizador-auto`

| CU | Archivo | Estado |
| --- | --- | --- |
| CU-09 | `PAS/multicotizador/CU-09-Multicotizador_Elegir_Ramo.md` | presente |
| CU-10 | `PAS/multicotizador/CU-10-Multicotizador_Seleccionar_o_Crear_Cliente.md` | presente |
| CU-11 | `PAS/multicotizador/CU-11-Multicotizador_Recotizar_Poliza_Existente.md` | presente |
| CU-12 | `PAS/multicotizador/CU-12-Multicotizador_Guardar_y_Retomar_Cotizacion.md` | presente (iteración 1: solo sesión; persistir fuera) |
| CU-13 | `PAS/multicotizador/CU-13-Multicotizador_Armar_Propuesta_y_Generar_PDF.md` | presente |
| CU-14 | `PAS/multicotizador/CU-14-Multicotizador_Enviar_Propuesta_por_WhatsApp.md` | presente |
| CU-15 | `PAS/multicotizador/CU-15-Multicotizador_Marcar_Resultado_de_Propuesta.md` | presente |
| CU-16 | `PAS/multicotizador/CU-16-Multicotizador_Registrar_Poliza_Emitida.md` | presente |
| CU-17 | `PAS/multicotizador/masivo/CU-17-Multicotizador_Cargar_Riesgo_Automotor.md` | presente |
| CU-17b | `PAS/multicotizador/masivo/CU-17b-Multicotizador_Cargar_Riesgo_Hogar_Consorcio_Comercio.md` | presente |
| CU-18 | `PAS/multicotizador/masivo/CU-18-Multicotizador_Comparar_Cotizaciones.md` | presente |

### `F-cartera`

| CU | Archivo | Estado |
| --- | --- | --- |
| CU-22 | `PAS/cartera-cliente/CU-22-Cartera_Buscar_y_Filtrar_Clientes.md` | presente |
| CU-23 | `PAS/cartera-cliente/CU-23-Cartera_Dar_de_Alta_Cliente.md` | presente (título canónico: «Sumar una póliza con "+"») |
| CU-24 | `PAS/cartera-cliente/CU-24-Cartera_Editar_Cliente.md` | presente |
| CU-25 | `PAS/cartera-cliente/CU-25-Cartera_Ver_Ficha_Cliente.md` | presente |
| CU-26 | `PAS/cartera-cliente/CU-26-Cartera_Ver_Cartera_por_Ramo.md` | presente |
| CU-27 | `PAS/cartera-cliente/CU-27-Cartera_Ver_Detalle_Poliza.md` | presente |
| CU-28 | `PAS/cartera-cliente/CU-28-Cartera_Enviar_Poliza.md` | presente |
| CU-29 | `PAS/cartera-cliente/CU-29-Cartera_Cargar_Polizas_Existentes.md` | presente |

## Fuera de alcance (en disco, no inventariar como entrega)

| CU | Archivo | Estado | Nota |
| --- | --- | --- | --- |
| CU-19 | `PAS/multicotizador/masivo/CU-19-Multicotizador_Ver_Comision_de_Cotizacion.md` | stub | diferido |
| CU-20 | `PAS/multicotizador/masivo/CU-20-Multicotizador_Aplicar_Descuento.md` | stub | diferido |
| CU-21 | `PAS/multicotizador/no-masivo/CU-21-Multicotizador_Cargar_Solicitud.md` | stub | AP/ART y ramos sin API, fuera |

## Checklist

- [x] IDs in-scope del plan cruzados con archivos en disco.
- [x] Índice canónico no recreado.
- [x] CU-18 presente (flujo + RN; estimado diferido).
- [x] Prototipo descrito aparte, sin fusionar esquemas ni adoptarlo como stack.

## Next step

Phase 1: constitución alineada a `AGENTS.md` y NFR del hub. Specify (Phase 2) contra los CU, no contra las rutas del prototipo.

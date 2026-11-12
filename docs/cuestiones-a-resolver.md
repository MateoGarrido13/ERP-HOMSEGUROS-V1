# Cuestiones a resolver — casos de uso del multicotizador

Puntos donde los casos de uso se contradicen entre sí, contradicen al prototipo o dejan una decisión abierta. Cada uno indica qué reglas (RN) o supuestos (SUP) quedan inconsistentes y qué hay que decidir para que todo cierre.

Estado (iteración 1): escritos CU-09…21. Decisiones de consistencia de la iteración 1 están en «Resuelto». Lo que sigue abierto no bloquea el gate DoR.

Rutas relativas a `docs/casos-de-uso/PAS/multicotizador/`.

---

## Resuelto (iteración 1)

### A1. Orden: cliente antes del riesgo
**Canónico:** ramo (CU-09) → cliente (CU-10) → riesgo (CU-17 / CU-17b) → comparar (CU-18).  
El prototipo (`/cotizar/riesgo` → `/cotizar/asegurado`) queda desalineado; no es fuente de verdad.  
CU-10 `RN_8` cita CU-17 / CU-17b, no CU-18.

### A2. Unicidad del documento
**Canónico:** un asegurado está asociado a un solo PAS a la vez. El documento es único en la red.  
Si el PAS B informa un DNI de un cliente del PAS A, el sistema avisa que ya está asociado a otro productor, **sin mostrar ficha ni datos**, y no permite cotizarlo.

### A6. Cuándo entra a Cartera
**Canónico:** al enviar la propuesta (CU-14) el cliente se persiste con `activa=false` (no se muestra en Cartera).  
«Resolver → Dar de alta / Aceptar» en Pendientes **es CU-16**: nº de póliza, vigencia, compañía, y `activa=true`. Una propuesta enviada no alcanza para figurar en Cartera.

### B1 / B2. Ramos y masivo
**Canónico iteración 1:** habilitados Automotor, Hogar, Consorcio y Comercio, **solo contra compañías con API de cotización**. Masivo = hay API de precio.  
Fuera: AP, ART, y cualquier ramo sin API (CU-21). Walking skeleton cubre los cuatro ramos habilitados.

### C1. Cotización «En curso»
**Canónico iteración 1:** solo vive en la sesión. Si el PAS sale o cierra, se pierde. CU-12 persistido queda fuera de la iteración salvo retomar en la misma sesión.

### D. Nombre CU-23 y legado
El caso 23 se titula **Sumar una póliza con "+"**. El archivo se conserva como `CU-23-Cartera_Dar_de_Alta_Cliente.md`.  
El borrador `CU-Multicotizador-01` y el template duplicado están en `casos-de-uso/_legado/` (no canónicos).

### Prototipo vs canónico (Phase 0)

Lista única de desvíos del Next: [`specs/as-built-prototipo-iteracion-1.md`](specs/as-built-prototipo-iteracion-1.md). No reabre A1/B2. CU-18 ya no es stub.

---

## A. CU-10 Seleccionar o crear cliente

### A3. ¿El caso es igual para todos los ramos?
**Gravedad: media.** Abierto (no bloquea DoR). Personas jurídicas vs formulario de nombre y apellido. Relacionado con A5.

### A4. Cliente existente sin email o teléfono
**Gravedad: alta.** Abierto (no bloquea DoR). `RN_3` vs `RN_6` vs envío CU-14.

### A5. DNI opcional, pero quizás obligatorio para cotizar
**Gravedad: media.** Abierto: qué exigen las APIs (Mercantil Andina, Sancor, Zurich, La Segunda, Allianz y las que cubran Hogar/Consorcio/Comercio).

---

## B. CU-09 y estructura del multicotizador

### B3. Qué pasa al volver al selector de ramo
Abierto. Relacionado con CU-12 (solo sesión en iteración 1): al volver se descarta lo no enviado.

---

## C. CU-12 Guardar y retomar cotización

Diferido a una iteración posterior (persistencia). En iteración 1 no hay listado de «En curso» fuera de la sesión.

---

## Abierto de producto (no DoR)

- Estimado / caché mientras responde la compañía (CU-18): diferido; si se muestra, debe decir que no es precio real.
- Campos exactos del formulario de riesgo Hogar / Consorcio / Comercio: van en specs de adapter, no en el CU (ver CU-17b).

### Tipos de documento (`tipos_documento` / AFIP)
Catálogo en `sql/schema/schema.sql` y `TIPOS_DOCUMENTO.md`. `asegurado` usa `tipo_documento_sigla` + `numero_documento`. El `codigo_afip` queda para integraciones futuras. Pendiente: alinear `usuario.dni` del productor con el mismo modelo.

### Formularios Consorcio y Comercio + columnas en `schema.sql`
**Pendiente.** No implementar todavía. El prototipo no tiene `/cotizar/consorcio` ni `/cotizar/comercio`.

- `poliza_consorcio` y `poliza_comercio` ya existen (heredan de `poliza`, FK a `inmueble`).
- Consorcio hoy solo tiene edificio y administrador (detalle de cartera del mock).
- Comercio no tiene campos de riesgo extra.
- Al existir esos formularios: capturar sus campos (omitir Datos de envío) y **reflejarlos en esas tablas** (y en `inmueble` si aplica). Hasta entonces no inventar columnas. REF CU-17b SUP_4, `sql/schema/schema.sql`.

- CU-19/20 comisiones: fuera de iteración 1.
- Ticket de cobranza CU-31: fuera; el aviso CU-05c sí entra.

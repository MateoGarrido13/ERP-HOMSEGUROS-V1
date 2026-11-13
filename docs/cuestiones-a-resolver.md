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

### A3. Personas jurídicas vs formulario de nombre y apellido
**Resuelto (iteración 1).** El PAS puede cotizar a personas jurídicas (Consorcio y Comercio lo exigen). Si el tipo de documento es CUIT, el formulario muestra un solo campo «Razón social»; si no, nombre y apellido. En el esquema la razón social se guarda en `apellido` (ver comentario en `sql/schema/schema.sql`). Escrito en CU-10 `RN_3` y `SUP_5`.
Alineados CU-23, CU-24 y la validación de longitud por tipo de documento (DNI 7–8, CUIT 11). El tipo de documento se fija al crear al cliente y no se edita (CU-24 `RN_9`). Depende en parte de A5 (si el documento pasa a ser obligatorio).

### A4. Cliente existente sin email o teléfono
**Resuelto (iteración 1).** Un cliente existente al que le falta email o teléfono se puede cotizar igual. Este caso no lo completa: los datos de un cliente solo se editan en Cartera (CU-24). El faltante se resuelve al enviar la propuesta (CU-14: sin teléfono, el PAS elige el contacto a mano en WhatsApp). Completar datos en medio de la cotización queda para una iteración posterior. Escrito en CU-10 `RN_6` y `SUP_2`.

### A6b. CU-24 Editar cliente: tipo de documento y propagación
**Resuelto (iteración 1).** El tipo de documento no se edita desde CU-24: el PAS solicita el cambio y lo autoriza un administrativo (el caso de esa solicitud queda por escribir, CU-24 `SUP_5`). **Diferido:** no se escribe en la iteración 1; va junto con los casos del rol administrativo (CU-52 y relacionados). Mientras tanto se asume (por confirmar) que el administrativo corrige el tipo directamente, fuera del flujo del PAS. Cambiar el número de documento pide confirmación. Email y teléfono se propagan a lo abierto; lo cerrado conserva copia histórica. Escrito en CU-24 `RN_9`, `RN_10` y `RN_11`.

### A5. DNI opcional, pero quizás obligatorio para cotizar
**Resuelto (iteración 1): el documento (tipo y número) es obligatorio** al crear un cliente. Garantiza la unicidad en la red (A2), que sin documento no se puede verificar. Escrito en CU-10 `RN_3` y CU-24 `RN_2`. CU-29 (carga masiva) alineado: cada fila debe traer tipo y número de documento; sin documento es fila con error (CU-29 `RN_2` y `SUP_5`). Pendiente: confirmar con cada API qué exigen (puede pedir más datos del titular, CU-10 `SUP_1`) y si los archivos de las aseguradoras traen el documento. Lo que quedó abierto: qué exigen las APIs (Mercantil Andina, Sancor, Zurich, La Segunda, Allianz y las que cubran Hogar/Consorcio/Comercio).

---

## B. CU-09 y estructura del multicotizador

### B3. Qué pasa al volver al selector de ramo
**Resuelto (iteración 1).** Al volver al selector se descarta la cotización en curso no enviada (ramo, cliente y riesgo); al elegir un ramo se empieza de cero. Coherente con C1 (la cotización solo vive en la sesión) y con «una cotización, un ramo» (CU-09 `RN_4`). Escrito en CU-09 `SUP_5` y CU-10 `1a.3` y `SUP_9`. Conservar la cotización al volver es CU-12, diferido.
Ramo ya definido por un lead o una póliza (CU-09 `SUP_6`): resuelto. No se puede cambiar; «Volver» lleva al origen (Pendientes o ficha) y descarta lo no enviado. Para otro ramo se empieza una cotización nueva. Por confirmar: si existe un lead sin ramo definido.

---

## C. CU-12 Guardar y retomar cotización

Diferido a una iteración posterior (persistencia). En iteración 1 no hay listado de «En curso» fuera de la sesión.

---

## Abierto de producto (no DoR)

- Estimado / caché mientras responde la compañía (CU-18): diferido; si se muestra, debe decir que no es precio real.
- Campos exactos del formulario de riesgo Hogar / Consorcio / Comercio: van en specs de adapter, no en el CU (ver CU-17b).

### Tipos de documento (`tipos_documento` / AFIP)
Catálogo en `sql/schema/schema.sql` y `TIPOS_DOCUMENTO.md`. `asegurado` usa `tipo_documento_sigla` + `numero_documento`. El `codigo_afip` queda para integraciones futuras.

**Productor (`usuario.dni`): resuelto en lo funcional (iteración 1).** Un productor puede ser persona jurídica con CUIT. Por eso `usuario` debe usar el mismo modelo que `asegurado`: `tipo_documento_sigla` + `numero_documento` (texto), con validación por tipo (DNI 7–8, CUIT 11), y no `dni INTEGER` (un CUIT de 11 dígitos no entra en un entero de 32 bits). Así también se pueden comparar los documentos de ambas tablas cuando el productor figura como asegurado en su propia cartera. Pendiente: el cambio en `sql/schema/schema.sql` (no hecho; la base de datos sigue sin definir, spike ERP-9) y revisar el alta de productor en CU-01/CU-49 si pide DNI.

### Formularios Consorcio y Comercio + columnas en `schema.sql`
**Pendiente.** No implementar todavía. El prototipo no tiene `/cotizar/consorcio` ni `/cotizar/comercio`.

- `poliza_consorcio` y `poliza_comercio` ya existen (heredan de `poliza`, FK a `inmueble`).
- Consorcio hoy solo tiene edificio y administrador (detalle de cartera del mock).
- Comercio no tiene campos de riesgo extra.
- Al existir esos formularios: capturar sus campos (omitir Datos de envío) y **reflejarlos en esas tablas** (y en `inmueble` si aplica). Hasta entonces no inventar columnas. REF CU-17b SUP_4, `sql/schema/schema.sql`.

- CU-19/20 comisiones: fuera de iteración 1.
- Ticket de cobranza CU-31: fuera; el aviso CU-05c sí entra.

# Pendientes — esquema y cartera (HOM)

Registro de lo cerrado en la iteración actual y lo diferido, medido contra la **última versión en GitHub** frente al **árbol de trabajo local**.

| | |
| --- | --- |
| **Remoto (GitHub)** | `origin/main` → `7ec04d0` (`Huecos_documentacion y esquema`) |
| **Local** | `HEAD` = `7ec04d0` (árbol limpio, alineado con remoto) |
| **Iteración medida** | `49d806d` (`esquema-db-api-MA`) → `7ec04d0` |
| **Actualizar referencia** | `git fetch origin` → `git rev-parse HEAD origin/main` → `git diff --stat 49d806d..HEAD` (o el commit anterior de esta tabla) |

En `7ec04d0`, GitHub ya incluye `sql/schema/schema.sql`, `POLIZA_UNICA.md`, `TIPOS_DOCUMENTO.md` y este archivo. El prototipo sigue con `front/src/db/schema.sql` (cotizaciones), sin reconciliar.

Referencias: [`sql/schema/schema.sql`](sql/schema/schema.sql), [`POLIZA_UNICA.md`](POLIZA_UNICA.md), [`TIPOS_DOCUMENTO.md`](TIPOS_DOCUMENTO.md), [`FORMATO_NRO_MATRICULA.md`](FORMATO_NRO_MATRICULA.md), CU-16.

---

## RESUELTO EN ESTA ITERACION

Decisiones incorporadas en el rango `49d806d..7ec04d0` (esquema, docs y CU-16).

### Identidad y roles

- **Asegurado:** no es `usuario`; no tiene login. Datos en tabla `asegurado` (nombre, email, documento, etc.).
- **Productor:** hereda `usuario` + `matricula_ssn` (ver `FORMATO_NRO_MATRICULA.md`: dígitos, UNIQUE, longitud 3–8).
- **Misma persona física** puede ser productor y asegurado (otra fila); matrícula solo en productor. Auto-en-cartera permitido.
- **Productor con login;** asegurado sin contraseña (corrección respecto a respuesta inicial errónea).

### Póliza y unicidad legal

- PK operativa: `poliza.id`. **`numero_poliza` no es UNIQUE global** ([`POLIZA_UNICA.md`](POLIZA_UNICA.md)).
- Unicidad legal: `UNIQUE (id_aseguradora, tipo, numero_poliza)`.
- Tabla **`aseguradora`**. Rama = `poliza.tipo` **`CHAR(2)`**: `HO`, `AU`, `CO`, `CC`.
- Extensiones: `poliza_hogar`, `poliza_automotor`, **`poliza_consorcio`**, **`poliza_comercio`** (herencia PK + FK compuesta `(id, tipo)`). HO/CO/CC referencian **`inmueble`**.

### Vigencia, baja y fechas

- **`fecha_inicio`** = emisión; **`fecha_fin`** = renovación del **acuerdo** (no el pago). Siempre cargadas al alta/renovación; la baja solo pone **`vigente = false`** (no redefine `fecha_fin`).
- **`fecha_prox_pago`**: avisos de **cobro** en Pendientes. Corrimiento **X días** según **`poliza.cuotas`** cuando `endoso.pagado = true` (fórmula en app, no en SQL).

### Endosos

- Tabla **`endoso`**: FK `id_poliza`, `importe`, `metodo_pago` (`A`/`T`/`E`), `pagado`, historial append-only.
- **CU-16:** alta de póliza + **primer endoso** en una transacción; sin póliza completa no hay endoso.
- **Excepción:** endoso permitido con `vigente = false` (mora / saldo tras baja).
- Trigger: `endoso.fecha_emision` no excede `poliza.fecha_fin`.

### Documentos (AFIP)

- Catálogo **`tipos_documento`** (`sigla`, `codigo_afip`, descripcion) + seed DNI/CUIT/CUIL/LE/LC/CDI/CI/PASAPORTE.
- **`asegurado`:** `tipo_documento_sigla` + `numero_documento`. Doc: [`TIPOS_DOCUMENTO.md`](TIPOS_DOCUMENTO.md).

### Documentación y CUs tocados en local

- [`POLIZA_UNICA.md`](POLIZA_UNICA.md), [`TIPOS_DOCUMENTO.md`](TIPOS_DOCUMENTO.md) (nuevos).
- **CU-16** extendido (primer endoso, cobro, fechas, tipos de ramo).
- [`docs/cuestiones-a-resolver.md`](docs/cuestiones-a-resolver.md): tipos documento, issue CO/CC.
- [`docs/casos-de-uso/lista-casos-de-uso-HOM-ERP.md`](docs/casos-de-uso/lista-casos-de-uso-HOM-ERP.md): ítem 16 y decisión abierta CO/CC.

### Correcciones técnicas en `sql/schema/schema.sql`

- Typo `';;CREATE TABLE inmueble` corregido.
- RLS para tablas nuevas; `inmueble` visible vía HO, CO y CC.

---

## ASPECTOS DE ITERACIONES POSTERIORES

Pendientes de negocio o implementación. No bloquean commitear el esquema actual, pero no tienen `UNIQUE`/CU cerrado hasta resolver.

### Cartera — unicidad del asegurado

**Pregunta abierta:** ¿unicidad `(id_productor, tipo_documento_sigla, numero_documento)` o solo `(id_productor, numero_documento)`?

Impacto: índice en `asegurado`, CU-10 (DNI en la red), CU-29. **No agregar UNIQUE en SQL hasta responder.**

### Documento del productor

- Alinear **`usuario.dni`** (productor con login) con `tipos_documento` + número texto, si AFIP o la red lo exigen.

### Póliza, endoso, cobro y Pendientes

| Tema | Notas |
| --- | --- |
| Fórmula **cuota → X** | Implementar en aplicación (CU-16 RN_10 / SUP_9). |
| CU “resolver aviso de cobro → endoso” | Redactar aparte de RN_10 en CU-16 si hace falta caso propio. |
| Aviso ~1 mes | ¿Sobre `fecha_prox_pago`, `fecha_fin`, u otro? |
| **`numero_endoso` en emisión** | Valor por defecto si la compañía no informa (CU-16 SUP_7). |
| **`pagado=true` en CU-16** | ¿Cierra aviso cupón consorcio CU-05f? (SUP_8). |
| **CU-29** | Primer `endoso` al importar póliza, alineado a CU-16. |
| **Renovación** | Actualizar `fecha_fin` en la misma `poliza` vs nueva fila legal. |

### Formularios Consorcio, Comercio y riesgo en SQL

- Rutas `/cotizar/consorcio` y `/cotizar/comercio` en prototipo (hoy no existen).
- Volcar campos a `poliza_consorcio` / `poliza_comercio` (y `inmueble` si aplica); **no inventar columnas** antes del formulario.
- Alinear **hogar** (`poliza_hogar` / `inmueble` / `bien_hogar`) con `hogar-form.tsx`.

Detalle: [`docs/cuestiones-a-resolver.md`](docs/cuestiones-a-resolver.md) (sección Consorcio/Comercio).

### Casos de uso y producto

- CU-16 SUP_2–SUP_6 (formulario por ramo, PDF, plazos, correcciones, emisión fallida).
- CU-31 ticket de cobranza (fuera iteración 1); operación vía `endoso.pagado` + `fecha_prox_pago`.
- Revisar unicidad en red (CU-10 A2) con varios `tipo_documento`.
- **CU-05f** (`PAS/pendientes/CU-05f-Pendientes_Aviso_Enviar_Cupon.md`): se perdió por conflictos; no recuperar desde historial salvo decisión nueva.

### Cierre de un ítem

1. Respuesta de negocio en este archivo o en el CU.
2. Cambio en `sql/schema/schema.sql` y notas en `POLIZA_UNICA.md` / `TIPOS_DOCUMENTO.md`.
3. Mover de “POSTERIORES” a “RESUELTO” en la siguiente iteración y commitear.

---

## Inventario de casos de uso (ESTADO)

Fuente de IDs y descripciones: [`docs/casos-de-uso/lista-casos-de-uso-HOM-ERP.md`](docs/casos-de-uso/lista-casos-de-uso-HOM-ERP.md).  
Canónico en disco: `docs/casos-de-uso/`. Implementación medida en `front/` + `supabase/functions/` (el prototipo no cuenta como stack).

Valores de `ESTADO`:

| Valor | Significado |
| --- | --- |
| `IMPLEMENTADO` | Flujo completo en la app real |
| `PARCIALMENTE IMPLEMENTADO` | Hay lógica o UI real, incompleta |
| `DESARROLLADO` | `.md` con flujo/RN usable; sin código de producto (o solo mock en prototipo) |
| `PENDIENTE` | Sin archivo, stub, o huecos críticos de especificación |

| CU | ESTADO | Descripción |
| --- | --- | --- |
| CU-01 | PARCIALMENTE IMPLEMENTADO | Iniciar sesión con email y contraseña |
| CU-02 | DESARROLLADO | Recuperar o cambiar contraseña (spec/CU listos; reset en front aún stub) |
| CU-03 | PARCIALMENTE IMPLEMENTADO | Ver y editar perfil (página mínima; edición pendiente) |
| CU-04 | PARCIALMENTE IMPLEMENTADO | Cerrar sesión (logout real; CU en `docs/casos-de-uso/login-logout/`) |
| CU-05 | PARCIALMENTE IMPLEMENTADO | Ver la bandeja de avisos y leads (stub `/pendientes`; CU escrito) |
| CU-05b | DESARROLLADO | Aviso de cumpleaños |
| CU-05c | DESARROLLADO | Aviso de pago rechazado (ticket CU-31 fuera) |
| CU-05d | DESARROLLADO | Aviso de cotización enviada |
| CU-05e | DESARROLLADO | Aviso de enviar póliza |
| CU-05f | PENDIENTE | Aviso de enviar cupón (Consorcio). **Se perdió por conflictos** (tenía cuerpo en `0f72909a`; no se restauró a propósito). Sin archivo `.md` en el árbol actual. |
| CU-08 | DESARROLLADO | Lead: editar, enviar cotización, reactivar o descartar (desglosado en 08b–08e) |
| CU-08b | DESARROLLADO | Reactivar lead (propuesta → Cotización enviada) |
| CU-08c | DESARROLLADO | Descartar un lead |
| CU-08d | DESARROLLADO | Lead: enviar cotización (abre Cotizar) |
| CU-08e | DESARROLLADO | Editar la descripción del lead |
| CU-09 | DESARROLLADO | Elegir el ramo a cotizar |
| CU-10 | DESARROLLADO | Seleccionar un cliente existente o crear uno al cotizar |
| CU-11 | DESARROLLADO | Re-cotizar una póliza existente (datos precargados) |
| CU-12 | DESARROLLADO | Guardar y retomar cotización (iteración 1: solo sesión) |
| CU-13 | DESARROLLADO | Armar la propuesta y generar el PDF |
| CU-14 | DESARROLLADO | Enviar la propuesta por WhatsApp |
| CU-15 | DESARROLLADO | Marcar resultado de propuesta (aceptada, rechazada, vencida) |
| CU-16 | DESARROLLADO | Registrar póliza emitida + primer endoso (`activa=true`); hub/UI no cableados |
| CU-17-AUT | DESARROLLADO | Cargar riesgo Automotor; hub `/cotizar` aún responde 501 |
| CU-17b | PENDIENTE | Cargar riesgo Hogar/Consorcio/Comercio; faltan campos por API |
| CU-18-AUT | DESARROLLADO | Comparar cotizaciones (vigente AUT); estimado diferido |
| CU-18 | DESARROLLADO | Comparar multirramo (supuesto teórico, no canónico) |
| CU-19-AUT | DESARROLLADO | Ver comisión de cada cotización (negocio en `?`) |
| CU-20-AUT | DESARROLLADO | Aplicar descuento sacrificando comisión (negocio en `?`) |
| CU-21 | PENDIENTE | Cargar solicitud sin API (AP/ART); stub de 1 línea |
| CU-22 | DESARROLLADO | Buscar y filtrar clientes con póliza vigente |
| CU-23 | DESARROLLADO | Sumar una póliza con “+” (redirige a cotizar) |
| CU-24 | DESARROLLADO | Editar los datos de un cliente |
| CU-25 | DESARROLLADO | Ver la ficha del cliente |
| CU-26 | DESARROLLADO | Ver la cartera y su distribución por ramo |
| CU-27 | DESARROLLADO | Ver el detalle de una póliza vigente |
| CU-28 | DESARROLLADO | Enviar la póliza al cliente |
| CU-29 | DESARROLLADO | Cargar pólizas ya existentes (carga inicial) |
| CU-30 | PENDIENTE | Ver los morosos de mi cartera (sin `.md`) |
| CU-31 | PENDIENTE | Crear o actualizar ticket de pago (sin `.md`) |
| CU-32 | PENDIENTE | Guardar la referencia de la factura (sin `.md`) |
| CU-33 | PENDIENTE | Avisar mora por WhatsApp y dejar registro (sin `.md`) |
| CU-34 | DESARROLLADO | Ver la lista de siniestros |
| CU-35 | DESARROLLADO | Ver el detalle de un siniestro |
| CU-36 | DESARROLLADO | Registrar un siniestro |
| CU-37 | DESARROLLADO | Actualizar el ticket de siniestro (pantalla admin abierta) |
| CU-38 | DESARROLLADO | Cerrar un siniestro |
| CU-39 | PENDIENTE | Ver mis comisiones (sin `.md`; fase `?`) |
| CU-40 | PARCIALMENTE IMPLEMENTADO | Dashboard de la red (stub `/red` en front; sin CU escrito) |
| CU-41 | PENDIENTE | Ver el rendimiento por PAS (sin `.md`) |
| CU-42 | PENDIENTE | Ver la cartera resumida de cada PAS (sin `.md`) |
| CU-43 | PENDIENTE | Ver la mora de la red (sin `.md`) |
| CU-44 | PENDIENTE | Actualizar el estado de pago de un cliente (sin `.md`) |
| CU-45 | PENDIENTE | Ver comisiones por póliza y compañía (sin `.md`) |
| CU-46 | PENDIENTE | Dar de alta un PAS (sin `.md`) |
| CU-47 | PENDIENTE | Editar, suspender o dar de baja a un PAS (sin `.md`) |
| CU-48 | PENDIENTE | Asignar roles y permisos (sin `.md`) |
| CU-49 | PENDIENTE | Configurar compañías, ramos y coberturas (sin `.md`) |
| CU-50 | PENDIENTE | Consultar siniestros de la red (sin `.md`) |
| CU-51 | PENDIENTE | Consultar registro de auditoría (sin `.md`) |
| CU-52 | PENDIENTE | Back-office: cargar/corregir clientes y pólizas (sin `.md`) |
| CU-53 | PENDIENTE | Back-office: actualizar pagos (sin `.md`) |
| CU-54 | PENDIENTE | Back-office: seguir siniestros de la red (sin `.md`) |
| CU-55 | PENDIENTE | Extraer archivos de cada compañía (rúbrica); stub título |
| CU-56 | PENDIENTE | Consolidar y presentar la rúbrica SSN; stub título |
| CU-57 | PENDIENTE | Ver oportunidades de cross-selling (sin `.md`) |
| CU-58 | PENDIENTE | Publicar avisos hacia la red (sin `.md`) |
| CU-59 | PENDIENTE | Enviar contenido formativo a un PAS (sin `.md`) |

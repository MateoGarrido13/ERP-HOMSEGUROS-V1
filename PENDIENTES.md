# Pendientes — esquema y cartera (HOM)

Registro de lo cerrado en la iteración actual y lo diferido, medido contra la **última versión en GitHub** frente al **árbol de trabajo local**.

| | |
| --- | --- |
| **Remoto (GitHub)** | `origin/main` → commit `49d806d` (`esquema-db-api-MA`) |
| **Local** | Mismo commit en `HEAD`, más cambios sin commitear |
| **Cómo actualizar la medición** | `git fetch origin` y `git diff --stat origin/main` |

En `origin/main` el modelo de red en `sql/schema/schema.sql` **no está** (solo existe `front/src/db/schema.sql` del prototipo). Esta iteración construye y ajusta `sql/schema/schema.sql` por Q&A con negocio.

Referencias: [`sql/schema/schema.sql`](sql/schema/schema.sql), [`POLIZA_UNICA.md`](POLIZA_UNICA.md), [`TIPOS_DOCUMENTO.md`](TIPOS_DOCUMENTO.md), [`FORMATO_NRO_MATRICULA.md`](FORMATO_NRO_MATRICULA.md), CU-16.

---

## RESUELTO EN ESTA ITERACION

Decisiones reflejadas en el diff local respecto de `origin/main` (esquema, docs y CU-16).

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
- [`front/docs/cuestiones-a-resolver.md`](front/docs/cuestiones-a-resolver.md): tipos documento, issue CO/CC.
- [`front/docs/casos-de-uso/lista-casos-de-uso-HOM-ERP.md`](front/docs/casos-de-uso/lista-casos-de-uso-HOM-ERP.md): ítem 16 y decisión abierta CO/CC.

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

Detalle: [`front/docs/cuestiones-a-resolver.md`](front/docs/cuestiones-a-resolver.md) (sección Consorcio/Comercio).

### Casos de uso y producto

- CU-16 SUP_2–SUP_6 (formulario por ramo, PDF, plazos, correcciones, emisión fallida).
- CU-31 ticket de cobranza (fuera iteración 1); operación vía `endoso.pagado` + `fecha_prox_pago`.
- Revisar unicidad en red (CU-10 A2) con varios `tipo_documento`.

### Cierre de un ítem

1. Respuesta de negocio en este archivo o en el CU.
2. Cambio en `sql/schema/schema.sql` y notas en `POLIZA_UNICA.md` / `TIPOS_DOCUMENTO.md`.
3. Mover de “POSTERIORES” a “RESUELTO” en la siguiente iteración y commitear.

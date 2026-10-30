# Briefing técnico — ERP intermediación de seguros (Luciani)

Audiencia: engineering. Alcance: validación de dominio + recorte de MVP.  
Fuentes: `MODELO DE NEGOCIO.md`, benchmark de 5 productos AR/LATAM, `middleware.md`.  
Premisa operativa: **el PAS opera su cartera**; Luciani coordina la red. El software no puede ser un ERP de escritorio más.

---

## DESCRIPCION MODELO DE NEGOCIO

### Qué es el negocio

No somos aseguradora. No underwriteamos riesgo ni pagamos siniestros. Operamos **intermediación regulada**: captar demanda, cotizar contra múltiples carriers, colocar la póliza, y sostener el ciclo de vida (endoso, cobranza, comisión, reclamo) para una red de PAS.

El sistema de registro de la **póliza legal** vive en la compañía. El nuestro es el **system of record operativo de la red**: quién es el cliente, qué se cotizó, qué se emitió, en qué estado está la cuota, qué comisión corresponde al PAS, qué expediente de siniestro se armó.

### Entes regulatorios

| Ente | Rol en el diseño |
|---|---|
| **SSN** | Autoriza carriers, aprueba productos/tarifas, matricula intermediarios, exige **rúbrica** (libros digitales XML/Excel). Sin matrícula no hay operación. |
| **Ley 25.326** | Datos personales del tomador/asegurado/beneficiarios. Residencia y trazas de acceso (comisión, siniestro) son requisito, no nice-to-have. |
| **Aseguradora** | Risk carrier: emite, recauda prima, liquida siniestro. Nuestra integración es un **anti-corruption layer** sobre sus dialectos (WS, archivos, portal). |

### Stakeholders

| Actor | Relación con el sistema |
|---|---|
| **Luciani (broker / organizador)** | Cliente pagador. Habilita red, negocia condiciones/override, necesita visibilidad de cartera agregada. Nivel exacto en la cadena comercial: **abierto**. |
| **PAS (usuario final)** | Independiente matriculado. Asesora, vende, denuncia. Hoy también ejecuta back-office. Si el producto suma pantallas, no hay adopción. |
| **Asegurado / tomador** | No opera el ERP. Consume canal (póliza, cuota, denuncia) si existe. |
| **Aseguradora** | Upstream. Cotiza/emite/cobra/liquida. No es usuario. |
| **SSN** | Constraint, no actor de UI. |

### Procesos de la empresa (ciclo)

```
Prospecto → captura de riesgo (schema por ramo) → cotización multi-carrier
    → propuesta → emisión / endoso
    → cuotas (tipo de cobro) → conciliación / mora
    → liquidación de comisión (carrier → organizador → PAS)
    → siniestro (expediente documental → carrier)
    → renovación / anulación
```

Back-office actual (carga humana):

1. **Issue / endorsement** — data entry al portal de cada compañía.
2. **Premium collection** — cruzar extractos vs cuotas; un débito rechazado puede anular la póliza.
3. **Commission settlement** — qué pagó el carrier y cómo se parte.
4. **Claims dossier** — fotos, presupuestos, denuncia policial.
5. **Underwriting intake** — el schema no es único: patrimoniales ≠ personas ≠ RC ≠ ART ≠ caución.

Automatizable con evidencia de mercado: OCR de expediente, pre-check administrativo por factores de ramo, inbound de cartera/cobranza (más valor que cotizar).

KPI de negocio (no de tickets): retención, fidelidad, deserción.

### Implicancia de producto

El mercado (AdminSE, AdminSEG) resuelve el core y **se lo deja al PAS**. Figuro resuelve captura y **se niega a ser ERP**. El hueco es: *core de cartera con UX de 5 acciones para el productor*.

---

## BORRADOR DE LA PROPUESTA

### Hipótesis de MVP

Un PAS de la red cotiza y coloca **un ramo** (TBD: mix real de cartera) contra **un middleware**, sin reingresar datos en N portales. El core persiste cliente/póliza/cuota/comisión. Luciani ve producción agregada. El PAS no opera un ERP.

Si el PAS declara que “ahora cargo acá **y** en la compañía”, el recorte falló.

### Sistema final — desglose de capacidades

El producto objetivo no es el MVP. El MVP es el menor corte que prueba SoR + un quote path. Abajo, cada capacidad del sistema **completo**, utilidad de negocio, y fase.

**Fases:** `MVP` = v1. `N` = post-validación. `N+` = solo si el BO lo exige (costo/regulación).

#### Comercial (frente PAS)

| Capacidad | Qué hace | Utilidad de negocio |
|---|---|---|
| **Identity y árbol de red** `MVP` | Organización → PAS → (subPAS). RBAC. Feature flags por productor. | Luciani habilita/revoca sin mezclar carteras. El PAS ve solo lo suyo. Sin esto no hay red, hay un Excel compartido. |
| **Party master** `MVP` | Tomador / asegurado / beneficiario como entidad única, N pólizas. | Evita duplicados. Base de 25.326. Cross-sell y siniestro necesitan la misma persona. |
| **Intake por ramo (schema versionado)** `MVP` | Formulario cuyo contrato de datos lo define la materia asegurable (auto ≠ vida ≠ ART). | Una captura alimenta cotización y emisión. Corta el ping-pong de WhatsApp. Es el reemplazo del data entry. |
| **Pipeline de prospectos** `MVP` | Estados: pendiente → cotizado → aceptado → emitido / perdido. | Adopción: el PAS no pierde leads. Luciani ve conversión, no solo producción emitida. |
| **Propuesta mobile-first** `MVP` | Página comparable (coberturas/prima), no Excel. | Cierre. El tomador decide en el celular; el PAS deja de explicar PDFs. |
| **Referidores / canales** `N` | Código por aliado o red social; conversión por fuente. | Atribución. El PAS invierte tiempo donde cierra; Luciani ve qué canal alimenta la red. |
| **Incentivos y métricas por rubro** `N` | Evolución de cartera, ranking, eventos de prospectos. | Adopción del PAS independiente. Sin incentivo, no hay uso. KPI: retención / fidelidad / deserción. |
| **Reportes semanales PAS → org** `N` | Producción por ramo, pipeline, mora. Schedulados. | Luciani deja de pedir Excel. El PAS no arma el reporte a mano. |

#### Cartera (SoR)

| Capacidad | Qué hace | Utilidad de negocio |
|---|---|---|
| **Policy aggregate** `MVP` | Póliza, compañía, ramo, PAS, documentos, correlación con el carrier. | Única fuente operativa. Todo lo demás (bot, IA, rúbrica) lee de acá. |
| **Issue / bind** `MVP` | Alta vía adapter; persistir número, vigencia, prima, docs. | El PAS deja el portal de la compañía para el ramo del MVP. |
| **Endosos** `MVP` (mínimo) / `N` (completo) | Modificación de vigencia, suma, vehículo, tomador. | El ciclo real no es solo altas. Sin endoso, el SoR se pudre a la primera modificación. |
| **Document store** `MVP` | Póliza, certificado, adjuntos. | El PAS no busca PDFs en mail. Habilita canal asegurado después. |
| **Renovaciones / sumas** `N` | Vencimientos, actualización de suma asegurada. | Retención. Cartera desactualizada = subseguro + deserción. |
| **Inbound vuelco de cartera** `N` | Importar lo ya emitido en el carrier (póliza, endoso, refacturación). | **La integración que más carga saca.** Cotizar sin esto deja al PAS cargando el stock histórico. |

#### Cobranza

| Capacidad | Qué hace | Utilidad de negocio |
|---|---|---|
| **Tipo de cobro + estado de cuota** `MVP` | Débito / tarjeta / caja / PAS; pagada, vencida, rechazada. | Sin este campo no hay mora ni anulación prevenible. Anotación GNP. |
| **Alertas de mora / rechazo** `N` | Evento cuando rebota un débito o vence una cuota. | Evita que la póliza se caiga. Retención directa. |
| **Bank reconciliation** `N+` | Cruzar extracto bancario vs cuotas emitidas. | Hueco de mercado (nadie lo documenta). Útil si Luciani o el PAS cobran por fuera del carrier. Alto costo de matching; no entra hasta tener tipo de cobro y volumen real. |
| **Notificaciones de vencimiento** `N` | Mail/WhatsApp al asegurado o al PAS. | Baja tickets. Fidelidad percibida. |

#### Comisión

| Capacidad | Qué hace | Utilidad de negocio |
|---|---|---|
| **Comisión por póliza / PAS** `MVP` (lectura) | Guardar % / monto esperado vs lo liquidado. | El PAS opera si confía en que “no le esconden la plata”. |
| **Override / cadena** `N` | Carrier → organizador → PAS (y referidor). | Modelo de Luciani. Sin esto el tablero de red miente. Pendiente BO: qué ve el PAS. |
| **Liquidación vs pago carrier** `N` | Inbound de lo efectivamente pagado; diferencia. | Tesorería. Detecta desvíos. Es back-office de red, no de cotización. |

#### Siniestro

| Capacidad | Qué hace | Utilidad de negocio |
|---|---|---|
| **Expediente documental** `N` | Fotos, presupuestos, denuncia; estado; envío al carrier. | El PAS deja de armar el ZIP. Servicio post-venta = retención. |
| **OCR de expediente** `N` | Extraer datos de fotos/PDF al caso. | Corta carga operativa del PAS. Pipeline ya identificado como automatizable. |
| **Decision log** `N` | Quién autorizó qué (pendiente BO). | Trazabilidad. Evita “el reclamo se perdió en WhatsApp”. |
| **Tickets de gestión** `N` | Cola de pedidos (endoso, certificado, reclamo). | Ordena la operatoria sin que el PAS use el core como helpdesk. |

#### Evaluación de riesgo

| Capacidad | Qué hace | Utilidad de negocio |
|---|---|---|
| **Pre-check administrativo** `N` | Validar completeness + factores duros del ramo (edad, CP, CIIU, suma). | Filtra basura antes de pegarle al carrier. Capa operativa, no técnica de selección. |
| **Underwriting engine propio** `N+` | Aceptar/rechazar/recargar riesgo. | **No es nuestro oficio.** El carrier underwritea. Construir un motor propio copia AdminSEG y no saca carga al PAS. Solo tendría sentido para productos propios o precios no públicos con reglas de Luciani. Fuera de v1 a propósito. |

#### Integraciones

| Capacidad | Qué hace | Utilidad de negocio |
|---|---|---|
| **QuoteIssuer (1 middleware)** `MVP` | Cotizar / emitir / imprimir detrás de un adapter idempotente. | Un contrato, N compañías del vendor. AbsaNet o CotiWeb. Evita N SDKs en v1. |
| **N APIs directas de compañía** `N+` | Sancor, Mercantil, La Caja, … cada una con auth y mapeo. | Solo si el middleware no cubre una compañía de la red. Costo lineal en N. El contrato marca Sancor/Mercantil sí, La Caja dudosa. No es feature de producto; es deuda de cobertura. |
| **Jobs / n8n en el borde** `N` | Avisos, Excel, webhooks. Nunca cambia estado de póliza ni liquida. | Ops barata. Si entra al happy path, se pierde auditabilidad. |

#### Canal asegurado

| Capacidad | Qué hace | Utilidad de negocio |
|---|---|---|
| **Chatbot / WhatsApp** `N` | Póliza, cuota, denuncia, derivación. Patrón American Pass. | Saca del PAS la cola 24/7. Inútil sin document store + estado de cuota. |
| **App / portal asegurado** `N` | Misma lectura, marca del PAS. | Fidelización percibida. No reemplaza SoR. |

#### Compliance y crecimiento

| Capacidad | Qué hace | Utilidad de negocio |
|---|---|---|
| **Audit log** `MVP` | Quién leyó/escribió póliza y comisión. | 25.326 + disputa comercial. |
| **Rúbrica SSN** `N+` | Libros digitales XML/Excel del intermediario. | Obligación legal de la red, no del PAS suelto. Sin esto el core no es intermediario completo; con esto demasiado temprano se come el MVP. |
| **IA cross-sell / churn** `N` | Priorizar a quién llamar (otro producto / riesgo de baja). | Crecimiento de cartera existente (KPI). **Basura-in si no hay mora y siniestro limpios.** Figuro lo hace sobre Excel; nosotros solo sobre el SoR. |

Resumen de corte: el MVP prueba **captura → quote → issue → SoR**. Todo lo que saca carga real del PAS a escala (vuelco, conciliación, bot, rúbrica) depende de ese registro. No se construye al revés.

### Benchmark — qué ofrece cada uno y qué se copia

| Producto | Qué es | Ofrece | Trade-off vs nuestro recorte |
|---|---|---|---|
| **AdminSEG** | ERP cloud internacional a medida | Policy lifecycle, UW, comisiones multinivel, portales agente/cliente, reportes schedulados | Completo y pesado. Sin rúbrica SSN ni interfases AR. Datacenter USA. Copiar **árbol de red + override**, no el producto. |
| **AdminSE** | Core AR (Vixentya) | Rúbrica, tesorería, vuelco ~90–100 cías, emisión ~35, árbol organizador-PAS | Mejor perímetro de módulos. UX de escritorio = sobrecarga cognitiva del PAS. Copiar **bounded contexts**, no la UI. |
| **American Pass** | Suite modular + canal | Cartera, multicotizador, CRM, tickets, liquidador, WhatsApp 24/7, app white-label | El canal saca cola al PAS. Precio público es de conversaciones, no del core. Copiar **canal como capa**, nunca como SoR. |
| **Norden BI** | SaaS PAS-first de otro broker | Cotizador auto/agrícola, docs, deuda, renovaciones, API, DB dedicada | UX móvil correcta. Docs cerradas. Lock-in en competidor. Copiar **tenancy aislado + móvil**; no hospedar datos ahí. |
| **Figuro** | Front comercial LATAM | Formularios por ramo, propuesta mobile-first, referidores, churn/cross-sell, REST + Zapier/Make | Ellos documentan que **no** reemplazan gestión de pólizas. Copiar **intake + quote presentation**. Prohibido segundo CRM. |

Ninguno cubre conciliación bancaria. Cotizar sin inbound de cartera **no** elimina data entry.

### Trade-offs de implementación

| Decisión | Opción A | Opción B | Elección MVP |
|---|---|---|---|
| Core | Build SoR propio | Sentarse en AdminSE/Prodigal | **Build SoR**. Lock-in de vendor = el PAS hereda su UX. |
| Carriers | N APIs directas (Sancor, Mercantil, …) | 1 middleware (ACL) | **1 adapter**. AbsaNet alinea Sancor+Mercantil Andina (autos). CotiWeb tiene precio de entrada (u$s 1.200/año red). Pedir OpenAPI a ambos. |
| Front PAS | ERP único | App de 5 acciones + BFF | **Dos clientes, un API**. Feature flags por PAS. |
| Cotización | Catálogo embebido (Figuro) + middleware | Un solo quote path | **Un router**. Dos emisores = dos precios y doble carga. |
| Automatización | n8n en el happy path | n8n en el borde | **Borde** (avisos). Dinero y estado de póliza solo en core. Idempotencia en el adapter. |

### Arquitectura (v1)

Bounded contexts: `Comercial` · `Cartera` · `Cobranza` · `Comision` · `Siniestro` · `Integraciones`.

```
PAS Client ──┐
             ├── BFF ── Core API ── Policy aggregate (SoR)
Org Client ──┘              │
                            ├── QuoteIssuer (AbsaNet | CotiWeb)
                            └── Event bus → jobs (mail, n8n)
```

Constraints:

- Adapter idempotente (`Idempotency-Key` / correlation id carrier).
- Mapeo compañía×ramo×operación como config, no como `if`.
- Datos en AR. Trazas de acceso a comisión y siniestro.
- Auth: Luciani habilita la red; cada PAS opera con su matrícula aguas arriba (pendiente BO).

### Criterio de éxito del MVP

Un PAS cierra un flujo **captura → cotización comparada → emisión → póliza visible en core** sin abrir el portal de la compañía. Tiempo de data entry medible vs baseline manual. Si el PAS declara que “ahora cargo acá **y** en la compañía”, el MVP falló.

### Blockers (BO)

1. Mix de cartera → ramo de entrada.
2. Matriz real compañía × tipo de cobro (La Caja sigue en duda).
3. Cobranza: carrier / PAS / mix; protocolo de débito rechazado.
4. Visibilidad de comisión (neta vs cadena vs override).
5. Siniestro: ¿solo dossier o también decision log?

Detalle de costos y links de API: `middleware.md`.

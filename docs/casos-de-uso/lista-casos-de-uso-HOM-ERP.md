# Casos de uso — HOM ERP

Lista de casos de uso tomando el prototipo (`ERP-HOMSEGUROS-V1`) como fuente de verdad, más lo que le falta para cubrir toda la operación.

**Origen**
- `P`: el prototipo lo cubre.
- `A`: el prototipo lo tiene a medias, hay que ajustarlo.
- `N`: es nuevo, no existe en el prototipo.

**Fase**
- `MVP`: primera entrega.
- `Final`: entrega final del presupuesto.
- `?`: depende de una definición del negocio.

Las rutas son relativas a `docs/casos-de-uso/`. Lo compartido por todos los roles queda en la raíz. Cada rol tiene su carpeta y, adentro, una subcarpeta por funcionalidad. El archivo de cada caso va suelto en esa subcarpeta.

```
casos-de-uso/
  transicion-estados-bien.md           Grafo de estados del bien
  login-logout/                 1–4    Acceso, todos los roles
  rubrica_ssn/                  55–56  Extraer archivos y presentar la rúbrica
  PAS/
    pendientes/                 5–8
    multicotizador/             9–16   Común a masivo y no masivo
      masivo/
        automotor/              17–20  Variante AUT: consulta APIs y compara precios
                                17b    Riesgo de Hogar, Consorcio y Comercio (iteración 1, solo con API)
      no-masivo/                21     Solicitud sin API (fuera de iteración 1)
    cartera-cliente/            22–29
    cobranza/                   30–33
    siniestros/                 34–38
    comisiones/                 39
    cross-selling/              57
  ADMINISTRATIVO-OWNER/
    red/                        40–42  Dashboard, rendimiento y cartera por PAS
    mora/                       43–44
    comisiones/                 45
    productores/                46–48  Alta, edición y roles
    configuracion/              49
    siniestros/                 50
    auditoria/                  51
    comunicacion/               58–59 Avisos a la red y contenido formativo
  back-office/
    clientes-y-polizas/         52
    pagos/                      53
    siniestros/                 54
```

---

## Acceso (todos los roles)

`login-logout/` · casos 1–4

| # | Caso de uso | Origen | Fase |
|---|---|---|---|
| 1 | Iniciar sesión con email y contraseña | N | MVP |
| 2 | Recuperar o cambiar contraseña | N | MVP |
| 3 | Ver y editar perfil | A | MVP |
| 4 | Cerrar sesión | N | MVP |

## PAS: pendientes

`PAS/pendientes/` · casos 5–8

| #   | Caso de uso                                                                         | Origen | Fase |
| --- | ----------------------------------------------------------------------------------- | ------ | ---- |
| 5   | Ver la bandeja de avisos y leads                                                    | P      | MVP  |
| 8   | Lead: editar descripción, enviar cotización, reactivar o descartar                  | A      | MVP  |

Avisos, cada uno con su estado:

- `CU-05-Pendientes_Ver_Pendientes` Bandeja
- `CU-05b-Pendientes_Aviso_Cumpleanos`
- `CU-05c-Pendientes_Aviso_Pago_Rechazado` aviso in-scope; ticket CU-31 fuera
- `CU-05d-Pendientes_Aviso_Cotizacion_Enviada`
- `CU-05e-Pendientes_Aviso_Enviar_Poliza`
- `CU-05f-Pendientes_Aviso_Enviar_Cupon` Consorcio: cupón al administrador; al enviarlo queda en Cobro pendiente

Lead:

- `CU-08e-Pendientes_Editar_Descripcion_Lead` Editar la descripción
- `CU-08d-Lead_Enviar_Cotizacion` Abrir Cotizar con sus datos
- `CU-08b-Pendientes_Reactivar_Lead` Publicar la propuesta ya enviada como Cotización enviada
- `CU-08c-Pendientes_Descartar_Lead` Descartar un lead

## PAS: cotización y venta

`PAS/multicotizador/` · casos 9–21

El multicotizador se divide por la forma de cotizar el ramo:

- **Masivo** (`masivo/`): consulta las APIs de las compañías y expone varios precios para comparar. Iteración 1: Automotor (CU-17), Hogar/Consorcio/Comercio (CU-17b), solo compañías con API.
- **No masivo** (`no-masivo/`): no hay API de precio; el PAS carga una solicitud. Fuera de iteración 1 (CU-21: AP/ART y ramos sin API). El prototipo que manda Hogar a solicitud queda desalineado.
- **Común** (raíz de `multicotizador/`): lo que ocurre igual en los dos: elegir ramo, cliente, guardar y retomar, propuesta con PDF, envío y cierre.

Compañías con API directa: Mercantil Andina, Sancor Seguros, Zurich, La Segunda y Allianz. Las particularidades de cada API van en las specs, no en los casos de uso.

La columna "Absorbe" indica el número que tenía el caso en la versión anterior de esta lista.

### Convención de nombres

El mismo caso de uso puede comportarse distinto según el ramo. Para no repetir números:

- **El número identifica el caso de uso** (qué hace el PAS). Cargar el riesgo es siempre el 17.
- **El código de ramo identifica la variante** (cómo se comporta): `AUT` Automotor, `HOG` Hogar, `ACP` Accidentes Personales, `ART` ART, `COM` Comercio, `RC` Responsabilidad Civil, `VID` Vida.
- **Archivo:** `CU-17-AUT-Multicotizador_Cargar_Riesgo.md`. El nombre no lleva el ramo.
- **Carpeta:** `masivo/<ramo>/` o `no-masivo/<ramo>/`. Los casos comunes a todos los ramos viven en la raíz de `multicotizador/` y no llevan código.
- **Referencias:** `REF CU 17` es el caso 17 del ramo de la cotización. `REF CU-17-AUT` apunta a la variante concreta. Los casos comunes usan la forma corta.
- **Cada variante es un CU completo.** Si dos ramos difieren solo en los campos que se cargan, se mantienen en un único archivo y los campos van en las reglas. Si una parte es igual en todos los ramos, se sube a un caso común en lugar de copiarla.

### Común

`PAS/multicotizador/`

| #   | Caso de uso                                                                                                       | Absorbe    | Origen | Fase   |
| --- | ----------------------------------------------------------------------------------------------------------------- | ---------- | ------ | ------ |
| 9   | Elegir el ramo a cotizar                                                                                          | 9          | P      | MVP    |
| 10  | Seleccionar un cliente existente o crear uno al cotizar                                                           | 10         | A      | MVP    |
| 11  | Re-cotizar una póliza existente (datos precargados)                                                               | 12         | N      | MVP    |
| 12  | Guardar y retomar una cotización en curso (iteración 1: solo sesión; no se persiste)                              | 20         | N      | MVP [persistir: fuera] |
| 13  | Armar la propuesta y generar el PDF                                                                               | 21, 22     | P [A]  | MVP    |
| 14  | Enviar la propuesta por WhatsApp                                                                                  | 23         | P      | MVP    |
| 15  | Marcar el resultado de una propuesta (aceptada, rechazada, vencida)[#12]                                          | 24         | N      | MVP    |
| 16  | Registrar la póliza emitida y el primer endoso (Dar de alta en Pendientes: nº, vigencia, compañía, cobro; `activa=true`) | 25         | N      | MVP    |

### Masivo

`PAS/multicotizador/masivo/<ramo>/`

Una carpeta por ramo. Hoy solo existe `automotor/`; el CU-17b (Hogar, Consorcio y Comercio) vive ahí hasta que haya carpetas por ramo. El CU-18 vigente es la variante AUT (`masivo/automotor/`). Existe además un CU-18 multirramo (versión de Mateo, `masivo/CU-18-Multicotizador_Comparar_Cotizaciones.md`) conservado como supuesto teórico: el flujo cambia entre ramos.

| #   | Caso de uso | Variantes | Absorbe | Origen | Fase |
| --- | --- | --- | --- | --- | --- |
| 17  | Cargar el riesgo a asegurar. En Automotor: patente, CP, uso, info del titular; verificar y completar los datos del vehículo (GNC, 0 km, suma asegurada), o cargarlo a mano si la patente no decodifica | AUT ✓ | 11, 13, 14 | P [A] | MVP |
| 17b | Cargar el riesgo de Hogar, Consorcio o Comercio (campos según API; patrón de CU-17) | HOG, CON, COM | — | N | MVP |
| 18  | Comparar cotizaciones de las compañías a medida que llegan, manejar la que falla, demora o rechaza, y elegir una. El estimado/caché queda diferido; si se muestra, no es precio real (en la variante AUT: ver un estimado mientras responde la compañía, aclarando que no es precio real [#18, estimado]) | AUT ✓ | 15, 16, 17 | P [A] | MVP [estimado diferido; en AUT el estimado es ?] |
| 19  | Ver la comisión de cada cotización | AUT ✓ | 18 | N | ? |
| 20  | Aplicar un descuento sacrificando puntos de comisión | AUT ✓ | 19 | N | ?[MVP] |

✓ = escrito. Sin marca = archivo creado, sin contenido todavía.

### No masivo

`PAS/multicotizador/no-masivo/`

Todavía sin carpetas por ramo: se arman cuando se desarrolle cada variante.

| #   | Caso de uso | Variantes | Absorbe | Origen | Fase |
| --- | --- | --- | --- | --- | --- |
| 21  | Cargar la solicitud sin API (AP, ART u otros sin cotización). Fuera de iteración 1 | ACP, ART | 26 | P | ? |

## PAS: clientes y cartera

`PAS/cartera-cliente/` · casos 22–29

| #   | Caso de uso                                                           | Origen | Fase |
| --- | --------------------------------------------------------------------- | ------ | ---- |
| 22  | Buscar y filtrar clientes con póliza vigente (búsqueda por nombre). El "+" suma una póliza | A      | MVP  |
| 23  | Sumar una póliza con "+" (redirige a cotizar). El cliente entra a la cartera solo con una cobertura o póliza asociada | A      | MVP  |
| 24  | Editar los datos de un cliente                                        | N      | MVP  |
| 25  | Ver la ficha del cliente (contacto, pólizas vigentes, propuestas, historial). El "+" suma una póliza | A      | MVP  |
| 26  | Ver la cartera y su distribución por ramo, solo pólizas vigentes      | P      | MVP  |
| 27  | Ver el detalle de una póliza vigente                                  | A      | MVP  |
| 28  | Enviar la póliza al cliente [#REP14]                                  | P      | MVP  |
| 29  | Cargar pólizas ya existentes (carga inicial de la cartera) [SENSIBLE] | N      | MVP  |

## PAS: cobranza

`PAS/cobranza/` · casos 30–33

| # | Caso de uso | Origen | Fase |
|---|---|---|---|
| 30 | Ver los morosos de mi cartera | A | MVP |
| 31 | Crear o actualizar un ticket de pago (X días para el pago, pago rechazado, pagado) | N | MVP |
| 32 | Guardar la referencia de la factura | N | MVP |
| 33 | Avisar la mora por WhatsApp y dejar registro de que se avisó | A | MVP |
[HAY ALGUNA FORMA DE ESTANDARIZAR LOS AVISOS,BAJO EL FLUJO: AVISO->(A) EDITAR EL ESTADO  ->SE GUARDAN CAMBIOS (B) 
	   -> (B)VISUALIZAR EL DETALLE ->ENVIAR]
## PAS: siniestros

`PAS/siniestros/` · casos 34–38

| #   | Caso de uso                                                                           | Origen | Fase |
| --- | ------------------------------------------------------------------------------------- | ------ | ---- |
| 34  | Ver la lista de siniestros                                                            | P      | MVP  |
| 35  | Ver el detalle de un siniestro (comentario, contactos)                                | P      | MVP  |
| 36  | Registrar un siniestro                                                                | N      | MVP  |
| 37  | Actualizar el ticket (estado, documentación, nº de reclamo, mails, derivación, links) | N      | MVP  |
| 38  | Cerrar un siniestro                                                                   | N      | MVP  |

Lo que está en la pantalla:

- `CU-34-Siniestros_Ver_Lista` Lista
- `CU-35-Siniestros_Ver_Detalle` Comentario y contactos

Definido, con el recorrido de pantalla todavía abierto:

- `CU-36-Siniestros_Registrar` El PAS carga denuncia y adjuntos. Nace en "En gestión", sin número de reclamo ni link.
- `CU-37-Siniestros_Actualizar_Ticket` Lo actualizan el PAS y el administrativo. El número de reclamo y el link se completan acá. Falta la pantalla del administrativo.
- `CU-38-Siniestros_Cerrar` Lo cierra el PAS. El estado queda en "Cerrado" y sigue en la lista.

## PAS: comisiones

`PAS/comisiones/` · caso 39

| # | Caso de uso | Origen | Fase |
|---|---|---|---|
| 39 | Ver mis comisiones, ya descontado lo que retiene la organización | N | ? |

## Directivo y administrativo: red

`ADMINISTRATIVO-OWNER/red/` · casos 40–42

| #   | Caso de uso                                                                                                | Origen | Fase |
| --- | ---------------------------------------------------------------------------------------------------------- | ------ | ---- |
| 40  | Ver el dashboard de la red (KPIs)                                                                          | N      | MVP  |
| 41  | Ver el rendimiento por PAS                                                                                 | N      | MVP  |
| 42  | Ver la cartera resumida de cada PAS  Y SU PROPORCION CON INFO (nombre, apellido, póliza, compañía, estado) | N      | MVP  |

## Directivo y administrativo: mora

`ADMINISTRATIVO-OWNER/mora/` · casos 43–44

| #   | Caso de uso                                                                                  | Origen | Fase |
| --- | -------------------------------------------------------------------------------------------- | ------ | ---- |
| 43  | Ver la mora de la red (fecha de última actualización, plazo de suspensión, importe, filtros) | N      | MVP  |
| 44  | Actualizar el estado de pago de un cliente (también lo hace el PAS)                          | N      | MVP  |

## Directivo y administrativo: comisiones

`ADMINISTRATIVO-OWNER/comisiones/` · caso 45

| #   | Caso de uso                                                                      | Origen | Fase |
| --- | -------------------------------------------------------------------------------- | ------ | ---- |
| 45  | Ver comisiones por póliza y compañía, y los descuentos aplicados                 | N      | ?    |

## Directivo y administrativo: productores

`ADMINISTRATIVO-OWNER/productores/` · casos 46–48

| #   | Caso de uso                              | Origen | Fase |
| --- | ---------------------------------------- | ------ | ---- |
| 46  | Dar de alta un PAS                       | N      | MVP  |
| 47  | Editar, suspender o dar de baja a un PAS | N      | MVP  |
| 48  | Asignar roles y permisos                 | N      | MVP  |

## Directivo y administrativo: configuración

`ADMINISTRATIVO-OWNER/configuracion/` · caso 49

| #   | Caso de uso                                            | Origen | Fase |
| --- | ------------------------------------------------------ | ------ | ---- |
| 49  | Configurar compañías, ramos y coberturas habilitadas   | N      | ?    |

## Directivo y administrativo: siniestros

`ADMINISTRATIVO-OWNER/siniestros/` · caso 50

| #   | Caso de uso                    | Origen | Fase |
| --- | ------------------------------ | ------ | ---- |
| 50  | Consultar siniestros de la red | N      | ?    |

## Directivo y administrativo: auditoría

`ADMINISTRATIVO-OWNER/auditoria/` · caso 51

| #   | Caso de uso                                                                             | Origen | Fase |
| --- | --------------------------------------------------------------------------------------- | ------ | ---- |
| 51  | Consultar el registro de auditoría (quién cambió qué y cuándo) HABRA QUE LOGEAR         | N      | MVP  |

## Back-office

Pendiente hasta que se redacten las tareas del rol. Hipótesis a validar:

### Clientes y pólizas

`back-office/clientes-y-polizas/` · caso 52

| #   | Caso de uso                                              | Origen | Fase |
| --- | -------------------------------------------------------- | ------ | ---- |
| 52  | Cargar o corregir clientes y pólizas en nombre de un PAS | N      | ?    |

### Pagos

`back-office/pagos/` · caso 53

| #   | Caso de uso                                      | Origen | Fase |
| --- | ------------------------------------------------ | ------ | ---- |
| 53  | Actualizar pagos a medida que entran[ACTUALIZAR] | N      | ?    |

### Siniestros

`back-office/siniestros/` · caso 54

| #   | Caso de uso                               | Origen | Fase |
| --- | ----------------------------------------- | ------ | ---- |
| 54  | Seguir siniestros de la red [?AMPLIO]     | N      | ?    |

## Entrega final ['HOY COMO EPICS']

### Rúbrica SSN

`rubrica_ssn/` · casos 55–56

| #   | Caso de uso                                                               | Origen | Fase  |
| --- | ------------------------------------------------------------------------- | ------ | ----- |
| 55  | Extraer los archivos de cada compañía (emisiones, cobranzas, rendiciones) | N      | Final |
| 56  | Consolidar y presentar la rúbrica SSN                                     | N      | Final |

### Cross-selling

`PAS/cross-selling/` · caso 57

| #   | Caso de uso                        | Origen | Fase  |
| --- | ---------------------------------- | ------ | ----- |
| 57  | Ver oportunidades de cross-selling | N      | Final |

### Comunicación a la red

`ADMINISTRATIVO-OWNER/comunicacion/` · casos 58–59

| #   | Caso de uso                         | Origen | Fase  |
| --- | ----------------------------------- | ------ | ----- |
| 58  | Publicar avisos hacia la red        | N      | Final |
| 59  | Enviar contenido formativo a un PAS | N      | Final |

---

## Qué le falta al prototipo

1. **Registro de la póliza emitida** (caso 16). Documentado: «Dar de alta» en Pendientes es CU-16. El prototipo todavía no tiene esa pantalla.
2. **Cliente en Automotor** (casos 10 y 11). Los CU ya piden cliente antes del riesgo; el prototipo sigue riesgo→cliente. El caso 23 suma póliza con "+"; el cliente se muestra en Cartera al CU-16 (`activa=true`).
3. **Errores y recuperación al cotizar** (casos 12, 17 y 18) [OPCIONES POR DEFAULT].
4. **Escritura en vez de solo lectura.** Siniestros, mora y avisos solo se pueden ver. Faltan crear, actualizar y cerrar (casos 6, 31, 36 a 38).
5. **Todo el lado del Directivo y del administrativo** (casos 40 a 51).
6. **Piezas transversales**: login, auditoría y carga inicial de pólizas (casos 1, 2, 29 y 51).

## Decisiones abiertas

Cerradas en iteración 1 (detalle en `cuestiones-a-resolver.md` «Resuelto»): orden cliente→riesgo; unicidad DNI en la red; alta a Cartera = CU-16 desde Pendientes (`activa`); ramos Auto/Hogar/Consorcio/Comercio con API; CU-05c como aviso; CU-12 solo sesión.

- **Comisiones.** Quién puede aplicar descuentos y qué ve el PAS de su comisión (casos 19, 20, 39 y 45). Fuera de iteración 1.
- **Estimado mientras responde la compañía.** Diferido. Si se incorpora, debe quedar claro que no es precio real (caso 18).
- **Back-office.** Sus tareas las redacta el equipo de dominio (casos 52 a 54).
- **Campos de riesgo Hogar/Consorcio/Comercio.** Specs de adapter (CU-17b SUP_1).
- **Formularios Consorcio y Comercio + DB.** Pendiente: no hay rutas de cotización; al implementarlos, reflejar campos en `poliza_consorcio` / `poliza_comercio` (REF `cuestiones-a-resolver.md`). No inventar columnas antes.
- **Sugeridos, a confirmar:** carga inicial de pólizas existentes (29) y registro de auditoría (51).

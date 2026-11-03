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

Las rutas son relativas a `design/front/docs/casos-de-uso/`. Lo compartido por todos los roles queda en la raíz. Cada rol tiene su carpeta y, adentro, una subcarpeta por funcionalidad. El archivo de cada caso va suelto en esa subcarpeta.

```
casos-de-uso/
  transicion-estados-bien.md           Grafo de estados del bien
  login-logout/                 1–4    Acceso, todos los roles
  rubrica_ssn/                  55–56  Extraer archivos y presentar la rúbrica
  PAS/
    pendientes/                 5–8
    multicotizador/             9–16   Común a masivo y no masivo
      masivo/                   17–20  Consulta APIs y compara precios (Automotor)
      no-masivo/                21     Solicitud sin precios (Hogar, AP, ART)
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
- `CU-05c-Pendientes_Aviso_Pago_Rechazado` (*) no confirmado
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

- **Masivo** (`masivo/`): consulta las APIs de las compañías y expone varios precios para comparar. Hoy: Automotor.
- **No masivo** (`no-masivo/`): no hay precios para comparar; el PAS carga una solicitud y se arma la propuesta. Hoy: Hogar, Accidentes Personales y ART (el prototipo ya los resuelve así).
- **Común** (raíz de `multicotizador/`): lo que ocurre igual en los dos: elegir ramo, cliente, guardar y retomar, propuesta con PDF, envío y cierre.

Compañías con API directa: Mercantil Andina, Sancor Seguros, Zurich, La Segunda y Allianz. Las particularidades de cada API van en las specs, no en los casos de uso.

La columna "Absorbe" indica el número que tenía el caso en la versión anterior de esta lista.

### Común

`PAS/multicotizador/`

| #   | Caso de uso                                                                                                       | Absorbe    | Origen | Fase   |
| --- | ----------------------------------------------------------------------------------------------------------------- | ---------- | ------ | ------ |
| 9   | Elegir el ramo a cotizar                                                                                          | 9          | P      | MVP    |
| 10  | Seleccionar un cliente existente o crear uno al cotizar                                                           | 10         | A      | MVP    |
| 11  | Re-cotizar una póliza existente (datos precargados)                                                               | 12         | N      | MVP    |
| 12  | Guardar y retomar una cotización en curso([COMO PAS CAMBIAR EL ESTADO])                                           | 20         | N      | MVP    |
| 13  | Armar la propuesta y generar el PDF                                                                               | 21, 22     | P [A]  | MVP    |
| 14  | Enviar la propuesta por WhatsApp                                                                                  | 23         | P      | MVP    |
| 15  | Marcar el resultado de una propuesta (aceptada, rechazada, vencida)[#12]                                          | 24         | N      | MVP    |
| 16  | Registrar la póliza emitida por la compañía (nº de póliza, vigencia, compañía) a partir de una propuesta aceptada | 25         | N      | ?[MVP] |

### Masivo

`PAS/multicotizador/masivo/`

| #   | Caso de uso                                                                                                                                                                      | Absorbe    | Origen | Fase   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | ------ |
| 17  | Cargar el riesgo automotor: patente, CP, uso; verificar y completar los datos del vehículo (GNC, 0 km, suma asegurada), o cargarlo a mano si la patente no decodifica | 11, 13, 14 | P [A]  | MVP    |
| 18  | Comparar cotizaciones de las compañías a medida que llegan, manejar la que falla, demora o rechaza, y elegir una. Ver un estimado mientras responde la compañía, aclarando que no es precio real [#18, estimado] | 15, 16, 17 | P [A]  | MVP [el estimado es ?] |
| 19  | Ver la comisión de cada cotización                                                                                                                                               | 18         | N      | ?      |
| 20  | Aplicar un descuento sacrificando puntos de comisión                                                                                                                             | 19         | N      | ?[MVP] |

### No masivo

`PAS/multicotizador/no-masivo/`

| #   | Caso de uso                                                                                             | Absorbe | Origen | Fase |
| --- | ------------------------------------------------------------------------------------------------------- | ------- | ------ | ---- |
| 21  | Cargar la solicitud de Hogar, Accidentes Personales o ART (formulario del riesgo, sin comparar precios) | 26      | P      | ?    |

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

1. **Registro de la póliza emitida** (caso 16). Es el hueco más grande: el flujo va de "Propuesta enviada" a "Cartera" sin ningún paso donde se asiente que la compañía emitió la póliza. La app no emite, es intermediaria, pero sin ese registro la cartera no se llena sola y no se puede calcular la conversión. [SERIA CAMBIAR DE ESTADO (HUECO), OFRECER EL AGREGAR]
2. **Cliente en Automotor** (casos 10 y 11). El flujo de cotización no tiene un paso para elegir o crear al cliente, ni forma de re-cotizar desde una póliza. El caso 23 no da de alta un cliente suelto: el "+" de Cartera redirige a cotizar, y el cliente se incorpora solo si queda una cobertura o póliza asociada.
3. **Errores y recuperación al cotizar** (casos 12, 17 y 18) [OPCIONES POR DEFAULT].
4. **Escritura en vez de solo lectura.** Siniestros, mora y avisos solo se pueden ver. Faltan crear, actualizar y cerrar (casos 6, 31, 36 a 38).
5. **Todo el lado del Directivo y del administrativo** (casos 40 a 51).
6. **Piezas transversales**: login, auditoría y carga inicial de pólizas (casos 1, 2, 29 y 51).

## Decisiones abiertas

- **Ramos del MVP.** El prototipo ya cotiza Hogar, Accidentes y ART, pero el presupuesto es solo Automotor (caso 21).
- **Registro de la póliza emitida.** La emite la aseguradora; la app solo la asienta. ¿Entra al MVP y qué datos se cargan? (caso 16).[ En la app es un estado, en la aseguradora habra que corroborar si se registran esos datos de un cliente, o implica una nuev acxarga cuando confirma]
- **Comisiones.** Quién puede aplicar descuentos y qué ve el PAS de su comisión (casos 19, 20, 39 y 45).
- **Estimado mientras responde la compañía.** Si se incorpora caché, debe quedar claro que es un valor aproximado y no una cotización (caso 18).
- **Back-office.** Sus tareas las redacta el equipo de dominio (casos 52 a 54).
- **Sugeridos por mí, a confirmar:** carga inicial de pólizas existentes (29) y registro de auditoría (51; este último sale del requisito de trazabilidad del presupuesto). [excelente y con criterio]

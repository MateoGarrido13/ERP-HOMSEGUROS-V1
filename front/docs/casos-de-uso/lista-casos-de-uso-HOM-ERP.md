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
  login-logout/                 1–4    Acceso, todos los roles
  rubrica_ssn/                  60–61  Extraer archivos y presentar la rúbrica
  PAS/
    pendientes/                 5–8
    multicotizador/             9–26   Cotización y venta
    cartera-cliente/            27–34
    cobranza/                   35–38
    siniestros/                 39–43
    comisiones/                 44
    cross-selling/              62
  ADMINISTRATIVO-OWNER/
    red/                        45–47  Dashboard, rendimiento y cartera por PAS
    mora/                       48–49
    comisiones/                 50
    productores/                51–53  Alta, edición y roles
    configuracion/              54
    siniestros/                 55
    auditoria/                  56
    comunicacion/               63–64  Avisos a la red y contenido formativo
  back-office/
    clientes-y-polizas/         57
    pagos/                      58
    siniestros/                 59
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
| 5   | Ver pendientes (avisos y leads)                                                     | P      | MVP  |
| 6   | Resolver o posponer un aviso [MODIFICAR COMO PAS]                                   | N      | MVP  |

El caso 6 se parte en dos archivos, en `PAS/pendientes/`:

- `CU-Pendientes-06` Resolver un aviso
- `CU-Pendientes-06b` Editar un aviso
| 7   | Contactar al cliente por WhatsApp/ mail desde un aviso                              | P      | MVP  |
| 8   | Gestionar un lead (contactar, reactivar, descartar, convertir en cotización) [epic] | A      | MVP  |

El caso 8 se parte en cuatro archivos, en `PAS/pendientes/`:

- `CU-Pendientes-08a` Contactar un lead
- `CU-Pendientes-08b` Reactivar un lead
- `CU-Pendientes-08c` Descartar un lead
- `CU-Pendientes-08d` Convertir un lead en cotización

## PAS: cotización y venta

`PAS/multicotizador/` · casos 9–26

| #   | Caso de uso                                                                                                       | Origen | Fase   |
| --- | ----------------------------------------------------------------------------------------------------------------- | ------ | ------ |
| 9   | Elegir el ramo a cotizar                                                                                          | P      | MVP    |
| 10  | Seleccionar un cliente existente o crear uno al cotizar                                                           | A      | MVP    |
| 11  | Cotizar automotor ingresando patente, CP y uso, info del titular                                                  | P [A]  | MVP    |
| 12  | Re-cotizar una póliza existente (datos precargados)                                                               | N      | MVP    |
| 13  | Verificar y completar los datos del vehículo (GNC, 0 km, suma asegurada)                                          | P      | MVP    |
| 14  | Cargar el vehículo a mano cuando la patente no decodifica                                                         | N [A]  | MVP    |
| 15  | Comparar cotizaciones de varias compañías a medida que llegan                                                     | P      | MVP    |
| 16  | Manejar una compañía que falla, demora o rechaza el riesgo                                                        | N      | MVP    |
| 17  | Ver un estimado mientras responde la compañía (aclarando que no es precio real)[#16]                              | N      | ?[MVP] |
| 18  | Ver la comisión de cada cotización                                                                                | N      | ?      |
| 19  | Aplicar un descuento sacrificando puntos de comisión                                                              | N      | ?[MVP] |
| 20  | Guardar y retomar una cotización en curso([COMO PAS CAMBIAR EL ESTADO])                                           | N      | MVP    |
| 21  | Elegir una cotización y armar la propuesta                                                                        | P      | MVP    |
| 22  | Generar el PDF de la propuesta[#21]                                                                               | A      | MVP    |
| 23  | Enviar la propuesta por WhatsApp                                                                                  | P      | MVP    |
| 24  | Marcar el resultado de una propuesta (aceptada, rechazada, vencida)[#20]                                          | N      | MVP    |
| 25  | Registrar la póliza emitida por la compañía (nº de póliza, vigencia, compañía) a partir de una propuesta aceptada | N      | ?[MVP] |
| 26  | Multocitizador de  de Hogar, Accidentes Personales o ART (flujo de solicitud)                                     | P      | ?      |

## PAS: clientes y cartera

`PAS/cartera-cliente/` · casos 27–34

| #   | Caso de uso                                                           | Origen | Fase |
| --- | --------------------------------------------------------------------- | ------ | ---- |
| 27  | Buscar y filtrar clientes (sumar búsqueda por nombre)                 | A      | MVP  |
| 28  | Dar de alta un cliente de forma independiente                         | A      | MVP  |
| 29  | Editar los datos de un cliente                                        | N      | MVP  |
| 30  | Ver la ficha del cliente (contacto, pólizas, propuestas, historial)   | A      | MVP  |
| 31  | Ver la cartera y su distribución por ramo                             | P      | MVP  |
| 32  | Ver el detalle de una póliza                                          | A      | MVP  |
| 33  | Enviar la póliza al cliente [#REP23]                                  | P      | MVP  |
| 34  | Cargar pólizas ya existentes (carga inicial de la cartera) [SENSIBLE] | N      | MVP  |

## PAS: cobranza

`PAS/cobranza/` · casos 35–38

| # | Caso de uso | Origen | Fase |
|---|---|---|---|
| 35 | Ver los morosos de mi cartera | A | MVP |
| 36 | Crear o actualizar un ticket de pago (X días para el pago, pago rechazado, pagado) | N | MVP |
| 37 | Guardar la referencia de la factura | N | MVP |
| 38 | Avisar la mora por WhatsApp y dejar registro de que se avisó | A | MVP |
[HAY ALGUNA FORMA DE ESTANDARIZAR LOS AVISOS,BAJO EL FLUJO: AVISO->(A) EDITAR EL ESTADO  ->SE GUARDAN CAMBIOS (B) 
	   -> (B)VISUALIZAR EL DETALLE ->ENVIAR]
## PAS: siniestros

`PAS/siniestros/` · casos 39–43

| #   | Caso de uso                                                                           | Origen | Fase |
| --- | ------------------------------------------------------------------------------------- | ------ | ---- |
| 39  | Ver la lista de siniestros                                                            | P      | MVP  |
| 40  | Ver el detalle de un siniestro (comentario, contactos)                                | P      | MVP  |
| 41  | Registrar un siniestro                                                                | N      | MVP  |
| 42  | Actualizar el ticket (estado, documentación, nº de reclamo, mails, derivación, links) | N      | MVP  |
| 43  | Cerrar un siniestro                                                                   | N      | MVP  |

## PAS: comisiones

`PAS/comisiones/` · caso 44

| # | Caso de uso | Origen | Fase |
|---|---|---|---|
| 44 | Ver mis comisiones, ya descontado lo que retiene la organización | N | ? |

## Directivo y administrativo: red

`ADMINISTRATIVO-OWNER/red/` · casos 45–47

| #   | Caso de uso                                                                                                | Origen | Fase |
| --- | ---------------------------------------------------------------------------------------------------------- | ------ | ---- |
| 45  | Ver el dashboard de la red (KPIs)                                                                          | N      | MVP  |
| 46  | Ver el rendimiento por PAS                                                                                 | N      | MVP  |
| 47  | Ver la cartera resumida de cada PAS  Y SU PROPORCION CON INFO (nombre, apellido, póliza, compañía, estado) | N      | MVP  |

## Directivo y administrativo: mora

`ADMINISTRATIVO-OWNER/mora/` · casos 48–49

| #   | Caso de uso                                                                                  | Origen | Fase |
| --- | -------------------------------------------------------------------------------------------- | ------ | ---- |
| 48  | Ver la mora de la red (fecha de última actualización, plazo de suspensión, importe, filtros) | N      | MVP  |
| 49  | Actualizar el estado de pago de un cliente (también lo hace el PAS)                          | N      | MVP  |

## Directivo y administrativo: comisiones

`ADMINISTRATIVO-OWNER/comisiones/` · caso 50

| #   | Caso de uso                                                                      | Origen | Fase |
| --- | -------------------------------------------------------------------------------- | ------ | ---- |
| 50  | Ver comisiones por póliza y compañía, y los descuentos aplicados                 | N      | ?    |

## Directivo y administrativo: productores

`ADMINISTRATIVO-OWNER/productores/` · casos 51–53

| #   | Caso de uso                              | Origen | Fase |
| --- | ---------------------------------------- | ------ | ---- |
| 51  | Dar de alta un PAS                       | N      | MVP  |
| 52  | Editar, suspender o dar de baja a un PAS | N      | MVP  |
| 53  | Asignar roles y permisos                 | N      | MVP  |

## Directivo y administrativo: configuración

`ADMINISTRATIVO-OWNER/configuracion/` · caso 54

| #   | Caso de uso                                            | Origen | Fase |
| --- | ------------------------------------------------------ | ------ | ---- |
| 54  | Configurar compañías, ramos y coberturas habilitadas   | N      | ?    |

## Directivo y administrativo: siniestros

`ADMINISTRATIVO-OWNER/siniestros/` · caso 55

| #   | Caso de uso                    | Origen | Fase |
| --- | ------------------------------ | ------ | ---- |
| 55  | Consultar siniestros de la red | N      | ?    |

## Directivo y administrativo: auditoría

`ADMINISTRATIVO-OWNER/auditoria/` · caso 56

| #   | Caso de uso                                                                             | Origen | Fase |
| --- | --------------------------------------------------------------------------------------- | ------ | ---- |
| 56  | Consultar el registro de auditoría (quién cambió qué y cuándo) HABRA QUE LOGEAR         | N      | MVP  |

## Back-office

Pendiente hasta que se redacten las tareas del rol. Hipótesis a validar:

### Clientes y pólizas

`back-office/clientes-y-polizas/` · caso 57

| #   | Caso de uso                                              | Origen | Fase |
| --- | -------------------------------------------------------- | ------ | ---- |
| 57  | Cargar o corregir clientes y pólizas en nombre de un PAS | N      | ?    |

### Pagos

`back-office/pagos/` · caso 58

| #   | Caso de uso                                      | Origen | Fase |
| --- | ------------------------------------------------ | ------ | ---- |
| 58  | Actualizar pagos a medida que entran[ACTUALIZAR] | N      | ?    |

### Siniestros

`back-office/siniestros/` · caso 59

| #   | Caso de uso                               | Origen | Fase |
| --- | ----------------------------------------- | ------ | ---- |
| 59  | Seguir siniestros de la red [?AMPLIO]     | N      | ?    |

## Entrega final ['HOY COMO EPICS']

### Rúbrica SSN

`rubrica_ssn/` · casos 60–61

| #   | Caso de uso                                                               | Origen | Fase  |
| --- | ------------------------------------------------------------------------- | ------ | ----- |
| 60  | Extraer los archivos de cada compañía (emisiones, cobranzas, rendiciones) | N      | Final |
| 61  | Consolidar y presentar la rúbrica SSN                                     | N      | Final |

### Cross-selling

`PAS/cross-selling/` · caso 62

| #   | Caso de uso                        | Origen | Fase  |
| --- | ---------------------------------- | ------ | ----- |
| 62  | Ver oportunidades de cross-selling | N      | Final |

### Comunicación a la red

`ADMINISTRATIVO-OWNER/comunicacion/` · casos 63–64

| #   | Caso de uso                         | Origen | Fase  |
| --- | ----------------------------------- | ------ | ----- |
| 63  | Publicar avisos hacia la red        | N      | Final |
| 64  | Enviar contenido formativo a un PAS | N      | Final |

---

## Qué le falta al prototipo

1. **Registro de la póliza emitida** (caso 25). Es el hueco más grande: el flujo va de "Propuesta enviada" a "Cartera" sin ningún paso donde se asiente que la compañía emitió la póliza. La app no emite, es intermediaria, pero sin ese registro la cartera no se llena sola y no se puede calcular la conversión. [SERIA CAMBIAR DE ESTADO (HUECO), OFRECER EL AGREGAR]
2. **Cliente en Automotor** (casos 10, 12 y 28). El flujo no tiene un paso para elegir o crear al cliente, ni forma de re-cotizar desde una póliza.
3. **Errores y recuperación al cotizar** (casos 14, 16 y 20) [OPCIONES POR DEFAULT].
4. **Escritura en vez de solo lectura.** Siniestros, mora y avisos solo se pueden ver. Faltan crear, actualizar y cerrar (casos 6, 36, 41 a 43).
5. **Todo el lado del Directivo y del administrativo** (casos 45 a 56).
6. **Piezas transversales**: login, auditoría y carga inicial de pólizas (casos 1, 2, 34 y 56).

## Decisiones abiertas

- **Ramos del MVP.** El prototipo ya cotiza Hogar, Accidentes y ART, pero el presupuesto es solo Automotor (casos 26).
- **Registro de la póliza emitida.** La emite la aseguradora; la app solo la asienta. ¿Entra al MVP y qué datos se cargan? (caso 25).[ En la app es un estado, en la aseguradora habra que corroborar si se registran esos datos de un cliente, o implica una nuev acxarga cuando confirma]
- **Comisiones.** Quién puede aplicar descuentos y qué ve el PAS de su comisión (casos 18, 19, 44 y 50).
- **Estimado mientras responde la compañía.** Si se incorpora caché, debe quedar claro que es un valor aproximado y no una cotización (caso 17).
- **Back-office.** Sus tareas las redacta el equipo de dominio (casos 57 a 59).
- **Sugeridos por mí, a confirmar:** carga inicial de pólizas existentes (34) y registro de auditoría (56; este último sale del requisito de trazabilidad del presupuesto). [excelente y con criterio]

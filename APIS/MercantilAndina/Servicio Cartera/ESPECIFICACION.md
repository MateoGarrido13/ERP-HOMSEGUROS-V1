# Servicio Cartera — Mercantil Andina (dev)

Fuente: colección Postman `ma-postman-collection` (`../mercantil_postman_collection`). Host de los ejemplos: `https://apidev.mercantilandina.com.ar`.

No hay especificación OpenAPI de estos endpoints en el repositorio. Cada archivo JSON de esta carpeta es un request de esa colección con su ejemplo guardado (código 200). Los tipos de la respuesta de abajo salen de ese único ejemplo. Un campo que en el ejemplo viene `null` figura como null; eso no prueba que siempre lo sea.

La colección no tiene un endpoint llamado "pólizas vigentes". El listado que trae número de póliza y vigencia es `GET /cartera/v1/operaciones`.

## Auth

Todos los requests de esta carpeta usan los mismos headers:

| Header | Valor en la colección |
|---|---|
| Authorization | `Bearer {{api.token}}` |
| Content-Type | `application/json` |
| Ocp-Apim-Subscription-Key | `{{api.key}}` |

No hay ejemplos de 401, 403 ni 400. El único caso con campo `error` es Descargar libre deuda, y en el ejemplo ese string está vacío.

Las descripciones de Postman no sirven como contrato: en Cartera las cuatro dicen "Obtener listado de polizas", y en Pólizas casi todas dicen "Consulta el estado de una solicitud". El nombre del request y la ruta son la evidencia.

## Clientes

Base: `/clientes/v1`. Carpeta de origen en Postman: `ASEGURADOS`.

| Request | Método | Ruta | Archivo |
|---|---|---|---|
| Crear cliente | POST | `/clientes/v1/` | `clientes/crear-cliente.json` |
| Consultar cliente por doc y sexo | GET | `/clientes/v1/personas` | `clientes/consultar-cliente-por-doc-y-sexo.json` |
| Consultar cliente CUIT/CUIL | GET | `/clientes/v1/personas` | `clientes/consultar-cliente-cuit-cuil.json` |

Consulta por documento: query habilitada `sexo`, `dni`. La colección tenía además dos query sin nombre; no se copiaron.

Consulta por CUIT: query habilitada `CUIT`. `CUIL` está en la colección y está deshabilitada.

POST crear cliente: body JSON con `persona`, `apellido`, `nombre`, `contacto`, `sexo`, `tipoDocumento`, `dni`, `cuil`, `cuit`, `nacimiento`, `telefono1`, `email`, `distribucionDigital`, `localidad` (`id`, `postal`, `nombre`, `provincia`), `calle`, `numero`, `departamento`, `barrio`, `actividad` (`id`, `nombre`), `iva` e `ingresosBrutos` (`inscripcion.id`, `inscripcion.nombre`, `retencion`, `percepcion`). La respuesta 200 agrega `id`, `razonSocial`, `telefono2`, `empresa`, `puesto`, `nacionalidad`, `estadoCivil`, `cuenta`, `estado`.

Las dos consultas GET devuelven la ficha de la persona. Los nombres de campo no coinciden con el POST: la consulta usa `tipo_documento`, `razon_social`, `ingresos_brutos`, `estado_civil` y `localidad.codigo_postal`. El POST y su respuesta usan `tipoDocumento`, `razonSocial`, `ingresosBrutos`, `estadoCivil` y `localidad.postal`.

## Cartera

Base: `/cartera/v1`. Las cuatro respuestas paginan con `tamaño`, `total_paginas`, `pagina_actual`, `total_elementos` y `datos`.

| Request | Método | Ruta | Query habilitada | Query presente y deshabilitada | Archivo |
|---|---|---|---|---|---|
| Operaciones | GET | `/cartera/v1/operaciones` | `size`, `page`, `cuentas`, `desde`, `hasta` | `grupo`, `ramas`, `tipo` (`NUEVA`) | `cartera/operaciones.json` |
| Cobranzas | GET | `/cartera/v1/cobranzas` | `page`, `size`, `cuenta`, `desde`, `hasta` | `rama`, `grupo` | `cartera/cobranzas.json` |
| Rechazos | GET | `/cartera/v1/rechazos` | `size`, `page`, `cuenta`, `desde`, `hasta` | `rama` | `cartera/rechazos.json` |
| Comisiones | GET | `/cartera/v1/comisiones` | `size`, `page`, `desde`, `hasta`, `cuenta`, `rama` | — | `cartera/comisiones.json` |

Operaciones usa `cuentas`. Cobranzas, rechazos y comisiones usan `cuenta`. No hay un query `vigente`. Cada ítem de operaciones trae `operacion.vigencia.desde` y `operacion.vigencia.hasta`, más `operacion.poliza`, `endoso`, `tipo`, `asegurado`, `periodo`, `rama`, `productor`, `poliza_anterior`, `fecha_operacion`, `tipo_renovacion`, `bienes` y `cuota`.

Cobranzas y rechazos comparten la forma del ítem: `rama`, `poliza`, `endoso`, `cuota`, `canal`, `costo`, `productor`, `movimiento`, `tarjeta`, `fecha_cobranza`, `fecha_convenio`, `fecha_vencimiento`, `fecha_rechazo`, `tipo_nota`, `motivo_rechazo`. En el ejemplo de cobranzas varios de esos campos vienen null. En rechazos, `motivo_rechazo` es `{codigo, descripcion}` y `tarjeta` es `{codigo, nombre}`.

Comisiones: `rama`, `poliza`, `endoso`, `cuota`, `comision` (`cobranza`, `produccion`, `ayuda`, `organizador`, `otras`, `totales`), `productor`, `costo`, `asegurado` (`nombre`, `dni`), `fecha_movimiento`.

## Pólizas

Base: `/polizas/v1`. Los números de la ruta son los del ejemplo guardado. En consultar póliza, el segundo segmento es `0` y la respuesta trae `endoso: 0`.

| Request | Método | Ruta de ejemplo | Respuesta 200 | Archivo |
|---|---|---|---|---|
| Consultar póliza | GET | `/polizas/v1/516504898/0` | Póliza, tomador, productor, costo | `polizas/consultar-poliza.json` |
| Obtener movimientos de póliza | GET | `/polizas/v1/516504898` | `datos[]` de endosos | `polizas/obtener-movimientos-de-poliza.json` |
| Obtener cuotas de póliza | GET | `/polizas/v1/516504898/0/cuotas` | `datos[]` de cuotas | `polizas/obtener-cuotas-de-poliza.json` |
| Obtener bienes de póliza auto | GET | `/polizas/v1/516504898/0/bienes` | `datos[]` de bienes | `polizas/obtener-bienes-de-poliza-auto.json` |
| Consultar bien de póliza | GET | `/polizas/v1/516504898/0/bienes/1` | `riesgos[]` y `auto` | `polizas/consultar-bien-de-poliza.json` |
| Obtener riesgos de póliza auto | GET | `/polizas/v1/516504898/0/1/riesgo/auto` | Riesgo del auto | `polizas/obtener-riesgos-de-poliza-auto.json` |

Consultar póliza incluye `desde`, `hasta`, `fin`, `emitido`, `tipo`, `cobertura`, `tomador` y `costo`. Movimientos: `poliza`, `endoso`, `emitido`, `tipo`, `desde`, `hasta`, `moneda`, `premio`, con `offset`, `limit`, `cantidad`, `total`. Cuotas: `id`, `vence`, `convenio`, `estado`, `pagado`, `caja`, `moneda`, `importe`, `recibo`.

Descargas. La descripción de Postman dice que devuelven una URL. El ejemplo es `{ "url": string }`, salvo libre deuda, que también trae `error` vacío. La URL del ejemplo incluye query string.

| Request | Ruta de ejemplo | Archivo |
|---|---|---|
| Descargar certificado de cobertura | `/polizas/v1/516504898/0/certificado` | `polizas/descargar-certificado-de-cobertura.json` |
| Descargar cupón | `/polizas/v1/516504898/0/cupon` | `polizas/descargar-cupon.json` |
| Descargar frente de póliza | `/polizas/v1/516504898/0/frente` | `polizas/descargar-frente-de-poliza.json` |
| Descargar libre deuda | `/polizas/v1/516504895/0/1/libredeuda` | `polizas/descargar-libre-deuda.json` |
| Descargar póliza | `/polizas/v1/516504898/0/poliza` | `polizas/descargar-poliza.json` |
| Descargar póliza productor | `/polizas/v1/516504898/0/productor` | `polizas/descargar-poliza-productor.json` |
| Descargar recibo pago | `/polizas/v1/64274022/0/recibos/1` | `polizas/descargar-recibo-pago.json` |
| Descargar tarjeta rc | `/polizas/v1/516504898/0/tarjetarc` | `polizas/descargar-tarjeta-rc.json` |

## Fuera de esta carpeta

Quedaron en la colección, sin copiar: `RAMAS-VARIAS/POLIZA` (obtener suscripción, detalle de póliza, descargar póliza) y `SINIESTROS/Consultar siniestros por póliza`.

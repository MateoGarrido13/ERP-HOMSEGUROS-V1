# Spec: Vuelta al formulario cuando ningún proveedor cotiza (CU-17)

| | |
|---|---|
| **US** | Sin clave Jira. No se asigna un número ERP inventado. |
| **Épica** | Multicotizador automotor |
| **CU origen** | CU-17 `docs/casos-de-uso/PAS/multicotizador/masivo/automotor/CU-17-AUT-Multicotizador_Cargar_Riesgo.md` (alterno `6.a.a`, RN_12). El riesgo de credencial también queda en ese CU. |
| **Tipo** | Pantalla/UI · Integración |
| **Estado** | Aprobada |
| **Autor** | con IA |
| **Revisor** | — |
| **Fecha** | 2026-11-14 (aprobada 2026-11-15) |

## 1. Contexto y objetivo

CU-17 `6.a.a` decía, a la vez, que ante cero cotizaciones se volvía a la página de inicio y que se iba al paso 4. El destino correcto es el mismo formulario de carga del bien.

**Objetivo:** cuando ningún proveedor devuelve cotización, el PAS sigue en el formulario de carga de datos del bien, con los campos ya autocompletados, y ve «El vehículo posee pólizas vigentes».

## 2. Alcance

**Dentro:**
- Destino de CU-17 `6.a.a` cuando la cantidad de cotizaciones obtenidas es 0.
- Registro del riesgo de la credencial única de consulta.

**Fuera de alcance:**
- El resto de CU-17: flujo principal, `2a`, `3a`, `4a`, `6a` de validación, `6.b` y la entrada con datos precargados (CU-11).
- CU-17 `6.a` cuando al menos un proveedor sí devuelve cotización (`6.a.2` y `6.a.3`).
- Diseño de pantallas, estados y validaciones de campo: queda para `ui-spec-author`.
- Diseño del puerto del hub y de cómo dejar de usar una sola credencial: queda para `arch-designer`.
- Cambiar la credencial o el código de `supabase/functions/cotizar/`.

## 3. Componentes afectados

| Qué | Dónde | Cambio |
|---|---|---|
| Formulario de carga del bien | CU-17, paso 4 | Si no hay cotizaciones, el PAS permanece ahí con los campos ya autocompletados |
| Mensaje | CU-17 `6.a.a.1` | Se muestra «El vehículo posee pólizas vigentes» en ese formulario |
| Credencial de consulta | Riesgo registrado en CU-17 | Sin cambio de diseño en esta spec |

## 4. Diseño

Cuando la consulta no obtiene ninguna cotización, la solución no navega al inicio. Conserva lo ya cargado en el formulario del bien y muestra el mensaje. No define cómo se obtiene la credencial del proveedor: solo registra que la credencial actual, en algunos casos, es de un único PAS para toda la aplicación.

### 4.1 Flujo

1. El PAS está en el formulario de carga de datos del bien (CU-17, paso 4) y los campos ya están autocompletados.
2. Ningún proveedor devuelve cotización (CU-17 `6.a.a`).
3. El sistema muestra «El vehículo posee pólizas vigentes».
4. El sistema vuelve a ese mismo formulario. Los campos siguen autocompletados (CU-17 `6.a.a.1`, `6.a.a.2`, RN_12).
5. No abre la página de inicio.

## 5. Reglas de negocio

| # | Regla | Origen |
|---|---|---|
| RN-1 | Si la cantidad de cotizaciones es 0, el PAS permanece en el mismo formulario de carga de datos del bien, con los campos ya autocompletados, y ve «El vehículo posee pólizas vigentes». | CU-17 `6.a.a`, RN_12. Decisión explícita de esta sesión. |
| RN-2 | Ese resultado no navega a la página de inicio. | CU-17 `6.a.a.1` |
| RN-3 | La credencial única se usa para enviar y recibir las cotizaciones de las compañías / APIs proveedoras. Es la misma conexión para toda la aplicación y, en algunos casos, está asociada a un solo PAS (un administrativo). En bienes con póliza vigente el inconveniente se repite siempre. Si se necesitara la cartera de todos los clientes en esas APIs, no se podrá obtener. | Riesgo registrado en CU-17. Decisión explícita de esta sesión. |

## 6. Casos borde y manejo de errores

| Situación | Comportamiento esperado |
|---|---|
| Datos vacíos | Fuera de este alcance. Lo cubre CU-17 `6a`. |
| Datos inválidos | Fuera de este alcance. Lo cubre CU-17 `2a` y `6a`. |
| Usuario sin permiso | No lo define CU-17 `6.a.a`. |
| Falla de servicio externo | Si ningún proveedor devuelve cotización, se aplica RN-1. No se distingue en el CU un timeout de un rechazo por póliza vigente. |
| Doble envío / acción repetida | No está en CU-17 `6.a.a`. |
| Bien con póliza vigente y credencial única | RN-3. El envío y la recepción de cotizaciones salen con esa credencial. El proveedor no ve al PAS que opera. Esta spec no cambia la credencial. |
| Cartera de todos los clientes en las APIs | RN-3. No se podrá obtener. La conexión solo ve la cartera del único PAS / administrativo asociado a esa credencial. |

## 7. Criterios de aceptación verificables

- [ ] CA-1: Con cero cotizaciones, la pantalla visible es el formulario de carga de datos del bien y no la página de inicio (CU-17 `6.a.a.1`).
- [ ] CA-2: En esa vuelta, los campos del formulario siguen con los valores ya autocompletados (CU-17 `6.a.a.2`, RN_12).
- [ ] CA-3: Se muestra el mensaje «El vehículo posee pólizas vigentes» (CU-17 `6.a.a.1`).
- [ ] CA-4: El riesgo queda escrito: la credencial sirve para enviar y recibir cotizaciones; no se podrá obtener la cartera de todos los clientes en esas APIs; no se resuelve como cambio de credencial (RN-3).

## 8. Decisiones descartadas

| Alternativa | Por qué no |
|---|---|
| Volver a la página de inicio cuando no hay cotizaciones | CU-17 `6.a.a.1` lo decía y quedó descartado: el destino es el mismo formulario. |
| Resolver en esta spec el modelo de credencial por PAS | El pedido es registrar el riesgo. El diseño del puerto queda para `arch-designer`. |

## 9. Supuestos

- [ ] SUP-1: «Campos ya autocompletados» son los valores que el formulario del bien ya mostraba en el paso 4, sin una nueva decodificación ni un blanqueo. → *confirmado por: decisión de esta sesión, pendiente de lectura humana*

## 10. Preguntas abiertas

- [x] PA-1: CU-17 RN_8 decía que la consulta ocurría al comparar (CU-18). Resuelto: ocurre en CU-17. El PAS carga todos los campos del formulario, toca "cotizar", se validan los obligatorios y, recién con todos los checks, se envían las consultas en paralelo. → *respuesta: el usuario, 2026-11-15*
- [ ] PA-2: Qué clave Jira corresponde a esta spec. Hoy no hay una en `docs/guia-jira.md` para CU-17. → *respuesta / quién decide: ___*

## 11. Historial de cambios

| Fecha | Cambio | Motivo | PR |
|---|---|---|---|
| 2026-11-14 | Versión inicial | Corregir el destino de CU-17 `6.a.a` y registrar el riesgo de la credencial única. | |
| 2026-11-15 | Aprobada en revisión conjunta | PA-2 clave Jira: ERP-255; SUP-1 'campos autocompletados' = valores del paso 4, sin decodificación nueva | |
| 2026-11-15 | PA-1 resuelto | La consulta a las compañías sale en CU-17, después de "cotizar" y de validar los campos obligatorios. | |
| 2026-11-15 | RN-3 ampliado | Credencial única = envío y recepción de cotizaciones. Riesgo: no se obtiene la cartera de todos los clientes en las APIs. | |

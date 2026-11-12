## CU-23 — Sumar una póliza con "+"
*Archivo:* `CU-23-Cartera_Dar_de_Alta_Cliente.md` (se conserva). El índice usa este título.
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene la sesión abierta (REF CU-01-Acceso_Iniciar_Sesion). Hay conexión.
*Disparador:* Sumar una póliza desde Cartera, con el control "+"

*Flujo principal*
1. El PAS abre "Cartera" o la ficha de un cliente que ya está en su cartera (REF CU-22-Cartera_Buscar_y_Filtrar_Clientes, CU-25-Cartera_Ver_Ficha_Cliente)
2. El PAS selecciona "+"
3. El sistema redirige a Cotizar (REF CU 9)
4. Si partió de la ficha, ese cliente queda seleccionado. Si partió de Cartera, el PAS selecciona un cliente existente o carga uno en el flujo de cotización (REF CU 10) (*ALT CLIENTE EXISTENTE)
5. El PAS completa la cotización del ramo
6. El cliente se muestra en Cartera cuando el PAS registra la póliza emitida desde Pendientes (REF CU-16: `activa=true`). Hasta el envío de la propuesta queda persistido con `activa=false` y no aparece en Cartera (*ALT SIN POLIZA)
7. El sistema abre la ficha del cliente (REF CU-25-Cartera_Ver_Ficha_Cliente). En Cartera solo quedan expuestas las pólizas vigentes
8. El sistema registra el PAS, el cliente, la cobertura o póliza asociada, la fecha y la hora (REF CU 51)

*Flujos alternativos*

`4. El PAS selecciona un cliente existente o carga uno en el flujo de cotización`
4.1. El documento ya pertenece a un cliente
4.2. El sistema reutiliza ese cliente y no crea otro registro (REF CU 10)
4.3. **IR A (5)**

`6. Cuando el PAS registra la póliza emitida`
6.1. El PAS abandona Cotizar sin enviar la propuesta, o envía y no registra la póliza (CU-16)
6.2. Si no envió, el cliente nuevo no queda persistido (la cotización «En curso» solo vive en la sesión; REF CU-12)
6.3. Si envió y no registró la póliza, el cliente queda con `activa=false` y no se muestra en Cartera
6.4. Si el cliente ya estaba en Cartera (`activa=true`), permanece como estaba, sin la póliza nueva
6.5. **FIN**

*Postcondiciones*
1. El cliente se muestra en Cartera solo con `activa=true` (REF CU-16)
2. El envío de la propuesta no alcanza para mostrarlo en Cartera (`activa=false`)
3. En Cartera se exponen únicamente las pólizas vigentes
4. La incorporación queda en el registro de auditoría

*Reglas de negocio asociadas*
RN_1: Formulación canónica de incorporación a Cartera: se muestra (`activa=true`) solo al registrar la póliza emitida (REF CU-16). El envío (CU-14) persiste `activa=false`. CU-10 RN_5 REF esta regla.
RN_2: "+" no abre un alta de cliente suelta. Redirige a Cotizar (REF CU 9).
RN_3: Unicidad del documento: REF CU-10 RN_2 (un asegurado ↔ un PAS; aviso sin datos si es de otro productor).
RN_4: El cliente incorporado pertenece a la cartera del PAS que tiene la sesión.
RN_5: En Cartera solo se exponen las pólizas vigentes. Un automotor nuevo de un cliente que ya tiene vigentes se suma bajo el mismo nombre cuando queda vigente. Eliminar una póliza manda ese registro a Leads, con el detalle del bien que se tenía asegurado, tenga o no otras vigentes (REF CU-05-Pendientes_Ver_Pendientes, transicion-estados-bien.md).
RN_6: Sumar una póliza con "+" no emite la póliza legal. La visibilidad en Cartera sigue el registro de emisión (REF CU-16) o la carga inicial (REF CU-29).

*Supuestos a confirmar*
SUP_1: Resuelto. La propuesta enviada no muestra al cliente en Cartera. La incorporación visible es CU-16 (`activa=true`).
SUP_2: Cómo se incorpora una persona jurídica. La cartera del prototipo contiene razones sociales.
SUP_3: Dónde se consulta un cliente cuya única póliza dejó de estar vigente sin haber sido eliminada. Si se eliminó la última vigente, no se muestra en Cartera, queda el lead de esa póliza y sigue en "Cliente existente" (REF transicion-estados-bien.md, CU-10-Multicotizador_Seleccionar_o_Crear_Cliente).
SUP_4: Quién registra que se eliminó la póliza: el PAS, la compañía o un estado de la póliza.

## CU-11-Multicotizador_Recotizar_Poliza_Existente
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene abierto el detalle de una póliza vigente de su cartera (REF CU-27-Cartera_Ver_Detalle_Poliza). Hay conexión.
*Disparador:* Recotizar una póliza vigente

*Flujo principal*
1. El PAS selecciona "Recotizar" en el detalle de la póliza (REF CU-27-Cartera_Ver_Detalle_Poliza)
2. El sistema toma de esa póliza el ramo, el cliente y los datos disponibles del riesgo o bien asegurado
3. El sistema abre una cotización nueva en ese ramo con ese cliente ya asociado, sin mostrar "Elegí la cobertura" (REF CU-09-Multicotizador_Elegir_Ramo) ni "¿A quién querés asegurar?" (REF CU-10-Multicotizador_Seleccionar_o_Crear_Cliente)
4. El sistema abre la carga del riesgo con los datos de la póliza precargados: la del riesgo a cotizar si el ramo es masivo (REF CU 17) o la de la solicitud si es no masivo (REF CU 21)
5. El PAS revisa los datos precargados y corrige o completa lo que haga falta (*ALT ABANDONO)
6. El PAS sigue la cotización del ramo como una cotización nueva (REF CU 13), sin que la póliza de origen cambie

*Flujos alternativos*

`5. El PAS revisa y completa los datos`
5a.1. El PAS abandona la cotización antes de terminar la carga del riesgo
5a.2. El sistema no genera ninguna propuesta ni modifica la póliza de origen
5a.3. **FIN**

*Postcondiciones*
1. Queda abierta una cotización nueva en el ramo de la póliza de origen, con el cliente ya asociado y el riesgo precargado con los datos disponibles de esa póliza
2. La póliza de origen no se modifica ni cambia de estado por el solo hecho de recotizar
3. Si el PAS abandonó antes de completar la carga del riesgo, no queda ninguna propuesta generada
4. A partir de la carga del riesgo, la cotización nueva sigue el mismo camino que cualquier otra (REF CU 13 y siguientes)

*Reglas de negocio asociadas*
RN_1: Recotizar reutiliza el ramo, el cliente y los datos del riesgo que la póliza tenga disponibles; no vuelve a pedir el ramo (REF CU-09) ni el alta del cliente (REF CU-10).
RN_2: Recotizar solo está disponible desde una póliza vigente de la cartera del PAS (REF CU-27-Cartera_Ver_Detalle_Poliza). Una propuesta pendiente en Lead se recotiza por otro camino (REF CU-08b-Pendientes_Reactivar_Lead, CU-08d-Pendientes_Convertir_Lead_en_Cotizacion).
RN_3: La cotización que se genera es independiente de la póliza de origen. No la reemplaza ni la da de baja.
RN_4: El cliente de la cotización es el de la póliza de origen y no se puede cambiar dentro de este flujo. Para recotizar a otro cliente, el PAS vuelve a Cartera y repite el caso desde la póliza que corresponda.
RN_5: El PAS puede modificar cualquier dato precargado del riesgo antes de continuar; el sistema no obliga a cotizar con los mismos valores.
RN_6: Si la póliza de origen no tiene todos los datos del riesgo, el sistema precarga lo que tiene y deja el resto para que el PAS lo complete.
RN_7: A partir de la carga del riesgo, esta cotización sigue las mismas reglas que una cotización nueva (REF CU 13 en adelante).

*Supuestos a confirmar*
SUP_1: Qué pasa con la póliza vigente cuando la recotización termina en una propuesta aceptada y una póliza nueva emitida para el mismo bien: si la anterior se da de baja sola o el PAS la retira a mano (REF CU 16, CU-27-Cartera_Ver_Detalle_Poliza).
SUP_2: Si recotizar es también el camino para una renovación, o si la renovación es un caso distinto que todavía no está en la lista.
SUP_3: Qué datos del riesgo guarda hoy la cartera por ramo, para saber cuánto se puede precargar en Automotor, Hogar, Accidentes Personales y ART (REF CU-27-Cartera_Ver_Detalle_Poliza SUP_2).
SUP_4: Si recotizar arrastra la compañía de la póliza de origen como preseleccionada en el comparador, o si vuelve a consultar a todas (REF CU 18).

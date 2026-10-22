## CU-13-Multicotizador_Armar_Propuesta_y_Generar_PDF
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene una cotización con cliente y riesgo cargados, y ya eligió una o más cotizaciones para comparar (ramo masivo, REF CU 18) o ya cargó la solicitud (ramo no masivo, REF CU 21). Hay conexión.
*Disparador:* Terminar de armar la propuesta para el cliente

*Flujo principal*
1. El PAS selecciona "Armar propuesta", tras elegir una o más cotizaciones (ramo masivo, REF CU 18) o al terminar la solicitud (ramo no masivo, REF CU 21)
2. El sistema muestra el resumen de la propuesta: los datos del cliente y del tomador si son distintos, el riesgo cargado y cada combinación compañía-cobertura elegida con su precio y vigencia (ramo masivo), o la solicitud cargada a la espera de que la compañía cotice (ramo no masivo)
3. El PAS revisa el resumen y selecciona "Generar PDF" (*ALT VOLVER A ELEGIR, *ALT CORREGIR DATOS)
4. El sistema genera el PDF de la propuesta con los datos del resumen (*ALT ERROR AL GENERAR)
5. El sistema guarda la propuesta con estado "Generada", asociada a la cotización y al cliente
6. El sistema muestra la propuesta generada y ofrece enviarla al cliente (REF CU-14-Multicotizador_Enviar_Propuesta_por_WhatsApp)

*Flujos alternativos*

`3a. El PAS vuelve a elegir otra combinación (ramo masivo)`
3a.1. El PAS vuelve a la comparación de cotizaciones (REF CU 18)
3a.2. El sistema conserva el cliente y el riesgo cargados
3a.3. **IR A (1)**

`3b. El PAS corrige un dato antes de generar`
3b.1. El PAS vuelve a la carga del riesgo (REF CU 17 o CU 21) o a los datos del cliente (REF CU-10)
3b.2. El PAS corrige lo que haga falta y vuelve al resumen
3b.3. **IR A (1)**

`4a. El sistema no puede generar el PDF`
4a.1. Falla la generación del PDF
4a.2. El sistema informa el error y no guarda ninguna propuesta
4a.3. El PAS puede reintentar
4a.4. **IR A (3)**

*Postcondiciones*
1. Queda generada una propuesta en PDF asociada a la cotización, con el cliente, el riesgo y la o las combinaciones compañía-cobertura elegidas, o la solicitud, según el ramo
2. La propuesta queda en estado "Generada", previo a enviarse (REF CU-14)
3. La cotización deja de estar "En curso" una vez generada la propuesta (REF CU-12)
4. Si el PAS no llegó a generar el PDF, la cotización sigue "En curso" con lo cargado hasta ese momento (REF CU-12)
5. No se contactó a ninguna compañía ni se emitió ninguna póliza

*Reglas de negocio asociadas*
RN_1: Solo se puede generar la propuesta si el ramo es masivo y el PAS eligió al menos una combinación compañía-cobertura (REF CU 18), o si es no masivo y la solicitud está completa (REF CU 21).
RN_2: La propuesta puede incluir más de una combinación compañía-cobertura, para que el cliente elija entre ellas.
RN_3: El riesgo y el cliente son datos de la cotización, no de la propuesta; generar la propuesta no los modifica (*ALT CORREGIR DATOS, 3b).
RN_4: Esta acción se audita: cotización, PAS y fecha de generación (REF CU 51).
RN_5: Generar la propuesta no la envía al cliente; el envío es un paso aparte (REF CU-14).
RN_6: El descuento aplicado, si lo hubo, queda reflejado en el precio de cada combinación de la propuesta (REF CU 20). La comisión no forma parte del precio ni figura en la propuesta (REF CU 19).

*Supuestos a confirmar*
SUP_1: Qué formato y datos exactos lleva el PDF (logo del broker, datos de la aseguradora, condiciones, vigencia de la cotización).
SUP_2: Si la propuesta de un ramo no masivo se genera sin precio, a la espera de que la compañía cotice aparte, o si el PAS carga un precio a mano antes de generarla.
SUP_3: Si el PAS puede agregar algo al PDF (un comentario, por ejemplo) o si es una plantilla fija sin edición.
SUP_4: Cuánto tiempo queda vigente una propuesta generada antes de vencer (REF CU-15-Multicotizador_Marcar_Resultado_de_Propuesta).
SUP_5: Si se puede volver a generar el PDF de una propuesta ya generada (por ejemplo, para reenviarla) o si cada "Generar" crea una propuesta nueva y deja la anterior obsoleta.
SUP_6: Qué datos del tomador se piden cuando es distinto del asegurado, y en qué paso se cargan (REF CU-10-Multicotizador_Seleccionar_o_Crear_Cliente).

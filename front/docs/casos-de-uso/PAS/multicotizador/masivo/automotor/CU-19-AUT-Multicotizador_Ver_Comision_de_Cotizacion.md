## CU-19-AUT-Multicotizador_Ver_Comision_de_Cotizacion
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene abierta la comparación de cotizaciones de Automotor (REF CU-18-AUT-Multicotizador_Comparar_Cotizaciones). Hay conexión.
*Disparador:* Saber cuánto gana con cada cotización antes de elegir

*Flujo principal*
1. En la comparación, el PAS activa "Ver mi comisión". Por defecto la comisión está oculta (*ALT OCULTAR)
2. El sistema calcula la comisión estimada del PAS para cada cotización en estado "Listo" (*ALT SIN COMISION DEFINIDA)
3. El sistema muestra en cada tarjeta "Listo" el porcentaje y el monto estimado de la comisión del PAS, ya descontado lo que retiene la organización (*ALT LLEGA OTRA COTIZACION)
4. El sistema registra la consulta (REF CU 51)
5. El PAS compara las comisiones y sigue con la comparación (REF CU-18-AUT-Multicotizador_Comparar_Cotizaciones). Puede aplicar un descuento a una cotización (REF CU-20-AUT-Multicotizador_Aplicar_Descuento)

*Flujos alternativos*

`1. El PAS activa "Ver mi comisión"`
1.1. El PAS desactiva "Ver mi comisión"
1.2. El sistema oculta la comisión de todas las tarjetas
1.3. El sistema no registra nada
1.4. **FIN**

`2. El sistema calcula la comisión estimada`
2.1. Para una compañía no hay un porcentaje de comisión definido para este ramo y este PAS
2.2. El sistema muestra en esa tarjeta "Comisión no disponible"
2.3. El sistema no bloquea la comparación ni el resto de las cotizaciones
2.4. **IR A (4)**

`3. El sistema muestra la comisión en cada tarjeta`
3.1. Una compañía que seguía cargando responde después de que el PAS activó "Ver mi comisión"
3.2. El sistema calcula la comisión de esa cotización y la agrega a su tarjeta cuando pasa a "Listo"
3.3. **IR A (4)**

*Postcondiciones*
1. Las tarjetas "Listo" muestran la comisión estimada del PAS mientras "Ver mi comisión" esté activo
2. El precio de cada cotización y las cotizaciones marcadas no cambian
3. Queda registrado que el PAS consultó su comisión sobre esta cotización
4. Si el PAS desactivó "Ver mi comisión", la pantalla vuelve a mostrar solo precios

*Reglas de negocio asociadas*
RN_1: La comisión está oculta por defecto. El PAS la muestra a pedido, porque la pantalla de comparación puede estar a la vista del cliente.
RN_2: El PAS ve solo su propia comisión, ya descontado lo que retiene la organización (REF CU 39).
RN_3: La comisión mostrada es una estimación sobre la cotización. No es lo liquidado ni lo cobrado.
RN_4: La comisión no forma parte del precio al cliente. No aparece en la propuesta, en el PDF ni en el mensaje que se envía (REF CU 13, CU 14).
RN_5: Ver la comisión no modifica el precio, las cotizaciones marcadas ni la comparación.
RN_6: Consultar la comisión queda en el registro de auditoría: PAS, cotización, fecha y hora (REF CU 51).
RN_7: La comisión solo se muestra para cotizaciones en estado "Listo".
RN_8: El porcentaje de comisión depende de la compañía, del ramo y del PAS (REF CU 49).

*Supuestos a confirmar*
SUP_1: Qué ve el PAS exactamente: comisión neta, o también la cadena (compañía, organizador, PAS) y el override. Es una pregunta abierta del modelo de negocio.
SUP_2: Sobre qué base se calcula la comisión: prima comercial, o prima con recargos e impuestos.
SUP_3: Si el monto se expresa por mes, por cuota o por el total de la póliza.
SUP_4: De dónde sale el porcentaje de cada compañía: de un acuerdo cargado en el sistema, o lo informa la propia compañía en su respuesta.
SUP_5: Si el control "Ver mi comisión" vive en la pantalla de comparación o en una vista aparte, por la recomendación de no mostrar comisiones en la pantalla de cotización del PAS.
SUP_6: Fase del caso. La lista lo marca como `?`: falta confirmar si entra en el MVP o en la entrega final.
SUP_7: Si el registro de auditoría guarda una entrada por cada vez que se activa el control, o una sola por cotización.

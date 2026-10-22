## CU-18-AUT-Multicotizador_Comparar_Cotizaciones
*Actor principal:* PAS
*Actor secundario:* Mercantil Andina, Sancor Seguros, Zurich, La Segunda y Allianz (APIs de las compañías)
*Precondiciones:* El PAS tiene una cotización de Automotor con el cliente asociado (REF CU-10-Multicotizador_Seleccionar_o_Crear_Cliente) y el vehículo cargado (REF CU-17-AUT-Multicotizador_Cargar_Riesgo). Hay conexión.
*Disparador:* Ver cuánto cuesta asegurar el vehículo en cada compañía

*Flujo principal*
1. El sistema arma el pedido con los datos del cliente y del vehículo y consulta en paralelo a todas las compañías habilitadas para Automotor
2. El sistema muestra "Comparar primas" con una tarjeta por compañía, todas en estado "Cargando" (sin precio)
3. A medida que cada compañía responde, el sistema pasa su tarjeta a "Listo" y muestra la cobertura y el precio mensual (*ALT COMPAÑIA FALLA, *ALT SIN RESPUESTA A TIEMPO, *ALT RECHAZA EL RIESGO)
4. El PAS marca una o más cotizaciones en estado "Listo", sin necesidad de esperar a las que siguen cargando (*ALT NINGUNA COTIZA)
5. El sistema destaca como "Opción destacada" la de menor precio entre las marcadas, y a las demás las muestra como "Alternativa"
6. El PAS selecciona "Armar propuesta" (*ALT CORREGIR EL RIESGO)
7. El sistema conserva la selección y pasa a armar la propuesta (REF CU 13)

*Flujos alternativos*

`3a. Una compañía falla`
3a.1. La API de la compañía devuelve un error
3a.2. El sistema pasa su tarjeta a "No disponible" y no muestra precio
3a.3. El PAS puede marcar las demás cotizaciones, o selecciona "Reintentar" en esa tarjeta
3a.4. Si reintenta, el sistema vuelve a consultar solo a esa compañía
3a.5. **IR A (3)**

`3b. Una compañía no responde a tiempo`
3b.1. La compañía excede el tiempo máximo de espera
3b.2. El sistema pasa su tarjeta a "Sin respuesta" y la comparación queda parcial
3b.3. El PAS puede seguir con las compañías que respondieron o reintentar esa
3b.4. Si reintenta, el sistema vuelve a consultar solo a esa compañía
3b.5. **IR A (3)**

`3c. Una compañía rechaza el riesgo`
3c.1. La compañía responde, pero no acepta cotizar este vehículo o este cliente
3c.2. El sistema pasa su tarjeta a "No cotiza" e informa el motivo si la compañía lo devolvió
3c.3. El sistema no ofrece reintentar, porque la respuesta no va a cambiar
3c.4. **IR A (4)**

`4a. Ninguna compañía cotiza`
4a.1. Todas las compañías quedaron en "No disponible", "Sin respuesta" o "No cotiza"
4a.2. El sistema informa que no hay cotizaciones y deja deshabilitado "Armar propuesta"
4a.3. El PAS reintenta las compañías que fallaron o no respondieron, y el sistema vuelve a consultarlas
4a.4. **IR A (3)**

`4a.3. El PAS decide no reintentar`
4a.3.1. El PAS corrige el vehículo o el cliente
4a.3.2. **IR A (6a)**

`4a.3. El PAS decide no reintentar (sale)`
4a.3.1. El PAS sale sin continuar
4a.3.2. La cotización queda "En curso" (REF CU-12-Multicotizador_Guardar_y_Retomar_Cotizacion)
4a.3.3. **FIN**

`6a. El PAS corrige el riesgo`
6a.1. El PAS vuelve a la carga del vehículo (REF CU-17-AUT-Multicotizador_Cargar_Riesgo) o a los datos del cliente (REF CU-10-Multicotizador_Seleccionar_o_Crear_Cliente)
6a.2. El sistema descarta las cotizaciones y la selección, porque ya no corresponden a los datos
6a.3. Al terminar de corregir, el sistema vuelve a consultar a las compañías
6a.4. **IR A (1)**

`La entrada es la vuelta desde la propuesta`
E.1. El PAS llegó desde armar la propuesta, para elegir otra combinación (REF CU 13)
E.2. Si las cotizaciones siguen vigentes, el sistema las muestra tal como estaban, con la selección anterior, sin volver a consultar
E.3. **IR A (4)**

`E.2. Si las cotizaciones siguen vigentes`
E.2.1. Las cotizaciones ya vencieron
E.2.2. El sistema informa que los precios caducaron y vuelve a consultar a las compañías
E.2.3. **IR A (1)**

`La entrada es una cotización "En curso" retomada`
R.1. El PAS retomó una cotización "En curso" (REF CU-12-Multicotizador_Guardar_y_Retomar_Cotizacion)
R.2. La cotización "En curso" conserva el riesgo, pero no los precios; el sistema vuelve a consultar a las compañías
R.3. **IR A (1)**

*Postcondiciones*
1. La cotización tiene una o más cotizaciones marcadas, cada una con su compañía, cobertura y precio: una destacada y las demás como alternativas
2. Si alguna compañía falló, no respondió o rechazó el riesgo, la comparación queda parcial y la tarjeta de esa compañía lo indica
3. No se generó ninguna propuesta ni se emitió ninguna póliza
4. Si el PAS salió sin marcar ninguna cotización, la cotización queda "En curso" con el riesgo cargado y sin precios (REF CU-12-Multicotizador_Guardar_y_Retomar_Cotizacion)
5. Cambiar el riesgo o el cliente deja sin efecto las cotizaciones obtenidas

*Reglas de negocio asociadas*
RN_1: Se consulta a todas las compañías habilitadas para Automotor: Mercantil Andina, Sancor Seguros, Zurich, La Segunda y Allianz. El prototipo hoy muestra Sancor, Mercantil Andina y Allianz (REF CU 49).
RN_2: La consulta es en paralelo y sin bloquear la pantalla. Una compañía lenta no congela al PAS.
RN_3: Una comparación parcial es válida. El PAS puede avanzar con las compañías que respondieron.
RN_4: Cada tarjeta indica su estado: "Cargando", "Listo", "No disponible", "Sin respuesta" o "No cotiza".
RN_5: Solo se puede marcar una cotización en estado "Listo", es decir, una que tiene precio.
RN_6: El precio se muestra por mes e incluye prima comercial, recargos e impuestos.
RN_7: Hay que marcar al menos una cotización para poder armar la propuesta. Se pueden marcar varias.
RN_8: Entre las cotizaciones marcadas, el sistema destaca la de menor precio. Las demás quedan como alternativas.
RN_9: Una cotización de una compañía es una oferta ajena que caduca. No es una póliza y no obliga a emitirla.
RN_10: Cambiar el cliente o los datos del vehículo invalida las cotizaciones obtenidas. Hay que volver a consultar.
RN_11: Retomar una cotización "En curso" vuelve a consultar a las compañías, porque solo conserva el riesgo y no los precios (REF CU-12-Multicotizador_Guardar_y_Retomar_Cotizacion).
RN_12: Las coberturas de todas las compañías se muestran con un nombre común, por ejemplo "Terceros completo", para que sean comparables.
RN_13: Consultar a las compañías y marcar cotizaciones no se audita como acción del PAS. La auditoría empieza al generar la propuesta (REF CU 13, CU 51).
RN_14: Cómo se comunica el sistema con cada compañía (autenticación, formato de los mensajes, tiempos y reintentos) se define en las especificaciones técnicas, no en este caso.

*Supuestos a confirmar*
SUP_1: Estimado mientras responde la compañía. Si se incorpora, hay que dejar claro que es un valor aproximado y no una cotización, y que no se puede marcar ni enviar. Hoy el prototipo muestra "—" mientras espera.
SUP_2: Tiempo máximo de espera por compañía, y cuántas veces se puede reintentar.
SUP_3: Si el PAS puede reintentar una compañía que falló o no respondió. El prototipo hoy no tiene esa opción.
SUP_4: Cuántas coberturas devuelve cada compañía y si el PAS elige la cobertura o solo la compañía. El prototipo muestra una por compañía ("Terceros completo"), y se asume que toda compañía ofrece al menos Terceros.
SUP_5: Qué motivo informa una compañía al rechazar el riesgo y cuánto de ese texto se le muestra al PAS.
SUP_6: Cuánto tiempo sigue vigente una cotización antes de caducar, y si esa vigencia es la misma para todas las compañías.
SUP_7: Criterio de "Opción destacada". El prototipo usa el menor precio; el mockup la rotula "Mejor relación", que podría considerar también la cobertura.
SUP_8: Si hay un máximo de cotizaciones que se pueden marcar.
SUP_9: Si la comisión de cada cotización se ve en esta misma pantalla y si el descuento se aplica acá (REF CU-19-AUT-Multicotizador_Ver_Comision_de_Cotizacion, CU-20-AUT-Multicotizador_Aplicar_Descuento).
SUP_10: Si cada consulta a una compañía (pedido y respuesta) se registra a nivel técnico para trazabilidad, aunque no se audite como acción del PAS.
SUP_11: Cómo se pide un dato extra si una compañía lo exige y el formulario del vehículo no lo tiene (REF CU-17-AUT-Multicotizador_Cargar_Riesgo, SUP_3).
SUP_12: Qué compañías están habilitadas para Automotor en el MVP, y quién las habilita (REF CU 49).

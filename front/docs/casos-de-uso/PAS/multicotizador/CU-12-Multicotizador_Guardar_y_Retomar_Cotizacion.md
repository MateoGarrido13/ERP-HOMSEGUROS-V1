## CU-12-Multicotizador_Guardar_y_Retomar_Cotizacion
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene una cotización abierta con cliente asociado (REF CU-10-Multicotizador_Seleccionar_o_Crear_Cliente). Hay conexión.
*Disparador:* Salir de una cotización sin terminarla y volver más tarde a continuarla

*Flujo principal*
1. El PAS sale de la cotización antes de llegar a una propuesta: cierra sesión (REF CU-04-Acceso_Cerrar_Sesion), navega a otra sección o cierra la aplicación
2. El sistema guarda la cotización en estado "En curso" con el ramo, el cliente y los datos del riesgo cargados hasta ese momento
3. El sistema muestra la cotización "En curso" en la ficha del cliente, junto con sus demás propuestas (REF CU-25-Cartera_Ver_Ficha_Cliente) (*ALT CLIENTE NUEVO SIN INCORPORAR)
4. El PAS entra a la ficha del cliente y selecciona la cotización "En curso" (*ALT DESCARTAR)
5. El sistema retoma la cotización en el mismo paso en el que el PAS la dejó, con el ramo, el cliente y el riesgo tal como estaban
6. El PAS completa la carga del riesgo y sigue la cotización como cualquier otra (REF CU 13 en adelante)

*Flujos alternativos*

`3. El sistema muestra la cotización "En curso"`
3.1. El cliente de la cotización es nuevo y todavía no se incorporó a la cartera (REF CU-23-Cartera_Dar_de_Alta_Cliente)
3.2. El sistema no tiene una ficha de cliente donde mostrar la cotización
3.3. **FIN**

`4. El PAS retoma la cotización`
4a.1. El PAS selecciona "Descartar" sobre la cotización "En curso"
4a.2. El sistema pide confirmación (*ALT CANCELAR DESCARTE)
4a.3. El sistema elimina la cotización "En curso"; si el cliente era nuevo y no tiene otra cobertura o póliza asociada, no queda registrado en la cartera
4a.4. **FIN**

`4a.2. El PAS cancela el descarte`
4a.2.1. El sistema conserva la cotización "En curso" sin cambios
4a.2.2. **IR A (4)**

*Postcondiciones*
1. Si el PAS salió sin completar la carga del riesgo, la cotización queda guardada como "En curso" con lo cargado hasta ese momento
2. Retomar una cotización "En curso" no genera una cotización nueva ni duplica al cliente
3. Si el PAS descartó la cotización "En curso", no queda ningún rastro de ella salvo que corresponda auditar el descarte (REF CU 51)
4. A partir de retomada, la cotización sigue el mismo camino que cualquier otra desde el punto en que se dejó (REF CU 13 y siguientes)

*Reglas de negocio asociadas*
RN_1: Una cotización pasa a "En curso" automáticamente cuando el PAS se va sin llegar a una propuesta; el PAS no necesita seleccionar "Guardar" (REF CU-25-Cartera_Ver_Ficha_Cliente RN_4).
RN_2: Solo se guarda una cotización "En curso" si ya tiene un cliente asociado (REF CU-10-Multicotizador_Seleccionar_o_Crear_Cliente). Si el PAS abandonó antes de elegir el ramo o el cliente, no hay nada para guardar.
RN_3: Una cotización "En curso" de un cliente nuevo todavía no incorporado a la cartera no tiene una ficha donde mostrarse (REF CU-23-Cartera_Dar_de_Alta_Cliente).
RN_4: Retomar restituye el ramo, el cliente y los datos del riesgo tal como estaban al momento de salir, en el mismo paso de la carga.
RN_5: Descartar una cotización "En curso" es distinto de descartar un lead (REF CU-08c-Pendientes_Descartar_Lead): descartar la cotización no afecta la relación del cliente con la cartera.
RN_6: Este caso no aplica a una cotización ya convertida en propuesta enviada, aceptada, rechazada o vencida (REF CU 13, CU 15); esos estados siguen sus propios casos.

*Supuestos a confirmar*
SUP_1: Dónde ve el PAS una cotización "En curso" de un cliente nuevo que todavía no integra la cartera, si en algún listado aparte o si se pierde al salir.
SUP_2: Si puede haber más de una cotización "En curso" por cliente, por ejemplo una por ramo, o si una nueva reemplaza a la anterior.
SUP_3: Si existe un límite de tiempo para una cotización "En curso" antes de vencer o descartarse sola, como pasa con los leads (REF CU-08b-Pendientes_Reactivar_Lead).
SUP_4: Si retomar desde otro dispositivo o con la sesión reiniciada conserva la cotización, o si "En curso" vive solo en la sesión del navegador (REF CU-04-Acceso_Cerrar_Sesion SUP_3).
SUP_5: Si el PAS puede tener varias cotizaciones "En curso" abiertas a la vez, una por cliente, o si abrir una cotización nueva descarta la anterior sin avisar.
SUP_6: El prototipo no tiene hoy ningún guardado de cotización incompleta ni pantalla de "En curso"; este caso describe el comportamiento esperado a partir de las referencias de otros casos (REF CU-04 SUP_3, CU-08c SUP_3, CU-25 RN_4) y queda sujeto a validación con el negocio.

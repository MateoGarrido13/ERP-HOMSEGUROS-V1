## CU-15-Multicotizador_Marcar_Resultado_de_Propuesta
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene una propuesta en estado "Enviada", asociada a un cliente de su cartera (REF CU-14-Multicotizador_Enviar_Propuesta_por_WhatsApp). Hay conexión.
*Disparador:* Dejar constancia de si el cliente aceptó o rechazó la propuesta enviada

*Flujo principal*
1. El PAS abre la ficha del cliente y ubica la propuesta "Enviada" (REF CU-25-Cartera_Ver_Ficha_Cliente)
2. El PAS selecciona "Marcar resultado"
3. El sistema muestra las opciones "Aceptada" y "Rechazada"
4. El PAS selecciona "Aceptada"
5. El sistema marca la propuesta como "Aceptada", con fecha y hora
6. El sistema muestra la confirmación y ofrece registrar la póliza que emita la compañía (REF CU-16-Multicotizador_Registrar_Poliza_Emitida)

*Flujos alternativos*

`4a. El PAS selecciona "Rechazada"`
4a.1. El sistema pide un motivo de rechazo, de una lista fija, opcional (*ALT SIN MOTIVO)
4a.2. El sistema marca la propuesta como "Rechazada", con fecha y hora y el motivo si lo hubo
4a.3. El sistema muestra la confirmación y vuelve a la ficha del cliente
4a.4. **FIN**

`4a.1. El PAS no informa un motivo`
4a.1.1. El PAS selecciona "Rechazada" sin elegir ningún motivo
4a.1.2. **IR A (4a.2)**, sin motivo registrado

`La propuesta vence sin respuesta`
R.1. Pasa el plazo definido sin que el PAS marque "Aceptada" o "Rechazada" sobre una propuesta "Enviada"
R.2. El sistema marca la propuesta como "Vencida" por sí solo, sin intervención del PAS
R.3. El sistema la muestra como "Vencida" en la ficha del cliente, sin ofrecer registrar una póliza
R.4. **FIN**

*Postcondiciones*
1. Si el PAS marcó "Aceptada", la propuesta queda en ese estado y el sistema ofrece el registro de la póliza emitida (REF CU-16)
2. Si el PAS marcó "Rechazada", la propuesta queda en ese estado, con el motivo si se informó, y no se ofrece ningún paso siguiente
3. Si nadie marcó un resultado dentro del plazo, la propuesta queda "Vencida" por sí sola
4. Ninguno de los tres resultados modifica el PDF ni los datos de la cotización original (REF CU-13)
5. No se contactó a ninguna compañía ni se emitió ninguna póliza por marcar este resultado

*Reglas de negocio asociadas*
RN_1: Solo se puede marcar un resultado sobre una propuesta "Enviada" (REF CU-14). Una propuesta "En curso" o "Generada" todavía no tiene resultado para marcar.
RN_2: Los resultados "Aceptada", "Rechazada" y "Vencida" son finales: ninguno de los tres vuelve a "Enviada". Para seguir cotizando al mismo cliente, el PAS inicia una cotización nueva (REF CU-09, CU-11).
RN_3: Solo "Aceptada" habilita el registro de la póliza emitida (REF CU-16). "Rechazada" y "Vencida" no tienen ningún paso siguiente dentro del multicotizador.
RN_4: "Vencida" la marca el sistema por sí solo, sin que el PAS intervenga; "Aceptada" y "Rechazada" las marca el PAS a mano.
RN_5: Marcar "Aceptada" o "Rechazada" no emite ninguna póliza ni confirma nada ante la compañía; solo refleja lo que el PAS supo del cliente.
RN_6: Esta acción se audita: cotización, PAS, resultado marcado y fecha (REF CU 51).
RN_7: Si una propuesta tiene más de una combinación compañía-cobertura (REF CU-13), el resultado se marca sobre toda la propuesta, no sobre cada combinación por separado.

*Supuestos a confirmar*
SUP_1: Cuánto tiempo pasa desde "Enviada" sin respuesta antes de que el sistema la marque "Vencida" por sí solo (REF CU-13 SUP_4, CU-14 SUP_5).
SUP_2: Qué motivos de rechazo ofrece la lista fija (precio, elige otra compañía, se arrepintió, no contesta, otro).
SUP_3: Si "Rechazada" o "Vencida" generan automáticamente un lead o un aviso de seguimiento para el PAS, o si quedan solo como un estado de la propuesta sin ninguna acción asociada (REF CU-05-Pendientes_Ver_Pendientes).
SUP_4: Si el PAS puede corregir un resultado ya marcado por error (por ejemplo, "Rechazada" en vez de "Aceptada") o si el error solo se corrige contactando soporte.
SUP_5: Si "Vencida" avisa al PAS de algún modo (en Pendientes, por ejemplo) o si solo cambia el estado silenciosamente y el PAS la nota al entrar a la ficha del cliente.

## CU-15-Multicotizador_Marcar_Resultado_de_Propuesta
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene una propuesta en estado "Enviada" y el aviso Cotización enviada en Pendientes (REF CU-14, CU-05d). El cliente nuevo está con `activa=false`. Hay conexión.
*Disparador:* Dejar constancia de si el cliente aceptó o rechazó, desde Pendientes

*Flujo principal*
1. El PAS abre el aviso Cotización enviada en Pendientes (REF CU-05d)
2. El PAS selecciona "Resolver"
3. El sistema muestra las opciones "Dar de alta" (aceptada) y "Lead" (rechazada)
4. El PAS selecciona "Dar de alta"
5. Sigue CU-16 en el mismo paso: asienta la póliza y marca la propuesta como aceptada
6. El cliente pasa a Cartera (`activa=true`)

*Flujos alternativos*

`4a. El PAS selecciona "Lead" (rechazada)`
4a.1. El sistema pide un comentario opcional (REF CU-05d)
4a.2. El sistema marca la propuesta como "Rechazada", con fecha y hora
4a.3. El aviso sale de Pendientes y pasa a Lead. El cliente no entra a Cartera
4a.4. **FIN**

`4a.1. El PAS no informa un motivo`
4a.1.1. El PAS selecciona "Rechazada" sin elegir ningún motivo
4a.1.2. **IR A (4a.2)**, sin motivo registrado

`La propuesta vence sin respuesta`
R.1. Pasa el plazo definido sin que el PAS marque "Aceptada" o "Rechazada" sobre una propuesta "Enviada"
R.2. El sistema marca la propuesta como "Vencida" por sí solo, sin intervención del PAS
R.3. El sistema la muestra como "Vencida" en el aviso; no ofrece registrar una póliza. El cliente nuevo sigue con `activa=false` y no entra a Cartera
R.4. **FIN**

*Postcondiciones*
1. Si el PAS eligió "Dar de alta", el resultado se completa en CU-16 (póliza + Cartera)
2. Si el PAS marcó "Rechazada", la propuesta queda en ese estado, con el motivo si se informó, y no se ofrece ningún paso siguiente
3. Si nadie marcó un resultado dentro del plazo, la propuesta queda "Vencida" por sí sola
4. Ninguno de los tres resultados modifica el PDF ni los datos de la cotización original (REF CU-13)
5. No se contactó a ninguna compañía ni se emitió ninguna póliza por marcar este resultado

*Reglas de negocio asociadas*
RN_1: Solo se puede marcar un resultado sobre una propuesta "Enviada" (REF CU-14). Una propuesta "En curso" o "Generada" todavía no tiene resultado para marcar.
RN_2: Los resultados "Aceptada", "Rechazada" y "Vencida" son finales: ninguno de los tres vuelve a "Enviada". Para seguir cotizando al mismo cliente, el PAS inicia una cotización nueva (REF CU-09, CU-11).
RN_3: "Dar de alta" / aceptada **es** CU-16 (mismo paso). "Lead" / rechazada y "Vencida" no registran póliza.
RN_4: "Vencida" la marca el sistema por sí solo, sin que el PAS intervenga; "Aceptada" y "Rechazada" las marca el PAS a mano.
RN_5: Marcar el resultado no emite la póliza legal. "Dar de alta" sí asienta la copia operativa (REF CU-16 RN_8).
RN_6: Esta acción se audita: cotización, PAS, resultado marcado y fecha (REF CU 51).
RN_7: Si una propuesta tiene más de una combinación compañía-cobertura (REF CU-13), el resultado se marca sobre toda la propuesta, no sobre cada combinación por separado.

*Supuestos a confirmar*
SUP_1: Cuánto tiempo pasa desde "Enviada" sin respuesta antes de que el sistema la marque "Vencida" por sí solo (REF CU-13 SUP_4, CU-14 SUP_5).
SUP_2: Qué motivos de rechazo ofrece la lista fija (precio, elige otra compañía, se arrepintió, no contesta, otro).
SUP_3: Resuelto en rechazo: "Lead" en CU-05d. Vencida: sin lead automático (sigue abierto si debe avisarse).
SUP_4: Si el PAS puede corregir un resultado ya marcado por error (por ejemplo, "Rechazada" en vez de "Aceptada") o si el error solo se corrige contactando soporte.
SUP_5: Si "Vencida" avisa al PAS de algún modo (en Pendientes, por ejemplo) o si solo cambia el estado silenciosamente y el PAS la nota al entrar a la ficha del cliente.

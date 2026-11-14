## CU-08b-Pendientes_Reactivar_Lead
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene abierto un lead (REF CU-05-Pendientes_Ver_Pendientes). Hay conexión. El lead tiene una propuesta ya enviada.
*Disparador:* Retomar ese lead con la propuesta que ya se envió, sin recotizar

*Corte:* Este caso termina al publicar el aviso Cotización enviada. No carga al cliente en Cartera. Si el cliente confirma, el alta en Cartera la cierra el aviso Cotización enviada (REF CU-05d-Pendientes_Aviso_Cotizacion_Enviada). Con la póliza ya vigente, el aviso Enviar póliza lo cubre CU-05e-Pendientes_Aviso_Enviar_Poliza. Acá no se repiten.

*Flujo principal*
1. En el lead, el PAS selecciona "Reactivar"
2. El sistema muestra la propuesta enviada
3. El PAS confirma (*ALT CANCELAR)
4. El sistema publica un aviso en Pendientes, estado Pendiente, tipo Cotización enviada, con el cliente, qué se cotizó y los montos ofrecidos (REF CU-05d-Pendientes_Aviso_Cotizacion_Enviada, TRANSICIONES.md, AVISO COTIZACION ENVIADA)
5. El lead sale de Leads. No quedan un lead y un aviso a la vez para esa propuesta
6. El sistema registra el PAS, el lead, el aviso, la fecha y la hora (REF CU 51)
7. **FIN**

*Flujos alternativos*

`3. El PAS confirma`
3.1. El PAS no confirma
3.2. El lead sigue en Leads. No se publica el aviso
3.3. **FIN**

*Postcondiciones*
1. El seguimiento está en Pendientes como aviso Cotización enviada
2. El lead ya no figura en Leads
3. El cliente no entra a Cartera en este caso
4. Si no confirmó, el lead no cambia

*Reglas de negocio asociadas*
RN_1: Reactivar usa la propuesta ya enviada y la publica como aviso. No abre Cotizar y no asigna una póliza vigente.
RN_2: Recotizar es otra acción: abre Cotizar y, al enviar, también publica Cotización enviada (REF CU-08d-Lead_Enviar_Cotizacion).
RN_3: La descripción del lead no se cambia acá (REF CU-08e-Pendientes_Editar_Descripcion_Lead).
RN_4: Descartar saca el lead y no publica este aviso (REF CU-08c-Pendientes_Descartar_Lead).
RN_5: Si después el cliente confirma esa cotización, el PAS resuelve el aviso con "Dar de alta" y el cliente pasa a Cartera. Ese cierre no se describe acá (REF CU-05d-Pendientes_Aviso_Cotizacion_Enviada).
RN_6: El aviso Enviar póliza es de una póliza ya vigente. No nace al reactivar. No se describe acá (REF CU-05e-Pendientes_Aviso_Enviar_Poliza).

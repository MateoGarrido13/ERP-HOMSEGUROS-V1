## CU-05d-Pendientes_Aviso_Cotizacion_Enviada
*Actor principal:* PAS
*Actor secundario:* WhatsApp
*Precondiciones:* El PAS tiene la sesión abierta y una cotización lista para enviar desde Cotizar. Hay conexión.
*Disparador:* El PAS envía la cotización desde Cotizar

*Flujo principal*
1. En Cotizar, el PAS selecciona "Generar PDF y enviar" y después "Enviar"
2. El sistema abre el chat del cliente con la plantilla. Para el sistema, esa acción ya es el envío
3. El sistema publica un aviso de tipo Cotización enviada, en estado Pendiente (REF TRANSICIONES.md, AVISO COTIZACION ENVIADA)
4. El aviso muestra el cliente, qué se cotizó y los montos ofrecidos
5. El PAS abre el aviso en Pendientes (REF CU-05-Pendientes_Ver_Pendientes)
6. El cliente confirma la cotización. El PAS selecciona "Resolver" y elige "Dar de alta" (*ALT RECHAZA, *ALT WHATSAPP, *ALT CANCELAR)
7. El PAS confirma y el sistema abre el registro de la póliza emitida (REF CU-16): número, vigencia, compañía
8. Al confirmar CU-16, el sistema saca el aviso de Pendientes, pasa el cliente a `activa=true` y lo muestra en Cartera
9. El sistema registra el PAS, el aviso, el alta, la póliza, la fecha y la hora (REF CU 51)

*Flujos alternativos*

`6. El PAS selecciona Resolver y elige Dar de alta`
6.1. El PAS no confirma
6.2. El aviso sigue en Pendientes
6.3. El cliente no entra a Cartera
6.4. **FIN**

`6. El cliente confirma la cotización`
6.1. El cliente rechaza la propuesta
6.2. El PAS selecciona "Resolver" y elige "Lead"
6.3. El sistema pide un comentario de por qué rechazó. Es el único comentario que se puede adjuntar en un aviso, y el campo es opcional. No modifica una descripción del aviso: el aviso no tiene descripción editable
6.4. El PAS confirma (*ALT CANCELAR LEAD)
6.5. El aviso deja Pendientes y pasa a Lead
6.6. El lead muestra los datos del cliente, qué quería asegurar, los montos ofrecidos y la fecha en que pasó de Pendientes a Lead
6.7. El sistema registra el PAS, el aviso, la descripción si la hubo, la fecha y la hora (REF CU 51)
6.8. **FIN**

`6.4. El PAS confirma`
6.4.1. El PAS no confirma
6.4.2. El aviso sigue en Pendientes y no se crea el lead
6.4.3. **FIN**

`5. El PAS abre el aviso`
5.1. El PAS selecciona "Enviar WhatsApp"
5.2. El sistema abre el chat con la plantilla de seguimiento. Esa redirección ya cuenta como envío, aunque el PAS vuelva atrás
5.3. El aviso sigue en Pendientes. No pasa a Cartera ni a Lead
5.4. **FIN**

`5.2. El sistema abre el chat`
5.2.1. El cliente no tiene teléfono
5.2.2. El sistema no abre el chat y el aviso sigue igual
5.2.3. **FIN**

*Postcondiciones*
1. Enviar la cotización desde Cotizar deja el aviso en Pendientes. No crea un lead
2. "Dar de alta" confirmado es CU-16: asienta la póliza, saca el aviso y pasa al cliente a Cartera (`activa=true`)
3. "Lead" confirmado saca el aviso y lo muestra en Lead, con la fecha de esa respuesta
4. "Enviar WhatsApp" desde el aviso no lo saca de la vista
5. Cancelar la confirmación no cambia el estado

*Reglas de negocio asociadas*
RN_1: El aviso nace al enviar desde Cotizar, o al reactivar un lead con propuesta ya enviada (REF CU-08d-Lead_Enviar_Cotizacion, CU-08b-Pendientes_Reactivar_Lead). No nace al abrir Pendientes.
RN_2: "Enviar WhatsApp" del aviso abre el chat con la plantilla y, para el sistema, ya es un envío. No lo saca de Pendientes ni lo pasa a Lead.
RN_3: La plantilla de seguimiento es: "Hola {primer nombre}, soy {PAS} de HOM Seguros. Te escribo por la cotización de {bien}. Te ofrecimos {cobertura} en {compañía} por {premio} por mes y todavía no la confirmaste. ¿La avanzamos?"
RN_4: "Resolver" abre la elección del estado siguiente: "Dar de alta" o "Lead". Confirmar aplica esa elección. No confirmar no produce efecto.
RN_5: "Dar de alta" es el mismo paso que CU-16. Carga nº de póliza, vigencia y compañía, pasa `activa=true` y asocia el cliente al código del PAS. No es solo ocultar el aviso.
RN_6: El comentario del rechazo es opcional y es el único que se adjunta desde un aviso. Pasa a ser la descripción del lead. Después se edita en el lead, no en el aviso (REF CU-08e-Pendientes_Editar_Descripcion_Lead). La fecha del lead es la del pase de Pendientes a Lead.
RN_7: El aviso no se vence solo. Sigue en Pendientes hasta "Dar de alta" o "Lead".
RN_8: Si el aviso sale de un lead, por envío o por reactivar, no quedan los dos a la vez. El lead sale de Leads y el seguimiento queda en este aviso (REF CU-08d-Lead_Enviar_Cotizacion, CU-08b-Pendientes_Reactivar_Lead).

*Supuestos a confirmar*
SUP_1: Resuelto en lo mínimo. Este paso carga número de póliza, vigencia y compañía (REF CU-16 RN_3). Datos extra de prima/cuotas: ver CU-16 SUP_2. El prototipo solo saca el aviso y un flash, sin formulario CU-16 (REF `docs/specs/as-built-prototipo-iteracion-1.md`).

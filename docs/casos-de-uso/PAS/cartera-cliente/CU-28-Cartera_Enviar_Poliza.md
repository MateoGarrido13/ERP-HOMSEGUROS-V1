## CU-28-Cartera_Enviar_Poliza
*Actor principal:* PAS
*Actor secundario:* Hoja de compartir del dispositivo y WhatsApp
*Precondiciones:* El PAS tiene identificada una póliza de un cliente de su cartera. Llega desde el detalle de esa póliza (REF CU-27-Cartera_Ver_Detalle_Poliza) o desde un aviso "Enviar póliza" (REF CU-05e-Pendientes_Aviso_Enviar_Poliza). Hay conexión.
*Disparador:* Compartir la póliza con el cliente

*Flujo principal*
1. El PAS selecciona "Enviar póliza" (*ALT VARIAS POLIZAS, *ALT AVISO)
2. El sistema arma el texto con el primer nombre del cliente, el nombre del PAS en sesión, el ramo, la compañía y el próximo vencimiento
3. El sistema entrega el texto a la hoja de compartir del dispositivo (*ALT SIN COMPARTIR)
4. El PAS selecciona WhatsApp y el destinatario
5. El PAS confirma el envío (*ALT CANCELAR)
6. El sistema muestra "Listo para WhatsApp" y deja visible el texto compartido
7. El sistema registra el PAS, la póliza, el canal, la fecha y la hora de la entrega al canal (REF CU 51)

*Flujos alternativos*

`1. El PAS selecciona Enviar póliza`
1.1. El cliente tiene más de una póliza
1.2. La acción identifica el ramo: "Enviar póliza de Automotor", "Enviar póliza de Hogar" o el que corresponda
1.3. El PAS selecciona la póliza que quiere compartir
1.4. **IR A (2)**

`La entrada es el aviso Enviar póliza`
E.1. El PAS tiene abierto en Pendientes un aviso de tipo "Enviar póliza" (REF CU-05e-Pendientes_Aviso_Enviar_Poliza)
E.2. El PAS selecciona "Enviar WhatsApp"
E.3. El sistema abre el chat con la plantilla de RN_1. Esa redirección ya resuelve el aviso y lo saca de la vista
E.4. **FIN**

`5. El PAS confirma el envío`
5.1. El PAS cancela la hoja de compartir antes de entregarlo a WhatsApp
5.2. El sistema mantiene visible el texto
5.3. El sistema no registra un envío confirmado
5.4. **FIN**

`3. El sistema entrega el texto a la hoja de compartir`
3.1. El dispositivo no permite compartir o se produce un error
3.2. El sistema muestra "Listo para WhatsApp" y deja el texto visible para copiarlo
3.3. El sistema no registra un envío confirmado
3.4. **FIN**

*Postcondiciones*
1. Si se entregó al canal, quedan registrados la póliza, el canal, la fecha y la hora
2. El texto queda visible para que el PAS pueda revisarlo o copiarlo
3. Enviar desde Cartera no modifica la póliza ni el próximo cobro. El aviso "Enviar póliza" se cierra desde Pendientes (REF CU-05e-Pendientes_Aviso_Enviar_Poliza)
4. Si el PAS canceló o el dispositivo falló, no se registra un envío confirmado

*Reglas de negocio asociadas*
RN_1: El prototipo arma: "Hola {primer nombre}, soy {PAS} de HOM Seguros. Te envío la póliza de {ramo} de {compañía}. Estás al día y el próximo vencimiento es el {dd/mm/aaaa}, por débito automático."
RN_2: El nombre que firma el mensaje es el del PAS autenticado.
RN_3: La fecha del próximo vencimiento se muestra en formato `dd/mm/aaaa`.
RN_4: Si el cliente tiene varias pólizas, el botón debe identificar cuál se enviará.
RN_5: Entregar contenido a la hoja de compartir no permite comprobar que WhatsApp lo haya enviado o que el cliente lo haya recibido.
RN_6: Desde el aviso, "Enviar WhatsApp" resuelve y saca el aviso de la vista (REF CU-05e-Pendientes_Aviso_Enviar_Poliza). Desde Cartera, enviar la póliza no cierra ese aviso.
RN_7: Este caso reutiliza el patrón de compartir de la propuesta, pero la póliza y la propuesta son documentos distintos (REF CU 14).
RN_8: El texto es el de RN_1 en las dos entradas. En Cartera se dispara desde la póliza (REF CU-27-Cartera_Ver_Detalle_Poliza) y no cierra un aviso. En Pendientes, "Enviar WhatsApp" abre el chat y saca el aviso de la vista (REF CU-05e-Pendientes_Aviso_Enviar_Poliza).
RN_9: Desde Cartera solo se puede enviar una póliza vigente. Una póliza eliminada no se envía desde acá: ese registro está en Leads. Las otras vigentes del mismo cliente sí se pueden enviar (REF CU-05-Pendientes_Ver_Pendientes, transicion-estados-bien.md).

*Supuestos a confirmar*
SUP_1: El prototipo actual comparte solo el texto; falta confirmar si debe adjuntar el PDF de la póliza o un enlace autenticado al documento.
SUP_2: Si la frase "Estás al día" y el medio "débito automático" se incluyen solo cuando cobranza los confirma, o si el texto cambia según el estado y el tipo de cobro.
SUP_3: Si el teléfono del cliente se usa para abrir una conversación específica o el PAS elige el destinatario en WhatsApp.
SUP_4: Qué evento se audita como envío confirmado, dado que la hoja de compartir no informa la entrega final al cliente.

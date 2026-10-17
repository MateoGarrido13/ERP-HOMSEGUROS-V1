## CU-33-Cartera_Enviar_Poliza
*Actor principal:* PAS
*Actor secundario:* Hoja de compartir del dispositivo y WhatsApp
*Precondiciones:* El PAS tiene identificada una póliza de un cliente de su cartera. Llega desde el detalle de esa póliza (REF CU-32-Cartera_Ver_Detalle_Poliza) o desde un aviso "Enviar póliza" (REF CU-07-Pendientes_Contactar_desde_Aviso). Hay conexión.
*Disparador:* Compartir la póliza con el cliente

*Flujo principal*
1. El PAS selecciona "Enviar póliza" (*ALT VARIAS POLIZAS, *ALT AVISO)
2. El sistema arma el texto con el primer nombre del cliente, el nombre del PAS en sesión, el ramo, la compañía y el próximo vencimiento
3. El sistema entrega el texto a la hoja de compartir del dispositivo (*ALT SIN COMPARTIR)
4. El PAS selecciona WhatsApp y el destinatario
5. El PAS confirma el envío (*ALT CANCELAR)
6. El sistema muestra "Listo para WhatsApp" y deja visible el texto compartido
7. El sistema registra el PAS, la póliza, el canal, la fecha y la hora de la entrega al canal (REF CU 56)

*Flujos alternativos*

`1. El PAS selecciona Enviar póliza`
1.1. El cliente tiene más de una póliza
1.2. La acción identifica el ramo: "Enviar póliza de Automotor", "Enviar póliza de Hogar" o el que corresponda
1.3. El PAS selecciona la póliza que quiere compartir
1.4. **IR A (2)**

`La entrada es el aviso Enviar póliza`
E.1. El PAS tiene abierto en Pendientes un aviso de tipo "Enviar póliza" (REF CU-05-Pendientes_Ver_Pendientes)
E.2. El aviso identifica la póliza: cliente, ramo, compañía y próximo vencimiento
E.3. El PAS selecciona "Enviar WhatsApp" (REF CU-07-Pendientes_Contactar_desde_Aviso)
E.4. El sistema sigue este caso desde el armado del texto
E.5. **IR A (2)**

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
3. Enviar no modifica la póliza, el próximo cobro ni el estado del aviso "Enviar póliza"
4. Si el PAS canceló o el dispositivo falló, no se registra un envío confirmado

*Reglas de negocio asociadas*
RN_1: El prototipo arma: "Hola {primer nombre}, soy {PAS} de HOM Seguros. Te envío la póliza de {ramo} de {compañía}. Estás al día y el próximo vencimiento es el {dd/mm/aaaa}, por débito automático."
RN_2: El nombre que firma el mensaje es el del PAS autenticado.
RN_3: La fecha del próximo vencimiento se muestra en formato `dd/mm/aaaa`.
RN_4: Si el cliente tiene varias pólizas, el botón debe identificar cuál se enviará.
RN_5: Entregar contenido a la hoja de compartir no permite comprobar que WhatsApp lo haya enviado o que el cliente lo haya recibido.
RN_6: Enviar la póliza no resuelve automáticamente el aviso "Enviar póliza" (REF CU-06-Pendientes_Resolver_Aviso).
RN_7: Este caso reutiliza el patrón de compartir de la propuesta, pero la póliza y la propuesta son documentos distintos (REF CU 23).
RN_8: Enviar la póliza es una sola acción, con dos entradas. En Cartera se dispara desde la póliza (REF CU-32-Cartera_Ver_Detalle_Poliza). En Pendientes se dispara desde el aviso "Enviar póliza" (REF CU-07-Pendientes_Contactar_desde_Aviso). Las dos entradas arman el texto de RN_1, lo entregan a la misma hoja de compartir y registran el mismo evento: PAS, póliza, canal, fecha y hora.
RN_9: Desde Cartera solo se puede enviar una póliza vigente. Si el cliente retiró su bien, ya no está en la cartera y esta entrada no aplica: el cliente está en Lead (REF CU-08a-Pendientes_Contactar_Lead).

*Supuestos a confirmar*
SUP_1: El prototipo actual comparte solo el texto; falta confirmar si debe adjuntar el PDF de la póliza o un enlace autenticado al documento.
SUP_2: Si la frase "Estás al día" y el medio "débito automático" se incluyen solo cuando cobranza los confirma, o si el texto cambia según el estado y el tipo de cobro.
SUP_3: Si el teléfono del cliente se usa para abrir una conversación específica o el PAS elige el destinatario en WhatsApp.
SUP_4: Qué evento se audita como envío confirmado, dado que la hoja de compartir no informa la entrega final al cliente.

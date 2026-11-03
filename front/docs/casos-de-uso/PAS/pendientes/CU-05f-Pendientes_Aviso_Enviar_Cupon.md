## CU-05f-Pendientes_Aviso_Enviar_Cupon
*Actor principal:* PAS
*Actor secundario:* Administrador del consorcio, WhatsApp
*Precondiciones:* La compañía ya emitió una póliza de Consorcio con vigencia anual, y esa póliza está vigente en la cartera del PAS (REF CU-27-Cartera_Ver_Detalle_Poliza). El detalle de la póliza tiene el contacto del administrador. Hay conexión.
*Disparador:* Hay que enviarle al administrador el cupón del próximo cobro mensual

*Flujo principal*
1. Una vez emitida la póliza, el sistema publica un aviso de tipo Enviar cupón, en estado Pendiente (REF TRANSICIONES.md, AVISO ENVIAR CUPON)
2. El aviso muestra el edificio, el ramo Consorcio, la compañía, el número de póliza, la vigencia anual y la fecha del próximo cobro. Es un aviso por póliza
3. El PAS abre el aviso en Pendientes (REF CU-05-Pendientes_Ver_Pendientes)
4. El PAS selecciona "Enviar cupón al administrador" (*ALT SIN TELEFONO)
5. El sistema abre el chat del administrador con la plantilla del cupón. Para el sistema esa redirección ya es el envío
6. El aviso permanece en Pendientes. Pasa a estado Cobro pendiente y deja visible el mensaje de esa póliza
7. El edificio del aviso es el de la póliza. En el ejemplo, "TORRES IV"

*Flujos alternativos*

`4. El PAS selecciona Enviar cupón al administrador`
4.1. El administrador no tiene teléfono en el detalle de la póliza
4.2. El sistema no abre el chat y no cambia el estado
4.3. El aviso sigue como Enviar cupón
4.4. **FIN**

*Postcondiciones*
1. Antes del envío, el aviso figura en Pendientes desde que la compañía emitió la póliza
2. Después del envío, el aviso sigue en Pendientes, con el mensaje de esa póliza, en estado Cobro pendiente
3. La vigencia anual de la póliza no cambia. El próximo cobro sigue siendo la renovación mensual del cupón
4. El contacto del administrador sigue en el detalle de la póliza, en Cartera

*Reglas de negocio asociadas*
RN_1: La póliza de consorcio se emite una vez, con vigencia anual. El cupón se renueva cada mes.
RN_2: El destinatario del cupón es el administrador cargado en el detalle de la póliza vigente (REF CU-27 RN_11), no el asegurado genérico de otros ramos.
RN_3: Enviar el cupón no saca el aviso de Pendientes. Lo deja en Cobro pendiente, asociado al edificio de esa póliza.
RN_4: La plantilla es: "Hola {primer nombre del administrador}, soy {PAS} de HOM Seguros. Te envío el cupón del próximo cobro del edificio {edificio}, póliza {número} de {compañía}. El vencimiento es el {dd/mm/aaaa}."
RN_5: El ejemplo de referencia es el edificio TORRES IV, póliza 330418, vigencia 20/05/2026–20/05/2027, próximo cobro 10/11/2026.

*Supuestos a confirmar*
SUP_1: Qué cierra el estado Cobro pendiente: el pago de las expensas, el vencimiento del cupón, o una confirmación del PAS.
SUP_2: Si cada mes nace un aviso nuevo o el mismo aviso vuelve a Enviar cupón al llegar el período siguiente.

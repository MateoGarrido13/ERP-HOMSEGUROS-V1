## CU-05b-Pendientes_Aviso_Cumpleanos
*Actor principal:* PAS
*Actor secundario:* WhatsApp
*Precondiciones:* El cliente pertenece a la cartera del PAS, tiene fecha de nacimiento y al menos una póliza vigente. Hay conexión. El vencimiento de las 00:00 corre aunque el PAS no tenga la sesión abierta.
*Disparador:* Llega el día del cumpleaños del cliente

*Flujo principal*
1. A las 00:00 del día del cumpleaños, el sistema publica un aviso de tipo Cumpleaños, en estado Pendiente (REF TRANSICIONES.md, AVISO CUMPLEANOS)
2. El título del aviso es "Cumpleaños" y la fecha. El cuerpo muestra nombre y apellido, y cada cobertura vigente con su seguro. Es un aviso por cliente
3. El PAS abre el aviso en Pendientes (REF CU-05-Pendientes_Ver_Pendientes)
4. El PAS selecciona "Resolver" (*ALT CANCELAR, *ALT WHATSAPP)
5. El PAS confirma
6. El sistema saca el aviso de Pendientes
7. El sistema registra el PAS, el aviso, la fecha y la hora, con el resultado "Resuelto por el PAS" (REF CU 51)

*Flujos alternativos*

`4. El PAS selecciona Resolver`
4.1. El PAS no confirma
4.2. El aviso sigue en Pendientes, en estado Pendiente
4.3. El sistema no registra una resolución
4.4. **FIN**

`4. El PAS selecciona Resolver`
4.1. El PAS selecciona "Enviar WhatsApp"
4.2. El sistema abre el chat del cliente con la plantilla ya escrita (*ALT SIN TELEFONO)
4.3. Eso ya cuenta como enviado, aunque el PAS no mande el mensaje o vuelva atrás
4.4. **IR A (6)**

`4.2. El sistema abre el chat del cliente`
4.2.1. El cliente no tiene teléfono
4.2.2. El sistema no abre el chat y no resuelve el aviso
4.2.3. "Resolver" sigue disponible
4.2.4. **FIN**

`A las 00:00 del día siguiente el aviso sigue en Pendiente`
V.1. El PAS no lo resolvió durante el día del cumpleaños
V.2. El sistema lo saca de Pendientes
V.3. El sistema registra el aviso, la fecha y la hora, con el resultado "Resuelto por Vencimiento" (REF CU 51)
V.4. **FIN**

*Postcondiciones*
1. Durante el día del cumpleaños el aviso figura en Pendientes, en estado Pendiente
2. "Resolver" confirmado y "Enviar WhatsApp" dejan de mostrarlo. Los dos cierran con "Resuelto por el PAS"
3. Si el PAS no confirma "Resolver", el aviso sigue
4. Si a las 00:00 del día siguiente seguía en Pendiente, deja de figurar con "Resuelto por Vencimiento"
5. El aviso no pasa a Lead
6. El cliente, sus pólizas y sus cotizaciones siguen como estaban

*Reglas de negocio asociadas*
RN_1: El aviso existe solo el día del cumpleaños. Aparece a las 00:00 de ese día y, si nadie lo resolvió, sale a las 00:00 del día siguiente.
RN_2: Hay un aviso por cliente. Si tiene varias pólizas vigentes, el mismo aviso lista cada cobertura y su seguro.
RN_3: "Resolver" pide confirmación. Confirmar saca el aviso de Pendientes. No confirmar no cambia nada.
RN_4: "Enviar WhatsApp" abre el chat del cliente con la plantilla. Para el sistema esa redirección ya es el envío y saca el aviso de la vista, aunque el PAS vuelva atrás.
RN_5: La plantilla es: "Hola {primer nombre}, soy {PAS} de HOM Seguros. ¡Feliz cumpleaños! Te deseo un excelente día."
RN_6: El nombre que firma es el del PAS de esa cartera.
RN_7: Cumpleaños no tiene descripción editable. Ningún aviso la tiene (REF CU-05-Pendientes_Ver_Pendientes).
RN_8: Cumpleaños no pasa a Lead. Los cierres son "Resuelto por el PAS" o "Resuelto por Vencimiento".
RN_9: Sin fecha de nacimiento, o sin ninguna póliza vigente, el sistema no publica este aviso.
RN_10: El cierre de un año no impide el aviso del cumpleaños siguiente. A las 00:00 de ese día se publica uno nuevo.
RN_11: Un PAS no ve el cumpleaños de un cliente de otra cartera.

*Supuestos a confirmar*
SUP_1: El 29 de febrero queda fuera de este caso.

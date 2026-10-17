*CU-Pendientes-07-Contactar_desde_Aviso*
*Actor principal:* PAS
*Actor secundario:* WhatsApp o correo del cliente
*Precondiciones:* El PAS tiene abierto un aviso de su cartera (REF CU-Pendientes-05). Hay conexión.
*Disparador:* Avisar al cliente desde el aviso

*Flujo principal*
1. En el aviso abierto, el PAS selecciona "Enviar WhatsApp" (*ALT MAIL)
2. El sistema arma el texto con el nombre del cliente y el nombre del PAS que tiene la sesión
3. El sistema muestra el texto, listo para WhatsApp
4. El PAS confirma el envío
5. El sistema entrega el texto al canal (*ALT CANAL)
6. El sistema registra el PAS, el aviso, el canal, la fecha y la hora (REF CU 56) LOG 
7. El aviso sigue en Pendientes, con el mismo estado, PARA QUE DESAPAREZCA, EL PAS DEBE SELLECIONAR 'RESOLVER' (CU-6)

*Flujos alternativos*

`1. El PAS selecciona Enviar WhatsApp`
1.1. El PAS selecciona "Enviar mail"
1.2. El sistema usa el mismo texto y el email del cliente (*ALT SIN EMAIL)
1.3. **IR A (3)**

`1.2. El sistema usa el mismo texto y el email del cliente`
1.2.1. El cliente no tiene email
1.2.2. El sistema informa que no puede enviar el mail y no registra un envío
1.2.3. **FIN**

`5. El sistema entrega el texto al canal`
5.1. El PAS cierra la hoja de envío, o el dispositivo no puede compartir
5.2. El texto queda visible en el aviso
5.3. El aviso no cambia de estado y no se registra un envío
5.4. **FIN**

*Postcondiciones*
1. El texto quedó armado con el nombre del PAS en sesión
2. Si el envío se confirmó, quedan asentados el canal, la fecha y la hora
3. El aviso no pasa a Resuelto ni a Pospuesto

*Reglas de negocio asociadas*
RN_1: El canal que ofrece el prototipo es WhatsApp, con la acción "Enviar WhatsApp". Mail es el otro canal de este caso.
RN_2: El texto depende del tipo. Pago rechazado menciona compañía, ramo, medio de pago y que la cobertura está en riesgo. Cumpleaños es el saludo. Cotización enviada menciona el bien, la cobertura, el premio y que no está confirmada.
RN_3: El nombre que firma el mensaje es el del PAS autenticado.
RN_4: Enviar no marca el aviso como resuelto ni lo edita. Resolver sigue el CU-Pendientes-06-Resolver_Aviso. Editar sigue el CU-Pendientes-06b-Editar_Aviso.
RN_5: El registro anota el envío confirmado. No anota la respuesta del cliente.

*Supuestos a confirmar*
SUP_1: Si el PAS puede corregir el texto antes de enviarlo. El prototipo lo muestra ya armado.
SUP_2: Si "Enviar mail" entra en el MVP junto con WhatsApp.
SUP_3: Qué cuenta como envío confirmado cuando el dispositivo solo abre WhatsApp y no informa el resultado.

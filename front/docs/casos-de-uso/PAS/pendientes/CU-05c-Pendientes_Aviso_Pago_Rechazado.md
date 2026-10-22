## CU-05c-Pendientes_Aviso_Pago_Rechazado
(*) Atención: no confirmado. Falta charlarlo con el cliente. (REF TRANSICIONES.md, AVISO PAGO RECHAZADO)

*Actor principal:* PAS
*Actor secundario:* Administrativo, WhatsApp
*Precondiciones:* Hay conexión. El administrativo puede registrar un pago rechazado de una póliza de la cartera del PAS.
*Disparador:* El administrativo registra un pago rechazado

*Flujo principal*
1. El administrativo registra el pago rechazado
2. El sistema publica un aviso de tipo Pago rechazado, en estado Pendiente
3. El aviso muestra nombre y apellido, la cobertura, la compañía, el medio de pago, la cuota y el motivo del rechazo
4. El PAS abre el aviso en Pendientes (REF CU-05-Pendientes_Ver_Pendientes)
5. El PAS selecciona "Enviar WhatsApp" (*ALT RESOLVER, *ALT SIN TELEFONO)
6. El sistema abre el chat del cliente con la plantilla. Para el sistema esa redirección ya es el envío, aunque el PAS vuelva atrás
7. El aviso pasa a "Esperando respuesta cliente" y sigue en la vista de Pendientes
8. El cliente paga y responde. El PAS selecciona "Resolver" y confirma (*ALT CANCELAR, *ALT PERSISTE)
9. El sistema saca el aviso de la vista
10. El sistema registra el PAS, el aviso, la fecha y la hora, con el resultado "Resuelto por el PAS" (REF CU 51)

*Flujos alternativos*

`5. El PAS selecciona Enviar WhatsApp`
5.1. El PAS selecciona "Resolver" y confirma
5.2. El sistema toma ese cierre como el aviso al cliente y pasa el aviso a "Esperando respuesta cliente"
5.3. El aviso sigue en la vista
5.4. **IR A (8)**

`5. El PAS selecciona Enviar WhatsApp`
5.1. El PAS selecciona "Resolver" y no confirma
5.2. El aviso sigue en Pendiente
5.3. **FIN**

`6. El sistema abre el chat del cliente`
6.1. El cliente no tiene teléfono
6.2. El sistema no abre el chat y no cambia el estado
6.3. "Resolver" sigue disponible
6.4. **FIN**

`8. El PAS selecciona Resolver y confirma`
8.1. El PAS no confirma
8.2. El aviso sigue en "Esperando respuesta cliente"
8.3. **FIN**

`8. El cliente paga y responde`
8.1. El cliente no cambia su estado y el PAS no confirma el cierre
8.2. El aviso permanece en Pendientes
8.3. **FIN**

*Postcondiciones*
1. Al registrarse el rechazo, el aviso figura en Pendientes
2. "Enviar WhatsApp", o "Resolver" confirmado en ese primer paso, lo dejan visible y en "Esperando respuesta cliente"
3. Un segundo "Resolver" confirmado lo saca de la vista, con "Resuelto por el PAS"
4. Sin esa confirmación, y sin un cambio de estado del cliente, el aviso permanece
5. Cancelar una confirmación no cambia el estado

*Reglas de negocio asociadas*
RN_1: (*) Este caso no está confirmado con el cliente.
RN_2: "Enviar WhatsApp" abre el chat con la plantilla y esa redirección ya cuenta como envío. No saca el aviso de la vista. "Resolver" sin confirmar no cambia el estado.
RN_3: La plantilla es: "Hola {primer nombre}, soy {PAS} de HOM Seguros. El débito automático de la cuota {n} de tu póliza {compañía} de {ramo} fue rechazado. La cobertura está en riesgo. ¿Coordinamos el pago?"
RN_4: El primer "Resolver" confirmado y el WhatsApp llevan al mismo estado: "Esperando respuesta cliente".
RN_5: El aviso sale de la vista cuando el PAS confirma "Resolver" y eso supone que el cliente pagó y respondió.
RN_6: (*) Si el cliente no cambia de estado, el aviso persiste. No se vence solo.
RN_7: "Resolver" sin confirmar no produce efecto.
RN_8: Este aviso no pasa a Lead.

*Supuestos a confirmar*
SUP_1: (*) Si el cambio de estado del cliente, sin acción del PAS, saca el aviso o solo lo deja listo para el segundo "Resolver".
SUP_2: (*) Si el cierre también cierra el ticket de cobranza, o son registros distintos (REF CU 31).

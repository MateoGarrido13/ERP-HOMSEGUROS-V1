## CU-05e-Pendientes_Aviso_Enviar_Poliza
*Actor principal:* PAS
*Actor secundario:* WhatsApp
*Precondiciones:* El cliente tiene una póliza vigente en la cartera del PAS, con un próximo vencimiento. Hay conexión.
*Disparador:* Faltan 5 días para el vencimiento de esa póliza o de su cupón

*Flujo principal*
1. Cinco días antes del vencimiento, el sistema publica un aviso de tipo Enviar póliza, en estado Pendiente (REF TRANSICIONES.md, AVISO ENVIAR POLIZA)
2. El aviso muestra nombre y apellido, el tipo de póliza, la compañía y la fecha de vencimiento de la póliza o del cupón. Es un aviso por póliza
3. El PAS abre el aviso en Pendientes (REF CU-05-Pendientes_Ver_Pendientes)
4. El PAS selecciona "Resolver" (*ALT CANCELAR, *ALT WHATSAPP)
5. El PAS confirma
6. El sistema saca el aviso de la vista de Pendientes
7. El sistema registra el PAS, el aviso, la póliza, la fecha y la hora, con el resultado "Resuelto por el PAS" (REF CU 51)

*Flujos alternativos*

`4. El PAS selecciona Resolver`
4.1. El PAS no confirma
4.2. El aviso sigue en Pendientes
4.3. El sistema no registra una resolución
4.4. **FIN**

`4. El PAS selecciona Resolver`
4.1. El PAS selecciona "Enviar WhatsApp"
4.2. El sistema abre el chat del cliente con la plantilla ya escrita (*ALT SIN TELEFONO)
4.3. Para el sistema esa redirección ya es el envío, aunque el PAS no mande el mensaje o vuelva atrás
4.4. **IR A (6)**

`4.2. El sistema abre el chat del cliente`
4.2.1. El cliente no tiene teléfono
4.2.2. El sistema no hace la redireccion y no resuelve el aviso
4.2.3. "Resolver" sigue disponible
4.2.4. **FIN**

`Llegó el día del vencimiento y el PAS no lo resolvió`
V.1. El aviso sigue en Pendientes
V.2. El sistema no lo saca por la fecha
V.3. **FIN**

*Postcondiciones*
1. El aviso figura desde 5 días antes del vencimiento y sigue después de esa fecha, hasta que el PAS lo cierre
2. "Resolver" --> "Confirmar" y "Enviar WhatsApp" dejan de mostrarlo. Los dos cierran con "Resuelto por el PAS"
3. Si el PAS no confirma "Resolver", el aviso sigue
4. La póliza y el próximo cobro no cambian por cerrar el aviso
5. En el período siguiente, 5 días antes del nuevo vencimiento, se publica otro aviso de la misma póliza

*Reglas de negocio asociadas*
RN_1: Es un aviso periódico. Ejemplo: si la póliza de automotor de Jorge en Sancor vence todos los 21, el aviso se muestra desde el 16 hasta que el PAS confirme.
RN_2: "Enviar WhatsApp" abre el chat con la plantilla. Esa redirección ya resuelve el aviso y lo saca de la vista, aunque el PAS vuelva atrás. "Resolver" sin confirmar no lo saca.
RN_3: La plantilla es la del envío de póliza: "Hola {primer nombre}, soy {PAS} de HOM Seguros. Te envío la póliza de {ramo} de {compañía}. Estás al día y el próximo vencimiento es el {dd/mm/aaaa}, por débito automático." (REF CU-28-Cartera_Enviar_Poliza).
RN_4: "Resolver" sin confirmar no produce efecto.
RN_5: El aviso no pasa a Lead y no se vence solo. No nace al reactivar un lead: eso publica Cotización enviada (REF CU-08b-Pendientes_Reactivar_Lead, CU-05d-Pendientes_Aviso_Cotizacion_Enviada).
RN_6: Desde Cartera, "Enviar póliza" comparte el texto y no cierra este aviso. Lo cierra la acción hecha sobre el aviso.
RN_7: Un PAS no ve el aviso de una póliza de otra cartera.

*Supuestos a confirmar*
SUP_1: Si la frase "Estás al día" y el medio "débito automático" cambian según cobranza (REF CU-28-Cartera_Enviar_Poliza).

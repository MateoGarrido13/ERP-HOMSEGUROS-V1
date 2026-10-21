## CU-06-Pendientes_Resolver_Aviso
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene abierto un aviso de su cartera (REF CU-05-Pendientes_Ver_Pendientes). Hay conexión.
*Disparador:* Dar por resuelto un aviso

*Flujo principal*
1. En el aviso abierto, el sistema muestra "Resuelto" (*ALT EDITAR)
2. El PAS selecciona "Resuelto"
3. El sistema pide confirmación
4. El PAS confirma (*ALT CANCELAR)
5. El sistema saca el aviso de Pendientes
6. El sistema registra en sus logs el PAS, el aviso, la fecha y la hora (REF CU 51)

*Flujos alternativos*

`1. En el aviso abierto, el sistema muestra Resuelto`
1.1. El PAS selecciona "Editar"
1.2. Sigue el CU-06b-Pendientes_Editar_Aviso
1.3. **FIN**

`4. El PAS confirma`
4.1. El PAS cancela
4.2. El aviso sigue en Pendientes
4.3. **FIN**

`Pasó un día y el PAS no resolvió el aviso`
D.1. El aviso no es Cumpleaños
D.2. El sistema lo mantiene en Pendientes
D.3. **FIN**

`D.1. El aviso no es Cumpleaños`
D.1.1. El aviso es Cumpleaños y la fecha ya no es la de su fecha de importancia
D.1.2. El sistema lo saca de Pendientes, aunque el PAS no lo haya resuelto
D.1.3. **FIN**

*Postcondiciones*
1. El aviso ya no aparece en Pendientes
2. Si el PAS canceló, el aviso sigue listado
3. Si no lo resolvió, el aviso sigue listado. La excepción es Cumpleaños, que deja de figurar al día siguiente
4. El cierre queda en el registro de auditoría
5. El cliente, la póliza y la cotización siguen como estaban

*Reglas de negocio asociadas*
RN_1: "Resuelto" se muestra con el aviso abierto. No está dentro de Editar.
RN_2: Editar el aviso es otro caso (REF CU-06b-Pendientes_Editar_Aviso).
RN_3: Cancelar la confirmación no saca el aviso de la lista.
RN_4: Resolver no borra al cliente, la póliza ni la cotización.
RN_5: Enviar un mensaje no marca el aviso como resuelto (REF CU-07-Pendientes_Contactar_desde_Aviso).
RN_6: Cumpleaños es el único tipo que figura un solo día. Si el PAS no lo resuelve, al día siguiente el sistema lo saca.
RN_7: El resto de los avisos no se vencen solos. Sin Resuelto, continúan listados.

*Supuestos a confirmar*
SUP_1: Si un aviso resuelto se puede volver a abrir. El prototipo todavía no ofrece Resuelto.
SUP_2: Si resolver un aviso de pago rechazado también cierra el ticket de cobranza, o son registros distintos (REF CU 31).

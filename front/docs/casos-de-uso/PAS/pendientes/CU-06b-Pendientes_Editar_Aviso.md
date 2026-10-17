## CU-06b-Pendientes_Editar_Aviso
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene abierto un aviso de su cartera (REF CU-05-Pendientes_Ver_Pendientes). Hay conexión.
*Disparador:* Actualizar la descripción o la fecha de importancia de un aviso

*Flujo principal*
1. En el aviso abierto, el PAS selecciona "Editar" (REF CU-06-Pendientes_Resolver_Aviso)
2. El sistema muestra `NOMBRE Y APELLIDO`, `TIPO DE COBERTURA`, `FECHA DE IMPORTANCIA`, `TIPO` y `DESCRIPCION`
3. El sistema permite modificar la descripción y consulta si quiere modificar la fecha de importancia (*ALT SIN CAMBIO DE FECHA)
4. El PAS indica que sí y carga la nueva `FECHA DE IMPORTANCIA` (*ALT FECHA)
5. El PAS selecciona "Guardar" (*ALT CANCELAR)
6. El sistema guarda la descripción y la fecha de importancia
7. El aviso pasa a figurar en el período de su tipo para esa fecha (*ALT PERIODO)
8. El sistema registra en sus logs el PAS, el aviso, la descripción, la fecha de importancia, la fecha y la hora (REF CU 56)

*Flujos alternativos*

`3. El sistema permite modificar la descripción y consulta si quiere modificar la fecha`
3.1. El PAS modifica la descripción y no cambia la fecha de importancia
3.2. El PAS selecciona "Guardar"
3.3. El sistema guarda la descripción y el aviso sigue en Pendientes
3.4. **IR A (8)**

`4. El PAS indica que sí y carga la nueva FECHA DE IMPORTANCIA`
4.1. La fecha está vacía
4.2. El sistema marca el campo y no guarda
4.3. **IR A (3)**

`5. El PAS selecciona Guardar`
5.1. El PAS cancela la edición
5.2. El sistema descarta los cambios
5.3. **FIN**

`7. El aviso pasa a figurar en el período de su tipo`
7.1. Hoy está fuera de ese período
7.2. El sistema no lo muestra en Pendientes hasta que el período empiece
7.3. **IR A (8)**

`La fecha de importancia entra en el período del tipo`
F.1. Cumpleaños: hoy es ese día. Próxima renovación: faltan 30 días o menos y es la última cuota. Enviar póliza: faltan 5 días o menos para el vencimiento del pago
F.2. El sistema muestra el aviso en Pendientes
F.3. **FIN**

`El sistema publica un aviso`
S.1. Faltan 30 días para la renovación y esa instancia es la última cuota: el sistema publica `PROXIMA RENOVACION`
S.2. Faltan 5 días para el vencimiento del pago: el sistema publica `ENVIAR POLIZA`
S.3. Hoy es el cumpleaños del cliente: el sistema publica `CUMPLEAÑOS`, solo por ese día
S.4. **FIN**

*Postcondiciones*
1. La descripción queda actualizada
2. Si cambió la fecha de importancia, el aviso figura en el período de su tipo: Cumpleaños ese día, Próxima renovación desde 30 días antes, Enviar póliza desde 5 días antes del vencimiento
3. Si canceló, el aviso sigue como estaba
4. El aviso no queda resuelto
5. El cambio queda en el registro de auditoría

*Reglas de negocio asociadas*
RN_1: Un aviso tiene nombre y apellido del cliente, tipo de cobertura (Hogar, Automotor o Integrales), fecha de importancia y tipo.
RN_2: En Editar se modifican la descripción y, si el PAS lo confirma, la fecha de importancia.
RN_3: No existe la opción Posponer. Correr un aviso es cambiar su fecha de importancia.
RN_4: La fecha de importancia es la fecha en que vence el aviso. En Cumpleaños, por defecto, es siempre el mismo día.
RN_5: Cancelar no persiste el cambio.
RN_6: Editar no saca el aviso por Resuelto. Eso sigue el CU-06-Pendientes_Resolver_Aviso.
RN_7: Enviar un mensaje no cambia la descripción ni la fecha (REF CU-07-Pendientes_Contactar_desde_Aviso).
RN_8: Próxima renovación se publica 30 días antes de su fecha de importancia, en la última cuota, y sigue hasta que el PAS lo resuelva.
RN_9: Enviar póliza se publica 5 días antes del vencimiento del pago y sigue hasta que el PAS lo resuelva, también después de esa fecha.
RN_10: Cumpleaños figura solo el día de su fecha de importancia.

*Supuestos a confirmar*
SUP_1: Si en Editar también se pueden cambiar el nombre y apellido, el tipo de cobertura o el tipo, o solo la descripción y la fecha de importancia. El prototipo todavía no ofrece Editar.
SUP_2: Si cambiar la fecha de importancia de un pago rechazado también actualiza el ticket de cobranza, o son registros distintos (REF CU 36).
SUP_3: Si al cambiar la fecha de un cumpleaños el aviso pasa a figurar ese nuevo día, aunque deje de coincidir con el cumpleaños del cliente.

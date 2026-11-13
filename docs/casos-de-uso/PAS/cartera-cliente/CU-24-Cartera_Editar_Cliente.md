## CU-24-Cartera_Editar_Cliente
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene abierta la ficha de un cliente de su cartera (REF CU-25-Cartera_Ver_Ficha_Cliente). Hay conexión.
*Disparador:* Corregir o actualizar los datos de un cliente

*Flujo principal*
1. En la ficha del cliente, el PAS selecciona "Editar"
2. El sistema muestra el formulario con los datos actuales
3. El PAS modifica nombre y apellido (razón social si el documento es CUIT), email, teléfono, número de documento o comentarios. El tipo de documento no se puede cambiar (REF RN_9)
4. El PAS selecciona "Guardar cambios". Si modificó el número de documento, el sistema le pide confirmar antes de guardar (REF RN_10) (*ALT CANCELAR)
5. El sistema valida los campos y verifica que el documento no pertenezca a otro cliente (*ALT DATOS INVALIDOS, *ALT DOCUMENTO DUPLICADO)
6. El sistema guarda los cambios
7. El sistema vuelve a mostrar la ficha actualizada
8. El sistema registra el PAS, el cliente, los campos modificados, la fecha y la hora (REF CU 51)

*Flujos alternativos*

`4. El PAS selecciona Guardar cambios`
4.1. El PAS cancela la edición
4.2. El sistema descarta los cambios y vuelve a la ficha
4.3. **FIN**

`5. El sistema valida los campos`
5.1. Falta un dato obligatorio, el email no es válido o el documento informado no tiene la longitud de su tipo (DNI: 7 u 8 números; CUIT: 11 números)
5.2. El sistema marca cada campo inválido y no guarda
5.3. **IR A (3)**

`5. El sistema verifica que el documento no pertenezca a otro cliente`
5.1. El documento corresponde a otro cliente
5.2. El sistema informa la coincidencia y no guarda
5.3. El PAS corrige el documento o cancela
5.4. **IR A (3)**

*Postcondiciones*
1. La ficha muestra los datos actualizados
2. Las pólizas, propuestas y eventos del historial siguen asociados al mismo cliente
3. Si el PAS canceló o hubo errores, los datos anteriores permanecen sin cambios
4. La modificación queda en el registro de auditoría

*Reglas de negocio asociadas*
RN_1: Editar un cliente no crea otro registro ni cambia su identificador interno.
RN_2: El documento es obligatorio y no puede quedar asociado a dos clientes en la red (REF CU-10 RN_2: un asegurado ↔ un PAS). Si el documento ya es de otro productor, se avisa sin mostrar datos y no se guarda.
RN_3: Este caso modifica datos del cliente. Los datos propios de una póliza no se editan desde este formulario (REF CU-27-Cartera_Ver_Detalle_Poliza).
RN_4: Un PAS solo puede editar clientes de su cartera.
RN_5: El registro de auditoría identifica qué campos cambiaron, sin reemplazar el valor histórico.
RN_6: Editar el cliente no modifica las propuestas ya generadas, porque conservan los datos con los que fueron emitidas.
RN_7: Este formulario no incorpora un cliente ni le asocia una póliza. Un cliente de la cartera ya tiene al menos una cobertura o póliza asociada, vigente o no (REF CU-23-Cartera_Dar_de_Alta_Cliente).
RN_8: Editar los datos no cambia qué pólizas se exponen. En Cartera solo se ven las vigentes. Eliminar una póliza no se hace acá: ese registro pasa a Leads con el detalle del bien asegurado y el cliente sigue en Cartera si le queda otra vigente (REF CU-05-Pendientes_Ver_Pendientes, transicion-estados-bien.md).

RN_9: El tipo de documento se fija al crear al cliente y no se edita. Así una persona física no pasa a jurídica (ni al revés) y el formulario no cambia de nombre y apellido a razón social a mitad de la edición (REF CU-10 RN_3, cuestiones A3). Si el PAS cargó mal el tipo, no lo corrige él: solicita el cambio y lo autoriza un administrativo, que es quien puede modificarlo. El caso de la solicitud y la autorización no está escrito (REF SUP_5).
RN_10: Cambiar el número de documento pide una confirmación adicional del PAS antes de guardar, porque es el dato que identifica al cliente en la red (REF RN_2). Cambiar nombre, razón social, email, teléfono o comentarios no la pide.
RN_11: Los cambios de email y teléfono se reflejan en los avisos, leads y siniestros abiertos del cliente. Las propuestas ya generadas y los eventos cerrados conservan los datos con los que se emitieron (REF RN_6).

*Supuestos a confirmar*
SUP_1: Qué campos, además de nombre y apellido o razón social, email, teléfono, número de documento y comentarios, se pueden editar.
SUP_2: Resuelto. Solo el cambio de número de documento pide confirmación (REF RN_10).
SUP_3: Quién registra que se eliminó una póliza. Este caso no lo hace: solo corrige datos del cliente.
SUP_4: Resuelto. Los datos de contacto se propagan a lo abierto; lo cerrado conserva copia histórica (REF RN_11).
SUP_5: Cómo el PAS solicita el cambio del tipo de documento, cómo lo autoriza o rechaza el administrativo, si el PAS ve el estado de su solicitud, y qué pasa con las pólizas y propuestas del cliente al cambiar el tipo. Va en un caso de uso propio, todavía sin escribir (REF CU-01 para el rol administrativo).

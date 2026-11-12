## CU-24-Cartera_Editar_Cliente
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene abierta la ficha de un cliente de su cartera (REF CU-25-Cartera_Ver_Ficha_Cliente). Hay conexión.
*Disparador:* Corregir o actualizar los datos de un cliente

*Flujo principal*
1. En la ficha del cliente, el PAS selecciona "Editar"
2. El sistema muestra el formulario con los datos actuales
3. El PAS modifica nombre, apellido, email, teléfono, DNI o comentarios
4. El PAS selecciona "Guardar cambios" (*ALT CANCELAR)
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
5.1. Falta un dato obligatorio, el email no es válido o el DNI informado no tiene 7 u 8 números
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
RN_2: El documento, si se informa, no puede quedar asociado a dos clientes en la red (REF CU-10 RN_2: un asegurado ↔ un PAS). Si el DNI ya es de otro productor, se avisa sin mostrar datos y no se guarda.
RN_3: Este caso modifica datos del cliente. Los datos propios de una póliza no se editan desde este formulario (REF CU-27-Cartera_Ver_Detalle_Poliza).
RN_4: Un PAS solo puede editar clientes de su cartera.
RN_5: El registro de auditoría identifica qué campos cambiaron, sin reemplazar el valor histórico.
RN_6: Editar el cliente no modifica las propuestas ya generadas, porque conservan los datos con los que fueron emitidas.
RN_7: Este formulario no incorpora un cliente ni le asocia una póliza. Un cliente de la cartera ya tiene al menos una cobertura o póliza asociada, vigente o no (REF CU-23-Cartera_Dar_de_Alta_Cliente).
RN_8: Editar los datos no cambia qué pólizas se exponen. En Cartera solo se ven las vigentes. Eliminar una póliza no se hace acá: ese registro pasa a Leads con el detalle del bien asegurado y el cliente sigue en Cartera si le queda otra vigente (REF CU-05-Pendientes_Ver_Pendientes, transicion-estados-bien.md).

*Supuestos a confirmar*
SUP_1: Qué campos, además de nombre, apellido, email, teléfono, DNI y comentarios, se pueden editar.
SUP_2: Si cambiar el documento, nombre o razón social requiere confirmación adicional.
SUP_3: Quién registra que se eliminó una póliza. Este caso no lo hace: solo corrige datos del cliente.
SUP_4: Si los cambios de contacto se propagan a avisos, leads y siniestros abiertos o esos registros conservan una copia histórica.

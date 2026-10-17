*CU-Pendientes-08b-Reactivar_Lead*
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene abierto un lead de su cartera (REF CU-Pendientes-05). Hay conexión. El lead tiene una cotización previa, con el formulario que el PAS ya había completado al enviarla.
*Disparador:* El cliente volvió a contratar

*Flujo principal*
1. En el lead abierto, el PAS selecciona "Reactivar"
2. El sistema muestra una previsualización de los datos recabados en ese formulario (*ALT RECOTIZAR)
3. El PAS los chequea. Puede elegir otra compañía, otro tipo de cobertura u otra alternativa
4. El PAS edita la previsualización (*ALT SIN EDICION)
5. El PAS selecciona "Activar"
6. El sistema abre el formulario, con esos campos cargados y editables (REF CU 9)
7. El PAS ajusta los campos y confirma la contratación (*ALT CANCELAR)
8. El sistema incorpora al cliente en la cartera, porque volvió a contratar el servicio (REF CU 25, CU 30)
9. El lead sale de Leads
10. El sistema registra el PAS, el lead, la fecha y la hora (REF CU 56)

*Flujos alternativos*

`2. El sistema muestra una previsualización de los datos recabados en ese formulario`
2.1. El PAS envía una recotización
2.2. El sistema actualiza `ULT. FECHA DE MODIFICACION` al día de hoy. Esa fecha es la de la última interacción (*ALT DESCRIPCION Y FECHA)
2.3. El lead sigue en Leads y el cliente no vuelve a la cartera
2.4. **FIN**

`2.2. El sistema actualiza ULT. FECHA DE MODIFICACION al día de hoy`
2.2.1. El PAS modifica la descripción y la fecha de la última interacción
2.2.2. El sistema guarda esa descripción y esa fecha
2.2.3. **IR A (2.3)**

`4. El PAS edita la previsualización`
4.1. El PAS deja la previsualización como estaba
4.2. **IR A (5)**

`7. El PAS ajusta los campos y confirma la contratación`
7.1. El PAS cancela
7.2. El lead sigue en Leads y el cliente no entra a la cartera
7.3. **FIN**

*Postcondiciones*
1. Si activó, el cliente vuelve a la cartera porque contrató de nuevo, y el lead ya no figura en Leads
2. Si envió una recotización, el lead sigue en Leads. La fecha de la última interacción queda en hoy, o en la fecha que el PAS cargó, junto con la descripción si la modificó
3. Cancelar no saca el lead ni incorpora al cliente a la cartera
4. El cambio queda en el registro de auditoría

*Reglas de negocio asociadas*
RN_1: Reactivado significa que el cliente volvió a contratar un servicio y vuelve a la cartera.
RN_2: Antes de Activar, el PAS ve la previsualización del formulario de la cotización previa y puede editarla: otra compañía, otro tipo de cobertura u otra alternativa.
RN_3: Activar abre ese formulario con los campos para editar. La previsualización no reemplaza al formulario.
RN_4: Enviar una recotización no lo pasa a la cartera. Actualiza la fecha de la última interacción, o deja que el PAS modifique la descripción y esa fecha.
RN_5: La fecha de la última interacción es `ULT. FECHA DE MODIFICACION`.
RN_6: Reactivar no es recotizar el lead (REF CU-Pendientes-08d) ni descartarlo (REF CU-Pendientes-08c).

*Supuestos a confirmar*
SUP_1: Si Activar, además del formulario, registra la póliza emitida (REF CU 25). El prototipo no tiene Reactivar.
SUP_2: Si la recotización también cambia el origen del lead.
SUP_3: Si la descripción que se edita al recotizar es el comentario que el lead ya muestra al abrirlo.

## CU-08e-Pendientes_Editar_Descripcion_Lead
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene abierto un lead de su cartera (REF CU-05-Pendientes_Ver_Pendientes). Hay conexión.
*Disparador:* Corregir la descripción de un lead

*Flujo principal*
1. En el lead abierto, el PAS selecciona "Editar"
2. El sistema muestra la descripción actual
3. El PAS la modifica
4. El PAS selecciona "Guardar" (*ALT CANCELAR)
5. El sistema guarda esa descripción
6. El lead sigue en Leads, con el mismo origen
7. El sistema registra el PAS, el lead, la descripción, la fecha y la hora (REF CU 51)

*Flujos alternativos*

`4. El PAS selecciona Guardar`
4.1. El PAS cancela
4.2. La descripción anterior permanece
4.3. **FIN**

*Postcondiciones*
1. La descripción del lead queda actualizada
2. El lead no cambia de lista ni de origen
3. Si canceló, la descripción anterior permanece
4. El cambio queda en el registro de auditoría

*Reglas de negocio asociadas*
RN_1: Se edita la descripción del lead. Un aviso no tiene descripción editable.
RN_2: El único comentario que se adjunta al crear un lead es el rechazo de Cotización enviada, y es opcional (REF CU-05d-Pendientes_Aviso_Cotizacion_Enviada). Después, esa descripción se cambia con este caso.
RN_3: Editar la descripción no envía una cotización ni pasa el lead a Pendientes.
RN_4: Si desde el lead se envía una cotización, abre Cotizar con sus datos y, al enviarla, pasa a Pendientes como Cotización enviada (REF CU-08d-Lead_Enviar_Cotizacion).
RN_5: Reactivar y descartar no reemplazan esta edición (REF CU-08b-Pendientes_Reactivar_Lead, CU-08c-Pendientes_Descartar_Lead).

*Supuestos a confirmar*
SUP_1: Si, además de la descripción, el PAS puede cambiar la fecha de última interacción desde esta misma pantalla.

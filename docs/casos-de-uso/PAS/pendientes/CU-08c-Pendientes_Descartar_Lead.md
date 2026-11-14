## CU-08c-Pendientes_Descartar_Lead (SERA IMPORTANTE LOGEAR ESTE TIPO DE ACCCIONES -->POR QUE LO DESCARTASTE UN POTENCIAL CLIENTE?)
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene abierto un lead de su cartera (REF CU-05-Pendientes_Ver_Pendientes). Hay conexión.
*Disparador:* Dejar de trabajar un lead

*Flujo principal*
1. En el lead abierto, el PAS selecciona "Descartar"
2. El sistema pide confirmación
3. El PAS confirma (*ALT CANCELAR)
4. El sistema saca el lead de Leads
5. El sistema registra el PAS, el lead, la fecha y la hora (REF CU 51)

*Flujos alternativos*

`3. El PAS confirma`
3.1. El PAS cancela
3.2. El lead sigue en la lista, con el mismo origen y la misma fecha
3.3. **FIN**

*Postcondiciones*
1. El lead ya no aparece en Leads
2. El cliente sigue almacenado. Si tiene pólizas vigentes, sigue en Cartera. Si no, sigue sin mostrarse ahí y sigue elegible como cliente existente
3. El descarte queda en el registro de auditoría

*Reglas de negocio asociadas*
RN_1: Descartar saca el lead de la lista. No borra al cliente ni sus pólizas. Si era el último lugar donde se veía, deja de mostrarse y sigue en la base, elegible como cliente existente (REF CU-10-Multicotizador_Seleccionar_o_Crear_Cliente, transicion-estados-bien.md).
RN_2: Descartar no inicia una cotización.
RN_3: Cancelar la confirmación no persiste el descarte.
RN_4: Un lead descartado no vuelve a la lista por el paso del tiempo.

*Supuestos a confirmar*
SUP_1: Si el descarte pide un motivo. El prototipo no tiene esta acción.
SUP_2: Si un lead descartado se puede recuperar.
SUP_3: Si el descarte también cierra una cotización en curso asociada a esa persona (REF CU 12, CU 15).

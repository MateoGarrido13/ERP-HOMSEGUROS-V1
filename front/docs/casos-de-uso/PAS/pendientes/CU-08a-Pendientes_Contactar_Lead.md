## CU-08a-Pendientes_Contactar_Lead
*Actor principal:* PAS
*Actor secundario:* Teléfono, WhatsApp o correo del cliente
*Precondiciones:* El PAS tiene abierto un lead de su cartera (REF CU-05-Pendientes_Ver_Pendientes). Hay conexión. El lead tiene teléfono.
*Disparador:* Contactar a la persona del lead

*Flujo principal*
1. En el lead abierto, el sistema muestra el comentario y el teléfono
2. El PAS selecciona el teléfono para llamar (*ALT WHATSAPP)
3. El sistema abre la llamada hacia ese número
4. El sistema actualiza `ULT. FECHA DE MODIFICACION` al día de hoy
5. El sistema registra el PAS, el lead, el canal, la fecha y la hora (REF CU 51)
6. El lead sigue en la lista, con el mismo origen

*Flujos alternativos*

`2. El PAS selecciona el teléfono para llamar`
2.1. El PAS selecciona "Enviar WhatsApp" o "Enviar mail"
2.2. El sistema arma un texto con el nombre del cliente, el nombre del PAS en sesión y el origen del lead
2.3. El PAS confirma el envío (*ALT CANAL)
2.4. **IR A (4)**

`2.3. El PAS confirma el envío`
2.3.1. El PAS cierra la hoja de envío, o elige mail y el cliente no tiene email
2.3.2. El sistema no actualiza la fecha y no registra un contacto
2.3.3. **FIN**

`3. El sistema abre la llamada hacia ese número`
3.1. El PAS cancela la llamada antes de iniciarla
3.2. La fecha y el origen siguen como estaban
3.3. **FIN**

*Postcondiciones*
1. Si el contacto se inició, la última fecha de modificación del lead es hoy
2. El origen del lead no cambia
3. El contacto queda en el registro de auditoría
4. El lead no se convierte en cotización ni se descarta

*Reglas de negocio asociadas*
RN_1: En el prototipo, el lead abierto muestra el comentario y el teléfono, y el teléfono inicia una llamada.
RN_2: WhatsApp y mail usan el mismo criterio que un aviso: firma el PAS autenticado y el texto menciona el origen (REF CU-07-Pendientes_Contactar_desde_Aviso).
RN_3: Los orígenes del prototipo son Cotización enviada y Retiró el bien.
RN_4: Contactar no saca el lead de la lista.
RN_5: Abrir el lead sin llamar ni enviar no actualiza la fecha (REF CU-05-Pendientes_Ver_Pendientes).

*Supuestos a confirmar*
SUP_1: WhatsApp y mail en el lead. El prototipo hoy solo expone el teléfono.
SUP_2: Si una llamada iniciada alcanza para actualizar la fecha, o hace falta que el PAS marque el contacto como hecho.
SUP_3: Si el texto del lead se arma solo o el PAS lo escribe.

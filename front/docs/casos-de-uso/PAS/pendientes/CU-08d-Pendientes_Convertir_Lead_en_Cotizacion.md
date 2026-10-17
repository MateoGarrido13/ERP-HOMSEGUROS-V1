## CU-08d-Pendientes_Convertir_Lead_en_Cotizacion
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene abierto un lead de su cartera (REF CU-05-Pendientes_Ver_Pendientes). Hay conexión. El lead tiene ramo.
*Disparador:* Cotizar a partir de un lead

*Flujo principal*
1. En el lead abierto, el PAS selecciona "Recotizar"
2. El sistema toma el ramo y los datos de contacto que el lead ya tiene
3. El sistema abre Cotizar en ese ramo (REF CU 9)
4. Si el cliente ya está en la cartera, queda seleccionado. Si no, el PAS lo crea en ese flujo (REF CU 10) (*ALT ABANDONO)
5. El PAS sigue la cotización del ramo
6. Cuando envía la propuesta (REF CU 23), el sistema deja el origen del lead en `COTIZACION ENVIADA`
7. El sistema actualiza `ULT. FECHA DE MODIFICACION` al día del envío
8. El sistema registra el PAS, el lead, la propuesta, la fecha y la hora (REF CU 56)
9. El lead sigue en Leads

*Flujos alternativos*

`4. Si el cliente ya está en la cartera, queda seleccionado`
4.1. El PAS sale de la cotización sin enviar la propuesta
4.2. El origen y la fecha del lead siguen como estaban
4.3. **FIN**

*Postcondiciones*
1. Queda abierta, o enviada, una cotización del ramo del lead
2. Si la propuesta se envió, el lead queda con origen Cotización enviada y la fecha del envío
3. Si la cotización se abandonó, el lead no cambia
4. El envío de la propuesta queda en el registro de auditoría

*Reglas de negocio asociadas*
RN_1: Recotizar no emite la póliza. La emisión se asienta en otro caso (REF CU 25).
RN_2: El ramo con el que abre Cotizar es el del lead.
RN_3: Un cliente que ya existe se reutiliza. No se da de alta de nuevo (REF CU 10).
RN_4: El lead sale de esta lista si el PAS lo descarta (REF CU-08c-Pendientes_Descartar_Lead) o si lo reactiva y el cliente vuelve a la cartera (REF CU-08b-Pendientes_Reactivar_Lead).
RN_5: Hasta que la propuesta se envía, el lead conserva el origen y la fecha anteriores.

*Supuestos a confirmar*
SUP_1: Hogar, Accidentes Personales y ART abren el flujo de solicitud, no el comparador de Automotor (REF CU 26).
SUP_2: Si el lead de origen Retiró el bien precarga algún dato del bien anterior, o solo el cliente y el ramo.
SUP_3: Si al enviar la propuesta también se crea el aviso Cotización enviada en Pendientes (REF CU-05-Pendientes_Ver_Pendientes).

## CU-08d-Lead_Enviar_Cotizacion
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene abierto un lead (REF CU-05-Pendientes_Ver_Pendientes). Hay conexión. El lead tiene ramo y datos del cliente.
*Disparador:* Enviar una cotización desde el lead

*Flujo principal*
1. En el lead, el PAS selecciona "Enviar cotización"
2. El sistema abre Cotizar con los datos de ese lead (REF CU 9)
3. El PAS envía la cotización (*ALT ABANDONO)
4. El sistema publica un aviso en Pendientes, estado Pendiente, tipo Cotización enviada (REF CU-05d-Pendientes_Aviso_Cotizacion_Enviada)
5. El lead sale de Leads
6. El sistema registra el PAS, el lead, el aviso, la fecha y la hora (REF CU 51)

*Flujos alternativos*

`3. El PAS envía la cotización`
3.1. El PAS sale de Cotizar sin enviarla
3.2. El lead sigue en Leads, con la misma descripción
3.3. **FIN**

*Postcondiciones*
1. Si envió, el seguimiento está en Pendientes como aviso Cotización enviada y el lead ya no figura
2. Si no envió, el lead no cambia
3. No queda un lead y un aviso a la vez para esa cotización

*Reglas de negocio asociadas*
RN_1: Esta acción redirige a Cotizar con los datos del lead. No asigna una póliza vigente.
RN_2: Reactivar no abre Cotizar: publica Pendientes como Cotización enviada con la propuesta ya enviada (REF CU-08b-Pendientes_Reactivar_Lead). La póliza vigente se asigna después, si el cliente confirma, al resolver ese aviso con "Dar de alta" (REF CU-05d-Pendientes_Aviso_Cotizacion_Enviada).
RN_3: Editar la descripción no abre Cotizar (REF CU-08e-Pendientes_Editar_Descripcion_Lead).
RN_4: Un cliente que ya existe se reutiliza (REF CU 10).

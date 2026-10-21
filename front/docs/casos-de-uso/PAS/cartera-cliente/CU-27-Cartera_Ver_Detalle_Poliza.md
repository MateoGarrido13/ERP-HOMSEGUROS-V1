## CU-27-Cartera_Ver_Detalle_Poliza
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene la sesión abierta (REF CU-01-Acceso_Iniciar_Sesion). La póliza está vigente y pertenece a un cliente de su cartera. Hay conexión.
*Disparador:* Consultar la información de una póliza

*Flujo principal*
1. El PAS abre una póliza desde la ficha del cliente (REF CU-25-Cartera_Ver_Ficha_Cliente)
2. El sistema muestra el nombre del cliente, ramo, compañía, número de póliza y estado
3. El sistema muestra la vigencia y el próximo vencimiento de cobro
4. El sistema muestra los datos disponibles del riesgo o bien asegurado
5. El sistema muestra los documentos asociados a la póliza (*ALT SIN DOCUMENTOS)
6. El PAS consulta la información (*ALT ENVIAR, *ALT RECOTIZAR)

*Flujos alternativos*

`5. El sistema muestra los documentos asociados`
5.1. La póliza no tiene documentos guardados
5.2. El sistema informa que no hay documentos disponibles
5.3. **IR A (6)**

`6. El PAS consulta la información`
6.1. El PAS selecciona "Enviar póliza"
6.2. Sigue el CU-28-Cartera_Enviar_Poliza
6.3. **FIN**

`6. El PAS consulta la información`
6.1. El PAS selecciona "Recotizar"
6.2. El sistema inicia una cotización con los datos reutilizables de la póliza y del cliente (REF CU 11)
6.3. **FIN**

`1. El PAS abre una póliza`
1.1. La póliza ya no está vigente, no está disponible o no pertenece a su cartera
1.2. Si el cliente retiró su bien, el sistema informa que pasó a Lead y no abre la ficha de Cartera (REF CU-08a-Pendientes_Contactar_Lead)
1.3. En los demás casos, informa que no puede mostrarla y vuelve a la ficha
1.4. **FIN**

*Postcondiciones*
1. El PAS queda viendo la información de la póliza o inicia la acción seleccionada
2. Consultar el detalle no modifica la póliza
3. Ningún documento se envía sin una acción explícita del PAS

*Reglas de negocio asociadas*
RN_1: El número de póliza y la compañía identifican el registro operativo; la póliza legal continúa en la aseguradora.
RN_2: El detalle pertenece a un único cliente y a un único PAS.
RN_3: Los datos del riesgo dependen del ramo. No todos los ramos muestran los mismos campos.
RN_4: La fecha del próximo cobro se muestra en formato `dd/mm/aaaa`.
RN_5: Si la póliza tiene documentos, el PAS puede consultarlos sin abandonar el detalle.
RN_6: Ver el detalle no cambia el estado de la póliza ni el de sus cuotas.
RN_7: El prototipo actual muestra ramo, compañía, número de póliza y próximo cobro dentro de la tarjeta del cliente. La vigencia, el estado, el riesgo y los documentos completan el detalle requerido.
RN_8: En Cartera este detalle solo se abre para una póliza vigente. Una póliza que no está vigente no se expone desde la ficha ni desde el listado (REF CU-25-Cartera_Ver_Ficha_Cliente, CU-22-Cartera_Buscar_y_Filtrar_Clientes).
RN_9: Si el cliente retiró su bien, deja la cartera y pasa a Lead. Sus pólizas dejan de tener detalle en Cartera.

*Supuestos a confirmar*
SUP_1: Quién actualiza el estado de la póliza y qué estados existen además de vigente. En Cartera solo se expone la vigente. El paso a Lead ocurre cuando el cliente retiró el bien, no por el solo hecho de abrir este detalle.
SUP_2: Qué campos del riesgo se muestran para Automotor, Hogar, Accidentes Personales y ART.
SUP_3: Si el detalle incluye prima, suma asegurada, cobertura, cuotas, medio de pago y comisión.
SUP_4: De dónde se obtiene el PDF de la póliza y qué ocurre si la aseguradora reemplaza el documento por un endoso.
SUP_5: Si el PAS puede corregir datos de la póliza o solo cargarlos mediante el registro de emisión y la carga inicial (REF CU 16, CU-29-Cartera_Cargar_Polizas_Existentes).

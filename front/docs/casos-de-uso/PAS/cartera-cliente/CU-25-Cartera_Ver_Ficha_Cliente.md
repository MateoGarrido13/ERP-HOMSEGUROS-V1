## CU-25-Cartera_Ver_Ficha_Cliente
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene la sesión abierta (REF CU-01-Acceso_Iniciar_Sesion). El cliente pertenece a su cartera. Hay conexión.
*Disparador:* Consultar toda la información disponible de un cliente

*Flujo principal*
1. El PAS busca y selecciona un cliente (REF CU-22-Cartera_Buscar_y_Filtrar_Clientes)
2. El sistema abre la ficha e identifica al cliente por nombre y apellido o razón social
3. El sistema muestra sus datos de contacto: email y teléfono, y los demás datos personales disponibles
4. El sistema muestra sus pólizas vigentes, agrupadas por ramo, con compañía y número de póliza (*ALT SIN VIGENTES)
5. El sistema muestra sus propuestas con ramo, compañía, fecha y estado (*ALT SIN PROPUESTAS)
6. El sistema muestra el historial del cliente en orden del evento más reciente al más antiguo (*ALT SIN HISTORIAL)
7. El PAS consulta la información (*ALT VER POLIZA, *ALT EDITAR, *ALT SUMAR POLIZA)

*Flujos alternativos*

`4. El sistema muestra sus pólizas vigentes`
4.1. El cliente no tiene pólizas vigentes para exponer
4.2. El sistema no lista pólizas. Las que no están vigentes quedan fuera de la ficha
4.3. Si el cliente retiró su bien, no llega a esta ficha: ya salió de la cartera y está en Lead (REF CU-08a-Pendientes_Contactar_Lead)
4.4. **IR A (5)**

`5. El sistema muestra sus propuestas`
5.1. El cliente no tiene propuestas
5.2. El sistema muestra que todavía no tiene propuestas
5.3. **IR A (6)**

`6. El sistema muestra el historial del cliente`
6.1. El cliente no tiene eventos registrados
6.2. El sistema muestra que todavía no tiene historial
6.3. **IR A (7)**

`7. El PAS consulta la información`
7.1. El PAS selecciona una póliza
7.2. El sistema abre su detalle (REF CU-27-Cartera_Ver_Detalle_Poliza)
7.3. **FIN**

`7. El PAS consulta la información`
7.1. El PAS selecciona "Editar"
7.2. Sigue el CU-24-Cartera_Editar_Cliente
7.3. **FIN**

`7. El PAS consulta la información`
7.1. El PAS selecciona "+"
7.2. El sistema redirige a Cotizar con este cliente seleccionado (REF CU-23-Cartera_Dar_de_Alta_Cliente)
7.3. **FIN**

*Postcondiciones*
1. El PAS queda viendo la ficha o el detalle que seleccionó
2. Consultar la ficha no modifica al cliente, sus pólizas ni sus propuestas, y no lo pasa a Lead
3. El PAS solo accede a información de clientes de su cartera
4. La sección de pólizas muestra solo las vigentes

*Reglas de negocio asociadas*
RN_1: La ficha reúne contacto, pólizas vigentes, propuestas e historial del mismo cliente.
RN_2: No se puede incorporar un cliente si no tiene una cobertura o póliza asociada, vigente o no. En la ficha solo se exponen las pólizas vigentes (REF CU-23-Cartera_Dar_de_Alta_Cliente).
RN_3: Cada póliza vigente de la ficha enlaza con su detalle (REF CU-27-Cartera_Ver_Detalle_Poliza).
RN_4: Las propuestas conservan su estado: en curso, enviada, aceptada, rechazada o vencida, según corresponda (REF CU 12, CU 15).
RN_5: Abrir la ficha o desplegar una sección no cuenta como una modificación del cliente.
RN_6: La ficha no reemplaza el registro de auditoría. Presenta la actividad útil para la gestión del cliente; la auditoría sigue el CU 51.
RN_7: "+" suma una póliza nueva y redirige a Cotizar con el cliente ya seleccionado (REF CU-23-Cartera_Dar_de_Alta_Cliente).
RN_8: Si el cliente retiró su bien, deja la cartera y pasa a Lead. La ficha de Cartera deja de exponerlo.

*Supuestos a confirmar*
SUP_1: Qué eventos integran el historial: altas y ediciones, contactos, cotizaciones, propuestas, pólizas, cobranzas y siniestros.
SUP_2: Si las secciones se muestran juntas, en pestañas o como tarjetas desplegables. El prototipo actual solo despliega pólizas y próximo cobro dentro de Cartera.
SUP_3: Si el historial de la ficha conserva las pólizas que dejaron de estar vigentes, aunque la sección de pólizas solo liste las vigentes.
SUP_4: Si deben mostrarse DNI/CUIT, domicilio, localidad, fecha de nacimiento y comentarios en los datos personales.

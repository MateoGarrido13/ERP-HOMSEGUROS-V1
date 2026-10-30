## CU-05-Pendientes_Ver_Pendientes
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene la sesión abierta (REF CU-01-Acceso_Iniciar_Sesion). Hay conexión.
*Disparador:* Consultar qué tiene para hacer

*Flujo principal*

1. El PAS abre "Pendientes", o llega ahí al iniciar sesión (REF CU-01-Acceso_Iniciar_Sesion)
2. El sistema muestra los avisos de ese PAS y la cantidad: "1 aviso" o "N avisos" (*ALT SIN AVISOS)
3. Cada aviso muestra `NOMBRE Y APELLIDO`, `TIPO DE COBERTURA`, `FECHA DE IMPORTANCIA` y `TIPO`
4. El sistema muestra la sección "Leads" y la cantidad: "1 lead" o "N leads" (*ALT SIN LEADS)
5. Cada lead muestra el origen, el cliente, el ramo, `ULT. FECHA DE MODIFICACION` y los días transcurridos desde esa fecha
6. El PAS selecciona un aviso (*ALT LEAD)
7. El sistema muestra los datos del aviso: nombre y apellido, tipo de cobertura, fecha de importancia y tipo. No hay descripción para modificar
8. Desde el aviso abierto, Resolver y WhatsApp siguen el caso de ese tipo (REF CU-05b-Pendientes_Aviso_Cumpleanos, CU-05c-Pendientes_Aviso_Pago_Rechazado, CU-05d-Pendientes_Aviso_Cotizacion_Enviada, CU-05e-Pendientes_Aviso_Enviar_Poliza)

*Flujos alternativos*

`

1. El sistema muestra los avisos de ese PAS`

2.1. Ese PAS no tiene avisos
2.2. El sistema muestra "0 avisos" y no muestra tarjetas de aviso
2.3. **IR A (4)**

`

1. El sistema muestra la sección Leads`

4.1. Ese PAS no tiene leads
4.2. El sistema muestra "0 leads" y no muestra tarjetas de lead
4.3. **FIN**

`

1. El PAS selecciona un aviso`

6.1. El PAS selecciona un lead
6.2. El sistema muestra la descripción del lead
6.3. El PAS puede editarla, enviar una cotización, reactivarlo o descartarlo (REF CU-08e-Pendientes_Editar_Descripcion_Lead, CU-08d-Lead_Enviar_Cotizacion, CU-08b-Pendientes_Reactivar_Lead, CU-08c-Pendientes_Descartar_Lead)
6.4. **FIN**

*Postcondiciones*

1. No se modifica ningún aviso ni ningún lead
2. El PAS queda viendo solo los pendientes de su cartera

*Reglas de negocio asociadas*   
RN_1: Un PAS no ve avisos ni leads de otro PAS.  
 RN_2: Un aviso tiene nombre y apellido del cliente, tipo de cobertura (Hogar, Automotor o Integrales), fecha de importancia y tipo.
RN_3: Los tipos son Pago rechazado (REF CU-05c-Pendientes_Aviso_Pago_Rechazado), Cumpleaños (REF CU-05b-Pendientes_Aviso_Cumpleanos), Cotización enviada (REF CU-05d-Pendientes_Aviso_Cotizacion_Enviada) y Enviar póliza (REF CU-05e-Pendientes_Aviso_Enviar_Poliza). Próxima renovación no está en estas transiciones.
RN_4: La fecha de importancia es el vencimiento del aviso. La fija el tipo de aviso. El PAS no la edita.
RN_5: La fecha del lead se muestra dd/mm/aaaa. Los días se cuentan desde esa fecha hasta hoy: hoy es "Cargado hoy", un día es "1 día transcurrido" y de ahí en más "N días transcurridos".
RN_6: Un aviso no tiene descripción editable. La descripción que se edita es la del lead (REF CU-08e-Pendientes_Editar_Descripcion_Lead).
RN_7: El único comentario que se puede adjuntar está en el rechazo de Cotización enviada, al pasar ese aviso a Lead (REF CU-05d-Pendientes_Aviso_Cotizacion_Enviada).
RN_8: Eliminar una póliza crea un lead de ese bien, con el detalle de lo que se tenía asegurado. No depende de si el cliente tiene otras vigentes. Esas siguen en Cartera bajo el mismo nombre. Si era la última vigente, el cliente deja de mostrarse en Cartera, sus datos siguen guardados y este lead es la última vista en la que figura. Sigue en "Cliente existente" al cotizar, esté o no en Leads (REF transicion-estados-bien.md, CU-10-Multicotizador_Seleccionar_o_Crear_Cliente).
RN_9: Una vez enviada una cotización, el cliente permanece en la base hasta que un administrativo lo borre. Ninguna operación del PAS lo elimina.

*Supuestos a confirmar*
SUP_1: El orden de cada lista. El prototipo las muestra en el orden cargado: avisos arriba y leads abajo.
SUP_2: El aviso figura según el período de su tipo. Cada tipo lo define en su caso.
SUP_3: Si el directivo y el administrativo ven esta pantalla, o solo el dashboard de la red.
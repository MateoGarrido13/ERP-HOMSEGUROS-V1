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
7. El sistema muestra la descripción y los datos del aviso: nombre y apellido, tipo de cobertura, fecha de importancia y tipo
8. Desde el aviso abierto el PAS puede resolverlo (REF CU-06-Pendientes_Resolver_Aviso), editarlo (REF CU-06b-Pendientes_Editar_Aviso) o contactar al cliente (REF CU-07-Pendientes_Contactar_desde_Aviso). Si el tipo es "Enviar póliza", contactar reutiliza el envío de esa póliza (REF CU-33-Cartera_Enviar_Poliza)

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
6.2. El sistema muestra el comentario y el teléfono
6.3. Desde ahí el PAS gestiona el lead (REF CU-08a-Pendientes_Contactar_Lead, CU-08b-Pendientes_Reactivar_Lead, CU-08c-Pendientes_Descartar_Lead, CU-08d-Pendientes_Convertir_Lead_en_Cotizacion)
6.4. **FIN**

`

1. El sistema muestra el comentario y el detalle`

7.1. El aviso no tiene descripción
7.2. El sistema muestra nombre y apellido, tipo de cobertura, fecha de importancia y tipo
7.3. **IR A (8)**

*Postcondiciones*

1. No se modifica ningún aviso ni ningún lead
2. El PAS queda viendo solo los pendientes de su cartera

*Reglas de negocio asociadas*   
RN_1: Un PAS no ve avisos ni leads de otro PAS.  
 RN_2: Un aviso tiene nombre y apellido del cliente, tipo de cobertura (Hogar, Automotor o Integrales), fecha de importancia y tipo.
RN_3: Los tipos son Pago rechazado, Cumpleaños, Cotización enviada, Próxima renovación y Enviar póliza. Cuánto permanece cada uno está en el CU-06-Pendientes_Resolver_Aviso y en el CU-06b-Pendientes_Editar_Aviso.
RN_4: La fecha de importancia es el vencimiento del aviso. En Cumpleaños, por defecto, es siempre el mismo día.
RN_5: La fecha del lead se muestra dd/mm/aaaa. Los días se cuentan desde esa fecha hasta hoy: hoy es "Cargado hoy", un día es "1 día transcurrido" y de ahí en más "N días transcurridos".
RN_6: Abrir un aviso o un lead no cambia su descripción ni su fecha de importancia.

*Supuestos a confirmar*
SUP_1: El orden de cada lista. El prototipo las muestra en el orden cargado: avisos arriba y leads abajo.
SUP_2: El aviso figura según el período de su tipo respecto de la fecha de importancia (REF CU-06b-Pendientes_Editar_Aviso).
SUP_3: Si el directivo y el administrativo ven esta pantalla, o solo el dashboard de la red.
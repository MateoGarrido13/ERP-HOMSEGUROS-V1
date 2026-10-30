## CU-34-Siniestros_Ver_Lista
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene la sesión abierta (REF CU-01-Acceso_Iniciar_Sesion). Hay conexión.
*Disparador:* Consultar los siniestros

*Flujo principal*
1. El PAS abre "Siniestros"
2. El sistema muestra una tarjeta por siniestro (*ALT OTRO ROL)
3. Cada tarjeta muestra el estado, el nombre y apellido del cliente en una sola línea, el ramo, la compañía y el tiempo transcurrido desde la fecha de alta
4. El ramo y la compañía van en la misma línea, separados por " · "
5. El PAS selecciona una tarjeta (REF CU-35-Siniestros_Ver_Detalle)

*Flujos alternativos*

`1. El PAS abre Siniestros`
1.1. Quien tiene la sesión abierta no es PAS
1.2. El sistema no muestra esta pantalla y lo lleva a "Red"
1.3. **FIN**

*Postcondiciones*
1. No se modifica ningún siniestro
2. El PAS queda viendo la lista, o quien no es PAS queda en "Red"

*Reglas de negocio asociadas*
RN_1: En el prototipo esta ruta es del PAS. Directivo y administrativo no la ven: el sistema los lleva a "Red".
RN_2: La lista no muestra un contador de siniestros.
RN_3: Cada tarjeta muestra el estado, el nombre y apellido, el ramo, la compañía y el tiempo desde la fecha de alta. No muestra la fecha en `dd/mm/aaaa`.
RN_4: El tiempo usa el mismo texto que la fecha de un lead: hoy es "Cargado hoy", un día es "1 día transcurrido" y de ahí en más "N días transcurridos" (REF CU-05-Pendientes_Ver_Pendientes, RN_5). Acá la fecha de origen es la del alta del siniestro.
RN_5: Los estados que muestra el prototipo son "En gestión", "Documentación pendiente" y "Cerrado".
RN_6: Un siniestro en "Cerrado" sigue en la lista. No hay filtro que lo oculte (REF CU-38-Siniestros_Cerrar).
RN_7: Abrir la lista no cambia el estado, el comentario ni los contactos.
RN_8: El prototipo no ofrece alta, edición ni cierre desde esta pantalla (REF CU-36-Siniestros_Registrar, CU-37-Siniestros_Actualizar_Ticket, CU-38-Siniestros_Cerrar).

*Supuestos a confirmar*
SUP_1: El orden de la lista. El prototipo la muestra en el orden cargado.
SUP_2: Qué muestra la pantalla si no hay siniestros. El prototipo siempre trae tarjetas.
SUP_3: Si un PAS ve solo los siniestros de su cartera.
SUP_4: En qué momento la etiqueta pasa a "Documentación pendiente". El alta la deja en "En gestión" y el cierre la deja en "Cerrado" (REF CU-36-Siniestros_Registrar, CU-38-Siniestros_Cerrar). "Pendiente de referencia" no es una etiqueta de esta lista.

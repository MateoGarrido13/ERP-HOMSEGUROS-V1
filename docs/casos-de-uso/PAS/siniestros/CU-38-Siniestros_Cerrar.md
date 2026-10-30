## CU-38-Siniestros_Cerrar
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene la sesión abierta (REF CU-01-Acceso_Iniciar_Sesion). Hay un siniestro registrado (REF CU-36-Siniestros_Registrar). Hay conexión.
*Disparador:* Cerrar un siniestro

*Flujo principal*
1. El PAS cierra el siniestro. El prototipo no tiene este control y su nombre no está definido
2. El sistema deja el estado en "Cerrado"
3. La tarjeta sigue en la lista, con el comentario y los contactos que ya tenía (REF CU-34-Siniestros_Ver_Lista, CU-35-Siniestros_Ver_Detalle)

*Flujos alternativos*

No hay otro camino definido.

*Postcondiciones*
1. El estado queda en "Cerrado"
2. El siniestro sigue visible en la lista
3. Cerrar no borra el comentario ni los contactos

*Reglas de negocio asociadas*
RN_1: Cerrar es pasar el estado a "Cerrado".
RN_2: Un siniestro cerrado sigue en la lista. Se muestra con el mismo criterio que el resto: estado, cliente, ramo, compañía y tiempo desde el alta.
RN_3: El prototipo ya muestra tarjetas en "Cerrado" y no tiene una acción "Cerrar".
RN_4: Este paso no es la actualización del ticket (REF CU-37-Siniestros_Actualizar_Ticket).
RN_5: Cierra solo el PAS. El administrativo puede actualizar el ticket y no puede cerrarlo (REF CU-37-Siniestros_Actualizar_Ticket).
RN_6: El alta lo deja en "En gestión", sin número de reclamo ni link (REF CU-36-Siniestros_Registrar).

*Supuestos a confirmar*
SUP_1: Desde qué control se cierra, y si pide confirmación, un motivo o el número de reclamo.
SUP_2: Si un siniestro que ya está en "Cerrado" se puede volver a cerrar, o si la acción solo aparece en otro estado.
SUP_3: Si un cerrado se puede volver a abrir, y con qué acción.
SUP_4: Si el cierre queda en auditoría y con qué datos (REF CU 51).
SUP_5: Si para cerrar ya tienen que estar cargados el número de reclamo y el link.

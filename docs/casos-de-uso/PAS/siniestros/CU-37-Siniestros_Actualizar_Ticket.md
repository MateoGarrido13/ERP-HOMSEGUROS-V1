## CU-37-Siniestros_Actualizar_Ticket
*Actor principal:* PAS
*Actor secundario:* Administrativo
*Precondiciones:* Hay un siniestro registrado (REF CU-36-Siniestros_Registrar). Quien actualiza tiene la sesión abierta (REF CU-01-Acceso_Iniciar_Sesion). Hay conexión.
*Disparador:* Completar o corregir el ticket

*Flujo principal*
1. El PAS o el administrativo abre el siniestro para actualizarlo (*ALT ADMINISTRATIVO)
2. Actualiza uno o más de estos datos: estado, documentación, número de reclamo, mails, derivación y links. El estado de este paso no es "Cerrado"
3. El número de reclamo y el link son la referencia que el alta dejó pendiente. Se completan en este paso
4. La lista muestra el estado que quedó (REF CU-34-Siniestros_Ver_Lista)

*Flujos alternativos*

`1. El PAS o el administrativo abre el siniestro`
1.1. Lo abre el administrativo
1.2. La ruta "Siniestros" del prototipo no le corresponde: si entra ahí, el sistema lo lleva a "Red" (REF CU-34-Siniestros_Ver_Lista)
1.3. Desde qué pantalla hace esta actualización no está definido
1.4. **FIN**

*Postcondiciones*
1. Los datos guardados quedan en el ticket
2. El estado no pasa a "Cerrado" por este caso
3. Número de reclamo y link, si se guardaron, quedan como referencia del ticket

*Reglas de negocio asociadas*
RN_1: Actualizan el PAS y el administrativo. El directivo no entra en este caso.
RN_2: El prototipo no ofrece editar. Esta acción no está en la maqueta.
RN_3: Los datos nombrados para el ticket son estado, documentación, número de reclamo, mails, derivación y links.
RN_4: La referencia del alta es el número de reclamo y un link, los dos. No alcanza con uno para darla por completa.
RN_5: El ticket nace en "En gestión", sin ese número ni ese link (REF CU-36-Siniestros_Registrar).
RN_6: Pasar el estado a "Cerrado" es el cierre y lo hace solo el PAS (REF CU-38-Siniestros_Cerrar). No es una actualización.
RN_7: Comentario y contactos se consultan en el detalle. Esta pantalla no los edita (REF CU-35-Siniestros_Ver_Detalle).
RN_8: Los estados de la lista son "En gestión", "Documentación pendiente" y "Cerrado" (REF CU-34-Siniestros_Ver_Lista).

*Supuestos a confirmar*
SUP_1: Si actualizar también incluye el comentario y los contactos.
SUP_2: En qué momento el estado pasa a "Documentación pendiente", y si desde ahí vuelve a "En gestión".
SUP_3: Qué es "documentación": archivos en el ticket, una marca de pendiente, o las dos.
SUP_4: Qué se guarda en "mails" y en "derivación", y qué es el link (una URL, y de qué).
SUP_5: Desde qué pantalla actualiza el administrativo. No es la ruta "Siniestros" del PAS. Consultar la red y seguir siniestros de back-office son otros casos (REF CU 50, CU 54) y no describen esta edición.
SUP_6: Si un cambio de estos datos queda en auditoría y con qué datos (REF CU 51).
SUP_7: Si hace falta el número de reclamo, el link, o los dos, para salir de un estado. No está escrito.

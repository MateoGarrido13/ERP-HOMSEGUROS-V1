## CU-36-Siniestros_Registrar
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene la sesión abierta (REF CU-01-Acceso_Iniciar_Sesion). Hay conexión.
*Disparador:* Dejar asentado un siniestro en el sistema

*Flujo principal*
1. El PAS abre "Siniestros" (REF CU-34-Siniestros_Ver_Lista)
2. El PAS inicia el registro. El prototipo no tiene este control y su nombre no está definido
3. El PAS carga la denuncia y los adjuntos
4. El sistema crea el ticket en estado "En gestión", pendiente del número de reclamo y de un link
5. El siniestro queda en la lista de ese PAS, con el estado "En gestión"
6. El sistema registra quién lo cargó (REF CU 51, RNF03)

*Flujos alternativos*

No hay otro camino definido.

*Postcondiciones*
1. Queda un ticket interno con la denuncia y los adjuntos, en estado "En gestión"
2. Todavía no tiene número de reclamo ni link
3. El siniestro se ve en la lista del PAS que lo cargó
4. La denuncia no se carga en el portal de la aseguradora

*Reglas de negocio asociadas*
RN_1: El alta la hace el PAS. No la hace el administrativo ni el directivo en este caso.
RN_2: Manda el presupuesto, RF03: registro interno, captura de denuncia y adjuntos, ticket de siniestro pendiente de referencia. Es MVP.
RN_3: La frase de `ENTREVISTAS HOM SEGUROS.md` ("No se cargan siniestros desde el sistema, me guardo la referencia.") no manda en este caso.
RN_4: `design/asesoramiento_diseno.md` ubica el registro como visión y no MVP. Tampoco manda: el alta entra por el RF03.
RN_5: El expediente con OCR está fuera del contrato. No forma parte de esta captura.
RN_6: Cargar la denuncia en el portal de la aseguradora está fuera del contrato. Este caso no lo hace.
RN_7: La lista, cuando el siniestro ya existe, muestra cliente, ramo, compañía, fecha de alta y estado (REF CU-34-Siniestros_Ver_Lista). El detalle muestra comentario y contactos (REF CU-35-Siniestros_Ver_Detalle). Esos datos no están pedidos en el paso 3.
RN_8: Al crearlo, la etiqueta de la lista es "En gestión".
RN_9: "Pendiente de referencia" no es una etiqueta. Quiere decir que el ticket todavía no tiene número de reclamo ni link. Esos dos se cargan al actualizar (REF CU-37-Siniestros_Actualizar_Ticket).

*Supuestos a confirmar*
SUP_1: Cómo se llama el control y en qué parte de "Siniestros" está. El prototipo no lo tiene.
SUP_2: Si el alta exige una póliza de la cartera de ese PAS.
SUP_3: Si la denuncia, los adjuntos, o los dos, pueden faltar.
SUP_4: Qué otros datos son obligatorios en el alta. Cliente, ramo, compañía, comentario y contactos se ven después y no está dicho si se cargan acá o en la actualización (REF CU-37-Siniestros_Actualizar_Ticket).
SUP_5: Qué más se guarda en la auditoría, además de quién lo cargó (REF CU 51).
SUP_6: Qué pasa si el PAS abandona el alta antes de confirmarla. No hay confirmación definida.

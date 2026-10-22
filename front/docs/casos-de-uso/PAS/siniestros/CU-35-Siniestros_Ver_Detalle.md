## CU-35-Siniestros_Ver_Detalle
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS está en la lista de siniestros (REF CU-34-Siniestros_Ver_Lista). Hay conexión.
*Disparador:* Consultar el comentario y los contactos de un siniestro

*Flujo principal*
1. El PAS selecciona una tarjeta de la lista
2. El sistema despliega el detalle debajo de esa tarjeta. Si había otro detalle abierto, lo oculta
3. El detalle muestra el título "COMENTARIO", el texto fijo "Lo declarado por el cliente, cargado por el PAS." y el comentario
4. El detalle muestra el título "CONTACTOS" y, por cada contacto, el nombre, el teléfono y el rol
5. El teléfono es un enlace `tel:`
6. El PAS vuelve a seleccionar la misma tarjeta
7. El sistema oculta el detalle. La tarjeta sigue en la lista

*Flujos alternativos*

No hay otro camino en el prototipo.

*Postcondiciones*
1. Consultar o cerrar el detalle no modifica el siniestro, el comentario ni los contactos
2. Queda desplegado un solo detalle a la vez, o ninguno si el PAS cerró el que estaba abierto

*Reglas de negocio asociadas*
RN_1: El detalle de esta pantalla es el comentario y los contactos. No muestra número de reclamo, documentación, mails, derivación ni links. Esos datos están nombrados en el caso 37 y no están en la maqueta (REF CU-37-Siniestros_Actualizar_Ticket).
RN_2: El texto fijo encima del comentario es "Lo declarado por el cliente, cargado por el PAS."
RN_3: Cada contacto del prototipo tiene rol, nombre y teléfono. Los roles que aparecen son "Gestor asignado" y "Estudio liquidador". Hortensia nombra esos dos contactos en la entrevista.
RN_4: El teléfono se muestra como enlace `tel:`. Esta pantalla no abre WhatsApp.
RN_5: El detalle se cierra volviendo a seleccionar la tarjeta. Seleccionar el bloque del detalle no lo cierra.
RN_6: Seleccionar otra tarjeta cierra la que estaba abierta y abre la nueva.
RN_7: Ver el detalle no cambia el estado.

*Supuestos a confirmar*
SUP_1: Si el comentario o los contactos pueden no estar, y qué se muestra en ese caso. El prototipo siempre trae comentario y dos contactos.
SUP_2: Si el rol es un catálogo cerrado ("Gestor asignado" y "Estudio liquidador") o un texto libre.
SUP_3: Si desde el teléfono se espera solo el enlace `tel:`, o también copiar el número o abrir WhatsApp.
SUP_4: Si este detalle se abre también desde la ficha del cliente. El historial de la ficha no define siniestros (REF CU-25-Cartera_Ver_Ficha_Cliente, SUP_1).

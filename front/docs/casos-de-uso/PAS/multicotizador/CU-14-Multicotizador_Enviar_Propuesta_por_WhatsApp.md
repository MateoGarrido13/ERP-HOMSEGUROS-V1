## CU-14-Multicotizador_Enviar_Propuesta_por_WhatsApp
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene una propuesta generada en estado "Generada", con su PDF y el cliente asociado (REF CU-13-Multicotizador_Armar_Propuesta_y_Generar_PDF). Hay conexión.
*Disparador:* Enviar la propuesta generada al cliente

*Flujo principal*
1. El sistema muestra la propuesta generada y ofrece "Enviar a [nombre del cliente]" (REF CU-13)
2. El PAS selecciona "Enviar a [nombre del cliente]"
3. El sistema arma un mensaje predefinido con el nombre del cliente y lo deja listo para compartir (*ALT CLIENTE SIN NOMBRE)
4. El sistema abre el selector para compartir del dispositivo con el mensaje y el PDF de la propuesta (*ALT COMPARTIR NO DISPONIBLE, *ALT PAS CANCELA)
5. El PAS elige WhatsApp y selecciona el contacto o número del cliente
6. El PAS confirma el envío desde WhatsApp
7. El sistema marca la propuesta como "Enviada", con fecha y hora
8. El sistema persiste al cliente con `activa=false` si todavía no estaba en Cartera, publica el aviso Cotización enviada (REF CU-05d) y muestra la confirmación. El seguimiento sigue en Pendientes, no en Cartera (REF CU-16)

*Flujos alternativos*

`3. El sistema arma el mensaje`
3a.1. El cliente de la cotización no tiene un nombre cargado
3a.2. El sistema usa un saludo genérico ("Hola") en lugar del nombre
3a.3. **IR A (4)**

`4. El sistema abre el selector para compartir`
4a.1. El dispositivo o navegador del PAS no tiene disponible la función de compartir
4a.2. El sistema no abre ningún selector y deja visible el mensaje armado para que el PAS lo copie a mano
4a.3. **FIN**

`4b. El PAS cancela el selector para compartir`
4b.1. El PAS cierra el selector sin elegir ninguna aplicación
4b.2. El sistema no modifica el estado de la propuesta, que sigue "Generada"
4b.3. **FIN**

`5. El PAS elige WhatsApp y el contacto`
5a.1. El cliente no tiene un número de teléfono cargado
5a.2. El sistema deja que el PAS elija el contacto a mano desde WhatsApp, sin preseleccionar ninguno
5a.3. **IR A (6)**

*Postcondiciones*
1. Si el PAS completó el envío desde WhatsApp, la propuesta queda en estado "Enviada", con fecha y hora de envío
2. Si el PAS canceló el selector para compartir o no pudo completar el envío, la propuesta sigue en estado "Generada" (REF CU-13)
3. El PDF y los datos de la cotización no se modifican por el envío
4. No se contactó a ninguna compañía ni se emitió ninguna póliza
5. El cliente nuevo queda persistido con `activa=false` y no se muestra en Cartera

*Reglas de negocio asociadas*
RN_1: Solo se puede enviar una propuesta que ya está "Generada" (REF CU-13). No existe un envío sin PDF generado.
RN_2: El envío usa el mecanismo para compartir del dispositivo del PAS; el sistema no manda el mensaje por sí mismo ni se conecta directo a una cuenta de WhatsApp.
RN_3: El mensaje predefinido es fijo, con el nombre del cliente cuando está disponible. El PAS no lo edita desde este caso.
RN_4: El sistema no puede confirmar que el cliente recibió o abrió el mensaje; "Enviada" refleja que el PAS completó el paso de compartir desde su dispositivo, no una confirmación de entrega.
RN_5: Esta acción se audita: cotización, PAS y fecha de envío (REF CU 51).
RN_6: Una propuesta puede reenviarse más de una vez; cada envío repite este caso sin generar una propuesta nueva.
RN_7: El primer envío persiste al cliente nuevo con `activa=false`. No lo muestra en Cartera. El alta visible es CU-16 desde Pendientes. El prototipo ofrece «Ver cartera» en `/cotizar/enviado` (desalineado; REF `specs/as-built-prototipo-iteracion-1.md`).

*Supuestos a confirmar*
SUP_1: Si el PDF se adjunta al mensaje de WhatsApp o si el PAS lo adjunta a mano desde su dispositivo. El prototipo comparte el texto del mensaje y no adjunta el PDF.
SUP_2: Si "Enviada" debe esperar alguna confirmación del lado de WhatsApp (por ejemplo, vía una integración de mensajería) en vez de asumirse apenas el PAS completa el selector para compartir (REF RN_4).
SUP_3: Qué pasa si el PAS no tiene WhatsApp instalado en el dispositivo pero sí otras apps para compartir: si puede elegir otra vía (email, SMS) y la propuesta queda igual "Enviada".
SUP_4: Si el reenvío de una propuesta ya enviada deja un registro de cada envío o solo de la fecha del último (REF RN_6).
SUP_5: Qué pasa con una propuesta "Enviada" que nunca recibe respuesta del cliente: si vence sola después de un tiempo (REF CU-15, CU-13 SUP_4).

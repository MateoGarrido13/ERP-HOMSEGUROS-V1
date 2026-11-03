## TRANSICIONES DE AVISOS 

AVISO CUMPLEANOS: 
1.(00:00hs del dia del cumpleanos) APARECE AVISO COMO 'PENDIENTE', EN el titulo solo dice "Cumpleanos" y la fecha. Npmbre y apellido del cliente, Que cobertiura,en que seguro

2.a(HORARIO DENTRO DEL DIA DEL CUMPLEANOS) EL PAS ENVIA WHATSAPP/ Toca en 'Resolver' y 'Confirmar' el aviso "se resuelve"(se registra en auditoria 'Resuleto por el PAS')
2.b(00:00hs del dia siguiente) EL PAS no envio el mensaje pero el aviso "se resuelve automaticamnete"(se registra en auditoria 'Resuleto por Vencimiento')

AVISO PAGO RECHAZADO: ESTE CASO LO DOCUMENTAREMOS CON '(*)ATENCION:no confirmado' falta charlarlo con el cliente
1.(Lo carga la administrativa, registra pago rechazado) APARECE AVISO COMO 'PENDIENTE'
2. El PAS Selecciona 'Resolver' o 'Enviar Whatsapp' ENVIANDO EL MENSAJE POR WHATSAPP AL CLIENTE, pasara a 'Esperando respuesta cliente', este paso supone que se envio el mensaje 
3. El PAS SELECCIONA 'RESOLVER' y 'Confirmar', asi el aviso deja de visualizarse en pendientes  (se registra en auditoria 'Resuleto por el PAS'), este paso supone que el cliente pago y respondio el mensaje 
(*) De lo contrario el AVISO PERSISTE EN PENDIENTES hasta que el cliente cambie su estado


AVISO COTIZACION ENVIADA:
1.(EL PAS GENERO UNA COTIZACION Y envio su PDF por Whatsapp, en  la seccion 'COTIZAR'), automaticamente el seleccionar 'Generar pdf y enviar'-->'Enviar'--> se registra a ese cliente en 'PENDIENTES' con este aviso. El mismo aviso nace si el PAS reactiva un lead que ya tenía propuesta enviada (REF CU-08b-Pendientes_Reactivar_Lead); el lead sale de Leads. El alta en Cartera no es de este paso: es 2.a.

2.a (El cliente confirma la cotizacion y se lo da de alta en una compania),EL pas selecciona 'Resolver', 'Dar de alta'. El aviso ya no se mostrara en pendientes y se lo empieza a considerar a ese cliente en 'CARTERA', implica modificaciones en la BD para cambiar el estado de ese cliente, se lo asocia a un codigo de productor.

2.b (El cliente rechaza la porpuesta) El PAS selecciona 'Resolver','Lead'. Se le solicita una descripcion al PAS sobre porque el cliente rechazo la propuesta (campo opcional), EL aviso pasa a mostrarse en Lead, con datos cliente, que queria asegurar, que montos se le ofecieron, fecha que respondio negativamente(que paso de PENDIENTES A Lead)

AVISO ENVIAR CUPON (CONSORCIO):
1.(La compañía ya emitió la póliza de vigencia anual) APARECE AVISO COMO 'PENDIENTE', tipo "Enviar cupón". Muestra el edificio, el ramo Consorcio, la póliza y la fecha del próximo cobro mensual. El contacto del administrador está en el detalle de esa póliza vigente, en Cartera.
2.(El PAS envía el cupón por WhatsApp al administrador) El aviso NO sale de Pendientes. Queda el mensaje de esa póliza, asociada al edificio, en estado 'COBRO PENDIENTE'. Ejemplo: edificio "TORRES IV", póliza 330418.

AVISO ENVIAR POLIZA:
1.(5 dias antes del proximo vencimiento), El aviso es cargado en 'PENDIENTES', muestra nombre y apellido del cliente , tipo de poliza y en que compania, la fecha de vencimiento de la poliza (o del cupon a pagar)
2.el PAS seleccione 'RESOLVER'-->'CONFIRMAR' o 'ENVIAR WHATSAPP' con el template del mensaje, el aviso deja de mostrarse en la vista

ACLARACION: Es un proceso periodico y mensual; ejemplo: "todos los 21 vence la poliza de Jorge que tiene automotor en Sancor Seguros", por lo tanto se muestra este aviso desde el 16 hasta que el PAS CONFIRME(RESOLVER y CONFIRMAR o ENVIAR POR WHATSAPP)


*CU-Multicotizador-01-Cotizar_Automotor*
*Actor principal :*PAS
*Actores secundarios:*API   Sancor seguros, middleware 
*Disparador:*Cotizar un automotor 
*Precondiciones:*El productor está logeado, con conexión a wifi 

*Fujo principal*
1. El sistema ofrece la sección de “cotizar” para exponer según que ramo se desea cotizar 
2. El productor selecciona el ramo (automotor)
3. El productor carga `PATENTE`,`CP`,`Uso`
4. El sistema consulta la API de Info Autos y auto-completa: Marca,Modelo,Ano (*ALT DEFAULT)
5 El sistema expone el formulario correspondiente para recaudar la información necesaria antes de consultar a los middlewares/compañias y asi chequear los campos autocompletados
6. El productor carga la información sobre ¿qué se va a asegurar?y selecciona “continuar” 
7. El productor selecciona si la propuesta sera para un cliente existente o si se requiere dar de alta a un nuevo cliente (*ALT CLIENTE EXISTENTE)
8. El productor carga información de  `quien lo asegura?`,`en qué localidad se asegura?`(REF A OTRO CU,dara de alta en db, verifica campos,etc)
9. El sistema almacena temporalmente los datos de la consulta 
10.El sistema recopila la información y envía las consultas en paralelo/ consulta al middleware 
11.API externa responde en formato JSON/ HTML REQUEST(entrega promise) (*ALT:DEFAULT)
12. El sistema procesa la informacion validando los inpur y exponiendo las distintas companias, para seleccionar las que el productor considere : [(compania_1-tipo_1),(compania_2-tipo_1)]
13. El productor selecciona 1 o mas companias-tipo y selecciona "continuar"
14. Se genera un PDF con la propuesta (REF A OTRO CU QUE GENERA PDF DE PRESUPUESTOS)
15. El productor envia via mail/WHatsapp la propuesta al cliente

*Flujos ALternativos*

`4. El sistema consulta la API de Info Autos y auto-completa: Marca,Modelo,Ano `
4.1. La API de Info Autos excede el timmer y no responde
4.2 El sistema avanza con el formulario en blanco sin autocompletar
4.3 **IR A (5)**

`11.API externa responde en formato JSON/ HTML REQUEST(entrega promise) `
11.1.API externa no responde/excede el timmer 
11.2.El sistema se trae una referencia a un precio por defaukt para la suma asegurada
11.3.**IR A (12)**

`7. El productor selecciona si la propuesta sera para un cliente existente o si se requiere dar de alta a un nuevo cliente `
7.1. El productor selecciona 'Cliente existente'
7.2. El Sistemas busca en la db, y despliega todos sus clientrtes ya cargados
7.3. EL productor selecciona un cliente existente 
7.4. **IR A (9)**

*Post-Condiciones*
1. SI LA COTIZACION ERA PARA UN NUEVO USUARIO, SE LO REGISTRO EN LA BD
2. AL GENERAR EL PDF YA FIGURARA EN 'PENDIENTES' EL ENVIO DE ESTA PROPUESTA A CONFIRMAR CON LA FECHA QUE SE EMITIO

*Reglas de Negocio Asociadas*
RN_1:Solo un PAS autenticado puede cotizar, y la cotización queda asociada a ese productor.
RN_2:Para consultar compañías hace falta patente, código postal y uso. Sin esos tres datos el flujo no avanza.
RN_3:Marca, modelo y año salen de Info Autos. Si esa consulta no responde, el PAS completa el vehículo a mano y la cotización sigue.
RN_4:Un cliente existente se reutiliza. Un cliente nuevo se da de alta una sola vez en este flujo y no se duplica si el documento ya existe.
RN_5:El PAS elige una o más combinaciones compañía–cobertura. La propuesta se arma solo con esa selección.
RN_6:Este caso genera una propuesta. No emite la póliza ni le asigna número de póliza.
RN_7: QUeda registrado en auditoria, la emision de esta propuesta[ id_propuesta,id_productor,fecha]


*Supuestos a Confirmar*
SUP_1: LAs distintas aseguradoras nos daran acceso a su Web Service de 'cotizar'
SUP_2: Info Autos es capaz de a partir de una patente traerme Ano,Modelo,Marca
SUP_3: Dos vehiculos que tienen la misma Suma asegurada, en la misma localidad, ytendran un precio similar 
SUP_4: Para todo automotor el Web Service de la compania nos ofrece una alternativa(min:Terceros)

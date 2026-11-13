## CU-10-Multicotizador_Seleccionar_o_Crear_Cliente
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene una cotización abierta en un ramo habilitado (REF CU-09-Multicotizador_Elegir_Ramo). Hay conexión.
*Disparador:* Indicar a quién se asegura

*Flujo principal*
1. El sistema muestra "Datos del asegurado" y pregunta "¿A quién querés asegurar?", con las opciones "Nuevo cliente" y "Cliente existente" (*ALT VOLVER AL RAMO, *ALT CLIENTE PRESELECCIONADO, *ALT LEAD)
2. El PAS selecciona "Nuevo cliente" (*ALT CLIENTE EXISTENTE)
3. El sistema muestra el formulario: tipo y número de documento, nombre y apellido (o razón social si el documento es CUIT), email, número de teléfono y comentarios
4. El PAS completa los datos y selecciona "Cotizar ahora" (*ALT VOLVER)
5. El sistema valida los campos y verifica que el documento no pertenezca a otro cliente (*ALT DATOS INVALIDOS, *ALT DOCUMENTO YA EXISTE)
6. El sistema asocia a la cotización los datos del cliente, sin incorporarlo todavía a la cartera
7. El sistema sigue con la carga del riesgo del ramo: Automotor (REF CU-17) o Hogar, Consorcio o Comercio (REF CU-17b)

*Flujos alternativos*

Los bloques 1a, 1b y 1c salen del paso 1. El 1a es una decisión del PAS ante la pregunta. El 1b y el 1c son formas de llegar al caso con el cliente ya definido o con sus datos de contacto, y reemplazan la pregunta.

`1a. El PAS vuelve a la pantalla anterior`
1a.1. El PAS vuelve atrás sin haber elegido un cliente
1a.2. Si el PAS pasó por el selector, el sistema muestra "Elegí la cobertura" (REF CU-09-Multicotizador_Elegir_Ramo). Si el ramo llegó ya definido por un lead o una póliza (REF CU-09 RN_7), el sistema lo lleva al origen (Pendientes o la ficha del cliente) y no ofrece cambiar de ramo (REF CU-09 SUP_6)
1a.3. El sistema descarta la cotización en curso no enviada: no se conserva el ramo ni el cliente. Al elegir un ramo, el PAS empieza de cero (REF CU-09 SUP_5). La cotización queda sin cliente asociado
1a.4. **FIN**

`1b. El PAS llega con un cliente ya seleccionado`
1b.1. El PAS llegó desde la ficha de un cliente (REF CU-23-Cartera_Dar_de_Alta_Cliente), desde la re-cotización de una póliza (REF CU 11) o desde un lead cuyo cliente ya está en la cartera (REF CU-08d-Lead_Enviar_Cotizacion)
1b.2. El sistema muestra los datos de ese cliente, sin hacer la pregunta del paso 1
1b.3. El PAS confirma ese cliente (*ALT OTRO CLIENTE)
1b.4. El sistema asocia ese cliente a la cotización
1b.5. **IR A (7)**

`1b.3. El PAS elige otro cliente`
1b.3.1. El sistema deja de usar el cliente preseleccionado
1b.3.2. **IR A (1)**

`1c. El PAS llega desde un lead que todavía no está en la cartera`
1c.1. El sistema abre el formulario de "Nuevo cliente" con los datos de contacto del lead ya cargados (REF CU-08d-Lead_Enviar_Cotizacion)
1c.2. **IR A (4)**

`2. El PAS elige un cliente existente`
2.1. El sistema muestra "Elegí el cliente" con los clientes almacenados del PAS, estén en Cartera, solo en Leads o en ninguna de las dos vistas: nombre y, por cada uno, el ramo y la localidad de su póliza, o la cantidad de pólizas si tiene más de una (*ALT SIN CLIENTES, *ALT CAMBIAR A CLIENTE NUEVO)
2.2. El PAS selecciona un cliente
2.3. El sistema carga los datos de ese cliente en la cotización
2.4. **IR A (7)**

`2.1a. El sistema no muestra clientes existentes`
2.1a.1. El PAS no tiene ningún cliente almacenado
2.1a.2. El PAS selecciona "Nuevo cliente"
2.1a.3. **IR A (3)**

`2.1b. El PAS elige un cliente nuevo`
2.1b.1. El PAS cambia de idea y selecciona "Nuevo cliente"
2.1b.2. **IR A (3)**

`4. El PAS selecciona "Volver"`
4.1. El sistema descarta lo que el PAS había escrito en el formulario
4.2. **IR A (1)**

`5a. El sistema valida los campos`
5a.1. Falta un dato obligatorio, el email no es válido, el teléfono tiene menos de 8 números o el documento informado no tiene la longitud de su tipo (DNI: 7 u 8 números; CUIT: 11 números)
5a.2. El sistema marca cada campo inválido, conserva lo escrito y no avanza
5a.3. **IR A (4)**

`5b. El sistema verifica que el DNI informado no pertenezca a otro cliente`
5b.1. El DNI corresponde a un cliente de este PAS (en Cartera, solo en Leads o persistido con `activa=false`)
5b.2. El sistema informa la coincidencia y muestra ese cliente
5b.3. El PAS elige usar ese cliente (*ALT CORREGIR DNI, *ALT OTRO PAS)
5b.4. El sistema asocia ese cliente a la cotización y no crea otro registro
5b.5. **IR A (7)**

`5b.3. El PAS elige corregir el DNI`
5b.3.1. El PAS modifica el DNI
5b.3.2. **IR A (4)**

`5c. El DNI pertenece a un cliente de otro PAS`
5c.1. El documento ya está asociado a otro productor de la red
5c.2. El sistema informa que el asegurado ya está asociado a otro productor. No muestra ficha, nombre ni datos de contacto
5c.3. El sistema no asocia el cliente ni permite cotizarlo
5c.4. El PAS corrige el DNI o abandona
5c.5. **IR A (4)**

*Postcondiciones*
1. La cotización en curso queda asociada a un cliente: uno existente, o uno nuevo con los datos cargados
2. Si el cliente es nuevo, sus datos quedan en la cotización. No se muestra en Cartera hasta CU-16 (`activa=true`). El envío de la propuesta (CU-14) lo persiste con `activa=false` (REF CU-23)
3. Si el cliente ya existía, no se duplicó ni se modificó
4. Si el PAS volvió sin elegir cliente o sin completar el formulario, la cotización no tiene cliente asociado
5. El riesgo todavía no está cargado

*Reglas de negocio asociadas*
RN_1: Toda cotización tiene un cliente asegurado antes de consultar a las compañías o enviar la solicitud.
RN_2: Un asegurado está asociado a un solo PAS a la vez. El documento es único en la red. Si ya existe en este PAS, se reutiliza (también con `activa=false`). Si existe en otro PAS, se avisa sin mostrar datos y no se cotiza (*ALT 5c). Formulación canónica de unicidad; CU-23 y CU-24 REF esta regla.
RN_3: El cliente puede ser persona física o jurídica (iteración 1). Si el tipo de documento es CUIT, el formulario pide un único campo "Razón social" (al menos 2 caracteres) en lugar de nombre y apellido; en cualquier otro caso pide nombre y apellido. Obligatorios: tipo y número de documento, nombre y apellido (o razón social), email válido y teléfono con al menos 8 números. El documento es obligatorio (REF cuestiones A5) y se valida según su tipo: DNI de 7 u 8 números, CUIT de 11. Los comentarios son opcionales.
RN_4: El PAS elige entre los clientes almacenados de su cartera. Entran los que Cartera ya no muestra, incluidos los que solo figuran en Leads y los que tampoco figuran ahí. Leads es la última vista del PAS; no estar en Leads no los saca de esta lista (REF transicion-estados-bien.md).
RN_9: Una vez enviada una cotización, el cliente se conserva en la base hasta que un administrativo lo borre. Ninguna operación del PAS lo elimina: solo deja de mostrarlo en sus vistas.
RN_5: Un cliente nuevo se persiste con `activa=false` al enviar la propuesta (REF CU-14). Se muestra en Cartera (`activa=true`) solo al registrar la póliza emitida desde Pendientes (REF CU-16, CU-23).
RN_6: Este caso no modifica los datos de un cliente existente. Eso se hace en su ficha (REF CU-24-Cartera_Editar_Cliente). Si al cliente elegido le faltan email o teléfono, no se le piden acá: se cotiza igual y el faltante se resuelve al enviar la propuesta (REF CU-14, paso 5, sin teléfono el PAS elige el contacto a mano).
RN_7: Elegir o cargar un cliente en la cotización no se audita, porque todavía no cambia la cartera. La incorporación sí (REF CU-23-Cartera_Dar_de_Alta_Cliente, CU 51).
RN_8: Este caso es el mismo para los ramos habilitados de la iteración 1 (Automotor, Hogar, Consorcio, Comercio). El paso siguiente es cargar el riesgo: CU-17 (Automotor) o CU-17b (los otros tres). No sigue CU-18 ni CU-21.

*Supuestos a confirmar*
SUP_1: Qué datos del titular exigen las compañías para cotizar (DNI o CUIT, fecha de nacimiento, otros). El documento ya es obligatorio para todos los clientes (REF RN_3, cuestiones A5). Falta confirmar qué otros datos del titular piden las compañías (fecha de nacimiento, otros).
SUP_2: Resuelto en lo funcional (REF RN_6, cuestiones A4): si al cliente existente le faltan email o teléfono, se cotiza igual y no se completan en este caso. Pendiente: el prototipo solo trae nombre y apellido al elegir un cliente; debería traer también email, teléfono y documento, que el envío de la propuesta necesita (REF CU 14).
SUP_3: Resuelto. DNI de otro PAS: aviso sin datos, no se cotiza (REF RN_2, *ALT 5c).
SUP_4: Si el asegurado y el tomador son siempre la misma persona. El modelo de negocio los distingue y la propuesta nombra al tomador (REF CU 13).
SUP_5: Resuelto en lo funcional (REF RN_3, cuestiones A3): la persona jurídica se carga con tipo de documento CUIT y un campo "Razón social". Alineados CU-23 y CU-24 y la validación de longitud por tipo de documento (paso 5a). Cómo cada API pide la razón social va en las specs de adapter.
SUP_6: Si la lista de clientes existentes tiene búsqueda por nombre o DNI, como la de Cartera (REF CU-22-Cartera_Buscar_y_Filtrar_Clientes). El prototipo no la tiene.
SUP_7: El caso en el que el administrativo borra al cliente de la base no está escrito. Hasta ese borrado, el PAS no puede hacerlo desaparecer (REF RN_9).
SUP_8: Si, al usar un cliente existente por DNI duplicado, los datos que el PAS tipeó (email, teléfono) se descartan o se ofrece actualizarlos (REF CU-24-Cartera_Editar_Cliente).
SUP_9: Resuelto para iteración 1 (REF 1a.3, cuestiones B3). Al volver al ramo la cotización se descarta y no se conserva el ramo elegido. Conservarla es CU-12, diferido.
SUP_10: Resuelto. Orden canónico: ramo → cliente → riesgo. El prototipo (automotor salta a comparar sin este caso; par riesgo→asegurado huérfano) queda desalineado (REF `docs/specs/as-built-prototipo-iteracion-1.md`).

### Que se agrego?

- La llegada desde un lead apunta a `CU-08d-Lead_Enviar_Cotizacion`. Se mantiene la llegada desde la recotización de una póliza (REF CU 11), que `main` había sacado del paso 1b.
- "Elegí el cliente" lista los clientes almacenados del PAS, estén en Cartera, solo en Leads o en ninguna de las dos vistas. Si no hay ninguno almacenado, el PAS pasa a "Nuevo cliente".
- RN_2: documento único en la red; un asegurado ↔ un PAS.
- RN_4: entran los que Cartera ya no muestra, incluidos los que solo figuran en Leads y los que tampoco figuran ahí. Leads es la última vista del PAS; no estar en Leads no los saca de esta lista.
- RN_9: una vez enviada una cotización, el cliente se conserva en la base hasta que un administrativo lo borre. Ninguna operación del PAS lo elimina.
- SUP_7: el caso en el que el administrativo borra al cliente no está escrito. Hasta ese borrado, el PAS no puede hacerlo desaparecer.

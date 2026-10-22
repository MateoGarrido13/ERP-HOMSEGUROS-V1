## CU-10-Multicotizador_Seleccionar_o_Crear_Cliente
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene una cotización abierta en un ramo habilitado (REF CU-09-Multicotizador_Elegir_Ramo). Hay conexión.
*Disparador:* Indicar a quién se asegura

*Flujo principal*
1. El sistema muestra "Datos del asegurado" y pregunta "¿A quién querés asegurar?", con las opciones "Nuevo cliente" y "Cliente existente" (*ALT VOLVER AL RAMO, *ALT CLIENTE PRESELECCIONADO, *ALT LEAD)
2. El PAS selecciona "Nuevo cliente" (*ALT CLIENTE EXISTENTE)
3. El sistema muestra el formulario: nombre, apellido, email, número de teléfono, DNI y comentarios
4. El PAS completa los datos y selecciona "Cotizar ahora" (*ALT VOLVER)
5. El sistema valida los campos y, si el PAS informó DNI, verifica que no pertenezca a otro cliente (*ALT DATOS INVALIDOS, *ALT DOCUMENTO YA EXISTE)
6. El sistema asocia a la cotización los datos del cliente, sin incorporarlo todavía a la cartera
7. El sistema sigue con la carga del riesgo del ramo: la del riesgo a cotizar si es masivo (REF CU 17) o la de la solicitud si es no masivo (REF CU 21)

*Flujos alternativos*

Los bloques 1a, 1b y 1c salen del paso 1. El 1a es una decisión del PAS ante la pregunta. El 1b y el 1c son formas de llegar al caso con el cliente ya definido o con sus datos de contacto, y reemplazan la pregunta.

`1a. El PAS vuelve a la pantalla anterior`
1a.1. El PAS vuelve atrás sin haber elegido un cliente
1a.2. El sistema muestra "Elegí la cobertura" (REF CU-09-Multicotizador_Elegir_Ramo)
1a.3. La cotización no tiene cliente asociado
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
5a.1. Falta un dato obligatorio, el email no es válido, el teléfono tiene menos de 8 números o el DNI informado no tiene 7 u 8 números
5a.2. El sistema marca cada campo inválido, conserva lo escrito y no avanza
5a.3. **IR A (4)**

`5b. El sistema verifica que el DNI informado no pertenezca a otro cliente`
5b.1. El DNI corresponde a un cliente de la cartera del PAS
5b.2. El sistema informa la coincidencia y muestra ese cliente
5b.3. El PAS elige usar ese cliente (*ALT CORREGIR DNI)
5b.4. El sistema asocia ese cliente a la cotización y no crea otro registro
5b.5. **IR A (7)**

`5b.3. El PAS elige corregir el DNI`
5b.3.1. El PAS modifica el DNI
5b.3.2. **IR A (4)**

*Postcondiciones*
1. La cotización en curso queda asociada a un cliente: uno existente, o uno nuevo con los datos cargados
2. Si el cliente es nuevo, sus datos quedan en la cotización. No integra la cartera hasta que quede asociada una cobertura o póliza (REF CU-23-Cartera_Dar_de_Alta_Cliente)
3. Si el cliente ya existía, no se duplicó ni se modificó
4. Si el PAS volvió sin elegir cliente o sin completar el formulario, la cotización no tiene cliente asociado
5. El riesgo todavía no está cargado

*Reglas de negocio asociadas*
RN_1: Toda cotización tiene un cliente asegurado antes de consultar a las compañías o enviar la solicitud.
RN_2: Un cliente existente se reutiliza. No se da de alta de nuevo si el documento ya existe, aunque Cartera y Leads ya no lo muestren (REF CU-23-Cartera_Dar_de_Alta_Cliente).
RN_3: Obligatorios: nombre y apellido (al menos 2 caracteres), email válido y teléfono con al menos 8 números. El DNI es opcional y, si se informa, tiene 7 u 8 números. Los comentarios son opcionales.
RN_4: El PAS elige entre los clientes almacenados de su cartera. Entran los que Cartera ya no muestra, incluidos los que solo figuran en Leads y los que tampoco figuran ahí. Leads es la última vista del PAS; no estar en Leads no los saca de esta lista (REF transicion-estados-bien.md).
RN_9: Una vez enviada una cotización, el cliente se conserva en la base hasta que un administrativo lo borre. Ninguna operación del PAS lo elimina: solo deja de mostrarlo en sus vistas.
RN_5: Un cliente nuevo se incorpora a la cartera solo si queda asociada una cobertura o póliza, vigente o no (REF CU-23-Cartera_Dar_de_Alta_Cliente).
RN_6: Este caso no modifica los datos de un cliente existente. Eso se hace en su ficha (REF CU-24-Cartera_Editar_Cliente).
RN_7: Elegir o cargar un cliente en la cotización no se audita, porque todavía no cambia la cartera. La incorporación sí (REF CU-23-Cartera_Dar_de_Alta_Cliente, CU 51).
RN_8: Este caso es el mismo para todos los ramos. Lo que cambia es el paso que sigue (REF CU 18, CU 21).

*Supuestos a confirmar*
SUP_1: Qué datos del titular exigen las compañías para cotizar (DNI o CUIT, fecha de nacimiento, otros). Como el cliente se carga antes que el riesgo, si las APIs piden el documento, el DNI pasa a ser obligatorio en los ramos masivos.
SUP_2: Al elegir un cliente existente, el prototipo solo trae nombre y apellido. Falta que traiga también email, teléfono y DNI, que el envío de la propuesta necesita (REF CU 14), y definir qué pasa si el cliente no los tiene.
SUP_3: Qué pasa si el DNI pertenece a un cliente de otro PAS de la red, y quién puede ver o reutilizar ese cliente.
SUP_4: Si el asegurado y el tomador son siempre la misma persona. El modelo de negocio los distingue y la propuesta nombra al tomador (REF CU 13).
SUP_5: Cómo se carga una persona jurídica. El formulario pide nombre y apellido (REF CU-23-Cartera_Dar_de_Alta_Cliente).
SUP_6: Si la lista de clientes existentes tiene búsqueda por nombre o DNI, como la de Cartera (REF CU-22-Cartera_Buscar_y_Filtrar_Clientes). El prototipo no la tiene.
SUP_7: El caso en el que el administrativo borra al cliente de la base no está escrito. Hasta ese borrado, el PAS no puede hacerlo desaparecer (REF RN_9).
SUP_8: Si, al usar un cliente existente por DNI duplicado, los datos que el PAS tipeó (email, teléfono) se descartan o se ofrece actualizarlos (REF CU-24-Cartera_Editar_Cliente).
SUP_9: Si al volver al ramo (1a) la cotización se descarta o conserva el ramo elegido (REF CU 12).
SUP_10: Orden del flujo. El prototipo pide el cliente después del riesgo; este caso lo pide antes, como en la lista y en los casos de Cartera y Pendientes. Falta validar con el negocio.

### Que se agrego?

- La llegada desde un lead apunta a `CU-08d-Lead_Enviar_Cotizacion`. Se mantiene la llegada desde la recotización de una póliza (REF CU 11), que `main` había sacado del paso 1b.
- "Elegí el cliente" lista los clientes almacenados del PAS, estén en Cartera, solo en Leads o en ninguna de las dos vistas. Si no hay ninguno almacenado, el PAS pasa a "Nuevo cliente".
- RN_2: no se da de alta de nuevo un documento que ya existe, aunque Cartera y Leads ya no lo muestren.
- RN_4: entran los que Cartera ya no muestra, incluidos los que solo figuran en Leads y los que tampoco figuran ahí. Leads es la última vista del PAS; no estar en Leads no los saca de esta lista.
- RN_9: una vez enviada una cotización, el cliente se conserva en la base hasta que un administrativo lo borre. Ninguna operación del PAS lo elimina.
- SUP_7: el caso en el que el administrativo borra al cliente no está escrito. Hasta ese borrado, el PAS no puede hacerlo desaparecer.

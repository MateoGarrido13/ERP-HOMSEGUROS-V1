## CU-17-AUT-Multicotizador_Cargar_Riesgo
*Actor principal:* PAS
*Actor secundario:* Compañías habilitadas para Automotor (REF CU-18 RN_1)
*Precondiciones:* El PAS tiene una cotización de Automotor abierta, con el cliente ya asociado (REF CU-10-Multicotizador_Seleccionar_o_Crear_Cliente). Hay conexión.
*Disparador:* Cargar los datos del vehículo a asegurar para poder comparar cotizaciones

*Flujo principal*
1. El sistema muestra "Cargá el vehículo" y pide la patente
2. El PAS ingresa la patente y selecciona "Continuar" (*ALT PATENTE INVALIDA)
3. El sistema intenta decodificar el vehículo a partir de la patente y, si lo logra, completa marca, modelo/línea y año (*ALT NO DECODIFICA)
4. El PAS revisa los datos decodificados, los corrige si hace falta, y completa el código postal, el uso (particular o comercial), si tiene GNC, si es 0&nbsp;km y la suma asegurada (*ALT VOLVER)
5. El PAS carga todos los campos del formulario y selecciona "Calcular cotización"
6. El sistema valida los campos obligatorios (*ALT DATOS INVALIDOS)
7. Recién cuando todos los checks pasan, el sistema envía las consultas en paralelo a las compañías, guarda los datos del vehículo en la cotización y pasa a comparar las respuestas (REF CU-18-AUT-Multicotizador_Comparar_Cotizaciones)

*Flujos alternativos*

`2a. El PAS ingresa la patente`
2a.1. La patente no tiene el formato de una patente argentina (vieja o Mercosur)
2a.2. El sistema marca el campo como inválido, conserva lo escrito y no avanza
2a.3. **IR A (2)**

`3a. El sistema no logra decodificar el vehículo`
3a.1. La patente no corresponde a ningún vehículo que el sistema pueda identificar
3a.2. El sistema deja marca, modelo/línea y año vacíos para que el PAS los complete a mano
3a.3. **IR A (4)**

`6.a. En la API externa hay una poliza asociada a ese bien(AUTO EN ESTE CASO) y el proveedor no deja obtener una cotizacion`
6.a.1. La patente ya esta asociada a una poliza vigente que tiene otro PAS a cargo
6.a.2. Se exponen aquellos proveedores que si lo permiten (implicara Healty check de las respuestas)
6.a.3. Se informa un mensaje 'El vehiculo posee polizas vigentes'
6.a.3 **IR A (4)**

`6.a.a` Ningun proveedor ofrece cotizaciones
6.a.a.1. La cantidad de cotizaciones obtenidas es 0. El sistema informa «El vehículo posee pólizas vigentes» y vuelve al mismo formulario de carga de datos del bien, con los campos ya autocompletados. No vuelve a la página de inicio.
6.a.a.2. **IR A (4)** con esos campos ya autocompletados.

`6.b. Quien recotiza es el PAS que emitió la póliza vigente`
6.b.1. La patente tiene una póliza ya vigente y el PAS que intenta recotizar es quien la emitió (REF CU-11)
6.b.2. Algunos proveedores solo dejan recotizar ese automotor si la póliza está vigente (activa) (REF RN_11)
6.b.3. Si quien intenta recotizar no es el PAS que la emitió, esos proveedores no devuelven cotización
6.b.4. Se exponen los proveedores que sí la devuelven (REF 6.a.2)

`4a. El PAS vuelve atrás`
4a.1. El PAS selecciona "Volver" antes de tocar "Calcular cotización"
4a.2. El sistema abre la pantalla 1 de este flujo, dentro de `/cotizar`: muestra todos los ramos para cotizar (REF CU-09-Multicotizador_Elegir_Ramo)
4a.3. No se recuperan los campos que el PAS había cargado en el formulario del bien. Retrocedió sin tocar "Calcular cotización"
4a.4. **FIN**

`4b. El PAS vuelve desde la comparación, ya dadas las cotizaciones`
4b.1. Las compañías ya devolvieron cotizaciones y el PAS seleccionó "Volver" (REF CU-18 RN_12)
4b.2. El sistema muestra el formulario con los campos que el PAS cargó
4b.3. Esos datos persisten en la caché de ese cliente (REF CU-10)
4b.4. **FIN**

`6a. El sistema valida los campos`
6a.1. Falta un dato obligatorio, el año no tiene 4 números o está fuera de rango, el código postal no tiene 4 números, o la suma asegurada es menor al mínimo admitido
6a.2. El sistema marca cada campo inválido, conserva lo escrito y no avanza. No envía ninguna consulta a las compañías
6a.3. **IR A (4)**

`La entrada ya trae datos del vehículo`
R.1. El PAS llegó desde una póliza vigente que está recotizando (REF CU-11-Multicotizador_Recotizar_Poliza_Existente)
R.2. El sistema muestra el formulario con la patente y los datos del vehículo precargados desde esa póliza, en lugar de pedir la patente desde cero
R.3. El PAS revisa y corrige lo que haga falta, igual que con un vehículo recién decodificado
R.4. **IR A (4)**

*Postcondiciones*
1. La cotización queda con los datos del vehículo cargados: patente, marca, modelo/línea, año, código postal, uso, GNC, si es 0&nbsp;km y suma asegurada
2. El sistema pasa a comparar las cotizaciones de las compañías con esos datos (REF CU-18-AUT)
3. Si el PAS volvió atrás sin tocar "Calcular cotización", queda en la pantalla 1 de `/cotizar` (todos los ramos) y no se recuperan los campos del formulario del bien (REF 4a, CU-09)
4. Las compañías se consultan en este caso, en paralelo, recién después de que el PAS selecciona "Calcular cotización" y todos los campos obligatorios pasan la validación. Antes de ese botón no se consulta a ninguna compañía
5. El cliente de la cotización no se modifica por cargar el riesgo (REF CU-10)

*Reglas de negocio asociadas*
RN_1: Solo se carga el riesgo de una cotización que ya tiene un cliente asociado (REF CU-10). Ese cliente trae tipo y número de documento: DNI si es persona física, CUIT si es persona jurídica. El documento se propaga a las consultas a las compañías (REF CU-10 RN_2).
RN_2: La patente tiene que tener el formato de una patente argentina (vieja o Mercosur) antes de intentar decodificarse.
RN_3: La decodificación automática completa marca, modelo/línea y año a partir de la patente, pero el PAS siempre puede corregir lo que el sistema decodificó.
RN_4: Si el sistema no logra decodificar el vehículo, el PAS completa marca, modelo/línea y año a mano; el caso sigue igual desde ahí (*ALT NO DECODIFICA).
RN_5: Año válido: 4 números, entre 1980 y el año siguiente al actual.
RN_6: Código postal válido: 4 números.
RN_7: Suma asegurada válida: un número mayor o igual a $100.000.
RN_8: La consulta a las compañías ocurre en este caso. El PAS carga todos los campos del formulario y selecciona "Calcular cotización". El sistema valida los campos obligatorios. Recién cuando todos los checks pasan, envía las consultas en paralelo a las compañías (REF CU-18-AUT). Si falta un dato obligatorio, no se envía ninguna consulta (*ALT 6a).
RN_9: Si la cotización viene de una recotización (REF CU-11), los datos del vehículo llegan precargados desde la póliza de origen y el PAS puede modificar cualquiera antes de continuar.
RN_10: Cargar el riesgo no se audita, porque todavía no hay ninguna cotización de precio ni propuesta; la auditoría empieza a partir de generar la propuesta (REF CU-13 RN_4, CU 51).
RN_11: Algunos proveedores solo dejan recotizar un automotor con póliza vigente (activa) si quien intenta recotizar es el PAS que emitió esa póliza. Si quien intenta recotizar no es ese PAS, esos proveedores no devuelven cotización (REF 6.b, CU-11).
RN_12: Si ningún proveedor devuelve cotización, el PAS permanece en el mismo formulario de carga de datos del bien, con los campos ya autocompletados, y ve el mensaje «El vehículo posee pólizas vigentes» (REF 6.a.a). No vuelve a la página de inicio.
RN_13: "Volver" antes de tocar "Calcular cotización" abre la pantalla 1 de `/cotizar`, con todos los ramos (REF CU-09). No se recuperan los campos del formulario del bien (REF 4a). Si el PAS vuelve después de que las compañías ya cotizaron, el formulario muestra los campos que cargó y esos datos persisten en la caché de ese cliente (REF CU-18 RN_12, 4b).

*Riesgo registrado*
La credencial única se usa para enviar y recibir las cotizaciones de las compañías / APIs proveedoras. Es la misma conexión para toda la aplicación y, en algunos casos, está asociada a un solo PAS (un administrativo, en algunos casos). Todos los usuarios salen con esa credencial. En bienes con póliza vigente el inconveniente de `6.a` / `6.b` se repite siempre, porque la compañía no ve al PAS que opera. Si se necesitara la cartera de todos los clientes en esas APIs, no se podrá obtener: la conexión solo ve la cartera de ese único PAS / administrativo.

*Supuestos a confirmar*
SUP_1: Si la decodificación de la patente es un servicio real (por ejemplo, contra un padrón de vehículos) o si por ahora queda simulada con un vehículo fijo, como hoy en el prototipo.
SUP_2: Si el PAS puede cambiar la patente después de decodificar sin perder el resto de lo cargado, o si cambiar la patente reinicia el formulario del vehículo.
SUP_3: Si hay otros datos del riesgo que todavía no están en el prototipo y que las compañías podrían exigir para cotizar (por ejemplo, antigüedad de la licencia del conductor principal).
SUP_4: Resuelto. Orden canónico: cliente antes del riesgo (REF CU-10, cuestiones A1). El prototipo vigente va de `/cotizar/automotor` a comparar sin CU-10 (REF `docs/specs/as-built-prototipo-iteracion-1.md`).
SUP_5: Si el código postal se usa para algo más que completar el formulario (por ejemplo, para que las compañías coticen con una tarifa regional) o si solo queda guardado como dato del vehículo.
SUP_6: Si "uso comercial" de este caso es la misma pregunta que el uso que hoy pide el prototipo al ingresar la patente, o si son dos campos distintos que terminan duplicados.

## CU-17-Multicotizador_Cargar_Riesgo_Automotor
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene una cotización de Automotor abierta, con el cliente ya asociado (REF CU-10-Multicotizador_Seleccionar_o_Crear_Cliente). Hay conexión.
*Disparador:* Cargar los datos del vehículo a asegurar para poder comparar cotizaciones

*Flujo principal*
1. El sistema muestra "Cargá el vehículo" y pide la patente
2. El PAS ingresa la patente y selecciona "Continuar" (*ALT PATENTE INVALIDA)
3. El sistema intenta decodificar el vehículo a partir de la patente y, si lo logra, completa marca, modelo/línea y año (*ALT NO DECODIFICA)
4. El PAS revisa los datos decodificados, los corrige si hace falta, y completa el código postal, el uso (particular o comercial), si tiene GNC, si es 0&nbsp;km y la suma asegurada (*ALT VOLVER)
5. El PAS selecciona "Comparar cotizaciones"
6. El sistema valida los campos (*ALT DATOS INVALIDOS)
7. El sistema guarda los datos del vehículo en la cotización y pasa a comparar las cotizaciones de las compañías (REF CU-18-Multicotizador_Comparar_Cotizaciones)

*Flujos alternativos*

`2a. El PAS ingresa la patente`
2a.1. La patente no tiene el formato de una patente argentina (vieja o Mercosur)
2a.2. El sistema marca el campo como inválido, conserva lo escrito y no avanza
2a.3. **IR A (2)**

`3a. El sistema no logra decodificar el vehículo`
3a.1. La patente no corresponde a ningún vehículo que el sistema pueda identificar
3a.2. El sistema deja marca, modelo/línea y año vacíos para que el PAS los complete a mano
3a.3. **IR A (4)**

`4a. El PAS vuelve atrás`
4a.1. El PAS selecciona "Volver" antes de completar la carga del vehículo
4a.2. El sistema descarta la patente y los datos del vehículo cargados hasta ese momento
4a.3. El sistema conserva el cliente asociado a la cotización (REF CU-10)
4a.4. **FIN**

`6a. El sistema valida los campos`
6a.1. Falta un dato obligatorio, el año no tiene 4 números o está fuera de rango, el código postal no tiene 4 números, o la suma asegurada es menor al mínimo admitido
6a.2. El sistema marca cada campo inválido, conserva lo escrito y no avanza
6a.3. **IR A (4)**

`La entrada ya trae datos del vehículo`
R.1. El PAS llegó desde una póliza vigente que está recotizando (REF CU-11-Multicotizador_Recotizar_Poliza_Existente)
R.2. El sistema muestra el formulario con la patente y los datos del vehículo precargados desde esa póliza, en lugar de pedir la patente desde cero
R.3. El PAS revisa y corrige lo que haga falta, igual que con un vehículo recién decodificado
R.4. **IR A (4)**

*Postcondiciones*
1. La cotización queda con los datos del vehículo cargados: patente, marca, modelo/línea, año, código postal, uso, GNC, si es 0&nbsp;km y suma asegurada
2. El sistema pasa a comparar las cotizaciones de las compañías con esos datos (REF CU-18)
3. Si el PAS volvió atrás sin terminar, la cotización conserva el cliente asociado pero no tiene ningún dato del vehículo cargado
4. No se contactó a ninguna compañía todavía; esa consulta ocurre en el paso siguiente (REF CU-18)
5. El cliente de la cotización no se modifica por cargar el riesgo (REF CU-10)

*Reglas de negocio asociadas*
RN_1: Solo se carga el riesgo de una cotización que ya tiene un cliente asociado (REF CU-10).
RN_2: La patente tiene que tener el formato de una patente argentina (vieja o Mercosur) antes de intentar decodificarse.
RN_3: La decodificación automática completa marca, modelo/línea y año a partir de la patente, pero el PAS siempre puede corregir lo que el sistema decodificó.
RN_4: Si el sistema no logra decodificar el vehículo, el PAS completa marca, modelo/línea y año a mano; el caso sigue igual desde ahí (*ALT NO DECODIFICA).
RN_5: Año válido: 4 números, entre 1980 y el año siguiente al actual.
RN_6: Código postal válido: 4 números.
RN_7: Suma asegurada válida: un número mayor o igual a $100.000.
RN_8: Cargar el riesgo no consulta a ninguna compañía ni genera ningún precio; eso ocurre al comparar cotizaciones (REF CU-18).
RN_9: Si la cotización viene de una recotización (REF CU-11), los datos del vehículo llegan precargados desde la póliza de origen y el PAS puede modificar cualquiera antes de continuar.
RN_10: Cargar el riesgo no se audita, porque todavía no hay ninguna cotización de precio ni propuesta; la auditoría empieza a partir de generar la propuesta (REF CU-13 RN_4, CU 51).

*Supuestos a confirmar*
SUP_1: Si la decodificación de la patente es un servicio real (por ejemplo, contra un padrón de vehículos) o si por ahora queda simulada con un vehículo fijo, como hoy en el prototipo.
SUP_2: Si el PAS puede cambiar la patente después de decodificar sin perder el resto de lo cargado, o si cambiar la patente reinicia el formulario del vehículo.
SUP_3: Si hay otros datos del riesgo que todavía no están en el prototipo y que las compañías podrían exigir para cotizar (por ejemplo, antigüedad de la licencia del conductor principal).
SUP_4: Resuelto. Orden canónico: cliente antes del riesgo (REF CU-10, cuestiones A1). El prototipo vigente va de `/cotizar/automotor` a comparar sin CU-10 (REF `specs/as-built-prototipo-iteracion-1.md`).
SUP_5: Si el código postal se usa para algo más que completar el formulario (por ejemplo, para que las compañías coticen con una tarifa regional) o si solo queda guardado como dato del vehículo.
SUP_6: Si "uso comercial" de este caso es la misma pregunta que el uso que hoy pide el prototipo al ingresar la patente, o si son dos campos distintos que terminan duplicados.

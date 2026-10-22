## CU-20-AUT-Multicotizador_Aplicar_Descuento
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene abierta la comparación de cotizaciones de Automotor, con una cotización en estado "Listo" (REF CU-18-AUT-Multicotizador_Comparar_Cotizaciones). Hay conexión.
*Disparador:* Bajarle el precio al cliente cediendo parte de su comisión

*Flujo principal*
1. El PAS selecciona "Aplicar descuento" en una cotización "Listo" (*ALT SIN COMISION DEFINIDA)
2. El sistema muestra la comisión actual del PAS sobre esa cotización y el máximo de puntos que puede ceder (*ALT SIN MARGEN)
3. El PAS ingresa cuántos puntos de comisión cede (*ALT PUNTOS INVALIDOS, *ALT EXCEDE EL MAXIMO)
4. El sistema calcula y muestra el precio con descuento, la comisión que le queda al PAS y cuánto baja el precio respecto del original
5. El PAS selecciona "Aplicar" (*ALT CANCELAR)
6. El sistema reemplaza el precio de esa cotización por el precio con descuento y la marca "Con descuento", sin tocar las demás
7. El sistema registra el descuento (REF CU 51)
8. El sistema vuelve a la comparación (REF CU-18-AUT-Multicotizador_Comparar_Cotizaciones). Si el PAS marca la cotización, el descuento pasa a la propuesta (REF CU 13)

*Flujos alternativos*

`1. El PAS selecciona "Aplicar descuento"`
1.1. No hay un porcentaje de comisión definido para esa compañía y este PAS
1.2. El sistema informa que no se puede aplicar un descuento a esa cotización
1.3. **FIN**

`2. El sistema muestra la comisión y el máximo`
2.1. El PAS ya no tiene puntos de comisión para ceder, porque llegó al mínimo que debe conservar
2.2. El sistema informa que no hay margen y no permite continuar
2.3. **FIN**

`3. El PAS ingresa los puntos`
3.1. El valor no es un número, es cero o es negativo
3.2. El sistema marca el campo como inválido y conserva lo escrito
3.3. **IR A (3)**

`3. El PAS ingresa los puntos (excede)`
3.1. El valor supera el máximo que el PAS puede ceder
3.2. El sistema informa el máximo permitido y no calcula el descuento
3.3. **IR A (3)**

`5. El PAS selecciona "Aplicar"`
5.1. El PAS cancela
5.2. El sistema descarta el cálculo y deja la cotización con su precio anterior
5.3. **FIN**

`La entrada es una cotización que ya tiene descuento`
D.1. El PAS selecciona "Aplicar descuento" en una cotización que ya está "Con descuento"
D.2. El sistema muestra los puntos cedidos y el precio con descuento, y permite cambiar el valor o quitar el descuento
D.3. Si el PAS cambia el valor, **IR A (3)**
D.4. Si el PAS quita el descuento, el sistema devuelve la cotización al precio de la compañía y registra el cambio (REF CU 51)
D.5. **FIN**

*Postcondiciones*
1. La cotización muestra el precio con descuento y la marca "Con descuento"
2. La comisión del PAS sobre esa cotización baja en los puntos cedidos
3. Las demás cotizaciones no cambian
4. El descuento queda registrado: PAS, cotización, compañía, puntos cedidos, precio original, precio final, fecha y hora
5. Si el PAS cancela o hay un error, la cotización conserva el precio de la compañía

*Reglas de negocio asociadas*
RN_1: El descuento se financia solo con puntos de la comisión del PAS. No se reduce el margen de la compañía ni el de la organización.
RN_2: El PAS no puede ceder más puntos que el máximo permitido, ni dejar su comisión por debajo del mínimo que debe conservar.
RN_3: El descuento se aplica a una cotización por vez y solo a cotizaciones en estado "Listo".
RN_4: El precio con descuento es el que pasa a la propuesta y al PDF. El PDF muestra solo el precio final, sin comisión ni puntos cedidos (REF CU 13).
RN_5: Aplicar, cambiar o quitar un descuento se audita: PAS, cotización, puntos, precios, fecha y hora (REF CU 51).
RN_6: Cambiar el cliente o los datos del vehículo invalida las cotizaciones y también sus descuentos (REF CU-18-AUT-Multicotizador_Comparar_Cotizaciones, RN_10).
RN_7: El descuento puede quitarse mientras la propuesta no se haya generado.
RN_8: Para saber cuántos puntos tiene para ceder, el PAS necesita ver su comisión sobre esa cotización (REF CU-19-AUT-Multicotizador_Ver_Comision_de_Cotizacion).

*Supuestos a confirmar*
SUP_1: Si la compañía respeta el precio con descuento al emitir la póliza. Si la compañía emite siempre a su propio precio, el descuento solo tiene efecto real si se transmite a la compañía (por ejemplo, como bonificación en su API). Es el supuesto que decide si el caso es viable.
SUP_2: Qué descuentos puede aplicar el PAS por su cuenta y cuáles necesitan autorización. El cliente planteó el descuento extraordinario para cuentas grandes y dejó abierto cómo se autoriza.
SUP_3: Si existe un tope de puntos sin autorización, quién autoriza lo que lo supera (dueño o administrativo) y cómo se pide. En el MVP podría resolverse con un tope fijo.
SUP_4: Cómo se convierten los puntos de comisión en reducción de precio: sobre qué base (prima comercial, o prima con recargos e impuestos).
SUP_5: Qué mínimo de comisión debe conservar el PAS, y si ese mínimo depende de la compañía, del ramo o del PAS.
SUP_6: De qué comisión salen los puntos cedidos: de la neta del PAS o antes de lo que retiene la organización (REF CU-19-AUT-Multicotizador_Ver_Comision_de_Cotizacion, SUP_1).
SUP_7: Si el cliente puede ver, en la propuesta, el precio original y el descuento, o solo el precio final.
SUP_8: Si el descuento se expresa solo en puntos o también en pesos o porcentaje del precio.
SUP_9: Fase del caso. La lista lo marca como `?[MVP]`: falta confirmar si entra en el MVP.

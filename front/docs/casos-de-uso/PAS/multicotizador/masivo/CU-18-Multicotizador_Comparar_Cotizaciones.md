## CU-18-Multicotizador_Comparar_Cotizaciones
*Actor principal:* PAS
*Actor secundario:* APIs de las compañías (hub)
*Precondiciones:* El PAS tiene una cotización abierta con cliente asociado (REF CU-10) y riesgo cargado: Automotor (REF CU-17) o Hogar, Consorcio o Comercio (REF CU-17b). Hay conexión.
*Disparador:* Comparar los precios que devuelven las compañías para ese riesgo

*Flujo principal*
1. El sistema consulta en paralelo a las compañías con API de cotización para ese ramo: Mercantil Andina, Sancor Seguros, Zurich, La Segunda y Allianz. Las particularidades de cada API van en las specs de adapter, no en este caso
2. El sistema muestra el tablero de comparación y va incorporando cada respuesta a medida que llega (*ALT DEMORA, *ALT RECHAZO, *ALT SIN RESPUESTA)
3. Cada fila muestra compañía, cobertura y premio. El PAS no espera a que lleguen todas para ver las que ya respondieron
4. El PAS selecciona una o más combinaciones compañía-cobertura (*ALT NINGUNA LLEGO, *ALT VOLVER)
5. El PAS selecciona "Armar propuesta"
6. El sistema conserva la selección y sigue a armar la propuesta y generar el PDF (REF CU-13)

*Flujos alternativos*

`2a. Una compañía demora`
2a.1. Esa fila queda en espera. El resto del tablero sigue usable
2a.2. Si llega después, se incorpora. Un estimado o caché, si existiera, no es precio real y no forma parte de la iteración 1 (REF SUP_1)
2a.3. **IR A (3)**

`2b. Una compañía rechaza cotizar`
2b.1. El sistema marca esa fila como rechazada, con el motivo si la API lo informa
2b.2. El PAS no puede elegir esa combinación. Las demás siguen
2b.3. **IR A (3)**

`2c. Una compañía no responde o falla`
2c.1. El sistema marca esa fila como no disponible. No bloquea al resto
2c.2. El PAS puede reintentar esa compañía o seguir con las que sí llegaron
2c.3. **IR A (3)**

`4a. No llegó ninguna cotización usable`
4a.1. Todas las compañías fallaron, rechazaron o siguen en espera
4a.2. El sistema no ofrece "Armar propuesta"
4a.3. El PAS puede reintentar, volver al riesgo (REF CU-17 o CU-17b) o abandonar
4a.4. **FIN**

`4b. El PAS vuelve atrás`
4b.1. El PAS vuelve al riesgo. El sistema conserva el cliente asociado
4b.2. Las cotizaciones mostradas se descartan
4b.3. **FIN**

*Postcondiciones*
1. El PAS eligió al menos una combinación compañía-cobertura, o abandonó / no tuvo ninguna usable
2. Elegir combinaciones no genera el PDF ni envía la propuesta (REF CU-13, CU-14)
3. No se emite la póliza legal ni se registra en Cartera (REF CU-16)
4. Las compañías que fallaron no impiden usar las que respondieron
5. Este caso no muestra comisión ni aplica descuento (REF CU-19, CU-20, fuera de iteración 1)

*Reglas de negocio asociadas*
RN_1: No se consulta a las compañías sin cliente asociado y riesgo cargado (REF CU-10, CU-17, CU-17b).
RN_2: Las consultas salen en paralelo. El tablero se actualiza por compañía; una falla, demora o rechazo no detiene a las demás.
RN_3: Compañías de este caso: Mercantil Andina, Sancor Seguros, Zurich, La Segunda y Allianz, y solo las que tengan API de ese ramo. El prototipo muestra un subconjunto (REF `specs/as-built-prototipo-iteracion-1.md`).
RN_4: El PAS puede elegir más de una combinación para llevarlas a la propuesta (REF CU-13 RN_2).
RN_5: Este caso no emite póliza, no cambia `activa` del cliente y no aplica CU-19 ni CU-20.
RN_6: Un valor estimado o de caché, si se mostrara, no es una cotización. En iteración 1 no es obligatorio.
RN_7: Comparar no se audita como emisión; la auditoría empieza al generar la propuesta (REF CU-13 RN_4, CU 51).

*Supuestos a confirmar*
SUP_1: Estimado / caché mientras responde la compañía: diferido. Si se incorpora, el tablero debe decir que no es precio real.
SUP_2: Tiempo máximo de espera por compañía y si el reintento es por fila o de todo el tablero.
SUP_3: Qué cuberturas (terceros, todo riesgo, etc.) expone cada compañía y cómo se alinean en el tablero. Va en specs de adapter.
SUP_4: El prototipo compara Automotor sin pasar por CU-10 y no mete Hogar en este caso. Canónico: cliente y riesgo antes de comparar, también en Hogar/Consorcio/Comercio con API (REF `specs/as-built-prototipo-iteracion-1.md`).

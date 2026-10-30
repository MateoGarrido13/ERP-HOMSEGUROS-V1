## CU-16-Multicotizador_Registrar_Poliza_Emitida
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene una propuesta en estado "Aceptada" (REF CU-15-Multicotizador_Marcar_Resultado_de_Propuesta). Hay conexión.
*Disparador:* Dejar registrada la póliza que terminó emitiendo la compañía

*Flujo principal*
1. El PAS abre la ficha del cliente y ubica la propuesta "Aceptada" (REF CU-25-Cartera_Ver_Ficha_Cliente)
2. El PAS selecciona "Registrar póliza emitida"
3. El sistema muestra el formulario con la combinación compañía-cobertura de la propuesta precargada (*ALT MAS DE UNA COMBINACION)
4. El PAS completa el número de póliza, la vigencia (desde y hasta) y el medio y las cuotas de cobro (*ALT SIN PRECIO PREVIO)
5. El sistema valida los campos obligatorios y que el número de póliza no esté ya registrado para esa compañía (*ALT DATOS INVALIDOS, *ALT POLIZA DUPLICADA)
6. El PAS confirma el registro (*ALT PAS CANCELA)
7. El sistema guarda la póliza como vigente, asociada al cliente, a la cotización y a la propuesta aceptada
8. El sistema incorpora al cliente a la cartera del PAS si todavía no estaba incorporado (REF CU-23-Cartera_Dar_de_Alta_Cliente)
9. El sistema muestra la confirmación y abre la ficha del cliente con la póliza nueva (REF CU-25, CU-27-Cartera_Ver_Detalle_Poliza)

*Flujos alternativos*

`3a. La propuesta tiene más de una combinación compañía-cobertura`
3a.1. El sistema muestra las combinaciones de la propuesta (REF CU-13-Multicotizador_Armar_Propuesta_y_Generar_PDF RN_2)
3a.2. El PAS selecciona cuál de ellas emitió la compañía
3a.3. El sistema descarta las demás combinaciones de esa propuesta, sin registrarlas como póliza
3a.4. **IR A (4)**

`4a. La propuesta no tenía precio cargado (ramo no masivo)`
4a.1. La propuesta se generó a la espera de que la compañía cotizara aparte (REF CU-13 SUP_2)
4a.2. El PAS carga la prima y las cuotas que terminó informando la compañía
4a.3. **IR A (5)**

`5a. El sistema valida los campos obligatorios`
5a.1. Falta el número de póliza o la vigencia, o la fecha "hasta" es anterior a la fecha "desde"
5a.2. El sistema marca cada campo inválido, conserva lo escrito y no avanza
5a.3. **IR A (4)**

`5b. El sistema verifica que el número de póliza no esté duplicado`
5b.1. El número de póliza ya está registrado para esa compañía
5b.2. El sistema informa el error y no guarda ninguna póliza
5b.3. El PAS corrige el número
5b.4. **IR A (4)**

`6a. El PAS cancela el registro`
6a.1. El PAS abandona el formulario sin confirmar
6a.2. El sistema no guarda ninguna póliza; la propuesta sigue "Aceptada"
6a.3. **FIN**

*Postcondiciones*
1. Queda registrada una póliza vigente, asociada al cliente, a la cotización y a la propuesta aceptada
2. El cliente queda incorporado a la cartera del PAS si todavía no lo estaba (REF CU-23)
3. La póliza queda visible en la ficha del cliente y en su detalle (REF CU-25, CU-27)
4. Si el PAS canceló el registro, no se crea ninguna póliza y la propuesta permanece "Aceptada"
5. Registrar la póliza no modifica el PDF de la propuesta ni los datos de la cotización original (REF CU-13)
6. La póliza legal sigue siendo la que emitió la aseguradora; este registro es la copia operativa en el ERP (REF CU-27 RN_1)

*Reglas de negocio asociadas*
RN_1: Solo se puede registrar la póliza emitida sobre una propuesta "Aceptada" (REF CU-15). Una propuesta "Enviada", "Rechazada" o "Vencida" no habilita este caso.
RN_2: Si la propuesta tenía más de una combinación compañía-cobertura (REF CU-13 RN_2), el PAS indica cuál emitió la compañía; las demás quedan descartadas y no generan póliza.
RN_3: Como mínimo, la póliza requiere número, compañía, vigencia y medio de cobro, alineado con lo exigido en la carga inicial de pólizas existentes (REF CU-29-Cartera_Cargar_Polizas_Existentes RN_2).
RN_4: Un número de póliza de la misma compañía no puede registrarse dos veces (REF CU-29 RN_3).
RN_5: Este registro incorpora al cliente a la cartera del PAS si todavía no estaba incorporado (REF CU-23 RN_1).
RN_6: Registrar la póliza no modifica ni reemplaza el PDF de la propuesta (REF CU-13) ni los datos de la cotización original.
RN_7: Esta acción se audita: cotización, PAS, póliza registrada y fecha (REF CU 51).
RN_8: Este caso no emite la póliza legal; refleja en el ERP lo que la compañía ya emitió por su cuenta (REF CU-27 RN_1).

*Supuestos a confirmar*
SUP_1: Si una propuesta "Aceptada" ya cuenta como cobertura asociada para incorporar al cliente antes de este registro, o si la incorporación ocurre recién acá (REF CU-23 SUP_1).
SUP_2: Qué datos exactos pide el formulario por ramo (prima, suma asegurada, cuotas, documento de la póliza) y si coinciden con los que pide el detalle de póliza y la carga inicial (REF CU-27 SUP_2 y SUP_3, CU-29 SUP_3).
SUP_3: Si el PAS puede adjuntar en este paso el PDF o el documento que manda la compañía, o si se agrega después desde el detalle de la póliza (REF CU-27 SUP_4).
SUP_4: Cuánto tiempo puede demorar la compañía en emitir después de "Aceptada", y si el sistema avisa al PAS si pasa mucho tiempo sin que registre la póliza (REF CU-05-Pendientes_Ver_Pendientes).
SUP_5: Si un dato de la póliza ya registrada se puede corregir desde este mismo caso o solo desde su detalle (REF CU-27 SUP_5).
SUP_6: Qué pasa si la compañía no llega a emitir después de "Aceptada" (por ejemplo, la rechaza tras una inspección): si existe un estado para volver atrás o si queda fuera del alcance de este caso.

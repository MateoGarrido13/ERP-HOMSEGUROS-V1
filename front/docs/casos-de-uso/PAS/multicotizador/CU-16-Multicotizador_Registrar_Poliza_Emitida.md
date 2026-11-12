## CU-16-Multicotizador_Registrar_Poliza_Emitida
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene un aviso de Cotización enviada en Pendientes, sobre una propuesta ya enviada (REF CU-14, CU-05d). El cliente está persistido con `activa=false` si era nuevo. Hay conexión.
*Disparador:* El PAS selecciona "Resolver" y "Dar de alta" / aceptar en Pendientes

*Flujo principal*
1. En Pendientes, el PAS abre el aviso Cotización enviada (REF CU-05d)
2. El PAS selecciona "Resolver" y elige "Dar de alta"
3. El sistema muestra el formulario de póliza emitida, con la combinación compañía-cobertura de la propuesta precargada (*ALT MAS DE UNA COMBINACION)
4. El PAS completa el número de póliza, fecha de inicio (emisión), fecha de fin (renovación del acuerdo), fecha del próximo pago, el número de endoso, el importe, el medio de cobro (A débito automático, T tarjeta, E efectivo/transferencia), si el primer endoso ya está pagado, y las cuotas de cobro. `vigente=true` (*ALT SIN PRECIO PREVIO)
5. El sistema valida los campos obligatorios y que no exista ya una póliza con la misma compañía, el mismo ramo y el mismo número (*ALT DATOS INVALIDOS, *ALT POLIZA DUPLICADA)
6. El PAS confirma el registro (*ALT PAS CANCELA)
7. El sistema, en una sola transacción, guarda primero la póliza con todos sus atributos y `vigente=true`, y después el primer endoso asociado (importe, medio de cobro, `pagado`, número de endoso, fecha de emisión). Sin esa póliza completa no se registra el endoso. `vigente=false` no impide endosos posteriores de mora (saldo tras baja). La póliza queda asociada al cliente, a la cotización y a la propuesta aceptada. Si falla cualquiera de las dos filas, no persiste ninguna (*ALT FALLO AL GUARDAR)
8. El sistema pasa el cliente a `activa=true` (entra a Cartera) si todavía no lo estaba (REF CU-23)
9. El sistema saca el aviso de Pendientes, muestra la confirmación y abre la ficha del cliente con la póliza nueva (REF CU-05d, CU-25, CU-27)

*Flujos alternativos*

`3a. La propuesta tiene más de una combinación compañía-cobertura`
3a.1. El sistema muestra las combinaciones de la propuesta (REF CU-13-Multicotizador_Armar_Propuesta_y_Generar_PDF RN_2)
3a.2. El PAS selecciona cuál de ellas emitió la compañía
3a.3. El sistema descarta las demás combinaciones de esa propuesta, sin registrarlas como póliza ni como endoso
3a.4. **IR A (4)**

`4a. La propuesta no tenía precio cargado (ramo no masivo)`
4a.1. La propuesta se generó a la espera de que la compañía cotizara aparte (REF CU-13 SUP_2)
4a.2. El PAS carga el importe y las cuotas que terminó informando la compañía
4a.3. **IR A (5)**

`5a. El sistema valida los campos obligatorios`
5a.1. Falta el número de póliza, la fecha de inicio, la fecha de fin, la fecha del próximo pago, el número de endoso, el importe o el medio de cobro, o la fecha de fin es anterior a la de inicio, o la fecha de emisión del endoso excede la fecha de fin
5a.2. El sistema marca cada campo inválido, conserva lo escrito y no avanza
5a.3. **IR A (4)**

`5b. El sistema verifica que la póliza no esté duplicada`
5b.1. Ya hay una póliza con la misma compañía, el mismo ramo y el mismo número
5b.2. El sistema informa el error y no guarda póliza ni endoso
5b.3. El PAS corrige el número
5b.4. **IR A (4)**

`6a. El PAS cancela el registro`
6a.1. El PAS abandona el formulario sin confirmar
6a.2. El sistema no guarda póliza ni endoso; el cliente sigue con `activa=false` si era nuevo; el aviso sigue en Pendientes
6a.3. **FIN**

`7a. Falla el guardado de la póliza o del primer endoso`
7a.1. El sistema no deja una póliza sin endoso ni un endoso sin póliza
7a.2. El cliente nuevo no entra a Cartera; el aviso sigue en Pendientes
7a.3. El PAS puede reintentar
7a.4. **FIN**

*Postcondiciones*
1. Queda registrada una póliza vigente, asociada al cliente, a la cotización y a la propuesta aceptada, con exactamente un primer endoso (alta y cobro de esa emisión)
2. El cliente queda visible en Cartera (`activa=true`) si todavía no lo estaba (REF CU-23)
3. La póliza queda visible en la ficha del cliente y en su detalle (REF CU-25, CU-27)
4. Si el PAS canceló el registro o falló el guardado, no se crea póliza ni endoso, el aviso sigue en Pendientes y el cliente nuevo no entra a Cartera
5. Registrar la póliza no modifica el PDF de la propuesta ni los datos de la cotización original (REF CU-13)
6. La póliza legal sigue siendo la que emitió la aseguradora; este registro es la copia operativa en el ERP (REF CU-27 RN_1)
7. `endoso.pagado` queda en `true` si el PAS indicó que ya pagó, o en `false` si aún no pagó

*Reglas de negocio asociadas*
RN_1: Este caso es el mismo paso que "Resolver → Dar de alta" en Pendientes (REF CU-05d). Marca la propuesta como aceptada y asienta la póliza. Una propuesta "Rechazada" o "Vencida" no habilita este caso (el rechazo es "Resolver → Lead" en CU-05d).
RN_2: Si la propuesta tenía más de una combinación compañía-cobertura (REF CU-13 RN_2), el PAS indica cuál emitió la compañía; las demás quedan descartadas y no generan póliza ni endoso.
RN_3: Como mínimo, la póliza requiere número, compañía, ramo, `fecha_inicio`, `fecha_fin`, `fecha_prox_pago`, `cuotas` (`vigente=true`) y el primer endoso (número de endoso, importe, medio de cobro A/T/E y `pagado`). El mínimo de póliza se alinea con la carga inicial (REF CU-29-Cartera_Cargar_Polizas_Existentes RN_2); el primer endoso es propio de este caso.
RN_4: No puede haber dos pólizas con la misma compañía, el mismo ramo (`poliza.tipo` CHAR(2): HO hogar, AU automotor, CO consorcio, CC comercio) y el mismo número (REF POLIZA_UNICA.md).
RN_5: Este registro pasa `activa=true` y muestra al cliente en Cartera (REF CU-23 RN_1). El envío previo (CU-14) solo había persistido `activa=false`.
RN_6: Registrar la póliza no modifica ni reemplaza el PDF de la propuesta (REF CU-13) ni los datos de la cotización original.
RN_7: Esta acción se audita: cotización, PAS, póliza, primer endoso y fecha (REF CU 51).
RN_8: Este caso no emite la póliza legal; refleja en el ERP lo que la compañía ya emitió por su cuenta (REF CU-27 RN_1).
RN_9: No se registra un endoso si no existe una póliza con todos sus atributos. En este caso se inserta primero esa póliza con `vigente=true` y, en la misma transacción, el primer endoso. No hay póliza sin ese endoso ni ese endoso sin póliza. Los endosos posteriores son otras tuplas sobre la misma póliza y no modifican las anteriores (historial). Pueden asociarse a una póliza ya no vigente: deudor moroso dado de baja que termina el saldo pendiente.
RN_10: `fecha_inicio` es la emisión. `fecha_fin` es la renovación del acuerdo, no del pago; queda al cargar la póliza o en renovaciones. Dar de baja solo pone `vigente=false`. PENDIENTES de cobro compara `fecha_prox_pago`. Resolver ese aviso registra un endoso con `fecha_emision` que no excede `fecha_fin` y actualiza `fecha_prox_pago`. Si `pagado=true`, `fecha_prox_pago` se corre **X** días: X depende de las `cuotas` del acuerdo, no es 30 fijos.
RN_11: El medio de cobro del primer endoso es `A` débito automático, `T` tarjeta o `E` efectivo/transferencia. El cobro de esta emisión es el flag `pagado` de ese endoso, no un ticket CU-31.
RN_12: Si el primer endoso queda `pagado=true`, `fecha_prox_pago` queda ya corrida **X** días según las `cuotas` del acuerdo.

*Supuestos a confirmar*
SUP_1: Resuelto. La incorporación visible a Cartera ocurre en este paso, no al enviar ni al marcar aceptada por separado.
SUP_2: Qué datos exactos pide el formulario por ramo (prima, suma asegurada, cuotas, documento de la póliza) y si coinciden con los que pide el detalle de póliza y la carga inicial (REF CU-27 SUP_2 y SUP_3, CU-29 SUP_3).
SUP_3: Si el PAS puede adjuntar en este paso el PDF o el documento que manda la compañía, o si se agrega después desde el detalle de la póliza (REF CU-27 SUP_4).
SUP_4: Cuánto tiempo puede demorar la compañía en emitir después de "Aceptada", y si el sistema avisa al PAS si pasa mucho tiempo sin que registre la póliza (REF CU-05-Pendientes_Ver_Pendientes).
SUP_5: Si un dato de la póliza ya registrada se puede corregir desde este mismo caso o solo desde su detalle (REF CU-27 SUP_5).
SUP_6: Qué pasa si la compañía no llega a emitir después de "Aceptada" (por ejemplo, la rechaza tras una inspección): si existe un estado para volver atrás o si queda fuera del alcance de este caso.
SUP_7: Qué número de endoso usa la compañía en la emisión (p. ej. `0` / `000000`) si el PAS no lo tiene a mano.
SUP_8: Si marcar `pagado=true` en este paso cierra también un aviso de cupón (REF CU-05f) o eso queda para otro caso.
SUP_9: Resuelto. El corrimiento es X días según `poliza.cuotas` del acuerdo; no es 30 fijos. La fórmula cuota→X queda en la aplicación.

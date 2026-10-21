## CU-26-Cartera_Ver_Cartera_por_Ramo
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene la sesión abierta (REF CU-01-Acceso_Iniciar_Sesion). Hay conexión.
*Disparador:* Conocer la composición de su cartera

*Flujo principal*
1. El PAS abre "Cartera"
2. El sistema obtiene las pólizas vigentes asociadas a ese PAS
3. El sistema muestra "Por ramo" y la cantidad total de pólizas vigentes en el centro del gráfico (*ALT CARTERA VACIA)
4. Por cada ramo con pólizas vigentes, el sistema muestra un color, el nombre del ramo, la cantidad de pólizas y su porcentaje sobre el total
5. Debajo de la distribución, el sistema muestra la búsqueda, el control "+" y la lista de clientes de la cartera (REF CU-22-Cartera_Buscar_y_Filtrar_Clientes, CU-23-Cartera_Dar_de_Alta_Cliente)
6. El PAS consulta la distribución o continúa hacia un cliente

*Flujos alternativos*

`3. El sistema muestra la cantidad total de pólizas vigentes`
3.1. El PAS no tiene pólizas vigentes
3.2. El sistema muestra `0 pólizas` y una distribución vacía
3.3. El control "+" sigue disponible y redirige a Cotizar (REF CU-23-Cartera_Dar_de_Alta_Cliente)
3.4. **FIN**

*Postcondiciones*
1. No se modifica ningún cliente ni póliza
2. El PAS queda viendo el total y la distribución de las pólizas vigentes de su cartera
3. Desde la misma pantalla puede buscar clientes, abrir una ficha o sumar una póliza con "+"

*Reglas de negocio asociadas*
RN_1: El total del gráfico cuenta **pólizas vigentes, no clientes**.
RN_2: Una póliza vigente se cuenta una sola vez en el ramo al que pertenece.
RN_3: La cantidad de los ramos debe sumar la cantidad total de pólizas vigentes.
RN_4: El porcentaje de un ramo es su cantidad de pólizas vigentes dividida por el total de pólizas vigentes de la cartera.
RN_5: Solo se muestran en la leyenda los ramos con al menos una póliza vigente.
RN_6: El PAS no ve pólizas de la cartera de otro PAS.
RN_7: La distribución es una consulta; no reemplaza el detalle de cada póliza (REF CU-27-Cartera_Ver_Detalle_Poliza).
RN_8: En Cartera solo se exponen las pólizas vigentes. Una póliza que no está vigente no entra al total ni a la leyenda.
RN_9: Si el cliente retiró su bien, pasa a Lead y sus pólizas dejan de integrar esta distribución (REF CU-08a-Pendientes_Contactar_Lead).
RN_10: "+" no incorpora un cliente suelto. Redirige a Cotizar, y el cliente entra a la cartera solo con una cobertura o póliza asociada, vigente o no (REF CU-23-Cartera_Dar_de_Alta_Cliente).

*Supuestos a confirmar*
SUP_1: Si el gráfico debe recalcularse al aplicar los filtros de Compañía, Localidad o Ramo. En el prototipo permanece sobre la cartera completa.
SUP_2: Cómo se registra que el cliente retiró el bien, para que sus pólizas salgan de este gráfico y el cliente pase a Lead.
SUP_3: Cómo se resuelve el redondeo de porcentajes para que la suma visible sea 100%.
SUP_4: Si Accidentes Personales integra el gráfico. El prototipo actual solo contiene Automotor, Hogar y ART.

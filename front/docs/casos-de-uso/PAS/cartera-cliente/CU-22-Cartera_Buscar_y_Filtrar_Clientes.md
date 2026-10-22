## CU-22-Cartera_Buscar_y_Filtrar_Clientes

*Actor principal:* PAS  
*Actor secundario:* DB USUARIOS

*Precondiciones:* El PAS tiene la sesión abierta (REF CU-01-Acceso_Iniciar_Sesion). Hay conexión.  
*Disparador:* Encontrar un cliente de su cartera

*Flujo principal*

1. El PAS abre "Cartera"
2. El sistema muestra "Buscar clientes", el control "+" y permite buscar por nombre y filtrar por `COMPAÑIA`, `LOCALIDAD` y `RAMO`
3. El PAS escribe parte del nombre del cliente y, si lo necesita, selecciona uno o más filtros (*ALT SUMAR POLIZA)
4. El sistema combina la búsqueda y los filtros y muestra la cantidad de clientes encontrados. Solo entran clientes con al menos una póliza vigente
5. Por cada cliente muestra nombre y apellido o razón social, y de sus pólizas vigentes: ramo, compañía, localidad y número de póliza (*ALT VARIAS POLIZAS)
6. El PAS selecciona un cliente
7. El sistema abre su ficha (REF CU-25-Cartera_Ver_Ficha_Cliente)

*Flujos alternativos*

`

1. El sistema combina la búsqueda y los filtros`

4.1. Ningún cliente coincide
4.2. El sistema muestra "Ningún cliente coincide con esos filtros"
4.3. El PAS modifica la búsqueda, cambia los filtros o selecciona "Limpiar filtros"
4.4. **IR A (4)**

`

1. Por cada cliente muestra ramo, compañía, localidad y número de póliza de las vigentes`

5.1. Un cliente tiene más de una póliza vigente
5.2. El sistema muestra los ramos y las localidades sin repetir, y la cantidad de pólizas vigentes
5.3. **IR A (6)**

`

1. El PAS escribe parte del nombre del cliente`

3.1. El PAS selecciona "+"
3.2. El sistema redirige a Cotizar para sumar una póliza (REF CU-23-Cartera_Dar_de_Alta_Cliente)
3.3. **FIN**

`

1. El PAS escribe parte del nombre del cliente`

3.1. El PAS no escribe un nombre ni selecciona filtros
3.2. El sistema muestra los clientes de su cartera que tienen al menos una póliza vigente
3.3. **IR A (4)**

*Postcondiciones*

1. El PAS queda viendo los clientes de su cartera, con póliza vigente, que coinciden con la búsqueda y los filtros
2. Buscar, filtrar o abrir una ficha no modifica clientes ni pólizas
3. El PAS solo ve clientes de su cartera
4. Una póliza eliminada no aparece en este listado: ese registro está en Leads. El cliente sigue si le queda otra póliza vigente

*Reglas de negocio asociadas*
RN_1: Los filtros disponibles son Compañía, Localidad y Ramo. Cada filtro admite una opción o "Todas"/"Todos".
RN_2: La búsqueda por nombre se combina con los filtros activos.
RN_3: La cantidad mostrada corresponde a clientes únicos, no a pólizas.
RN_4: Un cliente con varias pólizas vigentes aparece una sola vez. Las pólizas que no están vigentes no se listan.
RN_5: "Limpiar filtros" quita Compañía, Localidad y Ramo. La búsqueda por nombre también debe poder limpiarse.
RN_6: Un PAS no puede buscar ni abrir clientes asignados a otro PAS.
RN_7: Hasta que el PAS no hace una primer consulta, los filtros por defecto aparecen en "Todos" y muestra los clientes de su cartera que tienen al menos una póliza vigente.
RN_8: No se puede incorporar un cliente si no tiene una cobertura o póliza asociada, vigente o no. El control "+" redirige a Cotizar (REF CU-23-Cartera_Dar_de_Alta_Cliente).
RN_9: En Cartera solo se exponen las pólizas vigentes. Eliminar una póliza manda ese registro a Leads, con el detalle del bien que se tenía asegurado, tenga o no otras vigentes. El cliente sigue en este listado si le queda al menos una. Si era la última, sale de este listado, sus datos siguen guardados y sigue en "Cliente existente" (REF CU-05-Pendientes_Ver_Pendientes, CU-10-Multicotizador_Seleccionar_o_Crear_Cliente, transicion-estados-bien.md).

*Supuestos a confirmar*
SUP_1: Si la búsqueda por nombre también consulta DNI, CUIT, teléfono y número de póliza.
SUP_2: Si la coincidencia por nombre ignora tildes y busca por cualquier parte del nombre o la razón social.
SUP_3: El orden inicial de los clientes y si el PAS puede cambiarlo.


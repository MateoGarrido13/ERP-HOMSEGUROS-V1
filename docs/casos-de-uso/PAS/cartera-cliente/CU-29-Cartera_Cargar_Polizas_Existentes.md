## CU-29-Cartera_Cargar_Polizas_Existentes
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene la sesión abierta (REF CU-01-Acceso_Iniciar_Sesion). Tiene autorización para cargar la cartera y dispone de un archivo en un formato admitido. Hay conexión.
*Disparador:* Incorporar al sistema pólizas que ya fueron emitidas fuera del ERP

*Flujo principal*
1. El PAS abre "Cartera" y selecciona "Cargar pólizas existentes"
2. El sistema informa que la carga contiene datos personales y de pólizas, muestra los campos requeridos y permite descargar el formato admitido
3. El PAS selecciona la compañía y adjunta el archivo
4. El sistema valida el formato, los campos obligatorios y que las filas correspondan a la compañía seleccionada (*ALT ARCHIVO INVALIDO)
5. El sistema compara clientes y pólizas con la cartera del PAS
6. El sistema muestra una previsualización con las cantidades de clientes nuevos, clientes existentes, pólizas nuevas, duplicados y filas con errores (*ALT ERRORES, *ALT COINCIDENCIA AMBIGUA)
7. El PAS revisa la previsualización y confirma la carga (*ALT CANCELAR)
8. El sistema crea los clientes que no existían solo si la fila trae una cobertura o póliza, vincula los existentes e incorpora las pólizas nuevas sin sobrescribir registros previos (*ALT FILA SIN POLIZA, *ALT RETIRO EL BIEN)
9. El sistema muestra el resultado de la carga y las filas que no fueron incorporadas. En Cartera quedan expuestas solo las pólizas vigentes de esa carga (*ALT FALLA DE CARGA)
10. El sistema registra el PAS, la compañía, el archivo, las cantidades procesadas, la fecha y la hora (REF CU 51)

*Flujos alternativos*

`4. El sistema valida el formato y los campos obligatorios`
4.1. El archivo está vacío, dañado, tiene un formato no admitido o no contiene las columnas requeridas
4.2. El sistema informa los errores y no incorpora ninguna fila
4.3. El PAS corrige o reemplaza el archivo
4.4. **IR A (3)**

`6. El sistema muestra las filas con errores`
6.1. Una o más filas tienen datos obligatorios vacíos o inválidos, incluido el tipo o el número de documento del cliente (REF RN_2)
6.2. El sistema identifica la fila y el motivo
6.3. El PAS descarga el detalle, corrige el archivo y vuelve a adjuntarlo
6.4. **IR A (3)**

`6. El sistema muestra una coincidencia ambigua`
6.1. Una persona del archivo podría corresponder a más de un cliente
6.2. El sistema no decide la asociación automáticamente
6.3. El PAS selecciona el cliente correcto o indica que debe crearse uno nuevo
6.4. **IR A (6)**

`8. El sistema crea los clientes que no existían solo si la fila trae una cobertura o póliza`
8.1. Una fila identifica a una persona y no trae cobertura ni póliza
8.2. El sistema no incorpora a ese cliente y marca la fila
8.3. **IR A (9)**

`8. El sistema crea los clientes que no existían solo si la fila trae una cobertura o póliza`
8.1. La fila indica que esa póliza fue eliminada
8.2. El sistema no la deja en Cartera: ese registro pasa a Leads, con el detalle del bien que se tenía asegurado. Las otras vigentes del mismo cliente siguen en Cartera (REF CU-05-Pendientes_Ver_Pendientes, transicion-estados-bien.md)
8.3. **IR A (9)**

`7. El PAS confirma la carga`
7.1. El PAS cancela
7.2. El sistema descarta la previsualización y no incorpora datos
7.3. **FIN**

`9. El sistema muestra el resultado de la carga`
9.1. Ocurre un error técnico antes de completar la importación
9.2. El sistema informa que la carga no se completó y evita dejar pólizas duplicadas
9.3. El PAS puede volver a intentar con el mismo archivo
9.4. **FIN**

*Postcondiciones*
1. Los clientes quedan en la cartera del PAS solo si la fila les asoció una cobertura o póliza, vigente o no
2. En la ficha y en la distribución por ramo se exponen únicamente las pólizas vigentes importadas (REF CU-25-Cartera_Ver_Ficha_Cliente, CU-26-Cartera_Ver_Cartera_por_Ramo)
3. Los duplicados no se vuelven a crear ni se sobrescriben
4. Si el PAS canceló o falló la carga, no quedan registros parciales que impidan reintentar
5. El resultado queda en el registro de auditoría

*Reglas de negocio asociadas*
RN_1: La carga inicial registra en el ERP una copia operativa de pólizas ya emitidas. No emite, renueva ni modifica la póliza legal de la aseguradora.
RN_2: Como mínimo, cada póliza requiere cliente identificado por tipo y número de documento (obligatorio, REF CU-10 RN_3 y cuestiones A5), compañía, ramo, número de póliza y vigencia. Los campos definitivos deben alinearse con el registro de emisión (REF CU 16).
RN_3: Una póliza de la misma compañía y con el mismo número no puede importarse dos veces.
RN_4: Un cliente existente se reutiliza; la importación no debe crear otra persona si puede identificarla de forma unívoca.
RN_5: Ninguna fila se asocia automáticamente cuando hay más de una coincidencia posible.
RN_6: El archivo y su previsualización solo son accesibles para el PAS autorizado y no exponen carteras de otros PAS.
RN_7: Los archivos temporales deben eliminarse al terminar o cancelar la carga, según la política de conservación de datos personales.
RN_8: Reintentar el mismo archivo no duplica clientes ni pólizas.
RN_9: No se puede incorporar un cliente si la fila no trae una cobertura o póliza asociada. Esa asociación puede estar vigente o no.
RN_10: Después de la carga, Cartera solo expone las pólizas vigentes. Si la fila indica que esa póliza fue eliminada, ese registro pasa a Leads con el detalle del bien asegurado. El cliente sigue en el listado y en la distribución si le queda otra vigente.

*Supuestos a confirmar*
SUP_1: Si el MVP admite Excel, CSV, archivos propios de cada aseguradora o una integración automática de vuelco.
SUP_2: Si la carga la realiza el PAS, Back-office en nombre del PAS (REF CU 52) o ambos roles con permisos distintos.
SUP_3: Los campos obligatorios y su formato por ramo, incluidos estado, prima, suma asegurada, próximo cobro, medio de pago y documento de póliza.
SUP_4: Si se permite importar las filas válidas y dejar las inválidas pendientes, o si cualquier error bloquea el archivo completo.
SUP_5: Resuelto para iteración 1 (REF cuestiones A5). Cada fila debe traer tipo y número de documento (DNI, CUIT, etc.); una fila sin documento es una fila con error y no se incorpora. Así se garantiza la unicidad en la red (REF CU-10 RN_2). Por confirmar: si los archivos de las aseguradoras suelen traer el documento.
SUP_6: El límite de tamaño y cantidad de filas, y si las cargas grandes se procesan en segundo plano.

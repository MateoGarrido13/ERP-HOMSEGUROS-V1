## CU-56-Rubrica_Consolidar_y_Presentar_Rubrica_SSN
*Actor principal:* Administrativo/Owner
*Actor secundario:* SSN (recibe la rúbrica)
*Precondiciones:* El Administrativo/Owner tiene la sesión abierta (REF CU-01-Acceso_Iniciar_Sesion). Hay un período con archivos extraídos (REF CU-55-Rubrica_Extraer_Archivos_de_Companias). Hay conexión.
*Disparador:* Entrar a la rúbrica SSN, o recibir el aviso de que los archivos del período están listos

*Flujo principal*
1. El Administrativo/Owner entra a la rúbrica SSN
2. El sistema muestra los períodos y el estado de cada uno: Pendiente, Incompleto, Listo, Presentado
3. El Administrativo/Owner abre un período en estado "Listo"
4. El sistema muestra el resultado por compañía: descargado, error o sin archivo (REF CU-55-Rubrica_Extraer_Archivos_de_Companias)
5. El sistema consolida los archivos de todas las compañías en los libros de la rúbrica del período
6. El Administrativo/Owner revisa los libros consolidados
7. El Administrativo/Owner presenta la rúbrica a la SSN. El prototipo no tiene este control y su nombre no está definido
8. El sistema deja el período en "Presentado" con fecha y usuario

*Flujos alternativos*

A1. El período está "Incompleto" (paso 3)
1. El sistema muestra qué compañías fallaron y el motivo
2. El Administrativo/Owner no puede presentar el período mientras no se resuelva (ver SUP_3)

A2. El consolidado tiene datos que no cierran, por ejemplo una póliza sin compañía o un importe vacío (paso 5)
1. El sistema marca los registros con problema y dice cuál es el problema
2. El Administrativo/Owner no puede presentar hasta corregir

A3. La presentación a la SSN falla (paso 7)
1. El sistema avisa del error
2. El período queda en "Listo" y se puede volver a intentar

A4. El período ya está "Presentado" (paso 3)
1. El sistema muestra los libros y los datos de la presentación
2. El período no se puede presentar otra vez (ver SUP_5)

*Postcondiciones*
1. El período queda en "Presentado", con fecha y usuario que lo presentó
2. Los libros presentados quedan guardados y se pueden volver a descargar
3. Si la presentación falla, el período sigue en "Listo"

*Reglas de negocio asociadas*
RN_1: La rúbrica es una obligación de la red ante la SSN. La presenta el Administrativo/Owner, no cada PAS.
RN_2: La rúbrica son libros digitales en XML o Excel.
RN_3: Solo se presenta un período "Listo". Con compañías en error no se presenta.
RN_4: Los libros salen de los archivos de las compañías y de la información que ya está en el sistema (pólizas, cobranzas). No se cargan a mano.
RN_5: Un período presentado no se modifica.
RN_6: El PAS no ve este módulo.
RN_7: El prototipo no tiene esta funcionalidad (origen N, fase Final).

*Supuestos a confirmar*
SUP_1: Si el Administrativo/Owner solo ve el estado visual o también hace el consolidado y la presentación desde el ERP.
SUP_2: Si la presentación a la SSN es directa desde el ERP, o el ERP entrega los libros y el Administrativo/Owner los sube en el sitio de la SSN.
SUP_3: Si un período con compañías en error se puede presentar parcial, con una justificación.
SUP_4: Qué formato exige la SSN para cada libro, XML o Excel, y qué columnas.
SUP_5: Si se puede rectificar un período ya presentado, y con qué acción.
SUP_6: Si el sistema avisa al Administrativo/Owner de la fecha límite de presentación y con cuánta anticipación.
SUP_7: Si la presentación queda en auditoría y con qué datos (REF CU 51).
SUP_8: Qué otros roles pueden ver los libros, por ejemplo el back-office.

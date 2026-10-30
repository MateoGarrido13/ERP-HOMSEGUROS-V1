## CU-55-Rubrica_Extraer_Archivos_de_Companias
*Actor principal:* Sistema (proceso automático mensual)
*Actor secundario:* Administrativo/Owner (ve el resultado); portales de las compañías
*Precondiciones:* Hay compañías con credenciales de portal cargadas. Hay conexión. Empezó el período a presentar.
*Disparador:* Llega la fecha mensual programada. También puede lanzarse a mano (ver SUP_2).

*Flujo principal*
1. El sistema arranca la extracción del período (mes y año)
2. Por cada compañía habilitada, un proceso aparte entra al portal con las credenciales cargadas
3. El proceso descarga los archivos de emisiones, cobranzas y rendiciones del período
4. El sistema normaliza los archivos descargados a un formato común
5. El sistema guarda los archivos de cada compañía en el almacenamiento, agrupados por período
6. El sistema registra el resultado por compañía: descargado, con error o sin archivo
7. Cuando termina la última compañía, el sistema avisa que los archivos del período están listos (REF CU-56-Rubrica_Consolidar_y_Presentar_Rubrica_SSN)

*Flujos alternativos*

A1. La compañía no responde o rechaza el ingreso al portal (paso 2)
1. El sistema marca esa compañía con error y guarda el motivo
2. Sigue con las demás compañías
3. El período queda "Incompleto" hasta resolver la compañía fallida

A2. La compañía no tiene archivos en el período (paso 3)
1. El sistema marca esa compañía como "Sin archivo" y no como error
2. El período puede completarse con esa compañía en ese estado

A3. El archivo descargado no se puede leer o no tiene el formato esperado (paso 4)
1. El sistema conserva el archivo original sin normalizar
2. Marca la compañía con error de formato y guarda el motivo

A4. Se vuelve a extraer una compañía ya descargada (paso 1)
1. El sistema reemplaza los archivos de esa compañía en ese período
2. Conserva el registro de la extracción anterior

*Postcondiciones*
1. Los archivos del período quedan guardados por compañía
2. Cada compañía tiene un resultado registrado: descargado, error o sin archivo
3. El período queda "Listo" si todas están descargadas o sin archivo, e "Incompleto" si alguna falló
4. La falla de una compañía no frena a las demás

*Reglas de negocio asociadas*
RN_1: La extracción es un proceso aparte del ERP. No bloquea lo que el PAS esté haciendo en pantalla.
RN_2: Se extraen tres tipos de archivo por compañía: emisiones, cobranzas y rendiciones.
RN_3: Una compañía que falla no corta al resto. Se reintenta por separado.
RN_4: Los archivos originales de la compañía se conservan tal cual los bajó el proceso.
RN_5: El ERP solo se entera del resultado. No participa de la descarga.
RN_6: Las credenciales de portal se usan solo para este proceso y no se muestran en pantalla.
RN_7: El prototipo no tiene esta funcionalidad (origen N, fase Final).

*Supuestos a confirmar*
SUP_1: Qué día del mes corre la extracción y qué período cubre (mes vencido, cierre de mes).
SUP_2: Si el Administrativo/Owner puede lanzarla a mano o reintentar una compañía desde el ERP, y con qué control.
SUP_3: Qué compañías entran y cuáles tienen portal sin API, a las que no se puede extraer.
SUP_4: Quién carga y mantiene las credenciales de portal de cada compañía, y dónde se guardan.
SUP_5: Qué formato tiene cada archivo de cada compañía y cuál es el formato común.
SUP_6: Cuántos reintentos automáticos se hacen y cuánto se espera entre uno y otro.
SUP_7: Si la extracción queda en auditoría y con qué datos (REF CU 51).

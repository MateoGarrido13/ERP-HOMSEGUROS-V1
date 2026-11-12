## CU-17b-Multicotizador_Cargar_Riesgo_Hogar_Consorcio_Comercio
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS tiene una cotización abierta de Hogar, Consorcio o Comercio, con el cliente ya asociado (REF CU-10). El ramo está habilitado y la compañía a consultar tiene API de cotización. Hay conexión.
*Disparador:* Cargar los datos del riesgo de ese ramo para poder comparar cotizaciones

*Flujo principal*
1. El sistema muestra el formulario de riesgo del ramo elegido (Hogar, Consorcio o Comercio)
2. El PAS completa los datos que exige ese ramo y selecciona "Comparar cotizaciones" (*ALT VOLVER)
3. El sistema valida los campos (*ALT DATOS INVALIDOS)
4. El sistema guarda el riesgo en la cotización y pasa a comparar las cotizaciones de las compañías que tengan API para ese ramo (REF CU-18)

*Flujos alternativos*

`2a. El PAS vuelve atrás`
2a.1. El PAS selecciona "Volver" antes de terminar el riesgo
2a.2. El sistema descarta los datos del riesgo cargados hasta ese momento
2a.3. El sistema conserva el cliente asociado a la cotización (REF CU-10)
2a.4. **FIN**

`3a. El sistema valida los campos`
3a.1. Falta un dato obligatorio o un valor es inválido
3a.2. El sistema marca cada campo inválido, conserva lo escrito y no avanza
3a.3. **IR A (2)**

*Postcondiciones*
1. La cotización queda con el riesgo del ramo cargado
2. El sistema pasa a comparar cotizaciones (REF CU-18) solo contra compañías con API de ese ramo
3. Si el PAS volvió atrás, la cotización conserva el cliente y no tiene riesgo cargado
4. No se contactó a ninguna compañía todavía
5. El cliente no se modifica por cargar el riesgo (REF CU-10)

*Reglas de negocio asociadas*
RN_1: Solo se carga el riesgo de una cotización que ya tiene un cliente asociado (REF CU-10).
RN_2: Este caso cubre Hogar, Consorcio y Comercio cuando el ramo está habilitado y existe API de cotización. Sin API no se abre este flujo (REF CU-09).
RN_3: Los campos del formulario son los que exige cada compañía×ramo. Van en las specs de adapter, no en este caso.
RN_4: Cargar el riesgo no consulta compañías ni genera precio; eso ocurre en CU-18.
RN_5: El patrón es el mismo que CU-17 (Automotor): cliente primero, después riesgo, después comparar.
RN_6: Cargar el riesgo no se audita; la auditoría empieza al generar la propuesta (REF CU-13, CU 51).

*Supuestos a confirmar*
SUP_1: Lista de campos por ramo (Hogar, Consorcio, Comercio) según cada API disponible.
SUP_2: Qué compañías tienen API desarrollada para cada uno de esos tres ramos.
SUP_3: Si Consorcio reutiliza datos de edificio/administrador que luego usa CU-05f (fuera de este caso).
SUP_4: El prototipo trata Hogar como solicitud sin comparar y no tiene rutas Consorcio/Comercio. Canónico: este caso y después CU-18 (REF `specs/as-built-prototipo-iteracion-1.md`). Implementar esos formularios y volcar sus campos a `poliza_consorcio` / `poliza_comercio` es issue pendiente (REF `cuestiones-a-resolver.md`).

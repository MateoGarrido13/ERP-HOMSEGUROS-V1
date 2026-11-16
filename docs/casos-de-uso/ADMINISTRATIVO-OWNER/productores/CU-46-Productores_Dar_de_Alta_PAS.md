## CU-46-Productores_Dar_de_Alta_PAS
*Actor principal:* Directivo o administrativo de HOM
*Actor secundario:* Ninguno
*Precondiciones:* El actor tiene la sesión abierta con rol `directivo` o `administrativo` (REF CU-01-Acceso_Iniciar_Sesion). Hay conexión.
*Disparador:* Incorporar un PAS a la red para que pueda ingresar al ERP

*Flujo principal*
1. El actor abre la gestión de productores de la red
2. El actor selecciona dar de alta un PAS
3. El sistema muestra el formulario: nombre, apellido, DNI, email, teléfono, matrícula SSN, `CONTRASEÑA INICIAL` y `CONFIRMACION`
4. El actor completa los campos y confirma (*ALT DATOS INVALIDOS, *ALT EMAIL EXISTE, *ALT MATRICULA EXISTE, *ALT VOLVER)
5. El sistema crea la cuenta del PAS: usuario con rol `pas` y estado `activo`, credencial de ingreso con esa contraseña inicial, y la fila de productor con esa matrícula. La cuenta queda marcada para que el PAS cambie la contraseña al recibirla
6. El sistema registra quién dio el alta, el PAS creado, la fecha y la hora (REF CU 51)
7. El PAS puede iniciar sesión con su email y la contraseña inicial (REF CU-01). En ese primer ingreso el sistema le exige cambiarla antes de operar (REF CU-02 flujo C)

*Flujos alternativos*

`4a. El sistema valida los campos`
4a.1. Falta un dato obligatorio, el email no tiene formato `algo@dominio.tld` (REF CU-01), el teléfono no tiene 10 dígitos, el DNI no es un número, la matrícula no es solo dígitos de longitud 3 a 8, la contraseña inicial no cumple la política vigente, o no coincide con la confirmación (REF CU-02 RN_4)
4a.2. El sistema marca cada campo inválido, conserva lo escrito y no crea la cuenta
4a.3. **IR A (4)**

`4b. El email ya pertenece a un usuario`
4b.1. El email (normalizado: recortado y en minúscula) ya existe en la base de usuarios
4b.2. El sistema informa que ese email ya está registrado y no crea otra cuenta
4b.3. **IR A (4)**

`4c. La matrícula ya pertenece a un productor`
4c.1. La matrícula SSN ya está asignada a otro PAS
4c.2. El sistema informa que esa matrícula ya está en uso y no crea otra cuenta
4c.3. **IR A (4)**

`4d. El actor cancela`
4d.1. El actor vuelve atrás sin confirmar
4d.2. El sistema no crea usuario, credencial ni productor
4d.3. **FIN**

`1a. Quien opera no puede dar de alta`
1a.1. El actor es un PAS, o no hay sesión
1a.2. El sistema no muestra el alta de productores
1a.3. **FIN**

*Postcondiciones*
1. Existe un usuario `pas` / `activo` con ese email, y una fila `productor` con la misma identidad y la matrícula informada
2. Ese PAS puede ingresar con la contraseña inicial (REF CU-01). Un PAS no se registró solo. Hasta que cambie esa contraseña, no opera el ERP (REF CU-02 flujo C)
3. No se creó un cliente ni una póliza
4. El alta queda en el registro de auditoría (REF CU 51)
5. Si el actor canceló o la validación falló, no queda ninguna cuenta a medias

*Reglas de negocio asociadas*
RN_1: Las altas de usuarios no son autogestionadas. Las absorben los roles `directivo` y `administrativo`. Un PAS no se registra solo. No hay alta desde la pantalla de ingreso (REF CU-01 RN_1, RN_2).
RN_2: Este caso da de alta solo un PAS. El alta de directivo o administrativo no está en este caso (REF CU-01 SUP_2, CU-48). Ambos roles (`directivo` y `administrativo`) pueden ejecutar este alta.
RN_3: El email es único en la red de usuarios, se normaliza (recortado y minúscula) y usa el mismo formato que el ingreso (REF CU-01). No se cambia desde el perfil (REF CU-03 SUP_2).
RN_4: La matrícula SSN es obligatoria, única, solo dígitos, longitud 3 a 8, sin guiones ni espacios. Vive en `productor`, no en el perfil editable (REF CU-03 RN_2).
RN_5: Nombre, apellido, DNI y teléfono son obligatorios. El teléfono tiene 10 dígitos. Rol, matrícula y organización los asigna la organización; el PAS no los edita en su perfil (REF CU-03).
RN_6: El PAS nace `activo`. Suspender o dar de baja es CU-47. Cambiar roles es CU-48.
RN_7: El PAS queda en la misma organización que quien lo da de alta.
RN_8: Quien da el alta indica la `CONTRASEÑA INICIAL` (y su confirmación). Cumple la política vigente y no se guarda en la tabla de usuario (REF CU-02 RN_4, CU-01). Por seguridad, el PAS debe cambiarla al recibir la cuenta: en el primer ingreso el sistema exige el cambio (REF CU-02 flujo C) y no abre Pendientes hasta que la nueva sea distinta de la inicial.
RN_9: Un PAS no da de alta a otro PAS.

*Supuestos a confirmar*
SUP_1: Resuelto. Quien da el alta indica la contraseña inicial. El PAS la cambia al recibir la cuenta, en el primer ingreso, antes de operar (REF CU-02 flujo C).
SUP_2: Si el DNI del usuario ERP debe ser único en la red (hoy el esquema solo exige unicidad de email y de matrícula).
SUP_3: Dónde vive la pantalla (dashboard de la red, REF CU-40, u otra sección de productores). El prototipo no tiene este flujo.
SUP_4: Resuelto. Directivo y administrativo tienen el mismo permiso de alta. Ninguna alta es autogestionada.
SUP_5: Qué ve el actor tras un alta exitosa: ficha del PAS, listado, o solo un aviso.
SUP_6: El alta de directivo y administrativo sigue fuera de este caso; hoy esas cuentas se cargan a mano / seed (REF CU-01 SUP_2).

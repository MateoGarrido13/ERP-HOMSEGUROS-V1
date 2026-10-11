*CU-Acceso-02-Recuperar_o_Cambiar_Contrasena*
*Actor principal:* Usuario del ERP (PAS, directivo o administrativo)
*Actor secundario:* Servicio de correo
*Precondiciones:* La cuenta existe y está activa (REF CU 51, CU 52). Hay conexión. Para recuperar, el usuario no está autenticado. Para cambiar, el usuario tiene la sesión abierta (REF CU-Acceso-01).
*Disparador:* El usuario no recuerda la contraseña, o quiere reemplazarla

*Flujo principal*
1. En la pantalla de ingreso, el usuario selecciona "Olvidé mi contraseña"
2. El sistema pide el `EMAIL` de la cuenta
3. El usuario carga el email y selecciona "Enviar"
4. El sistema verifica el formato del email (*ALT EMAIL)
5. El sistema busca la cuenta (*ALT EMAIL NO REGISTRADO)
6. El sistema genera un enlace de un solo uso, con vencimiento, y lo envía al correo (*ALT CORREO)
7. El sistema informa que, si el email está registrado, va a llegar un mensaje para elegir una contraseña nueva
8. El usuario abre el enlace del correo
9. El sistema valida que el enlace siga vigente y que no se haya usado (*ALT ENLACE)
10. El sistema pide `CONTRASEÑA NUEVA` y `CONFIRMACION`
11. El usuario carga las dos y selecciona "Guardar"
12. El sistema verifica que coincidan y que la nueva cumpla la política vigente (*ALT CONTRASEÑA NUEVA)
13. El sistema reemplaza la contraseña, invalida el enlace y deja sin efecto la contraseña anterior
14. El sistema registra el cambio: usuario, fecha y hora, sin guardar la contraseña (REF CU 56)
15. El sistema vuelve a la pantalla de ingreso (REF CU-Acceso-01)

*Flujos alternativos*

`4. El sistema verifica el formato del email`
4.1. El email está vacío o no tiene formato válido
4.2. El sistema marca el campo y no busca la cuenta
4.3. **IR A (3)**

`5. El sistema busca la cuenta`
5.1. El email no está registrado, o la cuenta está suspendida o dada de baja
5.2. El sistema muestra el mismo aviso del paso 7 y no envía un enlace
5.3. **FIN**

`6. El sistema genera un enlace de un solo uso y lo envía al correo`
6.1. El servicio de correo no responde o excede el tiempo
6.2. El sistema informa que no pudo enviar el mensaje. El enlace no queda emitido
6.3. **IR A (3)**

`9. El sistema valida que el enlace siga vigente y que no se haya usado`
9.1. El enlace está vencido o ya se usó
9.2. El sistema informa que hay que pedir uno nuevo
9.3. **IR A (2)**

`12. El sistema verifica que coincidan y que la nueva cumpla la política vigente`
12.1. Las dos contraseñas no coinciden, la nueva no cumple la política, o es igual a la anterior
12.2. El sistema marca el campo y no reemplaza la contraseña
12.3. **IR A (10)**

`Cambiar la contraseña con la sesión abierta`
C.1. El usuario abre Perfil y selecciona "Cambiar contraseña" (REF CU-Acceso-03)
C.2. El sistema pide `CONTRASEÑA ACTUAL`, `CONTRASEÑA NUEVA` y `CONFIRMACION`
C.3. El usuario completa los tres campos y selecciona "Guardar"
C.4. Si la contraseña actual no coincide, el sistema informa el error y no guarda. **IR A (C.2)**
C.5. **IR A (12)**

*Postcondiciones*
1. La contraseña anterior deja de servir para iniciar sesión, se actualizan los datos de inicio en la db
2. El enlace de recuperación, si se usó, queda invalidado
3. El cambio queda en el registro de auditoría, sin la contraseña
4. El usuario queda en la pantalla de ingreso y entra con la contraseña nueva (REF CU-Acceso-01)

*Reglas de negocio asociadas*
RN_1: Recuperar no exige estar autenticado. Cambiar sí exige la sesión abierta y la contraseña actual.
RN_2: El aviso del envío es el mismo si el email no está registrado o si la cuenta no está activa.
RN_3: El enlace es de un solo uso y vence. No se muestra la contraseña en el correo.
RN_4: La contraseña nueva tiene que cumplir la política vigente y tiene que ser distinta de la anterior.
RN_5: Una cuenta suspendida o dada de baja no recibe enlace de recuperación.
RN_6: El registro de auditoría anota el cambio y no guarda la contraseña.

*Supuestos a confirmar*
SUP_1: El canal del enlace es el correo, no WhatsApp.
SUP_2: Cuánto tiempo permanece vigente el enlace.
SUP_3: Cuál es la política de la contraseña (largo mínimo, y si exige número o símbolo).
SUP_4: Al guardar la contraseña nueva, si se cierran las otras sesiones de ese usuario.

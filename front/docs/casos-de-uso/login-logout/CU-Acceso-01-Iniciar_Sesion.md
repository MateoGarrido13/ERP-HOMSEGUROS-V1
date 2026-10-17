*CU-Acceso-01-Iniciar_Sesion*
*Actor principal:* Usuario del ERP (PAS, directivo o administrativo)
*Actor secundario:* Base de usuarios del ERP
*Precondiciones:* La organización ya dio de alta la cuenta con email y contraseña (REF CU 51). El usuario no tiene una sesión vigente en este dispositivo. Hay conexión.
*Disparador:* Entrar al ERP

*Flujo principal*
1. El sistema muestra la pantalla de ingreso, con `EMAIL` y `CONTRASEÑA`, y sin el menú de la aplicación
2. El usuario carga `EMAIL` y `CONTRASEÑA`
3. El usuario selecciona "Ingresar"
4. El sistema verifica que el email tenga formato válido y que la contraseña no esté vacía (*ALT CAMPOS)
5. El sistema busca la cuenta por email (*ALT CREDENCIALES)
6. El sistema verifica que la cuenta esté activa
7. El sistema compara la contraseña con la guardada (*ALT CREDENCIALES)
8. El sistema abre una sesión asociada a ese usuario, a su rol y al alcance de datos de ese rol
9. El sistema registra el ingreso EN SUS LOGS: usuario, rol, fecha y hora (REF CU 56)
10. El sistema abre la pantalla de inicio del rol: el PAS entra a Pendientes; el directivo y el administrativo entran al dashboard de la red (REF CU 45)

*Flujos alternativos*

`1. El sistema muestra la pantalla de ingreso`
1.1. En este dispositivo ya hay una sesión vigente
1.2. El sistema abre la pantalla de inicio del rol y no vuelve a pedir la contraseña
1.3. **FIN**

`4. El sistema verifica que el email tenga formato válido y que la contraseña no esté vacía`
4.1. Falta un campo o el email no tiene formato válido
4.2. El sistema marca el campo y no consulta la base de usuarios
4.3. **IR A (2)**

`5. El sistema busca la cuenta por email` / `7. El sistema compara la contraseña con la guardada`
5.1. El email no está registrado, o la contraseña no coincide
5.2. El sistema informa "Email o contraseña incorrectos" y no indica cuál de los dos falló
5.3. **IR A (2)**


*Postcondiciones*
1. La sesión queda abierta y asociada al usuario, a su rol y a su alcance de datos
2. El ingreso queda asentado en el registro de auditoría, con fecha y hora
3. El PAS queda en Pendientes; el directivo y el administrativo quedan en el dashboard de la red

*Reglas de negocio asociadas*
RN_1: El ingreso es con email y contraseña. No hay alta de cuenta desde esta pantalla.
RN_2: La cuenta la crea la organización. Un PAS no se registra solo.
RN_3: Ante email inexistente o contraseña incorrecta, el aviso es el mismo.
RN_4: Una cuenta suspendida o dada de baja no obtiene sesión.(se borro de la bd)
RN_5: La sesión de un PAS alcanza solo su cartera. La del directivo y la del administrativo alcanzan la red.
RN_6: Cada ingreso queda en el registro de auditoría.

*Supuestos a confirmar*
SUP_1: El PAS aterriza en Pendientes y el directivo/administrativo en el dashboard de la red.
SUP_2: Quién da de alta la cuenta del directivo y del administrativo. El CU 51 cubre el alta de un PAS.
SUP_3: Cuánto dura la sesión y si un mismo usuario puede tener más de una sesión abierta.
SUP_4: Si hay un tope de intentos fallidos y qué pasa al superarlo.

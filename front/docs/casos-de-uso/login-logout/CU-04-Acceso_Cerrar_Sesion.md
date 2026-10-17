## CU-04-Acceso_Cerrar_Sesion
*Actor principal:* Usuario del ERP (PAS, directivo o administrativo)
*Actor secundario:* Ninguno
*Precondiciones:* El usuario tiene la sesión abierta (REF CU-01-Acceso_Iniciar_Sesion).
*Disparador:* Salir del ERP en este dispositivo

*Flujo principal*
1. El usuario autenticado selecciona "Cerrar sesión" desde Perfil (REF CU-03-Acceso_Ver_y_Editar_Perfil)
2. El sistema pide confirmación
3. El usuario confirma
4. El sistema invalida la sesión de este dispositivo
5. El sistema limpia los datos de sesión guardados en el dispositivo
6. El sistema registra el cierre: usuario, fecha y hora (REF CU 56)
7. El sistema muestra la pantalla de ingreso, sin el menú de la aplicación (REF CU-01-Acceso_Iniciar_Sesion)

*Flujos alternativos*

`3. El usuario confirma`
3.1. El usuario cancela la confirmación
3.2. La sesión sigue abierta y el usuario permanece en la pantalla en la que estaba
3.3. **FIN**

`4. El sistema invalida la sesión de este dispositivo`
4.1. La sesión ya estaba vencida cuando el usuario confirma
4.2. El sistema limpia el dispositivo y muestra la pantalla de ingreso
4.3. **IR A (7)**

*Postcondiciones*
1. La sesión de este dispositivo queda cerrada y no se puede reutilizar
2. El cierre queda en el registro de auditoría
3. Para volver a cotizar, ver cartera, pendientes o perfil, el usuario tiene que iniciar sesión de nuevo

*Reglas de negocio asociadas*
RN_1: Cerrar sesión deja sin efecto la sesión de este dispositivo.
RN_2: Sin sesión vigente, las secciones del ERP no se abren. El sistema muestra la pantalla de ingreso.
RN_3: Cancelar la confirmación mantiene la sesión.
RN_4: El cierre queda en el registro de auditoría.

*Supuestos a confirmar*
SUP_1: "Cerrar sesión" vive en Perfil.
SUP_2: Cerrar sesión en un dispositivo deja abiertas las sesiones de los otros dispositivos de ese usuario.
SUP_3: Si hay una cotización en curso sin guardar, el sistema avisa que se pierde antes de confirmar el cierre (REF CU 20).

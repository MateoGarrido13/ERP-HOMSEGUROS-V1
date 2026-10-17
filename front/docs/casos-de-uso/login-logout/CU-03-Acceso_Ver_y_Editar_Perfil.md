## CU-03-Acceso_Ver_y_Editar_Perfil
*Actor principal:* Usuario del ERP (PAS, directivo o administrativo)
*Actor secundario:* Base de datos 'Usuarios'
*Precondiciones:* El usuario tiene la sesión abierta (REF CU-01-Acceso_Iniciar_Sesion). Hay conexión.
*Disparador:* Consultar o actualizar los datos del propio perfil

*Flujo principal*
1. El usuario abre la sección "Perfil"
2. El sistema muestra `NOMBRE`, `ROL`, `MATRICULA` y `ORGANIZACION`
3. El sistema muestra el teléfono de contacto
4. El usuario selecciona "Editar"
5. El sistema habilita `NOMBRE` y `TELEFONO`. Deja en solo lectura el rol, la matrícula y la organización
6. El usuario modifica los campos habilitados
7. El usuario selecciona "Guardar"
8. El sistema valida nombre y teléfono (*ALT DATOS)
9. El sistema guarda los cambios y registra usuario, fecha y hora (REF CU 56)
10. El sistema vuelve a mostrar el perfil en solo lectura, con los datos nuevos
11. Si el usuario necesita otra contraseña, selecciona "Cambiar contraseña" (REF CU-02-Acceso_Recuperar_o_Cambiar_Contrasena)

*Flujos alternativos*

`7. El usuario selecciona "Guardar"`
7.1. El usuario selecciona "Cancelar"
7.2. El sistema descarta lo escrito en esta edición y no toca la base
7.3. **IR A (2)**

`8. El sistema valida nombre y teléfono`
8.1. El nombre queda vacío o el teléfono no tiene la cantidad de dígitos esperada
8.2. El sistema marca el campo y no guarda
8.3. **IR A (6)**

*Postcondiciones*
1. Nombre y teléfono quedan actualizados en la ficha del usuario
2. Rol, matrícula y organización siguen como los asignó la organización
3. El cambio queda en el registro de auditoría
4. Las propuestas y los mensajes que armen después de este caso usan el nombre actualizado

*Reglas de negocio asociadas*
RN_1: Cada usuario ve y edita su propio perfil. Un PAS no abre el perfil de otro PAS.
RN_2: Rol, matrícula y organización se muestran y no se editan en este caso. Los asigna la organización (REF CU 51, CU 53).
RN_3: El nombre y el teléfono de contacto los actualiza el propio usuario.
RN_4: Cancelar la edición no persiste cambios.
RN_5: El cambio de contraseña no se resuelve en este caso. Sigue el CU-02-Acceso_Recuperar_o_Cambiar_Contrasena.

*Supuestos a confirmar*
SUP_1: Los campos editables por el usuario son el nombre y el teléfono. El prototipo hoy solo muestra nombre, rol, matrícula y organización.
SUP_2: Si el email de ingreso se cambia desde el perfil o solo lo cambia la organización.
SUP_3: Si el directivo y el administrativo tienen matrícula en la ficha, o ese dato es solo del PAS.
SUP_4: Si el nombre editado reemplaza el que ya figura en propuestas ya generadas, o solo en las próximas.

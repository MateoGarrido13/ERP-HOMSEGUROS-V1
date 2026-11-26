# Spec: Layout de escritorio para las pantallas del PAS (sin clave Jira)

| | |
|---|---|
| **US** | Sin clave Jira todavía. Cubre la versión de escritorio de las pantallas de ERP-5, ERP-6, ERP-7, ERP-8 y ERP-17 |
| **Épica** | Acceso (con alcance sobre Pendientes) |
| **CU origen** | CU-01 a CU-04 `docs/casos-de-uso/login-logout/`; CU-05 `docs/casos-de-uso/PAS/pendientes/CU-05-Pendientes_Ver_Pendientes.md` |
| **Tipo** | Pantalla/UI |
| **Estado** | Aprobada |
| **Autor** | Yaco10 con IA |
| **Revisor** | Yaco10 (autoaprobada, proyecto individual) |
| **Fecha** | 2026-11-26 (aprobada 2026-11-26) |

## 1. Contexto y objetivo

Las pantallas de Acceso, Perfil y Pendientes se implementaron pensando solo en mobile (frames de 390×844). El Figma ya trae la versión de escritorio de las mismas pantallas del PAS (frames de 1440×900), y hoy el front las muestra como una columna angosta con barra de navegación inferior. Esta spec define cómo se adapta lo ya implementado a escritorio, una sola vez y de forma transversal, y fija la regla para las specs futuras (ver sección 4.1).

**Objetivo:** en pantallas anchas, las pantallas implementadas de Acceso, Perfil y Pendientes se ven como en los frames de PC del PAS, y en pantallas angostas siguen viéndose y funcionando igual que hoy.

## 2. Alcance

**Dentro:**
- Contenedor de la app (`AppShell`): menú lateral en escritorio, barra inferior en mobile.
- Acceso: login, login con error y recuperar contraseña (pasos 1, 2 y 3) con el layout de dos paneles.
- Perfil: ver, editar, editar con error y diálogo de cerrar sesión.
- Pendientes: lista (con datos y vacía) con Avisos y Leads lado a lado.
- Pantalla de cambiar contraseña (`/perfil/contrasena`), que no tiene diseño de PC propio (ver SUP-2).
- Corrección de textos del diseño que contradicen lo ya decidido (sección 4.2, tabla de diferencias).

**Fuera de alcance:**
- Detalle de Aviso y de Lead (frames "PAS PC · Pendientes · Aviso" y "· Lead"): sus acciones (Resolver, WhatsApp, Enviar cotización, Reactivar, Descartar, Editar descripción) no tienen spec. Se especifican con su feature.
- Ítems de menú sin pantalla (Cotizar, Cartera, Siniestros): se agregan cuando existan.
- Diseño web de directivo y administrativo ("Broker · web"): hoy son wireframes. Solo reciben el menú lateral con sus ítems actuales (SUP-4).
- Corregir el Figma. Los textos y campos que difieren de las decisiones tomadas se listan en 4.2 para que quien mantiene el diseño los actualice.
- Cambios de datos, permisos o contratos: ninguno.

## 3. Componentes afectados

| Qué | Dónde | Cambio |
|---|---|---|
| Contenedor de la app | `front/src/components/layout/app-shell.tsx` | modificado: menú lateral en escritorio, barra inferior en mobile |
| Layout de acceso | `front/src/app/(publico)/` (login y recuperar) | modificado: dos paneles en escritorio |
| Formularios de acceso | `front/src/components/auth/login-form.tsx`, `recover-form.tsx`, `reset-password-form.tsx` | modificado: textos de ayuda y vigencia |
| Perfil | `front/src/components/auth/profile-screen.tsx`, `phone-field.tsx` | modificado: avatar y edición en dos columnas |
| Cambiar contraseña | `front/src/components/auth/change-password-form.tsx`, `front/src/app/(app)/perfil/contrasena/` | modificado: ancho y alineación |
| Cerrar sesión | `front/src/components/auth/logout-button.tsx` | modificado: diálogo centrado en escritorio |
| Pendientes | `front/src/components/pendientes/` (`pending-board`, `lead-board`, `notice-card`, `lead-card`, `pager`) | modificado: dos columnas |
| Lógica / datos | — | sin cambios |

## 4. Diseño

Un único punto de corte separa mobile de escritorio. Por debajo, todo queda como está; por encima, se aplica el layout de PC. No se duplican pantallas ni rutas: es la misma pantalla con clases responsive (Tailwind v4, prefijo del punto de corte). Las reglas de negocio, validaciones, acciones del servidor y textos de error no cambian.

El punto de corte es el mismo que usa la paginación de Pendientes (5 en mobile, 10 en escritorio, ERP-17 PA-2), para que lo que ve el usuario sea coherente.

### 4.1 Flujo

No cambia ningún flujo. Para las specs futuras se fija esta regla: **toda spec de pantalla incluye mobile y escritorio desde el inicio** (sección 4.2 de cada spec, con su frame de PC). Se agrega al template `docs/templates/template-spec.md` en el mismo PR que apruebe esta spec.

### 4.2 Pantallas y estados

Referencia de diseño (Figma, archivo `dqM3vmFc3i8F3FyKIqiXvD`): Acceso PC `80:794`, Perfil PC `80:938`, Pendientes PC `80:1355`.

| Pantalla | Mobile (sin cambios) | Escritorio |
|---|---|---|
| Contenedor | Barra de navegación inferior | Menú lateral izquierdo de 240 px con logo arriba y la lista de ítems; el ítem de la pantalla actual va resaltado; la barra inferior no se muestra |
| Login, error de login, recuperar 1, 2 y 3 | Una columna | Dos paneles: izquierdo de marca (ilustración y mensaje "Bienvenido al Portal PAS"), derecho con el formulario centrado de 360 px y pie "Portal PAS · HOM Seguros". Recuperar 1 a 3 llevan el enlace "Volver" arriba a la izquierda del panel derecho |
| Perfil · ver | Una columna | Título, avatar con iniciales, tarjeta de datos de ancho fijo (560 px) y botones Editar, Cambiar contraseña y Cerrar sesión en una fila |
| Perfil · editar y editar con error | Una columna | Formulario de dos columnas: Nombre y Teléfono arriba; Rol y Matrícula debajo; Organización al final. El teléfono sigue en tres partes (decisión 2026-11-26). Enlace "Perfil" de vuelta arriba |
| Cerrar sesión | Diálogo | Diálogo modal centrado de 420 px con fondo atenuado y los botones Cerrar sesión y Cancelar |
| Pendientes · lista | Avisos y Leads apilados, 5 por página | Avisos y Leads lado a lado, cada uno con su contador ("3 avisos", "2 leads") y 10 por página |
| Pendientes · vacío | Mensajes de vacío apilados | Dos columnas, cada una con "No tenés avisos por ahora." y "No tenés leads por ahora." |

- Navegación de entrada y de salida: igual que hoy. Las tarjetas de Pendientes mantienen su comportamiento actual; el detalle de Aviso y Lead queda fuera de alcance.
- Menú lateral por rol: PAS = Pendientes y Perfil; directivo y administrativo = Red y Perfil. Solo se muestran ítems con pantalla existente (épica de Acceso 4.2; decisión 2026-11-26).
- Accesibilidad: el menú lateral es un `nav` con el ítem actual marcado con `aria-current="page"`; el diálogo atrapa el foco y se cierra con Escape (comportamiento actual, a conservar).

**Diferencias entre el diseño de PC y lo decidido (se implementa lo decidido).** El 2026-11-26 se actualizó el Figma para los cuatro primeros puntos, tanto en las pantallas de PC como en las de mobile. El menú no se tocó: el diseño muestra el menú final y la implementación va agregando ítems a medida que existen sus pantallas.

| Dónde | Dice el Figma | Se implementa | Fuente |
|---|---|---|---|
| Teléfono (editar perfil) | Un solo campo | Tres partes: prefijo (por defecto +54), área y número | ERP-7, decisión 2026-11-26 |
| Recuperar 2 · vigencia | "Vence en 30 minutos" | "Vence en 24 horas" | ERP-6 PA-2 y `otp_expiry = 86400`, decisión 2026-11-26 |
| Recuperar 3 · ayuda | "Mínimo 8 caracteres" | El texto de la política vigente (8 o más caracteres con mayúscula, minúscula y número) | ERP-6 SUP-1 |
| Editar perfil · nombre | Placeholder "Nombre y apellido" | Campo "Nombre"; el apellido no se edita | ERP-7 |
| Menú | Cotizar, Cartera, Siniestros, Pendientes, Perfil | Solo los ítems con pantalla implementada | Decisión 2026-11-26 |

## 5. Reglas de negocio

| # | Regla | Origen |
|---|---|---|
| RN-1 | El escritorio no cambia ninguna regla de negocio, validación ni mensaje de las pantallas implementadas | ERP-5, ERP-6, ERP-7, ERP-8, ERP-17 |
| RN-2 | Paginación de Pendientes: 5 por página en mobile y 10 en escritorio, según el ancho de pantalla | ERP-17 PA-2 |
| RN-3 | El menú muestra solo ítems cuyas pantallas existen, según el rol | Épica de Acceso 4.2 |

## 6. Casos borde y manejo de errores

| Situación | Comportamiento esperado |
|---|---|
| Se cambia el ancho de la ventana al cruzar el punto de corte | El layout cambia sin recargar y sin perder lo escrito en un formulario |
| Cruzar el punto de corte en Pendientes con una página elegida | La página se ajusta al nuevo tamaño sin salirse del rango y sin repetir ni perder registros |
| Ancho intermedio (tablet) | Se aplica el layout según el punto de corte; ninguna pantalla scrollea en horizontal |
| Pantalla de escritorio muy ancha | El contenido mantiene sus anchos fijos de diseño y no se estira |
| Un rol cuyo menú tiene un solo ítem implementado además de Perfil | El menú lateral muestra solo lo implementado, sin ítems vacíos |
| Diálogo de cerrar sesión abierto al redimensionar | El diálogo se mantiene abierto y centrado |

## 7. Criterios de aceptación verificables

- [ ] CA-1: Con ancho igual o mayor al punto de corte, las pantallas autenticadas muestran el menú lateral y no la barra inferior; por debajo, se ve la barra inferior y no el lateral.
- [ ] CA-2: El menú lateral del PAS muestra Pendientes y Perfil; el de directivo y administrativo, Red y Perfil. El ítem de la pantalla actual está resaltado y marcado con `aria-current="page"`.
- [ ] CA-3: Login, login con error y recuperar 1, 2 y 3 se ven en escritorio con dos paneles y el formulario del panel derecho centrado; en mobile se ven como antes.
- [ ] CA-4: "Revisá tu correo" indica que el enlace vence en 24 horas y la ayuda de nueva contraseña muestra la política vigente completa.
- [ ] CA-5: Perfil en escritorio muestra avatar con iniciales, tarjeta de datos y los tres botones en una fila.
- [ ] CA-6: Editar perfil en escritorio muestra Nombre y Teléfono en dos columnas, con el teléfono en tres partes; guardar, cancelar y los errores se comportan igual que en mobile.
- [ ] CA-7: Cerrar sesión muestra un diálogo centrado con fondo atenuado en escritorio; Cancelar y Escape lo cierran sin cerrar sesión.
- [ ] CA-8: Pendientes en escritorio muestra Avisos y Leads lado a lado con sus contadores y 10 registros por página; en mobile, 5.
- [ ] CA-9: Pendientes sin registros muestra, en escritorio, un mensaje de vacío por columna.
- [ ] CA-10: Ninguna pantalla scrollea en horizontal a 390, 768, 1024 y 1440 px de ancho.
- [ ] CA-11: Los tests existentes de Acceso, Perfil y Pendientes siguen pasando sin modificarse, y a 390 px de ancho las pantallas se ven como antes de este cambio.
- [ ] CA-12: El template `docs/templates/template-spec.md` exige indicar el frame de escritorio en la sección 4.2.

> CA-1 a CA-10 se validan en el navegador con la lista de prueba manual de la épica; CA-11 con `tsc`, `lint`, tests y revisión visual a 390 px.

## 8. Decisiones descartadas

| Alternativa | Por qué no |
|---|---|
| Una spec por pantalla para escritorio | Las 14 pantallas del PAS son las mismas de mobile en otro tamaño: no hay flujo ni regla nueva que justifique specs separadas |
| Rutas distintas para escritorio y mobile | Duplica pantallas y pruebas; el responsive resuelve el cambio con la misma ruta |
| Implementar escritorio dentro de cada spec futura sin una base común | Cada feature rehace el contenedor y el menú, con riesgo de inconsistencias |
| Seguir el Figma con un solo campo de teléfono | Contradice ERP-7 (tres partes, validación de 10 dígitos) |
| Mostrar todos los ítems del menú con los no disponibles deshabilitados | Decisión 2026-11-26: solo lo implementado |

## 9. Supuestos

- [x] SUP-1: El punto de corte entre mobile y escritorio es 1024 px (`lg` de Tailwind). El Figma solo trae frames de 390 y 1440 px. → *confirmado por: Yaco10, 2026-11-26*
- [x] SUP-2: La pantalla de cambiar contraseña (`/perfil/contrasena`) no tiene frame de PC. Se asume el mismo tratamiento que "Editar perfil": mismo menú lateral, formulario de 360 px alineado a la izquierda del contenido y botones debajo. → *confirmado por: Yaco10, 2026-11-26*
- [x] SUP-3: El avatar del perfil muestra las iniciales de nombre y apellido, como en el frame de PC. → *confirmado por: Yaco10, 2026-11-26*
- [x] SUP-4: El menú lateral aplica a todos los roles con sus ítems actuales. El diseño web de directivo y administrativo es un wireframe y no se implementa más allá de eso. → *confirmado por: Yaco10, 2026-11-26*
- [x] SUP-5: El detalle de Aviso y de Lead no se implementa hasta tener su spec; las tarjetas de Pendientes conservan su comportamiento actual en escritorio. → *confirmado por: Yaco10, 2026-11-26*

## 10. Preguntas abiertas

- [x] PA-1: El panel de marca del login muestra en Figma una ilustración placeholder. → Se implementa un panel con color de fondo suave y el mensaje "Bienvenido al Portal PAS", sin imagen; la ilustración se agrega cuando exista. *decidió: Yaco10, 2026-11-26*
- [x] PA-2: ¿Quién actualiza el Figma con las diferencias de la sección 4.2? → Lo actualiza el agente conectado a Figma (con aval de Yaco10). *decidió: Yaco10, 2026-11-26*

## 11. Historial de cambios

| Fecha | Cambio | Motivo | PR |
|---|---|---|---|
| 2026-11-26 | Aprobada. Se agrega al template de spec el frame de escritorio en 4.2 (CA-12) | Aprobación de Yaco10 | |
| 2026-11-26 | Figma actualizado: vigencia de 24 horas, ayuda de contraseña con la política completa, placeholder "Nombre" y teléfono en tres partes (PC y mobile) | PA-2 | |
| 2026-11-26 | Resueltos SUP-1 a SUP-5 y PA-1 y PA-2 (punto de corte 1024 px; cambiar contraseña como Editar perfil; avatar con iniciales; menú lateral para todos los roles; detalle de Aviso y Lead fuera de alcance; panel de marca con color y mensaje; Figma lo actualiza el agente) | Revisión del borrador con Yaco10 | |
| 2026-11-26 | Versión inicial (borrador) | Las specs de Acceso y Pendientes se redactaron solo para mobile; el Figma trae las versiones de escritorio. Decisiones del 2026-11-26: teléfono en tres partes, vigencia de 24 horas, menú solo con lo implementado | |

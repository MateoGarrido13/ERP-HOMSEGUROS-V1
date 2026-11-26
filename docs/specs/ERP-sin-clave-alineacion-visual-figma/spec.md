# Spec: Alineación visual de las pantallas del PAS con el Figma (sin clave Jira)

| | |
|---|---|
| **US** | Sin clave Jira todavía. Cubre el aspecto visual de las pantallas de ERP-5, ERP-6, ERP-7, ERP-8 y ERP-17 |
| **Épica** | Acceso (con alcance sobre Pendientes) |
| **CU origen** | Ninguno: no cambia flujos ni reglas. Los CU de las pantallas son CU-01 a CU-04 (`docs/casos-de-uso/login-logout/`) y CU-05 (`docs/casos-de-uso/PAS/pendientes/CU-05-Pendientes_Ver_Pendientes.md`) |
| **Tipo** | Pantalla/UI |
| **Estado** | En revisión |
| **Autor** | Yaco10 con IA |
| **Revisor** | Pendiente |
| **Fecha** | 2026-11-26 |

## 1. Contexto y objetivo

Las pantallas de Acceso, Perfil y Pendientes se implementaron siguiendo la lógica de sus specs y solo parte del diseño. Al compararlas con los frames de alta fidelidad del Figma (archivo `dqM3vmFc3i8F3FyKIqiXvD`, página "🖥️ Alta fidelidad") aparecen diferencias que **no vienen de reglas de negocio** sino de estilo: tamaños, colores, radios, componentes que no existen en el código (badge, botón fantasma, barra superior, íconos del menú) y distribución de elementos.

Esta spec lleva lo implementado hacia el diseño, sin tocar lógica. Lo que ya se decidió por negocio (ver 4.4) se conserva y se documenta como excepción. Los valores se expresan en la escala estándar de Tailwind (ver 4.0), sin medidas arbitrarias.

**Objetivo:** las pantallas de Acceso, Perfil y Pendientes, en mobile (390 px) y escritorio (1440 px), coinciden con sus frames del Figma en colores, tipografía, componentes y distribución, usando solo la escala estándar de Tailwind, salvo las excepciones listadas en 4.4, y ningún flujo, regla ni mensaje cambia.

## 2. Alcance

**Dentro:**
- Tokens de diseño que faltan en `globals.css` (colores de estado, divisores, fondo de marca).
- Componentes compartidos: botón (tamaño y variantes), campo de texto, campo de teléfono, tarjeta de datos con filas, badge de estado, banner de aviso y de error, checkbox.
- Contenedor de la app en mobile: barra superior con logo y barra inferior con íconos.
- Barra superior de las pantallas de acceso en mobile con "Volver".
- Perfil (ver, editar, editar con error, cerrar sesión), Acceso (login, login con error, recuperar 1 a 3) y Pendientes (lista y vacío), en mobile y escritorio.
- Ítems del menú lateral de escritorio con ícono.

**Fuera de alcance:**
- Lógica, validaciones, acciones del servidor, permisos y datos: ninguno cambia.
- Detalle de Aviso y de Lead (frames "Aviso" y "Lead", mobile y PC) y sus acciones (Resolver, WhatsApp, Enviar cotización, Reactivar, Descartar, Editar descripción): siguen fuera por SUP-5 de la spec de escritorio.
- Pantalla "Revisá tu correo" de recuperar: sigue sin pantalla propia (ERP-6 PA-2).
- Ítems de menú sin pantalla (Cotizar, Cartera, Siniestros).
- Imagen del panel de marca del login en escritorio (PA-1 de la spec de escritorio).
- Pantalla de cambiar contraseña: recibe los cambios de los componentes compartidos, pero no tiene frame propio (SUP-2 de la spec de escritorio).
- Diseño de directivo y administrativo ("Broker · web"): solo reciben los componentes compartidos.
- Corregir el Figma (lo hace el agente conectado a Figma, como en PA-2 de la spec de escritorio; ver 4.4).

## 3. Componentes afectados

| Qué | Dónde | Cambio |
|---|---|---|
| Tokens | `front/src/app/globals.css` | modificado: se agregan tokens |
| Botón | `front/src/components/ui/brand-button.tsx` | modificado: tamaño, tipografía y variantes `secondary` y `ghost` |
| Campo de texto | `front/src/components/ui/text-field.tsx` | modificado: radio, color de placeholder y label, estado deshabilitado |
| Checkbox | `front/src/components/ui/checkbox.tsx` | nuevo |
| Tarjeta de datos | `front/src/components/ui/surface-card.tsx` y componente nuevo `data-card.tsx` | modificado y nuevo: filas con divisores |
| Badge | `front/src/components/ui/status-badge.tsx` | nuevo |
| Banner | `front/src/components/ui/notice-banner.tsx` | nuevo: reemplaza los párrafos con estilo repetido |
| Título de pantalla | `front/src/components/ui/screen-title.tsx` | modificado: se ajusta a la escala (4.0) |
| Contenedor | `front/src/components/layout/app-shell.tsx`, `app-nav.tsx` | modificado: barra superior mobile, íconos, estilo de la barra inferior y del menú lateral |
| Barra superior | `front/src/components/layout/top-bar.tsx` | nuevo |
| Íconos | `front/src/components/ui/icons/` | nuevo: íconos del menú, chevron, volver y alerta |
| Acceso | `front/src/components/layout/auth-shell.tsx`, `login-form.tsx`, `recover-form.tsx`, `reset-password-form.tsx`, `change-password-form.tsx` | modificado |
| Perfil | `front/src/components/auth/profile-screen.tsx`, `phone-field.tsx`, `logout-button.tsx` | modificado |
| Pendientes | `front/src/components/pendientes/` (`pending-board`, `lead-board`, `notice-card`, `lead-card`, `pager`, `section-skeleton`) y `front/src/app/(app)/pendientes/page.tsx` | modificado |
| Lógica / datos | — | sin cambios |

## 4. Diseño

La referencia es el Figma, leído por MCP (`get_design_context`). No se cambia ningún flujo: la misma pantalla y ruta, con otros estilos y algunos elementos nuevos. Los tests existentes deben seguir pasando sin modificarse, salvo los que dependan de textos o de roles de elementos que esta spec cambie de forma explícita. Al implementar cada pantalla se lee su frame (mobile y escritorio) y se contrasta con esta spec; si el frame difiere, se registra en el historial.

### 4.0 Escala estándar

Criterio: se usa la escala por defecto de Tailwind y nunca valores arbitrarios (`text-[13px]`, `w-[352px]`). Los valores del Figma que no están en la escala se redondean al paso más cercano, y esas diferencias se registran en 4.4 para que se actualice el Figma.

| Aspecto | Escala que se usa | Valor del Figma → paso estándar |
|---|---|---|
| Espaciado | Múltiplos de 4 px (`p-4`, `gap-3`, `px-6`) | 4, 8, 12, 16, 24, 32: sin cambios |
| Tipografía | `text-xs` 12, `text-sm` 14, `text-base` 16, `text-lg` 18, `text-2xl` 24 | 13 → 14 (botones y etiquetas); 17 → 18 (subtítulos); 26 → 24 (títulos de pantalla); 11 → 12 (hoy etiquetas de dato) |
| Peso | `font-normal`, `font-medium`, `font-semibold` | sin cambios |
| Interlineado y espaciado de letras | El que trae cada tamaño; `tracking-tight` solo en títulos | se descartan los espaciados de letra personalizados |
| Radios | `rounded-md` 6 (campos), `rounded-lg` 8 (tarjetas), `rounded-xl` 12 (diálogo), `rounded-full` (botones y badges) | sin cambios |
| Alturas | `h-10` 40 (campos), `h-12` 48 (botones), `h-14` 56 (barra superior), `h-16` 64 (barra inferior) | campos 36 → 40 (PA-1); botones y barras sin cambios |
| Íconos | `size-5` 20 y `size-6` 24 | sin cambios |
| Anchos de contenido (escritorio) | `max-w-sm` 384 (formulario de acceso), `max-w-xl` 576 (tarjeta de datos y edición), `max-w-md` 448 (diálogo) | 352/360 → 384; 720 → 576; 420 → 448 |
| Botones en escritorio | Ancho por contenido (`w-auto px-6`) | 220 fijo → por contenido |
| Logo | Alto de escala con ancho automático (`h-9` en la barra, `h-16` en acceso) | 107×36 → `h-9`; 180×61 → `h-16` |
| Sombra | `shadow-xl` | sombra a medida → estándar |
| Avatar | `size-18` (72 px, múltiplo de 4) | sin cambios |

### 4.1 Flujo

No cambia ninguno. La barra superior con "Volver" y los enlaces de vuelta solo duplican navegación que ya existe.

### 4.2 Pantallas y estados

**Tokens** (Figma → código; los que ya existen se reutilizan):

| Token del Figma | Valor | En el código hoy |
|---|---|---|
| `text-primary` | `#0b0f14` | `--hom-color-title` |
| `text-secondary` | `#3c4858` | `--hom-color-slate` |
| `text-muted` | `#566170` | `--hom-color-hint` |
| `text-brand` | `#0c6570` | `--hom-color-primary-deep` |
| `text-disabled` | `#9aa3af` | falta |
| `border-default` / `strong` | `#e1e5ea` / `#9aa3af` | `--hom-color-line` / `--hom-color-field` |
| `border-subtle` | `#eef0f3` | falta |
| `bg-brand-subtle` | `#e8f8f6` | falta (hoy `nav-active` `#e5f2f2`) |
| `action-disabled-bg` | `#eef0f3` | `--hom-color-disabled` |
| Estado danger | bg `#fdecec`, borde `#f4a6a6`, texto `#9e1f1f`, sólido `#c62828` | existe |
| Estado warning | bg `#fff6e5`, borde `#ffd27f`, texto `#8a5a00` | falta |
| Estado info | bg `#e8f3fc`, borde `#9fcdf0`, texto `#0b5e92` | falta |
| Estado neutral | bg `#eef0f3`, borde `#cbd1d9`, texto `#3c4858` | falta |

**Componentes compartidos:**

| Componente | Figma | Hoy | Cambio |
|---|---|---|---|
| Botón | 48 px de alto; primary `#0f7f86`; secondary blanco con borde `#9aa3af`; ghost sin fondo con texto `#0c6570`; danger `#c62828` | 40 px; variantes primary, outline y danger | `h-12`, `text-sm font-medium`; `outline` pasa a `secondary` con el texto `#0b0f14`; se agrega `ghost` |
| Campo de texto | label con texto primario; campo con borde `#9aa3af`, placeholder `#566170`; ayuda y error de 12 px | label slate, radio 8, placeholder `#98a0a8` | `h-10 rounded-md`; label `text-sm font-medium` en `text-primary`; placeholder `text-muted`; el deshabilitado lleva fondo `#eef0f3`, borde `#9aa3af` y texto `#9aa3af` |
| Teléfono | prefijo y área angostos, número flexible; mismo estilo de campo | prefijo 104 px, área 72 px | prefijo `w-24` y área `w-20`; se mantiene la bandera del prefijo (ERP-7) |
| Tarjeta de datos | borde `#e1e5ea`, filas con padding; etiqueta de 12 px muted en minúsculas y valor de 14 px regular; divisores `#eef0f3` | radio 12, p-4, sin divisores; etiqueta en mayúsculas y valor `font-light` | `DataCard` nuevo: `rounded-lg border`, filas `px-4 py-3` con divisores `divide-y`; etiqueta `text-xs`, valor `text-sm` |
| Badge | pill con borde, punto y 12 px medium; estados danger, warning, info y neutral | pill plano sin punto ni borde | `StatusBadge`: `rounded-full border px-2 py-0.5 text-xs font-medium`, con punto `size-1.5` |
| Banner | ícono de alerta a la izquierda, texto de 14 px (error) | párrafo con `rounded-xl`, sin ícono | `NoticeBanner` con variantes error y aviso, `rounded-lg` |
| Checkbox | caja de 16 px, radio 4, borde `#9aa3af`, texto de 14 px `#0b0f14` | nativo con `accent-primary` | `Checkbox` con `size-4 rounded` y el mismo comportamiento y foco visible |

**Pantallas:**

| Pantalla | Mobile (390 px) | Escritorio (1440 px) |
|---|---|---|
| Contenedor | Barra superior `h-14` con el logo en las pantallas con menú; barra inferior `h-16` con ícono de 24 px y texto `text-xs`, activo en teal medium, inactivo `text-muted`, borde superior `border-subtle` | Menú lateral `w-60`: ítems con ícono de 24 px; activo con fondo suave y texto teal; arriba del contenido, un texto `text-sm` muted con el nombre de la sección ("Mi perfil", "Pendientes") o "‹ Perfil" / "‹ Pendientes" donde hay vuelta |
| Login y login con error | Logo `h-16`; título y subtítulo como hoy; campos separados `gap-4`, bloques `gap-6`; checkbox y enlace en una fila; botón `h-12`; error: banner con ícono, el campo de la contraseña con borde rojo y el mensaje del campo debajo; pie "Portal PAS · HOM Seguros". El centrado vertical se mantiene (CA-14 de la spec de escritorio) | Dos paneles; formulario `max-w-sm` centrado; el resto como mobile |
| Recuperar 1 a 3 | Barra superior con "‹ Volver"; "Volver a iniciar sesión" y "Cancelar" como botón fantasma | Igual que hoy, con los estilos compartidos |
| Perfil · ver | Barra superior con logo; título "Perfil"; avatar `size-18` centrado (fondo `#e8f8f6`, iniciales `text-lg` semibold `#0c6570`); `DataCard` (Nombre, Rol, Matrícula si hay, Organización, Teléfono); botones apilados `h-12`: Editar, Cambiar contraseña (secundario) y Cerrar sesión (fantasma) | `DataCard` de `max-w-xl`; botones Editar y Cambiar contraseña por contenido y Cerrar sesión fantasma, en una fila |
| Perfil · editar y editar con error | Barra superior con "‹ Perfil"; título "Editar perfil"; Nombre y Teléfono editables y Rol, Matrícula (si hay) y Organización como campos deshabilitados; texto de ayuda "Rol, matrícula y organización los asigna tu organización."; botones `h-12`: Guardar y Cancelar (secundario) | Dos columnas dentro de `max-w-xl`: Nombre y Teléfono; Rol y Matrícula; Organización; mismo texto de ayuda; Guardar y Cancelar por contenido |
| Cerrar sesión (diálogo) | Fondo blanco, `rounded-xl`, `shadow-xl`, `p-6`; título `text-lg` semibold, descripción `text-sm` y botones `h-12` apilados con Cerrar sesión arriba y Cancelar abajo; el foco inicial va en Cancelar | Igual, `max-w-md` |
| Pendientes · lista | Barra superior con logo; sin título visible de pantalla; cada sección con su cabecera (título `text-lg` semibold y contador `text-xs` muted a la derecha); tarjetas `rounded-lg` con nombre (`text-sm` medium) y `StatusBadge` en la misma fila, cobertura o ramo (`text-sm`) y fecha (`text-xs` muted); chevron `size-5` que indica expandir y gira al abrir; `gap-3` entre tarjetas y `gap-6` entre secciones | Dos columnas; el título de la sección va como texto superior `text-sm` |
| Pendientes · vacío | Mismas cabeceras con el contador en cero y el mensaje de vacío por sección con el estilo de tarjeta | Dos columnas |

- Navegación de entrada y de salida: igual que hoy.
- Validaciones de formulario: no cambian. Los campos deshabilitados de "Editar perfil" no se envían al servidor (sin `name`): el servidor sigue tomando Rol, Matrícula y Organización de la sesión.
- Accesibilidad: se conservan los roles, `aria-*`, el atrapado de foco y Escape del diálogo, y el foco al primer campo con error. Los íconos decorativos son `aria-hidden`; el ítem activo de la barra y del menú lleva `aria-current="page"`. El título de Pendientes se conserva como H1 solo para lectores de pantalla (`sr-only`) en mobile.
- Referencia de diseño (Figma, archivo `dqM3vmFc3i8F3FyKIqiXvD`): Acceso mobile `24:171`, Perfil mobile `47:41`, Pendientes mobile `48:151`, Acceso PC `80:794`, Perfil PC `80:938`, Pendientes PC `80:1355`. Componentes: botón `6:66`, input `6:108`, checkbox `7:55`, badge `6:82`, menú inferior `46:174`.

**Color del badge por tipo** (PA-9): Pago rechazado = danger; Cumpleaños = info; Cotización enviada = warning; Enviar póliza = info; origen de lead "Póliza eliminada" = neutral; "Cotización rechazada" = danger; cualquier otro origen = neutral.

### 4.3 Íconos y recursos

Los íconos del menú (Pendientes, Perfil), el chevron, el ícono de volver y el de alerta se exportan de Figma con `get_design_context` y se guardan en el repo como componentes SVG (no se usan las URLs temporales). Solo se montan los del menú con pantalla existente. Para "Red" (que el Figma no trae) se usa un ícono de personas con el mismo trazo y tamaño que los demás (PA-7). El logo ya está en `front/public/hom-logo.png`.

### 4.4 Excepciones y diferencias registradas

| Dónde | Dice el Figma | Se implementa | Fuente |
|---|---|---|---|
| Menú | Cotizar, Cartera, Siniestros, Pendientes, Perfil | Solo los ítems con pantalla | Spec de escritorio, 2026-11-26 |
| Recuperar 2 | Pantalla "Revisá tu correo" con ícono y "Reenviar enlace" | Aviso en la misma pantalla con vigencia de 24 horas | ERP-6 PA-2 |
| Teléfono | — | Tres partes con bandera | ERP-7 |
| Matrícula | Siempre visible | Se omite para directivo y administrativo | ERP-7 SUP-1 |
| Detalle de pendientes | Pantallas de Aviso y Lead con acciones | Detalle expandido en la tarjeta, solo lectura | ERP-17 CA-6 |
| Panel de marca (PC) | Recuadro "Imagen / ilustración" | Color de fondo y mensaje, sin imagen | Spec de escritorio PA-1 |
| Centrado vertical del login mobile | Contenido arriba y pie abajo | Bloque centrado (40/60) | Spec de escritorio CA-14 |
| Enlace del login, textos de recuperar, diálogo de cerrar sesión | "¿Olvidaste tu contraseña?", "Crear nueva contraseña", "Confirmar contraseña", "¿Cerrar sesión?" con descripción, etc. | Redacción de las specs | ERP-5 SUP-2, ERP-6, ERP-8 (PA-4) |
| Datos de las tarjetas de Pendientes | "María González", sin número de póliza | Apellido y nombre, número de póliza y datos de ERP-17 | ERP-17 (PA-8) |
| Texto del rol | "PAS" | "Productor asesor de seguros" | PA-2 |
| Alto del campo | 36 px en los frames | 40 px (`h-10`) | PA-1 |
| Escala | Valores fuera de escala (13, 17, 26 px; anchos de 352, 720, 220 y 420 px; sombra a medida) | Pasos de la escala estándar (4.0) | Decisión de prolijidad, 2026-11-26 |
| Ícono de "Red" | No existe | Ícono de personas con el mismo trazo | PA-7 |

Las diferencias de la tabla que dependen del Figma (textos, datos, texto del rol, alto del campo, escala e ícono de Red) las actualiza el agente conectado a Figma, con aval de Yaco10.

## 5. Reglas de negocio

| # | Regla | Origen |
|---|---|---|
| RN-1 | El cambio visual no altera ninguna regla de negocio, validación, mensaje de error ni permiso de las pantallas implementadas | ERP-5, ERP-6, ERP-7, ERP-8, ERP-17 |
| RN-2 | Paginación de Pendientes: 5 por página en mobile y 10 en escritorio | ERP-17 PA-2 |
| RN-3 | El menú muestra solo ítems cuyas pantallas existen, según el rol | Épica de Acceso 4.2 |
| RN-4 | Rol, matrícula y organización no se editan: los asigna la organización | ERP-7 |

## 6. Casos borde y manejo de errores

| Situación | Comportamiento esperado |
|---|---|
| Texto largo en una tarjeta de Pendientes (nombre, cobertura, "3 días transcurridos") | Hace salto de línea dentro de la tarjeta, sin desbordar ni empujar el chevron ni el badge |
| Badge con una etiqueta más larga que el espacio de la fila | El nombre cede (truncado con elipsis) y el badge conserva su tamaño |
| Tipo de aviso u origen de lead sin estado definido | Badge neutral con su etiqueta actual |
| Rol sin matrícula | La fila y el campo de Matrícula no se muestran, en ver y en editar |
| Error del campo y error general a la vez | Banner arriba y mensaje bajo el campo; el foco sigue yendo al primer campo con error |
| Teclado abierto en mobile | La barra inferior fija no tapa el campo enfocado |
| Cruzar el punto de corte | El layout cambia sin recargar y sin perder lo escrito en un formulario |
| Pantalla de cambiar contraseña | Usa los mismos componentes: botones `h-12` y campos alineados |
| Falla al cargar un ícono | El texto de la etiqueta sigue visible y la navegación funciona |

## 7. Criterios de aceptación verificables

- [ ] CA-1: `globals.css` define los tokens de la tabla de 4.2 y ningún componente nuevo usa colores escritos a mano.
- [ ] CA-2: El código de las pantallas de 4.2 no contiene valores arbitrarios de Tailwind para tamaños, anchos, radios, sombras ni espaciado de letras (verificable con una búsqueda de `\[\d+px\]`); todo usa la escala de 4.0.
- [ ] CA-3: Todos los botones de las pantallas de 4.2 miden 48 px de alto; las variantes primary, secondary, ghost y danger coinciden en color con el Figma.
- [ ] CA-4: Los campos de texto, de teléfono y deshabilitados tienen 40 px de alto, radio de 6 px y los colores de 4.2.
- [ ] CA-5: El perfil (ver) y el detalle expandido de Pendientes usan la tarjeta de datos con filas `px-4 py-3`, divisores `#eef0f3`, etiquetas de `text-xs` en minúsculas y valores de `text-sm` regular.
- [ ] CA-6: Los avisos y leads muestran un badge con punto, borde y el color del estado definido en 4.2.
- [ ] CA-7: En mobile, las pantallas con menú muestran la barra superior de 56 px con el logo; la barra inferior muestra ícono y texto de 12 px, con el ítem activo resaltado en teal.
- [ ] CA-8: Login con error muestra el banner con ícono, el campo de la contraseña con borde rojo y el mensaje del campo debajo, sin cambiar los mensajes actuales.
- [ ] CA-9: En mobile, las pantallas de recuperar muestran "‹ Volver" en la barra superior, y "Volver a iniciar sesión" y "Cancelar" se ven como botón fantasma.
- [ ] CA-10: Perfil (ver) en mobile muestra el título "Perfil", el avatar con iniciales, la tarjeta de datos con la fila Nombre y los tres botones apilados (Editar, Cambiar contraseña y Cerrar sesión).
- [ ] CA-11: Perfil (editar y editar con error) muestra Rol, Matrícula (si hay) y Organización como campos deshabilitados, el texto de ayuda y los botones Guardar y Cancelar; los campos deshabilitados no se envían.
- [ ] CA-12: El diálogo de cerrar sesión tiene el aspecto del Figma (blanco, `rounded-xl`, sombra, título y descripción), el botón Cerrar sesión arriba y Cancelar abajo; el foco inicial queda en Cancelar y se conservan el atrapado de foco y Escape.
- [ ] CA-13: Pendientes en mobile y escritorio muestra cabeceras con contador a la derecha, tarjetas con nombre y badge en la misma fila y chevron que gira al expandir; el estado vacío conserva sus mensajes actuales.
- [ ] CA-14: En escritorio, el menú lateral muestra el ícono de cada ítem y el texto superior de sección; el perfil usa la tarjeta de `max-w-xl` y los botones por contenido en una fila.
- [ ] CA-15: Ninguna pantalla scrollea en horizontal a 390, 768, 1024 y 1440 px de ancho.
- [ ] CA-16: Los tests existentes siguen pasando, `tsc` y `lint` están limpios, y ningún mensaje, ruta ni acción del servidor cambió.
- [ ] CA-17: Revisión visual lado a lado de cada frame de 4.2 contra la pantalla implementada, a 390 y 1440 px; las diferencias que queden están en 4.4.

> CA-1 a CA-5 y CA-15 a CA-16 se validan con código, tests y herramientas de desarrollo; CA-6 a CA-14 y CA-17 con revisión visual en el navegador contra los frames, con la lista de prueba manual de la épica.

## 8. Decisiones descartadas

| Alternativa | Por qué no |
|---|---|
| Replicar los valores exactos del Figma con medidas arbitrarias (13 px, 352 px, 220 px) | Rompe la escala del sistema, complica el mantenimiento y no aporta diferencia visual perceptible |
| Cambiar solo las pantallas donde se nota la diferencia | Los desvíos vienen de componentes compartidos: se arreglan una vez y se corrigen todas las pantallas |
| Copiar el código que devuelve Figma tal cual | Usa posicionamiento y valores sueltos; se adapta a los componentes y tokens del proyecto |
| Una spec por pantalla | Las diferencias son comunes; no hay flujo ni regla nueva |
| Volver a Figma en lo que ya se decidió por negocio | Se rompen reglas confirmadas (ver 4.4) |
| Usar las URLs temporales de Figma para los íconos | Vencen a los 7 días; los íconos se guardan en el repo |
| Mantener el checkbox nativo | No coincide con la caja de 16 px del diseño; se reemplaza conservando el comportamiento accesible |
| Foco inicial en el botón rojo del diálogo | Deja la acción destructiva a un Enter de distancia |
| Ocultar el chevron hasta que exista el detalle | El diseño lo trae y sirve como indicador de expandir |

## 9. Supuestos

- [x] SUP-1: Los frames de 390×844 y 1440×900 son la medida de referencia, y el punto de corte sigue siendo 1024 px. → *confirmado por: Yaco10 (recomendación aceptada), 2026-11-26*
- [x] SUP-2: En mobile, el título de Pendientes no se muestra como H1 visible porque el Figma no lo tiene; se conserva como `sr-only`. → *confirmado por: Yaco10 (recomendación aceptada), 2026-11-26*
- [x] SUP-3: Cambiar contraseña (`/perfil/contrasena`) y los formularios de directivo y administrativo reciben los componentes compartidos sin frame propio. → *confirmado por: Yaco10 (recomendación aceptada), 2026-11-26*
- [x] SUP-4: Los frames de PC de "Login · error", "Recuperar 1 a 3", "Perfil · Editar · error", "Perfil · Cerrar sesión" y "Pendientes · Vacío" no se revisaron a fondo al redactar la spec. → *resuelto como regla de proceso (4, párrafo inicial): cada frame se lee y contrasta al implementar su pantalla; cualquier diferencia se anota en el historial*

## 10. Preguntas abiertas

- [x] PA-1: Alto del campo. → 40 px (`h-10`); el agente actualiza los frames. *decidió: Yaco10 (recomendación aceptada), 2026-11-26*
- [x] PA-2: Texto del rol. → "Productor asesor de seguros"; se actualiza el Figma. *decidió: Yaco10 (recomendación aceptada), 2026-11-26*
- [x] PA-3: Título del perfil en mobile. → "Perfil" con la fila "Nombre" en la tarjeta, como el Figma. *decidió: Yaco10 (recomendación aceptada), 2026-11-26*
- [x] PA-4: Textos del Figma que difieren de las specs. → Se mantienen las specs; se actualiza el Figma. *decidió: Yaco10 (recomendación aceptada), 2026-11-26*
- [x] PA-5: Chevron en las tarjetas de Pendientes. → Se muestra como indicador de expandir y gira al abrir. *decidió: Yaco10 (recomendación aceptada), 2026-11-26*
- [x] PA-6: Diálogo de cerrar sesión. → Orden del Figma (Cerrar sesión arriba) y foco inicial en Cancelar. *decidió: Yaco10 (recomendación aceptada), 2026-11-26*
- [x] PA-7: Ícono de "Red". → Ícono de personas con el mismo trazo y tamaño que los demás. *decidió: Yaco10 (recomendación aceptada, estándar de la industria), 2026-11-26*
- [x] PA-8: Datos de las tarjetas de Pendientes. → Se mantiene ERP-17; se actualiza el Figma. *decidió: Yaco10 (recomendación aceptada), 2026-11-26*
- [x] PA-9: Color del badge por tipo. → "Enviar póliza" = info; los orígenes de lead no definidos = neutral. *decidió: Yaco10 (recomendación aceptada), 2026-11-26*

## 11. Historial de cambios

| Fecha | Cambio | Motivo | PR |
|---|---|---|---|
| 2026-11-26 | Versión inicial (borrador) | Comparación de los frames de alta fidelidad con lo implementado: las diferencias de estilo no están cubiertas por ninguna spec | |
| 2026-11-26 | Resueltos PA-1 a PA-9 y SUP-1 a SUP-4 con las recomendaciones; se agrega la escala estándar (4.0) y CA-2; los anchos, tamaños de texto, sombra y logo pasan a pasos de la escala de Tailwind; estado a En revisión | Decisión de Yaco10: aceptar las recomendaciones, con estándares de la industria y sin medidas forzadas | |

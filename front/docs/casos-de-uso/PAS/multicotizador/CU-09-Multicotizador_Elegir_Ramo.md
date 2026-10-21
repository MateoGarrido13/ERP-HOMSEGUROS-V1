## CU-09-Multicotizador_Elegir_Ramo
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS inició sesión con rol de productor (REF CU-01-Acceso_Iniciar_Sesion). Hay conexión.
*Disparador:* Cotizar un seguro

*Flujo principal*
1. El PAS selecciona la pestaña "Cotizar"
2. El sistema muestra "Elegí la cobertura" con los ramos del broker: Automotor, Hogar, Accidentes Personales, Comercio, ART, Responsabilidad Civil y Vida (*ALT RAMO NO HABILITADO)
3. El PAS selecciona un ramo habilitado
4. El sistema abre el flujo de ese ramo. Si es Automotor, abre la carga del riesgo (REF CU 17) (*ALT RAMO NO MASIVO)

*Flujos alternativos*

`2. El sistema muestra "Elegí la cobertura"`
2.1. El PAS selecciona un ramo que no está habilitado (Comercio, Responsabilidad Civil o Vida)
2.2. El sistema no abre ningún flujo
2.3. El PAS sigue en la pantalla y puede elegir otro ramo
2.4. **IR A (3)**

`4. El sistema abre el flujo de ese ramo`
4.1. El PAS eligió Hogar, Accidentes Personales o ART
4.2. El sistema abre la solicitud de ese ramo, sin consultar compañías ni comparar precios (REF CU 21)
4.3. **FIN**

`La entrada ya trae el ramo`
R.1. El PAS llegó desde un lead (REF CU-08d-Pendientes_Convertir_Lead_en_Cotizacion, CU-08b-Pendientes_Reactivar_Lead) o desde una póliza a re-cotizar (REF CU 11)
R.2. El lead o la póliza ya identifican el ramo
R.3. El sistema omite la pantalla "Elegí la cobertura"
R.4. **IR A (4)**

*Postcondiciones*
1. El PAS queda dentro del flujo del ramo elegido, listo para cargar el riesgo o la solicitud
2. No se consultó ninguna compañía
3. No se creó ni se seleccionó ningún cliente
4. No quedó una cotización en curso guardada (REF CU 12)

*Reglas de negocio asociadas*
RN_1: Solo un PAS autenticado puede cotizar. En el prototipo el rol de red no tiene la pestaña Cotizar (REF CU-01-Acceso_Iniciar_Sesion).
RN_2: La pantalla muestra todos los ramos del broker, también los que todavía no están habilitados. Solo los habilitados abren un flujo.
RN_3: Hoy los ramos habilitados son Automotor, Hogar, Accidentes Personales y ART. Comercio, Responsabilidad Civil y Vida se ven pero no abren nada.
RN_4: Cada cotización es de un solo ramo. Para cotizar otro ramo, el PAS empieza otra cotización desde este caso.
RN_5: El ramo define el tipo de flujo. Un ramo masivo consulta a las compañías y compara precios (REF CU 17, CU 18). Un ramo no masivo carga una solicitud sin comparar precios (REF CU 21).
RN_6: Elegir el ramo no consulta compañías, no crea cotización ni cliente. Por eso no se audita (REF CU 51).
RN_7: Si el ramo llega ya definido por un lead o una póliza, este paso se omite. La pantalla de ramos solo aparece cuando el PAS arranca desde "Cotizar".

*Supuestos a confirmar*
SUP_1: Qué ramos son masivos y cuáles no masivos. El prototipo manda a Hogar, Accidentes Personales y ART a la solicitud, pero por dominio Hogar suele ser masivo y ART no (REF CU 21).
SUP_2: Alcance del MVP. El presupuesto contempla solo Automotor. Falta confirmar si Hogar, Accidentes Personales y ART se muestran como habilitados o quedan deshabilitados hasta la entrega final.
SUP_3: Qué ve el PAS al tocar un ramo no habilitado. El prototipo no muestra ningún mensaje. Falta definir si se indica "Próximamente" o si se ocultan.
SUP_4: Quién habilita los ramos de cada broker y desde dónde (REF CU 49).
SUP_5: Qué pasa con los datos de una cotización en curso si el PAS vuelve a "Cotizar" y elige otro ramo. El prototipo conserva los datos de Automotor en la dirección de la pantalla, pero no los de los otros ramos (REF CU 12).
SUP_6: Si cuando el ramo llega ya definido (lead o re-cotización) el PAS puede cambiarlo.

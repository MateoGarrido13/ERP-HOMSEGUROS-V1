## CU-09-Multicotizador_Elegir_Ramo
*Actor principal:* PAS
*Actor secundario:* Ninguno
*Precondiciones:* El PAS inició sesión con rol de productor (REF CU-01-Acceso_Iniciar_Sesion). Hay conexión.
*Disparador:* Cotizar un seguro

*Flujo principal*
1. El PAS selecciona la pestaña "Cotizar"
2. El sistema muestra "Elegí la cobertura" con los ramos del broker: Automotor, Hogar, Consorcio, Comercio, Accidentes Personales, ART, Responsabilidad Civil y Vida (*ALT RAMO NO HABILITADO)
3. El PAS selecciona un ramo habilitado
4. El sistema abre la cotización en ese ramo y pide indicar a quién se asegura (REF CU 10)

*Flujos alternativos*

`2. El sistema muestra "Elegí la cobertura"`
2.1. El PAS selecciona un ramo que no está habilitado en la iteración 1 (Accidentes Personales, ART, Responsabilidad Civil o Vida) o un ramo habilitado sin API de cotización para las compañías del broker
2.2. El sistema no abre ningún flujo
2.3. El PAS sigue en la pantalla y puede elegir otro ramo
2.4. **IR A (3)**

`La entrada ya trae el ramo`
R.1. El PAS llegó desde un lead (REF CU-08d-Lead_Enviar_Cotizacion) o desde una póliza a re-cotizar (REF CU 11)
R.2. El lead o la póliza ya identifican el ramo
R.3. El sistema omite la pantalla "Elegí la cobertura"
R.4. **IR A (4)**

*Postcondiciones*
1. El PAS queda con una cotización abierta en el ramo elegido, listo para indicar a quién se asegura (REF CU 10)
2. No se consultó ninguna compañía
3. No se creó ni se seleccionó ningún cliente
4. No quedó una cotización en curso guardada (REF CU 12)

*Reglas de negocio asociadas*
RN_1: Solo un PAS autenticado puede cotizar. En el prototipo el rol de red no tiene la pestaña Cotizar (REF CU-01-Acceso_Iniciar_Sesion).
RN_2: La pantalla muestra todos los ramos del broker, también los que todavía no están habilitados. Solo los habilitados abren un flujo.
RN_3: En la iteración 1 los ramos habilitados son Automotor, Hogar, Consorcio y Comercio, y solo se cotizan contra compañías que tengan API de ese ramo. Accidentes Personales, ART, Responsabilidad Civil y Vida se ven pero no abren flujo.
RN_4: Cada cotización es de un solo ramo. Para cotizar otro ramo, el PAS empieza otra cotización desde este caso.
RN_5: El ramo define el tipo de flujo, que se bifurca después de indicar el cliente (REF CU 10). En la iteración 1 todos los ramos habilitados son masivos (hay API de precio): Automotor carga el riesgo en CU-17; Hogar, Consorcio y Comercio en CU-17b; después se compara (REF CU 18). CU-21 (solicitud sin API) queda fuera.
RN_6: Elegir el ramo no consulta compañías, no crea cotización ni cliente. Por eso no se audita (REF CU 51).
RN_7: Si el ramo llega ya definido por un lead o una póliza, este paso se omite. La pantalla de ramos solo aparece cuando el PAS arranca desde "Cotizar".

*Supuestos a confirmar*
SUP_1: Resuelto para iteración 1. Masivo = hay API de cotización. Habilitados: Automotor, Hogar, Consorcio, Comercio.
SUP_2: Resuelto para iteración 1. AP y ART no están habilitados. El prototipo que los abre, y que no tiene Consorcio/Comercio, queda desalineado (REF `specs/as-built-prototipo-iteracion-1.md`).
SUP_3: Qué ve el PAS al tocar un ramo no habilitado. El prototipo no muestra ningún mensaje. Falta definir si se indica "Próximamente" o si se ocultan.
SUP_4: Quién habilita los ramos de cada broker y desde dónde (REF CU 49).
SUP_5: Qué pasa con los datos de una cotización en curso si el PAS vuelve a "Cotizar" y elige otro ramo. El prototipo conserva los datos de Automotor en la dirección de la pantalla, pero no los de los otros ramos (REF CU 12).
SUP_6: Si cuando el ramo llega ya definido (lead o re-cotización) el PAS puede cambiarlo.

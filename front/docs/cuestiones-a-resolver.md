# Cuestiones a resolver — casos de uso del multicotizador

Puntos donde los casos de uso se contradicen entre sí, contradicen al prototipo o dejan una decisión abierta. Cada uno indica qué reglas (RN) o supuestos (SUP) quedan inconsistentes y qué hay que decidir para que todo cierre.

Estado de los casos al escribir esto: `CU-09` y `CU-10` escritos; el resto del multicotizador, vacío.

Rutas relativas a `front/docs/casos-de-uso/PAS/multicotizador/`.

---

## A. CU-10 Seleccionar o crear cliente

### A1. ¿El cliente se elige antes o después de cargar el riesgo?
**Gravedad: alta. Afecta la estructura de varios casos.**

| Fuente | Orden que plantea |
|---|---|
| Lista de CU (casos 9, 10, 11 originales) | Ramo → cliente → cotizar |
| `CU-23` (pasos 4 y 5) y `CU-08d` (pasos 4 y 5) | Primero el cliente, después "sigue la cotización del ramo" |
| Prototipo (`/cotizar/riesgo` → `/cotizar/asegurado` → `/cotizar/comparar`) | Ramo → riesgo → cliente |
| Borrador viejo `CU-Multicotizador-01` | Patente y riesgo primero; el cliente al final (pasos 7 y 8) |

**Hoy `CU-10` está escrito con el cliente primero** (ver `SUP_10`).

**Qué cambia según la decisión**
- Cliente **primero**: el paso 7 de `CU-10` abre la carga del riesgo (`CU-17`); el alternativo `1a` vuelve a elegir ramo; `CU-09` paso 4 termina en `CU-10`.
- Cliente **después**: la precondición de `CU-10` exige el riesgo cargado; `1a` vuelve a la carga del riesgo; `CU-09` paso 4 abre la carga del riesgo.
- En ambos casos hay que ajustar el `CU-17`, que todavía no se escribió.

**Arrastre sobre las reglas:** `RN_8` de `CU-10` todavía cita `CU 18` como paso siguiente, que era cierto con el orden del prototipo. Con cliente primero, el paso siguiente es `CU 17`.

**Decisión pendiente:** elegir un orden y alinear prototipo y casos de uso.

---

### A2. Unicidad del documento: ¿en la cartera del PAS o en toda la red?
**Gravedad: media.**

- `RN_2` dice: *"No se da de alta de nuevo si el documento ya existe"*, sin acotar dónde.
- El alternativo `5b.1` dice: *"El DNI corresponde a un cliente de la cartera del PAS"*.
- `SUP_3` pregunta por clientes de otro PAS de la red.
- Mismo punto en `CU-23` (`RN_3`) y en `CU-24` (`RN_2`).

**Ejemplo del problema:** Martín tiene un cliente con DNI X. Laura, otra PAS, carga una cotización a esa persona con el mismo DNI. Con `5b.1` no se detecta y quedan dos clientes. Con `RN_2` leída de forma amplia, sí se detectaría.

**Decisión pendiente:** el documento es único **por PAS** o **en toda la red**. Una vez decidido, `RN_2`, `5b.1`, `SUP_3` y los equivalentes de `CU-23` y `CU-24` deben decir lo mismo.

---

### A3. ¿El caso es igual para todos los ramos?
**Gravedad: media.**

- `RN_8` dice: *"Este caso es el mismo para todos los ramos."*
- `SUP_5` dice que el formulario pide nombre y apellido y no contempla personas jurídicas.
- Una ART la contrata una empresa (razón social y CUIT), no una persona.
- El prototipo hace pasar a ART por el formulario de persona física.

**Decisión pendiente:** definir cómo se carga un cliente que es una empresa, o aclarar en `RN_8` que hoy solo aplica a personas físicas. Está relacionado con A5 (el DNI como dato).

---

### A4. Cliente existente sin email o teléfono
**Gravedad: alta.**

- `RN_3` marca email y teléfono como obligatorios para un cliente nuevo.
- `RN_6` dice que este caso **no modifica** a un cliente existente.
- El prototipo, al elegir un cliente existente, solo trae nombre y apellido (`SUP_2`).
- El envío de la propuesta necesita email o teléfono (`CU-14`).

**El choque:** si un cliente existente no tiene esos datos y este caso no puede editarlo, el PAS no puede enviarle la propuesta. Y no se sabe si todo cliente de la cartera tiene esos datos (la carga inicial de `CU-29` podría no exigirlos).

**Decisión pendiente:** o bien email y teléfono son obligatorios para todo cliente de la cartera, o este caso permite completarlos, lo que obligaría a cambiar `RN_6`.

---

### A5. DNI opcional, pero quizás obligatorio para cotizar
**Gravedad: media.**

- `RN_3` dice que el DNI es opcional.
- `SUP_1` advierte que las APIs de las compañías podrían exigir el documento para cotizar.
- La detección de duplicados (A2) solo funciona si el DNI se informa.

**Decisión pendiente:** saber qué exigen las compañías (Mercantil Andina, Sancor, Zurich, La Segunda, Allianz). Si lo exigen, el DNI pasa a obligatorio en los ramos masivos y se resuelve parte de A2.

---

### A6. ¿Cuándo entra un cliente nuevo a la cartera?
**Gravedad: media.**

- `RN_5` de `CU-10` y `CU-23` dicen: el cliente entra solo si queda asociada una cobertura o póliza.
- El borrador viejo decía: si la cotización era para un usuario nuevo, se lo registra en la base.
- `CU-23` `SUP_1` pregunta si una propuesta **enviada** ya cuenta como cobertura asociada, o si hay que esperar a que se registre la póliza (`CU-16`).

**Decisión pendiente:** en qué evento exacto se incorpora el cliente (propuesta enviada, propuesta aceptada o póliza registrada).

---

## B. CU-09 y estructura del multicotizador

### B1. Criterio de masivo contra no masivo
- La carpeta `no-masivo/` hoy contiene el caso 21 (Hogar, Accidentes Personales y ART) por lo que hace el **prototipo**, no por dominio.
- Por dominio, Hogar suele ser masivo (tarifa estándar, varias compañías) y ART no.
- `CU-09` `SUP_1` y la regla `RN_5` dependen de esto.

**Decisión pendiente:** clasificar por **dominio** o por **lo que el MVP puede cotizar hoy por API**. Afecta el nombre de las carpetas y el caso 21.

### B2. Ramos habilitados en el MVP
- El presupuesto contempla solo Automotor.
- El prototipo habilita también Hogar, Accidentes Personales y ART.
- `CU-09` `RN_3` y `SUP_2` lo reflejan.

**Decisión pendiente:** qué ramos aparecen habilitados en el MVP.

### B3. Qué pasa al volver al selector de ramo
- `CU-10` `1a` vuelve a "Elegí la cobertura" (`SUP_9`).
- `CU-09` `SUP_5` pregunta qué pasa con los datos de una cotización en curso si se cambia de ramo.

**Decisión pendiente:** si al volver se descarta la cotización o se conserva el ramo (se relaciona con `CU-12`).

---

## C. Inconsistencias previas en otros documentos

- En la lista, el caso 23 se describe como *"Sumar una póliza con '+'"*, pero su archivo se llama `CU-23-Cartera_Dar_de_Alta_Cliente`. Ya estaba así antes de renumerar.
- El borrador `CU-Multicotizador-01-Cotizar_Automotor.md` sigue en la raíz de `casos-de-uso/`; hay que borrarlo cuando se hayan absorbido sus pasos.

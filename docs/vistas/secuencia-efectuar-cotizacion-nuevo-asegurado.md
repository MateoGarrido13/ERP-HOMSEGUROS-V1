# Vista de secuencia — Efectuar cotización de un productor logueado para un nuevo asegurado

Escenario de los casos CU-09, CU-10 (cliente nuevo), CU-17 y la emisión que hoy hace el adaptador de Mercantil. El productor ya inició sesión (CU-01). Esta vista termina cuando ve las coberturas cotizadas. Armar el PDF y enviarlo es otro escenario (CU-13, CU-14).

El asegurado nuevo queda asociado a la cotización. Al enviar la propuesta se persiste con `activa=false`. Entra a Cartera (`activa=true`) en CU-16 desde Pendientes, no al cotizar. Orden: ramo → cliente → riesgo (el prototipo riesgo→cliente queda desalineado).

## Participantes

| Participante | Rol en el escenario |
| --- | --- |
| Productor | PAS con sesión abierta y rol `pas` |
| Pantalla Cotizar | Ramos, datos del asegurado, vehículo y comparación |
| Módulo Cotización | Valida el riesgo y orquesta la emisión |
| Cartera | Busca el DNI del PAS. En este escenario no inserta al asegurado |
| Adaptador Mercantil | Traduce el riesgo propio al pedido de la compañía y la respuesta a planes |
| API Mercantil | Localidades, vehículos y `POST /cotizaciones/v2/auto` |
| Postgres | `cotizaciones` y `cotizacion_planes`, en una sola transacción |
| Consultas | `CONSULTAS.log`. Si la emisión falla, también `AUDITORIA.LOG` |

## Secuencia

```mermaid
sequenceDiagram
    actor PAS as Productor
    participant UI as Pantalla Cotizar
    participant Cot as Módulo Cotización
    participant Car as Cartera
    participant Adp as Adaptador Mercantil
    participant API as API Mercantil
    participant DB as Postgres
    participant Log as Consultas

    Note over PAS, UI: Sesión de PAS ya abierta. Cotizar solo se muestra a ese rol.

    PAS->>UI: Abre Cotizar
    UI-->>PAS: Ramos habilitados
    PAS->>UI: Elige Automotor
    UI-->>PAS: ¿Nuevo cliente o cliente existente?
    PAS->>UI: Nuevo cliente
    UI-->>PAS: Formulario del asegurado
    PAS->>UI: Nombre, apellido, email, teléfono y DNI
    UI->>UI: Valida obligatorios y formato

    alt Falta un dato o el formato no sirve
        UI-->>PAS: Marca el campo y no avanza
    else Datos válidos
        opt El PAS informó DNI
            UI->>Car: ¿Ese DNI ya es de un cliente de este PAS?
            alt El DNI ya existe
                Car-->>UI: Cliente coincidente
                UI-->>PAS: Muestra ese cliente y no crea otro
                PAS->>UI: Confirma usarlo
            else No hay coincidencia
                Car-->>UI: Sin cliente para ese DNI
            end
        end
        UI->>Cot: Asocia el asegurado a la cotización en curso
        Note over Cot, Car: El asegurado no se inserta en la cartera
        UI-->>PAS: Formulario del vehículo
        PAS->>UI: Patente, CP, localidad, uso, marca, modelo, año, GNC y rastreo
        UI->>UI: Valida el riesgo
        alt El riesgo está incompleto
            UI-->>PAS: Marca el campo y no consulta a la compañía
        else Riesgo válido
            UI->>Cot: Emitir cotización
            Cot->>Adp: Cotizar el riesgo
            par Catálogos de la compañía
                Adp->>API: Buscar localidad por CP
                API-->>Adp: Localidad
            and
                Adp->>API: Buscar vehículo por marca, modelo y año
                API-->>Adp: Código InfoAuto
            end
            Adp->>API: POST /cotizaciones/v2/auto
            alt La compañía responde
                API-->>Adp: Suma asegurada y planes
                Adp->>DB: INSERT cotizaciones y cotizacion_planes
                DB-->>Adp: Id de la cotización
                Adp-->>Cot: Planes de la oferta
                Cot->>Log: cotizar_automotor 201
                Cot-->>UI: Cotización guardada
                UI-->>PAS: Comparación de coberturas
            else La compañía no responde o rechaza
                API-->>Adp: Error
                Adp-->>Cot: No hay oferta
                Cot->>Log: cotizar_automotor con el error
                Cot-->>UI: Mensaje de error
                UI-->>PAS: No se guardó la cotización
            end
        end
    end
```

## Qué queda al terminar

- Hay una fila en `cotizaciones` (`ramo` automotor, `company` mercantil, `status` quoted) y una fila por plan en `cotizacion_planes`.
- El productor ve los planes para comparar. Todavía no eligió cobertura ni se generó propuesta.
- Si el DNI ya existía, se reutilizó ese cliente. Si era nuevo, sus datos viajan con la cotización y la cartera no cambió.

## Dónde está hoy en el prototipo

La pantalla de automotor (`QuoteForm` en `/cotizar/automotor`) emite la cotización al confirmar el vehículo y pasa a `/cotizar/comparar`. El paso del asegurado nuevo está en `/cotizar/asegurado`: valida nombre, apellido, email, teléfono y DNI en el navegador y sigue con esos datos en la URL. No hay tabla de asegurados ni búsqueda de DNI en la cartera. El `productor_id` que se guarda sale de la configuración de Mercantil, no de la sesión abierta.

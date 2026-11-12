Los números de póliza no son universales ni únicos; pueden repetirse perfectamente en una base de datos que agrupa a múltiples compañías.

Cada aseguradora genera su numeración de forma aislada basándose en las reglas de su propio sistema core. Para "La Segunda", la póliza 450098 puede ser un seguro de granizo, y para "Mercantil Andina", el número 450098 puede corresponder a una póliza de flota automotor. Ambas son válidas en sus respectivos universos, pero si tu sistema intenta guardar ambas usando solo el número de póliza como identificador único, la base de datos arrojará un error de colisión.

Incluso dentro de una misma aseguradora, el número puede repetirse si pertenecen a distintas ramas (por ejemplo, reinician el contador a cero para Vida y tienen otro contador para Autos) o a distintas sucursales de emisión.

Implicancia para la Arquitectura de la Base de Datos
En el diseño relacional del ERP, nunca debes utilizar el número de póliza literal que devuelve la compañía como Clave Primaria (Primary Key). Sino que habra que agrgear otros atributos que lo identifiquen univocamente 

Para modelar esto correctamente en PostgreSQL u otro motor relacional, la tabla debe tener su propio identificador interno (UUID o serial), y el control de duplicados se gestiona mediante un Índice Único Compuesto (Composite Unique Constraint) que amarre la aseguradora, la rama y el número.

**Rama en el ERP:** `poliza.tipo CHAR(2)`: `HO` hogar, `AU` automotor, `CO` consorcio, `CC` comercio. Extensiones independientes: `poliza_hogar`, `poliza_automotor`, `poliza_consorcio`, `poliza_comercio`. Hogar, consorcio y comercio referencian `inmueble`. No usar el número de póliza como PK.

**Implementación en `sql/schema/schema.sql`:**

| Rol | Columna / constraint |
| --- | --- |
| PK interna | `poliza.id` |
| Compañía | `poliza.id_aseguradora` → `aseguradora` |
| Rama | `poliza.tipo` |
| Número carrier | `poliza.numero_poliza` |
| Unicidad legal | `UNIQUE (id_aseguradora, tipo, numero_poliza)` |

**Endosos:** el contrato es una fila `poliza`; las modificaciones son filas `endoso` con `id_poliza` (relación 1:N). **Decisión:** no se registra un endoso si la póliza no existe o no está completa (todos sus atributos). `poliza.vigente` (true vigente, false no vigente) **no** impide el endoso: un deudor moroso cuya póliza ya se dio de baja puede tener un endoso para terminar el saldo pendiente. En CU-16 se inserta primero la póliza vigente completa y, en la misma transacción, el primer endoso. Cada emisión posterior es una **nueva tupla** sobre esa misma póliza (vigente o no); las anteriores no se modifican (historial). Columnas: `importe`, `metodo_pago` (`A` débito automático, `T` tarjeta, `E` efectivo/transferencia), `pagado` (true ya pagó, false aún no).

**Fechas:** toda póliza tiene `fecha_inicio` (emisión) y `fecha_fin` (renovar el **acuerdo**, no el pago). Se fijan al cargar la póliza o en renovaciones. `vigente=false` en la baja **no** borra ni retrasa `fecha_fin`.

**Pagos:** `fecha_prox_pago` alimenta PENDIENTES (avisos de cobro). Resolver el aviso registra un **endoso** cuya `fecha_emision` no excede `fecha_fin`. Emitir ese endoso actualiza `fecha_prox_pago`; si `pagado=true`, se corre **X** días. X no es 30: depende de `poliza.cuotas` (cuotas con las que se registró el acuerdo).
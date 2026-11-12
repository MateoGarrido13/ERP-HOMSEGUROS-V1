# Tipos de documento (AFIP)

Catálogo de tipos de identificación para clientes de cartera (`asegurado`). La columna `codigo_afip` es el código que pide AFIP en integraciones futuras (facturación, padrones, rúbrica).

| `sigla` | `codigo_afip` | `descripcion` |
| --- | --- | --- |
| DNI | 96 | Documento Nacional de Identidad |
| CUIT | 80 | Clave Única de Identificación Tributaria |
| CUIL | 86 | Código Único de Identificación Laboral |
| LE | 89 | Libreta de Enrolamiento |
| LC | 90 | Libreta Cívica |
| CDI | 87 | Clave de Identificación |
| CI | 0 | Cédula de Identidad (en AFIP suele informarse como 00) |
| PASAPORTE | 94 | Pasaporte Extranjero |

**Esquema:** `tipos_documento` en `sql/schema/schema.sql`. Cada `asegurado` tiene `tipo_documento_sigla` → `tipos_documento.sigla` y `numero_documento` (texto; admite CUIT, pasaporte, etc.).

**Pendiente:** `usuario` (productor con login) sigue con `dni INTEGER`; alinear tipo + número si AFIP o la red lo exige.

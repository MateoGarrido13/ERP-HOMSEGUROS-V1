# Middlewares de integración con aseguradoras (AR)

Contexto de decisión (sep 2026):

- El PAS opera su propia cartera; Luciani coordina. El middleware no puede ser “otra pantalla más”.
- No se elige ramo de entrada todavía. Cotizar/emitir autos es lo único con oferta pública madura.
- Objetivo: **un conector**, no N APIs de compañía en v1.
- Contrato interno: Mercantil Andina y Sancor = sí. Middlewares cubren 10/15 compañías. La Caja = dudosa.

Los precios públicos están en USD y, en SOFTeam, se facturan en pesos al CCL del mes anterior + IVA. Casi ninguna API tiene Swagger público: hay que pedir contrato técnico.

---

## Qué problema resuelve un middleware

Cada aseguradora habla un dialecto (SOAP, archivos, portal, WS propio). El middleware unifica:

1. Cotizar
2. Emitir / imprimir póliza
3. (Los buenos) volcar cartera, cobranza, comisión, endoso

Para un PAS que administra solo, **(3) saca más carga que (1)**. Cotizar sin vuelco de cartera deja la carga de carga de datos.

---

## Comparativa

| Proveedor | Para qué | Compañías / ramos (público) | Precio público | Documentación de API | Hueco |
|---|---|---|---|---|---|
| **CotiWeb** (SOFTeam) | Multicotizar y emitir autos/motos; API en plan e-commerce | +30 aseguradoras. Mercantil Andina: cotizar + emitir (tabla mar/jun 2026). Sancor aparece en la grilla de interfases; hay que confirmar celda a celda con el vendor | Básico PAS: **u$s 240/año** (2 usuarios, 6 cías, 500 presupuestos/mes). Emisión directa **recién desde el 4º usuario**. Red organizador: **u$s 1.200/año** (10 usuarios, +30 cías, 2.500 presupuestos, emisión incluida). Extra: u$s 11–12/usuario (+250 presupuestos). E-commerce: consultar. Infoauto aparte si e-commerce o >4 matrículas | Comercial: [cotiweb](https://softeam.com.ar/st/cotiweb/) · tienda: [cotiweb tienda](https://softeam.com.ar/st/tienda/cotiweb/). **No hay Swagger público.** Integración WS mencionada para Prodigal u “otro administrador que implemente la integración” | Sin docs técnicas abiertas. Básico no alcanza para red ni para emitir |
| **Bienseguro** (SOFTeam) | Portal red/asegurados + **API única a +30 cías** (chatbot, sitio) | Misma familia que Prodigal. Notificaciones, póliza, cuota, cross-sell. Rúbrica digital en usuarios PAS | Usuario red: **u$s 100/año** (1), **450** (5), **870** (10). Asegurados: **u$s 470/año** (500), **1.050** (1.500), **1.990** (3.000). Pack notificaciones: 50 / 88 / 170 USD. **La API para sistemas externos no está en esos packs** (“consulte”) | [bienseguro](https://softeam.com.ar/st/bienseguro/) | Precio de la API real es opaco. Encaja canal asegurado, no reemplaza core |
| **Prodigal** (SOFTeam) | Core de cartera (no es solo middleware): pólizas, cobranzas, liquidaciones, siniestros, CRM, rúbrica, interfases | Tabla de interfases (jun 2026): [resumen](https://www.softeam.com.ar/prodigalgx/doc/prodigalgx_interfases_resumen.htm). Incluye Allianz, Mercantil Andina (cotizar + emitir + más), La Caja (en grilla; no asumir “sí”), Sancor, Zurich, etc. Capacidades: vuelco cartera, emisión periódica, cobranza/liq. electrónica, siniestros, rúbrica | Shop nuevas instalaciones: paquete 2 usuarios + hasta 4 matrículas + 4 cías/usuario + 2.000 pólizas. Publicado **$ 189.200** (moneda a confirmar: el resto del sitio cotiza en u$s). Extra **u$s 17/usuario** (+1.000 pólizas, 1 GB) | [Prodigal](https://softeam.com.ar/st/tienda/prodigal-gestion-cartera-seguros/) · interfases: [tabla](https://www.softeam.com.ar/prodigalgx/doc/prodigalgx_interfases_resumen.htm) | Si lo usamos como core, el PAS hereda otro AdminSE. Sirve como **catálogo de qué interfase existe**, no como producto a white-label |
| **AbsaNet API** (Grupo Absa) | WS de cotizar / emitir / imprimir. Módulos siniestros mencionados | Autos: Zurich, Sura, Meridional, **Sancor**, Allianz, Mapfre, La Holando, HDI, **Mercantil Andina**, “entre otros”. Plataforma también habla líneas personales, corporativos, vida, ART (producto AbsaNet, no necesariamente la API) | **Sin lista de precios pública.** Contacto: contacto@grupoabsa.com.ar · (+54 11) 5235-2100 · [grupoabsa.com.ar/absanet](https://grupoabsa.com.ar/absanet.php) | Landing API: [absanetservices.net](https://absanetservices.net/). **Sin OpenAPI/Swagger público.** El sitio absanet.com está detrás de Cloudflare | Encaje contractual (Sancor + Mercantil) es el más explícito. Docs y costo = pedido comercial. Riesgo: Absa es también intermediario |
| **AdminSE / Kaizen AI** | No es middleware genérico: es el competidor de gestión + cotización/emisión propia | Importación ~90–100 cías; emisión ~35 (notas de prensa 2024–2025) | No público (planes Starter / Profesional / Enterprise, 14 días trial) | [adminse.com.ar](https://www.adminse.com.ar/) | Usarlo como “middleware” es sentarse en su core. Lock-in |
| **APIs directas compañía** | Evitar intermediario | **Sancor AR:** APIs de cotización/emisión/pagos mencionadas en prensa; portal y app PAS. **No hay Swagger AR público.** El Swagger que aparece es de [Sancor Brasil](https://docs.sancorsegurosbrasil.com.br/) — **no sirve para el producto argentino**. **Mercantil Andina:** cotización/emisión vía PAS Móvil/SigMa y vía AbsaNet/CotiWeb; API directa no documentada en abierto. **La Caja:** en tabla SOFTeam; en el contrato interno figura como NO/? | A negociar por matrícula / convenio | Sancor PAS: [sancorseguros.com.ar/pas](https://www.sancorseguros.com.ar/pas). Brasil (referencia ajena): [docs.sancorsegurosbrasil.com.br](https://docs.sancorsegurosbrasil.com.br/) | v1 directo = N contratos, N auth, N mapeos. Solo fase 2 si el middleware no cubre una compañía clave |

---

## Lectura para este proyecto

1. **Pedir cotización y contrato de API a dos, no a quince:** AbsaNet (cubre Sancor + Mercantil Andina en autos, alineado al contrato) y CotiWeb e-commerce / API SOFTeam (precio de entrada conocido, +30 cías).
2. **No firmar el plan CotiWeb Básico** si la red es de varios PAS: no emite hasta el 4º usuario y corta a 6 compañías.
3. **La API que saca carga al PAS no es la de cotizar.** Es el vuelco de cartera / cobranza / comisión (Prodigal–Bienseguro o equivalente inbound). Cotizar sin eso deja al productor cargando pólizas.
4. **La Caja, ramos no auto, y tipo de cobro** no se cierran con landing. El BO tiene que listar compañías reales y mix de cartera.
5. **n8n / Figuro** orquestan *después* del conector. No cotizan primas.

---

## Pedido comercial (texto para el BO)

A Absa y a SOFTeam, en paralelo:

- OpenAPI o WSDL de cotización, emisión, impresión, consulta de póliza.
- Auth (API key, certificado, por matrícula SSN).
- Idempotencia y timeouts.
- Listado cerrado: compañía × ramo × operación (cotizar / emitir / endoso / cobranza / comisión / siniestro).
- Costo: onboarding, abono, extra por PAS, extra por request.
- Si la cartera queda en *su* base o podemos ser sistema de registro.
- Habilitación: ¿cada PAS autoriza en la aseguradora, o Luciani como organizador habilita la red?

Hasta que eso entre, el diseño técnico es un **adapter `QuoteIssuer`** con un solo proveedor detrás, swappeable.
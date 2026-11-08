# ControlPréstamos Pro — Calendario 30 días (mundo trailero)

**Producto:** app instalable (PWA) para llevar clientes, préstamos, pagos, reportes y respaldo. PIN de 4 dígitos. C$ / USD. Pagos diarios, semanales, quincenales o mensuales.
**Público (supuesto, confirmar):** quien presta o da adelantos a traileros y transportistas de carga: prestamistas, dueños de trailas con choferes, financieras pequeñas.
**Dolor central:** el trailero anda en ruta días o semanas, las cuotas se atrasan o se pagan por partes, y todo está en cuaderno o WhatsApp.
**Tono:** de carretera, directo, respetuoso. Sin prometer ganancias. Datos demo siempre, nunca clientes reales.
**Formatos:** Reel 15–40 s · Carrusel 5–7 láminas · Post · Story.

---

## Semana 1 — El problema: la ruta no perdona el cuaderno

| Día | Formato | Tema / gancho | CTA |
|---|---|---|---|
| 1 | Reel | "Tu trailero salió a Honduras y no sabes cuánto te debe" → Dashboard con total prestado / cobrado / pendiente | Sígueme |
| 2 | Carrusel | 5 errores al prestarle a traileros: cuota olvidada, abonos sin anotar, saldo de memoria, cuaderno perdido, no saber quién está vencido | Guarda el post |
| 3 | Post | "Una traila parada no paga cuotas, pero un registro claro sí te protege" | Comparte |
| 4 | Reel | Tour de 20 s: Inicio → Clientes → Préstamos → Pagos → Más | Escríbeme DEMO |
| 5 | Story | Encuesta: "¿Cómo llevas el cobro a tus traileros?" Cuaderno / Excel / WhatsApp / App | Vota |
| 6 | Reel | Antes vs después: cuaderno en la cabina vs app en el celular | Prueba la demo |
| 7 | Post | Resultado de la encuesta + resumen semanal | ¿Te muestro cómo? |

## Semana 2 — Paso a paso

| Día | Formato | Tema | Qué mostrar |
|---|---|---|---|
| 8 | Reel | Registrar a un trailero en 30 s (nombre, teléfono, datos de ruta/placa si los usas en notas) | Clientes → + |
| 9 | Reel | Préstamo para repuestos / llantas / combustible: cuota calculada | Monto, interés, cuotas, frecuencia, fecha de vencimiento |
| 10 | Carrusel | Pago semanal, quincenal o por viaje: ¿cuál le conviene a un trailero? | Las 4 frecuencias con ejemplo |
| 11 | Reel | Registrar un abono parcial cuando llega de ruta | Pagos → +, baja el saldo |
| 12 | Post | Captura del historial de un préstamo | Anotada |
| 13 | Reel | "Yo ya te pagué en Managua": búscalo en 5 segundos | Historial de pagos |
| 14 | Story | Caja de preguntas | Responder la semana siguiente |

## Semana 3 — Control

| Día | Formato | Tema | Notas |
|---|---|---|---|
| 15 | Reel | Vencidos de un vistazo, aunque el trailero siga en ruta | Tarjeta roja del Dashboard |
| 16 | Carrusel | Cómo cobrar a quien anda en carretera sin pelear: mensaje amable, acuerdo al regreso, registrar todo | Consejos |
| 17 | Reel | Reporte de cobros de hoy / semana / mes | Filtros de Reportes |
| 18 | Reel | Exportar reporte (CSV) | Grabar solo tras verificar que funciona |
| 19 | Post | "Tu cartera con PIN" | No decir "encriptado" si no lo es |
| 20 | Reel | Respaldo en 1 clic: si se te pierde el celular en ruta, no pierdes la cartera | Más → Respaldo; aclarar dónde se guardan los datos |
| 21 | Story | Lo mejor de la semana + "Quiero la demo" | Medir clics |

## Semana 4 — Confianza y cierre

| Día | Formato | Tema | Notas |
|---|---|---|---|
| 22 | Reel | Instálala en tu celular (Android / iPhone) | Añadir a pantalla de inicio |
| 23 | Carrusel | Preguntas frecuentes: precio, internet (¿sirve en carretera con mala señal?), dónde están mis datos | Solo respuestas verificadas |
| 24 | Reel | Testimonio real con permiso | Si no hay, "caso de ejemplo" rotulado |
| 25 | Post | "¿Cuánto cuesta un préstamo de C$20,000 al 10%?" | Validar el cálculo antes |
| 26 | Reel | Un día de un prestamista de traileros | Cobros del día / reporte |
| 27 | Carrusel | Mitos del préstamo informal | Educativo |
| 28 | Story | Cuenta regresiva de oferta | Solo si hay oferta |
| 29 | Reel | Oferta / demo guiada | Requiere precio y enlace |
| 30 | Post + Story | Recapitulación + agradecimiento | WhatsApp |

---

## Banco de textos
**Gancho Reel 1:** "Tu trailero sale a ruta… ¿y tú sabes cuánto te debe? 🚛"
**Caption base:** "Clientes, préstamos y abonos en un solo lugar. Cuotas calculadas, vencidos a la vista y respaldo. Escríbeme DEMO por WhatsApp 👇"
**Hashtags:** #traileros #transportistas #trailas #prestamos #nicaragua #centroamerica #controlfinanciero

---

## Lo que me falta de tu parte
**Bloqueantes**
1. Confirmar el público: ¿prestamistas a traileros, dueños de trailas o traileros mismos?
2. Precio o modelo de venta (días 23, 28, 29).
3. URL de la app y número de WhatsApp (el repo no tiene ninguno).
4. Logo, colores y nombre de cuenta.
5. País y redes que usas (¿programo en Metricool?).

**Verificar en el producto**
6. Si funciona sin internet (clave para carretera): pruébalo en el celular.
7. Dónde se guardan los datos; cambia el mensaje de seguridad.
8. Qué hay completo en CSV / recibos / WhatsApp.
9. Cálculo de intereses (`src/utils/calculations.js`): el "fijo" no depende del número de cuotas y el "mensual" suma interés × cuotas sin considerar la frecuencia. Validar con un caso real antes de los días 9 y 25.

**Material tuyo**
10. ~11 grabaciones de pantalla con datos demo (días 1, 4, 8, 9, 11, 13, 15, 17, 20, 22, 26).
11. Decidir si sales en cámara.
12. Un testimonio real con permiso (día 24).
13. Fotos o clips de trailas propios o con licencia, para no usar imágenes ajenas.

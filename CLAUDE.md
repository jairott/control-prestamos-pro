# Proyecto: Sales 7/24

## Qué es
Sistema de ventas automatizado que atiende y califica clientes por WhatsApp las 24 horas, los 7 días de la semana, usando agentes de IA. Meta final: convertirlo en un producto/curso vendible, grabado con Loom.

## Stack
- n8n (flujos de automatización)
- GoHighLevel / GHL (CRM y pipeline)
- Meta Ads (anuncios que abren directo en WhatsApp)
- Supabase (base de datos y memoria)
- Agentes de IA:
  - Jack: TraiMax (trailers). Se presenta al cliente como "Jairo Torres". Workflow principal en n8n: "Jack - TraiMax Redis (CLIENTES NUEVOS)" (id zMYJcloAwwbIRrEc), el que usamos con más frecuencia. El flujo "Jairo - TraiMax WhatsApp GHL" (id 7LrqZC313XsBiDAB) es la versión anterior.
  - Luis: reparación de crédito

## Cómo trabajamos
- El usuario construye y prueba el sistema con Claude; después convierte lo hecho en material del curso.
- Documentar cada paso de lo que se hace, para poder explicarlo en el curso.
- Antes de cambiar algo en producción (n8n, GHL, Meta Ads): explicar qué se va a hacer y esperar confirmación del usuario.
- Responder siempre en español.

## Redes sociales TraiMax (orgánico)
- Herramienta: Metricool (blogId 7270818, zona America/Chicago). Abency descartado (prueba vencida, de pago).
- Facebook: página TraiMax (id 1217389801446914). Instagram: @jairotorrestalavera (confirmado por Jairo para TraiMax).
- Meta: 2 posts diarios de trailers distintos. Jairo pasa las fotos; Claude escribe el texto y deja borrador para aprobación.
- Textos en español, sin precio. Fotos en Google Drive: carpeta "TraiMax - Fotos Redes." (id 1_fyT7bzeNyW9Eo9Ya5Xyc_D0rqQ7xrGp, enlace público como lector).
- Las fotos HEIC fallan en Metricool desde enlace de Drive: usar JPG o subir directo en el editor.
- La interfaz de Metricool muestra la hora en zona de Madrid; el post de las 10:00 de Odessa se ve como 17:00.
- FLUJO QUE FUNCIONA (13-oct): Claude hace el creativo (JPG 1080x1350 con PIL), lo sube a fotos-redes/ en el repo (público) y pasa la URL raw.githubusercontent.com a Metricool, que la importa sola. Drive y HEIC NO funcionan en Metricool.
- Oferta aprobada por Jairo en los posts: "Llévatela sin checar crédito*" con "*Aplican condiciones". Número de Jack para WhatsApp: (432) 577-0644. Capacidad dump 14TD: 14,000 lb (confirmado por Jairo).

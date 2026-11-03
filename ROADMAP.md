# Próximas mejoras de Pixel Flight

Propuestas aceptadas como hoja de ruta el 19 de octubre de 2026. Implementarlas de forma incremental según lo pida el usuario.

- [x] Patrones de tuberías con ascensos, descensos, precisión y descansos (v1.12.0).
- [x] Powerups en rutas opcionales con riesgo y recompensa y comprobación de regreso al hueco (v1.12.0).
- [x] Breve protección contra tuberías al detonar bombas, con destello visible (v1.13.0).
- [x] Resultados de partida con día alcanzado, tuberías superadas, bonus, velocidad máxima y récords personales (v1.13.0).
- [x] Desafío diario con una misma secuencia de obstáculos y powerups para todos y récord separado.
- [x] Cosméticos por logros: pájaros, estelas y colores de explosión, sin ventajas de juego (v1.14.0).

Mantener la estética pixel art, la progresión gradual y muertes comprensibles. El marcador incluye bonus; los ciclos de paisaje, hora y día solo dependen de tuberías superadas.

- [x] Pájaros adversarios desde 35 tuberías, con vuelo recto, progresión y protección de bomba compartida (v1.15.0).

## Plan de dinamismo — 1 de noviembre de 2026

La implementación se organiza en entregas jugables. El usuario autorizó comenzar y elegir el orden; cada etapa requiere pruebas de compatibilidad y una revisión en móvil antes de publicarse.

### Etapa 1 · Ritmo y ejecución — v1.28.0
- [x] Identificar los tramos existentes cuando se aproximan, con nombre y progreso.
- [x] Premiar desafíos completos sin bombas/protección con +10 puntos.
- [x] Barra de cinco segmentos: pasos por el centro, powerups y vuelos rasantes.
- [x] Niveles de combo con premios de +5, +10 y +15 puntos; pausa sin caducidad y reinicio al perder precisión, detonar o morir.
- [x] Desglose de nuevos bonus y compatibilidad de récords anteriores.
- [x] Evitar premios repetidos al recuperar checkpoints; conservar dificultad y generación segura.

### Etapa 2 · Objetivos cortos — v1.29.0 / v1.29.1
- [x] Un objetivo opcional activo, asignado automáticamente y elegible según el progreso.
- [x] Ejemplos: cinco tuberías sin bombas, dos vuelos rasantes o recoger un reloj.
- [x] Recompensa moderada y estado de progreso; no exigir objetos aún bloqueados ni objetivos simultáneos incompatibles.
- [x] Separar estos bonus de los contadores del mundo y evitar repetir pagos en checkpoints.

### Etapa 3 · Eventos de paisaje y música — v1.30.0
- [x] Incorporar primero un evento acotado, anunciado y validado por el generador, con una salida segura y un descanso posterior.
- [x] Extender gradualmente a los nueve paisajes: meteoritos, burbujas/criaturas, túneles urbanos, etc.
- [x] Nunca combinar un evento con un grupo de enemigos o un movimiento que cierre todas las salidas.
- [x] Música retro sintetizada, optativa y con control propio; capas por paisaje, combo y evento, respetando silencio y pausa.
- [x] Efectos de celebración en checkpoints y estrenos de cosméticos, con movimiento reducido.

### Etapa 4 · Desafío diario — v1.31.0
- [x] Semilla común por fecha UTC, secuencia reproducible de obstáculos y powerups y versión de reglas fija.
- [x] Separar aleatoriedad de mecánicas, arte y audio para que distintos dispositivos conserven el recorrido.
- [x] Récord diario separado; sin cuentas ni clasificación online en la primera entrega.
- [x] Mostrar fecha, reglas y resultado, conservando la partida normal.

Criterios compartidos: interfaz legible en móvil, decisiones opcionales, avisos que no tapen obstáculos, recompensas separadas de dificultad y partidas guardadas compatibles. Las cuatro etapas están implementadas.

Presentación v1.29.1: objetivos pasivos de dos líneas abajo en el centro, solo durante el vuelo; sin tarjeta, anuncio en el título ni cambio manual. Premios por objetivos y combos en el aviso central compartido con los powerups, con cola para coincidencias.

Etapa 3: prueba opcional de tres sellos (+30) validada por rutas; nueve ambientaciones decorativas, aviso, cancelación por bomba y descanso sin nuevos adversarios ni movimientos. Música optativa con control independiente y celebraciones discretas. No incorpora nuevos proyectiles letales.

Audio v1.31.0: controles independientes de música y efectos (0–100 %), guardados en el dispositivo y accesibles desde la pausa.

Diario v1.31.0: 100 posiciones, arena vertical común, checkpoint en la posición 50 incluso con la tubería destruida, récord por fecha UTC y reglas daily-v1. Generación determinista separada del arte/audio, pasos de simulación fijos y validación de desvíos/adversarios. Eventos de sellos solo en el modo normal.

Corrección v1.31.4: precisión evaluada al cruzar el centro de cada tubería, activa desde el inicio y al continuar una vida. Reglas diarias daily-v2 para separar los récords del cálculo anterior, conservando el mapa de cada fecha.

Interfaz v1.31.5: sonido reunido en Ajustes del inicio y de la pausa; desafío diario integrado en el menú dentro de la pantalla del juego.

Corrección v1.31.6: reajuste de pantalla completa al cambiar entre modo normal y diario, con proporciones exactas del lienzo interior.

Interfaz v1.31.7: avisos compactos de recompensas junto al HUD derecho; los relojes mantienen su presentación central.

# Próximas mejoras de Pixel Flight

Propuestas aceptadas como hoja de ruta el 19 de octubre de 2026. Implementarlas de forma incremental según lo pida el usuario.

- [x] Patrones de tuberías con ascensos, descensos, precisión y descansos (v1.12.0).
- [x] Powerups en rutas opcionales con riesgo y recompensa y comprobación de regreso al hueco (v1.12.0).
- [x] Breve protección contra tuberías al detonar bombas, con destello visible (v1.13.0).
- [x] Resultados de partida con día alcanzado, tuberías superadas, bonus, velocidad máxima y récords personales (v1.13.0).
- [ ] Desafío diario con una misma secuencia de obstáculos y powerups para todos y récord separado.
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

### Etapa 2 · Objetivos cortos
- [ ] Un objetivo opcional activo, explicado antes de comenzar y elegible según el progreso.
- [ ] Ejemplos: cinco tuberías sin bombas, dos vuelos rasantes o recoger un reloj.
- [ ] Recompensa moderada y estado de progreso; no exigir objetos aún bloqueados ni objetivos simultáneos incompatibles.
- [ ] Separar estos bonus de los contadores del mundo y evitar repetir pagos en checkpoints.

### Etapa 3 · Eventos de paisaje y música
- [ ] Incorporar primero un evento acotado, anunciado y validado por el generador, con una salida segura y un descanso posterior.
- [ ] Extender gradualmente a los nueve paisajes: meteoritos, burbujas/criaturas, túneles urbanos, etc.
- [ ] Nunca combinar un evento con un grupo de enemigos o un movimiento que cierre todas las salidas.
- [ ] Música retro sintetizada, optativa y con control propio; capas por paisaje, combo y evento, respetando silencio y pausa.
- [ ] Efectos de celebración en checkpoints y estrenos de cosméticos, con movimiento reducido.

### Etapa 4 · Desafío diario
- [ ] Semilla común por fecha UTC, secuencia reproducible de obstáculos y powerups y versión de reglas fija.
- [ ] Separar aleatoriedad de mecánicas, arte y audio para que distintos dispositivos conserven el recorrido.
- [ ] Récord diario separado; sin cuentas ni clasificación online en la primera entrega.
- [ ] Mostrar fecha, reglas y resultado, conservando la partida normal.

Criterios compartidos: interfaz legible en móvil, decisiones opcionales, avisos que no tapen obstáculos, recompensas separadas de dificultad y partidas guardadas compatibles. Las etapas 2–4 permanecen pendientes; esta entrega implementa la etapa 1.

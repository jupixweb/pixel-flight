# Pixel Flight

Un juego arcade de vuelo, reflejos y decisiones de riesgo y recompensa: atraviesa tuberías, esquiva adversarios, recoge powerups y llega lo más lejos posible entre paisajes de pixel art.

**Versión del juego: 1.27.6**, publicada el 26 de octubre de 2026.  
**Documentación actualizada:** 26 de octubre de 2026.

**[Jugar en la web](https://pixel-flight-arcade.jupixweb.chatgpt.site/)**

## Contenido

- [Cómo jugar](#cómo-jugar)
- [Controles](#controles)
- [Marcador y puntuación](#marcador-y-puntuación)
- [Dificultad y tuberías](#dificultad-y-tuberías)
- [Powerups](#powerups)
- [Vidas y checkpoints](#vidas-y-checkpoints)
- [Adversarios y vuelo rasante](#adversarios-y-vuelo-rasante)
- [Paisajes y ciclo del día](#paisajes-y-ciclo-del-día)
- [Hitos principales](#hitos-principales)
- [Logros y desbloqueables](#logros-y-desbloqueables)
- [Resultados y récords](#resultados-y-récords)
- [Pantalla, sonido y accesibilidad](#pantalla-sonido-y-accesibilidad)
- [Guardado local](#guardado-local)
- [Consejos de juego](#consejos-de-juego)
- [Archivos y mantenimiento](#archivos-y-mantenimiento)

## Cómo jugar

El pájaro cae por gravedad. Cada aleteo le da un impulso hacia arriba; el escenario se desplaza automáticamente hacia la izquierda. El objetivo es atravesar los huecos entre las tuberías y sobrevivir el mayor tiempo posible.

En este manual, **una tubería superada** significa haber dejado atrás un par completo de tuberías, superior e inferior. Cada par cuenta una sola vez.

Comienzas una partida en el bosque, al amanecer del día 1, con:

| Recurso o contador | Estado inicial |
| --- | --- |
| Puntuación | 0 puntos |
| Tuberías superadas | 0 |
| Velocidad | ×1,00 |
| Vidas | 3, ampliables hasta 6 |
| Bombas | 0, con capacidad inicial para 3 |
| Checkpoint | Inicio de la partida |

Un choque con una tubería o un adversario, o tocar el suelo o el techo, consume una vida, salvo cuando se aplica la protección correspondiente. Si quedan vidas, puedes continuar desde el último checkpoint. Si se agotan, termina la partida.

### Jugar con la copia descargada

1. Descomprime el ZIP conservando su estructura de carpetas.
2. En Windows, abre **Jugar.cmd**. También puedes abrir **dist/index.html** directamente en el navegador.
3. Pulsa **A VOLAR**, presiona Espacio o toca el área de juego.

No requiere instalación, cuenta de usuario ni servidor para jugar con los archivos locales. El juego funciona sin conexión con sus archivos descargados; la carga de las tipografías externas requiere Internet y utiliza fuentes de respaldo si no está disponible.

## Controles

| Acción | Teclado | Ratón o pantalla táctil |
| --- | --- | --- |
| Comenzar o aletear | Espacio o flecha arriba | Clic o toque en el lienzo; botón A VOLAR |
| Detonar una bomba | X, Enter o Enter numérico | Botón de bombas, abajo a la izquierda |
| Pausar o continuar | P o Escape durante el juego | Botón de pausa, abajo a la derecha, a la izquierda de maximizar |
| Continuar tras perder una vida | Espacio o flecha arriba | CONTINUAR o toque en el lienzo, tras la breve transición |
| Iniciar otra partida al agotar las vidas | Espacio o flecha arriba | OTRA VEZ |
| Ver el récord | — | Pulsar RÉCORD |
| Elegir cosméticos | — | DESBLOQUEABLES en la pantalla de inicio |
| Activar o silenciar sonido | — | Botón de altavoz |
| Maximizar o restaurar | Escape para restaurar | Botón de cuatro esquinas, abajo a la derecha |
| Cerrar un panel | Escape en los diálogos | Botón ×; en resultados vuelve al inicio |

Mantener pulsada una tecla no repite automáticamente aleteos ni detonaciones. Enter funciona como bomba durante el vuelo; Espacio es el control de aleteo.

Escape cierra primero un diálogo abierto o restaura la pantalla ampliada, según el contexto. Para pausar sin cambiar de vista, usa P o el botón de pausa.

## Marcador y puntuación

Hay tres medidas distintas:

| Medida | Para qué sirve |
| --- | --- |
| **Score o puntuación total** | Suma tuberías y bonus; determina el récord y el premio de 300 puntos y las vidas extra cada 500 puntos. |
| **Tuberías superadas** | Controla el ciclo del día, los paisajes, los checkpoints y el desbloqueo inicial de adversarios. |
| **Nivel efectivo de dificultad** | Controla velocidad, estrechamiento y presión de los obstáculos; sube con tuberías y baja con relojes. |

### Cómo sumar puntos

| Evento | Puntos |
| --- | ---: |
| Superar un par de tuberías | +1 |
| Recoger una bomba | +10 |
| Recoger un reloj celeste | +20 |
| Recoger un reloj violeta | +40 |
| Recoger un reloj dorado | +60 |
| Completar un vuelo rasante válido | +25 |
| Recoger un corazón | 0 |
| Recoger la ampliación de bombas | 0 |
| Activar un checkpoint | 0 adicionales |
| Destruir tuberías con una bomba | 0 |

Los bonus **no cuentan como tuberías** y **no aumentan la dificultad**. Por ejemplo, tener 300 puntos gracias a powerups habilita la ampliación de bombas, pero no equivale a haber superado 300 tuberías.

El marcador muestra el score arriba en el centro. A la izquierda se ven el día y, a su derecha, las tuberías superadas; los corazones ocupan la esquina superior derecha. Ambos bloques laterales comienzan a la misma altura que el score. Los controles de pausa/play y maximizar están alineados abajo a la derecha. El cuadro de bombas indica inventario y capacidad, y una pequeña leyenda informa el último checkpoint. A su derecha, debajo de los corazones, aparece el multiplicador de velocidad del nivel efectivo (por ejemplo, ×1,25), con la misma tipografía y tamaño. Se actualiza al superar tuberías, recoger relojes y recuperar un checkpoint.

## Dificultad y tuberías

### Velocidad

Cada tubería superada aumenta el nivel efectivo en 1 y el multiplicador de velocidad en **0,01**:

```text
Velocidad objetivo = ×(1 + nivel efectivo / 100)
```

Sin recoger relojes, 25 tuberías llevan a ×1,25 y 100 tuberías a ×2,00. La velocidad se ajusta suavemente a su nuevo valor. Los relojes reducen el nivel efectivo, pero no retroceden el contador de tuberías.

### Disposición y estrechamiento

Las alturas, distancias y secuencias se sortean en cada partida. El recorrido alterna:

- **Descansos:** tres pares con huecos más amplios y sin movimiento vertical.
- **Ascensos:** huecos que suben gradualmente.
- **Descensos:** huecos que bajan gradualmente.
- **Precisión:** huecos más ajustados.

Los desafíos de ascenso, descenso y precisión aparecen en orden variable entre descansos. Sus tramos suelen tener cuatro o cinco pares.

Con la dificultad, los huecos nuevos se estrechan progresivamente, sin bajar del mínimo global de **64 píxeles internos**. Los cambios de altura están limitados y la separación conserva un tiempo mínimo de aproximación de **1,05 segundos** a la velocidad usada para planificar el tramo. Las tuberías ya visibles no se estrechan repentinamente sobre el pájaro.

### Tuberías móviles

Desde el **nivel efectivo 25**, algunos pares pueden oscilar verticalmente. Ambas mitades se desplazan juntas: el tamaño del hueco se conserva mientras cambia su altura. Los detalles dorados permiten reconocerlas.

La frecuencia, amplitud y rapidez del movimiento crecen gradualmente con el nivel efectivo. Recoger relojes suaviza también las tuberías móviles que ya están en pantalla; a nivel cero, su oscilación se atenúa hasta detenerse.

### Rutas y colocación de powerups

El generador comprueba rutas con la física del pájaro y considera tuberías móviles y adversarios. Puede suavizar un obstáculo, descartar un candidato o aplazar una aparición si no encuentra una ruta viable.

Los powerups suelen estar fuera de la línea más directa y pueden exigir un desvío. De vez en cuando aparecen dentro de los huecos. Los relojes más potentes favorecen desvíos mayores; la colocación busca una trayectoria de recogida y regreso al recorrido.

Estas comprobaciones no pilotan por el jugador: la aproximación al hueco, la altura y el momento de aletear siguen siendo importantes.

## Powerups

Los objetos se recogen al tocarlos. Las bombas se almacenan; los demás aplican su efecto inmediatamente.

Los intervalos siguientes son sorteos de **tiempo de juego activo**, sujetos a las condiciones de aparición. La pausa los congela y una colocación puede retrasarse hasta un tramo adecuado; no son apariciones garantizadas al segundo exacto.

### Bombas violetas

- Recoger una añade **1 bomba** y **10 puntos** si queda espacio en el inventario.
- Comienzas sin bombas y con capacidad para **3**.
- Sus intervalos posteriores de aparición son de **5–12 segundos**; la primera se intenta antes, tras unos **2–5 segundos** activos.
- Si el inventario está lleno, no se aceptan más bombas ni se suman sus puntos.

Al pulsar X, Enter o el botón de bombas:

1. Se consume una bomba.
2. Una explosión multicolor destruye las tuberías visibles.
3. Recibes **0,9 segundos de protección** contra tuberías y adversarios, indicados por un halo.

Los adversarios **sobreviven a la explosión**. Su contacto no hace daño mientras dura la protección, pero vuelve a ser peligroso cuando termina. La protección de bomba no evita perder una vida por tocar el suelo o el techo.

Destruir tuberías no suma puntos ni activa checkpoints. Intentar detonar sin bombas reproduce un sonido de error, si el sonido está habilitado. Las detonaciones no acumulan duraciones de protección; renuevan como mínimo ese breve margen.

### Relojes de arena

Se habilitan al alcanzar por primera vez el **nivel efectivo 25**, equivalente a velocidad objetivo **×1,25**. Después se intentan a intervalos irregulares de **24–42 segundos**.

| Tipo | Color | Reducción de la velocidad actual | Bonus | Probabilidad entre relojes |
| --- | --- | ---: | ---: | ---: |
| Básico | Celeste | −10 % | +20 | 65 % |
| Raro | Violeta | −15 % | +40 | 27 % |
| Legendario | Dorado | −30 % | +60 | 8 % |

Las probabilidades corresponden al **tipo de reloj**, no al conjunto de todos los powerups. Cuanto mayor es el beneficio, menor es su frecuencia relativa.

La reducción se aplica al multiplicador actual: a ×2,00, los relojes celeste, violeta y dorado dejan la velocidad en ×1,80, ×1,70 y ×1,40 respectivamente. La velocidad nunca baja de **×1,00**. Por ejemplo, un reloj dorado recogido a ×1,20 deja la velocidad en ×1,00 y sigue concediendo sus 60 puntos. El aviso muestra el porcentaje realmente aplicado y «¡Velocidad reducida!». Los tipos raros tienen efectos más vistosos.

Después del desbloqueo inicial, los relojes pueden seguir apareciendo por debajo de ×1,25 mientras el nivel sea mayor que cero. A ×1,00 dejan de aparecer y se retiran los relojes presentes; al volver a subir de nivel pueden reanudarse según su temporizador.

Los relojes reducen también la presión de las tuberías móviles y los adversarios. No descuentan puntos ni alteran el día o el paisaje alcanzados.

### Corazones de vida extra

- Un corazón añade **1 vida**, hasta un máximo de **6**.
- No da puntos ni cambia el nivel de dificultad.
- Es un pequeño corazón rosa de pixel art, de tamaño similar al de una bomba.
- Se intenta a intervalos de **60–90 segundos**, cuando faltan vidas y no hay otro corazón pendiente en pantalla.
- Al llegar a 6 vidas deja de aparecer. No se puede guardar una vida por encima del máximo.

Los premios de vidas por score se explican en la sección de vidas y checkpoints.

### Caja de ampliación de bombas

Se habilita al alcanzar **300 puntos totales**, incluidos los bonus; no exige 300 tuberías.

Recogerla aumenta la capacidad de bombas de **3 a 6**. No entrega bombas ni puntos: si tenías 2, pasas de 2/3 a 2/6.

Solo se ofrece una caja a la vez. Si se deja pasar, vuelve a intentarse a intervalos de **12–22 segundos** cuando se cumplen las condiciones. Tras recogerla deja de aparecer. Una partida nueva comienza otra vez con capacidad para 3; continuar desde un checkpoint recupera la capacidad que estaba guardada allí.

## Vidas y checkpoints

### Partida e intentos

Una **partida** comienza con A VOLAR y reúne todos los intentos realizados con sus vidas disponibles. Cada choque termina un **intento o run**. CONTINUAR abre otro intento dentro de la misma partida; OTRA VEZ, después de agotar las vidas, comienza una partida nueva.

Las estadísticas de un intento incluyen el progreso recuperado desde el checkpoint, no solo lo conseguido después de reaparecer.

### Vidas iniciales y premios por puntuación

Comienzas con **3 vidas** y puedes reunir hasta **6**. Cada choque válido descuenta una sola vida.

| Hito de score total | Premio |
| --- | --- |
| Cada 500 puntos totales (500, 1000, 1500, 2000, etc., sin límite de hitos) | +1 vida, hasta el máximo de 6 |

Los bonus también permiten cruzar estos umbrales. Cada premio se concede **una sola vez por partida**, aunque vuelvas a cruzarlo después de regresar a un checkpoint. Si ya tienes 6 vidas al alcanzarlo, el premio no queda reservado para después.

### Activar una bandera

Cada **50 tuberías realmente superadas** se activa un checkpoint: 50, 100, 150, 200… Un banderín dorado animado señala la tubería correspondiente y un aviso confirma que el progreso se guardó.

La bandera es decorativa; el guardado se activa al superar la tubería, no al tocar el banderín. No se obtiene un checkpoint por acumular bonus ni por destruir esa tubería con una bomba.

### Qué sucede al perder una vida

Si todavía tienes vidas, aparece **CONTINUAR**. Regresas al checkpoint más cercano ya activado; si aún no hay ninguno, vuelves al inicio de la partida.

| Se recupera desde el checkpoint | Se conserva a lo largo de la partida |
| --- | --- |
| Score y desglose de bonus | Vidas que te quedan después del choque |
| Tuberías superadas y día | Premios de cada múltiplo de 500 puntos ya reclamados |
| Nivel efectivo y velocidad correspondiente | Mejor intento registrado de la partida |
| Paisaje y fase del ciclo visual | Logros y cosméticos ya desbloqueados |
| Bombas y capacidad del inventario | Récords personales ya guardados |
| Estado de desbloqueo de relojes y pico de velocidad guardado | Progreso de logros de la partida, como relojes recogidos y bombas usadas |

La puntuación y los objetos obtenidos **después** del checkpoint no se añaden otra vez al estado recuperado. Las vidas obtenidas se conservan, descontando la que acabas de perder.

Por ejemplo, si guardaste la bandera 50 con 130 puntos y moriste después con 180, al continuar reapareces con 130 puntos y 50 tuberías. El intento de 180 puntos sigue disponible para elegir el mejor resumen de la partida.

La reaparición despeja tuberías, adversarios y powerups, reinicia los temporizadores de aparición y empieza un tramo de descanso. Ofrece **1,8 segundos de protección**, también frente a una caída inmediata al límite de la pantalla, y un margen antes de volver a generar obstáculos y adversarios. El recorrido posterior se vuelve a generar: no es una reproducción exacta del mapa anterior.

Con **0 vidas** aparece FIN DEL JUEGO. OTRA VEZ reinicia score, inventarios, checkpoint y vidas. Cerrar los resultados con × abandona la partida y vuelve al inicio, incluso si aún quedaban vidas.

## Adversarios y vuelo rasante

### Pájaros adversarios

Se habilitan después de **35 tuberías superadas**. Vuelan de derecha a izquierda, en sentido contrario al jugador, a una altura fija: no persiguen al pájaro ni cambian de carril.

Antes de entrar, un aviso en el borde derecho anticipa su altura durante **0,65 segundos**. Su velocidad y frecuencia aumentan con el nivel efectivo; los relojes suavizan ambas.

| Nivel efectivo | Adversarios simultáneos permitidos |
| --- | --- |
| Menos de 60 | Hasta 1 |
| 60–179 | Hasta 2 |
| Desde 180 | Hasta 3 |

Esto establece un máximo, no obliga a llenar la pantalla. La probabilidad de intentar un grupo comienza en el 20 % al nivel 60 y aumenta gradualmente hacia el 50 %. Cada integrante se comprueba junto con los demás y con las tuberías. Los grupos mantienen separación vertical y pueden reducirse o aplazarse si no se encuentra una ruta de esquiva.

Cuando hay varios adversarios, las nuevas tuberías también se comprueban para evitar cerrar la salida del grupo. Las comprobaciones reservan margen de colisión y tiempo de reacción.

Las bombas no destruyen adversarios. Pasar bajo su protección no concede bonus de proximidad.

### Vuelo rasante

Esquivar de cerca un pájaro adversario concede **25 puntos**, una sola vez por enemigo, después de dejarlo completamente atrás.

La proximidad usa un margen de **20 píxeles internos respecto de la zona de colisión**. No son 20 píxeles desde el centro del sprite ni necesariamente 20 píxeles visibles en una pantalla reescalada.

Para recibirlo, el cruce debe ser limpio: sin contacto y sin aprovechar la protección activa. El aviso dice **¡VUELO RASANTE!**. Sus puntos cuentan como bonus y no aumentan tuberías, días ni dificultad.

## Paisajes y ciclo del día

Hay **nueve escenarios**, todos decorativos: cambian el ambiente, pero no añaden colisiones ni modifican la física.

| Disponibilidad | Paisaje | Rasgos principales |
| --- | --- | --- |
| Desde el comienzo del sorteo | Bosque | Árboles y vegetación en varias capas |
| Desde el comienzo del sorteo | Montañas | Cumbres, nieve y árboles lejanos |
| Desde el comienzo del sorteo | Ciudad | Edificios, ventanas y farolas |
| Desde el comienzo del sorteo | Desierto | Mesetas, dunas y cactus |
| Desde el comienzo del sorteo | Océano | Olas, islotes y embarcación |
| Desde 40 tuberías | Espacio exterior | Estrellas, planetas y relieve espacial |
| Desde 40 tuberías | Planeta alienígena | Astros y flora luminosa |
| Desde 40 tuberías | Selva/Pantano | Vegetación, agua y bruma |
| Desde 40 tuberías | Fondo del océano | Corales, peces, burbujas y una ballena gigante |

Una partida nueva comienza siempre en **bosque**. El paisaje cambia cada **20 tuberías**, elegido al azar entre los disponibles y excluyendo el actual. Desde la tubería 40 pueden salir cualquiera de los nueve.

La ballena del fondo del océano nada lentamente hacia donde mira, con movimiento de aletas y cola. Es parte del fondo y no puede chocar contigo.

### Fases y días

El ciclo cambia cada **10 tuberías**:

```text
Amanecer → Día → Atardecer → Noche → Amanecer…
```

| Tuberías superadas | Fase | Día |
| --- | --- | --- |
| 0–9 | Amanecer | 1 |
| 10–19 | Día | 1 |
| 20–29 | Atardecer | 1 |
| 30–39 | Noche | 1 |
| 40–49 | Amanecer | 2 |
| 80–89 | Amanecer | 3 |

El día comienza en **1** y sube cada **40 tuberías**. Todos los escenarios tienen cambios de luz; los cuatro avanzados cuentan con cuatro paletas propias y transiciones de aproximadamente **2,5 segundos**.

No hay un cartel con el nombre de la fase: se reconoce por el ambiente. Los bonus y los relojes no adelantan ni retrasan el ciclo; volver a un checkpoint sí recupera el día y la fase guardados.

## Hitos principales

| Condición | Qué sucede |
| --- | --- |
| Cada tubería superada | +1 punto, +1 nivel efectivo y +0,01× de velocidad objetivo |
| Cada 10 tuberías | Cambia la fase del día |
| Cada 20 tuberías | Se sortea otro paisaje |
| Nivel efectivo 25 | Pueden aparecer tuberías móviles; se habilitan los relojes por primera vez |
| 35 tuberías | Se habilitan los adversarios |
| 40 tuberías | Empieza el día 2 y entran los cuatro paisajes avanzados al sorteo |
| Cada 50 tuberías | Se activa otro checkpoint |
| Nivel efectivo 60 | Pueden aparecer parejas de adversarios |
| Nivel efectivo 180 | Pueden aparecer grupos de hasta tres adversarios |
| 300 puntos totales | Se habilita la caja de ampliación de bombas |
| Cada 500 puntos totales, sin límite de hitos | Una vida extra, sujeta al máximo de 6 |

Los hitos cosméticos se detallan a continuación.

## Logros y desbloqueables

Desde la pantalla de inicio, pulsa **DESBLOQUEABLES** para abrir la colección. Hay tres categorías y **19 estilos** en total: siete pájaros, seis estelas y seis explosiones, con tres iniciales y dieciséis recompensas.

| Categoría | Disponible desde el inicio | Recompensas |
| --- | --- | --- |
| Pájaro | Clásico | Brisa, Aurora, Coral, Eclipse, Fénix, Tesla Rocket |
| Estela | Dorada | Menta, Estelar, Cometa, Prisma, Glaciar |
| Explosión | Arcoíris | Solar, Boreal, Nebulosa, Magma, Supernova |

### Requisitos de las recompensas

| Logro | Requisito | Recompensa |
| --- | --- | --- |
| Primer vuelo | Superar 10 tuberías en una partida | Pájaro Brisa |
| Tres amaneceres | Llegar al día 3, equivalente a 80 tuberías | Pájaro Aurora |
| Vuelo limpio | Superar 50 tuberías sin haber detonado bombas en esa partida | Estela Menta |
| A tiempo | Recoger 3 relojes durante una misma partida | Estela Estelar |
| Festival de color | Detonar 5 bombas entre todas las partidas | Explosión Solar |
| Instante dorado | Recoger un reloj dorado | Explosión Boreal |
| Ruta de coral | Superar 120 tuberías en una partida | Pájaro Coral |
| Seis amaneceres | Llegar al día 6 (200 tuberías) | Pájaro Eclipse |
| Vuelo legendario | Superar 300 tuberías en una partida | Pájaro Fénix |
| Cien sin pólvora | Superar 100 tuberías en una partida sin detonar bombas | Estela Cometa |
| Tejedor del tiempo | Recoger 6 relojes en una partida | Estela Prisma |
| Nueve amaneceres | Llegar al día 9 (320 tuberías) | Estela Glaciar |
| Festival cósmico | Detonar 15 bombas entre todas las partidas | Explosión Nebulosa |
| Corazón volcánico | Detonar 30 bombas entre todas las partidas | Explosión Magma |
| Dueño del tiempo | Recoger 10 relojes en una partida | Explosión Supernova |
| Go for launch | Alcanzar 1000 puntos totales en una partida, incluidos los bonus | Tesla Rocket |

Cada categoría muestra hasta tres estilos por página: las opciones originales en la primera y las nuevas en la segunda. Tesla Rocket ocupa una tercera hoja de pájaros. Usa las flechas del carrusel o los puntos de paginación para cambiar de página.

Las tarjetas muestran el requisito, el progreso y si el estilo está bloqueado, disponible o equipado. Una vista previa combina el pájaro, la estela y la explosión elegidos.

Los premios se anuncian al desbloquearse y **no se equipan automáticamente**. Puedes elegirlos desde el inicio. Son cosméticos: no cambian colisiones, física, velocidad, puntos ni probabilidades.

Los logros obtenidos permanecen desbloqueados al perder vidas o volver a un checkpoint. Los contadores de relojes recogidos y bombas usadas continúan durante esa partida; reiniciar desde cero abre una nueva partida para los requisitos que la exigen. Los tres logros de detonación conservan su total entre partidas. El progreso guardado en versiones anteriores también cuenta para las recompensas nuevas.

### Tesla Rocket

Skin de vehículo en la categoría PÁJAROS, inspirado en la carrocería blanca angular, los cristales dorados y los propulsores de gas frío del Tesla Roadster Rocket. Se desbloquea al alcanzar **1000 puntos totales en una partida**: tuberías y bonus cuentan, las partidas distintas no se suman. Un récord previo de 1000 puntos también lo habilita. El desbloqueo queda guardado y se equipa desde el inicio.

Tiene un cuerpo de aproximadamente 38 × 13 píxeles internos, con un perfil aerodinámico más bajo, cabina inclinada, ruedas grandes y alerón trasero a la izquierda; usa una escala visual de 1,5625× respecto del dibujo base. Al aletear activa dos chorros blancos y celestes hacia abajo y un sonido exclusivo de gas frío: un golpe breve de válvula y un soplido de aire a presión sintetizado, en lugar del pitido del pájaro. Respeta el botón de silencio; una detonación válida activa un air-flip de 360° durante 0,65 segundos. La pausa congela estas animaciones. Con movimiento reducido se omite el giro completo. Conserva exactamente la física, el área de colisión y la protección de las bombas del pájaro; no recibe ventajas de juego.

Referencias visuales: [Roadster, Tesla](https://www.tesla.com/roadster), [The Ramp, Tesla](https://www.youtube.com/watch?v=7p5LxFdc-Qg) y [The Kickflip, Tesla](https://www.youtube.com/watch?v=r5vsHHPVhJg). El sprite es una interpretación original en pixel art.

## Resultados y récords

### Entre vidas

Después de cada vida perdida se muestran las estadísticas completas de la mejor run de la partida en curso y, si quedan vidas, la opción CONTINUAR. Se usa el mismo criterio que en el resumen final: mayor score, después más tuberías y después mayor pico de velocidad. Los datos de esa run se mantienen juntos, aunque el intento recién terminado haya sido peor o haya acabado sin sumar un solo punto. Por ejemplo, si la primera vida terminó con 190 puntos y la segunda con 0, el resumen de la segunda sigue mostrando los 190 puntos y las demás estadísticas de la primera. Los mejores valores históricos por categoría se siguen actualizando de forma independiente.

### Al agotar las vidas

El resumen final muestra **una sola run: la más exitosa de esa partida**. Se elige por:

1. Mayor puntuación total.
2. En empate, mayor cantidad de tuberías superadas.
3. Si persiste el empate, mayor pico de velocidad.

Sus estadísticas permanecen juntas: score, día alcanzado, tuberías, bonus con desglose de bombas/relojes/vuelos rasantes y velocidad máxima. No se suman los puntos de todas las vidas ni se combinan máximos de intentos diferentes para fabricar una run.

Los relojes no borran el pico de velocidad ya alcanzado dentro de ese intento. Comenzar otra partida reinicia la selección de mejor run, pero conserva los récords históricos.

### Récord histórico y mejores marcas

Al pulsar **RÉCORD** se abre el detalle de la run que consiguió la puntuación récord: día, tuberías, velocidad máxima y desglose de bonus. Este registro es independiente de la mejor run de la partida actual.

El resumen también compara días, tuberías, bonus y velocidad con sus mejores marcas personales. Esas marcas pueden proceder de partidas diferentes y se identifican como mejores valores de cada categoría.

Abrir el panel de récord durante el vuelo pausa el juego. Cerrarlo no reanuda automáticamente la partida. Los récords antiguos que solo guardaban puntuación no reciben estadísticas inventadas; el detalle se registra al conseguir un nuevo récord compatible.

## Pantalla, sonido y accesibilidad

### Adaptación y maximizado

El juego adapta su presentación al espacio disponible y mantiene la proporción. El botón de cuatro esquinas maximiza o restaura la vista. Si el navegador no permite pantalla completa nativa, utiliza la ventana ampliada.

La resolución interna se conserva en:

| Formato | Resolución interna | Proporción |
| --- | --- | --- |
| Horizontal | 480 × 270 | 16:9 |
| Vertical | 288 × 384 | 3:4 |

El reescalado usa bordes pixelados sin suavizado. Los valores de distancia citados en este manual corresponden a esta resolución interna.

### Sonido

Los efectos se generan con Web Audio: aleteo, puntos, recogida, explosión, impacto, vida extra y error por falta de bombas. El audio se activa tras una interacción y puede silenciarse con el altavoz.

### Pausa y entrada táctil

Puedes aletear con un dedo y detonar una bomba con otro simultáneamente, en cualquiera de los dos órdenes. Ambos controles responden al contacto inicial; el clic que pueda generar después el navegador no consume una segunda bomba. La activación por teclado y tecnologías de asistencia sigue disponible.

La partida se pausa al ocultar la pestaña. Pausar congela obstáculos, powerups, protección y sus temporizadores. El área del juego evita la selección de texto y el destello táctil azul para que los toques repetidos no interfieran con el vuelo.

### Movimiento reducido

Se respeta la preferencia de movimiento reducido del sistema o navegador para atenuar sacudidas y efectos decorativos. La ballena permanece quieta y el halo conserva una presentación estable. Esto no elimina la mecánica de tuberías móviles ni el desplazamiento de los obstáculos.

Los controles tienen etiquetas accesibles y los avisos principales ofrecen información textual además de sus efectos visuales.

## Guardado local

El navegador conserva, cuando permite almacenamiento local:

- Récord de score y datos de la run que lo obtuvo.
- Mejores marcas por categoría.
- Logros, progreso de colección y cosméticos elegidos.
- Preferencia de sonido.

No se guarda una partida en curso: al recargar o cerrar se pierden sus vidas, checkpoint e inventario. No hay sincronización entre dispositivos, cuentas ni clasificación online en esta versión.

La web publicada y una copia abierta desde archivos locales pueden utilizar almacenamientos distintos. Borrar los datos del sitio también borra sus registros locales. Si el almacenamiento está bloqueado, el juego conserva sus datos en memoria durante la sesión.

## Consejos de juego

- Busca el centro del próximo hueco antes de perseguir un powerup.
- Mira la altura de las advertencias de adversarios: su trayectoria seguirá recta.
- Reserva bombas para una salida comprometida; recuerda que no eliminan pájaros enemigos.
- Aprovecha los relojes para aliviar tanto la velocidad como el movimiento de las tuberías.
- Un corazón no da puntos, pero puede permitir varios intentos más si alcanzas un checkpoint.
- Observa el banderín: perder una vida justo antes de una bandera puede hacerte repetir un tramo mayor.
- No necesitas recoger todos los objetos. Los desvíos son decisiones de riesgo y recompensa.

## Archivos y mantenimiento

El juego utiliza HTML, CSS y JavaScript, con gráficos dibujados en Canvas y efectos de audio sintetizados. No requiere un proceso de compilación para jugar.

```text
Pixel Flight/
├── Jugar.cmd               # Abre la copia local en Windows
├── README.md               # Manual y documentación de la versión actual
├── ROADMAP.md              # Propuestas y estado de futuras mejoras
├── dist/
│   ├── index.html          # Pantallas, controles y paneles
│   ├── style.css           # Diseño, HUD y adaptación de pantalla
│   ├── version.js          # Número y fecha de la versión del juego
│   ├── game.js             # Física, score, vidas, checkpoints y partida
│   ├── routes.js           # Generación de tramos y búsqueda de rutas
│   ├── world.js            # Paisajes, iluminación y ciclo del día
│   ├── powerup-art.js      # Dibujo de bombas, relojes, cajas y corazones
│   ├── cosmetics.js        # Catálogo, logros y progreso de colección
│   ├── collection.js       # Panel de desbloqueables
│   ├── fullscreen.js       # Maximizado y restauración
│   └── record.js           # Panel del récord histórico
└── tests/                  # Pruebas del proyecto fuente
```

El ZIP para jugar contiene los archivos de distribución, el lanzador y la documentación. La carpeta de pruebas pertenece a la copia fuente.

### Verificación del proyecto fuente

Para ejecutar las pruebas hace falta Node.js; no es necesario para jugar. Desde la carpeta del proyecto:

```sh
node --test tests/bombs.test.cjs tests/cosmetics.test.cjs tests/fullscreen.test.cjs tests/record.test.cjs
```

La versión 1.27.6 fue verificada con **156 pruebas**. Cubren, entre otros aspectos, inventarios, vidas, checkpoints, hitos, protección, generación de rutas, grupos de adversarios, paisajes, colección, estadísticas y pantalla completa.

Las mejoras previstas se mantienen en [ROADMAP.md](ROADMAP.md). El desafío diario figura allí como propuesta pendiente; no forma parte de las mecánicas disponibles de esta versión.

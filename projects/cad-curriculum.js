/* CAD 2027 · fuentes CAD/ManimCE verificadas y currículo de operaciones. Video URLs solo si están realmente publicados. */
window.SEMINAR_2027_CAD = {
  "operations": [
    {
      "id": "sketch",
      "title": "Croquis 2D y restricciones",
      "phase": 1,
      "definition": "El croquis establece perfiles geométricos acotados y restringidos. Una operación sólida depende de su plano, dimensiones y relaciones.",
      "example": "Croquis de placa de 70 × 45 mm con círculo central Ø12 mm.",
      "steps": [
        "Selecciona un plano XY y crea el perfil exterior.",
        "Acota largo, ancho, posición y diámetro del círculo.",
        "Comprueba que el croquis esté completamente restringido."
      ],
      "checks": [
        "Las unidades son milímetros y el perfil es cerrado.",
        "Cambiar una cota conserva las relaciones geométricas."
      ],
      "preview": "profile",
      "kind": "sketch",
      "video": null
    },
    {
      "id": "extrude-add",
      "title": "Extrusión positiva · añadir material",
      "phase": 1,
      "definition": "Extrusión aditiva (Join): un perfil plano cerrado se desplaza una distancia normal a su plano para crear volumen; puede ser simétrica o en una dirección.",
      "example": "Desde una placa 70 × 45 mm, añade un resalte rectangular de 28 × 16 mm y 18 mm de altura.",
      "steps": [
        "Dibuja sobre la cara superior un rectángulo de 28 × 16 mm.",
        "Selecciona Extrude/Pad con distancia 18 mm y operación Join.",
        "Verifica que el sólido resultante sea una sola pieza."
      ],
      "checks": [
        "La altura añadida es 18 mm.",
        "El nuevo volumen está unido correctamente a la base."
      ],
      "preview": "add",
      "kind": "extrude-add",
      "video": null
    },
    {
      "id": "extrude-cut",
      "title": "Extrusión negativa · remover material",
      "phase": 1,
      "definition": "Extrusión sustractiva (Cut/Pocket): el perfil define material que se elimina de un sólido existente. Requiere intersección y profundidad o corte pasante.",
      "example": "Crea una ranura de 12 × 25 mm, profundidad 8 mm, sobre la placa.",
      "steps": [
        "Traza un rectángulo cerrado en una cara del sólido.",
        "Selecciona Cut/Pocket y profundidad 8 mm.",
        "Inspecciona la sección para comprobar la cavidad."
      ],
      "checks": [
        "La profundidad de corte coincide con el parámetro.",
        "No se genera material aislado o fuera de la pieza."
      ],
      "preview": "cut",
      "kind": "extrude-cut",
      "video": null
    },
    {
      "id": "revolve",
      "title": "Revolución aditiva y sustractiva",
      "phase": 2,
      "definition": "Un perfil gira alrededor de un eje y genera una geometría axisimétrica. Revolve añade material; Revolve Cut lo elimina.",
      "example": "Genera un buje con perfil escalonado mediante giro de 360° alrededor del eje vertical.",
      "steps": [
        "Dibuja un medio perfil, indicando el eje de construcción.",
        "Aplica Revolve de 360° y selecciona el eje correcto.",
        "Crea un canal circunferencial con Revolve Cut cuando corresponda."
      ],
      "checks": [
        "El cuerpo es concéntrico respecto del eje.",
        "El perfil no se cruza consigo mismo ni invade el eje de manera indebida."
      ],
      "preview": "revolve",
      "kind": "revolve",
      "video": null
    },
    {
      "id": "sweep",
      "title": "Barrido · perfil a lo largo de trayectoria",
      "phase": 2,
      "definition": "Sweep desplaza una sección transversal a lo largo de una trayectoria compatible, que puede ser recta, curva o espacial. El resultado depende de la sección, ruta y orientación.",
      "example": "Construye una tubería de Ø8 mm que recorre un arco o una ruta en L con redondeo.",
      "steps": [
        "Crea una trayectoria 2D o 3D continua.",
        "Dibuja el perfil circular Ø8 mm en un plano normal al inicio de la ruta.",
        "Aplica Sweep y revisa la orientación y autointersecciones."
      ],
      "checks": [
        "El perfil sigue la ruta completa sin interrupciones.",
        "La sección mantiene sus dimensiones a lo largo del barrido."
      ],
      "preview": "sweep",
      "kind": "sweep",
      "video": null
    },
    {
      "id": "loft",
      "title": "Solevación · transición entre perfiles",
      "phase": 2,
      "definition": "Loft construye una transición volumétrica entre dos o más perfiles ubicados en planos diferentes; puede usar guías y continuidad geométrica.",
      "example": "Transforma una sección circular Ø25 mm en una rectangular 45 × 20 mm a lo largo de 60 mm.",
      "steps": [
        "Construye dos perfiles en planos separados 60 mm.",
        "Aplica Loft/Solevación en el orden correcto.",
        "Comprueba torsión del cuerpo y continuidad superficial."
      ],
      "checks": [
        "La distancia entre perfiles es la indicada.",
        "No aparecen pliegues, autointersecciones ni cierres inesperados."
      ],
      "preview": "loft",
      "kind": "loft",
      "video": null
    },
    {
      "id": "hole",
      "title": "Agujero, avellanado y rosca",
      "phase": 3,
      "definition": "Hole crea perforaciones parametrizadas, ciegas o pasantes, y puede incorporar avellanado, escariado o rosca según la herramienta CAD.",
      "example": "Realiza cuatro agujeros pasantes Ø5 mm con separación simétrica sobre una placa.",
      "steps": [
        "Crea cuatro puntos de centros acotados.",
        "Aplica Hole, diámetro 5 mm y condición Through All.",
        "Revisa perpendicularidad, posiciones y distancia a bordes."
      ],
      "checks": [
        "El patrón tiene exactamente cuatro perforaciones.",
        "Los diámetros y centros coinciden con el plano de trabajo."
      ],
      "preview": "cut",
      "kind": "hole",
      "video": null
    },
    {
      "id": "coil",
      "title": "Bobina, hélice y geometrías roscadas",
      "phase": 3,
      "definition": "Coil crea geometría helicoidal controlada por diámetro, paso, vueltas y sección. Una rosca puede usar perfiles normalizados según el software.",
      "example": "Modela una hélice de 5 vueltas, paso de 4 mm y diámetro medio de 20 mm.",
      "steps": [
        "Define eje y diámetro de referencia.",
        "Selecciona Coil, número de vueltas 5 y paso 4 mm.",
        "Revisa altura total y ausencia de interferencia entre espiras."
      ],
      "checks": [
        "La altura teórica entre inicios de primera y última vuelta depende del número de intervalos de paso.",
        "El radio y sentido helicoidal coinciden con el diseño."
      ],
      "preview": "helix",
      "kind": "coil",
      "video": null
    },
    {
      "id": "fillet",
      "title": "Redondeo y chaflán",
      "phase": 3,
      "definition": "Fillet genera transiciones redondeadas en aristas; Chamfer elimina una esquina mediante una cara inclinada definida por distancias y ángulo.",
      "example": "Aplica redondeo R3 mm en dos aristas y chaflán de 1,5 mm a 45° en otras.",
      "steps": [
        "Selecciona las aristas externas compatibles.",
        "Aplica Fillet R3 mm y comprueba el resultado.",
        "Aplica Chamfer 1,5 mm × 45° donde corresponda."
      ],
      "checks": [
        "Los radios y chaflanes son geométricamente realizables.",
        "No desaparecen caras funcionales del sólido."
      ],
      "preview": "finish",
      "kind": "fillet",
      "video": null
    },
    {
      "id": "pattern",
      "title": "Patrones lineales/circulares y simetría",
      "phase": 3,
      "definition": "Pattern repite operaciones según distancia, cantidad o ángulo; Mirror refleja geometría respecto de un plano. El historial debe conservar una única definición de la característica original.",
      "example": "Replica una perforación en una matriz 2 × 3 y una nervadura respecto del plano central.",
      "steps": [
        "Construye un único agujero correctamente acotado.",
        "Aplica Rectangular Pattern con 2 filas y 3 columnas.",
        "Usa Mirror con un plano de simetría cuando el diseño lo requiera."
      ],
      "checks": [
        "La separación entre copias es uniforme.",
        "El total de instancias es seis; las geometrías reflejadas mantienen correspondencia."
      ],
      "preview": "pattern",
      "kind": "pattern",
      "video": null
    },
    {
      "id": "rib",
      "title": "Nervio, refuerzo y repujado",
      "phase": 4,
      "definition": "Rib genera paredes de refuerzo a partir de trazos y espesores; Emboss/Repujado añade o sustrae geometrías sobre superficies para producir relieves.",
      "example": "Agrega dos nervaduras de espesor 3 mm y un símbolo en relieve de 1 mm.",
      "steps": [
        "Define un boceto abierto de nervio y selecciona espesor 3 mm.",
        "Aplica Rib con unión correcta a la base.",
        "Ubica un símbolo propio y crea un relieve de 1 mm con Emboss."
      ],
      "checks": [
        "La nervadura conecta las caras que debe reforzar.",
        "El relieve no atraviesa ni debilita excesivamente la pared."
      ],
      "preview": "add",
      "kind": "rib",
      "video": null
    },
    {
      "id": "deliver",
      "title": "Árbol de operaciones, plano y entrega",
      "phase": 4,
      "definition": "El modelo paramétrico conserva el orden de features; el plano registra cotas, vistas y tolerancias; los archivos derivados se verifican aparte del archivo CAD nativo.",
      "example": "Entrega una pieza con extrusión aditiva/sustractiva, revolución o barrido, redondeo, agujeros y plano acotado.",
      "steps": [
        "Renombra operaciones, parámetros y bocetos en el árbol.",
        "Exporta formato CAD nativo, STEP y STL/3MF si corresponde.",
        "Genera plano con vistas y una tabla de inspección dimensional."
      ],
      "checks": [
        "Las operaciones se regeneran al variar parámetros críticos.",
        "El plano corresponde a la última versión y registra medidas, unidades y evidencia."
      ],
      "preview": "profile",
      "kind": "deliver",
      "video": null
    }
  ],
  "source": {
    "label": "ManimCE · fuentes de CAD verificadas",
    "repository": "https://github.com/ITM-JOB/CAD",
    "sourceCode": "https://github.com/ITM-JOB/CAD/blob/main/scripts/lessons.py",
    "readme": "https://github.com/ITM-JOB/CAD/blob/main/README.md",
    "availableScenes": [
      {
        "scene": "Hydraulic",
        "topic": "Embrague hidráulico",
        "note": "Fuente ManimCE de animación de mecanismo; no es un tutorial de extrusión"
      },
      {
        "scene": "Automotive",
        "topic": "Embrague de automóvil",
        "note": "Fuente ManimCE de animación de mecanismo; no es un tutorial de revolución"
      },
      {
        "scene": "Transmission",
        "topic": "Transmisión coaxial",
        "note": "Fuente ManimCE de animación de mecanismo; no es un tutorial de barrido"
      }
    ],
    "verifiedOperationVideos": [],
    "reason": "Se comprobó el árbol de ITM-JOB/CAD y los MP4 no están versionados en main; el repositorio documenta salidas outputs/{A,B,C}/lesson.mp4 sin adjuntar esos archivos. No hay enlaces públicos comprobados de los videos específicos de extrusión, revolución y barrido."
  }
};

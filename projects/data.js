/* Seminario 2027 · Exact four project routes approved as topics by the instructor. Pedagogical guides are preliminary and do not assign students. */
window.SEMINAR_2027_PROJECTS = [
  {
    "slug": "data-analyst",
    "title": "Data Analyst",
    "track": "Data Analyst",
    "summary": "Analiza datos con Python, Pandas y Matplotlib: define una pregunta, limpia un dataset, construye visualizaciones y presenta conclusiones reproducibles.",
    "stages": [
      {
        "title": "01 · Definir pregunta y dataset",
        "theory": [
          "Una pregunta analítica guía selección de variables y métricas.",
          "El diccionario de datos documenta significado, unidad, formato y valores ausentes."
        ],
        "build": [
          "Formula una pregunta medible y define tres métricas.",
          "Usa un CSV sintético o autorizado sin datos personales.",
          "Carga el archivo en el Python Sandbox con Pandas e inspecciona columnas y forma."
        ],
        "test": [
          "Verifica que no haya datos sensibles ni claves en los archivos.",
          "Revisa el número de filas y el tipo de cada variable."
        ],
        "evidence": "Pregunta, diccionario de datos, CSV de prueba y código de carga.",
        "gate": "Dataset verificable y pregunta asociada a variables reales.",
        "code": "import pandas as pd\nfrom io import StringIO\ncsv = 'grupo,valor\\nA,12\\nA,15\\nB,18'\ndf = pd.read_csv(StringIO(csv))\nprint(df.shape)\nprint(df.dtypes)"
      },
      {
        "title": "02 · Limpieza y exploración",
        "theory": [
          "Los registros duplicados, nulos y formatos inconsistentes alteran resultados.",
          "La limpieza debe conservar evidencia del dato original y las transformaciones."
        ],
        "build": [
          "Cuenta nulos y duplicados.",
          "Decide una política explícita para cada problema detectado.",
          "Calcula medidas de tendencia central y dispersión por variable."
        ],
        "test": [
          "Compara filas antes y después de limpiar.",
          "Verifica resultados con un cálculo manual pequeño."
        ],
        "evidence": "Reporte de calidad, política de limpieza, notebook reproducible.",
        "gate": "Cada transformación puede justificarse y comprobarse.",
        "code": "import pandas as pd\ndf = pd.DataFrame({'valor':[12,15,None,15]})\nprint(df.isna().sum())\nprint(df['valor'].dropna().mean())"
      },
      {
        "title": "03 · Visualización y conclusiones",
        "theory": [
          "Una gráfica debe corresponder al tipo de variable y a la pregunta.",
          "Etiquetas, unidades y fuentes son necesarias para interpretar resultados."
        ],
        "build": [
          "Construye al menos dos gráficas con Matplotlib.",
          "Interpreta diferencias y sesgos sin confundir correlación con causalidad.",
          "Incluye un párrafo de limitaciones."
        ],
        "test": [
          "Verifica ejes, títulos, unidades y tamaño legible.",
          "Reproduce las figuras desde una sesión limpia."
        ],
        "evidence": "Figuras PNG, notebook y conclusiones trazables.",
        "gate": "Todas las conclusiones se respaldan con cifras o figuras.",
        "code": "import matplotlib.pyplot as plt\nfig,ax=plt.subplots()\nax.bar(['A','B'],[12,18])\nax.set(title='Comparación',ylabel='Valor')\nplt.show()"
      },
      {
        "title": "04 · Producto de datos y defensa",
        "theory": [
          "La reproducibilidad requiere entrada definida, dependencias y salida consistente.",
          "Una entrega distingue resultados, supuestos y limitaciones."
        ],
        "build": [
          "Organiza datos, código y figuras en carpetas.",
          "Genera un resumen de una página con la pregunta y respuesta.",
          "Prepara una demostración de ejecución."
        ],
        "test": [
          "Ejecuta desde una sesión nueva con datos de entrada conocidos.",
          "Comprueba que ninguna salida requiera rutas personales."
        ],
        "evidence": "Repositorio, README, CSV de ejemplo, gráficos, reporte y presentación.",
        "gate": "La investigación puede ser reproducida por un tercero.",
        "code": "# Estructura sugerida:\n# data/sample.csv\n# notebook/analysis.py\n# results/figure.png\n# README.md"
      }
    ]
  },
  {
    "slug": "3d-design",
    "title": "3D Design",
    "track": "3D Design",
    "summary": "Diseña un objeto 3D paramétrico y editable: medidas, bocetos, operaciones, validación dimensional y preparación para fabricación o simulación.",
    "stages": [
      {
        "title": "01 · Necesidad, medidas y primer modelo",
        "theory": [
          "CAD paramétrico representa intención mediante cotas, restricciones y operaciones. El boceto debe definir una función y sus dimensiones críticas.",
          "Un soporte de escritorio es un ejemplo inicial; el producto individual se confirma antes de construir."
        ],
        "build": [
          "Define usuario, función, carga de uso y restricciones de espacio. Mide el objeto que debe encajar.",
          "Crea una tabla de parámetros en milímetros: ancho, alto, espesor y holgura.",
          "En FreeCAD, Fusion u otra herramienta autorizada, crea un boceto restringido y extruye el volumen inicial."
        ],
        "test": [
          "Verifica unidades y cotas contra las mediciones.",
          "Cambia el ancho y comprueba que el modelo se regenera sin errores."
        ],
        "evidence": "Croquis acotado, tabla de parámetros, captura del boceto y archivo nativo.",
        "gate": "El objeto tiene función definida y el modelo inicial cambia mediante parámetros.",
        "code": ""
      },
      {
        "title": "02 · Geometría funcional y diseño reutilizable",
        "theory": [
          "El historial de operaciones explica cómo se construye la pieza. Las restricciones deben conservar relaciones al cambiar medidas.",
          "Holgura y espesor se eligen para el material y proceso reales; no hay un valor universal válido para todas las impresoras."
        ],
        "build": [
          "Añade los elementos funcionales: alojamiento, apoyo, orificios o nervaduras según el contrato.",
          "Nombra parámetros y operaciones. Evita cotas duplicadas o geometría sin restricción.",
          "Documenta tres variantes cambiando parámetros."
        ],
        "test": [
          "Revisa interferencias, espesores y acceso a los elementos de montaje.",
          "Regenera las tres variantes y verifica las dimensiones críticas."
        ],
        "evidence": "Archivo editable, historial de operaciones y comparación de variantes.",
        "gate": "Las variantes se regeneran y cumplen función y dimensiones del contrato.",
        "code": ""
      },
      {
        "title": "03 · Preparación y fabricación",
        "theory": [
          "El archivo nativo conserva la intención; STL o 3MF representa la geometría para fabricación. El laminador transforma esa geometría en trayectorias.",
          "Orientación, soportes, altura de capa y material afectan ajuste, resistencia y tiempo. Los valores se documentan para la máquina elegida."
        ],
        "build": [
          "Exporta la pieza e impórtala en el laminador de la impresora disponible.",
          "Confirma escala en mm, orientación y perfil de máquina/material. Inspecciona la vista por capas.",
          "Imprime primero una probeta de ajuste si hay encajes; registra parámetros y después fabrica la pieza."
        ],
        "test": [
          "Comprueba dimensiones en el laminador y ausencia de capas o paredes inesperadas.",
          "Compara el encaje de la probeta con la holgura prevista antes de imprimir la pieza completa."
        ],
        "evidence": "Modelo nativo, STL/3MF, capturas de capas y ficha de fabricación.",
        "gate": "El archivo es fabricable y la prueba de ajuste justifica la configuración. Sin impresora, registra fabricación pendiente.",
        "code": ""
      },
      {
        "title": "04 · Medición, iteración y defensa",
        "theory": [
          "La validación compara medidas y función del producto físico con el contrato. Una imagen de render no demuestra fabricación.",
          "La iteración modifica un parámetro por una razón medible y conserva las versiones."
        ],
        "build": [
          "Mide dimensiones críticas con el instrumento disponible y registra resolución.",
          "Prueba la función con el objeto real. Identifica un defecto y ajusta el modelo.",
          "Entrega versiones antes/después, plano, archivos nativo y de fabricación e instrucciones de uso."
        ],
        "test": [
          "Compara medida nominal y real; calcula desviación y verifica la tolerancia acordada.",
          "Repite el ensayo funcional después del cambio. Si solo hay simulación, identifica qué falta validar físicamente."
        ],
        "evidence": "Tabla de medidas, fotos, prueba funcional, iteración y defensa del historial.",
        "gate": "El producto cumple los criterios medidos; la fabricación pendiente se declara como pendiente, no aprobada.",
        "code": ""
      }
    ],
    "resources": []
  },
  {
    "slug": "video-game-design",
    "title": "Video Game Design",
    "track": "Video Game Design",
    "summary": "Crea un videojuego 2D original y jugable, con personajes, controles, colisiones, niveles, pruebas de usuarios y publicación web.",
    "stages": [
      {
        "title": "01 · Game Design Document y primer prototipo",
        "theory": [
          "Un videojuego combina objetivos, reglas, mecánicas, estados y retroalimentación para el jugador.",
          "El game loop separa entrada, actualización del estado y renderizado; usa delta time para evitar velocidades dependientes de FPS."
        ],
        "build": [
          "Redacta un documento de diseño de una página: historia, objetivo, mecánica, controles y condición de victoria.",
          "Construye una página HTML con Canvas 2D y un personaje representado por figuras propias.",
          "Implementa movimiento de teclado, límites del escenario y un objetivo visible."
        ],
        "test": [
          "Prueba movimientos en cuatro direcciones, límites y entrada simultánea.",
          "Comprueba movimiento uniforme a tasas de refresco diferentes."
        ],
        "evidence": "Game Design Document, boceto de pantalla, fuente HTML/JS y vídeo del prototipo en ejecución.",
        "gate": "El prototipo abre en navegador y responde correctamente a los controles.",
        "code": "const canvas = document.querySelector(\"canvas\");\nconst ctx = canvas.getContext(\"2d\");\nlet player = {x: 30, y: 30, size: 24};\nctx.fillRect(player.x, player.y, player.size, player.size);"
      },
      {
        "title": "02 · Colisiones, puntuación y estados",
        "theory": [
          "La colisión detecta solapamiento de regiones y dispara eventos de juego.",
          "Los estados MENU, PLAYING, PAUSED y GAME_OVER delimitan las acciones permitidas."
        ],
        "build": [
          "Añade obstáculos y coleccionables, cada uno con una representación visual diferenciada.",
          "Crea funciones para colisiones y un marcador de puntuación sin duplicar puntos.",
          "Implementa inicio, pausa, victoria/derrota y reinicio de partida."
        ],
        "test": [
          "Prueba contacto, no contacto, bordes, puntuación una sola vez y reinicio sin datos residuales.",
          "Registra esperado/obtenido para al menos seis casos."
        ],
        "evidence": "Diagrama de estados, tabla de pruebas, código funcional y capturas de marcador.",
        "gate": "Existe un ciclo completo de partida con condición de victoria o derrota verificable.",
        "code": "function collides(a,b){\n return a.x < b.x+b.w && a.x+a.w > b.x &&\n        a.y < b.y+b.h && a.y+a.h > b.y;\n}\nconsole.assert(collides({x:0,y:0,w:20,h:20},{x:10,y:10,w:5,h:5}));"
      },
      {
        "title": "03 · Diseño de niveles e interfaz",
        "theory": [
          "La curva de dificultad progresa mediante obstáculos y decisiones, no solo aumentando números sin justificación.",
          "Las instrucciones, el contraste y la respuesta a las acciones mejoran la experiencia de juego."
        ],
        "build": [
          "Diseña dos niveles de dificultad creciente y define su condición de finalización.",
          "Integra pantalla inicial, controles, mensajes de pausa y pantalla de resultados.",
          "Usa únicamente recursos propios o con licencias compatibles con el proyecto."
        ],
        "test": [
          "Observa a tres compañeros usando el juego sin instrucciones adicionales y registra confusiones.",
          "Verifica que el objetivo y la puntuación sean legibles en móvil y computador."
        ],
        "evidence": "Mapas de niveles, versión jugable, observaciones de usuarios y cambios documentados.",
        "gate": "Una persona nueva comprende cómo jugar, completar un nivel y reiniciar.",
        "code": "const levels=[{id:1,goal:3,hazards:1},{id:2,goal:5,hazards:2}];\nconsole.assert(levels[1].goal > levels[0].goal);"
      },
      {
        "title": "04 · QA, publicación y defensa",
        "theory": [
          "Las pruebas de regresión detectan fallas introducidas por cambios posteriores.",
          "Un MVP debe ser instalable o publicable de forma reproducible, no depender de archivos personales."
        ],
        "build": [
          "Publica el juego estático en GitHub Pages y escribe un README con instrucciones y créditos.",
          "Implementa una partida completa y documenta al menos una corrección antes/después.",
          "Prepara una defensa donde expliques bucle de juego, colisiones, diseño y pruebas."
        ],
        "test": [
          "Prueba la URL en ventana privada y completa una partida desde el inicio hasta su final.",
          "Ejecuta al menos ocho casos de QA, incluyendo reinicio y uso con teclado."
        ],
        "evidence": "URL pública verificable, repositorio, README, GDD final, matriz QA y demostración.",
        "gate": "El juego es funcional desde la URL, admite victoria o derrota y puede reiniciarse correctamente.",
        "code": ""
      }
    ]
  },
  {
    "slug": "ai-agent-design",
    "title": "AI Agent Design",
    "track": "AI Agent Design",
    "summary": "Diseña un agente con objetivo definido, fuentes verificables, herramientas limitadas, evaluación de respuestas y supervisión humana; integra un modelo local autorizado cuando esté disponible.",
    "stages": [
      {
        "title": "01 · Caso de uso y contrato del agente",
        "theory": [
          "Un agente reúne una interfaz, instrucciones, estado y herramientas para completar una tarea concreta; un chatbot genérico no basta.",
          "El contrato delimita usuarios, entradas, salidas, fuentes, restricciones y cuándo debe abstenerse."
        ],
        "build": [
          "Define un caso educativo de bajo riesgo, como orientación sobre material público de estudio.",
          "Escribe tres historias de usuario y el contrato de entrada/salida del agente.",
          "Crea una interfaz simple con respuestas de prueba basadas en reglas y datos sintéticos."
        ],
        "test": [
          "Prueba una consulta válida, una ambigua y una fuera del alcance.",
          "Verifica que el prototipo no solicite contraseñas ni datos de estudiantes."
        ],
        "evidence": "Ficha de producto, historias de usuario, diagrama de flujo y prototipo inicial.",
        "gate": "El agente demuestra una tarea delimitada y responde 'sin evidencia suficiente' cuando corresponde.",
        "code": "const kb={variables:\"Una variable referencia un valor.\"};\nfunction answer(question){\n const hit=Object.keys(kb).find(k=>question.toLowerCase().includes(k));\n return hit?kb[hit]:\"No tengo evidencia suficiente.\";\n}\nconsole.log(answer(\"Explica variables\"));"
      },
      {
        "title": "02 · Recuperación de fuentes y herramientas",
        "theory": [
          "La recuperación de información debe preservar procedencia: documento, fragmento y versión.",
          "Las herramientas operan con permisos mínimos; ninguna escritura, correo o acción externa se ejecuta sin autorización explícita."
        ],
        "build": [
          "Prepara un pequeño conjunto de documentos públicos o sintéticos con identificador y título.",
          "Implementa una función de búsqueda de solo lectura y muestra la fuente junto a cada respuesta.",
          "Dibuja la arquitectura: frontend, orquestación, recuperación, modelo opcional y manejo de fallas."
        ],
        "test": [
          "Comprueba que cada afirmación basada en documentos esté sustentada por su fuente.",
          "Inserta una instrucción maliciosa en un documento ficticio y verifica que sea tratada como texto, no como una orden."
        ],
        "evidence": "Diagrama de arquitectura, documentos de muestra, contratos de herramientas y consultas con fuentes.",
        "gate": "El agente proporciona evidencia verificable y no ejecuta acciones fuera de permiso.",
        "code": "const docs=[\n {id:\"D01\",text:\"Un algoritmo es finito.\"},\n {id:\"D02\",text:\"Una variable referencia un valor.\"}\n];\nconst found=docs.filter(d=>d.text.includes(\"finito\"));\nconsole.log(found.map(d=>d.id));"
      },
      {
        "title": "03 · Evaluación de calidad y seguridad",
        "theory": [
          "La evaluación debe diferenciar respuesta correcta, respuesta sin fuentes y abstención justificada.",
          "La inyección de instrucciones y la divulgación de datos son riesgos que deben probarse con casos controlados."
        ],
        "build": [
          "Construye un conjunto de al menos diez preguntas con resultados esperados.",
          "Registra para cada caso respuesta real, validez de cita, abstención y decisión PASS/FAIL.",
          "Corrige fallas observadas y guarda evidencias de antes y después."
        ],
        "test": [
          "Repite los diez casos tras un cambio e inspecciona posibles regresiones.",
          "Verifica que no se expongan secretos, archivos privados ni instrucciones del sistema."
        ],
        "evidence": "Matriz de evaluación, métricas, capturas de fallas y correcciones.",
        "gate": "El agente supera los criterios definidos, reconoce límites y nunca realiza acciones no autorizadas.",
        "code": "const cases=[{question:\"Definir variable\",ok:true},{question:\"Dame un secreto\",ok:false}];\nconst predicted=[true,false];\nconsole.log(\"Passed:\",cases.filter((c,i)=>c.ok===predicted[i]).length);"
      },
      {
        "title": "04 · Integración opcional de IA y entrega",
        "theory": [
          "El frontend de GitHub Pages no ejecuta un modelo de lenguaje por sí solo; requiere un backend o conexión autorizada.",
          "Los modelos locales pueden generar respuestas incorrectas y deben acompañarse de recuperación, pruebas y supervisión humana."
        ],
        "build": [
          "Si está autorizado, conecta mediante un backend propio un modelo local (por ejemplo, Ollama); nunca incrustes claves en el código público.",
          "Documenta dependencias, endpoints, fuentes permitidas y límites de privacidad.",
          "Prepara una demo de respuesta correcta, falta de evidencia, error de conexión y rechazo de una acción sin permiso."
        ],
        "test": [
          "Repite la batería de diez casos en una instalación limpia.",
          "Desconecta el backend y comprueba que aparece un error recuperable sin inventar información."
        ],
        "evidence": "Repositorio, README, arquitectura, conjunto de evaluación y defensa con pruebas reales.",
        "gate": "La solución ejecuta su tarea delimitada y documenta fuentes, permisos, métricas y limitaciones.",
        "code": "# Arquitectura conceptual\n# Frontend -> Backend autorizado -> Recuperación -> Modelo local -> Respuesta citada\n# No publicar API keys, contraseñas ni datos de estudiantes."
      }
    ]
  }
];

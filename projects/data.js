/* Source: Statistics 11/Seminar 11 original guided project routes, adapted for 2027; no student-specific assignments. */
window.SEMINAR_2027_PROJECTS=[
  {
    "slug": "web",
    "title": "Web Development · application prototype",
    "track": "Web Development",
    "summary": "Construye una aplicación web útil, con interfaz accesible, entrada validada, estado y pruebas verificables.",
    "stages": [
      {
        "title": "01 · Definir problema y diseñar interfaz",
        "theory": [
          "Historia de usuario: Como [persona], quiero [función] para [beneficio].",
          "HTML organiza contenido, CSS define presentación y JavaScript implementa interacciones."
        ],
        "build": [
          "Escribe tres historias de usuario y sus criterios de aceptación.",
          "Dibuja una interfaz móvil y crea index.html y styles.css con navegación funcional.",
          "Incluye un formulario con etiquetas, errores visibles y estructura semántica."
        ],
        "test": [
          "Revisa el diseño a 360 y 1280 px.",
          "Navega con Tab y comprueba el orden del foco."
        ],
        "evidence": "Historias, wireframe, código inicial y capturas responsivas.",
        "gate": "La interfaz permite completar el recorrido principal sin enlaces simulados.",
        "code": "<!doctype html>\n<html lang=\"es\"><meta charset=\"utf-8\"><title>Mi proyecto</title>\n<h1>Mi primera aplicación</h1>\n<p>Describe el problema que resolverá.</p>"
      },
      {
        "title": "02 · Eventos y almacenamiento local",
        "theory": [
          "El DOM representa cada elemento de la página.",
          "Una aplicación puede validar datos antes de almacenarlos; localStorage persiste información solo en ese navegador."
        ],
        "build": [
          "Implementa alta y consulta de registros ficticios.",
          "Añade una función de validación, un mensaje de error y un botón para limpiar.",
          "Separa datos, representación e interacción en funciones distintas."
        ],
        "test": [
          "Prueba un registro vacío, válido, duplicado y caracteres especiales.",
          "Comprueba que los datos persisten al recargar y que se pueden borrar."
        ],
        "evidence": "Repositorio con commits, matriz de pruebas y capturas de casos exitosos y fallidos.",
        "gate": "La función principal responde a entradas válidas e inválidas de forma predecible.",
        "code": "const items = [];\nfunction addItem(name) {\n  if (!name.trim()) throw new Error('Name required');\n  items.push({ id: crypto.randomUUID(), name });\n}\naddItem('Ejemplo');\nconsole.log(items);"
      },
      {
        "title": "03 · Arquitectura y calidad",
        "theory": [
          "Separar interfaz, lógica y datos facilita mantenimiento.",
          "Una prueba indica resultado esperado, resultado obtenido y estado PASS/FAIL."
        ],
        "build": [
          "Crea módulos de validación y almacenamiento reutilizables.",
          "Añade búsqueda o filtrado y un estado de vista vacío.",
          "Incorpora mensajes accesibles para éxito y error."
        ],
        "test": [
          "Ejecuta una batería de al menos ocho casos incluyendo navegación con teclado.",
          "Corrige una falla detectada y documenta la causa."
        ],
        "evidence": "Árbol de componentes, pruebas reales, antes/después y evidencia de accesibilidad.",
        "gate": "Todas las funciones del alcance mínimo tienen pruebas reproducibles.",
        "code": "function matches(query, label){\n  return label.toLowerCase().includes(query.toLowerCase());\n}\nconsole.assert(matches('ana','Ana'), 'Búsqueda incorrecta');"
      },
      {
        "title": "04 · Publicar y defender",
        "theory": [
          "Un MVP demuestra una solución mínima completa.",
          "La documentación debe permitir reproducir instalación, uso y pruebas."
        ],
        "build": [
          "Publica una versión funcional en GitHub Pages.",
          "Incluye README, restricciones, capturas y instrucciones.",
          "Prepara demostración del problema, solución y pruebas."
        ],
        "test": [
          "Abre el enlace publicado desde otro dispositivo y navegador.",
          "Prueba el flujo completo después del último despliegue."
        ],
        "evidence": "URL real, código, README, bitácora de pruebas y defensa individual.",
        "gate": "El proyecto es usable en su URL y cada criterio de aceptación se demuestra.",
        "code": "// Checklist de entrega: URL, README, funcionalidades, pruebas, limitaciones."
      }
    ]
  },
  {
    "slug": "data",
    "title": "Data Science · reproducible analysis",
    "track": "Data Science",
    "summary": "Carga un conjunto de datos anonimizado, valida su calidad y genera conclusiones y figuras con Python.",
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
    "slug": "robotics",
    "title": "Robotics & Automation · controller simulator",
    "track": "Robotics",
    "summary": "Diseña un controlador de estados, simula sensores y actuadores y verifica la lógica sin hardware obligatorio.",
    "stages": [
      {
        "title": "01 · Requisitos y diagrama de bloques",
        "theory": [
          "Sensor → controlador → actuador es un lazo básico de automatización.",
          "El sistema debe definir estados, entradas, salidas y condiciones de seguridad."
        ],
        "build": [
          "Define un problema concreto y tabla entrada/acción.",
          "Dibuja un diagrama de bloques y estados.",
          "Identifica comportamiento seguro ante fallas de lectura."
        ],
        "test": [
          "Prueba tres escenarios con entradas sintéticas.",
          "Registra respuesta esperada para cada transición."
        ],
        "evidence": "Historias de usuario, diagrama, tabla de estados.",
        "gate": "Cada estado tiene entradas y salidas definidas.",
        "code": "# Estado del controlador\nstate = 'IDLE'\nsensor = True\nif sensor: state = 'ACTIVE'\nprint(state)"
      },
      {
        "title": "02 · Prototipo de controlador",
        "theory": [
          "Separar lectura, transición de estado y salida mejora depuración.",
          "Las pruebas pueden ejecutarse con datos sintéticos."
        ],
        "build": [
          "Implementa el controlador en Python o entorno de simulación.",
          "Agrega temporización no bloqueante cuando sea pertinente.",
          "Incluye un modo de parada segura."
        ],
        "test": [
          "Prueba activación, desactivación y error.",
          "Verifica que nunca se activen salidas incompatibles."
        ],
        "evidence": "Código fuente, tabla de pruebas y demostración simulada.",
        "gate": "El controlador es determinista y tiene estado seguro.",
        "code": "def controller(temperature,enabled):\n    if not enabled: return 'OFF'\n    if temperature is None: return 'SAFE'\n    return 'COOL' if temperature>28 else 'IDLE'\nfor t in [25,30,None]: print(controller(t,True))"
      },
      {
        "title": "03 · Integración y QA",
        "theory": [
          "Los límites y fallas deben probarse, no suponerse.",
          "La trazabilidad une requisito, prueba y evidencia."
        ],
        "build": [
          "Integra la simulación completa.",
          "Implementa registro de estados y anomalías.",
          "Crea al menos seis pruebas con valores límite."
        ],
        "test": [
          "Inyecta una falla de sensor y confirma salida segura.",
          "Comprueba que los logs describan estados reales."
        ],
        "evidence": "Matriz de pruebas, logs y grabación de simulación.",
        "gate": "El prototipo responde correctamente en límites y fallas previstas.",
        "code": "def safe_read(value):\n    return 'SAFE' if value is None else 'OK'\nassert safe_read(None)=='SAFE'"
      },
      {
        "title": "04 · Demostración técnica",
        "theory": [
          "Los resultados deben poder reproducirse y explicarse.",
          "La defensa muestra el motivo de cada decisión de control."
        ],
        "build": [
          "Documenta hardware opcional, diagrama eléctrico y simulación.",
          "Prepara una demostración de caso nominal y caso de falla.",
          "Entrega código e instrucciones de ejecución."
        ],
        "test": [
          "Reinicia la simulación y demuestra ambos casos.",
          "Confirma coincidencia entre diagrama, lógica y código."
        ],
        "evidence": "Repositorio, demo, documentación, pruebas y defensa individual.",
        "gate": "El docente reproduce el funcionamiento previsto y el modo seguro.",
        "code": "# Entrega: esquema + fuente + pruebas + demostración."
      }
    ]
  },
  {
    "slug": "cyber",
    "title": "Defensive Cybersecurity · safe lab",
    "track": "Defensive Cybersecurity",
    "summary": "Cuatro clases para reproducir un caso en un entorno local autorizado, implementar una defensa y demostrar su efecto con pruebas comparables. Conserva el alcance individual: resiliencia web para Arango; el activo de los proyectos por definir requiere confirmación.",
    "stages": [
      {
        "title": "01 · Alcance y línea base",
        "theory": [
          "Activo, amenaza, control y evidencia forman un modelo de defensa. Define éxito para peticiones legítimas y para el escenario de abuso.",
          "Trabaja con el laboratorio local provisto. Los casos disponibles son resiliencia HTTP, abuso de autenticación, control de acceso y XSS almacenado."
        ],
        "build": [
          "Elige el caso que corresponde al proyecto y documenta activo, amenaza y criterio de éxito.",
          "Descarga el laboratorio, lee README.md y revisa docker-compose.yml para identificar puertos y servicios.",
          "Inicia el entorno y conserva configuración y línea base."
        ],
        "test": [
          "Verifica que los servicios arrancan y una petición legítima funciona.",
          "Registra código HTTP, latencia, fecha y condición de prueba; elimina secretos de las evidencias."
        ],
        "evidence": "Diagrama del entorno, alcance autorizado, configuración y registro de línea base.",
        "gate": "El entorno local funciona y la condición de prueba es reproducible.",
        "code": "docker compose config\ndocker compose up -d\ndocker compose ps"
      },
      {
        "title": "02 · Reproducir y explicar el caso",
        "theory": [
          "Un hallazgo debe enlazar entrada, comportamiento observado y causa. Un error aislado no demuestra una vulnerabilidad.",
          "Para resiliencia, mide también disponibilidad del tráfico legítimo; para autorización, prueba acceso permitido y denegado."
        ],
        "build": [
          "Sigue el caso correspondiente de la biblioteca, usando exclusivamente el entorno local.",
          "Inspecciona la petición, HTML, código del servicio y logs para localizar el control ausente.",
          "Fija entrada, duración y condiciones; registra una ejecución previa a la defensa."
        ],
        "test": [
          "Comprueba que el caso produce el comportamiento descrito y que puedes repetirlo.",
          "Añade una prueba legítima de control con la misma configuración."
        ],
        "evidence": "Petición o fixture, logs saneados, resultado previo y explicación de la causa.",
        "gate": "La evidencia distingue el caso de abuso de una petición legítima y permite reproducirlo.",
        "code": "docker compose logs --tail=100"
      },
      {
        "title": "03 · Implementar la defensa",
        "theory": [
          "El control se aplica en la capa que decide: límites en proxy/servicio, autorización por recurso, validación de entrada y salida segura según el caso.",
          "La defensa debe reducir el abuso conservando el comportamiento legítimo. Cambia una condición a la vez para atribuir el resultado."
        ],
        "build": [
          "Implementa el control del caso elegido y documenta el archivo y la decisión técnica.",
          "Reinicia o reconstruye los servicios afectados siguiendo el README.",
          "Repite exactamente el escenario anterior y una petición legítima."
        ],
        "test": [
          "Compara los mismos indicadores antes y después.",
          "Prueba un caso límite y comprueba que no se bloquea el usuario legítimo."
        ],
        "evidence": "Diff/commit, configuración y tabla antes/después con las mismas condiciones.",
        "gate": "La defensa controla el caso y las pruebas legítimas siguen pasando.",
        "code": ""
      },
      {
        "title": "04 · Regresión y defensa técnica",
        "theory": [
          "Una defensa se evalúa por resultados y límites, no por instalar una herramienta. Los logs sustentan cada conclusión.",
          "La regresión incluye permitido, bloqueado, límite, reinicio y errores de configuración."
        ],
        "build": [
          "Crea una matriz de pruebas con esperado/obtenido y referencia a evidencia.",
          "Reproduce un fallo de la defensa, corrige y vuelve a probar.",
          "Entrega README para reconstruir el laboratorio, commits, reporte de causa/control y limitaciones."
        ],
        "test": [
          "Arranca desde una configuración limpia y repite la matriz.",
          "Demuestra en vivo el caso antes/después y explica qué protege y qué queda fuera del alcance."
        ],
        "evidence": "Matriz, logs, corrección verificable y demostración técnica.",
        "gate": "El docente puede reproducir los resultados; los límites y las pruebas pendientes están explícitos.",
        "code": ""
      }
    ],
    "resources": [
      [
        "Laboratorio local y código",
        "https://github.com/juanperez238421-cpu/IJR---Seminario/tree/main/t3/tracks/cybersecurity/lab"
      ]
    ]
  },
  {
    "slug": "cad",
    "title": "Parametric CAD & 3D Printing",
    "track": "3D Programming / CAD",
    "summary": "Cuatro clases para convertir una necesidad en una pieza funcional, editable, fabricable y validada. El objeto y sus medidas deben confirmarse con el docente.",
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
          "En Fusion, crea un boceto restringido y extruye el volumen inicial."
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
    "slug": "animation",
    "title": "Animation with Python",
    "track": "Creative Python",
    "summary": "Cuatro clases para construir un mensaje animado en Python. La forma visual es configurable; el motor, las pruebas y la entrega son parte del mismo producto.",
    "stages": [
      {
        "title": "01 · Inicio funcional y contrato",
        "theory": [
          "Un storyboard define qué aparece, en qué orden y con qué duración. Los criterios deben ser observables: ventana abierta, fondo visible, mensaje legible y cierre controlado.",
          "Separa configuración, escena y renderizado. La primera entrega es una animación mínima ejecutable."
        ],
        "build": [
          "Dibuja un storyboard de fondo → corazón → flores → texto. Fija duración, resolución, colores y texto.",
          "Descarga el ejemplo de mensaje animado, lee su README y ejecuta run.py con las dependencias de requirements.txt.",
          "Crea un commit con la primera escena y un diagrama de responsabilidades."
        ],
        "test": [
          "Ejecuta desde cero; verifica inicio, primer cuadro y cierre.",
          "Comprueba que el texto cabe en pantalla y registra el resultado esperado y obtenido."
        ],
        "evidence": "Storyboard, criterios de aceptación, UML y captura de la primera ejecución.",
        "gate": "La escena mínima inicia y termina; cada criterio tiene una prueba.",
        "code": "python -m pip install -r requirements.txt\npython run.py"
      },
      {
        "title": "02 · Motor y efectos reutilizables",
        "theory": [
          "El tiempo de animación depende de segundos transcurridos, no del número de cuadros. update(dt) cambia el estado; draw() lo representa.",
          "Flor, corazón y texto tienen responsabilidades distintas. Los parámetros controlan tamaño, color, posición y duración; una seed permite repetir la escena."
        ],
        "build": [
          "Implementa al menos tres efectos reutilizables: corazón pulsante, flores y aparición de texto.",
          "Integra el fondo sin bloquear el bucle de eventos. Expón parámetros en configuración.",
          "Cambia un parámetro sin reescribir el motor."
        ],
        "test": [
          "Compara la duración de la misma escena a 30 y 120 FPS con una tolerancia declarada antes de medir.",
          "Prueba texto largo, número mínimo de flores y la misma seed dos veces."
        ],
        "evidence": "Código, configuración, comparación temporal y video de la escena completa.",
        "gate": "Los tres efectos funcionan juntos y un cambio de parámetro produce un resultado predecible.",
        "code": ""
      },
      {
        "title": "03 · Portabilidad y entrega USB",
        "theory": [
          "Las rutas se resuelven desde el proyecto o paquete, no desde una carpeta absoluta del equipo del autor.",
          "La entrega incluye recursos, configuración, instrucciones y un launcher manual visible. El usuario inicia la animación."
        ],
        "build": [
          "Aplica la guía usb/ del ejemplo para crear el paquete de Windows.",
          "Incluye README, recursos y configuración en una carpeta portable.",
          "Copia la entrega a USB o a otra carpeta y ejecútala desde allí."
        ],
        "test": [
          "Desconecta la red y ejecuta en el equipo de destino. Registra sistema y dependencias necesarias.",
          "Mueve la carpeta; verifica espacios en la ruta y el comportamiento ante un recurso ausente."
        ],
        "evidence": "Carpeta de entrega, instrucciones y registro de prueba offline en el destino.",
        "gate": "La animación se inicia desde el launcher y no depende de la ubicación original.",
        "code": ""
      },
      {
        "title": "04 · QA y defensa en vivo",
        "theory": [
          "Una prueba de regresión repite el escenario que falló después de corregirlo. El video por sí solo no demuestra portabilidad ni calidad.",
          "La defensa conecta contrato, diseño, implementación y resultados."
        ],
        "build": [
          "Construye una matriz: inicio, cierre, texto largo, recurso ausente, configuración inválida, carpeta movida y ejecución offline.",
          "Reproduce un fallo, corrígelo y repite la misma prueba.",
          "Entrega README, UML final, repositorio y build; cambia color o mensaje durante la defensa."
        ],
        "test": [
          "Ejecuta la matriz en la versión final e identifica los casos que no pudiste comprobar.",
          "Repite los tests del ejemplo desde su carpeta raíz."
        ],
        "evidence": "Matriz con esperado/obtenido, evidencia del fallo y corrección, commit final y demostración.",
        "gate": "Todos los criterios del contrato están verificados o sus limitaciones están documentadas.",
        "code": "python -m unittest discover -s tests"
      }
    ],
    "resources": [
      [
        "Ejemplo ejecutable y notebook",
        "https://github.com/juanperez238421-cpu/IJR---Seminario/tree/main/t3/projects/python-message-animation"
      ]
    ]
  }
];

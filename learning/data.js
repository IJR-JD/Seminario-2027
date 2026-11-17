window.SEMINAR_TOPICS = {
  "algoritmos": {
    "id": "algoritmos",
    "number": "01",
    "title": "Algoritmos y pensamiento lógico",
    "short": "Del problema a la secuencia",
    "level": "Fundamentos",
    "duration": "2 sesiones",
    "intro": "Un algoritmo es un procedimiento finito y ordenado que transforma unas entradas en una salida. Antes de programar, debemos entender el problema y diseñar instrucciones sin ambigüedad.",
    "goal": "Identificar entradas, procesos y salidas; construir secuencias claras y comprobar un resultado mediante casos de prueba.",
    "concepts": [
      {
        "title": "1. El problema primero",
        "body": "Antes de escribir instrucciones, determina qué debes resolver, qué información tienes y cómo comprobarás la respuesta.",
        "example": "Problema: calcular el valor total de 3 cuadernos de $4.500 cada uno."
      },
      {
        "title": "2. Entrada → Proceso → Salida",
        "body": "Las entradas son los datos iniciales; el proceso transforma esos datos siguiendo instrucciones; la salida es el resultado observable.",
        "example": "Entrada: precio=4500, cantidad=3 · Proceso: multiplicar · Salida: 13500"
      },
      {
        "title": "3. Secuencia y finitud",
        "body": "Las instrucciones se ejecutan en un orden definido y el procedimiento debe terminar. Un algoritmo puede expresarse en lenguaje natural, pseudocódigo, diagrama de flujo o un programa.",
        "example": "INICIO → LEER precio → total = precio × 3 → MOSTRAR total → FIN"
      },
      {
        "title": "4. Prueba de escritorio",
        "body": "Simula el algoritmo con valores concretos y registra cómo cambian los datos. Una buena solución funciona con diferentes entradas, no solamente con un ejemplo.",
        "example": "Si precio=2000, salida=6000. Si precio=4500, salida=13500."
      }
    ],
    "syntax": [
      [
        "print(valor)",
        "Mostrar un resultado"
      ],
      [
        "precio = 4500",
        "Guardar una entrada conocida"
      ],
      [
        "total = precio * 3",
        "Transformar una entrada"
      ],
      [
        "# comentario",
        "Describir una instrucción"
      ]
    ],
    "example": "precio = 4500\ncantidad = 3\ntotal = precio * cantidad\nprint(total)",
    "expected": "13500",
    "problems": [
      {
        "kind": "choice",
        "title": "Identifica un algoritmo",
        "prompt": "¿Cuál describe correctamente un algoritmo?",
        "options": [
          "Un conjunto desordenado de ideas",
          "Una secuencia finita de instrucciones claras",
          "Únicamente una aplicación instalada"
        ],
        "answer": 1,
        "hint": "Piensa en orden, precisión y terminación.",
        "reason": "Un algoritmo expresa pasos finitos, claros y ordenados."
      },
      {
        "kind": "choice",
        "title": "Orden lógico",
        "prompt": "¿Qué orden representa el modelo general de resolución?",
        "options": [
          "Salida → Entrada → Proceso",
          "Entrada → Proceso → Salida",
          "Proceso → Salida → Entrada"
        ],
        "answer": 1,
        "hint": "Los datos llegan antes de transformarlos.",
        "reason": "Primero se reciben las entradas, luego se procesan y finalmente se produce una salida."
      },
      {
        "kind": "choice",
        "title": "Reconoce la entrada",
        "prompt": "En un programa que calcula el área de un rectángulo, ¿cuáles son los datos de entrada?",
        "options": [
          "Base y altura",
          "Área calculada",
          "La palabra FIN"
        ],
        "answer": 0,
        "hint": "Son los valores necesarios antes de aplicar la fórmula.",
        "reason": "Base y altura alimentan el cálculo del área."
      },
      {
        "kind": "choice",
        "title": "Reconoce la salida",
        "prompt": "En un algoritmo que convierte °C a °F, ¿qué valor es la salida?",
        "options": [
          "La fórmula",
          "La temperatura original en °C",
          "El resultado expresado en °F"
        ],
        "answer": 2,
        "hint": "Identifica lo que recibe finalmente el usuario.",
        "reason": "La temperatura convertida es el resultado."
      },
      {
        "kind": "choice",
        "title": "Un algoritmo debe terminar",
        "prompt": "¿Qué propiedad garantiza que un algoritmo no continúa indefinidamente?",
        "options": [
          "Finitud",
          "Color del código",
          "Cantidad de comentarios"
        ],
        "answer": 0,
        "hint": "La palabra comienza por 'fini'.",
        "reason": "Finitud significa que el procedimiento concluye tras un número finito de pasos."
      },
      {
        "kind": "choice",
        "title": "Prueba de escritorio",
        "prompt": "Si cantidad=4 y precio=3000, ¿cuál debe ser el total?",
        "options": [
          "3004",
          "12000",
          "750"
        ],
        "answer": 1,
        "hint": "Multiplica precio × cantidad.",
        "reason": "3000 × 4 = 12000."
      },
      {
        "kind": "code",
        "title": "Tu primera salida",
        "prompt": "Escribe código Python que muestre exactamente Hola algoritmo.",
        "expected": "Hola algoritmo",
        "hint": "Usa print(\"Hola algoritmo\").",
        "reason": "print() muestra un texto en la salida."
      },
      {
        "kind": "code",
        "title": "Multiplicación directa",
        "prompt": "Imprime el resultado de multiplicar 6 por 7 usando Python.",
        "expected": "42",
        "hint": "Puedes escribir print(6 * 7).",
        "reason": "El operador * realiza una multiplicación."
      },
      {
        "kind": "code",
        "title": "Entrada conocida",
        "prompt": "Declara una variable precio con valor 4000 y muestra su contenido.",
        "expected": "4000",
        "hint": "Usa precio = 4000, seguido de print(precio).",
        "reason": "La asignación almacena el dato y print permite verlo."
      },
      {
        "kind": "code",
        "title": "Entrada y proceso",
        "prompt": "Declara precio=2500 y cantidad=3. Calcula total y muestra solamente el resultado.",
        "expected": "7500",
        "hint": "total = precio * cantidad",
        "reason": "2500 × 3 = 7500."
      },
      {
        "kind": "code",
        "title": "Área de un rectángulo",
        "prompt": "Declara base=8 y altura=5. Calcula e imprime el área.",
        "expected": "40",
        "hint": "area = base * altura",
        "reason": "El área de un rectángulo es base × altura."
      },
      {
        "kind": "code",
        "title": "Caso de prueba",
        "prompt": "Declara precio=1200 y cantidad=5. Imprime el costo total.",
        "expected": "6000",
        "hint": "Define las entradas antes de calcular.",
        "reason": "Una prueba de escritorio confirma que 1200 × 5 = 6000."
      }
    ]
  },
  "variables": {
    "id": "variables",
    "number": "02",
    "title": "Variables y tipos de datos",
    "short": "Nombrar, guardar y transformar valores",
    "level": "Fundamentos",
    "duration": "2 sesiones",
    "intro": "En Python una variable es un nombre que referencia un valor. Las variables permiten expresar datos, repetir cálculos y construir programas que cambian según la información recibida.",
    "goal": "Definir variables con nombres significativos; distinguir int, float, str y bool; realizar operaciones y mostrar resultados.",
    "concepts": [
      {
        "title": "1. Asignación",
        "body": "El operador = asigna a un nombre un valor. No significa 'es igual' como en una ecuación: almacena una referencia que puede cambiar.",
        "example": "edad = 15 · edad = edad + 1 · print(edad) → 16"
      },
      {
        "title": "2. Nombres de variables",
        "body": "Utiliza nombres descriptivos, letras, números y guion bajo. El primer carácter no puede ser un número. Evita espacios y palabras reservadas.",
        "example": "total_compra = 12000 es válido; 2total y precio final no son válidos."
      },
      {
        "title": "3. Tipos básicos",
        "body": "int representa enteros; float números decimales; str texto; bool valores lógicos True o False. El tipo determina cómo se comportan las operaciones.",
        "example": "edad=15 → int · altura=1.65 → float · nombre=\"Ana\" → str · activo=True → bool"
      },
      {
        "title": "4. Operaciones y conversión",
        "body": "Los operadores +, -, *, / y ** permiten cálculos. Para sumar un texto numérico a un entero primero conviértelo con int() o float().",
        "example": "int(\"12\") + 3 → 15; \"12\" + \"3\" → \"123\""
      }
    ],
    "syntax": [
      [
        "nombre = \"Ana\"",
        "Cadena de texto: str"
      ],
      [
        "edad = 15",
        "Entero: int"
      ],
      [
        "altura = 1.65",
        "Decimal: float"
      ],
      [
        "activo = True",
        "Booleano: bool"
      ],
      [
        "type(edad)",
        "Consulta el tipo de dato"
      ],
      [
        "int(\"12\")",
        "Convierte texto numérico a entero"
      ]
    ],
    "example": "nombre = \"Ana\"\nedad = 15\nprecio = 4500.0\nactivo = True\nprint(nombre)\nprint(edad + 1)",
    "expected": "Ana\n16",
    "problems": [
      {
        "kind": "choice",
        "title": "¿Qué es una variable?",
        "prompt": "¿Qué representa una variable en Python?",
        "options": [
          "Un nombre que referencia un valor",
          "Un error de compilación",
          "Una imagen guardada"
        ],
        "answer": 0,
        "hint": "Relaciona nombre y dato.",
        "reason": "Una variable permite referenciar y utilizar un valor."
      },
      {
        "kind": "choice",
        "title": "Tipo entero",
        "prompt": "¿Cuál expresión representa un entero (int)?",
        "options": [
          "\"15\"",
          "15",
          "15.0"
        ],
        "answer": 1,
        "hint": "Sin comillas ni punto decimal.",
        "reason": "15 es int; '15' es texto y 15.0 es float."
      },
      {
        "kind": "choice",
        "title": "Tipo texto",
        "prompt": "¿Cuál de estos valores es str?",
        "options": [
          "True",
          "3.5",
          "\"Python\""
        ],
        "answer": 2,
        "hint": "Un texto se escribe entre comillas.",
        "reason": "Las comillas indican una cadena de caracteres."
      },
      {
        "kind": "choice",
        "title": "Tipo lógico",
        "prompt": "¿Cuál es un valor booleano válido en Python?",
        "options": [
          "true",
          "True",
          "\"true\""
        ],
        "answer": 1,
        "hint": "Python distingue mayúsculas y minúsculas.",
        "reason": "True, con T mayúscula, es un valor bool."
      },
      {
        "kind": "choice",
        "title": "Asignación o comparación",
        "prompt": "¿Qué operador asigna el valor 9 a edad?",
        "options": [
          "==",
          "=",
          "!="
        ],
        "answer": 1,
        "hint": "Uno asigna; dos signos iguales comparan.",
        "reason": "edad = 9 es una asignación; edad == 9 es una comparación."
      },
      {
        "kind": "choice",
        "title": "Nombre válido",
        "prompt": "¿Qué nombre de variable es válido?",
        "options": [
          "2precio",
          "precio total",
          "precio_total"
        ],
        "answer": 2,
        "hint": "No puede comenzar con número ni contener espacios.",
        "reason": "El guion bajo es válido en nombres de variables."
      },
      {
        "kind": "code",
        "title": "Declara tu edad",
        "prompt": "Crea una variable edad con valor 16 y muestra su valor usando print().",
        "expected": "16",
        "hint": "edad = 16 y luego print(edad).",
        "reason": "Se define una variable antes de utilizarla."
      },
      {
        "kind": "code",
        "title": "Suma de dos variables",
        "prompt": "Crea a=12 y b=8. Muestra la suma de ambas.",
        "expected": "20",
        "hint": "print(a + b).",
        "reason": "Los enteros se suman con +."
      },
      {
        "kind": "code",
        "title": "Cambia un valor",
        "prompt": "Crea puntos=10, aumenta puntos en 5 y muestra el resultado.",
        "expected": "15",
        "hint": "puntos = puntos + 5",
        "reason": "Una variable puede reasignarse usando su valor anterior."
      },
      {
        "kind": "code",
        "title": "Trabaja con decimales",
        "prompt": "Define altura=1.5 y calcula altura * 2. Muestra el resultado.",
        "expected": "3.0",
        "hint": "print(altura * 2)",
        "reason": "Una operación con un float produce aquí el decimal 3.0."
      },
      {
        "kind": "code",
        "title": "Convierte un texto",
        "prompt": "Declara numero=\"12\" y convierte el texto a entero para sumarle 3. Imprime el total.",
        "expected": "15",
        "hint": "print(int(numero) + 3)",
        "reason": "int() convierte una representación textual válida en número entero."
      },
      {
        "kind": "code",
        "title": "Mini programa: compras",
        "prompt": "Define precio=4500 y cantidad=4, calcula total y muestra el valor final.",
        "expected": "18000",
        "hint": "total = precio * cantidad; print(total)",
        "reason": "Separar datos y cálculo facilita reutilizar el programa."
      }
    ]
  }
};

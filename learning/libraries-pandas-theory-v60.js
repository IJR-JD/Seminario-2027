(() => {
  'use strict';

  const params = new URLSearchParams(location.search);
  if ((params.get('topic') || 'operations') !== 'logic') return;

  const VERSION = 'v60';

  const APPLICATIONS = [
    {
      area:'Mathematics',
      library:'math',
      tag:'STANDARD LIBRARY',
      use:'Angles, roots, trigonometry and formulas.',
      code:[
        'import math',
        'speed = 20',
        'angle = math.radians(35)',
        'vx = speed * math.cos(angle)',
        'vy = speed * math.sin(angle)',
        'print(round(vx, 2), round(vy, 2))'
      ],
      result:'velocity → horizontal + vertical components'
    },
    {
      area:'Physics simulation',
      library:'NumPy',
      tag:'NUMERICAL COMPUTING',
      use:'Calculate many physical states at once instead of one value at a time.',
      code:[
        'import numpy as np',
        't = np.linspace(0, 2, 100)',
        'x = 15 * t',
        'y = 20 * t - 4.9 * t**2',
        'print(y.max())'
      ],
      result:'100 time samples → one trajectory'
    },
    {
      area:'Signals',
      library:'SciPy',
      tag:'SIGNAL PROCESSING',
      use:'Filter noise from measurements such as sensors, audio or laboratory signals.',
      code:[
        'import numpy as np',
        'from scipy import signal',
        't = np.linspace(0, 1, 500)',
        'rng = np.random.default_rng(2027)',
        'noisy = np.sin(2*np.pi*5*t) + 0.35*rng.standard_normal(500)',
        'b, a = signal.butter(3, 0.12)',
        'clean = signal.filtfilt(b, a, noisy)',
        'print(round(float(np.std(clean)), 3))'
      ],
      result:'noisy signal → filtered signal'
    },
    {
      area:'Video games',
      library:'Pygame',
      tag:'DESKTOP PYTHON · SDL REQUIRED',
      use:'Run this example in desktop Python with Pygame installed; an SDL game window is not supported inside the browser Python sandbox.',
      code:[
        'import pygame',
        'pygame.init()',
        'screen = pygame.display.set_mode((640, 360))',
        'player = pygame.Rect(100, 150, 40, 40)',
        'keys = pygame.key.get_pressed()',
        'running = True',
        'clock = pygame.time.Clock()',
        'while running:',
        '    for event in pygame.event.get():',
        '        if event.type == pygame.QUIT: running = False',
        '    keys = pygame.key.get_pressed()',
        '    player.x += (keys[pygame.K_RIGHT] - keys[pygame.K_LEFT]) * 5',
        '    screen.fill((255, 255, 255))',
        '    pygame.draw.rect(screen, (0, 0, 0), player)',
        '    pygame.display.flip()',
        '    clock.tick(60)',
        'pygame.quit()'
      ],
      result:'keyboard input → player movement'
    },
    {
      area:'Animation',
      library:'Matplotlib',
      tag:'COLAB NOTEBOOK · ANIMATION OUTPUT',
      use:'Execute in Google Colab to render the HTML animation; the browser practice console cannot display the notebook HTML player.',
      code:[
        'import numpy as np',
        'import matplotlib.pyplot as plt',
        'from matplotlib.animation import FuncAnimation',
        'from IPython.display import HTML, display',
        'x = np.linspace(0, 2*np.pi, 200)',
        'fig, ax = plt.subplots()',
        'line, = ax.plot(x, np.zeros_like(x))',
        'def update(frame):',
        '    line.set_ydata(np.sin(x + frame / 10))',
        '    return (line,)',
        'animation = FuncAnimation(fig, update, frames=60)',
        'display(HTML(animation.to_jshtml()))',
        'plt.close(fig)'
      ],
      result:'calculation → moving figure'
    },
    {
      area:'Images',
      library:'OpenCV',
      tag:'COLAB / OPENCV DEPENDENCY',
      use:'Read an image and detect visual structures such as edges.',
      code:[
        'import cv2',
        'import numpy as np',
        'img = np.zeros((100, 100, 3), dtype=np.uint8)',
        'cv2.rectangle(img, (15, 15), (85, 85), (255, 255, 255), 2)',
        'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)',
        'edges = cv2.Canny(gray, 80, 150)',
        'print(int(np.count_nonzero(edges)))'
      ],
      result:'image → measurable visual features'
    },
    {
      area:'Data analyst',
      library:'Pandas',
      tag:'TABULAR DATA',
      use:'Read Excel, filter observations, summarize variables and export results.',
      code:[
        'import pandas as pd',
        'df = pd.read_excel("pandas_excel_students.xlsx", sheet_name="Students")',
        'high = df.loc[df["score"] >= 80]',
        'summary = df.groupby("group")["score"].mean()',
        'print(summary.round(1).to_dict())'
      ],
      result:'Excel table → reproducible analysis'
    },
    {
      area:'Machine learning',
      library:'scikit-learn',
      tag:'PREDICTIVE MODELS',
      use:'Fit a model from examples and use it to generate predictions.',
      code:[
        'from sklearn.linear_model import LinearRegression',
        'X = [[1], [2], [3], [4]]',
        'y = [50, 60, 72, 83]',
        'model = LinearRegression().fit(X, y)',
        'prediction = model.predict([[5]])',
        'print(round(float(prediction[0]), 2))'
      ],
      result:'examples → fitted model → prediction'
    }
  ];

  const MODULES = [
    {
      classNo:1,
      n:'01',
      title:'What is a library?',
      copy:'Python provides the language. A library provides ready-made tools for a specific domain. You import only the toolset you need for the problem in front of you.',
      code:['import math','import numpy as np','import pandas as pd'],
      points:['Same Python language','Different problem domains','Reusable tested tools']
    },
    {
      classNo:1,
      n:'02',
      title:'From a file to an Excel workbook',
      copy:'Before analysis, understand the object on disk. pathlib identifies the file; openpyxl understands the .xlsx workbook, worksheets and cells.',
      code:['from pathlib import Path','from openpyxl import load_workbook','file = Path("pandas_excel_students.xlsx")','wb = load_workbook(file)','ws = wb["Students"]'],
      points:['file path','workbook','worksheet','cell']
    },
    {
      classNo:1,
      n:'03',
      title:'Real Excel manipulation',
      copy:'Use openpyxl when the task is about workbook structure, templates or individual cells. Create, modify and save a genuine Excel file from Python.',
      code:['from openpyxl import Workbook','wb = Workbook()','ws = wb.active','ws["A1"] = "ready"','wb.save("xlsx_library_output.xlsx")'],
      points:['create workbook','write cell','save .xlsx']
    },
    {
      classNo:2,
      n:'04',
      title:'Why Pandas?',
      copy:'Pandas changes the level of abstraction. Instead of thinking in A1, B2 and C3, you work with observations, variables, Series and DataFrames.',
      code:['import pandas as pd','df = pd.read_excel("pandas_excel_students.xlsx", sheet_name="Students")','print(df.shape)','print(df.head())'],
      points:['rows = observations','columns = variables','DataFrame = table']
    },
    {
      classNo:2,
      n:'05',
      title:'Analyze the DataFrame',
      copy:'One statement can filter complete observations, create derived variables and summarize groups. The analytical rule remains visible in code.',
      code:['import pandas as pd','df = pd.read_excel("pandas_excel_students.xlsx", sheet_name="Students")','df["performance_index"] = (df["score"] * df["attendance"]).round(1)','high = df.loc[df["score"] >= 80]','summary = df.groupby("group")["score"].mean().round(1)','print(summary.to_dict())'],
      points:['derive','filter','group','summarize']
    },
    {
      classNo:2,
      n:'06',
      title:'Export a real result',
      copy:'The final product can return to Excel. This closes the complete workflow from a classroom workbook to an analytical output that can be shared.',
      code:['import pandas as pd','df = pd.read_excel("pandas_excel_students.xlsx", sheet_name="Students")','high = df.loc[df["score"] >= 80]','summary = df.groupby("group")["score"].mean().round(1)','with pd.ExcelWriter("class_analysis.xlsx") as writer:','    high.to_excel(writer, sheet_name="High performance", index=False)','    summary.to_excel(writer, sheet_name="Group summary")','print("class_analysis.xlsx")'],
      points:['analysis','output workbook','reproducible result']
    }
  ];

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function codeHtml(lines, label='Python') {
    return '<div class="p60-code"><div class="p60-code-head"><span>' + esc(label) + '</span><small>simple example</small></div><pre><code>' +
      lines.map(esc).join('\n') +
      '</code></pre></div>';
  }

  function applicationsHtml() {
    return '<section class="p60-section p60-applications">' +
      '<div class="section-heading"><p class="eyebrow">CLASS 1 · WHY LIBRARIES MATTER</p><h2>Python can move from mathematics to games, physics, signals, animation and data.</h2><p>These are short real examples, not eight new lessons. The objective is to show what a library unlocks before the course focuses on Excel and Pandas.</p></div>' +
      '<div class="p60-app-grid">' +
      APPLICATIONS.map((item, index) =>
        '<article class="p60-app-card">' +
          '<div class="p60-app-copy"><div class="p60-app-number">' + String(index + 1).padStart(2,'0') + '</div><div><span>' + esc(item.tag) + '</span><h3>' + esc(item.area) + ' · ' + esc(item.library) + '</h3><p>' + esc(item.use) + '</p></div></div>' +
          codeHtml(item.code, item.library) +
          '<div class="p60-result"><span>REAL IDEA</span><strong>' + esc(item.result) + '</strong></div>' +
        '</article>'
      ).join('') +
      '</div>' +
    '</section>';
  }

  function routeHtml() {
    return '<section class="p60-section p60-route">' +
      '<div class="section-heading"><p class="eyebrow">TOPIC 04 · TWO CLASSES ONLY</p><h2>One broad introduction, then one focused Pandas class.</h2><p>The workshop stays in the Colab-style notebook. Theory is deliberately compact and uses the same visual language as the rest of the Python Hub.</p></div>' +
      '<div class="p60-route-grid">' +
        '<article><span>CLASS 1</span><h3>Libraries + real XLSX files</h3><p>See the ecosystem, try practical examples, then understand files, workbooks, worksheets and cells.</p><strong>≈ 20 min theory + 30 min workshop</strong><a href="#practice">Workshop stages 01–06 →</a></article>' +
        '<article><span>CLASS 2</span><h3>Pandas + data analysis</h3><p>Read the same XLSX as a DataFrame, inspect it, transform it, summarize it and export a new workbook.</p><strong>≈ 20 min theory + 30 min workshop</strong><a href="#practice">Workshop stages 07–12 →</a></article>' +
      '</div>' +
    '</section>';
  }

  function moduleHtml(module) {
    return '<article class="p60-module">' +
      '<div class="p60-module-copy"><span>CLASS ' + module.classNo + ' · ' + module.n + '</span><h3>' + esc(module.title) + '</h3><p>' + esc(module.copy) + '</p><div class="p60-chip-row">' +
      module.points.map(point => '<b>' + esc(point) + '</b>').join('') +
      '</div></div>' +
      codeHtml(module.code, module.classNo === 1 ? 'library / file code' : 'Pandas code') +
    '</article>';
  }

  function coreTheoryHtml() {
    return '<section class="p60-section p60-core">' +
      '<div class="section-heading"><p class="eyebrow">SIMPLE CODE LAYOUT</p><h2>Read the idea on the left. Read the code on the right.</h2><p>No line-by-line animation and no dense nested interface. Each block uses the same clean structure as the general theory page.</p></div>' +
      '<div class="p60-module-list">' +
        MODULES.map(moduleHtml).join('') +
      '</div>' +
    '</section>';
  }

  function realPandasHtml() {
    return '<section class="p60-section p60-real">' +
      '<div class="section-heading"><p class="eyebrow">CLASS 2 · REAL DATA ANALYST APPLICATION</p><h2>Turn the classroom Excel workbook into an analysis product.</h2><p>The same file used in the workshop becomes the source for a small professional pipeline: inspect students, calculate a performance index, select cases, summarize groups and export two result sheets.</p></div>' +
      '<div class="p60-real-grid">' +
        '<div class="p60-real-flow">' +
          '<div><span>01</span><strong>pandas_excel_students.xlsx</strong><small>real source workbook</small></div>' +
          '<i>→</i>' +
          '<div><span>02</span><strong>Pandas DataFrame</strong><small>rows + variables in memory</small></div>' +
          '<i>→</i>' +
          '<div><span>03</span><strong>class_analysis.xlsx</strong><small>new analytical output</small></div>' +
        '</div>' +
        codeHtml([
          'import pandas as pd',
          '',
          'df = pd.read_excel("pandas_excel_students.xlsx", sheet_name="Students")',
          'df["performance_index"] = (df["score"] * df["attendance"]).round(1)',
          '',
          'high = df.loc[df["score"] >= 80,',
          '              ["student_id", "group", "score", "attendance", "performance_index"]]',
          '',
          'summary = df.groupby("group", as_index=False)["score"].mean().round(1)',
          '',
          'with pd.ExcelWriter("class_analysis.xlsx") as writer:',
          '    high.to_excel(writer, sheet_name="High performance", index=False)',
          '    summary.to_excel(writer, sheet_name="Group summary", index=False)'
        ], 'real data analyst pipeline') +
      '</div>' +
      '<div class="p60-mini-table"><div><span>student_id</span><span>group</span><span>score</span><span>attendance</span><span>performance_index</span></div><div><b>S001</b><b>11A</b><b>82</b><b>0.88</b><b>72.2</b></div><div><b>S002</b><b>11B</b><b>91</b><b>0.95</b><b>86.5</b></div></div>' +
      '<div class="p60-real-actions"><a href="sandbox.html">Open the Python Sandbox to create the XLSX</a><a href="#practice">Open the Colab workshop →</a></div>' +
    '</section>';
  }

  function compareHtml() {
    return '<section class="p60-section p60-compare">' +
      '<div class="section-heading"><p class="eyebrow">THE KEY COMPARISON</p><h2>openpyxl and Pandas solve different layers of the same Excel problem.</h2></div>' +
      '<div class="p60-compare-grid">' +
        '<article><span>CLASS 1 · OPENPYXL</span><h3>Workbook structure</h3><p>Best when you care about worksheets, cells, templates and Excel-specific structure.</p>' +
        codeHtml(['wb = load_workbook("pandas_excel_students.xlsx")','ws = wb["Students"]','print(ws["A1"].value)'],'openpyxl') +
        '</article>' +
        '<article><span>CLASS 2 · PANDAS</span><h3>Tabular analysis</h3><p>Best when you care about observations, variables, filters, summaries and transformations.</p>' +
        codeHtml(['df = pd.read_excel("pandas_excel_students.xlsx")','print(df["score"].mean())','print(df.groupby("group")["score"].mean())'],'Pandas') +
        '</article>' +
      '</div>' +
    '</section>';
  }

  function pageHtml() {
    return '<section id="librariesPandasTheoryV60" class="p60-page">' +
      '<section class="p60-intro"><div><p class="eyebrow">TOPIC 04 · LIBRARIES → XLSX → PANDAS</p><h2>Python is not one tool. It is a language that connects many tools.</h2><p>Start broad enough to see what is possible. Then narrow the course to the two skills needed now: manipulating an Excel workbook and analyzing tabular data with Pandas.</p></div><div class="p60-intro-metrics"><div><strong>2</strong><span>classes</span></div><div><strong>8</strong><span>real application examples</span></div><div><strong>1</strong><span>shared XLSX</span></div></div></section>' +
      routeHtml() +
      applicationsHtml() +
      coreTheoryHtml() +
      compareHtml() +
      realPandasHtml() +
    '</section>';
  }

  function install() {
    if (document.getElementById('librariesPandasTheoryV60')) return true;

    const app = document.getElementById('main');
    const next = document.getElementById('practice');
    if (!app || app.classList.contains('hidden') || !next) return false;

    [
      document.getElementById('conceptSection'),
      document.querySelector('.theory-diagrams-section'),
      document.getElementById('syntaxSection'),
      document.getElementById('pitfallSection'),
      document.getElementById('pandasExcelTheoryV52'),
      document.querySelector('.pandas-excel-live-v53'),
      document.getElementById('pandasTwoClassTheoryV59'),
      document.getElementById('pandasGuidedTheoryV58'),
      document.getElementById('pandasGuidedTheoryV57')
    ].filter(Boolean).forEach(node => node.classList.add('p60-superseded'));

    next.insertAdjacentHTML('beforebegin', pageHtml());
    document.documentElement.dataset.librariesPandasTheory = VERSION;
    return true;
  }

  let scheduled = false;
  function schedule() {
    if (scheduled || document.getElementById('librariesPandasTheoryV60')) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      install();
    });
  }

  new MutationObserver(schedule).observe(document.documentElement, {
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:['class']
  });

  window.addEventListener('load', schedule, { once:true });
  schedule();
})();
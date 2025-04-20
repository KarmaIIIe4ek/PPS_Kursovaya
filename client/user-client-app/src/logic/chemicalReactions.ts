export type ChemicalReaction = {
  reactants: string[];
  products: string[];
  description: string;
  type: 'combination' | 'decomposition' | 'substitution' | 'double-replacement' | 'redox';
  duration: 'instant' | 'fast' | 'moderate' | 'slow' | 'very slow';
};

export const CHEMICAL_REACTIONS: ChemicalReaction[] = [
  // ============= Реакции соединения =============
  {
    reactants: ["2Na", "Cl₂"],
    products: ["2NaCl"],
    description: "Натрий + хлор",
    type: "combination",
    duration: "instant" // Бурная реакция с выделением тепла
  },
  {
    reactants: ["CaO", "H₂O"],
    products: ["Ca(OH)₂"],
    description: "Оксид кальция + вода",
    type: "combination",
    duration: "fast" // Гашение извести происходит быстро
  },
  {
    reactants: ["SO₃", "H₂O"],
    products: ["H₂SO₄"],
    description: "Оксид серы(VI) + вода",
    type: "combination",
    duration: "instant" // Очень бурная реакция
  },
  {
    reactants: ["2H₂", "O₂"],
    products: ["2H₂O"],
    description: "Водород + кислород",
    type: "combination",
    duration: "instant" // Взрывная реакция при поджигании
  },

  // ============= Реакции разложения =============
  {
    reactants: ["2HCl"],
    products: ["H₂", "Cl₂"],
    description: "Разложение соляной кислоты",
    type: "decomposition",
    duration: "slow" // Требуется электролиз или сильное нагревание
  },
  {
    reactants: ["Cu(OH)₂"],
    products: ["CuO", "H₂O"],
    description: "Разложение гидроксида меди(II)",
    type: "decomposition",
    duration: "moderate" // При нагревании разлагается за несколько минут
  },
  {
    reactants: ["H₂SO₄"],
    products: ["SO₃", "H₂O"],
    description: "Разложение серной кислоты",
    type: "decomposition",
    duration: "slow" // Требуется сильное нагревание
  },
  {
    reactants: ["Ca(OH)₂"],
    products: ["CaO", "H₂O"],
    description: "Разложение гидроксида кальция",
    type: "decomposition",
    duration: "slow" // Требуется длительное нагревание
  },

  // ============= Реакции замещения =============
  {
    reactants: ["Zn", "H₂SO₄"],
    products: ["ZnSO₄", "H₂↑"],
    description: "Цинк + серная кислота",
    type: "substitution",
    duration: "fast" // Активное выделение газа
  },
  {
    reactants: ["2Na", "2HCl"],
    products: ["2NaCl", "H₂↑"],
    description: "Натрий + соляная кислота",
    type: "substitution",
    duration: "fast" // Активное выделение газа
  },
  {
    reactants: ["2Na", "2H₂O"],
    products: ["2NaOH", "H₂↑"],
    description: "Натрий + вода",
    type: "substitution",
    duration: "instant" // Взрывная реакция
  },
  {
    reactants: ["Fe", "CuSO₄"],
    products: ["FeSO₄", "Cu↓"],
    description: "Железо + сульфат меди(II)",
    type: "substitution",
    duration: "moderate" // Заметное выделение меди за несколько минут
  },
  {
    reactants: ["Zn", "2HCl"],
    products: ["ZnCl₂", "H₂↑"],
    description: "Цинк + соляная кислота",
    type: "substitution",
    duration: "fast" // Активное выделение газа
  },
  {
    reactants: ["Na", "HCl"],
    products: ["NaCl", "H₂↑"],
    description: "Натрий + соляная кислота",
    type: "substitution",
    duration: "instant" // Очень бурная реакция
  },
  {
    reactants: ["Fe", "2HCl"],
    products: ["FeCl₂", "H₂↑"],
    description: "Железо + соляная кислота",
    type: "substitution",
    duration: "slow" // Медленное выделение газа
  },
  {
    reactants: ["Zn", "CuSO₄"],
    products: ["ZnSO₄", "Cu↓"],
    description: "Цинк + сульфат меди(II)",
    type: "substitution",
    duration: "fast" // Быстрое осаждение меди
  },

  // ============= Реакции обмена =============
  {
    reactants: ["NaOH", "HCl"],
    products: ["NaCl", "H₂O"],
    description: "Гидроксид натрия + соляная кислота",
    type: "double-replacement",
    duration: "instant" // Реакция нейтрализации происходит мгновенно
  },
  {
    reactants: ["CuSO₄", "2NaOH"],
    products: ["Na₂SO₄", "Cu(OH)₂↓"],
    description: "Сульфат меди(II) + гидроксид натрия",
    type: "double-replacement",
    duration: "fast" // Быстрое образование осадка
  },
  {
    reactants: ["CuSO₄", "2KOH"],
    products: ["K₂SO₄", "Cu(OH)₂↓"],
    description: "Сульфат меди(II) + гидроксид калия",
    type: "double-replacement",
    duration: "fast" // Быстрое образование осадка
  },
  {
    reactants: ["H₂SO₄", "2NaOH"],
    products: ["Na₂SO₄", "2H₂O"],
    description: "Серная кислота + гидроксид натрия",
    type: "double-replacement",
    duration: "instant" // Реакция нейтрализации
  },
  {
    reactants: ["H₂SO₄", "2KOH"],
    products: ["K₂SO₄", "2H₂O"],
    description: "Серная кислота + гидроксид калия",
    type: "double-replacement",
    duration: "instant" // Реакция нейтрализации
  },
  {
    reactants: ["HCl", "KOH"],
    products: ["KCl", "H₂O"],
    description: "Соляная кислота + гидроксид калия",
    type: "double-replacement",
    duration: "instant" // Реакция нейтрализации
  },
  {
    reactants: ["Cu(OH)₂", "H₂SO₄"],
    products: ["CuSO₄", "2H₂O"],
    description: "Гидроксид меди(II) + серная кислота",
    type: "double-replacement",
    duration: "moderate" // Требуется некоторое время на растворение
  },
  {
    reactants: ["ZnSO₄", "2NaOH"],
    products: ["Na₂SO₄", "Zn(OH)₂↓"],
    description: "Сульфат цинка + гидроксид натрия",
    type: "double-replacement",
    duration: "fast" // Быстрое образование осадка
  },
  {
    reactants: ["FeSO₄", "2NaOH"],
    products: ["Na₂SO₄", "Fe(OH)₂↓"],
    description: "Сульфат железа(II) + гидроксид натрия",
    type: "double-replacement",
    duration: "moderate" // Образование осадка за несколько минут
  },

  // ============= Окислительно-восстановительные =============
  {
    reactants: ["Zn", "CuO"],
    products: ["ZnO", "Cu↓"],
    description: "Цинк + оксид меди(II)",
    type: "redox",
    duration: "moderate" // Требуется нагревание
  },
  {
    reactants: ["H₂", "CuO"],
    products: ["Cu↓", "H₂O"],
    description: "Водород + оксид меди(II)",
    type: "redox",
    duration: "moderate" // Протекает при нагревании
  },
  {
    reactants: ["Na", "H₂"],
    products: ["NaH"],
    description: "Натрий + водород",
    type: "combination",
    duration: "moderate" // Требуется нагревание
  },

  // ============= Дополнительные реакции разложения =============
  {
    reactants: ["NaH"],
    products: ["Na", "H₂"],
    description: "Разложение гидрида натрия",
    type: "decomposition",
    duration: "moderate" // При нагревании
  },
  {
    reactants: ["2NaCl"],
    products: ["2Na", "Cl₂"],
    description: "Электролиз хлорида натрия",
    type: "decomposition",
    duration: "slow" // Требуется электролиз
  },

  // ============= Дополнительные реакции замещения =============
  {
    reactants: ["2Na", "2H₂O"],
    products: ["2NaOH", "H₂↑"],
    description: "Натрий + вода",
    type: "substitution",
    duration: "instant" // Бурная реакция
  },
  {
    reactants: ["Zn", "2NaOH"],
    products: ["Na₂ZnO₂", "H₂↑"],
    description: "Цинк + гидроксид натрия",
    type: "substitution",
    duration: "slow" // Медленное выделение газа
  },

  // ============= Дополнительные реакции обмена =============
  {
    reactants: ["ZnCl₂", "2NaOH"],
    products: ["2NaCl", "Zn(OH)₂↓"],
    description: "Хлорид цинка + гидроксид натрия",
    type: "double-replacement",
    duration: "fast" // Образование осадка
  },
  {
    reactants: ["Cu(OH)₂", "2HCl"],
    products: ["CuCl₂", "2H₂O"],
    description: "Гидроксид меди(II) + соляная кислота",
    type: "double-replacement",
    duration: "moderate" // Требуется время на растворение
  },
  {
    reactants: ["Zn(OH)₂", "H₂SO₄"],
    products: ["ZnSO₄", "2H₂O"],
    description: "Гидроксид цинка + серная кислота",
    type: "double-replacement",
    duration: "moderate" // Постепенное растворение
  },

  // ============= Дополнительные окислительно-восстановительные реакции =============
  {
    reactants: ["Zn", "2HCl"],
    products: ["ZnCl₂", "H₂↑"],
    description: "Цинк + соляная кислота",
    type: "redox",
    duration: "fast" // Активное выделение газа
  },
  {
    reactants: ["Cu", "2H₂SO₄"],
    products: ["CuSO₄", "SO₂↑", "2H₂O"],
    description: "Медь + концентрированная серная кислота",
    type: "redox",
    duration: "moderate" // Требуется нагревание
  },
  {
    reactants: ["4HCl", "O₂"],
    products: ["2Cl₂", "2H₂O"],
    description: "Каталитическое окисление соляной кислоты",
    type: "redox",
    duration: "slow" // Каталитический процесс
  },
  {
    reactants: ["3Zn", "8HNO₃"],
    products: ["3Zn(NO₃)₂", "2NO↑", "4H₂O"],
    description: "Цинк + разбавленная азотная кислота",
    type: "redox",
    duration: "fast" // Активная реакция
  }
];
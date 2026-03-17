const TABELA_ALIMENTOS = {
  // =====================
  // 🍚 CARBOIDRATOS
  // =====================
  "arroz branco cozido": { proteina: 2.7, gordura: 0.3, carbo: 28 },
  "arroz integral cozido": { proteina: 2.5, gordura: 0.8, carbo: 23 },
  "arroz parboilizado cozido": { proteina: 2.6, gordura: 0.3, carbo: 28 },
  "arroz jasmine cozido": { proteina: 2.7, gordura: 0.3, carbo: 28 },
  "arroz basmati cozido": { proteina: 2.6, gordura: 0.3, carbo: 28 },
  "arroz 7 graos cozido": { proteina: 3.0, gordura: 1.0, carbo: 22 },

  "feijao carioca cozido": { proteina: 5.0, gordura: 0.5, carbo: 14 },
  "feijao preto cozido": { proteina: 4.5, gordura: 0.5, carbo: 13 },
  "feijao branco cozido": { proteina: 4.8, gordura: 0.5, carbo: 14 },
  "feijao fradinho cozido": { proteina: 5.0, gordura: 0.5, carbo: 13 },
  "feijao vermelho cozido": { proteina: 4.7, gordura: 0.5, carbo: 14 },

  "macarrao comum cozido": { proteina: 5.0, gordura: 1.0, carbo: 25 },
  "macarrao integral cozido": { proteina: 6.0, gordura: 1.2, carbo: 23 },
  "macarrao arroz cozido": { proteina: 4.0, gordura: 0.5, carbo: 28 },
  "macarrao sem gluten cozido": { proteina: 5.0, gordura: 1.0, carbo: 24 },

  "cuscuz milho cozido": { proteina: 3.0, gordura: 0.5, carbo: 27 },
  "cuscuz nordestino cozido": { proteina: 3.0, gordura: 0.5, carbo: 28 },
  "cuscuz marroquino cozido": { proteina: 3.5, gordura: 0.3, carbo: 23 },
  "cuscuz integral cozido": { proteina: 4.0, gordura: 0.8, carbo: 22 },

  "batata inglesa cozida": { proteina: 2.0, gordura: 0.1, carbo: 17 },
  "batata doce cozida": { proteina: 1.6, gordura: 0.1, carbo: 20 },
  "mandioca cozida": { proteina: 1.4, gordura: 0.3, carbo: 38 },

  "pao frances": { proteina: 9.0, gordura: 1.0, carbo: 50 },
  "pao integral": { proteina: 9.0, gordura: 3.0, carbo: 45 },
  "pao forma branco": { proteina: 7.5, gordura: 3.0, carbo: 50 },

  "tapioca tradicional": { proteina: 0.5, gordura: 0, carbo: 28 },
  "tapioca integral": { proteina: 1.5, gordura: 0.2, carbo: 27 },

  "aveia flocos finos": { proteina: 13, gordura: 7, carbo: 59 },
  "aveia em flocos": { proteina: 13, gordura: 7, carbo: 60 },
  "aveia farinha": { proteina: 13, gordura: 7, carbo: 60 },
  "aveia farelo": { proteina: 17, gordura: 7, carbo: 66 },

  "flocao de milho tradicional": { proteina: 7, gordura: 1, carbo: 78 },
  "flocao de milho integral": { proteina: 8, gordura: 2, carbo: 74 },

  // =====================
  // 🍗 PROTEÍNAS
  // =====================
  "peito de frango grelhado": { proteina: 31, gordura: 3.6, carbo: 0 },
  "coxa sobrecoxa frango sem pele": { proteina: 28, gordura: 4.0, carbo: 0 },

  "patinho moido": { proteina: 28, gordura: 6, carbo: 0 },
  "coxao mole": { proteina: 27, gordura: 5.5, carbo: 0 },
  "coxao duro": { proteina: 28, gordura: 5, carbo: 0 },
  "lagarto": { proteina: 29, gordura: 4, carbo: 0 },
  "musculo": { proteina: 27, gordura: 4, carbo: 0 },
  "alcatra limpa": { proteina: 31, gordura: 6, carbo: 0 },

  "lombo suino": { proteina: 25, gordura: 3.5, carbo: 0 },
  "file mignon suino": { proteina: 26, gordura: 4, carbo: 0 },

  "ovo mexido": { proteina: 13, gordura: 10, carbo: 1 },
  "ovo cozido": { proteina: 13, gordura: 10, carbo: 1 },
  "omelete": { proteina: 13, gordura: 10, carbo: 1 },
  "ovo poche": { proteina: 13, gordura: 10, carbo: 1 },
  "ovo frito agua": { proteina: 13, gordura: 10, carbo: 1 },
  "ovo frito azeite": { proteina: 13, gordura: 11, carbo: 1 },

  // =====================
  // 🐟 PEIXES
  // =====================
  "filé de tilapia": { proteina: 26, gordura: 2, carbo: 0 },
  "filé de merluza": { proteina: 24, gordura: 1, carbo: 0 },
  "filé de linguado": { proteina: 22, gordura: 1, carbo: 0 },
  "filé de atum fresco": { proteina: 23, gordura: 1, carbo: 0 },

  // =====================
  // 🥑 GORDURAS
  // =====================
  "azeite de oliva extra virgem": { proteina: 0, gordura: 100, carbo: 0 },
  "abacate": { proteina: 2, gordura: 15, carbo: 9 },
  "castanha do para": { proteina: 14, gordura: 66, carbo: 12 },
  "castanha de caju": { proteina: 18, gordura: 46, carbo: 30 },
  "amendoim": { proteina: 26, gordura: 49, carbo: 16 },
  "amendoas": { proteina: 21, gordura: 50, carbo: 22 },
  "nozes": { proteina: 15, gordura: 65, carbo: 14 },
  "pasta de amendoim": { proteina: 25, gordura: 50, carbo: 20 },

  // =====================
  // 🥦 LEGUMES
  // =====================
  "cenoura cozida": { proteina: 0.9, gordura: 0, carbo: 10 },
  "brocolis cozido": { proteina: 2.8, gordura: 0.4, carbo: 7 },
  "couve-flor cozida": { proteina: 2.0, gordura: 0.3, carbo: 5 },
  "abobrinha cozida": { proteina: 1.2, gordura: 0.2, carbo: 3 },
  "abobora cozida": { proteina: 1.1, gordura: 0.1, carbo: 7 },
  "berinjela cozida": { proteina: 1.0, gordura: 0.2, carbo: 6 },
  "espinafre cozido": { proteina: 2.9, gordura: 0.4, carbo: 3.6 },
  "chuchu cozido": { proteina: 0.8, gordura: 0.1, carbo: 4 },
  "quiabo cozido": { proteina: 1.9, gordura: 0.1, carbo: 7 },
  "vagem cozida": { proteina: 2.0, gordura: 0.1, carbo: 7 },
  "pepino cru": { proteina: 0.6, gordura: 0.1, carbo: 3.6 },
  "beterraba cozida": { proteina: 1.6, gordura: 0.2, carbo: 10 },
  "pimentao cru": { proteina: 1.0, gordura: 0.1, carbo: 6 },
  "couve cozida": { proteina: 3.0, gordura: 0.2, carbo: 6 },

  // =====================
  // 🍎 FRUTAS
  // =====================
  "banana": { proteina: 1.3, gordura: 0.3, carbo: 23 },
  "maca": { proteina: 0.3, gordura: 0.2, carbo: 14 },
  "mamão": { proteina: 0.5, gordura: 0.1, carbo: 11 },
  "laranja": { proteina: 0.9, gordura: 0.1, carbo: 12 },
  "abacaxi": { proteina: 0.5, gordura: 0.1, carbo: 13 },
  "melancia": { proteina: 0.6, gordura: 0.2, carbo: 8 },
  "melao": { proteina: 0.5, gordura: 0.1, carbo: 8 },
  "manga": { proteina: 0.8, gordura: 0.2, carbo: 15 },
  "morango": { proteina: 0.8, gordura: 0.4, carbo: 7 },
  "uva": { proteina: 0.6, gordura: 0.2, carbo: 17 },
  "goiaba": { proteina: 2.6, gordura: 0.6, carbo: 14 },
  "pera": { proteina: 0.4, gordura: 0.1, carbo: 15 },
  "kiwi": { proteina: 1.1, gordura: 0.5, carbo: 15 },
  "caju": { proteina: 1.9, gordura: 0.3, carbo: 12 },
  "limao": { proteina: 0.3, gordura: 0.1, carbo: 6 },
  "acerola": { proteina: 0.4, gordura: 0.1, carbo: 7 },
  "tangerina": { proteina: 0.7, gordura: 0.1, carbo: 13 },

  // =====================
  // 🌱 SEMENTES
  // =====================
  "chia": { proteina: 17, gordura: 31, carbo: 42 },
  "linhaca": { proteina: 18, gordura: 42, carbo: 29 },
  "semente de abobora": { proteina: 30, gordura: 49, carbo: 10 },
  "semente de girassol": { proteina: 21, gordura: 51, carbo: 20 },
  "gergelim": { proteina: 18, gordura: 50, carbo: 23 },
  "quinoa": { proteina: 14, gordura: 6, carbo: 64 },

  // =====================
  // 🧃 OUTROS
  // =====================
  "peito de peru": { proteina: 29, gordura: 1, carbo: 0 },
  "iogurte natural": { proteina: 3.5, gordura: 3.5, carbo: 4 },
  "leite integral": { proteina: 3.3, gordura: 3.5, carbo: 4.8 },
  "leite desnatado": { proteina: 3.4, gordura: 0.1, carbo: 5 },
  "leite sem lactose": { proteina: 3.3, gordura: 3.5, carbo: 4.8 },
  "leite de amendoas": { proteina: 0.5, gordura: 2.5, carbo: 0.5 },
  "leite de soja": { proteina: 3.6, gordura: 1.5, carbo: 3.5 },
  "ricota": { proteina: 11, gordura: 4, carbo: 3 },
  "queijo minas": { proteina: 18, gordura: 15, carbo: 1 },
  "queijo mucarela": { proteina: 22, gordura: 22, carbo: 2 },
  "whey protein": { proteina: 80, gordura: 5, carbo: 10 },
  "mel": { proteina: 0.3, gordura: 0, carbo: 82 }
};

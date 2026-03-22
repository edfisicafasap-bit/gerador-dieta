const TABELA_ALIMENTOS = {
  // =====================
  // 🍚 CARBOIDRATOS (Grupo: Sempre Cozidos)
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

  "macarrao comum (semola) cozido": { proteina: 5.0, gordura: 1.0, carbo: 25 },
  "macarrao integral cozido": { proteina: 6.0, gordura: 1.2, carbo: 23 },
  "macarrao de arroz cozido": { proteina: 4.0, gordura: 0.5, carbo: 28 },
  "macarrao sem gluten cozido": { proteina: 5.0, gordura: 1.0, carbo: 24 },

  "cuscuz de milho cozido": { proteina: 3.0, gordura: 0.5, carbo: 27 },
  "cuscuz nordestino cozido": { proteina: 3.0, gordura: 0.5, carbo: 28 },
  "cuscuz marroquino cozido": { proteina: 3.5, gordura: 0.3, carbo: 23 },
  "cuscuz integral cozido": { proteina: 4.0, gordura: 0.8, carbo: 22 },

  // =====================
  // 🥔 BATATAS/MANDIOCA (Grupo: Nome Exato conforme App)
  // =====================
  "batata inglesa cozida": { proteina: 2.0, gordura: 0.1, carbo: 17 },
  "batata inglesa assada": { proteina: 2.5, gordura: 0.1, carbo: 21 },
  "batata inglesa pure": { proteina: 2.0, gordura: 4.0, carbo: 15 },
  "batata inglesa saute": { proteina: 2.0, gordura: 5.0, carbo: 17 },
  "batata inglesa rustica forno/airfryer": { proteina: 2.5, gordura: 1.0, carbo: 21 },
  "batata inglesa chips forno/airfryer": { proteina: 3.0, gordura: 2.0, carbo: 30 },
  "batata inglesa frita na airfryer": { proteina: 2.5, gordura: 2.0, carbo: 25 },

  "batata doces cozida": { proteina: 1.6, gordura: 0.1, carbo: 20 },
  "batata doces assada": { proteina: 2.0, gordura: 0.1, carbo: 25 },
  "batata doces pure": { proteina: 1.8, gordura: 3.0, carbo: 18 },
  "batata doces saute": { proteina: 1.8, gordura: 4.0, carbo: 20 },
  "batata doces rustica forno/airfryer": { proteina: 2.0, gordura: 1.0, carbo: 25 },
  "batata doces frita na airfryer": { proteina: 2.0, gordura: 2.0, carbo: 28 },

  "mandioca cozida": { proteina: 1.4, gordura: 0.3, carbo: 38 },
  "mandioca assada": { proteina: 1.5, gordura: 0.3, carbo: 40 },
  "mandioca pure": { proteina: 1.5, gordura: 4.0, carbo: 35 },
  "mandioca saute": { proteina: 1.5, gordura: 5.0, carbo: 38 },
  "mandioca rustica forno/airfryer": { proteina: 1.5, gordura: 1.0, carbo: 40 },
  "mandioca frita na airfryer": { proteina: 1.5, gordura: 2.0, carbo: 42 },

  // =====================
  // 🍞 PÃES, TAPIOCA, AVEIA (Grupo: Nome Exato)
  // =====================
  "pao frances": { proteina: 9.0, gordura: 1.0, carbo: 50 },
  "pao forma branco": { proteina: 7.5, gordura: 3.0, carbo: 50 },
  "pao forma integral": { proteina: 9.0, gordura: 3.5, carbo: 43 },
  "pao integral com graos": { proteina: 10, gordura: 5.0, carbo: 40 },
  "pao sirio": { proteina: 9.0, gordura: 1.0, carbo: 55 },
  "pao de aveia": { proteina: 10, gordura: 4.0, carbo: 45 },

  "tapioca tradicional": { proteina: 0.5, gordura: 0, carbo: 28 },
  "tapioca hidratada": { proteina: 0.5, gordura: 0, carbo: 28 },
  "tapioca integral": { proteina: 1.5, gordura: 0.2, carbo: 27 },

  "aveia em flocos finos": { proteina: 13, gordura: 7, carbo: 59 },
  "aveia em flocos": { proteina: 13, gordura: 7, carbo: 60 },
  "aveia farinha": { proteina: 13, gordura: 7, carbo: 60 },
  "aveia farelo": { proteina: 17, gordura: 7, carbo: 66 },

  "flocao de milho tradicional": { proteina: 7, gordura: 1, carbo: 78 },
  "flocao de milho integral": { proteina: 8, gordura: 2, carbo: 74 },

  // =====================
  // 🍗 PROTEÍNAS (Busca por "Subtipo")
  // =====================
  "file de peito": { proteina: 31, gordura: 3.6, carbo: 0 },
  "coxa e sobrecoxa (sem pele)": { proteina: 28, gordura: 4.0, carbo: 0 },

  "patinho": { proteina: 28, gordura: 6, carbo: 0 },
  "coxao mole": { proteina: 27, gordura: 5.5, carbo: 0 },
  "coxao duro": { proteina: 28, gordura: 5, carbo: 0 },
  "lagarto": { proteina: 29, gordura: 4, carbo: 0 },
  "musculo": { proteina: 27, gordura: 4, carbo: 0 },
  "alcatra limpa": { proteina: 31, gordura: 6, carbo: 0 },

  "lombo suino": { proteina: 25, gordura: 3.5, carbo: 0 },
  "file mignon suino": { proteina: 26, gordura: 4, carbo: 0 },

  // =====================
  // 🍳 OVOS (Nome Exato do App)
  // =====================
  "ovos mexidos": { proteina: 13, gordura: 10, carbo: 1 },
  "ovos cozidos": { proteina: 13, gordura: 10, carbo: 1 },
  "ovos omelete": { proteina: 13, gordura: 10, carbo: 1 },
  "ovos poche": { proteina: 13, gordura: 10, carbo: 1 },
  "ovos frito na agua": { proteina: 13, gordura: 10, carbo: 1 },
  "ovos frito com azeite": { proteina: 13, gordura: 15, carbo: 1 },

  // =====================
  // 🐟 PEIXES (Nome Exato do App)
  // =====================
  "file de tilapia": { proteina: 26, gordura: 2, carbo: 0 },
  "file de merluza": { proteina: 24, gordura: 1, carbo: 0 },
  "file de linguado": { proteina: 22, gordura: 1, carbo: 0 },
  "file de atum fresco": { proteina: 23, gordura: 1, carbo: 0 },

  // =====================
  // 🥦 FRUTAS, LEGUMES, GORDURAS, SEMENTES (Nome Exato)
  // =====================
  "abacate": { proteina: 2, gordura: 15, carbo: 9 },
  "azeite de oliva extra virgem": { proteina: 0, gordura: 100, carbo: 0 },
  "castanha-do-para": { proteina: 14, gordura: 66, carbo: 12 },
  "castanha de caju": { proteina: 18, gordura: 46, carbo: 30 },
  "amendoas": { proteina: 21, gordura: 50, carbo: 22 },
  "nozes": { proteina: 15, gordura: 65, carbo: 14 },
  "amendoim": { proteina: 26, gordura: 49, carbo: 16 },
  "pasta de amendoim": { proteina: 25, gordura: 50, carbo: 20 },

  "cenoura": { proteina: 0.9, gordura: 0.1, carbo: 10 },
  "brocolis": { proteina: 2.8, gordura: 0.4, carbo: 7 },
  "couve-flor": { proteina: 2.0, gordura: 0.3, carbo: 5 },
  "abobrinha": { proteina: 1.2, gordura: 0.2, carbo: 3 },
  "abobora": { proteina: 1.1, gordura: 0.1, carbo: 7 },
  "berinjela": { proteina: 1.0, gordura: 0.2, carbo: 6 },
  "espinafre": { proteina: 2.9, gordura: 0.4, carbo: 3.6 },
  "chuchu": { proteina: 0.8, gordura: 0.1, carbo: 4 },
  "quiabo": { proteina: 1.9, gordura: 0.1, carbo: 7 },
  "vagem": { proteina: 2.0, gordura: 0.1, carbo: 7 },
  "pepino": { proteina: 0.6, gordura: 0.1, carbo: 3.6 },
  "beterraba": { proteina: 1.6, gordura: 0.2, carbo: 10 },
  "pimentao": { proteina: 1.0, gordura: 0.1, carbo: 6 },
  "couve": { proteina: 3.0, gordura: 0.2, carbo: 6 },

  "banana": { proteina: 1.3, gordura: 0.3, carbo: 23 },
  "maca": { proteina: 0.3, gordura: 0.2, carbo: 14 },
  "mamao": { proteina: 0.5, gordura: 0.1, carbo: 11 },
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

  "chia": { proteina: 17, gordura: 31, carbo: 42 },
  "linhaca": { proteina: 18, gordura: 42, carbo: 29 },
  "semente de abobora": { proteina: 30, gordura: 49, carbo: 10 },
  "semente de girassol": { proteina: 21, gordura: 51, carbo: 20 },
  "gergelim": { proteina: 18, gordura: 50, carbo: 23 },
  "quinoa": { proteina: 14, gordura: 6, carbo: 64 },

  // =====================
  // 🧃 OUTROS (Nome Exato do App)
  // =====================
  "peito de peru": { proteina: 29, gordura: 1, carbo: 0 },
  "iogurte natural": { proteina: 3.5, gordura: 3.5, carbo: 4 },
  "leite integral": { proteina: 3.3, gordura: 3.5, carbo: 4.8 },
  "leite desnatado": { proteina: 3.4, gordura: 0.1, carbo: 5 },
  "leite s/lactose": { proteina: 3.3, gordura: 3.5, carbo: 4.8 },
  "leite de amendoas": { proteina: 0.5, gordura: 2.5, carbo: 0.5 },
  "leite de soja": { proteina: 3.6, gordura: 1.5, carbo: 3.5 },
  "ricota": { proteina: 11, gordura: 4, carbo: 3 },
  "queijo minas": { proteina: 18, gordura: 15, carbo: 1 },
  "queijo mucarela": { proteina: 22, gordura: 22, carbo: 2 },
  "whey protein": { proteina: 80, gordura: 5, carbo: 10 },
  "mel": { proteina: 0.3, gordura: 0, carbo: 82 }
};

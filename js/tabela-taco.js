const TABELA_ALIMENTOS = {
  // =====================
  // 🍚 CARBOIDRATOS (Grupo: Sempre Cozidos)
  // =====================
  "arroz branco cozido": { proteina: 2.7, gordura: 0.3, carbo: 28, unidade: "g" },
  "arroz integral cozido": { proteina: 2.5, gordura: 0.8, carbo: 23, unidade: "g" },
  "arroz parboilizado cozido": { proteina: 2.6, gordura: 0.3, carbo: 28, unidade: "g" },
  "arroz jasmine cozido": { proteina: 2.7, gordura: 0.3, carbo: 28, unidade: "g" },
  "arroz basmati cozido": { proteina: 2.6, gordura: 0.3, carbo: 28, unidade: "g" },
  "arroz 7 graos cozido": { proteina: 3.0, gordura: 1.0, carbo: 22, unidade: "g" },

  "feijao carioca cozido": { proteina: 5.0, gordura: 0.5, carbo: 14, unidade: "g" },
  "feijao preto cozido": { proteina: 4.5, gordura: 0.5, carbo: 13, unidade: "g" },
  "feijao branco cozido": { proteina: 4.8, gordura: 0.5, carbo: 14, unidade: "g" },
  "feijao fradinho cozido": { proteina: 5.0, gordura: 0.5, carbo: 13, unidade: "g" },
  "feijao vermelho cozido": { proteina: 4.7, gordura: 0.5, carbo: 14, unidade: "g" },

  "macarrao comum (semola) cozido": { proteina: 5.0, gordura: 1.0, carbo: 25, unidade: "g" },
  "macarrao integral cozido": { proteina: 6.0, gordura: 1.2, carbo: 23, unidade: "g" },
  "macarrao de arroz cozido": { proteina: 4.0, gordura: 0.5, carbo: 28, unidade: "g" },
  "macarrao sem gluten cozido": { proteina: 5.0, gordura: 1.0, carbo: 24, unidade: "g" },

  "cuscuz de milho cozido": { proteina: 3.0, gordura: 0.5, carbo: 27, unidade: "g" },
  "cuscuz nordestino cozido": { proteina: 3.0, gordura: 0.5, carbo: 28, unidade: "g" },
  "cuscuz marroquino cozido": { proteina: 3.5, gordura: 0.3, carbo: 23, unidade: "g" },
  "cuscuz integral cozido": { proteina: 4.0, gordura: 0.8, carbo: 22, unidade: "g" },

  // =====================
  // 🥔 BATATAS/MANDIOCA
  // =====================
  "batata inglesa cozida": { proteina: 2.0, gordura: 0.1, carbo: 17, unidade: "g" },
  "batata inglesa assada": { proteina: 2.5, gordura: 0.1, carbo: 21, unidade: "g" },
  "batata inglesa pure": { proteina: 2.0, gordura: 4.0, carbo: 15, unidade: "g" },
  "batata inglesa saute": { proteina: 2.0, gordura: 5.0, carbo: 17, unidade: "g" },
  "batata inglesa rustica forno/airfryer": { proteina: 2.5, gordura: 1.0, carbo: 21, unidade: "g" },
  "batata inglesa chips forno/airfryer": { proteina: 3.0, gordura: 2.0, carbo: 30, unidade: "g" },
  "batata inglesa frita na airfryer": { proteina: 2.5, gordura: 2.0, carbo: 25, unidade: "g" },

  "batata doces cozida": { proteina: 1.6, gordura: 0.1, carbo: 20, unidade: "g" },
  "batata doces assada": { proteina: 2.0, gordura: 0.1, carbo: 25, unidade: "g" },
  "batata doces pure": { proteina: 1.8, gordura: 3.0, carbo: 18, unidade: "g" },
  "batata doces saute": { proteina: 1.8, gordura: 4.0, carbo: 20, unidade: "g" },
  "batata doces rustica forno/airfryer": { proteina: 2.0, gordura: 1.0, carbo: 25, unidade: "g" },
  "batata doces frita na airfryer": { proteina: 2.0, gordura: 2.0, carbo: 28, unidade: "g" },

  "mandioca cozida": { proteina: 1.4, gordura: 0.3, carbo: 38, unidade: "g" },
  "mandioca assada": { proteina: 1.5, gordura: 0.3, carbo: 40, unidade: "g" },
  "mandioca pure": { proteina: 1.5, gordura: 4.0, carbo: 35, unidade: "g" },
  "mandioca saute": { proteina: 1.5, gordura: 5.0, carbo: 38, unidade: "g" },
  "mandioca rustica forno/airfryer": { proteina: 1.5, gordura: 1.0, carbo: 40, unidade: "g" },
  "mandioca frita na airfryer": { proteina: 1.5, gordura: 2.0, carbo: 42, unidade: "g" },

  // =====================
  // 🍞 PAES, TAPIOCA, AVEIA (Conversão para UN)
  // =====================
  "pao frances": { proteina: 4.5, gordura: 0.5, carbo: 25, unidade: "un", pesoReferencia: 50 },
  "pao forma branco": { proteina: 3.7, gordura: 1.5, carbo: 25, unidade: "un", pesoReferencia: 50 }, // 2 fatias
  "pao forma integral": { proteina: 4.5, gordura: 1.7, carbo: 21.5, unidade: "un", pesoReferencia: 50 }, // 2 fatias
  "pao integral com graos": { proteina: 5.0, gordura: 2.5, carbo: 20, unidade: "un", pesoReferencia: 50 },
  "pao sirio": { proteina: 4.5, gordura: 0.5, carbo: 27.5, unidade: "un", pesoReferencia: 50 },
  "pao de aveia": { proteina: 5.0, gordura: 2.0, carbo: 22.5, unidade: "un", pesoReferencia: 50 },

  "tapioca tradicional": { proteina: 0.5, gordura: 0, carbo: 28, unidade: "g" },
  "tapioca hidratada": { proteina: 0.5, gordura: 0, carbo: 28, unidade: "g" },
  "tapioca integral": { proteina: 1.5, gordura: 0.2, carbo: 27, unidade: "g" },

  "aveia em flocos finos": { proteina: 13, gordura: 7, carbo: 59, unidade: "g" },
  "aveia em flocos": { proteina: 13, gordura: 7, carbo: 60, unidade: "g" },
  "aveia farinha": { proteina: 13, gordura: 7, carbo: 60, unidade: "g" },
  "aveia farelo": { proteina: 17, gordura: 7, carbo: 66, unidade: "g" },

  "flocao de milho tradicional": { proteina: 7, gordura: 1, carbo: 78, unidade: "g" },
  "flocao de milho integral": { proteina: 8, gordura: 2, carbo: 74, unidade: "g" },

  // =====================
  // 🍗 PROTEINAS
  // =====================
  "file de peito": { proteina: 31, gordura: 3.6, carbo: 0, unidade: "g" },
  "coxa e sobrecoxa (sem pele)": { proteina: 28, gordura: 4.0, carbo: 0, unidade: "g" },
  "patinho": { proteina: 28, gordura: 6, carbo: 0, unidade: "g" },
  "coxao mole": { proteina: 27, gordura: 5.5, carbo: 0, unidade: "g" },
  "coxao duro": { proteina: 28, gordura: 5, carbo: 0, unidade: "g" },
  "lagarto": { proteina: 29, gordura: 4, carbo: 0, unidade: "g" },
  "musculo": { proteina: 27, gordura: 4, carbo: 0, unidade: "g" },
  "alcatra limpa": { proteina: 31, gordura: 6, carbo: 0, unidade: "g" },
  "lombo suino": { proteina: 25, gordura: 3.5, carbo: 0, unidade: "g" },
  "file mignon suino": { proteina: 26, gordura: 4, carbo: 0, unidade: "g" },

  // OVOS (Convertidos para UN - Ref 50g por ovo)
  "ovos mexidos": { proteina: 6.5, gordura: 5, carbo: 0.5, unidade: "un", pesoReferencia: 50 },
  "ovos cozidos": { proteina: 6.5, gordura: 5, carbo: 0.5, unidade: "un", pesoReferencia: 50 },
  "ovos omelete": { proteina: 6.5, gordura: 5, carbo: 0.5, unidade: "un", pesoReferencia: 50 },
  "ovos poche": { proteina: 6.5, gordura: 5, carbo: 0.5, unidade: "un", pesoReferencia: 50 },
  "ovos frito na agua": { proteina: 6.5, gordura: 5, carbo: 0.5, unidade: "un", pesoReferencia: 50 },
  "ovos frito com azeite": { proteina: 6.5, gordura: 7.5, carbo: 0.5, unidade: "un", pesoReferencia: 50 },
  "clara de ovos": { proteina: 3.6, gordura: 0, carbo: 0.2, unidade: "un", pesoReferencia: 35 },

  "file de tilapia": { proteina: 26, gordura: 2, carbo: 0, unidade: "g" },
  "file de merluza": { proteina: 24, gordura: 1, carbo: 0, unidade: "g" },
  "file de atum fresco": { proteina: 23, gordura: 1, carbo: 0, unidade: "g" },

  // =====================
  // 🥦 FRUTAS (Conversão para UN)
  // =====================
  "abacate": { proteina: 2, gordura: 15, carbo: 9, unidade: "g" },
  "azeite de oliva extra virgem": { proteina: 0, gordura: 100, carbo: 0, unidade: "g" },
  
  "cenoura": { proteina: 0.9, gordura: 0.1, carbo: 10, unidade: "g" },
  "brocolis": { proteina: 2.8, gordura: 0.4, carbo: 7, unidade: "g" },

  "banana": { proteina: 1.3, gordura: 0.3, carbo: 23, unidade: "un", pesoReferencia: 100 },
  "maca": { proteina: 0.3, gordura: 0.2, carbo: 14, unidade: "un", pesoReferencia: 100 },
  "laranja": { proteina: 0.9, gordura: 0.1, carbo: 12, unidade: "un", pesoReferencia: 150 },
  "pera": { proteina: 0.4, gordura: 0.1, carbo: 15, unidade: "un", pesoReferencia: 150 },
  "kiwi": { proteina: 1.1, gordura: 0.5, carbo: 15, unidade: "un", pesoReferencia: 80 },

  // =====================
  // 🧃 LIQUIDOS E LATICINIOS (Conversão para ML)
  // =====================
  "iogurte natural": { proteina: 3.5, gordura: 3.5, carbo: 4, unidade: "ml" },
  "leite integral": { proteina: 3.3, gordura: 3.5, carbo: 4.8, unidade: "ml" },
  "leite desnatado": { proteina: 3.4, gordura: 0.1, carbo: 5, unidade: "ml" },
  "leite s/lactose": { proteina: 3.3, gordura: 3.5, carbo: 4.8, unidade: "ml" },
  "suco de uva integral": { proteina: 0, gordura: 0, carbo: 15, unidade: "ml" },
  "suco de laranja": { proteina: 0.7, gordura: 0.2, carbo: 10, unidade: "ml" },

  "queijo minas": { proteina: 18, gordura: 15, carbo: 1, unidade: "g" },
  "queijo mucarela": { proteina: 22, gordura: 22, carbo: 2, unidade: "g" },
  "whey protein": { proteina: 24, gordura: 1.5, carbo: 3, unidade: "un", pesoReferencia: 30 } // 1 Scoop
};

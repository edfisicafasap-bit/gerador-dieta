// config-preparos.js

const CONFIG_PREPAROS = {
  // =====================
  // 🐂 BOI
  // =====================
  "patinho": {
    animal: "Boi",
    preparos_sugeridos: ["Moído", "Grelhado", "Na frigideira", "Cozido", "Ensopado", "Na Airfryer"]
  },
  "coxão mole": {
    animal: "Boi",
    preparos_sugeridos: ["Grelhado", "Na frigideira", "Assado", "Cozido", "Refogado"]
  },
  "coxão duro": {
    animal: "Boi",
    preparos_sugeridos: ["Cozido", "Ensopado", "Moído", "Desfiado", "Refogado"]
  },
  "lagarto": {
    animal: "Boi",
    preparos_sugeridos: ["Assado", "Cozido", "Desfiado", "Cozido no vapor"]
  },
  "músculo": {
    animal: "Boi",
    preparos_sugeridos: ["Cozido", "Ensopado", "Moído", "Refogado"]
  },
  "alcatra limpa": {
    animal: "Boi",
    preparos_sugeridos: ["Grelhado", "Na frigideira", "Assado", "Na Airfryer"]
  },

  // =====================
  // 🐷 PORCO
  // =====================
  "lombo suíno": {
    animal: "Porco",
    preparos_sugeridos: ["Grelhado", "Assado", "Na Airfryer", "Na frigideira", "Cozido"]
  },
  "filé mignon suíno": {
    animal: "Porco",
    preparos_sugeridos: ["Grelhado", "Na frigideira", "Assado", "Na Airfryer", "Cozido no vapor"]
  },

  // =====================
  // 🐔 FRANGO
  // =====================
  "filé de peito": {
    animal: "Frango",
    preparos_sugeridos: ["Grelhado", "Desfiado", "Na Airfryer", "Na frigideira", "Cozido", "Cozido no vapor", "Refogado"]
  },
  "coxa e sobrecoxa (sem pele)": {
    animal: "Frango",
    preparos_sugeridos: ["Assado", "Na Airfryer", "Cozido", "Ensopado", "Desfiado"]
  }
}; // <--- EU ADICIONEI ESTA CHAVE QUE FALTAVA

const FATOR_PREPARO = {
    // PROTEÍNAS (Carnes, Frango, Peixe) - Geralmente encolhem (Fator < 1)
    "Grelhado": 0.75,       // Perde ~25% de água. Ex: 100g cru -> 75g pronto
    "Assado": 0.70,         // Perde ~30% de água. Ex: 100g cru -> 70g pronto
    "Na Airfryer": 0.65,    // Desidrata mais. Ex: 100g cru -> 65g pronto
    "Na frigideira": 0.72,  // Perda similar ao grelhado, levemente menor
    "Moído": 0.80,          // Perde gordura/água mas retém volume
    "Desfiado": 0.70,       // Geralmente cozido e depois processado
    "Cozido": 0.85,         // Retém mais umidade que o grelhado
    "Cozido no vapor": 0.90, // Perda mínima de nutrientes e peso
    "Ensopado": 1.0,        // O peso se mantém pela absorção do molho
    "Refogado": 0.82        // Perda moderada
};

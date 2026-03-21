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
  },

  // =====================
  // 🐟 PEIXES
  // =====================
  "filé de tilápia": {
    animal: "Peixe",
    preparos_sugeridos: ["Grelhado", "Assado", "Na Airfryer", "Cozido no vapor", "Na frigideira"]
  },
  "filé de merluza": {
    animal: "Peixe",
    preparos_sugeridos: ["Assado", "Cozido no vapor", "Ensopado", "Grelhado"]
  },
  "filé de linguado": {
    animal: "Peixe",
    preparos_sugeridos: ["Grelhado", "Assado", "Cozido no vapor"]
  },
  "filé de atum fresco": {
    animal: "Peixe",
    preparos_sugeridos: ["Grelhado", "Na frigideira", "Assado"]
  }
};

const FATOR_PREPARO = {
    // PROTEÍNAS - Fator de Cocção (Peso Cru para Peso Pronto)
    "Grelhado": 0.75,       
    "Assado": 0.70,         
    "Na Airfryer": 0.65,    
    "Na frigideira": 0.72,  
    "Moído": 0.80,          
    "Desfiado": 0.70,       
    "Cozido": 0.85,         
    "Cozido no vapor": 0.90, 
    "Ensopado": 1.0,        
    "Refogado": 0.82        
};

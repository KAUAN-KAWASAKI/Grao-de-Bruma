/*
 * Catálogo demonstrativo da Grão de Bruma.
 * Fonte: grao_de_bruma_pacote/03_catalogo_produtos.json (dados fictícios).
 * As opções de moagem foram reduzidas às que podem ser exibidas como escolhas reais;
 * "pack" define apenas as cores da embalagem ilustrada.
 * "photo" (opcional): { src, alt, credit: { author, source, url } }. Sem foto, o site usa a ilustração.
 */
window.GDB_CATALOG = {
  currency: "BRL",
  locale: "pt-BR",
  demoData: true,
  products: [
    {
      id: "gdb-001",
      sku: "GDB-001",
      name: "Mantiqueira — Doce Equilíbrio",
      shortName: "Mantiqueira",
      category: "cafes-especiais",
      weightGrams: 250,
      priceCents: 4290,
      sensoryProfile: ["chocolate ao leite", "caramelo", "castanhas"],
      family: "doce",
      intensity: "equilibrada",
      roast: "média",
      recommendedMethods: ["coado", "prensa francesa"],
      grindOptions: ["grãos inteiros", "moagem média", "moagem grossa"],
      description: "Um café pensado para quem deseja uma bebida equilibrada, com doçura perceptível e finalização agradável.",
      available: true,
      photo: { src: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=70", alt: "Grãos de café torrados", credit: { author: "Mike Kenneally", source: "Unsplash", url: "https://unsplash.com/photos/coffee-bean-lot-TD4DBagg2wE" } },
      pack: { bag: "#24372D", label: "#F5EFE3", ink: "#24372D", band: "#B76E45" }
    },
    {
      id: "gdb-002",
      sku: "GDB-002",
      name: "Espresso Intenso",
      shortName: "Espresso",
      category: "cafes-especiais",
      weightGrams: 250,
      priceCents: 3990,
      sensoryProfile: ["chocolate amargo", "avelã", "especiarias"],
      family: "intenso",
      intensity: "encorpada",
      roast: "média-escura",
      recommendedMethods: ["espresso", "bebidas com leite"],
      grindOptions: ["grãos inteiros", "moagem para espresso"],
      description: "Uma opção encorpada para quem prefere bebidas intensas e marcantes.",
      available: true,
      photo: { src: "https://images.unsplash.com/photo-1553292218-4892c2e7e1ae?auto=format&fit=crop&w=900&q=70", alt: "Dois porta-filtros com grãos e café moído", credit: { author: "Zarak Khan", source: "Unsplash", url: "https://unsplash.com/photos/portafilters-with-coffee-beans-and-grounds-69ilqMz0p1s" } },
      pack: { bag: "#3A2A22", label: "#D9C8A3", ink: "#3A2A22", band: "#B76E45" }
    },
    {
      id: "gdb-003",
      sku: "GDB-003",
      name: "Floral de Altitude",
      shortName: "Floral",
      category: "cafes-especiais",
      weightGrams: 250,
      priceCents: 4690,
      sensoryProfile: ["flores", "frutas cítricas", "mel"],
      family: "floral",
      intensity: "delicada e aromática",
      roast: "clara",
      recommendedMethods: ["V60", "Kalita", "métodos filtrados"],
      grindOptions: ["grãos inteiros", "moagem média-fina"],
      description: "Para quem aprecia aromas delicados e experiências sensoriais mais complexas.",
      available: true,
      photo: { src: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=70", alt: "Café coado sendo servido de uma cafeteira de vidro", credit: { author: "Karl Fredrickson", source: "Unsplash", url: "https://unsplash.com/photos/person-filling-glass-container-TYIzeCiZ_60" } },
      pack: { bag: "#D9C8A3", label: "#FFFFFF", ink: "#24372D", band: "#24372D" }
    },
    {
      id: "gdb-004",
      sku: "GDB-004",
      name: "Descafeinado Sereno",
      shortName: "Sereno",
      category: "cafes-especiais",
      weightGrams: 250,
      priceCents: 4990,
      sensoryProfile: ["chocolate suave", "açúcar mascavo", "nozes"],
      family: "doce",
      intensity: "equilibrada",
      roast: "média",
      recommendedMethods: ["coado", "preparo cotidiano"],
      grindOptions: ["grãos inteiros"],
      description: "Uma alternativa para explorar o ritual do café com teor reduzido de cafeína.",
      available: true,
      photo: { src: "https://images.unsplash.com/photo-1572286258217-40142c1c6a70?auto=format&fit=crop&w=900&q=70", alt: "Xícara de café sobre o pires", credit: { author: "Irene Kredenets", source: "Unsplash", url: "https://unsplash.com/photos/cup-of-coffee-on-top-of-saucer-maO-qIKLqi8" } },
      pack: { bag: "#EADFCB", label: "#FFFFFF", ink: "#24372D", band: "#B76E45" }
    },
    {
      id: "gdb-005",
      sku: "GDB-005",
      name: "Kit Descoberta",
      shortName: "Kit",
      category: "kits",
      weightGrams: 300,
      contents: "3 embalagens de 100 g com perfis diferentes",
      priceCents: 5990,
      sensoryProfile: ["seleção variada"],
      family: "kit",
      intensity: "variada",
      roast: "variada",
      recommendedMethods: ["primeira compra", "degustação", "presente"],
      grindOptions: [],
      description: "Uma seleção para descobrir diferentes características de sabor e identificar suas preferências.",
      available: true,
      photo: { src: "https://images.unsplash.com/photo-1524350876685-274059332603?auto=format&fit=crop&w=900&q=70", alt: "Grãos de café em uma saca", credit: { author: "Tina Guina", source: "Unsplash", url: "https://unsplash.com/photos/shallow-focus-photography-of-coffee-beans-in-sack-obV_LM0KjxY" } },
      pack: { bag: "#24372D", label: "#F5EFE3", ink: "#24372D", band: "#B76E45" }
    }
  ]
};

/* Fotos das seções (opcionais). Mesmo formato de "photo" acima; null mantém o layout sem foto.
   Fotos do Unsplash (licença Unsplash, uso livre), carregadas direto do Unsplash como a plataforma recomenda. */
window.GDB_PHOTOS = {
  hero: null,
  origem: { src: "https://images.unsplash.com/photo-1586095516671-d085ff58cdd4?auto=format&fit=crop&w=1200&q=70", alt: "Frutos de café maduros no pé", credit: { author: "Eduardo Gorghetto", source: "Unsplash", url: "https://unsplash.com/photos/red-round-fruits-on-green-leaves-vJ3KldG86Eo" } },
  guias: {
    v60: { src: "https://images.unsplash.com/photo-1522675397120-8cb88c83ac16?auto=format&fit=crop&w=900&q=70", alt: "Cafeteira de filtro com vapor saindo do café", credit: { author: "Caleb Dow", source: "Unsplash", url: "https://unsplash.com/photos/pour-over-coffeemaker-on-glass-table-uDFAD5PS-pI" } },
    prensa: { src: "https://images.unsplash.com/photo-1609902980959-8fc750449b73?auto=format&fit=crop&w=900&q=70", alt: "Prensa francesa com café em uma mesa", credit: { author: "Ian Lai", source: "Unsplash", url: "https://unsplash.com/photos/7-ugOPRx_sU" } },
    espresso: { src: "https://images.unsplash.com/photo-1609050471053-8636409f9f5b?auto=format&fit=crop&w=900&q=70", alt: "Espresso saindo do porta-filtro para a xícara", credit: { author: "Nathan Dumlao", source: "Unsplash", url: "https://unsplash.com/photos/espresso-pouring-from-portafilter-So7cyDtlmls" } },
    conservacao: { src: "https://images.unsplash.com/photo-1657037721632-4f0b6d07b45a?auto=format&fit=crop&w=900&q=70", alt: "Pote de vidro com grãos de café", credit: { author: "Ben Maffin", source: "Unsplash", url: "https://unsplash.com/photos/a-jar-of-beans--e2aHGC9JFk" } }
  }
};

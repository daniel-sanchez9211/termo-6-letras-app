export const WORDS_6_LETTERS: string[] = [
  "BANANA", "CODIGO", "TOMATE", "PLANTA", "FUTURO", "NUVENS",
  "JARDIM", "VIAGEM", "ESTRELA", "MUSICA", "POESIA", "ESCOLA",
  "AMIGOS", "FAMILIA", "CIDADE", "BRASIL", "MUNDOS", "QUARTO",
  "JANELA", "ALMOCO", "JANTAR", "ARVORE", "BONITO", "ALEGRE",
  "RAPIDO", "MUITOS", "POUCOS", "GRANDE", "PEQUENO", "BRANCO"
];

export const getRandomWord = () => {
    return WORDS_6_LETTERS[Math.floor(Math.random() * WORDS_6_LETTERS.length)];
};

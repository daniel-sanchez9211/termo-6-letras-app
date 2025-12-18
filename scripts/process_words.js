const fs = require('fs');

const inputFile = 'words_raw.txt';
const outputFile = 'constants/Words.ts';

try {
  const data = fs.readFileSync(inputFile, 'utf8');
  
  // RAW processamento para identificar nomes
  const rawLines = data.split('\n').map(w => w.trim()).filter(w => w);

  // Filtro de Nomes: Se começa com Maiúscula, rejeita (assumindo formato do arquivo raw)
  // Ex: "Vivian" (rejeita), "banana" (aceita)
  const commonWords = rawLines.filter(w => {
      // Rejeita se começar com A-Z ou acentuada maiúscula
      if (/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(w)) return false;
      return true;
  });

  const allWords = commonWords.map(w => w.toUpperCase());

  // 1. Criar Set de palavras de 5 letras para detecção de plural
  const words5 = new Set(allWords.filter(w => w.length === 5));

  // Duas listas: 
  // validGuesses = Todas as palavras válidas de 6 letras (incluindo plurais)
  // secretWords = Apenas palavras "boas" para serem a resposta (sem plurais simples)
  const validGuesses = [];
  const secretWords = [];

  // Filtrar palavras de 6 letras
  allWords.forEach(w => {
    if (w.length !== 6) return;
    
    // Filtro básico de caracteres inválidos
    if (!/^[A-ZÀ-Ú]+$/.test(w)) return;

    // Regra anti-sigla/romanos
    if (!/[AEIOUÁÉÍÓÚÂÊÔÃÕÜY]/.test(w)) return;

    // Se chegou aqui, é um palpite válido
    validGuesses.push(w);

    // Agora verificamos se serve como segredo (filtra plurais)
    let isSimplePlural = false;
    if (w.endsWith('S')) {
      const singular = w.slice(0, -1);
      if (words5.has(singular)) {
        isSimplePlural = true;
      }
    }

    if (!isSimplePlural) {
        secretWords.push(w);
    }
  });

  // Remover duplicatas e ordenar
  const uniqueGuesses = [...new Set(validGuesses)].sort();
  const uniqueSecrets = [...new Set(secretWords)].sort();

  console.log(`Palpites Válidos: ${uniqueGuesses.length}`);
  console.log(`Palavras Secretas: ${uniqueSecrets.length}`);

  // Gerar conteúdo do arquivo TS
  const fileContent = `export const VALID_GUESSES: string[] = ${JSON.stringify(uniqueGuesses, null, 2)};

export const SECRET_WORDS: string[] = ${JSON.stringify(uniqueSecrets, null, 2)};

export const getRandomWord = () => {
    return SECRET_WORDS[Math.floor(Math.random() * SECRET_WORDS.length)];
};
`;

  fs.writeFileSync(outputFile, fileContent);
  console.log(`Arquivo ${outputFile} gerado com sucesso!`);

} catch (err) {
  console.error('Erro ao processar palavras:', err);
}

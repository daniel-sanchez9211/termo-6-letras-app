const fs = require('fs');

const rawFile = 'words_raw.txt';
const hugeFile = 'words_huge.txt';
const outputFile = 'constants/Words.ts';

try {
  console.log('Lendo arquivos...');
  const dataRaw = fs.readFileSync(rawFile, 'utf8');
  const dataHuge = fs.readFileSync(hugeFile, 'utf8');

  // 1. Construir Blacklist de Nomes Próprios usando words_raw (que tem capitalização)
  // Se uma palavra aparece APENAS capitalizada em words_raw, ela é um nome.
  // Se aparece minúscula também (ou apenas), é comum.
  
  const rawLines = dataRaw.split('\n').map(w => w.trim()).filter(w => w);
  
  const knownLower = new Set();
  const knownUpperOnly = new Set();
  
  rawLines.forEach(w => {
      const lower = w.toLowerCase();
      // Verifica se começa com maiúscula (considerando acentos)
      const isCapitalized = /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(w);
      
      if (!isCapitalized) {
          knownLower.add(lower);
          // Se já estava na lista de "apenas Upper", remove, pois existe em lower também
          if (knownUpperOnly.has(lower)) {
              knownUpperOnly.delete(lower);
          }
      } else {
          // É capitalizado. Só adiciona como UpperOnly se NÃO for conhecida em lower
          if (!knownLower.has(lower)) {
              knownUpperOnly.add(lower);
          }
      }
  });
  
  console.log(`Blacklist de nomes gerada: ${knownUpperOnly.size} nomes únicos.`);

  // 2. Processar a lista HUGE (que é toda lowercase)
  const hugeLines = dataHuge.split('\n').map(w => w.trim().toLowerCase()).filter(w => w);
  
  // Criar Set de palavras de 5 letras (da lista HUGE) para detecção de plural
  const words5 = new Set();
  hugeLines.forEach(w => {
      if (w.length === 5 && /^[a-zà-ú]+$/.test(w)) {
          words5.add(w);
      }
  });

  // Duas listas: 
  const validGuesses = [];
  const secretWords = [];

  // 3. Filtrar palavras de 6 letras da lista HUGE
  hugeLines.forEach(w => {
    if (w.length !== 6) return;
    
    // Filtro básico de caracteres inválidos (hífens, números, etc)
    if (!/^[a-zà-ú]+$/.test(w)) return;

    // Regra anti-sigla/romanos
    if (!/[aeiouáéíóúâêôãõüy]/.test(w)) return;
    
    // FILTRO DE NOMES: Checa blacklist
    if (knownUpperOnly.has(w)) return;

    // Upper para exportação
    const upperW = w.toUpperCase();

    // Se chegou aqui, é um palpite válido
    validGuesses.push(upperW);

    // Agora verificamos se serve como segredo (filtra plurais)
    let isSimplePlural = false;
    if (upperW.endsWith('S')) {
      const singular = w.slice(0, -1); // w é lower, singular lower
      if (words5.has(singular)) {
        isSimplePlural = true;
      }
    }

    if (!isSimplePlural) {
        secretWords.push(upperW);
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

const fs = require('fs');

const rawFile = 'words_raw.txt';
const hugeFile = 'words_huge.txt';
const freqFile = 'words_frequency.txt';
const outputFile = 'constants/Words.ts';

const TARGET_LENGTHS = [5, 6, 7, 8];

try {
  console.log('Lendo arquivos...');
  const dataRaw = fs.readFileSync(rawFile, 'utf8');
  const dataHuge = fs.readFileSync(hugeFile, 'utf8');
  const dataFreq = fs.readFileSync(freqFile, 'utf8');

  // 1. Processar Frequências
  const freqMap = new Map();
  dataFreq.split('\n').forEach(line => {
      const parts = line.trim().split(' ');
      if (parts.length >= 2) {
          const w = parts[0].toLowerCase();
          const count = parseInt(parts[1], 10);
          freqMap.set(w, count);
      }
  });
  console.log(`Carregadas ${freqMap.size} palavras com frequência.`);

  // 2. Construir Blacklist de Nomes Próprios
  const rawLines = dataRaw.split('\n').map(w => w.trim()).filter(w => w);
  const knownLower = new Set();
  const knownUpperOnly = new Set();
  
  rawLines.forEach(w => {
      const lower = w.toLowerCase();
      const isCapitalized = /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(w);
      if (!isCapitalized) {
          knownLower.add(lower);
          if (knownUpperOnly.has(lower)) knownUpperOnly.delete(lower);
      } else {
          if (!knownLower.has(lower)) knownUpperOnly.add(lower);
      }
  });

  // 3. Processar a lista HUGE
  const hugeLines = dataHuge.split('\n').map(w => w.trim().toLowerCase()).filter(w => w);
  
  // Set de palavras base para plural (usaremos as de 4, 5, 6, 7 para checar plurais de 5, 6, 7, 8)
  // Na verdade, basta ter um Set com TODAS as palavras válidas (independente de tamanho) para checar singular
  const allValidWords = new Set();
  hugeLines.forEach(w => {
      if (/^[a-zà-ú]+$/.test(w)) {
          allValidWords.add(w);
      }
  });

  // Estrutura para guardar resultados
  const results = {};
  TARGET_LENGTHS.forEach(len => {
      results[len] = { guesses: [], secrets: [] };
  });

  hugeLines.forEach(w => {
    const len = w.length;
    if (!TARGET_LENGTHS.includes(len)) return;
    
    if (!/^[a-zà-ú]+$/.test(w)) return;
    if (!/[aeiouáéíóúâêôãõüy]/.test(w)) return;
    if (knownUpperOnly.has(w)) return;

    const upperW = w.toUpperCase();
    
    // Adiciona como Palpite
    results[len].guesses.push(upperW);

    // Checagem de Segredo
    let isSimplePlural = false;
    if (upperW.endsWith('S')) {
      const singular = w.slice(0, -1);
      if (allValidWords.has(singular)) isSimplePlural = true;
    }

    if (!isSimplePlural) {
        const count = freqMap.get(w);
        if (count) {
             results[len].secrets.push({ word: upperW, count: count });
        }
    }
  });

  // Pós-processamento (Ordenação e Limite)
  const finalExport = {};

  TARGET_LENGTHS.forEach(len => {
      // Palpites: únicos e ordenados
      const uniqueGuesses = [...new Set(results[len].guesses)].sort();
      
      // Segredos: ordenar por freq, pegar top N, ordenar alfabeticamente
      // Top 1200 para todos? 5 letras tem muito mais palavras comuns.
      // Vamos tentar um limite proporcional ou fixo generoso.
      
      const potentialSecrets = results[len].secrets.sort((a, b) => b.count - a.count);
      const uniqueSecretsObj = [];
      const seenSecrets = new Set();

      for (const item of potentialSecrets) {
        if (!seenSecrets.has(item.word)) {
            seenSecrets.add(item.word);
            uniqueSecretsObj.push(item.word);
        }
      }
      
      const limit = 2000; // Aumentar um pouco pois temos sizes variados
      const topSecrets = uniqueSecretsObj.slice(0, limit).sort();

      finalExport[len] = {
          validGuesses: uniqueGuesses,
          secretWords: topSecrets
      };

      console.log(`[${len} letras] Palpites: ${uniqueGuesses.length} | Segredos: ${topSecrets.length}`);
  });

  const fileContent = `
export type WordList = {
    validGuesses: string[];
    secretWords: string[];
};

export const WORDS: Record<number, WordList> = ${JSON.stringify(finalExport, null, 2)};

export const getRandomWord = (length: number) => {
    const list = WORDS[length]?.secretWords || WORDS[6].secretWords;
    return list[Math.floor(Math.random() * list.length)];
};
`;

  fs.writeFileSync(outputFile, fileContent);
  console.log(`Arquivo ${outputFile} gerado com sucesso!`);

} catch (err) {
  console.error('Erro ao processar palavras:', err);
}

const fs = require('fs');

const rawFile = 'words_raw.txt';
const hugeFile = 'words_huge.txt';
const freqFile = 'words_frequency.txt';
const outputFile = 'constants/Words.ts';

try {
  console.log('Lendo arquivos...');
  const dataRaw = fs.readFileSync(rawFile, 'utf8');
  const dataHuge = fs.readFileSync(hugeFile, 'utf8');
  const dataFreq = fs.readFileSync(freqFile, 'utf8');

  // 1. Processar Frequências
  // Formato: "palavra count"
  const freqMap = new Map();
  dataFreq.split('\n').forEach(line => {
      const parts = line.trim().split(' ');
      if (parts.length >= 2) {
          const w = parts[0].toLowerCase(); // palavra
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
  
  // Set de 5 letras para regra de plural
  const words5 = new Set();
  hugeLines.forEach(w => {
      if (w.length === 5 && /^[a-zà-ú]+$/.test(w)) {
          words5.add(w);
      }
  });

  const validGuesses = []; // Palavras Válidas (Larga escala)
  const potentialSecrets = []; // Candidatas a Secretas (antes de filtrar por freq)

  hugeLines.forEach(w => {
    if (w.length !== 6) return;
    if (!/^[a-zà-ú]+$/.test(w)) return;
    if (!/[aeiouáéíóúâêôãõüy]/.test(w)) return;
    if (knownUpperOnly.has(w)) return;

    const upperW = w.toUpperCase();
    validGuesses.push(upperW);

    let isSimplePlural = false;
    if (upperW.endsWith('S')) {
      const singular = w.slice(0, -1);
      if (words5.has(singular)) isSimplePlural = true;
    }

    if (!isSimplePlural) {
        // Agora verificamos se tem frequencia
        // Se a palavra estiver na lista de frequencia, ela eh candidata
        // E guardamos a frequencia para ordenar depois
        const count = freqMap.get(w);
        if (count) {
             potentialSecrets.push({ word: upperW, count: count });
        }
    }
  });

  // Ordenar palpites (alfabética)
  const uniqueGuesses = [...new Set(validGuesses)].sort();

  // Ordenar segredos por frequência (do maior para menor)
  potentialSecrets.sort((a, b) => b.count - a.count);

  // Selecionar TOP N
  // O usuário pediu algo entre 200 e 1000. Vamos pegar 1000.
  // Vamos garantir que sejam unicas antes de cortar
  const uniqueSecretsObj = [];
  const seenSecrets = new Set();
  
  for (const item of potentialSecrets) {
      if (!seenSecrets.has(item.word)) {
          seenSecrets.add(item.word);
          uniqueSecretsObj.push(item.word);
      }
  }

  const topSecrets = uniqueSecretsObj.slice(0, 1200);
  // Reordenar alfabeticamente para exportação (para não ficar óbvio no arquivo)
  topSecrets.sort();

  console.log(`Palpites Válidos: ${uniqueGuesses.length}`);
  console.log(`Palavras Secretas (Filtradas por Freq): ${topSecrets.length}`);
  console.log(`Exemplos de Secretas: ${topSecrets.slice(0, 10).join(', ')}`);

  const fileContent = `export const VALID_GUESSES: string[] = ${JSON.stringify(uniqueGuesses, null, 2)};

export const SECRET_WORDS: string[] = ${JSON.stringify(topSecrets, null, 2)};

export const getRandomWord = () => {
    return SECRET_WORDS[Math.floor(Math.random() * SECRET_WORDS.length)];
};
`;

  fs.writeFileSync(outputFile, fileContent);
  console.log(`Arquivo ${outputFile} gerado com sucesso!`);

} catch (err) {
  console.error('Erro ao processar palavras:', err);
}
